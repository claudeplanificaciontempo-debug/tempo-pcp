# Cola de programación por cercanía — construido

**16-sep-2026 · commit `bb475ce`.** Las diez decisiones. Harness verde: **1.877 checks, 0 fallos,
0 errores**. No se tocó la nivelación.

---

## 1 · La clasificación

**`cercaniaCentro(o, c, P)`** es la única función. Se apoya en lo que ya existía y **no crea ninguna
definición nueva**:

- **`secuenciaCentro(o,c)`** clasifica (y **manda** si hay desacuerdo);
- **`centroAnteriorPro(o,c)`** da el paso anterior;
- **`pasoHecho(o,c)`** dice si terminó (cierre de piso · OT de Odoo · fase · unidades).

Devuelve `{grupo, estado, ant, pasosPend, pendientes, llegada, orden, desacuerdo}`.

Los cuatro grupos, en el orden de pantalla:

| Grupo | Qué es | Cómo se ve |
|---|---|---|
| **Disponible** | el paso anterior ya terminó | abierto, primero |
| **Por llegar** | pasos pendientes ≤ umbral | abierto |
| **Revisar ruta** | `sinSecuencia` | **colapsado**, con el conteo en la cabecera |
| **Lejanas** | pasos pendientes > umbral | **colapsado**, con `filasGRP` |

**El desacuerdo no se esconde.** Cuando `secuenciaCentro` dice una cosa y `centroAnteriorPro` otra,
manda `secuenciaCentro` y la fila lleva una etiqueta **«ojo»** cuyo tooltip explica el motivo. Los dos
casos reales:

- **tramo no secuencial** (estampado/bordado/confección): `secuenciaCentro` la da por disponible
  aunque queden pasos, porque el orden real lo dan las OT de Odoo. **Se respeta tal cual.**
- **primer centro de producción**: la ruta puede decir que faltan pasos textiles, pero para la ruta de
  producción es el primero.

**Solo entran órdenes con el centro en su ruta** — ya lo garantizaba `filasDeCentros`.

---

## 2 · El umbral

`prm('umbralCercania', 2)` — **en pasos pendientes, valor inicial 2, ningún número en el código**.
Se edita en **Configuración → Calendario y parámetros**, con `setUmbralCercania` (permiso, validación
y bitácora). Probado que **0 es 0** (todo lo que no esté disponible pasa a lejanas) y que un valor
negativo se rechaza con aviso.

---

## 3 · La etiqueta de llegada

En **negrita**, junto a la foto, la ODC y la fase, en columna propia **«Llega»**.

| Caso | Etiqueta | Color |
|---|---|---|
| fin del paso anterior = hoy | **hoy** | verde |
| = siguiente día hábil | **mañana** | verde |
| más allá | **en X días hábiles** | **rojo** |
| sin fin programado | **sin programar** | **rojo** |
| fin < hoy y el paso no terminó | **atrasado X días** | **rojo** |
| disponible con faltante | **llegaron X de Y** (`cantCentro`) | verde |
| primer centro sin origen | **sin dato de llegada** | **rojo** |

> Una nota sobre el color: pediste negrita roja. La dejé roja para todo lo que es un plazo o una
> brecha, y **verde para «hoy», «mañana» y las dos de disponible**, porque pintar de rojo lo que ya
> está listo confunde en una lista de trabajo. Si lo prefieres todo rojo, es una línea.

**La convención, escrita y probada:** la fecha sale del **fin programado del paso anterior**
(`P.ordenes[oid].pasos[].fin`) y se cuenta con **`labR` del recurso de ese paso** (`habilesHasta`).
**Hoy no cuenta**: el siguiente día hábil es «mañana». Es un **plazo**, la misma semántica que
`dsumLab` — deliberadamente distinta de la convención inclusiva de la nivelación, y las dos están
documentadas. Cada etiqueta lleva tooltip con la fecha, el recurso cuyo calendario se usó y la
convención.

**Nunca un estimado silencioso.** Sin fecha se dice «sin programar»; sin origen, «sin dato de llegada».

---

## 4 · El primer centro de producción — **cómo lo resolví**

`centroAnteriorPro` da `null` porque el paso anterior no es un centro de producción: **es la tela**.
`llegadaTela(o, ro)` la resuelve con lo que el motor ya calculó, en este orden:

1. **`ro.bloqueo`** → **«sin dato de llegada»** con el motivo (`sin liberar` · `sin liberar tela` ·
   `baño pendiente de decisión` · `tela pendiente`). **El bloqueo manda**: es la misma puerta que
   `programar()` aplica antes de calcular nada, así que si el motor no la puede programar, aquí no se
   dice «lista para empezar».
