# Maquila por descarte · plan del mes unificado · personas y horas · el tambor — 21-sep-2026

**Decisiones de la usuaria (noche del 20-sep):**
1. «Maquila puede hacer todo por defecto, pero nosotros vamos a llenar primero nuestros módulos y de ahí vamos a llenar con las
   unidades que nos faltan lo de maquila.»
2. «El plan del mes viene de la base de la nivelación; si podemos unificarlo, no vamos a confundirnos.»
3. «Las horas del escenario de las personas, sí; y eso debería guardarse, igual que los días; y si vamos a aumentar personas, también.»
4. «Como los módulos son el tambor, ahí sí necesitamos ver qué tipo de producto está cargado en el módulo.»

Todo en Dirección → Planificar el mes → paso 1 (Nivelación), salvo la configuración del orden de descarte (Configuración → Nivelación).

---

## 1 · Maquila = lo que no cabe en la planta

**Antes:** el motor trataba a la maquila como un módulo más (la llenaba por fecha, como a cualquier módulo); el recuadro «Maquila»
de la nivelación contaba «por fase» y decía «sin fases marcadas · dato faltante».

**Ahora:**
- **La decisión, en la nivelación.** El recuadro **Maquila** dice **«hay que mandar N u»** = el déficit de Confección del período
  (saldo − lo que cabe en los módulos con los días del calendario y las personas/horas del escenario), convertido a **órdenes
  enteras** y repartido **por familia en el orden configurado**. Al tocarlo: tabla por familia (órdenes, unidades, horas), la lista
  de órdenes propuestas (las de entrega más lejana primero: son las que no alcanzan a salir en planta), un motivo y el botón
  **«Mandar las marcadas a maquila»**. Si todo cabe: «✓ no hace falta». Si Confección no puede calcularse: «? falta un dato» con la
  causa. Debajo, «Ya en maquila» con «devolver a planta».
  Funciones: `maquilaDescarte()` (lee `nivUICalcular('modulos')`; no calcula nada nuevo), `maquilaDetalleHTML`, `enMaquilaHTML`,
  `marcarMaquila(ids,motivo)` (permiso `programa`, confirmación, `o.recursoFijo.modulos='maquila'`, auditoría tipo `maquila`,
  bitácora), `quitarMaquila(id,motivo)` (confirmación + motivo; en la lista GUARDIA), `ordenesEnMaquila()`.
- **El orden de descarte, configurado.** Configuración → Nivelación → **«Qué mandamos primero a maquila»**: una fila por familia,
  sembrada **una vez** desde la polivalencia media de los módulos (menor polivalencia = primero a maquila; sin dato = al final),
  marcada **sugerido** hasta que una persona la confirme; ▲▼ para mover, casilla **«No mandar a maquila»** (esa familia se queda en
  planta aunque no quepa: la nivelación lo muestra como horas sin cubrir). Familias nuevas se agregan al final marcadas «nueva».
  `S.params.maquilaOrden[]={fam,noMandar,sugerido,poli}`, `maquilaOrden()` (lista viva), `moverMaquilaOrden`, `setMaquilaNoMandar`,
  `confirmarMaquilaOrden`, `maquilaOrdenHTML`; todo con bitácora.
- **La ejecución, en el motor (cambio de una línea, autorizado por la decisión 1).** En `programar()`, al elegir candidatos para
  Confección, **la maquila ya no es candidata salvo que la orden esté marcada a maquila** (recurso fijo). Está detrás del parámetro
  **`maquilaPorDescarte`** (casilla «La maquila solo recibe lo que se le marca» en la misma tabla; apagarlo devuelve el
  comportamiento anterior). `saldoProceso` ya descontaba del saldo de planta lo marcado a maquila (decisión 17-sep), así que al
  mandar una orden la nivelación de Confección baja y el recuadro Maquila la cuenta en «ya marcadas».
- **Sin fecha de entrega de maquila:** como las maquilas no entregan a fecha fija ni se conoce su capacidad, la nivelación solo dice
  **cuántas unidades mandar y de qué familia**; no promete un día.

## 2 · El plan del mes parte de la misma base que la nivelación

