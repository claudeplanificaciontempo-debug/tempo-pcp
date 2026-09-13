# Auditoría de reglas fijas en código — tempo-pcp (`index.html`)

Fecha: 2026-09-13. Modo lectura: no se modificó ninguna línea. Se leyó el archivo completo (3.952 líneas) y se contrastó
con los valores reales guardados en producción (Supabase) para distinguir "seed nunca cambiado" de "configurado".

Criterio: cada lugar donde el sistema decide algo de negocio sin leerlo de una tabla editable (Configuración /
`S.params` / campos de centros, recursos, telas, categorías, colores) ni de un dato del archivo importado. Incluye
reglas fijas, defaults y fallbacks (`||X`), decisiones por parecido de texto, conversiones de unidades, números a mano
y lo sembrado que nunca se cambió.

**Total: 187 puntos.** Los tres que ya conocías (`faseEstado`, `MAPA_TELA`, `puntadasMin`) están en A1, D1 y A6.
Ordenados por riesgo: **A** carga por centro y fechas · **B** tintorería/tejeduría (kg, baños, horas) · **C** liberación
y estado por texto de fase · **D** importadores (Odoo, Parte 2, OT) · **E** defaults de configuración y seed ·
**F** umbrales visuales y truncados. Las líneas son las del archivo actual (commit `79bbce7`).

Formato de cada punto: **dónde** · qué decide · **criterio literal** · origen · qué depende · qué pasa si el dato real no calza.

---

## A · Carga por centro y fechas (riesgo alto)

**A1 · L694–705 `faseEstado(f)`** · Decide qué centros ya están hechos y si la tela está tejida/tinturada/lista, solo
por el primer dígito de la fase y palabras dentro del texto · `n>=8` → corte, estampado, bordado, modulos y **lavado**
hechos; con `empaque terminado|cross|distribucion|exportacion|novedades|embodegado` también empaque, botones, plancha,
etiquetas; `n===7` → corte, estampado, bordado (con `pulido` también modulos); `n===6` → solo corte; `n===5`:
`recepcion` → hasta modulos, `maquila conf` → hasta bordado, `cd maquila` → corte, **cualquier otra fase 5 → nada**;
`n===4` → corte hecho salvo `corte planta|incompleto`; tejida si `n>=2` o fase 1 sin "tejeduria"; tinturada/lista si
`n>=2` o texto `stock`/`calidad` · Origen: comentario "fases de Odoo explicadas por planificación" · Depende: `programar()`
(pasos hechos, kg y baños pendientes), `minPendiente`, `kgPendiente`, `liberada`, `puedeLiberar`, `enCalidad`,
Control de piso, WIP, Reportería, Cumplimiento, Gerencia · Si no calza: contradice la tabla del Bloque A en 5Maquila
Conf / 5CD Maquila (el motor cargaría módulos), 5Corte Maquila Ibarra (cargaría corte), **8Lavanderia / 8Lavanderia
Quito (da lavado por hecho justo cuando la orden está lavándose)**, "Stand by" (dígito 0 = nada hecho), 4 Calidad
Produccion y 1INCOMPLETOS TIN (caen por parecido). Las órdenes de la Parte 2 llevan `ruta` solo con lo pendiente, así
que el motor no puede cargar lo que la tabla quitó, pero sigue **descargando** lo que esta función dé por hecho.

**A2 · L681 `faseNum`** · Dígito inicial de la fase como etapa; `/^factur/` → 9; sin dígito → 0 · Depende: A1, `liberada`
(fase ≥2 = tela liberada, ≥4 = liberada a corte), `etapaOrden`, `terminadaF` (≥8), Panorama, Gerencia, Cumplimiento,
Familias · Si no calza: "Stand by" y cualquier fase sin número se tratan como "antes de producir".

**A3 · L564–569 `capDia(r,d)`** · Capacidad diaria: producción = `pers × min × efic/100`; tejeduría y tintorería =
`r.horas` (horas-máquina) · Origen: comentarios · Depende: toda la carga por centro (programar, cargaSemanal, Plan
mensual, Reportería, reporteTarea) · Si no calza: no considera `vel`, `mult`, `cabezas` (que sí usa `minPrendaR`);
para tintorería devuelve horas sin relación con kg ni baños.

**A4 · L572–574 `minPrenda(centro,t)`** · Conversión del tiempo de ruta a minutos por prenda según `medida` del centro:
`puntadas` → `t/(S.params.puntadasMin||600)`; `prendas_h` → `60/t`; otro → `t`; área no pro → 0; `t=0` → 0 · Origen:
sin explicación · Depende: programar, minPendiente, WIP, Familias, Plan mensual, reporteTarea, MES (`t.std`) · Si no
calza: **lavado** (medida `prendas_h`) con un `t` cargado en minutos se invierte (t=2 → 30 min/prenda); un paso con
`t=0` carga 0 sin aviso.

**A5 · L576–578 `minPrendaR(r,centro,t)`** · Por recurso: bordado = `t/((r.ppm||puntadasMin||600)×(r.cabezas||1))`;
otros = `minPrenda × (r.vel||1)/(r.mult||1)` · Si no calza: `vel` multiplica los minutos (un recurso "más veloz" con
vel 1.2 tarda más). **En producción la bordadora r7 tiene `ppm=921.600` y `cabezas=24`** → 22 millones de puntadas/min
→ capacidad de bordado prácticamente infinita en el motor; la "Bordadora nueva" tiene `cabezas=0` (→ `||1`).

**A6 · L360 seed `puntadasMin:600`, L573/577/3100/3200 `||600`** · Velocidad de bordado por defecto · Origen: seed ·
**En producción el parámetro vale 6.000**, no 600 (el reporte `RECARGA_PARTE2_REPORTE.md` dice 600 en los puntos 10 y
13.3: dato incorrecto, no corregido en esta auditoría) · Depende: minPrenda, minPrendaR, addRecEsp, reporteTarea ·
Si no calza: los 340 pasos de bordado cargados se convierten con 6.000 ppm sin que ningún usuario lo haya validado;
el campo "Puntadas/min" del centro Bordado está vacío pero el motor igual usa 6.000.

