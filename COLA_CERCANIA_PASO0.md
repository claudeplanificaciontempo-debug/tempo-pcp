# Cola de programación por cercanía — PASO 0 (escaneo, sin construir)

**16-sep-2026.** Escaneo del repo contra los seis puntos. **No se construyó nada** y no se tocó la
nivelación. Todo lo de abajo es `index.html` salvo donde diga otra cosa.

## Resumen

| # | Qué | Estado | Dónde |
|---|---|---|---|
| 1 | Cola del centro y su criterio de orden | **existe**, pero ordena por puesto manual → inicio programado → entrega. **Cercanía: no existe** | `colaCentro` · `filasDeCentros` · `vCentro` |
| 2 | Paso anterior en la ruta | **existe y es exacto** | `centroAnteriorPro` · `pasosProDe` · `secuenciaCentro` |
| 3 | Saber si un paso terminó | **existe**, con tres fuentes y una precedencia ya definida | `pasoHecho` · `faseEstado0` · `cierreCentro` |
| 4 | Fecha fin programada del paso | **existe, al DÍA** (nunca hora) | `programar()` → `ro.pasos[].fin` |
| 5 | Llegada en horas | **no existe en ningún centro**; el dato llega en el archivo y **se descarta al cargarlo** | `excelFecha` |
| 6 | Foto, ODC y fase reutilizables | **foto y fase sí** (`whCell`); **ODC no está en `whCell`** | `whCell` · `fotoMini` · `faseTag` · `filasGRP` |

**Lo bueno:** los tres ingredientes duros ya existen y están probados — el paso anterior, si terminó y
la fecha programada. **Lo que falta es solo la clasificación y el orden**, más la columna ODC.
**Lo que no se puede dar hoy son las horas.**

---

## 1 · La cola del centro: qué la arma y cómo ordena

**Pantalla:** `vCentro(el)` → pestaña `CEN.tab==='prog'` («Programación»), el bloque
`<div class="panel cola">` titulado «Cola de \<centro\>».

**La arman dos funciones:**

`filasDeCentros(cens,P,lun,dom,q)` — construye las filas. Ya filtra **solo órdenes que tienen ese
centro en su ruta**:

```js
const enRuta=(o.ruta||[]).some(p=>p.centro===c); if(!enRuta)return;
```

Devuelve `{o, c, paso, hecho, pzSem, hechas, bloq}`, donde `paso` es el paso del centro dentro de
`P.ordenes[o.id].pasos`.

`colaCentro(c,filas)` — filtra y ordena. **Este es el criterio de hoy, en este orden:**

1. **Puesto manual** (`puestoDe` = `o.progCentro[c].pri`); sin puesto → `SIN_PUESTO`.
2. **Inicio programado** del paso en este centro (`paso.ini`).
3. **Fecha de entrega** de la orden (`o.fecha`).

```js
function colaCentro(c,filas){return filas.filter(f=>f.c===c&&!f.hecho&&!f.bloq)
  .sort((a,b)=>(puestoDe(a.o,c)||SIN_PUESTO)-(puestoDe(b.o,c)||SIN_PUESTO)
    ||((a.paso.ini||'9')<(b.paso.ini||'9')?-1:…)||((a.o.fecha||'')<(b.o.fecha||'')?-1:1))}
```

**Ahí está el problema que describes:** el segundo criterio es el **inicio programado en este centro**,
no la cercanía de la orden a llegar. Una orden en `0Recetas Insumos` con inicio programado temprano
sale antes que una que ya terminó corte y está esperando en la puerta.

**`colaCentro` se usa en cinco sitios** y todos heredarían el orden nuevo:
`tabletFilas` (Mi centro, línea 1981), el consolidado de sub-centros (2326), `moverEnCola` (5951),
`ordenarColaPorColor` (6212) y `vCentro` (6270-6271).

**Lo que sí existe ya y se parece:**

- **`listasNoProgramadas(c,P,hasta)`** + su panel: órdenes cuyo paso anterior **ya cerró** pero que el
  motor programa más adelante o sin fecha. Es el caso 1 («disponible») **parcial**: solo cuenta el
  cierre de piso (`cierreCentro`), no la fase ni las OT, y solo muestra las **no** programadas.
- **`secuenciaCentro(o,c)`** (usado por `estadoOrdenCentro` en **Mi centro**, no en el centro):
  devuelve **`disponible` | `proxima` | `sinSecuencia`** contando los pasos pendientes de la ruta.
  **Es exactamente la clasificación 1/2/3 que pides, ya escrita y probada — pero no llega a `vCentro`.**
