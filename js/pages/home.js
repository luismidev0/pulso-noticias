/**
 * pages/home.js
 * Página de inicio: renderiza dinámicamente las tres noticias destacadas
 * a partir del JSON local.
 *
 * Estados: carga (esqueletos) → contenido | vacío | error.
 */
(function (Pulso) {
  'use strict';

  var contenedor;

  function renderizar() {
    // 1. Estado de carga: tres tarjetas esqueleto
    contenedor.innerHTML = Pulso.ui.esqueletos(3);

    Pulso.store.cargar()
      .then(function () {
        var destacadas = Pulso.store.obtenerDestacadas(3);

        // 2a. Estado vacío: todavía no hay noticias
        if (!destacadas.length) {
          contenedor.innerHTML = Pulso.ui.estado({
            ilustracion: Pulso.icons.emptySearch,
            titulo: 'Aún no hay noticias publicadas',
            boton: { texto: 'Publicar la primera', href: 'publicar.html' }
          });
          return;
        }

        // 2b. Contenido: una tarjeta por noticia destacada
        contenedor.innerHTML = destacadas.map(function (n) { return Pulso.ui.tarjeta(n); }).join('');
      })
      .catch(function () {
        // 2c. Error de carga
        contenedor.innerHTML = Pulso.ui.estadoError('No se pudo cargar el contenido');
        Pulso.ui.toast('No se pudo cargar el contenido. Intenta de nuevo', { tipo: 'error' });
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenedor = document.getElementById('destacadas');
    Pulso.ui.activarFavoritos(contenedor);

    // Botón "Reintentar" del estado de error
    contenedor.addEventListener('click', function (e) {
      if (e.target.closest('[data-accion="reintentar"]')) renderizar();
    });

    renderizar();
  });
})(window.Pulso = window.Pulso || {});
