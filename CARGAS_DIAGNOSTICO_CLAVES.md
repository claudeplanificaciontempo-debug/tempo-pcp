# Carga de datos — diagnóstico de claves, duplicados y alcance

**17-sep-2026. Solo reporte: no se construyó nada.** Medido en el harness con el volcado real
(`tarea_rows.json`, 1.211 órdenes en el sistema tras la Recarga Parte 2, de las cuales 5 son de
demostración del simulador: `OP-1001…1005`). Los puntos 4, 5 y 6 esperan tus decisiones al final.

---

## a) Las 501 que «Actualizar desde Odoo» no reconoce

### Qué clave usa cada cargador

| Cargador | Cómo identifica la orden existente | Normalización | Cómo nombra la orden nueva |
|---|---|---|---|
| **Recarga Parte 2** (`planTarea`/`aplicarTarea`) | `normTxt(o.op)` contra el `op` del archivo | minúsculas, sin acentos, recortada; **conserva espacios internos** | id `op_` + op en minúsculas con todo lo no alfanumérico → `_` · sin WH: `sl_sin_wh_<hash>` |
| **Actualizar desde Odoo** (`planOdoo`) | `porOp[o.op]` → **el texto crudo**, solo `trim()` | **ninguna** (`WH/MO/28300` ≠ `wh/mo/28300`) | id `op_` + igual que Parte 2 · sin WH: `prev_` + cliente\|proyecto\|stilo\|color |
| **Órdenes de trabajo** (`planOT`) | `normFase(o.op)` | minúsculas, sin acentos, **sin espacios** | no crea órdenes; las que no encuentra van a `ordenesNoEncontradas` |
| **Fotos** (`planFotos`) | `normTxt(o.op)` | como Parte 2 | no crea órdenes |

Cuatro cargadores, **tres normalizaciones distintas** y **dos claves distintas para la misma orden sin WH**.

### Las 501, por causa

| Causa | Órdenes | Qué pasa |
|---|---:|---|
| **Orden sin WH** (diseño, recetas): la Parte 2 la crea como `SIN WH #<hash>`, Odoo la busca por `prev_<cliente\|proyecto\|stilo\|color>` | **496** | Ninguna de las dos claves ve a la otra. Odoo crea **489** previsiones nuevas: son las mismas 496 órdenes, **7 se pierden** porque su clave choca |
| Órdenes de demostración del simulador (`OP-1001…1005`, estado `noArchivo`) | 5 | no existen en producción |
| Diferencias de mayúsculas o espacios en la WH | **0** | las 710 WH reales calzan carácter por carácter; hoy no hay problema de normalización **en este archivo** — pero nada lo garantiza en el siguiente |

**En producción, las 501 son 496 y todas son la misma causa: la orden sin WH tiene dos claves.**

### Tres ejemplos (misma orden, dos claves)

| En el sistema (Parte 2) | En «Actualizar desde Odoo» |
|---|---|
| `sl_sin_wh_1l2q8w4` · «SIN WH #1l2q8w4» · FASHION CLUB · NOVIEMBRE 2026 · ref 8383 · CADET NAVY · 338 | `prev_comercializadora_de_ropa_fashion_club_cia_ltda_noviembre_2026_8383_cadet_navy` |
| `sl_sin_wh_untkrq` · «SIN WH #untkrq» · FASHION CLUB · NOVIEMBRE 2026 · ref 8053 · DARK BLACK · 338 | `prev_…_noviembre_2026_8053_dark_black` |
| `sl_sin_wh_1nx6yah` · «SIN WH #1nx6yah» · FASHION CLUB · NOVIEMBRE 2026 · ref 2444 · JAVA · 468 | `prev_…_noviembre_2026_2444_java` |

### Las dos claves de «sin WH» están mal, cada una a su manera

- **La de la Parte 2** (hash de cliente\|ODC\|stilo\|catHija\|color\|**fecha**\|**pedido**\|proyecto) es única (496 de 496) pero
  **no es estable**: si diseño cambia la cantidad o la fecha de entrega en Odoo, en la siguiente recarga la orden
  aparece como **nueva** y la anterior queda `noArchivo` — con sus decisiones, fotos y firmas colgando de la vieja.
- **La de Odoo** (cliente\|proyecto\|stilo\|color) es estable pero **no es única**: **7 pares** chocan. Ejemplo:
  ref 4238 OLIVINE, FASHION CLUB, DICIEMBRE 2026 existe dos veces — **ODC 3037 (470 u., 13-dic) y ODC 3036
  (567 u., 1-dic)** — y Odoo las funde en una.

### Propuesta: UNA función de clave para los cuatro cargadores

```
claveOrden(fila) →
  con WH:  'op:'  + normFase(op)                     // minúsculas, sin acentos, sin espacios
  sin WH:  'sin:' + normFase(cliente|proyecto|stilo|color|ODC)
```

- **Con WH**, `normFase` (la de las OT): es la más estricta y hoy calza el 100 %. La Parte 2 y las Fotos pasan
  de `normTxt` a `normFase` sin cambiar ningún resultado del archivo actual (0 colisiones, 710 de 710).
- **Sin WH**, cliente + proyecto + stilo + color + **ODC**: **única** en las 496 (verificado: 0 choques, también
  agregando categoría o cantidad no cambia nada) y **estable** porque no lleva fecha ni cantidad. Cuando Odoo
  le asigne WH, la orden **cambia de clave** una sola vez: eso ya lo maneja `prevAWh` en Odoo y hay que
  hacerlo igual en el camino único (buscar por la clave sin WH cuando la WH no existe todavía).