- **`dondeEstaCentro(o,P,c)`**: pinta un color por cercanía (mismo centro / 1 paso / 2 pasos / lejos),
  pero es solo un color en «Carga general», no ordena nada.

**Columnas de la cola hoy:** Puesto · OP · Cliente · Categoría · Color · Pendientes · Min · Recurso ·
Arranca · Plan: inicio → fin · Marca · acciones. **No hay ODC ni «cuándo llega».**

**Prioridad manual:** vive en `o.progCentro[c].pri`, se mueve por arrastre (`arrastrarCola`/`soltarCola`)
o escribiendo el puesto, y `moverEnCola` **renumera la cola completa 1..n** y la guarda. El supervisor
de piso la manda por rpc (`set_prioridad_centro`). Hoy el puesto manual es **el primer criterio**, así
que un orden inicial por cercanía encajaría **debajo** de él sin tocarlo — que es lo que pides.

---

## 2 · El paso anterior en la ruta

**Existe y es exacto.**

```js
function centroAnteriorPro(o,c){
  const ru=(o.ruta||[]).filter(p=>CE(p.centro)&&CE(p.centro).area==='pro').map(p=>p.centro);
  const i=ru.indexOf(c); return i>0?ru[i-1]:null}
```

Toma la ruta **de la orden** (no una secuencia global), solo los centros de **producción**, y devuelve
el inmediatamente anterior. `null` si el centro es el primero o no está.

Alrededor:

- `pasosProDe(o)` — la lista de centros de producción de la ruta.
- `pasosRutaDe(o)` — lo mismo sin repetidos.
- `centroSiguiente(o,c)` — el de después.
- `cantCentro(o,c)` — **retrocede** por la ruta hasta el último paso **cerrado** para saber cuántas
  prendas le llegan de verdad al centro.
- `ordenPaso(c)` / `RUTA_ORDEN` — un orden global de referencia, solo para ordenar listas.

**Dos casos que `secuenciaCentro` ya contempla y hay que respetar:**

1. **El centro aparece dos veces en la ruta** → `sinSecuencia`, «no se sabe cuál de las dos es».
   `centroAnteriorPro` usa `indexOf`, o sea **siempre la primera**: es una diferencia real entre las
   dos funciones y habría que decidir cuál manda.
2. **Tramo no secuencial** (estampado/bordado/confección): si el grupo de fases tiene
   `secuencial===false` y todo lo pendiente es del mismo tramo, `secuenciaCentro` lo da por
   **disponible** — porque el orden real lo dan las OT de Odoo, no la ruta. Sin eso, media planta
   saldría como «lejana» por error.

---

## 3 · Cómo se sabe que un paso terminó — y cuál manda

**Existe, con tres fuentes.** `pasoHecho(o,c,fe)` es la única puerta (reemplazó al patrón viejo
`fe.hechos.includes(c)||ac[c]>=o.cant` en motor, colas y pantallas):

```js
function pasoHecho(o,c,fe){
  if(pasoCerrado(o,c))return true;                       // 1 · cierre de piso
  fe=fe||faseEstado(o.fase,o); if((fe.hechos||[]).includes(c))return true;  // 2 · OT / fase de Odoo
  const ac=(S.avance[o.id]||{}).centros||{};
  return (ac[c]||0)>=(+o.cant||0)}                       // 3 · unidades completas
```

**Es un OR de tres fuentes** — cualquiera de las tres lo da por terminado. Dentro de la segunda hay una
precedencia explícita y ya decidida:

| Fuente | Dato | Quién gana |
|---|---|---|
| **Cierre del paso (app de piso)** | `avance[oid].cierres[c]` con `{pz,cant,faltan,motivo,u,ts}` | Si existe y no está reabierto, **termina el paso** |
| **Orden de trabajo de Odoo** | `o.ot[c].estado` | **Manda sobre la fase**: `terminado` → hecho aunque la fase no lo diga; `en proceso`/`para hacer` → **pendiente aunque la fase lo diera por hecho** |
| **Fase de Odoo** | tabla de fases (grupo, `desde`, `excluye`, `sinCarga`) | El punto de partida, lo pisa la OT |
| **Unidades registradas** | `avance[oid].centros[c] >= o.cant` | También lo da por hecho |

En `faseEstado0`, textual del código:

> «la orden de trabajo manda: terminado → hecho aunque la fase no lo diga; en proceso / para hacer →
> pendiente aunque la fase lo diera por hecho»