**A7 · L3297–3298 `setCentro` puntMin ↔ `S.params.puntadasMin`** · Al escribir la velocidad del centro se copia al
parámetro; **al borrarla no se borra el parámetro** (`+v||S.params.puntadasMin`) · Si no calza: la orden se marca "sin
velocidad" mientras el motor sigue usando la última velocidad escrita.

**A8 · L3481–3484 `tiempoPaso`** · Tiempo de ruta por paso: bordado = puntadas; lavado/plancha = `minEstandar` del
centro (`60/m` si medida `prendas_h`, `m` si `min`), **0 si el centro no tiene minuto estándar**; resto = SAM de la
categoría · Depende: editor de orden, rearmar, `planTarea` · Si no calza: (a) lavado/plancha sin minuto → t=0 → carga
0 sin bloquear el guardado (hoy: **ambos centros sin minuto en producción → 0 minutos de lavado y plancha en toda la
carga**); (b) si se cambia la `medida` del centro después de cargar, todos los `t` guardados se reinterpretan.

**A9 · L3046 `pctEstimado`** (Configuración → Centros, lavado/plancha) · Se edita y se guarda pero **no interviene en
ninguna carga ni cálculo** (`tiempoPaso`, `planTarea`, `reporteTarea`, `programar` no lo leen) · Si no calza: la
carga de lavado/plancha, cuando exista, será el 100 % de las prendas de las categorías marcadas.

**A10 · L647–649 `lavaPlanchaDefault(k)`** · Una categoría lleva lavado/plancha si tiene `lavaDefault`/`planchaDefault`;
si no tiene **ninguno de los dos** hereda del padre; sin dato → false · Origen: PASO 7 · Depende: desdeHoja, planTarea ·
**En producción ninguna de las 85 categorías tiene la marca** (los valores iniciales del PASO 7 nunca se aplicaron) ·
Si no calza: hija con solo `planchaDefault` pierde el `lavaDefault` del padre; hoy ninguna orden lleva lavado ni plancha.

**A11 · L3801–3802 `nuevaOrden` (importador Odoo antiguo)** · `lavado` entra con **`t:120`** fijo; estampado con
`tecnicaT||1`; bordado con `t=punt` · Origen: sin explicación (la demo L3929 usa los mismos 120) · Depende: aplicarOdoo
· Si no calza: con lavado en `prendas_h`, 120 significa 0,5 min/prenda; con lavado en `min`, 120 min/prenda; ignora
`minEstandar`.

**A12 · L3814–3816 `aplicarOdoo`** · Inserta pasos a órdenes existentes: lavado `t:120`, **botones `spc.botones||1`,
plancha `spc.plancha||1`** (1 minuto inventado si la categoría no tiene SAM) · Si no calza: carga de 1 min/prenda sin
origen.

**A13 · L3751 `leerOdoo` lavado por texto de receta** · `lavado=true` si un componente SERV contiene `'servicio de
lavado'` o su categoría `'lavanderia'` · Depende: nuevaOrden, aplicarOdoo · Si no calza: "SERVICIO LAVADO" (sin "de")
no calza; y contradice la Parte 2, donde lavado sale solo de la marca de categoría (A10) e ignora la receta.

**A14 · L3752 `hayCordon → plancha`, `hayBoton → botones`** · Un insumo cuyo nombre matchea `/cord[oó]n|jareta|pasador/`
agrega el centro **plancha**; `/boton|ojal|broche/` agrega botones · Origen: sin explicación (¿plancha = colocar cordón?)
· Si no calza: "OJALILLO" (metal) → botones; toda prenda con cordón pasa por plancha.

**A15 · L629 `FIJOS_PRO=['corte','modulos','empaque']`, L617 `RUTA_FIJOS_PROPIA`, L624 ruta externa** · Centros
siempre presentes en el editor (chips fijos) y en generarRutas · Depende: mOrden (opts), centrosRutaHTML, catálogo de
rutas · Si no calza: una orden de maquila total o de solo bordado arrastra corte/módulos/empaque en las rutas del
catálogo (armarRuta ya no los rellena, pero el editor y el catálogo sí).

**A16 · L619 `RUTA_ORDEN`** · Secuencia fija de centros: tej, tin, proveedor, corte, estampado, bordado, modulos,
botones, etiquetas, **lavado, plancha**, empaque; centro nuevo → antes de empaque (`indexOf('empaque')-0.5`, L630) ·
Depende: armarRuta, aplicarOdoo (inserción), programar (pasos secuenciales) · Si no calza: lavado siempre después de
botones/etiquetas; estampado siempre antes de confección; no hay estampado post-confección.

**A17 · L978–980 `programar` pasos estrictamente secuenciales** · Cada paso arranca al terminar el anterior; sin solape
ni lotes; `atraso = finPro > fecha` sin buffer · Si no calza: sobreestima la duración de rutas que en planta solapan.

**A18 · L769 y L797 fecha requerida** · Tejeduría = entrega − (lead + `diasTintBodega` + **2**); baño = entrega −
(lead + `diasTintBodega`) · El `+2` no es parámetro · Depende: orden de corridas y de baños · Si no calza: 2 días de
colchón fijos, inconsistentes entre tejeduría y tintorería.

**A19 · L769/797/812/906 lead sin ruta = 5 días; L985–986 `leadDias` mínimo 3 días, `+1`** · `Math.max(3,tot+1)` ·
Sin explicación · Si no calza: órdenes sin ruta o con ruta corta reciben fecha requerida irreal.

**A20 · L950 inicio de producción = `finTin + diasTintBodega`** · `diasTintBodega` **sin default** aquí (L2191 igual) ·
Si el parámetro falta, `dsum` recibe undefined → fecha inválida. (En producción vale 2.)

**A21 · L753 y L1861/1864/2471/3386/3606/3804/3918 prioridad por defecto 3** · Toda orden sin `prio` es "Normal";
`prio===1` además salta el horizonte de tintorería (L813) · Si no calza: todo lo importado en Parte 2 es prioridad 3.

