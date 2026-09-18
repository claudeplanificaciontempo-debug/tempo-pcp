# Borrado de datos de prueba — construido (17-sep-2026)

Las siete correcciones del Paso 0 (`BORRADO_PASO0.md`), tal como se aprobaron. Configuración → Borrado (administrador).

## Qué hay ahora

1. **Un solo botón: «Borrar datos de prueba (conserva la configuración)…»** (`mBorrar()`). «Quitar todas las órdenes»
   se retiró (dejaba huérfano todo el avance). Solo `puede('config')`.
2. **Antes de borrar, se guarda y se relee el servidor**: `ejecutarBorrado()` espera cualquier guardado en curso, llama a
   `save()` y vuelve a esperar; si el guardado falla (`SAVE_ERR`), **no se borra** y queda en bitácora «BORRADO CANCELADO».
   Después **relee toda la base** (`cargarTodo`): el respaldo es del servidor, no de la memoria de esta pestaña (lo que
   otra sesión escribió desde que se abrió la pantalla entra en la copia). Mientras corre hay un velo y **los guardados
   ajenos al borrado se bloquean** (`BORRANDO`); si una lectura del servidor falla a mitad, `CARGA_INCOMPLETA` bloquea
   todo guardado hasta recargar la página (un `save()` con la memoria a medias borraría configuración y bitácora).
3. **Respaldo local + servidor + verificación**: se descarga `respaldo_antes_de_borrar_<fecha-hora>.json`
   (`descargarJSON`) y se sube a Storage `respaldos/respaldos/` (`subirRespaldo`). Si la subida falla, **no se borra**.
   Después **se baja el archivo del servidor y se valida con el mismo criterio de Restaurar** (`esRespaldoValido`, que
   ahora usan `restaurarDesde` y el borrado) y con el conteo de órdenes (`verificarRespaldoServidor`); si no pasa,
   **no se borra**.
4. **Confirmación escrita `BORRAR`** en un modal con dos listas y conteos: *Se borra* (órdenes, con foto, con OT,
   avance, planes, baños, salidas, programas, cargas, propuestas, turnos, paros + lo que en Configuración apunta a
   órdenes) y *Se conserva* (centros, recursos, telas, colores, operaciones, categorías, fases, motivos, grupos,
   parámetros, bitácora, auditoría, cierres de mes, usuarios, archivos de fotos). Casilla **«conservar el índice de
   fotos por OP»**, desmarcada por defecto (decisión: `fotosIdx` no se conserva salvo que se pida).
5. **Todo o nada (lo más cerca que permite Supabase sin transacción entre tablas)**: antes del primer `delete` se guardan
   la marca **`S.params.borradoEnCurso`** y la bitácora «INICIADO» (si eso no se guarda, no se borra). `borrarOperativo()`
   **lee las diez tablas** (si una lectura falla, no borra nada) y luego borra tabla por tabla **leyendo por páginas de
   1.000 hasta que la tabla queda vacía** (Supabase devuelve como máximo 1.000 filas por consulta: con 1.223 órdenes una
   sola lectura habría dejado 223), **releyendo después de cada lote para comprobar que el servidor borró de verdad**
   (un `delete` sin política RLS responde sin error y no borra: se detecta y se para), y **verificando al final que las
   diez tablas están en cero**. Las **órdenes van al final**: si algo falla a mitad, lo que queda nunca son avances
   huérfanos. Si falla: `S.params.borradoIncompleto = {ts,u,borradas,fallo,pendientes,respaldo,rutaServidor}`, bitácora
   «BORRADO INCOMPLETO», modal con qué se borró, dónde falló y qué queda, botones **«Volver a intentar»** y **«Restaurar
   el respaldo (deshacer)»** (`restaurarRespaldoServidor`: baja el respaldo verificado y lo carga con Restaurar), el
   panel lo muestra en rojo, y **la limpieza de Configuración no se hace**. Si la pestaña se cierra a mitad, la marca
   «en curso» hace que el panel diga **«borrado INTERRUMPIDO»** con el respaldo y el enlace para restaurar.
