# Galería de MUEBLERIALG SPA — cómo agregar proyectos y fotos

Toda la galería (portafolio con filtros, carrusel de destacados y renders 3D) se
genera a partir de **un solo archivo de datos**: `proyectos-data.js`.
Las fotos se optimizan con un script que genera versiones livianas para cada
tamaño de pantalla.

---

## Requisitos (una sola vez)

1. Tener **Node.js** instalado (versión 20 o superior): https://nodejs.org
2. Abrir una terminal en la carpeta del sitio y ejecutar:

   ```
   npm install
   ```

---

## Agregar un proyecto nuevo

### 1. Copiar las fotos originales en `assets/`

- Formato `.jpg` o `.png`, con el nombre del proyecto y un número:
  `assets/pirque1.jpg`, `assets/pirque2.jpg`, …
- Sin espacios, tildes ni ñ en el nombre del archivo.
- Idealmente de 1600 px o más en su lado mayor (el script nunca agranda fotos
  pequeñas; una foto de 1024 px se verá bien, pero no más nítida).
- La **primera foto** será la portada de la tarjeta.

### 2. Generar las versiones optimizadas

```
npm run imagenes
```

Esto crea en `assets/optimizadas/` las versiones AVIF y WebP (160, 480, 800,
1200 y 1600 px según el tamaño de la foto) y actualiza
`assets/optimizadas/dimensiones.js`. Solo procesa las fotos nuevas o
modificadas, así que es rápido. Los originales no se modifican.

### 3. Agregar la entrada en `proyectos-data.js`

Copia este bloque dentro de `window.PROYECTOS = [ … ]` (separado de los demás
con una coma) y completa los datos:

```js
{
    id: "cocina-pirque",              // único, sin espacios ni tildes
    categoria: "cocina",              // cocina | walk-in | closet | decorativo
    titulo: "Proyecto Pirque",
    etiqueta: "Cocina con Isla",
    descripcion: "Texto que se muestra al abrir 'Ver detalles del proyecto'.",
    materiales: "Melamina 18mm Roble / Cuarzo Blanco",   // opcional
    herrajes: "Bisagras cierre suave",                    // opcional
    dimensiones: "Largo: 4.0m",                           // opcional
    terminacion: "Melamina texturada mate",               // opcional
    fotos: [
        { archivo: "pirque1", alt: "Cocina en roble con isla de cuarzo blanco, Proyecto Pirque" },
        { archivo: "pirque2", alt: "Detalle de cajones con cierre suave, Proyecto Pirque" }
    ]
},
```

- `archivo` es el nombre de la foto **sin** extensión (`pirque1`, no `pirque1.jpg`).
- `alt` describe la foto para Google y para personas con lectores de pantalla:
  qué mueble se ve, material o color, y el proyecto.
- El orden de las fotos en la lista es el orden en el visor.
- La categoría decide en qué filtro aparece (Cocinas, Walk-in Closets, Closets
  o Decorativos). El filtro "Todos" muestra todo.

### 4. Revisar y publicar

- Para ver el sitio en tu computador: `npm run build` y abre `dist/index.html`
  con un servidor local (por ejemplo `npx serve dist`).
- Sube a GitHub **todos** los archivos nuevos o modificados:
  las fotos originales, la carpeta `assets/optimizadas/` (incluye
  `dimensiones.js`) y `proyectos-data.js`.
- Netlify publica automáticamente al actualizar la rama `main`.

---

## Destacados y renders

En el mismo archivo `proyectos-data.js`:

- `window.DESTACADOS`: fotos del carrusel "Proyectos Destacados", en orden.
  Cada una con `archivo` y `alt`.
- `window.RENDERS`: renders 3D, con `archivo`, `alt`, `titulo`, `resumen`
  (texto corto sobre la imagen) y los mismos detalles opcionales que un proyecto.

Las fotos siguen el mismo proceso: copiarlas en `assets/` y correr
`npm run imagenes`.

---

## Reemplazar o eliminar una foto

- **Reemplazar:** guarda la foto nueva con el mismo nombre en `assets/` y corre
  `npm run imagenes`. La versión (`v`) de esa foto cambia sola, así que los
  visitantes verán la nueva aunque tengan la anterior en caché.
