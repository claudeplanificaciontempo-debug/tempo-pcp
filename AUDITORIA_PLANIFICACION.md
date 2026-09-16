# Auditoría técnica — Módulo de Planificación y Control (tempo-pcp)

**Modo auditoría: no se modificó ningún archivo ni dato.** Todo lo citado es lectura de código (`index.html`, commit `dc3a5a9`/posteriores en la rama `main`) y consultas en vivo contra la base real de Supabase (`bypdfogmksbxjaiydhlg`), ejecutadas dentro de la sesión ya autenticada de la app el **12-sep-2026**, con `S.ordenes.length = 4218` en ese momento.

**Aviso importante sobre los números de la sección 7:** los valores que trae la solicitud original (53.267 prendas, 1.536 h, Corte 8.416, etc.) fueron observados por el usuario en un momento anterior. Al ejecutar las mismas consultas hoy, la base ya tiene datos distintos (se siguen cargando y editando órdenes a diario), así que los números absolutos que reporto aquí **no van a coincidir exactamente** con los citados — pero el **mecanismo y la causa raíz sí son los mismos**, y lo demuestro con los números de hoy más el código que los produce. Donde no pude reproducir un número exacto, lo digo explícitamente.

---

## 1. QUÉ ES EL SISTEMA

`index.html` es una sola página (vanilla JS, sin framework) con backend Supabase (`bypdfogmksbxjaiydhlg`). La navegación es un enrutador simple por variable `page` (línea 965, `render()`) que intercambia el contenido de un `<main>`. Las pantallas relevantes a planificación y control, agrupadas por menú:

**Dirección**
- `panorama` (Hoy) — resumen del día.
- `gerencia` (Resumen gerencial).
- `plan` (**Plan mensual**, `vPlan`, línea 1249) — capacidad, demanda, metas semanales del mes.
- `liberacion` (**Liberación**, `vLiberacion`) — libera tela y, en pestaña separada, libera a producción.
- `familias` (Demanda agregada).
- `escenarios` (`vEscenarios`, línea 1328) — simula cambios de personal/calendario sin tocar datos reales.
- `cumplimiento` (`vCumplimiento`, línea 1494) — semanas congeladas contra lo real.

**Planificación textil / Planificación de producción**
- `tejeduria`, `tintoreria` — programación de tejeduría y tintorería.
- `centro` (`vCentro`) — plan/programación/ejecución por centro de producción.
- `reporteria` (`vReporteria`) — carga y avance, ver `CLAUDE.md`.

**Piso**
- `control` (`vControl`) — control de piso por área (tejeduría, tintorería, producción).

**Configuración**
- `categorias` (`vCategorias`) — familias de prenda (padre/hija), sus operaciones y telas.
- `operaciones` (`vOperaciones`) — catálogo de operaciones por categoría/familia de operación.
- `config` (`vConfig`) — Centros y recursos, Telas y colores, Calendario y parámetros, Usuarios.

**Orden de uso implícito en el código** (según qué pantalla depende de datos de cuál otra): Configuración (centros, recursos, calendario) y Categorías/Operaciones se cargan primero (son la base de cálculo) → se cargan Órdenes → Liberación (tela) → Tejeduría/Tintorería (`programar()` las consume) → Liberación (a producción) → Centro/Control de piso → Plan mensual/Cumplimiento (leen el resultado de todo lo anterior vía `programar()`). Esto es una inferencia de dependencias de datos, **no** hay un asistente de "primeros pasos" en el código — **NO DETERMINADO** si existe una guía de orden de uso para un usuario nuevo.

---

## 2. MODELO DE DATOS

Todas las tablas reales de Supabase están en la constante `TABLAS` (línea 460): `centros, recursos, telas, colores, rutas, operaciones, tecnicas, maquinas, categorias, ordenes, programas, cargas, propuestas, paros, turnos, bitacora, planes, salidas_tin, banos_conf`. Todas comparten el mismo esquema físico: `id text primary key, data jsonb` (documentado en `CLAUDE.md`); `avance` y `params` se manejan aparte, fuera de `TABLAS`, con la misma forma `id/data`.

Conteos reales hoy (12-sep-2026, vía la sesión autenticada):

| Tabla | Registros hoy |
|---|---|
| `ordenes` | 4.218 |
| `recursos` | 28 |
| `categorias` | 85 |
| `operaciones` | 610 |
| `centros` | 12 |
| `rutas` | 64 |
| `telas` | 26 |
| `colores` | 195 |
| `turnos` | 0 |
| `paros` | 0 |

(El `seed()` de arranque del archivo trae 12 centros y 26 recursos "de fábrica"; `categorias`, `operaciones` y `rutas` arrancan vacías en el código y se llenan en uso real — hoy hay 85, 610 y 64 respectivamente, es decir, datos reales cargados, no el seed.)

