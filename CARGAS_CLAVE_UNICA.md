# Carga de datos — clave única, migración y regla de alcance

**17-sep-2026.** Un commit para los tres puntos aprobados del diagnóstico (van juntos porque la regla de alcance y la clave
se prueban sobre el mismo volcado y comparten el panel de Configuración). **No se tocó nivelación, cercanía, búsquedas
ni tablet.** «Actualizar desde Odoo» sigue deshabilitado hasta el punto 6.

## 1 · Clave única — `claveOrden()`

```
con WH:  'op:'  + normFase(op)                               → op:wh/mo/28300
sin WH:  'sin:' + normFase(cliente|proyecto|stilo|color|ODC)   → sin:fashionclub|noviembre2026|8383|cadetnavy|3033
```

- **Una sola función** (`claveOrden`, `claveDeOrden(o)`, `indiceClaves()`), llamada por los cuatro cargadores: Parte 2
  (`planTarea`/`aplicarTarea`), Odoo (`planOdoo`), órdenes de trabajo (`planOT`) y fotos (`planFotos`). La prueba K2
  **falla si un cargador vuelve a armar su clave** (busca `clavePrev`, el hash `5381`, `porOp[`, `normTxt(o.op)`…) y exige
  que los cuatro pasen por `claveOrden`/`indiceClaves`.
- **Componente vacío = clave incompleta**: no se reconoce ni se crea; la vista previa la lista con la fila y **qué falta**
  («fila 214 falta ODC»).
- **Dos filas del mismo archivo con la misma clave**: no se funden — entran aparte (`_dup2`, como siempre) y **se reportan
  las dos** como «clave repetida en el archivo». También se reportan las claves repetidas **ya en el sistema**.
- **El id de una orden nueva sale de la clave** (`idDeClave`): `op:wh/mo/28300` → `op_wh_mo_28300`, el mismo de siempre;
  sin WH → `sin_…`. Y **el id de una orden existente no cambia nunca**: `planTarea` resuelve cada fila contra
  `indiceClaves()` y reutiliza el id que ya existe. Por eso las 496 `sl_sin_wh_…` y cualquier `prev_…` de Odoo
  **se reconocen sin renombrar nada** (avance, planes, fotos y todo lo que cuelga del id sigue igual).
- **Paso de sin WH a WH, una sola vez**: si la WH no existe, se busca por la clave sin WH de la misma fila; si esa orden
  existe y no tenía WH, se reutiliza su id, se guarda `claveAnterior` y va a bitácora. La segunda carga ya la reconoce
  por la WH (probado: `prevAWh` = 0 la segunda vez). En Odoo, esto **reemplaza un borrado**: antes `planOdoo` hacía
  `S.ordenes = S.ordenes.filter(...)` para quitar la previsión **durante la vista previa**, sin confirmación.
- La etiqueta visible de una orden sin WH sigue siendo «SIN WH #…», pero ahora es un hash **de la clave** (estable).

## 2 · Migración de las 496

- **Vista previa** en Configuración → Órdenes y materiales → «Clave única de orden» (`diagClaves`): total, con/sin WH,
  **cuántas se reconocen**, **cuántas no y por qué** (clave incompleta con lo que falta), claves repetidas en el sistema,
  y cuántas llevan id de la clave anterior (`sl_`/`prev_`).
- **Aplicar** («Guardar la clave en las N órdenes», con confirmación): guarda `o.clave` y `o.claveAnterior` (la etiqueta
  o id viejo). **No borra ni renombra nada**; bitácora.
- **Prueba K4**: se simulan una `sl_sin_wh_…` y una `prev_…` con firma de liberación, historial de fases con motivo,
  programación por centro, foto, prioridad 1 y avance (unidades + tramo); tras migrar y recargar el volcado, **todo sigue
  en la misma orden**, la cartera no crece y ninguna queda `noArchivo`.
- **Prueba K3** con el volcado real: las 496 sin WH tienen clave completa y única; **la misma orden con otra cantidad y
  otra fecha conserva su id** (antes nacía otra y la vieja quedaba `noArchivo`).

## 3 · Regla de alcance única — `alcanceOrden()`

Una función, la de Parte 2, para todos los cargadores. **Parámetros en Configuración → Órdenes y materiales → «Alcance
de las cargas»** (antes en código):

| Parámetro | Valor | Qué hace |
|---|---|---|
| `alcanceDiasAtras` | 0 | «entrega pasada» = fecha < hoy − N días; con **fase de cierre** (columna sistema de la tabla 1) queda fuera |
| `alcanceSinFechaConProyecto` | 1 | sin fecha entra solo si el Proyecto trae un mes; **0 = nunca** (0 es 0, probado) |
| fase Cancelado | siempre fuera | la fase decide, no el Estado OP |

- **Se eliminó el `hoy+21`** de `nuevaOrden` (Odoo inventaba fecha) y **el «día 28 del mes del Proyecto»** de `fechaDe`
  (Odoo inventaba fecha desde el Proyecto cuando el serial era numérico). Sin fecha y sin Proyecto: fuera y reportada.
- **Punto 4 en el mismo commit**: `fechaDe` lee seriales numéricos y textos con `excelFecha` (46283,75 → 2026-09-18, sin
  redondear al día siguiente); lo ilegible va a `fechasIlegibles` y se muestra («quedan sin fecha, no se inventan»).
- **Fuera de alcance = marcada, nunca borrada**: en Parte 2 la existente queda `noArchivo` **con `fueraAlcance`
  {motivo, txt, archivo}**; en Odoo igual (`marcarFuera`). Las previsiones que ya no vienen tampoco se borran (antes sí).
- **Antes/después en el volcado** (`resumenAlcanceHTML` en las dos vistas previas, por motivo, con unidades):

| «Actualizar desde Odoo» sobre el archivo ya cargado | Antes | Ahora |
|---|---:|---:|
| Reconocidas | 710 | **~1.206** |
| Nuevas con WH | 3.019 | **0** (fuera de alcance: 2.549 cerradas, 468 stand by, 2 anuladas · 657.084 prendas) |
| Nuevas sin WH (`prev_`) | 489 | **0** |
| Cartera después | 4.719 | **1.211** |

  **La prueba P2, que estaba en rojo desde el punto 2, pasó a verde sola.** En Parte 2 no cambia nada (ya era su regla).

## Pendiente que quedó a la vista

- `planOdoo` sigue creando colores, categorías y técnicas **durante la vista previa** (`S.colores.push` etc.). No lo toqué:
  lo elimina el punto 6 al construir el camino único sobre `planTarea`.

## Harness

Pruebas nuevas K1 (7), K2 (2), K3 (8), K4 (5), K5 (11). **2.275 checks, 0 errores, 0 rojas** (P2 pasó a verde).
