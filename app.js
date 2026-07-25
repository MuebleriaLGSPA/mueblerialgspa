/* ============================================================
   VARIABLES GLOBALES
   ============================================================ */

let melamina_interior = null;
let melamina_exterior = null;
let tipo_modulo_base = null;
let tipo_cubierta = null;
let usa_led = null;

let forma_cocina = null;
let lleva_isla = null;
let modulo_isla = null;
let isla_cascada = null;

let tipo_riel = null;
let metros_isla = 0;

/* COSTOS GLOBALES (para desglose) */
let costo_interior = 0;
let costo_exterior = 0;
let costo_melamina_total = 0;

let costo_mdf = 0;
let costo_modulos_base = 0;
let costo_bisagras_aereo = 0;

let costo_led = 0;

let costo_tapacanto_frontal = 0;
let costo_tapacanto_puertas = 0;
let costo_tapacanto_total = 0;

let costo_cubierta = 0;

let costo_isla_modulos = 0;
let costo_melamina_isla = 0;
let costo_tapacanto_isla = 0;
let costo_cubierta_isla = 0;
let costo_cascada_isla = 0;
let costo_total_isla = 0;

let valor_sin_cubierta = 0;
let valor_muebles_con_margen = 0;
let valor_final_clp = 0;


/* ============================================================
   SELECTOR DE BOTONES
   ============================================================ */

function selectOption(field, value, btnEl) {
    window[field] = value;

    if (btnEl) {
        const buttons = btnEl.parentNode.querySelectorAll("button");
        buttons.forEach(btn => btn.classList.remove("selected"));
        btnEl.classList.add("selected");
    }
}


/* ============================================================
   VALIDACIONES
   ============================================================ */

function validarEntradas() {

    const largo_base_m = parseFloat(document.getElementById("largo_base_m").value);
    const largo_aereo_m = parseFloat(document.getElementById("largo_aereo_m").value);
    metros_isla = parseFloat(document.getElementById("metros_isla").value) || 0;

    if (isNaN(largo_base_m) || largo_base_m <= 0)
        return "Error: El largo base debe ser mayor a 0.";

    if (isNaN(largo_aereo_m) || largo_aereo_m < 0)
        return "Error: El largo aéreo no puede ser negativo.";

    if (largo_base_m > 10 || largo_aereo_m > 10)
        return "Error: No se permiten cocinas mayores a 10 metros.";

    if (!melamina_interior || !melamina_exterior)
        return "Error: Debe seleccionar melamina interior y exterior.";

    if (!tipo_modulo_base)
        return "Error: Debe seleccionar un tipo de módulo base.";

    if (!forma_cocina)
        return "Error: Debe seleccionar la forma de la cocina.";

    if (!tipo_riel)
        return "Error: Debe seleccionar el tipo de riel para los cajones.";

    if (!lleva_isla)
        return "Error: Debe indicar si la cocina lleva isla.";

    if (lleva_isla == "Sí" && (isNaN(metros_isla) || metros_isla <= 0))
        return "Error: Debe ingresar los metros de la isla.";

    if (lleva_isla == "Sí" && !modulo_isla)
        return "Error: Debe seleccionar el módulo de la isla.";

    if (lleva_isla == "Sí" && !isla_cascada)
        return "Error: Debe indicar si la isla lleva cascada.";

    if (usa_led == "Sí" && largo_aereo_m == 0)
        return "Error: No puede seleccionar LED sin muebles aéreos.";

    return "OK";
}


/* ============================================================
   CONSTANTES
   ============================================================ */

const PLANCHA_M2 = 4.575;

const VALOR_PLANCHA_BLANCA = 55000;
const VALOR_MEDIA_PLANCHA_BLANCA = 27500;

const VALOR_PLANCHA_COLOR = 85000;
const VALOR_MEDIA_PLANCHA_COLOR = 42500;

const VALOR_PLANCHA_MDF = 13000;

/* BISAGRAS Y RIELES CIERRE SUAVE */
const VALOR_BISAGRA = 1200;
const VALOR_RIEL_TELESCOPICO = 6000;
const VALOR_RIEL_OCULTO = 9000;

/* LED */
const VALOR_LED_ROLLO_5M = 15000;
const VALOR_PERFIL_2M = 6500;
const VALOR_BOTON_LED = 10000;
const VALOR_FUENTE_100W = 10000;
const VALOR_FUENTE_200W = 15000;

/* TAPACANTO PVC */
const VALOR_TAPACANTO_FRONTAL = 1000;
const VALOR_TAPACANTO_PUERTA = 2000;

const PERIMETRO_PUERTA = 2.30;


/* ============================================================
   MELAMINA POR FRACCIÓN REAL
   ============================================================ */

function calcularCostoMelamina(m2, tipo) {

    let planchas_completas = Math.floor(m2 / PLANCHA_M2);
    let sobrante_m2 = m2 - (planchas_completas * PLANCHA_M2);

    let valor_plancha = tipo == "Blanca" ? VALOR_PLANCHA_BLANCA : VALOR_PLANCHA_COLOR;
    let valor_media = tipo == "Blanca" ? VALOR_MEDIA_PLANCHA_BLANCA : VALOR_MEDIA_PLANCHA_COLOR;

    let costo = planchas_completas * valor_plancha;

    if (sobrante_m2 > 0) {
        if (sobrante_m2 <= PLANCHA_M2 / 2) costo += valor_media;
        else costo += valor_plancha;
    }

    return costo;
}


/* ============================================================
   MÓDULOS ADICIONALES
   ============================================================ */

function costoModuloExtra(tipo, factor, VALOR_RIEL) {

    switch (tipo) {

        case "esquinero":
            return factor * (6 * VALOR_BISAGRA);

        case "horno":
            return factor * (2 * VALOR_RIEL + 2 * VALOR_BISAGRA);

        case "lavaplatos":
            return factor * (2 * VALOR_BISAGRA);

        case "ciego":
            return 0;

        case "puerta + cajón":
            return factor * (2 * VALOR_BISAGRA + 1 * VALOR_RIEL);

        default:
            return 0;
    }
}


/* ============================================================
   COTIZADOR PRINCIPAL
   ============================================================ */

