# Planificar el mes en dos pasos — 20-sep-2026

**Decisión de la usuaria:** «primero se hace la nivelación y luego con eso sale el plan mensual; van de la mano, deberían ir
juntos, en una sola pantalla». Y sobre la capacidad: «en la nivelación pongo el centro, cuántas personas y qué días se trabaja,
sin ir a Configuración; al confirmar el escenario, todo el sistema calcula con eso, porque si se va con la configuración no
tenemos capacidad real».

## La pantalla: Dirección → **Planificar el mes** (`vPlan`, página `plan`, `PM.paso`)
Un solo lugar con dos pasos (chips arriba; los dos viven en el DOM, se muestra uno):

**1 · Nivelación** (`PM.paso=1`)
- **Días del mes por área**: el calendario de siempre (`planMesHTML`), que manda; se marcan y desmarcan días ahí mismo.
- **Personas por centro** (`personasNivHTML`): una fila por recurso de producción (sin maquila, sin centros «por días»), con tres
  columnas y una etiqueta que dice cuál manda:
  - **Configurado** = Configuración → Centros y recursos (la base, no se toca aquí).
  - **Vigente** = el ajuste ya guardado para las semanas del mes (si difiere por semana, se lista).
  - **Escenario** = lo que se escribe ahora. `nivPersSet(ym,rec,v)` lo mete en el simulador semanal (`SIM`) para TODAS las semanas
    del mes: la capacidad, la nivelación y el programa lo usan al instante en la sesión, sin guardar nada.
  - **Confirmar escenario** (motivo obligatorio) = `guardarAjustesCap(ym)`: graba las personas como el ajuste de cada semana
    (`S.params.ajustesCap[ym].semanas[lunes][rec].pers`, con base, motivo, quién y cuándo, bitácora). Desde ahí `capDia` —el
    programa, el plan, la carga por centro, la nivelación— calcula con ese valor. **Descartar** vuelve a lo vigente.
- **¿Alcanza la capacidad?**: la nivelación (`nivelacionCuerpoHTML`: recuadros por área, tabla, cuadrito) mirando el mes del plan.
  `nivUICapacidad` ahora da la capacidad por día como **promedio por día hábil del horizonte** (respeta ajustes de semana y el
  escenario, y lo dice en la nota), no solo la de hoy.
- «Más detalle» plegado: capacidad por área y por módulo, simulador semana por semana, ajustes guardados, guía.

**2 · Plan mensual** (`PM.paso=2`): resumen, meta, agregar órdenes, congelar y el detalle, como estaban. Una línea recuerda que
días, personas y capacidad vienen del paso 1.

**Planificación de producción → Nivelación** sigue existiendo (página `nivelacion`, `vNivelacion`): es la misma nivelación por
meses, con el botón «Planificar el mes →» que abre el paso 1. No hay dos cálculos: `nivelacionCuerpoHTML` es una sola función.

## Las tres capas de la capacidad (en orden de mando)
1. **Escenario** (borrador en la sesión, `SIM`) — mientras se está probando.
2. **Vigente** (ajuste de la semana guardado, `ajustesCap`) — lo que se confirmó para esas semanas.
3. **Configurado** (Configuración → Centros y recursos) — el punto de partida cuando nadie dijo otra cosa.
La pantalla lo escribe en cada fila. `nivelar()` y `programar()` no se tocaron: solo cambia lo que se les pasa.

## Pruebas
Bloque **PN** (8): la pantalla y sus dos pasos, la nivelación sincronizada con el mes del plan, escribir personas abre el escenario
para todas las semanas y la capacidad lo usa al instante sin guardar, confirmar sin motivo no guarda, confirmar graba el ajuste de
cada semana con motivo y bitácora y `capDia` lo usa, la base de Configuración no cambia, la página Nivelación sigue y lleva al plan.
Captura `?captura=uxplan` → `capturas/ui_planificar_mes.png`.