### `centros`
Campos: `{id, n, area, medida}`. `area` ∈ `{tej, tin, pro, ext}` — es la clave que agrupa centros en las tres macro-etapas (tejeduría, tintorería, producción) más `ext` (proveedor externo de tela). `medida` es solo descriptivo (kg, bano, min, puntadas, prendas_h).

### `recursos`
Campos según el `seed()` (líneas 377-403) y su uso en `capDia`/`capSemana`: `id, n, centro, activa` (comunes); `kgh, horas, telas[], kgTela{}, rolColor` (tejeduría/tintorería); `cap, capPique` (tintorería); `pers, min, efic, dias` (producción). **`efic` (eficiencia, %) existe en TODOS los recursos de producción del seed, con valor 85**, y se usa exclusivamente en `capDia` (línea 569): `pers*(r.min||0)*((r.efic||0)/100)`.

### `categorias`
Estructura padre/hija vía `k.padre`. Una hija hereda `ops` (operaciones), `telas` y `recursos` del padre **solo si su propio array está vacío**; en cuanto define el suyo, lo reemplaza por completo (no se fusionan). Funciones: `opsDe(k)` (línea 532), `telasDe(k)` (535), `recursosDe(k)` (539). El SAM de una operación puede sobreescribirse por categoría vía `k.ops=[{op,sam}]` (`sam` opcional).

### `operaciones`
Campos: `id, centro, sub, n, sam, maq` (mínimos) más, si vienen de la carga LMO: `lmo, catP, centroOp, subcenOp, seccOp, famOp, cod, codGen, sec`. El SAM base vive en `operacion.sam`; una categoría puede pedir un SAM propio distinto para esa operación via `k.ops`.

### `rutas`
**Existe como tabla (64 registros hoy) pero es un catálogo de referencia/plantillas visuales, desacoplado del flujo real.** La ruta de cada orden (`o.ruta`, un array `{centro,t}`) **no se lee de esta tabla**: se arma con la función `armarRuta()` (línea 632), que combina un conjunto fijo (`FIJOS_PRO=['corte','modulos','empaque']`) más `tej`+`tin` o `proveedor` según el origen de la tela, más los centros opcionales marcados a mano en el formulario de la orden (estampado, bordado, lavado, botones, plancha, etiquetas). Confirmado: `sinRutaCount=0` en las 288 órdenes de septiembre — todas tienen `o.ruta` no vacío.

### Recursos/módulos, SAM/minutaje
El "SAM por centro" de una categoría es `samPorCentro(k)` (línea 537): suma los `sam` de `opsDe(k)` agrupados por centro. **Este SAM no se recalcula dentro de `programar()`** — se congela dentro de `o.ruta[].t` en el momento en que se arma la ruta de la orden (línea 3335). Si después se cambia el SAM de la categoría u operación, las órdenes ya cargadas **no** se actualizan solas.

### Calendario laboral
`S.params.cal={tej,tin,pro}` — días laborables por semana **por área**, no por recurso individual (salvo `r.dias` como respaldo si `cal[area]` no existe). Hoy: `{"pro":6,"tej":5,"tin":6}`. `S.params.excepciones[]` permite marcar fechas puntuales `{fecha,area,tipo:'trabaja'|'no',motivo}` que sobreescriben la regla base. **Hoy no hay ninguna excepción registrada para septiembre 2026** (`excepciones` filtradas a `2026-09` = 0 filas).

### Órdenes y estados de liberación
Ver sección 3 completa. Resumen de campos: `o.fase` (texto libre de Odoo), `o.estado` (`plan`/`prevision`/`cerrada`/`anulada`), `o.lib={tela:{ok,u,ts}, corte:{ok,u,ts}}`, `S.avance[o.id]={tejida, tinturada, calidadOk, reproc, lista, centros:{centroId:cant}, faltaKg:{}}`.

---

## 3. EL FLUJO DE LIBERACIÓN

No existe un único campo "estado" con el nombre de cada paso — el estado real de una orden es la combinación de `o.fase` (texto Odoo), `o.estado`, `o.lib` y `S.avance[o.id]`, evaluada en caliente por varias funciones. Tabla de la máquina de estados real (nombre del campo, quién lo cambia, desde qué pantalla):

