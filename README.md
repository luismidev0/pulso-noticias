# Pulso · Plataforma web de noticias

Prototipo funcional del módulo **Desarrollo de Front-end** (Politécnico Grancolombiano, grupo B02).
Portal de noticias locales organizado en cuatro categorías: educación, tecnología, turismo y comercio.

**Autor:** Luis Miguel Álvarez Marín

## Funcionalidades

| Funcionalidad | Página | Implementación |
|---|---|---|
| Catálogo de noticias en tarjetas | `noticias.html` | Renderizado dinámico desde `data/noticias.json`, con búsqueda, filtro por categoría, orden y paginación |
| Detalle de la noticia | `detalle.html?id=…` | Artículo completo, noticias relacionadas, compartir y estado 404 |
| Favoritos | `favoritos.html` | Guardar y quitar desde cualquier tarjeta; persistencia con `localStorage` y opción de deshacer |
| Página de inicio | `index.html` | Bienvenida, destacadas dinámicas, sección informativa, testimonios y llamados a la acción |
| Contacto | `contacto.html` | Validaciones (obligatorios, correo válido, aceptación), estado de envío, confirmación y error |
| Mini CRUD | `publicar.html`, `detalle.html` | Crear noticias con imagen opcional; eliminar con confirmación en un modal |

## Estructura del proyecto

```
pulso-noticias/
├── index.html            Inicio
├── noticias.html         Listado
├── detalle.html          Detalle (recibe ?id=)
├── favoritos.html        Favoritos
├── publicar.html         Crear y eliminar noticias
├── contacto.html         Formulario de contacto
├── css/
│   ├── fonts.css         Fuentes locales (Inter y Playfair Display)
│   └── styles.css        Sistema de diseño y componentes (BEM)
├── js/
│   ├── icons.js          Íconos SVG
│   ├── store.js          Datos: JSON + localStorage (favoritos, CRUD)
│   ├── ui.js             Componentes: tarjeta, avisos, modal, estados
│   ├── validation.js     Validación de formularios
│   └── pages/            Un script por página
├── data/
│   ├── noticias.json          Catálogo inicial
│   └── noticias.fallback.js   Copia para abrir sin servidor (file://)
└── assets/
    ├── img/              Imágenes de las noticias
    └── fonts/            Archivos de fuentes
```

## Cómo ejecutarlo

No requiere instalación ni dependencias.

- **Opción 1:** abrir `index.html` directamente en el navegador. Funciona gracias a la copia de respaldo del JSON.
- **Opción 2 (recomendada):** servirlo con un servidor local, por ejemplo con la extensión *Live Server* de VS Code, o con:

  ```bash
  python -m http.server 8000
  ```

  y abrir `http://localhost:8000`.

## Tecnologías

HTML5 semántico, CSS3 (variables, Grid, Flexbox, nomenclatura BEM), JavaScript sin frameworks (ES5 compatible), JSON local, `localStorage` y `sessionStorage`.

## Datos del usuario

Todo se guarda en el navegador con estas claves de `localStorage`:

- `pulso:favoritos`: ids de las noticias guardadas
- `pulso:creadas`: noticias publicadas desde *Publicar*
- `pulso:eliminadas`: ids de noticias del JSON eliminadas
- `pulso:mensajes`: mensajes enviados desde *Contacto*

Para volver al estado inicial, borra los datos del sitio desde las herramientas de desarrollador del navegador.

## Créditos de imágenes

Las fotografías son imágenes de referencia de [Unsplash](https://unsplash.com/license), obtenidas a través de [Lorem Picsum](https://picsum.photos/), y se usan solo con fines académicos.
