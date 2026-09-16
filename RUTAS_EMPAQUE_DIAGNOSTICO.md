# A · Rutas que no terminan en Empaque — diagnóstico y propuesta

**Commit:** `0644e9a` · **Harness:** 1.552 pruebas verdes. **Nada aplicado: espera tu confirmación.**

---

## 1 · Diagnóstico: no es lo que parecía

Yo te reporté «349 rutas terminan en bordado o estampado» y di a entender que estaban **mal ordenadas**.
**No lo están.** Medido sobre las 469 órdenes abiertas con ruta:

| | |
| --- | --- |
| Rutas que no terminan en Empaque | **348** |
| De ellas, **que contienen Empaque en otra posición** | **0** |
| **Que NO contienen Empaque en absoluto** | **348** |
| Rutas **desordenadas** (un paso antes de otro que le toca después) | **0** |
| Rutas **editadas a mano** | **0** |
| Rutas **con OT cargadas** | **0** |

**No están mal ordenadas: están incompletas.** Cuántos pasos de producción tienen:

| Pasos | Rutas malas | Rutas buenas |
| ---: | ---: | ---: |
| 1 | **338** | 10 |
| 2 | 10 | 4 |
| 3 | — | 35 |
| 4 | — | 42 |
| 5 | — | 30 |

Las rutas completas se ven así: `tin → corte → bordado → modulos → empaque`. Las malas, así:
`tej → tin → bordado`. **Les falta corte, confección y empaque enteros.**

### Los 5 ejemplos que pediste

| OP | Categoría | Ruta hoy | OT cargadas |
| --- | --- | --- | --- |
| WH/MO/29127 | CAMISETAS / Camiseta CR | `bordado` | **ninguna** |
| SIN WH #1nyi7zs | POLOS / Polo Basica | `bordado` | **ninguna** |
| WH/MO/29285 | CAMISETAS / Level 1 | `estampado` | **ninguna** |
| WH/MO/29284 | CAMISETAS / Level 1 | `estampado` | **ninguna** |
| WH/MO/29283 | CAMISETAS / Level 1 | `estampado` | **ninguna** |

**No hay fechas de cierre de OT que mostrar porque ninguna de las 348 tiene OT cargadas.**

### Cómo se arma la ruta, y por qué quedaron así

La ruta **no viene de las OT**. Se arma con `armarRuta()` así:

1. **Los centros de la categoría** — los que tienen operaciones en su hoja LMO.
2. **Menos** los que dependen de la orden (estampado, bordado): esos se quitan del automático.
3. **Más** los que la propia orden pide, según su **técnica** y sus **puntadas**.
4. Todo **ordenado por el proceso** (`corte → estampado/bordado → confección → botones → etiquetas → lavado → plancha → empaque`).

**El orden nunca fue el problema: el paso 4 ya pone Empaque al final.** El problema es el paso 1: cuando esas
órdenes se crearon, **su categoría no resolvía su hoja de operaciones** — es la misma brecha del catálogo que
reconciliamos. Sin hoja, el paso 1 aportó **cero centros**, y la ruta quedó solo con lo del paso 3: bordado o
estampado, que sí venían de la técnica y las puntadas de la orden.

Por eso **son justo bordado y estampado** los que quedan solos: son los únicos que entran por la orden y no por
la categoría.

**Sobre el cierre tardío de OT:** en estas 348 no interviene, porque ninguna tiene OT. Aun así lo blindé (ver
abajo), porque cuando se carguen OT sí podría pasar.

---

## 2 · La corrección sistémica

**Regla fija: toda ruta de producción termina en Empaque.**

- `rutaProSugerida(o)` arma la ruta con los centros de la **hoja LMO de la categoría** + los que la **orden**
  pide por técnica y puntadas + **lo que la orden ya tenía** (no se pierde nada), ordenado por el proceso.
- `ordenarRutaPro(cens)` garantiza que **Empaque es el último paso, venga de donde venga el orden**. Estampado
  y bordado conservan su lugar empírico **entre corte y confección**. Está probado que si el orden llega con
  Empaque adelante — que es lo que pasaría con un cierre tardío de OT — **no se queda ahí**.
- Las rutas **editadas a mano no se tocan**: alguien decidió esa ruta y se respeta. Se listan aparte.

---

## 3 · Vista previa — **nada aplicado**

| Qué | Cuántas | Qué se hace |
| --- | ---: | --- |
| **Les faltan pasos** | **326** | se completan desde su categoría y terminan en Empaque |
| **Tienen Empaque, mal puesto** | **0** | se reordenarían |
| **Editadas a mano** | **0** | **no se tocan**, se listan aparte |
| **Su categoría tampoco tiene Empaque** | **22** | no se pueden completar: quedan como brecha |

**326 de 348 se corregirían.** Las 22 restantes son de las familias sin hoja LMO (JOGGER, Fleece, TEJIDOS…):
hasta que tengan hoja, no hay de dónde sacar su ruta.

