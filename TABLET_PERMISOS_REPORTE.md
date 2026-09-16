# Tablet: permisos, cabecera y búsqueda del operario — reporte

Fecha: 15-sep-2026, noche. Motor sin tocar. Pruebas del simulador: **1.008 (9 nuevas), todas verdes, 0 errores**.

## 1 · Permisos en Supabase

### a) Las políticas actuales: no las pude leer
La app se conecta con la **clave pública** (anon). Con esa clave **no se puede leer `pg_policies`**: es una vista del
catálogo del sistema y PostgREST no la expone. Tampoco entré a producción con tu cuenta: las credenciales son tuyas.

Dejé en el repo **`SUPABASE_POLITICAS_ACTUALES.sql`** con las cinco consultas listas (políticas, qué tablas tienen RLS,
columnas de `perfiles`, roles en uso y funciones auxiliares). Las corres en Supabase → SQL editor y pegas el resultado
al final del archivo. No lleva datos de clientes, así que se puede publicar sin riesgo.

### b) Por qué el perfil tablet queda fuera
El error dice **«new row violates row-level security policy»** en `bitacora` y `avance`. Eso significa que en esas
tablas hay RLS activo y una política de escritura cuya condición **no se cumple** para ese usuario. Las tres causas
posibles, y todas se distinguen con el volcado:
1. la política lista roles concretos (por ejemplo `admin`, `planificacion`, `corte`) y **`tablet` no está en la lista**;
2. la política mira una columna de `perfiles` que ese usuario no tiene llena;
3. no hay ninguna política de `insert`/`update` para esas tablas, y entonces **nadie** puede escribir salvo el service role.

Lo que sí es seguro: **la app guarda en `avance` y `bitacora` cada vez que el operario registra**, así que sin permiso
de escritura ahí, la tablet no puede trabajar.

### c) y d) La propuesta
Está en **`SUPABASE_POLITICAS_TABLET.sql`**, sin ejecutar. En resumen:
- **Lectura** para cualquier usuario autenticado en las tablas que Mi centro necesita (órdenes, avance, centros,
  recursos, categorías, colores, telas, rutas, operaciones, programas, planes, turnos, paros y bitácora).
- **Escritura solo en cuatro tablas**: `avance`, `bitacora`, `turnos` y `paros`, y solo para los perfiles de piso
  (`tablet`, `corte`, `modulos`, `terminado`, `piso`, `tejeduria`, `tintoreria`), para que los que ya registraban no
  pierdan lo que hacían.
- **Sin permiso de borrado** para el piso, y **sin escritura** en órdenes, params, centros, recursos ni configuración.

Un dato importante para entender el alcance: el **tramo de trabajo** (inicio, fin, paros, unidades por talla) y las
**segundas** se guardan dentro de `avance`; la **asistencia del día**, en `turnos`; los **paros generales**, en `paros`.
No hay ninguna tabla nueva: por eso la propuesta se limita a esas cuatro.

**No ejecuté nada.** Dime si la corres tú o si me autorizas a hacerlo.

### e) La app ya no pierde lo escrito
Antes, si el guardado fallaba, la app recargaba todo desde el servidor y el registro se perdía. Ahora:
- **no recarga nada**: lo que el operario registró sigue en pantalla;
- aparece un aviso arriba de Mi centro: **«No se guardó en el servidor. Lo que registraste sigue aquí: avisa a
  planificación y vuelve a tocar Guardar»**, con un botón **Reintentar**;
- si la causa es de permisos, el aviso lo dice con esas palabras en vez de mostrar un error técnico;
- cuando el guardado sale bien, el aviso desaparece solo.

## 2 · Cabecera del operario
**Respaldo** y **Restaurar** solo se ven con permiso de configuración. El operario y los perfiles de piso ven
únicamente **Actualizar** y **Salir**.

## 3 · Búsqueda por WH en Mi centro
El campo **«Buscar WH»**, grande, quedó **arriba de todo**, antes del flujo y de las tarjetas. Si la WH está programada
en su recurso, aparece su tarjeta; si existe pero no está programada ahí, sale bloqueada con **«no programada · pedir
reprogramación»** y el botón que avisa a planificación. En teléfono, la barra general de la cabecera pasa a ocupar el
ancho completo en su propia línea, así no queda cortada.

