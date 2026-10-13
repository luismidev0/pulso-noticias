import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { ConfirmarService } from '../../../core/services/confirmar.service';
import { IconComponent } from '../icon/icon.component';

/**
 * Diálogo modal de confirmación accesible. Se coloca una vez en App y se abre
 * con ConfirmarService.confirmar().
 *
 * Accesibilidad:
 *  - role="alertdialog" y aria-modal="true", con título y texto asociados.
 *  - El foco inicial va al botón Cancelar (la opción segura).
 *  - Tab queda atrapado dentro del modal.
 *  - Se cierra con Escape o con un clic fuera del cuadro.
 *  - Al cerrar, el servicio devuelve el foco al botón que lo abrió.
 */
@Component({
  selector: 'app-confirm-modal',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'alTeclear($event)' },
  template: `
    @if (servicio.opciones(); as o) {
      <div class="overlay" (click)="alClicOverlay($event)">
        <div
          #cuadro
          class="modal"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="modal-titulo"
          aria-describedby="modal-texto"
          tabindex="-1"
        >
          <span class="modal__icon"><app-icon nombre="trash" /></span>
          <h2 class="modal__title" id="modal-titulo">{{ o.titulo }}</h2>
          <p class="modal__text" id="modal-texto">{{ o.texto }}</p>
          <div class="modal__actions">
            <button #cancelar class="btn btn--secondary" type="button" (click)="servicio.responder(false)">
              Cancelar
            </button>
            <button class="btn btn--error" type="button" (click)="servicio.responder(true)">
              {{ o.confirmar ?? 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmModalComponent {
  protected readonly servicio = inject(ConfirmarService);

  private readonly cuadro = viewChild<ElementRef<HTMLElement>>('cuadro');
  private readonly cancelar = viewChild<ElementRef<HTMLButtonElement>>('cancelar');

  constructor() {
    // Foco inicial en "Cancelar" en cuanto el modal aparece en el DOM
    effect(() => this.cancelar()?.nativeElement.focus());

    // Bloquea el scroll de la página mientras el modal está abierto
    effect((limpiar) => {
      document.body.classList.toggle('has-modal', this.servicio.opciones() !== null);
      limpiar(() => document.body.classList.remove('has-modal'));
    });
  }

  /** Cierra al hacer clic en el fondo oscuro (no dentro del cuadro). */
  protected alClicOverlay(evento: MouseEvent): void {
    if (evento.target === evento.currentTarget) this.servicio.responder(false);
  }

  /** Escape cancela; Tab y Shift+Tab se mantienen dentro del modal. */
  protected alTeclear(evento: KeyboardEvent): void {
    if (!this.servicio.opciones()) return;

    if (evento.key === 'Escape') {
      this.servicio.responder(false);
      return;
    }
    if (evento.key !== 'Tab') return;

    const botones = this.cuadro()?.nativeElement.querySelectorAll('button');
    if (!botones?.length) return;
    const primero = botones[0];
    const ultimo = botones[botones.length - 1];
    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  }
}
