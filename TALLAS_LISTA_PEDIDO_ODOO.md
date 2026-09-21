# Tallas desde la Lista de pedido de Odoo (21-sep-2026)

**Pedido de la usuaria (noche del 20-sep):** «en este listado está la WH y los códigos de las tallas y el
detalle de las tallas con el pedido; la idea es identificar cuál es S-M-L-XL-XXL y al frente poner la
cantidad; esto sirve para el control de piso, para que puedan ingresar las cantidades hechas».

## Qué trae el archivo (`Tarea_project.task85.xlsx`, hoja Sheet1, 3.706 filas)

| Columna | Qué es |
|---|---|
| Orden de producción | la WH — **solo en la primera fila de cada pack** (las siguientes vienen en blanco) |
| Lista Pedido | el pack: `PEDIDO ODC:… REF:2403: [2403] PACK 2403 CAMISETA SISA … CAFE -` — también solo en la primera fila |
| Lista Pedido/Líneas de LdM | **una fila por talla**, con la talla DENTRO del texto: `[2403] CAMISETA SISA … ESCO- S- CAFE -` |
| …/Ean | código de barras de esa talla (no se usa) |
| …/Cantidad | prendas pedidas de esa talla |

Formas en que Odoo escribe la talla (todas resueltas):

- entre guiones: `ESCO- S- CAFE -`, `RUCHES L- M- CAFE -` (el «L-» del nombre no es la talla);
- palabra completa: `BLANCO SMALL`, `MEDIUM`, `XLARGE`, `XXLARGE`, `XSMALL`;
- **pegada al color**: `SSSMOKED PEARLXSMALL`, `HOODIESLIGHT HEATHER GREYSMALL`;
- denim: `0R`, `2R`, … `10R` y también `0 R`, `2 R` (se unen: `2R`); `28X32`, `30X32`…; fleece `28- NEGRO`;
- trampas: `MEDIUM WASH` es un color, no una talla (la talla es `2R`); `[4757-AP] APLIQUE PEDRERIA…` es
  un insumo del pack, no una prenda; el pack puede decir `[3738]` y las líneas `[3735]` (la REF del pack
  identifica la prenda); debajo de una WH pueden venir **otros packs sin WH** (PALE KHAKI, OLIVINE, JAVA…): son
  **otras tareas sin orden de producción**, no colores de la misma WH.

## Cómo se lee (índice.html: `tallaDeLinea`, `planTallas` formato `odoo`)

1. La WH y el pack se **arrastran** hacia abajo hasta que aparezca el siguiente.
2. La talla es **lo que la línea agrega al nombre del pack**: se quitan las palabras del pack (primero enteras,
   luego por trozos, porque Odoo pega palabras) y lo que queda es la talla. Si no queda una sola palabra
   reconocible (sin columna de pack, o texto ambiguo), se toma la **última talla escrita** en el texto.
   Sobre el archivo real: 3.697 líneas por el pack, 8 por el texto, **0 sin talla**.
3. Los **alias** (SMALL → S, XLARGE → XL, MEDIUM → M, XSMALL → XS…) están en la tabla 16 (Configuración →
   Órdenes y materiales → Tallas, `S.params.tallasAlias`, editable, con bitácora). Lo que no calza con un
   alias se guarda tal cual (`2R`, `28X32`, `28`).
4. Una línea con **otro código que el pack y su REF** no es prenda: si además el código es el del pack con
   sufijo (`4757-AP`) o no tiene talla, va a «líneas que no son prenda» y **no entra**.
5. **Una fila sin WH pero con pack es OTRA tarea** (sin orden de producción todavía), no un segundo color de la WH de
   arriba — lo comprobó la revisión adversarial contra el archivo real: 56 tareas sin WH (310 líneas, 15.889 prendas).
   Se cuentan aparte («Tareas SIN orden de producción»), no se cargan, y entran cuando Odoo les dé WH. (Si alguna vez
   una WH trajera de verdad varios packs, se carga el que suma la cantidad de la orden o el que nombra su color; si no,
   se reporta.)
6. La cantidad se lee como número de Excel, `1092`, `1.092,00` o `1,092.00` (así exporta Excel a CSV; antes
   `1,092.00` se perdía).
