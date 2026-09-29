/**
 * pages/favoritos.js
 * Lista personalizada de noticias guardadas (persistidas en localStorage).
 * Permite quitar una noticia y deshacer la acción desde el aviso.
 */
(function (Pulso) {
  'use strict';

  var contenedor, contador;

  function actualizarContador(cantidad) {
    contador.querySelector('span').textContent =
      cantidad + (cantidad === 1 ? ' noticia guardada' : ' noticias guardadas');
  }

  function renderizar() {
    var favoritos = Pulso.store.obtenerFavoritos();
    actualizarContador(favoritos.length);

    if (!favoritos.length) {
      // Estado vacío: invita a explorar en lugar de mostrar una página en blanco
      contenedor.innerHTML = Pulso.ui.estado({
        ilustracion: Pulso.icons.emptyFav,
        titulo: 'Aún no tienes noticias guardadas',
        texto: 'Toca el corazón de cualquier noticia para guardarla aquí.',
        boton: { texto: 'Explorar noticias', href: 'noticias.html' }
      });
      return;
    }
    contenedor.innerHTML = favoritos
      .map(function (n) { return Pulso.ui.tarjeta(n, { modo: 'favoritos' }); })
      .join('');
  }

  /** Quita una noticia y ofrece "Deshacer" en el aviso. */
  function quitar(id) {
    Pulso.store.quitarFavorito(id);
    renderizar();
    Pulso.ui.toast('Noticia eliminada de favoritos', {
      accion: {
        texto: 'Deshacer',
        alHacerClic: function () {
          Pulso.store.agregarFavorito(id);
          renderizar();
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenedor = document.getElementById('favoritos');
    contador = document.getElementById('contador-favoritos');
    contenedor.innerHTML = Pulso.ui.esqueletos(3);

    // Tanto el botón "Quitar de favoritos" como el corazón quitan la noticia
    contenedor.addEventListener('click', function (e) {
      var boton = e.target.closest('[data-quitar], [data-fav]');
      if (!boton) return;
      quitar(boton.getAttribute('data-quitar') || boton.getAttribute('data-fav'));
    });

    Pulso.store.cargar().then(renderizar).catch(function () {
      contenedor.innerHTML = Pulso.ui.estadoError('No se pudieron cargar tus favoritos');
    });
  });
})(window.Pulso = window.Pulso || {});
