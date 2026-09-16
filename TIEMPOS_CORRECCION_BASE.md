# Corrección: los tiempos estimados, con la base correcta

**Commit:** `7ea7f2e` · **Harness:** 1.726 pruebas verdes, sin errores.

**Tu revisión era correcta.** Los ~89.400 min del listado son el número comparable; mis 197.573 salían de otra
base y no lo dije.

---

## 1 · Qué son las 79 órdenes

El cálculo **sí usaba la definición única** de orden abierta. El error fue **reportar la base equivocada**:
di «abiertas» y lo puse al lado de un listado hecho con «lanzadas», sin decir que eran cosas distintas.

**Abiertas = lanzadas + las que están en diseño, sin WH.** Esas últimas existen y son reales, pero **no tienen
orden de producción**, así que no se pueden programar y su carga no es planificable todavía.

| Base | Órdenes | Prendas | Minutos |
| --- | ---: | ---: | ---: |
| Cargadas | 84 | 16.553 | 201.202 |
| **Abiertas** | **79** | **16.232** | **197.573** ← lo que reporté |
| **Lanzadas** | **50** | **8.232** | **89.253** ← lo comparable con tu listado |
| Liberadas | 26 | 3.469 | 34.304 |

De las 79 abiertas, **29 están en diseño sin WH**. Ahí estaba toda la diferencia.

---

## 2 · El cálculo rehecho, por categoría

Con **lanzadas**, que es la base del listado del 13-sep:

| Categoría | Min/prenda | Órdenes | Prendas | Minutos | Horas |
| --- | ---: | ---: | ---: | ---: | ---: |
| TEJIDOS / Camiseta Tejida ⚠ | 4,57 | 11 | 3.028 | 13.838 | 231 |
| Fleece Pesado / Crew Moda | 12,12 | 7 | 1.229 | 14.895 | 248 |
| Fleece Pesado / Crew Zip | 15,30 | 7 | 1.105 | 16.907 | 282 |
| JOGGER / Jogger Moda | 19,13 | 6 | 707 | 13.525 | 225 |
| TEJIDOS / Henley Tejida | 15,55 | 4 | 804 | 12.502 | 208 |
| Fleece Basico / Crew | 9,89 | 5 | 500 | 4.945 | 82 |
| ENTERIZO / Enterizo | 21,20 | 1 | 254 | 5.385 | 90 |
| JOGGER / Jogger | 12,06 | 3 | 311 | 3.750 | 63 |
| FALDAS / Faldas | 11,87 | 5 | 290 | 3.442 | 57 |
| TEJIDOS / Polo Tejida | 15,90 | 1 | 4 | 64 | 1 |
| ACCESORIOS / Accesorios | 3,00 | 0 | 0 | 0 | 0 |
| **Total lanzadas** | | **50** | **8.232** | **89.253** | **1.488 h** |
| **Total liberadas** | | **26** | **3.469** | **34.304** | **572 h** |

**Cuadra con tu listado categoría por categoría:** Jogger Moda 6/707 ✓, Crew Zip 7/1.105 ✓, Crew Moda 7/1.229
✓, Crew 5/500 ✓, Faldas 5/290 ✓, Camiseta Tejida 11/3.028 ✓. Jogger da 3/311 contra tus 4/320 — una orden
menos, que en el volcado del 14-sep ya no está lanzada.

**Total: 50 órdenes / 8.232 prendas / 89.253 min**, contra las 51 / 8.241 / ≈89.400 de tu listado. La
diferencia es esa única orden.

---

## 3 · Para que no vuelva a pasar

Revisé si otros reportes cuentan órdenes sin la definición única. **No los hay**: los dos únicos filtros por
estado que quedaban eran la propia definición y un conteo del **archivo de carga** (cuántas filas nuevas trae
cada estado), que no es cartera y ahora está marcado como tal en el código.

El problema no era la definición: era **no declarar la base**. Así que ahora:

- **`BASES_CARTERA`** declara las cuatro con su explicación, y **`carteraDe(base)`** es el único camino para
  contar cartera. Pedir una base que no existe **es un error**, no un silencio.
- **`cifraCarteraHTML`** muestra el número **siempre con su base escrita al lado**.
- El panel nuevo **«Carga de los tiempos estimados»** (Configuración → Operaciones) tiene **selector de base**,
  el total con la base en la fila, **las otras tres bases al pie**, y avisa de que el número cambia mucho según
  cuál se mire.

### La prueba que pediste

Una guardia que falla si:

- alguna pantalla **filtra la cartera por el estado interno a mano** (en vez de pasar por la definición)
- hay **más de una definición** de orden abierta
- `abierta()` **deja de delegar** en `abiertaDe()`
- las cuatro bases **dejan de ser subconjuntos encajados** (cargadas ⊇ abiertas ⊇ lanzadas ⊇ liberadas)
- pedir una base inexistente **deja de dar error**

Un conteo que legítimamente no sea de cartera se marca en su línea con el motivo, así la excepción queda
escrita y no es un agujero silencioso.

---

## Archivos tocados

| Archivo | Qué cambió |
| --- | --- |
| `index.html` | `BASES_CARTERA`/`carteraDe`/`cuentaCartera`/`cifraCarteraHTML`/`baseCarteraTxt`/`baseCarteraDesc`; `cargaTiemposEst`/`cargaTiemposEstHTML` con selector de base; marcado el conteo del archivo de carga |
| `test/driver.js` | 11 pruebas nuevas (la guardia de cartera) y la medición en las cuatro bases |
| `TIEMPOS_CORRECCION_BASE.md` | este reporte |

---

## Lo que sigue en pie del reporte anterior

- Los 14 tiempos están cargados, **solo en confección**, con fuente y observación.
- **Camiseta Tejida (4,57) sigue pendiente de confirmar** — y con la base correcta pesa 13.838 min de 89.253,
  el 16 % del total: si el valor real fuera el de Camiseta CR, el total subiría a unos 116.000 min.
- **No se cambió ningún tiempo existente**; las dos incoherencias siguen visibles y se calculan solas.
- **HENLEY / «Nueva hija» no se borra.**

## Brechas

1. **29 de las 79 órdenes están en diseño, sin WH.** Su carga (108.320 min, 1.805 h) no es planificable hasta
   que se lancen. Conviene saber cuántas de esas ya deberían tener WH.
2. **24 lanzadas sin liberar**: 54.949 min que entrarán al programa al liberarlas.