**A22 · L3395/3804/3918 entrega por defecto `hoy+21` días; L3732 día 28 del mes de "Proyecto"** · El importador Odoo
antiguo inventa fecha de entrega si falta · Si no calza: fija el mes de carga (Parte 2 no lo hace: bandeja sin fecha).

**A23 · L625/659/3349/3380/3593/3904 proveedor = 15 días** · Lead time de tela externa fijo en 6 sitios; `provDias||15`
convierte 0 en 15 · Si no calza: corte de órdenes con tela comprada se fecha con 15 días inventados.

**A24 · L953 hecho por centro = `faseEstado` manda sobre avance** · Si la fase dice hecho, `hechas=cant` aunque el
avance registrado sea menor · Depende: programar, WIP · Si no calza: avance real de piso ignorado.

**A25 · L3516–3520 `pasosPendientes`** · Centro sin fila en la tabla 4 (`i<0`) → **siempre pendiente**; fase sin fila →
ruta completa · Si no calza: un centro nuevo sin etapa carga hasta en órdenes casi terminadas.

**A26 · L2755 `SISTEMA_FASES`** (orden de grupos = orden del flujo) y **L3502–3509 `defCentroEtapa`** (botones, lavado,
plancha, empaque = "terminados") · Siembra en código, luego editable · Si no calza: si lavado va entre confección y
terminados en la realidad, la carga pendiente por fase queda mal.

**A27 · L2754/2770 `FASE_MAPEO_VER`** · Si la constante sube, la tabla de fases editada **se pisa** con la siembra · Si no
calza: pérdida silenciosa de ediciones al desplegar una versión nueva.

**A28 · L3499 `ESTADOS_OP_ABIERTOS=['draft','progress','confirmed','to_close']`**, L3567 `cancel`, L3595 `done` · Qué
Estado OP cuenta como abierto/historia/excluido (Parte 2) · Constantes · **Difiere del importador antiguo L3734, donde
`to_close` es cerrada** · Si no calza: un estado nuevo de Odoo deja fuera órdenes vencidas.

**A29 · L3584 origen de la orden con telas mixtas** `PROPIA > EXTERNA > EXTERNA TEÑIDA > SIN CLASIFICAR`; **L3593 ruta
textil por origen** (`[tej,tin]`, `[proveedor 15, tin]`, `[proveedor 15]`, `[]`) · Bloque I, en código · Si no calza:
jean externo con un rib propio pequeño va entero por tejeduría/tintorería.

**A30 · L3633 `reporteTarea` meses fijos `2026-09..2026-12`** y vencidas al `mesHoy` de la carga; L3634 totales por mes
de entrega (no por `mesDe`) · Si no calza: el reporte deja de servir en octubre; totales de órdenes y carga usan bases
distintas.

**A31 · L3645 capacidad "sin maquila" = recursos cuyo nombre NO matchea `/maquila/i`** · Se calcula y no se muestra en
pantalla · Si no calza: un módulo renombrado "Maquila Ibarra" cambia el cálculo.

**A32 · L3636–3637/3647 carga del reporte = `cant × minPrenda`** · Sin eficiencia, sin `pctEstimado`, sin polivalencia,
sin avance parcial · Si no calza: sobreestima frente al motor.

**A33 · L3622 `aplicarTarea` borra `S.avance`** · La recarga destruye cierres por OT y avances de piso · Si no calza:
pérdida de avance real (hoy no había).

**A34 · L1243–1247 `calcularPlan` (Plan mensual)** · Demanda del mes = órdenes abiertas por **mes de entrega**; "horas
de confección" = solo centro `modulos` × cantidad **total** (no pendiente, sin avance); terminadas = `faseNum>=8`; base
del plan = sin `bloqueo`; propuesta ordenada por USD; "cabe" contra capacidad de **toda** el área pro · Si no calza:
compara demanda por entrega con carga programada por producción; maquila y otros centros no cuentan como confección.

**A35 · L1239 semanas del plan lunes–viernes** · Sábado/domingo excluidos de producción aunque `cal.pro` sea 6 (en
producción **cal.pro = 6**) · Si no calza: metas semanales no cuadran con el calendario real.

**A36 · L553 `diasDe(r)` = `cal[área] || r.dias || 6`** · El calendario de área **prevalece** sobre el campo `dias` de
cada recurso; sin nada, 6 · Si no calza: el campo `dias` editable en cada recurso es ignorado (en producción los
módulos dicen 5 pero `cal.pro` = 6 → se planifican a 6 días).

**A37 · L549 `laborable(d,dias)`** · `>=7` todos; `6` sin domingo; `<=5` L–V (4 o 3 también L–V) · Si no calza: no
representa semanas de 4 días ni sábado medio día.

**A38 · L1005 capacidad del periodo con `capDia(r)` sin fecha** · Ignora excepciones y paradas por día; mes sin
periodo = mes actual · Depende: cargaSemanal, Plan mensual.

**A39 · L1083, 1225, 1250, 3225 días laborables del área = los del primer recurso (`recs[0]`)** · Si no calza: una
parada del primer recurso desplaza el mes entero del área.

**A40 · L1179–1180 `pesoFase` (avance gerencial)** · fase ≥8 → 100 %; ≥7 → 85 %; ≥5 → 65 %; ≥4 → 50 %; ≥2 → 30 %;
≥1 → 15 % · Sin explicación · Si no calza: fases 3 y 6 sin peso propio; % de avance inventado.

**A41 · L1508 vWIP y L1831 `CENTROS_PROD`, L2222–2223 `SUBAREAS`** · Grupos de centros por id literal: terminados =
`etiquetas, botones, lavado, plancha`; confección = `modulos` · Si no calza: un centro creado en Configuración con otro
id no aparece en WIP, no tiene pantalla de centro ni es visible para perfiles de piso; L1515 navega a `CEN.id=
'terminados'`, que no existe como centro.

**A42 · L1525, 1544–1549, 1574, 1590, 1892, 1943, 1966, 1975, 968, 973, 1256, 1869, 1880 id `'modulos'` fijo** · KPIs de
confección, modo línea, balanceo, costura, ventana de color y polivalencia solo funcionan para el centro con ese id ·
Si no calza: confección modelada en otro centro (maquila propia) queda fuera de todo.