**Antes:** el plan (paso 2) partía de las órdenes «en proceso» por fase (tabla 5, de cualquier mes) y «Agregar» servía para meter
las demás; la nivelación (paso 1) miraba todo lo pendiente con entrega en los meses elegidos. Dos criterios de «qué es el mes».

**Ahora:** `planBase(ym)` = **toda orden abierta con fecha meta en el mes o antes** (`enBasePlan`: lo pendiente de meses anteriores
+ el mes, la misma base que el paso 1), menos las **quitadas**. «Agregar órdenes al plan» queda **solo para excepciones**: jalar del
mes siguiente, órdenes **sin fecha** (casilla nueva) y devolver una quitada. **«Quitar»** funciona también sobre la base: la orden
queda anotada en `planMes[ym].quitadas` (nada se borra) y aparece en Agregar con la marca «quitada». Las órdenes **en proceso con
entrega posterior** al mes ya no entran al plan: se informan («N órdenes en proceso con entrega después de octubre ya ocupan los
centros»), porque el programa y la capacidad sí las cuentan. Congelar sigue guardando `planMesOidsTot` (base ∪ agregadas). La
columna «en proceso» de la tabla 5 ya no decide el plan (`enProcesoFueraDelMes` la usa solo para informar).

## 3 · Personas Y horas por día en el escenario

La tabla «Personas y horas en <centro>» trae dos grupos de columnas: **Personas** y **Horas por día** (8 normal; 9 con una hora
extra; se aceptan medias horas), cada uno con configurado · vigente · escenario. Las horas se escriben en horas y se guardan como
**minutos por día** del ajuste de la semana (`min`, el campo que ya existía junto a `pers`): `nivCapSet(ym,rec,'min'|'pers',v)`
(`nivPersSet` sigue como atajo). «Confirmar escenario» graba las dos con motivo y bitácora (`guardarAjustesCap` ya lo hacía) y
desde ahí `capDia` —programa, plan, carga, nivelación— calcula con ese valor. Aumentar personas ya se podía; ahora también horas.

## 4 · El tambor: qué lleva cada módulo

Al elegir **Confección** en los recuadros, debajo de personas y horas aparece **«Qué lleva cada módulo»** (`tamborModulosHTML`):
una fila por módulo (y una para la maquila si tiene órdenes marcadas), una columna por familia con las **horas** y unidades
programadas para las órdenes de los meses elegidos, el total programado, la **capacidad del período** (minutos por día del módulo
con el escenario × días de la nivelación) y el % de uso. El fondo de cada celda es la **polivalencia** del módulo en esa familia
(verde ≥ 80 %, ámbar 50–79, rojo < 50): así se ve de un vistazo que Level 1 está en un módulo bueno para camisetas y no debería ser
lo que se manda a maquila. Solo lee el programa (`P.pro`); no calcula nada nuevo.

## Pruebas
- **HP** (3): la tabla trae horas por día; escribir 9 h guarda 540 min en el escenario de todas las semanas y la capacidad sube 9/8;
  confirmar graba `min` en el ajuste de cada semana con motivo y bitácora y `capDia` lo usa sin escenario.
- **MQ** (9): siembra del orden desde la polivalencia; mover / no mandar / confirmar con bitácora; tabla en Configuración; sin
  capacidad en planta todo el saldo con SAM se manda, en órdenes enteras y en el orden configurado; el recuadro y el detalle;
  «no mandar» deja horas sin cubrir; mandar una orden la deja con recurso fijo, auditoría, fuera del saldo de planta y en la maquila
  del programa, y ninguna orden sin marca cae en la maquila; devolver a planta; GUARDIA; la regla del motor detrás del parámetro.
- **PB** (4): quitar/devolver de la base; jalar del mes siguiente; base del plan = base de la nivelación (todo el saldo de
  Confección de los meses ≤ mes está en el plan); en proceso con entrega posterior se informa.
- **TB** (1): el tambor. Actualizadas OB1–OB3, AJ1, AJ3, B3-5, PM (las órdenes de prueba son del mes siguiente, jaladas), PN, N3, N8,
  GUARDIA (`quitarMaquila`), RC5 (un lunes no hay días pasados en la semana), RC6 (suma de flotantes con tolerancia).

