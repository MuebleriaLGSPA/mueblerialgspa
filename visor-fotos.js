/* ============================================================
   VISOR DE FOTOS (pantalla completa) — MUEBLERIALG SPA
   ------------------------------------------------------------
   Módulo que app.js carga SOLO cuando el cliente abre una galería
   (import dinámico), para no sumar peso a la carga inicial.

   Usa PhotoSwipe 5.4.4 (MIT, incluido en vendor/ con versión fija):
   - Celular: deslizar para pasar foto, pellizcar para zoom,
     deslizar hacia abajo para cerrar.
   - Computador: flechas, clic y rueda del mouse para zoom,
     teclado (← → Esc).
   - Precarga solo la foto anterior y la siguiente.
   - Devuelve el foco al elemento que abrió el visor al cerrarlo.
   Agregado propio: contador "3 / 8", tira de miniaturas, ficha del
   proyecto, ayuda según dispositivo y botón "Cotiza un proyecto similar"
   al final de la galería.
   ============================================================ */

import PhotoSwipe from './vendor/photoswipe-5.4.4/photoswipe.esm.min.js';

const RUTA = 'assets/optimizadas/';
const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const esTactil = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

// CSS de PhotoSwipe: se agrega una sola vez, al abrir el visor por primera vez
function cargarCss() {
    if (document.getElementById('photoswipe-css')) return;
    const link = document.createElement('link');
    link.id = 'photoswipe-css';
    link.rel = 'stylesheet';
    link.href = 'vendor/photoswipe-5.4.4/photoswipe.css';
    document.head.appendChild(link);
}

// ¿El navegador soporta AVIF? (imagen AVIF de 1x1 px). El visor usa un solo formato por foto.
const soportaAvif = new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img.width === 1);
    img.onerror = () => resolve(false);
    img.src = 'data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAG1pZjFhdmlmbWlhZgAAANZtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAACJpbG9jAAAAAERAAAEAAQAAAAAA+gABAAAAAAAAAB0AAAAjaWluZgAAAAAAAQAAABVpbmZlAgAAAAABAABhdjAxAAAAAA5waXRtAAAAAAABAAAAVmlwcnAAAAA4aXBjbwAAAAxhdjFDgSACAAAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAABZpcG1hAAAAAAAAAAEAAQOBAgMAAAAlbWRhdBIACgc4AAaQENBpMhAcQmLk4AAWAACQNY48fohQ';
});

const escapar = (t = '') => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * Abre el visor.
 * @param {Object} opciones
 * @param {Array<{archivo:string, alt:string}>} opciones.fotos  Fotos de la galería (en orden)
 * @param {number} [opciones.indice=0]   Foto con la que se abre
 * @param {Object} [opciones.ficha]      Datos del proyecto: titulo, etiqueta, descripcion, materiales, herrajes, dimensiones, terminacion
 */
