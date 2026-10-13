import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NoticiasService } from '../../core/services/noticias.service';
import { ToastService } from '../../core/services/toast.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { NewsCardComponent } from '../../shared/components/news-card/news-card.component';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card.component';

/**
 * Página de inicio (index.html + js/pages/home.js).
 *
 * Las tres noticias destacadas pasan por los estados:
 * carga (esqueletos) → contenido | vacío | error (con "Reintentar").
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink, IconComponent, NewsCardComponent, SkeletonCardComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private readonly noticias = inject(NoticiasService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  /** Estado de la carga de las destacadas. */
  protected readonly estado = signal<'cargando' | 'listo' | 'error'>('cargando');

  /** Una noticia por categoría; se recalcula sola si cambia el catálogo. */
  protected readonly destacadas = computed(() =>
    this.estado() === 'listo' ? this.noticias.obtenerDestacadas(3) : [],
  );

  /** Testimonios de lectores (contenido fijo, igual que en el HTML original). */
  protected readonly testimonios = [
    {
      texto: 'Encuentro las noticias de mi ciudad ordenadas por tema. Reviso Educación todas las mañanas antes de clase.',
      iniciales: 'VO',
      nombre: 'Valentina Ortiz',
      rol: 'Docente de secundaria',
    },
    {
      texto: 'Publiqué la apertura de mi tienda en Comercio y en una semana llegaron clientes nuevos del barrio.',
      iniciales: 'AC',
      nombre: 'Andrés Castaño',
      rol: 'Emprendedor',
    },
  ];

  constructor() {
    this.cargar();
  }

  /** Carga el catálogo; también la usa el botón "Reintentar" del estado de error. */
  protected cargar(): void {
    this.estado.set('cargando');
    this.noticias
      .cargar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.estado.set('listo'),
        error: () => {
          this.estado.set('error');
          this.toast.mostrar('No se pudo cargar el contenido. Intenta de nuevo', { tipo: 'error' });
        },
      });
  }
}
