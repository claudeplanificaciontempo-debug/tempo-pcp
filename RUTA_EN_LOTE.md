# Ruta en lote — editar la misma ruta para varias órdenes (20-sep-2026)

**Pedido de la usuaria:** «¿qué me permite editar rutas masivas? Hay varios productos que comparten ruta; con eso podría
editar la ruta masiva».

## Qué había antes
- **Por referencia** (Órdenes → Rutas → Por definir): «Editar y confirmar» edita la ruta de la primera WH de la referencia y
  «Confirmar como está» la baja a las demás WH abiertas y no liberadas de esa referencia (`aplicarRutaARef`).
- **Confirmar las que coinciden con Odoo** (`confirmarRutasOdoo`): solo confirma, no edita.
- **Reglas de ruta** (tabla editable): agregan una sub-área de terminados por familia/categoría/atributo; no arman una ruta.
- **Ruta por centro** (`mRutaCentro`): una orden a la vez.

Nada permitía decir «todas las Short Basico llevan corte → estampado → confección → empaque» de una vez.

## Segunda versión (misma tarde): la usuaria vio la primera y pidió «un solo recuadro»
«Primero me sale un bloque, luego otro, le agrupo y no funciona… hazlo muy simple: un solo recuadro donde estén todas las órdenes,
que pueda agrupar por las agrupaciones que tenemos en todo el sistema y de ahí marcar todo el grupo y definir ruta para todos.»
La primera versión tenía la tarjeta, las rutas estimadas, las reglas, la barra, «qué dice Odoo», la lista por referencia **y** un modal
con sus propios filtros (por eso «le agrupo y no funciona»: el agrupador de la pestaña solo movía la lista de confirmadas). Se
reemplazó todo por lo de abajo.

## Qué hay ahora: Órdenes → Rutas = UN recuadro (`rutasHTML`)
- **Una lista** (`rutasBase` = abiertas cuya ruta se revisa; `rutasLista` = según el chip **Por confirmar / Confirmadas / Todas** y
  el buscador `RUT.q`) con el **agrupador común** (`grpSt('rut')`, por defecto familia → tipo de producto; hasta 3 niveles como en
  todo el sistema), **casilla por grupo** en la cabecera («marcar el grupo», `selGrupoRut`, vía `g.selFn/g.selChk` del agrupador) y
  **casilla por orden** (`togSelRut`, sin redibujar). Columnas: OP · fase, referencia, cliente, tipo de producto, ruta actual, lo que
  dice Odoo, estado (por confirmar / estimada sin revisar / confirmada por Odoo OT o persona con quién y cuándo) y «editar» (ruta por
  orden). Sin agrupar se muestran 600 y lo dice.
- **Barra de acciones sobre lo marcado** (`RUT.sel`): «Definir ruta para las marcadas» (`abrirRutaLote` → el modal de abajo),
  «Confirmar como están» (`confirmarRutasSel`: deja confirmada la ruta que ya tiene cada una, sin cambiar pasos; auditoría por orden,
  una bitácora), «Marcar todas las de la lista», «Desmarcar».
- **«Más herramientas»** plegado abajo: qué dice Odoo (+ «Confirmar las que coinciden con Odoo»), rutas estimadas (`rutasEstimadasHTML`)
  y reglas para agregar sub-áreas (`reglasRutaHTML`). La lista por referencia y la tarjeta desaparecieron; `aplicarRutaARef` sigue
  existiendo (la usan las pruebas RU3) pero ya no tiene botón.

## El modal «Definir ruta para las marcadas» (`mRutaLote`)
Trabaja sobre **la selección** (`RLOTE.ids`, sin filtros propios):
1. **Órdenes marcadas** — cuántas entran (abiertas cuya ruta se revisa), referencias, prendas, cuántas ya están liberadas a
   producción, cuántas tienen la ruta editada a mano, cuántas confirmadas (se pisan; queda en auditoría con el origen) y cuántas
   marcadas no entran (cerradas o con la prenda terminada).
2. **Rutas que tienen hoy** — las rutas de producción distintas del grupo con cuántas órdenes y prendas; «usar» toma una como base.
3. **Ruta nueva** — casillas de los centros de producción (`centrosLote`: los mismos del editor por orden, habilitados según
   `centrosEditablesRuta`; los que el perfil no edita se dejan como están en cada orden), con la etiqueta «por defecto» de
   Configuración → Centros. Arranca en la ruta más común del grupo (`rutaLoteBase`) y, una vez que se marca algo a mano
   (`RLOTE.tocado`), ya no se rehace al cambiar filtros. Avisos a la vista (`avisosRutaLote`): ruta que no termina en Empaque,
   centros «por defecto» que faltan.
