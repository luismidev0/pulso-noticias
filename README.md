# Pulso · Plataforma web de noticias

Portal de noticias locales organizado en cuatro categorías: educación, tecnología, turismo y comercio.
Proyecto del módulo **Desarrollo de Front-end** (Politécnico Grancolombiano, grupo B02).

**Autor:** Luis Miguel Álvarez Marín

- **Entrega 3 (esta versión):** aplicación en **Angular**, con componentes, servicios, enrutamiento y data binding.
- **Entrega 2:** versión en HTML, CSS y JavaScript plano. Está guardada en el tag [`entrega-2`](https://github.com/luismidev0/pulso-noticias/tree/entrega-2).

**Despliegue:** https://luismidev0.github.io/pulso-noticias/

## Funcionalidades 

| Funcionalidad | Ruta | Implementación |
|---|---|---|
| Página de inicio | `/` | Bienvenida, destacadas (con esqueleto, estado vacío y error con «Reintentar»), sección informativa, testimonios y llamado a la acción |
| Catálogo de noticias | `/noticias` | Búsqueda sin tildes (espera de 250 ms), chips de categoría, orden, 9 por página; el estado vive en `?cat=&q=&orden=&pagina=` |
| Detalle de la noticia | `/noticias/:id` | Artículo por bloques, favorito, compartir, eliminar con modal, relacionadas y estado 404 |
| Favoritos | `/favoritos` | Guardar y quitar desde cualquier tarjeta; persistencia en `localStorage` y opción de deshacer |
| Contacto | `/contacto` | Formulario reactivo, estado «Enviando...», confirmación, error sin conexión y mapa de OpenStreetMap |
| Mini CRUD | `/publicar`, `/noticias/:id` | Crear noticias con imagen opcional (reducida a 1200 px) y eliminarlas con confirmación |
| Página no encontrada | `**` | Estado 404 con enlace al inicio |

## Tecnologías

- Angular 22 con componentes **standalone**, Angular Router (carga diferida por página) y TypeScript estricto.
- Signals (`signal`, `computed`, `effect`, `input`/`output`) para el estado; RxJS solo para HTTP y temporizadores.
- Reactive Forms con validadores propios que conservan los mensajes de la versión anterior.
- CSS propio (variables, Grid, Flexbox, nomenclatura BEM), sin librerías de interfaz.
- `HttpClient` para cargar `public/data/noticias.json` y `localStorage` para los datos del usuario.

## Cómo ejecutarlo

Requiere Node.js `^22.22.3`, `^24.15.0` o superior.

```bash
npm install
ng serve          # http://localhost:4200
```

(si no tienes Angular CLI global: `npx ng serve`)

## Cómo construirlo

```bash
npx ng build                                  # salida en dist/pulso-noticias/browser
npx ng build --base-href /pulso-noticias/     # versión para GitHub Pages
```

## Despliegue

El workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) construye con `--base-href /pulso-noticias/`, copia `index.html` como `404.html` (para que recargar una ruta como `/noticias/algo` no dé error) y publica con las acciones oficiales de GitHub Pages. Se ejecuta al subir cambios a `main`.

## Estructura del proyecto

```
pulso-noticias/
├── .github/workflows/deploy.yml     Despliegue en GitHub Pages
├── docs/capturas/                   Capturas a 1440 px y 390 px
├── public/                          Archivos estáticos (se copian tal cual)
│   ├── data/noticias.json           Catálogo inicial
│   └── assets/
│       ├── img/                     Imágenes de las noticias
│       └── fonts/                   Fuentes locales (Inter y Playfair Display) y fonts.css
└── src/
    ├── index.html
    ├── styles.css                   Sistema de diseño y componentes (BEM)
    └── app/
        ├── app.ts                   Componente raíz (encabezado, <router-outlet>, pie, toast y modal)
        ├── app.routes.ts            Rutas
        ├── app.config.ts            Configuración (Router y HttpClient)
        ├── core/
        │   ├── models/              Interfaces: Noticia, Categoria, BloqueCuerpo, Mensaje
        │   └── services/            Noticias, Favoritos, Toast y Confirmar (+ acceso seguro a localStorage)
        ├── shared/
        │   ├── components/          news-card, skeleton-card, empty-state, toast, confirm-modal,
        │   │                        header, footer, icon, media, field-error
        │   ├── forms/               Validadores y estado de validación de los formularios
        │   ├── pipes/               fecha-corta
        │   └── utils/               Reducción de imágenes con canvas
        └── pages/                   home, noticias, detalle, favoritos, publicar, contacto, no-encontrada
```

