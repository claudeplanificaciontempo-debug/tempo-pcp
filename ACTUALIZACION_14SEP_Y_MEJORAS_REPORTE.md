# Actualización completa 14-sep (PROYECTO + OT + fotos) y mejoras B–G — reporte

Fecha: 14-sep-2026 (tarde). Commits `43a2967`, `adc37a9`. Versión 2026-09-14 18:42. Pruebas 631/631 (10 nuevas). No se tocó
el motor de programación.

## A · Actualización desde Odoo (Odoo manda en todo)

Cargado en producción a las 18:31–18:37 con tu instrucción de que **Odoo manda en todo, incluida la fase**: para esta
carga desactivé la conservación de **fase** y **fecha** (tabla 14), y luego la volví a dejar como estaba.

- **PROYECTO.xlsx**: 4.249 cabeceras · 64.844 líneas de componentes. La columna nueva "Semanas" no afectó: el lector
  busca las columnas por nombre. Cargadas 1.223 órdenes: **1.194 actualizadas · 29 nuevas · 15 eliminadas** (las 15
  tenían decisiones de persona; ya no vienen en el archivo). 3.026 excluidas (entrega pasada y no abiertas) · 5 sin
  fecha → bandeja.
- **Fases**: **157 órdenes cambiaron de fase** por el archivo (11 de ellas eran las que se habían movido aquí). Se
  aceptaron todas; **no** quedaron en la bandeja (bandeja de fases: 0). Ej.: WH/MO/28868 4 Calidad Producción →
  0Adquisición; las 7 de tintorería (29127, 29215, 28483, 28382, 28395, 28219, 28342) volvieron a 1Tintoreria.
- **Se conservó** lo que pediste y lo que no era fase: fotos 656, historial de fases 1.194, bitácora, ajustes por
  referencia y rutas editadas (0, no había), **y además** programación por centro 505 (puestos/recursos), módulo fijado
  238, avance de piso 685, OT 685. No estaban en tu lista pero borrarlos sin preguntar era peor; si quieres limpiarlos,
  dímelo y lo hago aparte.
- **Orden_de_trabajo.xlsx**: 27.475 filas · 4.000 órdenes en el archivo · **695 cruzan** con el sistema · **1.275
  centros cerrados** · 201 contradicciones fase vs OT (Órdenes → Reporte OT) · 1 centro de Odoo sin fila en la tabla 6:
  "T-BIANCO-SINTEC(COMPACTADORA)".
- **Fotos**: 665 filas en el CSV (partido en dos por el límite de 10 MB del cargador): **664 subidas** (651 reemplazaban
  una existente) · **1 error**: WH/MO/29252 (HTTP 502 del almacenamiento, reintentar). **669 órdenes con foto**, 554 sin.

**Ojo, contradicción heredada**: las 7 órdenes de tintorería que reverti al mediodía volvieron a **1Tintoreria** porque
Odoo manda, pero piso sigue diciendo que su baño **ya salió** (avance `tinturada`). Por eso no entran a armar baños
(el motor no tiñe lo que piso dice tinturado). Ver §C.

## B · Reversión del movimiento de WH/MO/28300

La bitácora muestra que el arrastre **no movió** la 28300 ("del puesto 1 al 1"): lo que hizo fue **numerar la cola
completa de Corte** (525 órdenes) — y esa numeración cambió el orden del motor (antes iba por prioridad y fecha) y atrasó
las 35. Reversión hecha: quité los puestos que puso esa numeración (536 órdenes vuelven a "sin puesto"), la cola vuelve
al orden anterior, y las **35 advertencias quedaron atendidas** (0 pendientes). Todo en bitácora.

**Advertencias por movimiento**: la tabla de Advertencias de fecha ahora es **una línea por movimiento** (cuándo, quién,
qué hizo, N órdenes, cuáles con meta → estimada) y un botón "atender las N".

## C · Tintorería: todo lo de 1Tintoreria a baños con máquina

