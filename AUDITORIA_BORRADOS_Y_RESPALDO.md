# Auditoría de borrados, protecciones y respaldo — 15-sep-2026

Auditoría en modo lectura de todo lugar del código donde se borra, vacía, resetea o sobrescribe algo guardado, y lo que se
protegió después. Regla desde hoy: **los datos son definitivos; nada se borra "de paso"; la bitácora nunca; toda acción
que borre pide confirmación y dice qué se pierde; hay una prueba de guardia que falla si aparece un borrado nuevo.**

## 1 · Inventario (dónde · qué borra · cuándo · confirmación · qué se perdería) y qué se hizo

| # | Dónde (función) | Qué borra / pisa | Cuándo se dispara | Confirmación antes | Qué se perdería | Hoy |
|---|---|---|---|---|---|---|
| 1 | `bitacora()` | recortaba la bitácora a las últimas 500 entradas; al guardar, las filas fuera del corte se borraban de la base (`_save` → `del`) | en cada anotación | ninguna | historial de decisiones | **Quitado**: la bitácora ya no se recorta |
| 2 | `borrarOperativo()` (Configuración → Borrado) | vacía ordenes, avance, banos_conf, salidas_tin, programas, cargas, propuestas, paros, turnos, planes **y bitácora** | botón "Borrar datos operativos" | frase escrita (`ejecutarBorrado`) + admin | todo lo operativo | **La bitácora ya no está en la lista**; el resto sigue con frase |
| 3 | `ejecutarBorrado('ordenes')` | `S.ordenes=[]` | Configuración → Borrado, "vaciar órdenes" | frase + admin | todas las órdenes | igual (con frase) |
| 4 | `aplicarTarea()` (recarga Parte 2 / PROYECTO.xlsx) | **eliminaba las órdenes que ya no venían en el archivo** (con sus decisiones) y borraba su avance de piso | al aplicar la recarga | modal de recarga, sin aviso específico | firmas, puestos, módulo fijo, fotos, avance de esas órdenes | **Ya no se eliminan**: quedan con `estado:'noArchivo'` (fuera de abiertas, con todo lo suyo) y su avance se conserva; la recarga las cuenta y reporta |
| 5 | `aplicarLMO()` (Operaciones desde OPERACIONES.xlsx) | `S.operaciones=[]` y quita `ops`/`familiaLMO` de todas las categorías | al aplicar la carga LMO | ninguna | tiempos editados a mano en operaciones | **Pide confirmación** y dice qué se reemplaza |
| 6 | `importJSON()` (restaurar respaldo) | reemplaza `S` entero por el archivo | Configuración (admin) | ninguna | todo lo posterior al respaldo | **Confirma** con conteos; **la bitácora se une**, no se pierde; queda en bitácora |
| 7 | `_save()` → `del(t,ids)` | borra en la base las filas que ya no están en memoria (diferencias) | en cada guardado | n/a (es el mecanismo de guardar) | lo que el código quitó de memoria | se mantiene: es el guardado; por eso importa que nadie quite filas de memoria sin confirmar |
| 8 | `delOrden` | una orden | botón × en Órdenes | sí, con lista de lo que pierde | la orden y lo suyo | igual |
| 9 | `delRec`, `delCentro`, `delRow(tab,id)`, `delCat`, `delRuta`, `delExc`, `delRegla`, `delMapaHija` | un recurso, centro, fila de maestro, categoría, ruta, marca de día, regla, vínculo | botones × de Configuración | **no tenían** | capacidad/telas/calendario del recurso, configuración del centro, etc. | **Todas piden confirmación** y dicen qué se pierde |
| 10 | 19 funciones `del…Row(i)` (tablas 1–14, esperas, días de proveedor, motivos, restricciones, ojales/botones…) | una fila de tabla configurable | botones × | **no tenían** | lo configurado en la fila | **Todas piden confirmación** |
| 11 | `retirarLib` | la firma de liberación de una orden | botón "retirar" en Liberación | **no tenía** | la firma y su fecha | **Pide confirmación** |
| 12 | `delPerfilDef`, `delOp`, `quitarAjusteOp`, `limpiarMes`, `deshacerBanoConf`, `deshacerHechoCentro`, `deshacerTandaPlana` | perfil, operación, ajuste de tiempo, marcas del mes, baño confirmado, hecho de centro, tanda plana | botones propios | ya confirmaban (confirm/prompt) | lo indicado | igual |
| 13 | `banoListo` / `confirmarBanoHecho` | recortaba `salidas_tin` a 500 | al registrar un baño hecho | ninguna | salidas viejas de tintorería | **Quitado** el recorte |
| 14 | Siembras `centrosPorOrden`, `reglasFamCentro`, `clasifMaterial`, `propuestaFalta`, `centroEtapa`, `camposConservados` | volvían a sembrar la tabla si estaba **vacía** (pisaban un vaciado a propósito) | al leer la tabla | ninguna | la decisión de dejarla vacía | **Solo siembran si la tabla no existe** (`Array.isArray`) |
| 15 | `perfilesDef()` | siembra el catálogo de perfiles si no existe o está vacío; añade `tablet` si falta | al leer | — | — | se deja así a propósito: sin perfiles nadie entra. Nunca pisa un perfil editado |
| 16 | `cargarTodo()` | `S={…vacío…}` en memoria y vuelve a leer la base | al entrar / Actualizar | — | nada (no escribe) | igual |
| 17 | `conEscenario()` | modifica recursos/params en memoria y los restaura al terminar | Escenarios | — | nada (no guarda) | igual |
| 18 | `S.params=Object.assign({},sd.params,r.data)` en `cargarTodo` | la siembra solo llena parámetros que no existen | al cargar | — | nada | igual |

