import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { timer } from 'rxjs';
import { Mensaje } from '../../core/models/noticia.model';
import { NoticiasService } from '../../core/services/noticias.service';
import { FieldErrorComponent } from '../../shared/components/field-error/field-error.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ValidacionFormulario } from '../../shared/forms/validacion-formulario';
import { correo, max, min, reglas, requerido, requeridoAceptar } from '../../shared/forms/validadores';

/**
 * Formulario de contacto (contacto.html + js/pages/contacto.js) con:
 *   - validaciones (campos obligatorios, correo válido, aceptación)
 *   - estado "Enviando..." con el botón deshabilitado
 *   - mensaje de confirmación que reemplaza al formulario
 *   - banner de error que conserva los datos si el envío falla
 *
 * Como el proyecto no tiene servidor, el envío se simula: el mensaje se
 * guarda en localStorage después de una espera de 1200 ms.
 */
@Component({
  selector: 'app-contacto',
  imports: [ReactiveFormsModule, RouterLink, IconComponent, FieldErrorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contacto.component.html',
})
export class ContactoComponent {
  private readonly noticias = inject(NoticiasService);
  private readonly destroyRef = inject(DestroyRef);

  /** Máximo de caracteres del mensaje (también se usa en el contador). */
  protected readonly maxMensaje = 500;

  /** Formulario reactivo: cada control lleva sus validadores. */
  protected readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: reglas(requerido, min(3)) }),
    correo: new FormControl('', { nonNullable: true, validators: reglas(requerido, correo) }),
    asunto: new FormControl('Consulta general', { nonNullable: true }),
    mensaje: new FormControl('', { nonNullable: true, validators: reglas(requerido, min(10), max(this.maxMensaje)) }),
    acepto: new FormControl(false, { nonNullable: true, validators: requeridoAceptar }),
  });

  protected readonly validacion = new ValidacionFormulario(
    this.form,
    ['nombre', 'correo', 'asunto', 'mensaje', 'acepto'],
    inject(ElementRef),
  );

  /** Valores actuales del formulario como signal (para el contador de caracteres). */
  protected readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected readonly asuntos = ['Consulta general', 'Enviar una noticia', 'Reportar un error', 'Otro'];

  protected readonly enviando = signal(false);
  protected readonly confirmado = signal(false);
  protected readonly errorEnvio = signal(false);

  private readonly confirmacion = viewChild<ElementRef<HTMLElement>>('confirmacion');
  private readonly alerta = viewChild<ElementRef<HTMLElement>>('alerta');

  constructor() {
    // Al aparecer la confirmación se le da el foco (la lee el lector de pantalla)
    effect(() => this.confirmacion()?.nativeElement.focus());
    // Al aparecer el banner de error se desplaza hasta él
    effect(() => this.alerta()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }

  /** Simula la petición al servidor; falla si no hay conexión a internet. */
  private enviarAlServidor(mensaje: Mensaje): Promise<void> {
    return new Promise((resolver, rechazar) => {
      timer(1200)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          if (!navigator.onLine) {
            rechazar(new Error('Sin conexión'));
          } else if (this.noticias.guardarMensaje(mensaje)) {
            resolver();
          } else {
            rechazar(new Error('No se pudo guardar'));
          }
        });
    });
  }

  /** Envío: valida, muestra "Enviando..." y luego la confirmación o el error. */
  protected async enviar(): Promise<void> {
    if (!this.validacion.validarAlEnviar()) return;

    this.errorEnvio.set(false);
    this.enviando.set(true);
    const v = this.form.getRawValue();

    try {
      await this.enviarAlServidor({
        nombre: v.nombre.trim(),
        correo: v.correo.trim(),
        asunto: v.asunto,
        mensaje: v.mensaje.trim(),
      });
      // Confirmación: reemplaza el formulario por el mensaje de éxito
      this.confirmado.set(true);
    } catch {
      // Error: los datos permanecen en el formulario para reintentar
      this.errorEnvio.set(true);
    } finally {
      this.enviando.set(false);
    }
  }
}