**Cómo distingo claro de oscuro**: el sistema ya tenía una profundidad por color (`fam`: claro / medio / oscuro) y una
lectura del **código Pantone TCX** (el prefijo numérico dice la profundidad). El problema: al cargar, todo color sin dato
queda como "medio" por defecto — eso **no** es clasificación. Regla que dejé: cuenta solo **claro/oscuro explícitos, el
código TCX, o lo que confirmes a mano**; "medio" por defecto = sin clasificar. Nada por parecido de nombre.
Bandeja nueva en Tintorería: **"Colores sin profundidad"** (con selector CLARO / MEDIO / OSCURO por color, a bitácora).

**Armado hecho** (37 baños nuevos, 42 confirmados en total):

| Máquina | Baños | Kg | Colores |
|---|---:|---:|---|
| DANITECH 1 (claros) | 6 | 870 | BIRCH |
| DANITECH 2 (oscuros y medios) | 33 | 4.045 | DARK BLACK, CADET NAVY, PORT ROYALE, SMOKED PEARL, GREEN GABLES, FLINT, FRENCH BLUE, OLIVINE, TRUE RED (oscuros) · SWEET LILAC, EGRET, KENTUCKY BLUE, SUNLIGHT, DOESKIN, PINK SUNSET NEON, BALLERINA, CHANTERELLE, ORCHID HAZE, PRIMROSE PINK, GREEN (medios por TCX) |

Los **medios** los mandé a DANITECH 2 (su rol ya era "oscuros y medios"). **STUART (pequeña)**: no recibió nada porque
fijé la máquina por color como pediste; los baños chicos que quedaron en las grandes se pueden pasar a STUART con
"mover baño" si prefieres.

**16 colores sin clasificar** (siguen esperando en Armar baños, bandeja): ALMOND OIL, CONCORD GRAPE, LIGHT HEATHER GREY,
MERMAID PINK, GREEN GABLES JAS, AZUL COMBINADO, OCEAN BLUE, VINO, AZUL MARINO, CRUDO, CAFE, BLANCO, CRUDO COMBINADO,
ROSADO COMBINADO, CELESTE, ARENA. Varios son obvios (BLANCO, CRUDO, CELESTE…) pero no los asigno por nombre: clasifícalos
en la bandeja y los armo.

**Fase 1Tintoreria: 22 órdenes → 9 en baños**. Las 13 fuera: 5 por color sin clasificar (27308 AZUL COMBINADO, 28296
CONCORD GRAPE, 29013 y 29062 AZUL MARINO, 28497 GREEN GABLES) y **7 con baño ya registrado como salido en piso**
(28204 POMEGRANATE, 28219/28382 SURF SPRAY, 28342/28395 POMEGRANATE, 28483 CELESTIAL, 29127 PORT ROYALE, 29215 NEGRO)
— la contradicción del §A: Odoo dice tintorería, piso dice salió. Dime cuál manda y las ajusto.

## D · Fotos · E · Fecha de salida · F · Color en Producto en proceso · G · Hoy en tarjetas

- **Fotos** en miniatura (clic = ampliar): Tintorería → baños confirmados (cada orden del baño), Calidad de tintorería,
  Control de piso → Tintorería (órdenes de cada baño), y Producto en proceso (lista por orden).
- **Fecha estimada de salida**: en Baños confirmados ("Máquina · sale (est.)" desde el programa) y en Control de piso →
  Tintorería (columna "Sale (est.)"). Por orden, "Tela lista (est.)" en Producto en proceso y en el detalle de ruta.
- **Producto en proceso → Producción**: lista por orden (foto, cliente, ODC, categoría, color, etapa actual, pasos
  pendientes, tela lista, termina) **agrupable por cliente, ODC, familia, categoría, COLOR y etapa**, con buscador.
- **Hoy**: tres tarjetas desplegables e independientes — **Pendientes · 11 tipos · 688 casos**, **Advertencias de fecha**
  (movimientos, órdenes, y "283 no llegan según el programa" tras la recarga) y **Otros** (centro-mes sin capacidad).
  Cada una recuerda si la dejaste abierta.

## Pendientes tuyos
- Clasificar los 16 colores (bandeja) para armar sus baños.
- Decidir las 7 de tintorería con baño salido en piso vs fase Odoo.
- Reintentar la foto de WH/MO/29252.
- Tabla 6: centro "T-BIANCO-SINTEC(COMPACTADORA)".
