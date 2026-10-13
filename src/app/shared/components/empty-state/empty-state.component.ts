import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent, NombreIcono } from '../icon/icon.component';

/**
 * Bloque de estado centrado: vacío, error de carga o 404.
 * Reemplaza a `ui.estado()` y `ui.estadoError()` de la versión vanilla.
 *
 * El botón puede ser un enlace (`botonLink`) o una acción (evento `accion`,
 * p. ej. "Limpiar filtros" o "Reintentar").
 *
 * Con `error` activado se rellenan solos el ícono, el texto y el botón
 * "Reintentar" del estado de error de carga; solo hay que pasar el título.
 */
@Component({
  selector: 'app-empty-state',
  imports: [IconComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Para que .state-block ocupe la fila completa cuando se usa dentro de .grid
  host: { style: 'display: contents' },
  template: `
    <div class="state-block">
      <div class="empty" role="status">
        @if (ilustracion(); as nombre) {
          <app-icon [nombre]="nombre" clase="empty__illustration" />
        } @else if (iconoFinal(); as nombre) {
          <span class="empty__icon"><app-icon [nombre]="nombre" /></span>
        } @else if (codigo()) {
          <span class="empty__code">{{ codigo() }}</span>
        }
        <h3 class="empty__title">{{ titulo() }}</h3>
        @if (textoFinal()) {
          <p class="empty__text">{{ textoFinal() }}</p>
        }
        @if (botonFinal(); as texto) {
          @if (botonLink()) {
            <a [class]="'btn ' + botonClase()" [routerLink]="botonLink()">{{ texto }}</a>
          } @else {
            <button [class]="'btn ' + botonClase()" type="button" (click)="accion.emit()">
              @if (error()) {
                <app-icon nombre="retry" clase="btn__icon" />
              }
              {{ texto }}
            </button>
          }
        }
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  /** Ilustración grande (estados vacíos). */
  readonly ilustracion = input<NombreIcono>();
  /** Ícono pequeño dentro de un círculo (estado de error). */
  readonly icono = input<NombreIcono>();
  /** Código grande, p. ej. "404". */
  readonly codigo = input<string>('');
  readonly titulo = input.required<string>();
  readonly texto = input<string>('');
  /** Modo error de carga: ícono, texto y botón "Reintentar" por defecto. */
  readonly error = input(false, { transform: booleanAttribute });

  readonly botonTexto = input<string>('');
  /** Destino del botón cuando es un enlace (ruta del Router). */
  readonly botonLink = input<string | unknown[]>('');
  readonly botonClase = input<string>('btn--primary');

  /** Se emite al pulsar el botón cuando no es un enlace. */
  readonly accion = output<void>();

  protected readonly iconoFinal = computed(() => this.icono() ?? (this.error() ? 'alertBig' : undefined));
  protected readonly textoFinal = computed(
    () => this.texto() || (this.error() ? 'Revisa tu conexión e intenta de nuevo.' : ''),
  );
  protected readonly botonFinal = computed(
    () => this.botonTexto() || (this.error() ? 'Reintentar' : ''),
  );
}
