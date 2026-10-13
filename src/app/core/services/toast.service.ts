import { Injectable, signal } from '@angular/core';

/** Acción opcional de un aviso, p. ej. "Deshacer". */
export interface AccionToast {
  texto: string;
  alHacerClic: () => void;
}

/** Aviso emergente en pantalla. */
export interface Toast {
  id: number;
  mensaje: string;
  tipo: 'success' | 'error';
  accion?: AccionToast;
}

/** Opciones al mostrar un aviso. */
export interface OpcionesToast {
  tipo?: 'success' | 'error';
  accion?: AccionToast;
  /** Milisegundos antes de cerrarse solo (5000 por defecto). */
  duracion?: number;
}

/**
 * Avisos emergentes (toasts).
 *
 * El servicio guarda la lista de avisos en un signal y el componente
 * ToastComponent la dibuja. Como el servicio es un singleton que vive mientras
 * la aplicación esté abierta, un aviso mostrado justo antes de navegar
 * ("Noticia publicada", "Noticia eliminada") sigue visible en la página nueva.
 * Por eso ya no se necesita el truco de sessionStorage (`toastAlVolver`) de la
 * versión vanilla, donde cada cambio de página recargaba el documento.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private siguienteId = 1;

  /** Muestra un aviso en la parte inferior de la pantalla. */
  mostrar(mensaje: string, opciones: OpcionesToast = {}): void {
    const toast: Toast = {
      id: this.siguienteId++,
      mensaje,
      tipo: opciones.tipo ?? 'success',
      accion: opciones.accion,
    };
    this.toasts.update((lista) => [...lista, toast]);
    setTimeout(() => this.cerrar(toast.id), opciones.duracion ?? 5000);
  }

  /** Cierra un aviso por id (no hace nada si ya se cerró). */
  cerrar(id: number): void {
    this.toasts.update((lista) => lista.filter((t) => t.id !== id));
  }
}
