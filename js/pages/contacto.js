/**
 * pages/contacto.js
 * Formulario de contacto con:
 *   - validaciones básicas (campos obligatorios, correo válido, aceptación)
 *   - estado "Enviando..." con el botón deshabilitado
 *   - mensaje de confirmación que reemplaza al formulario
 *   - banner de error que conserva los datos si el envío falla
 *
 * Como el proyecto no tiene servidor, el envío se simula: el mensaje se
 * guarda en localStorage después de una breve espera.
 */
(function (Pulso) {
  'use strict';

  var form, boton, alerta, confirmacion;

  /** Simula la petición al servidor; falla si no hay conexión a internet. */
  function enviarAlServidor(mensaje) {
    return new Promise(function (resolver, rechazar) {
      setTimeout(function () {
        if (!navigator.onLine) { rechazar(new Error('Sin conexión')); return; }
        Pulso.store.guardarMensaje(mensaje) ? resolver() : rechazar(new Error('No se pudo guardar'));
      }, 1200);
    });
  }

  function estadoEnviando(activo) {
    boton.disabled = activo;
    boton.innerHTML = activo ? '<span class="spinner" aria-hidden="true"></span>Enviando...' : 'Enviar mensaje';
  }

  function alEnviar() {
    alerta.classList.add('is-hidden');
    estadoEnviando(true);

    enviarAlServidor({
      nombre: form.nombre.value.trim(),
      correo: form.correo.value.trim(),
      asunto: form.asunto.value,
      mensaje: form.mensaje.value.trim()
    })
      .then(function () {
        // Confirmación: oculta el formulario y muestra el mensaje de éxito
        form.classList.add('is-hidden');
        confirmacion.classList.remove('is-hidden');
        confirmacion.focus();
      })
      .catch(function () {
        // Error: los datos permanecen en el formulario para reintentar
        alerta.classList.remove('is-hidden');
        estadoEnviando(false);
        alerta.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    form = document.getElementById('form-contacto');
    boton = document.getElementById('btn-enviar');
    alerta = document.getElementById('alerta-envio');
    confirmacion = document.getElementById('confirmacion');

    Pulso.validation.contador(document.getElementById('mensaje'), document.getElementById('contador-mensaje'), 500);
    Pulso.validation.conectar(form, alEnviar);
  });
})(window.Pulso = window.Pulso || {});