**A43 · L1340/1355/1363 recurso `'maquila'` por id fijo** (escenarios) · Si no calza: id distinto = sin escenario de
maquila.

**A44 · L3260 `costoMin`** · corte → minCorte, empaque → minEmp, modulos → minConf, **cualquier otro centro → minConf**;
`minMaquila` no se usa aquí · Si no calza: lavado/plancha/bordado/estampado se valoran al costo de confección.

**A45 · L1247/1122/1153 horas = min/60 sin eficiencia** · Distinto de `capDia` (con eficiencia) · Si no calza: "horas de
planta" y "capacidad" no son comparables.

**A46 · L2555 y L3809 `terminadaF` cuando `faseNum>=8`** · Fecha real de término = primer paso a fase 8 · Depende:
Cumplimiento (MAE) · Si no calza: "8Lavanderia" cuenta como terminada.

**A47 · L1074–1075 Panorama** · Vencida sin terminar = `fecha<hoy && faseNum<8`; ventana de entregas 7 días; tela
externa pendiente = fase ≤0 y entrega ≤21 días; L1131 "por liberar a corte" = corte programado en ≤3 días.

**A48 · L2561–2564 `setAvance` (MES)** · Minutos estándar acreditados con `paso.t||0` del día de registro · Si no
calza: eficiencia diaria distorsionada si el avance se registra otro día; sin `t` → eficiencia 0.

**A49 · L2429 purga de `S.turnos` a 90 días** · Asistencia, producción MES y **paradas de máquina** comparten tabla ·
Si no calza: una parada "hasta nuevo aviso" de hace más de 90 días desaparece.

**A50 · L1928 Andon** · `pers×(min||480)×((efic||85)/100)`; paro × personas del módulo; L1931 rojo si paro ≥60 min;
L1935 banda ±10 puntos de eficiencia.

**A51 · L1977–1983 Balanceo** · Meta por defecto = 90 % del máximo; operación larga se parte en `ceil(req)` puestos;
agrupa si no supera takt +2 %; máquina vacía = "Manual".

**A52 · L3591–3592 `planTarea` ruta pro** · `armarRuta('propia',…)` filtrando textil y `tiempoPaso` · Centros de la
categoría sin SAM → t=0 y solo se reportan (19 pasos de estampado hoy).

---

## B · Tintorería y tejeduría: kg, baños, horas (riesgo alto para fechas de tela)

**B1 · L863, 1728, 1798, 1813, 2305, 2353 tolerancias `(PP.tol||15)`, `(PP.tolGrande||5)`** · Sobrellenado permitido de
baño · **En producción `tol=0` y `tolGrande=0`: el `||` los reemplaza silenciosamente por 15 % y 5 %** · Depende:
programar, propuestaColor, confirmar/mover baño, tagArm · Si no calza: el usuario cree que no hay tolerancia y el
sistema arma baños al 105/115 %.

**B2 · L819/831/865/913/1654/1727/2306 máquina grande = `cap >= (granMin||120)×1.2`** · El factor **1.2** no es
parámetro (umbral 144 kg con el default; en producción granMin=120) · Si no calza: máquinas entre 120 y 143 kg se
tratan como chicas; L1654 además `||180` si no hay máquinas.

**B3 · L819/845/1772/1786/2308 `granOk||170` (programar) y `||180` (armado/tag)** · "Baño bueno" en **kg absolutos**
con dos defaults distintos · Si no calza: no escala con la capacidad de la máquina.

**B4 · L868–870, 1747, 1772, 2307, 3121 `pctBueno||90`, `pctAprob||70`, `umbral||80`** · Estados ok/aprobación/bajo (en
producción pctBueno=95) · Si no calza: máquinas chicas nunca pasan por "aprobación" (solo `umbral`).

**B5 · L1728 `capN = max cap grandes || 240`; `capP = max capPique || capN`** · Capacidad de propuesta; el comentario
dice "200 kg si lleva piqué" pero el código usa `capN` si nadie llenó `capPique` · Si no calza: piqué a capacidad
normal.

**B6 · L814–816 familia de tela** · `fam==='IND'` baño propio; `'B'` grupo B; **cualquier otra cosa (incluida ausente)
= A** · Si no calza: tela sin familia se mezcla con jersey. L3315 `addTela` siembra `fam:'IND', enc:8`.

**B7 · L847–850 remanente < granOk → toda B se fusiona en A** · Comentario reconoce "junta todo en A" · Si no calza:
familias que la planta no mezcla quedan mezcladas. L1754–1755 la propuesta manual mezcla remanentes **sin** comprobar
familia; el texto L2159 documenta una regla que el código manual no aplica.

**B8 · L860/893 tela de referencia del grupo = primero piqué, luego IND, luego la primera; L1745 un ítem piqué pasa
todo el baño a `capPique`** · Si no calza: la regla real podría ser "si predomina".

**B9 · L872–874 si hay máquina grande apta, siempre la grande** ("no se van solos a STUART") · Si no calza: remanentes
pequeños ocupan máquina grande.

**B10 · L879 recurso del baño = `pool[0]`** (orden de registro); **L932–938 todos los baños del mismo grupo van a la
misma máquina** · Si no calza: un color no se reparte entre máquinas.

**B11 · L911/918 baño confirmado que no cabe → máquina más grande igual, estado `'ok'` forzado**.

**B12 · L921–922/942 baño no confirmado = pendiente, no consume capacidad ni fija `finTin`** · Depende: producción
bloqueada "baño pendiente de decisión"; Plan mensual (L1254) no ve esa carga.

**B13 · L925–927 rol de máquina por color** · claro si `profColor==='claro'` (comentario: `fam claro|lavado`); si
ninguna máquina calza por rol, se permite cualquiera · Si no calza: rol no respetado sin aviso.

**B14 · L3303–3304 `prefijoTCX`** · Pantone `11` → claro, `12–17` → medio, `18–19` → oscuro, otro → null; **L3738
`colorPorCodigo`**: todo lo que no sea 11/12–17 → **oscuro** (incluye prefijos inválidos) · Dos reglas distintas ·
Depende: horas de baño, rol de máquina, orden de baños.