**Cuando no coinciden, ya se reporta:** `aplicarOT` cuenta las **contradicciones fase vs OT** y las
guarda en `S.params.otCarga.contradicciones`; se ven en Órdenes → Reporte OT («gana la OT, se
reportan»). Y al revés, cuando el piso cierra pero la fase no se movió, están `cierresSinFase()` /
`cierresSinFaseHTML()` y la bandeja `cierreSinFase` de Hoy.

**Para esta función eso importa:** «el paso anterior ya terminó» debe usar `pasoHecho` tal cual, para no
crear una cuarta definición.

---

## 4 · La fecha fin programada de cada paso

**Existe, y vive en un solo sitio:** `programar()` la deja en `P.ordenes[oid].pasos[]`:

```js
ro.pasos.push({centro, min, rec, ini, fin, limite})
```

- `ini` / `fin` — día de inicio y de fin del paso en el programa.
- `limite` — el día en que **tenía** que terminar para que la orden llegue a su meta (lo usa
  `diagAtraso` para «este paso va tarde»).
- Si el paso no se pudo colocar: `{centro, min, error:'sin recurso'…}` — **sin `ini` ni `fin`**.
- Si ya está hecho: `{centro, min:0, hecho:true, fin:cursor}`.

**Detalle: al DÍA, nunca a la hora.** Lo produce `fluirAtras(r,q,hasta,tag,dry)` (motor hacia atrás,
vigente) avanzando con `antLabR(dsum(d,-1),r)` — cadenas `YYYY-MM-DD`. El reparto diario es
`det=[{dia,q}]` y alimenta `P.pro` (día × centro × prendas). **En ningún punto del motor hay hora.**

Los días hábiles del motor salen de **`labR(d,r)`** (por recurso, con las excepciones del calendario) y
**`dsumLab`** (plazos). Como acabo de dejar por escrito en la nivelación: `dsumLab` es un **plazo**
(«n días hábiles después»), y para contar un tramo con los dos extremos incluidos están `finLabInc` /
`diasHabilesInc`. Para «en X días» hay que decidir cuál de las dos convenciones se usa y escribirla.

**El caso «sin programar» ya se distingue:** `paso.ini`/`paso.fin` vienen `undefined` y las pantallas ya
lo pintan como «sin fecha en el programa» (`listasNoProgramadasHTML`). No hay estimados silenciosos.

**El caso «atrasado» también se puede derivar:** `paso.fin < hoy()` y `!pasoHecho(o,centroAnterior)`.
Hoy nadie lo calcula así — `diagAtraso` compara `paso.fin` contra `paso.limite`, que es otra cosa
(«este paso va tarde» respecto de la meta de la orden, no «la fecha ya pasó y no terminó»).

---

## 5 · Llegada en horas: **no es posible hoy, en ningún centro**

Y el motivo es concreto, no «falta desarrollarlo»:

**a) El programa no tiene horas.** El motor trabaja en días (punto 4). No existe hora de entrada, de
salida ni de turno por centro. Lo único con hora en configuración son las **ventanas de descanso**
(tabla 18, `S.params.horarios[c].ventanas[{ini,fin}]`) — y `centrosSinDescansos()` las reporta
**vacías en todos los centros de producción**. Aun llenas, son solo pausas, no una jornada.

**b) El archivo de OT SÍ trae la hora y el sistema la tira.** En `ot_rows.json` (27.336 filas) las
columnas *Fecha de inicio* y *Fecha final* son seriales de Excel **con fracción de día**:

```
"WH/MO/22918","CORTE Y BODEGA",35.6,46020.72358796297,46020.74831018518,"CORTE",191,263,"Terminado"
```

`46020.7235…` ≈ 17:22. Pero el cargador las pasa por `excelFecha`, que **redondea y corta a 10
caracteres**:

```js
if(typeof v==='number')return new Date(Date.UTC(1899,11,30)+Math.round(v)*864e5).toISOString().slice(0,10);
```

Así que `o.ot[c].ini` y `o.ot[c].fin` quedan en `YYYY-MM-DD`. **La hora se pierde al cargar.**

**c) Lo real de piso sí tiene hora**, pero es pasado, no pronóstico: `avance[oid].tramos[].ini/.fin`
(ISO con hora, segundos incluidos), `cierres[c].ts` y `tallasLog[].ts`.