| Paso | Campo/valor exacto | Función que lo dispara | Pantalla / botón |
|---|---|---|---|
| Carga | `o.fase` viene de Odoo; sin `S.avance[o.id]` | (importación) | Carga de órdenes |
| Tejida | `avance.tejida=true` | `setEstado(id,'tejida',v)` | Control de piso → Tejeduría |
| Liberación de tela | `o.lib.tela={ok:true,u,ts}` | `liberarA(ids,'tej'\|'tin'\|'tela')` | Liberación (pestaña principal) |
| Retiro de esa liberación | se borra `o.lib.tela` | `retirarLib(id,'tela')` | Liberación |
| Baño hecho (sale de máquina) | `avance.tinturada=true`; `o.fase='1Calidad Tintoreria'` | `banoListo(ids)` | Control de piso → Tintorería, botón "Hecho → calidad" |
| Tela incompleta | `avance.faltaKg[tela]=n` | `setFaltaKg(oid,tela,v)` | Panel "Estado de tintorería" |
| En calidad | derivado (`enCalidad(o)`, no es un campo propio) | — | Panel "Calidad de tintorería" |
| Calidad aprueba | `avance.calidadOk=true`; `o.fase='2Planificacion'` | `calidadAprobar(ids)` | Botón "Aprobar calidad" |
| Calidad rechaza (reproceso) | `avance.reproc=true`, `reprocesos[].estado='pendiente'`; `o.fase='1Tintoreria'` | `calidadRechazar→mReproceso→guardarReproceso` | Botón "Rechazar → reproceso" |
| Cola de liberación a producción | derivado: `puedeLiberar(o)` true y `o.lib.corte` aún no existe | — | Liberación a producción |
| Liberado a producción | `o.lib.corte={ok:true,u,ts}`; `avance.lista=true` | `liberarA(ids,'corte')` / `liberarCorte(id)` | Botón "Liberar" |
| En proceso por centro | `avance.centros[centroId]=cantidad` | `setAvance(id,c,v,max)` | Control de piso → Producción |
| Cambio manual de fase Odoo | `o.fase=valor` | `setFase(id,f)` | Control de piso → selector de fase |
| Terminada | `faseNum(f)>=8` primera vez → `o.terminadaF=hoy()` | efecto colateral de `setFase` | — |

**¿Existe fecha límite de liberación calculada, o solo la fecha del clic?** `o.lib[et]` **solo guarda `{ok, u, ts}`** — el momento del clic, sin ningún campo de fecha límite. Sí existe un cálculo de fecha "requerida" (`req = dsum(o.fecha, -(lead+diasTintBodega))`, líneas 744/772/787/881) **pero es del motor `programar()`**, para decidir cuándo hay que tejer/tinturar y priorizar — **no está enlazado con `o.lib`**. Son dos conceptos independientes en el código: uno (`req`) es "cuándo debería liberarse para no atrasar", el otro (`o.lib.ts`) es "cuándo se liberó de verdad". La app no compara ambos ni avisa si una liberación llegó tarde contra su propio `req`.

Toda transición pasa por una función invocada por clic humano (confirmado por las bitácoras: `bitacora('Liberadas a...')`, `'Calidad tintorería aprobó...'`, `'Reproceso tintorería...'`, `'Baño hecho...'`) — no hay ningún cambio de fase disparado automáticamente por el sistema sin una acción de un usuario.

---

## 4. HIPÓTESIS PRINCIPAL: BASES MEZCLADAS

**Confirmada, con evidencia de código y de datos en vivo.** Los 5 KPI superiores de Plan Mensual (`c.dem`, `calcularPlan()` línea 1222) se calculan sobre **TODAS las órdenes abiertas del mes de entrega**, sin distinguir liberadas de no liberadas; en cambio, otras tres tarjetas de la misma pantalla filtran explícitamente por liberación, con nombres muy parecidos ("facturación esperada") pero poblaciones distintas.