4. **Qué cambia** — `planRutaLote` por orden: **entra** (marcado, no lo tenía, editable y no hecho), **sale** (no marcado y lo
   tenía), **conserva** (hecho o no editable, aunque se desmarque), **no se agrega** (marcado pero la fase ya pasó por ahí),
   **sin tiempo** (el paso entra en 0); cuenta cambian / quedan igual (solo se confirman) / conservan pasos hechos / no reciben un
   paso / marcadas «revisar» por cambio de catálogo (se dan por revisadas). Tabla con antes → después y nota por orden.

**Aplicar** (`aplicarRutaLote`, limpia la selección al terminar): exige `puedeEditarRuta()`, motivo escrito, un perfil que guarde órdenes (no de piso), al menos un
centro marcado y que **ninguna orden quede sin Empaque** (regla fija: toda ruta de producción termina en Empaque; si no, avisa y no
aplica). Pide confirmación con el resumen (ruta en tus centros, cuántas cambian, liberadas, confirmadas que se pisan, avisos, pasos
sin tiempo). Por orden: quita `menos`, inserta `mas` en su posición de `ordenPaso` en `o.ruta` y en `o.rutaCompleta` (sin
reordenar lo demás ni duplicar), el tiempo del paso nuevo sale de **`tiempoPaso`** (hoja LMO de la categoría de ESA orden;
puntadas para bordado; el centro para lavado/plancha; 0 con aviso si no hay) y los pasos que ya tenía conservan su tiempo;
`sellarRuta`, quita `rutaRevisar`, agrega `rutaEditada` (`etapa:'lote'`) si cambió, deja `rutaConf` confirmada (persona, nota
«ruta en lote: …») y una entrada de **auditoría** por orden (antes → después con el origen que se pisó). **Una sola línea de
bitácora** para el lote. Después corre el programa una vez antes y una después (`avisosFechaLote`, la versión en lote de
`conAvisoFecha`): las órdenes que pasan a terminar después de su fecha meta entran a Hoy → Advertencias de fecha.

## Ruta pendiente y ruta completa
`o.ruta` (lo que `programar()` lee: los pasos pendientes) y `o.rutaCompleta` (con los ya hechos) **divergen en producción**: la ficha,
el lavado, la ruta por referencia y la corrección de Empaque escriben solo `o.ruta`. El lote decide sobre la **unión**
(`pasosProCompleta`), un paso **entra** si falta en la pendiente (aunque la completa lo traiga), y al aplicar deja la completa
coherente con la pendiente (sin lo que salió, con lo que la pendiente traiga). Un paso que la **fase de Odoo excluye o da por
hecho** (`pasoFijoPorFase`, vía `pasosPendientes` de la tabla 1: p. ej. confección en fase de maquila) es fijo, como lo hecho por
`pasoHecho`. `rutasDivergen(o)` marca la fila («ruta pendiente ≠ ruta completa: se deja coherente»). Quitar un paso que ya tiene
avance registrado en piso (unidades o tramo abierto) se avisa en la fila, en el resumen y en el confirm (`conAvance`).

## Reglas que respeta
- «Hecho» es la **misma puerta del motor** (`pasoHecho`: fase de Odoo, cierre en piso o unidades completas), no solo la fase.
- La parte textil (tejeduría / tintorería / proveedor) de cada orden no se toca. La modalidad del lavado (planta / Quito) sigue
  siendo por orden (Liberación → lavado); el lote solo pone o quita el paso, como el editor por orden.
- Estampado y bordado siguen fuera de la firma de ruta a propósito (`firmaRutaDe`); el lote los pone o quita como decisión de la
  persona y la ruta queda editada a mano: el recálculo automático no la pisa (la marca «revisar» si cambia el catálogo).
- Nada corre solo; nada se borra; cancelar o aplicar deja el estado del lote limpio (`RLOTE0`).

## Tres cosas más de la usuaria (20-sep, tarde)
1. **Desplegar un grupo mandaba la lista al inicio.** `togGRP` redibuja toda la página y el recuadro con scroll volvía arriba.
   Ahora `conScrollGRP(id,fn)` guarda el `scrollTop` del contenedor marcado `data-grp-scroll="<id>"` (y el de la ventana), redibuja y
   lo restaura; lo usan `togGRP` (cualquier lista que lleve el atributo) y `selGrupoRut`. La lista de Rutas lo lleva.
