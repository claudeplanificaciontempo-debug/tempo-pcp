# Borrado de datos de prueba — Paso 0 (reporte, nada construido)

**17-sep-2026.** Medido en el simulador con el volcado real (1.211 órdenes, 331 con avance) ejecutando el borrado tal
como está hoy, con una prueba nueva (B0) que sembró antes de todo un poco: excepción de calendario, fase marcada
«nivelación = tela», ventana de descanso, motivo, grupo de módulos, parámetros, escenario de nivelación, pendiente
pospuesto, plan mensual, congelado, alerta de compras, auditoría, plan, avance con tramo y cierre, firma de liberación.

## 1 · Qué hace hoy «Borrado (administrador)» (Configuración → Borrado)

Dos botones, los dos solo con permiso **`config`** (`puede('config')` en `mBorrar`, `ejecutarBorrado` y `borrarOperativo`),
cada uno pide escribir una frase exacta con los conteos actuales (p. ej. **«BORRAR 1211 ORDENES Y 331 AVANCES»**), sin
respaldo previo, y dejan **una línea en bitácora** («BORRADO: … · N órdenes, N avances») antes de borrar.

**«Quitar todas las órdenes…»** (`tipo:'ordenes'`): hace `S.ordenes=[]` y `save()`. Borra **solo la tabla `ordenes`**. Deja
**huérfano** todo lo demás: el avance de piso entero (unidades, tramos, cierres, tallas, solicitudes, reprogramaciones),
planes congelados, baños confirmados, salidas de tintorería, programas, cargas, turnos y paros. **No sirve para lo que
quieres**: el avance huérfano no se recupera al recargar (las órdenes nuevas tienen los mismos ids `op_…` solo si son las
mismas WH; las de prueba no lo serán) y queda basura en `avance`.

**«Borrar todos los datos operativos…»** (`tipo:'operativo'` → `borrarOperativo`): borra en el servidor, tabla por tabla y
de 200 en 200, **`TABLAS_OPERATIVAS = ordenes · avance · banos_conf · salidas_tin · programas · cargas · propuestas · paros ·
turnos · planes`**, y después recarga todo desde la base (`cargarTodo`). Si una tabla falla, sigue con las demás y avisa al
final (puede quedar a medias).

| | Qué borra | Qué conserva |
|---|---|---|
| **Tablas** | `ordenes`, `avance` (unidades, tramos, cierres, tallas, solicitudes, cronos), `banos_conf`, `salidas_tin`, `programas`, `cargas` (el registro unificado de cargas), `propuestas`, `paros`, `turnos` (asistencia y novedades), `planes` (congelados del plan mensual) | `centros`, `recursos`, `telas`, `colores`, `rutas`, `operaciones`, `tecnicas`, `maquinas`, `categorias`, **`bitacora`**, **`params`** (toda la configuración), `perfiles` (usuarios) |
| **Storage** | nada | las fotos del bucket y el índice `params.fotosIdx` (por OP) |
| **Registro** | una línea en bitácora **antes** de borrar; no dice si terminó ni qué falló | — |

**Lo que NO cubre:** el borrado no toca **`params`**, y dentro de `params` viven cosas que apuntan a órdenes (ver 3).
**Lo que NO borra de configuración:** nada. Verificado (punto 2).

## 2 · Verificación con prueba (B0)

Tras «Borrar todos los datos operativos», **se conservan exactamente** (misma foto antes y después):
centros (13) y recursos con personas, minutos y eficiencia; calendario (`params.cal`) y las excepciones/festivos (28, con la
sembrada); tabla 1 con la columna «nivelación» marcada; tabla 14 (18 filas); tabla 15 (motivos, 11); tabla 18 (ventanas);
grupos de módulos; telas (26) y colores (116); operaciones (596) y los SAM de la hoja; parámetros (`prm`: msBuscar,
umbral de archivo incompleto, minutos mínimos de cierre, umbral de cercanía…); catálogo de perfiles/usuarios
(`perfilesDef`); rutas por defecto de los centros; escenarios de nivelación; el índice de fotos (4) y los archivos del
bucket (5). Y se borran órdenes, avance, planes, baños, salidas, turnos, paros y cargas; la bitácora se conserva y crece.

