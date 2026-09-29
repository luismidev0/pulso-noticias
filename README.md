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

## Créditos de las imágenes

Fotografías reales obtenidas de [Wikimedia Commons](https://commons.wikimedia.org/) con licencias libres:

| Archivo | Autor | Licencia | Fuente |
|---|---|---|---|
| `assets/img/app-calidad-aire.jpg` | Intel Free Press | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Air_Quality_Sensor_Provides_Big_Data_for_Visualization.jpg) |
| `assets/img/becas-energias.jpg` | ArnoldReinhold | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Solar_panels_awaiting_installation.agr.jpg) |
| `assets/img/bibliotecas-digitales.jpg` | Aigner Ronja, Kohlmeier Michelle | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:Tabletunterricht_06.jpg) |
| `assets/img/calendario-academico.jpg` | Harrison Keely | CC BY 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Students_in_a_high_school_classroom_in_North_Carolina_02.jpg) |
| `assets/img/comercio-minorista.jpg` | C.puello | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Tienda_de_Artesan%C3%ADas,_sus_colores_y_contraste_de_texturas_hacen_de_esta_toma_algo_magico..jpg) |
| `assets/img/fibra-optica.jpg` | Rubin Observatory/NSF/AURA | CC BY 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Fiber_optic_cable_installation_(rubin-20170124-101126).jpg) |
| `assets/img/hero.jpg` | Bernard Gagnon | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Capitalio_National_de_Colombia,_Bogot%C3%A1.jpg) |
| `assets/img/mercados-campesinos.jpg` | LorenaRoblesH | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Plaza_de_Mercado_de_Girardot.jpg) |
| `assets/img/ocupacion-hotelera.jpg` | Bernard Gagnon | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Bocagrande,_Cartagena_02.jpg) |
| `assets/img/pago-qr.jpg` | PattayaPatrol | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:DZ3_0627_A_night_market_stall_in_Sattahip_Thailand_-_vendors_weigh_durians_as_a_young_buyer_uses_his_phone_to_scan_or_pay_while_another_customer_captures_the_scene_on_their_smartphone.jpg) |
| `assets/img/red-5g.jpg` | Tony Webster | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Cellular_5G_Equipment_-_Cell_Tower_Antennas.jpg) |
| `assets/img/rutas-senderismo.jpg` | Jedidiahhorne | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:WLE2026_CO_-_Senderismo_en_el_P%C3%A1ramo_de_Guerrero_(87).jpg) |
| `assets/img/vuelos-nacionales.jpg` | Wilfredor | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:PR-AJE,_Airbus_A320_of_Avianca_Brazil_at_S%C3%A3o_Paulo-Guarulhos_International_Airport,_2019.jpg) |
