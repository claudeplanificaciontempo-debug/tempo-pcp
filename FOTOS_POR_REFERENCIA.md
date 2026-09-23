# Fotos por referencia (estilo) — 22-sep-2026

**Pedido de la usuaria:** mandó una carpeta de Drive con 9 fotos —`4861.jpg` … `4869.jpg`— diciendo «este link son
nuevas». Son fotos de **referencias (estilos) nuevas**: ninguna de esas nueve existe todavía en las órdenes cargadas.

## 1 · Por qué no entraban

Hasta hoy la app cargaba fotos **por WH**: un CSV exportado de Odoo con las columnas `Orden de produccion` y `Avatar`
(la imagen en base64). Cada foto se sube al almacenamiento como `<WH>.jpg` y se indexa en `S.params.fotosIdx` por WH.

Una foto cuyo nombre es el **código del estilo** no tiene por dónde entrar en ese camino, y menos si la referencia
**todavía no tiene órdenes**: no hay WH a la que colgarla.

## 2 · Qué se construyó

**Una foto por referencia sirve para todas las WH de ese estilo, incluidas las que todavía no llegaron de Odoo.**

- **Dónde**: Órdenes → **Actualizar datos → 3 · Fotos**, debajo de la carga por CSV de siempre. Se eligen las
  imágenes (varias a la vez) y **el nombre de cada archivo es el código del estilo**: `4861.jpg` → referencia 4861.
- **Vista previa antes de subir nada**: cuántas imágenes, cuántas referencias **ya tienen órdenes** (la foto sale
  enseguida en todas sus WH), cuántas **no tienen órdenes todavía** (se guardan igual y se cuelgan solas cuando
  lleguen), cuántas reemplazan una foto anterior, y qué archivos se descartan (no son imagen, nombre repetido).
- **Quién manda**: la foto **propia de la orden** manda siempre; la de la referencia se usa solo cuando esa orden no
  tiene la suya, y la miniatura lo dice en el tooltip («Foto de la referencia 4861 — esta orden no tiene la suya»).
- **No se escribe nada en las órdenes**: la foto se resuelve al dibujar (`fotoDe` → `fotoRefDe`). Por eso una orden
  que llegue mañana con esa referencia la hereda sola, sin volver a cargar.
- **Almacenamiento**: mismo bucket, con prefijo propio `ref_<codigo>.jpg`, así no choca con las fotos por WH. Las
  imágenes pasan por el mismo `normalizarFoto` (JPG, lado mayor acotado, calidad configurada) que la carga por WH.
- **Registro**: tipo de carga propio `fotosRef` en el registro de cargas, resumen en `S.params.fotosRefCarga` y una
  línea en la bitácora con cuántas subieron, cuántas reemplazaron y cuántas quedaron esperando órdenes.

Funciones nuevas: `refDeOrden`, `fotoRefPath`, `fotoRefURLde`, `fotoRefDe`, `fotoFuenteDe`, `ordenesDeRef`,
`planFotosRef`, `previaFotosRefHTML`, `leerFotosRef`, `aplicarFotosRef`. `fotoDe` gana el último escalón (referencia) y
`fotoMini` el tooltip. El resto del sistema no cambia: todas las listas ya usan `whCell`/`fotoMini`, así que la foto
aparece sola en Órdenes, Liberación, Control de piso, Mi centro, Tintorería, Producto en proceso y los centros.

## 3 · Cómo cargar estas nueve

1. En Drive, **descargar la carpeta** (se baja como .zip) y descomprimirla.
2. En la app: **Órdenes → Actualizar datos → 3 · Fotos**, en el bloque de abajo elegir las 9 imágenes.
3. Mirar la previa: las nueve dirán «sin órdenes todavía» mientras esas referencias no vengan de Odoo. Es lo
   esperado; súbelas igual.
4. **Subir las fotos por referencia.** Cuando la próxima carga de tareas traiga órdenes de esos estilos, la foto ya
   está puesta.

Si alguna de esas referencias ya tiene órdenes en producción (el volcado del simulador es del 14-sep), la foto
aparecerá en ellas apenas termine la subida.

## 4 · Pruebas

Bloque **FR** (7 comprobaciones): el nombre del archivo es la referencia y se descarta lo que no es imagen o está
repetido · la previa separa las referencias con órdenes de las que no y lo explica · todas las WH del estilo muestran
la foto sin tocar la orden · la ruta en el almacenamiento lleva prefijo propio y no choca con las fotos por WH · la
foto propia de la orden manda y la pantalla dice cuál se ve · una orden que llega después hereda la foto sola · la
carga queda registrada con su tipo.