**B15 · L3306–3310 `profColor` por nombre** · Sin código: regex `negro|black|navy|…|cafe|chocolate` → oscuro;
`blanco|white|bleach|…|celeste|nieve` → claro; default **medio** · **En producción 113 de 210 colores no tienen Pantone
y 15 no tienen familia** · Si no calza: "LIGHT NAVY" → oscuro, "CAFE CLARO" → oscuro, "SPORT RED" contiene `port`.

**B16 · L883/917/3327/3330/3561/3763/3909 color sin familia → `'medio'`** · Horas de baño y orden por defecto medio.

**B17 · L361 seed horas de baño `hClaro:4, hMedio:7, hOscuro:8, hLavado:3, hDesencolado:2, hReproceso:10`** · Sin
cambios en producción · **L608–610 `horasBano(colId,telaId)` recibe la tela y no la usa**: nunca suma `hDesencolado`
aunque la tela tenga `des:true`; L885/919 horas por la **primera** tela del baño · Si no calza: capacidad de tina
sobreestimada en telas planas.

**B18 · L931/939 un baño debe caber entero en un día (`libre>=horas`)** y ocupa `horas` de capacidad diaria · Si no
calza: baños más largos que la jornada nunca se programan (loop de 400 días).

**B19 · L603 `kgCrudo = kg` (sin merma)**; L604 `kgAcabado = kg×(1−enc/100)`; L605–607 `banoAcabado` usa la merma de la
**primera** tela; L2488 Calidad suma kg sin `kgCrudo` · **En producción las telas tienen `enc` (1,75–11 %) pero no
`merma`** · Si no calza: si el archivo trae kg acabados, tejeduría y tina quedan subcargadas.

**B20 · L588 `kgPendiente`** · Todo o nada: si tejida/tinturada/lista → 0, si no todos los kg · Sin proporcional.

**B21 · L612–614 `kgHora`, `kgDiaTela` = `kgTela/24`** · Asume jornada de 24 h al 80 % ya incluida en `kgTela`
(comentario L612; **producción: kgTela por máquina y tela, p. ej. C1-ORIZIO t1 336 kg/día**) · Si `horas` baja a 16, el
kg/h sigue derivado de 24 h.

**B22 · L611 `compatible(r,tela)`** · Lista `telas` vacía = compatible con todo (DANITECH sin lista aceptan cualquier
tela; aviso L1194).

**B23 · L759–763 tejido hecho si `tejida || faseEstado.tejida || reproc`**; L802 tinturada por fase salvo reproceso;
L762/802 fechas ficticias `inicio−1` · Si no calza: reproceso que requiera retejer no se programa.

**B24 · L781/786–787 una corrida por tela en una sola máquina; bloqueo mínimo `tejBloqueDias`** (default 0 si el
parámetro está vacío, L772) · Si no calza: telas grandes saturan una máquina.

**B25 · L777 tejedora = la que termina antes, empate por menor carga** · No considera costo de cambio por máquina.

**B26 · L812–813 horizonte `tinHorizonteDias||0`; `prio===1` siempre entra** · Si no calza: valor 1 = urgente no
documentado.

**B27 · L821–822 "jalar" del futuro órdenes completas hasta llenar; L827–828 grupo TARDE** · Puede sobrellenar más de
un baño con órdenes fuera de horizonte.

**B28 · L718/723/1745 bin packing: orden por kg desc; se parte WH solo si espacio > 0,5 kg; tope 200 iteraciones** ·
Umbrales arbitrarios.

**B29 · L1730–1735 `kgConfirmadoTela` reparto proporcional; restos ≤ 0,1 % o ≤ 10 g se descartan** · Si no calza: baño
con una sola tela de la WH descuenta la otra.

**B30 · L1802/1815 `req` del baño = entrega de la orden más temprana** (sin descontar lead de producción); **L2292
`codBano` mes = mes de esa fecha** · El código de baño lleva el mes de entrega, no el de tintura; L2293 nombre de color
truncado a 10 caracteres; L2294 secuencia de 2 dígitos.

**B31 · L2318–2328 `estadoTin` por texto de fase** · `'stock'` → tela en stock/lista; `'incomplet'` → incompleto;
`'tintoreria'` sin `'cd'` ni `'calidad'` → en máquina (`'cd'` como subcadena) · **L2328 incompletos sin `faltaKg` anotado
aportan 0 kg a tintorería** · Si no calza: renombres de fase cambian el comportamiento sin aviso.

**B32 · L2350 `moverBano` regex `/^d{4}-d{2}-d{2}$/` sin escapar** · Nunca coincide con una fecha ISO → **arrastrar un
baño a otro día no cambia el día**, solo la máquina · Bug.

**B33 · L1798/2352 cap con piqué en máquina sin `capPique` = 0 → sin advertencia de exceso**; L1813 `capA||9e9` permite un
baño gigante.

**B34 · L2472–2473, 2482, 2509 `FASE_CALIDAD='1Calidad Tintoreria'`, `FASE_PLAN='2Planificacion'`, `FASE_TIN=
'1Tintoreria'`** · Nombres exactos de fases Odoo que el sistema **escribe** en la orden al marcar baño listo, aprobar o
reprocesar · Si no calza: renombre en Odoo rompe el flujo; aprobar calidad sube a fase 2 y activa C1.

**B35 · L2476–2477 `enCalidad`** · Solo si alguna tela es propia: tela 100 % externa nunca pasa por calidad.

**B36 · L2497/2405 reproceso 10 h (`hReproceso||10`; el texto de UI dice "10 horas" fijo)**; L2494 motivos de reproceso
lista fija.

**B37 · L3085–3086 tejeduría excluye la tela id `t12`** · "Plana e importada" nunca se teje por id fijo.

**B38 · L3023 kg/h mostrado = promedio kgTela/24**; L3082/3121 textos "240 kg / 200 kg" fijos.

---

## C · Liberación y estado de la orden por texto de fase

**C1 · L2444 `liberada(o,'tela')` = `lib.tela.ok || faseNum>=2`** · Toda orden con fase 2+ se considera con tela
liberada · Depende: programar (tejer/teñir sin firma), Liberación, resumenTelas · Si no calza: Odoo en fase 2 sin tela
real → el motor teje y tiñe igual.

