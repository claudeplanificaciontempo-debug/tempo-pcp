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

## Qué hay ahora: Órdenes → Rutas → **Editar ruta en lote** (`abrirRutaLote` / `mRutaLote`)
Cuatro pasos en un modal ancho:
1. **Qué órdenes** — familia, tipo de producto, referencia, cliente y buscador (Referencia y Buscar se aplican con Enter o con
   «Filtrar», no al salir del campo). Base: **órdenes abiertas cuya ruta se revisa** (`rutaLoteCandidatas`: `abierta` y no
   `rutaNoAplica` — las de prenda terminada quedan fuera) y **sin ruta confirmada**, salvo que se marque «incluir las que ya
   tienen ruta confirmada» (se pisan; queda en auditoría con el origen que tenía). Muestra órdenes, referencias, prendas, cuántas
   ya están liberadas a producción, cuántas tienen la ruta editada a mano y cuántas confirmadas.
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

**Aplicar** (`aplicarRutaLote`): exige `puedeEditarRuta()`, motivo escrito, un perfil que guarde órdenes (no de piso), al menos un
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

## Pruebas
Bloque **RLT** del simulador (22 comprobaciones): alcance y conteos, base más común, plan (entra/sale/conserva/omitidas por
fase), permisos, motivo, ruta vacía y sin Empaque bloqueadas, aplicación (rutas completa y pendiente coherentes, tiempos por
`tiempoPaso`, confirmación, sello, auditoría, bitácora única), órdenes fuera del alcance intactas, «incluir confirmadas», paso hecho
por fase y por cierre en piso, filtros con Enter, marcado a mano que sobrevive a los filtros, cancelar limpio. Captura
`?captura=uxlote` → `capturas/ui_ruta_lote.png`.

## Revisión adversarial (workflow de 4 lentes + verificación)
Hallazgos aplicados: paso hecho por `pasoHecho` (no solo fase); advertencias de fecha para las liberadas; `rutaCompleta` se
inserta por orden de paso en vez de reordenarse entera; aviso y bloqueo por Empaque / centros por defecto; lavado igual que el
editor por orden (sin id fijo en código); estado limpio tras aplicar o cancelar; conteo de «revisar»; centros marcados que no se
agregan explicados; confirm y bitácora nombran solo los centros del perfil; origen de la confirmación que se pisa a la vista;
tiempos por `tiempoPaso`; ruta vacía bloqueada; fila sin clics que abran otro modal encima; Buscar/Referencia con Enter; hija sin
padre; centros marcados a mano que sobreviven a los filtros; perfil de piso no aplica. Descartados como no reales: topes de
pantalla (dicen «y N más»), «(sin referencia)» como referencia (es explícito).
