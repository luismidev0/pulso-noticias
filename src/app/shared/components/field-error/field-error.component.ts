import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/**
 * Mensaje de error de un campo, con ícono de alerta. El `id` coincide con el
 * `aria-describedby` del campo, para que los lectores de pantalla lo lean.
 * No se dibuja nada si no hay mensaje.
 */
@Component({
  selector: 'app-field-error',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (mensaje()) {
      <p class="field__error" [id]="campo() + '-error'"><app-icon nombre="alertCircle" />{{ mensaje() }}</p>
    }
  `,
})
export class FieldErrorComponent {
  /** Id del campo al que pertenece (el mensaje se llama `<campo>-error`). */
  readonly campo = input.required<string>();
  readonly mensaje = input<string>('');
}