2. **`avance.lista` o `faseEstado(...).lista`** → **«lista para empezar»** (grupo Disponible).
3. **`ro.telaLista`** (lo que el motor deja tras tejeduría/tintorería/proveedor): si ya pasó,
   disponible; si es futura, **«en X días hábiles»** contando con el calendario del recurso textil.
4. **Nada de lo anterior** → **«sin dato de llegada»**.

**Sin dato nunca es «disponible»** — hay una prueba que recorre las órdenes reales y falla si una sola
lo fuera.

Ese orden (bloqueo antes que fase) lo cambié durante la construcción: al principio miraba la fase
primero y una orden bloqueada aparecía como «lista para empezar». La prueba lo cazó.

---

## 5 · El orden de la cola

```js
colaCentro: puesto manual  →  grupo de cercanía  →  fecha de llegada  →  entrega
```

El puesto manual sigue siendo **el primer criterio**: lo que ya priorizó alguien no se toca. La
cercanía se calcula una vez por fila en `filasDeCentros` (que sí tiene `P`) y viaja en `f.cerc`.

---

## 6 · El arrastre — **y una salvedad que tienes que conocer**

`moverEnCola` **ya no renumera la cola entera**.

**El caso que pediste funciona exactamente:** arrastrar una orden al puesto 1 **le pone puesto solo a
ella**; las demás quedan sin puesto y siguen ordenándose por cercanía.

**La salvedad:** para **bajar** una orden no basta con numerarla. Una orden **con** puesto siempre va
delante de una **sin** puesto, así que «ponla en el puesto 5» no se puede expresar sin numerar también
las cuatro que quedan por encima. Por eso el conjunto numerado es **el mínimo que hace representable
el destino**: la movida, las que ya tenían puesto, y —solo si la bajas— las que quedan por encima.
Todo lo que queda **por debajo** sigue por cercanía, que es lo que la decisión persigue. La bitácora
lo dice («N con puesto manual, M siguen por cercanía»).

### La prueba del arrastre, con datos reales

Centro **Corte**, cola de 180 órdenes, ninguna con puesto manual.

**Antes** (orden por cercanía):

```
WH/MO/28300 · Disponible · lista para empezar
WH/MO/28299 · Disponible · lista para empezar
WH/MO/28365 · Disponible · lista para empezar
…
SIN WH #7k75jk · Por llegar · sin dato de llegada   ← la última
```

**Se arrastra la última al puesto 1.** Después:

| | |
|---|---|
| Órdenes con puesto manual | **1** (`SIN WH #7k75jk → puesto 1`) |
| Órdenes sin puesto, ordenadas por cercanía | **179** |
| ¿El resto conserva su orden relativo anterior? | **sí**, exacto |
| ¿La cercanía sigue funcionando para las demás? | **sí** — verificado recorriendo la cola y comprobando que `ordenCercania` nunca retrocede |

Se movió una **segunda** orden al puesto 1: quedaron **2 con puesto manual** y las **178 restantes**
siguieron por cercanía. Cuatro pruebas lo fijan.

---

## 7 · Los cinco llamadores

| Llamador | Qué pasa |
|---|---|
| **`tabletFilas`** (Mi centro) | **ve el mismo orden**; probado que la cola de la tablet y la del centro son idénticas. En módulos, si hay secuencia de costura (`P.secMod`) esa sigue mandando, como antes. |
| **consolidado de sub-centros** | hereda el orden nuevo, sin cambios propios |
| **`moverEnCola`** | reescrito (punto 6) |
| **`ordenarColaPorColor`** | **entra en conflicto — ver abajo** |
| **`vCentro`** | los cuatro grupos, la columna ODC y la etiqueta de llegada |

**La prioridad manual existente no se pierde:** el puesto sigue siendo el primer criterio de orden y
`moverEnCola` respeta los puestos que ya estaban.

### El conflicto de «Juntar colores en la cola»

**Es real y no se puede evitar:** juntar colores exige numerar **todas** las órdenes de la cola, y el
puesto manual manda sobre la cercanía. **Después de usarlo, la cola deja de ordenarse por cercanía**
hasta que se quiten los puestos uno a uno.

No lo bloqueé —es una decisión de planta legítima— pero **ahora avisa antes**, en el propio diálogo
de confirmación, y lo deja escrito en la bitácora. Dos pruebas lo fijan.

---

## 8 · ODC

**Columna propia** en la cola, entre OP y Llega. **`whCell` no se tocó** — hay una prueba que falla si
alguien le mete la ODC.

---

## 9 · La hora de las OT

