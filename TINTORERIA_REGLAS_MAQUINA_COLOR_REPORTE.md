# Tintorería: reglas de máquina y color cerradas — reporte

Fecha: 14-sep-2026 (noche). Commit `8453443`, versión 2026-09-14 19:59. Pruebas 635/635 (4 nuevas). No se tocaron
capacidades ni tiempos de baño.

## 1 · Roles y regla automática (motor)

Configuración → Centros y recursos, rol de color:

| Máquina | Rol | Cap. | Cap. piqué |
|---|---|---:|---:|
| DANITECH 1 | **CLARO** | 240 | 200 |
| DANITECH 2 | **OSCURO** | 240 | 200 |
| STUART | **AMBOS** | 40 | 0 |

Regla que ahora aplica el motor solo (`maqApta` en `programar()`), sin fijar máquina a mano:
- **claro** (TCX 11 o clasificado CLARO) → solo máquinas con rol claro (DANITECH 1).
- **oscuro** (TCX 18–19 o clasificado OSCURO) → solo rol oscuro (DANITECH 2).
- **medio** (TCX 12–17 o clasificado MEDIO) → cualquiera de las dos grandes; el motor elige la que tenga espacio y
  fecha más temprana.
- **STUART** recibe lo que cabe en 40 kg **y no lleva piqué** (STUART tiene capacidad piqué 0). Regla que ya existía:
  un baño confirmado que cabe en una pequeña va solo a las pequeñas.
- Color **sin clasificar** → no se restringe (cualquier máquina) y aparece en la bandeja "Colores sin profundidad".

Antes, el motor adivinaba claro/oscuro por el nombre del color (`profColor`); eso se quitó. Solo cuentan el código TCX
y lo clasificado a mano.

Los 42 baños que estaban con máquina fija pasaron a **automática** (bitácora: "Rearmado tintorería: 42 baños pasan de
máquina fija a automática…"). Si quieres forzar uno, sigue existiendo "mover baño" en la tarjeta.

## 2 · Los 16 colores: todos clasificados (0 pendientes)

CLAROS: BLANCO, CRUDO, CRUDO COMBINADO, CELESTE, ARENA, LIGHT HEATHER GREY, ALMOND OIL ·
OSCUROS: AZUL MARINO, VINO, CAFE, CONCORD GRAPE, GREEN GABLES JAS, OCEAN BLUE ·
MEDIOS: MERMAID PINK, ROSADO COMBINADO, AZUL COMBINADO. Quedaron con `profConf` (clasificación tuya, no del código);
bandeja de colores sin profundidad: **vacía**. Con eso se armaron **17 baños nuevos** (LIGHT HEATHER GREY salió en 2 porque
no cabía en uno).

**Ojo**: SURF SPRAY (2 baños, WH/MO/28955 y 28989) sigue **sin profundidad** (no tiene TCX y no estaba en tu lista de
16); el motor lo puso donde había espacio (uno en cada DANITECH). Si me dices CLARO/MEDIO/OSCURO lo clasifico.

## 3 · Baños chicos y STUART: solo uno cumple la regla

Regla pedida: "< 40 kg y tela no piqué → STUART". Resultado real:

| Baño | Kg | Telas | ¿STUART? |
|---|---:|---|---|
| CONCORD GRAPE-01 | 24 | Jersey lycra | **Sí** (único que cumple todo) |
| OLIVINE-02 | 5 | Piqué + Piqué lycra + Jersey/Ribb 24/1 | No: lleva piqué |
| GREEN GABLES-03 | 23 | Piqué + Jersey/Ribb 24/1 | No: lleva piqué |
| FLINT-01 | 28 | Piqué lycra | No: es piqué |
| EGRET-04 | 35 | Piqué + Galleta + Ribb/Jersey 24/1 | No: lleva piqué |
| SURF SPRAY-02 | 14 | Piqué + Jersey/Ribb 24/1 | No: lleva piqué |
| LIGHT HEATHER GREY-02 | 30 | Piqué lycra + Ribb 2x2 liviano | No: lleva piqué |
| GREEN-01 | 18 | Jersey 24/1 + Ribb 24/1 | No: **STUART no tiene Jersey 24/1** en sus telas |
| CRUDO-01 · CAFE-01 · BLANCO-01 | 27 · 37 · 37 | Jersey 24/1 + Ribb 24/1 | No: mismo motivo (Jersey 24/1) |
| ARENA-01 | 33 | Galleta | No: STUART no tiene Galleta |

Los 5 que nombraste (OLIVINE 5, GREEN 18, GREEN GABLES 23, FLINT 28, EGRET 35) **no van a STUART por tu propia regla**:
cuatro llevan piqué (son remanentes mezclados de baños de piqué) y GREEN lleva Jersey 24/1, que no está en la lista de
telas de STUART (tiene solo: Ribb 24/1, Jersey lycra, Ribb 6x6, Jersey 30/1, Ribb 30/1, Ribb 2x2 liviano).
No cambié esa lista ni la capacidad piqué de STUART porque son capacidades. Dos decisiones tuyas:
1) ¿Agrego **Jersey 24/1 y Galleta** a las telas de STUART? Con eso GREEN, CRUDO, CAFE, BLANCO y ARENA (5 baños, 152 kg)
   se van solos a STUART y liberan las grandes.
