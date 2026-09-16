# Definición única de «orden abierta», unificación DENIM y minuto estimado

**Commit:** `9f5e9c9` · **Harness:** 1.527 pruebas verdes, sin errores.

---

## 4 · De dónde salían 590, 1.155 y 1.206

**Los tres números eran correctos; contaban cosas distintas y ninguno lo decía.**

| Cifra | Qué contaba | Dónde salía |
| --- | --- | --- |
| **1.206** | todo lo que el archivo dejó **cargado** (ya sin canceladas, sin fecha ni fuera de rango) | `S.ordenes.length` |
| **1.155** | las que no estaban **archivadas** — miraba solo el estado interno | `abierta()` vieja |
| **590** | las que además tienen **WH lanzada** y su Estado OP de Odoo no es `done` | el listado del 13-sep |

**La causa:** `abierta()` miraba el estado interno (`plan`) y `esFacturada()` miraba la tabla de fases. Dos
nociones distintas conviviendo, y ninguna miraba el **Estado OP de Odoo**. Por eso una orden `done` en Odoo
seguía contando como abierta.

### La definición única

Una orden está **abierta** cuando cumple las tres:

1. **no está archivada** ni cerrada a mano (`cerrada`, `standby`, `archivada`, `noArchivo`)
2. **su Estado OP de Odoo no es de cierre** — `done` o `cancel`, editable en `S.params.estadoOPCerrado`
3. **su fase no es de cierre** — la columna **«sistema»** de la tabla de fases (Configuración → Órdenes y
   materiales)

**Ninguna de las tres está escrita en el código como una lista fija de fases:** las dos primeras son
parámetros y la tercera es la tabla que ya editas.

`abierta()` ahora delega en esa definición, así que **todo el sistema la usa** — Reportería, el plan, los
centros, el motor. Hay una prueba que verifica que `abierta()` y `abiertaDe()` dan lo mismo para todas las
órdenes.

### Y una cifra más que hacía falta: **lanzadas**

Muchas órdenes abiertas **todavía no tienen WH** (están en diseño o recetas): se pueden ver, pero no
programar. Por eso se agregó **lanzada** = abierta **con orden de producción**. Es exactamente la cifra que
usaba tu listado del 13-sep.

### Las cuatro cifras, medidas sobre el volcado real

| | Órdenes | Qué es |
| --- | ---: | --- |
| **Cargadas** | **1.206** | todo lo que entró del archivo |
| − archivadas o cerradas a mano | 51 | |
| − con Estado OP cerrado en Odoo (`done`) | 77 | |
| − con fase de cierre | 0 | *(las facturadas viejas ya se excluyen al cargar)* |
| **= Abiertas** | **1.078** | siguen vivas para planificar |
| de ellas, **sin WH todavía** | 496 | en diseño o recetas: no se pueden programar |
| **= Lanzadas** | **582** | las que de verdad se pueden planificar hoy |
| **En planta** | **279** | lanzadas y liberadas a producción |

El panel **«Cuántas órdenes hay»** está en Reportería, con esta misma tabla y diciendo qué se resta en cada
paso. La descomposición está **fijada en una prueba**, sin contar ninguna orden dos veces.

---

## 3 · La etiqueta, en las tres bases

Mis 423 eran sobre **abiertas con la definición vieja**. Con la definición nueva:

| Base | Órdenes | Prendas | Minutos |
| --- | ---: | ---: | ---: |
| Cargadas | 452 | 219.283 | — |
| **Abiertas** | **395** | **201.293** | 100.647 |
| **Lanzadas** | **185** | **78.412** | **39.206** |

**Tu expectativa era 187 órdenes y ~78.500 prendas. Las lanzadas dan 185 / 78.412.** La diferencia de 2
órdenes es porque yo cuento solo las que traen WH en el archivo y el listado incluía dos sin lanzar.

**Ese es el número correcto para planificar:** las otras 210 órdenes abiertas todavía están en diseño y no
tienen WH.

---

## 1 · JEANS → DENIM: autorizado y ejecutado

La unificación **ya no depende de que alguien pulse un botón**: corre sola, **una sola vez**, en la misma
siembra que las demás decisiones del 16-sep. Se aplicará **la próxima vez que abras la app**.

**Lo que mueve, medido sobre los datos reales:**

| Qué | Cuántos |
| --- | ---: |
| Categorías del catálogo | **3** |
| **Órdenes** | **13** abiertas *(31 en todo el volcado)* |
| Operaciones de la LMO | **49** |
| Filas de configuración | **3** |

