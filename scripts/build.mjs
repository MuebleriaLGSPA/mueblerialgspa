/* ============================================================
   BUILD DEL SITIO (lo ejecuta Netlify en cada publicación)
   ------------------------------------------------------------
   Uso local:  npm run build   → genera la carpeta dist/
   Los archivos fuente NO se modifican (se siguen editando igual,
   por ejemplo en Antigravity). dist/ es la versión optimizada.

   Qué hace:
   1. Copia el sitio a dist/.
   2. Minifica styles.css, app.js, proyectos-data.js, visor-fotos.js y
      dimensiones.js, y los guarda en dist/static/ con un nombre que
      incluye su huella (ej. app.3f9a1c2e.js). Así el navegador puede
      guardarlos en caché por un año y, al cambiarlos, descarga el nuevo.
   3. Agrega ?v=<huella> a las imágenes optimizadas y a las fuentes, por
      el mismo motivo.
   4. Incrusta en el HTML el CSS que usa la página (CSS crítico) y carga
      el resto sin bloquear la primera pantalla.

   5. Verifica que existan en dist/ todas las imágenes que la página puede
      pedir (HTML, CSS, JS, srcset y fotos de proyectos-data.js). Si falta
      alguna, el build falla y Netlify mantiene publicado el sitio anterior.

   NO se tocan: el Meta Pixel, el cotizador (cotizador-motor.js, precios.json
   y los scripts del cotizador dentro de index.html) ni el formulario.
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import * as esbuild from 'esbuild';
import Beasties from 'beasties';
import { verificarImagenes } from './verificar-imagenes.mjs';

const RAIZ = process.cwd();
const DIST = path.join(RAIZ, 'dist');
const huella = (buf) => crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);

// Lo que NO se publica (herramientas, fuentes del build, documentación)
const EXCLUIR = new Set(['dist', 'node_modules', 'scripts', '.git', '.vscode', 'Referencia',
    'package.json', 'package-lock.json', 'netlify.toml', '.gitignore', 'GALERIA.md', 'README.md']);

// 1) Copia limpia a dist/
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST);
for (const entrada of fs.readdirSync(RAIZ)) {
    if (EXCLUIR.has(entrada)) continue;
    fs.cpSync(path.join(RAIZ, entrada), path.join(DIST, entrada), { recursive: true });
}

// 2) Minificación + nombres con huella en dist/static/
fs.mkdirSync(path.join(DIST, 'static'), { recursive: true });
const renombrados = {}; // ruta original -> ruta nueva (absoluta desde la raíz del sitio)

async function minificar(origen, { formato = 'iife', transformar = (t) => t } = {}) {
    const esCss = origen.endsWith('.css');
    let codigo = transformar(fs.readFileSync(path.join(RAIZ, origen), 'utf8'));
    const res = await esbuild.transform(codigo, {
        loader: esCss ? 'css' : 'js',
        minify: true,
        target: esCss ? ['chrome90', 'safari14', 'firefox90'] : 'es2019',
        format: esCss ? undefined : (formato === 'esm' ? 'esm' : undefined),
        legalComments: 'inline', // conserva los avisos de licencia /*! ... */
        charset: 'utf8',
    });
    const ext = path.extname(origen);
    const nombre = `${path.basename(origen, ext)}.${huella(res.code)}${ext}`;
    fs.writeFileSync(path.join(DIST, 'static', nombre), res.code);
    fs.rmSync(path.join(DIST, origen)); // no dejar la versión sin minificar publicada
    renombrados[origen] = `/static/${nombre}`;
    return { nombre, antes: Buffer.byteLength(codigo), despues: Buffer.byteLength(res.code) };
}

// Versión (?v=) de fuentes: huella del archivo
const versionArchivo = (rel) => huella(fs.readFileSync(path.join(RAIZ, rel)));

// Versión de imágenes optimizadas: la del original, escrita por scripts/imagenes.mjs
globalThis.window = {};
new Function(fs.readFileSync(path.join(RAIZ, 'assets/optimizadas/dimensiones.js'), 'utf8'))();
const DIMS = globalThis.window.DIMENSIONES_IMAGENES;
const conVersionImagenes = (texto) => texto.replace(/assets\/optimizadas\/([A-Za-z0-9_-]+?)-(\d+)w\.(avif|webp)(?!\?v=)/g,
    (m, base) => (DIMS[base]?.v ? `${m}?v=${DIMS[base].v}` : m));
const conVersionFuentes = (texto) => texto.replace(/assets\/fuentes\/([A-Za-z0-9_-]+\.woff2)(?!\?v=)/g,
    (m, archivo) => `${m}?v=${versionArchivo(`assets/fuentes/${archivo}`)}`);