Ejemplos del antes y el después:

| OP | Ruta hoy | Quedaría |
| --- | --- | --- |
| WH/MO/29127 | `bordado` | `corte → **bordado** → modulos → empaque` |
| SIN WH #1nyi7zs | `bordado` | `corte → **bordado** → modulos → botones → empaque` |
| WH/MO/29285 | `estampado` | `corte → **estampado** → modulos → empaque` |

El panel está en **Reportería → «Ruta no termina en Empaque»**, con las cuatro cifras, la vista previa del antes
y el después, y el botón **«Corregir las 326 rutas»**.

**No pulsé ese botón y no corre solo.** Pide confirmación, exige permiso de rutas, y hay una prueba que
verifica que si no se confirma **no cambia ninguna ruta**. Dime y lo aplico.

---

## 4 · Mientras tanto, la brecha está marcada

**En el Resumen gerencial:** la tarjeta de «Hechas» lleva una etiqueta **«con brecha»** y debajo un aviso que
dice cuántas órdenes están afectadas, qué porcentaje y cuántas prendas, con enlace al panel. Aparece mientras
quede una sola ruta mal y desaparece sola cuando se corrijan.

**En la foto mensual:** cada foto guarda si se tomó con la brecha (cuántas órdenes, de cuántas, qué %). En la
tabla de «Historia de la cartera» sale la etiqueta **«tomada con la brecha de rutas»**.

**Al corregir:** la foto del **mes en curso se vuelve a tomar** automáticamente y queda marcada **«vuelta a
tomar»**, con el motivo. **Las de meses cerrados no se tocan** — está probado: modifiqué una a mano y el
recálculo no la sobrescribió. Se quedan con su etiqueta de que se tomaron con la brecha, que es la verdad de
ese momento.

---

## C · Tejeduría manual: es de **programación**, no de registro

La pantalla es **«Programación manual de tejeduría»** y así la usa el motor: cada fila (tela, máquina, día, kg)
le dice **cuándo va a estar lista esa tela**, y de ahí sale la fecha desde la que la orden puede arrancar en
corte. Existe porque en tejeduría los cambios de calibración son frecuentes y la persona decide qué máquina
hace qué tela cada día; el motor respeta esa decisión en vez de repartir solo.

**Por eso te recomiendo NO aplicar ahí la regla de «no antes de hoy».** Una fila con fecha pasada no es un
error: significa **«esta tela ya se tejió ese día»**, y así es como la persona de tejeduría registra lo que ya
corrió. El panel incluso compara **pedido vs cargado**, que es una lectura de lo ya hecho. Bloquear fechas
pasadas impediría registrar la realidad.

**Lo que sí haría falta** — y es decisión tuya — es que la pantalla **distinga las dos cosas**: una fila
*programada* (a futuro, un compromiso) de una fila *ya tejida* (pasado, un hecho). Hoy son la misma fila y por
eso la regla no se puede aplicar sin romper el registro. Si quieres, lo propongo como diseño antes de
construir nada.

---

## B · Lo que ya estaba hecho

Los cinco puntos de B los entregué en `9f5e9c9` / `e30640e`, antes de que llegara este mensaje. Resumen:

| Punto | Estado |
| --- | --- |
| **B1 · JEANS → DENIM** | autorizado y **puesto en las siembras**: corre solo la próxima vez que abras la app. Mueve 3 categorías, 13 órdenes abiertas (31 en todo el volcado), 49 operaciones y 3 filas de configuración. No borra nada |
| **B2 · Siembras** | automáticas, como pediste |
| **B3 · Etiqueta** | **185 órdenes / 78.412 prendas** en las abiertas **lanzadas** — tu expectativa era 187 / ~78.500 |
| **B4 · Orden abierta** | definición única (no archivada + Estado OP de Odoo no cerrado + fase no de cierre), aplicada en todo el sistema y fijada en prueba. **1.206 cargadas = 1.078 abiertas + 51 archivadas + 77 con Estado OP cerrado**; 582 lanzadas, 279 en planta |
| **B5 · Minuto estimado** | editable por categoría, marcado «estimado», y sin valor la categoría sigue en 0 con aviso. Son 11 categorías, ~16.200 prendas en 0 |

Todo eso está en `DEFINICION_ORDEN_ABIERTA.md`.

---

## Lo que necesito de ti

1. **¿Aplico la corrección de las 326 rutas?** Está lista y con vista previa.
2. **Tejeduría manual:** ¿quieres que proponga separar «programado» de «ya tejido»?

## Brechas que siguen

1. **22 órdenes** cuya categoría tampoco tiene Empaque: dependen de las 7 familias sin hoja LMO.
2. Las **dos operaciones de BVD y FITS sin centro**, esperando tu decisión con producción.
3. **685 órdenes sin ruta de producción**, **496 abiertas sin WH**, los **datos de las lavadoras**.
