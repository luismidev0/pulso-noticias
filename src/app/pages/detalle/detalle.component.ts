import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { FavoritosService } from '../../core/services/favoritos.service';
import { ConfirmarService } from '../../core/services/confirmar.service';
import { NoticiasService } from '../../core/services/noticias.service';
import { ToastService } from '../../core/services/toast.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { MediaComponent } from '../../shared/components/media/media.component';
import { NewsCardComponent } from '../../shared/components/news-card/news-card.component';
import { FechaCortaPipe } from '../../shared/pipes/fecha-corta.pipe';

/**
 * Vista de detalle de una noticia (detalle.html?id=… + js/pages/detalle.js).
 *
 * Ruta: `noticias/:id`. Gracias a `withComponentInputBinding()` el parámetro
 * de la URL llega directamente al `input()` llamado `id`.
 *
 * Permite guardar o quitar de favoritos, compartir el enlace y eliminar la
 * noticia (mini CRUD) con confirmación en un modal. Si el id no existe se
 * muestra el estado 404 "Noticia no encontrada".
 *
 * Seguridad: el contenido de la noticia (que puede venir de un usuario) se
 * muestra solo con interpolación `{{ }}`, que Angular escapa. Esto reemplaza a
 * `ui.esc()` y a las plantillas con innerHTML de la versión vanilla.
 */
@Component({
  selector: 'app-detalle',
  imports: [RouterLink, FechaCortaPipe, IconComponent, MediaComponent, NewsCardComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './detalle.component.html',
})
export class DetalleComponent {
  private readonly noticias = inject(NoticiasService);
  private readonly favoritos = inject(FavoritosService);
  private readonly toast = inject(ToastService);
  private readonly confirmar = inject(ConfirmarService);
  private readonly router = inject(Router);
  private readonly titulo = inject(Title);
  private readonly destroyRef = inject(DestroyRef);

  /** Parámetro :id de la ruta. */
  readonly id = input.required<string>();

  protected readonly estado = signal<'cargando' | 'listo' | 'error'>('cargando');

  /** La noticia pedida; null si el id no existe (o ya fue eliminada). */
  protected readonly noticia = computed(() =>
    this.estado() === 'listo' ? this.noticias.obtenerPorId(this.id()) : null,
  );

  protected readonly categoria = computed(() => {
    const n = this.noticia();
    return n ? this.noticias.nombreCategoria(n.categoria) : '';
  });

  protected readonly relacionadas = computed(() => {
    const n = this.noticia();
    return n ? this.noticias.obtenerRelacionadas(n, 3) : [];
  });

  /** Estado del botón de favorito; alterna entre sus dos apariencias. */
  protected readonly esFavorita = computed(() => this.favoritos.ids().includes(this.id()));

  /** Iniciales del autor para el avatar ("Laura Méndez Ruiz" → "LM"). */
  protected readonly iniciales = computed(() =>
    (this.noticia()?.autor ?? '')
      .split(' ')
      .slice(0, 2)
      .map((p) => p.charAt(0))
      .join('')
      .toUpperCase(),
  );

  constructor() {
    this.cargar();

    // Título de la pestaña según la noticia (o 404)
    effect(() => {
      if (this.estado() !== 'listo') return;
      const n = this.noticia();
      this.titulo.setTitle(n ? `${n.titulo} · Pulso` : 'Noticia no encontrada · Pulso');
    });
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

  /** Guarda o quita la noticia de favoritos y avisa con un toast. */
  protected alternarFavorito(): void {
    const guardada = this.favoritos.alternar(this.id());
    this.toast.mostrar(guardada ? 'Noticia guardada en favoritos' : 'Noticia eliminada de favoritos');
  }

  /** Comparte el enlace con la API nativa (móviles) o, si no existe, lo copia al portapapeles. */
  protected async compartir(): Promise<void> {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: this.noticia()?.titulo, url });
      } catch {
        /* la persona canceló el cuadro de compartir: no es un error */
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        this.toast.mostrar('Enlace copiado al portapapeles');
      } catch {
        this.toast.mostrar('No se pudo copiar el enlace', { tipo: 'error' });
      }
    }
  }

  /** Elimina la noticia tras confirmar en el modal y vuelve al listado. */
  protected async eliminar(): Promise<void> {
    const confirmado = await this.confirmar.confirmar({
      titulo: '¿Eliminar esta noticia?',
      texto: 'Esta acción no se puede deshacer.',
      confirmar: 'Eliminar',
    });
    if (!confirmado) return;

    // Primero se navega y después se elimina: si se borrara antes, esta página
    // alcanzaría a mostrar el 404 durante un instante.
    await this.router.navigate(['/noticias']);
    this.noticias.eliminar(this.id());
    // El servicio de toast sobrevive a la navegación, no hace falta sessionStorage
    this.toast.mostrar('Noticia eliminada');
  }
}
