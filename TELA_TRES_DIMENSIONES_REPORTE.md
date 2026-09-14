# Origen de tela: tres cosas distintas, no una — reporte

Fecha: 2026-09-14. Commits `f6ecf52` → `8152832`. Pruebas locales: 444/444. Producción recalculada y guardada 09:23.

## 1 · Respuesta directa: cuánta carga de tejeduría se quita

**Cero.** Las telas planas importadas **no estaban cargando tejeduría**, por dos razones que se comprobaron en
producción antes de tocar nada:

1. En la tabla 3 (categoría → origen) `PLANA IMPORTACION` ya era **EXTERNA** y `NUEVOS TEMPO / TELA IMPORTADA
   TINTURADA` **EXTERNA TEÑIDA**; la marca TEMPO de tu catálogo MP-IN no intervenía en la ruta ni en la carga: solo la
   usaba la macro (origen del producto), y ahí esas 4 líneas salían COMPRADO con la etiqueta "contradicción".
2. Todas las líneas de plana vienen en **metros** (230 líneas en 121 órdenes abiertas) y el cargador solo tomaba líneas
   en kg: no entraban a la orden como tela, ni a tejeduría ni a tintorería.

Antes y después del cambio, tejeduría programada: **260 h · 3.045 kg** en los dos casos; 413 órdenes con paso de
tejeduría en los dos casos; suma de kg de tela propia 35.835 en los dos casos.

Las cuatro "contradicciones" (01018720, 01018722, 01018728, 01018729 — LINEN LIKE, OXFORD CHINA, GABARDINA CHINA PFD)
ya no existen como tales: son **externa · en bodega · qué le falta según la orden**.

## 2 · Las tres dimensiones (cómo quedó)

Por cada línea de tela de la orden (`o.telas[i]`):

| Dimensión | Valores | De dónde sale | Qué decide |
|---|---|---|---|
| **Quién la produce** (`produce`) | propia · externa · sin clasificar | Tabla 3 por categoría (PROPIA → propia; EXTERNA y EXTERNA TEÑIDA → externa; SIN CLASIFICAR → sin clasificar) | propia = paso y carga de **tejeduría** |
| **Disponibilidad** (`disp`) | teje · bodega · pedir · sin dato | propia → teje; catálogo MP-IN con proveedor TEMPO → **bodega**; externa sin esa marca → **pedir** (como antes: espera proveedor); sin clasificar → sin dato | pedir = paso de **proveedor** (15 días, valor que sigue en código: pendiente parametrizar) |
| **Qué le falta** (`falta`) | tintura · lavado de tela · nada | Propuesta: tabla 13 (palabras del nombre del producto: TINTURAD/TEÑID → nada; PFD/CRUD → tintura) y, sin palabra, la categoría (EXTERNA TEÑIDA → nada; lo demás → tintura). **La persona confirma o cambia en Liberación** (`faltaConf`: quién, cuándo, valor anterior) | tintura o lavado = paso y carga de **tintorería** |

- Líneas en **metros** ahora entran a la orden convertidas por kg/m de la tabla 9. Ninguna plana tiene kg/m hoy →
  entran con **0 kg y marca "sin kg"** (230 líneas): no cargan tintorería ni entran a la ruta textil hasta que se
  cargue el kg/m; salen en el reporte de la Parte 2 ("telas en metros sin kg/m") y en Liberación con la etiqueta.
- Líneas "sin clasificar" (categoría PLANA, RIB, JERSEY… en tabla 3) tampoco entran a la ruta textil: se reportan.
- La ruta textil de la orden sale de las líneas (aunque alguna no tenga tela del catálogo): propia → tej; pedir →
  proveedor; tintura/lavado con kg → tin.

Producción, líneas de tela de órdenes abiertas por combinación: propia/teje/tintura **618** (35.414 kg) · externa/bodega/nada
32 · externa/bodega/tintura 36 · externa/pedir/nada 4 · externa/pedir/tintura 17 · sin clasificar 59 (todas las
externas y sin clasificar con 0 kg por venir en metros).

