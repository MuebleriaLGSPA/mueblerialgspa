/* ============================================================
   SISTEMA DE TOAST ALERTS
   ============================================================ */

function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const icon = type === "success"
        ? '<i class="fa-solid fa-circle-check"></i>'
        : '<i class="fa-solid fa-triangle-exclamation"></i>';

    toast.innerHTML = `
        ${icon}
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Slide-in animation
    setTimeout(() => {
        toast.classList.add("show");
    }, 50);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 4000);
}

/* ============================================================
   GALERÍA: PORTAFOLIO, DESTACADOS Y RENDERS
   Los datos vienen de proyectos-data.js (window.PROYECTOS,
   window.DESTACADOS, window.RENDERS) y las dimensiones de
   assets/optimizadas/dimensiones.js (generado por npm run imagenes).
   El visor de fotos (visor-fotos.js) se carga solo al abrir una galería.
============================================================ */

const RUTA_IMG = "assets/optimizadas/";

/* <picture> AVIF → WebP con srcset/sizes, width/height reales y carga diferida */
function pictureHTML(archivo, alt, sizes, clase = "") {
    const d = (window.DIMENSIONES_IMAGENES || {})[archivo];
    if (!d) return `<img src="${RUTA_IMG}${archivo}-480w.webp" alt="${alt}" class="${clase}" loading="lazy" decoding="async">`;
    const anchos = d.anchos.filter(a => a >= 480);
    const v = d.v ? `?v=${d.v}` : ""; // versión: cambia al reemplazar la foto (caché larga segura)
    const set = f => anchos.map(a => `${RUTA_IMG}${archivo}-${a}w.${f}${v} ${a}w`).join(", ");
    const respaldo = anchos.filter(a => a <= 800).pop() || anchos[0];
    return `<picture>` +
        `<source type="image/avif" srcset="${set("avif")}" sizes="${sizes}">` +
        `<source type="image/webp" srcset="${set("webp")}" sizes="${sizes}">` +
        `<img src="${RUTA_IMG}${archivo}-${respaldo}w.webp${v}" width="${d.w}" height="${d.h}" alt="${alt}" class="${clase}" loading="lazy" decoding="async">` +
        `</picture>`;
}

/* Visor: se importa la primera vez que se necesita (y se precalienta al acercar el dedo/mouse) */
let promesaVisor = null;
function cargarVisor() {
    if (!promesaVisor) promesaVisor = import("./visor-fotos.js");
    return promesaVisor;
}
async function abrirGaleria(fotos, indice, ficha) {
    const { abrirVisor } = await cargarVisor();
    abrirVisor({ fotos, indice, ficha });
}
function precalentarVisor(el) {
    ["pointerenter", "touchstart", "focusin"].forEach(ev => el.addEventListener(ev, cargarVisor, { once: true, passive: true }));
}

/* ------------------------------------------------------------
   PORTAFOLIO CON FILTROS (Todos · Cocinas · Walk-in · Closets · Decorativos)
------------------------------------------------------------ */
const TEXTOS_FILTRO = {
    todos: { tag: "Portafolio", titulo: "Nuestros Proyectos", sub: "Explora cocinas, walk-in closets, closets y proyectos decorativos fabricados a medida." },
    cocina: { tag: "Especialidad", titulo: "Cocinas Modernas", sub: "“Mobiliario que acompaña tu vida, resiste tus momentos y embellece el hogar donde tu familia crece.”" },
    "walk-in": { tag: "Organización", titulo: "Walk-in Closets y Closets", sub: "Creamos espacios de organización que transforman tu dormitorio en un lugar donde todo encuentra su equilibrio, integrando diseño, funcionalidad y una sensación de armonía que se vive día a día." },
    closet: { tag: "Organización", titulo: "Walk-in Closets y Closets", sub: "Creamos espacios de organización que transforman tu dormitorio en un lugar donde todo encuentra su equilibrio, integrando diseño, funcionalidad y una sensación de armonía que se vive día a día." },
    decorativo: { tag: "Interiorismo", titulo: "Proyectos Decorativos", sub: "Muros revestidos, repisas suspendidas, paneles acústicos y barras integradas que aportan carácter y lujo a tu hogar." }
};

// Enlaces existentes (#kitchens, #closets, #decor) → filtro que activan
const ANCLA_A_FILTRO = { kitchens: "cocina", closets: "walk-in", decor: "decorativo" };

function renderPortafolio() {
    const grid = document.getElementById("portafolio-grid");
    if (!grid || !window.PROYECTOS) return;
    grid.innerHTML = window.PROYECTOS.map(p => {
        const n = p.fotos.length;
        return `
            <button type="button" class="tarjeta-proyecto" data-id="${p.id}" data-categoria="${p.categoria}"
                aria-label="Ver ${n} ${n === 1 ? "foto" : "fotos"} de ${p.titulo}">
                <span class="tarjeta-proyecto-img">
                    ${pictureHTML(p.fotos[0].archivo, p.fotos[0].alt, "(max-width: 767px) 80vw, (max-width: 1023px) 50vw, 380px")}
                </span>
                <span class="tarjeta-proyecto-info">
                    <span class="tarjeta-proyecto-etiqueta">${p.etiqueta}</span>
                    <strong class="tarjeta-proyecto-titulo">${p.titulo}</strong>
                    <span class="tarjeta-proyecto-fotos"><i class="fa-regular fa-images" aria-hidden="true"></i> ${n} ${n === 1 ? "foto" : "fotos"}</span>
                </span>
            </button>`;
    }).join("");

    grid.addEventListener("click", e => {
        const tarjeta = e.target.closest(".tarjeta-proyecto");
        if (!tarjeta) return;
        const p = window.PROYECTOS.find(x => x.id === tarjeta.dataset.id);
        if (p) abrirGaleria(p.fotos, 0, p);
    });
    precalentarVisor(grid);
}

function aplicarFiltro(filtro, { desplazar = false } = {}) {
    if (!TEXTOS_FILTRO[filtro]) filtro = "todos";
    document.querySelectorAll(".filtro-chip").forEach(chip => {
        chip.setAttribute("aria-pressed", chip.dataset.filtro === filtro ? "true" : "false");
    });
    document.querySelectorAll(".tarjeta-proyecto").forEach(t => {
        t.hidden = filtro !== "todos" && t.dataset.categoria !== filtro;
    });
    const textos = TEXTOS_FILTRO[filtro];
    const tag = document.getElementById("portafolio-tag");
    const titulo = document.getElementById("portafolio-titulo");
    const sub = document.getElementById("portafolio-sub");
    if (tag) tag.textContent = textos.tag;
    if (titulo) titulo.textContent = textos.titulo;
    if (sub) sub.textContent = textos.sub;
    const grid = document.getElementById("portafolio-grid");
    if (grid) grid.scrollLeft = 0; // en móvil vuelve a la primera tarjeta
    if (desplazar) {
        const seccion = document.getElementById("portafolio");
        if (seccion) seccion.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
}

// Compatibilidad: las tarjetas de categorías llaman a selectClosetTab('walk-in' | 'closet')
window.selectClosetTab = function (tipo) {
    aplicarFiltro(tipo === "closet" ? "closet" : "walk-in", { desplazar: true });
};

function iniciarFiltros() {
    document.querySelectorAll(".filtro-chip").forEach(chip => {
        chip.addEventListener("click", () => aplicarFiltro(chip.dataset.filtro));
    });

    // Enlaces a #kitchens, #closets o #decor: activan el filtro y hacen scroll al portafolio
    document.addEventListener("click", e => {
        const enlace = e.target.closest('a[href="#kitchens"], a[href="#closets"], a[href="#decor"]');
        if (!enlace) return;
        e.preventDefault();
        const ancla = enlace.getAttribute("href").slice(1);
        // Las tarjetas de closets ya llaman a selectClosetTab con el tipo exacto
        if (!enlace.hasAttribute("onclick")) aplicarFiltro(ANCLA_A_FILTRO[ancla], { desplazar: true });
        history.replaceState(null, "", "#" + ancla);
    });

    // Llegada directa con el hash en la URL (ej. mueblerialgspa.com/#decor)
    const inicial = ANCLA_A_FILTRO[location.hash.slice(1)];
    aplicarFiltro(inicial || "todos", { desplazar: Boolean(inicial) });
}

/* ------------------------------------------------------------
   CARRUSEL (destacados y renders en móvil)
   Manual: flechas, arrastre con mouse, deslizamiento táctil con scroll-snap
   y puntos indicadores. Sin auto-scroll: el desplazamiento continuo
   impedía que Chrome midiera el LCP (error NO_LCP).
------------------------------------------------------------ */
function crearCarrusel(track, { prevBtn = null, nextBtn = null, puntosTras = track } = {}) {
    const items = Array.from(track.children);
    if (!items.length) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let hasMoved = false;

    const cardStep = () => {
        const gap = parseFloat(getComputedStyle(track).columnGap) || 24;
        return (items[0] ? items[0].clientWidth : 300) + gap;
    };
    const maxScroll = () => track.scrollWidth - track.clientWidth;

    // Puntos indicadores (uno por elemento)
    const dotsWrap = document.createElement("div");
    dotsWrap.className = "carousel-dots";
    const dots = items.map((item, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute("aria-label", "Ver imagen " + (i + 1) + " de " + items.length);
        dot.addEventListener("click", () => {
            track.scrollTo({ left: item.offsetLeft - items[0].offsetLeft, behavior: "smooth" });
        });
        dotsWrap.appendChild(dot);
        return dot;
    });
    puntosTras.after(dotsWrap);

    let pendiente = false;
    const updateDots = () => {
        pendiente = false;
        const atEnd = track.scrollLeft >= maxScroll() - 2;
        const index = atEnd ? items.length - 1 : Math.round(track.scrollLeft / cardStep());
        dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    };
    track.addEventListener("scroll", () => {
        if (!pendiente) { pendiente = true; requestAnimationFrame(updateDots); }
    }, { passive: true });
    // Al cargar siempre se ve el primero: se marca sin medir (medir aquí forzaría un cálculo de diseño de toda la página)
    dots[0].classList.add("active");

    // Flechas: al llegar a un extremo vuelven al otro
    if (prevBtn) {
        prevBtn.onclick = () => {
            if (track.scrollLeft <= 2) track.scrollTo({ left: maxScroll(), behavior: "smooth" });
            else track.scrollBy({ left: -cardStep(), behavior: "smooth" });
        };
    }
    if (nextBtn) {
        nextBtn.onclick = () => {
            if (track.scrollLeft >= maxScroll() - 2) track.scrollTo({ left: 0, behavior: "smooth" });
            else track.scrollBy({ left: cardStep(), behavior: "smooth" });
        };
    }

    // Arrastre con mouse (en táctil se usa el deslizamiento nativo)
    const endDrag = () => {
        if (!isDown) return;
        isDown = false;
        track.style.scrollSnapType = "";
        track.style.scrollBehavior = "";
    };
    track.addEventListener("mousedown", e => {
        isDown = true;
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
        hasMoved = false;
        // Desactiva el encaje y el scroll suave mientras se arrastra para que siga al cursor
        track.style.scrollSnapType = "none";
        track.style.scrollBehavior = "auto";
    });
    track.addEventListener("mouseleave", endDrag);
    track.addEventListener("mouseup", endDrag);
    track.addEventListener("mousemove", e => {
        if (!isDown) return;
        e.preventDefault();
        const walk = (e.pageX - track.offsetLeft - startX) * 1.5;
        if (Math.abs(walk) > 8) hasMoved = true;
        track.scrollLeft = scrollLeft - walk;
    });
    // Evita abrir el visor al soltar un arrastre
    track.addEventListener("click", e => {
        if (hasMoved) { e.preventDefault(); e.stopPropagation(); }
    }, true);
}

function renderDestacados() {
    const track = document.getElementById("proyectos-destacados");
    if (!track || !window.DESTACADOS) return;
    track.innerHTML = window.DESTACADOS.map((f, i) => `
        <button type="button" class="render-item proyecto-card project-card" data-i="${i}" aria-label="Ampliar: ${f.alt}">
            ${pictureHTML(f.archivo, f.alt, "(max-width: 650px) 90vw, (max-width: 992px) 45vw, 380px", "render-img")}
        </button>`).join("");
    track.addEventListener("click", e => {
        const item = e.target.closest(".render-item");
        if (item) abrirGaleria(window.DESTACADOS, Number(item.dataset.i), null);
    });
    precalentarVisor(track);
    crearCarrusel(track, {
        prevBtn: document.getElementById("btn-featured-prev"),
        nextBtn: document.getElementById("btn-featured-next"),
        puntosTras: document.getElementById("featured-carousel-container") || track
    });
}

function renderRenders() {
    const grid = document.getElementById("renders-grid");
    if (!grid || !window.RENDERS) return;
    grid.innerHTML = window.RENDERS.map((r, i) => `
        <button type="button" class="render-item" data-i="${i}" aria-label="Ampliar: ${r.titulo}">
            ${pictureHTML(r.archivo, r.alt, "(max-width: 767px) 85vw, (max-width: 1200px) 50vw, 580px", "render-img")}
            <span class="render-info-overlay">
                <h3>${r.titulo}</h3>
                <span>${r.resumen}</span>
            </span>
        </button>`).join("");
    grid.addEventListener("click", e => {
        const item = e.target.closest(".render-item");
        if (!item) return;
        const i = Number(item.dataset.i);
        const r = window.RENDERS[i];
        // Todas las fotos de renders en un solo visor, con la ficha del render elegido
        abrirGaleria(window.RENDERS.map(x => ({ archivo: x.archivo, alt: x.alt })), i, r);
    });
    precalentarVisor(grid);
    crearCarrusel(grid); // en computador es cuadrícula (los puntos se ocultan por CSS)
}

/* Efecto 3D al pasar el mouse sobre renders y destacados (solo con mouse y sin movimiento reducido) */
window.applyTiltListeners = function () {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = document.querySelectorAll(".render-item");
    cards.forEach(card => {
        card.addEventListener("mousemove", e => {
            const rect = card.getBoundingClientRect();
            const rotateX = -((e.clientY - rect.top) - rect.height / 2) / 18;
            const rotateY = ((e.clientX - rect.left) - rect.width / 2) / 18;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            card.style.boxShadow = `0 15px 35px rgba(0, 0, 0, 0.65), 0 0 15px rgba(212, 175, 55, 0.1)`;
        });
        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)";
            card.style.boxShadow = "";
        });
    });
};

function iniciarGaleria() {
    renderPortafolio();
    iniciarFiltros();
    renderDestacados();
    renderRenders();
    window.applyTiltListeners();
}

/* ============================================================
   INICIALIZACIÓN DE INTERFACES EN DOMContentLoaded
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    // Galería: portafolio con filtros, destacados y renders (datos en proyectos-data.js).
    // Está bajo la primera pantalla: se arma justo después del primer pintado para no retrasar el hero.
    requestAnimationFrame(() => setTimeout(iniciarGaleria, 0));

    // Appointment Showroom Booking Modal
    const openMeetingBtn = document.getElementById("open-meeting-modal");
    const closeMeetingBackdrop = document.getElementById("meeting-close-backdrop");
    const closeMeetingBtn = document.getElementById("meeting-close-btn");
    const meetingModal = document.getElementById("meeting-modal");

    if (openMeetingBtn) {
        openMeetingBtn.addEventListener("click", () => {
            meetingModal.classList.add("active");
        });
    }

    if (closeMeetingBackdrop) {
        closeMeetingBackdrop.addEventListener("click", () => {
            meetingModal.classList.remove("active");
        });
    }

    if (closeMeetingBtn) {
        closeMeetingBtn.addEventListener("click", () => {
            meetingModal.classList.remove("active");
        });
    }

    // Appointment Form Submit Action
    const meetingForm = document.getElementById("meeting-form");
    if (meetingForm) {
        meetingForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("meet-name").value;
            const date = document.getElementById("meet-date").value;
            const time = document.getElementById("meet-time").value;

            // Close modal
            meetingModal.classList.remove("active");

            // Reset form
            meetingForm.reset();

            // Success feedback toast
            showToast(`Reunión agendada para ${name} el ${date} a las ${time} Hrs.`, "success");
        });
    }

    // Mobile menu toggle logic
    const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
    const navMenu = document.getElementById("nav-menu");
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener("click", () => {
            mobileMenuToggle.classList.toggle("active");
            navMenu.classList.toggle("active");
            document.body.classList.toggle("menu-open");
        });
    }

    // Header glassmorphism background change on scroll
    const header = document.getElementById("header");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    // Auto-close menu on link clicks (Mobile)
    const navLinks = document.querySelectorAll(".nav-menu a");
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (mobileMenuToggle) mobileMenuToggle.classList.remove("active");
            if (navMenu) navMenu.classList.remove("active");
            document.body.classList.remove("menu-open");
        });
    });
});

/* ============================================================
   MAPA BAJO DEMANDA
   El iframe de Google Maps (~500 KB entre scripts y teselas) solo se
   carga cuando el cliente toca "Ver mapa". Mantiene el enlace
   "Ver en Google Maps" de la tarjeta de dirección.
============================================================ */
(function iniciarMapaBajoDemanda() {
    const boton = document.getElementById("map-facade");
    if (!boton) return;
    boton.addEventListener("click", () => {
        const iframe = document.createElement("iframe");
        iframe.src = boton.dataset.src;
        iframe.title = boton.dataset.title;
        iframe.width = "100%";
        iframe.height = "100%";
        iframe.style.border = "0";
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = "no-referrer-when-downgrade";
        boton.replaceWith(iframe);
        iframe.focus();
    }, { once: true });
})();

/* Activa las transiciones recién cuando la página terminó de cargar (ver .precarga en styles.css) */
window.addEventListener("load", () => {
    requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove("precarga")));
});