No hay `localStorage.clear`, ni borrado de fotos (viven en Storage y solo se reemplazan por OP al subir otra), ni borrado
de bitácora en ningún otro sitio.

## 2 · Reglas ahora vigentes (y cómo se prueban)

- **La bitácora nunca se borra ni se recorta** (prueba: 520 entradas nuevas siguen ahí; el código no contiene
  `S.bitacora=S.bitacora.slice`; `bitacora` no está en `TABLAS_OPERATIVAS`).
- **Las tablas editadas nunca se pisan con la siembra** (prueba: `centroEtapa=[]` sigue vacía al leerla).
- **Las decisiones de persona sobreviven a cualquier recarga** (tabla 14 + prueba: la recarga no elimina órdenes; código
  contiene `estado:'noArchivo'`; el avance de piso no se borra: `delete S.avance[` no existe en el código).
- **Toda acción que borra pide confirmación y dice qué se pierde** (prueba: `delRec` con confirmación negada no borra; la
  guardia revisa que toda función `del*/borrar*/limpiar*/vaciar*/quitar*/eliminar*/deshacer*/retirar*` contenga
  `confirm(`, `prompt(` o la frase de borrado).
- **Nada se borra de paso** (prueba: solo dos llamadas `delete()` a la base: el guardado por diferencias y el borrado
  operativo con frase).
- **Guardia contra borrados nuevos**: la prueba compara las funciones de borrado del código contra una lista congelada
  (37 nombres); una función nueva que borre hace fallar el simulador hasta que se revise (que confirme y diga qué se
  pierde) y se agregue a la lista.

## 3 · Respaldo completo y restauración

**Qué guarda el botón "Respaldo"** (`exportJSON`): descarga `planificacion_tempo_<fecha>.json` con **todo `S`**: órdenes,
avance de piso, centros, recursos, telas, colores, categorías, operaciones, rutas, programas, cargas, propuestas,
paros, turnos, **bitácora completa**, planes congelados, salidas de tintorería, baños confirmados y **todos los
parámetros** (las 14 tablas de configuración, perfiles, tablets, plan mensual, alertas, fotos-índice…). **Sí alcanza**
como respaldo completo de datos y configuración. Lo único que no lleva son las **cuentas de usuario** (viven en Supabase
Auth: correo/contraseña; la tabla `perfiles` con el rol por usuario tampoco va en `S`) y las **imágenes** de las fotos
(en Storage; el respaldo lleva los enlaces y el índice).

**Cómo sacarlo**: entrar como administrador → botón **Respaldo** (arriba) → se descarga el JSON. Conviene uno diario y
antes de cada recarga (Parte 2, OT, fotos, LMO). Guárdalo fuera del repo (es información de clientes).

**Cómo restaurarlo**: administrador → Configuración → **Importar/Restaurar** (`importJSON`) → elegir el JSON. Pide
confirmación con los conteos (órdenes y entradas de bitácora actuales vs. del archivo), reemplaza los datos por los del
archivo, **une la bitácora** (no se pierde lo posterior) y anota "Respaldo restaurado" en la bitácora. Al guardar, las
filas que no estén en el archivo se quitan de la base (así el estado queda exactamente como el respaldo).

**Respaldo adicional recomendado (fuera de la app)**: en Supabase → Database → Backups (plan gratuito: sin backups
automáticos; conviene exportar las tablas por SQL o con `pg_dump` cada semana), y Storage → bucket `fotos-ordenes` →
descargar. Las cuentas se recrean en Usuarios → Nuevo usuario.

## 4 · Producción (15-sep-2026)
- La bitácora en producción tenía el tope de 500 hasta hoy: lo anterior ya no existe en la base; desde esta versión no se
  vuelve a recortar.