- La función vive en un solo lugar y **los cuatro cargadores la llaman**; el id de la orden sale de ella
  (`op_…` / `sin_…`), y una prueba fija que ningún cargador arme una clave por su cuenta.
- **Migración**: las 496 `sl_sin_wh_<hash>` de hoy se reconocen por su clave nueva **una sola vez** al primer
  pasar del camino único (se guarda `claveAnterior`, nada se borra).

---

## b) Consulta SQL de solo lectura — `SUPABASE_DUPLICADOS_ORDENES.sql`

Escrita, **no ejecutada** (la clave pública no lee `ordenes`; la corres tú en el SQL Editor). Cinco bloques:

0. cuántas órdenes hay **por origen** (Parte 2 / Odoo / a mano), para leer lo demás con su base;
1. **misma WH normalizada** bajo más de un id (+ resumen: cuántos ids los creó Odoo);
2. **misma ref + proyecto + cantidad** (aquí caen los pares «SIN WH» ↔ «prev_») (+ resumen);
3. **qué cargas de Odoo hubo** según la tabla `cargas` (las filas sin `tipo`) y según la bitácora;
4. órdenes que **solo existen por Odoo** y están fuera del alcance de la Parte 2.

Cómo distingue el origen: la Parte 2 marca `origenParte2:true`; `nuevaOrden()` de Odoo es la única que
escribe la clave `samProv`, y sus previsiones llevan id `prev_…`. Lo creado a mano no tiene ninguna.

**Dos cosas que encontré al escribirla:**
- `S.cargas` se **recorta a 60** (`if(S.cargas.length>60)S.cargas=S.cargas.slice(-60)`), contra el principio
  «nada se borra». El bloque 3b busca en la bitácora por eso. Lo quita el punto 8 (registro unificado).
- **Antes del commit 3 de ayer, «Actualizar desde Odoo» no dejaba ninguna línea en bitácora**: solo la fila
  en `cargas`. Si `cargas` se recortó, esas cargas viejas no tienen rastro.

---

## c) Antes / después de la regla de alcance única — alcance vs. reconocimiento

Lo que hoy hace «Actualizar desde Odoo» sobre el mismo archivo, separado por causa:

| | Órdenes | Unidades | Causa |
|---|---:|---:|---|
| Reconoce (80 con cambios + 630 sin cambio) | **710** | 208.536 | — |
| Crea como nuevas **con WH** | **3.019** | 657.084 | **ALCANCE**: las 3.019 están fuera de la regla de Parte 2 (entrega pasada + fase de cierre): 2.549 cerradas/Facturado, 468 Stand by, 2 anuladas; entregas de ene-2026 a sep-2026 |
| Crea como nuevas **sin WH** (`prev_`) | **489** | ≈223.365 | **RECONOCIMIENTO**: son las 496 que ya están como «SIN WH #…»; 7 se funden por la clave |
| Total nuevas | 3.508 | | 1.211 → 4.719 |

**Con la regla de alcance única (la de Parte 2) aplicada al camino de Odoo:**

| | Hoy | Con regla única | Con regla única **y** clave única |
|---|---:|---:|---:|
| Nuevas con WH | 3.019 | **0** (quedan marcadas «fuera de alcance», no se borran) | 0 |
| Nuevas sin WH | 489 | 489 (siguen sin reconocerse) | **0** (se reconocen las 496) |
| Cartera después | 4.719 | 1.700 | **1.211** |

Es decir: **la regla de alcance resuelve el 86 % del daño (3.019) y la clave única el 14 % restante (489)**.
Sin la clave única, el camino único seguiría duplicando las órdenes de diseño.

**Qué cambia en cada camino al aplicar la regla única:**
- **Parte 2: nada.** Ya es su regla (0 cancel, 3.029 fuera de rango, 5 sin fecha con proyecto que entran).
- **Odoo: 3.019 órdenes / 657.084 unidades** pasan de «entrar como nuevas» a «fuera de alcance». Las 6 «SIN WH»
  que la Parte 2 también excluye por rango (Facturado / Stand by con entrega pasada) no las ve Odoo de todos
  modos. Ninguna de las 3.019 está hoy en el sistema: no hay órdenes que cambien de estado, solo dejan de
  crearse.

Lo pendiente de decidir para el punto 5: la regla de Parte 2 tiene **dos parámetros** que van a Configuración
(hoy están en código): «entrega pasada» = `fecha < hoy`, y «fase de cierre» = columna sistema de la tabla 1.
El `hoy+21` que Odoo inventa como fecha cuando el archivo no trae (`fecha:d.fecha||dsum(hoy(),21)` en
`nuevaOrden`) se elimina: sin fecha y sin Proyecto la orden queda fuera y se reporta, como en la Parte 2.

---

## Decisiones que necesito para 4, 5 y 6

1. **La clave única** como está propuesta (WH → `normFase`; sin WH → cliente+proyecto+stilo+color+ODC).
2. **Migración** de las 496 `sl_sin_wh_…`: reconocerlas una vez por la clave nueva guardando `claveAnterior`.
3. **La regla de alcance** con sus dos parámetros en Configuración → Órdenes (fecha límite = hoy; fases de
   cierre = tabla 1), sin `hoy+21`.
4. Ejecutar tú `SUPABASE_DUPLICADOS_ORDENES.sql` y pasarme los resúmenes (bloques 0, 1b, 2b y 3) para
   saber cuántos duplicados hay **en producción**, no solo en el harness.
