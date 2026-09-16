# Consultas del Resumen gerencial — construidas

**Commit:** `eb23d1a` · **Harness:** 1.494 pruebas verdes, sin errores.

---

## La prueba principal, primero

**Los totales de «Pedidas» de los cinco bloques son idénticos con cualquier combinación de filtros.** Está
probado con **doce combinaciones**: sin filtros, un mes, dos meses, un cliente, mes + cliente, un estado, dos
estados, mes + cliente + estado, buscador, todo junto, y una que no deja nada.

Y no solo las prendas: también cuadran **órdenes, hechas y valor**, y el total coincide con la suma directa de
las órdenes filtradas. Si algún día un bloque deja de cuadrar, el harness lo dice.

---

## 1 · Filtros globales

Cuatro filtros en una sola cabecera, y **los cuatro mandan sobre los cinco bloques** y sobre el resto de la
pantalla:

| Filtro | Cómo |
| --- | --- |
| **Meses del Proyecto** | multiselección, **suma** los elegidos |
| **Cliente** | multiselección |
| **Estado** | En curso · Meta vencida · La orden va tarde · Terminadas |
| **Buscador** | el común (WH, ODC, estilo, color, cliente, fase…) |

Se aplican **una sola vez** sobre la lista de órdenes, no bloque por bloque. Por eso cuadran: es
matemáticamente la misma lista partida de cinco maneras.

Un botón **«Limpiar filtros»** aparece en cuanto hay alguno puesto.

---

## 2 · «Hechas» y la brecha de Empaque

**«Hechas» = prendas terminadas en el último paso de la ruta de cada orden.** Si una orden lleva avance en
corte y confección pero nada en su último paso, cuenta **0 hechas** — eso es lo correcto, porque todavía no
hay nada terminado.

### La brecha «Ruta no termina en Empaque» — y es grande

Medido sobre el volcado real:

| | |
| --- | --- |
| Órdenes abiertas con ruta de producción | **470** |
| **Rutas que NO terminan en Empaque** | **349** (74 %) · **122.830 prendas** |
| Terminan en **Bordado** | **301** |
| Terminan en **Estampado** | **48** |

**Esto es lo que más distorsiona el número de «hechas» hoy.** En 301 órdenes, «hecha» se está midiendo en
bordado; en 48, en estampado. Y no es solo un problema del reporte: si la ruta dice que la orden acaba en
bordado, el sistema entero cree que ahí termina.

El panel está al final del Resumen gerencial, con el conteo por centro final, la lista completa y el botón
para editar cada ruta. **No reciben ningún trato especial en los cálculos**, como pediste: se miden igual, en
su último paso, y la brecha queda a la vista para arreglarla.

---

## 3 · Los cinco bloques

Colapsables, **uno abierto a la vez**, y **se recuerda cuál** (por usuario). Clic en una fila abre el
**detalle** de esas órdenes con el agrupador común, sin salir de la página.

**Columnas comunes a los cinco:** Órdenes · Pedidas · Hechas · Falta · % avance · Valor · Vencidas · Va tarde.
El valor marca aparte cuántas prendas **no tienen precio**, en vez de sumarlas como 0.

**Columnas propias de cada bloque:**

| Bloque | Extra |
| --- | --- |
| **Por cliente** | — |
| **Por fase** | **días en la fase** (promedio); si ninguna orden tiene historial, dice **«sin historial»**, no 0 |
| **Por ODC** | cliente · **entrega más temprana** del ODC · **órdenes listas** de cuántas |
| **Por estilo** | categorías · colores |
| **Por familia** | — |

El bloque de fase va **ordenado por la secuencia de las fases**, no alfabético.

---

## Ajustes que pediste

### Vencidas y va tarde: una sola definición

**Eliminé el segundo cálculo.** El Resumen gerencial tenía el suyo (`o.fecha < hoy`), distinto del de las
marcas de los centros. Ahora las dos salen de **`diagAtraso()`**, exactamente el mismo que pinta las marcas:

- **«meta vencida»** = la orden va atrasada **y** su fecha meta ya pasó
- **«la orden va tarde»** = la orden va atrasada y su meta todavía no llega

Y **con los mismos nombres**: renombré los textos que decían «En riesgo» dentro de esta pantalla. Hay una
prueba que verifica que las dos funciones devuelven lo mismo que `diagAtraso` para **todas** las órdenes, que
ninguna puede ser las dos cosas a la vez, y que los bloques cuentan lo mismo que la cabecera.

*(La pantalla de **Plan mensual** no la toqué: es otra pantalla, con su propio reporte de decisiones.)*

### Tendencias: ya se está guardando historia

El gráfico **no** está construido, pero el sistema **ya guarda una foto de la cartera de cada mes**:

| Qué guarda | |
| --- | --- |
| Totales | órdenes · prendas pedidas · hechas · valor · vencidas · va tarde |
| Desglose | **por cliente** y **por familia** |

- El **mes en curso** se actualiza **una vez al día**.
- Cuando el mes pasa, su foto **se congela** y no se vuelve a tocar nunca — probado: modifiqué una foto
  cerrada a mano y el sistema no la sobrescribió.
- Usa **las mismas definiciones** de vencida y va tarde, así que la historia va a ser comparable con lo que se
  ve en pantalla.

Se ve en el panel **«Historia de la cartera»**, al final de la pantalla.

### Márgenes: solo anotado

Una línea al pie: *márgenes y costo por prenda quedan pendientes de integrar con **Costos TEMPO***. **No
construí nada y no inventé ningún costo** — aquí solo hay precio.

---

## Archivos tocados

| Archivo | Qué cambió |
| --- | --- |
| `index.html` | `esMetaVencida`/`esOrdenVaTarde`/`estadoGERDe`/`GER_ESTADOS`; `pasaFiltrosGER`/`ordenesGER`/`togCliGER`/`togEstGER`/`clientesGER`; `rutaTerminaEnEmpaque`/`rutasSinEmpaque`/`rutasSinEmpaqueHTML`; `GER_BLOQUES`/`agruparGER`/`totGER`/`diasEnFase`/`bloqueGERHTML`/`consultasGERHTML`/`abrirBloqueGER`/`verDetalleGER`; `cierresMes`/`fotoCarteraMes`/`guardarCierresMes`/`cierresMesHTML`; y la eliminación del segundo cálculo de vencida/riesgo en `vGerencia` |
| `test/driver.js` | 37 pruebas nuevas, entre ellas la principal con 12 combinaciones de filtros |
| `CONSULTAS_GERENCIALES_REPORTE.md` | este reporte |

---

## Brechas detectadas

1. **349 de 470 rutas no terminan en Empaque** (301 en bordado, 48 en estampado), 122.830 prendas. Es la más
   importante: hoy «hechas» se está midiendo en el paso equivocado en tres de cada cuatro órdenes con ruta.
2. **Órdenes sin precio**: no suman al valor y cada fila dice cuántas son.
3. **Días en fase sin historial**: las órdenes que nunca cambiaron de fase dentro del sistema no tienen desde
   cuándo. Se dice «sin historial» en vez de un 0.
4. **La historia empieza hoy**: la primera foto mensual es la de este mes. Para comparar meses hay que esperar.
5. Siguen abiertas: **11 categorías sin hoja de operaciones** (siete familias enteras), las **dos operaciones
   de BVD y FITS sin centro**, **685 órdenes sin ruta de producción**, los **datos de las lavadoras**, la
   **fecha de arranque en tejeduría manual** y la confirmación de **JEANS → DENIM**.