## 4 · Tallas en producción: no lo puedo comprobar desde aquí
No puedo leer la base de producción sin entrar con una cuenta, y no voy a usar la tuya. Lo que sí sé, por el trabajo
anterior: **el archivo que enviaste no era cargable** (traía WH, pedido y EAN, pero **sin cantidades por talla** y con
la WH repetida solo en la primera fila de cada grupo), así que, salvo que hayas cargado otro archivo distinto después,
**no debería haber ninguna orden con curva de tallas**.

Cómo verlo en dos clics, con tus datos:
- **Configuración → Órdenes y materiales → 16 · Tallas**: al final del panel dice la última carga, con fecha, quién y
  cuántas órdenes recibieron curva. Si no hay línea de última carga, no se cargó nunca.
- **WH/MO/28300**: escríbela en la barra de búsqueda general. La ficha muestra «Avance por talla» si tiene curva, o
  «Sin curva de tallas cargada» si no.

Si me confirmas que quieres que lo verifique yo, necesito que me digas cómo entrar sin usar tu cuenta personal.

## 5 · Sobre la prueba con el usuario tablet real
No entré a producción como «Modulo 1 · tablet»: no tengo su contraseña y no voy a crear ni usar cuentas. Además, el
error es de base de datos: **hasta que no corras el SQL, cualquier prueba con ese usuario va a fallar igual**. Lo que sí
está probado en el simulador es todo el flujo (iniciar, paro, fin, guardar), el aviso cuando el servidor rechaza el
guardado, la cabecera sin Respaldo ni Restaurar y el buscador arriba.

## Qué se probó
- Cuando el guardado falla, el aviso queda en pantalla con el botón de reintentar y **no se recarga nada**.
- El aviso distingue el problema de permisos de un error cualquiera, y desaparece al guardar bien.
- El operario no ve Respaldo ni Restaurar; quien tiene permiso de configuración sí.
- El buscador de WH está arriba, antes del flujo y de las tarjetas, y una WH no programada en el recurso sale bloqueada.

---

# 2ª entrega (16-sep-2026) · el guardado del operario solo sube sus cuatro tablas

**Commit:** `33ba25d` · **Harness:** 1120 pruebas verdes (después 1154 con las partes 2 y 3) · **Motor:** no se tocó.

## El problema de fondo
Las políticas RLS de producción ya dejan escribir al piso en `avance`, `bitacora`, `turnos` y `paros`. Pero `_save()`
recorría **todas** las tablas y `params`, y subía cualquier diferencia contra lo leído. En la sesión de un operario hay
diferencias que él no hizo: cada pantalla que se dibuja ejecuta siembras y migraciones («si no existe, créalo») que
tocan `S.params`. Al primer rechazo por permisos, `_save()` cortaba y **el avance tampoco subía**. Que el Módulo 1
guardara a las 08:08 fue casualidad: un administrador había abierto la app antes y persistió esas siembras.

## 1 · Qué sube cada sesión
- `TABLAS_PISO = avance, bitacora, turnos, paros` — las mismas cuatro de `SUPABASE_POLITICAS_TABLET.sql`.
- Un perfil es **«solo piso»** por la columna nueva **Solo piso** de Configuración → Usuarios → Perfiles. Si nadie la
  ha tocado, vale para `tablet`, `corte`, `modulos`, `terminado` y los perfiles antiguos de piso. **Planificación no
  es «solo piso»**: no tiene permiso de Configuración pero sí escribe órdenes, programas y plan, así que sigue
  guardando todo (si se la marcara, dejaría de guardar su trabajo).
- En una sesión «solo piso», `_save()` **ni intenta** subir las demás tablas ni `params`: no manda la petición, no
  falla y no cuenta como error. Lo que cambió ahí se usa en pantalla y se pierde al recargar, que es justo lo que
  queremos para una siembra.

## 2 · Las siembras y migraciones automáticas que había
Se ejecutan al leer, desde cualquier pantalla, y escriben en `params`:

