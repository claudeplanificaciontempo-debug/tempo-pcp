# ID de tarea de Odoo como identidad de la orden — 19-sep-2026

Decisión de la usuaria (19-sep, antes de salir en vivo): el archivo de tareas de Odoo trae el **ID de la tarea**;
con ese ID se enlaza la orden aunque todavía no tenga WH, y cuando la WH llegue (o cambie) la orden sigue siendo la
misma. Así no hay que depender de cliente + proyecto + stilo + color + ODC para reconocer una orden sin WH.

## Cómo exportar

En la exportación de tareas de Odoo, agregar el campo **ID** (queda como columna «ID»). La app acepta también «Id»,
«ID de tarea», «ID tarea», «Tarea ID», «Identificador», «External ID» e «ID externo» (`COLUMNAS_ID_TAREA`). Sirve
cualquier valor estable (número o identificador externo); se compara sin mayúsculas ni espacios.

**La columna es opcional.** Un archivo sin ella se carga como hasta ahora (reconocimiento por WH o por la clave sin
WH) y **no borra** los ID que las órdenes ya tengan; la vista previa dice «el archivo no trae la columna ID».

## Reglas (`claveOrden`, `clavesDeOrden`, `indiceClaves`, `planTarea`, `aplicarTarea`)

1. **Clave de la orden**: `tarea:<id>` si hay ID; si no, `op:<WH>`; si no, `sin:<cliente|proyecto|stilo|color|ODC>`.
   El id interno de una orden nueva con ID es `tarea_<id>`; **el id de una orden existente nunca cambia**.
2. **Todas las claves valen para reconocer**: el índice guarda, por orden, la de tarea y además la de WH (o la sin WH).
   Por eso las **órdenes de trabajo y las fotos siguen entrando por WH** sin cambios.
3. **Cruce al cargar una fila con ID**: primero por el ID; si la tarea no está enlazada todavía, por la WH (orden
   cargada antes sin ID) o por la clave sin WH; la orden queda **enlazada** al ID (bitácora «enlazada a su ID de
   tarea»). Sin ID: como siempre (WH; sin WH → WH una sola vez por la clave anterior).
4. **Sin WH → WH por el ID**: misma orden, WH nueva, la etiqueta anterior queda en `claveAnterior`; la vista previa
   lo cuenta en «pasaron de sin WH a WH» con «(ID de tarea N)».
5. **Sin WH con ID**: entra aunque le falten componentes de la clave (ya no es «clave incompleta»); etiqueta
   **«SIN WH · ID N»**. `lanzada()` la sigue tratando como sin WH.
6. **Conflicto**: la fila trae la WH de una orden que **ya tiene otro ID**. La fila **no se aplica**, la orden queda
   como estaba, marcada `tareaIdConflicto` (bandeja **«Órdenes con ID de tarea distinto en el archivo — revisar»** en
   Hoy → Pendientes) y **no** cuenta como «no está en el archivo». La marca se queda mientras los archivos no traigan
   el ID (o no traigan la columna) y **se quita sola** cuando el archivo vuelve a traer, para esa orden, el ID que tiene
   aquí. Dos órdenes con el mismo ID en el sistema salen como «claves repetidas».
7. Se ve en la ficha de la orden («ID tarea N»), en el buscador (campo «ID de tarea (Odoo)»), en la vista previa de
   «Actualizar datos» (cabeceras con ID, enlazadas, conflictos), en la bitácora de cada carga y en Configuración →
   Órdenes → «Clave única de orden» (cuántas tienen ID).

## Pruebas

Bloque **K7** de `test/driver.js` (26 comprobaciones): claves y clavesDeOrden; archivo sin columna; archivo con
columna sobre el volcado real (WH existente enlazada, sin WH existente enlazada, sin WH nueva solo con ID, WH nueva con
ID, nada cuenta como «no vino», bitácora, índice por WH y por ID, ficha, buscador, repetidas); archivo sin columna
después (nadie pierde su ID); sin WH → WH por el ID; conflicto (no se aplica, marcada, bandeja, no noArchivo, se
conserva con archivo sin ID, se quita al volver el ID). Harness completo: 2.552 comprobaciones, 0 errores.

## Fase: sin WH manda Odoo (misma tarde)

Mientras la orden no tenga WH en el sistema, la fase se toma del archivo en cada carga (diseño, recetas, compras…), también en
la carga en que recibe la WH. Desde que tiene WH, la fase la mueve la planta aquí y el archivo no la pisa (bandeja «no calzan»,
como antes). Interruptor «Sin WH manda Odoo» en la fila fase de la tabla 14 (`faseOdooSinWH`, 1 por defecto; 0 = se conserva
siempre). La vista previa de «Actualizar datos» cuenta las órdenes sin WH cuya fase cambia. Pruebas K8 (8 comprobaciones).
