import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CATEGORIAS } from '../../core/models/noticia.model';
import { ConfirmarService } from '../../core/services/confirmar.service';
import { NoticiasService } from '../../core/services/noticias.service';
import { ToastService } from '../../core/services/toast.service';
import { FieldErrorComponent } from '../../shared/components/field-error/field-error.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { MediaComponent } from '../../shared/components/media/media.component';
import { ValidacionFormulario } from '../../shared/forms/validacion-formulario';
import { imagen, max, min, reglas, requerido } from '../../shared/forms/validadores';
import { FechaCortaPipe } from '../../shared/pipes/fecha-corta.pipe';
import { reducirImagen } from '../../shared/utils/reducir-imagen';

/**
 * Mini CRUD de noticias (publicar.html + js/pages/publicar.js):
 *   - Crear: formulario validado; la noticia se guarda en localStorage.
 *   - Eliminar: lista de noticias propias con botón de eliminación.
 *
 * La imagen opcional se reduce a 1200 px de ancho y se convierte a JPEG
 * (data URL) para que quepa en localStorage, cuyo límite ronda los 5 MB.
 */
@Component({
  selector: 'app-publicar',
  imports: [ReactiveFormsModule, RouterLink, FechaCortaPipe, IconComponent, MediaComponent, FieldErrorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './publicar.component.html',
})
export class PublicarComponent {
  protected readonly noticias = inject(NoticiasService);
  private readonly toast = inject(ToastService);
  private readonly confirmar = inject(ConfirmarService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly categorias = CATEGORIAS;

  /** Formulario reactivo con los mismos validadores que la versión vanilla. */
  protected readonly form = new FormGroup({
    titulo: new FormControl('', { nonNullable: true, validators: reglas(requerido, min(10), max(120)) }),
    categoria: new FormControl('', { nonNullable: true, validators: requerido }),
    autor: new FormControl('', { nonNullable: true, validators: reglas(requerido, min(3)) }),
    resumen: new FormControl('', { nonNullable: true, validators: reglas(requerido, min(20), max(200)) }),
    cuerpo: new FormControl('', { nonNullable: true, validators: reglas(requerido, min(80)) }),
    // El archivo no se enlaza con formControlName: se asigna en alElegirImagen()
    imagen: new FormControl<File | null>(null, { validators: imagen }),
    pie: new FormControl('', { nonNullable: true }),
  });

  protected readonly validacion = new ValidacionFormulario(
    this.form,
    ['titulo', 'categoria', 'autor', 'resumen', 'cuerpo', 'imagen', 'pie'],
    inject(ElementRef),
  );

  /** Valores del formulario como signal (contador de caracteres y vista previa). */
  protected readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  /** Imagen reducida (data URL JPEG); vacío si no se eligió ninguna. */
  protected readonly imagenDataUrl = signal('');

  /** Categoría para la vista previa; 'neutral' mientras no se elija una. */
  protected readonly categoriaPreview = computed(() => this.valores().categoria || 'neutral');

  constructor() {
    // Hace falta el catálogo para mostrar los nombres de categoría; si falla,
    // la página sigue funcionando (el formulario no depende del JSON).
    this.noticias
      .cargar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: () => undefined });
  }

  /** Elige una imagen: la valida y, si es correcta, la reduce para la vista previa. */
  protected async alElegirImagen(evento: Event): Promise<void> {
    const archivo = (evento.target as HTMLInputElement).files?.[0] ?? null;
    this.imagenDataUrl.set('');
    this.form.controls.imagen.setValue(archivo);
    this.validacion.tocar('imagen');
    if (!archivo || this.form.controls.imagen.invalid) return;

    try {
      this.imagenDataUrl.set(await reducirImagen(archivo, 1200));
    } catch {
      this.toast.mostrar('No se pudo leer la imagen', { tipo: 'error' });
    }
  }

  /** Crea la noticia y redirige a su detalle. */
  protected publicar(): void {
    if (!this.validacion.validarAlEnviar()) return;

    const v = this.form.getRawValue();
    const noticia = this.noticias.crear({
      titulo: v.titulo.trim(),
      categoria: v.categoria,
      autor: v.autor.trim(),
      resumen: v.resumen.trim(),
      cuerpo: v.cuerpo.trim(),
      pieFoto: v.pie.trim(),
      imagen: this.imagenDataUrl(),
    });
    if (!noticia) {
      this.toast.mostrar('No se pudo guardar la noticia. Prueba con una imagen más liviana', { tipo: 'error' });
      return;
    }
    // El toast sobrevive a la navegación (no hace falta sessionStorage)
    this.toast.mostrar('Noticia publicada');
    this.router.navigate(['/noticias', noticia.id]);
  }

  /** Elimina una noticia propia tras confirmar en el modal. */
  protected async eliminar(id: string): Promise<void> {
    const ok = await this.confirmar.confirmar({
      titulo: '¿Eliminar esta noticia?',
      texto: 'Esta acción no se puede deshacer.',
    });
    if (!ok) return;
    this.noticias.eliminar(id);
    this.toast.mostrar('Noticia eliminada');
  }
}
