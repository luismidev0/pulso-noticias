import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';
import {
  Categoria,
  CatalogoJson,
  DatosNuevaNoticia,
  Mensaje,
  Noticia,
} from '../models/noticia.model';
import { CLAVES, escribir, leer } from './almacenamiento';
import { FavoritosService } from './favoritos.service';

/**
 * Capa de datos de Pulso (reemplaza a js/store.js).
 *
 * Fuente de verdad:
 *   1. data/noticias.json → catálogo inicial, cargado con HttpClient.
 *   2. localStorage       → cambios del usuario:
 *        pulso:creadas     noticias publicadas desde la página Publicar
 *        pulso:eliminadas  ids de noticias del JSON que el usuario eliminó
 *        pulso:mensajes    mensajes enviados desde el formulario de contacto
 *      (pulso:favoritos lo administra FavoritosService)
 *
 * El catálogo que ve el usuario siempre es: JSON − eliminadas + creadas,
 * ordenado de la más reciente a la más antigua.
 *
 * Todo el estado vive en signals; `todas` es un `computed`, así que las
 * páginas se actualizan solas cuando se crea o elimina una noticia.
 */
@Injectable({ providedIn: 'root' })
export class NoticiasService {
  private readonly http = inject(HttpClient);
  private readonly favoritos = inject(FavoritosService);

  /** Noticias del JSON, en memoria tras la primera carga. */
  private readonly base = signal<Noticia[]>([]);
  private cargado = false;

  /** Categorías del JSON. */
  readonly categorias = signal<Categoria[]>([]);

  private readonly creadas = signal<Noticia[]>(leer<Noticia[]>(CLAVES.creadas, []));
  private readonly eliminadas = signal<string[]>(leer<string[]>(CLAVES.eliminadas, []));

  /** Todas las noticias visibles, de la más reciente a la más antigua. */
  readonly todas = computed<Noticia[]>(() => {
    const eliminadas = this.eliminadas();
    return this.base()
      .filter((n) => !eliminadas.includes(n.id))
      .concat(this.creadas())
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  });

  /** Noticias creadas por el usuario, la última publicada primero. */
  readonly propias = computed<Noticia[]>(() => [...this.creadas()].reverse());

  /**
   * Noticias guardadas en favoritos, en el orden en que se guardaron.
   * Ignora ids huérfanos (noticias que ya no existen).
   */
  readonly favoritas = computed<Noticia[]>(() => {
    const todas = this.todas();
    return this.favoritos
      .ids()
      .map((id) => todas.find((n) => n.id === id))
      .filter((n): n is Noticia => n !== undefined);
  });

  /**
   * Carga data/noticias.json con HttpClient (solo la primera vez).
   *
   * Ya no existe el respaldo para file:// (data/noticias.fallback.js) de la
   * versión vanilla: una aplicación Angular necesita siempre un servidor
   * (`ng serve` en desarrollo, GitHub Pages en producción), así que fetch
   * nunca queda bloqueado por abrir el archivo directamente.
   *
   * La URL es relativa a propósito: se resuelve contra el <base href>, por lo
   * que funciona igual en localhost y en /pulso-noticias/.
   */
  cargar(): Observable<void> {
    if (this.cargado) return of(undefined);
    return this.http.get<CatalogoJson>('data/noticias.json').pipe(
      tap((datos) => {
        this.base.set(datos.noticias ?? []);
        this.categorias.set(datos.categorias ?? []);
        this.cargado = true;
      }),
      map(() => undefined),
    );
  }

  // ── Consultas ────────────────────────────────────────────────────────────

  /** Busca una noticia por id; null si no existe (o fue eliminada). */
  obtenerPorId(id: string): Noticia | null {
    return this.todas().find((n) => n.id === id) ?? null;
  }

  /** Nombre legible de una categoría; si no existe devuelve el propio id. */
  nombreCategoria(id: string): string {
    return this.categorias().find((c) => c.id === id)?.nombre ?? id;
  }

  /**
   * Noticias destacadas para el Home: la más reciente de tantas categorías
   * distintas como `cantidad`, dando prioridad a las marcadas como
   * "destacada" en el JSON.
   */
  obtenerDestacadas(cantidad: number): Noticia[] {
    const todas = this.todas();
    const ordenadas = todas.filter((n) => n.destacada).concat(todas.filter((n) => !n.destacada));
    const usadas = new Set<string>();
    const resultado: Noticia[] = [];
    for (const n of ordenadas) {
      if (resultado.length < cantidad && !usadas.has(n.categoria)) {
        usadas.add(n.categoria);
        resultado.push(n);
      }
    }
    return resultado;
  }

  /** Noticias de la misma categoría, excluyendo la actual. */
  obtenerRelacionadas(noticia: Noticia, cantidad: number): Noticia[] {
    return this.todas()
      .filter((n) => n.categoria === noticia.categoria && n.id !== noticia.id)
      .slice(0, cantidad);
  }

  // ── Mini CRUD ────────────────────────────────────────────────────────────

  /**
   * Convierte un título en un identificador legible para la URL y le agrega
   * `Date.now().toString(36)` para que no se repita.
   */
  private crearId(titulo: string): string {
    const slug = titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);
    return `${slug}-${Date.now().toString(36)}`;
  }

  /**
   * Crea una noticia nueva y la guarda en localStorage.
   * @param datos campos del formulario Publicar
   * @returns la noticia creada, o null si no se pudo guardar (p. ej. cuota llena)
   */
  crear(datos: DatosNuevaNoticia): Noticia | null {
    const parrafos = datos.cuerpo
      .split(/\n\s*\n|\n/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((texto) => ({ tipo: 'p' as const, texto }));

    const noticia: Noticia = {
      id: this.crearId(datos.titulo),
      titulo: datos.titulo,
      categoria: datos.categoria,
      fecha: new Date().toISOString().slice(0, 10),
      autor: datos.autor,
      lectura: Math.max(1, Math.round(datos.cuerpo.split(/\s+/).length / 200)),
      lecturas: 0,
      destacada: false,
      resumen: datos.resumen,
      imagen: datos.imagen || '',
      imagenAlt: datos.titulo,
      pieFoto: datos.pieFoto || '',
      cuerpo: parrafos,
      propia: true, // marca las noticias creadas por el usuario
    };

    const creadas = [...this.creadas(), noticia];
    if (!escribir(CLAVES.creadas, creadas)) return null;
    this.creadas.set(creadas);
    return noticia;
  }

  /**
   * Elimina una noticia. Si fue creada por el usuario se borra de "creadas";
   * si viene del JSON se registra su id en "eliminadas".
   * También se quita de favoritos.
   */
  eliminar(id: string): void {
    const restantes = this.creadas().filter((n) => n.id !== id);

    if (restantes.length !== this.creadas().length) {
      this.creadas.set(restantes);
      escribir(CLAVES.creadas, restantes);
    } else if (!this.eliminadas().includes(id)) {
      const eliminadas = [...this.eliminadas(), id];
      this.eliminadas.set(eliminadas);
      escribir(CLAVES.eliminadas, eliminadas);
    }
    this.favoritos.quitar(id);
  }

  // ── Mensajes de contacto (simulación de envío) ───────────────────────────

  /** Guarda un mensaje de contacto en localStorage. Devuelve false si no se pudo. */
  guardarMensaje(mensaje: Mensaje): boolean {
    const mensajes = leer<Mensaje[]>(CLAVES.mensajes, []);
    mensajes.push({ fecha: new Date().toISOString(), ...mensaje });
    return escribir(CLAVES.mensajes, mensajes);
  }
}