| Número en pantalla | Archivo · función | Población | Filtro literal |
|---|---|---|---|
| Órdenes con entrega en el mes (KPI) | `index.html` · `calcularPlan()` L1218/1222 | **(a) todas las órdenes del mes** | `ords.filter(o=>o.fecha&&o.fecha.startsWith(ym))`, `ords=S.ordenes.filter(abierta)` |
| Prendas · ya terminadas (KPI) | ídem L1222/1224 | (a) todas, + subconjunto fase≥8 | `enMes.reduce(...)`; terminadas: `faseNum(o.fase)>=8` |
| Horas de confección (KPI) | ídem L1220/1222 | **(a) todas** (demanda bruta, no lo programado) | `enMes.reduce((a,o)=>a+o.cant*minConf(o),0)/60` — `minConf` usa el SAM de la ruta, no `programar()` |
| Facturación esperada (KPI) | ídem L1223 | **(a) todas** | `enMes.reduce((a,o)=>a+(precioDe(o)||0)*o.cant,0)` |
| En riesgo según el programa (KPI) | ídem L1224 | (a) todas, filtradas por `P.ordenes[id].atraso` | depende de `programar()`, que sí excluye tejeduría no liberada |
| Base del plan: liberadas / sin liberar | `vPlan` L1270-1272 | **(b) liberadas vs (c) sin liberar**, ambas del mismo (a) | `libs=enMes.filter(o=>!bloqueo)`, `porLib=enMes.filter(o=>bloqueo)` |
| **🔴 Meta de facturación del mes: "esperado" (`esp`)** | `vPlan` L1273 | **(b) SOLO liberadas** (sin bloqueo) | `S.ordenes.filter(...&&!(P.ordenes[o.id]||{}).bloqueo)` |
| Capacidad del mes por área | `calcularPlan()` L1227-1230 | `cap`=oferta (no depende de órdenes); `carga`=(a) todo lo que `programar()` colocó (tejeduría si excluye no liberado) | `capDia`/`P.tej`,`P.banos`,`P.pro` |
| Por centro | ídem L1243-1247 | (a) todo lo programado por centro/mes | `P.pro.filter(x=>x.centro===id&&x.dia.startsWith(ym))` |
| Estructura de módulos | ídem L1231-1235 | **(a) todo lo programado, por día calendario del mes (incluye fines de semana si el centro trabaja 6/7 días)** | `P.pro.filter(x=>x.rec===r.id&&x.dia.startsWith(ym))` |
| **🔴 Metas semanales de producción** | ídem L1237 | **(a) lo mismo que arriba, pero solo lunes a viernes** (`semanasLV` descarta sáb/dom de `w.dias`) | `P.pro.filter(x=>x.centro==='modulos'&&w.dias.includes(x.dia))` |
| **🔴 Metas semanales de facturación** | ídem L1238 | (a) todas, agrupadas por **fecha de entrega**, no por fecha de programación | `enMes.filter(o=>o.fecha>=w.ini&&o.fecha<=w.finEnt)` |
| Meta $ vs facturación esperada (%) | `vPlan` L1273-1279 | meta = `S.params.metas[ym]` (número manual); % = `esp/meta` | `esp` es (b) solo liberadas — ver arriba |

**Marcadas en rojo (🔴) las que mezclan o comparan dos poblaciones de forma que puede confundir:**
1. **"Meta de facturación del mes"** compara una meta manual contra `esp` (solo liberadas), mientras el KPI superior de "Facturación esperada" de la misma pantalla usa **todas** las órdenes del mes, liberadas o no. Dos cifras con el mismo nombre conceptual, poblaciones distintas, en la misma pantalla.
2. **"Estructura de módulos" vs "Metas semanales de producción"**: ambas leen `P.pro` del mismo `programar()`, pero la primera suma **todos los días del mes** (incluidos sábados si el área trabaja 6 días) y la segunda **solo cuenta lunes a viernes** (`semanasLV` descarta explícitamente `g===0||g===6`). Con `S.params.cal.pro=6` (producción trabaja sábados), cualquier módulo con producción en sábado mostrará un total mayor en "Estructura" que en "Metas semanales". Verificado hoy en vivo: módulo 1 → **7.412 (Estructura) vs 6.303,85 (Metas semanales)**, una diferencia de ~1.108 piezas, exactamente el patrón que describe la hipótesis del usuario (con otros números, por el desfase de fecha ya explicado).
3. **"Metas semanales de facturación"** reparte por `o.fecha` (fecha de entrega declarada), no por cuándo el programa realmente entrega (`P.ordenes[id].finPro` existe pero no se usa aquí). Si muchas órdenes comparten la misma fecha de entrega, toda la facturación cae en una sola semana y las demás quedan en cero — confirmado en vivo (ver sección 7h).

---

## 5. CÓMO SE CALCULA LA CAPACIDAD

Función `capDia(r,d)` (líneas 564-569), código literal:
```js
function capDia(r,d){const c=CE(r.centro);if(!c)return 0;if(d&&paradaDe(r,d))return 0;
  if(c.area==='tej')return r.horas||0; // horas-máquina; los kg dependen de la tela (kgTela)
  if(c.area==='tin')return r.horas||0;
  // asistencia real del día: si piso la registró para hoy, manda sobre las personas teóricas
  const t=d?(S.turnos||[]).find(x=>x.rec===r.id&&x.d===d):null;const pers=(t&&t.pers!=null)?t.pers:(r.pers||0);
  return pers*(r.min||0)*((r.efic||0)/100);}
```
`capSemana(r,per)` (línea 980) multiplica `capDia` por días laborables del período (`diasLabMes`/`diasLabSem`/`diasDe`, según `GRAN`).

- **¿La eficiencia se aplica a la capacidad, a la demanda, a ambas o a ninguna?** **Solo a la capacidad.** `capDia` la aplica como divisor (`pers*min*(efic/100)`) para los centros de producción. Búsqueda exhaustiva de `efic` en `minPrenda`/`minPrendaR` (líneas 572-578, la parte de demanda): **no aparece ninguna vez** — la demanda (minutos por prenda) no se ajusta por eficiencia en ningún punto del código.
- **¿Existen vacaciones, lactancia y ausentismo en el modelo?** **No, ninguna coincidencia en todo el archivo** para "vacacion", "lactancia", "ausentismo" ni "ausencia". El único mecanismo de ausencia real es `S.turnos[].pers` (asistencia registrada día a día desde Control de piso), que sobreescribe `r.pers` **si existe un registro para ese día concreto** — pero no hay ningún concepto de ausencia programada o planificada (vacaciones futuras, permisos), solo el dato real del día ya ocurrido.
- **¿La eficiencia está por área o por módulo?** Está **por recurso individual** (`r.efic`), no por área ni global — cada módulo/máquina de producción tiene su propio valor en el seed (85% para todos por defecto, editable por recurso en Configuración → Centros y recursos).
- **Unidad de cada tabla:** tejeduría y tintorería en **horas**-máquina (`r.horas`); producción en **minutos**-persona (`pers × min × efic/100`).