2. **Aprovechar el ancho.** La fila de filtros de Rutas va en UNA línea: buscador · agrupar por (los tres selectores en línea) ·
   **filtro de fases** (`filtroFasesHTML`, `RUT.fases`, `togFaseRUT`, como en las demás pantallas) · chips.
3. **Los pasos ya hechos salían desmarcados en la ruta por orden** (una orden en 8Servicios y Terminados mostraba Corte, Estampado,
   Bordado, Confección «hecho» pero sin marcar). Causa: `mRutaCentro` miraba solo `o.ruta` (la pendiente), y los pasos hechos ya
   no están ahí. Ahora mira también `o.rutaCompleta`: lo hecho sale marcado y deshabilitado, y solo queda por decidir lo de
   terminados. Lo mismo le pasaba a **«qué dice Odoo»** (`diagRutaOdoo` comparaba contra la pendiente: «Odoo tiene Corte, la ruta
   no» en órdenes que sí lo tenían y ya lo habían cortado); ahora compara contra la completa (`pasosProCompleta`), así que muchas más
   «coinciden exacto» y se pueden confirmar solas.
   **La OT manda sobre la ruta** (decisión de la usuaria: «cuando cargue la orden de trabajo debería empatarse a la ruta»):
   `empatarRutaConOT(o)` agrega a la ruta todo centro de producción con orden de trabajo no cancelada (terminada → solo a la
   completa, como hecho; pendiente → a la completa y a la pendiente), en su orden de paso, con el tiempo de `tiempoPaso`, marcado
   `{ot:true}` y anotado en `o.rutaOT`; **nunca quita** un paso por falta de OT (Empaque y terminados suelen no tener). Corre al
   aplicar OT (`aplicarOT`; el aviso y el registro de cargas dicen cuántas órdenes recibieron pasos), al recargar tareas (`aplicarTarea`
   conserva «ot» y vuelve a empatar) y al rehacer rutas por catálogo (`recalcularRutas`, con la nota «+ OT: …» en la auditoría).
   Pruebas UX3.

## Tres cosas más de la usuaria (20-sep, tarde)
1. **Desplegar un grupo mandaba la lista al inicio.** `togGRP` redibuja toda la página y el recuadro con scroll volvía arriba.
   Ahora `conScrollGRP(id,fn)` guarda el `scrollTop` del contenedor marcado `data-grp-scroll="<id>"` (y el de la ventana), redibuja y
   lo restaura; lo usan `togGRP` (cualquier lista que lleve el atributo) y `selGrupoRut`. La lista de Rutas lo lleva.
2. **Aprovechar el ancho.** La fila de filtros de Rutas va en UNA línea: buscador · agrupar por (los tres selectores en línea) ·
   **filtro de fases** (`filtroFasesHTML`, `RUT.fases`, `togFaseRUT`, como en las demás pantallas) · chips.
3. **Los pasos ya hechos salían desmarcados en la ruta por orden** (una orden en 8Servicios y Terminados mostraba Corte, Estampado,
   Bordado, Confección «hecho» pero sin marcar). Causa: `mRutaCentro` miraba solo `o.ruta` (la pendiente), y los pasos hechos ya
   no están ahí. Ahora mira también `o.rutaCompleta`: lo hecho sale marcado y deshabilitado, y solo queda por decidir lo de
   terminados. Lo mismo le pasaba a **«qué dice Odoo»** (`diagRutaOdoo` comparaba contra la pendiente: «Odoo tiene Corte, la ruta
   no» en órdenes que sí lo tenían y ya lo habían cortado); ahora compara contra la completa (`pasosProCompleta`), así que muchas más
   «coinciden exacto» y se pueden confirmar solas.
   **La OT manda sobre la ruta** (decisión de la usuaria: «cuando cargue la orden de trabajo debería empatarse a la ruta»):
   `empatarRutaConOT(o)` agrega a la ruta todo centro de producción con orden de trabajo no cancelada (terminada → solo a la
   completa, como hecho; pendiente → a la completa y a la pendiente), en su orden de paso, con el tiempo de `tiempoPaso`, marcado
   `{ot:true}` y anotado en `o.rutaOT`; **nunca quita** un paso por falta de OT (Empaque y terminados suelen no tener). Corre al
   aplicar OT (`aplicarOT`; el aviso y el registro de cargas dicen cuántas órdenes recibieron pasos), al recargar tareas (`aplicarTarea`
   conserva «ot» y vuelve a empatar) y al rehacer rutas por catálogo (`recalcularRutas`, con la nota «+ OT: …» en la auditoría).
   Pruebas UX3.

