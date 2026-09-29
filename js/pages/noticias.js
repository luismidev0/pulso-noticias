/**
 * pages/noticias.js
 * Listado de noticias con:
 *   - búsqueda por texto (título, resumen y autor)
 *   - filtro por categoría (chips)
 *   - ordenamiento (más recientes, más antiguas, más leídas)
 *   - paginación de 9 tarjetas por página
 *
 * El estado de los filtros se guarda en la URL (?cat=&q=&orden=&pagina=),
 * así el usuario puede compartir o recargar la página sin perder la vista.
 */
(function (Pulso) {
  'use strict';

  var POR_PAGINA = 9;
  var estado = { cat: '', q: '', orden: 'recientes', pagina: 1 };
  var el = {};

  // ── Estado ↔ URL ───────────────────────────────────────────────────────
  function leerUrl() {
    var p = new URLSearchParams(window.location.search);
    estado.cat = p.get('cat') || '';
    estado.q = p.get('q') || '';
    estado.orden = p.get('orden') || 'recientes';
    estado.pagina = Math.max(1, parseInt(p.get('pagina'), 10) || 1);
  }

  function escribirUrl() {
    var p = new URLSearchParams();
    if (estado.cat) p.set('cat', estado.cat);
    if (estado.q) p.set('q', estado.q);
    if (estado.orden !== 'recientes') p.set('orden', estado.orden);
    if (estado.pagina > 1) p.set('pagina', estado.pagina);
    var qs = p.toString();
    history.replaceState(null, '', qs ? '?' + qs : window.location.pathname);
  }

  // ── Filtrado y orden ───────────────────────────────────────────────────

  /** Quita tildes y pasa a minúsculas para comparar sin distinguir acentos. */
  function normalizar(texto) {
    return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function filtrar(noticias) {
    var q = normalizar(estado.q.trim());
    var resultado = noticias.filter(function (n) {
      var coincideCat = !estado.cat || n.categoria === estado.cat;
      var coincideTexto = !q || normalizar(n.titulo + ' ' + n.resumen + ' ' + n.autor).indexOf(q) !== -1;
      return coincideCat && coincideTexto;
    });

    if (estado.orden === 'antiguas') {
      resultado.sort(function (a, b) { return a.fecha.localeCompare(b.fecha); });
    } else if (estado.orden === 'leidas') {
      resultado.sort(function (a, b) { return (b.lecturas || 0) - (a.lecturas || 0); });
    } // "recientes" ya viene ordenado desde el store
    return resultado;
  }

  // ── Renderizado ────────────────────────────────────────────────────────
  function renderizar() {
    var todas = filtrar(Pulso.store.obtenerTodas());
    var total = todas.length;
    var paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
    if (estado.pagina > paginas) estado.pagina = paginas;

    var inicio = (estado.pagina - 1) * POR_PAGINA;
    var visibles = todas.slice(inicio, inicio + POR_PAGINA);

    el.contador.innerHTML = 'Mostrando <strong>' + visibles.length + '</strong> de <strong>' + total + '</strong> noticias';

    if (!total) {
      // Estado vacío: la búsqueda o el filtro no arrojaron resultados
      var texto = estado.q ? 'No encontramos noticias para \u2018' + estado.q + '\u2019' : 'No hay noticias en esta categoría';
      el.resultados.innerHTML = Pulso.ui.estado({
        ilustracion: Pulso.icons.emptySearch,
        titulo: texto,
        texto: 'Prueba con otras palabras o revisa los filtros aplicados.',
        boton: { texto: 'Limpiar filtros', accion: 'limpiar', clase: 'btn--secondary' }
      });
      el.paginacion.innerHTML = '';
    } else {
      el.resultados.innerHTML = visibles.map(function (n) { return Pulso.ui.tarjeta(n); }).join('');
      renderizarPaginacion(paginas);
    }

    sincronizarControles();
    escribirUrl();
  }

  function renderizarPaginacion(paginas) {
    if (paginas <= 1) { el.paginacion.innerHTML = ''; return; }
    var html = '<ul class="pagination__list">';
    var p = estado.pagina;

    html += '<li><button class="pagination__link' + (p === 1 ? ' pagination__link--disabled' : '') + '" type="button" data-pagina="' + (p - 1) + '"' + (p === 1 ? ' disabled' : '') + '>« Anterior</button></li>';
    for (var i = 1; i <= paginas; i++) {
      html += '<li><button class="pagination__link' + (i === p ? ' pagination__link--active' : '') + '" type="button" data-pagina="' + i + '"' + (i === p ? ' aria-current="page"' : '') + '>' + i + '</button></li>';
    }
    html += '<li><button class="pagination__link' + (p === paginas ? ' pagination__link--disabled' : '') + '" type="button" data-pagina="' + (p + 1) + '"' + (p === paginas ? ' disabled' : '') + '>Siguiente »</button></li>';
    el.paginacion.innerHTML = html + '</ul>';
  }

  /** Refleja el estado en los controles (chip activo, orden y buscador). */
  function sincronizarControles() {
    Array.prototype.forEach.call(el.chips.querySelectorAll('.chip'), function (chip) {
      var activo = chip.getAttribute('data-cat') === estado.cat;
      chip.classList.toggle('chip--active', activo);
      chip.setAttribute('aria-pressed', String(activo));
    });
    el.orden.value = estado.orden;
    if (document.activeElement !== el.buscar) el.buscar.value = estado.q;
  }

  function mostrarError() {
    el.contador.textContent = '';
    el.paginacion.innerHTML = '';
    el.resultados.innerHTML = Pulso.ui.estadoError('No se pudo cargar el listado');
  }

  function cargar() {
    el.resultados.innerHTML = Pulso.ui.esqueletos(6);
    Pulso.store.cargar().then(renderizar).catch(mostrarError);
  }

  // ── Eventos ────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    el.resultados = document.getElementById('resultados');
    el.paginacion = document.getElementById('paginacion');
    el.contador = document.getElementById('contador');
    el.chips = document.getElementById('chips');
    el.orden = document.getElementById('orden');
    el.buscar = document.getElementById('buscar');

    leerUrl();

    // Filtro por categoría
    el.chips.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      estado.cat = chip.getAttribute('data-cat');
      estado.pagina = 1;
      renderizar();
    });

    // Ordenamiento
    el.orden.addEventListener('change', function () {
      estado.orden = el.orden.value;
      estado.pagina = 1;
      renderizar();
    });

    // Búsqueda con espera de 250 ms para no renderizar en cada tecla
    var espera;
    el.buscar.addEventListener('input', function () {
      clearTimeout(espera);
      espera = setTimeout(function () {
        estado.q = el.buscar.value;
        estado.pagina = 1;
        renderizar();
      }, 250);
    });
    document.getElementById('form-busqueda').addEventListener('submit', function (e) { e.preventDefault(); });

    // Paginación: vuelve al inicio del listado al cambiar de página
    el.paginacion.addEventListener('click', function (e) {
      var boton = e.target.closest('[data-pagina]');
      if (!boton || boton.disabled) return;
      estado.pagina = parseInt(boton.getAttribute('data-pagina'), 10);
      renderizar();
      document.querySelector('.filters').scrollIntoView({ behavior: 'smooth' });
    });

    // Acciones de los estados: limpiar filtros o reintentar la carga
    el.resultados.addEventListener('click', function (e) {
      var accion = e.target.closest('[data-accion]');
      if (!accion) return;
      if (accion.getAttribute('data-accion') === 'limpiar') {
        estado = { cat: '', q: '', orden: 'recientes', pagina: 1 };
        el.buscar.value = '';
        renderizar();
      } else {
        cargar();
      }
    });

    // Corazón de favoritos en cada tarjeta
    Pulso.ui.activarFavoritos(el.resultados);

    cargar();
  });
})(window.Pulso = window.Pulso || {});