---

## 6. CÓMO SE CALCULA LA DEMANDA

El minutaje de una orden **no** sale de una tabla de rutas ni se recalcula en `programar()` desde `samPorCentro` — se congela en `o.ruta[].t` en el momento en que se arma/actualiza la ruta de la orden (evidencia: `samPorCentro`/`opsDe` no se usan dentro de `programar()`, línea 3335 es donde se escribe `p.t` a partir de `samPorCentro`). Es decir, el SAM está **atado a la categoría de la orden en el momento de cargarla**, no "por módulo" — cada módulo aplica su propia velocidad (`r.vel`, `r.mult`, polivalencia) sobre ese mismo minutaje base, vía `minPrendaR(r,centro,t)`.

Dentro de `programar()` (líneas 927-931):
```js
(o.ruta||[]).filter(p=>CE(p.centro)&&CE(p.centro).area==='pro').forEach(p=>{
  const hechas=fe.hechos.includes(p.centro)?o.cant:((av.centros||{})[p.centro]||0);const pend=Math.max(0,o.cant-hechas);
  const tPaso=(p.centro==='estampado'&&o.tecnica)?(tecnicaT(o)||p.t):p.t;
  const minRef=pend*minPrenda(p.centro,tPaso);
  if(minRef<=0){if(tPaso>0)ro.pasos.push({centro:p.centro,min:0,hecho:true,fin:cursor});return}
```
**¿Qué pasa con una orden sin ruta o sin SAM?** Sin ruta (`o.ruta` vacío): el `.forEach` simplemente no itera, no genera filas en `res.pro`, **no hay error**. Con SAM=0 (`minRef<=0`): el paso se salta con `return`, cuenta 0 minutos, tampoco hay error. **Verificado en vivo, septiembre 2026: 0 de 288 órdenes están sin ruta, pero 193 de 288 (67%) no tienen SAM cargado para confección** (`samPorCentro(k).modulos` indefinido) — es decir, dos tercios de las órdenes de septiembre aportan horas de confección en cero o subestimadas al KPI "Horas de confección", sin que la pantalla lo advierta.

---

## 7. RECONCILIACIÓN — datos en vivo del 12-sep-2026 (no coinciden en absoluto con los números citados; ver aviso al inicio)

Con `programar()` real y `calcularPlan('2026-09')` real, hoy: `dem = {ords:288, pz:54597, hconf:1359.92, usd:366668.52, sinPrecio:0, riesgo:0, terminadas:5400}`.

**a) Prendas del mes vs horas de confección — ¿se comparan poblaciones distintas?**
**Confirmado.** `dem.pz` (54.597 hoy) es la suma de `o.cant` de **todas** las 288 órdenes con entrega en septiembre (liberadas o no). `dem.hconf` (1.359,9 h hoy) es la demanda **bruta** de esas mismas 288 órdenes (línea 1220-1222, `minConf(o)` sobre el SAM de la ruta), **no** son horas efectivamente programadas por `programar()` en módulos — de hecho no usa `P.pro` en absoluto para este KPI. La proporción min/prenda que resulta (1.359,9h×60/54.597 ≈ 1,49 min/prenda) es irreal para confección (valores típicos: 5-15 min/prenda) — la causa raíz es la del punto 6: **193 de 288 órdenes de septiembre no tienen SAM cargado**, así que aportan 0 minutos al numerador sin salir del denominador (`pz`), deflactando el promedio.

**b/c) Corte (9.910 pz) vs Confección/módulos (22.175 pz) vs Empaque (25.530 pz), datos de hoy.**
Confirmado que **Empaque > Confección > Corte**, mismo patrón que reporta el usuario. Causa raíz (evidencia del agente que auditó `programar()`, sección 8 de su informe): **no existe ningún mecanismo que iguale piezas entre centros consecutivos de la misma ruta.** Cada centro de `c.centros` (línea 1243-1247) cuenta `P.pro` filtrado por `x.dia.startsWith(ym)` **de forma independiente**: un pedido cuyo Corte se programó en agosto y cuyo Empaque cae en septiembre (por el desfase natural corte→confección→empaque, cada uno con su propio `cursor` de fecha) aporta piezas a Empaque de septiembre sin haber aportado a Corte de septiembre — la comparación "Corte de septiembre" contra "Empaque de septiembre" mezcla cohortes de pedidos en etapas distintas de su propio calendario, no la misma población de órdenes.

