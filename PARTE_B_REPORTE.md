# Parte B — Reportería gerencial, sub-centros y congelado del programa

**Commit:** `33a6665` · **Harness:** 1.447 pruebas verdes, sin errores.

---

## 1 · Resumen gerencial → Reportería

**Hecho:** el Resumen gerencial **salió de Dirección** y vive en **Reportería**, también en la barra de
reportes.

**Filtro global de meses**, arriba de todo: multiselección que **suma** los meses elegidos y **manda sobre
todos los bloques** de la pantalla — carga por mes, cartera, pedido y avance. Con dos meses marcados, los
bloques muestran los dos sumados, no uno u otro.

**Total de lo seleccionado**, arriba: órdenes, **prendas pedidas**, **hechas** (con su %), **lo que falta**,
valor, vencidas y en riesgo. Si hay órdenes sin precio, lo dice en la tarjeta de valor en vez de sumar como
si valieran 0.

**Lo que NO construí, a propósito:** las consultas por cliente, fase, ODC, estilo y familia. Van propuestas en
**`REPORTERIA_GERENCIAL_DISENO.md`** y quedan esperando tu visto bueno, como pediste. Ese documento tiene el
diseño de bloques y columnas, los filtros que comparten, y **tres decisiones que necesito de ti** antes de
construirlas.

---

## 2 · Sub-centros con resumen

Al abrir un **centro padre** aparece un resumen con **una fila por sub-área**:

| Columna | Qué muestra |
| --- | --- |
| Sub-área | nombre, y la marca «por días» si no consume capacidad de planta |
| Recursos | cuántos activos |
| Carga (min) | lo programado esa semana |
| Capacidad | de sus recursos esa semana |
| Ocupación | el donut y el % |
| Órdenes | cuántas programadas |
| Prendas programadas | de la semana |
| Hechas | lo registrado por el piso esa semana |
| Atrasadas | órdenes con el paso o la orden fuera de fecha |
| Pendientes | prendas que le faltan por hacer |

Más la fila de **total del centro padre**, y un botón **«ver sola»** por sub-área.

**Sin hardcode, como pediste.** Qué sub-áreas tiene un ítem sale de la columna **«Ítem de planificación»** de
Configuración → Centros. Hoy eso da:

- **Estampado (serigrafía):** Estampado · Etiquetas
- **Terminados:** Ojales y botones · Lavado · Plancha · Empaque

Es el **mismo componente para cualquier centro**: si mueves una sub-área de ítem, el resumen la sigue en el
mismo dibujado — está probado. Un ítem con una sola sub-área no muestra el resumen, y al abrir una sub-área
sola tampoco se repite.

Si alguna sub-área **no tiene de dónde sacar sus minutos**, la fila lleva el `!` y el detalle sale abajo como
brecha; no aparece un 0 mudo.

---

## 3 · Congelar el programa semanal

**Botón «Congelar programa»** en Programación del centro, **visible solo para planificación**. Un encargado de
centro no lo ve y, si llama la función a mano, tampoco pasa nada.

**Qué guarda la foto:** por centro y semana, cada orden con **las prendas que tenía programadas**, los
minutos, los días, y **cuánto llevaba hecho al momento de congelar** — esto último es lo que permite medir
solo lo hecho *después*.

**Se puede seguir reprogramando.** La foto es la línea base y **no se mueve**; está probado. **Volver a
congelar no borra la anterior**: queda el historial y la nueva pasa a ser la línea base, con su fecha y
usuario a la vista.

**Bloque «Avance contra el programa congelado»**, por centro y sub-centro:

- **Prendas en la foto** · **hechas desde el congelado** · **% de cumplimiento**
- **Órdenes atrasadas** (con prendas pendientes y la semana ya cerrada)
- **Agregadas después** (entraron al programa después de congelar)
- **Sacadas después** (estaban en la foto y ya no están programadas)
- Y por orden: programadas, hechas, barra de cumplimiento y su estado.

### Cómo se relaciona con el Congelar del plan mensual

Son **dos cosas distintas que no se contradicen**, y la pantalla lo dice:

| | Congelar del **plan mensual** (Bloque 5) | Congelar del **programa semanal** (este) |
| --- | --- | --- |
| **Qué fija** | **qué órdenes** entran al mes | **cuándo y cuánto** se hace esa semana |
| **Alcance** | todo el mes, toda la planta | una semana, un centro |
| **Contra qué se mide** | facturación y avance del mes | cumplimiento del programa del centro |
| **Quién lo usa** | Dirección y planificación | el centro y planificación |
| **Dónde se ve** | Plan mensual → Avance del mes | Centro → Programación |

**Uno dice el alcance, el otro dice la ejecución.** Una orden puede estar en el plan congelado del mes y no
estar en la foto de esta semana (le toca la próxima): eso no es una contradicción, es la diferencia entre
*qué* y *cuándo*.

---

## Archivos tocados

| Archivo | Qué cambió |
| --- | --- |
| `index.html` | `GER`/`togMesGER`/`mesesGER`/`enMesGER`/`filtroMesesGERHTML`/`pzHechasOrden`; `resumenSubCentros`/`resumenSubCentrosHTML`; `congelados`/`congelarPrograma`/`congeladoDe`/`avanceCongelado`/`avanceCongeladoHTML`; menú, `REPORTES` y el filtro de `vGerencia` |
| `test/driver.js` | 33 pruebas nuevas y 1 actualizada al cambio de menú |
| `REPORTERIA_GERENCIAL_DISENO.md` | la propuesta del punto 1, **sin construir** |
| `PARTE_B_REPORTE.md` | este reporte |

---

## Brechas detectadas

1. **«Hechas» se cuenta en el último paso de la ruta de cada orden**, no en empaque, porque no todas pasan por
   empaque. Es una de las decisiones que te pregunto en el documento de diseño.
2. **Órdenes sin precio**: entran a la cartera pero no al valor. La tarjeta dice cuántas son en vez de sumarlas
   como 0.
3. **Los días en fase** (que propongo para la consulta por fase) solo existen para las órdenes con historial de
   fases; las demás tendrían que salir como «sin historial», no como 0.
4. **El congelado semanal empieza vacío.** No hay fotos históricas: la primera semana con datos será la primera
   que congeles.
5. Siguen abiertas las de las entregas anteriores: **Level 1 y Level 2 fuera del catálogo**, las **dos
   operaciones de BVD y FITS sin centro**, **solo 3 de 24 categorías con familia LMO**, **685 órdenes sin ruta
   de producción**, los **datos de las lavadoras** y la **fecha de arranque en tejeduría manual**.