function cotizadorPrincipal() {

    const validacion = validarEntradas();
    if (validacion !== "OK") return validacion;

    const largo_base_m = parseFloat(document.getElementById("largo_base_m").value);
    const largo_aereo_m = parseFloat(document.getElementById("largo_aereo_m").value);
    metros_isla = parseFloat(document.getElementById("metros_isla").value) || 0;

    /* ---------------- CUBIERTA ---------------- */

    let valor_ml_cubierta = 0;

    if (tipo_cubierta == "Cuarzo" || tipo_cubierta == "Granito") valor_ml_cubierta = 165000;
    else if (tipo_cubierta == "Piedra sinterizada") valor_ml_cubierta = 185000;
    else if (tipo_cubierta == "Postformado") valor_ml_cubierta = 85000;
    else valor_ml_cubierta = 0;

    /* ---------------- MÓDULOS BASE ---------------- */

    let base_cm = largo_base_m * 100;
    let mod_base_100 = Math.floor(base_cm / 100);
    let mod_base_resto = base_cm % 100;
    let total_modulos_base = mod_base_100 + (mod_base_resto > 0 ? 1 : 0);

    /* ---------------- MÓDULOS AÉREOS ---------------- */

    let aereo_cm = largo_aereo_m * 100;
    let mod_aereo_100 = Math.floor(aereo_cm / 100);
    let mod_aereo_resto = aereo_cm % 100;
    let total_modulos_aereo = mod_aereo_100 + (mod_aereo_resto > 0 ? 1 : 0);

    /* ---------------- MELAMINA ---------------- */

    const AREA_INTERIOR_BASE = 2.622;
    const AREA_EXTERIOR_BASE = 0.75;

    const AREA_INTERIOR_AEREO = 1.38;
    const AREA_EXTERIOR_AEREO = 0.80;

    let m2_interior_total =
        total_modulos_base * AREA_INTERIOR_BASE +
        total_modulos_aereo * AREA_INTERIOR_AEREO;

    let m2_exterior_total =
        total_modulos_base * AREA_EXTERIOR_BASE +
        total_modulos_aereo * AREA_EXTERIOR_AEREO;

    costo_interior = calcularCostoMelamina(m2_interior_total, melamina_interior);
    costo_exterior = calcularCostoMelamina(m2_exterior_total, melamina_exterior);

    costo_melamina_total = costo_interior + costo_exterior;

    /* ---------------- MDF ---------------- */

    let m2_mdf = total_modulos_base * 0.8;
    costo_mdf = Math.ceil(m2_mdf / PLANCHA_M2) * VALOR_PLANCHA_MDF;

    /* ---------------- SELECCIÓN DE RIEL ---------------- */

    let VALOR_RIEL = tipo_riel == "Oculto" ? VALOR_RIEL_OCULTO : VALOR_RIEL_TELESCOPICO;

    /* ---------------- MÓDULOS BASE + RESTO + EXTRAS ---------------- */

    costo_modulos_base = 0;

    for (let i = 0; i < total_modulos_base; i++) {

        let es_resto = (i == total_modulos_base - 1 && mod_base_resto > 0);
        let factor = es_resto ? 0.7 : 1;

        if (tipo_modulo_base == "2 puertas")
            costo_modulos_base += factor * (4 * VALOR_BISAGRA);

        if (tipo_modulo_base == "3 cajones")
            costo_modulos_base += factor * (3 * VALOR_RIEL);

        if (tipo_modulo_base == "2 cajones")
            costo_modulos_base += factor * (2 * VALOR_RIEL);

        if (tipo_modulo_base == "puerta + cajón")
            costo_modulos_base += factor * (2 * VALOR_BISAGRA + 1 * VALOR_RIEL);

        if (tipo_modulo_base == "esquinero")
            costo_modulos_base += factor * (6 * VALOR_BISAGRA);

        if (tipo_modulo_base == "lavaplatos")
            costo_modulos_base += factor * (2 * VALOR_BISAGRA);

        if (tipo_modulo_base == "horno")
            costo_modulos_base += factor * (2 * VALOR_RIEL + 2 * VALOR_BISAGRA);

        if (tipo_modulo_base == "ciego")
            costo_modulos_base += 0;

        costo_modulos_base += costoModuloExtra(tipo_modulo_base, factor, VALOR_RIEL);
    }

    /* ---------------- BISAGRAS AÉREO ---------------- */

    let puertas_aereo = total_modulos_aereo * 2;
    costo_bisagras_aereo = puertas_aereo * 2 * VALOR_BISAGRA;

    /* ---------------- LED ---------------- */

    costo_led = 0;

    if (usa_led == "Sí") {

        let metros_led = total_modulos_aereo * 1;

        let rollos_led = Math.ceil(metros_led / 5);
        let perfiles_led = Math.ceil(metros_led / 2);

        costo_led =
            (rollos_led * VALOR_LED_ROLLO_5M) +
            (perfiles_led * VALOR_PERFIL_2M) +
            VALOR_BOTON_LED +
            (metros_led <= 10 ? VALOR_FUENTE_100W : VALOR_FUENTE_200W);
    }

    /* ---------------- TAPACANTO ---------------- */

    let tapacanto_frontal_base =
        (mod_base_100 * 1) + (mod_base_resto > 0 ? mod_base_resto / 100 : 0);

    let tapacanto_frontal_aereo =
        (mod_aereo_100 * 1) + (mod_aereo_resto > 0 ? mod_aereo_resto / 100 : 0);

    costo_tapacanto_frontal =
        (tapacanto_frontal_base + tapacanto_frontal_aereo) * VALOR_TAPACANTO_FRONTAL;

    let puertas_base = (tipo_modulo_base == "2 puertas") ? total_modulos_base * 2 : 0;
    let puertas_totales = puertas_base + puertas_aereo;

    costo_tapacanto_puertas =
        puertas_totales * PERIMETRO_PUERTA * VALOR_TAPACANTO_PUERTA;

    costo_tapacanto_total = costo_tapacanto_frontal + costo_tapacanto_puertas;

    /* ============================================================
       ISLA COMPLETA (SEGÚN METROS)
       ============================================================ */

    costo_isla_modulos = 0;
    costo_melamina_isla = 0;
    costo_tapacanto_isla = 0;
    costo_cubierta_isla = 0;
    costo_cascada_isla = 0;

    if (lleva_isla == "Sí") {

        let isla_cm = metros_isla * 100;
        let mod_isla_100 = Math.floor(isla_cm / 100);
        let mod_isla_resto = isla_cm % 100;
        let total_modulos_isla = mod_isla_100 + (mod_isla_resto > 0 ? 1 : 0);

        for (let i = 0; i < total_modulos_isla; i++) {

            let es_resto = (i == total_modulos_isla - 1 && mod_isla_resto > 0);
            let factor_isla = es_resto ? 0.7 : 1;

            if (modulo_isla == "2 puertas")
                costo_isla_modulos += factor_isla * (4 * VALOR_BISAGRA);

            if (modulo_isla == "3 cajones")
                costo_isla_modulos += factor_isla * (3 * VALOR_RIEL);

            if (modulo_isla == "2 cajones")
                costo_isla_modulos += factor_isla * (2 * VALOR_RIEL);
        }

        let m2_interior_isla = metros_isla * 2.622;
        let m2_exterior_isla = metros_isla * 0.75;

        costo_melamina_isla =
            calcularCostoMelamina(m2_interior_isla, melamina_interior) +
            calcularCostoMelamina(m2_exterior_isla, melamina_exterior);

        costo_tapacanto_isla += metros_isla * VALOR_TAPACANTO_FRONTAL;

        if (modulo_isla == "2 puertas") {
            let puertas_isla = metros_isla * 2;
            costo_tapacanto_isla += puertas_isla * PERIMETRO_PUERTA * VALOR_TAPACANTO_PUERTA;
        }

        costo_cubierta_isla = metros_isla * valor_ml_cubierta;

        if (isla_cascada == "Sí")
            costo_cascada_isla = 1 * valor_ml_cubierta;
    }

    costo_total_isla =
        costo_isla_modulos +
        costo_melamina_isla +
        costo_tapacanto_isla +
        costo_cubierta_isla +
        costo_cascada_isla;

    /* ---------------- TOTAL FINAL ---------------- */

    costo_cubierta = largo_base_m * valor_ml_cubierta;

    let valor_total_normal =
        costo_melamina_total +
        costo_mdf +
        costo_modulos_base +
        costo_bisagras_aereo +
        costo_led +
        costo_tapacanto_total +
        costo_cubierta +
        costo_total_isla;

    valor_sin_cubierta = valor_total_normal - costo_cubierta;

    valor_muebles_con_margen = valor_sin_cubierta * 1.75;

    valor_final_clp = valor_muebles_con_margen + costo_cubierta;

    return valor_final_clp;
}


/* ============================================================
   DESGLOSE DETALLADO
   ============================================================ */

function cotizadorDesglose() {

    const total = cotizadorPrincipal();
    if (typeof total === "string") return total;

    return {
        melamina_interior: costo_interior,
        melamina_exterior: costo_exterior,
        melamina_total: costo_melamina_total,

        mdf: costo_mdf,

        modulos_base: costo_modulos_base,
        bisagras_aereo: costo_bisagras_aereo,

        led: costo_led,

        tapacanto_frontal: costo_tapacanto_frontal,
        tapacanto_puertas: costo_tapacanto_puertas,
        tapacanto_total: costo_tapacanto_total,

        cubierta: costo_cubierta,

        isla: {
            metros: metros_isla,
            modulos: costo_isla_modulos,
            melamina: costo_melamina_isla,
            tapacanto: costo_tapacanto_isla,
            cubierta: costo_cubierta_isla,
            cascada: costo_cascada_isla,
            total: costo_total_isla
        },

        subtotal_muebles_sin_cubierta: valor_sin_cubierta,
        subtotal_muebles_con_margen: valor_muebles_con_margen,

        total_final: total
    };
}


/* ============================================================
   PRECIOS POR METRO
   ============================================================ */

function cotizadorPorMetro() {

    const total = cotizadorPrincipal();
    if (typeof total === "string") return total;

    const largo_base_m = parseFloat(document.getElementById("largo_base_m").value);
    const largo_aereo_m = parseFloat(document.getElementById("largo_aereo_m").value);

    return {
        precio_metro_base: total / largo_base_m,
        precio_metro_aereo: largo_aereo_m > 0 ? total / largo_aereo_m : 0,
        precio_metro_cubierta: costo_cubierta / largo_base_m,
        total_final: total
    };
}