**d) Órdenes de septiembre con ruta completa vs sin ruta.**
288 con ruta, **0 sin ruta**, verificado. Todas las órdenes de septiembre tienen `o.ruta` no vacío.

**e) Referencias de septiembre con SAM cargado vs sin SAM.**
**193 de 288 (67%) sin SAM** para el centro `modulos` (confección). Primeras 20 (de 193) por código de orden: `WH/MO/27145, WH/MO/27146, WH/MO/27183, WH/MO/27184, WH/MO/27603, WH/MO/27604, WH/MO/27607, WH/MO/27608, WH/MO/27634, WH/MO/27635, WH/MO/27747, WH/MO/27748, WH/MO/27763, WH/MO/27791, WH/MO/27796, WH/MO/27895, WH/MO/27919, WH/MO/27931, WH/MO/27956, WH/MO/27977` (lista completa disponible bajo pedido, no se incluyen las 193 por espacio).

**f) Módulo 1: Estructura de módulos vs Metas semanales, datos de hoy.**
`c.mods` (Estructura, `pz` = todo el mes, incluidos sábados) → **7.412** piezas. `c.metas` (Metas semanales, solo lunes-viernes) sumado en sus 5 semanas → **6.303,85** piezas. Diferencia ≈ 1.108 piezas. Consulta A (Estructura): `P.pro.filter(x=>x.rec==='mod1'&&x.dia.startsWith('2026-09'))`. Consulta B (Metas): la misma lista, pero agrupada solo en los días que `semanasLV('2026-09')` incluyó en `w.dias` (excluye explícitamente sábado y domingo, línea 1214: `if(g===0||g===6)continue`). La diferencia es exactamente la producción de módulo 1 programada en sábados de septiembre (el área `pro` trabaja 6 días/semana, `S.params.cal.pro=6`).

**g) Planta (producción total en Metas semanales) vs Confección (Estructura de módulos), datos de hoy.**
Planta (suma de `prod` de todos los módulos en las 5 semanas) = **18.850,6** piezas. Confección total en Estructura de módulos = **22.175** piezas. Mismo mecanismo del punto (f): Planta-en-metas excluye sábados, Confección-en-estructura los incluye — la diferencia (~3.325) es la producción de todos los módulos programada en sábados de septiembre.

**h) Metas semanales de facturación en cero — ¿qué las deja fuera?**
**Causa raíz encontrada y confirmada con datos reales: las 288 órdenes de septiembre tienen TODAS, sin excepción, la misma fecha de entrega: `2026-09-28`.** Verificado con `Object.entries(porFecha)` sobre las 288 órdenes: una sola fecha, un solo grupo de 288. Como "Metas semanales de facturación" reparte por `o.fecha>=w.ini && o.fecha<=w.finEnt` (línea 1238), toda la facturación cae en la única semana que contiene el 28 (el tramo 28-30 sept) y las otras cuatro semanas del mes muestran 0 órdenes, 0 piezas, $0 — no es un bug de la consulta, es que la fecha de entrega real en la base es idéntica para todo el mes. Ejemplo de tres órdenes reales: `WH/MO/27145` (Aero Dep, 201 pz, fecha 2026-09-28), `WH/MO/27146` (ídem), `WH/MO/27183` (Aero Dep, 261 pz, fecha 2026-09-28). Esto es altamente atípico para datos reales de distintos clientes y sugiere fuertemente un defecto de carga: el código de importación de órdenes (`demo()`/carga masiva) tiene un *fallback* explícito `fecha:/^\d{4}-\d{2}-\d{2}$/.test(fec)?fec:dsum(hoy(),21)` que estampa "hoy+21 días" cuando no reconoce la fecha real del archivo importado — **NO DETERMINADO con certeza absoluta que este fue el mecanismo exacto** (no tengo el archivo de carga original para confirmarlo), pero la coincidencia (fecha única, redonda, igual para 288 órdenes de distintos clientes) es la señal clásica de un valor por defecto, no de datos reales.

**i) Meta $55.000 vs facturación esperada — ¿contra qué se compara?**
Meta manual guardada: `S.params.metas['2026-09'] = 55.000`. Facturación "esperada" (`esp`, línea 1273) hoy = **$249.388,35** (solo órdenes de septiembre **sin bloqueo** de liberación) → 249.388/55.000 ≈ **453%** hoy (438% en la observación original del usuario; la diferencia es por el mismo drift de datos). Confirma la hipótesis: la meta ($55.000) es una cifra pequeña cargada manualmente en algún momento, probablemente antes de tener el volumen real de septiembre cargado, y nunca se actualizó — el 400%+ no es un error de cálculo, es una meta desactualizada comparada contra un mes que ahora tiene mucho más volumen del que tenía cuando se puso la meta.