## 3 · La decisión se toma en Liberación

Liberación (a la planta), columna nueva **"Tela · qué le falta (propuesta del catálogo → confirmar)"**: por cada tela
de la orden, su nombre y kg (o "sin kg"), dos casillas **[ ] tintura [ ] lavado de tela** (excluyentes; ninguna =
nada) y la marca "(propuesta)" hasta que alguien la confirme; al confirmar queda "✓ nombre" con fecha. Cambiarla
ajusta la ruta textil de la orden (aparece o desaparece el paso de tintorería), recalcula sus kg de tintorería y queda
en la bitácora. Permiso: perfiles con "liberar" o "programa".

## 4 · Lavado de tela = tintorería

- No hay centro nuevo. Una tela marcada "lavado de tela" entra a los baños como un baño más, con un "color" propio
  interno (**LAVADO DE TELA**, familia oscuro, creado en el catálogo de colores la primera vez) para que no se mezcle
  con las tinturas de la orden y vaya a máquinas de oscuros; las horas del baño son las de **color oscuro** configuradas
  (`hOscuro`).
- Ojo: existe además el parámetro "Horas lavado" (`hLavado`, 3 h) que usa la familia de color *lavado* de los colores
  tipo BLEACH; es otra cosa y no se tocó.

## 5 · Jaspe y llano

Se quitó la regla: en la Macro del mes ya no se calculan baños "separados"; los baños por pantone × tela se cuentan
juntos y el tipo (JASPE/LLANO) queda solo como información. En el motor de tintorería nunca hubo separación.

## 6 · Lo que cambió en producción al recalcular (guardado 09:23)

- 691 órdenes: 769 → 924 líneas de tela (las 230 en metros ahora existen con sus tres dimensiones y 0 kg).
- **3 rutas cambiaron**, las tres por la misma causa: `CUBE LYCRA - TINTURADO …` está en `NUEVOS TEMPO / TELA TINTURADA
  (EXTERNA)`, que la tabla 3 clasifica PROPIA (NUEVOS TEMPO no tiene excepción para ese cuarto nivel) y la palabra
  TINTURADO propone "nada" → quedaron con tejeduría y sin tintorería (WH/MO/27763, 27765, 27766, todas ya en
  fases 5/8/Facturado, sin carga real). Lo correcto es agregar en la tabla 3 la excepción `NUEVOS TEMPO / TELA TINTURADA
  (EXTERNA) → EXTERNA TEÑIDA`; es tu tabla, no la toqué.
- Ninguna orden ganó o perdió paso de tejeduría ni de proveedor. Kg y horas de tejeduría iguales (sección 1).

## 7 · Pendientes que salen de esto

1. Tabla 9: **kg/m de las planas** (PLANA IMPORTACION, PLANA, LINO, OXFORD, JEAN IMPORTADOS, TELA IMPORTADA TINTURADA):
   sin eso, 230 líneas en 121 órdenes no pueden cargar tintorería ni lavado de tela.
2. Tabla 3: excepción `NUEVOS TEMPO / TELA TINTURADA (EXTERNA)` (sección 6) y decidir las categorías SIN CLASIFICAR
   (PLANA, RIB, JERSEY, PUÑOS, CUELLOS, LYCRA, SPANDEX…).
3. Los 15 días de proveedor siguen escritos en el código (auditoría A-…): parametrizar cuando decidas.
4. La recarga de la Parte 2 recalcula las tres dimensiones desde el archivo; las confirmaciones hechas en Liberación
   (`faltaConf`) viajan con la OP y la tela (como fotos, fases y ajustes por referencia).

## 8 · Corrección del 14-sep (mañana): la plana va en METROS, tandas propias, excepción en la tabla 3

Commit `274e6a4`, pruebas 459/459, producción recalculada y guardada 09:42.

