/**
 * ui.js
 * Componentes de interfaz reutilizables. Cada función devuelve HTML o
 * manipula el DOM siguiendo el sistema de diseño de la maquetación:
 *   - tarjeta de noticia (card)
 *   - esqueletos de carga (skeleton)
 *   - estados vacíos y de error
 *   - avisos emergentes (toast)
 *   - diálogo modal de confirmación
 *   - menú de navegación en móvil
 */
(function (Pulso) {
  'use strict';

  var icons = Pulso.icons;

  // ── Utilidades ─────────────────────────────────────────────────────────

  /** Escapa texto antes de insertarlo como HTML (evita inyección de código). */
  function esc(texto) {
    return String(texto == null ? '' : texto)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  /** "2026-09-26" → "26 sep 2026" */
  function formatearFecha(iso) {
    var p = iso.split('-');
    return parseInt(p[2], 10) + ' ' + MESES[parseInt(p[1], 10) - 1] + ' ' + p[0];
  }

  /** Lee un parámetro de la URL, p. ej. detalle.html?id=abc → "abc". */
  function parametro(nombre) {
    return new URLSearchParams(window.location.search).get(nombre);
  }

  // ── Imagen o marcador de posición ──────────────────────────────────────

  /**
   * Devuelve el bloque de imagen. Si la noticia no tiene imagen (por ejemplo,
   * una publicada sin foto) se muestra el marcador de color de su categoría.
   */
  function media(noticia, etiqueta) {
    var cat = noticia.categoria;
    var img = noticia.imagen
      ? '<img class="placeholder__img" src="' + esc(noticia.imagen) + '" alt="' + esc(noticia.imagenAlt || '') + '" loading="lazy">'
      : '';
    return '<div class="placeholder placeholder--' + esc(cat) + '">' +
      icons.image.replace('<svg ', '<svg class="placeholder__icon" ') +
      '<span>' + esc(etiqueta || Pulso.store.nombreCategoria(cat)) + '</span>' + img +
      '</div>';
  }

  // ── Tarjeta de noticia ─────────────────────────────────────────────────

  /**
   * Renderiza una tarjeta de noticia.
   * @param {Object} noticia
   * @param {Object} [opciones] { modo: 'favoritos' } cambia el botón inferior
   *                            por "Quitar de favoritos".
   */
  function tarjeta(noticia, opciones) {
    opciones = opciones || {};
    var url = 'detalle.html?id=' + encodeURIComponent(noticia.id);
    var fav = Pulso.store.esFavorito(noticia.id);
    var cat = noticia.categoria;

    var botonFav =
      '<button class="card__fav' + (fav ? ' card__fav--active' : '') + '" type="button" ' +
      'data-fav="' + esc(noticia.id) + '" aria-pressed="' + fav + '" ' +
      'aria-label="' + (fav ? 'Quitar de favoritos' : 'Guardar en favoritos') + '">' +
      (fav ? icons.heartFilled : icons.heart) + '</button>';

    var pie = opciones.modo === 'favoritos'
      ? '<button class="btn btn--secondary btn--sm" type="button" data-quitar="' + esc(noticia.id) + '">' +
        icons.heartFilled.replace('<svg ', '<svg class="btn__icon" ') + 'Quitar de favoritos</button>'
      : '<a class="btn btn--secondary btn--sm" href="' + url + '">Ver más</a>';

    return '<article class="card">' +
      '<div class="card__media">' + media(noticia) + botonFav + '</div>' +
      '<div class="card__body">' +
        '<span class="badge badge--' + esc(cat) + '">' + esc(Pulso.store.nombreCategoria(cat)) + '</span>' +
        '<h3 class="card__title"><a class="card__link" href="' + url + '">' + esc(noticia.titulo) + '</a></h3>' +
        '<time class="card__date" datetime="' + esc(noticia.fecha) + '">' + formatearFecha(noticia.fecha) + '</time>' +
        '<p class="card__summary">' + esc(noticia.resumen) + '</p>' +
        '<div class="card__footer">' + pie + '</div>' +
      '</div></article>';
  }

  /** Tarjeta en versión esqueleto, mientras se cargan los datos. */
  function tarjetaEsqueleto() {
    return '<article class="card" aria-hidden="true">' +
      '<span class="skeleton skeleton--media"></span>' +
      '<div class="card__body"><span class="skeleton skeleton--badge"></span>' +
      '<div class="skeleton-stack"><span class="skeleton skeleton--title"></span>' +
      '<span class="skeleton skeleton--title" style="width:70%"></span></div>' +
      '<span class="skeleton skeleton--small"></span>' +
      '<div class="skeleton-stack"><span class="skeleton skeleton--line"></span>' +
      '<span class="skeleton skeleton--line" style="width:85%"></span></div>' +
      '<div class="card__footer"><span class="skeleton skeleton--btn"></span></div></div></article>';
  }

  function esqueletos(cantidad) {
    var html = '';
    for (var i = 0; i < cantidad; i++) html += tarjetaEsqueleto();
    return html;
  }

  // ── Estados vacíos y de error ──────────────────────────────────────────

  /**
   * Bloque de estado centrado.
   * @param {Object} o { ilustracion, icono, codigo, titulo, texto, boton: {texto, href|accion, clase} }
   */
  function estado(o) {
    var visual = o.ilustracion
      ? o.ilustracion.replace('<svg ', '<svg class="empty__illustration" ')
      : o.icono ? '<span class="empty__icon">' + o.icono + '</span>'
      : o.codigo ? '<span class="empty__code">' + esc(o.codigo) + '</span>' : '';
    var boton = '';
    if (o.boton) {
      var clase = 'btn ' + (o.boton.clase || 'btn--primary');
      var icono = o.boton.icono ? o.boton.icono.replace('<svg ', '<svg class="btn__icon" ') : '';
      boton = o.boton.href
        ? '<a class="' + clase + '" href="' + o.boton.href + '">' + icono + esc(o.boton.texto) + '</a>'
        : '<button class="' + clase + '" type="button" data-accion="' + o.boton.accion + '">' + icono + esc(o.boton.texto) + '</button>';
    }
    return '<div class="state-block"><div class="empty" role="status">' + visual +
      '<h3 class="empty__title">' + esc(o.titulo) + '</h3>' +
      (o.texto ? '<p class="empty__text">' + esc(o.texto) + '</p>' : '') + boton + '</div></div>';
  }

  /** Estado de error de carga con botón "Reintentar". */
  function estadoError(titulo) {
    return estado({
      icono: icons.alertBig,
      titulo: titulo,
      texto: 'Revisa tu conexión e intenta de nuevo.',
      boton: { texto: 'Reintentar', accion: 'reintentar', icono: icons.retry }
    });
  }

  // ── Avisos emergentes (toasts) ─────────────────────────────────────────

  var region = null;

  /**
   * Muestra un aviso en la parte inferior de la pantalla.
   * @param {string} mensaje
   * @param {Object} [o] { tipo: 'success'|'error', accion: {texto, alHacerClic}, duracion }
   */
  function toast(mensaje, o) {
    o = o || {};
    if (!region) {
      region = document.createElement('div');
      region.className = 'toast-region';
      region.setAttribute('aria-live', 'polite');
      document.body.appendChild(region);
    }
    var tipo = o.tipo || 'success';
    var el = document.createElement('div');
    el.className = 'toast toast--' + tipo;
    el.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
    el.innerHTML =
      (tipo === 'error' ? icons.alertCircle : icons.checkCircle).replace('<svg ', '<svg class="toast__icon" ') +
      '<span class="toast__message">' + esc(mensaje) + '</span>' +
      (o.accion ? '<button class="toast__action btn--ghost" type="button" style="background:none;border:0;cursor:pointer">' + esc(o.accion.texto) + '</button>' : '') +
      '<button class="toast__close" type="button" aria-label="Cerrar notificación">' + icons.close + '</button>';

    function cerrar() { if (el.parentNode) el.parentNode.removeChild(el); }
    el.querySelector('.toast__close').addEventListener('click', cerrar);
    if (o.accion) {
      el.querySelector('.toast__action').addEventListener('click', function () {
        o.accion.alHacerClic();
        cerrar();
      });
    }
    region.appendChild(el);
    setTimeout(cerrar, o.duracion || 5000);
  }

  /**
   * Muestra un aviso guardado en sessionStorage antes de cambiar de página
   * (p. ej. "Noticia eliminada" después de redirigir al listado).
   */
  function toastPendiente() {
    try {
      var pendiente = sessionStorage.getItem('pulso:toast');
      if (pendiente) {
        sessionStorage.removeItem('pulso:toast');
        toast(pendiente);
      }
    } catch (e) { /* sin sessionStorage: no pasa nada */ }
  }

  function toastAlVolver(mensaje) {
    try { sessionStorage.setItem('pulso:toast', mensaje); } catch (e) { /* ignorar */ }
  }

  // ── Diálogo modal de confirmación ──────────────────────────────────────

  /**
   * Abre un modal de confirmación accesible.
   * Se cierra con "Cancelar", la tecla Escape o clic fuera del cuadro.
   * @returns {Promise<boolean>} true si el usuario confirma
   */
  function confirmar(o) {
    return new Promise(function (resolver) {
      var anterior = document.activeElement;
      var overlay = document.createElement('div');
      overlay.className = 'overlay';
      overlay.innerHTML =
        '<div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="modal-titulo" aria-describedby="modal-texto" tabindex="-1">' +
          '<span class="modal__icon">' + icons.trash + '</span>' +
          '<h2 class="modal__title" id="modal-titulo">' + esc(o.titulo) + '</h2>' +
          '<p class="modal__text" id="modal-texto">' + esc(o.texto) + '</p>' +
          '<div class="modal__actions">' +
            '<button class="btn btn--secondary" type="button" data-r="no">Cancelar</button>' +
            '<button class="btn btn--error" type="button" data-r="si">' + esc(o.confirmar || 'Eliminar') + '</button>' +
          '</div></div>';

      function cerrar(resultado) {
        document.removeEventListener('keydown', teclado);
        document.body.classList.remove('has-modal');
        overlay.parentNode.removeChild(overlay);
        if (anterior && anterior.focus) anterior.focus();
        resolver(resultado);
      }
      function teclado(e) {
        if (e.key === 'Escape') cerrar(false);
        // Mantiene el foco dentro del modal
        if (e.key === 'Tab') {
          var botones = overlay.querySelectorAll('button');
          var primero = botones[0], ultimo = botones[botones.length - 1];
          if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
          else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
        }
      }

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) cerrar(false);
        var r = e.target.closest('[data-r]');
        if (r) cerrar(r.getAttribute('data-r') === 'si');
      });
      document.addEventListener('keydown', teclado);
      document.body.classList.add('has-modal');
      document.body.appendChild(overlay);
      overlay.querySelector('[data-r="no"]').focus();
    });
  }

  // ── Favoritos desde cualquier tarjeta ──────────────────────────────────

  /**
   * Delegación de eventos: un solo listener en el contenedor atiende los
   * clics en el corazón de todas sus tarjetas, incluso las que se rendericen
   * después.
   */
  function activarFavoritos(contenedor, alCambiar) {
    contenedor.addEventListener('click', function (e) {
      var boton = e.target.closest('[data-fav]');
      if (!boton) return;
      var id = boton.getAttribute('data-fav');
      var guardada = Pulso.store.alternarFavorito(id);

      boton.classList.toggle('card__fav--active', guardada);
      boton.setAttribute('aria-pressed', String(guardada));
      boton.setAttribute('aria-label', guardada ? 'Quitar de favoritos' : 'Guardar en favoritos');
      boton.innerHTML = guardada ? icons.heartFilled : icons.heart;

      toast(guardada ? 'Noticia guardada en favoritos' : 'Noticia eliminada de favoritos');
      if (alCambiar) alCambiar(id, guardada);
    });
  }

  // ── Menú de navegación en pantallas pequeñas ───────────────────────────
  function iniciarMenu() {
    var boton = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.header__nav');
    if (!boton || !nav) return;
    boton.innerHTML = icons.menu;
    boton.addEventListener('click', function () {
      var abierto = nav.classList.toggle('is-open');
      boton.setAttribute('aria-expanded', String(abierto));
    });
  }

  // Se ejecuta en todas las páginas
  document.addEventListener('DOMContentLoaded', function () {
    iniciarMenu();
    toastPendiente();
    var anio = document.querySelector('[data-anio]');
    if (anio) anio.textContent = new Date().getFullYear();
  });

  Pulso.ui = {
    esc: esc,
    formatearFecha: formatearFecha,
    parametro: parametro,
    media: media,
    tarjeta: tarjeta,
    esqueletos: esqueletos,
    estado: estado,
    estadoError: estadoError,
    toast: toast,
    toastAlVolver: toastAlVolver,
    confirmar: confirmar,
    activarFavoritos: activarFavoritos
  };
})(window.Pulso = window.Pulso || {});