/* ============================================================
   FUNCIÓN PRINCIPAL DE INTERFAZ
   ============================================================ */

function calcular() {

    const total = cotizadorPrincipal();

    if (typeof total === "string") {
        showToast(total, "error");
        return;
    }

    const desglose = cotizadorDesglose();

    // Show result details and hide placeholder
    document.getElementById("result-placeholder").style.display = "none";
    document.getElementById("result-details").style.display = "block";

    // Update total price (formatted as Chilean Peso CLP)
    document.getElementById("estimated-price").innerText = `$${Math.round(desglose.total_final).toLocaleString("es-CL")}`;

    let breakdownHTML = `
        <div class="breakdown-item">
            <span>Melamina Interior</span>
            <strong>$${Math.round(desglose.melamina_interior).toLocaleString("es-CL")}</strong>
        </div>
        <div class="breakdown-item">
            <span>Melamina Exterior</span>
            <strong>$${Math.round(desglose.melamina_exterior).toLocaleString("es-CL")}</strong>
        </div>
        <div class="breakdown-item">
            <span>MDF Traseras</span>
            <strong>$${Math.round(desglose.mdf).toLocaleString("es-CL")}</strong>
        </div>
        <div class="breakdown-item">
            <span>Módulos Base (Herrajes)</span>
            <strong>$${Math.round(desglose.modulos_base).toLocaleString("es-CL")}</strong>
        </div>
        <div class="breakdown-item">
            <span>Bisagras Aéreo</span>
            <strong>$${Math.round(desglose.bisagras_aereo).toLocaleString("es-CL")}</strong>
        </div>
        <div class="breakdown-item">
            <span>Iluminación LED</span>
            <strong>$${Math.round(desglose.led).toLocaleString("es-CL")}</strong>
        </div>
        <div class="breakdown-item">
            <span>Tapacanto frontal y puertas</span>
            <strong>$${Math.round(desglose.tapacanto_total).toLocaleString("es-CL")}</strong>
        </div>
        <div class="breakdown-item">
            <span>Cubierta Cocina</span>
            <strong>$${Math.round(desglose.cubierta).toLocaleString("es-CL")}</strong>
        </div>
    `;

    if (lleva_isla === "Sí") {
        breakdownHTML += `
            <div style="font-weight: 600; font-size: 12px; color: var(--color-metallic-gold); margin-top: 15px; margin-bottom: 5px; text-transform: uppercase;">Desglose Isla</div>
            <div class="breakdown-item">
                <span>Módulos Isla</span>
                <strong>$${Math.round(desglose.isla.modulos).toLocaleString("es-CL")}</strong>
            </div>
            <div class="breakdown-item">
                <span>Melamina Isla</span>
                <strong>$${Math.round(desglose.isla.melamina).toLocaleString("es-CL")}</strong>
            </div>
            <div class="breakdown-item">
                <span>Tapacanto Isla</span>
                <strong>$${Math.round(desglose.isla.tapacanto).toLocaleString("es-CL")}</strong>
            </div>
            <div class="breakdown-item">
                <span>Cubierta Isla</span>
                <strong>$${Math.round(desglose.isla.cubierta).toLocaleString("es-CL")}</strong>
            </div>
        `;
        if (desglose.isla.cascada > 0) {
            breakdownHTML += `
                <div class="breakdown-item">
                    <span>Cascada Isla</span>
                    <strong>$${Math.round(desglose.isla.cascada).toLocaleString("es-CL")}</strong>
                </div>
            `;
        }
    }

    breakdownHTML += `
        <div style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 15px; padding-top: 10px;"></div>
        <div class="breakdown-item">
            <span>Subtotal Muebles (Sin Cubierta)</span>
            <strong>$${Math.round(desglose.subtotal_muebles_sin_cubierta).toLocaleString("es-CL")}</strong>
        </div>
        <div class="breakdown-item">
            <span>Muebles con Margen (+75%)</span>
            <strong>$${Math.round(desglose.subtotal_muebles_con_margen).toLocaleString("es-CL")}</strong>
        </div>
    `;

    document.getElementById("calculator-breakdown").innerHTML = breakdownHTML;

    // Set up WhatsApp button with dynamic message
    const waBtn = document.getElementById("send-quote-btn");
    if (waBtn) {
        waBtn.onclick = () => {
            const msg = encodeURIComponent(`Hola MuebleríaLG, acabo de cotizar una cocina en su sitio web:\n- Largo base: ${document.getElementById("largo_base_m").value}m\n- Largo aéreo: ${document.getElementById("largo_aereo_m").value}m\n- Forma: ${forma_cocina}\n- Módulo base: ${tipo_modulo_base}\n- Cubierta: ${tipo_cubierta}\n- Lleva isla: ${lleva_isla}${lleva_isla === "Sí" ? ` (${metros_isla}m con módulo ${modulo_isla})` : ""}\n- Costo total estimado: $${Math.round(desglose.total_final).toLocaleString("es-CL")} CLP.\nMe gustaría agendar una asesoría de diseño.`);
            window.open(`https://wa.me/56949388286?text=${msg}`, "_blank");
        };
    }

    showToast("Cotización calculada con éxito.", "success");
}

/* ============================================================
   MOSTRAR / OCULTAR CAMPOS DE ISLA
   ============================================================ */

function toggleIslaFields(show) {
    const container = document.getElementById("isla-fields-container");
    if (container) {
        if (show) {
            container.style.display = "flex";
            document.getElementById("metros_isla").required = true;
        } else {
            container.style.display = "none";
            document.getElementById("metros_isla").required = false;
            document.getElementById("metros_isla").value = "";
            // Reset island selections
            modulo_isla = null;
            isla_cascada = null;
        }
    }
}

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
   PORTAFOLIO DE PROYECTOS (DATOS)
============================================================ */