export async function abrirVisor({ fotos, indice = 0, ficha = null }) {
    cargarCss();
    const formato = (await soportaAvif) ? 'avif' : 'webp';
    const dims = window.DIMENSIONES_IMAGENES || {};

    const dataSource = fotos.map(f => {
        const d = dims[f.archivo] || { w: 1024, h: 1024, anchos: [480] };
        // Solo los tamaños grandes: la miniatura de 160 px no sirve en pantalla completa
        const anchos = d.anchos.filter(a => a >= 480);
        const mayor = anchos[anchos.length - 1];
        const ver = d.v ? `?v=${d.v}` : ''; // versión de la foto (caché larga segura)
        return {
            src: `${RUTA}${f.archivo}-${mayor}w.${formato}${ver}`,
            srcset: anchos.map(a => `${RUTA}${f.archivo}-${a}w.${formato}${ver} ${a}w`).join(', '),
            msrc: `${RUTA}${f.archivo}-160w.webp${ver}`,  // se muestra mientras carga la foto grande
            width: d.w,
            height: d.h,
            alt: f.alt,
        };
    });

    const total = dataSource.length;
    const pswp = new PhotoSwipe({
        dataSource,
        index: indice,
        bgOpacity: 1, // fondo negro sólido (con transparencia se distraía con la página de atrás)
        wheelToZoom: true,
        preload: [1, 1],
        loop: false,
        showHideAnimationType: reducirMovimiento ? 'none' : 'fade',
        showAnimationDuration: reducirMovimiento ? 0 : 250,
        hideAnimationDuration: reducirMovimiento ? 0 : 200,
        indexIndicatorSep: ' / ',
        closeTitle: 'Cerrar (Esc)',
        zoomTitle: 'Ampliar',
        arrowPrevTitle: 'Foto anterior',
        arrowNextTitle: 'Foto siguiente',
        errorMsg: 'No se pudo cargar la foto',
        // Espacio inferior para la ficha y la tira de miniaturas
        paddingFn: (viewport) => ({ top: 50, bottom: total > 1 ? (viewport.x < 768 ? 150 : 170) : 90, left: 0, right: 0 }),
    });

    pswp.on('uiRegister', () => {
        // Ficha del proyecto (título, etiqueta y detalles desplegables)
        pswp.ui.registerElement({
            name: 'ficha',
            appendTo: 'root',
            onInit: (el) => {
                el.className = 'visor-ficha';
                if (!ficha) { el.hidden = true; return; }
                const filas = [['Materiales', ficha.materiales], ['Herrajes', ficha.herrajes], ['Dimensiones', ficha.dimensiones], ['Terminación', ficha.terminacion]]
                    .filter(([, v]) => v)
                    .map(([k, v]) => `<li><strong>${k}:</strong> ${escapar(v)}</li>`).join('');
                el.innerHTML = `
                    <p class="visor-ficha-titulo">${escapar(ficha.titulo)}${ficha.etiqueta ? ` <span>· ${escapar(ficha.etiqueta)}</span>` : ''}</p>
                    ${(ficha.descripcion || filas) ? `<details class="visor-ficha-detalles">
                        <summary>Ver detalles del proyecto</summary>
                        ${ficha.descripcion ? `<p>${escapar(ficha.descripcion)}</p>` : ''}
                        ${filas ? `<ul>${filas}</ul>` : ''}
                    </details>` : ''}`;
            },
        });

        // Tira de miniaturas
        pswp.ui.registerElement({
            name: 'miniaturas',
            appendTo: 'root',
            onInit: (el) => {
                el.className = 'visor-miniaturas';
                if (total < 2) { el.hidden = true; return; }
                el.setAttribute('role', 'group');
                el.setAttribute('aria-label', 'Miniaturas');
                el.innerHTML = fotos.map((f, i) => `
                    <button type="button" class="visor-miniatura" data-i="${i}" aria-label="Ver foto ${i + 1} de ${total}">
                        <img src="${RUTA}${f.archivo}-160w.webp${(dims[f.archivo] || {}).v ? '?v=' + dims[f.archivo].v : ''}" alt="" width="64" height="64" loading="lazy" decoding="async">
                    </button>`).join('');
                el.addEventListener('click', (e) => {
                    const b = e.target.closest('.visor-miniatura');
                    if (b) pswp.goTo(Number(b.dataset.i));
                });
                const marcar = () => {
                    el.querySelectorAll('.visor-miniatura').forEach((b, i) => {
                        const activa = i === pswp.currIndex;
                        b.classList.toggle('activa', activa);
                        b.setAttribute('aria-current', activa ? 'true' : 'false');
                        if (activa) b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reducirMovimiento ? 'auto' : 'smooth' });
                    });
                };
                pswp.on('change', marcar);
                marcar();
            },
        });

        // Botón "Cotiza un proyecto similar": visible en la última foto
        pswp.ui.registerElement({
            name: 'cotizar',
            appendTo: 'root',
            onInit: (el) => {
                el.className = 'visor-cotizar';
                el.innerHTML = '<a href="#quote-calculator" class="btn btn-gold">Cotiza un proyecto similar <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>';
                el.querySelector('a').addEventListener('click', (e) => {
                    e.preventDefault();
                    pswp.close();
                    // Tras cerrar (y liberar el scroll) se lleva al cotizador
                    setTimeout(() => {
                        const destino = document.getElementById('quote-calculator');
                        if (destino) destino.scrollIntoView({ behavior: reducirMovimiento ? 'auto' : 'smooth' });
                        history.replaceState(null, '', '#quote-calculator');
                    }, reducirMovimiento ? 0 : 220);
                });
                const actualizar = () => el.classList.toggle('visible', pswp.currIndex === total - 1);
                pswp.on('change', actualizar);
                actualizar();
            },
        });

        // Ayuda según dispositivo (desaparece sola)
        pswp.ui.registerElement({
            name: 'ayuda',
            appendTo: 'root',
            onInit: (el) => {
                el.className = 'visor-ayuda';
                el.setAttribute('aria-hidden', 'true');
                el.textContent = esTactil
                    ? 'Toca dos veces o pellizca para ampliar · Desliza hacia abajo para cerrar'
                    : 'Clic o rueda del mouse para ampliar · Usa ← → para navegar';
                setTimeout(() => el.classList.add('oculta'), 3500);
            },
        });
    });

    // Bloquea el scroll del fondo mientras el visor está abierto (técnica compatible con iPhone):
    // se fija el body en su posición actual y al cerrar se vuelve exactamente al mismo punto.
    let posicion = 0;
    pswp.on('beforeOpen', () => {
        posicion = window.scrollY;
        const b = document.body.style;
        b.position = 'fixed';
        b.top = `-${posicion}px`;
        b.left = '0';
        b.right = '0';
        document.documentElement.classList.add('visor-abierto');
    });
    pswp.on('destroy', () => {
        const b = document.body.style;
        b.position = b.top = b.left = b.right = '';
        document.documentElement.classList.remove('visor-abierto');
        window.scrollTo({ top: posicion, behavior: 'instant' });
    });

    pswp.init();
    return pswp;
}