**Conclusión honesta:** «llega hoy a las 15:30» **no se puede decir hoy en ningún centro**. Lo que sí se
puede decir sin inventar nada es **hoy / mañana / en X días hábiles / sin programar / atrasado X días**.
Para llegar a horas harían falta tres cosas que hoy no existen: conservar la hora al cargar las OT,
una jornada por centro, y un motor que coloque dentro del día. **Recomiendo entregar sin horas** y
dejar la puerta abierta; no aparento una precisión que el dato no tiene.

---

## 6 · Componentes reutilizables

| Qué | Función | Estado |
|---|---|---|
| Foto + WH + fase + cierre | **`whCell(o,px)`** = `fotoMini(o,px)` + `o.op` + `faseTag(o)` + `tagCierre(o)` | **existe**, es el estándar de toda lista de órdenes |
| Foto sola | `fotoMini(o,px)` | existe |
| Etiqueta de fase, clicable | `faseTag(o)` → `mCambiarFase` | existe |
| Lista agrupada colapsable | **`filasGRP(id,items,filaFn,nCols,oDe,pzDe)`** + `grpSelHTML(id)` | existe; la cola del centro **ya lo usa** (`filasGRP('cen',…)` con `todoAbierto=true`) |
| Campos de agrupación | `GRP_CAMPOS` (getter desde la tabla 17) — incluye **ODC**, fase, cliente, tipo de producto, color, mes, próximo paso | existe |
| Marca de atraso, una sola | `marcaCentroUna(o,P,c)` sobre `diagAtraso` | existe |
| «lista para empezar» | `tagListaEmpezar(o,c)` | existe |
| Dónde está, con color por cercanía | `dondeEstaCentro(o,P,c)` / `dondeEstaEnCentro` | existe |

**La única pieza que falta: la ODC en la fila.** `whCell` **no** la incluye. El dato está
(`o.odc`, más `o.odcManual` de `asignarODC`) y se usa para buscar (`valBusq`) y para agrupar, pero
ninguna lista lo muestra como columna. Dos caminos:

- **a)** columna ODC propia en la cola — no toca nada más;
- **b)** meterla en `whCell` — la vería **toda** la app de golpe (Liberación, Control de piso,
  Tintorería, Plan…). Más consistente, pero es un cambio ancho.

**Recomiendo (a)** para esta entrega y dejar (b) como decisión aparte.

---

## Lo que faltaría construir (para que decidas)

1. **`cercaniaCentro(o,c,P)`** — una sola función que devuelva
   `{grupo: 'disponible'|'porLlegar'|'lejana', pasosPend, llegada, txt, estado}`, apoyada en
   `secuenciaCentro` (que ya clasifica), `centroAnteriorPro` y `pasoHecho`. **Sin crear una segunda
   definición de nada.**
2. **La fecha de llegada** = `fin` del paso anterior en `P.ordenes[oid].pasos`, con los tres casos:
   `sin programar` (no hay `fin`), `atrasado X días` (`fin < hoy` y el paso anterior no terminó), y
   `hoy` / `mañana` / `en X días` contados en hábiles.
3. **El orden de `colaCentro`**: meter la cercanía como criterio **después** del puesto manual, para
   no tocar lo que ya priorizó el usuario. Afecta a los cinco llamadores — hay que mirar qué pasa en
   Mi centro y en `moverEnCola`, que renumera contra el orden que ve.
4. **El umbral de «lejana»**, configurable (pasos o días) en Configuración, con `prm()`, **sin número
   en el código**.
5. **Las lejanas agrupadas y colapsadas** con `filasGRP`.
6. **Columna ODC** en la cola.

## Preguntas antes de construir

1. **El umbral de lejanas: ¿en pasos o en días?** Sugiero **pasos pendientes** (más estable que una
   fecha que se mueve cada vez que corre el motor) con **2** de valor inicial, y que el parámetro
   permita cambiar a días.
2. **Una orden «disponible» pero con el paso anterior cerrado con faltante** (salieron 80 de 100):
   ¿va igual en el grupo 1, con la marca de cuántas llegaron?
3. **Una orden sin el paso anterior programado y sin cierre** — ni disponible ni con fecha:
   ¿grupo 2 con «sin programar», o un cuarto grupo aparte?
4. **`sinSecuencia`** (el centro aparece dos veces en la ruta, o la orden no tiene ruta):
   ¿grupo propio visible, o al final con las lejanas? Sugiero **grupo propio**: es una brecha de datos,
   no una orden lejana.
5. **Las horas: confirmo que van fuera** de esta entrega, por el punto 5.
6. **¿La ODC va solo en la cola, o en `whCell` para toda la app?**

**No construyo nada hasta tu aprobación.**