const proyectos = [
    {
        id: "cocina-machali",
        category: "kitchen",
        title: "Proyecto Machalí",
        desc: "Cocina moderna con isla central, diseñada en melamina Sierra y cubierta de cuarzo Snow, una combinación que transmite elegancia, calidez y sofisticación. Cada superficie, cada textura y cada línea se integran para crear un espacio único, pensado para disfrutar, compartir y vivir momentos memorables. Materiales de alta calidad, estética contemporánea y un diseño que eleva la experiencia diaria a un nivel superior.",
        tag: "Cocina Moderna",
        images: [
            "assets/machali1.jpg",
            "assets/machali2.jpg",
            "assets/machali3.jpg",
            "assets/machali4.jpg"
        ],
        materials: "Melamina 18mm color Sierra / Cuarzo Blanco Snow",
        hardware: "Bisagras y cajones telescópicos con cierre suave",
    },
    {
        id: "cocina-rapel",
        category: "kitchen",
        title: "Proyecto Rapel",
        desc: "Cocina frente al lago diseñada en tonos cálidos y mobiliario en melamina color natural, creada para envolver el espacio en una sensación de armonía, serenidad y elegancia contemporánea. La combinación de materiales de alta calidad y la vista al entorno natural elevan cada detalle, transformando la cocina en un ambiente acogedor, sofisticado y lleno de vida, donde cada momento se disfruta con una calidez única.",
        tag: "Cocina en el lago",
        images: [
            "assets/rapel1.png",
            "assets/rapel2.png",
            "assets/rapel3.png",
            "assets/rapel4.png"
        ],
        materials: "Melamina 18mm color Carvalo y Blanco / Cubiertas de Cuarzo Blanco Snow",
        hardware: "Bisagras y cajones telescópicos con cierre suave, Iluminación calida para Muebles aereos y Vitrina con puertas de aluminio negro",
    },
    {
        id: "cocina-malalcahuello",
        category: "kitchen",
        title: "Proyecto Malalcahuello",
        desc: "Cocina rústica moderna en la montaña, fabricada en melamina Vison UltraMate y cubierta de cuarzo blanco espejado. Una combinación que realza la esencia cálida del entorno natural con un toque contemporáneo de gran sofisticación. Cada textura y cada superficie han sido seleccionadas para ofrecer un ambiente acogedor, elegante y de alta calidad, donde la estética, la funcionalidad y la conexión con el paisaje se unen para crear un espacio único, lleno de carácter y diseñado para disfrutar momentos inolvidables.",
        tag: "Cocina de Montaña",
        images: [
            "assets/malalcahuello1.png",
            "assets/malalcahuello2.png",
            "assets/malalcahuello3.png",
            "assets/malalcahuello4.png"
        ],
        materials: "Melamina 18mm color Vison UltraMate / Cuarzo Blanco Espejado",
        hardware: "Bisagras y cajones telescópicos con cierre suave",
    },
    {
        id: "cocina-lascondes",
        category: "kitchen",
        title: "Proyecto Las Condes",
        desc: "Cocina moderna y elegante, realzada por la combinación de melamina Azul Acero y una cubierta de cuarzo blanco. Un diseño que fusiona sofisticación, armonía y alta calidad, creando un espacio contemporáneo donde cada detalle aporta luminosidad, estilo y una experiencia única para disfrutar y compartir.",
        tag: "Cocina moderna y elegante",
        images: [
            "assets/lascondes1.png",
            "assets/lascondes2.png",
            "assets/lascondes3.png",
            "assets/lascondes4.png"
        ],
        materials: "Melamina 18mm color Azul Acero/ Cuarzo blanco Snow",
        hardware: "Bisagras y cajones telescópicos con cierre suave, Iluminación calida para Muebles aereos y Vitrina",
    },
    {
        id: "cocina-temuco",
        category: "kitchen",
        title: "Proyecto Temuco",
        desc: "Cocina moderna de diseño limpio, realzada por la elegancia de la melamina Azul Acero y una cubierta de cuarzo en tonos amaderados. Una combinación que aporta profundidad, calidez y alta calidad, creando un espacio contemporáneo donde cada línea y cada textura se integran con armonía. El resultado es una cocina sofisticada, equilibrada y diseñada para disfrutar momentos únicos en un ambiente lleno de estilo.",
        tag: "Cocina moderna en campo",
        images: [
            "assets/temuco1.jpg",
            "assets/temuco2.jpg",
            "assets/temuco3.jpg",
            "assets/temuco4.jpg"
        ],
        materials: "Melamina 18mm color Azul Acero / Cubiertas de Cuarzo Taupe",
        hardware: "Bisagras y cajones telescópicos con cierre suave",
    },
    {
        id: "cocina-olivar-1",
        category: "kitchen",
        title: "Proyecto Olivar 1",
        desc: "“Cocina contemporánea en tono Gris Grafito, diseñada con un elegante contraste y acompañada de una cubierta de cuarzo que aporta luminosidad, sofisticación y alta calidad. La armonía entre sus materiales y su estética moderna crea un espacio imponente, equilibrado y lleno de carácter, pensado para disfrutar cada momento en un ambiente de diseño excepcional.",
        tag: "Cocina Contemporánea",
        images: [
            "assets/olivar1.jpg",
            "assets/olivar2.jpg",
            "assets/olivar3.jpg",
            "assets/olivar4.jpg"
        ],
        materials: "Melamina 18mm Gris Grafito / Cuarzo Blanco Snow",
        hardware: "Bisagras y rieles ocultos con cierre suave",
    },
    {
        id: "cocina-shaker",
        category: "kitchen",
        title: "Proyecto Shaker",
        desc: "Cocina clásica de estilo vintage en tono verde, realzada con cubiertas de cuarzo blanco y tiradores de latón que aportan un brillo cálido y sofisticado. Cada detalle ha sido cuidadosamente seleccionado para transmitir elegancia, carácter y alta calidad, creando un ambiente encantador donde la estética tradicional se fusiona con la funcionalidad contemporánea. Un espacio lleno de personalidad, diseñado para disfrutar momentos únicos en un entorno que inspira nostalgia y distinción.",
        tag: "Cocina Shaker Clásica",
        images: [
            "assets/shaker1.jpg",
            "assets/shaker2.jpg",
            "assets/shaker3.jpg",
            "assets/shaker4.jpg"
        ],
        materials: "Melamina 18mm blanco en interior con puertas laminadas estilo Shaker color Verde  / Cuarzo Blanco Snow",
        hardware: "Tiradores de latón macizo, rieles y bisagras cierre suave, con iluminacion led calida",
        dimensions: "Largo Base: 4.5m, Isla: 1.8m",
        finish: "Pintura satinada de tacto suave y alta durabilidad"
    },
    {
        id: "cocina-colina",
        category: "kitchen",
        title: "Proyecto Colina",
        desc: "Cocina de concepto abierto con frentes en melamina Carvalo y Lino, vitrinas de exhibición iluminadas y una isla central con cubierta de cuarzo blanco Calacatta. Un diseño que combina elegancia, calidez y alta calidad, creando un espacio contemporáneo donde la iluminación, las texturas y los materiales se integran con armonía. Cada detalle está pensado para ofrecer una experiencia sofisticada, funcional y llena de estilo, ideal para disfrutar y compartir en un ambiente moderno y acogedor.",
        tag: "Cocina con Isla",
        images: [
            "assets/colina1.jpg",
            "assets/colina2.jpg",
            "assets/colina3.jpg",
            "assets/colina4.jpg"
        ],
        materials: "Melamina 18mm color Carvalo y Lino / Cuarzo Calacatta",
        hardware: "Bisagras y cajones telescópicos con cierre suave, Iluminación calida para Muebles aereos y Vitrina",
        dimensions: "Largo Base: 4.8m, Isla: 2.2m",
        finish: "Roble natural veteado mate y lacado suave"
    },
    {
        id: "cocina-santiago",
        category: "kitchen",
        title: "Proyecto Santiago",
        desc: "Cocina de concepto abierto con una combinación de melamina Gris Grafito y detalles en aluminio, creando un contraste moderno y sofisticado. Las cubiertas de Cuarzo Blanco Sky aportan luminosidad y pureza al diseño, mientras que la repisa abierta con iluminación LED cálida genera una atmósfera acogedora y equilibrada. Cada material y cada línea se integran con precisión para lograr un espacio contemporáneo, funcional y visualmente armónico.",
        tag: "Cocina Integrada",
        images: [
            "assets/santiago_1.png",
            "assets/santiago_2.png",
            "assets/santiago_3.png",
            "assets/santiago_4.png"
        ],
        materials: "Melamina 18mm color Gris Grafito y Aluminio/ Cubierta de Cuarzo Blanco Sky",
        hardware: "Rieles ocultos y bisagras con sistema cierre suave, iluminación Led"
    },
    {
        id: "cocina-olivar-2",
        category: "kitchen",
        title: "Proyecto Olivar 2",
        desc: "Diseño moderno que combina revestimiento Carvalo con melamina en tono Carvalo y Verde Glaciar, creando una composición cálida y contemporánea. Las cubiertas de Cuarzo Blanco Perla aportan luminosidad y pureza al conjunto, mientras que las vitrinas iluminadas con puertas de aluminio negro generan un contraste elegante y sofisticado. Cada material y cada línea se integran con armonía para lograr un espacio funcional, equilibrado y visualmente imponente.",
        tag: "Cocina Contemporánea",
        images: [
            "assets/olivar2_1.png",
            "assets/olivar2_2.jpg",
            "assets/olivar2_3.jpg",
            "assets/olivar2_4.jpg"
        ],
        materials: "Melamina 18mm color Verde Glaciar y Carvalo  / Cubierta de Cuarzo Blanco Perla",
        hardware: "Rieles ocultos y bisagras con sistema cierre suave, iluminación Led, Puertas de aluminio negro"
    },
    {
        id: "cocina-mostazal",
        category: "kitchen",
        title: "Proyecto Mostazal",
        desc: "Diseño elegante de cocina a medida con una combinación de melamina Negro Matt y Colina, creando un contraste moderno y sofisticado. Las cubiertas de Cuarzo Blanco Cristal aportan luminosidad y pureza al espacio, mientras que la vitrina y los muebles aéreos con iluminación LED cálida generan una atmósfera acogedora y equilibrada. Cada material y cada línea se integran con precisión para lograr una cocina contemporánea, funcional y visualmente imponente.",
        tag: "Cocina Integrada",
        images: [
            "assets/mostazal1.png",
            "assets/mostazal2.png",
            "assets/mostazal3.jpg",
            "assets/mostazal4.jpg"
        ],
        materials: "Melamina 18mm color Negro Matt y Colina  / Cubierta de Cuarzo Blanco Cristal",
        hardware: "Rieles ocultos y bisagras con sistema cierre suave, iluminación led"
    },
    {
        id: "closet-luxury",
        category: "closet",
        title: "",
        desc: "Nuestros walk‑in closets están diseñados como espacios de organización integral, fabricados en melamina de 18 mm en color blanco o en tonos seleccionados del catálogo. Cada diseño se desarrolla con líneas limpias, proporciones equilibradas y una distribución arquitectónica que optimiza el recorrido y la funcionalidad. La modulación, iluminación y selección de materiales se trabajan con precisión para crear un ambiente elegante, práctico y de alta calidad, donde el orden se vive como una experiencia y la estética se integra con total armonía, logrando un espacio sofisticado, amplio y perfectamente equilibrado.",
        tag: "Walk-in Closet",
        images: [
            "assets/walkin_closet1.png",
            "assets/walkin_closet3.jpg",
            "assets/walkin_closet4.jpg"
        ],
        materials: "Melamina Blanca Seda / Tableros de Roble Veteado",
        hardware: "Rieles ocultos Hettich soft-close, perfiles LED empotrados con sensor",
        dimensions: "Ancho: 4.2m, Fondo: 3.5m",
        finish: "Interiores lacados y cantos de PVC termolaminados de alta resistencia"
    },
    {
        id: "tv-wall-luxury",
        category: "living",
        title: "Mueble Bar y Cava",
        desc: "Mueble bar y cava integrado a medida en melamina nogal amazónico. Vitrinas con marcos de aluminio negro, cristal templado y repisas con iluminación cálida LED sensorizada.",
        tag: "Mobiliario Bar & Cava",
        images: [
            "assets/tv_condes1.jpg",
            "assets/tv_condes2.jpg",
            "assets/tv_condes3.jpg"
        ],
        materials: "Melamina 18mm Nogal Amazónico / Cristal Templado / Aluminio Negro",
        hardware: "Rieles ocultos y bisagras cierre suave e iluminación LED empotrada",
        dimensions: "Ancho: 2.8m, Alto: 2.4m",
        finish: "Barniz protector satinado anticuñas"
    },
    {
        id: "quinchos",
        category: "outdoor-decor",
        title: "Proyecto Rack TV",
        desc: "Exclusivo centro de entretenimiento y mueble para TV a medida con revestimiento de palillaje acústico en roble natural, vitrinas de exhibición laterales iluminadas con tiras LED cálidas de encendido suave y cava de vinos integrada.",
        tag: "Mobiliario Rack TV",
        images: [
            "assets/chicureo1.jpg",
            "assets/chicureo2.jpg",
            "assets/chicureo3.jpg"
        ],
        materials: "Melamina 18mm Teca Italia / Revestimiento Wall Panel / Vidrio",
        hardware: "Rieles ocultos y bisagras cierre suave e iluminación LED integrada sensorizada",
        dimensions: "Ancho: 3.6m, Alto: 2.5m, Fondo: 0.45m",
        finish: "Barniz protector satinado de alta durabilidad"
    },
    {
        id: "closet-noble-mostazal",
        category: "closet",
        title: "Proyecto Closet",
        desc: "Todos nuestros closets son fabricados en melamina de 18 mm, disponibles en color blanco o en tonos seleccionados del catálogo. Cada diseño se desarrolla con líneas limpias y un estilo único que resalta la organización y la funcionalidad. Cada módulo y cada detalle han sido cuidadosamente trabajados para ofrecer un espacio elegante, práctico y de alta calidad, donde el orden se convierte en protagonista y la estética se integra con total armonía, creando un ambiente sofisticado y perfectamente equilibrado.",
        tag: "Closet Integrado",
        images: [
            "assets/closet1.png",
            "assets/closet2.jpg",
            "assets/closet3.jpg",
            "assets/closet4.jpg"
        ],
        materials: "Melamina 18mm Color Blanco / Tiradores de Acero Color Negro",
        hardware: "Tiradores de perfil de aluminio negro mate, bisagras cierre suave",
        dimensions: "Ancho: 3.2m, Alto: 2.4m, Fondo: 0.6m",
        finish: "Frentes de puertas lisos antihuella soft-touch premium"
    },
    {
        id: "closets",
        category: "closet",
        title: "Walk-in Closets",
        desc: "Nuestros walk‑in closets están diseñados como espacios de organización integral, fabricados en melamina de 18 mm en color blanco o en tonos seleccionados del catálogo. Cada diseño se desarrolla con líneas limpias, proporciones equilibradas y una distribución arquitectónica que optimiza el recorrido y la funcionalidad. La modulación, iluminación y selección de materiales se trabajan con precisión para crear un ambiente elegante, práctico y de alta calidad, donde el orden se vive como una experiencia y la estética se integra con total armonía, logrando un espacio sofisticado, amplio y perfectamente equilibrado.",
        tag: "Walk-in Closet",
        images: ["assets/walkin_closet_main.jpg"],
        materials: "Melamina Roble Veteado / Cristal Templado / Aluminio",
        hardware: "Rieles ocultos de extracción total soft-close and sensores de presencia",
        dimensions: "Ancho: 4.0m, Fondo: 3.8m",
        finish: "Herrajes integrados y marcos de aluminio negro anodizado"
    }
];

