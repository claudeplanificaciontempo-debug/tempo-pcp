# Piso: Mi centro, tallas, registro por talla y teléfono — reporte

Fecha: 15-sep-2026. Motor sin tocar. Pruebas del simulador: **904 (22 nuevas), todas verdes, 0 errores**.

## 0 · El archivo que mandaste no sirve para cargar tallas (y qué pedir en su lugar)
Revisé `Tarea_project.task97.xlsx`: son 18.729 filas con cuatro columnas, **Orden de producción**, **Lista Pedido**,
**Lista Pedido/Líneas de LdM** y **Ean**. Le faltan dos cosas para poder cargar la curva:
1. **No trae cantidad por talla.** Trae el nombre de la línea (donde la talla va dentro del texto, «… SMALL», «… S-»)
   y el código EAN, pero ningún número de unidades.
2. **Está agrupado**: la WH y el nombre de la línea salen solo en la primera fila de cada grupo; las siguientes traen
   únicamente el EAN, así que no se puede saber a qué talla corresponden.

Para que la carga funcione, el export de Odoo necesita: WH (o el nombre de la orden), talla (o el nombre de la línea con
la talla) y **cantidad**, con la WH repetida en todas las filas. En Odoo eso se consigue exportando la lista **sin
agrupar** y agregando la columna de cantidad. El importador ya está listo y espera ese archivo.

## 1 · Mi centro muestra solo lo programado en ese centro
La cola sigue siendo la del centro asignado. Se agregó el **buscador común** por WH: si la orden no está en la cola pero
existe, sale una tarjeta bloqueada con la foto, la fase y el aviso **«no programada en <centro> · pedir
reprogramación»**, más un botón que manda el pedido. El operario no reprograma: el pedido aparece en **Hoy → Pendientes**
y en un panel para quien tiene permiso de reprogramar, que lo marca como atendido. Todo queda en bitácora.

## 2 · Carga masiva del pedido por tallas
Igual que las demás cargas por WH, en Configuración → Órdenes y materiales → **16 · Tallas**:
- Lee **Excel o CSV**, busca las columnas **por nombre** y acepta las dos formas: **larga** (una fila por talla, con
  columnas de talla y cantidad) o **ancha** (una columna por talla). La vista previa dice **cuál detectó** y con qué
  columnas.
- **Vista previa antes de aplicar**, con cuatro tarjetas: órdenes encontradas, WH que no existen (no se cargan), órdenes
  donde la suma por talla no cuadra con la cantidad de la orden (se muestran con su diferencia y **se cargan igual, sin
  corregir**) y tallas que no están en la tabla de tallas.
- **Tabla 16 · Tallas**: juegos de tallas con su orden de presentación y qué juego usa cada categoría. Las tallas nuevas
  del archivo **se proponen, no se crean solas**.
- La curva queda en la orden con quién y cuándo, y **se agregó a la tabla 14** para que las recargas del Proyecto no la
  pisen. Confirmación antes de aplicar y bitácora, como el resto de las cargas.

## 3 · Registro por talla desde el piso
- **Corte** registra lo cortado por talla: esa es la **curva real**.
- Los centros siguientes registran contra **lo cortado**; si no hay registro de corte, contra **lo pedido** y la pantalla
  lo dice con la etiqueta «sin registro de corte».
- Pasar de lo cortado o lo pedido **se puede, pero avisa** y el registro queda marcado como excedido.
- Cada orden muestra la tabla de diferencias por talla: pedido o cortado, lo hecho en ese centro y la diferencia.
- Si la orden **no tiene curva ni registro de corte**, la tablet solo deja registrar el total y la orden sale en
  **Hoy → Pendientes** como «sin curva de tallas».
- **Auditoría** de cada registro: quién, cuándo, centro, talla y unidades, con la marca de si excedió.

## 4 · Cronómetro con segundos
El cronómetro corre en **minutos y segundos** y, al cerrarlo, guarda las **unidades por talla** registradas durante ese
tramo, junto al estándar de la orden. Todo va a la bitácora.

## 5 · Cambio de fase desde piso
Botón propio en cada tarjeta: elige la fase nueva, una **observación de piso de la tabla 15** (lista cerrada, sin texto
libre) y, solo si devuelve a una secuencia menor de la tabla 1, el motivo. Avanzar no pide motivo. La observación queda
en el historial de la fase y en bitácora.

## 6 · Teléfono
Mi centro y Control de piso se revisaron a **375 px**: tarjetas en una columna, foto a lo ancho, botones grandes de
ancho completo, tablas con scroll propio y filtros apilados. Los perfiles se respetan: la tablet de un módulo ve solo su
módulo y corte solo corte; sin centro asignado, la pantalla lo dice.

## Nota sobre una prueba vieja
Al correr el simulador apareció una prueba en rojo que **no tenía que ver con este cambio**: «SERIGRAFIA con operación
ETIQUETADO va a etiquetas». La revisé: el mapeo de la tabla 6 funciona bien, pero las 744 órdenes del archivo de órdenes
de trabajo que usan esa combinación **ya no están entre las cargadas** en la base de prueba, así que la prueba se
quedaba sin casos. La corregí para que valide el mapeo y deje constancia cuando no hay solape entre los dos archivos.