6. **Limpieza de huérfanos en `params`** (`limpiarHuerfanosTrasBorrado`, solo `config`): bandejas pospuestas (las
   claves reales son por bandeja —`sinFecha`, `noCalzan`…— y se pospusieron sobre la cartera que se va: se vacían
   todas), borrador y marca de congelado del plan mensual (los meses quedan; las metas viven en `params.metas` y no se
   tocan), congelados semanales, alertas de compras, **advertencias de fecha** (`params.advertencias`, con oid/op: no
   estaban en la lista aprobada, pero son exactamente lo que apunta a órdenes; se limpian y se cuentan), bandeja «no
   calzan» y los resúmenes de la última carga (`tareaCarga`, `otCarga`, `fotosCarga`, `tallasCarga`), pedidos de
   reprogramación, índice de fotos (salvo casilla). **Se conservan** bitácora, `cierresMes`, `restauraciones`, metas,
   la programación manual de tejeduría y el stock de tela cruda (son de tejeduría, no apuntan a órdenes; si son de
   prueba se limpian en Tejeduría — el modal lo dice) y toda la configuración. **La auditoría del piso**, que vive
   dentro de `avance[oid].auditoria`, **se copia a `params.auditoriaCambios`** (marcada `conservadaEnBorrado`) antes de
   borrar la tabla: la auditoría no se pierde.
7. **Bitácora** con usuario, fecha y hora, conteos por tabla, huérfanos limpiados y **ruta del respaldo local y del
   servidor** («BORRADO de datos de prueba INICIADO…» y «…TERMINADO por…»); registro en `S.params.borrados[]`
   (quién, cuándo, conteos, huérfanos, `conservarFotosIdx`, respaldo, ruta) y el panel muestra el último.
8. **Pantalla final «Base vacía · configuración conservada»** con lo borrado, el respaldo (local y servidor, verificado)
   y la tabla de lo que queda: centros, recursos, telas, colores, operaciones, categorías, técnicas, máquinas, rutas,
   fases de la tabla 1, motivos, ventanas, grupos de módulos, perfiles del catálogo, usuarios (tabla `perfiles`),
   parámetros, excepciones, bitácora, auditoría, cierres de mes, archivos de fotos del bucket e índice de fotos; botón
   «Actualizar datos →».

## Pruebas (B0–B7, reemplazan al B0 rojo del Paso 0; harness 2.430 comprobaciones, 0 errores, 0 rojas)

- B1: un solo botón; «Quitar todas las órdenes» no existe; el panel dice qué se limpia y qué se conserva; el modal pide
  `BORRAR` con conteos y la casilla de fotos desmarcada; otra palabra no borra.
- B2: si el guardado previo falla → no se borra (ningún `delete`), CANCELADO; si el respaldo no sube → no se borra,
  bitácora CANCELADO y la descarga local sí se pidió (se observa `descargarJSON`); si el archivo del servidor no pasa la
  validación de Restaurar (estructura, no JSON, conteo distinto) → no se borra (el local y el del servidor quedan);
  `esRespaldoValido` es el criterio de `restaurarDesde`; sin permiso `config`, `ejecutarBorrado()` no borra.
- B3: con una tabla que falla a mitad (`banos_conf`, error del servidor): se para ahí, las órdenes quedan intactas, queda
  `borradoIncompleto` con borradas/fallo/pendientes/respaldo, modal y bitácora «INCOMPLETO», Configuración no se limpió,
  el panel avisa y **«Restaurar el respaldo (deshacer)» devuelve órdenes y avance**. Con un `delete` que el servidor
  ignora (RLS sin política, sin error) se detecta releyendo y queda INCOMPLETO «el servidor no borró». Con `BORRANDO` o
  `CARGA_INCOMPLETA` un `save()` ajeno no escribe nada. El mock corta a 1.000 filas como PostgREST: el volcado tiene
  1.211 órdenes y el borrado las pagina.