/* ============================================================
   FUNCIÓN QUE RENDERIZA LAS FOTOS EN COCINAS MODERNAS
============================================================ */

window.renderKitchenGallery = function (list) {
    const grid = document.getElementById("kitchens-gallery-grid");
    if (!grid) return;
    grid.innerHTML = "";

    list.forEach(proyecto => {
        proyecto.images.forEach((img, idx) => {
            const card = document.createElement("div");
            card.className = "render-item project-card";
            card.setAttribute("data-project-id", proyecto.id);
            card.setAttribute("data-aos", "zoom-in");
            card.setAttribute("onclick", `window.openProjectModal('${proyecto.id}', '${img}')`);

            card.innerHTML = `
                <img src="${img}" alt="${proyecto.title} - Imagen ${idx + 1}" class="render-img" loading="lazy" onclick="event.stopPropagation(); window.openProjectModal('${proyecto.id}', '${img}')">
            `;
            grid.appendChild(card);
        });
    });

    if (typeof window.applyTiltListeners === "function") {
        window.applyTiltListeners();
    }
};


/* ============================================================
   FUNCIÓN QUE RENDERIZA LAS FOTOS EN CLOSETS Y WALK-IN CLOSETS
============================================================ */

window.renderClosetGallery = function (list) {
    const grid = document.getElementById("closets-gallery-grid");
    if (!grid) return;
    grid.innerHTML = "";

    list.forEach(proyecto => {
        proyecto.images.forEach((img, idx) => {
            const card = document.createElement("div");
            card.className = "render-item project-card";
            card.setAttribute("data-project-id", proyecto.id);
            card.setAttribute("data-aos", "zoom-in");
            card.setAttribute("onclick", `window.openProjectModal('${proyecto.id}', '${img}')`);

            card.innerHTML = `
                <img src="${img}" alt="${proyecto.title} - Imagen ${idx + 1}" class="render-img" loading="lazy" onclick="event.stopPropagation(); window.openProjectModal('${proyecto.id}', '${img}')">
            `;
            grid.appendChild(card);
        });
    });

    if (typeof window.applyTiltListeners === "function") {
        window.applyTiltListeners();
    }
};

window.filterClosetProject = function (closetType, btnEl) {
    if (btnEl) {
        const buttons = btnEl.parentNode.querySelectorAll(".filter-btn-rect, .filter-btn");
        buttons.forEach(b => b.classList.remove("active"));
        btnEl.classList.add("active");
    }

    const closetProjects = proyectos.filter(p => p.category === "closet");
    if (closetType === "walk-in") {
        const filtered = closetProjects.filter(p => p.tag.toLowerCase().includes("walk-in"));
        renderClosetGallery(filtered);
    } else {
        const filtered = closetProjects.filter(p => !p.tag.toLowerCase().includes("walk-in"));
        renderClosetGallery(filtered);
    }
};

window.selectClosetTab = function (type) {
    const tabs = document.querySelectorAll("#closets .filter-btn-rect");
    if (type === 'walk-in' && tabs[0]) {
        tabs[0].click();
    } else if (type === 'closet' && tabs[1]) {
        tabs[1].click();
    }
};

