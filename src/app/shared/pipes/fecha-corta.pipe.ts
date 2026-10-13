import { Pipe, PipeTransform } from '@angular/core';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/**
 * Formatea una fecha ISO corta: "2026-09-26" → "26 sep 2026".
 * Se hace a mano (sin DatePipe) para no depender de la zona horaria ni del
 * idioma del navegador, y para dar exactamente el mismo resultado que la
 * versión vanilla.
 */
@Pipe({ name: 'fechaCorta' })
export class FechaCortaPipe implements PipeTransform {
  transform(iso: string): string {
    const [anio, mes, dia] = iso.split('-');
    return `${parseInt(dia, 10)} ${MESES[parseInt(mes, 10) - 1]} ${anio}`;
  }
}
