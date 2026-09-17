# Nivelación — a dónde va «ver órdenes» (reporte antes de construir)

**17-sep-2026.** Nada construido todavía. Lo que se pidió: las WH salen de la nivelación; el detalle llega hasta tipo de
producto con unidades y número de órdenes, y un enlace «ver órdenes» abre la pantalla que ya las lista con la selección
aplicada (área, meses marcados, familia, tipo de producto, y los filtros de cliente/familia activos). Lo mismo para
«qué no entra».

## Qué acepta hoy cada pantalla candidata

| Pantalla | Área / centro | Meses | Familia | Tipo de producto | Cliente | Base de órdenes que lista | Cómo se llega con filtros puestos |
|---|---|---|---|---|---|---|---|
| **Carga general** (`produccion`, `CG`) | sí (`CG.area`, `CG.centro`) | no (semanas del programa, `CG.sem`) | no (solo el cruce familia × centro, agregado) | no | no (buscador libre) | el **detalle de una celda** lista las órdenes **programadas en el centro esa semana** (`P.pro`), no el saldo por procesar | no hay función `ir…` con filtros; `CG` se fija a mano |
| **Entregas** (`entregas`, `EG`) | **no** | sí, multiselección (`EG.meses`, por **fecha de Odoo**, no por fecha meta) | sí (`EG.fam`) | sí (`EG.hija`) | sí (`EG.cli`) | todas las abiertas con esos filtros, sin mirar en qué centro están | no hay función `ir…` con filtros |
| **Centro** (`centro`, `CEN`) | sí (`CEN.id`, `CEN.solo`) | no (semana) | no | no | no (buscador) | lo programado en la semana / lo que viene | `irCentro(c,dia,tab)` |
| **Órdenes** (`ordenes`, `ORDF`) | no | no | no (el buscador acota por *categoría* como texto) | idem | idem | toda la cartera, con filtro de fases y agrupador | `ir('ordenes')`; `BUSQ`/`ORDF.q` a mano |
| Vista general de órdenes (`VO`) | no | no | no | no | no | toda la cartera + agrupador | `ir('vistaordenes')` |

**Ninguna acepta hoy la selección completa.** Las dos que más se acercan se complementan al revés: Entregas tiene meses,
familia, tipo de producto y cliente pero no sabe de centros; Carga general sabe de área y centro pero no tiene meses ni
familia ni tipo de producto, y su detalle no es el saldo por procesar sino lo programado en una semana.

## Propuesta: Carga general, con una adición mínima

**Por qué Carga general y no Entregas u Órdenes.** El saldo de la nivelación es «órdenes que tienen ese centro en su ruta y
aún no lo terminaron»: un concepto de **centro**, y la prueba N5 ya demostró que **Carga general da exactamente el mismo
número** que el cuadrito (misma base `cargaUnica('abiertas')`). Está en el mismo menú (Planificación de producción), su
bloque de detalle es precisamente «las órdenes detrás de un número», con `filasGRP('cg')` + `whCell`, filtro de fases,
buscador y agrupador comunes. Entregas mira la fecha de Odoo (la nivelación usa la fecha meta) y no distingue centro;
Órdenes no distingue nada de esto.

**La adición (sin pantalla nueva):**

1. Un **segundo tipo de detalle** en Carga general: además de `CG.det={c,w}` (centro × semana programada), `CG.det={c, saldo:true,
   meses, fam, hija, cli}` = **«Saldo por procesar en <centro>»**. La lista sale de **la misma función** que usa la nivelación
   (`saldoProceso(centro, meses, filtro)`), así que es imposible que muestre otra cosa que la que el cuadrito sumó. Título:
   «Saldo por procesar en Corte · 2026-09, 2026-10 · SHORT PLANOS · Short Cargo · N órdenes · N u», con el filtro de fases,
   el buscador y el agrupador que ya tiene el bloque, y botón «cerrar». Para **Tela** (saldo por fase, no por centro) y
   **Maquila** (órdenes marcadas a maquila) el mismo bloque funciona porque `saldoProceso` ya sabe resolverlos por id de área.
2. Una función **`irSaldoCentro(sel)`** (`ir('produccion')` + fija `CG.area`, `CG.centro` y `CG.det`), que deja el «← atrás» a la
   nivelación con su estado. La nivelación la llama desde cada fila de tipo de producto y desde «qué no entra».
3. En la nivelación: el detalle de la celda queda en **tipo de producto · unidades · órdenes · [ver órdenes]**; «qué no entra»
   pasa a **familia × tipo de producto con unidades · [ver órdenes]**. Ninguna WH en la pantalla (con prueba que lo vigile).

Tamaño: ~40 líneas en Carga general, ~15 en la nivelación, más pruebas. No se toca el motor ni `cargaUnica`.

**Alternativa si prefieres Entregas:** agregarle un filtro «centro pendiente» (Set) y que el mes sea por fecha meta cuando llega
desde la nivelación. Es del mismo tamaño, pero deja dos definiciones de «pendiente en un centro» (la de Entregas sería nueva) en
vez de reutilizar `saldoProceso`; por eso no la recomiendo.

Espero tu decisión para construir.