/* ============================================================
   FUNCIÓN QUE RENDERIZA LAS FOTOS EN PROYECTOS DECORATIVOS
============================================================ */

window.renderDecorGallery = function (list) {
    const grid = document.getElementById("decor-gallery-grid");
    if (!grid) return;
    grid.innerHTML = "";

    list.forEach(proyecto => {
        proyecto.images.forEach((img, idx) => {
            const card = document.createElement("div");
            card.className = "render-item project-card";
            card.setAttribute("data-project-id", proyecto.id);
            card.setAttribute("data-aos", "zoom-in");
            card.setAttribute("onclick", `window.openProjectModal('${proyecto.id}', '${img}')`);

            card.innerHTML = `
                <img src="${img}" alt="${proyecto.title} - Imagen ${idx + 1}" class="render-img" loading="lazy" onclick="event.stopPropagation(); window.openProjectModal('${proyecto.id}', '${img}')">
                <div class="render-info-overlay" onclick="event.stopPropagation(); window.openProjectModal('${proyecto.id}', this.parentNode.querySelector('.render-img').src)">
                    <span style="font-family: var(--font-secondary) !important; color: var(--color-text-gray); font-size: 0.85rem; display: block; margin-bottom: 12px;">${proyecto.desc}</span>
                    <button class="btn btn-gold btn-small" onclick="event.stopPropagation(); window.openProjectModal('${proyecto.id}', '${img}')" style="font-size: 0.75rem; padding: 6px 12px; width: auto; font-family: var(--font-primary) !important; text-transform: uppercase;">${proyecto.title.replace(/Proyecto\s+/i, "")}</button>
                </div>
            `;
            grid.appendChild(card);
        });
    });

    if (typeof window.applyTiltListeners === "function") {
        window.applyTiltListeners();
    }
};

window.filterDecorProject = function (projectId, btnEl) {
    if (btnEl) {
        const buttons = btnEl.parentNode.querySelectorAll(".filter-btn-rect, .filter-btn");
        buttons.forEach(b => b.classList.remove("active"));
        btnEl.classList.add("active");
    }

    const decorProjects = proyectos.filter(p => p.category === "living" || p.category === "outdoor-decor");
    if (projectId === "all") {
        renderDecorGallery(decorProjects);
    } else {
        const filtered = decorProjects.filter(p => p.id === projectId);
        renderDecorGallery(filtered);
    }
};

/* ============================================================
   FILTROS DE GALERÍAS
============================================================ */

window.filterKitchenProject = function (projectId, btnEl) {
    if (btnEl) {
        const buttons = btnEl.parentNode.querySelectorAll(".filter-btn-rect, .filter-btn");
        buttons.forEach(b => b.classList.remove("active"));
        btnEl.classList.add("active");
    }

    const kitchenProjects = proyectos.filter(p => p.category === "kitchen");
    if (projectId === "all") {
        renderKitchenGallery(kitchenProjects);
    } else {
        const filtered = kitchenProjects.filter(p => p.id === projectId);
        renderKitchenGallery(filtered);
    }
};

window.filterFeaturedProject = function (category, btnEl) {
    if (btnEl) {
        const buttons = btnEl.parentNode.querySelectorAll(".filter-btn-rect, .filter-btn");
        buttons.forEach(b => b.classList.remove("active"));
        btnEl.classList.add("active");
    }

    const grid = document.getElementById("proyectos-destacados");
    if (grid) {
        const cards = grid.querySelectorAll(".project-card");
        cards.forEach(card => {
            const cardCat = card.getAttribute("data-category");
            if (category === "all" || cardCat === category || (category === "living" && cardCat === "living") || (category === "outdoor-decor" && cardCat === "outdoor-decor")) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    }
};

/* ============================================================
   CARGAR PORTAFOLIO GENERAL
============================================================ */

function cargarPortafolio() {
    const featuredGrid = document.getElementById("proyectos-destacados");
    const closetsGrid = document.getElementById("closets-gallery-grid");
    const decorGrid = document.getElementById("decor-gallery-grid");

    if (featuredGrid) featuredGrid.innerHTML = "";
    if (closetsGrid) closetsGrid.innerHTML = "";
    if (decorGrid) decorGrid.innerHTML = "";

    const destacadosImages = [
        "assets/featured_1.jpg",
        "assets/featured_2.jpg",
        "assets/featured_3.jpg",
        "assets/featured_4.jpg",
        "assets/featured_5.jpg",
        "assets/featured_6.jpg",
        "assets/featured_7.jpg",
        "assets/featured_8.jpg",
        "assets/featured_9.jpg",
        "assets/featured_10.jpg",
        "assets/featured_11.jpg",
        "assets/featured_12.jpg",
        "assets/featured_13.jpg",
        "assets/featured_14.jpg",
        "assets/featured_15.jpg",
        "assets/featured_16.jpg",
        "assets/featured_17.png",
        "assets/featured_18.jpg"
    ];

    destacadosImages.forEach((img, idx) => {
        const featuredCardHTML = `
            <div class="render-item proyecto-card project-card" data-category="featured" data-project-id="featured-${idx}" style="cursor: pointer;" data-aos="zoom-in" onclick="window.openLightbox('${img}', this.parentNode)">
                <img src="${img}" alt="Proyecto Destacado ${idx + 1}" class="render-img" loading="lazy" onclick="event.stopPropagation(); window.openLightbox(this.src, this.parentNode.parentNode)">
            </div>
        `;

        if (featuredGrid) {
            featuredGrid.insertAdjacentHTML("beforeend", featuredCardHTML);
        }
    });

    if (typeof window.applyTiltListeners === "function") {
        window.applyTiltListeners();
    }

    // Carousel setup for infinite scroll loop
    if (featuredGrid) {
        // Clone elements twice (before and after) to create 3 sets
        const originalCards = Array.from(featuredGrid.children);

        // Prepend copies (in order)
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            featuredGrid.insertBefore(clone, originalCards[0]);
        });

        // Append copies
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            featuredGrid.appendChild(clone);
        });

        let isDown = false;
        let isHovered = false;
        let startX;
        let scrollLeft;
        let hasMoved = false;

        // Position initial scroll at the middle set (after elements are rendered)
        setTimeout(() => {
            const setWidth = featuredGrid.scrollWidth / 3;
            featuredGrid.scrollLeft = setWidth;
        }, 150);

        // Listen for scroll to handle seamless wrap-around loop boundaries
        featuredGrid.addEventListener('scroll', () => {
            const setWidth = featuredGrid.scrollWidth / 3;
            if (featuredGrid.scrollLeft >= 2 * setWidth) {
                featuredGrid.scrollLeft -= setWidth;
            } else if (featuredGrid.scrollLeft <= setWidth / 2) {
                featuredGrid.scrollLeft += setWidth;
            }
        });

        featuredGrid.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - featuredGrid.offsetLeft;
            scrollLeft = featuredGrid.scrollLeft;
            hasMoved = false;
        });

        featuredGrid.addEventListener('mouseenter', () => {
            isHovered = true;
        });

        featuredGrid.addEventListener('mouseleave', () => {
            isDown = false;
            isHovered = false;
        });

        featuredGrid.addEventListener('mouseup', () => {
            isDown = false;
        });

        featuredGrid.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - featuredGrid.offsetLeft;
            const walk = (x - startX) * 1.5; // Drag speed multiplier
            if (Math.abs(walk) > 8) {
                hasMoved = true;
            }
            featuredGrid.scrollLeft = scrollLeft - walk;
        });

        featuredGrid.addEventListener('click', (e) => {
            if (hasMoved) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true); // Capture phase to prevent opening lightbox on drag release

        const prevBtn = document.getElementById("btn-featured-prev");
        const nextBtn = document.getElementById("btn-featured-next");
        if (prevBtn) {
            prevBtn.onclick = () => {
                const item = featuredGrid.querySelector(".render-item");
                const cardWidth = item ? item.clientWidth : 300;
                featuredGrid.scrollBy({ left: -(cardWidth + 24), behavior: "smooth" });
            };
        }
        if (nextBtn) {
            nextBtn.onclick = () => {
                const item = featuredGrid.querySelector(".render-item");
                const cardWidth = item ? item.clientWidth : 300;
                featuredGrid.scrollBy({ left: cardWidth + 24, behavior: "smooth" });
            };
        }

        // Auto-scroll loop with constant speed (pixels per frame)
        const autoScrollSpeed = 0.8; // Adjust speed here for faster/slower scroll
        function autoScroll() {
            const lightbox = document.getElementById("lightbox-modal");
            const lightboxActive = lightbox && lightbox.classList.contains("active");

            if (!isDown && !isHovered && !lightboxActive) {
                featuredGrid.scrollLeft += autoScrollSpeed;
            }
            requestAnimationFrame(autoScroll);
        }
        requestAnimationFrame(autoScroll);
    }
}

