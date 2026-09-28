/* ============================================================
   VERIFICACIÓN DE IMÁGENES (se ejecuta al final de "npm run build")
   ------------------------------------------------------------
   Uso manual:  npm run verificar   (requiere haber corrido npm run build)

   Hace fallar el build si alguna imagen que la página puede pedir
   NO existe en dist/. Revisa:
   1. Referencias escritas en el HTML (src, srcset, href, style, preload
      con imagesrcset), en el CSS (url(...)) y en el JavaScript publicado.
   2. Las fotos que la galería arma con JavaScript a partir de
      proyectos-data.js (PROYECTOS, DESTACADOS y RENDERS): cada foto debe
      estar en dimensiones.js y tener todos sus tamaños AVIF y WebP
      (tarjetas, carrusel, visor) y su miniatura de 160 px (visor).
   3. Que cada tamaño declarado en dimensiones.js exista en dist/.
   Así, una foto faltante se detecta antes de publicar y no aparece
   como una caja vacía en el sitio.
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const EXT_IMAGEN = /\.(avif|webp|png|jpe?g|gif|svg|ico)$/i;

function listar(dir) {
    const salida = [];
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) salida.push(...listar(p));
        else salida.push(p);
    }
    return salida;
}

// Convierte una referencia (relativa o absoluta, con ?v= o #) en ruta dentro de dist/
function aRutaDist(dist, archivoOrigen, ref) {
    const limpia = decodeURIComponent(ref.split(/[?#]/)[0]);
    if (limpia.startsWith('/')) return path.join(dist, limpia);
    return path.join(path.dirname(archivoOrigen), limpia);
}

// Referencias locales a imágenes dentro de un texto (HTML, CSS o JS)
function referenciasEnTexto(texto) {
    const refs = new Set();
    // src / href / srcset / imagesrcset / data-*: toma cada URL de la lista
    for (const m of texto.matchAll(/\b(?:src|href|srcset|imagesrcset|poster|content)\s*=\s*(["'])(.*?)\1/gis)) {
        for (const parte of m[2].split(',')) {
            const url = parte.trim().split(/\s+/)[0];
            if (url) refs.add(url);
        }
    }
    // url(...) en CSS o en atributos style
    for (const m of texto.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi)) refs.add(m[2].trim());
    // Rutas sueltas a assets/ dentro de JavaScript (sin partes armadas con ${...})
    for (const m of texto.matchAll(/["'`]((?:\.{0,2}\/)?assets\/[^"'`\s]+?)["'`]/g)) refs.add(m[1]);
    return [...refs].filter(u =>
        !/^(data:|https?:|\/\/|mailto:|tel:|#|javascript:)/i.test(u) &&
        !u.includes('${') &&
        EXT_IMAGEN.test(u.split(/[?#]/)[0]));
}

export function verificarImagenes(dist) {
    const errores = [];
    const archivos = listar(dist);

    // 1) Referencias escritas en HTML, CSS y JS publicados
    for (const archivo of archivos.filter(f => /\.(html|css|js|mjs)$/i.test(f))) {
        if (archivo.includes(`${path.sep}vendor${path.sep}`)) continue; // librerías de terceros sin imágenes propias
        const texto = fs.readFileSync(archivo, 'utf8');
        for (const ref of referenciasEnTexto(texto)) {
            if (!fs.existsSync(aRutaDist(dist, archivo, ref))) {
                errores.push(`${path.relative(dist, archivo)} → ${ref}`);
            }
        }
    }

    // 2) y 3) Galería generada con JavaScript: proyectos-data.js + dimensiones.js
    const estaticos = fs.readdirSync(path.join(dist, 'static'));
    const buscar = (prefijo) => estaticos.find(f => f.startsWith(prefijo) && f.endsWith('.js'));
    const contexto = { window: {} };
    vm.createContext(contexto);
    for (const prefijo of ['dimensiones.', 'proyectos-data.']) {
        const f = buscar(prefijo);
        if (!f) { errores.push(`falta static/${prefijo}*.js`); continue; }
        vm.runInContext(fs.readFileSync(path.join(dist, 'static', f), 'utf8'), contexto);
    }
    const dims = contexto.window.DIMENSIONES_IMAGENES || {};
    const existeOpt = (nombre) => fs.existsSync(path.join(dist, 'assets', 'optimizadas', nombre));

    for (const [base, d] of Object.entries(dims)) {
        for (const a of d.anchos) {
            for (const formato of ['avif', 'webp']) {
                if (!existeOpt(`${base}-${a}w.${formato}`)) errores.push(`dimensiones.js → assets/optimizadas/${base}-${a}w.${formato}`);
            }
        }
    }

    const fotosGaleria = [
        ...(contexto.window.PROYECTOS || []).flatMap(p => p.fotos.map(f => [`proyecto "${p.titulo}"`, f.archivo])),
        ...(contexto.window.DESTACADOS || []).map(f => ['destacados', f.archivo]),
        ...(contexto.window.RENDERS || []).map(f => ['renders', f.archivo]),
    ];
    for (const [donde, archivo] of fotosGaleria) {
        const d = dims[archivo];
        if (!d) { errores.push(`proyectos-data.js (${donde}) → "${archivo}" no está en dimensiones.js (¿falta el original en assets/ o correr npm run imagenes?)`); continue; }
        if (!d.anchos.some(a => a >= 480)) errores.push(`proyectos-data.js (${donde}) → "${archivo}" no tiene tamaños de 480 px o más`);
        if (!existeOpt(`${archivo}-160w.webp`)) errores.push(`proyectos-data.js (${donde}) → assets/optimizadas/${archivo}-160w.webp (miniatura del visor)`);
    }

    return { errores, revisadas: fotosGaleria.length };
}

// Ejecución directa: node scripts/verificar-imagenes.mjs
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const dist = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(dist)) { console.error('No existe dist/. Corre primero: npm run build'); process.exit(1); }
    const { errores, revisadas } = verificarImagenes(dist);
    if (errores.length) {
        console.error(`Imágenes faltantes en dist/ (${errores.length}):\n  ` + errores.join('\n  '));
        process.exit(1);
    }
    console.log(`Imágenes verificadas: todas existen en dist/ (${revisadas} fotos de galería + referencias en HTML, CSS y JS).`);
}
