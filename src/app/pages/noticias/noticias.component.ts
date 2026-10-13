import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CATEGORIAS, Noticia } from '../../core/models/noticia.model';
import { NoticiasService } from '../../core/services/noticias.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { NewsCardComponent } from '../../shared/components/news-card/news-card.component';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card.component';

/** Opciones de ordenamiento del listado. */
type Orden = 'recientes' | 'antiguas' | 'leidas';

/** Cantidad de tarjetas por página. */
const POR_PAGINA = 9;

/** Quita tildes y pasa a minúsculas para comparar sin distinguir acentos. */
function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * Listado de noticias (noticias.html + js/pages/noticias.js) con:
 *   - búsqueda por texto (título, resumen y autor), con espera de 250 ms
 *   - filtro por categoría (chips)
 *   - ordenamiento (más recientes, más antiguas, más leídas)
 *   - paginación de 9 tarjetas por página
 *
 * El estado de los filtros vive en la URL (?cat=&q=&orden=&pagina=): los
 * `queryParams` del Router son la única fuente de verdad. Cada control navega
 * a la misma ruta con otros parámetros (con `replaceUrl`, como el antiguo
 * history.replaceState) y el listado se recalcula solo con `computed`.
 */
@Component({
  selector: 'app-noticias',
  imports: [FormsModule, IconComponent, NewsCardComponent, SkeletonCardComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './noticias.component.html',
})
export class NoticiasComponent {
  private readonly noticias = inject(NoticiasService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly categorias = CATEGORIAS;
  protected readonly estado = signal<'cargando' | 'listo' | 'error'>('cargando');

  private readonly buscador = viewChild<ElementRef<HTMLInputElement>>('buscador');
  private readonly filtros = viewChild<ElementRef<HTMLElement>>('filtros');
  private temporizador?: ReturnType<typeof setTimeout>;

  // ── Estado leído de la URL ─────────────────────────────────────────────
  private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });
  protected readonly cat = computed(() => this.params().get('cat') ?? '');
  protected readonly q = computed(() => this.params().get('q') ?? '');
  protected readonly orden = computed<Orden>(() => {
    const valor = this.params().get('orden');
    return valor === 'antiguas' || valor === 'leidas' ? valor : 'recientes';
  });
  private readonly paginaSolicitada = computed(() =>
    Math.max(1, parseInt(this.params().get('pagina') ?? '', 10) || 1),
  );

  /** Texto del cuadro de búsqueda (two-way binding con ngModel). */
  protected readonly busqueda = signal('');

  // ── Resultados derivados ───────────────────────────────────────────────

  /** Noticias que cumplen categoría y texto, en el orden elegido. */
  private readonly filtradas = computed<Noticia[]>(() => {
    const texto = normalizar(this.q().trim());
    const cat = this.cat();
    const resultado = this.noticias.todas().filter((n) => {
      const coincideCat = !cat || n.categoria === cat;
      const coincideTexto = !texto || normalizar(`${n.titulo} ${n.resumen} ${n.autor}`).includes(texto);
      return coincideCat && coincideTexto;
    });

    if (this.orden() === 'antiguas') {
      resultado.sort((a, b) => a.fecha.localeCompare(b.fecha));
    } else if (this.orden() === 'leidas') {
      resultado.sort((a, b) => (b.lecturas || 0) - (a.lecturas || 0));
    } // "recientes" ya viene ordenado desde el servicio
    return resultado;
  });

  protected readonly total = computed(() => this.filtradas().length);
  protected readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / POR_PAGINA)));
  /** La página pedida en la URL, corregida si se pasa del total. */
  protected readonly pagina = computed(() => Math.min(this.paginaSolicitada(), this.totalPaginas()));
  protected readonly visibles = computed(() => {
    const inicio = (this.pagina() - 1) * POR_PAGINA;
    return this.filtradas().slice(inicio, inicio + POR_PAGINA);
  });
  protected readonly numerosPagina = computed(() =>
    Array.from({ length: this.totalPaginas() }, (_, i) => i + 1),
  );

  /** Mensaje del estado vacío según haya búsqueda o solo filtro de categoría. */
  protected readonly tituloVacio = computed(() =>
    this.q() ? `No encontramos noticias para ‘${this.q()}’` : 'No hay noticias en esta categoría',
  );

  constructor() {
    this.cargar();

    // Mantiene el cuadro de búsqueda igual a la URL (p. ej. tras "Limpiar filtros"),
    // salvo mientras la persona escribe, para no pisar lo que teclea.
    effect(() => {
      const q = this.q();
      untracked(() => {
        if (document.activeElement !== this.buscador()?.nativeElement) this.busqueda.set(q);
      });
    });

    // Si la URL pide una página inexistente (?pagina=99) se corrige en la URL
    effect(() => {
      if (this.estado() === 'listo' && this.pagina() !== this.paginaSolicitada()) {
        untracked(() => this.navegar({ pagina: this.pagina() }));
      }
    });

    this.destroyRef.onDestroy(() => clearTimeout(this.temporizador));
  }

  /** Carga el catálogo; también la usa el botón "Reintentar". */
  protected cargar(): void {
    this.estado.set('cargando');
    this.noticias
      .cargar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.estado.set('listo'),
        error: () => this.estado.set('error'),
      });
  }

  // ── Eventos: cada uno navega con nuevos query params ───────────────────

  /**
   * Navega a la misma ruta cambiando solo algunos parámetros. Los valores por
   * defecto (sin categoría, orden "recientes", página 1) no se escriben en la
   * URL. `replaceUrl` evita llenar el historial con cada tecla o clic.
   */
  private navegar(cambios: { cat?: string; q?: string; orden?: Orden; pagina?: number }): void {
    const cat = cambios.cat ?? this.cat();
    const q = cambios.q ?? this.q();
    const orden = cambios.orden ?? this.orden();
    const pagina = cambios.pagina ?? this.paginaSolicitada();
    this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {
        cat: cat || null,
        q: q || null,
        orden: orden !== 'recientes' ? orden : null,
        pagina: pagina > 1 ? pagina : null,
      },
    });
  }

  protected elegirCategoria(cat: string): void {
    this.navegar({ cat, pagina: 1 });
  }

  protected cambiarOrden(orden: Orden): void {
    this.navegar({ orden, pagina: 1 });
  }

  /** Búsqueda con espera de 250 ms para no recalcular el listado en cada tecla. */
  protected programarBusqueda(): void {
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.navegar({ q: this.busqueda(), pagina: 1 }), 250);
  }

  /** Paginación: al cambiar de página se vuelve al inicio del listado. */
  protected irAPagina(pagina: number): void {
    this.navegar({ pagina });
    this.filtros()?.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  protected limpiarFiltros(): void {
    clearTimeout(this.temporizador);
    this.busqueda.set('');
    this.navegar({ cat: '', q: '', orden: 'recientes', pagina: 1 });
  }
}