## «Ruta ok» una a una y redibujar sin perder el sitio (20-sep, tarde)
La usuaria: «cuando quiero poner la ruta una a una no me deja en la parte principal… veo que la ruta por defecto está bien,
quiero ponerle check y no tengo que hacer nada más». Dos cosas:
- **`render()` ya no manda la pantalla al inicio.** `tomarScroll()` guarda la posición de la ventana y de cada recuadro con
  `data-grp-scroll="<id>"` y `devolverScroll()` la devuelve al final del redibujo si sigue la misma página (otra página empieza
  arriba). `redibujarLista` hace lo mismo. La lista de Órdenes lleva `data-grp-scroll="ord"`; cualquier lista larga puede llevarlo.
- **Columna Ruta y botón «✓ Ruta ok» en la lista de Órdenes** (`rutaCeldaHTML`, `rutaOkFila`): la fila muestra los pasos de
  producción de la ruta completa (los hechos en gris; «por defecto» si nació de la ruta por defecto; ✓ si ya está confirmada) y,
  si está por editar y el perfil edita rutas, un botón que la confirma tal como está (persona, sellada, auditoría y bitácora) sin
  abrir la ficha. La fila sale de «Por editar» y la lista no se mueve. Pruebas UX4.

## Excedentes, ODC y prendas en Rutas, y la OT no toca lo confirmado (20-sep, tarde)
- **Excedentes** (usuaria: «prendas que teníamos en bodega y quieren que les vendamos; lo que falta es etiquetar con la pistola o poner
  RFID, un proceso final, no es estampado»): `esExcedente(o)` = la ODC (o el proyecto) contiene alguna de las **palabras** del parámetro
  `palabrasExcedente` («EXCEDENTE» por defecto, coma-separadas) o la marca a mano `o.excedente`. Su ruta de producción es **solo el
  centro final** (`centroExcedente`, Empaque por defecto; tiempo = el de empaque de la categoría). Los dos parámetros están en Calendario
  y parámetros. Al cargar tareas, una orden nueva excedente nace con esa ruta (sin textil, sin corte), «estimada» con nota, para
  confirmarla con «✓ Ruta ok». Las ya cargadas se ven con la etiqueta **excedente** en Órdenes y Rutas; agrupando por ODC se les
  define la ruta de un golpe (marcar el grupo → Definir ruta → solo Empaque).
- La lista de **Rutas** trae **ODC** y **prendas** por orden (antes solo el total en la cabecera del grupo).
- **La OT no toca una ruta confirmada** (usuaria: «no quiero que las rutas que ya trabajé se vean editadas por las órdenes de
  trabajo»): `empatarRutaConOT` devuelve `[]` si `rutaConfirmada(o)`; `aplicarOT` cuenta las confirmadas cuya OT trae un centro fuera
  de la ruta (`confNoTocadas`, en el aviso, el registro de cargas y el **Reporte OT** con la lista) — se reportan, no se aplican.
  Pruebas EX.

## Pruebas
Bloque **RLT** del simulador (23 comprobaciones): la lista y sus grupos con casilla, marcar un grupo desde la cabecera, marcar
/ desmarcar una fila sin redibujar, el modal sobre la selección, base más común, plan (entra/sale/conserva/excluido por la fase),
permisos, motivo, ruta vacía y sin Empaque bloqueadas, aplicación (rutas completa y pendiente coherentes, tiempos por `tiempoPaso`,
confirmación, sello, auditoría, bitácora única, selección limpia), órdenes no marcadas intactas, «Confirmadas» y el aviso «se pisan»,
«Confirmar como están», paso hecho por fase y por cierre en piso, cancelar limpio. Capturas `?captura=uxrutas` →
`capturas/ui_rutas.png` y `?captura=uxlote` → `capturas/ui_ruta_lote.png`.

## Revisión adversarial (workflow de 4 lentes + verificación)
Hallazgos aplicados: paso hecho por `pasoHecho` (no solo fase); advertencias de fecha para las liberadas; `rutaCompleta` se
inserta por orden de paso en vez de reordenarse entera; aviso y bloqueo por Empaque / centros por defecto; lavado igual que el
editor por orden (sin id fijo en código); estado limpio tras aplicar o cancelar; conteo de «revisar»; centros marcados que no se
agregan explicados; confirm y bitácora nombran solo los centros del perfil; origen de la confirmación que se pisa a la vista;
tiempos por `tiempoPaso`; ruta vacía bloqueada; fila sin clics que abran otro modal encima; Buscar/Referencia con Enter; hija sin
padre; centros marcados a mano que sobreviven a los filtros; perfil de piso no aplica. Descartados como no reales: topes de
pantalla (dicen «y N más»), «(sin referencia)» como referencia (es explícito).