**j) Días laborables: ¿producción/tintorería trabajando domingos es dato o bug?**
**Verificado hoy en vivo, con `dow()`/`labR()` reales: NO es un bug — el calendario excluye domingo correctamente.** `S.params.cal = {"pro":6,"tej":5,"tin":6}`. Para las fechas de septiembre 2026: 5, 12, 19, 26 son **sábado** (`dow=6`) y `labR` da `true` para pro/tin (correcto: calendario de 6 días incluye sábado) y `false` para tejeduría (5 días); 6, 13, 20, 27 son **domingo** (`dow=0`) y `labR` da `false` para las tres áreas, sin excepción. Hoy no hay ninguna excepción registrada para septiembre 2026 (`S.params.excepciones` filtrado a ese mes = 0 filas) que fuerce trabajo en domingo. **No pude reproducir "domingos 05, 06 y 13 trabajando"** con el estado actual del calendario — es posible que (1) el usuario haya visto una excepción puntual que ya fue retirada, (2) haya interpretado el sábado 05 (que sí trabaja, por diseño, en el calendario de 6 días) como domingo, o (3) el calendario `S.params.cal.pro`/`tin` tuviera un valor distinto (p. ej. 7) en el momento de su observación y se corrigió después. **NO DETERMINADO** cuál de las tres es la explicación real, porque no hay una bitácora de cambios de `S.params.cal` que permita reconstruir su valor histórico.

---

## 8. CÓMO SE PROGRAMA

`programar()` (líneas 702-958) tiene tres fases, en este orden literal por comentarios del propio código:
1. `/* 1 · Tejeduría: una corrida por tela (todos los kilos pendientes juntos, sin cambios entre órdenes) */` (línea 732)
2. `/* 2 · Baños: por color... */` (línea 764)
3. `/* 3 · Producción según ruta */` (línea 919)

Las órdenes se ordenan (línea 727-728) por prioridad de orden, luego prioridad de centro, luego fecha de entrega (FIFO).

**¿Reparte carga en el tiempo o solo agrupa por fecha de entrega?** Reparte de verdad: usa `fluir()` (línea 709), que consume minutos/horas de un recurso avanzando día a día desde una fecha de inicio, respetando la capacidad diaria real (`capDia`) y las paradas/calendario.

**¿Programa hacia atrás desde la entrega?** **No, en producción programa estrictamente hacia adelante** desde que la tela/tinte está lista (`cursor` arranca en `ro.finTin` o `telaDesde`, línea 925, y avanza centro por centro, línea 953: `cursor=x.fin`). La fecha de entrega (`o.fecha`) solo se usa al final para marcar atraso (línea 955: `ro.atraso=ro.finPro>o.fecha`), no para dirigir el cálculo. (Tejeduría y tintorería sí calculan una fecha "requerida" hacia atrás para *priorizar* corridas, pero eso es distinto de programar la producción hacia atrás.)

**¿Respeta el desfase corte → estampado/bordado → confección → servicios → empaque?** Sí, vía el mismo `cursor` secuencial: un centro no puede empezar antes de que termine el anterior de la ruta. Pero (ver sección 7b/7g) **cada centro calcula sus propias piezas/día de forma independiente** — no hay igualación de volumen entre centros consecutivos, solo secuenciación de fechas.

**¿Qué hace con una orden que no cabe en el mes?** **No hay límite de horizonte para producción.** `tinHorizonteDias` (que sí limita tintorería) no se usa en la fase de producción; el único límite en `fluir()` es un `guard++<400` puramente defensivo (evitar bucle infinito), no una regla de negocio. Una orden sigue programándose en los meses siguientes sin tope.

**¿Por qué las metas semanales concentran todo en una semana?** Confirmado en la sección 7h: las 288 órdenes de septiembre comparten una única fecha de entrega (28-sep-2026), y el reparto semanal de facturación usa esa fecha literal, no la fecha en que el programa realmente entrega (`P.ordenes[id].finPro` existe pero no se usa en esta tabla).

---

## 9. LO QUE ESTÁ A MEDIAS