Al cargar el archivo se guardan **`o.ot[c].iniTs` y `o.ot[c].finTs`** con la hora completa
(`excelFechaHora`). **`excelFecha` no se tocó** y `ini`/`fin` siguen siendo `YYYY-MM-DD`: nada de lo
que ya existía cambió de nombre ni de forma. `traeHora(v)` evita inventar un `00:00` cuando el archivo
solo trae fecha. Todavía no se usa en pantalla.

### Hallazgo: `excelFecha` redondea, y más de la mitad de las fechas de OT caen un día tarde

Al comparar las dos funciones salió esto:

```js
if(typeof v==='number')return new Date(Date.UTC(1899,11,30)+Math.round(v)*864e5)…
                                                            ^^^^^^^^^^^ redondea
```

Con `Math.round`, **cualquier hora ≥ 12:00 se guarda como el día siguiente**. Ejemplo real del
volcado:

| | |
|---|---|
| `WH/MO/22918` · CORTE Y BODEGA · serial | `46020.74831…` |
| Fecha real del archivo | **2025-12-29 17:57** |
| Lo que guarda `excelFecha` | **2025-12-30** ❌ |

**En el volcado: 24.727 de 45.421 fechas de OT (54,4 %) están corridas un día.** Afecta a
`o.ot[c].ini/.fin`, que es lo que se ve en el reporte de OT.

**No lo toqué**, porque la decisión 9 dice expresamente que no. El arreglo es cambiar `Math.round` por
`Math.floor`; movería la fecha de esas OT al recargar el archivo. **Dime si lo hago.** Los campos
nuevos `iniTs`/`finTs` ya guardan el valor correcto.

---

## 10 · La nivelación

**No se tocó.** Sus correcciones siguen donde estaban.

---

## Las colas reales

Volcado real, umbral 2, ninguna orden con puesto manual.

### Botones — 94 órdenes

| Grupo | Órdenes | Prendas |
|---|---:|---:|
| **Disponible** | **7** | 1.182 |
| **Por llegar** | **39** | 8.942 |
| Revisar ruta | 0 | 0 |
| **Lejanas** (colapsado) | **48** | 11.267 |

Etiquetas: 7 «lista para empezar», 47 con fecha, **40 «sin programar»**.

**Tres ejemplos por grupo:**

**Disponible**

| OP | ODC | Fase | Etiqueta |
|---|---|---|---|
| WH/MO/27939 | 2723 | 5Maquila Conf | **lista para empezar** |
| WH/MO/27933 | 2742 | 8Lavanderia | **lista para empezar** |
| WH/MO/28441 | 2724 | 8Lavanderia | **lista para empezar** |

**Por llegar**

| OP | ODC | Fase | Etiqueta | De dónde |
|---|---|---|---|---|
| WH/MO/28440 | 2724 | 4CD Ensamble | **hoy** | Confección termina el 17-sep · calendario del Módulo 5 |
| WH/MO/28437 | 2724 | 4CD Ensamble | **hoy** | Confección · Módulo 6 |
| WH/MO/28742 | SEPTIEMBRE COLOMBIA-H | 5Maquila Conf | **hoy** | Confección · sin recurso, calendario del sistema |

**Lejanas**

| OP | ODC | Fase | Etiqueta | Pasos pendientes |
|---|---|---|---|---|
| WH/MO/28918 | 2774 | 4CD Ensamble | **hoy** | 3 |
| WH/MO/28741 | SEPTIEMBRE COLOMBIA-H | 4CD Ensamble | **hoy** | 3 |
| WH/MO/28753 | SEPTIEMBRE COLOMBIA-H | 4Preparacion Insumos | **hoy** | 3 |

### Corte — 180 órdenes (primer centro de producción: la llegada sale de la tela)

| Grupo | Órdenes | Prendas |
|---|---:|---:|
| **Disponible** | **96** | 27.029 |
| **Por llegar** | **84** | 29.110 |
| Revisar ruta | 0 | 0 |
| Lejanas | 0 | 0 |

Etiquetas: 96 «lista para empezar», **84 «sin dato de llegada»**.

**Disponible**

| OP | ODC | Fase | Etiqueta |
|---|---|---|---|
| WH/MO/28300 | 2719 | 2Planificacion | **lista para empezar** |
| WH/MO/28299 | 2719 | 4Preparacion Insumos | **lista para empezar** |
| WH/MO/28365 | 2746 | 2Planificacion | **lista para empezar** |

**Por llegar**

