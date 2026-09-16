# Parte A — Dirección, Liberación y Planificación de producción

**Commit:** `c2812b3` · **Harness:** 1.414 pruebas verdes, sin errores.

Los diez puntos están hechos. Abajo, qué cambió en cada uno y las brechas que aparecieron.

---

## 1 · Dirección → Hoy: cada área abre su propio programa

El panel **«Planta hoy»** tenía un solo enlace «ver carga» que iba a Carga general. Ahora **cada centro tiene su
propio «ver programa»** y abre la pantalla de ese centro, en la pestaña de programación y **en la semana del día
que se pidió**.

Dos cosas más que hacían falta para que sirva:

- **Se listan todos los centros de producción**, no solo los que tienen carga hoy. Antes, un área con 0 no
  aparecía siquiera; ahora aparece con su 0 y con el enlace, que es justo lo que pediste para poder verificar.
- Si el centro es una **sub-área** (Etiquetas, Plancha…), el enlace abre esa sub-área sola dentro de su ítem de
  planificación.

**Un error real que encontré al probarlo:** `ir('centro')` pulsa la primera entrada «centro» del menú, y el clic
del menú fijaba *su* centro encima del que yo había elegido — el enlace de Estampado terminaba abriendo Corte.
Ahora se navega primero y se fija el centro después.

---

## 2 · Menú

**«Reportería por área» salió de Planificación de producción.** Sigue en la pestaña **Reportería**, donde ya
estaba duplicada.

---

## 3 · Liberación a producción: fecha y resumen

**Hacia adelante:** al liberar se guardan **fecha, hora y usuario** en la orden, y queda una línea en su
historial (`histLib`).

**Para las ya liberadas**, `libFechaDe()` va por orden de confianza:

| Origen | Qué se muestra |
| --- | --- |
| Registro de la liberación | fecha, hora y usuario |
| Reconstruida de la auditoría | lo mismo, con la etiqueta **aud.** para que se sepa de dónde salió |
| Nada de lo anterior | **«fecha de liberación desconocida»** en rojo |

**No se inventa ninguna fecha.** Las desconocidas quedan fuera del resumen y contadas aparte como brecha.

**En la tabla de órdenes liberadas** la columna «Liberó» pasó a ser **«Liberada»**: fecha, hora y usuario.

**Bloque nuevo al final, «Cuánto se liberó»:** órdenes y prendas liberadas **por día, semana o mes**, con
**selector de rango** (desde / hasta), barra de volumen y quién liberó en cada período.

---

## 4 · Desliberar

Estaba solo en Liberación textil. Ahora también en **Liberación a producción**, en lote (**«Desliberar las
marcadas»**) y una a una (botón **desliberar** en cada fila), y **desde Dirección**.

- **Permiso:** solo **jefe de planificación de producción y Dirección** (permiso `programa`). Un encargado de
  centro no ve el botón **y, si llama la función a mano, tampoco pasa nada** — está probado.
- **Motivo obligatorio** de la tabla 15; sin él no se deslibera.
- Queda en la **auditoría** y en el **historial de la orden**.
- **Si la orden ya tiene avance registrado**, el modal lo advierte **antes de confirmar**, con el detalle por
  centro. El avance **no se borra**: la auditoría deja escrito qué tenía.

---

## 5 · Agrupación en toda Planificación de producción

El agrupador ya ofrecía **Cliente, Fase, ODC, Familia** y Tela; lo que faltaba era tenerlo en **todas** las
pantallas con el mismo componente:

| Pantalla | Antes | Ahora |
| --- | --- | --- |
| Liberación (las dos) | sí | sí |
| Carga general | sí | sí |
| Cada centro y sub-centro | sí | sí |
| **Balanceo** | **no** | **sí** (panel «Detalle de las órdenes») |
| **Programa del día** | **no** | **sí** (panel «Detalle del día») |

