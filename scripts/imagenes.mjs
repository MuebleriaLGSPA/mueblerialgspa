/* ============================================================
   GENERADOR DE IMÁGENES OPTIMIZADAS (AVIF + WebP)
   ------------------------------------------------------------
   Uso:   npm run imagenes
          npm run imagenes -- --forzar   (regenera todo)

   Qué hace:
   - Lee cada foto original (.jpg, .jpeg, .png) de la carpeta assets/.
     Los originales NO se modifican.
   - Genera versiones AVIF y WebP en assets/optimizadas/ con anchos de
     480, 800, 1200 y 1600 px, más una miniatura de 160 px (nunca agranda:
     si la foto mide 1024 px, se generan 160, 480, 800 y 1024).
   - Escribe assets/optimizadas/dimensiones.js con el ancho/alto de cada
     foto y los anchos disponibles (lo usa el sitio para srcset,
     width/height y el visor de fotos).
   - Solo procesa fotos nuevas o modificadas (compara fechas).

   Para agregar una foto nueva: cópiala en assets/ (ej. assets/pirque1.jpg)
   y corre "npm run imagenes". Ver GALERIA.md.
   ============================================================ */

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ORIGEN = 'assets';
const DESTINO = path.join('assets', 'optimizadas');
const ANCHOS = [480, 800, 1200, 1600];
// Miniatura de 160 px para todas las fotos (tira de miniaturas del visor)
const MINIATURA = 160;
// Anchos adicionales para imágenes que se muestran pequeñas (el logo del encabezado mide ~50 px)
const ANCHOS_EXTRA = { logo: [320] };
const CALIDAD = { avif: { quality: 50, effort: 4 }, webp: { quality: 76, effort: 5 } };
const forzar = process.argv.includes('--forzar');

fs.mkdirSync(DESTINO, { recursive: true });

// Originales: .jpg/.jpeg/.png directamente en assets/ (no subcarpetas).
// Si una foto tiene dos originales (ej. logo.jpg y logo.png), se usa el que coincide con
// las dimensiones del .webp que ya publica el sitio; si no hay .webp, se prefiere el PNG
// (sin pérdida y con transparencia).
// Imágenes de ejemplo (generadas, no son trabajos reales) que comparten nombre con una
// foto real: nunca se usan como original. Se conservan en assets/ por si se necesitan.
const EJEMPLOS_NO_USAR = new Set(['temuco1.png', 'olivar1.png', 'shaker1.png']);
const archivosOrigen = fs.readdirSync(ORIGEN).filter(f => /\.(jpe?g|png)$/i.test(f) && !EJEMPLOS_NO_USAR.has(f)).sort();
const porBase = new Map();
for (const f of archivosOrigen) {
    const base = f.replace(/\.(jpe?g|png)$/i, '');
    porBase.set(base, [...(porBase.get(base) || []), f]);
}

async function elegirOriginal(base, candidatos) {
    if (candidatos.length === 1) return candidatos[0];
    const webp = path.join(ORIGEN, `${base}.webp`);
    if (fs.existsSync(webp)) {
        const ref = await sharp(webp).metadata();
        for (const c of candidatos) {
            const m = await sharp(path.join(ORIGEN, c)).metadata();
            if (m.width === ref.width && m.height === ref.height) return c;
        }
    }
    return candidatos.find(c => /\.png$/i.test(c)) || candidatos[0];
}

const originales = [];
for (const [base, candidatos] of porBase) originales.push(await elegirOriginal(base, candidatos));

// Anchos a generar para una foto de ancho "w": los estándar menores que w + el ancho original (tope 1600)
function anchosPara(w, base) {
    const lista = [MINIATURA, ...(ANCHOS_EXTRA[base] || []), ...ANCHOS].filter(a => a < w);
    lista.push(Math.min(w, ANCHOS[ANCHOS.length - 1]));
    return [...new Set(lista)].sort((a, b) => a - b);
}

const dimensiones = {};
let generadas = 0, omitidas = 0;

for (const archivo of originales) {
    const base = archivo.replace(/\.(jpe?g|png)$/i, '');
    const rutaOrigen = path.join(ORIGEN, archivo);
    const fechaOrigen = fs.statSync(rutaOrigen).mtimeMs;

    // rotate() respeta la orientación EXIF de fotos tomadas con celular
    const meta = await sharp(rutaOrigen).rotate().metadata();
    const esVertical = (meta.orientation || 1) >= 5;
    const w = esVertical ? meta.height : meta.width;
    const h = esVertical ? meta.width : meta.height;
    const anchos = anchosPara(w, base);
    // v = huella del original: cambia si se reemplaza la foto, así el navegador no usa una copia vieja
    const v = crypto.createHash('sha1').update(fs.readFileSync(rutaOrigen)).digest('hex').slice(0, 8);
    dimensiones[base] = { w, h, anchos, v };

    for (const ancho of anchos) {
        for (const formato of ['avif', 'webp']) {
            const salida = path.join(DESTINO, `${base}-${ancho}w.${formato}`);
            if (!forzar && fs.existsSync(salida) && fs.statSync(salida).mtimeMs >= fechaOrigen) { omitidas++; continue; }
            await sharp(rutaOrigen)
                .rotate()
                .resize({ width: ancho, withoutEnlargement: true })
                .toFormat(formato, CALIDAD[formato])
                .toFile(salida);
            generadas++;
        }
    }
}

// Limpieza: borra variantes de assets/optimizadas/ que ya no correspondan a ningún original
// (ej. si se borró o reemplazó una foto por otra más pequeña)
const esperados = new Set(['dimensiones.js']);
for (const [base, d] of Object.entries(dimensiones)) {
    for (const a of d.anchos) { esperados.add(`${base}-${a}w.avif`); esperados.add(`${base}-${a}w.webp`); }
}
let borrados = 0;
for (const f of fs.readdirSync(DESTINO)) {
    if (!esperados.has(f)) { fs.unlinkSync(path.join(DESTINO, f)); borrados++; }
}
if (borrados) console.log(`Variantes obsoletas eliminadas: ${borrados}`);

// Archivo de dimensiones para el sitio (script clásico: define window.DIMENSIONES_IMAGENES)
const contenido = `/* Archivo GENERADO por scripts/imagenes.mjs — no editar a mano.
   Ancho/alto original de cada foto, anchos disponibles en assets/optimizadas/ y
   versión (v) para que el navegador descargue de nuevo una foto reemplazada. */
window.DIMENSIONES_IMAGENES = ${JSON.stringify(dimensiones)};
`;
fs.writeFileSync(path.join(DESTINO, 'dimensiones.js'), contenido);

console.log(`Originales: ${originales.length} · Archivos generados: ${generadas} · Ya actualizados: ${omitidas}`);