7. La suma por talla se compara con la cantidad de la orden; si no cuadra se carga igual y queda marcada
   (`tallasPedidoMeta.dif`), como ya hacía la carga por tallas.
8. Una línea con **otro código que el pack y su REF** pero con talla (p. ej. «[ETIQ-M] ETIQUETA TALLA M») **no entra**
   y se lista para revisar. Líneas sin cantidad válida o antes de la primera WH se cuentan como descartadas.
9. Si la orden **ya tenía curva**, la previa dice cuántas cambian y, al aplicar, la anterior queda en
   `o.tallasPedidoAnt`; si hay avance registrado por talla en tallas que no vienen, avisa antes de aplicar.
10. Los alias de la tabla 16 **mandan también en qué es talla**: «UNICA=U» convierte «UNICA» en talla; «2XL» → XXL;
    «10/12», «6-8» y «28 X 32» son una sola talla. Sin juegos configurados no se avisa nada: se guardan tal como vienen.
11. El lector de CSV entiende comillas («"1,092.00"»), y sin la columna «Lista Pedido» la talla se toma del final del
    texto (antes caía en la columna de líneas y no cargaba nada).

## Dónde se carga

**Órdenes → Actualizar datos → 4 · Tallas del pedido** (`mActualizarDatos(4)`; el mismo lector acepta también
un archivo «largo» con columnas WH / talla / cantidad o uno «ancho» con una columna por talla). La vista previa
muestra: formato detectado, **cómo se leyó la talla** (línea de Odoo → talla, cantidad) para las primeras
líneas, órdenes encontradas, WH que no existen, sumas que no cuadran, tallas fuera de los juegos, líneas sin
talla, WH con varios packs sin resolver, líneas que no son prenda, y las **curvas leídas** (talla y, al frente,
la cantidad). Nada se guarda hasta «Aplicar»; al aplicar queda `o.tallasPedido`, bitácora y una fila en el
registro de cargas (`tipo:'tallas'`). El botón «Cargar pedido por tallas» de la tabla 16 sigue funcionando.

## Qué pasa después en el piso

`baseTallas(o,c)` ya usaba `tallasPedido` cuando no hay curva de corte: el registro por talla de Control de piso
(`mRegistroTallas`) y la tabla de tallas del tramo en Mi centro (`tablaTallasTramoHTML`) listan **cada talla con
su cantidad pedida** y el operario escribe lo hecho por talla. Sin curva seguían registrando solo el total.

## Resultado sobre el archivo real (contra el volcado del 14-sep que usa el simulador)

- 3.706 filas: **3.395 líneas de prenda con WH**, 310 de las 56 tareas sin WH y 1 aplique.
- 689 WH en el archivo → **595 existen** en el sistema (549 lanzadas abiertas, 46 cerradas); **94 no existen**
  todavía en ese volcado (WH/MO/293xx, más nuevas que la carga del 14-sep: en producción, con la última
  carga de tareas, entrarán); las «WH con varios packs» de la primera lectura eran en realidad tareas sin WH.
- **578 suman exactamente** la cantidad de la orden; 7 no (EXCEDENTES 12 vs 9, dos «Cross» de 9 vs 90, 162 vs
  168, 128 vs 220, 424 vs 414, 348 vs 342): se cargan y quedan marcadas para revisarlas.
- 0 líneas sin talla; 1 aplique excluido; 56 tareas sin WH aparte; 22 tallas distintas (XS…XXL, 0R…10R, 28X32…36X32, 28…36).
- Los **juegos de tallas** (tabla 16) están vacíos: la carga lo dice sin marcar aviso y no lo necesita — el orden de presentación es el del archivo (Odoo ya lista XS→XXL). Conviene crear los
  juegos «XS S M L XL XXL», «0R 2R 4R 6R 8R 10R», «28X32 30X32 32X32 34X32 36X32» y «28 30 32 34 36» cuando
  se decida por categoría.

Pruebas: bloque **TL** del simulador (formato Odoo, palabras pegadas, MEDIUM WASH, `1,092.00`, tareas sin WH, otro
código, alias desde la tabla (2XL, 10/12, UNICA), CSV con comillas, sin columna de pack, vista previa, aplicar, recarga
con curva anterior, registro por talla en piso, paso 4 de Actualizar datos).
El archivo de la usuaria **no se subió al repositorio** (datos de clientes); solo se usó para medir.
