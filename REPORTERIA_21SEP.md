# Reportería, versión del 21-sep-2026

**Decisión de la usuaria (noche del 20-sep):** «Asignación por orden no le encuentro sentido; Reportería textil
tampoco, quitémosla; la reportería por área como está, no: quitémosla y creamos otra; Vista general también,
porque se repite; un solo reporte de Producto en proceso, como la pivot de Odoo (por fase, unidades y valor $,
y también por cliente → fase, fase → cliente, familia, categoría); y un reporte del avance del programa por
área donde cada ingeniero vea solo lo suyo y los demás todo. La Auditoría del sistema y lo técnico de "por
área" que no se pierda».

## Menú Reportería (grupo `data-g="rep"`, misma lista que `REPORTES`)

| Entrada | Página | Qué es |
|---|---|---|
| Resumen gerencial | `gerencia` | sin cambios |
| **Producto en proceso** | `wip` | **la pivot** (nueva) |
| **Avance por área** | `avancearea` | **nuevo**: el programa de cada área esta semana |
| Cumplimiento de facturación | `cumplimiento` | sin cambios |
| Avance del mes | `avance` | sin cambios |

Se retiraron del menú y del código: `vVistaOrdenes` (+ `VO`), `vAsignacion` / `asignacionPorOrdenHTML` /
`arbolAPO` / `APO`, `vReporteria` (+ `REP`), la entrada «Reportería textil» de Planificación textil, el
agrupador propio de Producto en proceso (`WIP_CAMPOS`, `nivelesWIP`, `arbolWIP`, `wipOrdenesHTML`). Quedan
`clasificarAsig`, `pasoProximoDe` y `mDetalleAsig` (el detalle de la orden los usa) y `mDetalleOrden`.
**Los enlaces viejos no se rompen**: `PAGINAS_REDIRIGIDAS` (`vistaordenes` → `wip`, `asignacion` → `wip`,
`reporteria` → `avancearea`) se aplica en `render()` antes de dibujar, y los perfiles que tenían esas páginas
reciben `avancearea` y `wip` una sola vez (`S.params.migReporteria2`, bitácora).

## Producto en proceso = una pivot (`vWIP`)

- **Base** (chips, dicha en pantalla con `cifraCarteraHTML`): abiertas (por defecto, como Odoo) · lanzadas ·
  liberadas — siempre por `carteraDe()`. Un perfil que ve solo sus centros ve solo esas órdenes (`wipVeTodo` /
  `ordenesQueVe`) y la pantalla lo dice («solo las órdenes de tus centros»); el filtro de fases se poda al cambiar de
  base (`podarFases`), como en Órdenes. Las filas van por fecha meta y WH.
- **Agrupación**: chips rápidos `WIP_PRESETS` — Fase (por defecto) · Cliente → Fase · Fase → Cliente · Familia ·
  Familia → Tipo de producto · Cliente · Sin agrupar — y el **agrupador común** (`grpSelHTML('wip')`) para armar
  cualquier otra (hasta 3 niveles). Se recuerda por usuario (`localStorage __grp_<usuario>_wip`); `WIPL.niveles`
  queda solo como puente para fijarla desde fuera (pruebas).
- **Columnas**: OP · fase (foto + WH + fase), Cliente, ODC, Estilo, Familia, Tipo de producto, Color, Entrega
  (= fecha meta, la misma del semáforo; el tooltip dice si es compromiso u Odoo), Dónde está, Estado (semáforo),
  **Órdenes, Prendas pedidas, Total $**. Cada grupo pinta sus tres totales en
  celdas (nuevo `g.cabFn` del agrupador común: si devuelve un arreglo, `filasGRP` lo pone en columnas en vez del
  texto «N órdenes · prendas · h»; las demás pantallas no cambian). Arriba, la fila **Total** con los mismos tres
  números y «s/precio» cuando hay prendas sin precio (no suman al valor).
- **$** = `usdOrden(o)` = precio de Odoo (total ÷ cantidad al cargar) × prendas — la misma fórmula del
  Resumen gerencial.
