import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Noticia } from '../../../core/models/noticia.model';
import { FavoritosService } from '../../../core/services/favoritos.service';
import { NoticiasService } from '../../../core/services/noticias.service';
import { ToastService } from '../../../core/services/toast.service';
import { FechaCortaPipe } from '../../pipes/fecha-corta.pipe';
import { IconComponent } from '../icon/icon.component';
import { MediaComponent } from '../media/media.component';

/**
 * Tarjeta de noticia (reemplaza a `ui.tarjeta()` de la versión vanilla).
 *
 * Dos modos:
 *  - `normal`: corazón para guardar/quitar de favoritos y botón "Ver más".
 *  - `favoritos`: el corazón y el botón inferior "Quitar de favoritos"
 *    avisan al padre con el evento `quitar`, que se encarga de quitarla y
 *    ofrecer "Deshacer".
 *
 * Data binding usado: interpolación `{{ }}`, property binding `[x]`, attribute
 * binding `[attr.x]`, class binding `[class.x]` y event binding `(click)`.
 */
@Component({
  selector: 'app-news-card',
  imports: [RouterLink, FechaCortaPipe, IconComponent, MediaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // La tarjeta debe ser hija directa de .grid, no del elemento <app-news-card>
  host: { style: 'display: contents' },
  template: `
    <article class="card">
      <div class="card__media">
        <app-media
          [categoria]="noticia().categoria"
          [imagen]="noticia().imagen"
          [imagenAlt]="noticia().imagenAlt"
        />
        <button
          class="card__fav"
          [class.card__fav--active]="guardada()"
          type="button"
          [attr.aria-pressed]="guardada()"
          [attr.aria-label]="guardada() ? 'Quitar de favoritos' : 'Guardar en favoritos'"
          (click)="alClicCorazon()"
        >
          <app-icon [nombre]="guardada() ? 'heartFilled' : 'heart'" />
        </button>
      </div>
      <div class="card__body">
        <span [class]="'badge badge--' + noticia().categoria">{{ categoria() }}</span>
        <h3 class="card__title">
          <a class="card__link" [routerLink]="['/noticias', noticia().id]">{{ noticia().titulo }}</a>
        </h3>
        <time class="card__date" [attr.datetime]="noticia().fecha">{{ noticia().fecha | fechaCorta }}</time>
        <p class="card__summary">{{ noticia().resumen }}</p>
        <div class="card__footer">
          @if (modo() === 'favoritos') {
            <button class="btn btn--secondary btn--sm" type="button" (click)="quitar.emit(noticia().id)">
              <app-icon nombre="heartFilled" clase="btn__icon" />Quitar de favoritos
            </button>
          } @else {
            <a class="btn btn--secondary btn--sm" [routerLink]="['/noticias', noticia().id]">Ver más</a>
          }
        </div>
      </div>
    </article>
  `,
})
export class NewsCardComponent {
  private readonly favoritos = inject(FavoritosService);
  private readonly noticias = inject(NoticiasService);
  private readonly toast = inject(ToastService);

  /** Noticia a mostrar. */
  readonly noticia = input.required<Noticia>();
  /** `favoritos` cambia el botón inferior por "Quitar de favoritos". */
  readonly modo = input<'normal' | 'favoritos'>('normal');
  /** Se emite con el id cuando, en modo favoritos, se pide quitar la noticia. */
  readonly quitar = output<string>();

  /** Nombre legible de la categoría para la insignia. */
  protected readonly categoria = computed(() => this.noticias.nombreCategoria(this.noticia().categoria));

  /** Estado del corazón; se recalcula solo cuando cambia el signal de favoritos. */
  protected readonly guardada = computed(() => this.favoritos.ids().includes(this.noticia().id));

  /** Corazón: en modo favoritos pide quitar; en modo normal alterna y avisa con un toast. */
  protected alClicCorazon(): void {
    if (this.modo() === 'favoritos') {
      this.quitar.emit(this.noticia().id);
      return;
    }
    const guardada = this.favoritos.alternar(this.noticia().id);
    this.toast.mostrar(guardada ? 'Noticia guardada en favoritos' : 'Noticia eliminada de favoritos');
  }
}
