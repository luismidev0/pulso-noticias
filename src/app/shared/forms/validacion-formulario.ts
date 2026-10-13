import { ElementRef, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormGroup } from '@angular/forms';
import { merge } from 'rxjs';

/**
 * Estado de validación visible de un formulario reactivo (equivale a la parte
 * de interfaz de js/validation.js).
 *
 * Reglas de visualización:
 *  - Un error aparece al salir del campo (blur) o al intentar enviar.
 *  - Una vez visible, se actualiza mientras la persona corrige.
 *  - Si el foco pasa directamente al botón de enviar no se marca el campo:
 *    el mensaje desplazaría el botón y el clic se perdería. La validación
 *    completa la hace el envío.
 *
 * Se crea dentro del componente (en un campo) porque usa `toSignal`.
 */
export class ValidacionFormulario {
  /** true tras el primer intento de enviar. */
  readonly enviado = signal(false);

  private readonly tocados = signal<ReadonlySet<string>>(new Set());

  /** Cambia con cada modificación del formulario; hace reactivas las lecturas de errores. */
  private readonly cambios: Signal<unknown>;

  /**
   * @param form formulario reactivo
   * @param orden nombres de los campos en el orden en que aparecen en pantalla
   *              (para enfocar el primer campo inválido)
   * @param raiz  elemento del componente donde buscar los campos por id
   */
  constructor(
    readonly form: FormGroup,
    private readonly orden: string[],
    private readonly raiz: ElementRef<HTMLElement>,
  ) {
    this.cambios = toSignal(merge(form.valueChanges, form.statusChanges), { initialValue: null });
  }

  /** Mensaje de error visible para un campo, o '' si no hay que mostrar nada. */
  error(nombre: string): string {
    this.cambios();
    const visible = this.enviado() || this.tocados().has(nombre);
    const control: AbstractControl | null = this.form.get(nombre);
    return visible && control?.errors ? String(control.errors['mensaje'] ?? '') : '';
  }

  /** Marca un campo como "tocado" para que muestre su error. */
  tocar(nombre: string): void {
    if (this.tocados().has(nombre)) return;
    this.tocados.set(new Set(this.tocados()).add(nombre));
  }

  /** Manejador del evento blur de un campo. */
  alSalir(evento: FocusEvent, nombre: string): void {
    const destino = evento.relatedTarget as HTMLButtonElement | null;
    if (destino?.type === 'submit') return;
    this.tocar(nombre);
  }

  /**
   * Prepara el envío: muestra todos los errores y enfoca el primer campo
   * inválido. Devuelve true si el formulario es válido y se puede enviar.
   */
  validarAlEnviar(): boolean {
    this.enviado.set(true);
    if (this.form.valid) return true;

    const primero = this.orden.find((nombre) => this.form.get(nombre)?.invalid);
    if (primero) this.raiz.nativeElement.querySelector<HTMLElement>(`#${primero}`)?.focus();
    return false;
  }
}