- Filtro de fases común (`WIP.fases`, con conteo por fase), buscador común (`WIPL.q`), aviso de base acotada.
- Clic en la orden → `mDetalleOrden` (ruta, dónde está, qué le falta, historial de fases, foto).
- Plegado al final, «Programado en máquinas y pendiente por ítem» (`wipMaquinasHTML`): kilos en tejedoras y
  baños en tintorería de todo el horizonte programado (se dice), y prendas/minutos pendientes por **ítem de
  planificación** (`itemsPlanProd()`, derivado de la columna «Ítem de planificación») con **la misma cuenta de
  Carga general** (`cargaUnica('abiertas')`), no un segundo cálculo — lo que antes eran las tres pestañas.

## Avance por área (`vAvanceArea`, página `avancearea`, estado `AVA`)

- Semana con ‹ › (`AVA.sem`); **una fila por ítem de planificación** que el perfil ve (`areasAvance()` =
  `itemsPlanProd()` filtrado por `veCentro`): Programadas · Hechas · Pendientes · Cumplimiento · Ocupación ·
  Órdenes atrasadas · Contra lo congelado. Todo sale de `avanceSemanaCentro` / `datosDiaCentro` /
  `avanceCongelado`, **los mismos números del «Avance de la semana» de cada centro** (pestaña Planificación) — no
  hay un segundo cálculo; «órdenes atrasadas» es el diagnóstico de atraso (`diagAtraso`), y la pantalla lo dice.
- «Ves solo tu área» / «Ves todas las áreas» según lo que realmente ve (un ítem con sub-áreas que el perfil no ve
  suma solo las suyas y lo marca «solo lo tuyo»). Un perfil con una sola área la abre directo. «Sin registros» solo
  se reclama a los días laborables que ya pasaron (hoy y la semana que viene no: «todavía no empieza»), regla que
  también arregló el Avance de la semana y las tarjetas del centro (`registroSemana`, `datosDiaCentro`).
- Clic en la fila → detalle: sub-áreas (`resumenSubCentrosHTML`, sin el «ver sola» que aquí no aplica), **día por día** (programadas, hechas,
  pendientes, carga vs capacidad; «sin registros» cuando el día laborable no tiene registro), **órdenes
  programadas esta semana** con lo hecho (acumulado en el centro, dicho en la columna) y la marca única
  (`marcaCentroUna`), «contra lo congelado» dice cuántas sub-áreas están congeladas, y «abrir el centro →» abre el
  ítem completo (`irItemPlan`).
- Para quien ve textil: Tejeduría y Tintorería de la semana (`avanceTextilHTML`: horas programadas por máquina
  contra capacidad, kilos, baños programados/salidos, en calidad, reprocesos) — lo útil de la reportería textil.

## Salud del sistema (Configuración, `vSalud`, página `salud`, permiso `programa`)

Reúne lo técnico que vivía al final de la reportería por área: Auditoría del sistema, chequeo de siembras,
registro de producción por centro y día, cuántas órdenes hay, categorías sin hoja, órdenes sin fecha, rutas sin
Empaque (antes el panel existía pero **no se mostraba en ninguna pantalla**), rutas estimadas y fases sin
secuencia. El enlace «Ver la brecha y corregirla →» del Resumen gerencial lleva ahí.

## Otros cambios que arrastró

- Los **días de holgura** (`colchonDias`) solo se editaban en Asignación por orden: ahora están en
  Configuración → Calendario y parámetros, junto a la cola del centro.
- `estadosPantalla()` conoce `AVA` y ya no `APO`, `VO`, `REP`; `PAGINAS_DEF` lista `avancearea` y `salud`.
- `ICO_NAV`: `avancearea`, `salud`. `ir(p)` aplica la redirección (`redirigirPagina`) antes de buscar el enlace: los
  enlaces viejos de bandejas (`ir('reporteria')`) ya no se quedan mudos; «rebalancear» en Ejecución de Confección abre
  la pestaña Costura del centro (`ir('costura')` llevaba a una entrada de menú que se quitó el 15-sep).
- Revisión adversarial (workflow de 4 revisores + 45 verificadores): 28 hallazgos confirmados, todos corregidos en
  la misma noche; los rechazados quedaron como estaban (ver `ENTREGA_21SEP_NOCHE.md`, sección 8).

Pruebas: REP (menú = `REPORTES`, pivot por fase con celdas que suman y cuadran con el total, agrupaciones
rápidas, despliegue hasta la orden, cambio de base, barra), Avance por área (admin ve Corte y Confección; piso
corte ve solo lo suyo; detalle; textil), Salud del sistema (paneles), redirecciones, y todas las pruebas que
apuntaban a las pantallas retiradas se movieron a las nuevas.
