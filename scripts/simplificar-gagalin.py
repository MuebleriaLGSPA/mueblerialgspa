"""
SIMPLIFICACIÓN DE CONTORNOS DE LA FUENTE GAGALIN
------------------------------------------------
Gagalin es una fuente de pincel: cada letra tiene en promedio ~440 segmentos
de contorno (Montserrat ~23). En celulares eso hace lento el cálculo de
diseño y el dibujo del texto. Este script reduce los puntos de cada contorno
sin cambiar visiblemente la forma:

  1. Convierte cada contorno (curvas cuadráticas TrueType) en una línea densa.
  2. Aplica Ramer-Douglas-Peucker: elimina los puntos que se desvían menos de
     TOLERANCIA unidades de la forma original.
  3. Mantiene intactos: ancho de cada letra (avance), kerning (GPOS),
     caracteres disponibles (cmap) y el resto de las tablas.
  4. Deja solo los caracteres latinos que usa el sitio y guarda en woff2.

Uso (requiere Python 3 con fonttools y brotli: pip install fonttools brotli):
  python scripts/simplificar-gagalin.py <original.woff2> assets/fuentes/gagalin-latin.woff2 [tolerancia]

El original se descargó de: https://db.onlinewebfonts.com/t/240a7cb10b49b02c94ceddc459d385a9.woff2
Licencia de la fuente: CC BY 4.0 (ver assets/fuentes/LICENCIAS.txt).
"""
import math
import sys

from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont

origen, destino = sys.argv[1], sys.argv[2]
TOLERANCIA = float(sys.argv[3]) if len(sys.argv) > 3 else 2.0  # en unidades de la fuente
PASO = 4.0  # distancia aproximada entre muestras al convertir curvas en línea


def aplanar_contorno(puntos, curvas):
    """Contorno TrueType (puntos + bandera on-curve) -> lista de puntos de una línea cerrada."""
    n = len(puntos)
    if n == 0:
        return []
    # Punto de inicio sobre la curva (si no hay ninguno, el punto medio entre dos de control)
    inicio = next((i for i in range(n) if curvas[i]), None)
    if inicio is None:
        p0 = ((puntos[0][0] + puntos[1][0]) / 2, (puntos[0][1] + puntos[1][1]) / 2)
        secuencia = [(p, False) for p in puntos]
    else:
        p0 = puntos[inicio]
        secuencia = [(puntos[(inicio + k) % n], curvas[(inicio + k) % n]) for k in range(1, n + 1)]
    salida = [p0]
    actual = p0
    control = None
    for p, en_curva in secuencia:
        if en_curva:
            if control is None:
                salida.append(p)
            else:
                salida.extend(muestrear_cuadratica(actual, control, p))
                control = None
            actual = p
        else:
            if control is not None:
                # Dos puntos de control seguidos: punto implícito en el medio
                medio = ((control[0] + p[0]) / 2, (control[1] + p[1]) / 2)
                salida.extend(muestrear_cuadratica(actual, control, medio))
                actual = medio
            control = p
    if control is not None:
        salida.extend(muestrear_cuadratica(actual, control, p0))
    if len(salida) > 1 and salida[-1] == salida[0]:
        salida.pop()
    return salida


def muestrear_cuadratica(a, c, b):
    largo = math.dist(a, c) + math.dist(c, b)
    pasos = max(2, int(largo / PASO))
    return [
        ((1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
         (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1])
        for t in (k / pasos for k in range(1, pasos + 1))
    ]


def distancia_a_segmento(p, a, b):
    if a == b:
        return math.dist(p, a)
    dx, dy = b[0] - a[0], b[1] - a[1]
    t = max(0.0, min(1.0, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)))
    return math.dist(p, (a[0] + t * dx, a[1] + t * dy))


