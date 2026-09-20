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

## Revisión adversarial (19-sep, 4 lentes, 36 hallazgos confirmados) — lo que cambió

- **Un solo formato de ID**: `normTareaId` guarda y compara siempre el número de la tarea (6113, «6113», «6113.0», « 06113» y
  «__export__.project_task_6113_9f3a» son la misma tarea). Cambiar la forma de exportar entre dos cargas ya no convierte todo en conflicto.
- **Freno por conflicto masivo**: si al menos N filas (`minConflictosIdFreno`, 5) y más del % (`pctConflictosIdFreno`, 50) de las cabeceras con
  ID chocan con el ID que ya tienen sus órdenes, la vista previa avisa en rojo «el archivo trae OTRO identificador» y aplicar exige APLICAR.
  Parámetros visibles en Alcance de las cargas.
- **La tarea vuelve sin WH**: la WH NO se quita (la orden seguiría en planta); se conserva, queda marcada `whSinOdoo` (ficha, bandeja
  «Tareas que vinieron sin WH» en Hoy, bitácora) y la marca se quita sola cuando vuelve con su WH, o con «Ya lo revisé».
- **Otra tarea con los mismos cinco datos** que una sin WH ya enlazada (con o sin WH nueva) **entra como orden nueva**: el conflicto solo
  existe cuando chocan por la WH.
- **La misma WH en dos filas con ID distinto** (`whRepetida`): no entra ninguna, se reporta; la orden existente queda «clave repetida — revisar»
  y no cuenta como «no vino».
- **La tarea quiere una WH que ya es de otra orden** (`whDeOtra`): la fila no entra, la tarea queda marcada (ficha explica de quién es la WH),
  la otra orden no se toca.
- **Cambio de WH de la misma tarea**: se cuenta aparte («cambiaron de WH»), la anterior queda en `o.whAnteriores` (se ve en la ficha) y la
  bitácora lo dice UNA vez (la línea de «clave anterior» tampoco se repite en cada carga).
- **Fuera de alcance con ID sobre una orden sin enlazar**: se reconoce (`existeId`) y queda «fuera de alcance», no «no viene en el archivo».
- **Clave repetida en el archivo** sobre una orden existente: se decide en `planTarea` (`repSaltadas`, `repExistentesIds`): ninguna fila entra y
  TODAS las órdenes que comparten esa clave quedan como están; vista previa y carga cuadran.
- **Conflicto de ID «pegajoso»**: desde la ficha, con permiso `programa` o `config`, «Aceptar el ID N» (`aceptarIdTarea`: auditoría + bitácora;
  no deja dos órdenes con la misma tarea) o «Ya lo revisé».
- `o.clave` sigue a la identidad tras un archivo sin columna; las OT cruzan por cualquiera de las claves; el registro de cargas muestra
  ID/enlazadas/conflictos/WH repetidas/vinieron sin WH; aviso cuando hay órdenes con ID y el archivo no trae la columna.
- Pruebas **K7b** (30 comprobaciones) más las K7 corregidas para mirar los números de la vista previa. Harness: 2.594 comprobaciones, 0 errores.
