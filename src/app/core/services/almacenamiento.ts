/**
 * Lectura y escritura segura en localStorage.
 *
 * localStorage puede no estar disponible (modo privado, cuota llena,
 * almacenamiento bloqueado), por eso toda lectura y escritura se protege
 * con try/catch, igual que en la versión vanilla (js/store.js).
 */

/** Lee y parsea un JSON; devuelve `porDefecto` si no existe o falla. */
export function leer<T>(clave: string, porDefecto: T): T {
  try {
    const valor = window.localStorage.getItem(clave);
    return valor ? (JSON.parse(valor) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}

/** Guarda un valor como JSON. Devuelve false si no se pudo (cuota excedida o bloqueado). */
export function escribir(clave: string, valor: unknown): boolean {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

/** Claves de localStorage; se mantienen idénticas a las de la versión vanilla. */
export const CLAVES = {
  creadas: 'pulso:creadas',
  eliminadas: 'pulso:eliminadas',
  favoritos: 'pulso:favoritos',
  mensajes: 'pulso:mensajes',
} as const;
