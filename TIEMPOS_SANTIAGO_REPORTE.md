# Tiempos estimados de confección — Santiago Garzón, 16-sep-2026

**Commit:** `d0aed10` · **Harness:** 1.711 pruebas verdes, sin errores.

---

## 1 · Los 14 tiempos, cargados

Las 14 filas de la hoja «Para llenar» están llenas y cargadas, **marcadas como estimadas**, con **fuente
«Santiago Garzón, 16-sep-2026»** y **la observación de cada fila visible** en pantalla.

| # | Familia / Categoría | Min/prenda | Órdenes abiertas | Prendas |
| ---: | --- | ---: | ---: | ---: |
| 1 | JOGGER / Jogger Moda | **19,13** | 11 | 1.811 |
| 2 | ENTERIZO / Enterizo | **21,20** | 1 | 254 |
| 3 | TEJIDOS / Polo Tejida | **15,90** | 1 | 4 |
| 4 | TEJIDOS / Henley Tejida | **15,55** | 4 | 804 |
| 5 | Fleece Pesado / Crew Zip | **15,30** | 14 | 2.594 |
| 6 | Fleece Pesado / Crew Moda | **12,12** | 9 | 1.723 |
| 7 | JOGGER / Jogger | **12,06** | 14 | 3.861 |
| 8 | FALDAS / Faldas | **11,87** | 8 | 1.370 |
| 9 | Fleece Basico / Crew | **9,89** | 6 | 783 |
| 10 | **TEJIDOS / Camiseta Tejida** | **4,57** ⚠ | 11 | 3.028 |
| 11 | ACCESORIOS / Accesorios | **3,00** | 0 | 0 |
| | **Cargadas** | | **79** | **16.232** |
| 12 | TEJIDOS / Hoodie Tejido | 14,84 | — | — |
| 13 | ENTERIZO / JUMPER | 21,20 | — | — |
| 14 | CHALECOS / Chalecos | 17,29 | — | — |

**Las tres últimas no calzaron** con el catálogo del simulador porque tienen **0 órdenes** y no aparecen en el
volcado. En tu base existen y se cargarán igual; el panel avisa si alguna no calza.

**Camiseta Tejida (4,57)** quedó con la marca **«pendiente de confirmar»** y el motivo a la vista: *«es un
tercio de Camiseta CR (13,46) y el resto de TEJIDOS está por encima de su equivalente»*.

**Solo confección:** está probado que el minuto entra en `modulos` y **no** en corte, empaque ni botones. Y
solo cuando la categoría **no tiene hoja LMO** — si mañana llega la hoja, manda la hoja.

Además: **no pisa un valor puesto a mano** y es idempotente.

---

## 2 · El efecto

### Lo que cambia hoy en el programa: **nada todavía**

| | |
| --- | ---: |
| Minutos de confección de la semana | **sin cambio** |
| Minutos del mes | **sin cambio** |
| Órdenes que cambian de fecha | **0** |

**Por qué:** el programa solo contiene órdenes **liberadas a producción**. De las 79 órdenes de estas
categorías, **solo 26 están liberadas**. Las demás no están en el programa, así que su minuto no se ve todavía.

Un minuto por prenda solo se convierte en carga cuando **la orden tiene el paso de confección en su ruta** (lo
resuelve la ruta por defecto de las 22, que corre en la misma apertura) **y además está liberada**.

### La carga que aparece cuando se liberen

| | Minutos | Horas |
| --- | ---: | ---: |
| **De las 26 ya liberadas** | **34.304** | **572 h** |
| **De las 79 en total** | **197.573** | **3.293 h** |

Las tres categorías que más pesan: **Jogger** (46.563 min), **Crew Zip** (39.688) y **Jogger Moda** (34.644).

**Lo que hay que saber:** esas 3.293 horas **ya existían como trabajo real**; lo que no existía era su
registro. Antes se planificaban como 0 minutos, así que el plan de confección estaba **subestimado en unas
3.300 horas** para esa cartera. Ahora aparecerán a medida que las órdenes se liberen.

---

## 3 · Tiempos actuales: **no se cambió nada**

La hoja «Tiempos actuales» volvió con la columna **«¿Correcto?» vacía**. **No toqué ningún tiempo existente.**

Las dos alertas siguen visibles, en **Configuración → Operaciones → «Tiempos por revisar»**:

- **Short Cargo (30,11) por encima de Pantalon Cargo (18,50)** — un short no debería llevar más trabajo que el
  pantalón del mismo tipo.
- **Boxer con confección pero sin empaque** — hoy carga 0 minutos en ese centro.

**Las dos se calculan solas**, comparando los tiempos reales del sistema; no están escritas a mano. Si alguien
corrige el tiempo, la alerta se apaga sola. Y si aparece otra categoría con confección y sin empaque, sale
sola también.

---

## 4 · HENLEY / «Nueva hija»

**No se borra.** Producción confirmó que es real. El panel de tiempos lo deja escrito: *«producción confirmó
que es una categoría real. No se borra; queda pendiente de nombre definitivo.»*

---

## Archivos tocados

| Archivo | Qué cambió |
| --- | --- |
| `index.html` | `TIEMPOS_SG`/`TIEMPOS_SG_FUENTE`/`sembrarTiemposSG`/`metaEstConf`/`marcaEstConfHTML`; `alertasTiempos`/`alertasTiemposHTML`; la tabla de categorías sin hoja muestra fuente y observación |
| `test/driver.js` | 22 pruebas nuevas y la medición del efecto sobre el volcado real |
| `TIEMPOS_SANTIAGO_REPORTE.md` | este reporte |

---

## Brechas

1. **Camiseta Tejida (4,57) está pendiente de confirmar.** Con 3.028 prendas es la segunda categoría más
   grande del grupo: si el tiempo real fuera parecido al de Camiseta CR, su carga pasaría de 13.838 a unos
   40.000 minutos. Conviene resolverla pronto.
2. **53 de las 79 órdenes no están liberadas**, así que su carga no se ve todavía en el programa.
3. **Hoodie Tejido, JUMPER y Chalecos** tienen tiempo cargado pero ninguna orden; se aplicarán cuando aparezca
   la primera.
4. **Las dos incoherencias de tiempos siguen sin corregir**, a la espera de que producción decida.
5. Siguen pendientes: el **centro de las dos operaciones de BVD y FITS**, los **datos de las lavadoras** y
   **cuándo encender la regla de tejeduría**.
