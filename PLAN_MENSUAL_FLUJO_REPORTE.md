# Plan mensual: reordenar y completar el flujo — reporte

Fecha: 14-sep-2026 (noche). No se tocó el motor de programación ni ninguna capacidad. Pruebas del simulador: 652 (17
nuevas), todas verdes.

## 1 · La pantalla, de arriba a abajo (Dirección → Plan mensual)

Ahora la pantalla sigue el flujo real, con cinco bloques numerados y separados con una barra:

**BLOQUE 1 — Días y capacidad.** Arriba de todo, el calendario "Días del mes por área" (el selector por área que ya
existía, `planMesHTML`). Debajo, la capacidad resultante: por área (días, con qué se calcula, capacidad, programado,
uso), por centro (capacidad y programado en horas, prendas, uso) y la "Estructura de módulos" (personas, días, minutos
efectivos/día, eficiencia en el tooltip, capacidad total en minutos). La Guía queda al final de este bloque.

**BLOQUE 2 — Resumen del mes.** Los cinco indicadores (órdenes del proyecto, prendas y terminadas, horas de confección,
facturación esperada, en riesgo). **"En riesgo según el programa" ahora se despliega**: una tarjeta plegable con la
lista de órdenes en riesgo con FOTO, WH, cliente, categoría, prendas, entrega, fecha estimada del programa, días tarde y
**en qué paso se atasca** (dónde está hoy según `dondeEsta` y, si el motor hacia atrás lo marcó, el atasco). El
Horizonte rodante queda como estaba, sin tocar.

**BLOQUE 3 — Meta de facturación.** Igual que antes: "Base del plan: lo liberado" y la meta con brecha y propuesta de
qué liberar. Solo se movió de sitio.

**BLOQUE 4 — Agregar órdenes al plan** (nuevo, lo más importante). Dos paneles:

- **"En el plan de {mes}"**: lo que ya agregaste, con conteo, prendas, horas de confección y facturación en el título, y
  una tabla **"Capacidad del plan por centro"** (capacidad del mes vs. lo que lleva el plan, con barra). Debajo, cada
  orden con FOTO, WH, FASE, cliente, categoría, color, prendas, entrega, estado de liberación y botón "quitar". Dice
  "borrador (sin congelar)" o "CONGELADO vN".
- **"Agregar órdenes al plan"**: las órdenes disponibles del mes (Proyecto de Odoo) que aún no están en el plan,
  **agrupadas** por ODC, cliente, fecha de entrega, familia o categoría hija (selector). Cada grupo se colapsa y expande
  con clic, y muestra conteo y suma de prendas como en Odoo; la casilla del grupo marca todas las de adentro. Cada orden
  trae FOTO, WH, FASE, cliente, categoría, color, prendas y entrega. Buscador por WH/cliente/color/categoría.
  **"Jalar del mes siguiente"**: casilla que suma las órdenes del mes siguiente a la lista (marcadas con su mes) para
  cuando el mes ya está lleno.
  **Aviso de capacidad ANTES de guardar**: al marcar órdenes, una franja dice en el momento
  «Con lo marcado **alcanza**: te sobran X min en [centro] (el más justo)» o «Con lo marcado **YA NO ALCANZA** en
  [centro]: te pasas X min». No impide nada: "Agregar al plan (N)" guarda y tú decides. Al agregar, el resumen del plan
  y las barras por centro se recalculan.

  Cómo se calcula ese aviso (sin tocar el motor): minutos estándar de la ruta de cada orden por centro de producción
  (`minPrenda` × prendas) sumados para lo que está en el plan más lo marcado, contra la capacidad del mes de ese centro
  (la misma que muestra el Bloque 1). Es carga bruta de la orden completa, no lo pendiente.

**BLOQUE 5 — Congelar.** Panel propio: dice claramente si el plan del mes está **CONGELADO** (versión, fecha y hora,
quién, cuántas órdenes fijadas) o si es borrador, el botón "Congelar {mes} (N órdenes)", las versiones anteriores y la
comparación "plan congelado vs. programa de hoy". Al congelar se guarda la lista de órdenes del plan dentro de la
versión (`S.planes[].oids`) y se marca `S.params.planMes[mes].congelado = {ver, ts, u}`. Si después agregas o quitas
una orden, el mes vuelve a borrador (hay que volver a congelar).

Al final, "Detalle del mes": carga por tipo de producto y metas semanales de producción y facturación (sin cambios).

## 2 · Liberación: lo que está en el plan y no liberado

En Liberación (las dos), cada orden pendiente que ya está en un plan mensual muestra la etiqueta
**"EN EL PLAN — pendiente de liberar"** (y "· congelado" si el mes está congelado). No bloquea nada; solo la distingue
de la cola normal para que se sepa que es obligatorio liberarla.

## 3 · Los centros ven el plan

En cada centro → pestaña "Carga que viene", arriba de los grupos de siempre, aparece el panel
**"Plan mensual congelado para {centro}"** (borde verde): las órdenes del plan congelado que tienen paso en ese centro,
con FOTO, WH, FASE, categoría, color, prendas, entrega y estado: **"liberada"** o **"pendiente de liberar"** (va a
llegar, todavía no se puede jalar). Cada fila lleva la marca "congelado {mes}" con versión y fecha en el tooltip; lo
que no está congelado no aparece ahí (sigue en la cola normal de abajo).

## Dónde vive el dato
- `S.params.planMes[ym] = {oids:[…], ts, u, congelado:{ver,ts,u}|null}` (borrador y estado de congelado por mes).
- `S.planes[]` (versiones congeladas) ahora llevan además `oids`.
- Todo cambio (agregar, quitar, congelar) queda en la bitácora con quién y cuándo.

## Qué no cambió
- Motor de programación, capacidades, tiempos, calendario y la lógica de "Horizonte rodante".
- Cumplimiento/Avance siguen usando la base orden × centro de la versión congelada, como antes.

## Pendientes tuyos
- El plan de septiembre está vacío (borrador): hay que agregar las órdenes y congelar para que Liberación y los centros lo
  vean.
- Siguen: SURF SPRAY sin profundidad; telas/capacidad piqué de STUART; 35 baños < 70 %; 7 órdenes Odoo vs piso; foto
  WH/MO/29252; tabla 6 "T-BIANCO-SINTEC(COMPACTADORA)".