Una observación del harness, no del borrado: mientras hacía la prueba, `BASE` (la foto de lo que la app cree que está en el
servidor) tenía las rutas por defecto de los centros y la base simulada no, porque otras pruebas tocan la base a mano; al
sincronizar antes de borrar, todo cuadró. **En producción no aplica**, pero deja una regla útil para construir: **antes de
borrar hay que esperar a que termine cualquier guardado en curso** (`save()` se salta si hay otro en vuelo) y volver a
guardar, para que el respaldo y el borrado partan del mismo estado.

## 3 · Qué queda colgando de órdenes que ya no existen

Se borran con la orden (bien): avance (unidades, tramos, cierres, tallas), planes congelados, baños, salidas, cargas, turnos,
paros. La bitácora **no se borra** (correcto: es historia).

**Quedan huérfanos en `params`** (medido tras el borrado):

| Clave | Qué es | Huérfanos | Propuesta |
|---|---|---|---|
| `pendPospuestos` (`x-<id>`) | pendientes pospuestos por orden | 1 | quitar las claves `x-<id>` sin orden |
| `planMes[ym].oids` | borrador del plan mensual | 1 | vaciar los `oids` (el mes queda) |
| `progCongelado[]` | congelados semanales por centro | 1 | quitar las entradas cuyos `oids` ya no existen |
| `alertasCompras[]` (`oid`) | alertas «pasó a compras» | 1 | quitar las que apuntan a órdenes borradas |
| `auditoriaCambios[]` (`oid`) | auditoría de cambios de fase y reversiones | 407 | **conservar** (es historia, como la bitácora) |
| `tareaCarga.recarga.noCalzan` | bandeja «decisiones que ya no calzan» | 199 | vaciar la bandeja y el resumen de la última carga (`tareaCarga`, `otCarga`, `fotosCarga`): son de la base que se va |
| `cierresMes` | foto mensual de cartera para el resumen gerencial | 1 | **conservar** los meses cerrados; recalcular el mes en curso tras cargar la base real |
| `fotosIdx` (por OP) | índice de fotos del bucket | 4 | **conservar**: así las fotos se cuelgan solas cuando lleguen las WH reales |
| `errProgAtendidos`, `restauraciones`, `nivelacion.*`, `ajustesCap`, `progTej`, `stockTela` | no apuntan a órdenes | — | conservar |

## 4 · Correcciones que propongo (para construir después de tu aprobación)

1. **Un solo camino**: retirar «Quitar todas las órdenes» (deja huérfanos) y dejar solo «Borrar todos los datos operativos»,
   renombrado **«Borrar datos de prueba (conserva la configuración)»**.
2. **Respaldo antes, igual que Restaurar**: esperar a que termine el guardado en curso, guardar, descargar el JSON local y
   subirlo a Storage `respaldos/`; **si la subida falla, no se borra**.
3. **Confirmación escrita `BORRAR`** con el detalle en pantalla de lo que se borra y lo que se conserva, con los conteos
   actuales (órdenes, avance, planes, baños, salidas, turnos, paros, cargas, fotos con orden) y la lista de lo que queda.
4. **Limpiar los huérfanos de `params`** en el mismo acto (pospuestos, plan mensual, congelados, alertas de compras, bandeja
   y resúmenes de la última carga), **conservando** auditoría, `cierresMes` cerrados, `fotosIdx` y todo lo de configuración.
5. **Todo o nada**: si una tabla falla a mitad, avisar qué quedó sin borrar y no dar por terminado.
6. **Bitácora**: una línea con usuario, fecha, conteos borrados, huérfanos limpiados y **ruta del respaldo** (local y servidor).
7. **Resumen al terminar**: una pantalla «Base vacía · configuración conservada» con los conteos de centros, recursos,
   telas, colores, operaciones, categorías, fases de la tabla 1, motivos, ventanas, grupos, usuarios, fotos en el bucket y
   parámetros, para revisar antes de «Actualizar datos».

Espero tu aprobación para construir.
