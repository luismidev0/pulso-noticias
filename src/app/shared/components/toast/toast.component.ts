import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Toast, ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../icon/icon.component';

/**
 * Región de avisos emergentes. Se coloca una sola vez en App y dibuja los
 * avisos que registra ToastService.
 *
 * La región (`aria-live="polite"`) está siempre en el DOM: los lectores de
 * pantalla solo anuncian los cambios de una región que ya existía. Los avisos
 * de error usan role="alert" y los demás role="status".
 */
@Component({
  selector: 'app-toast',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-region" aria-live="polite">
      @for (t of servicio.toasts(); track t.id) {
        <div
          class="toast"
          [class.toast--success]="t.tipo === 'success'"
          [class.toast--error]="t.tipo === 'error'"
          [attr.role]="t.tipo === 'error' ? 'alert' : 'status'"
        >
          <app-icon [nombre]="t.tipo === 'error' ? 'alertCircle' : 'checkCircle'" clase="toast__icon" />
          <span class="toast__message">{{ t.mensaje }}</span>
          @if (t.accion) {
            <button
              class="toast__action btn--ghost"
              type="button"
              style="background: none; border: 0; cursor: pointer"
              (click)="ejecutar(t)"
            >
              {{ t.accion.texto }}
            </button>
          }
          <button
            class="toast__close"
            type="button"
            aria-label="Cerrar notificación"
            (click)="servicio.cerrar(t.id)"
          >
            <app-icon nombre="close" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  protected readonly servicio = inject(ToastService);

  /** Ejecuta la acción del aviso (p. ej. "Deshacer") y lo cierra. */
  protected ejecutar(toast: Toast): void {
    toast.accion?.alHacerClic();
    this.servicio.cerrar(toast.id);
  }
}
