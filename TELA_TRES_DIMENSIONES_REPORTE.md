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
