import { Injectable, signal } from '@angular/core';

/** Textos del diálogo de confirmación. */
export interface OpcionesConfirmar {
  titulo: string;
  texto: string;
  /** Texto del botón de confirmar ("Eliminar" por defecto). */
  confirmar?: string;
}

/**
 * Diálogo modal de confirmación.
 *
 * `confirmar()` devuelve una Promise<boolean>: true si el usuario confirma,
 * false si cancela, pulsa Escape o hace clic fuera del cuadro. El componente
 * ConfirmModalComponent lee `opciones` para dibujarse y llama a `responder()`.
 *
 * Aquí también se guarda el elemento que tenía el foco al abrir el modal,
 * para devolvérselo al cerrar (accesibilidad).
 */
@Injectable({ providedIn: 'root' })
export class ConfirmarService {
  /** Opciones del modal abierto; null cuando está cerrado. */
  readonly opciones = signal<OpcionesConfirmar | null>(null);

  private resolver: ((resultado: boolean) => void) | null = null;
  private elementoPrevio: HTMLElement | null = null;

  /** Abre el modal y espera la decisión del usuario. */
  confirmar(opciones: OpcionesConfirmar): Promise<boolean> {
    this.elementoPrevio = document.activeElement as HTMLElement | null;
    this.opciones.set(opciones);
    return new Promise<boolean>((resolver) => (this.resolver = resolver));
  }

  /** Cierra el modal, devuelve el foco al botón que lo abrió y resuelve la Promise. */
  responder(resultado: boolean): void {
    this.opciones.set(null);
    this.elementoPrevio?.focus?.();
    this.elementoPrevio = null;
    this.resolver?.(resultado);
    this.resolver = null;
  }
}