- **Eliminar:** borra la entrada en `proyectos-data.js`, borra el original de
  `assets/` y corre `npm run imagenes` (elimina sus versiones optimizadas).

---

## Cómo se publica el sitio (build)

Netlify ejecuta `npm run build` en cada publicación (configurado en
`netlify.toml`) y publica la carpeta `dist/`, que es una copia optimizada:

- CSS y JavaScript minificados, con una huella en el nombre
  (`/static/app.3f9a1c2e.js`) para que el navegador los guarde un año en caché
  y descargue la versión nueva apenas cambian.
- El CSS necesario para la primera pantalla va dentro del HTML y el resto se
  carga sin bloquear.
- Imágenes y fuentes con `?v=<huella>` por el mismo motivo.

- **Verificación de imágenes:** al terminar, el build revisa que exista en
  `dist/` cada imagen que la página puede pedir (HTML, CSS, JavaScript,
  `srcset` y las fotos de `proyectos-data.js`, con todos sus tamaños y la
  miniatura del visor). Si falta alguna, el build falla con la lista de
  archivos y Netlify mantiene publicado el sitio anterior. También se puede
  correr a mano después de un build: `npm run verificar`.

**Los archivos fuente se editan igual que siempre** (`index.html`,
`styles.css`, `app.js`, `proyectos-data.js`). Nunca edites `dist/`: se borra y
se vuelve a crear en cada build.

El build **no modifica** el Meta Pixel, el cotizador (`cotizador-motor.js`,
`precios.json` y sus scripts en `index.html`) ni el formulario de agendar visita.

Si el build falla en Netlify, el sitio anterior sigue publicado; el detalle
del error aparece en el panel de Netlify, en *Deploys*.

---

## Fuentes

Las fuentes están en `assets/fuentes/` (woff2). Licencias y créditos en
`assets/fuentes/LICENCIAS.txt` (Gagalin requiere mantener el crédito a
oNline Web Fonts, CC BY 4.0).

## Visor de fotos

`visor-fotos.js` usa **PhotoSwipe 5.4.4** (licencia MIT), incluido en
`vendor/photoswipe-5.4.4/`. Se carga solo cuando alguien abre una galería.
# Galería de MUEBLERIALG SPA — cómo agregar proyectos y fotos

Toda la galería (portafolio con filtros, carrusel de destacados y renders 3D) se
genera a partir de **un solo archivo de datos**: `proyectos-data.js`.
Las fotos se optimizan con un script que genera versiones livianas para cada
tamaño de pantalla.

---

## Requisitos (una sola vez)

1. Tener **Node.js** instalado (versión 20 o superior): https://nodejs.org
2. Abrir una terminal en la carpeta del sitio y ejecutar:

   ```
   npm install
   ```

---

## Agregar un proyecto nuevo

### 1. Copiar las fotos originales en `assets/`

- Formato `.jpg` o `.png`, con el nombre del proyecto y un número:
  `assets/pirque1.jpg`, `assets/pirque2.jpg`, …
- Sin espacios, tildes ni ñ en el nombre del archivo.
- Idealmente de 1600 px o más en su lado mayor (el script nunca agranda fotos
  pequeñas; una foto de 1024 px se verá bien, pero no más nítida).
- La **primera foto** será la portada de la tarjeta.

### 2. Generar las versiones optimizadas

```
npm run imagenes
```

Esto crea en `assets/optimizadas/` las versiones AVIF y WebP (160, 480, 800,
1200 y 1600 px según el tamaño de la foto) y actualiza
`assets/optimizadas/dimensiones.js`. Solo procesa las fotos nuevas o
modificadas, así que es rápido. Los originales no se modifican.

### 3. Agregar la entrada en `proyectos-data.js`

Copia este bloque dentro de `window.PROYECTOS = [ … ]` (separado de los demás
con una coma) y completa los datos:

```js
{
    id: "cocina-pirque",              // único, sin espacios ni tildes
    categoria: "cocina",              // cocina | walk-in | closet | decorativo
    titulo: "Proyecto Pirque",
    etiqueta: "Cocina con Isla",
    descripcion: "Texto que se muestra al abrir 'Ver detalles del proyecto'.",
    materiales: "Melamina 18mm Roble / Cuarzo Blanco",   // opcional
    herrajes: "Bisagras cierre suave",                    // opcional
    dimensiones: "Largo: 4.0m",                           // opcional
    terminacion: "Melamina texturada mate",               // opcional
    fotos: [
        { archivo: "pirque1", alt: "Cocina en roble con isla de cuarzo blanco, Proyecto Pirque" },
        { archivo: "pirque2", alt: "Detalle de cajones con cierre suave, Proyecto Pirque" }
    ]
},
```

- `archivo` es el nombre de la foto **sin** extensión (`pirque1`, no `pirque1.jpg`).
- `alt` describe la foto para Google y para personas con lectores de pantalla:
  qué mueble se ve, material o color, y el proyecto.
- El orden de las fotos en la lista es el orden en el visor.
- La categoría decide en qué filtro aparece (Cocinas, Walk-in Closets, Closets
  o Decorativos). El filtro "Todos" muestra todo.

### 4. Revisar y publicar

- Para ver el sitio en tu computador: `npm run build` y abre `dist/index.html`
  con un servidor local (por ejemplo `npx serve dist`).
- Sube a GitHub **todos** los archivos nuevos o modificados:
  las fotos originales, la carpeta `assets/optimizadas/` (incluye
  `dimensiones.js`) y `proyectos-data.js`.
- Netlify publica automáticamente al actualizar la rama `main`.

---

## Destacados y renders

En el mismo archivo `proyectos-data.js`:

- `window.DESTACADOS`: fotos del carrusel "Proyectos Destacados", en orden.
  Cada una con `archivo` y `alt`.
- `window.RENDERS`: renders 3D, con `archivo`, `alt`, `titulo`, `resumen`
  (texto corto sobre la imagen) y los mismos detalles opcionales que un proyecto.

Las fotos siguen el mismo proceso: copiarlas en `assets/` y correr
`npm run imagenes`.

---

## Reemplazar o eliminar una foto

- **Reemplazar:** guarda la foto nueva con el mismo nombre en `assets/` y corre
  `npm run imagenes`. La versión (`v`) de esa foto cambia sola, así que los
  visitantes verán la nueva aunque tengan la anterior en caché.
- **Eliminar:** borra la entrada en `proyectos-data.js`, borra el original de
  `assets/` y corre `npm run imagenes` (elimina sus versiones optimizadas).

---

## Cómo se publica el sitio (build)

Netlify ejecuta `npm run build` en cada publicación (configurado en
`netlify.toml`) y publica la carpeta `dist/`, que es una copia optimizada:

- CSS y JavaScript minificados, con una huella en el nombre
  (`/static/app.3f9a1c2e.js`) para que el navegador los guarde un año en caché
  y descargue la versión nueva apenas cambian.
- El CSS necesario para la primera pantalla va dentro del HTML y el resto se
  carga sin bloquear.
- Imágenes y fuentes con `?v=<huella>` por el mismo motivo.

**Los archivos fuente se editan igual que siempre** (`index.html`,
`styles.css`, `app.js`, `proyectos-data.js`). Nunca edites `dist/`: se borra y
se vuelve a crear en cada build.

El build **no modifica** el Meta Pixel, el cotizador (`cotizador-motor.js`,
`precios.json` y sus scripts en `index.html`) ni el formulario de agendar visita.

Si el build falla en Netlify, el sitio anterior sigue publicado; el detalle
del error aparece en el panel de Netlify, en *Deploys*.

---

## Fuentes

Las fuentes están en `assets/fuentes/` (woff2). Licencias y créditos en
`assets/fuentes/LICENCIAS.txt` (Gagalin requiere mantener el crédito a
oNline Web Fonts, CC BY 4.0).

## Visor de fotos

`visor-fotos.js` usa **PhotoSwipe 5.4.4** (licencia MIT), incluido en
`vendor/photoswipe-5.4.4/`. Se carga solo cuando alguien abre una galería.