**Metros, no kilos.** Se quitó toda conversión metros → kilos (también en la macro). Una línea de plana queda con
`ud:'m'` y sus metros (`m`); los kilos no se calculan: vienen del rollo y se escriben en la tanda de tintorería. Si
falta un dato, se ve (la línea dice "sin kg" / "sin metros"). Dónde se ven los metros, aparte de los kilos: lista de
órdenes ("1.356 m (plana)"), ficha, Liberación (chips por tela), Macro del mes (tabla propia "Tela plana · METROS",
no sumada con las telas de punto). En producción: 230 líneas, 37.178 m en 691 órdenes; 121 órdenes abiertas con
plana (32.215 m). Merma de plana 12–15 %: anotada como referencia tuya, no se calcula.

**Sección de tela plana en Tintorería** (panel "Tela plana · tandas"): la plana no entra al esquema de baños por color.
- Pendientes de tanda: líneas de plana de órdenes liberadas a la planta que necesitan tintura o lavado (por tela y
  orden, con metros pendientes).
- Una tanda = **una tela**, en la **máquina grande** configurada, con las **horas por tanda** configuradas (tiempo de
  máquina, no ritmo). Se marcan las líneas, se ajustan los metros que van, y se escriben los **kilos de esos rollos**.
- Si los kilos superan la capacidad de la máquina, **aviso** en pantalla; no se impide (la tanda queda marcada "pasa").
- Se guarda el lote (tela, metros, kilos, quién, cuándo) y se muestra el **promedio real metros/kilo por tela** con el
  número de lotes; solo como referencia.
- La tanda confirmada entra al programa de tintorería como un baño más (`banos_conf` tipo plana): máquina fija, horas
  configuradas, kilos puestos a mano; se ve en el cuadro y en "Tandas confirmadas"; "Deshacer" la saca y conserva el lote.
- **Configuración → Calendario y parámetros (Tintorería)**: "Tela plana: horas por tanda" y "Tela plana: máquina
  grande". Ninguno viene con valor de fábrica: hasta que los pongas, el panel lo dice y no deja armar tandas.

**Excepción tabla 3**: `NUEVOS TEMPO / TELA TINTURADA (EXTERNA) → EXTERNA TEÑIDA`, agregada en producción y en la
siembra. Las 3 CUBE LYCRA vuelven a externa (comprada, teñida).

**Qué cambió en las rutas de producción** al pasar la plana a metros (51 órdenes): la plana con propuesta "tintura"
ahora sí agrega el paso de tintorería (antes, al no existir la línea, la orden no tenía paso textil). Órdenes abiertas
con plana: 121; 18 tienen paso de tintorería solo por la plana, 7 esperan proveedor (disponibilidad "pedir"), 78 ya
estaban liberadas a producción (no cambian), 4 líneas ya aparecen en "pendiente de tanda". **3 órdenes** quedaron con
paso de tejeduría solo por una plana en categoría NUEVOS TEMPO (PROPIA en la tabla 3, sin excepción para ese cuarto
nivel): decidir en la tabla 3 qué cuartos niveles de NUEVOS TEMPO son externos.

## 9 · Plan mensual (14-sep)

- **Días y personas junto a la capacidad**: "Capacidad del mes por área" muestra días (con su desglose) y una columna
  "Con qué se calcula" (módulos, personas, minutos efectivos/día; máquinas y h/día en textil). "Estructura de módulos"
  muestra por módulo días del mes, minutos efectivos por día (personas × minutos × eficiencia) y capacidad del mes.
- **Carga de confección del mes por tipo de producto**: panel nuevo con agrupar anidado (familia, categoría, módulo,
  cliente) y filtros por casillas, línea "Aplicado:", órdenes / prendas / horas / % de lo visible / % de la capacidad
  del mes de los módulos.
- Pendiente de tu decisión: las 44 órdenes de septiembre con Estado OP = done sin facturar (7.051 pz, $ 37.188), hoy
  fuera del plan como historia; en Odoo cuentan como "por entregar".

## 10 · Prenda terminada y "la fase decide" (14-sep, 09:58)