/* ============================================================
   MODALES DEL SITIO (DETALLE PROYECTO & AGENDA)
   ============================================================ */

window.openProjectModal = function (id, imgSrc) {
    const renderProjects = {
        "render-isla": {
            title: "Render Cocina Gris y Blanco",
            desc: "Simulación fotorrealista de melamina gris mate y cubiertas de cuarzo blanco con iluminación LED decorativa integrada.",
            tag: "Render 3D",
            materials: "Melamina Gris Mate / Cuarzo Blanco",
            hardware: "Perfiles LED empotrados / Bisagras cierre suave",
            dimensions: "Ancho: 4.5m, Alto: 2.3m",
            finish: "Tacto antihuella soft-touch premium"
        },
        "render-dormitorio": {
            title: "Render Cocina Roble y Negro",
            desc: "Simulación de cocina moderna en melamina roble y negro, con vitrina iluminada de exhibición lateral y tiradores ocultos.",
            tag: "Render 3D",
            materials: "Melamina Roble y Negro Mate / Cristal Templado",
            hardware: "Iluminación LED cálida sensorizada y bisagras cierre suave",
            dimensions: "Ancho: 3.8m, Alto: 2.4m",
            finish: "Vitrinas de aluminio con cristal templado"
        },
        "render-cocina": {
            title: "Render Cocina Verde Oliva",
            desc: "Visualización de cocina de concepto abierto con frentes en melamina verde oliva, campana decorativa y una isla funcional con revestimiento de palillaje.",
            tag: "Render 3D",
            materials: "Melamina Verde Oliva / Madera Natural / Cuarzo Blanco",
            hardware: "Rieles ocultos de extracción total soft-close",
            dimensions: "Largo Base: 4.2m, Isla: 2.0m",
            finish: "Combinación de melamina texturada y lacado satinado"
        },
        "render-tv": {
            title: "Render Divisor de Espacios con TV",
            desc: "Estructura divisoria funcional a doble cara, revestida con palillaje de madera, soporte integrado para Smart TV y vitrinas laterales retroiluminadas.",
            tag: "Render 3D",
            materials: "Estructura de MDF Lacado / Palillaje de Madera / Cristal Templado",
            hardware: "Iluminación cálida LED empotrada, herrajes ocultos y pasacables",
            dimensions: "Ancho: 3.0m, Alto: 2.4m, Fondo: 0.4m",
            finish: "Revestimiento en roble natural semibrillo de alta durabilidad"
        }
    };

    let project = proyectos.find(p => p.id === id);
    if (!project && renderProjects[id]) {
        project = renderProjects[id];
    }
    if (!project) return;

    document.getElementById("modal-project-tag").innerText = project.tag || "";
    document.getElementById("modal-project-title").innerText = project.title || "";

    // Override description and hide hardware info for Walk-in Closets
    // Override description, materials, tag, and hide hardware info for Walk-in Closets
    const isCloset = project.category === "closet";
    const isWalkIn = isCloset && (project.tag && project.tag.toLowerCase().includes("walk-in"));
    if (isWalkIn) {
        document.getElementById("modal-project-tag").innerText = "Walk-in closets";
        document.getElementById("modal-project-desc").innerText = "Nuestros walk‑in closets están diseñados como espacios de organización integral, fabricados en melamina de 18 mm en color blanco o en tonos seleccionados del catálogo. Cada diseño se desarrolla con líneas limpias, proporciones equilibradas y una distribución arquitectónica que optimiza el recorrido y la funcionalidad. La modulación, iluminación y selección de materiales se trabajan con precisión para crear un ambiente elegante, práctico y de alta calidad, donde el orden se vive como una experiencia y la estética se integra con total armonía, logrando un espacio sofisticado, amplio y perfectamente equilibrado.";
        const hardwareRow = document.getElementById("modal-hardware-row");
        if (hardwareRow) hardwareRow.style.display = "none";
        document.getElementById("modal-materials").innerText = "Melamina de 18mm, Escuadras metalicas para repisas, Colgador ovalado cromado o negro.";
    } else {
        document.getElementById("modal-project-tag").innerText = project.tag || "";
        if (isCloset) {
            document.getElementById("modal-project-desc").innerText = "Todos nuestros closets son fabricados en melamina de 18 mm, disponibles en color blanco o en tonos seleccionados del catálogo. Cada diseño se desarrolla con líneas limpias y un estilo único que resalta la organización y la funcionalidad. Cada módulo y cada detalle han sido cuidadosamente trabajados para ofrecer un espacio elegante, práctico y de alta calidad, donde el orden se convierte en protagonista y la estética se integra con total armonía, creando un ambiente sofisticado y perfectamente equilibrado.";
        } else {
            document.getElementById("modal-project-desc").innerText = project.desc || "";
        }
        const hardwareRow = document.getElementById("modal-hardware-row");
        if (hardwareRow) hardwareRow.style.display = "flex";
        document.getElementById("modal-materials").innerText = project.materials || "";
    }

    document.getElementById("modal-hardware").innerText = project.hardware || "";

    // Main Image (shows clicked image or fallback)
    const mainImg = document.getElementById("modal-main-img");
    const targetImageSrc = imgSrc || project.image || (project.images && project.images[0]) || "";
    mainImg.src = targetImageSrc;
    mainImg.alt = project.title;

    // Hide thumbnails container (per user request)
    const thumbsContainer = document.getElementById("modal-thumbnails-container");
    if (thumbsContainer) {
        thumbsContainer.style.display = "none";
    }

    // Open Modal
    document.getElementById("project-detail-modal").classList.add("active");
};

function changeModalMainImage(src, thumbEl) {
    document.getElementById("modal-main-img").src = src;
    if (thumbEl && thumbEl.parentNode) {
        const thumbs = thumbEl.parentNode.querySelectorAll(".modal-thumb");
        thumbs.forEach(t => t.classList.remove("active"));
        thumbEl.classList.add("active");
    }
}

function closeProjectModal() {
    document.getElementById("project-detail-modal").classList.remove("active");
}

/* ============================================================
   LIGHTBOX GALERÍA PROFESIONAL Y EFECTO TILT 3D
============================================================ */

let lightboxImages = [];
let currentLightboxIdx = 0;

let isDragging = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;
let isZoomed = false;
const zoomScale = 2.5;

window.openLightbox = function (imgSrc, gridEl) {
    // Normalize relative or absolute source to absolute URL
    const absoluteImgSrc = new URL(imgSrc, window.location.href).href;

    if (!gridEl) {
        // Fallback: search for the image on page and locate its parent container
        const matchImg = Array.from(document.querySelectorAll("img")).find(img => img.src === absoluteImgSrc);
        if (matchImg) {
            gridEl = matchImg.closest(".carousel-track") || matchImg.closest(".renders-grid") || matchImg.parentNode;
        }
    }

    if (gridEl) {
        const imagesInGrid = Array.from(gridEl.querySelectorAll(".render-img"));
        lightboxImages = [...new Set(imagesInGrid.map(img => img.src))];
    } else {
        lightboxImages = [absoluteImgSrc];
    }

    currentLightboxIdx = lightboxImages.indexOf(absoluteImgSrc);
    if (currentLightboxIdx === -1) {
        lightboxImages = [absoluteImgSrc];
        currentLightboxIdx = 0;
    }

    updateLightboxContent();

    const modal = document.getElementById("lightbox-modal");
    if (modal) {
        modal.style.display = "flex";
        setTimeout(() => {
            modal.classList.add("active");
        }, 10);
        document.body.style.overflow = "hidden";
    }
};