**C2 · L2445 `liberada(o,'corte')` = `lib.corte.ok || faseNum>=4 || fase includes 'cd corte'`** · Liberada a producción
por dígito o por texto · Si no calza: "3CD Corte" liberada sin firma; fase 3 sin ese texto no.

**C3 · L1649 `yaHecha` en Liberación** · tela: `faseNum>=2`; corte: `faseEstado.hechos.includes('corte')` · L1683 texto
fijo "3Aeropuerto, 3Trazos, 3CD Corte".

**C4 · L2455 `puedeLiberar`** · Tela externa (ruta con proveedor) se libera con `tinturada||lista`; propia exige
`calidadOk||fase lista`; **no exige Pantone aunque `faltaLiberar` (L2457) lo reporte** · Inconsistencia.

**C5 · L2447 `puedeLiberarA(tela)`** · Tela propia exige color con código Pantone; externa no.

**C6 · L2452 liberar a corte marca `avance.lista=true`** (efecto colateral).

**C7 · L1667 quién libera** · tela → área `tej`; corte → área `tin` (tintorería libera a producción, corte no).

**C8 · L683 `abierta` = estado vacío o `'plan'`; L2072 `standby` cuenta como cerrada; L3598 standby por
`normFase.startsWith('stand')`**.

**C9 · L3734 `estadoDe` (importador antiguo)** · sin OP → null si `factur*|stand*`, si no `'prevision'`; `cancel` →
anulada; `stand*` → standby; `factur*|done|to_close` → cerrada · Distinto de la Parte 2 (A28).

**C10 · L3600–3602 contradicción y devolución (Parte 2)** · done fuera de `terminados|prenda terminada|cerrada`;
cerrada con estado abierto; devolución = grupo previo/textil con `progress` · Listas literales, sin tabla.

**C11 · L1568–1569 `GRUPOS_FASE`** (Familias, selectores) · dígito ≤0 / 1 / 2–4 / 5–7 / 8 · L1099–1101 y L1167
nombres de etapa literales que deben coincidir con `etapaOrden` (L579–583: ≤0 antes, ≥8 terminados, ≤3 tela lista,
4 corte, 5 maquila, 6–7 confección).

**C12 · L3867 `aplicarOT` cierre de corte → `tejida=tinturada=lista=true`**.

**C13 · L2558 avance no puede superar la cantidad** (no admite sobreproducción); L2548 kg real 0 cae al programado.

---

## D · Importadores: mapeos y decisiones por parecido de texto

**D1 · L3677–3685 `MAPA_TELA`** · Nombre de categoría de producto → tela del catálogo por `includes` **en orden de
lista** (`RIBB TEMPO`→t2, `JERSEY 24/1 TEMPO`→t1, `FLECCE SIN PERCHAR`→EXT, `CUELLOS|PUNOS|FAJAS`→UDS,
`SERVICIO|LAVANDERIA|TINTURADO INDUSTRIAL|INV / PT /`→SERV, 'FALLAS TEMPO' repetido); sin match → `EXT` → tela `t12` ·
Depende: leerOdoo y **`planTarea` L3560/3588** (la Parte 2 lo reutiliza) · Si no calza: una tela propia no listada se
guarda como t12 (externa) → el motor no la teje aunque `origen='PROPIA'`.

**D2 · L3686 `SIN_COLOR`** · Alias fijos NEGRO→DARK BLACK, PORT ROYAL→PORT ROYALE, LIGHT HEATHER GREY/GRAY y LIGTH
HEATHER GRAY→LHG, CELESTIAL→CELESTIAL-KAMERINO.

**D3 · L3689–3708 `catInsumo`** · Categoría de insumo por regex sobre categoría Odoo y nombre (`mossimo|aeropost` →
Etiquetas; `cinta` → Cordones; `seguridad` → cartonería; default "Otros insumos"); L3421 el select del editor no
incluye dos de las categorías que la función devuelve.

**D4 · L3753 Pantone en producto `/(\d{2}-\d{4})/`; `stock` si categoría matchea `/segunda|falla|tercera/`**.

**D5 · L3759–3760 color de la orden** · Pantone de la tela con más kg → columna Pantone → color previo → nombre;
renombra "PANTONE xx" salvo `/COMBINADO|JAS\b|WASH|\//`.

**D6 · L3748 técnica nueva `t:1.2, prov:true`; L3201 `addTec` `t:1`** · **En producción las 25 técnicas son
provisionales y 19 tienen 1,2 min** · Si no calza: estampado de órdenes antiguas cargado con 1,2 min inventado (en la
Parte 2 el SAM sale de la categoría, no de aquí).

**D7 · L3775–3783 alertas del importador antiguo** · cantidad cambia >20 %, orden grande ≥1.000, entrega <14 días,
cerrada con fase <8.

**D8 · L3720 columnas por `includes`** (`'color'`, `'total'`, `'pvp|precio'`) y **L3540–3541 Parte 2 por nombre exacto**
· Si no calza: etiqueta renombrada → columna −1 → técnica/puntadas vacías sin aviso.

**D9 · L3535–3537 `excelFecha`** · serial base 1899-12-30 con `Math.round`; texto `dd/mm/yyyy` (día primero) · Si no
calza: `mm/dd/yyyy` invierte; fecha-hora ≥12:00 redondea al día siguiente.

**D10 · L3557/3581 niveles de material `split('/')` → n2, n3, n4; tela en kg solo si `udm==='kg'`** · Telas en metros
(1.372 líneas MP) → `sinTelaKg` (139 órdenes hoy).

**D11 · L3561 `colorDe` crea colores por nombre sin familia ni código** (15 creados en la carga).

**D12 · L3573 categoría por nombre exacto de padre e hija (sin crear); L3744–3746 el importador antiguo crea `SIN
PADRE`/hijas fantasma**.

**D13 · L3604 id de orden `'op_'+op` normalizado, duplicados `_dupN`** · "WH/MO/123" y "WH-MO-123" colisionan.

