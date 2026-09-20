# Maestro de productos — origen y proveedor por producto (19-sep-2026)

Archivo de la usuaria: `Maestro_Productos_Tempo_v2.xlsx` (3.276 productos de Odoo: Referencia Interna, Nombre, Unidad de
Medida, Proveedor, Categoría de Producto, Elaboración propia (Tempo), Pendiente por completar). Regla dictada: **todo lo que
dice TEMPO lo hacemos nosotros** (fábrica: recepción, tintorería, sala de producción). Los productos **sin proveedor** son nuevos o
no comprados todavía: se completan en la próxima carga.

## Qué hay en el archivo (medido)

3.276 productos · **1.505 TEMPO / elaboración propia** · 913 con proveedor externo · **858 sin proveedor**. Unidades: kg 1.637 ·
Uds 1.029 · m 559 · g 51. Nivel 2: MP 2.165 · INSUMOS 793 · PT 124 · GASTOS MAQUILA 92 · QUIMICOS 62 …
Telas (MP) por tipo de Odoo: NUEVOS TEMPO 998 (todas TEMPO) · PLANA 307 (72 sin proveedor, en metros) · RIB 221 (154 TEMPO,
15 sin) · JERSEY 207 (160 TEMPO, 11 sin) · FLECCE TEMPO 60 · LYCRA 50 (13 sin) · … **El origen es por producto, no por
categoría**: RIB y JERSEY tienen productos TEMPO y productos de FABRINORTE/INTELA/DISTRITEX. Por eso la tabla 3 (por categoría)
no alcanzaba.

Cruce con el volcado de órdenes: 2.830 de 2.837 códigos de los materiales están en el maestro (MP: 1.936 de 1.941). Unidades
iguales en órdenes y maestro (0 diferencias).

## Qué hace la app

**Configuración → Órdenes y materiales → tabla 12 · Catálogo de productos → «Cargar maestro de productos»** (permiso
`ordenes` o `config`): vista previa (nuevos, actualizados, TEMPO, con proveedor, sin proveedor, «se conserva el proveedor de
aquí», cambios de proveedor, telas por tipo de Odoo, cruce con las órdenes cargadas: códigos en el maestro, telas con origen,
telas sin proveedor) → Aplicar → guarda `S.params.maestroProductos[cod]={nombre,udm,prov,propia,ruta,pend,ts,archivo,
provConservado}`, bitácora, registro de cargas (`tipo:'maestro'`), y ofrece **recalcular las telas de las órdenes abiertas**.

- **Origen por producto** (`origenPorMaestro(cod)`): TEMPO / propia → **PROPIA** (se teje aquí); otro proveedor → **EXTERNA**
  (llega cruda; si llega teñida lo dice la tabla 13 por palabras); sin proveedor → `null` → decide la **tabla 3** por
  categoría (y si tampoco, «SIN CLASIFICAR», como antes). Manda en `planTarea` (al cargar), `dimensionesTela` y
  `lineasTelaDe`. Proveedor de la línea: facturas → maestro → catálogo de la usuaria.
- **Un producto que vuelve sin proveedor no borra el que tenía** (marca «conservado» en la tabla 12).
- **Proveedores nuevos** entran a la tabla de días de entrega como los demás: con el estimado general (`DIAS_PROV_EST`)
  marcado «estimado», editable.
- **`armarTelasDe(materiales,rep)`** es la única función que arma las telas de una orden (la carga y el recálculo la comparten).
  **`recalcularTelasOrdenes(aplicar)`** / botón «Recalcular telas de las órdenes»: rehace telas, origen y ruta textil de las
  órdenes abiertas con el maestro y las tablas 3/8/13 **sin volver a cargar Odoo**; conserva «qué le falta» confirmado y el
  color por tela; vista previa (cuántas cambian, cuántas ganan/pierden receta) y bitácora; idempotente.
- **Tabla 12 agrupada por proveedor**, con **«(sin proveedor)» siempre primero** (lo que falta completar), casilla «solo
  productos de las órdenes cargadas», columnas unidad, tipo de Odoo, proveedor (maestro / facturas / usuaria), origen (con la
  fuente), líneas en órdenes.

## Qué NO resuelve el maestro (sigue pendiente)

- **Tabla 8 · tela del catálogo**: el maestro dice quién hace cada producto, no a qué tela de tintorería equivale. Las
  categorías sin tela (NUEVOS TEMPO, TELA TEJIDA, LYCRA, JEAN IMPORTADOS, PLANA, JERSEY, SPANDEX, RIB, FLECCE TEMPO, FLECCE SIN
  PERCHAR) siguen dejando la orden «sin receta de tela» hasta que se llene la columna tela de la tabla 8 (y se pulse
  «Recalcular telas»). Sobre el volcado: 583 órdenes abiertas con materiales, 83 cambian de origen con el maestro, 0 ganan
  receta (eso es tabla 8).
- **Días de entrega reales** por proveedor (hoy todos con el estimado general).
- Los 858 productos sin proveedor (48 de ellos telas de órdenes cargadas) quedan en el grupo «sin proveedor» hasta la
  próxima carga del maestro.

Pruebas: bloque **MA** de `test/driver.js` (17 comprobaciones) sobre el maestro real (fixture local, no publicada:
`test/fixtures/maestro_rows.json` en `.gitignore`). Harness: 2.611 comprobaciones, 0 errores.

## Qué le falta a la tela: por origen (misma noche)

Regla dictada: **lo que tiene Pantone es lo que tintura TEMPO**; los otros proveedores no tienen Pantones (materia prima); las planas no
se tinturan; y no se quiere decidir orden por orden en Liberación. Tabla 13 → «Sin palabra, según el origen de la tela»: PROPIA → tintura ·
EXTERNA → nada · EXTERNA TEÑIDA → nada · SIN CLASIFICAR → según el Pantone del color de la orden (editable, con bitácora). La palabra del
producto (TINTURADO, TEÑID, CRUDO, PFD) sigue mandando. Con el maestro real y el volcado: 40 órdenes cuyas telas son todas de proveedor
quedan sin tintorería (ruta proveedor → corte); 616 de 651 telas TEMPO van a tintorería (las 35 restantes dicen TINTURADO en el producto).
Pruebas MB (7). Harness: 2.618 comprobaciones, 0 errores.