window.updateLightboxContent = function () {
    const imgEl = document.getElementById("lightbox-img");
    if (imgEl) {
        imgEl.src = lightboxImages[currentLightboxIdx];
        resetLightboxZoom();
    }
};

window.navigateLightbox = function (direction) {
    if (lightboxImages.length <= 1) return;
    currentLightboxIdx = (currentLightboxIdx + direction + lightboxImages.length) % lightboxImages.length;
    updateLightboxContent();
};

window.closeLightbox = function () {
    const modal = document.getElementById("lightbox-modal");
    if (modal) {
        modal.classList.remove("active");
        setTimeout(() => {
            modal.style.display = "none";
        }, 400);
        document.body.style.overflow = "";
        resetLightboxZoom();
    }
};

window.toggleLightboxZoom = function (e) {
    const imgEl = document.getElementById("lightbox-img");
    if (!imgEl) return;

    if (!isZoomed) {
        const rect = imgEl.getBoundingClientRect();
        const clientX = e ? e.clientX : rect.left + rect.width / 2;
        const clientY = e ? e.clientY : rect.top + rect.height / 2;

        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Exact on-screen offset calculation for precise zoom-centering
        translateX = (centerX - mouseX) * zoomScale;
        translateY = (centerY - mouseY) * zoomScale;

        imgEl.classList.add("zoomed");
        imgEl.style.transform = `scale(${zoomScale}) translate(${translateX / zoomScale}px, ${translateY / zoomScale}px)`;
        imgEl.style.cursor = "grab";
        isZoomed = true;
    } else {
        resetLightboxZoom();
    }
};

window.resetLightboxZoom = function () {
    const imgEl = document.getElementById("lightbox-img");
    if (imgEl) {
        imgEl.classList.remove("zoomed");
        imgEl.style.transform = "scale(1) translate(0px, 0px)";
        imgEl.style.cursor = "zoom-in";
        imgEl.style.transition = "transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)";
    }
    isZoomed = false;
    translateX = 0;
    translateY = 0;
};

window.initDragPan = function () {
    const imgEl = document.getElementById("lightbox-img");
    if (!imgEl) return;

    let dragStartX = 0;
    let dragStartY = 0;
    let currentTranslateX = 0;
    let currentTranslateY = 0;
    let clickStartX = 0;
    let clickStartY = 0;
    let touchStartX = 0;
    let touchStartY = 0;

    const startDrag = (e) => {
        if (!isZoomed) return;
        isDragging = true;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        dragStartX = clientX;
        dragStartY = clientY;
        currentTranslateX = translateX;
        currentTranslateY = translateY;

        imgEl.style.cursor = "grabbing";
        imgEl.style.transition = "none";

        if (e.touches) {
            e.preventDefault();
        }
    };

    const doDrag = (e) => {
        if (!isDragging) return;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - dragStartX;
        const dy = clientY - dragStartY;

        translateX = currentTranslateX + dx;
        translateY = currentTranslateY + dy;

        imgEl.style.transform = `scale(${zoomScale}) translate(${translateX / zoomScale}px, ${translateY / zoomScale}px)`;
    };

    const stopDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        imgEl.style.cursor = "grab";
        imgEl.style.transition = "transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)";
    };

    imgEl.addEventListener("mousedown", (e) => {
        clickStartX = e.clientX;
        clickStartY = e.clientY;
        startDrag(e);
    });

    window.addEventListener("mousemove", doDrag);

    window.addEventListener("mouseup", (e) => {
        if (isDragging) stopDrag();

        const clickEndX = e.clientX;
        const clickEndY = e.clientY;
        const distance = Math.sqrt(Math.pow(clickEndX - clickStartX, 2) + Math.pow(clickEndY - clickStartY, 2));

        if (distance < 5 && e.target === imgEl) {
            window.toggleLightboxZoom(e);
        }
    });

    imgEl.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        startDrag(e);
    }, { passive: false });

    window.addEventListener("touchmove", doDrag, { passive: false });

    window.addEventListener("touchend", (e) => {
        if (isDragging) stopDrag();

        if (e.changedTouches && e.changedTouches.length > 0) {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const distance = Math.sqrt(Math.pow(touchEndX - touchStartX, 2) + Math.pow(touchEndY - touchStartY, 2));

            if (distance < 8 && e.target === imgEl) {
                const fakeEvent = {
                    clientX: touchEndX,
                    clientY: touchEndY
                };
                window.toggleLightboxZoom(fakeEvent);
            }
        }
    });
};

window.applyTiltListeners = function () {
    const cards = document.querySelectorAll(".render-item");
    cards.forEach(card => {
        card.onmousemove = null;
        card.onmouseleave = null;

        card.addEventListener("mousemove", e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            const rotateX = -(y - yc) / 18;
            const rotateY = (x - xc) / 18;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            card.style.boxShadow = `0 15px 35px rgba(0, 0, 0, 0.65), 0 0 15px rgba(212, 175, 55, 0.1)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)";
            card.style.boxShadow = "";
        });
    });
};

document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        closeProjectModal();
        closeLightbox();
    }
    const modal = document.getElementById("lightbox-modal");
    if (modal && modal.style.display === "flex") {
        if (e.key === "ArrowRight") {
            navigateLightbox(1);
        } else if (e.key === "ArrowLeft") {
            navigateLightbox(-1);
        }
    }
});

/* ============================================================
   INICIALIZACIÓN DE INTERFACES EN DOMContentLoaded
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    // Portfolio
    cargarPortafolio();

    renderKitchenGallery(proyectos.filter(p => p.id === "cocina-machali"));
    renderDecorGallery(proyectos.filter(p => p.id === "tv-wall-luxury"));
    renderClosetGallery(proyectos.filter(p => p.category === "closet" && p.tag.toLowerCase().includes("walk-in")));

    // Bind static renders details modal
    const rendersGrid = document.querySelector("#renders .renders-grid");
    if (rendersGrid) {
        const renderItems = rendersGrid.querySelectorAll(".render-item");
        renderItems.forEach(item => {
            const img = item.querySelector(".render-img");
            if (img) {
                img.setAttribute("loading", "lazy");
                img.style.cursor = "pointer";

                let renderId = "render-isla";
                const alt = img.alt || "";
                if (alt.includes("Gris") || alt.includes("Isla")) renderId = "render-isla";
                else if (alt.includes("Roble") || alt.includes("Negro") || alt.includes("Dormitorio")) renderId = "render-dormitorio";
                else if (alt.includes("Oliva") || alt.includes("Cocina")) renderId = "render-cocina";
                else if (alt.includes("Divisor") || alt.includes("Entretenimiento")) renderId = "render-tv";

                img.addEventListener("click", (e) => {
                    e.stopPropagation();
                    window.openProjectModal(renderId, img.src);
                });

                const overlay = item.querySelector(".render-info-overlay");
                if (overlay) {
                    overlay.style.cursor = "pointer";
                    overlay.addEventListener("click", (e) => {
                        e.stopPropagation();
                        window.openProjectModal(renderId, img.src);
                    });
                }

                item.addEventListener("click", () => {
                    window.openProjectModal(renderId, img.src);
                });
            }
        });
    }

    if (typeof window.applyTiltListeners === "function") {
        window.applyTiltListeners();
    }

    // Project modal click-out and close button
    const closeBackdrop = document.getElementById("modal-close-backdrop");
    const closeBtn = document.getElementById("modal-close-btn");
    if (closeBackdrop) closeBackdrop.addEventListener("click", closeProjectModal);
    if (closeBtn) closeBtn.addEventListener("click", closeProjectModal);

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
        });
    });

    // Renders Lightbox initialization
    const renderItems = document.querySelectorAll(".renders-grid .render-item");
    renderItems.forEach(item => {
        item.style.cursor = "pointer";
        item.addEventListener("click", () => {
            const img = item.querySelector("img");
            if (img) {
                openLightbox(img.src);
            }
        });
    });

    const lightboxCloseBtn = document.getElementById("lightbox-close-btn");
    const lightboxCloseBackdrop = document.getElementById("lightbox-close-backdrop");
    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener("click", closeLightbox);
    if (lightboxCloseBackdrop) lightboxCloseBackdrop.addEventListener("click", closeLightbox);

    // Initialize dragging and panning for precise zoom
    if (typeof window.initDragPan === "function") {
        window.initDragPan();
    }
});