2) ¿STUART puede teñir piqué (capacidad piqué > 0)? Si sí, dime cuántos kg; entrarían los 6 remanentes con piqué.

## 4 · Inicio del programa

`inicio`: 2026-09-07 → **2026-09-15** (bitácora). Todo lo programado arranca el 15-sep.

## 5 · Cómo queda el rearmado (56 baños programados de 59 confirmados)

| Máquina | Baños | Kg | Por profundidad |
|---|---:|---:|---|
| DANITECH 1 (claro) | 26 | 2.695 | 12 claros · 13 medios · 1 sin clasificar (SURF SPRAY-01) |
| DANITECH 2 (oscuro) | 29 | 3.405 | 23 oscuros · 5 medios · 1 sin clasificar (SURF SPRAY-02) |
| STUART (ambos) | 1 | 24 | CONCORD GRAPE (oscuro) |
| **Total** | **56** | **6.124** | |

Los 3 confirmados que no aparecen en el programa: TRUE RED-01 (WH/MO/28521), POMEGRANATE-01 (28950) y POMEGRANATE-02
(28220): sus órdenes ya están tinturadas/en calidad según piso, así que el motor no las vuelve a teñir (parte de la
contradicción Odoo vs piso que sigue pendiente de tu decisión).

**Llenado en las grandes (55 baños):** 18 llenos (≥ 95 %), 2 entre 70 y 95 % (SUNLIGHT-01 75 %, FRENCH BLUE-01 73 %) y
**35 por debajo del 70 % → piden confirmación** (2.205 kg en total). Detalle de los 35:

| Baño | Máq. | Kg | % | Baño | Máq. | Kg | % |
|---|---|---:|---:|---|---|---:|---:|
| OLIVINE-02 | D2 | 5 | 3 | LIGHT HEATHER GREY-02 | D1 | 30 | 15 |
| SURF SPRAY-02 | D2 | 14 | 7 | CAFE-01 | D2 | 37 | 15 |
| GREEN-01 | D1 | 18 | 7 | BLANCO-01 | D1 | 37 | 15 |
| CRUDO-01 | D1 | 27 | 11 | EGRET-04 | D1 | 35 | 18 |
| GREEN GABLES-03 | D2 | 23 | 11 | VINO-01 | D2 | 48 | 20 |
| FLINT-01 | D2 | 28 | 14 | CADET NAVY-03 | D2 | 41 | 21 |
| ARENA-01 | D1 | 33 | 14 | AZUL COMBINADO-01 | D2 | 53 | 22 |
| CRUDO COMBINADO-01 | D1 | 46 | 23 | SWEET LILAC-01 | D2 | 52 | 26 |
| ALMOND OIL-01 | D1 | 52 | 26 | KENTUCKY BLUE-02 | D1 | 53 | 26 |
| MERMAID PINK-01 | D1 | 62 | 26 | OCEAN BLUE-01 | D2 | 52 | 26 |
| CHANTERELLE-01 | D1 | 65 | 27 | BIRCH-04 | D1 | 56 | 28 |
| ORCHID HAZE-01 | D1 | 58 | 29 | PINK SUNSET NEON-01 | D1 | 58 | 29 |
| DOESKIN-01 | D2 | 71 | 35 | PRIMROSE PINK-01 | D1 | 73 | 36 |
| SMOKED PEARL-01 | D2 | 73 | 37 | GREEN GABLES JAS-01 | D2 | 95 | 40 |
| PORT ROYALE-02 | D2 | 104 | 52 | AZUL MARINO-01 | D2 | 125 | 52 |
| TRUE RED-01 (oct) | D2 | 118 | 59 | DARK BLACK-04 | D2 | 121 | 60 |
| ROSADO COMBINADO-01 | D1 | 144 | 60 | CELESTE-01 | D1 | 143 | 60 |
| BALLERINA-01 | D1 | 155 | 64 | | | | |

Son casi todos remanentes (el último baño de cada color) y colores con una sola WH. Se pueden juntar solo si aceptas
mezclar colores, cosa que el sistema no hace; la alternativa es esperar más tela del mismo color o teñirlos así con tu
confirmación.

## Qué cambió en el sistema
- `maqApta(r,b)` en `programar()`: rol de la máquina contra `profundidadDe(color)`; reemplaza el adivinado por nombre.
- Test viejo alineado a la regla nueva y 4 tests nuevos (claro→rol claro, oscuro→rol oscuro, medio→cualquiera de las
  grandes, chico sin piqué→pequeña) con máquinas, colores y órdenes temporales.
- Producción: STUART rol `ambos`; 42 baños a máquina automática; 17 baños nuevos de los 16 colores; `inicio` 15-sep. Todo
  en bitácora.

## Pendientes tuyos
- SURF SPRAY: clasificar (CLARO/MEDIO/OSCURO).
- STUART: ¿agregar Jersey 24/1 y Galleta a sus telas? ¿capacidad piqué?
- Los 35 baños < 70 %: confirmar así o esperar tela.
- Siguen: 7 órdenes Odoo 1Tintoreria vs piso "baño salido"; foto WH/MO/29252; tabla 6 "T-BIANCO-SINTEC(COMPACTADORA)".