Commit `95a994b`, pruebas 466/466. Producción guardada 09:58.

**Tabla 1 (grupo prenda terminada)**: 8Exportacion, 8Novedades, 8Cross → sin carga (como estaban). 8Embodegado → sin
carga + **paso extra "etiquetas"** con los minutos del parámetro `minEtiqEmbodegado` (Configuración → Calendario y
parámetros, sembrado en 1; en 0 o vacío el paso queda sin tiempo y sale en bandeja). 8Centro Distribucion → sin carga
+ **"sin medir"**: bandeja visible en Órdenes ("carga real sin medir": hoy 10 órdenes · 970 prendas). 8Empaque,
8Servicios y Terminados, 8Botones, 8Lavanderia y 8Lavanderia Quito sin cambio. Las dos columnas nuevas de la tabla 1
(paso extra / sin medir) son editables.

**La fase decide, no el Estado OP** (cargador de la Parte 2): historia = fase con sistema "cerrada" (Facturado,
Stand by); cancelada = fase que contenga "cancel"; fuera de rango = fecha pasada y fase cerrada. El Estado OP solo se
reporta (done o cancel en fase abierta = contradicción visible). Aplicado en producción sin recargar: 46 órdenes done
sin facturar vuelven al plan (7.480 prendas; 44 de septiembre) y entran 27 órdenes done en fases de prenda terminada
con fecha pasada que antes quedaban fuera de rango (9 de septiembre, 18 de agosto y mayo). 7 Stand by con fecha pasada
siguen en el sistema como stand by (fuera del plan).

**Cuadre contra Odoo (fase sin FAC/STAN/CAN)** con el archivo del 13-sep:

| Mes | Sistema ahora | Odoo (usuaria) | Diferencia |
|---|---|---|---|
| Agosto | 40 · 5.028 · $ 40.275 | 40 · 5.028 · $ 40.274,88 | 0 |
| Septiembre | 342 · 63.306 · $ 416.719 | 341 · 63.026 · $ 413.778,84 | **WH/MO/28463** (8Cross, 280 pz, $ 2.940): estaba abierta en el archivo del 13-sep y ya se facturó en Odoo |
| Octubre | 162 · 50.873 · $ 308.836 | 352 · 133.661 · $ 5.361.859,88 | Odoo tiene 190 órdenes nuevas desde el archivo; el precio raro solo se puede revisar con un archivo nuevo |
| Noviembre | 104 · 66.146 · $ 331.832 | 239 · 138.432 · $ 543.920,98 | órdenes nuevas desde el archivo |
| Diciembre | 4 · 815 · $ 5.929 | 175 · 69.106 · $ 315.762,82 | órdenes nuevas desde el archivo |

Las 8 órdenes de diferencia de septiembre (333 → 341): las 9 done con fecha pasada que estaban fuera de rango
(WH/MO/29014, 28641, 28643, 28614, 28626, 28463, 28532, 28534, 28550) menos WH/MO/28463, ya facturada en Odoo.

**Carga por centro, antes → después** (minutos programados, todo el horizonte / septiembre): Etiquetas 1.406 → **2.817**
(+1.411 = 7 órdenes en 8Embodegado × 1 min × 1.411 prendas); Confección 580.692 / 476.629, Corte 11.353, Botones
22.794 / 22.388, Empaque 25.641 / 21.769, Estampado 3.167: **sin cambio**; tejeduría 260 h sin cambio. Las 46 + 27
órdenes reabiertas están en fases sin carga, así que suman demanda (prendas y dólares) pero no minutos.

**Órdenes sin fecha de entrega (4, para corregir en Odoo)**: WH/MO/23498 (14 pz), 23499 (82), 23503 (24), 23505 (24) —
Comercializadora de Ropa Fashion Club, ODC POLOS-AVIÓN / POLOS-SIN AVIÓN, estilo ESMA, Polo Basica, CADET NAVY,
fase 8Embodegado, Estado OP done, proyecto DICIEMBRE 2025.
