/**
 * pages/publicar.js
 * Mini CRUD de noticias:
 *   - Crear: formulario validado; la noticia se guarda en localStorage.
 *   - Eliminar: lista de noticias propias con botón de eliminación.
 *
 * La imagen opcional se reduce a 1200 px de ancho y se convierte a JPEG
 * (data URL) para que quepa en localStorage, cuyo límite ronda los 5 MB.
 */
(function (Pulso) {
  'use strict';

  var ui = Pulso.ui;
  var imagenDataUrl = '';

  // ── Imagen: lectura, reducción y vista previa ──────────────────────────

  /**
   * Lee un archivo de imagen y lo redimensiona con un canvas.
   * @returns {Promise<string>} data URL en formato JPEG
   */
  function reducirImagen(archivo, anchoMaximo) {
    return new Promise(function (resolver, rechazar) {
      var lector = new FileReader();
      lector.onerror = rechazar;
      lector.onload = function () {
        var img = new Image();
        img.onerror = rechazar;
        img.onload = function () {
          var escala = Math.min(1, anchoMaximo / img.width);
          var canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * escala);
          canvas.height = Math.round(img.height * escala);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          resolver(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = lector.result;
      };
      lector.readAsDataURL(archivo);
    });
  }

  /** Muestra la imagen elegida o, si no hay, el color de la categoría. */
  function vistaPrevia() {
    var categoria = document.getElementById('categoria').value || 'neutral';
    document.getElementById('preview').innerHTML = ui.media({
      categoria: categoria,
      imagen: imagenDataUrl,
      imagenAlt: 'Vista previa de la imagen'
    }, imagenDataUrl ? '' : 'Sin imagen: se usará el color de la categoría');
  }

  // ── Lista de noticias propias (eliminar) ───────────────────────────────
  function renderizarPropias() {
    var lista = document.getElementById('mis-noticias');
    var propias = Pulso.store.obtenerPropias();

    if (!propias.length) {
      lista.innerHTML = '<li class="my-news__empty">Todavía no has publicado noticias.</li>';
      return;
    }
    lista.innerHTML = propias.map(function (n) {
      return '<li class="my-news__item"><span>' +
        '<a class="my-news__name" href="detalle.html?id=' + encodeURIComponent(n.id) + '">' + ui.esc(n.titulo) + '</a>' +
        '<span class="my-news__meta">' + ui.esc(Pulso.store.nombreCategoria(n.categoria)) + ' · ' + ui.formatearFecha(n.fecha) + '</span></span>' +
        '<button class="btn btn--ghost btn--ghost-error btn--sm" type="button" data-eliminar="' + ui.esc(n.id) + '">' +
        Pulso.icons.trash.replace('<svg ', '<svg class="btn__icon" ') + 'Eliminar</button></li>';
    }).join('');
  }

  function eliminar(id) {
    ui.confirmar({ titulo: '¿Eliminar esta noticia?', texto: 'Esta acción no se puede deshacer.' })
      .then(function (ok) {
        if (!ok) return;
        Pulso.store.eliminar(id);
        renderizarPropias();
        ui.toast('Noticia eliminada');
      });
  }

  // ── Envío del formulario (crear) ───────────────────────────────────────
  function publicar() {
    var form = document.getElementById('form-publicar');
    var datos = {
      titulo: form.titulo.value.trim(),
      categoria: form.categoria.value,
      autor: form.autor.value.trim(),
      resumen: form.resumen.value.trim(),
      cuerpo: form.cuerpo.value.trim(),
      pieFoto: form.pie.value.trim(),
      imagen: imagenDataUrl
    };

    var noticia = Pulso.store.crear(datos);
    if (!noticia) {
      ui.toast('No se pudo guardar la noticia. Prueba con una imagen más liviana', { tipo: 'error' });
      return;
    }
    // Redirige al detalle de la noticia recién publicada
    ui.toastAlVolver('Noticia publicada');
    window.location.href = 'detalle.html?id=' + encodeURIComponent(noticia.id);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var inputImagen = document.getElementById('imagen');

    Pulso.store.cargar().catch(function () {}).then(function () {
      vistaPrevia();
      renderizarPropias();
    });

    Pulso.validation.contador(document.getElementById('resumen'), document.getElementById('contador-resumen'), 200);
    Pulso.validation.conectar(document.getElementById('form-publicar'), publicar);

    document.getElementById('categoria').addEventListener('change', vistaPrevia);

    inputImagen.addEventListener('change', function () {
      var archivo = inputImagen.files[0];
      imagenDataUrl = '';
      if (!archivo || Pulso.validation.validarCampo(inputImagen)) { vistaPrevia(); return; }
      reducirImagen(archivo, 1200)
        .then(function (url) { imagenDataUrl = url; vistaPrevia(); })
        .catch(function () { ui.toast('No se pudo leer la imagen', { tipo: 'error' }); });
    });

    document.getElementById('mis-noticias').addEventListener('click', function (e) {
      var boton = e.target.closest('[data-eliminar]');
      if (boton) eliminar(boton.getAttribute('data-eliminar'));
    });
  });
})(window.Pulso = window.Pulso || {});
