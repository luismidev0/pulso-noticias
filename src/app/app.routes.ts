import { Routes } from '@angular/router';

/**
 * Rutas de la aplicación. Cada página se carga bajo demanda (lazy loading),
 * así el paquete inicial es más liviano.
 *
 * Equivalencias con la versión vanilla:
 *   index.html     → ''
 *   noticias.html  → 'noticias'            (filtros en ?cat=&q=&orden=&pagina=)
 *   detalle.html?id=… → 'noticias/:id'     (el id es ahora un parámetro de ruta)
 *   favoritos.html → 'favoritos'
 *   publicar.html  → 'publicar'
 *   contacto.html  → 'contacto'
 */
export const routes: Routes = [
  {
    path: '',
    title: 'Inicio · Pulso',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'noticias',
    title: 'Noticias · Pulso',
    loadComponent: () => import('./pages/noticias/noticias.component').then((m) => m.NoticiasComponent),
  },
  {
    // El detalle define su propio título según la noticia
    path: 'noticias/:id',
    loadComponent: () => import('./pages/detalle/detalle.component').then((m) => m.DetalleComponent),
  },
  {
    path: 'favoritos',
    title: 'Mis favoritos · Pulso',
    loadComponent: () => import('./pages/favoritos/favoritos.component').then((m) => m.FavoritosComponent),
  },
  {
    path: 'publicar',
    title: 'Publicar noticia · Pulso',
    loadComponent: () => import('./pages/publicar/publicar.component').then((m) => m.PublicarComponent),
  },
  {
    path: 'contacto',
    title: 'Contacto · Pulso',
    loadComponent: () => import('./pages/contacto/contacto.component').then((m) => m.ContactoComponent),
  },
  {
    // Cualquier otra URL: estado 404
    path: '**',
    title: 'Página no encontrada · Pulso',
    loadComponent: () => import('./pages/no-encontrada/no-encontrada.component').then((m) => m.NoEncontradaComponent),
  },
];
