import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NoticiasService } from '../../../core/services/noticias.service';
import { IconComponent } from '../icon/icon.component';

/**
 * Bloque de imagen o marcador de posición (equivale a `ui.media()` de la
 * versión vanilla).
 *
 * Si la noticia no tiene imagen (por ejemplo, una publicada sin foto) se
 * muestra el marcador con el color de su categoría. Si la tiene, la imagen
 * se superpone al marcador.
 *
 * Seguridad: `src` y `alt` se enlazan como propiedades, así que Angular los
 * trata como valores y no como HTML (hace el trabajo que antes hacía `esc()`).
 */
@Component({
  selector: 'app-media',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <div [class]="'placeholder placeholder--' + categoria()">
      <app-icon nombre="image" clase="placeholder__icon" />
      <span>{{ texto() }}</span>
      @if (imagen()) {
        <img class="placeholder__img" [src]="imagen()" [alt]="imagenAlt()" [loading]="carga()" />
      }
    </div>
  `,
})
export class MediaComponent {
  private readonly noticias = inject(NoticiasService);

  readonly categoria = input.required<string>();
  readonly imagen = input<string>('');
  readonly imagenAlt = input<string>('');
  /** Texto del marcador; por defecto, el nombre de la categoría. */
  readonly etiqueta = input<string>('');
  /** `eager` para imágenes visibles al abrir la página (evita retrasar la imagen principal); `lazy` para el resto. */
  readonly carga = input<'lazy' | 'eager'>('lazy');

  protected readonly texto = computed(
    () => this.etiqueta() || this.noticias.nombreCategoria(this.categoria()),
  );
}
