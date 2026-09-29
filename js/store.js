/**
 * store.js
 * Capa de datos de Pulso.
 *
 * Fuente de verdad:
 *   1. data/noticias.json  → catálogo inicial (JSON local).
 *   2. localStorage        → cambios del usuario:
 *        pulso:creadas     noticias publicadas desde la página Publicar
 *        pulso:eliminadas  ids de noticias del JSON que el usuario eliminó
 *        pulso:favoritos   ids de noticias guardadas en favoritos
 *        pulso:mensajes    mensajes enviados desde el formulario de contacto
 *
 * El catálogo que ve el usuario siempre es: JSON − eliminadas + creadas.
 */
(function (Pulso) {
  'use strict';

  var KEYS = {
    creadas: 'pulso:creadas',
    eliminadas: 'pulso:eliminadas',
    favoritos: 'pulso:favoritos',
    mensajes: 'pulso:mensajes'
  };

  // ── Lectura y escritura segura en localStorage ─────────────────────────
  // localStorage puede no estar disponible (modo privado, cuota llena),
  // por eso toda lectura/escritura se protege con try/catch.
  function leer(clave, porDefecto) {
    try {
      var valor = window.localStorage.getItem(clave);
      return valor ? JSON.parse(valor) : porDefecto;
    } catch (error) {
      return porDefecto;
    }
  }

  function escribir(clave, valor) {
    try {
      window.localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (error) {
      return false; // cuota excedida o almacenamiento bloqueado
    }
  }

  // ── Carga del JSON local ───────────────────────────────────────────────
  var base = null;       // noticias del JSON, en memoria tras la primera carga
  var categorias = [];

  /**
   * Carga data/noticias.json con fetch().
   * Si la página se abre directamente como archivo (file://), el navegador
   * bloquea fetch; en ese caso se usa la copia de respaldo data/noticias.fallback.js,
   * que expone el mismo JSON en window.PULSO_DATA.
   * @returns {Promise<void>}
   */
  function cargar() {
    if (base) return Promise.resolve();

    return fetch('data/noticias.json', { cache: 'no-cache' })
      .then(function (respuesta) {
        if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);
        return respuesta.json();
      })
      .catch(function () {
        if (window.PULSO_DATA) return window.PULSO_DATA;
        throw new Error('No se pudo cargar el catálogo de noticias');
      })
      .then(function (datos) {
        base = datos.noticias || [];
        categorias = datos.categorias || [];
      });
  }

  // ── Consultas ──────────────────────────────────────────────────────────

  /** Devuelve todas las noticias visibles, de la más reciente a la más antigua. */
  function obtenerTodas() {
    var eliminadas = leer(KEYS.eliminadas, []);
    var creadas = leer(KEYS.creadas, []);
    return base
      .filter(function (n) { return eliminadas.indexOf(n.id) === -1; })
      .concat(creadas)
      .sort(function (a, b) { return b.fecha.localeCompare(a.fecha); });
  }

  function obtenerPorId(id) {
    return obtenerTodas().filter(function (n) { return n.id === id; })[0] || null;
  }

  function obtenerCategorias() {
    return categorias.slice();
  }

  function nombreCategoria(id) {
    var c = categorias.filter(function (cat) { return cat.id === id; })[0];
    return c ? c.nombre : id;
  }

  /**
   * Noticias destacadas para el Home: la más reciente de tres categorías
   * distintas, dando prioridad a las marcadas como "destacada" en el JSON.
   */
  function obtenerDestacadas(cantidad) {
    var todas = obtenerTodas();
    var ordenadas = todas.filter(function (n) { return n.destacada; })
      .concat(todas.filter(function (n) { return !n.destacada; }));
    var usadas = {};
    var resultado = [];
    ordenadas.forEach(function (n) {
      if (resultado.length < cantidad && !usadas[n.categoria]) {
        usadas[n.categoria] = true;
        resultado.push(n);
      }
    });
    return resultado;
  }

  /** Noticias de la misma categoría, excluyendo la actual. */
  function obtenerRelacionadas(noticia, cantidad) {
    return obtenerTodas()
      .filter(function (n) { return n.categoria === noticia.categoria && n.id !== noticia.id; })
      .slice(0, cantidad);
  }

  // ── Mini CRUD ──────────────────────────────────────────────────────────

  /** Convierte un título en un identificador legible para la URL. */
  function crearId(titulo) {
    var slug = titulo.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      .slice(0, 60);
    return slug + '-' + Date.now().toString(36);
  }

  /**
   * Crea una noticia nueva y la guarda en localStorage.
   * @param {Object} datos campos del formulario Publicar
   * @returns {Object|null} la noticia creada, o null si no se pudo guardar
   */
  function crear(datos) {
    var parrafos = datos.cuerpo.split(/\n\s*\n|\n/)
      .map(function (t) { return t.trim(); })
      .filter(Boolean)
      .map(function (t) { return { tipo: 'p', texto: t }; });

    var noticia = {
      id: crearId(datos.titulo),
      titulo: datos.titulo,
      categoria: datos.categoria,
      fecha: new Date().toISOString().slice(0, 10),
      autor: datos.autor,
      lectura: Math.max(1, Math.round(datos.cuerpo.split(/\s+/).length / 200)),
      lecturas: 0,
      destacada: false,
      resumen: datos.resumen,
      imagen: datos.imagen || '',
      imagenAlt: datos.titulo,
      pieFoto: datos.pieFoto || '',
      cuerpo: parrafos,
      propia: true // marca las noticias creadas por el usuario
    };

    var creadas = leer(KEYS.creadas, []);
    creadas.push(noticia);
    return escribir(KEYS.creadas, creadas) ? noticia : null;
  }

  /**
   * Elimina una noticia. Si fue creada por el usuario se borra de "creadas";
   * si viene del JSON se registra su id en "eliminadas".
   * También se quita de favoritos.
   */
  function eliminar(id) {
    var creadas = leer(KEYS.creadas, []);
    var restantes = creadas.filter(function (n) { return n.id !== id; });

    if (restantes.length !== creadas.length) {
      escribir(KEYS.creadas, restantes);
    } else {
      var eliminadas = leer(KEYS.eliminadas, []);
      if (eliminadas.indexOf(id) === -1) eliminadas.push(id);
      escribir(KEYS.eliminadas, eliminadas);
    }
    quitarFavorito(id);
  }

  function obtenerPropias() {
    return leer(KEYS.creadas, []).slice().reverse();
  }

  // ── Favoritos ──────────────────────────────────────────────────────────

  function idsFavoritos() {
    return leer(KEYS.favoritos, []);
  }

  function esFavorito(id) {
    return idsFavoritos().indexOf(id) !== -1;
  }

  function agregarFavorito(id) {
    var ids = idsFavoritos();
    if (ids.indexOf(id) === -1) ids.unshift(id); // el más reciente primero
    escribir(KEYS.favoritos, ids);
  }

  function quitarFavorito(id) {
    escribir(KEYS.favoritos, idsFavoritos().filter(function (x) { return x !== id; }));
  }

  /** Alterna el estado de favorito y devuelve el nuevo estado (true = guardada). */
  function alternarFavorito(id) {
    if (esFavorito(id)) {
      quitarFavorito(id);
      return false;
    }
    agregarFavorito(id);
    return true;
  }

  /** Noticias guardadas, en el orden en que se guardaron. Ignora ids huérfanos. */
  function obtenerFavoritos() {
    var todas = obtenerTodas();
    return idsFavoritos()
      .map(function (id) { return todas.filter(function (n) { return n.id === id; })[0]; })
      .filter(Boolean);
  }

  // ── Mensajes de contacto (simulación de envío) ─────────────────────────
  function guardarMensaje(mensaje) {
    var mensajes = leer(KEYS.mensajes, []);
    mensajes.push(Object.assign({ fecha: new Date().toISOString() }, mensaje));
    return escribir(KEYS.mensajes, mensajes);
  }

  // API pública del módulo
  Pulso.store = {
    cargar: cargar,
    obtenerTodas: obtenerTodas,
    obtenerPorId: obtenerPorId,
    obtenerCategorias: obtenerCategorias,
    nombreCategoria: nombreCategoria,
    obtenerDestacadas: obtenerDestacadas,
    obtenerRelacionadas: obtenerRelacionadas,
    crear: crear,
    eliminar: eliminar,
    obtenerPropias: obtenerPropias,
    esFavorito: esFavorito,
    agregarFavorito: agregarFavorito,
    quitarFavorito: quitarFavorito,
    alternarFavorito: alternarFavorito,
    obtenerFavoritos: obtenerFavoritos,
    guardarMensaje: guardarMensaje
  };
})(window.Pulso = window.Pulso || {});