`motivos` (y `parosMigrados`, que asegura Almuerzo, Cierre del día y Fallo de máquina) · `perfilesDef` y
`migReporteria` · `tallasJuegos` · `tiposMaq` · `operarias` · `camposConservados` · `centrosPorOrden` ·
`reglasFamCentro` · `clasifMaterial` · `propuestaFalta` · `centroEtapa` · `faseGrupos` · `faseMapeo` ·
`faseMapeoMontado` · `esperasPaso` · `diasProveedor` · `tiemposOjalBoton` · `catTela` · `paramTela` · `kgUd` ·
`mermaTintura` · `palabrasJaspe` · `restriccionFaltante` · `estadoOT` · `centroOT` · `auditoriaCambios` ·
`pedidosReprog` · `progTej` · `mapaCatLMO` · `rutaDefectoSembrada` · `motivosMigrados` · `colchonDias` ·
`excepciones` · `cal` · `catalogoUsuaria` · `planaLotes` · `pdfEntregas` · `replan` · `stockTela`.

Ninguna se guarda desde la tablet. Se siguen guardando cuando entra planificación o administración, que es donde
tienen sentido.

## 3 · Lo que el operario hace de verdad fuera de esas cuatro tablas

| Lo que hace | Antes escribía en | Ahora |
| --- | --- | --- |
| Inicio, paro, fin, unidades y tallas del tramo | `avance` (+ `bitacora`, `turnos`) | igual: son sus tablas |
| Asistencia del día | `turnos` | igual |
| Registro rápido «Hecho» | `avance` + `turnos` + `bitacora` | igual |
| **Pedir reprogramación** | `params.pedidosReprog` | **`avance[oid].pedidosReprog`**; la pantalla del supervisor lee las dos fuentes, así que los pedidos viejos no se pierden |
| **Corrección de tramo y toda su auditoría** | `params.auditoriaCambios` | **`avance[oid].auditoria`**; Auditoría muestra las dos juntas, ordenadas por fecha |
| **Cambiar la fase desde piso** | `ordenes` (+ `params`) | **no la cambia**: queda como **solicitud** en `avance[oid].solicitudes` y planificación la aplica |

La solicitud de fase se ve en **Control de piso → Cambio de fases** («El piso pide cambios»: qué orden, a qué fase,
la observación, el motivo, quién y cuándo) con botones **aplicar** y **descartar**, y en **Hoy → Pendientes**. Al
aplicarla se usa `moverFases`, o sea la regla de secuencia de la tabla 1 y la auditoría de siempre. No se abrió
`ordenes` ni `params` a ningún rol de piso.

## 4 · El aviso dice dónde falló
El error de guardado ahora nombra la tabla en palabras: «No se guardó en el servidor (falló en: **configuración**)»,
«…(falló en: **avance del piso**)», con el detalle técnico debajo y el botón Reintentar. Lo registrado sigue en
pantalla.

## 5 · Qué se probó
Con perfil **tablet real** y la base de pruebas **rechazando toda escritura fuera de las cuatro tablas del piso**, y
con siembras pendientes de guardar: iniciar el tramo, paro, reanudar, fin y unidades **guardan sin un solo error**, y
no se manda ni una petición a `params` ni a ninguna otra tabla. Además: la siembra pendiente sigue en memoria y no se
guardó; pedir reprogramación va a `avance`; el cambio de fase queda como solicitud, sale en Hoy y planificación lo
aplica; el aviso nombra la tabla.

## Lo que sigue en tus manos
Nada de esto cambia las políticas de Supabase. `SUPABASE_POLITICAS_TABLET.sql` sigue **sin ejecutarse**; lo que hay en
producción son las políticas que ya cargaste. Si algún día quieres que un supervisor de centro vuelva a cambiar fases
directo, basta con desmarcarle **Solo piso** y darle la política de escritura en `ordenes`.

---

# 3ª entrega (16-sep-2026) · los supervisores de piso vuelven a mover fases

**Commits:** `8e20216` (perfiles + función + app) y `e04231e` (listas para empezar) · **Harness:** 1175 verdes.

## Qué estaba mal
Con la 2ª entrega, corte, módulos y terminado dejaron de escribir en `ordenes`, y con eso perdieron el cambio de
fase. Pero esos tres **son los perfiles de los supervisores**, y el principio del proyecto es que el supervisor
mueve fases. Encima, la bandeja «fase sin actualizar» le pedía justo eso.

