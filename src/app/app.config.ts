import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';

/**
 * Configuración global de la aplicación.
 *  - provideRouter: rutas; `withComponentInputBinding` entrega los parámetros
 *    de la URL (como el :id del detalle) directamente a los `input()` del componente.
 *  - provideHttpClient: necesario para cargar data/noticias.json.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
  ],
};