## Pendiente / decisiones que siguen abiertas
- El orden de descarte nace **sugerido** desde la polivalencia; hay que confirmarlo en Configuración → Nivelación.
- Marcar a maquila es por **órdenes enteras** y por familia; si se quiere partir una orden entre planta y maquila, es otro paso.
- Los tiempos de Kronos siguen sin subirse (ver `KRONOS_TIEMPOS_FEEDBACK.md`): el tambor y el descarte usan el SAM actual de cada
  orden, que en camisetas está inflado (13,46 vs ≈4,5); al corregirlo, el déficit de Confección y lo que «hay que mandar» bajan.

## Revisión adversarial antes de publicar (21-sep): 3 revisores + verificación contra el código, 15 hallazgos reales corregidos
- **Doble descuento de lo marcado a maquila**: `saldoProceso` ya saca del saldo las órdenes marcadas y `nivUICalcular` las volvía a sumar como
  capacidad (`maqMin`): mandar la mitad del déficit dejaba «✓ no hace falta». Ahora solo lo **escrito** en «Maquila (adicional)» suma capacidad; lo
  marcado se muestra aparte. El cuadrito del Paso 1 también restaba dos veces (`maquilaMin:0`).
- **Una sola lectura de «va a maquila»**: `recFijadoDe(o,c)` (lo fijado en la cola manda sobre el recurso fijo, como en el motor) y `vaAMaquila(o)`;
  las usan el motor, `saldoProceso`, `ordenesEnMaquila`, `marcarMaquila` (suelta el módulo fijado en la cola) y `quitarMaquila`.
- **Todas las familias «no mandar» con déficit** → el recuadro dice «✕ no cabe y no se manda» (antes «✓ no hace falta»).
- **El criterio de qué orden va primero es un parámetro** (`maquilaCriterio`: lejana | cercana | mayor | menor, selector en Configuración →
  Nivelación, bitácora) y el detalle dice cuánto se pasa la última orden (`sobraMin`).
- **`prmTxt`**: `prm()` solo devuelve números, así que `palabrasExcedente`, `centroExcedente` y el criterio nunca leían lo configurado. Corregido.
- **Familias unificadas/inactivas** (JEANS → DENIM) no entran al orden; lo que queda fuera se marca, no se borra. `moverMaquilaOrden` intercambia en
  la lista guardada.
- **El interruptor `maquilaPorDescarte` nace explícito** (`sembrarMaquilaPorDescarte`, una vez) con su efecto en bitácora: cuántas órdenes que el
  motor mandaba solo a maquila vuelven a los módulos.
- **Tambor**: polivalencia sin dato ya no se pinta de verde (lo dice); la capacidad del período es el mismo promedio por día hábil de la nivelación
  (con escenario y ajustes), no `capDia(hoy)`.
- **Plan**: `planMesQuitar` no es excluyente (agregada + base); `planMesAgregar` devuelve una quitada o, si su fecha ya se movió, la mete como
  agregada; **con el plan congelado manda la foto** (`planMesOidsTot` = `planFotoCongelada`) y la pantalla avisa cuántas órdenes entraron después de
  congelar; `candidatasPlan(ym)` es el único criterio de «Agregar» para los bloques 3 y 4.
- Refutados por los verificadores (no se tocó nada): pantallas de carga que «cuentan la maquila como capacidad» (ya la excluían), el `errPaso` de
  módulos, `nivCapSet` con coma decimal, congelar con quitadas.

## Ajuste (21-sep): Maquila dentro de Confección y botoncitos por módulo
La usuaria: «módulos y maquila van en una sola: el encabezado Confección; y que podamos escoger los módulos». La tarjeta Maquila vive ahora
en la bandeja **Confección** (`nivUIGruposAreas` la cuelga del ítem de `modulos`), y al elegir Confección aparecen los botoncitos **Módulo: Todos ·
Módulo 1 · …** (`nivModChipsHTML`, `NIVUI.rec`) que acotan **personas/horas** (`personasNivHTML(ym,area,rec)`) y **el tambor** (`tamborModulosHTML(rec)`);
el saldo sigue siendo de todo Confección (lo dice). Prueba TB.
