import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validadores de formularios compartidos por Contacto y Publicar.
 * Equivalen a las reglas de js/validation.js y conservan sus mensajes
 * exactos. Cada validador devuelve `{ mensaje }` cuando falla, para que la
 * plantilla muestre el texto sin tener que traducir códigos de error.
 */

// Expresión sencilla para correos del tipo nombre@dominio.ext
const CORREO = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

const TIPOS_IMAGEN = /^image\/(jpeg|png|webp)$/;
const MAX_BYTES_IMAGEN = 5 * 1024 * 1024;

const error = (mensaje: string): ValidationErrors => ({ mensaje });
const texto = (control: AbstractControl): string => String(control.value ?? '');

/** Regla `requerido`: el texto no puede estar vacío (ni solo espacios). */
export const requerido: ValidatorFn = (control) =>
  texto(control).trim() ? null : error('Este campo es obligatorio');

/** Regla `requerido` para casillas de verificación (aceptar términos). */
export const requeridoAceptar: ValidatorFn = (control) =>
  control.value === true ? null : error('Debes aceptar para continuar');

/** Regla `correo`: formato nombre@dominio.ext (un campo vacío lo resuelve `requerido`). */
export const correo: ValidatorFn = (control) => {
  const valor = texto(control).trim();
  return !valor || CORREO.test(valor)
    ? null
    : error('Ingresa un correo válido, por ejemplo nombre@dominio.com');
};

/** Regla `min:n`: al menos n caracteres (sin contar espacios de los extremos). */
export const min =
  (n: number): ValidatorFn =>
  (control) => {
    const valor = texto(control).trim();
    return !valor || valor.length >= n ? null : error(`Escribe al menos ${n} caracteres`);
  };

/** Regla `max:n`: como máximo n caracteres. */
export const max =
  (n: number): ValidatorFn =>
  (control) =>
    texto(control).length <= n ? null : error(`Máximo ${n} caracteres`);

/** Regla `imagen`: el valor es un File opcional (JPG, PNG o WebP de máximo 5 MB). */
export const imagen: ValidatorFn = (control) => {
  const archivo = control.value as File | null;
  if (!archivo) return null;
  if (!TIPOS_IMAGEN.test(archivo.type)) return error('Usa una imagen JPG, PNG o WebP');
  if (archivo.size > MAX_BYTES_IMAGEN) return error('La imagen debe pesar menos de 5 MB');
  return null;
};

/**
 * Combina validadores y devuelve solo el primer error, como hacía validation.js
 * (que se detenía en la primera regla que fallaba). `Validators.compose` en
 * cambio mezcla todos los errores en un solo objeto.
 */
export function reglas(...validadores: ValidatorFn[]): ValidatorFn {
  return (control) => {
    for (const validar of validadores) {
      const resultado = validar(control);
      if (resultado) return resultado;
    }
    return null;
  };
}
