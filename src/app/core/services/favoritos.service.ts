import { Injectable, signal } from '@angular/core';
import { CLAVES, escribir, leer } from './almacenamiento';

/**
 * Ids de las noticias guardadas en favoritos, persistidos en localStorage
 * (clave `pulso:favoritos`).
 *
 * Los ids viven en un signal: cualquier componente que lo lea en su plantilla
 * se actualiza solo cuando cambia, sin tener que repintar el DOM a mano como
 * hacía `activarFavoritos()` en la versión vanilla.
 *
 * El servicio no depende de NoticiasService (es este quien lo usa para armar
 * la lista de noticias favoritas), así se evita una dependencia circular.
 */
@Injectable({ providedIn: 'root' })
export class FavoritosService {
  /** Ids guardados; el más reciente primero. */
  readonly ids = signal<string[]>(leer<string[]>(CLAVES.favoritos, []));

  /** Indica si una noticia está guardada. Al leer `ids()` dentro de una plantilla, esta se actualiza sola. */
  esFavorito(id: string): boolean {
    return this.ids().includes(id);
  }

  /** Agrega una noticia al principio de la lista (si no estaba ya). */
  agregar(id: string): void {
    if (this.esFavorito(id)) return;
    this.guardar([id, ...this.ids()]);
  }

  /** Quita una noticia de favoritos. */
  quitar(id: string): void {
    this.guardar(this.ids().filter((x) => x !== id));
  }

  /** Alterna el estado de favorito y devuelve el nuevo estado (true = guardada). */
  alternar(id: string): boolean {
    if (this.esFavorito(id)) {
      this.quitar(id);
      return false;
    }
    this.agregar(id);
    return true;
  }

  /** Actualiza el signal y persiste; si localStorage falla, el cambio sigue valiendo en memoria. */
  private guardar(ids: string[]): void {
    this.ids.set(ids);
    escribir(CLAVES.favoritos, ids);
  }
}