En Programa del día el agrupador es para mirarlo en pantalla: **la hoja impresa conserva centro → recurso**,
que es como la firma el piso.

---

## 6 · Fecha de arranque

**«Arranca» no acepta fechas anteriores a hoy**, y la regla está en los dos lados: `min=` en el campo de fecha
**y validación en el guardado**, así que no se puede saltar llamando a la función directamente.

**Las órdenes que ya arrancaron conservan su fecha real.** «Ya arrancó» = tiene avance registrado en ese centro
o un tramo iniciado; a esas no se les aplica el tope y su fecha pasada se guarda sin problema.

### Dónde más se puede fijar una fecha de inicio (lo que me pediste reportar)

| Dónde | Qué es | Qué hice |
| --- | --- | --- |
| **Centro → Programación → «Arranca»** | la fecha que el centro le fija a una orden | **regla aplicada** |
| **Configuración → Centros → «desde»** | el centro no está disponible antes de esa fecha | **no se tocó**: es una restricción del centro, no un inicio de orden; poner una fecha pasada ahí es lo normal (significa «ya está disponible») |
| **Configuración → Calendario → inicio del plan** | desde cuándo programa el motor | **no se tocó**: es un parámetro global del plan |
| **Tejeduría manual → día** | programación de corridas de tejeduría por kg | **queda pendiente**: es otro flujo (por kg, no por orden) y no lo toqué sin avisarte |

---

## 7 · Permisos de rutas

### Los roles que existen hoy

| Perfil | ¿Edita rutas? antes | ahora | Reprograma | Programa |
| --- | --- | --- | --- | --- |
| Administrador | sí | **sí** | sí | sí |
| **Planificación** (jefe de planificación de producción) | sí | **sí** | sí | sí |
| Corte, estampado y bordado | **sí** | **no** | sí | no |
| Módulos (confección) | **sí** | **no** | sí | no |
| Producto terminado | **sí** | **no** | sí | no |
| Tintorería | no | no | no | no |
| Liberación | no | no | no | no |
| Consulta | no | no | no | no |
| Tablet de centro (operarios) | no | no | no | no |

**Qué cambió:** los tres perfiles de centro perdieron el permiso `ruta`. **Siguen viendo** las rutas y siguen
reprogramando su cola; lo que no pueden es crear ni editar rutas, ni tocar la tabla de reglas de ruta, ni
agregar o quitar lavado.

**No es solo esconder botones.** `puedeEditarRuta()` reemplazó los 16 chequeos sueltos que había y se valida
**en el guardado** de: guardar ruta de una orden, crear/editar/borrar reglas de ruta, aplicar reglas, agregar o
quitar lavado, confirmar y desconfirmar ruta, marcar una ruta estimada como revisada, generar rutas estimadas y
confirmar rutas desde Odoo. Hay una prueba que llama a la función a mano con perfil de centro y verifica que la
ruta no cambia.

**Nota:** no creé un rol nuevo llamado «jefe de planificación de producción» — el perfil **Planificación** ya es
ese, y crear un rol duplicado habría dejado dos sitios diciendo lo mismo. El cambio es una siembra idempotente
con bitácora y **es editable** en Configuración → Usuarios: si quieres que algún encargado sí edite rutas, se le
marca ahí.

---

## 8 · Bloque «Sin fecha todavía»

**Salió de la vista de los encargados de centro.** Lo siguen viendo planificación y administración.

**No desaparecieron del sistema:** hay un panel nuevo en **Reportería → «Órdenes sin fecha»** que las cuenta
como brecha y, por cada una, **dice qué la frena**: sin ruta de producción, sin minutos por prenda en algún
paso, sin recursos activos en algún centro, sin fecha de entrega, o el motor no la alcanzó a colocar.

---

## 9 · Bloque «Lo que viene»

En cada centro, un panel que muestra **las órdenes que van a llegar** y **dónde están ahora**
(«Tintorería · textil lista por liberar», «En confección»…), con:

- **cuántas prendas** vienen,
- **qué les falta antes de llegar** (los pasos pendientes de su ruta),
- **por qué sub-área entran**, cuando el ítem de planificación tiene varias,
- y el **agrupador común**, para jalar trabajo por cliente, ODC o familia.

Sale de la **ruta de cada orden**: las que tienen ese centro en su ruta y todavía están en un paso anterior. Las
que ya le tocan no aparecen aquí — esas ya están en la cola.

---

## 10 · Columna «Dónde está»

Dentro de la pantalla de un centro **ya no se repite el nombre del centro**. Si la orden está ahí, se muestra su
**estado propio**, y si no, se sigue mostrando dónde está.

Los textos son **configurables por centro** (tabla 17 · Textos de pantalla). Sembrados:

| Centro | Sin empezar | En proceso | Terminada |
| --- | --- | --- | --- |
| Corte | Por cortar | Cortando | Cortada |
| Confección | Por coser | Cosiendo | Cosida |
| Estampado | Por estampar | Estampando | Estampada |
| Bordado | Por bordar | Bordando | Bordada |
| Etiquetas | Por etiquetar | Etiquetando | Etiquetada |
| Ojales y botones | Por hacer ojales | En ojales y botones | Con ojales y botones |
| Lavado | Por lavar | Lavando | Lavada |
| Plancha | Por planchar | Planchando | Planchada |
| Empaque | Por empacar | Empacando | Empacada |

Cuando está en proceso, además muestra **cuántas lleva** de cuántas.

---

## Archivos tocados

| Archivo | Qué cambió |
| --- | --- |
| `index.html` | `irCentro`; `libFechaDe`/`libFechaTxt`/`resumenLiberacion`/`resumenLiberacionHTML`; `puedeDesliberar`/`mDesliberar`/`desliberar`/`aplicarDesliberacion`/`avanceDeOrden`; `yaArranco`/`minArranque`/`fechaArranqueValida`; `puedeEditarRuta`/`sembrarPermisoRutas`; `veSinFecha`/`ordenesSinFechaBrecha`/`sinFechaBrechaHTML`/`motivoSinFecha`; `loQueVieneDe`/`loQueVieneHTML`; `estadosCentro`/`estadoEnCentro`/`estadoCentroTxt`/`dondeEstaEnCentro`; `detalleAgrupableHTML`; menú y panel «Planta hoy» |
| `test/driver.js` | 65 pruebas nuevas (una por punto y sus casos límite) y 1 actualizada al cambio de permisos |
| `PARTE_A_REPORTE.md` | este reporte |

---

## Brechas detectadas

1. **Órdenes liberadas sin fecha de liberación.** Las que se liberaron antes de este cambio y no dejaron rastro
   en la auditoría quedan marcadas como desconocidas. No se les inventa fecha y no entran al resumen.
2. **Tejeduría manual sigue aceptando días pasados.** Es el único lugar donde queda una fecha de inicio sin el
   tope, y no lo toqué porque es otro flujo (por kg, no por orden). Dime si quieres la misma regla ahí.
3. **Los textos de estado por centro son siembra, no dictado tuyo.** Están puestos con el nombre del proceso
   («Por cortar / Cortando / Cortada») y son editables; si alguno se dice distinto en planta, se cambia ahí.
4. **El permiso de rutas se quitó a tres perfiles de centro.** Si alguno de esos encargados hoy arma rutas en la
   práctica, se le devuelve el permiso en Configuración → Usuarios: el cambio no es un candado de código.
5. Siguen abiertas las brechas de la entrega anterior: **Level 1 y Level 2 fuera del catálogo**, las **dos
   operaciones de BVD y FITS sin centro**, **solo 3 de 24 categorías con familia LMO**, las **685 órdenes sin
   ruta de producción** y los **datos de las lavadoras**.