- B4: el borrado completo termina; **toda la configuración igual antes y después** (foto comparada campo a campo:
  centros, recursos, calendario, festivos, tablas 1/14/15/18, grupos, telas, colores, operaciones, parámetros,
  perfiles, rutas por defecto, metas, escenarios, auditoría, cierres de mes, restauraciones, archivos del bucket);
  se borran las diez tablas; la bitácora crece; **cero huérfanos**; el índice de fotos vacío por defecto y conservado con
  la casilla.
- B4: la auditoría del piso se copió a Configuración; INICIADO y TERMINADO en bitácora; guardó antes del primer delete.
- B5: bitácora con usuario, fecha, conteos, huérfanos, rutas y el respaldo completo del intento anterior; `S.params.borrados`
  con el registro (incluido `respaldoPrevio`).
- B7: la marca «en curso» hace que el panel avise «INTERRUMPIDO» en otra sesión.
- B6: la pantalla final con los conteos y el enlace a Actualizar datos; **el respaldo que quedó en el servidor se baja y
  se carga con `restaurarDesde`, devolviendo las órdenes que había**; el panel muestra el último borrado.
- GUARDIA: las tres funciones exigen `config` y la palabra escrita.

Capturas: `capturas/borrado_confirmacion.png` (modal) y `capturas/borrado_base_vacia.png` (pantalla final), modos del
driver `?captura=borrado1|borrado2` (sobre la base simulada, nada real).

Siguen fuera del borrado, a propósito, y se dicen en el modal: la programación manual de tejeduría y el stock de tela
cruda (si son de prueba, se limpian en Tejeduría) y `capProblemas/capDecisiones` (por centro y mes, no por orden).

## Revisión adversarial antes del commit

Un workflow de 33 agentes (lentes destructivo/producción, reglas del proyecto y pruebas, con refutación independiente)
dejó 30 hallazgos confirmados. Los de fondo se corrigieron antes de publicar: la lectura de ids no paginaba (con 1.223
órdenes habría dejado 223 y dicho «Base vacía»); un `delete` negado por RLS no da error y se contaba como borrado (ahora
se relee y se verifica en cero); un fallo de `cargarTodo` tras borrar habría dejado que el siguiente `save()` borrara la
configuración y la bitácora del servidor (ahora `cargarTodo` devuelve si terminó y `CARGA_INCOMPLETA` bloquea guardar);
la pantalla seguía viva durante el borrado (velo + `BORRANDO`); el respaldo era de la memoria, no del servidor (ahora se
relee antes); las claves de pendientes pospuestos no eran `x-<id>` (se vacían por bandeja); faltaban las advertencias de
fecha; la auditoría del piso se iba con `avance`; sin marca «en curso» un cierre de pestaña dejaba la base a medias sin
aviso; el reintento perdía la ruta del respaldo completo; el orden de tablas dejaba avances huérfanos si fallaba; y las
pruebas no cubrían el tope de 1.000 filas, la descarga local, el guardado previo fallido ni el RLS silencioso.

## Para producción

- El bucket privado **`respaldos`** tiene que existir en Supabase Storage con permiso de **subir y leer** para el
  administrador: propuesta en `SUPABASE_BUCKET_RESPALDOS.sql` (**sin ejecutar**; la ejecutas tú). Sin él, Restaurar y el
  borrado se cancelan y lo dicen.
- La cuenta que borre necesita permiso de `delete` en las diez tablas operativas (política RLS de DELETE); si falta en
  una, el borrado queda INCOMPLETO con el detalle («el servidor no borró…») y el respaldo previo para deshacer.
- Cierra las demás sesiones (tablets) antes de borrar: lo que escriban mientras corre no queda en la copia.