## Datos del usuario

Todo se guarda en el navegador con estas claves de `localStorage` (las mismas de la entrega 2):

- `pulso:favoritos`: ids de las noticias guardadas
- `pulso:creadas`: noticias publicadas desde *Publicar*
- `pulso:eliminadas`: ids de noticias del JSON eliminadas
- `pulso:mensajes`: mensajes enviados desde *Contacto*

Para volver al estado inicial, borra los datos del sitio desde las herramientas de desarrollador del navegador.

## Créditos de las imágenes

Fotografías obtenidas de [Wikimedia Commons](https://commons.wikimedia.org/) con licencias libres:

| Archivo | Autor | Licencia | Fuente |
|---|---|---|---|
| `public/assets/img/app-calidad-aire.jpg` | Intel Free Press | CC BY-SA 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Air_Quality_Sensor_Provides_Big_Data_for_Visualization.jpg) |
| `public/assets/img/becas-energias.jpg` | ArnoldReinhold | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Solar_panels_awaiting_installation.agr.jpg) |
| `public/assets/img/bibliotecas-digitales.jpg` | Aigner Ronja, Kohlmeier Michelle | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:Tabletunterricht_06.jpg) |
| `public/assets/img/calendario-academico.jpg` | Harrison Keely | CC BY 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Students_in_a_high_school_classroom_in_North_Carolina_02.jpg) |
| `public/assets/img/comercio-minorista.jpg` | C.puello | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Tienda_de_Artesan%C3%ADas,_sus_colores_y_contraste_de_texturas_hacen_de_esta_toma_algo_magico..jpg) |
| `public/assets/img/fibra-optica.jpg` | Rubin Observatory/NSF/AURA | CC BY 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Fiber_optic_cable_installation_(rubin-20170124-101126).jpg) |
| `public/assets/img/hero.jpg` | Bernard Gagnon | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Capitalio_National_de_Colombia,_Bogot%C3%A1.jpg) |
| `public/assets/img/mercados-campesinos.jpg` | LorenaRoblesH | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Plaza_de_Mercado_de_Girardot.jpg) |
| `public/assets/img/ocupacion-hotelera.jpg` | Bernard Gagnon | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Bocagrande,_Cartagena_02.jpg) |
| `public/assets/img/pago-qr.jpg` | PattayaPatrol | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:DZ3_0627_A_night_market_stall_in_Sattahip_Thailand_-_vendors_weigh_durians_as_a_young_buyer_uses_his_phone_to_scan_or_pay_while_another_customer_captures_the_scene_on_their_smartphone.jpg) |
| `public/assets/img/red-5g.jpg` | Tony Webster | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Cellular_5G_Equipment_-_Cell_Tower_Antennas.jpg) |
| `public/assets/img/rutas-senderismo.jpg` | Jedidiahhorne | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:WLE2026_CO_-_Senderismo_en_el_P%C3%A1ramo_de_Guerrero_(87).jpg) |
| `public/assets/img/vuelos-nacionales.jpg` | Wilfredor | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:PR-AJE,_Airbus_A320_of_Avianca_Brazil_at_S%C3%A3o_Paulo-Guarulhos_International_Airport,_2019.jpg) |