- **193 de 288 órdenes de septiembre (67%) sin SAM de confección cargado** — el KPI "Horas de confección" y todo lo que depende de él (min/prenda, capacidad vs demanda) está sistemáticamente subestimado mientras esto no se corrija.
- **Las 288 órdenes de septiembre comparten una fecha de entrega idéntica (2026-09-28)** — con altísima probabilidad un valor por defecto de la carga, no un dato real; invalida por completo la tabla "Metas semanales de facturación" tal como está hoy.
- **Meta de facturación mensual ($55.000) claramente desactualizada** frente al volumen real cargado (~250-370 mil hoy) — nadie la ha vuelto a tocar desde que se cargó el volumen actual.
- **La tabla `rutas` (64 registros) es un catálogo visual sin conexión con el flujo real** de asignación de ruta a una orden (que usa `armarRuta()` con reglas fijas en código). Mantenerla actualizada no tiene ningún efecto en la programación.
- **`o.lib` no tiene fecha límite ni se compara contra el `req` calculado por el motor** — la app no puede avisar "esto se liberó tarde" de forma automática, solo muestra el `ts` del clic.
- **No existe ningún concepto de vacaciones, lactancia o ausentismo planeado** — la única fuente de ausencia es el turno real ya registrado (`S.turnos`), día a día, después del hecho.
- **Ningún mecanismo iguala piezas/día entre centros consecutivos de una misma ruta** — es normal y esperado, por diseño actual, que Corte/Confección/Empaque de un mismo mes muestren totales que no cuadran entre sí para pedidos que están a medio camino en su propia ruta.
- **"Estructura de módulos" y "Metas semanales de producción" leen la misma fuente (`P.pro`) con dos filtros de días distintos** (mes completo vs. solo lunes-viernes) sin que la pantalla lo explique — el usuario ve dos números "totales" que no deberían coincidir, y no hay ninguna nota que lo aclare.
- **NO DETERMINADO** si existe documentación o capacitación que explique a un planificador nuevo el orden de uso de las pantallas (sección 1) — no encontré nada de esto en el código, solo puede inferirse de las dependencias de datos.
- **NO DETERMINADO** el origen histórico exacto del comportamiento de calendario en domingos que reportó el usuario (sección 7j) — no hay bitácora de cambios de `S.params.cal`/`excepciones` que permita reconstruirlo.
- **NO DETERMINADO** si hay pantallas que muestren valores hardcodeados de prueba — no encontré ninguno en las funciones auditadas (`vPlan`, `planMesHTML`, `calcularPlan`, `programar`), pero no se auditó el 100% de las ~3.480 líneas del archivo, así que no puedo afirmar que no exista ninguno en otra pantalla no revisada en este informe (por ejemplo, Categorías, Operaciones o Configuración no se auditaron línea por línea en su totalidad, solo su estructura de datos).

---

## LAS 10 INCONSISTENCIAS MÁS GRAVES, POR IMPACTO

| # | Inconsistencia | Causa raíz |
|---|---|---|
| 1 | Las 288 órdenes de septiembre comparten una única fecha de entrega (28-sep) | Muy probable valor por defecto de la carga de órdenes, no dato real; invalida toda la tabla de metas semanales de facturación del mes |
| 2 | 67% de las órdenes de septiembre sin SAM de confección | Categoría/operación de la orden sin `sam` cargado en `k.ops`/`operaciones`; subestima horas de confección y todo indicador derivado |
| 3 | "Facturación esperada" (KPI) y "esperado" de Meta de facturación son números distintos con el mismo nombre | El primero usa todas las órdenes del mes; el segundo, solo las liberadas (sin `bloqueo`) — poblaciones distintas, mismo rótulo |
| 4 | Meta de facturación mensual ($55.000) desfasada ~400-450% del volumen real | Meta manual nunca actualizada tras crecer el volumen de órdenes cargadas |
| 5 | Corte < Confección < Empaque del mismo mes calendario | Cada centro cuenta piezas de `programar()` de forma independiente; sin fecha común de cohorte, se mezclan pedidos en distintas etapas de su propio pipeline |
| 6 | "Estructura de módulos" vs "Metas semanales de producción" no coinciden para el mismo módulo | Mismo dato (`P.pro`), un filtro cuenta 7 días de la semana y el otro solo 5 (excluye fines de semana) sin advertirlo en pantalla |
| 7 | "Planta" (Metas semanales) vs total de Confección (Estructura de módulos) no cuadran | Mismo mecanismo del punto 6, agregado a nivel de toda la planta |
| 8 | La app no compara la fecha real de liberación contra ninguna fecha límite calculada | `o.lib` solo guarda el timestamp del clic; el `req` calculado por `programar()` nunca se contrasta con él |
| 9 | La tabla `rutas` de Supabase no tiene ningún efecto en la ruta real de una orden | La ruta se arma con reglas fijas en código (`armarRuta`), la tabla es solo un catálogo visual desconectado |
| 10 | No existe modelo de eficiencia para tejeduría/tintorería, ni ausentismo planeado en ninguna área | `efic` solo existe y se aplica en recursos de producción; vacaciones/lactancia/ausentismo no están en el modelo de datos en ningún punto |

---

*Fin del informe. No se modificó ningún archivo del sistema ni ningún dato de la base durante esta auditoría — todas las consultas de la sección 7 fueron lecturas (`S.ordenes`, `programar()`, `calcularPlan()`) ejecutadas en la sesión ya autenticada, sin escritura.*