**D14 · L3825–3827 `MAPA_CENTRO_OT`** · `startsWith('modulo')` → `mod`+dígitos; `'maquila'`; mapa literal `corte y
bodega`, `serigrafia|sublimado`→estampado, `pulido`, `servicios y terminados`→`servicios`; otro → ignorado ·
**Lavado, plancha y botones de Odoo nunca se cierran por OT**; `pulido`/`servicios` deben existir como centros.

**D15 · L3844/3851/3848/3861 OT** · SAM real solo si `dur>=30 && prod>=20 && emp>0` y ≥3 registros; faltante de
empaque si `prod<ped×0.97`; semáforo real/estándar >1,5 y >1,15.

**D16 · L2815–2839 `planLMO`** · Columnas por `includes`; categoría vacía → centro o `'General'`; tiempo vacío → 0
(`sinT`); L2901 elección de hoja por texto; L2928 `sub = subcentro||sección||familia`.

**D17 · L2716–2725 `defReglasFamCentro`** (siembra) · **No hay regla para familias LAVADO ni PLANCHA**: cualquier
operación de esas familias cae en `*` → modulos; SERIGRAFIA sin prefijo ESTAMPAR/ETIQUETAR también → modulos ·
L2883 regla nueva default `modulos`; L2726/2744/2783/2800/3508 tablas vacías se re-siembran solas.

**D18 · L2737–2743 `defMapaCatLMO`** (siembra) · Incluye typos de origen (FLECCE, HODDIE) y claves duplicadas con `_` y
espacio.

**D19 · L2978 `buscarCentroPro`** · nombre que empieza con `confec|modul` → modulos (pegado de operaciones) ·
"Confección Maquila" se fusiona con módulos.

**D20 · L2658–2678 pegado de consumos/categorías** · categoría por nombre en 3 estrategias; rol por prefijo `compl`;
carry over si `/^s/i` (también "sin", "solo"); módulos por `/\d+/` → `mod`+n e `includes('maquila')`.

**D21 · L3887–3889 `procesarTecPunt` técnica por `includes` parcial; L3904 `procesarPaste` cantidad quita `[.,\s]`
(12.5 → 125), días `||15`, fecha inválida → `hoy+21`**.

**D22 · L3433–3435 `buscarColor`** · cascada hasta `startsWith` por nombre y por código ("18" asigna cualquier Pantone
18-xxxx).

**D23 · L2997/3906 categoría por nombre: gana la hija; hijas homónimas bajo padres distintos → al azar**.

**D24 · L3938 `importJSON` = `Object.assign(seed(), JSON)`; L474 `cargarTodo` = `Object.assign({}, seed.params, data)`**
· Cualquier parámetro ausente en la base toma el seed silenciosamente.