## 1 · Operario y supervisor de piso, en el catálogo
Configuración → Usuarios → Perfiles tiene ahora la columna **Piso**, con tres opciones:

| Valor | Quién | Qué puede |
| --- | --- | --- |
| — | planificación, liberación, tintorería, consulta | guardan todo lo de siempre |
| **Operario** | tablet (y los perfiles antiguos de piso) | registra su trabajo y **pide** el cambio de fase |
| **Supervisor de piso** | corte, módulos, terminado | registra y **mueve fases** con la función del servidor |

Los dos tipos de piso siguen subiendo **solo** avance, bitácora, turnos y paros. La columna es un dato editable: lo
que marques ahí manda sobre el valor que trae el código.

## 2 · La función de la base (propuesta, sin ejecutar)
`SUPABASE_MOVER_FASE.sql`. Dos funciones `security definer`:
- **`puede_mover_fase(uid)`**: lee `perfiles.rol` y el catálogo de perfiles (que vive en `params`) y deja pasar a
  quien tenga `piso = supervisor` o permisos `*`, `ordenes` o `programa`. O sea: **la regla de la base es la misma
  configuración de la app**, con una lista de respaldo por si el catálogo aún no tiene la columna.
- **`mover_fase(p_orden, p_fase, p_motivo)`**: cambia **solo** `data->>'fase'` y añade una entrada a
  `data->'fases'` (el historial, con antes, quién, cuándo, origen y motivo). Ningún otro campo del jsonb —
  cantidades, fechas, ruta, telas, liberaciones— se toca, ni otras filas, ni otras tablas salvo la línea de
  **bitácora** con la auditoría. Valida que haya sesión, que el perfil pueda, que la fase no venga vacía, que la
  orden exista y que la fase exista; si la fase es la misma, no hace nada.

**Cómo está guardada la fase** (va explicado también dentro del archivo): no hay columna `fase`. Todas las tablas
son `id text, data jsonb, actualizado, actualizado_por`, y la orden entera vive en `data`: la fase es
`data->>'fase'` y el historial `data->'fases'`. Por eso la función usa `jsonb_set` sobre esas dos claves.

El archivo **no se ejecutó**: lo revisas y lo corres tú. Trae al final las consultas para comprobarla y para
quitarla.

## 3 · En la app
El supervisor de piso ya no guarda la fase con un upsert de `ordenes`: `moverFases` detecta su perfil y llama a
`mover_fase` (rpc). Vale para **Control de piso → Cambio de fases**, para la etiqueta de fase de cualquier pantalla,
para la **bandeja «terminadas con la fase sin actualizar»** y para **aplicar la solicitud del operario**. Si la
función todavía no existe en la base, avisa **«Falta ejecutar SUPABASE_MOVER_FASE.sql»** y **no cambia nada** (ni en
pantalla ni en el servidor). El operario de tablet sigue enviando solicitud, que ahora puede aplicar tanto
planificación como el supervisor.

De paso: si con tu perfil un cambio queda sin poder guardarse (la ruta o el orden de la cola, que también viven en
`ordenes`), la pantalla lo dice —«con tu perfil no se guardan los cambios de órdenes»— en vez de perderlo en
silencio.

## 4 · Lo que sigue pendiente de decidir
Reordenar la cola del centro (`progCentro.pri`) y editar la ruta también viven en `ordenes`, así que hoy el
supervisor **tampoco los guarda**. Si quieres que pueda, hace falta otra función igual de acotada (misma forma que
`mover_fase`). Dímelo y la propongo en el mismo archivo.

## Qué se probó
El catálogo separa operario de supervisor y la columna manda · el supervisor mueve la fase **por rpc** y en la base
**solo cambian `fase` y `fases`** (se compara el jsonb entero antes y después) · no se manda ningún upsert de
`ordenes` · queda la auditoría en avance y la bitácora del servidor · **sin la función, avisa y no cambia nada** ·
el operario no mueve la fase, queda solicitud y no se llama a la función · el supervisor aplica esa solicitud y la
fase cambia en la base · la bandeja «fase sin actualizar» le funciona.
