/**
 * validation.js
 * Validación de formularios del lado del cliente, compartida por
 * Contacto y Publicar.
 *
 * Cada campo se describe con reglas declarativas en el atributo
 * data-reglas del elemento, por ejemplo:
 *   <input data-reglas="requerido|correo">
 *   <textarea data-reglas="requerido|min:50|max:500">
 *
 * Los mensajes de error se muestran debajo del campo, con el borde en color
 * de error y un ícono de alerta, tal como se diseñó en la maquetación.
 */
(function (Pulso) {
  'use strict';

  // Expresión sencilla para correos del tipo nombre@dominio.ext
  var CORREO = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  /** Reglas disponibles: cada una devuelve un mensaje si falla, o '' si pasa. */
  var REGLAS = {
    requerido: function (valor, campo) {
      if (campo.type === 'checkbox') return campo.checked ? '' : 'Debes aceptar para continuar';
      return valor.trim() ? '' : 'Este campo es obligatorio';
    },
    correo: function (valor) {
      return !valor.trim() || CORREO.test(valor.trim()) ? '' : 'Ingresa un correo válido, por ejemplo nombre@dominio.com';
    },
    min: function (valor, campo, n) {
      return !valor.trim() || valor.trim().length >= n ? '' : 'Escribe al menos ' + n + ' caracteres';
    },
    max: function (valor, campo, n) {
      return valor.length <= n ? '' : 'Máximo ' + n + ' caracteres';
    },
    imagen: function (valor, campo) {
      var archivo = campo.files && campo.files[0];
      if (!archivo) return '';
      if (!/^image\/(jpeg|png|webp)$/.test(archivo.type)) return 'Usa una imagen JPG, PNG o WebP';
      if (archivo.size > 5 * 1024 * 1024) return 'La imagen debe pesar menos de 5 MB';
      return '';
    }
  };

  /** Valida un campo y devuelve el primer mensaje de error encontrado. */
  function validarCampo(campo) {
    var reglas = (campo.getAttribute('data-reglas') || '').split('|').filter(Boolean);
    var valor = campo.value || '';
    for (var i = 0; i < reglas.length; i++) {
      var partes = reglas[i].split(':');
      var mensaje = REGLAS[partes[0]](valor, campo, parseInt(partes[1], 10));
      if (mensaje) return mensaje;
    }
    return '';
  }

  /** Pinta u oculta el mensaje de error de un campo. */
  function mostrarError(campo, mensaje) {
    var field = campo.closest('.field');
    var id = campo.id + '-error';
    var error = document.getElementById(id);

    field.classList.toggle('field--error', !!mensaje);
    campo.setAttribute('aria-invalid', String(!!mensaje));

    // Ícono de alerta dentro de inputs de texto (no en checkbox ni select)
    var control = campo.closest('.field__control');
    var alerta = control && control.querySelector('.field__alert');
    if (control && mensaje && !alerta && campo.tagName !== 'SELECT') {
      control.insertAdjacentHTML('beforeend', Pulso.icons.fieldAlert.replace('<svg ', '<svg class="field__alert" '));
    } else if (alerta && !mensaje) {
      alerta.parentNode.removeChild(alerta);
    }

    if (mensaje) {
      if (!error) {
        error = document.createElement('p');
        error.className = 'field__error';
        error.id = id;
        field.appendChild(error);
      }
      error.innerHTML = Pulso.icons.alertCircle + Pulso.ui.esc(mensaje);
      campo.setAttribute('aria-describedby', id);
    } else if (error) {
      error.parentNode.removeChild(error);
      campo.removeAttribute('aria-describedby');
    }
  }

  /**
   * Conecta la validación a un formulario:
   *  - valida cada campo al salir de él (blur) y mientras se corrige un error;
   *  - al enviar, valida todo y enfoca el primer campo con error.
   * @param {HTMLFormElement} form
   * @param {Function} alEnviar se llama solo si todo es válido
   */
  function conectar(form, alEnviar) {
    var campos = Array.prototype.slice.call(form.querySelectorAll('[data-reglas]'));

    campos.forEach(function (campo) {
      var evento = campo.type === 'checkbox' || campo.type === 'file' || campo.tagName === 'SELECT' ? 'change' : 'blur';
      campo.addEventListener(evento, function (e) {
        // Si el foco pasa al botón de enviar no se valida aquí: el mensaje de
        // error movería el botón y el clic se perdería. La validación completa
        // la hace el evento submit.
        if (e.relatedTarget && e.relatedTarget.type === 'submit') return;
        mostrarError(campo, validarCampo(campo));
      });
      campo.addEventListener('input', function () {
        if (campo.closest('.field').classList.contains('field--error')) mostrarError(campo, validarCampo(campo));
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var primero = null;
      campos.forEach(function (campo) {
        var mensaje = validarCampo(campo);
        mostrarError(campo, mensaje);
        if (mensaje && !primero) primero = campo;
      });
      if (primero) {
        primero.focus();
        return;
      }
      alEnviar();
    });
  }

  /** Contador de caracteres "0/500" para textarea. */
  function contador(campo, salida, maximo) {
    function actualizar() { salida.textContent = campo.value.length + '/' + maximo; }
    campo.addEventListener('input', actualizar);
    actualizar();
  }

  Pulso.validation = { conectar: conectar, validarCampo: validarCampo, contador: contador };
})(window.Pulso = window.Pulso || {});