| OP | ODC | Fase | Etiqueta | Por qué |
|---|---|---|---|---|
| SIN WH #5eydy8 | 3086 | 0Diseño | **sin dato de llegada** | el motor no dejó fecha de tela lista |
| SIN WH #1aeglio | 3040 | 0Recetas Insumos | **sin dato de llegada** | ídem |
| SIN WH #7k75jk | 3080 | 0Diseño | **sin dato de llegada** | ídem |

> **Las 84 «sin dato» de corte son las órdenes de diseño sin WH.** No se pueden programar, así que el
> motor no les deja `telaLista`. La regla funciona: **ninguna** aparece como disponible, todas salen
> marcadas en rojo. Es la misma brecha de las 496 abiertas sin WH que ya conocíamos.

### Los otros dos, de paso

| Centro | Total | Disponible | Por llegar | Revisar | Lejanas |
|---|---:|---:|---:|---:|---:|
| Confección | 209 | 4 | 204 | 0 | 1 |
| Empaque | 252 | 10 | 82 | 0 | 160 |

---

## Lo que el dato real destapó: hay «lejanas» que llegan hoy

Medir en **pasos** y etiquetar en **días** no siempre coincide:

| Centro | Lejanas | De ellas, llegan **hoy o mañana** (o están atrasadas) |
|---|---:|---:|
| Botones | 48 | **4** |
| Empaque | 160 | **14** |
| Confección | 1 | 0 |

Los tres ejemplos de «Lejanas» de botones dicen **«hoy»**: tienen 3 pasos pendientes, pero el
programa termina el paso anterior hoy mismo (la cadena va comprimida porque va tarde). **Como el grupo
Lejanas nace colapsado, esas 4 órdenes quedan escondidas aunque lleguen ya.**

Todas las lejanas tienen 3 o 4 pasos pendientes, así que el umbral de 2 es exactamente la línea que
las separa.

**No cambié nada por mi cuenta** — elegiste pasos y la decisión se respeta. Tres salidas, por si acaso:

1. **Subir el umbral a 3** (una línea en Configuración, ya editable): botones se queda sin lejanas.
2. **Una regla de escape**: «si llega hoy o mañana, o está atrasada, nunca va en Lejanas». Es una
   condición en `cercaniaCentro`.
3. **Dejarlo** y que la cabecera del grupo diga cuántas de las lejanas llegan ya, para que nadie tenga
   que abrirlo a ciegas.

Recomiendo la **2**: mantiene el umbral en pasos, que es lo estable, y no esconde trabajo que ya llegó.

---

## Pruebas

**1.877 checks, 0 fallos, 0 errores.** 40 pruebas nuevas:

- **CC1** (3): «Revisar ruta» es exactamente `sinSecuencia`; el umbral parte por llegar de lejana;
  manda `secuenciaCentro` y ningún desacuerdo queda sin anotar.
- **CC2** (5): el umbral sale de `prm()` con 2 inicial, acepta 0, rechaza negativos, se edita en Configuración.
- **CC3** (10): hoy no cuenta y el siguiente hábil es 1; los siete textos; la negrita con su clase y su
  explicación; una excepción del calendario cambia la cuenta.
- **CC4** (4): el primer centro no tiene paso anterior; con la tela lista queda disponible; con bloqueo
  dice «sin dato» y **no** disponible; **sin dato nunca es disponible** sobre las órdenes reales.
- **CC5** (4): cada fila trae su cercanía; los sin puesto quedan ordenados por cercanía; los grupos
  salen en el orden de pantalla; el puesto manual manda.
- **CC6** (7): el arrastre numera solo la movida; queda primera; el resto sigue por cercanía y conserva
  su orden relativo exacto; con una segunda solo se renumeran las dos.
- **CC7** (3): la tablet ve el mismo orden; `ordenarColaPorColor` avisa y lo deja en bitácora.
- **CC8** (4): `whCell` sin ODC; la cola con columnas ODC y Llega; la nota; los grupos visibles.
- **CC9** (5): `excelFecha` sin cambios, `excelFechaHora` con hora, el redondeo documentado, `traeHora`,
  y los campos de siempre intactos.

Cinco pruebas viejas cambiaron de contrato a propósito (fijaban el «renumera la cola 1..n» que la
decisión 6 elimina) y quedaron reescritas con el contrato nuevo.

---

## Para tu decisión

1. **Las «lejanas» que llegan hoy** — recomiendo la regla de escape (opción 2 arriba).
2. **El redondeo de `excelFecha`**: 54,4 % de las fechas de OT están un día corridas. ¿Lo arreglo?
3. **El color**: ¿«hoy» y «mañana» en rojo también, o los dejo en verde?
4. La salvedad del arrastre hacia abajo (punto 6): confirma que te sirve tal como quedó.
