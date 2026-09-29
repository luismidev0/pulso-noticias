/**
 * pages/detalle.js
 * Vista de detalle de una noticia (detalle.html?id=<id>).
 *
 * Muestra la información completa y permite:
 *   - guardar o quitar de favoritos
 *   - compartir el enlace
 *   - eliminar la noticia (mini CRUD), con confirmación en un modal
 * Si el id no existe se muestra el estado "Noticia no encontrada" (404).
 */
(function (Pulso) {
  'use strict';

  var ui = Pulso.ui;
  var icons = Pulso.icons;
  var contenedor;
  var noticia;

  // ── Plantillas ─────────────────────────────────────────────────────────

  /** Convierte los bloques del cuerpo (párrafo, subtítulo, cita) en HTML. */
  function cuerpo(bloques) {
    return bloques.map(function (b, i) {
      if (b.tipo === 'h2') return '<h2 class="article-body__h2">' + ui.esc(b.texto) + '</h2>';
      if (b.tipo === 'cita') {
        return '<blockquote class="quote"><p class="quote__text">\u201C' + ui.esc(b.texto) + '\u201D</p>' +
          (b.autor ? '<cite class="quote__cite">' + ui.esc(b.autor) + '</cite>' : '') + '</blockquote>';
      }
      // El primer párrafo es la entrada (lead), más grande
      return '<p class="' + (i === 0 ? 'article-body__lead' : 'article-body__p') + '">' + ui.esc(b.texto) + '</p>';
    }).join('');
  }

  /** Botón de favorito en sus dos estados: guardar / guardada. */
  function botonFavorito(activo) {
    return activo
      ? '<button class="btn btn--fav-active" type="button" id="btn-fav" aria-pressed="true">' +
        icons.heartFilled.replace('<svg ', '<svg class="btn__icon" ') + 'Guardada en favoritos</button>'
      : '<button class="btn btn--primary" type="button" id="btn-fav" aria-pressed="false">' +
        icons.heart.replace('<svg ', '<svg class="btn__icon" ') + 'Guardar en favoritos</button>';
  }

  function iniciales(nombre) {
    return nombre.split(' ').slice(0, 2).map(function (p) { return p.charAt(0); }).join('').toUpperCase();
  }

  function plantilla(n) {
    var cat = Pulso.store.nombreCategoria(n.categoria);
    var relacionadas = Pulso.store.obtenerRelacionadas(n, 3);

    return '' +
      // Ruta de navegación
      '<nav class="breadcrumb container" aria-label="Ruta de navegación"><ol class="breadcrumb__list">' +
        '<li class="breadcrumb__item"><a class="breadcrumb__link" href="index.html">Inicio</a></li>' +
        '<li class="breadcrumb__item"><a class="breadcrumb__link" href="noticias.html">Noticias</a></li>' +
        '<li class="breadcrumb__item"><a class="breadcrumb__link" href="noticias.html?cat=' + n.categoria + '">' + ui.esc(cat) + '</a></li>' +
        '<li class="breadcrumb__item"><span class="breadcrumb__current" aria-current="page">' + ui.esc(n.titulo) + '</span></li>' +
      '</ol></nav>' +

      '<article class="article">' +
        // Cabecera: categoría, título, metadatos y acciones
        '<header class="container"><div class="reading article-header">' +
          '<span class="badge badge--' + n.categoria + '">' + ui.esc(cat) + '</span>' +
          '<h1 class="article-header__title">' + ui.esc(n.titulo) + '</h1>' +
          '<div class="article-meta">' +
            '<span class="avatar avatar--sm" aria-hidden="true">' + iniciales(n.autor) + '</span>' +
            '<span class="article-meta__author">' + ui.esc(n.autor) + '</span>' +
            '<span class="article-meta__sep" aria-hidden="true">·</span>' +
            '<time datetime="' + n.fecha + '">' + ui.formatearFecha(n.fecha) + '</time>' +
            '<span class="article-meta__sep" aria-hidden="true">·</span>' +
            '<span>' + (n.lectura || 3) + ' min de lectura</span>' +
          '</div>' +
          '<div class="article-actions">' +
            '<span id="fav-slot">' + botonFavorito(Pulso.store.esFavorito(n.id)) + '</span>' +
            '<button class="btn btn--ghost" type="button" id="btn-compartir">' + icons.share.replace('<svg ', '<svg class="btn__icon" ') + 'Compartir</button>' +
            '<button class="btn btn--ghost btn--ghost-error article-actions__end" type="button" id="btn-eliminar">' + icons.trash.replace('<svg ', '<svg class="btn__icon" ') + 'Eliminar noticia</button>' +
          '</div>' +
        '</div></header>' +

        // Imagen representativa
        '<div class="container"><figure class="article-figure">' +
          '<div class="article-figure__media">' + ui.media(n) + '</div>' +
          (n.pieFoto ? '<figcaption class="article-figure__caption">' + ui.esc(n.pieFoto) + '</figcaption>' : '') +
        '</figure></div>' +

        // Cuerpo del artículo
        '<div class="container"><div class="reading article-body">' + cuerpo(n.cuerpo || []) + '</div></div>' +
      '</article>' +

      // Noticias relacionadas
      (relacionadas.length
        ? '<section class="related" aria-labelledby="rel-title"><div class="container">' +
          '<h2 class="section__title" id="rel-title">Noticias relacionadas</h2>' +
          '<div class="grid" id="relacionadas">' + relacionadas.map(function (r) { return ui.tarjeta(r); }).join('') + '</div>' +
          '</div></section>'
        : '') +

      // Llamado a contacto
      '<section class="container"><div class="cta-box">' +
        '<h2 class="cta-box__title">¿Tienes información sobre esta noticia?</h2>' +
        '<a class="btn btn--secondary" href="contacto.html">Contáctanos</a>' +
      '</div></section>';
  }

  function noEncontrada() {
    document.title = 'Noticia no encontrada · Pulso';
    contenedor.innerHTML = '<div class="container">' + ui.estado({
      codigo: '404',
      titulo: 'Noticia no encontrada',
      texto: 'Es posible que la noticia haya sido eliminada o que el enlace esté incompleto.',
      boton: { texto: 'Volver al listado', href: 'noticias.html' }
    }) + '</div>';
  }

  /** Esqueleto de la cabecera y los primeros párrafos durante la carga. */
  function esqueleto() {
    contenedor.innerHTML = '<div class="container"><div class="reading article-header" aria-hidden="true">' +
      '<span class="skeleton skeleton--badge"></span>' +
      '<div class="skeleton-stack" style="margin-top:24px"><span class="skeleton skeleton--h1"></span><span class="skeleton skeleton--h1" style="width:60%"></span></div>' +
      '<div class="skeleton-stack" style="margin-top:48px"><span class="skeleton skeleton--line"></span><span class="skeleton skeleton--line"></span><span class="skeleton skeleton--line" style="width:80%"></span></div>' +
      '</div></div>';
  }

  // ── Acciones ───────────────────────────────────────────────────────────
  function alternarFavorito() {
    var guardada = Pulso.store.alternarFavorito(noticia.id);
    document.getElementById('fav-slot').innerHTML = botonFavorito(guardada);
    document.getElementById('btn-fav').focus();
    ui.toast(guardada ? 'Noticia guardada en favoritos' : 'Noticia eliminada de favoritos');
  }

  function compartir() {
    var url = window.location.href;
    // API nativa de compartir (móviles); si no existe, copia el enlace
    if (navigator.share) {
      navigator.share({ title: noticia.titulo, url: url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(function () { ui.toast('Enlace copiado al portapapeles'); })
        .catch(function () { ui.toast('No se pudo copiar el enlace', { tipo: 'error' }); });
    }
  }

  function eliminar() {
    ui.confirmar({
      titulo: '¿Eliminar esta noticia?',
      texto: 'Esta acción no se puede deshacer.',
      confirmar: 'Eliminar'
    }).then(function (confirmado) {
      if (!confirmado) return;
      Pulso.store.eliminar(noticia.id);
      ui.toastAlVolver('Noticia eliminada');
      window.location.href = 'noticias.html';
    });
  }

  // ── Inicio ─────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    contenedor = document.getElementById('detalle');
    esqueleto();

    Pulso.store.cargar().then(function () {
      noticia = Pulso.store.obtenerPorId(ui.parametro('id') || '');
      if (!noticia) { noEncontrada(); return; }

      document.title = noticia.titulo + ' · Pulso';
      contenedor.innerHTML = plantilla(noticia);

      document.getElementById('fav-slot').addEventListener('click', alternarFavorito);
      document.getElementById('btn-compartir').addEventListener('click', compartir);
      document.getElementById('btn-eliminar').addEventListener('click', eliminar);
      var rel = document.getElementById('relacionadas');
      if (rel) ui.activarFavoritos(rel);
    }).catch(function () {
      contenedor.innerHTML = '<div class="container">' + ui.estadoError('No se pudo cargar la noticia') + '</div>';
      contenedor.addEventListener('click', function (e) {
        if (e.target.closest('[data-accion="reintentar"]')) window.location.reload();
      });
    });
  });
})(window.Pulso = window.Pulso || {});