def rdp(puntos, eps):
    """Ramer-Douglas-Peucker iterativo (lista abierta)."""
    if len(puntos) < 3:
        return puntos
    conservar = [False] * len(puntos)
    conservar[0] = conservar[-1] = True
    pila = [(0, len(puntos) - 1)]
    while pila:
        i, j = pila.pop()
        dmax, idx = 0.0, None
        for k in range(i + 1, j):
            d = distancia_a_segmento(puntos[k], puntos[i], puntos[j])
            if d > dmax:
                dmax, idx = d, k
        if idx is not None and dmax > eps:
            conservar[idx] = True
            pila.extend([(i, idx), (idx, j)])
    return [p for p, c in zip(puntos, conservar) if c]


def simplificar_cerrado(puntos, eps):
    if len(puntos) < 4:
        return puntos
    # Se parte el contorno cerrado en el punto más lejano al inicio para no perder esquinas
    lejos = max(range(len(puntos)), key=lambda k: math.dist(puntos[0], puntos[k]))
    tramo1 = rdp(puntos[: lejos + 1], eps)
    tramo2 = rdp(puntos[lejos:] + [puntos[0]], eps)
    resultado = tramo1[:-1] + tramo2[:-1]
    if len(resultado) >= 3:
        return resultado
    # Manchas muy pequeñas de la textura: se conserva su forma mínima (4 puntos extremos)
    extremos = [min(puntos, key=lambda p: p[0]), min(puntos, key=lambda p: p[1]),
                max(puntos, key=lambda p: p[0]), max(puntos, key=lambda p: p[1])]
    orden = sorted(set(extremos), key=lambda p: puntos.index(p))
    return orden if len(orden) >= 3 else puntos


fuente = TTFont(origen)
glyf, hmtx = fuente["glyf"], fuente["hmtx"]
antes = despues = 0
for nombre in fuente.getGlyphOrder():
    glifo = glyf[nombre]
    if glifo.isComposite() or glifo.numberOfContours <= 0:
        continue
    coords, fines, banderas = glifo.getCoordinates(glyf)
    pen = TTGlyphPen(None)
    ini = 0
    for fin in fines:
        pts = [tuple(coords[k]) for k in range(ini, fin + 1)]
        curv = [bool(banderas[k] & 1) for k in range(ini, fin + 1)]
        ini = fin + 1
        antes += len(pts)
        linea = simplificar_cerrado(aplanar_contorno(pts, curv), TOLERANCIA)
        linea = [(round(x), round(y)) for x, y in linea]
        # quita puntos repetidos tras redondear
        limpia = [p for k, p in enumerate(linea) if p != linea[k - 1]] or linea
        if len(limpia) < 3:
            continue
        despues += len(limpia)
        pen.moveTo(limpia[0])
        for p in limpia[1:]:
            pen.lineTo(p)
        pen.closePath()
    nuevo = pen.glyph()
    nuevo.recalcBounds(glyf)
    glyf[nombre] = nuevo
    avance, _ = hmtx[nombre]
    hmtx[nombre] = (avance, nuevo.xMin if hasattr(nuevo, "xMin") else 0)  # avance intacto

# Sin instrucciones de hinting (no aplican a contornos nuevos)
for tabla in ("fpgm", "prep", "cvt ", "hdmx", "LTSH", "VDMX"):
    if tabla in fuente:
        del fuente[tabla]

# Caracteres latinos (mismo rango que el subconjunto anterior). Se probó dejar solo los del español:
# la fuente pesa 6 KB menos pero el cálculo de diseño no mejora, así que se mantiene el latín completo.
rangos = [(0x20, 0x7E), (0xA0, 0xFF), (0x2013, 0x2014), (0x2018, 0x201E), (0x2022, 0x2022), (0x2026, 0x2026), (0x20AC, 0x20AC)]
opciones = Options()
opciones.flavor = "woff2"
opciones.layout_features = ["*"]  # conserva kerning y demás características tipográficas
opciones.hinting = False
opciones.name_IDs = ["*"]
opciones.notdef_outline = True
subsetter = Subsetter(options=opciones)
subsetter.populate(unicodes=[c for a, b in rangos for c in range(a, b + 1)])
subsetter.subset(fuente)
fuente.flavor = "woff2"
fuente.save(destino)
print(f"Tolerancia {TOLERANCIA}: puntos de contorno {antes} -> {despues} ({100 * despues / max(antes, 1):.0f}%) · guardado en {destino}")