Las filas: `DENIM → JEANS` y `JEANS → JEANS` del mapeo a la LMO, y `lavado [denim, jean] 15 días` de las
esperas. *(La fila `jean` de ojales y botones ya se había unificado en una corrida anterior.)*

Órdenes: WH/MO/29136, WH/MO/29134, WH/MO/29135, WH/MO/28276, WH/MO/28275, WH/MO/28274 y 7 más.

**Verificado que no borra nada:** después de unificar quedan exactamente las mismas categorías, órdenes y
operaciones. Antes de mover guarda en `jeansUnificadoPrevio` lo que había, y todo va a bitácora y auditoría.
Es idempotente: si se vuelve a llamar, no hace nada.

---

## 5 · Minuto estimado por categoría

Las categorías **sin hoja de operaciones** ahora aceptan un **minuto estimado de confección por prenda**,
editable por producción en **Configuración → Operaciones** (y también visible en Reportería).

**Cómo se comporta:**

- **Sin valor cargado → la categoría sigue en 0** y sale como brecha, con sus órdenes y prendas. **No se
  inventa nada.**
- **Con valor → entra al plan**, y queda **marcado «estimado»**, para que nadie lo confunda con un dato de la
  hoja de operaciones. Solo aplica cuando la categoría **no tiene hoja**: en cuanto llegue la LMO, manda la
  hoja.
- **Un 0 escrito a mano se respeta como 0 confirmado**, distinto de «sin valor».
- Cada cambio queda en bitácora, con el valor anterior.

### Las 11 categorías, con sus órdenes abiertas

| Familia / categoría | Órdenes | Prendas |
| --- | ---: | ---: |
| JOGGER / Jogger | 16 | 3.996 |
| JOGGER / Jogger Moda | 11 | 1.811 |
| Fleece Pesado / Crew Zip | 14 | 2.594 |
| TEJIDOS / Camiseta Tejida | 11 | 3.028 |
| Fleece Pesado / Crew Moda | 10 | 1.795 |
| Fleece Basico / Crew | 8 | 897 |
| FALDAS / Faldas | 8 | 1.370 |
| TEJIDOS / Henley Tejida | 4 | 804 |
| ENTERIZO / Enterizo | 1 | 254 |
| TEJIDOS / Polo Tejida | 1 | 4 |
| ACCESORIOS / Accesorios | 0 | 0 |
| **Total** | **~79** | **~16.200** |

Esas **16.200 prendas cargan hoy 0 minutos en confección**. En cuanto producción escriba un estimado, entran
al plan marcadas como tales.

---

## 2 · Siembras

Quedan automáticas, como pediste. Ahora son seis (se sumó la unificación DENIM), todas idempotentes, con
bitácora y editables después.

---

## Archivos tocados

| Archivo | Qué cambió |
| --- | --- |
| `index.html` | `abiertaDe`/`lanzada`/`ordenesAbiertas`/`ordenesLanzadas`/`ordenesEnPlanta`/`faseDeCierre`/`estadosOPCerrados`/`conteoOrdenesHTML`; `abierta()` delega en la definición única; `minEstimadoConf`/`setMinEstConf`/`tieneHojaLMO`/`categoriasSinHoja`/`categoriasSinHojaHTML` y su entrada en `samPorCentro`; `sembrarUnificacionJeans` |
| `test/driver.js` | 33 pruebas nuevas y la medición real en `__R.conteo`, `__R.etiqReal`, `__R.jeansMovido` y `__R.sinHoja` |
| `DEFINICION_ORDEN_ABIERTA.md` | este reporte |

---

## Brechas detectadas

1. **496 órdenes abiertas sin WH** (en diseño o recetas). Se ven pero no se programan. Vale la pena mirar
   cuántas llevan mucho ahí.
2. **11 categorías sin hoja de operaciones**, ~16.200 prendas abiertas cargando 0 minutos, hasta que
   producción escriba el estimado o llegue la hoja.
3. **77 órdenes con Estado OP `done` en Odoo** seguían contando como abiertas hasta este cambio. Ya no.
4. Siguen abiertas: **349 de 470 rutas que no terminan en Empaque**, las **dos operaciones de BVD y FITS sin
   centro**, **685 órdenes sin ruta de producción**, los **datos de las lavadoras** y la **fecha de arranque
   en tejeduría manual**.