**D25 · L3921–3930 `demo()`** · Datos ficticios con `lavado:120`, `plancha:1.2`, `bordado:2.2` (minutos, contradice "t
= puntadas"), telas y colores fijos; se mezclan con producción si se pulsa.

---

## E · Defaults de configuración y valores del seed (verificados contra producción)

**E1 · L384–403 seed recursos de producción: `min:480`, `efic:85`, `dias:6`** · **En producción: todos los módulos y
centros siguen con 480 min; eficiencia 85 % en 12 módulos/centros y 80 % en Módulo 10, Módulo 11, Plancha, Bordado;
`dias` 5 en casi todos (pero A36 los ignora)** · Origen: seed · Depende: `capDia` = base de toda la carga · Si no calza:
480×85 % = 408 min/persona/día; turnos de 9–10 h o eficiencia real distinta desplazan toda la programación.

**E2 · L3293–3296 `addRec` defaults** · pro `pers:10,min:480,efic:85`; tin `cap:100,capPique:0`; tej `kgh:10,horas:24`;
`dias:6`, activo, `telas:[]` · **L3200 `addRecEsp`**: bordadora `pers:1,min:480,efic:85,cabezas:1,ppm:puntadasMin`;
estampadora `pers:2,mult:1,vel:1` · Si no calza: un recurso nuevo entra activo con 4.080 min/día ficticios;
`capPique:0` = "no procesa piqué".

**E3 · L3300 `addCentro` `area:'pro', medida:'min'`** · Un centro nuevo de lavado mediría en minutos.

**E4 · L3041 solo los ids literales `lavado`/`plancha` tienen `minEstandar` y `pctEstimado`; solo `bordado` tiene
`puntMin`** · Un centro "Lavandería Quito" creado por el usuario nunca podrá configurarse.

**E5 · L362–375 seed centros y medidas** · `lavado: prendas_h`, `plancha: min`, `bordado: puntadas`, `tej: kg`, `tin:
bano`, `proveedor: dias` · Sin cambios en producción · Depende: minPrenda (A4).

**E6 · L360 seed params** · `umbral 80, granMin 140, granOk 180, pctBueno 90, pctAprob 70, tol 15, tolGrande 5,
diasTintBodega 1, puntadasMin 600, cal {tej 6, tin 6, pro 5}, tejBloqueDias 6, tejCambioHoras 4, tinHorizonteDias 45,
ventanaColor 0` · **Producción**: granMin 120, pctBueno 95, tol 0, tolGrande 0, diasTintBodega 2, puntadasMin 6.000,
cal {tej 5, tin 6, pro 6}; el resto igual al seed.

**E7 · L360 seed `costos`** · minCorte 0,2252 · minConf 0,1649 · minEmp 0,313 · minMaquila 0,25 · baño 120 · kgTela
6,48 · atrasoDiaPz 0,05 · Sin cambios en producción · Depende: escenarios, resumen gerencial.

**E8 · L377–383 seed máquinas textiles** · DANITECH `cap 240, capPique 200, horas 24`; STUART `cap 45→40 en producción,
capPique 0`; tejedoras `horas 24, kgTela por tela` · **m1, m2 y las 4 tejedoras están idénticas al seed**.

**E9 · L405–425 seed telas** · `enc` 1,75–11 %, `fam` A/B/IND, `pique` solo t8/t9, `des` solo t12 · Sin cambios.

**E10 · L427–431 seed colores** · 5 colores con familia fija (BLEACH → lavado).

**E11 · L356–357 `FAMS`, `ORDEN_FAM`** · Familias de color con rangos Pantone en la etiqueta; orden de baños lavado →
claro → medio → oscuro (L928, 2030, 2153, 2400).

**E12 · L353–355 `AREAS`, `MEDIDAS`, `PRE`** · Solo 4 áreas y 4 unidades; previos = tej/tin/proveedor · Un centro de
lavado externo (área ext) no puede medirse en min/prenda (L3043).

**E13 · L3127/1341/1361 días por semana** · Opciones 5/6/7; default `cal.pro||5` en costos pero `||6` en el selector ·
Inconsistente.

**E14 · L571 `poliPct` sin dato = 100 %** (por familia padre) · Módulo nunca entrenado en una familia rinde pleno;
**producción: ningún recurso tiene polivalencia cargada**.

**E15 · L961–964 módulos candidatos** · `recursosDe(categoría)`; si ninguno está en el centro → todos; estampado sin
lista de técnicas acepta todo (L959).

**E16 · L3069/3196/3198/3212 máquina sin estado = operativa; L3028 máquina de tintorería sin `rolColor` = "ambos"**.

**E17 · L454–457 `PERM`, L461 `TIPOS_MAQ`, L2494 `MOTIVOS_REPROCESO`, L360/2431 `tiposParo`, L3421 categorías de
insumo, L2114 `TABLAS_OPERATIVAS`** · Catálogos fijos no editables.

**E18 · L516 usuario sin perfil = `consulta`; L2579 modo default `editar`**.

**E19 · L3315 `addTela` `fam:'IND', enc:8, pique:false`; L3341 tela nueva = primera del catálogo; L3423 `ud||'uds'`**.

**E20 · L3488 `guardarOrden` marca `telasManual:true` siempre** · Después de editar cualquier orden, Odoo ya no
actualiza sus telas (L3811).

---

## F · Umbrales visuales, ventanas y truncados (riesgo bajo, pero fijos)

**F1 · L1021–1027 semáforos 85 % / 100 %; L2239/2280 Reportería 85 % / 102 %; L1854 centro 102 %; L1280–1281 Plan
mensual libre >25 %, sobrecargado >105 %, vacío <50 %; L2180 kg real vs programado 3 %; L1935 ±10 puntos.**

**F2 · Ventanas de días** · L1074 entregas 7 días; L1075 tela externa 21 días; L1096 carga Odoo vieja >30 h; L1131 corte
≤3 días; L1549/2415 activo hoy+1; L1777/1827 urgente <3 días; L1852/1861 programación semana +7; L2150 Gantt +3 días;
L2400 control tintorería hoy+2; L2470 parada resuelta = ayer.

**F3 · Horizontes** · L1169 4 meses; L1292 4 meses; L1577 6 meses; L2231 4/8 semanas; L1524 12 semanas; L736/748/931
tope 400 días (fecha ficticia si se agota, L741).

**F4 · Truncados** · L1044 recursos ocultos si >3 y sin carga; L1549 6 órdenes; L1588 7 familias; L1674 40; L1699–1704
400/200; L1826 50; L1857 150; L1880 30; L2095–2096 300/600; L2185 20 programas; L2538/2550 500 salidas; L2394/2402/2419
300/200/200; L3257 bitácora 500; L3821 cargas 60; L3282 excepciones 2.000; L3624 fuera de rango 3.000.

**F5 · Textos fijos** · `TEMPOCODECA` (L1196, 1415, 1461, 2018); explicaciones con "240 kg / 200 kg", "10 horas", "3
Aeropuerto, 3Trazos, 3CD Corte", "al 80 % en jornada de 24 h", orden de centros L1312.

**F6 · L1530/1945/3398 días calendario (`/864e5`)** en errores de fecha, ganancias y lead time; L557/1384 semana ISO
propia; L543/503 locale `es-EC`.

**F7 · L591–596 `COLOR_NOMBRES`/`hexColor`** · Color visual por regex (solo estético; `khaki`/`birch` en dos familias).

**F8 · L2411 asistencia máxima 60; L2433 paro por defecto 15 min; L1561/1563 incrementos 10/25/50/100 y +1/+5.**

---

## Resumen específico: lavado y plancha (lo que ya está escrito antes de que lo configures)

1. **Quién lo lleva** — tres fuentes distintas y no coordinadas: marca de categoría `lavaDefault/planchaDefault`
   (editor y Parte 2; A10 — hoy ninguna categoría la tiene); texto de la receta Odoo `'servicio de lavado'` /
   `'lavanderia'` (importador antiguo, A13); insumo con cordón → plancha, con botón → botones (importador antiguo, A14).
2. **Cuánto toma** — cuatro valores distintos: `minEstandar` del centro convertido por medida (A8, hoy vacío → 0);
   `120` fijo para lavado (A11, A12, demo D25); `spc.plancha||1` y `spc.botones||1` (A12); SAM de la categoría si la
   hoja LMO tuviera operaciones de lavado/plancha (no las hay: D17 las mandaría a módulos).
3. **Unidad** — lavado se mide en `prendas_h` y plancha en `min` (E5); `minPrenda` invierte `60/t` para lavado (A4);
   `tiempoPaso` guarda `60/minEstandar` (A8): si cambias la medida del centro después, los `t` guardados cambian de
   significado.
4. **% que pasa** — `pctEstimado` se edita y no se usa (A9); `pctReal` solo se muestra.
5. **Cuándo se da por hecho** — `faseEstado` marca lavado hecho en toda fase 8, incluida 8Lavanderia (A1); plancha
   solo al llegar a "empaque terminado".
6. **Dónde vive** — solo los ids literales `lavado`/`plancha` reciben trato especial en Configuración (E4),
   `tiempoPaso` (A8), `costoMin` (A44 → costo de confección), `defCentroEtapa` (A26 → terminados), `CENTROS_PROD`/
   `SUBAREAS`/WIP (A41 → "terminados"), `RUTA_ORDEN` (A16 → después de botones y etiquetas). Las órdenes de trabajo de
   Odoo nunca cierran lavado ni plancha (D14).

---
*Auditoría generada leyendo `index.html` completo y consultando la configuración real de producción. No se modificó
código ni datos. No incluye propuestas.*