const informe = [];
// CSS: rutas relativas -> absolutas (el archivo pasa a /static/)
informe.push(['styles.css', await minificar('styles.css', {
    transformar: (t) => conVersionFuentes(t).replace(/url\((["']?)assets\//g, 'url($1/assets/'),
})]);
informe.push(['assets/optimizadas/dimensiones.js', await minificar('assets/optimizadas/dimensiones.js')]);
informe.push(['proyectos-data.js', await minificar('proyectos-data.js')]);
// visor-fotos.js es un módulo: su import de PhotoSwipe pasa a ruta absoluta
informe.push(['visor-fotos.js', await minificar('visor-fotos.js', {
    formato: 'esm',
    transformar: (t) => t.replace(/'\.\/vendor\//g, "'/vendor/").replace(/(href\s*=\s*)'vendor\//g, "$1'/vendor/"),
})]);
// app.js importa el visor: se apunta al nombre con huella
informe.push(['app.js', await minificar('app.js', {
    transformar: (t) => t.replace('import("./visor-fotos.js")', `import("${renombrados['visor-fotos.js']}")`),
})]);

// 3) HTML: nuevas rutas + versiones de imágenes y fuentes
function actualizarHtml(rel, prefijo) {
    const ruta = path.join(DIST, rel);
    let html = fs.readFileSync(ruta, 'utf8');
    for (const [orig, nuevo] of Object.entries(renombrados)) {
        html = html.split(`"${prefijo}${orig}"`).join(`"${nuevo}"`);
    }
    html = conVersionFuentes(conVersionImagenes(html));
    fs.writeFileSync(ruta, html);
    return html;
}
actualizarHtml('index.html', '');
actualizarHtml('politica-de-privacidad/index.html', '../');

// 4) CSS crítico en línea (solo en la portada) y el resto sin bloquear
const beasties = new Beasties({
    path: DIST,
    publicPath: '/',
    preload: 'media',        // <link media="print" onload="this.media='all'"> + <noscript>
    pruneSource: false,      // el CSS completo sigue disponible para lo que genera JavaScript
    reduceInlineStyles: false, // no recortar los <style> del HTML (incluyen reglas para elementos creados por JS: mapa, cotizador)
    inlineFonts: true,       // los @font-face van en el CSS crítico para que el título use su fuente desde el inicio
    preloadFonts: false,     // la fuente principal ya tiene su propio preload
    keyframes: 'critical',
    // La galería la genera JavaScript: se incluyen sus estilos base para que no cambie de tamaño al llegar el CSS completo
    allowRules: [/tarjeta-proyecto/, /portafolio-grid/, /carousel-(track|dots|dot|container|nav-btn)/, /render-(item|img|info-overlay)/, /renders-(grid|carrusel)/, /filtro-chip/, /proyecto-card/],
    compress: true,
    logLevel: 'warn',
});
const indice = path.join(DIST, 'index.html');
const conCritico = await beasties.process(fs.readFileSync(indice, 'utf8'));
fs.writeFileSync(indice, conCritico);

// Comprobación: ninguna referencia a los archivos renombrados debe quedar sin actualizar
for (const rel of ['index.html', 'politica-de-privacidad/index.html']) {
    const html = fs.readFileSync(path.join(DIST, rel), 'utf8');
    for (const orig of Object.keys(renombrados)) {
        if (new RegExp(`(src|href)="(\\.\\./)?${orig.replace(/\./g, '\\.')}"`).test(html)) {
            throw new Error(`Build: ${rel} todavía referencia ${orig}`);
        }
    }
}

// 5) Toda imagen referenciada debe existir en dist/ (si no, el build falla y no se publica)
const verificacion = verificarImagenes(DIST);
if (verificacion.errores.length) {
    throw new Error(`Build: faltan ${verificacion.errores.length} imágenes en dist/:\n  ` + verificacion.errores.join('\n  '));
}

console.log('Build listo en dist/');
console.log(`  Imágenes verificadas: todas existen (${verificacion.revisadas} fotos de galería + referencias en HTML, CSS y JS)`);
for (const [archivo, r] of informe) {
    console.log(`  ${archivo.padEnd(36)} ${(r.antes / 1024).toFixed(1).padStart(6)} KB -> ${(r.despues / 1024).toFixed(1).padStart(6)} KB  (static/${r.nombre})`);
}
console.log(`  index.html (con CSS crítico)          ${(Buffer.byteLength(conCritico) / 1024).toFixed(1)} KB`);
