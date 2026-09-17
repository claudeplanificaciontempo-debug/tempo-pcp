# Carga de datos — PASO 0 (escaneo, sin construir)

**17-sep-2026 · commit `7b9c2a1`** (solo pruebas, ningún cambio en la aplicación).
Harness: **2.146 checks, 0 errores, 1 fallo a propósito** — el hallazgo del punto 2.

---

## 1 · Inventario de todas las cargas de archivo

| Nombre en pantalla | Dónde | Función | Archivo | Qué hace | Permiso |
|---|---|---|---|---|---|
| **Actualizar desde Odoo** | Hoy · Órdenes | `mOdoo` → `leerOdoo` → `aplicarOdoo` | xlsx/csv de tareas (con o sin componentes) | **Crea** nuevas, **actualiza** fase/cantidad/fecha/color/telas, **cierra** done/to_close, quita previsiones que pasaron a WH | `puede('ordenes')` |
| **Recarga Parte 2 (tareas)** | Órdenes | `mCargarTarea` → `planTarea` → `aplicarTarea` | el mismo xlsx, **con componentes** | **Reemplaza** la lista de órdenes (`S.ordenes = plan.ordenes`) conservando lo de la tabla 14 | `puede('ordenes')` |
| **Órdenes de trabajo** | Hoy · Órdenes | `mOT` → `planOT` → `aplicarOT` | xlsx/csv de `mrp.workorder` | **Reemplaza** `o.ot` de cada orden que trae; cierra centros terminados | `puede('ordenes')` |
| **Fotos** | Hoy · Órdenes | `mFotos` → `planFotos` → `aplicarFotos` | **CSV** con `Orden de produccion` + `Avatar` (base64) | Sube al bucket de Supabase y cuelga el enlace; **no pisa fotos ya puestas** | `puede('ordenes')` |
| **Cargar operaciones (hoja LMO)** | Configuración → Operaciones | `mCargarLMO` → `planLMO` → `aplicarLMO` | OPERACIONES.xlsx (hoja LMO) | Reemplaza `S.operaciones` | página `categorias` |
| **Cargar por archivo (tallas)** | Configuración → tabla 16 | `mCargarTallas` → `leerTabla`/`planTallas` → `aplicarTallas` | xlsx o CSV | Escribe `o.tallasPedido` | `ordenes` o `programa` |
| **Cargar facturas** | Configuración → tabla 12 | `mFacturas` → `leerFacturas` | xlsx/csv de facturas de compra | Llena el catálogo de productos (proveedor, origen, tipo) | `puede('ordenes')` |
| **Restaurar** | Cabecera | `importJSON` | **JSON** de respaldo | **Reemplaza TODO** (une la bitácora); pide confirmación | `puede('config')` |
| **Respaldo** | Cabecera | `exportJSON` | — (descarga) | Exporta todo a JSON | visible con `config` |

Además hay **cargas por pegado** (no son archivo): precios (`mPrecios`), colores, consumos, categorías,
operaciones, familias de operación y máquinas.

---

## 2 · «Actualizar desde Odoo» vs «Recarga Parte 2»

### a) Reglas de alcance

| | Actualizar desde Odoo | Recarga Parte 2 |
|---|---|---|
| **Entrega pasada** | **no la mira**: carga todo lo que venga | **excluye** si la entrega es anterior a hoy **y** la fase no es de cierre; si está abierta, entra marcada **vencida** |
| **Sin fecha de entrega** | pone `hoy + 21 días` por defecto | **bandeja «sin fecha»**; solo entra si el Proyecto le da mes; queda `sinFechaEntrega` |
| **cancel** | `estado = 'anulada'` (la carga) | **excluye** — y **manda la fase**, no el Estado OP: `cancel` en una fase viva se carga y se reporta como contradicción |
| **done / to_close** | `estado = 'cerrada'` | entra como **historia** si la fase es de cierre; `done` en fase viva es **contradicción** reportada |
| **Sin WH** | `estado = 'prevision'` | entra marcada `sinLanzar` |

**No hay una sola regla de alcance:** son dos criterios distintos sobre el mismo archivo. Eso solo ya
explica que dos cargas del mismo Excel den carteras distintas.

### b) Componentes

- **Recarga Parte 2**: los **exige** — de ahí salen telas, kilos, Pantone por tela, insumos, clasificación
  de materiales y la ruta completa.
- **Actualizar desde Odoo**: los **lee si vienen** (`conComp`); si no, deduce las telas del consumo de la
  categoría. La vista previa lo dice: *«con telas y Pantone de la receta»* o *«sin componentes»*.

### c) Órdenes que ya no vienen en el archivo

- **Recarga Parte 2**: **no las borra**. Quedan con `estado:'noArchivo'` y la marca
  `{ts, archivo, estadoAntes}`, conservando todo lo suyo. **Probado en el harness**: la orden ausente
  sigue en el sistema, con su puesto manual y su avance intactos.
- **Actualizar desde Odoo**: **ni las toca ni las marca** — simplemente no se entera. Solo borra las
  **previsiones** que pasaron a tener WH (`prevQuitadas`), que es correcto.

---

## 3 · Qué dato trabajado se pierde

### Recarga Parte 2 — **no se pierde nada de lo probado**

Marqué doce datos, recargué con el mismo archivo y comparé:

| Dato | ¿Sobrevive? |
|---|---|
| Puesto manual (`progCentro.pri`) | **sí** |
| Maquila / `recursoFijo` | **sí** |
| `odcManual` | **sí** |
| Cierres de `avance` | **sí** |
| Tramos de `avance` | **sí** |
| Liberaciones (`lib`) | **sí** |
| Ruta editada | **sí** |
| Foto asignada | **sí** |
| Fecha de compromiso | **sí** |
| Prioridad | **sí** |
| Plan congelado (`S.planes`) | **sí** |
| Decisión pospuesta (`params`) | **sí** |

Lo gobierna la **tabla 14 · campos conservados** (19 filas, editable): `rutaConf`, `tallasPedido`,
`fase`, `fecha`, `lib`, `prio`, `progCentro`, `recursoFijo`, `fechaCompromiso`, `odc`, `foto`, `fases`,
`opsSam`, `faltaConf`, `rutaEditada`, `ot`, `terminadaF`, `avance`. Cuando el archivo contradice algo
conservado, va a la bandeja **«decisiones que ya no calzan»** (`noCalzan`) en vez de pisarlo.

> **Con una salvedad seria:** todo esto depende de que esas filas estén marcadas `conservar`. Si alguien
> desmarca `avance` en la tabla 14, `aplicarTarea` hace **`S.avance={}`** — borra el avance de piso de
> toda la planta, sin confirmación y sin aviso. Es la única puerta de borrado masivo que encontré fuera
> de «Restaurar».

### Actualizar desde Odoo — **no se puede medir, y eso ya es un hallazgo**

Su plan se arma **dentro de `leerOdoo(ev)`**, el manejador del `<input type="file">`. No existe un
`planOdoo(rows)` llamable, así que **no se puede ejercitar desde el harness ni desde ninguna prueba**.
Dejé esa comprobación **en rojo** a propósito.

Lo que sí se ve leyendo `aplicarOdoo`: **no toca** `progCentro`, `recursoFijo`, `avance`, `lib` ni
`planes` — actualiza campos de la orden en sitio. Pero **sí pisa** sin preguntar:

- **`o.cat`, `o.estado`, `o.colorOdoo`** siempre;
- **la fase** vía `registrarFase(o, d.fase, 'archivo')` — **sin respetar la tabla 14**, que en la Recarga
  sí protege la fase movida por los supervisores;
- **`o.telas`** salvo `telasManual`;
- **agrega pasos a la ruta** (estampado, bordado, lavado, botones, plancha) **aunque la ruta esté editada
  a mano**: no mira `rutaEditada` ni `rutaConf`.

**Las dos cargas no respetan las mismas reglas.** La Recarga Parte 2 tiene la tabla 14; Actualizar desde
Odoo no la consulta en ningún punto.

---

## 4 · OT y fotos

**Órdenes de trabajo** (`mrp.workorder`): columnas *Orden de fabricación*, *Centro de producción*,
*Estado*, y si vienen *Fecha de inicio* / *Fecha final*, *Operaciones*, *Cantidad*.
**Depende de que las órdenes estén cargadas antes**: cruza por `op`; las que no están en el sistema se
cuentan en `ordenesNoEncontradas` y **se ignoran**. Es **reemplazo por orden**: borra lo que dijo la OT
anterior y vuelve a ponerlo (`o.ot={}` y `a.centrosOT={}` antes de aplicar). Lo `terminado` **cierra** el
centro y manda sobre la fase; las contradicciones se reportan.

**Fotos**: CSV con `Orden de produccion` + `Avatar` (base64). **Depende de las órdenes**: cruza por `op`,
y las que no calzan quedan en `sinOrden`. Guarda el índice en `params.fotosIdx`, así que `colgarFotos()`
las vuelve a colgar tras cada recarga — **y no pisa una foto ya puesta**.

## 5 · `excelFecha` corregido en todos los caminos

**Sí.** Hay **una sola** función que convierte seriales numéricos de Excel y ya usa `Math.floor`
(commit `2973daa`). La usan los tres cargadores que la necesitan: **`planOT`** (inicio y fin),
**`planTarea`** (fecha de entrega) y la carga de proveedores. `planOT` guarda además `iniTs`/`finTs` con
la hora. El otro parseo (`fechaDe`, dentro de `leerOdoo`) **solo acepta `Date` y texto** — nunca vio
seriales numéricos, así que nunca tuvo el problema; pero si el Excel llegara con un serial numérico,
**lo descarta en silencio** y la orden queda sin fecha.

---

## La propuesta, revisada

Estoy de acuerdo con las ocho decisiones. Tres cosas que cambiaría o que necesitas saber antes:

1. **La regla de alcance única va a mover la cartera.** Hoy «Actualizar desde Odoo» carga entregas
   pasadas y «Recarga Parte 2» las excluye salvo que estén abiertas. Al unificar, **una de las dos
   carteras cambia de tamaño**. Propongo adoptar la de Parte 2 (es la que sostiene los reportes) y
   medirlo antes/después.
2. **El primer paso debería ser hacer `planOdoo(rows)` llamable**, aunque no se unifique nada más. Sin
   eso no hay forma de probar ese camino, ni ahora ni después.
3. **La tabla 14 debe gobernar los dos caminos.** Hoy solo gobierna uno. Y propongo **quitar el borrado
   masivo de `S.avance`**: si alguien desmarca `avance`, que el avance se conserve igual y se reporte,
   en vez de borrarse.

Sobre lo demás: «Reemplazar todo» solo admin con respaldo previo me parece bien — hoy `importJSON` ya
pide confirmación pero **no hace respaldo automático antes**. Y el registro de cada carga ya existe
parcialmente (`S.cargas`, `params.tareaCarga`, `params.otCarga`, `params.fotosCarga`): faltaría unificarlo.

**No construyo nada hasta tu aprobación.**
