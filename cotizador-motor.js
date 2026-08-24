/**
 * Motor de cálculo del Cotizador — Muebles a medida.
 * Implementa la sección 2 (lógica de materiales por módulo) y sección 4
 * (fórmula final) de Cotizador_Especificacion_Unificada.md.
 *
 * No depende del DOM: puede usarse en el navegador (window.CotizadorMotor)
 * o en Node (module.exports) para pruebas.
 *
 * Supuestos de ingeniería tomados donde la especificación no da una cifra
 * exacta (documentados también en precios.json cuando aplica a precios):
 *   - Grosor de melamina 18mm = 1.8cm, usado para descontar alturas cuando
 *     la especificación dice "laterales restan solo la melamina superior/etc".
 *   - "Tapacanto por el lado más largo (frente)": se interpreta como el
 *     canto realmente visible en el frente del mueble (alto en piezas
 *     verticales tipo laterales, ancho en piezas horizontales tipo
 *     piso/repisa/sócalo), no un max() geométrico ciego.
 *   - Optimización de planchas: se suma el área total requerida por tipo
 *     de material (m²) y se divide por el área de una plancha 250x180cm
 *     (4.5 m²), redondeando hacia arriba a múltiplos de 0.5 planchas. Esto
 *     es una aproximación por área, no un anidado 2D real de piezas.
 *   - Tamaño de riel por defecto: Riel Telescópico Cierre Suave 50cm
 *     (constante RIEL_DEFAULT_KEY), ajustable en un solo lugar.
 * Estos supuestos están señalados también junto a cada bloque de código.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CotizadorMotor = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------------------------------------------------------------------
  // Constantes generales
  // ---------------------------------------------------------------------

  var GROSOR_18 = 1.8; // cm
  var RIEL_DEFAULT_KEY = 'riel_telescopico_cs_50';

  // ---------------------------------------------------------------------
  // Acumulador de materiales de un módulo (o de todo el proyecto)
  // ---------------------------------------------------------------------

  function nuevoAcumulador() {
    return {
      piezas: [],      // { modulo, material, anchoCm, altoCm }
      tapacantos: [],  // { modulo, tipo, metros }
      herrajes: [],    // { modulo, key, cantidad }
      otros: []        // { modulo, categoria, key, cantidad }
    };
  }

  function agregarPieza(acc, modulo, material, anchoCm, altoCm, tapacantoMetros, tapacantoTipo) {
    acc.piezas.push({ modulo: modulo, material: material, anchoCm: anchoCm, altoCm: altoCm });
    if (tapacantoTipo && tapacantoMetros > 0) {
      acc.tapacantos.push({ modulo: modulo, tipo: tapacantoTipo, metros: tapacantoMetros });
    }
  }

  function agregarHerraje(acc, modulo, key, cantidad) {
    if (cantidad > 0) acc.herrajes.push({ modulo: modulo, key: key, cantidad: cantidad });
  }

  function agregarOtro(acc, modulo, categoria, key, cantidad) {
    if (cantidad > 0) acc.otros.push({ modulo: modulo, categoria: categoria, key: key, cantidad: cantidad });
  }

  // Pieza vertical (p.ej. laterales): el canto frontal visible = altoCm
  function piezaVertical(acc, modulo, material, fondoCm, altoCm, tapacantoTipo) {
    agregarPieza(acc, modulo, material, fondoCm, altoCm, altoCm / 100, tapacantoTipo);
  }

  // Pieza horizontal (piso, repisa, sócalo, tapa): el canto frontal visible = anchoCm
  function piezaHorizontal(acc, modulo, material, anchoCm, fondoCm, tapacantoTipo) {
    agregarPieza(acc, modulo, material, anchoCm, fondoCm, anchoCm / 100, tapacantoTipo);
  }

  // Puerta / tapa: tapacanto en los 4 lados
  function piezaPuerta(acc, modulo, material, anchoCm, altoCm, tapacantoTipo) {
    var perimetro = 2 * (anchoCm + altoCm) / 100;
    agregarPieza(acc, modulo, material, anchoCm, altoCm, perimetro, tapacantoTipo);
  }

  // Pieza sin tapacanto (durolac, panel trasero esquinero, etc.)
  function piezaSinCanto(acc, modulo, material, anchoCm, altoCm) {
    agregarPieza(acc, modulo, material, anchoCm, altoCm, 0, null);
  }

  // ---------------------------------------------------------------------
  // Generador de cajón estándar (reutilizado por Cajonera y Torre)
  // ---------------------------------------------------------------------

  function generarCajon(acc, modulo, anchoModulo, altoCajon) {
    var frenteAncho = anchoModulo - 8.3;
    // 2 laterales: 51cm de largo (fondo) x altoCajon
    piezaVertical(acc, modulo, 'melamina_blanca_15', 51, altoCajon, 'tapacanto_0_4mm');
    piezaVertical(acc, modulo, 'melamina_blanca_15', 51, altoCajon, 'tapacanto_0_4mm');
    // delantera + trasera
    piezaHorizontal(acc, modulo, 'melamina_blanca_15', frenteAncho, altoCajon, 'tapacanto_0_4mm');
    piezaHorizontal(acc, modulo, 'melamina_blanca_15', frenteAncho, altoCajon, 'tapacanto_0_4mm');
    // base: 48cm fondo, mismo largo que delantera/trasera
    piezaHorizontal(acc, modulo, 'melamina_blanca_15', frenteAncho, 48, 'tapacanto_0_4mm');
  }

  // ---------------------------------------------------------------------
  // MUEBLE BASE
  // ---------------------------------------------------------------------

  function calcularMuebleBase(acc, modulo, p) {
    var ancho = p.ancho;
    var fondo = 55, altoLateral = 76;

    piezaVertical(acc, modulo, 'melamina_blanca_18', fondo, altoLateral, 'tapacanto_0_4mm');
    piezaVertical(acc, modulo, 'melamina_blanca_18', fondo, altoLateral, 'tapacanto_0_4mm');
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, fondo, 'tapacanto_0_4mm'); // base/piso
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, fondo - 5, 'tapacanto_0_4mm'); // repisa
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, 10, 'tapacanto_0_4mm'); // sócalo trasero
    piezaSinCanto(acc, modulo, 'durolac', ancho, 75); // durolac trasero

    var numPuertas = ancho < 55 ? 1 : 2;
    var anchoPuerta = ancho / numPuertas;
    for (var i = 0; i < numPuertas; i++) {
      piezaPuerta(acc, modulo, 'melamina_color_18', anchoPuerta, 75, 'tapacanto_2_0mm');
      agregarHerraje(acc, modulo, 'manilla', 1);
      agregarHerraje(acc, modulo, 'bisagra_estandar', 2);
    }

    piezaHorizontal(acc, modulo, 'melamina_color_18', ancho, 10, 'tapacanto_2_0mm'); // sócalo delantero

    return { puertas: numPuertas, cajones: 0 };
  }

  // ---------------------------------------------------------------------
  // MUEBLE AÉREO
  // ---------------------------------------------------------------------

  function calcularMuebleAereo(acc, modulo, p) {
    var ancho = p.ancho;
    var fondo = 35, altoTotal = 80;
    var altoLateral = altoTotal - 2 * GROSOR_18;

    piezaVertical(acc, modulo, 'melamina_blanca_18', fondo, altoLateral, 'tapacanto_0_4mm');
    piezaVertical(acc, modulo, 'melamina_blanca_18', fondo, altoLateral, 'tapacanto_0_4mm');
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, fondo, 'tapacanto_0_4mm'); // superior
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, fondo, 'tapacanto_0_4mm'); // inferior
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, fondo - 5, 'tapacanto_0_4mm'); // repisa
    // 2 sócalos blancos de 10cm de anclaje interior (arriba y abajo) — regla para todos los aéreos
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, 10, 'tapacanto_0_4mm');
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, 10, 'tapacanto_0_4mm');
    piezaSinCanto(acc, modulo, 'durolac', ancho, altoTotal);

    var numPuertas = ancho <= 55 ? 1 : 2;
    var anchoPuerta = ancho / numPuertas;
    for (var i = 0; i < numPuertas; i++) {
      piezaPuerta(acc, modulo, 'melamina_color_18', anchoPuerta, 81.5, 'tapacanto_2_0mm');
      agregarHerraje(acc, modulo, 'manilla', 1);
      agregarHerraje(acc, modulo, 'bisagra_estandar', 2);
    }

    return { puertas: numPuertas, cajones: 0 };
  }

  // ---------------------------------------------------------------------
  // MUEBLE AÉREO CAMPANA
  // ---------------------------------------------------------------------

  function calcularMuebleAereoCampana(acc, modulo, p) {
    var ancho = p.ancho;
    var fondo = 35, altoTotal = 80;
    var altoLateral = altoTotal - GROSOR_18; // solo 1 melamina superior, sin inferior

    piezaVertical(acc, modulo, 'melamina_blanca_18', fondo, altoLateral, 'tapacanto_0_4mm');
    piezaVertical(acc, modulo, 'melamina_blanca_18', fondo, altoLateral, 'tapacanto_0_4mm');
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, fondo, 'tapacanto_0_4mm'); // superior única

    // 2 repisas con el fondo total (sin reducir): repisa1 a 18cm, sócalo color 5cm, repisa2
    var alturaRepisa1 = 18;
    var alturaSocaloColor = 5;
    var alturaRepisa2 = alturaRepisa1 + alturaSocaloColor; // 23cm desde el piso
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, fondo, 'tapacanto_0_4mm'); // repisa 1
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, fondo, 'tapacanto_0_4mm'); // repisa 2
    piezaHorizontal(acc, modulo, 'melamina_color_18', ancho, alturaSocaloColor, 'tapacanto_2_0mm'); // sócalo color entre repisas

    // Fijo de color desde 2cm hasta donde empieza la 1ra repisa (18cm) => 16cm de alto
    piezaHorizontal(acc, modulo, 'melamina_color_18', ancho, alturaRepisa1 - 2, 'tapacanto_2_0mm');

    // Siempre 2 puertas (ancho total), llegan hasta 2cm más abajo que la repisa superior (23cm)
    var altoPuertas = alturaRepisa2 - 2; // 21cm
    var anchoPuerta = ancho / 2;
    for (var i = 0; i < 2; i++) {
      piezaPuerta(acc, modulo, 'melamina_color_18', anchoPuerta, altoPuertas, 'tapacanto_2_0mm');
      agregarHerraje(acc, modulo, 'manilla', 1);
      agregarHerraje(acc, modulo, 'bisagra_estandar', 2);
    }

    piezaSinCanto(acc, modulo, 'durolac', ancho, altoTotal);
    // 2 sócalos blancos de 10cm interior (arriba y abajo), regla común a todos los aéreos
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, 10, 'tapacanto_0_4mm');
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, 10, 'tapacanto_0_4mm');

    return { puertas: 2, cajones: 0 };
  }

  // ---------------------------------------------------------------------
  // CAJONERA
  // ---------------------------------------------------------------------

  function calcularCajonera(acc, modulo, p) {
    var ancho = p.ancho;
    var cantidadCajones = p.cantidadCajones === 2 ? 2 : 3; // default 3

    // Carcasa exterior (igual que mueble base, sin puertas/sócalo delantero color)
    piezaVertical(acc, modulo, 'melamina_blanca_18', 55, 76, 'tapacanto_0_4mm');
    piezaVertical(acc, modulo, 'melamina_blanca_18', 55, 76, 'tapacanto_0_4mm');
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, 55, 'tapacanto_0_4mm'); // piso
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, 10, 'tapacanto_0_4mm'); // sócalo trasero
    piezaSinCanto(acc, modulo, 'durolac', ancho, 75);

    var altoCajon = cantidadCajones === 3 ? 25 : 35;
    var anchoSocaloDelantero = ancho - 2 * GROSOR_18; // entre laterales
    var altoTapa = cantidadCajones === 3 ? (75 - 6) / 3 : (75 - 3) / 2;

    for (var i = 0; i < cantidadCajones; i++) {
      generarCajon(acc, modulo, ancho, altoCajon);
      piezaHorizontal(acc, modulo, 'melamina_color_18', anchoSocaloDelantero, 10, 'tapacanto_2_0mm'); // sócalo delantero
      piezaPuerta(acc, modulo, 'melamina_color_18', ancho, altoTapa, 'tapacanto_2_0mm'); // tapa (ancho total)
      agregarHerraje(acc, modulo, 'manilla', 1);
    }

    agregarHerraje(acc, modulo, RIEL_DEFAULT_KEY, cantidadCajones);

    return { puertas: 0, cajones: cantidadCajones };
  }

  // ---------------------------------------------------------------------
  // TORRE HORNO/MICROONDAS
  // ---------------------------------------------------------------------

  function calcularTorre(acc, modulo, p) {
    var ancho = 60, fondo = 55, altoTotal = 240, zocalo = 10.5;
    var altoLateral = altoTotal - zocalo - 2 * GROSOR_18;

    piezaVertical(acc, modulo, 'melamina_blanca_18', fondo, altoLateral, 'tapacanto_0_4mm');
    piezaVertical(acc, modulo, 'melamina_blanca_18', fondo, altoLateral, 'tapacanto_0_4mm');
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, fondo, 'tapacanto_0_4mm'); // superior
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, fondo, 'tapacanto_0_4mm'); // inferior
    for (var r = 0; r < 3; r++) {
      piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, fondo, 'tapacanto_0_4mm'); // 3 repisas
    }
    piezaSinCanto(acc, modulo, 'durolac', ancho, altoTotal);
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, 10, 'tapacanto_0_4mm'); // sócalo blanco interior
    piezaHorizontal(acc, modulo, 'melamina_color_18', ancho, 10, 'tapacanto_2_0mm'); // sócalo delantero 1
    piezaHorizontal(acc, modulo, 'melamina_color_18', ancho, 10, 'tapacanto_2_0mm'); // sócalo delantero 2

    // 2 puertas de 50x30cm
    for (var i = 0; i < 2; i++) {
      piezaPuerta(acc, modulo, 'melamina_color_18', 50, 30, 'tapacanto_2_0mm');
      agregarHerraje(acc, modulo, 'manilla', 1);
      agregarHerraje(acc, modulo, 'bisagra_estandar', 2);
    }

    // 1 tapa de cajón 30x60cm (ancho total x 30 alto)
    piezaPuerta(acc, modulo, 'melamina_color_18', ancho, 30, 'tapacanto_2_0mm');
    agregarHerraje(acc, modulo, 'manilla', 1);

    // 1 cajón de 35cm alto (medidas de cajón estándar)
    generarCajon(acc, modulo, ancho, 35);
    agregarHerraje(acc, modulo, RIEL_DEFAULT_KEY, 1);

    return { puertas: 2, cajones: 1 };
  }

  // ---------------------------------------------------------------------
  // MÓDULO SUPERIOR AL REFRIGERADOR
  // ---------------------------------------------------------------------

  function calcularSuperiorRefrigerador(acc, modulo, p) {
    var ancho = p.ancho;
    var fondo = 55, altoTotal = 55;
    var altoLateral = altoTotal - GROSOR_18; // laterales restan solo la melamina superior

    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, fondo, 'tapacanto_0_4mm'); // superior
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, fondo, 'tapacanto_0_4mm'); // melamina interior 55cm fondo

    // Laterales: tapacanto por 1 lado largo (alto) y 1 lado corto (fondo)
    for (var i = 0; i < 2; i++) {
      var metros = (altoLateral + fondo) / 100;
      agregarPieza(acc, modulo, 'melamina_blanca_18', fondo, altoLateral, metros, 'tapacanto_0_4mm');
    }

    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, 10, 'tapacanto_0_4mm'); // sócalo interior 1
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, 10, 'tapacanto_0_4mm'); // sócalo interior 2
    piezaHorizontal(acc, modulo, 'melamina_color_18', ancho, 10, 'tapacanto_2_0mm'); // sócalo delantero
    piezaSinCanto(acc, modulo, 'durolac', ancho, altoTotal);

    piezaPuerta(acc, modulo, 'melamina_color_18', ancho, 52, 'tapacanto_2_0mm');
    agregarHerraje(acc, modulo, 'manilla', 1);
    agregarHerraje(acc, modulo, 'bisagra_estandar', 2);

    agregarHerraje(acc, modulo, 'piston_gas', 2);

    return { puertas: 1, cajones: 0 };
  }

  // ---------------------------------------------------------------------
  // MUEBLE DESPENSA
  // ---------------------------------------------------------------------

  function calcularDespensa(acc, modulo, p) {
    var ancho = p.ancho;
    var fondo = 55, altoTotal = 240, zocalo = 10.5;
    var altoLateral = altoTotal - zocalo - 2 * GROSOR_18;

    piezaVertical(acc, modulo, 'melamina_blanca_18', fondo, altoLateral, 'tapacanto_0_4mm');
    piezaVertical(acc, modulo, 'melamina_blanca_18', fondo, altoLateral, 'tapacanto_0_4mm');
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, fondo, 'tapacanto_0_4mm'); // superior
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, fondo, 'tapacanto_0_4mm'); // inferior
    for (var r = 0; r < 5; r++) {
      piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, fondo, 'tapacanto_0_4mm'); // 5 repisas
    }
    piezaSinCanto(acc, modulo, 'durolac', ancho, altoTotal);
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, 10, 'tapacanto_0_4mm'); // sócalo blanco interior
    piezaHorizontal(acc, modulo, 'melamina_color_18', ancho, 10, 'tapacanto_2_0mm'); // sócalo delantero
    piezaHorizontal(acc, modulo, 'melamina_color_18', ancho, 10, 'tapacanto_2_0mm'); // sócalo delantero (2)

    var numPuertas = ancho > 55 ? 2 : 1;
    var anchoPuerta = ancho / numPuertas;
    for (var i = 0; i < numPuertas; i++) {
      piezaPuerta(acc, modulo, 'melamina_color_18', anchoPuerta, altoTotal, 'tapacanto_2_0mm');
      agregarHerraje(acc, modulo, 'manilla', 1);
      agregarHerraje(acc, modulo, 'bisagra_estandar', 5); // 5 bisagras por puerta
    }

    return { puertas: numPuertas, cajones: 0 };
  }

  // ---------------------------------------------------------------------
  // MUEBLE VITRINA
  // ---------------------------------------------------------------------

  function calcularVitrina(acc, modulo, p) {
    var ancho = p.ancho, fondo = p.fondo, altoInput = p.alto;
    var altoEfectivo = altoInput - 10.5; // zócalo siempre restado
    var numRepisas = p.repisas || 0;
    var conPuertas = !!p.conPuertas;

    piezaVertical(acc, modulo, 'melamina_color_18', fondo, altoEfectivo, 'tapacanto_2_0mm');
    piezaVertical(acc, modulo, 'melamina_color_18', fondo, altoEfectivo, 'tapacanto_2_0mm');
    piezaHorizontal(acc, modulo, 'melamina_color_18', ancho, fondo, 'tapacanto_2_0mm'); // superior
    piezaHorizontal(acc, modulo, 'melamina_color_18', ancho, fondo, 'tapacanto_2_0mm'); // inferior
    for (var i = 0; i < numRepisas; i++) {
      piezaHorizontal(acc, modulo, 'melamina_color_18', ancho, fondo, 'tapacanto_2_0mm');
    }
    // Melamina trasera (interior de superior, inferior y laterales)
    piezaHorizontal(acc, modulo, 'melamina_color_18', ancho, altoEfectivo, 'tapacanto_2_0mm');

    var numPuertas = 0;
    if (conPuertas) {
      numPuertas = ancho <= 55 ? 1 : 2;
      var anchoPuerta = ancho / numPuertas;
      for (var j = 0; j < numPuertas; j++) {
        piezaPuerta(acc, modulo, 'melamina_color_18', anchoPuerta, altoEfectivo, 'tapacanto_2_0mm');
        agregarHerraje(acc, modulo, 'manilla', 1);
        agregarHerraje(acc, modulo, 'bisagra_negra', 2);
      }
    }

    return { puertas: numPuertas, cajones: 0 };
  }

  // ---------------------------------------------------------------------
  // MUEBLE ESQUINERO (forma L)
  // ---------------------------------------------------------------------

  function calcularEsquinero(acc, modulo, p) {
    var brazoIzq = p.anchoBrazoIzq || 95;
    var brazoDer = p.anchoBrazoDer || 95;
    var fondo = 55, altoLateral = 76;

    // 2 laterales exteriores (cierre de cada extremo del L)
    piezaVertical(acc, modulo, 'melamina_blanca_18', fondo, altoLateral, 'tapacanto_0_4mm');
    piezaVertical(acc, modulo, 'melamina_blanca_18', fondo, altoLateral, 'tapacanto_0_4mm');

    // Piso combinado (aproximación de área para el módulo en L)
    var anchoPisoAprox = brazoIzq + brazoDer;
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', anchoPisoAprox, fondo, 'tapacanto_0_4mm');

    var brazos = [brazoIzq, brazoDer];
    for (var i = 0; i < brazos.length; i++) {
      var anchoBrazo = brazos[i];
      // Parte trasera de ese lado: melamina blanca 15mm SIN tapacanto
      piezaSinCanto(acc, modulo, 'melamina_blanca_15', anchoBrazo, 75);
      // Sócalo delantero (igual que los demás, color)
      piezaHorizontal(acc, modulo, 'melamina_color_18', anchoBrazo, 10, 'tapacanto_2_0mm');
      // Repisa proporcional al brazo
      piezaHorizontal(acc, modulo, 'melamina_blanca_18', anchoBrazo, fondo - 5, 'tapacanto_0_4mm');
      // Puerta proporcional al brazo, en el ángulo de 90°
      piezaPuerta(acc, modulo, 'melamina_color_18', anchoBrazo, 75, 'tapacanto_2_0mm');
      agregarHerraje(acc, modulo, 'manilla', 1);
    }

    // No lleva sócalo trasero. Bisagras 165°: 2 en total según tabla de herrajes
    // (no 2 por puerta como en el resto de los módulos — así lo especifica la sección 2).
    agregarHerraje(acc, modulo, 'bisagra_165', 2);

    return { puertas: 2, cajones: 0 };
  }

  // ---------------------------------------------------------------------
  // ESQUINERO PANEL CIEGO
  // ---------------------------------------------------------------------

  function calcularEsquineroPanelCiego(acc, modulo, p) {
    var ancho = p.ancho;
    var fondo = 55, altoLateral = 76;
    var anchoPanelFijo = 59;

    piezaVertical(acc, modulo, 'melamina_blanca_18', fondo, altoLateral, 'tapacanto_0_4mm');
    piezaVertical(acc, modulo, 'melamina_blanca_18', fondo, altoLateral, 'tapacanto_0_4mm');
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, fondo - 5, 'tapacanto_0_4mm'); // repisa (50cm fondo)
    piezaHorizontal(acc, modulo, 'melamina_blanca_18', ancho, 10, 'tapacanto_0_4mm'); // sócalo trasero
    piezaSinCanto(acc, modulo, 'durolac', ancho, 75);

    var anchoPuerta = ancho - anchoPanelFijo;
    piezaPuerta(acc, modulo, 'melamina_color_18', anchoPuerta, 75, 'tapacanto_2_0mm');
    agregarHerraje(acc, modulo, 'manilla', 1);

    // Melamina blanca fija (59cm ancho x alto total del cuerpo del mueble)
    piezaVertical(acc, modulo, 'melamina_blanca_18', anchoPanelFijo, altoLateral, 'tapacanto_0_4mm');
    // Sócalo de color vertical (10cm ancho x alto total, tapacanto por el lado largo)
    piezaVertical(acc, modulo, 'melamina_color_18', 10, altoLateral, 'tapacanto_2_0mm');

    agregarHerraje(acc, modulo, 'bisagra_90', 2);

    return { puertas: 1, cajones: 0 };
  }

  // ---------------------------------------------------------------------
  // Registro de módulos disponibles (para la UI)
  // ---------------------------------------------------------------------

  var MODULOS = {
    base: {
      label: 'Mueble base',
      disponibleEn: ['recta', 'L', 'U'],
      campos: [{ key: 'ancho', label: 'Ancho (cm)', min: 20, max: 300, valorDefecto: 60 }],
      calcular: calcularMuebleBase
    },
    aereo: {
      label: 'Mueble aéreo',
      disponibleEn: ['recta', 'L', 'U'],
      campos: [{ key: 'ancho', label: 'Ancho (cm)', min: 20, max: 300, valorDefecto: 60 }],
      calcular: calcularMuebleAereo
    },
    aereo_campana: {
      label: 'Mueble aéreo campana',
      disponibleEn: ['recta', 'L', 'U'],
      campos: [{ key: 'ancho', label: 'Ancho (cm)', min: 40, max: 120, valorDefecto: 70 }],
      calcular: calcularMuebleAereoCampana
    },
    cajonera: {
      label: 'Cajonera',
      disponibleEn: ['recta', 'L', 'U'],
      campos: [
        { key: 'ancho', label: 'Ancho (cm)', min: 30, max: 150, valorDefecto: 60 },
        { key: 'cantidadCajones', label: 'Cantidad de cajones', tipo: 'select', opciones: [2, 3], valorDefecto: 3 }
      ],
      calcular: calcularCajonera
    },
    torre: {
      label: 'Torre horno/microondas',
      disponibleEn: ['recta', 'L', 'U'],
      campos: [],
      calcular: calcularTorre
    },
    superior_refrigerador: {
      label: 'Módulo superior al refrigerador',
      disponibleEn: ['recta', 'L', 'U'],
      campos: [{ key: 'ancho', label: 'Ancho (cm)', min: 30, max: 100, valorDefecto: 60 }],
      calcular: calcularSuperiorRefrigerador
    },
    despensa: {
      label: 'Mueble despensa',
      disponibleEn: ['recta', 'L', 'U'],
      campos: [{ key: 'ancho', label: 'Ancho (cm)', min: 50, max: 150, valorDefecto: 60 }],
      calcular: calcularDespensa
    },
    vitrina: {
      label: 'Mueble vitrina',
      disponibleEn: ['recta', 'L', 'U'],
      campos: [
        { key: 'ancho', label: 'Ancho (cm)', min: 30, max: 150, valorDefecto: 80 },
        { key: 'alto', label: 'Alto (cm)', min: 40, max: 250, valorDefecto: 210 },
        { key: 'fondo', label: 'Fondo (cm)', min: 20, max: 60, valorDefecto: 35 },
        { key: 'repisas', label: 'Cantidad de repisas', tipo: 'numero', valorDefecto: 3 },
        { key: 'conPuertas', label: 'Lleva puertas', tipo: 'checkbox', valorDefecto: true }
      ],
      calcular: calcularVitrina
    },
    esquinero: {
      label: 'Mueble esquinero (L)',
      disponibleEn: ['L', 'U'],
      campos: [
        { key: 'anchoBrazoIzq', label: 'Ancho brazo izquierdo (cm)', min: 40, max: 150, valorDefecto: 95 },
        { key: 'anchoBrazoDer', label: 'Ancho brazo derecho (cm)', min: 40, max: 150, valorDefecto: 95 }
      ],
      calcular: calcularEsquinero
    },
    esquinero_panel_ciego: {
      label: 'Esquinero panel ciego',
      disponibleEn: ['L', 'U'],
      campos: [{ key: 'ancho', label: 'Ancho total (cm)', min: 70, max: 150, valorDefecto: 90 }],
      calcular: calcularEsquineroPanelCiego
    }
  };

  function modulosDisponibles(forma) {
    var out = [];
    for (var key in MODULOS) {
      if (MODULOS[key].disponibleEn.indexOf(forma) !== -1) out.push(key);
    }
    return out;
  }

  // ---------------------------------------------------------------------
  // Cálculo de un módulo individual (para previsualizar antes de agregarlo)
  // ---------------------------------------------------------------------

  function calcularModulo(tipo, params, idModulo) {
    var def = MODULOS[tipo];
    if (!def) throw new Error('Tipo de módulo desconocido: ' + tipo);
    var acc = nuevoAcumulador();
    var resumen = def.calcular(acc, idModulo || tipo, params || {});
    return { tipo: tipo, params: params, idModulo: idModulo || tipo, acumulador: acc, resumen: resumen };
  }

  // ---------------------------------------------------------------------
  // Optimización de planchas: área total requerida / área de una plancha,
  // redondeado hacia arriba a múltiplos de 0.5 planchas.
  // ---------------------------------------------------------------------

  function planchasNecesarias(areaTotalM2, precios) {
    var areaPlancha = (precios.parametros.planchaAnchoCm * precios.parametros.planchaAltoCm) / 10000;
    if (areaTotalM2 <= 0) return 0;
    var crudo = areaTotalM2 / areaPlancha;
    return Math.ceil(crudo / 0.5) * 0.5;
  }

  // ---------------------------------------------------------------------
  // Cálculo del proyecto completo: agrega todos los módulos, aplica la
  // regla del cajón de 3 por defecto, optimiza planchas, aplica precios y
  // la fórmula final (sección 4).
  // ---------------------------------------------------------------------

  function calcularProyecto(modulosSeleccionados, precios, config) {
    config = config || {};
    var manoDeObraPct = (config.manoDeObraPct != null) ? config.manoDeObraPct : precios.parametros.manoDeObraPct;
    var ivaPct = (config.ivaPct != null) ? config.ivaPct : precios.parametros.ivaPct;

    var acc = nuevoAcumulador();
    var resumenModulos = [];

    var lista = modulosSeleccionados.slice();
    var tieneCajonera = lista.some(function (m) { return m.tipo === 'cajonera'; });
    if (!tieneCajonera) {
      // "Al calcular por metros lineales totales, siempre se debe agregar
      // 1 módulo de cajones de 3 cajones" — se aplica como mínimo del
      // proyecto si el usuario no agregó ninguna cajonera manualmente.
      lista.push({ tipo: 'cajonera', params: { ancho: 60, cantidadCajones: 3 }, idModulo: 'cajonera_auto', auto: true });
    }

    lista.forEach(function (m, idx) {
      var def = MODULOS[m.tipo];
      if (!def) throw new Error('Tipo de módulo desconocido: ' + m.tipo);
      var idModulo = m.idModulo || (m.tipo + '_' + idx);
      var resumen = def.calcular(acc, idModulo, m.params || {});
      resumenModulos.push({ idModulo: idModulo, tipo: m.tipo, params: m.params, auto: !!m.auto, resumen: resumen });
    });

    // --- Melamina / durolac: agregación de área por material y optimización de planchas ---
    var areaPorMaterial = {};
    acc.piezas.forEach(function (pieza) {
      var areaM2 = (pieza.anchoCm * pieza.altoCm) / 10000;
      areaPorMaterial[pieza.material] = (areaPorMaterial[pieza.material] || 0) + areaM2;
    });

    var detalleMelamina = [];
    var subtotalMelaminaTapacanto = 0;

    Object.keys(areaPorMaterial).forEach(function (materialKey) {
      var precioItem = precios.melamina[materialKey];
      if (!precioItem) throw new Error('Precio no encontrado para material: ' + materialKey);
      var planchas = planchasNecesarias(areaPorMaterial[materialKey], precios);
      var costo = planchas * precioItem.valor;
      subtotalMelaminaTapacanto += costo;
      detalleMelamina.push({
        key: materialKey, nombre: precioItem.nombre, areaM2: round2(areaPorMaterial[materialKey]),
        planchas: planchas, valorUnitario: precioItem.valor, costo: costo
      });
    });

    // --- Tapacantos ---
    var metrosPorTipo = {};
    acc.tapacantos.forEach(function (t) {
      metrosPorTipo[t.tipo] = (metrosPorTipo[t.tipo] || 0) + t.metros;
    });
    var detalleTapacanto = [];
    Object.keys(metrosPorTipo).forEach(function (tipoKey) {
      var precioItem = precios.melamina[tipoKey];
      if (!precioItem) throw new Error('Precio no encontrado para tapacanto: ' + tipoKey);
      var metros = metrosPorTipo[tipoKey];
      var costo = metros * precioItem.valor;
      subtotalMelaminaTapacanto += costo;
      detalleTapacanto.push({ key: tipoKey, nombre: precioItem.nombre, metros: round2(metros), valorUnitario: precioItem.valor, costo: costo });
    });

    // --- Herrajes (quincallería) ---
    var cantidadPorHerraje = {};
    acc.herrajes.forEach(function (h) {
      cantidadPorHerraje[h.key] = (cantidadPorHerraje[h.key] || 0) + h.cantidad;
    });
    var detalleHerrajes = [];
    var subtotalQuincalleria = 0;
    Object.keys(cantidadPorHerraje).forEach(function (key) {
      var precioItem = precios.quincalleria[key];
      if (!precioItem) throw new Error('Precio no encontrado para herraje: ' + key);
      var cantidad = cantidadPorHerraje[key];
      var costo = cantidad * precioItem.valor;
      subtotalQuincalleria += costo;
      detalleHerrajes.push({ key: key, nombre: precioItem.nombre, cantidad: cantidad, valorUnitario: precioItem.valor, costo: costo });
    });

    // --- Otros (cuarzo/postformado, otros servicios agregados manualmente por módulo) ---
    // No entra en la base de la Mano de Obra (ver más abajo): así lo confirmó el dueño del
    // negocio comparando contra Referencia/Plantilla Presupuesto.xlsx (celda H50).
    var detalleOtros = [];
    var subtotalCuarzoPostformadoOtros = 0;
    acc.otros.forEach(function (o) {
      var tabla = precios[o.categoria];
      var precioItem = tabla && tabla[o.key];
      if (!precioItem) throw new Error('Precio no encontrado para ítem: ' + o.categoria + '.' + o.key);
      var costo = o.cantidad * precioItem.valor;
      subtotalCuarzoPostformadoOtros += costo;
      detalleOtros.push({ key: o.key, categoria: o.categoria, nombre: precioItem.nombre, cantidad: o.cantidad, valorUnitario: precioItem.valor, costo: costo });
    });

    // --- Fórmula final (sección 4, ajustada según validación contra el Excel real) ---
    // IVA: solo sobre el subtotal de la sección Melamina (incluye Tapacanto y Durolac).
    var subtotalMelaminaTapacantoConIva = subtotalMelaminaTapacanto * (1 + ivaPct);
    // Total Materiales = Melamina+Tapacanto CON IVA + Cuarzo/Postformado/Otros SIN IVA + Quincallería SIN IVA.
    var totalMateriales = subtotalMelaminaTapacantoConIva + subtotalQuincalleria + subtotalCuarzoPostformadoOtros;
    // Mano de Obra = % sobre (Melamina SIN IVA + Quincallería) únicamente — NO sobre Cuarzo/Postformado/Otros,
    // y NO sobre el Total Materiales completo. Sin IVA. (Replica la celda H50 del Excel real.)
    var baseManoDeObra = subtotalMelaminaTapacanto + subtotalQuincalleria;
    var manoDeObra = baseManoDeObra * manoDeObraPct;
    // Valor Total al Cliente = Total Materiales + Mano de Obra. Sin IVA adicional al final
    // (el IVA ya quedó aplicado solo sobre Melamina+Tapacanto arriba).
    var valorTotalCliente = totalMateriales + manoDeObra;

    return {
      modulos: resumenModulos,
      detalle: {
        melamina: detalleMelamina,
        tapacanto: detalleTapacanto,
        herrajes: detalleHerrajes,
        otros: detalleOtros
      },
      subtotales: {
        melaminaTapacantoSinIva: round0(subtotalMelaminaTapacanto),
        melaminaTapacantoConIva: round0(subtotalMelaminaTapacantoConIva),
        quincalleria: round0(subtotalQuincalleria),
        cuarzoPostformadoOtros: round0(subtotalCuarzoPostformadoOtros),
        baseManoDeObra: round0(baseManoDeObra),
        totalMateriales: round0(totalMateriales),
        manoDeObra: round0(manoDeObra)
      },
      parametros: { ivaPct: ivaPct, manoDeObraPct: manoDeObraPct },
      valorTotalCliente: round0(valorTotalCliente)
    };
  }

  function round2(n) { return Math.round(n * 100) / 100; }
  function round0(n) { return Math.round(n); }

  return {
    MODULOS: MODULOS,
    modulosDisponibles: modulosDisponibles,
    calcularModulo: calcularModulo,
    calcularProyecto: calcularProyecto,
    planchasNecesarias: planchasNecesarias,
    _internal: { GROSOR_18: GROSOR_18, RIEL_DEFAULT_KEY: RIEL_DEFAULT_KEY }
  };
}));
