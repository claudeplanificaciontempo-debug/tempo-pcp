# El requerimiento = todo lo anterior a Planificación (22-sep-2026)

**Decisión de la usuaria, 22-sep-2026:** «Todo lo que diga Planificación ya tiene tela: no me debería aparecer. Saquemos
una pequeña macro de todo lo que está de Planificación para arriba, que es todo mi requerimiento. Lo que necesito como
método de trabajo es ver qué me falta comprar a proveedores externos, poder organizarlo por mes, por proveedor y por tipo
de producto, y exportarlo.» Lo que está en proceso no entra: eso se concilia aparte.

---

## 1 · Qué cambió

**La base.** Hasta hoy, la Macro del mes y las Compras del mes miraban solo **tres fases marcadas a mano** en la tabla 1
(`0Macro`, `1Tejeduría`, `1CD Tintorería`): 122 órdenes. Ahora la base es **todas las fases anteriores a Planificación**,
derivada de la **secuencia** de la tabla 1 (la misma que ya decide qué es una devolución), no de una lista escrita en el
código: 11 fases, de `0Diseño` a `1INCOMPLETOS TIN`.

La marca sigue siendo una **columna editable** de la tabla 1 —ahora se llama **«requerimiento»** en vez de «montado»—, así
que si mañana quieres sacar o meter una fase, se toca ahí. La siembra corre **una sola vez**, deja en la bitácora qué fases
entraron, cuáles salieron y cuáles estaban marcadas antes, y **nunca vuelve a pisar** lo que edites.

**Las dos pantallas dicen la base.** Macro del mes y Compras del mes abren con «Base: todo lo anterior a
«2Planificacion» — lo que ya está en planificación o después ya tiene la tela», la lista de las 11 fases y el enlace a
donde se cambia. Se quitó el texto viejo que nombraba las tres fases fijas.

**Compras gana el mes de entrega y la exportación con formato.** Al agrupador (proveedor · tipo de material · mes del
Proyecto) se suma **mes de entrega (la más temprana)**, y el botón **«Exportar Excel»** saca un libro con hojas:

- **A comprar** — proveedor (en bandas), producto, código, tipo, cantidad con merma, unidad, cantidad base, órdenes, días
  del proveedor, **fecha límite para pedir**, disponibilidad, mes del Proyecto y mes de entrega.
- **Tela a tejer** y **Tela a tinturar** (pantone × tela) y **Tela plana** en metros: el requerimiento de tela propia.
- **Ya lo tenemos** — lo marcado como TEMPO/bodega, que no se pide.
- **Sin materiales** — las órdenes de la base que Odoo trajo sin una sola línea de material (ver abajo).
- **Qué es esto** — de dónde sale cada número, quién y cuándo lo sacó, y las brechas.

El CSV de siempre sigue ahí.

## 2 · Lo que se ve con los datos reales (volcado del simulador, medido hoy)

| | Antes | Ahora |
|---|---|---|
| Órdenes en la base | 122 | **786** (337.129 prendas) |
| Con líneas de material | — | 290 |
| Productos a comprar | — | **336** (292 insumos · 39 telas externas · 5 servicios) |
| Tela propia a tejer | — | **27.861 kg** en 31 telas |
| Líneas de tintorería (pantone × tela) | — | 199 · **37** líneas de tela plana |
| En bodega (no se piden) | — | 17 productos |

Por mes del Proyecto: septiembre 126 productos · octubre 119 · noviembre 60 · agosto 16 · diciembre 15.
Proveedores con más líneas: SEDETI/PUEBLA/SERVIMAQ 87 · POSSO PINEDA 74 · RUIZ GUEVARA 28 · ARAUZ SUÁREZ 21 · BOTO PERLA 16.

## 3 · Lo que falta y **no se inventa**

1. **496 órdenes de la base no tienen ninguna línea de material en Odoo**: 368 en `0Diseño` (169.796 prendas) y 128 en
   `0Recetas Insumos` (53.569). Su requerimiento **no se estima**: salen contadas aparte, en pantalla y en su propia hoja
   del Excel, con fase, cliente, estilo, prendas y entrega. Entran solas en cuanto el archivo traiga sus componentes.
   *Esto es lo que de verdad limita la macro hoy: más de la mitad de la base no tiene materiales cargados.*
2. **73 productos sin proveedor** y **64 sin disponibilidad definida** (no se asume ni comprar ni que ya está): van a las
   bandejas de Compras.
3. **Categorías de Odoo sin fila en la tabla 8** (aparecieron al ampliar la base): `INV / MP / JEAN IMPORTADOS` (3 líneas),
   `INV / MP / NUEVOS TEMPO / SERVICIO LAVADO` (1), más `INV / LAVANDERIA INDUSTRIAL` y
   `INV / INSUMOS / BOTONES METALICO JEANS`. Se listan una por una en la Macro; mientras no tengan fila, esos kilos no se
   calculan.

## 4 · Pruebas

Bloque **RQ** nuevo (8 comprobaciones): la fase Planificación sale de la tabla y no de una constante · la siembra marca
todas las anteriores y desmarca las demás, guarda el «antes» y deja bitácora · corre una sola vez y no pisa lo editado ·
entra lo anterior y no lo posterior · una orden sin materiales se cuenta aparte y se reporta · cada producto trae su mes
de entrega y se puede agrupar por él · las dos pantallas dicen la base con el enlace a la tabla 1 · Compras ofrece el Excel
con formato y el CSV. Dos pruebas viejas se ajustaron al cambio: la del botón de exportar y la de la tabla 8, que ahora
exige que las categorías faltantes **se reporten** (antes exigía que no existieran, algo que solo era cierto con la base de
tres fases).

## 5 · Pendiente de decidir

- **Fases 1Tejeduría / 1Tintorería / 1Calidad**: hoy entran al requerimiento (son anteriores a Planificación). Su tela
  propia ya está comprometida, pero sus **insumos** pueden faltar. Si prefieres que la tela de esas fases deje de pedirse,
  se quita la marca de esas tres filas y listo.
- **Órdenes en proceso** (de Planificación en adelante): quedaron fuera a propósito. La conciliación de «qué le falta a lo
  que ya está en proceso» es un trabajo aparte, como acordamos.
