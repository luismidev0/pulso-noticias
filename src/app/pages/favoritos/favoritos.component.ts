import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FavoritosService } from '../../core/services/favoritos.service';
import { NoticiasService } from '../../core/services/noticias.service';
import { ToastService } from '../../core/services/toast.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { NewsCardComponent } from '../../shared/components/news-card/news-card.component';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card.component';

/**
 * Lista personalizada de noticias guardadas (favoritos.html + js/pages/favoritos.js).
 * Las ids se persisten en localStorage; al quitar una noticia, el aviso ofrece "Deshacer".
 */
@Component({
  selector: 'app-favoritos',
  imports: [IconComponent, NewsCardComponent, SkeletonCardComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './favoritos.component.html',
})
export class FavoritosComponent {
  private readonly noticias = inject(NoticiasService);
  private readonly favoritos = inject(FavoritosService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly estado = signal<'cargando' | 'listo' | 'error'>('cargando');

  /** Noticias guardadas, en el orden en que se guardaron. */
  protected readonly lista = this.noticias.favoritas;

  /** Texto del contador, con singular/plural. */
  protected readonly contador = computed(() => {
    const cantidad = this.lista().length;
    return `${cantidad} ${cantidad === 1 ? 'noticia guardada' : 'noticias guardadas'}`;
  });

  constructor() {
    this.cargar();
  }

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

  /** Quita una noticia y ofrece "Deshacer" en el aviso. */
  protected quitar(id: string): void {
    this.favoritos.quitar(id);
    this.toast.mostrar('Noticia eliminada de favoritos', {
      accion: { texto: 'Deshacer', alHacerClic: () => this.favoritos.agregar(id) },
    });
  }
}
