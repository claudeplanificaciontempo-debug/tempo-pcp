# Compras del mes + Registrar hecho desde el centro — reporte

Fecha: 14-sep-2026. Commit `767e256`, versión 2026-09-14 13:25, pruebas 554/554. No se tocaron capacidades ni el motor
(salvo sacar el 15 fijo del proveedor, punto A-4, que tú pediste).

## A · Compras del mes (menú, junto a Macro del mes)

**Base.** Las mismas órdenes montadas que la Macro de tela, por Proyecto (hoy 120 órdenes). Lo que se muestra es todo lo
que viene de proveedores externos: **telas externas/importadas, insumos (etiquetas, cordones, botones, cierres…) y
servicios externos** (maquila, lavado, tintura). La tela propia sigue en Macro del mes (se teje, no se compra). El
origen sale de lo que ya existe: catálogo de productos (proveedor desde facturas), tabla 3 por categoría y la dimensión
de disponibilidad.

**Tabla.** Producto · Proveedor · Cantidad · Unidad · Órdenes, con la **merma de tintura** aplicada a la tela que se
tintura (marcada "+m"). Agrupable por **proveedor / tipo de material / mes**, anidado hasta 3 niveles; por defecto por
proveedor, que es la lista lista para pedir. Cada grupo trae el conteo y la suma. Exporta a CSV (agrupado por proveedor).

**Lo que ya está en bodega no se pide.** Un producto marcado en bodega (usuaria = TEMPO) va aparte, en "Ya lo tenemos",
para verificarlo; no entra a comprar. Un producto **sin disponibilidad definida** no se asume: va a la bandeja.

**Fecha límite para pedir.** Nueva tabla editable **Días de entrega por proveedor** (Configuración → Órdenes y
materiales), sembrada con los 127 proveedores del catálogo y el valor **en blanco, marcado "sin definir"** — los vas
llenando. Un proveedor sin días se reporta; **no se usa 15 por defecto**. Cuando el dato está, la pantalla muestra la
**fecha límite = fecha de entrega más temprana de las órdenes del producto − días del proveedor** (el tope para que
llegue antes del despacho; no descuenta el tiempo de producción, eso lo afinamos si lo quieres).

**Bandejas** (nada se asume): productos sin proveedor · productos sin disponibilidad definida · proveedores sin días de
entrega · productos con más de un proveedor (los que antes reportamos).

### Estado hoy (todo lo montado)
- **187 productos a comprar** de 25 proveedores: 176 insumos, 9 telas externas, 2 servicios de tintura.
- **13 productos ya en bodega** (no se piden).
- Bandejas: **0 sin proveedor**, **15 sin disponibilidad definida**, **21 con más de un proveedor**, 0 sin clasificar.
- **20 proveedores usados sin días de entrega** → sin fecha límite hasta que los llenes.

**Sobre el 15 del motor (punto A-4).** Saqué el `15` fijo de `rutaTextilDe`: la espera de tela externa ahora sale de la
tabla (el mayor de los días definidos de los proveedores de la orden; sin dato = 0, reportado en Compras, nunca 15). Las
7 órdenes que hoy tienen paso de proveedor conservan su `t=15` porque su ruta se armó en la carga anterior; **el valor
nuevo, por tabla, se aplica en la próxima recarga**, así que el plan de hoy no se movió. Cuando cargues días reales y
recargues, esas esperas pasan a ser las de cada proveedor.

## B · Registrar lo hecho desde la cola del centro

En **Programación del centro**, cada fila de la cola tiene un botón **✓ hecho**. Al pulsarlo se abre un cuadro para
escribir las prendas que salieron (por defecto el pedido completo). Al registrar:
- La orden **sale de la cola** y queda **disponible para el centro siguiente** según su ruta: se ve "lista para
  Bordado / Confección / …" (o "terminada" si era la última etapa).
- Queda **quién, cuándo y cuántas** en el **mismo avance de piso** (los turnos que ya alimentan reportería), no en un
  registro paralelo, y en la **bitácora**.
- **Marcar hecho no reprograma nada**: la orden ya estaba planificada; esto solo avisa que está libre.
- Se puede **deshacer con motivo obligatorio** (revierte el avance y el turno, queda en bitácora).

**Completo, no parcial (por ahora).** En corte y los demás centros se marca cuando se termina todo. Los módulos podrían
registrar parcial (100 de 200), pero está **preparado y apagado** (`S.params.modulosParcial`, hoy false): hasta que cada
módulo tenga su tablet, todos completo.

**Diferencia.** Si la cantidad registrada es distinta a la de la orden, avisa y **deja registrar igual** (faltantes
reales), y la marca como **diferencia** (en el cuadro "Hecho hoy" sale en rojo "N faltan").

**Avance visible en la cola.** Bajo cada cola, un cuadro **"Hecho hoy en <centro>"** distingue lo ya hecho de lo
pendiente, con el **total de prendas del día**, la diferencia y para qué centro quedó lista, y el botón de deshacer.

Control de piso se queda como está, para cuando haya tablets en los módulos.

## Código
- Compras: `comprasMes`, `dispProducto`, `diasProveedor`/`sembrarDiasProveedor`/`diasProvDe`/`diasProvOrden`,
  `arbolCOMP`/`filasArbolCOMP`, `vCompras`, `exportarComprasCSV`; tabla en Config (ordenes2). Motor: `rutaTextilDe` usa
  `diasProvOrden(o)||0` en vez de 15.
- Registro: `marcarHechoCentro`/`confirmarHechoCentro`/`deshacerHechoCentro`, `centroSiguiente`, `permiteParcial`,
  `regHechoOk`; dato en `avance.hechoC[centro]` (ts, u, pz, pedido, dif, rec, turnoDelta). Turnos reciben las piezas
  reales. Sin cambios en `programar()`.
- 10 pruebas nuevas en cada feature (554/554).
