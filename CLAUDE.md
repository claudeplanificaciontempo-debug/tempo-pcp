# TEMPO PCP — Sistema de Planificación y Control de Producción

## Qué es esto
Sistema de planificación y control de producción para TEMPOCODECA S.A. (TEMPO),
textil verticalmente integrado en Atuntaqui, Ecuador. Cubre: tejeduría → tintorería
→ corte → confección → empaque, con pasos opcionales (estampado, bordado, lavado,
botones, plancha).

## Arquitectura
- **Un solo archivo HTML** (`index.html`) con todo el JS embebido (vanilla JS, sin
  frameworks). El código fuente activo vive dentro de un `<script>` en ese archivo.
- **Backend: Supabase**, proyecto `bypdfogmksbxjaiydhlg` (us-west-2).
  URL: `https://bypdfogmksbxjaiydhlg.supabase.co`
  Clave pública: `sb_publishable_vycjn9icoWKANY9DPOiUDA_fXhCQG33`
- Tablas: `centros, recursos, telas, colores, rutas, operaciones, tecnicas,
  maquinas, categorias, ordenes, programas, cargas, propuestas, paros, turnos,
  bitacora, planes, salidas_tin, banos_conf` — todas con esquema
  `id text primary key, data jsonb, actualizado timestamptz, actualizado_por uuid`.
- Publicado desde este repo (rama `main`) en dos sitios que se actualizan solos al hacer push:
  **GitHub Pages** https://claudeplanificaciontempo-debug.github.io/tempo-pcp/ (siempre al día)
  y Netlify https://tempo-pcp.netlify.app (solo publica si la cuenta tiene crédito;
  en sept-2026 quedó bloqueado por crédito agotado). `test/` y `netlify.toml` se publican
  también; no poner ahí nada sensible.

## Reglas de negocio clave (tintorería — lo más delicado del sistema)

**Kilos:** los que se cargan en las órdenes son **crudos** (sin merma), no
acabados. `kgCrudo()` NO debe sumar merma — ya viene cruda. La merma solo se usa
para calcular cuánto sale acabado del baño (`kgAcabado`).

**Familias de baño:**
- Familia A (jersey 24/1 + ribb 24/1) y Familia B (fleece + french terry + ribb
  2x2) se pueden mezclar entre sí en el mismo baño.
- Telas de "baño propio" (piqué, piqué lycra — marcadas `pique:true` o `fam:'IND'`)
  van SIEMPRE solas, nunca mezcladas entre sí ni con A/B.
- Todas las telas (piqué y mezclas) se PARTEN para llenar el baño al máximo;
  solo se abre un baño nuevo cuando el actual ya está lleno (no fragmentar).

**Capacidad y llenado:**
- Cada máquina tiene `cap` (capacidad normal) y `capPique` (capacidad reducida
  para telas de baño propio).
- Un baño corre automático solo si llega al `pctBueno`% de la capacidad (90%
  por defecto); entre `pctAprob`% y `pctBueno`% requiere confirmación manual;
  por debajo, también requiere confirmación. Parámetros en `S.params`.
- Tolerancia: `tolGrande`% (5% por defecto) permite que un baño se pase un poco
  de la capacidad nominal antes de abrir uno nuevo.

**Máquinas claro/oscuro:** cada máquina de tintorería puede tener `rolColor`
('claro'/'oscuro'/'ambos'). Los colores claros van a máquinas de claros y
viceversa; la profundidad del color se detecta por código Pantone TCX
(`prefijoTCX`) y, si falta, por el nombre (`profColor`).

**Armado manual de baños ("Armar baños" en Tintorería) — regla vigente desde
el 12-sep-2026 (decisión del usuario, reemplaza "piqué siempre solo"):**
por color (Pantone), `propuestaColor(P,color,sel)` sugiere baños así:
1) dentro de cada **familia de tela** (los grupos de `armGrupos`: A, B o cada
tela de baño propio) se juntan las WH ordenadas por fecha requerida y kg y se
llenan baños consecutivos con `llenarEnOrden` — **la WH se parte** cuando no
cabe y el resto pasa al siguiente baño (la fila muestra "% aquí · resto en
Baño N"); 2) el último baño de cada familia, si no llega a `pctBueno`, es un
remanente y **los remanentes de todas las familias se mezclan** en baños
finales (`tipo:'mezcla'`). Capacidad 240 kg (`capN`) o 200 kg (`capPique`) en
cuanto el baño lleva piqué. Piezas de una misma WH que caen en el mismo baño se
funden en una fila. Selección por color en `ARM.sel[color]` (todo marcado por
defecto; desmarcar reacomoda; es la opción manual). La máquina se elige SOLO
en la barra del color (`maqc-…`, aparece cuando hay kg marcados, obligatoria)
y vale para "Confirmar baño N" (`confirmarBanoProp`) y para "Juntar todo lo
marcado" (`confirmarArmColor`, `llenarBins`; sin máquina = automática).
Lo confirmado se descuenta **por línea de tela** (`kgRestanteTela`: el `opsKg`
del baño se reparte entre las telas del baño en proporción), así el resto de
una WH partida sigue apareciendo en Armar baños.
Solo lo confirmado ocupa máquina/día real (`P.banos`). "Deshacer" quita la
confirmación y la WH vuelve a la lista.

**Calidad de tintorería (después del baño):** al registrar "salió" en Control de
piso → Tintorería, `banoListo()` marca `avance.tinturada` y pone la orden en fase
`1Calidad Tintoreria`. La orden queda "en calidad" (`enCalidad(o)`) hasta que
Calidad la apruebe (`calidadAprobar` → `avance.calidadOk`, fase `2Planificacion`)
o la rechace (`calidadRechazar` → modal `mReproceso` → `guardarReproceso`:
registra `avance.reprocesos[]` con motivo, qué se va a hacer, quién y origen
calidad/piso; marca `reproc` y fase `1Tintoreria`; el baño vuelve al plan).
Cuando ese baño vuelve a salir, `banoListo` cierra el reproceso pendiente
(`estado:'hecho'`). "Reprocesar" desde piso usa el mismo modal; "quitar" lo anula.
**Calidad NO libera a corte**: solo aprueba la tela. **Liberar a producción
exige `calidadOk`** para tela propia (`puedeLiberar`) y la hace planificación
en Liberación → "2 · A producción"; si la fase de Odoo ya es ≥2 se considera
aprobada. **Los insumos ya no bloquean la liberación** (se quitó de
`puedeLiberar`/`faltaLiberar`; la lista de insumos en la orden es solo
informativa). Los paneles "Calidad de tintorería" y "Control de reprocesos"
viven al final de Control de piso → Tintorería; en Control de piso no hay
botones de liberar.

**Baños confirmados a mano al programarse:** llevan `grupo:bc.id` (cada uno
elige su propia máquina) y solo consideran máquinas donde cabe el baño
(`capOf(r)*tolGrande >= kg`); sin eso, todos caían en la misma máquina o en
STUART (45 kg) con 250 kg.

**Baño "hecho" (Control de piso → Tintorería):** `mBanoHecho(bId)` muestra los
kg programados por tela (`b.telasKg`) y pide los kg reales por tela; guarda en
`salidas_tin` con `detalle:{tela:kg}` y llama `banoListo`. Un baño confirmado
cuyas órdenes ya están `tinturada/calidadOk/lista` (y no en `reproc`) **sale del
programa** (`programar()` lo omite) y la máquina queda libre. El rechazo de
calidad pide qué telas tienen el problema (`reprocesos[].telas`).

**Estado de tintorería según la fase de Odoo (`estadoTin(o)`):**
- `1Tintoreria` = **en tintorería según Odoo**: solo informativo
  (`ro.enMaquinaTin`); **sigue disponible para armar baños** (el usuario arma
  justamente esas órdenes). Botón "Hecho → calidad" en el panel "Estado de
  tintorería". No volver a excluirlas del armado: el 12-sep-2026 esa exclusión
  hizo que al deshacer un baño las órdenes no regresaran a la lista.
- fase 1 con "incomplet" = **incompleto**: tinturado pero faltan kg. El usuario
  anota `avance.faltaKg{tela:kg}` y **solo esos kg** entran a Armar baños
  (`kgTelaTin(o,tl)` reemplaza a `kgCrudo` en programar/armGrupos/banos_conf).
- fase 1 con "stock" = **tela en stock**: `faseEstado` la da por tinturada y
  lista → cola de liberación a producción.
- `enCalidad` = **completos** esperando calidad.
Los cuatro bloques se ven en Tintorería → "Estado de tintorería".

**Código interno de baño:** `codBano(colorN,req)` → `T<MES><AA>-<COLOR>-<NN>`
(ej. `TOCT26-DARKBLACK-03`; mes = del requerido más temprano del grupo, o del
día de confirmación). Se guarda en `banos_conf[].cod`, viaja en `P.banos[].cod`
y `salidas_tin[].cod`, y se ve en el cuadro, Control de piso, confirmados y el
modal "hecho". Tejeduría aún no tiene código propio (pendiente parametrizar).

**Armado, remanentes y máquina pequeña:** `tagArm()` etiqueta el resto de un
grupo como "baño lleno" (≥ pctBueno), "previo aprobación" (≥ granOk, se puede
soltar con aprobación) o "pendiente"; si el resto cabe en una máquina pequeña
(cap < granMin·1.2, p. ej. STUART) lo dice, y al programar un baño confirmado
que cabe en una pequeña, `programar()` lo manda solo a las pequeñas (no ocupa
una grande ni se fragmenta más). `lineaReparto()` escribe en la tarjeta, por
cada WH partida, "% aquí · resto: código 30% (COLOR), …" en una sola línea,
incluso si el resto está en baños de otros colores.

**Mover baño de máquina (conectado el 23-sep-2026; antes `selMaquinaBano` existía y no se dibujaba):** cada tarjeta
confirmada del cuadro Máquina × día lleva el `<select>` → `moverBano(id,rec,dia,kgMotor)`, que guarda `banos_conf[].rec` +
`recFijo:true` (y `programar()` restringe el pool a esa máquina; "auto" lo quita). Ofrece **las mismas candidatas que el
motor** (compatibles + `capPique>0` con piqué); cada opción dice su capacidad («piqué» si aplica) y avisa «⚠ no cabe» /
«máquina de claros/oscuros» sin prohibir; capacidad sin configurar se dice **«sin capacidad configurada»**, no 0. El aviso y la
confirmación usan el MISMO kg (el del motor, `kgMotor`); si se cancela, se redibuja. **Quién mueve no cambió**: el desplegable
sigue la misma regla que arrastrar la tarjeta (cualquiera que ve Tintorería), salvo un perfil «ver»; cerrarlo a `programa`
es decisión de la usuaria y va para las dos formas a la vez. **La expresión de fecha de `moverBano` está rota a propósito y NO
se arregla sola**: arreglarla activa `diaFijo`, que en `programar()` PISA el «no antes de que la tela esté tejida»
(asignación plana en vez de `maxD`) y deja baños —y toda la producción detrás— programados antes de tener tela.
**Albarán:** `imprimirAlbaranBanoId(bId)` usa `b.opsKg` (kg exactos por orden,
repartidos por tela) y muestra el código del baño (`ALB.cod`). **Resumen por
WH** (`resumenWHHTML`, al final de Tintorería): por cada WH, los baños/colores
en que está con código, máquina, día, kg y %.

**Tejeduría:** `resumenTelasHTML()` (arriba del cuadro) suma por tipo de tela
todo lo cargado: kg, liberados, tejidos, por tejer. Se teje por volumen.

**Motor de programación (desde el 14-sep-2026): HACIA ATRÁS.** `S.params.motor` ('atras' vigente |
'adelante' = el de siempre, intacto), se elige en Configuración → Calendario y parámetros. En `programar()` sección 3:
cada orden parte de `fechaMetaDe(o)` y se coloca de empaque a corte hacia atrás (`fluirAtras`), cada paso el día laborable
anterior al siguiente menos la espera del paso (`S.params.esperasPaso`, sembrada del 14-sep); pasada en seco y luego en
firme. Si no cabe (cruza `S.params.inicio`, la tela lista o un `desde` del centro) se programa IGUAL hacia adelante y
queda `ro.motor='atras-no-llega'` con `diasTarde`, `atasco` (la tela cuenta como paso) y `fechaPosible` → Hoy →
Advertencias de fecha (`noLleganHTML`). Colecciones (ODC; sin ODC cliente+fecha) van tarde juntas
(`ro.atrasoPorColeccion`). Tejeduría y tintorería siguen por lote (no se movieron). `programarCon(modo)` corre el otro
motor sin tocar la caché; `compararMotores` = antes/después (Capacidad y decisiones). Ver `MOTOR_HACIA_ATRAS_REPORTE.md`.

**Pantalla (14-sep-2026):** menú **horizontal** arriba (cinco grupos con desplegables: `navToggle`/`navCerrarTodo`; el
`.gbody` es `position:absolute` y se abre con la clase `abierto`; ya no hay acordeón ni `style.display` en el cuerpo). Toda
entrada de `nav` lleva ícono (`ICO_NAV` debe tener una clave por cada `data-p`). **Hoy** empieza con el índice de
**Pendientes** (`pendientesHoy`: conteo + enlace por tipo; posponer con fecha y motivo en `S.params.pendPospuestos`,
nunca desaparece). Las bandejas siguen en sus pantallas. **Asignar ODC** a mano en Órdenes (`asignarODC`, `o.odcManual`;
la tabla 14 tiene la fila `odc` y `aplicarTarea` la conserva; forma colección con ese ODC). Ver
`PANTALLA_MENU_PENDIENTES_ODC_REPORTE.md`.

**Asignación por orden (Carga general, 14-sep-2026):** `asignacionPorOrdenHTML` separa por estado con
`clasificarAsig(o,P)`: `vencidaUnPaso` (meta > 30 días atrás y UN solo paso de producción pendiente → probablemente
entregada y mal cerrada en Odoo), `sinProgramar` (con motivo: bloqueo, sin WH, sin fecha, paso sin recurso/tiempo),
`noLlega` (días tarde + atasco del motor), `justo` (holgura ≤ `S.params.colchonDias`, parámetro visible sembrado en 3 y
marcado estimado), `bien` (plegado). Una sola ficha de **próximo paso** por fila; el detalle de la ruta al clic
(`mDetalleAsig`). Agrupar/filtrar con `APO` (cliente, ODC, familia, categoría, próximo paso, mes). Solo lee el programa.

**Profundidad de color (14-sep-2026):** `profundidadDe(c)` = `fam` claro/oscuro explícito, `fam` confirmado a mano
(`c.profConf`, desde la bandeja "Colores sin profundidad" en Tintorería, `setProfundidadColor`) o prefijo Pantone TCX;
"medio" sin confirmar es el valor por defecto de la carga y cuenta como SIN clasificar. Nunca por parecido de nombre.
Regla de máquinas (motor, `maqApta` en `programar()`, desde el 14-sep-2026 noche): rol de máquina (`rolColor` claro/oscuro/ambos)
contra `profundidadDe(color)`: claro → solo rol claro (DANITECH 1), oscuro → solo rol oscuro (DANITECH 2), medio o sin
clasificar → cualquiera; baño confirmado que cabe en una pequeña y sin piqué → pequeña (STUART, rol ambos, cap piqué 0).
Ya no se usa `profColor` (nombre) para elegir máquina. Ver `TINTORERIA_REGLAS_MAQUINA_COLOR_REPORTE.md`.
**Advertencias de fecha** se muestran por movimiento (`gruposAdvertencias`, `atenderGrupo`). **Hoy** va en tarjetas
desplegables (`tarjetasHoyHTML`). **Producto en proceso → Producción** tiene lista por orden con foto y agrupación
(`wipOrdenesHTML`, incluye COLOR). Recarga del 14-sep (tarde): Odoo mandó en fase y fecha por instrucción expresa
(tabla 14 desactivada solo para esa carga). Ver `ACTUALIZACION_14SEP_Y_MEJORAS_REPORTE.md`.

**Plan mensual (14-sep-2026 noche, `vPlan`):** cinco bloques en orden: 1 días y capacidad (calendario `planMesHTML`
arriba, luego área/centro/módulos), 2 resumen (KPIs; "Vencidas" y "En riesgo" separados, enlazan a Hoy → Advertencias filtrado por mes con `irNoLlegan`/`NLF`; `atascoTxt` muestra el atasco), 3 meta,
4 **agregar órdenes al plan** (`agregarAlPlanHTML`: borrador `S.params.planMes[ym].oids`, agrupado por ODC/cliente/entrega/
familia/hija con `PMADD`, "jalar del mes siguiente", aviso de capacidad por centro ANTES de guardar con `cargaPlanCentros` =
minPrenda × prendas de la ruta vs. capacidad del mes; nunca impide), 5 congelar (`congelarPlan` guarda `oids` en `S.planes` y
`planMes[ym].congelado={ver,ts,u}`; agregar/quitar vuelve a borrador). Liberación marca "EN EL PLAN — pendiente de liberar"
(`enPlanMes`); cada centro → Carga que viene muestra `planCongeladoCentroHTML` (plan congelado, foto/WH/fase, "pendiente de
liberar"). Ver `PLAN_MENSUAL_FLUJO_REPORTE.md`.

**Bloque 3 sin repetir (15-sep-2026):** "Base del plan: lo liberado" ya no lista el detalle de las sin-liberar (solo el
número + enlace a Liberación); la facturación esperada solo cuenta órdenes cuyo `finPro` cae dentro del mes (`dentro`/
`fuera` en el cierre de `bloque3`), lo liberado que termina después se muestra aparte ("Liberado pero termina después del
mes"); línea "Liberando todo lo pendiente del mes llegas a $A (B% de la meta)" con `totalConTodo`/`pctConTodo`; la única
lista de detalle es "Por liberar" (foto/WH/fase vía `whCell`), y las órdenes que ya son candidatas de Bloque 4
(`esCand`/`enB4`) no se repiten ahí: se resumen y enlazan a `#pm-agregar` (ancla en `agregarAlPlanHTML`) en vez de listarse
dos veces. Textos: "sin bloqueo en el programa" (antes "liberadas y con fecha"), "sin liberar" (antes "sin fecha").

**Foto + WH + fase en toda lista de órdenes (15-sep-2026):** `whCell(o,px)` = `fotoMini` + WH + `faseTag(o)` (etiqueta
`.fase-mini` con la fase de Odoo). Se usa en Liberación, Control de piso (tej/tin/pro), Tintorería (estado, resumen WH, reprocesos,
faltantes, cuadro, modal hecho, baños confirmados), Producto en proceso, Programación por centro, Asignación por orden, Costura
(secuencia y rojas), Modo línea y Balanceo. Toda lista nueva de órdenes debe usar `whCell`. **Buscador como Odoo:** `busqHTML(id,valor,setter)`
renders el campo; al escribir ofrece "Buscar <campo> por: <texto>" (WH, ODC, estilo, color, fase, cliente, categoría); elegir uno guarda
`BUSQ[id]` y `matchBusq(o,q,id)` acota a ese campo (Enter = todos). Pantallas: Órdenes (ORDF.q), Liberación (LIB.q), Producto en proceso
(WIPL.q), Asignación por orden (APO.q), Centro (CEN.q), Control de piso (CTL.q), Plan mensual → agregar (PMADD.q). Ver `FOTOS_FASE_BUSCADOR_REPORTE.md`.

**Mi centro (tablet, 15-sep-2026, `vTablet`, página `tablet`):** perfil `tablet` (sembrado idempotente en `perfilesDef`; solo la página
Mi centro; `perfilDe` le da como centro el asignado en `S.params.tablets[uid]={centro,rec}`, columna Tablet de Usuarios). Cola con
`tabletFilas` (= `colaCentro` + recurso; en módulos sigue `P.secMod`), tarjetas con foto grande, WH+fase, producto, color, cliente,
hechas/total, entrega, tallas; "Hecho" = `marcarHechoCentro` (completo; parcial por `permiteParcial`); cronómetro opcional
`cronoTablet` → `S.avance[oid].crono[c]={ini,fin,min,u}` vs `minEstandarOrden`. Admin/planificación ven cualquier centro con `TAB`.
**PDF del programa por centro:** `imprimirProgramaCentro(cid)` (botón en Centro → Programación): ventana nueva A4 horizontal con
puesto, foto, WH, cliente, producto, color, min estándar y unidades; nada interno. **Cambio de fases:** Control de piso → área
"Cambio de fases" (`fasesCentralHTML`, estado `CTLF`, buscador `CTLF.q`); `moverFases(ids,f,motivo)` (motivo obligatorio → `o.fases[].motivo`,
bitácora); `faseTag` es clicable en toda pantalla → `mCambiarFase`. De 1Tejeduria a 0Ord Compras: `pasarACompras` cambia la ruta
(tej → proveedor con `diasProvOrden`), marca `telas[].ext='ext'`, `o.compraTela` y `S.params.alertasCompras[]` → Hoy → Pendientes
(`pasoCompras`) y panel en Compras del mes (`alertasComprasHTML`, "pedida" = `atenderCompra`). Ver `CONTROL_LINEA_PDF_FASES_REPORTE.md`.

**Nada se borra (15-sep-2026):** la bitácora y `salidas_tin` no se recortan; `TABLAS_OPERATIVAS` no incluye bitácora; las siembras
`centrosPorOrden/reglasFamCentro/clasifMaterial/propuestaFalta/centroEtapa/camposConservados` solo entran si la tabla NO existe
(`Array.isArray`); la recarga Parte 2 no elimina órdenes (quedan `estado:'noArchivo'`) ni borra avance; `importJSON` (botón Restaurar)
confirma y une la bitácora; toda función `del*/borrar*/limpiar*/vaciar*/quitar*/eliminar*/deshacer*/retirar*` pide confirmación. La prueba
GUARDIA del simulador falla si aparece una función de borrado nueva o sin confirmación. Ver `AUDITORIA_BORRADOS_Y_RESPALDO.md`.
**Agrupación colapsable** (`GRP_CAMPOS`, `grpSt/grpSelHTML/filasGRP/grpMap`, estado `GRP` + localStorage) en Órdenes, Liberación, Control de
piso y Producto en proceso: hasta 3 niveles (fase, cliente, ODC, padre, hija, color, proyecto, etapa). **Gantt de tintorería**: `diasBano(b,r)`
pinta los días siguientes ("sigue · día n de N"), solo vista. **Aviso de capacidad del plan** con minutos pendientes (`cargaPlanCentros`).

**Reportería (pestaña propia, 15-sep-2026):** grupo `data-g="rep"` del menú con Vista general de órdenes (`vVistaOrdenes`, página
`vistaordenes`, estado `VO`, agrupación `GRP 'vo'`, detalle `mDetalleOrden` = `mDetalleAsig(oid,extra)` + historial de fases + foto), Producto en
proceso, Cumplimiento, Avance del mes y las dos reporterías; Producto en proceso, Cumplimiento y Avance ya NO están en Dirección (solo en Reportería, 15-sep). Registro
`REPORTES[]` (agregar un reporte = una entrada + su <a> en el menú) y `reporteriaBarraHTML` que `render()` inserta arriba de cada
reporte. Perfiles de supervisores reciben esas páginas una sola vez (`S.params.migReporteria`, bitácora); tablet no. Ver
`REPORTERIA_PESTANA_REPORTE.md`.

**Ajustes de capacidad por semana y simulador (15-sep-2026):** `S.params.ajustesCap[ym].semanas[lunes][recId]={min,pers,efic,base,motivo,u,ts}`
(solo lo que difiere de la base; la base de Configuración no se toca). `capDia(r,d)` consulta `ajusteRecDia(r,d)` (guardado, o simulado
si `SIM.on`); la asistencia del día manda sobre personas. Plan mensual → Bloque 1: `simuladorCapHTML` (estado `SIM`, `simSet`, `simCopiar`,
`guardarAjustesCap` con motivo obligatorio y bitácora, `quitarAjusteCap`), `ajustesCapPanelHTML` ("480 base + 60 extra = 540 (sem. 1, 2)"),
`extrasResumenHTML` en el Bloque 2; Capacidad y decisiones marca "extras" (`tieneExtras`). Semanas cacheadas en `SEMC` (se limpia en `render`).
Ver `SIMULADOR_CAPACIDAD_PLAN_REPORTE.md`.

**Plan mensual, base en proceso (15-sep-2026):** `planBase(ym)` = abiertas cuyo grupo de fase tiene la columna `enProceso` (tabla 5, sembrada planificación en adelante; `enProcesoPlan(o)`), de cualquier Proyecto, minutos pendientes; `planMesOidsTot` = base ∪
agregadas; `cargaPlanCentros` y `congelarPlan` usan el total; "Agregar" solo grupos sin enProceso (`PMADD.grp` por defecto 'fase'); Bloque 1
"Por centro" es `centrosCompactoHTML`; metas semanales ocultan semanas vacías (`semV`); simulador colapsa semanas sin carga
(`SIM.verVacias`). **Tejeduría manual (15-sep):** sin grilla automática; `progTejPanelHTML` (`S.params.progTej[]`: tela, rec, dia, kg, u, ts;
`addProgTej` (avisa sin impedir: tela fuera de `kgTela` o kg del día > `kgDiaTela`; `p.aviso`, bitácora CON AVISO)`/setProgTejRow/delProgTejRow`, `cargasTejPorTela` pedido vs cargado). Bandeja Hoy `sinMesProyecto`. Programa del día ya no imprime tejeduría; Stock de tela
cruda es la primera entrada de Planificación textil. Ver `OBSERVACIONES_PLAN_TEJEDURIA_REPORTE.md`.

**Liberación:** son dos páginas distintas por menú (misma `vLiberacion`, sin
pestañas): "Liberación" (Dirección, `LIB.et='tela'`, la principal) y "Liberación
a producción" (Planificación de producción, `LIB.et='corte'`).

**Operaciones (desde el 12-sep-2026):** se cargan desde la hoja LMO de
OPERACIONES.xlsx con `mCargarLMO()`/`planLMO()`/`aplicarLMO()`; el centro
TEMPO de cada fila sale de la tabla editable familia de operación → centro
(`reglasFamCentro`, Configuración → Operaciones → Mapeo) y las categorías se
vinculan con la tabla padre/hija → categoría LMO (`mapaCatLMO`). Ya no existe
`LMO_BASE` ni `cargarLMOBase()`.

**LEER PRIMERO `TRASPASO_TEMPO_PCP.md`** (versión 2026-09-13): principio
"lo configurado manda sobre el código", las 7 tablas de Configuración →
Órdenes y materiales, las 42 fases y sus grupos (CD = colas, línea del corte),
las dos liberaciones (textil desde el grupo textil, producción desde
planificación), el tramo estampado/bordado/confección NO secuencial resuelto
por las órdenes de trabajo de Odoo, tejeduría contra stock con 2 semanas de
anticipación, tintorería por armado de baños, lavado/plancha/bordado
pendientes de configurar, la auditoría de 187 reglas fijas y los pendientes.
Donde este archivo contradiga al traspaso, manda el traspaso.

**Perfiles (tabla `perfiles` en Supabase):** `rol`, `area` (piso: tej/tin/pro),
`subarea` (piso en producción: corte = corte+estampado+bordado · confeccion =
modulos · terminados = etiquetas+botones+lavado+plancha · empaque) y `modo`
(`editar` | `ver`). `puede()` devuelve false con `modo:'ver'`. `veArea/veCentro`
= puede mirar; `puedeArea/puedeCentro` = puede registrar. Control de piso y los
módulos por centro filtran por `veCentro` y habilitan por `puedeCentro`. Las
columnas `subarea` y `modo` NO existen en producción (13-sep-2026); `modo` es opcional (`SUPABASE_PERFILES.sql`). Desde el 13-sep los perfiles salen del catálogo `S.params.perfilesDef` (Configuración → Usuarios); `rol` guarda el id del perfil. Ver `PERFILES_CENTROS_BALANCEO_REPORTE.md`.

**Reportería (`vReporteria`, página `reporteria`, estado `REP`):** vista
"textil" (tejeduría y tintorería: carga h vs capacidad por máquina y semana, kg,
baños, salidas, en calidad, reprocesos) y vista "producción" (una sección por
sub-área: min vs capacidad por recurso, plan vs real por semana, paros). Al final
siempre "Resumen de todos los procesos" por centro, filtrado por lo que el
perfil puede ver. Enlaces en el menú: "Reportería textil" y "Reportería por área".

**Componentes comunes, tema y responsive (15-sep-2026):** se construyen UNA vez y se reutilizan; ninguna pantalla
copia el suyo. **Filtro de fases**: `filtroFasesHTML(fasesAll,sel,varName,togFn,cuentas)` (desplegable con los grupos de la tabla 5
vía `grupoDe`, "Seleccionar todas"/"Limpiar", `togGrupoFiltro`, centinela `'∅'` = ninguna); `selFases` solo lo llama; lo usan
LIB.fases, ORDF.fases y FAM.fases. **Agrupador**: `GRP_CAMPOS` + `filasGRP` con campos nuevos `paso` (próximo paso) y `mes`, y
horas por grupo (`minPendiente/60`); Asignación por orden migró de `arbolAPO` a `filasGRP('apo',…)`; cola por centro, Plan →
agregar y Carga por tipo de producto siguen con el suyo a propósito. **Tarjeta resumen**: `tarjetasResumenHTML(cards)` +
`TARJ.exp`/`togTarj` (`data-t="<id>"`, lista desplegable con `whCell`) en Plan bloques 2 y 3 y en Mi centro. **Motivos (tabla 15, corregido el 15-sep tarde)**: el motivo se exige SOLO al devolver. `esDevolucionFase(actual,nueva)` mira primero la columna **secuencia** de la tabla 1 (`secuenciaDe`, editable, SIN sembrar; menor = devolución, igual = fases paralelas `fasesParalelas`) y, si a alguna de las dos le falta, cae a la regla por grupo de la tabla 5 y la fase sale en la bandeja `faseSinSecuencia` de Hoy (`fasesSinSecuencia`). Propuesta de numeración en `SECUENCIA_FASES_DEVOLUCIONES_REPORTE.md`. Regla anterior por grupo (`ordenDeFase`; `mismoGrupoFase`, `retrocesosMismoGrupo` para reportar). Avanzar o moverse dentro del mismo grupo NO pide motivo y se audita con `dev:false`. Revertir liberación sí lo exige. Los motivos de reproceso viven en la misma tabla con `uso:'reproceso'` y conservan la columna `tejeduria` (`migrarMotivosReproceso`, bandera `S.params.motivosMigrados`, el arreglo `motivosReproceso` viejo se conserva; `motivosReproceso()` ahora devuelve `motivosDe('reproceso')`). Bandeja `motivosDev` en Hoy → Pendientes mientras falten motivos de devolución o de reversión. Ver `MOTIVO_SOLO_AL_DEVOLVER_REPORTE.md`. Detalle:
`S.params.motivos[]={motivo,uso}` con `USOS_MOTIVO` (fase | liberacion | piso), `motivos()/motivosDe/motivoValido/selMotivoHTML`,
`add/set/delMotivoRow` (del con confirmación, en la lista GUARDIA); `moverFases` rechaza motivos fuera de la tabla, `retirarLib(id,et,motivo)`
lo exige y se abre por `mRetirarLib`; todo va a `S.params.auditoriaCambios[]={ts,u,tipo,oid,op,antes,despues,motivo}` (`registrarAuditoria`)
y se ve en Auditoría (`auditoriaCambiosHTML`). **Atrás**: `NAVH`/`navSnap`/`volver`/`atrasHTML`; `ir(p)` apila y el clic del menú limpia
la pila (`NAV_PROG`). **Tema**: tokens `--t-primary/--t-accent/--t-accent-soft/--t-card/--t-block/--t-thead` en `:root` (único lugar para
cambiar de paleta) aplicados a `.kpi.tarj`, `.panel h3`, `thead` y la cinta de bloque del plan. **Responsive**: `#navBtn` (☰) y el
`@media (max-width:860px)` (menú colapsable `nav.abierto`, cabecera en dos filas, tarjetas en columna, tablas con scroll propio).
Ver `COMPONENTES_COMUNES_TEMA_RESPONSIVE_REPORTE.md`.

**Dirección · Hoy y Escenarios (15-sep-2026 noche):** la página **Escenarios** se borró entera (menú, sección, `vEscenarios`, `ESC`, `conEscenario` y el enlace de Programación por centro); no guardaba nada en base, todo era memoria. **Hoy** (`vPanorama`) usa `tarjetasResumenHTML` arriba (ids `hoy-*`), una sección **Bandejas del día** (`hoyBandejasHTML`, ids `hb-*`: sin fecha, por liberar, entregas de la semana, en riesgo, vencidas, por terminar en 7 días, tela por llegar, por liberar a corte) y **Necesita decisión** (`hoyDecisionHTML`, ids `hd-*`: baños, capacidad, no llegan, faltantes) que SOLO enlaza a Capacidad y decisiones (sigue siendo pantalla aparte). Las listas de tarjeta se agrupan por familia (`card.porFam`, `famDeOrden`) y cada fila tiene `irEstadoOrden(oid)` (Órdenes / Compras / Liberación / Tintorería / Centro del próximo paso / Control) que usa `ir()` y por eso deja el «← atrás». `seccionHoy(titulo,nota,cuerpo)` pinta las cintas de sección. Mes en curso sin cambios. Ver `DIRECCION_HOY_REPORTE.md`.

**Tejeduría en el motor (15-sep-2026 noche, AUTORIZADO B1 · solo la sección 1 de `programar()`):** los kg de cada tela se
reparten por fecha requerida (la más cercana primero) en tres fuentes: 1) **stock de tela cruda** (`stockTela()`; esos kg no se
tejen, `ro.tejStock`, tela lista desde `inicio`), 2) **programación manual** (`progTej()` por fecha; `ro.tejManualKg`, entradas
`P.tej[].manual`, tela lista al día siguiente) y 3) **corrida automática** de siempre, marcada `estimado:true` / `ro.tejEstimado`
(«fecha estimada por el sistema · sin programar a mano»). `res.tejOrigen[tela]={stock,manual,estimado}` alimenta
`cargasTejPorTela` (pedido vs cargado con tres columnas). `TEJ_MODO` (nuevo | viejo) lo usa SOLO `compararTejeduria()` /
`comparaTejHTML()` (panel antes/después en Tejeduría: qué órdenes cambian de fecha de tela lista y cuántos días). El resto del
motor no se tocó. Ver `TEJEDURIA_MOTOR_STOCK_MANUAL_REPORTE.md`.

**Plan Bloque 2 contra la fecha meta (15-sep-2026 noche):** `calcularPlan` cuenta vencidas y en riesgo con `fechaMetaDe(o)`
(compromiso si existe, si no la de Odoo), la misma que usa el motor; los textos dicen «fecha meta». Ver
`PLAN_BLOQUE2_FECHA_META_REPORTE.md`.

**Liberación por bloques (15-sep-2026 noche):** `vLiberacion` (las dos páginas) se arma con `bloqueLib(n,titulo,nota)`:
1 Por liberar (botones arriba + lista `#lib-lista` que siempre está en el DOM y se colapsa con `display:none` según
`LIB.verLista`; familias y tela/color en `<details>` cerrados con totales en el summary), 2 Liberadas, 3 Resumen
(tarjetas `lib-r-*` + `cargaLib()`), 4 Órdenes liberadas (`LIB.q4` con `busqHTML`, agrupador `lib4`, `mRetirarLib` y
`mCambiarFase`). El agrupador común ganó `grpSt(id).selFn` + `g.mapa[key]` (ids por grupo) para «seleccionar todo»
(`selGrupoLib`); la posición de la lista se recuerda en `LIB.scroll` (`recordarScroll`/`restaurarScrollLib`).
**Ruta por defecto**: `c.rutaDefecto` por centro (Configuración → Centros), `sembrarRutaDefecto()` una sola vez en
corte/modulos/empaque con bandera `S.params.rutaDefectoSembrada`, `centrosRutaDefecto()`; `mRutaCentro` marca esos pasos
cuando la orden no tiene `rutaEditada`; `ordenesContraRutaDefecto()`/`contraRutaHTML()` reportan las cargadas que la
contradicen. Ver `LIBERACION_BLOQUES_REPORTE.md`.

**Centros de producción (15-sep-2026 noche):** `vCentro` usa los componentes comunes: filtro de fases en la cabecera
(`CEN.fases`, `togFaseCEN`, `faseOkCEN` filtra `filas`), agrupador común en la cola (`filasGRP('cen',…)` con
`grpSt('cen').todoAbierto=true`, que invierte el colapso: en una lista de trabajo los grupos vienen abiertos) y en
Carga que viene (`filasGRP('cenv',…)`). `resumenDiaFamiliaHTML` (día × familia, unidades y horas) va arriba de la
programación; `cruceFamFaseHTML` (familia × fase, se da vuelta con `CEN.cruce`) y la tarjeta `cv-sinlib` van en Carga
que viene. Confección: `seccionesModulos`/`modKPIsHTML` (una tarjeta por módulo y la maquila aparte).
`ordenarColaPorColor(c)` renumera `progCentro[c].pri` juntando colores (vista y orden manual, bitácora, NO toca el
motor). `marcaCentro(o,P)` reemplazó a la fecha de entrega en las vistas de centro (etiquetas prioridad / va tarde).
`vCostura(el,embebido)` se renderiza como pestaña `CEN.tab==='costura'` del centro Confección y la entrada suelta del
menú se quitó. Qué faltaría para secuenciar por color en el motor: ver `CENTROS_REPORTE.md`.

**Piso y tallas (15-sep-2026 noche):** tabla **16 · Tallas** (`tallasJuegos`/`tallasCat`, juegos con orden de
presentación y juego por categoría; `add/set/delTallaJuego` con bitácora, del en la lista GUARDIA). Carga masiva:
`mCargarTallas`/`leerTabla` (xlsx por CDN o CSV)/`colDe` (columnas por nombre)/`planTallas` (detecta formato largo o
ancho)/`previaTallasHTML` (encontradas, WH inexistentes, suma ≠ cantidad, tallas nuevas)/`aplicarTallas` (confirma,
guarda `o.tallasPedido` + `tallasPedidoMeta`, bitácora, resumen en `S.params.tallasCarga`). `tallasPedido` está en la
tabla 14 (`defCamposConservados`). Registro por talla: `baseTallas(o,c)` (corte manda; si no, lo pedido; si no, solo
total), `mRegistroTallas`/`guardarRegistroTallas` (suma, avisa al exceder, `S.avance[oid].tallas[centro]` y
`tallasLog[]` con quién/cuándo/centro/talla/unidades), `difTallasHTML`, `mHechoTotal`, `ordenesSinCurva` (bandeja
`sinCurvaTallas`). Mi centro: `tabletBuscadorHTML` (solo lo programado; WH existente fuera del centro sale bloqueada)
+ `pedirReprogramacion`/`atenderReprog`/`reprogPanelHTML` (bandeja `reprog`). Cronómetro en segundos (`k.seg`,
`cronoTxt`, `cronoCorriendoTxt`) y con `k.tallas` del tramo. `mFasePiso`/`guardarFasePiso`: observación de la tabla 15
(uso piso) + motivo solo si la secuencia baja. Teléfono: `@media (max-width:520px)` para `.tab-card`, `#p-tablet` y
`#p-control`. Ver `PISO_TALLAS_REPORTE.md`.

**Carga: una sola cuenta (15-sep-2026 noche):** `cargaUnica(base,{ym,ordenes})` con `base` = `programadas` |
`abiertas` | `plan` (`ordenesBase`, `CARGA_BASES`, `CARGA_BASE_TXT`, `notaBaseHTML`). Devuelve por centro
`{firme,proceso,reserva,pz,n}` con la MISMA fórmula (`minPendCentro`); lo único que cambia es el conjunto de órdenes.
`cargaPlanCentros` la llama; Carga general y Capacidad y decisiones muestran su base en pantalla; el número oficial del
mes es `cargaOficialMes(ym)` (plan congelado) y `refOficialHTML` lo muestra cuando difiere. Reserva: solo lavado y
plancha (`centrosReserva`, `reservaDe`, `reservaCentroDatos`); sin `minEstandar` o `pctEstimado` → cero y bandeja
`reservaSinDatos` en Hoy. **Carga general** (`vPro`, estado `CG`) es solo consulta: área/centro, filtro de fases y
buscador comunes, bloque de semanas (`semanasCarga`, parámetro `semCarga` = 8), cruce familia × centro y detalle con
`filasGRP('cg')` + `irEstadoOrden`. **Asignación por orden** se mudó a Reportería (`vAsignacion`, página `asignacion`).
Ver `CARGA_GENERAL_REPORTE.md`.

**Balanceo etapa 1 (15-sep-2026 noche):** tabla **Tipos de máquina** (`tiposMaq`, `sembrarTiposMaq` siembra un tipo por
nombre distinto de la hoja SIN agrupar; los TP quedan `porConfirmar`), `normMaquina(nombre)` resuelve por alias de tipo
activo y `opsConfeccion` la usa. **Operarias** (`operarias`, `NIVELES_ESP` 1/2/3, `operariasDe`) con nombre, módulo y
especialidad; llenarla no es obligatorio. Parámetros `tolPuesto` (2 %, reemplaza el 1.02 de `repartirPuestos`) y
`nivelMinEsp` (2). Balanceo abre con `modulosVistaHTML` (personas, máquinas, operarias y referencia en curso).
`delTipoMaq`/`delOperaria` están en la lista GUARDIA. Ver `BALANCEO_ETAPA1_REPORTE.md`.

**Búsqueda general y textos (15-sep-2026 noche):** barra `busquedaGeneralHTML` en la cabecera (`#busg-host`, la inyecta
`render()`), estado `BUSG`, `buscarGeneral` sobre `ordenesQueVe()` (respeta perfiles) y `abrirFichaOrden(oid)` (foto,
ruta con el paso actual, fechas, avance por talla e historial). El buscador de lista ya filtra por todos los campos y el
menú solo ofrece acotar. `GRP_CAMPOS` es ahora un getter que arma las etiquetas desde la **tabla 17 · Textos de
pantalla** (`ayudas()`/`ayuda(k)`/`AYUDAS_DEF`): Familia, Tipo de producto, y el orden Cliente, Fase, Familia, Tipo de
producto, Color, ODC, Mes, Próximo paso, Proyecto, Etapa. La agrupación se guarda por usuario (`claveUsr()` en la clave
de localStorage). Buscador común agregado en Entregas (`EG.q`), Costura (`COS.q`) y el detalle de Capacidad y decisiones
(`CAPD.q` + `filasGRP('cap')`). Ver `BUSQUEDA_AGRUPADOR_REPORTE.md`.

**Mi centro (16-sep-2026, 8ª entrega):** `tallasSegHTML` con `tallas` vacío ya no devuelve solo el aviso: dibuja una
fila única con `filaTallaTramoHTML(o,t,c,TALLA_TOTAL,hechoC,o.cant,'Total')` (misma función que las filas por talla, con
`setTallaTramoVal` para el número editable e `inputmode=numeric`); la clave es `(total)`, la misma de
`confirmarHechoCentro`, así que suma en `hechasDelDia` y en `avance.centros`. `guardarTramo` con 0 unidades PREGUNTA en
vez de bloquear, y guarda las unidades en `t.pz` (antes pisaba `t.u`, que es quién empezó el tramo; `tramosDelDiaHTML`
cae a `t.uFin` en los tramos viejos). `tabletBuscadorHTML(c,cola,rec)` siempre pinta el resultado con
`tarjetaWHTabletHTML(o,c,rec,fila)`: INICIO si está en la cola de ese puesto, «pedir reprogramación» si no, y aviso con
enlace si hay un tramo abierto (`tramoAbiertoDe`) o uno pendiente de confirmar (`TRAMO.paso==='tallas'`) de otra orden;
hasta 6 tarjetas, primero las de la cola. Ver `MI_CENTRO_UNICO_REPORTE.md` (8ª entrega).

**Mi centro (15-sep-2026 noche, 6ª entrega):** `hechasDelDia(centro,rec,dia)` es la ÚNICA cuenta de lo hecho en el día: suma `avance.tallasLog` (tramo y registro por total, que ahora también deja línea con talla «(total)») y agrega `hechoC` solo si esa orden no dejó línea ese día. La usan la tarjeta de Mi centro y «Hecho hoy» del centro. `guardarTramo` además suma a `S.turnos` (pz/std/ops), que es lo que leen Reportería y Ejecución. Bitácora del tramo con « · N paros». **5ª entrega:** `arrancarCrono()` se llama al final de `render()` (antes había quedado en `vLiberacion`, por eso el reloj no corría). El operario (`esOperario()`) usa un campo simple `#tab-wh` (inputmode numérico, Enter o botón Buscar) que acepta «28300» o la WH completa (`calza()` compara también solo dígitos); los demás perfiles siguen con `busqHTML`. `LISTO` (falso hasta `entrar()`) evita el parpadeo: `render()` sale temprano y `#app.cargando` oculta menú, cabecera y páginas mostrando «Cargando…». INICIO/PARO/REANUDAR/FIN llaman a `save()` en el momento, así el tramo queda en `avance` aunque se cierre la tablet. **3ª entrega:** reloj vivo `#crono-vivo` + `tickCrono/arrancarCrono/fmtHMS` (actualiza SOLO el texto; `data-ini`, `data-paros`, `data-pausa`). Paros del tramo sin minutos: `mPararTramo`→`pararTramo` (motivo de la tabla 15 uso **paro**) y `reanudarTramo` calcula `min`; `paroAbierto`/`minParos`. `sembrarMotivosParo` migra `S.params.tiposParo` (bandera `parosMigrados`) dejándolos `activo:false`, y ASEGURA uno por uno Almuerzo (`esAlmuerzo`), Cierre del día (`cierreDia`) y Fallo de máquina (si el nombre ya existe solo agrega la marca). `motivosParo()` devuelve solo los `activo!==false`; la tabla 15 tiene columnas activo, almuerzo y cierre del día; `tiposParo` ya no está en los parámetros por defecto. `calcTramo`: si hay paro de almuerzo NO descuenta el horario (`almuerzoMarcado`), si no avisa (`avisoAlmuerzo`); `tramosOlvidados` mide tiempo EFECTIVO (el cierre del día no dispara aviso). `tablaTallasTramoHTML` (Pedido/Cortado/Hechas/Faltan con + − +10 +25) durante el tramo y `tallasSegHTML` al cerrar. Operarios: `esOperario()` (perfil tablet) entra directo sin selectores, `ordenesQueVe` lo acota a su recurso, alta con centro y recurso en `mNuevoUsuario`/`crearUsuario` y `recursosSinAsignar()`. **Mi centro único (corregido):** Modo línea BORRADO (función, despachador, sección, catálogo, ícono y estado; asistencia/paros/segundas siguen). `personasTramo(rec,c,dia)` elige asistencia del día → ajuste de la semana (txt «planificado para la semana (sin asistencia registrada hoy)») → personas del recurso → 1 (y dice cuál usó en `persFuente`/`persTxt`). Descansos = **ventanas** por centro (`S.params.horarios[c].ventanas[{ini,fin}]`, tabla 18, `addVentana/setVentana/delVentana`); `minutosVentana(ini,fin,c)` descuenta solo el solape. Segundas por talla en el tramo (`t.segundas`, `setSegTramo`) suman a `S.avance[oid].seg[centro]` (un solo dato con Control de piso) y `calcTramo` da `minPrendaReal` (buenas) y `minPrendaTot`. Botones de avance rápido con `pasoRapido1`/`pasoRapido2`. **Tramos de trabajo:** `S.avance[oid].tramos[]` =
`{id,centro,rec,ini,fin,u,uFin,paros:[{min,motivo,ts,u}],tallas:{},min,minPersona,pers,minPrenda,excede,corregido}`.
Flujo en Mi centro con `flujoTramoHTML(c,rec,cola)` y estado `TRAMO` (elegir orden → `iniciarTramo` → `mParoTramo` →
`terminarTramo` → unidades por talla con `setTallaTramo` → `guardarTramo`). Fórmula única en `calcTramo(t,o)`:
trabajado = fin − ini − paros − `descansosCentro(c)` (hoy NO hay horarios con descansos: `centrosSinDescansos()` lo
reporta), minutos-persona = trabajado × `personasRec(rec,c)` (módulos: personas del recurso; el resto 1, marcado),
min/prenda real = minutos-persona / unidades, con semáforo contra `minPrenda` y parámetro `tolMinPrenda` (15 %).
Olvidos: `tramosOlvidados()` usa `topeHorasTramo` (10 h), avisa en Mi centro y en la bandeja `tramoSinFin`; el
supervisor corrige con `mCorregirTramo`/`corregirTramo` (motivo de la tabla 15 + `registrarAuditoria`). Una orden
abierta por recurso (`tramoAbiertoDe`). **Modo línea** salió del menú y de los perfiles (ahora llevan `tablet`) y
`vLinea` redirige a Mi centro del mismo módulo; la función todavía NO se borró (lista en el reporte). Ver
`MI_CENTRO_UNICO_REPORTE.md`.

**Tablet y permisos (15-sep-2026 noche):** el guardado fallido YA NO recarga: `SAVE_ERR` + `avisoGuardado()` dejan
lo registrado en pantalla con botón Reintentar (`#aviso-guardado` arriba de Mi centro) y distinguen el fallo de RLS.
`verBotonesAdmin()` oculta Respaldo y Restaurar salvo `puede('config')`. El buscador de WH (`tabletBuscadorHTML`) va
arriba de todo en Mi centro. Políticas de Supabase: la clave anon no puede leer `pg_policies`; quedan
`SUPABASE_POLITICAS_ACTUALES.sql` (consultas para volcarlas) y `SUPABASE_POLITICAS_TABLET.sql` (**EJECUTADO en producción
el 15-sep-2026**: escritura insert/update, sin delete, en avance, bitacora, turnos y paros para tablet, corte, modulos y terminado;
la lista de roles está fija en las políticas: un perfil nuevo del catálogo no escribe hasta ampliarla — pendiente P02 del
estado del sistema. Las políticas no acotan por fila). El tramo, las
tallas y las segundas viven dentro de `avance`; la asistencia en `turnos`. Ver `TABLET_PERMISOS_REPORTE.md`.

**Centros, limpieza (15-sep-2026 noche):** la pestaña **Carga que viene salió de los centros**: `cargaQueVieneHTML`
se llama ahora desde `vPro` (Carga general) con el centro de `CG.centro`; `CEN.tab==='viene'` cae a `plan`. En la
pestaña Planificación el total de la semana va en grande con `--t-primary`, «Vienen después» dejó de ser `<details>` y
vive en el mismo bloque con la columna **Dónde está** (`dondeEstaCentro(o,P,c)`, color por cercanía al centro), y la
fecha de entrega salió de las dos tablas. `grpSelHTML('cg')` se muestra en la barra de Carga general. Ver
`CENTROS_LIMPIEZA_REPORTE.md`.

**Rutas confirmadas (15-sep-2026 noche, PARTE A):** `o.rutaConf={estado,origen:persona|odoo,u,ts,nota}`;
`rutaConfirmada(o)`, `confirmarRuta`, `desconfirmarRuta` (auditoría tipo `ruta`). Guardar en el editor confirma
(persona); la ruta por defecto de Configuración NO confirma. `diagRutaOdoo(o)` compara el conjunto de centros de las
OT (sin canceladas ni bodegas, todas con centro TEMPO, sin contradicción) contra `pasosRutaDe(o)`: solo si es
EXACTO se puede confirmar sola. `analizarRutasOdoo()` cuenta por motivo (coincide, difiere, sinMapear,
contradiccion, sinOT) y `confirmarRutasOdoo()` aplica solo las que coinciden y NUNCA pisa una confirmación de
persona. Pestaña **Rutas** en Órdenes (`ORDF.tab`, `RUT`, `rutasHTML`): tarjeta de pendientes, lista por
**referencia** (`aplicarRutaARef(oid,soloEsta)`) y lista de confirmadas. `precargarRutasNuevas()` deja la ruta de la
referencia en las WH nuevas, sin confirmar. `puedeLiberarA` devuelve false sin ruta confirmada y `faltaLiberarA`
dice «falta confirmar ruta»; bandejas `rutasPorDefinir` y `libSinRuta` en Hoy. `rutaConf` está en la tabla 14.
Ver `RUTAS_Y_LIBERACION_REPORTE.md`.

**Liberación según el boceto (15-sep-2026 noche, PARTE B):** las dos páginas (`LIB.et` tela | corte) quedan en TRES
bloques sobre una sola base: **las órdenes del Proyecto del mes** (`baseLiberacion(et,ym)`, selector «Mes del Proyecto»
con `LIB.ym`; arranca en el mes en curso una sola vez por `LIB.ymAuto`, «Todos los meses» = `null` y se respeta).
`pendLiberacion`/`libLiberacion` parten esa base y **liberado + pendiente = total** (probado en órdenes, prendas y kg).
**Bloque 1** `bloqueLibB1`: fila superior a todo el ancho (tarjeta de pendientes + ODC/Familia/Cliente + agrupador +
buscador; `LIB.odc` nuevo, Familia y Cliente reusan `LIB.fam`/`LIB.cli` y salieron del panel de arriba), botones de
liberar, **tarjetas por familia** de mayor a menor (`LIB.fam2`) y detalle al tocar una (`filaLibB1`: foto, WH, fase,
cliente, color, prendas, entrega, chips «qué le falta» por tela, control de ruta y **Qué la frena** con «falta
confirmar ruta →» → `irRutaDeOrden`). `LIB.verLista` = «Ver todas las pendientes»; al buscar o agrupar se abre sola.
Producción sigue una por una (`celdaLibProd`, las dos verificaciones). **Bloque 2** `bloqueLibB2`: grilla 2×2
(`.lib-grid`, una columna ≤520px) con familia, tipo de producto, tela en kg y color, todas con `resumenLibPor` +
`barraLib` (**% = liberado ÷ total**; con `LIB.sel` la barra pinta en `--t-accent` cuánto subiría). No la tocan los
filtros del bloque 1 y la nota lo dice. Debajo, las tarjetas del resumen y el desplegable «Qué cargó lo liberado»
(tejeduría, tintorería y centros). **Bloque 3**: Órdenes liberadas con buscador y reversión auditada.

**Piso: guardado, total sin tallas y cierre del paso (16-sep-2026):** `TABLAS_PISO=[avance,bitacora,turnos,paros]` y
`perfilSoloPiso()` (columna `soloPiso` del catálogo de perfiles; por defecto `PERFILES_PISO_DEF` = tablet, corte, modulos,
terminado, piso, piso_tej; planificación NO). `_save()` salta las tablas que esa sesión no puede escribir (incluido
`params`, o sea todas las siembras) sin intentarlo ni contarlo como error; `ULT_SALTADAS` las recuerda y `SAVE_ERR.tablas`
nombra en palabras dónde falló (`TABLAS_N`/`nTabla`). Lo que el piso hace fuera de esas tablas va a `avance`:
`avance[oid].pedidosReprog` (`pedidosReprog()` une las de params), `avance[oid].auditoria` (`auditoriaTodo()` une las dos y es lo
que muestra Auditoría) y `avance[oid].solicitudes` (`pedirSolicitudPiso`/`solicitudesPiso`/`aplicarSolicitudFase`/
`solicitudesPisoHTML`): desde un perfil de piso `guardarFasePiso` NO cambia la fase, la pide. **Cierre del paso**:
`avance[oid].cierres[centro]={pz,cant,faltan,tallas,motivo,u,ts,reabierto?}` con `cerrarCentro`/`mCerrarCentro`/
`terminarOrdenCentro`/`reabrirCierre`; `pasoHecho(o,c,fe)` (fase de Odoo | unidades completas | cierre) reemplazó al
patrón `fe.hechos.includes(c)||ac[c]>=o.cant` en motor, colas y pantallas —único cambio del motor—, y `cantCentro(o,c)`
da lo que realmente llega a un centro (lo que salió del último paso cerrado antes de él). Uso nuevo de la tabla 15:
`cierre` («cierre con faltante»), sembrado vacío. La fase no cambia al cerrar: `tagCierre` (dentro de `whCell`) dice
«terminada en X · fase sin actualizar», `tagListaEmpezar` marca «lista para empezar» en el siguiente centro,
`dondeEsta` dice «Esperando en X», y `cierresSinFase`/`cierresSinFaseHTML` + la bandeja `cierreSinFase` de Hoy son el
panel del supervisor (mover fase con `mCambiarFase(oid,sugerida)` o reabrir). `cierresConFaltanteHTML` en el reporte de
avance y `cierresOrdenHTML` en la ficha. Ver `TABLET_PERMISOS_REPORTE.md` y `MI_CENTRO_UNICO_REPORTE.md`.

**Fases desde el piso (16-sep-2026):** el catálogo de perfiles tiene `piso` = `operario` | `supervisor` | vacío
(`PISO_TIPOS`, `PISO_DEF`, `tipoPiso(d)`, `tipoPisoActual()`, `esSupervisorPiso()`, `esOperarioTablet()`; `perfilSoloPiso()` = cualquiera de
los dos y sigue mandando en `_save()`). El supervisor mueve fases por **rpc**: `moverFases` deriva a `moverFasesRPC` →
`moverFaseServidor` → `sb.rpc('mover_fase',{p_orden,p_fase,p_motivo})`; si la función no existe devuelve `{falta:true}` y la app
avisa «Falta ejecutar SUPABASE_MOVER_FASE.sql» sin tocar nada (ni memoria ni servidor). Propuesta SQL en
`SUPABASE_MOVER_FASE.sql` (**EJECUTADO en producción el 16-sep-2026**; la cabecera del archivo lo
registra y las cuatro funciones existen en `pg_proc`): `puede_mover_fase(uid)` lee `perfiles.rol` + `params.data->perfilesDef` y
`mover_fase()` hace `jsonb_set` solo sobre `{fase}` y `{fases}` de `ordenes.data` + una línea en `bitacora`. `guardarFasePiso` solo
crea solicitud para `esOperarioTablet()`; `aplicarSolicitudFase` es async. `avisoGuardado()` avisa cuando `ULT_SALTADAS` (sin
params) trae algo: «con tu perfil no se guardan los cambios de órdenes». **Centro → Programación**:
`listasNoProgramadas(c,P,hasta)`/`listasNoProgramadasHTML` = paso anterior cerrado (`listaParaEmpezar`) y el motor sin
fecha o más adelante; botón «adelantar» (`moverEnCola(oid,c,1)`) para quien puede reprogramar. El mock de pruebas
tiene `sb.rpc` y `__RPC={falta,error,ultimo}`. Ver `TABLET_PERMISOS_REPORTE.md` (3ª entrega).

**Nadie pisa lo que cambió otra persona (16-sep-2026):** `cargarTodo` lee `id,data,actualizado` y guarda `BASE_TS[t][id]`.
En `_save()`, para `TABLAS_FUSION=['ordenes','avance']`, `prepararSubida` relee del servidor las filas que van a subir
(`filasServidor`): si el `actualizado` cambió, `fusionarFila(base,mio,suyo)` arma la fila campo por campo (lo que esta sesión no
tocó se queda del servidor) y, si hay choque en el mismo campo, no sube nada y empuja a `CONFLICTOS` →
`avisoConflictos()` (banner fijo) + `resolverConflicto(i,'mio'|'suyo')`. `aplicarFilaLocal` **muta** el objeto en sitio (no lo
reemplaza) para no dejar pantallas apuntando a una copia vieja; `refrescarTS` actualiza los sellos tras subir.
**Prioridad de la cola por rpc:** `setPrioridadServidor`/`guardarPrioridadesRPC` (`set_prioridad_centro`); `moverEnCola` calcula
`priCambios` y, si `esSupervisorPiso()`, los manda por rpc y deshace la cola si falta la función. Un perfil `operario` que
llame a `moverFases` genera **solicitud** en vez de cambiar la fase. Ver `SUPABASE_MOVER_FASE.sql` (v2, **también ejecutada el 16-sep-2026**:
`fase_num`, `puede_mover_fase()` sin parámetro donde el catálogo manda sobre la lista fija, `mover_fase` con `terminadaF` y
sin validar la fase, y `set_prioridad_centro`).

**Recuperar contraseña (16-sep-2026):** la ventana de ingreso tiene tres caras (`#login-entrar` / `#login-olvide` /
`#login-nueva`, se cambian con `verLogin(cual)`). `pedirReset()` llama a `sb.auth.resetPasswordForEmail(correo,{redirectTo:urlApp()})`
y SIEMPRE muestra el mismo texto (`MSG_RESET`), exista o no el correo. La vuelta del enlace se detecta por el evento
`PASSWORD_RECOVERY` (suscrito ANTES de `getSession`) o por `esVueltaDeRecuperacion()` (`type=recovery` en la URL): `RECUPERANDO=true`
y se abre «Nueva contraseña» en vez de entrar. `guardarPassNueva()` exige 8 caracteres y las dos iguales, llama a
`updateUser({password})` y entra con la sesión del enlace. En Usuarios, `restablecerClave(id,correo)` manda ese mismo
enlace (con confirmación y bitácora): la app NO puede poner la contraseña de otro (haría falta la `service_role`, que
no puede estar en una página pública). Configuración de Supabase pendiente de la usuaria (URL Configuration, SMTP
propio y límites): ver `LOGIN_RECUPERAR_CONTRASENA.md`.

**Revisión de seis puntos (16-sep-2026):** ver `REVISION_16SEP_SEIS_PUNTOS.md`. (1) `LIB.ym` pasa a Set (acepta Set,
texto o null vía `mesEnFiltro`/`mesesLibTxt`); `selMulti` gana «Seleccionar todos» y «Limpiar»; `togFaseFiltro(varName,f,fasesAll)`
reemplaza a los `togFaseX` en el checkbox del filtro de fases y distingue todas/ninguna/selección (el bug era que tras
«Limpiar» se sumaba la fase al centinela `∅`); `okFiltrosB1` aplica TODOS los filtros (antes solo ODC/familia/cliente);
`refEstado` conoce ahora CEN, CG, WIPL y PMADD. (2) Plan → agregar usa `filasGRP('pmadd')` + `grpSelHTML` y `g.selChk`
(checkbox por grupo, `selGrupoPMADD`). (3) `grupoPlanDe`/`subAreasDe`/`censDeGrupo` (columna «Ítem de planificación»),
`centroPorDias` (columna «Por días», no consume capacidad), `sembrarTerminados` (plancha 2 min/prenda, lavado por días) y
`subAreasResumenHTML` (consolidado con la brecha a la vista). Lavado/plancha daban 0 h por tres datos faltantes, no por
un fallo: no están en ninguna ruta, no tienen min/prenda ni operaciones, y la reserva depende de lo mismo.
(4) `telaPrincipalDe` + clave `tela` en `GRP_CAMPOS`/`claveGRP`; cada grupo muestra horas y minutos. (5) `estadoOrdenCentro`
(proceso | disponible | proxima | terminada), `tramoAbiertoOrden`, `seccionColaTabletHTML`: Mi centro parte la cola en
En proceso (CONTINUAR + Terminar orden + barra), Disponibles y Próximas (sin INICIO). (6) `diagAtraso(o,P,c)` y
`marcaCentro(o,P,c)` separan «meta vencida», «la orden va tarde» y «este paso va tarde»; `porQueTardeHTML` explica arriba
de cada cola contra qué fecha se compara. La marca SIEMPRE fue contra `fechaMetaDe(o)` vs `ro.finPro` (la orden entera).

**Menú de Planificación de producción (16-sep-2026):** **Empaque salió del primer nivel** y es sub-área de
Terminados. `armarNavSubCentros()` (corre en `render()`, antes de marcar la entrada activa) cuelga un
`<a class="subnav" data-sub="1" data-padre="<grupo>" data-cen="<centro>">` por cada sub-área de **todo** ítem de
planificación con `subAreasDe(g).length>=2` (hoy Terminados y Estampado), en el orden de `ordenPaso`, con el `!`
de `alertaSubArea(c)` (= brecha de `origenTiempoCentro(c)` + «ninguna orden la tiene en su ruta»). Desde el 18-sep el
«!» lleva tooltip en toda la entrada del menú con el nombre del centro, cada causa (⚠) y «Para que desaparezca: …»
(`alertasSubArea(c)` devuelve `[{k:tiempo|ruta,txt,que}]`; `comoEntraEnRuta(c)` dice cómo entra ese centro a las rutas:
lavado por orden, plancha por la marca «Lleva plancha» de la categoría o a mano, etiquetas solo a mano por ser centro de
diseño). `origenTiempoCentro` reconoce la tabla de reglas de etiqueta como fuente de minutos (antes decía «sin origen»). El clic del menú
pasó a **delegación** (los sub-ítems se inyectan después). **`CEN.solo`**: el sub-ítem abre esa sub-área sola
(`cens=[CEN.solo]` en `vCentro`, con enlace «ver las N juntas»); el ítem padre sigue siendo el consolidado.
**Etiquetas pasó al ítem Estampado** (`GRUPO_PLAN_DEF.etiquetas='estampado'` + siembra idempotente en
`sembrarTerminados`): sus **dos únicas** operaciones de la LMO son «Etiquetar» en **SER-01 serigrafía**,
TAMPOGRÁFICA 0,35 y MANUAL 0,40, **ninguna cosida** — se verificó antes de mover. `sembrarPerfilesEtiquetas()`
la saca del perfil `terminado` y la agrega al perfil `corte` (una vez, con bitácora, editable); las **tablets no
cambian** porque siempre apuntan a un centro real. `CENTROS_PROD` ahora se **deriva** de `GRUPO_PLAN_DEF` y
`SUBAREAS` se alinea: no debe volver a haber una lista fija de sub-áreas que contradiga la columna «Ítem de
planificación»; quien necesite las sub-áreas de un grupo usa `censDeGrupo()`. Brecha de datos de fondo: **sólo 3
de 24 categorías tienen `familiaLMO` vinculada**, por eso la etiqueta de 0,5 min no carga en ninguna camiseta y 15
de las 16 operaciones de ojales y botones no llegan a ningún producto. Ver `MENU_PRODUCCION_REPORTE.md`.

**Decisiones de producción (16-sep-2026):** **Etiquetado** — solo Level 1, Level 2, Camiseta CR y Camiseta CV llevan
etiqueta de serigrafía (0,5 min) y sale de `reglasEtiqueta` (tabla editable, calce EXACTO por nombre, columna
`confirmada`; `etiquetaDe(k)` y `samPorCentro` la suman al centro). NO sale de la LMO: ninguna de las cuatro tiene esa
operación. Se retiró la regla «SERIGRAFIA + ETIQUETAR → Etiquetas» de `reglasFamCentro` y las **dos** operaciones que
calzaban (FITS TAMPOGRÁFICA 0,35 y BVD MANUAL 0,40) quedaron **sin centro y sin borrarse** (`o.centroPend`,
`o.centroMotivo`, panel `opsSinCentroHTML` con selector `setCentroOp`). Las etiquetas **cosidas** (familia ENSAMBLE,
RECTA) y «ETIQUETAR PRENDA» (EMPAQUE) son otra cosa y no se tocan. **Plancha** 2 min/prenda confirmado (sin
`minEstandarEstimado`). **Lavado**: planta 3 días / Quito 15, los dos `cap:'no'` (solo espera) con `avisoLavadoPlanta()`
a la vista porque NO es definitivo; la modalidad es **por orden** (`o.lavadoModo`), `esperaDeCentro` la respeta sobre el
calce por categoría, y se agrega o quita a mano con `mLavado`/`aplicarLavado` (Liberación en lote y desde la ruta de
cualquier orden; motivo obligatorio, auditoría y bitácora). **Ojales y botones**: tiempos definitivos, todas las filas
confirmadas, y `tiemposOjalBoton()` ya no repone filas sin confirmar. **Rutas estimadas**: `estadoRuta(o)` =
sinRevisar | revisada | real; `generarRutasEstimadas` excluye `CENTROS_DISENO` (estampado, bordado, etiquetas) y la
pantalla avisa que esa carga puede faltar; revisión en Órdenes → Rutas, conteo en Reportería. **DENIM/JEANS**:
`diagJeans()` reporta antes de mover y `unificarJeansEnDenim()` mueve **sin borrar** (renombra, recuelga hijas, marca
`unificadaEn`, bitácora); el mapeo a la hoja LMO sigue diciendo JEANS. HENLEY y las «Nueva hija» NO son parte de esto.
Ver `DECISIONES_PRODUCCION_16SEP.md`.

**Parte A · Dirección, Liberación y Producción (16-sep-2026):** `irCentro(c,dia,tab)` abre el programa de UN centro
en la semana del día pedido; **navega primero y fija `CEN` después**, porque `ir('centro')` pulsa la primera entrada
del menú y el clic delegado pisaba el centro. «Planta hoy» lista **todos** los centros de producción, con carga o sin
ella. «Reportería por área» salió del menú de Planificación de producción. **Liberación**: `o.lib[et].ts/u` +
`o.histLib[]`; `libFechaDe` = registro → auditoría → **brecha «fecha de liberación desconocida»** (nunca se inventa);
`resumenLiberacionHTML` (día/semana/mes con rango, estado `LIBR`). **Desliberar** (`mDesliberar`/`desliberar`) exige
`puede('programa')` + motivo de la tabla 15, avisa si hay avance y **no lo borra** (la marca `lista` se apaga, no se
elimina: la GUARDIA prohíbe `delete S.avance[`). **`puedeEditarRuta()`** es el único chequeo de rutas y va también en
el **guardado**, no solo en los botones; `sembrarPermisoRutas()` deja `ruta` solo en planificación y admin.
**`veSinFecha()`** saca «Sin fecha todavía» de la vista del centro y `sinFechaBrechaHTML` la reporta en Reportería con
`motivoSinFecha`. **`loQueVieneHTML`** arma «Lo que viene» desde la ruta de cada orden. **`dondeEstaEnCentro`**: dentro
de un centro manda el estado propio (`estadosCentro`, textos por la tabla 17, siembra `ESTADOS_CENTRO_DEF`), fuera
sigue `dondeEstaCentro`. **`detalleAgrupableHTML`** lleva el agrupador común a Balanceo y Programa del día (la hoja
impresa conserva centro → recurso). Ver `PARTE_A_REPORTE.md`.

**Parte B · Reportería gerencial, sub-centros y congelado (16-sep-2026):** el **Resumen gerencial** vive en
**Reportería** (salió de Dirección; está en `REPORTES`). `GER.meses` es un Set multiselección que **suma** los meses
y se aplica UNA vez sobre `ords` en `vGerencia`, así que todos los bloques obedecen; `filtroMesesGERHTML` muestra el
selector y el total. Las **consultas por cliente, fase, ODC, estilo y familia NO están construidas**: la propuesta
vive en `REPORTERIA_GERENCIAL_DISENO.md` y espera confirmación. **Sub-centros**: `resumenSubCentrosHTML(g,P,lun,dom)`
en el centro padre, una fila por sub-área (carga, capacidad, ocupación, órdenes, programadas, hechas, atrasadas,
pendientes) + total; sale de `subAreasDe(g)`, nunca de una lista en código, y no se dibuja con `CEN.solo` puesto.
**Congelado semanal**: `S.params.progCongelado[]` con `hechasAl` (lo hecho al congelar) para medir solo lo posterior;
`congelarPrograma` exige `puede('programa')` y **no pisa** la foto anterior; `avanceCongelado` da cumplimiento,
atrasadas, **agregadas** y **sacadas** contra la foto. Son DOS congelados distintos y no se contradicen: el del **plan
mensual** fija qué órdenes entran al mes, el **semanal** fija cuándo y cuánto se hace en ese centro esa semana.
Ver `PARTE_B_REPORTE.md`.

**Medir brechas: contra el catálogo REAL, nunca contra el demo (16-sep-2026).** El simulador arranca con un catálogo
de demostración cuyas familias (CAM BÁSICA, POLO PIQUÉ, HOODIE, JEAN, Nuevo padre) **no existen en Odoo**, y
`aplicarTarea` **no crea categorías**: de las 1.206 órdenes reales que carga, solo **133** resuelven su categoría
contra el demo. Cualquier cifra de catálogo medida ahí sale distorsionada — así se reportó un falso «3 de 24 con
familia LMO». El driver ahora **arma el catálogo real** desde el volcado (22 familias, 51 hijas), reenlaza las órdenes
por `o.catTxt` («PADRE / Hija», que el plan ya trae) y corre `aplicarMapeoCategorias()` antes de medir; los números
quedan fijados en pruebas (`__R.cat`, `__R.etiqReal`, `__R.jeansReal`). **Reales: 40 de 51 vinculadas, 11 sin vínculo**
(siete familias enteras sin hoja: JOGGER, Fleece Basico, Fleece Pesado, TEJIDOS, FALDAS, ENTERIZO, ACCESORIOS), que son
las mismas «⚠ SIN OPERACIONES» de `LISTADO_CATEGORIAS_PRODUCCION.md`. La etiqueta de 0,5 min carga en **423 órdenes**.
Antes de reportar una brecha de catálogo, comprobar contra qué catálogo se está midiendo. Ver `RECONCILIACION_CATALOGO.md`.

**Consultas del Resumen gerencial (16-sep-2026):** filtros **globales** (meses, cliente, estado, buscador) aplicados
UNA sola vez en `ordenesGER(P)`; por eso los **cinco bloques** (`GER_BLOQUES`: cliente, fase, ODC, estilo, familia)
cuadran — es la misma lista partida de cinco maneras, y hay una prueba con 12 combinaciones de filtros que lo fija.
Bloques **colapsables, uno abierto a la vez**, recordado por usuario. **«Hechas» = `pzHechasOrden` = último paso de la
ruta**; las rutas que no terminan en Empaque son **brecha** (`rutasSinEmpaqueHTML`), sin trato especial: **349 de 470
reales no terminan ahí** (301 bordado, 48 estampado). **Vencida y va tarde tienen UNA definición**:
`esMetaVencida`/`esOrdenVaTarde` envuelven a `diagAtraso()`; no crear un segundo cálculo ni un tercer nombre (se eliminó el
`o.fecha<h` que tenía `vGerencia`). **Desde el 23-sep** la marca roja de la cola (`MARCAS_CEN`) es por el PASO y difiere a propósito
en fase ≥ `faseTerminada` y en las que el programa no fechó (ver «Terminada = fase 8» más abajo). **Cierre mensual** en `S.params.cierresMes`:
`guardarCierresMes(P)` actualiza el mes en curso una vez al día y **congela** los meses pasados (`cerrado:true`, no se
vuelven a tocar). **Desde el 23-sep la toma `cierresMesEnRender` en `render()`** (antes solo al abrir el Resumen gerencial:
si nadie lo abría, el mes no se guardaba) y **solo justo después de leer del servidor** (`FOTO_TRAS_CARGA`, que pone
`cargarTodo`), con permiso `programa`, sin `CARGA_INCOMPLETA` ni `BORRANDO` y nunca en un perfil de piso: `params`
se sube entera y sin comprobar si otro la cambió, así que una pestaña abierta desde ayer **no debe escribirla sola**.
`cierresMesPendientes()` dice qué meses faltan sin correr el motor. `vGerencia` ya no la toma (un solo sitio). Márgenes: solo una nota, pendiente de **Costos TEMPO** (otro repo).
Ver `CONSULTAS_GERENCIALES_REPORTE.md`.

**Orden abierta: UNA sola definición (16-sep-2026).** `abiertaDe(o)` = no archivada (`ESTADOS_CERRADOS`) + **Estado OP
de Odoo no cerrado** (`estadosOPCerrados()`, `done`/`cancel`, param `S.params.estadoOPCerrado`) + **fase no de cierre**
(columna «sistema» de la tabla de fases). `abierta()` **delega** en ella — no escribir un segundo criterio en ninguna
pantalla. `lanzada(o)` = abierta **con WH** (la cifra del listado del 13-sep; las de diseño no se pueden programar).
Reales: **1.206 cargadas = 1.078 abiertas + 51 archivadas + 77 con Estado OP cerrado**; 582 lanzadas, 279 en planta.
`conteoOrdenesHTML()` en Reportería explica de dónde sale cada cifra y una prueba fija la descomposición. Antes había
tres números (590 / 1.155 / 1.206) porque `abierta()` miraba el estado interno, `esFacturada()` la tabla de fases y
**nadie miraba el Estado OP de Odoo**. **Minuto estimado de confección**: `k.minEstConf`/`minEstimadoConf(k)` entra a
`samPorCentro` **solo sin hoja LMO**, marcado estimado; sin valor la categoría queda en **0 con brecha**
(`categoriasSinHojaHTML`), nunca un valor inventado, y un 0 a mano es 0 confirmado. **JEANS→DENIM** ya corre en
`sembrarDecisiones16()` (autorizado 16-sep), una sola vez y sin borrar nada. Ver `DEFINICION_ORDEN_ABIERTA.md`.

**Rutas que no terminan en Empaque (16-sep-2026, SIN aplicar).** Regla fija: **toda ruta de producción termina en
Empaque**. El diagnóstico real: de 348 rutas malas, **0 contienen Empaque en otra posición** — están **incompletas**
(338 con un solo paso, `tej → tin → bordado`), no mal ordenadas, y **ninguna tiene OT cargadas**. Causa:
`armarRuta()` usa los centros de la hoja LMO de la categoría; cuando esas órdenes se crearon la categoría no
resolvía su hoja, así que solo quedó lo que aporta la orden por técnica/puntadas. `rutaProSugerida(o)` rearma y
`ordenarRutaPro(cens)` deja **Empaque último venga de donde venga el orden** (blinda el cierre tardío de OT).
`diagRutasSinEmpaque()` separa falta / mal puesto / **editada a mano (NO se toca)** / categoría sin Empaque;
`completarRutasSinEmpaque()` **no corre sola** (confirmación + `puedeEditarRuta()` + auditoría). Reales: **326 de 348**
se corregirían, 22 no. Mientras quede una, `brechaHechas()`/`avisoHechasHTML()` marcan «Hechas» como afectado en el
Resumen gerencial y `fotoCarteraMes` guarda `brechaRutas`; `recalcularCierreMesEnCurso()` rehace la foto del mes en
curso al corregir y **nunca toca un mes cerrado**. **Tejeduría manual (`progTej`) es de PROGRAMACIÓN**: el motor la usa
para `ro.telaDesde`, y una fecha pasada significa «ya se tejíó» — por eso **no** lleva el tope de «no antes de hoy»
que sí tiene «Arranca». Ver `RUTAS_EMPAQUE_DIAGNOSTICO.md`.

**Pantallas de centro (16-sep-2026):** **«Lo que viene» se eliminó** (bloque y funciones). **Agrupador común en las
tres pestañas** de todo centro y sub-centro: `cenplan`, `cenluego`, `cen`, `cenejec` — toda lista de órdenes nueva en
un centro debe llevar el suyo. **Tarjetas de día** con rótulos **Carga / Avance / Pendientes**
(`datosDiaCentro`/`tarjetasDiaCENHTML`) que filtran la lista con `CEN.dia` (`filaEnDiaCEN`) y avisan del filtro activo.
**Una sola marca**: `marcaCentroUna(o,P,c)` pinta la más grave de `MARCAS_CEN` (meta vencida > la orden va tarde > este
paso va tarde) y manda las demás al tooltip; **el cálculo NO se duplica — sigue saliendo de `diagAtraso()`**.
**`avanceSemanaHTML`** abre la pestaña Planificación con programadas, hechas, pendientes, cumplimiento, atrasadas y el
% contra el congelado (o «sin congelar»; nunca un número inventado), **por sub-centro** cuando el ítem tiene varias.
**`abrirCentroDelPerfil()`** lleva a cada perfil de centro a su propio centro una sola vez por sesión (`CEN.auto`), sin
atar a los perfiles que ven todo. Ver `CENTROS_AJUSTES_REPORTE.md`.

**Rutas: corrección y recálculo automático (16-sep-2026).** `sembrarRutasEmpaque()` aplica la corrección autorizada
una sola vez (**348 → 22** rutas sin Empaque; 326 corregidas) y recalcula la foto del mes en curso, sin tocar meses
cerrados. **Ruta por defecto** (`RUTA_DEFECTO_PRO` = corte → modulos → empaque + lo que pida la orden) para las que ni
su categoría tiene Empaque: quedan «estimada – sin revisar» y, **sin minuto estimado, la ruta se crea igual y la carga
queda en 0 con aviso** (brecha de TIEMPOS, no de ruta). **Recálculo automático**: `firmaRutaDe(o)` sella categoría +
`familiaLMO` + centros de la categoría; si cambia, `recalcularRutas()` (que corre en `render()`) rehace las **no
editadas a mano** y marca las editadas con `o.rutaRevisar` — nunca las pisa. **Estampado y bordado quedan fuera de la
firma a propósito**: dependen de la técnica/puntadas de la orden, no de la categoría. Al escribir una ruta hay que
llamar a `sellarRuta(o)`, o el recálculo la dará por vieja. Ver `RUTAS_CORRECCION_REPORTE.md`.

**«0 hechas» ≠ «sin registros» (16-sep-2026).** `hayRegistroEn(c,d)` = avance por talla/total, tramo cerrado,
producción de un turno o paro registrado (un turno **sin** producción no cuenta). `registroSemana` solo mira días
**laborables** del centro. Las tarjetas de día muestran «sin registros» y dejan los pendientes en «—»; el avance de la
semana muestra «**sin registros esta semana**» en vez de 0 %, y marca los días sueltos sin registrar cuando sí hay
alguno. `brechaRegistroHTML()` (Reportería por área) es la matriz centro × día. **Nunca presentar un 0 de avance sin
comprobar antes si hubo registro.** **«Vienen después» se mantiene**: `enSem` (`pzSem>0`) y `luego`
(`pzSem===0 && paso.ini>dom`) son **disjuntos**, no repite nada; el «Lo que viene» que se eliminó sí repetía, porque
mostraba órdenes en un paso anterior y la lista principal ya dice dónde está cada una. Ver `SIN_REGISTROS_REPORTE.md`.

**Tejeduría: programado vs tejido (16-sep-2026).** Una fila de `progTej()` lleva **`estado`**: `prog` (fecha **no
anterior a hoy**) o `tejido` (cualquier fecha, con `kgReal`, `confU`, `confTs`). `marcarTejido`/`desmarcarTejido`
exigen `puedeTejer()` = tejeduría o planificación. **El motor usa `tejCuentaComoLista(p)` y los kg REALES de lo
tejido.** La regla «lo **programado** con día pasado sin confirmar no es tela lista» está detrás del interruptor
**`S.params.tejEstricto`** (solo planificación), **apagado por defecto**; `previaTejEstricto()` mide su efecto
corriendo el motor con y sin ella y **la deja como estaba**. No aplicar el tope de fecha a una fila `tejido`: es un
hecho, no un compromiso. **Rutas**: `firmaRutaDe(o)` incluye `ordenCentrosAuto(o)`, así que cambiar técnica o
puntadas rehace la ruta; `rutaProSugerida(o,rehacer)` con `rehacer=true` **puede quitar** estampado/bordado, sin él
nunca pierde un paso. **Escribir auditoría solo si la ruta cambia de verdad** — ni marcas ni registros vacíos.
Ver `TEJEDURIA_Y_RUTAS_REPORTE.md`.

**Tejeduría, dos cosas distintas (16-sep-2026):** `tejCuentaComoLista(p)` decide **qué filas entran** al motor y
**sí** depende del interruptor `S.params.tejEstricto`; `kgDeFilaTej(p)` decide **cuántos kilos aporta la fila** y
**NO** depende de él — una fila `tejido` aporta siempre sus `kgReal`. Por eso **marcar una fila con kilos distintos
a los programados mueve fechas de tela lista aun con la regla apagada**; `efectoKgReales()` lo mide (con
`TEJ_KG_MODO` = `real` | `prog`, restaurándolo siempre) y el panel lo muestra **aparte** del efecto de encender la
regla. No confundir los dos efectos al reportar. **`chequeoSiembrasHTML()`** (Reportería por área) verifica que las
siembras automáticas corrieron: **lo esperado sale de lo que cada siembra guardó antes de tocar nada**
(`jeansUnificadoPrevio`, `rutasEmpaqueCorregidas`, `rutaDefectoAplicada`), nunca de un número escrito a mano — una
siembra nueva debería guardar su «antes» igual. Ver `KG_REALES_Y_CHEQUEO.md`.

**Tiempos estimados de confección (Santiago Garzón, 16-sep-2026):** `TIEMPOS_SG` + `sembrarTiemposSG()` cargan los
14 minutos por prenda en `k.minEstConf`/`k.minEstConfMeta` (fuente, observación, referencia, `pendiente`). **Solo
confección y solo sin hoja LMO**; no pisan lo puesto a mano. **Camiseta Tejida 4,57 va «pendiente de confirmar».**
Un minuto por prenda **no se convierte en carga** hasta que la orden tenga el paso en su ruta **y esté liberada**:
por eso el efecto inmediato fue 0 y lo útil de reportar es la **carga potencial** (197.573 min de 79 órdenes; 34.304
de las 26 liberadas). **La hoja «Tiempos actuales» volvió sin correcciones: no se cambió ningún tiempo existente.**
`alertasTiempos()` **deriva** las incoherencias de los datos (Short Cargo > Pantalon Cargo, confección sin empaque)
en vez de listarlas a mano, así se apagan solas al corregir. **HENLEY / «Nueva hija» es real: no borrarla.**
Ver `TIEMPOS_SANTIAGO_REPORTE.md`.

**Contar cartera: DECIR siempre la base (16-sep-2026).** Cuatro bases legítimas y muy distintas, en
`BASES_CARTERA`: **cargadas** ⊇ **abiertas** ⊇ **lanzadas** ⊇ **liberadas**. `carteraDe(base,filtro)` es el único
camino para contar cartera y **lanza error** si la base no existe; `cifraCarteraHTML` pinta el número **con su base
escrita al lado**. Usar `abiertaDe()` no basta: **hay que decir qué base se está mostrando**, o los números no se
pueden comparar entre reportes — así se reportó 197.573 min (abiertas) contra un listado de 89.253 (lanzadas).
Las **abiertas incluyen las de diseño sin WH**, que no se pueden programar: para carga de planta, la base es
**lanzadas**. Hay una **guardia** que falla si una pantalla filtra la cartera por el estado interno a mano, si
aparece una segunda definición de orden abierta, si las bases dejan de encajar o si una base inexistente no da
error; un conteo que no sea de cartera se marca en su línea con el motivo. Ver `TIEMPOS_CORRECCION_BASE.md`.

**Nivelación de carga — Paso 1 (16-sep-2026, motor y cuadrito; SIN pantalla todavía).** Del Excel de nivelación
se tomó **solo el esquema**, **ningún dato**. `nivelar(e)` es el único cálculo (saldo → −maquila → neto → `capDia` →
días necesarios → inicio → fin con `dsumLab` → compromiso → `diasHabilesEntre` → alcanzable → **rezago** → meta
diaria → holgura), **en minutos** con unidades al lado por **SAM ponderado** (`samPonderado`/`aUnid`). Falta un dato
→ **`null`** y *dato faltante* en pantalla; **capacidad 0 es 0** (alcanzable 0, rezago = todo el saldo). Comparte
`capDia`, `labR`/`dsumLab`, `minPrenda` (vía `samOrdenCentro`, que devuelve **null, nunca 0**) y la tabla 1; **el motor de
programación NO se tocó**. `PROC_NIVEL` = tela (**por fase**, columna *nivelación* de la tabla 1, `setNivelFase`) +
corte/confección/empaque (**por RUTA**). `saldoProceso` = abiertas con el proceso en su ruta y sin `pasoHecho`, **estén
en la fase que estén**: «**Saldo por procesar (incluye órdenes en fases anteriores)**», **distinto de la carga del
centro** y la pantalla lo dice; horizonte por mes de entrega, por defecto el mes en curso. Grupos de módulos
(`gruposMod`) **nacen vacíos**, se sugieren desde la polivalencia y un módulo repartido a **más del 100% es error
visible** (`erroresGruposMod`). Maquila con `recursoFijo` **resta del saldo propio**; lo sugerido no. Tela:
`capTelaReal()` (promedio de N días hábiles configurable **junto al valor planificado**, sin convertir horas ni
kilos). El **inicio no puede ser anterior a hoy**. Todo lo editable exige el permiso **`programa`**, que hoy solo
tienen **admin** y **planificacion**. Ver `NIVELACION_PASO1_MOTOR.md`.

**Días hábiles: dos semánticas distintas, no mezclarlas (16-sep-2026).** La nivelación usa UNA convención
(`CONV_HABILES`): **el inicio cuenta como día 1 y el compromiso es el último día disponible, los dos
inclusive** — `finLabInc(ini,n)` y `diasHabilesInc(a,b)`, que concuerdan entre sí. **`dsumLab(d,n)` es otra cosa
y NO se toca**: es un **plazo** («n días hábiles DESPUÉS de d»), el lead time del proveedor en el motor. Usar
`dsumLab` donde iba la convención inclusiva corre todo un día. `noHabilesEntre`/`mesesSinFestivos`/`txtHabiles`
explican en pantalla **qué días se descontaron y por qué**. **La tabla de excepciones está vacía**: hoy solo se
descuentan fines de semana y se avisa «sin festivos cargados para <mes>»; no se inventa ningún festivo.
**Toda cifra dice su alcance**: el cuadrito trae el saldo del horizonte y el total, rotulados «en este horizonte
(<meses>)» / «en todo el saldo». **El compromiso no tiene valor por defecto**: sin fecha, *dato faltante* y todo
lo que dependa de él queda en `null`. **Configuración → Nivelación de carga**: grupos de módulos y parámetros
de tela; cada grupo **nace «sugerido»** y solo `confirmarGrupoMod` lo confirma (con responsable y fecha),
y **tocarlo lo devuelve a sugerido**; `validarGruposMod()` marca como **error** un módulo repartido a más del
100% y una familia en **dos grupos** (doble conteo), y como **aviso** una familia sin grupo.
**La clave pública de Supabase no lee nada sin sesión** (RLS): la anon key devuelve 0 filas en `perfiles`,
`params`, `ordenes` y `centros`. Ver `NIVELACION_PASO1_CORRECCIONES.md`.

**La cola del centro se ordena por CERCANÍA a llegar (16-sep-2026).** `cercaniaCentro(o,c,P)` es la única
función y **no crea definiciones nuevas**: `secuenciaCentro` clasifica y **manda** si discrepa de
`centroAnteriorPro` (el desacuerdo se anota y sale como etiqueta «ojo», no se esconde), y `pasoHecho` dice si
terminó. Cuatro grupos: **Disponible · Por llegar · Revisar ruta** (`sinSecuencia`, colapsado) **· Lejanas**
(colapsado, `filasGRP`). ~~Umbral en pasos pendientes~~ (retirado el 17-sep: la lista de fases del centro decide, ver más abajo).
**Etiqueta de llegada** en columna propia: hoy · mañana · en X días hábiles · sin programar · atrasado X días ·
llegaron X de Y · sin dato de llegada. Sale del **fin programado del paso anterior** y se cuenta con **`labR` del
recurso de ese paso**. **CONVENCIÓN: hoy NO cuenta, el siguiente hábil es «mañana»** — es un **plazo** como
`dsumLab`, **distinta a propósito** de la inclusiva de la nivelación (`diasHabilesInc`/`finLabInc`): son tres
semánticas de días hábiles y cada una está escrita donde se usa. **Primer centro de producción** (`llegadaTela`):
la llegada sale de la tela — `ro.bloqueo` **manda**, luego `avance.lista`/fase, luego `ro.telaLista`; **sin dato
NUNCA es «disponible»**. `colaCentro` ordena: **puesto manual → cercanía → llegada → entrega**, y `moverEnCola`
**ya no renumera la cola entera** (solo la movida, las que ya tenían puesto y, si se la baja, las de encima).
`ordenarColaPorColor` **apaga la cercanía** porque numera todas: avisa en el diálogo y en bitácora. La ODC va en
**columna propia**: **no meterla en `whCell`**. Al cargar OT se guardan `iniTs`/`finTs` con la hora sin tocar
`excelFecha`. (`excelFecha` ya usa la parte entera del serial; el `Math.round` viejo solo queda en `excelFechaRedondeada` para medir.) Ver `COLA_CERCANIA_REPORTE.md`.

**Búsquedas y filtros (16-sep-2026).** `buscarQ` tiene **un temporizador por buscador** y la espera es
`prm('msBuscar',150)` (0 = cada tecla). `estadosPantalla()` es el único mapa de estados de pantalla y debe
listar TODO estado con buscador o filtro (`refEstado` falla en silencio si falta). **Filtro de fases**: `estadoFases`
/ `faseOkFiltro` / `podarFases` con el centinela `FASE_NINGUNA` — ninguna pantalla interpreta el Set por su cuenta
ni poda el centinela. **Base acotada**: toda pantalla cuya base filtra antes del buscador muestra
`avisoFueraDeBaseHTML(id,dentro,filtroTxt)` con SU lista ya filtrada. **Redibujo parcial**: `listaRegistrar(id,fn)` +
`<div data-lista="<id>">`; el buscador vive FUERA del contenedor. Está en Órdenes (`listaOrdHTML`), cola del centro
(`colaCentroHTML(c,ctx)`) y Liberación (`listaLibB1HTML(et,ctx)`). **Antes de extraer una lista a su función, fijar su
DOM con pruebas (columnas, celdas, botones, agrupación, conteos) y extraerla sin cambiar una letra; si algo se
pierde, revertir.** La única vez que se perdió algo (casillas de tintura/lavado de Liberación) fue por reescribir
la lista a mano. **Menú**: «Nivelación de carga» primera en Planificación de producción (`data-conf="nivel"` abre
la pestaña de Configuración hasta que se apruebe el Paso 2). **Tablet del operario**: `cerrarCentro` hoy solo
valida permiso y motivo con faltante — ni tramo ni tiempo; no hay rpc de cierre. Ver `BUSQUEDAS_CORRECCIONES_2.md` y
`TABLET_OPERARIO_PASO0.md`.

**Cola por fase (17-sep-2026, reemplaza al umbral en pasos).** `S.params.fasesCentro[centro]={fases,sugerido,confirmado,
origen,ts}` es la **lista de fases visibles** de cada centro (Configuración → Calendario y parámetros → «Fases visibles en la
cola de cada centro»; `fasesCentroTabla/fasesCentroDe/rangoFaseCentro` (0 = la más cercana, −1 fuera, null sin lista, compara
con `normFase`), `sugerirFasesCentro` (tabla 1 hacia atrás desde la etapa de la tabla 4; textil solo para el primer centro
de producción y solo tela tinturada/lista; maquila solo si `desde` = etapa; para en la segunda cola CD), `sembrarFasesCentro`
(idempotente, corre en `render()`, solo centros sin lista; sin etapa → nada y bandeja `colaSinLista`), `set/mover/quitar/
agregar/confirmar/volverSugeridaFasesCentro` (permiso `programa`; tocarla la devuelve a sugerido). **`umbralCercania` ya no
existe.** Grupos de la cola (`CERCANIA_GRUPOS`): **Con puesto manual** (siempre a la vista) · **Disponible** (subcabecera por fase;
incluye «en proceso aquí» = `posicionFaseCentro(o,c)===enProceso`, fase del propio grupo no CD, esté o no en la lista) ·
**Por llegar** (solo fases dentro de la lista, en su orden) · **Revisar ruta** · **Todo lo que viene** (fuera de la lista; «llega ya»
es **solo etiqueta**, `llegaYaFuera`) · **Ya salió de aquí** (`posicionFaseCentro===yaSalio`: CD del propio grupo o
posterior con el paso sin cerrar; `anomalia`, al final, abierto, bandeja `colaYaSalio`). Orden: puesto → `ordenCercania`
(grupo·10⁹ + posición·10⁶ + llegada) → misma fase junta → entrega. **Ruta incompleta** (`rutaIncompleta`: único paso de
producción, no es el primero del flujo, fase antes) nunca es «lista para empezar»: Todo lo que viene + bandeja
`colaRutaIncompleta` (reales: Bordado 114, Estampado 17). `anomaliasCola()` las cuenta. Capturas del driver
`?captura=cola1|cola2`. Ver `COLA_POR_FASE_REPORTE.md`. **Correcciones (17-sep, tarde):** «asignar a operario» se **retiró** (botón,
modal y función; el supervisor fija recurso y fecha en la fila); acciones en un menú **«⋯»** (`accionesColaHTML`, `details.acc`:
✓ hecho · quitar lo fijado · **ruta** solo con `puedeEditarRuta()`, los demás **«ver ruta»** → `abrirFichaOrden`); cabecera en
tres líneas (conteos `.cola-conteos`, orden en una línea, `Marcas:` con % por color) y el texto largo en el **«?»** común
`ayudaTipHTML` (`.ayuda`); `MARCAS_CEN` con nombres cortos y **graduación: rojo solo meta vencida, ámbar va tarde / paso tarde**
(`colorMarca`, `conteoColoresCola`); **corte por fecha** `prm('diasPorLlegar',15)` (`diasPorLlegar`/`setDiasPorLlegar`, Calendario y
parámetros): `cortePorFecha(out)` en los dos caminos de `cercaniaCentro` baja de Por llegar a Todo lo que viene lo que llega a
más de N días hábiles, marcado `lejosPorFecha` («llega en X días · más de N»); 0 = solo hoy. Ver `COLA_POR_FASE_CORRECCIONES.md`.

**Borrar datos de prueba (17-sep-2026, Configuración → Borrado).** UN solo botón (`mBorrar()` → `ejecutarBorrado()`), solo
`config`, palabra escrita `BORRAR`. Orden fijo: espera el guardado en curso y guarda (si `SAVE_ERR`, cancela) → **relee todo del
servidor** (`cargarTodo`, ahora devuelve true/false y deja `CARGA_INCOMPLETA` si falla: `save()` no escribe nada hasta recargar la
página) → respaldo local (`descargarJSON`) + Storage `respaldos/respaldos/` (`subirRespaldo`) → **baja el archivo del servidor y lo
valida con el criterio de Restaurar** (`esRespaldoValido`, compartido con `restaurarDesde`; `verificarRespaldoServidor`) — si algo
falla, NO borra → copia la auditoría del piso (`avance[oid].auditoria`) a `params.auditoriaCambios` + marca `S.params.borradoEnCurso`
+ bitácora INICIADO guardadas ANTES del primer delete → `borrarOperativo()` (órdenes al final; lee por páginas de 1.000 hasta vaciar
cada tabla, relee tras cada lote para detectar el delete silencioso de RLS, verifica las diez en cero; primer fallo →
`S.params.borradoIncompleto`, bitácora «INCOMPLETO», modal con «Restaurar el respaldo (deshacer)» = `restaurarRespaldoServidor`) →
`limpiarHuerfanosTrasBorrado(conservarFotosIdx)` (bandejas pospuestas enteras, borrador y congelado del plan, congelados semanales,
alertas de compras, advertencias de fecha, «no calzan», resúmenes de carga, pedidos de reprogramación, `fotosIdx` salvo casilla;
conserva auditoría, `cierresMes`, `restauraciones`, metas, `progTej`, `stockTela` y toda la configuración) → `S.params.borrados[]` +
bitácora TERMINADO con usuario, fecha, conteos y rutas → pantalla «Base vacía · configuración conservada» (`conteoConservadoHTML`).
Mientras corre: velo y `BORRANDO` (un `save()` ajeno no escribe; los del borrado usan `saveBorrado`). Si la pestaña se cierra a
mitad, la marca «en curso» hace que el panel diga INTERRUMPIDO. «Quitar todas las órdenes» ya no existe. El bucket `respaldos`
necesita políticas de subir y leer: `SUPABASE_BUCKET_RESPALDOS.sql` (sin ejecutar). Ver `BORRADO_DATOS_PRUEBA.md`.

**Resumen del centro (18-sep-2026, pestaña por defecto de todo centro de producción):** la pantalla simple del
bosquejo de la usuaria. `resumenCentroHTML` (prefijo `res-` en CSS): semana + congelado (`congeladoDe`; «Congelar el
programa» con `programa`, si no «Pedir congelamiento» = `pedirCongelamiento` → bitácora `k:'pedirCongelar'` → bandeja
`pedirCongelar` de Hoy, `pedidosCongelarAbiertos` se vacía sola al congelar), botoncitos por recurso si el centro tiene
2+ (`recsChipsCentro`, maquila al final con `ordenRecChip`; `CEN.rec`), tarjetas `tarjetasResumenCentroHTML`, barras
`diaPorDiaHTML` (todo sobre `datosDiaCentro`, que ganó el 5.º parámetro `rec`), lista `listaResumenCentroHTML` con
`listasYEspera` (= `colaCentro` partido: **Listas** = puesto manual o grupo Disponible, orden puesto → `ordenUrgencia`
(`estadoListaCentro`: atrasada = fin programado del paso ya pasado, hábiles con `habilesDesde` · para hoy · futuro ·
sin programar) → entrega; **En espera** = el resto en el orden de la cola, sin visto). Visto verde `.visto` =
`marcarHechoCentro`. `prm('filasResumenCentro',8)`. Las pestañas Planificación / Programación / Ejecución no cambian.
**No crear un segundo cálculo de cola, avance ni atraso en esta pantalla.** Ver `RESUMEN_CENTRO_REPORTE.md`.

**Para Dummies · entrega 1 (19-sep-2026, F+G+H aprobados; propuesta completa en `UX_PARA_DUMMIES_PROPUESTA.md`):**
`simplificarPagina(page)` corre al final de `render()` sobre la página visible: `ledesAAyuda` mueve cada `p.lede` al «?» del
título más cercano (h2 de la cabecera → hermano `.ayuda-cab`; h3/h4 → adentro, antes de `.note`) y `plegarFiltros` oculta
con **atributos** `data-filt`/`data-filt-oculto` (nunca clases: `class="busq"` y sus pruebas no cambian) el buscador, el
filtro de fases, el agrupador (`data-filt-tipo=grp`) y los selectores múltiples (`multi`), con UN botón «Filtrar» por
página junto al h2; abierto si `FILT[page]` (localStorage por usuario, `togFiltros`) o si hay un filtro activo
(`filtroActivoCtl`). `PAGS_SIN_PLEGAR=['tablet']`. **No escribir ledes nuevos ni cabeceras propias: el «?» y «Filtrar» son
el patrón.** Diccionario aprobado (textos visibles, no identificadores): cercanía → **orden de llegada**, atasco →
**cuello de botella**, colchón → **días de holgura**, min/prenda → **SAM**, «Nivelación de carga» → **«Nivelación»** (el 19-sep se probó
«¿Alcanza la capacidad?» y el 20-sep la usuaria pidió volver a «Nivelación»: «se ve mejor»); se quedan «Todo lo que viene», congelar, WH, ODC. **Semáforo**: `estadoSemaforo(o,P)` /
`estadoSemaforoHTML` = un color (verde/ámbar/rojo/gris) y un verbo por orden, derivado de diagAtraso, liberada/
faltaLiberarA, bloqueo, pasoProximoDe + cercaniaCentro — **no crear otro estado**; se usa en Órdenes (columna Estado),
Liberación B1 y Control de piso (**Entregas NO: quedó como el cliente la necesita**). **Resumen del centro**: tres grupos — **En proceso** (`enProcesoEnCentro`: fase de Odoo del propio centro,
unidades o tramo abierto; «la fase de corte es lo que se está cortando») · **Listas** = grupo Disponible sin empezar (el puesto manual ordena, no promueve) · **En espera** y solo órdenes de planta (`enPlantaParaCentro` = con WH y tela
liberada); lo de diseño / sin WH no entra (decisión de la usuaria, 19-sep). Modo del driver `?captura=ux<pantalla>[f][q]`. Ver
`DUMMIES_1_CABECERA_PALABRAS_SEMAFORO.md`. Roles dictados por la usuaria para A/B (portada por rol y menú de tareas):
Santiago (corte+estampado+bordado), Mariela y Paola (módulos+maquila), Terminados (botones/lavado/plancha/empaque),
Maquila (una persona, solo maquila), Jordan y Fernanda (liberar a producción + rutas), la usuaria (carga, liberación
textil, tintorería, congelar).

**Auditoría del sistema (19-sep-2026):** `auditoriaSistema()` / `auditoriaSistemaHTML()` (Reportería por área) corre 24
reglas sobre los datos vivos (rutas, motor, liberación, unidades, OT, configuración) con cuántos/ejemplos/qué hacer; no corrige
nada. `pasosSinProgramar(P)` = pasos de producción pendientes de órdenes liberadas que el motor dejó sin fecha sin bloqueo ni
error (bandeja `pasoSinProgramar` en Hoy); marcarlo dentro de `programar()` está pendiente de autorización. Correcciones de la
auditoría: **`aplicarTarea` copia de verdad lo que la tabla 14 conserva** (rutaConf y tallasPedido no se copiaban: cada carga
borraba las confirmaciones de ruta) más histLib, lavadoModo, compraTela (rehace el paso proveedor), rutaRevGeneral, rutaPrecargada,
esperandoMaterial, y siempre `rutaFirma`/`rutaRevisar`; una orden nueva se sella al crearse y `recalcularRutas` sella toda
orden abierta sin firma con el catálogo de hoy (línea base, no rehace a ciegas) y respeta la fase al rehacer (`rutaCompleta`
entera, `ruta` = pendientes); `liberarCorte` pasa por `puedeLiberarA`; el plan mensual compara bordado en puntadas
(`capMesRecs(…,true)`); la carga de OT lleva fecha y hora de fin de la misma fila e inicio mínimo; el visto del Resumen es
`mCerrarCentro`. Modo del driver `?captura=audit` (volcado + OT + catálogo real, sin pruebas). Ver `AUDITORIA_SISTEMA_19SEP.md`.

**Tablet del operario (17-sep-2026).** `programadoPara(o,c,rec,P)` es la única definición de «programado
para mí»: carga del motor en `P.pro` para ese centro y recurso, dentro de `prm('diasVentanaTablet',5)` días
hábiles. **Recurso fijo o secuencia SIN programa ya no dan visibilidad.** Si `programar()` falla, el operario ve
**cero** órdenes y sale «Error en la programación — avise al supervisor»: **nunca mostrar todo por si acaso**.
Una orden iniciada fuera del plan sigue visible **solo mientras el tramo esté abierto**, sin INICIO. Un paso sin
minutos (`pasoSinTiempo`) no llega al operario salvo que el supervisor le fije recurso y fecha en la fila de la cola
(columnas Recurso y Arranca, con «toda la cola» activado; el botón «asignar a operario» se retiró el 17-sep); entonces va
marcado «sin tiempo estándar». **CIERRE: hace falta tiempo corrido.**
`puedeCerrarPaso(oid,c)` es la **única puerta** (`cerrarCentro`, `confirmarHechoCentro` y `terminarOrdenCentro`
pasan por ella): suma `calcTramo().trabajado` de TODOS los tramos de esa orden en ese centro y exige
`prm('minMinutosCierre',5)`. Por debajo del estándar marca `tiempoBajo` sin bloquear, y **sin SAM no marca**.
El supervisor puede cerrar sin tiempo con **motivo obligatorio** (tabla 15, uso `cierreSinTiempo`), que queda
en bitácora y auditoría. Ver `TABLET_OPERARIO_REPORTE.md`.
**Tablet · ajustes (17-sep-2026):** (1) un fallo de `programar()` visto desde una tablet deja **una alerta por falla**
(mismo error y centro, no atendida) en la **bitácora** (`registrarErrProg`, entrada con `k:'errProg'`, hora y error;
es la única tabla que el piso puede escribir) y Hoy → Pendientes la muestra a admin y planificación (`errorProg`,
`erroresProgAbiertos`, `mErroresProg`, `atenderErrProg` → `S.params.errProgAtendidos`; atender no corrige nada).
`vTablet` también captura el fallo (antes reventaba el render). (2) `minMinutosCierre(c)`: valor general +
`S.params.minMinutosCierreCentro[c]` (vacío = general; `fuenteMinCierre`, `setMinMinutosCierreCentro`, editable en
Calendario y parámetros bajo el general). (3) Tabla 15 avisa por cada uso sin motivos qué deja de funcionar
(`SIN_MOTIVO_EFECTO`, `avisosMotivosVaciosHTML`); tabla 18 avisa los centros sin ventanas y el efecto (minuto real
inflado). (4) **Sin tiempo corrido no aparece «Hecho» ni «Terminar orden»** en la tablet: `hintCierreHTML` dice qué
falta; la decisión sigue siendo `puedeCerrarPaso`, sin segundo criterio en la vista.

**Cargas (17-sep-2026, puntos 1–3 + protección).** `aplicarTarea` **ya no vacía `S.avance`**; la tabla 14 tiene
filas bloqueadas (`CAMPOS_BLOQUEADOS` = avance, lib, fases, progCentro; «siempre»: `conserva()` devuelve true y
`setCampoConservado` avisa) — la fase ACTUAL sigue siendo decisión de la tabla. `planOdoo(rows,nombre)` es el plan
de «Actualizar desde Odoo» como función pura; `aplicarOdoo` consulta la tabla 14 (fase, fecha, telas con
`faltaConf`, ruta editada/confirmada → bandeja `noCalzan` con `tipo`). **«Actualizar desde Odoo» quedó deshabilitado y luego RETIRADO** (ver el camino único): sobre el mismo archivo reconoce 710 de 1.211 y crea 3.508 (3.019 por ALCANCE —fuera de
la regla de Parte 2— y 489 por RECONOCIMIENTO —las órdenes sin WH tienen dos claves: `sl_sin_wh_<hash>` en
Parte 2 y `prev_…` en Odoo). Cuatro cargadores, tres normalizaciones (`normTxt` Parte 2/Fotos, cruda Odoo,
`normFase` OT). Propuesta de clave única y SQL de duplicados (sin ejecutar) en `CARGAS_DIAGNOSTICO_CLAVES.md`
y `SUPABASE_DUPLICADOS_ORDENES.sql`. `S.cargas` aún se recorta a 60 (lo quita el punto 8). Ver `CARGAS_1_A_3.md`.

**Clave única y regla de alcance (17-sep-2026).** `claveOrden(d)` es la ÚNICA clave de orden: con WH `op:`+`normFase(op)`;
sin WH `sin:`+`normFase(cliente|proyecto|stilo|color|ODC)` (sin fecha ni cantidad); componente vacío = `incompleta` (no se
reconoce ni se crea, se reporta); `claveDeOrden(o)`, `indiceClaves()` (clave → orden, `repetidas`), `idDeClave` (id de las
nuevas: `op_…`/`sin_…`), `opSinWH` (etiqueta «SIN WH #hash de la clave»). **Los cuatro cargadores la usan y la prueba K2 falla
si alguno arma la suya.** `planTarea` resuelve el id contra el sistema por clave (**el id de una orden existente nunca
cambia**; las `sl_`/`prev_` viejas se reconocen igual) y el paso sin WH → WH se hace una vez guardando `claveAnterior`;
`aplicarTarea` cruza por id. Migración: Configuración → Órdenes → «Clave única de orden» (`diagClaves`,
`aplicarMigracionClaves`: guarda `clave`/`claveAnterior`, no borra ni renombra). **`alcanceOrden(d)`** es la única regla de
alcance (cancel fuera; sin fecha entra solo con Proyecto; entrega pasada + fase de cierre fuera) con `prm('alcanceDiasAtras',0)`
y `prm('alcanceSinFechaConProyecto',1)` editables (`alcanceConfHTML`); lo fuera de alcance queda `noArchivo` + `fueraAlcance`
(nunca borrado). Sin `hoy+21` ni «día 28 del Proyecto»; `fechaDe` de Odoo usa `excelFecha` y reporta `fechasIlegibles`.
Con esto «Actualizar desde Odoo» sobre el mismo archivo reconoce 1.206 y crea 0 (antes 710 / 3.508). Ver `CARGAS_CLAVE_UNICA.md`.

**UN solo camino de carga: «Actualizar datos» (17-sep-2026).** `mActualizarDatos(paso)` (estado `ACT`): 1) Tareas de Odoo =
`planTarea`/`aplicarTarea`, 2) Órdenes de trabajo (`leerOT`/`aplicarOT`), 3) Fotos (`leerFotos`/`aplicarFotos`). **Se retiraron**
`mOdoo`, `planOdoo`, `nuevaOrden`, `aplicarOdoo`, `leerOdoo`, `odooBotonHTML`, `forzarOdoo`, `mCargarTarea`, `mOT` y `mFotos`: no
volver a crear un segundo cargador de órdenes. **Nada se escribe en S durante la vista previa** (los colores nuevos van en
`plan.coloresNuevosObj` y entran al aplicar). `vistaPreviaTareaHTML(p)` (`p.prev`: nuevas, actualizadas, cerradas, noVinieron,
noCalzan, repetidasNoAplicadas) va arriba del detalle. Archivo **sin componentes** (`p.sinComponentes`): se lee, se avisa y las
órdenes existentes conservan telas, materiales, ruta e insumos. **Clave repetida en el archivo** cuya clave ya existe: las filas
NO se aplican y las existentes quedan `o.claveRepetida={ts,archivo,txt}` (bandeja `claveRepetida` en Hoy) — el orden de filas del
Excel no es criterio de emparejamiento. `aplicarMigracionClaves` solo con `config` y con aviso de revisar duplicados en
producción. Ver `CARGAS_CAMINO_UNICO.md`.

**ID de tarea de Odoo (19-sep-2026, decisión de la usuaria antes de salir en vivo).** El archivo de tareas puede traer la columna
«ID» (`COLUMNAS_ID_TAREA`): es la **identidad de la orden**. `claveOrden` da `tarea:<id>` antes que `op:`/`sin:`; `clavesDeOrden(o)` devuelve TODAS
las claves de una orden (tarea + WH o sin WH) y `indiceClaves` las indexa todas, así que **OT y fotos siguen entrando por WH**. `planTarea`
cruza por ID, luego por WH o clave sin WH y **enlaza** (bitácora); sin WH → WH por el ID guarda `claveAnterior`; sin WH con ID entra
aunque falten componentes (etiqueta «SIN WH · ID N»); una fila con la WH de una orden que ya tiene OTRO ID es **conflicto**: no se
aplica, marca `tareaIdConflicto` (bandeja `tareaIdConflicto` en Hoy) y no cuenta como «no vino»; un archivo sin columna no borra
los ID ni quita la marca. `sinWHde(o)` decide «sin WH» (nunca por el tipo de clave). id nuevo `tarea_<id>`; el id existente nunca
cambia. **Revisión del 19-sep:** `normTareaId` (un solo formato: el número de la tarea); `cruzarFilaTarea` es EL cruce (por ID → WH → clave
sin WH; conflicto solo por WH: `idDistinto` / `whDeOtra`; otra tarea con los mismos cinco datos entra como nueva; la tarea que vuelve sin WH
conserva la WH y marca `whSinOdoo`; cambio de WH → `whAnteriores`); `whRepetida` (misma WH, dos ID) y clave repetida existente se saltan en
planTarea (`repSaltadas/repExistentesIds`); `existeId` en fuera de alcance; freno por conflicto masivo (`minConflictosIdFreno`,
`pctConflictosIdFreno`, APLICAR); `aceptarIdTarea` / `quitarMarcaConflictoId` / `quitarMarcaWHSinOdoo` (con confirmación, en la GUARDIA). Ver `CARGAS_ID_TAREA.md`.

**Fase: sin WH manda Odoo (19-sep-2026, decisión de la usuaria).** En `aplicarTarea`, `consFase = conserva('fase') && !odooMandaFase(v)`: mientras la orden NO
tiene WH en el sistema (`sinWHde(v)`), la fase se toma del archivo en cada carga y también en la carga en que recibe la WH; desde que tiene
WH, la planta la mueve aquí y el archivo va a «no calzan». Interruptor `prm('faseOdooSinWH',1)` (`faseOdooSinWH/setFaseOdooSinWH`, checkbox en la
fila fase de la tabla 14); la vista previa cuenta `prev.faseOdoo`. Pruebas K8.

**Maestro de productos (19-sep-2026):** `S.params.maestroProductos[cod]` (nombre, udm, prov, propia, ruta) cargado desde el archivo de la
usuaria (tabla 12 → «Cargar maestro de productos», `planMaestro/aplicarMaestro/resumenMaestroHTML`). **El origen de una tela es POR PRODUCTO**:
`origenPorMaestro(cod)` = TEMPO/propia → PROPIA, otro proveedor → EXTERNA, sin proveedor → null (decide la tabla 3 por categoría); manda en
`planTarea`, `dimensionesTela` y `lineasTelaDe`; proveedor: facturas → maestro → usuaria. Un producto que vuelve sin proveedor conserva el
que tenía. `armarTelasDe(materiales,rep)` es la ÚNICA función que arma las telas de una orden; `recalcularTelasOrdenes(aplicar)` (botón
«Recalcular telas de las órdenes») las rehace sin recargar Odoo (conserva faltaConf y color, `aplicarRutaTextil`, bitácora). Tabla 12
agrupada por proveedor con «(sin proveedor)» primero. El maestro NO resuelve la tabla 8 (tela del catálogo). Ver `MAESTRO_PRODUCTOS.md`.

**Qué le falta a la tela, por ORIGEN (19-sep-2026, regla de la usuaria):** «lo que tiene Pantone es lo que tintura TEMPO; los otros proveedores no
tienen Pantones; las planas no». `S.params.faltaPorOrigen` (`faltaPorOrigen/faltaDeOrigen/setFaltaPorOrigen`, tabla 13, bitácora): PROPIA → tintura ·
EXTERNA → nada · EXTERNA TEÑIDA → nada · SIN CLASIFICAR → `pantone` (tintura si el color de la orden tiene código Pantone, si no nada; se resuelve en
`lineasTelaDe(materiales,ctx)` con `ctx.pantone`, que pasan `planTarea` y `recalcularTelasOrdenes` vía `armarTelasDe(materiales,rep,ctx)`). La
palabra del producto (tabla 13) sigue mandando sobre el origen. Ya no existe el «EXTERNA TEÑIDA → nada, lo demás → tintura» fijo en código.

**Orden de las operaciones dentro de la prenda (19-sep-2026, hoja de producción):** `mCargarOrdenOps/planOrdenOps/aplicarOrdenOps` (Operaciones →
«Cargar orden de las operaciones») leen la hoja «OPERACIONES_PARA_LLENAR» devuelta: cruce por código (único en el catálogo) y familia con clave
singular (`famKey`: CAMISETAS↔CAMISETA, PANTALÓN (fleece)↔PANTALON) con tolerancia a errores de tipeo (HODDIE); códigos repetidos en una
familia se desempatan por nombre; familia mal escrita («0») se toma del bloque. Guarda `S.operaciones[].orden/ordenMeta/ordenObs` y la corrección
de máquina en `maq` con `maqCorr/maqAntes` (bitácora). **`opsConfeccion` ordena por `orden` real** (empates = en paralelo, orden del archivo;
sin orden → al final, `provisional:true`); el aviso del balanceo dice cuántas faltan. `sembrarTiemposSG2` da por confirmada Camiseta Tejida
4,57 (segunda entrega igual). Fixture local `test/fixtures/ordenops_rows.json` (ignorada). Pruebas OO.

**Fases, Órdenes «por editar», ficha por bloques y foto con zoom (19/20-sep-2026):** `FASES_SEC_19`/`sembrarFasesSecuencia19` siembran UNA vez la
**secuencia** (tabla 1) y el **«qué es»** (`r.que`, editable, a la vista) de las 46 fases según la usuaria y el orden de Odoo (agrega 6Sublimado, 6Pulido
Bordado, 8Cotizaciones); mismo número = tramo no secuencial (estampado/bordado/confección/maquila = 14; las cuatro «esperando factura» = 21). **Órdenes** abre
en «Por editar (ruta sin confirmar)» (`ORDF.edicion`, `matchEdicionOrd`); **guardar la ficha confirma la ruta** (persona) y la sella, con auditoría si
cambió; sin permiso de rutas se guarda el resto. `mOrden` va en cuatro bloques `.ed-blk` (Datos · Materia prima —líneas de tela de Odoo con tela de la
tabla 8 o «sin tela en tabla 8»— · Ruta y operaciones · Insumos), modal `.modal.orden`. `fotoMini` 44 px (`fotoMiniPx`) con `data-zoom`; `fotoZoomInit`
(capa fija al pasar el mouse, `fotoZoomPx` 320). Ver `FASES_ORDENES_FICHA_19SEP.md`.

**Planificar el mes en dos pasos (20-sep-2026, decisión de la usuaria):** Dirección → «Planificar el mes» (`vPlan`, `PM.paso` 1|2; los dos pasos en el DOM,
se muestra uno). **Paso 1 · Nivelación** = calendario de días (`planMesHTML`, manda) + **Personas por centro** (`personasNivHTML`: configurado · vigente · escenario;
`nivPersSet` escribe en `SIM` todas las semanas del mes; «Confirmar escenario» = `guardarAjustesCap` → ajuste de cada semana, y desde ahí `capDia` lo usa en
todo el sistema; la base de Configuración no se toca) + la nivelación (`nivelacionCuerpoHTML`, mes = `PM.mes`; `nivUICapacidad` = promedio por día hábil del
horizonte, incluye ajustes y escenario) + «Más detalle» plegado (capacidad por área/módulo, simulador semanal, ajustes, guía). **Paso 2 · Plan mensual** =
bloques 2–5. Producción → Nivelación es la misma nivelación por meses con «Planificar el mes →». `nivelar()`/`programar()` sin tocar. Pruebas PN; captura
`?captura=uxplan`. Ver `PLANIFICAR_EL_MES_DOS_PASOS.md`. **Noche del 20-sep:** el paso 1 mira el mes del plan **más los meses anteriores con saldo**
(nunca posteriores); `PMADD.incluirAnt` (defecto true) mete lo pendiente de meses anteriores como candidato del bloque 4; `nivUICapacidad` promedia
solo días hábiles de hoy en adelante; `labDiaGeneral` toma las excepciones de producción (un sábado marcado solo para Producción cuenta en la
nivelación); **Nivelación salió del menú de Producción** (la página `nivelacion` sigue para «volver» y pruebas; `nivUIVolver` vuelve a donde se vino).
**Recuadros de la nivelación (20-sep, noche · 2)**: `nivUIGruposAreas` agrupa por `grupoPlanDe` (bandeja por ítem, orden del proceso), `nivUIRecuadrosHTML`
+ `nivUIPillHTML` (`.niv-card` con `est-<estado>`, `.vacia` = sin saldo, `.on` = elegido, pastilla `.niv-pill` al pie, `.t-falta` navy para «sin fases
marcadas» / «sin SAM»: **el rojo es solo para déficit**); `nivUICalcular` marca `faltante` + `sinSAMtodo` cuando el saldo solo tiene órdenes sin SAM (antes
«0 u ✓ llega»); el panel del paso 1 se llama **Nivelación**. **Menú Dirección**: Hoy · Órdenes · Demanda agregada · Planificar el mes · Liberación ·
Entregas · Auditoría · Capacidad (orden de la usuaria). **Excel para la usuaria con estilo**: `test/xlsx_build.js` (ExcelJS por CDN en el harness; copiar los dos a `test/.out/` y cargarlos con fetch+eval en `?captura=audit`:
cabecera navy, columnas para llenar naranja/amarillo con lista desplegable, bandas por grupo, hoja «Cómo llenarlo» con leyenda; se guarda por
`POST /guardar`) y `test/xlsx_entregas.js` (arma `TIEMPOS_SOLO_LO_QUE_FALTA.xlsx` y `PROPUESTA_CONFIGURACION_PARA_TACHAR.xlsx`); no volver a
entregar Excel sin formato (SheetJS pelado). Verificación visual: Excel COM → `PublishObjects` a HTML → captura con Chrome headless.
**Rutas**: los conteos siguen al filtro de fases y al buscador (`baseF`); el filtro de fases dice por fase «(N órdenes · M prendas)» del chip puesto
(`cuentasFaseRut`/`enChipRut`; `filtroFasesHTML` acepta número o `{n,pz}` vía `cuentaFaseTxt`); el paso 3 del lote va a todo lo ancho en orden del
proceso con la línea «Ruta que quedará» (`.rl-cens`/`.rl-ruta`). **Pasos de ruta nuevos** (`PASOS_NUEVOS_20`, `sembrarPasosNuevos20` una
vez desde `sembrarTerminados`): Calandrado (antes de corte, por días, plazo por confirmar), Sublimado y Apliques (después de estampado; por técnica
«sublim» / «aplique» en `ordenCentrosAuto`), Cordones (terminados); están en `RUTA_ORDEN`, `GRUPO_PLAN_DEF`, `CENTROS_DISENO`, `RUTA_EDITABLE_POR`,
tabla 4 y perfiles; sin tiempo hasta que se cargue. Pruebas PS. Ver `PASOS_NUEVOS_20SEP.md`.

**Maquila por descarte · plan unificado · horas · tambor (21-sep-2026, decisiones de la usuaria):** (1) **Maquila = lo que no cabe en la planta**:
`maquilaDescarte()` (déficit de `nivUICalcular('modulos')` → órdenes ENTERAS por familia en el orden de `maquilaOrden()`, las de entrega más lejana
primero), recuadro Maquila «hay que mandar N u», `maquilaDetalleHTML` + `marcarMaquila(ids,motivo)` (recurso fijo `modulos:'maquila'`, auditoría tipo
`maquila`) / `quitarMaquila` (confirmación, GUARDIA); orden configurable en Configuración → Nivelación (`S.params.maquilaOrden`, sembrado una vez desde
la polivalencia, `sugerido` hasta confirmar, `noMandar`); **regla del motor** (una línea en los candidatos de `programar()`, autorizada el 20-sep): la
maquila no es candidata salvo orden marcada, detrás de `prm('maquilaPorDescarte',1)`. (2) **`planBase(ym)` = la base de la nivelación**: abiertas con
fecha meta ≤ mes (`enBasePlan`), menos `planMes[ym].quitadas`; «Agregar» solo excepciones (mes siguiente, sin fecha `PMADD.incluirSinFecha`, quitadas);
`planMesQuitar` anota quitadas (nada se borra); `enProcesoFueraDelMes` solo informa; la columna «en proceso» de la tabla 5 ya no decide el plan. (3)
**Personas Y horas por día** en el escenario: `nivCapSet(ym,rec,'pers'|'min',v)` (horas → minutos del ajuste de semana; `guardarAjustesCap` ya guardaba
`min`). (4) **Tambor** `tamborModulosHTML(rec)` (módulo × familia desde `P.pro`, fondo = polivalencia). La tarjeta **Maquila va dentro de la bandeja Confección** y
Confección tiene botoncitos por módulo (`nivModChipsHTML`, `NIVUI.rec`) que acotan personas/horas y el tambor (21-sep). Capturas `?captura=uxmaqplan` / `uxtamborplan`
(clientes anonimizados). Revisión adversarial antes de publicar: 15 hallazgos corregidos (doble descuento de lo marcado a maquila en
`nivUICalcular`, `recFijadoDe`/`vaAMaquila` como única lectura, «no cabe y no se manda», criterio `maquilaCriterio` como parámetro, `prmTxt` para
parámetros de texto —`prm()` es solo numérico y `palabrasExcedente`/`centroExcedente` nunca leían lo configurado—, foto congelada manda
`planFotoCongelada`/`nuevasTrasCongelar`, `candidatasPlan` único criterio de excepciones). **Lección:** nunca `git checkout -- index.html` con trabajo sin commit (se perdió y se re-aplicó); el checkout deja CRLF y las
anclas LF dejan de calzar (normalizar antes de parchear). Ver `MAQUILA_DESCARTE_PLAN_UNIFICADO.md`.

**Tiempos del 21-sep (decisión de la usuaria: Kronos NO es fuente oficial; se carga UNA vez lo que faltaba y se sigue aquí):** `k.samManda[centro]={min,fuente,ts,u,pendiente}`
= SAM por tipo de producto y centro que **manda sobre la hoja** (`samPorCentro` lo aplica al final; `samConfeccionOrden` devuelve null si existe → los ajustes por orden
no lo pisan); panel **Operaciones → «Tiempos que mandan sobre la hoja»** (`samMandaHTML`, `setSamManda`, `confirmarSamManda`). `prm('botonesEstandar')` (0,40) en
`tiempoPaso` para Botones sin dato; `c.minEstandar` de cualquier centro pro cuando la hoja no trae operaciones (cordones 0,90 · apliques 0,38 · sublimado
1,40). `sembrarTiempos21` (una vez, `TIEMPOS21`): camisetas por tipo 4,47–6,51 (no 13,46), corte/empaque de las familias sin hoja; **Denim, Fits, Camisas,
Polos, tejidos: sin cambio**. **Todo cambio de tiempo se aplica al momento a las órdenes abiertas** (decisión 21-sep): `propagarTiempos(quien)` es el único camino (lo llaman todos los
setters de tiempos, `aplicarLMO`, `revincularCategorias`, `aplicarTarea`); `tiempoEsperadoPaso` = la única definición del tiempo de un paso (con `opsSam` y sin SAM
que mande, la suma ajustada); `p.tManual` (tiempo escrito a mano en la ficha) no se pisa; `p.tOrig`/`p.tAntes`; horas = prendas pendientes × minuto, pasos no
hechos; el piso no propaga; bandera propia `tiempos21Propagado` (`sembrarPropagacionTiempos` al final de `sembrarDecisiones16`). `mAplicarTiempos` /
`aplicarTiemposRutas` quedan solo como comprobación. `fusionarFila`: mismo valor en el mismo campo no es choque. Pruebas T21. Ver `TIEMPOS_21SEP_CARGA.md`. **Todo lo que es tiempo vive en la página Operaciones** (usuaria, 21-sep: «operaciones y centros al final es lo mismo»): `tiemposHubHTML` (orden de
mando) → `samMandaHTML` → hoja → `minutosCentrosHTML` (min/prenda de los centros sin operaciones: mismo dato que Centros) → `botonesEstandarHTML` (salió de Calendario y
parámetros) → `tiemposOjalBotonHTML` (salió de Configuración → Órdenes y materiales, queda un enlace) → etiquetas → minuto estimado. Al recargar la hoja, los `opsSam`
se recuelgan por código de operación (`opsSamSinCalzar` para los que no calzan). **Nivelación**: la pastilla ⚠ riesgo y el «sin SAM» son clicables (`nivUIEnRiesgo`/`nivUIEnRiesgoHTML`:
las de entrega más lejana cuyo trabajo cae en los últimos días de holgura; `nivUISinSAMHTML`: por tipo, con dónde se arregla).

**Orden de las fases, versión del 20-sep (archivo de la usuaria, decimales):** `FASES_SEC_20` + `sembrarFasesSecuencia20()` (una vez, en `sembrarDecisiones16`
después de la del 19-sep) **reemplazan** la secuencia del 19-sep: mismo número = paralelas; Confección 7 va después de servicios 6; Empaque 8.1 después de
Servicios y Terminados / Lavandería / Botones 8; Facturado y Stand by 9. Seis fases que no venían se ubicaron junto a su pareja (a confirmar). **`cmpFases(a,b)`**
(secuencia → número de Odoo → nombre) es el ÚNICO comparador para ordenar fases en pantalla: no volver a `faseNum(a)-faseNum(b)||localeCompare`.
Ver `FASES_ORDENES_FICHA_19SEP.md`.

**Ruta lista sin editar (20-sep-2026, decisión de la usuaria):** una orden cuya prenda ya está terminada (fase con **«sin carga»** en la tabla 1:
prenda terminada / cerrada — solo falta facturar) o que ya no está abierta (`abiertaDe`) **no necesita revisión de ruta**. `rutaNoAplica(o)`
da el motivo (`terminada` | `cerrada`) y `rutaLista(o)` = `rutaConfirmada(o) || rutaNoAplica(o)`. Es **derivado** de la fase: no escribe
`rutaConf`; si la fase vuelve atrás o se desmarca «sin carga», la ruta vuelve a pedirse. Lo usan `matchEdicionOrd` (chip «Ruta lista (confirmada
o prenda terminada)»), `rutasPorDefinir`, `rutasNoAplican` (nota en la tarjeta de Rutas), `liberadasSinRuta`, `puedeLiberarA`/`faltaLiberarA`,
la regla `libSinRutaConf` y `diagRutaOdoo` (`noAplica`). **No volver a filtrar «por editar» con `rutaConfirmada` a secas.** **Los `<details>` de
contenido no se cierran al hacer clic fuera**: el manejador global del final del script solo cierra los desplegables (`esDesplegable`: `details.acc`,
`details.ffases`, `summary.chip`); hasta el 20-sep cerraba todo y la ficha se plegaba sola al tocar un campo. Pruebas RL / RL2.

**Pestaña Rutas = UN recuadro y ruta en lote (20-sep-2026, decisión de la usuaria: «un solo recuadro, agrupar como en todo el sistema, marcar el
grupo y definir ruta para todos»):** `rutasHTML` es una sola lista (`rutasBase` = abiertas con `!rutaNoAplica`; `rutasLista` por chip Por confirmar /
Confirmadas / Todas + `RUT.q`) con el **agrupador común** (`grpSt('rut')`, familia → tipo de producto por defecto) y **casilla por grupo**
(`selGrupoRut` vía `g.selFn/g.selChk`) y por orden (`togSelRut`, sin redibujar); selección en `RUT.sel`; acciones «Definir ruta para las marcadas»
(`abrirRutaLote` → `mRutaLote`, que trabaja SOLO sobre `RLOTE.ids`, sin filtros propios), «Confirmar como están» (`confirmarRutasSel`), marcar / desmarcar
todas. Rutas estimadas, reglas de sub-áreas y «qué dice Odoo» + `confirmarRutasOdoo` van plegados en «Más herramientas»; la lista por referencia y
la tarjeta se quitaron (`aplicarRutaARef` queda sin botón). Motor del lote: `pasosProCompleta` (unión pendiente + completa: divergen en producción),
`rutasDivergen`, `pasoFijoPorFase` (excluido o hecho por la fase, `pasosPendientes`), `planRutaLote(ords,cens)` (entra si falta en la PENDIENTE /
sale / conserva / omit / sinT / conAvance; **hecho = `pasoHecho`**), `aplicarRutaLote` (permiso, motivo, no piso, ≥1 centro, **ninguna orden sin
Empaque**, confirm; inserta por `ordenPaso` en `o.ruta` y deja `o.rutaCompleta` coherente, tiempo por **`tiempoPaso`**, `sellarRuta`, `rutaEditada`
etapa `lote`, `rutaConf` persona «ruta en lote», auditoría por orden, UNA bitácora, `avisosFechaLote` = `conAvisoFecha` en lote, limpia `RUT.sel`).
`avisosRutaLote` avisa Empaque y centros por defecto. **No crear otro camino de edición masiva ni volver a partir la pestaña en bloques.**
Pruebas RLT; capturas `?captura=uxrutas` / `uxlote`. Ver `RUTA_EN_LOTE.md`.
**Tarde del 20-sep:** `conScrollGRP(id,fn)` (contenedor `data-grp-scroll="<id>"`) conserva el scroll al desplegar o marcar un grupo — `togGRP` ya pasa por
ahí: toda lista larga con agrupador debería llevar el atributo; la fila de filtros de Rutas va en una línea con **filtro de fases** (`RUT.fases`, `togFaseRUT`).
**La ruta por orden (`mRutaCentro`) y «qué dice Odoo» (`diagRutaOdoo`) miran la ruta COMPLETA**, no solo la pendiente: los pasos hechos ya no están en
`o.ruta` y salían desmarcados / «Odoo tiene X, la ruta no». **La OT manda sobre la ruta**: `empatarRutaConOT(o)` agrega (nunca quita) a la ruta los centros
con orden de trabajo no cancelada (terminada → solo completa; pendiente → completa y pendiente), `{ot:true}` + `o.rutaOT`; corre en `aplicarOT`, en
`aplicarTarea` (tras conservar «ot») y en `recalcularRutas`. Pruebas UX3. **`render()` conserva el scroll** (`tomarScroll`/`devolverScroll`: ventana +
recuadros `data-grp-scroll`, solo si sigue la misma página; `redibujarLista` igual): no volver a «mandar al inicio» al redibujar. **Lista de Órdenes**: columna
**Ruta** (`rutaCeldaHTML`) y botón **«✓ Ruta ok»** (`rutaOkFila`: confirma tal cual, persona, sin abrir la ficha; solo con `puedeEditarRuta` y ruta por editar). Pruebas UX4. `mRutaCentro`/`guardarRutaCentro` calculan el tiempo del paso con **`tiempoPaso`** (plancha y lavado
salen del centro; antes decían «sin tiempo»); **no hay siembra** que empate rutas ya cargadas con la OT (la usuaria pidió dejarlas y revisarlas ella). Pruebas UX5.
**Excedentes**: `esExcedente(o)` (palabras `prm('palabrasExcedente','EXCEDENTE')` en ODC / proyecto, o `o.excedente`), `centroExcedente()`
(`prm('centroExcedente','empaque')`), `tagExcedente`; al cargar nacen con ruta = solo ese centro, sin textil, estimada con nota. **La OT no toca una ruta
confirmada** (`empatarRutaConOT` → `[]`; `aplicarOT` reporta `confNoTocadas` en Reporte OT). Rutas trae columnas ODC y Prendas. Pruebas EX.

**Ruta por defecto al cargar (20-sep-2026):** en `planTarea`, si la categoría existe pero no aporta ningún centro de producción (sin hoja LMO), la
orden nace con `RUTA_DEFECTO_PRO` (corte → confección → empaque) además de lo que pida la orden, marcada `rutaDefecto:true` y `rutaConf` «estimada» con nota;
corte y empaque quedan en 0 con aviso (`sinTiempo`), confección con el minuto estimado. Sin categoría resuelta no se inventa ruta. Prueba RD. El servidor
del harness acepta `POST /guardar?nombre=` (guarda en test/.out/exports: para sacar Excel armados en el navegador con SheetJS; entregas en `entregas/`).

**Reportería: propuesta de esquema (20-sep-2026, SIN construir):** `REPORTERIA_ESQUEMA_PROPUESTA.md` — inventario de todo lo que reporta el sistema,
solapes (tres listas de órdenes con cuatro estados; «hechas» de cuatro formas; minutos pendientes sumados aparte del `cargaUnica`; Resumen gerencial con
`programarTodo` y pesos 15/30/50/65/85 fijos), 10 bloques por pregunta (Mis reportes por rol · ¿Cómo va el mes? · ¿Dónde está cada orden? · ¿Alcanza la
capacidad? · Planta esta semana · reportes por tramo con cuatro bandas CARGA/AVANCE/CUMPLIMIENTO/CALIDAD · Liberaciones · Paros y tiempos reales · Tiempos
para ingeniería · Rutas por confirmar · Salud del sistema), qué se funde/retira y plan en tres pasos. Esperar aprobación de la usuaria antes de construir.

**Freno por archivo incompleto (17-sep-2026):** en «Actualizar datos» paso 1, si las que no vinieron (sin contar fuera de
alcance) superan `prm('umbralArchivoIncompleto',10)` % de la cartera abierta, `plan.prev.incompleto.frena` → aviso rojo con
desglose por cliente y mes (`vistaPreviaTareaHTML`) y `aplicarTarea` exige escribir APLICAR (bitácora). Pasos 2 y 3 avisan
«Conviene cargar primero las tareas» si no se aplicó el paso 1 en la sesión (`ACT.tareasEnSesion`) o la última carga tiene más
de 1 día. Una orden ya `noArchivo` conserva su primera marca.

**Restaurar y registro de cargas (17-sep-2026).** `restaurarDesde(nuevo,nombre)` es el único camino de Restaurar (`importJSON`
solo lee el archivo): solo `config`, palabra escrita `RESTAURAR`, **descarga `respaldo_automatico_antes_de_restaurar_<ts>.json`
ANTES de reemplazar** (`descargarJSON`) **y lo sube a Storage** (`subirRespaldo`, bucket privado `respaldosBucket()` = `respaldos`,
carpeta `respaldos/`; si falla, NO restaura y avisa; ruta en `restauraciones[].rutaServidor`), une la bitácora, registra en bitácora y en `S.params.restauraciones`. **Registro
unificado**: `registrarCarga(tipo,archivo,resumen)` es la única escritura a `S.cargas` (tipos `tareas` | `ot` | `fotos`,
`TIPOS_CARGA`, `resumenCargaTxt`), nunca se recorta; `registroCargasHTML()` en Configuración → Órdenes y materiales; Hoy y
Órdenes muestran «Última(s) carga(s)» desde el mismo registro. Ver `CARGAS_7_Y_8.md`.

**Órdenes de demostración (17-sep-2026):** `demo()` las marca `demo:true`; `esDemo(o)` (marca u OP en `OPS_DEMO`);
`carteraAbiertaCarga()` = abiertas sin demo y es la base del freno de archivo incompleto. `abiertaDe` NO las excluye: el
simulador entero (tintorería, liberación, tablet) corre sobre ellas como cartera abierta. En producción no existen
(SQL del 17-sep: 100 % Parte 2).

**Nivelación · pantalla (diseño 17-sep-2026, prefijo `nivUI*`, SOLO Corte conectado; el resto de áreas espera aprobación).**
Sigue la lógica del Excel, un área a la vez. `vNivelacion` (página `nivelacion`, entrada del menú sin `data-conf`): meses
como chips de selección múltiple (`nivUIMeses`/`nivUITogMes`, al menos uno), filtros cliente y familia (`nivUIFiltro`),
recuadros por área desde los centros configurados (`nivUIAreas`: Tela + centros `pro` en `ordenPaso` + Maquila) con saldo,
fin y estado (`nivUIEstadoHTML`: ✓ llega / ⚠ riesgo (holgura ≤ `colchonDias`) / ✕ déficit / ? dato faltante); clic → solo
esa área: tabla FAMILIA × mes (`nivUITablaHTML`; `NIVUI.filaPor` = familia | hija | cliente solo cambia las filas; celda →
`nivUIDetalleCeldaHTML`: tipos de producto con unidades y órdenes + «ver órdenes»; **la nivelación NO lista WH**: `irSaldoCentro(sel)` abre
Carga general con `CG.det={saldo:true,area,meses,fam,hija,cli,ids?,volver}` = «Saldo por procesar en <área>», lista de la MISMA
`saldoAreaNiv(area,meses,filtroSelNiv(sel))`, distinto del detalle por semana programada; `nivUIVolver()` regresa) y el cuadrito de trece filas
(`nivUICuadritoHTML`; solo Fecha inicio, Fecha compromiso, Días adicionales y Maquila se escriben, `nivUISet`, en
`NIVUI.esc` hasta «Guardar escenario» con motivo y permiso `programa`, `nivUIGuardar` → inicio/compromiso por `setNivFecha`
del Paso 1 y `S.params.nivelacion.escenarios[area]`). **El motor no cambió**: `nivUICalcular` llama a `nivelar()` y deriva
tres filas (días disponibles + adicionales, maquila escrita, total del período = planta + maquila; déficit = saldo − total).
`saldoProceso(procId,horizonte,filtro)` ganó un filtro opcional y `procNivel(id)` acepta cualquier centro `pro` (por ruta).
`nivUICapacidad` suma `capDia` de los recursos activos del centro (sin `maquila`) y expone personas/min/eficiencia por
recurso para «Ver cálculo». Configuración → Nivelación conserva grupos, fases y parámetros y solo enlaza a la pantalla.
Prueba N0: ninguna función declarada dos veces en `index.html`. **Decisiones 17-sep (todas las áreas conectadas):** Tela y
**Maquila se cuentan POR FASE** (`PROC_NIVEL` tiene `maquila` porFase; columna «nivelación» de la tabla 1; `recursoFijo`
solo alimenta la fila Maquila del cuadrito); sin fases marcadas = «sin fases marcadas · dato faltante», nunca 0. Lavado y
Plancha (`centroPorDias`) quedan «por días, sin capacidad»: saldo y tabla, sin cuadrito (`nivUIConectada`). Al llegar a
Carga general desde la nivelación solo se ve el bloque de saldo (`CG.det.verResto` despliega el resto). Bordado en
producción: `SUPABASE_BORDADO_UNICO_PASO.sql` (solo lectura). Ver `NIVELACION_PANTALLA_CORTE.md`,
`NIVELACION_SALDO_TRES_CORRECCIONES.md` y `NIVELACION_DECISIONES_17SEP.md`.

**Reportería (21-sep-2026, decisión de la usuaria):** el grupo Reportería es **Resumen gerencial · Producto en proceso · Avance por área ·
Cumplimiento · Avance del mes** (= `REPORTES`, misma lista). **Se retiraron** Vista general de órdenes (`vVistaOrdenes`/`VO`), Asignación por orden
(`vAsignacion`/`asignacionPorOrdenHTML`/`APO`), Reportería textil y Reportería por área (`vReporteria`/`REP`); quedan `clasificarAsig`, `pasoProximoDe`,
`mDetalleAsig` y `mDetalleOrden`. `PAGINAS_REDIRIGIDAS` (`redirigirPagina` en `render()`) manda `vistaordenes`/`asignacion` → `wip` y `reporteria` →
`avancearea`; migración `migReporteria2` agrega `avancearea` y `wip` a los perfiles que tenían las viejas. **Producto en proceso (`vWIP`) = UNA pivot
como la de Odoo**: base por `carteraDe` (`WIP.base`: abiertas por defecto · lanzadas · liberadas, dicha en pantalla), agrupación por chips `WIP_PRESETS`
(Fase por defecto · Cliente → Fase · Fase → Cliente · Familia · Familia → Tipo · Cliente · Sin agrupar) o el agrupador común (`grpSt('wip')`, recordado
por usuario; `WIPL.niveles` solo es puente), filtro de fases `WIP.fases` y buscador `WIPL.q`; columnas OP·fase, Cliente, ODC, Estilo, Familia, Tipo,
Color, Entrega, Dónde está, Estado (semáforo), **Órdenes, Pedido, Total $** (`usdOrden` = precio de Odoo × prendas, la misma fórmula del gerencial); el
agrupador común ganó `g.cabFn` (si devuelve arreglo, `filasGRP` pinta los totales del grupo en celdas; las demás pantallas no cambian); clic en la orden →
`mDetalleOrden`; plegado «Programado en máquinas y pendiente por ítem» (`wipMaquinasHTML`, por `itemsPlanProd()`, derivado de la columna «Ítem de planificación»,
producción con `cargaUnica('abiertas')`). Un perfil que ve solo sus centros ve solo esas órdenes (`wipVeTodo`/`ordenesQueVe`, dicho en pantalla); `WIP.fases` se poda
con `podarFases` al cambiar de base; Entrega = `fechaMetaDe`; con búsqueda los grupos vienen abiertos; la pivot está registrada como lista de redibujo parcial (`listaWIPHTML`).
**Avance por área** (`vAvanceArea`, página `avancearea`, estado `AVA`): una fila por ítem de planificación que el perfil ve (`areasAvance()` por
`veCentro`: cada ingeniero ve solo su área, los demás todas), Programadas · Hechas · Pendientes · Cumplimiento · Ocupación · Atrasadas · Contra lo
congelado, **con los mismos números del «Avance de la semana» del centro** (`avanceSemanaCentro`/`datosDiaCentro`/`avanceCongelado`, no crear otro); un ítem
suma solo las sub-áreas que el perfil ve (marca «solo lo tuyo»); clic → detalle (sub-áreas, día por día, órdenes programadas con hechas y marca, «abrir el centro» =
`irItemPlan`, el ítem completo); textil de la semana para quien ve tej/tin (`avanceTextilHTML`). **«Sin registros» solo se reclama a los días laborables que YA
pasaron** (`registroSemana`: `lab` = días pasados, `labTodos`, `aun` = la semana no empieza → «todavía no empieza», nunca 0 %; `datosDiaCentro.sinRegistro` solo con
`d<hoy()`; `brechaRegistro` solo centros con días pasados) — regla de la revisión del 21-sep, vale para el centro y para Avance por área.
**Salud del sistema** (Configuración, `vSalud`, página `salud`, permiso `programa`): auditoría del sistema, siembras, registro por centro y día, conteo
de órdenes, categorías sin hoja, sin fecha, **rutas sin Empaque (antes no se mostraba en ninguna pantalla)**, rutas estimadas, fases sin secuencia. Los
**días de holgura** (`colchonDias`/`setColchon`) se editan en Calendario y parámetros (antes solo en Asignación). **`ir(p)` aplica `redirigirPagina`** antes de buscar el
enlace (un `ir()` a una página retirada era un no-op silencioso); «rebalancear» en Ejecución abre `CEN.tab='costura'` (la entrada de menú costura se quitó el 15-sep). Ver `REPORTERIA_21SEP.md`.

**Tallas desde la Lista de pedido de Odoo (21-sep-2026):** `planTallas` reconoce el formato `odoo` («Orden de producción» + «Lista Pedido» + «Lista
Pedido/Líneas de LdM» + «…/Cantidad»; WH y pack solo en la primera fila del pack, se arrastran). `tallaDeLinea(linea,pack)` = **lo que la línea agrega al
nombre del pack** (palabras enteras, luego por trozos porque Odoo pega palabras: «PEARLXSMALL»; «0 R» → «0R»); si queda ambiguo, la última talla escrita
en el texto. Alias en la **tabla 16** (`S.params.tallasAlias`, `TALLAS_ALIAS_DEF` sembrado, `setTallasAlias` con bitácora; `tallaAlias`); lo que no calza
se guarda tal cual (2R, 28X32). `cantDe` lee «1,092.00». Línea con otro código que el pack y su REF (`refDePack`) = insumo si lleva sufijo o no tiene
talla (`componentes`, no entra); con talla y otro código → `codigoDistinto`, se lista y NO entra. **Una fila sin WH pero con pack es OTRA tarea sin orden de
producción** (`sinWH`: se cuenta y no se carga; comprobado con el archivo real: 56), no un segundo color de la WH anterior; si una WH trajera varios packs entra el
que suma la cantidad de la orden o nombra su color, si no se reporta (`variosPacks`). Los alias mandan también en qué es talla (`esTallaToken` consulta la tabla:
«UNICA=U»); «2XL» → XXL; «10/12», «6-8», «28 X 32» = una talla; `parseCSV` (comillas) en `leerTabla`; sin columna «Lista Pedido» `cPack=null`; cruce por
`indiceClaves`/`claveOrden`; al recargar, `o.tallasPedidoAnt` conserva la curva anterior y la previa avisa (`yaTenian`/`cambian`/`conAvanceFuera`); lo excluido
queda en `S.params.tallasCarga.excluidas` (tabla 16, «Qué no entró en la última carga»); sin juegos configurados no hay aviso de «tallas nuevas». Entrada: **Actualizar datos → 4 · Tallas del pedido** (`mActualizarDatos(4)`, mismo
`planTallasArchivo`/`aplicarTallas`, registro de cargas tipo `tallas`). La vista previa enseña «cómo se leyó la talla» y las curvas (talla → cantidad).
Con `tallasPedido` el piso registra por talla (`baseTallas` ya lo usaba). Pruebas TL. Ver `TALLAS_LISTA_PEDIDO_ODOO.md`.

**Tintorería, Macro → Tintorería (21-sep-2026):** los baños se arman en otro sistema pero la fase se mueve aquí: `estadoTinHTML` abre con el bloque
**«Antes de tintorería»** (`antesDeTintoreria()`: tela propia por tinturar cuya fase va antes de Tintorería por `cmpFases`, sin tinturar ni lista) con el
botón «→ Tintorería» (`pasarATintoreria` → `moverFases` a `faseTintoreria()`, que sale de la tabla de fases, no de una constante; avanzar no pide motivo); solo
órdenes lanzadas (con WH); si la tabla 1 no tiene la fase Tintorería, el panel lo dice en vez de callarse. Después sigue el «Hecho → calidad» de siempre. Pruebas TM.

**Requerimiento = todo lo anterior a Planificación (22-sep-2026, decisión de la usuaria):** la base de **Macro del mes** y
**Compras del mes** ya no son tres fases marcadas a mano sino **todas las fases anteriores a Planificación** por la **secuencia**
de la tabla 1 (`fasePlanificacion()` la busca en la tabla, no en una constante; `sembrarRequerimientoAntesPlan()` corre una
vez desde `sembrarDecisiones16`, guarda `previo/entran/salen` en `S.params.reqAntesPlan` y deja bitácora; la columna
—antes «montado», ahora **«requerimiento»**— sigue editable y no se vuelve a pisar). Reales: 122 → **786 órdenes** (337.129
prendas), 336 productos a comprar, 27.861 kg a tejer. `requerimientoBaseHTML()` dice la base y enlaza a la tabla 1 en las dos
pantallas; `ordenesReqSinMateriales`/`reqSinMaterialesHTML` cuentan y listan las **496 órdenes de la base sin una sola línea de
material** (368 en 0Diseño, 128 en 0Recetas Insumos): no se estima nada. Compras agrupa también por **mes de entrega**
(`mesEnt`) y exporta con **`exportarRequerimientoXLSX()`** (ExcelJS por CDN, `xlsHoja`/`xlsPortada`: hojas A comprar con bandas por
proveedor, Tela a tejer, Tela a tinturar, Tela plana, Ya lo tenemos, Sin materiales y portada con la base, el autor y las
brechas); el CSV queda. Lo que ya está en proceso (Planificación en adelante) NO entra: la conciliación de lo que le falta a
lo que está en planta es trabajo aparte. Pruebas RQ. Ver `REQUERIMIENTO_ANTES_DE_PLANIFICACION.md`.

**Recargar sin perder la ruta (22-sep-2026, decisión de la usuaria: «no quiero perder las rutas, lo que ya trabajé»):**
en `aplicarTarea`, una orden con `rutaConf.origen==='persona'` **conserva su `rutaCompleta` entera**: no se vuelve a armar
desde el catálogo. Lo único que se recalcula es qué pasos quedan **pendientes**, con la fase que traiga el archivo
(`pasosPendientes`). Si el catálogo de hoy armaría otra ruta, la diferencia va a «no calzan» (`tipo:'ruta'`, con las dos
versiones escritas) y se cuenta en `cons.rutaConservada`; la vista previa lo dice ANTES de aplicar (`prev.rutasConf` /
`prev.rutasDistintas`, `cenRutaTxt(o)` compara las dos). La firma de catálogo sigue viajando (`v.rutaFirma`), así que un cambio
de categoría deja la orden marcada `rutaRevisar` — nunca pisada. Una ruta confirmada sola desde Odoo (`origen:'odoo'`) **no**
queda blindada: `rutaEditadaAMano` solo cuenta `rutaEditada` o la confirmación de una persona. Para subir la fase desde Odoo hay
que **destildar la fila «Fase» de la tabla 14 solo para esa carga**. Pruebas RC. Ver `RECARGA_SIN_PERDER_RUTAS.md`.

**Fotos por REFERENCIA (22-sep-2026):** el nombre del archivo es el código del estilo (4861.jpg). Se cargan en
**Actualizar datos → 3 · Fotos**, debajo del CSV de siempre (input múltiple de imágenes, id f-fotosref):
planFotosRef / previaFotosRefHTML / leerFotosRef / aplicarFotosRef; índice en S.params.fotosRefIdx[normTxt(ref)]
={ts,b,ref}, resumen en S.params.fotosRefCarga, tipo de carga propio fotosRef, Storage con prefijo ref_<cod>.jpg en el
mismo bucket. **fotoDe gana el último escalón**: foto propia de la orden → fotosIdx por WH → foto de la referencia
(fotoRefDe por refDeOrden = o.ref); **no se escribe nada en la orden**, así una WH que llegue después hereda la foto
sola. fotoFuenteDe dice cuál se ve y fotoMini lo pone en el tooltip. No crear una segunda ordenesDeRef: la de 8179 es
otra cosa (solo abiertas, refDe exacto). Pruebas FR. Ver FOTOS_POR_REFERENCIA.md.

**Revisión del cambio anterior (22-sep, misma noche):** conservar la ruta confirmada es SOLO de los **pasos de
producción**. El tramo textil (`tej`/`tin`/`proveedor`) lo rehace `aplicarRutaTextil(o)` con las telas del archivo —salvo que el
archivo no traiga líneas de tela para esa orden: entonces se conserva y se reporta (`tipo:'rutaTextil'`)—; el minuto de
**bordado** son las puntadas de la orden, así que si el archivo las cambia la ruta no se toca y sale un aviso
(`tipo:'tiempo'`). La confirmación se restaura **al principio** del bucle de `aplicarTarea` (antes del bloque `ot`), para que
`empatarRutaConOT` respete la ruta confirmada, y la comparación va contra `rutaCatalogo` (lo que armó `planTarea`), no contra
lo que dejaron la OT o `rutaEditada`. **`guardarOrden` ahora deja `rutaCompleta` coherente con la pendiente** (misma lógica que
`aplicarRutaLote`): sin eso, editar la ruta en la ficha y recargar revertía la edición. La bandeja «no calzan» se agrupa
por tipo. Pruebas RC2.

**La WH puede estar en dos centros a la vez (22-sep-2026, decisión de la usuaria):** «sale de estampado y ya está empezando
en confección», hasta tres centros, con entrega parcial entre pasos. Hoy el sistema NO lo representa: `programar()` asigna un
solo recurso por paso, el cierre es por centro y entero (`pasoHecho` / `cierres[centro]`), y el siguiente centro no la ve «lista
para empezar» hasta que el anterior cierre. Pendiente de construir (entrega parcial entre pasos); no inventar una segunda
definición de cierre mientras tanto. Ver `PISO_TIEMPOS_PROPUESTA_V2.md` (D10).

**Ver la configuración sin cambiarla (22-sep-2026, decisión de la usuaria para Fernando):** permiso nuevo
`configVer` en `PERMISOS_DEF`; los porteros del menú (`aplicarNavPerfil`) y de `render()` aceptan **varios permisos separados
por `|`** (la entrada es `data-perm="config|configVer"`) y `config` sigue siendo **el único que edita**. `blindarConfigSoloVer(el)`
corre al final de `vConfig`: con `configVer` y sin `config` apaga todos los `input/select/textarea/button` de la página (salvo
`data-ver="1"`) y pone arriba el aviso de solo lectura; con permiso de editar la pantalla no cambia en nada. Perfil sembrado
una vez **«Jefatura (todo menos configurar)»** (lo operativo + `configVer`, todas las páginas y centros, sin `config` ni
`usuarios`; bandera `perfilesJefatura`, editable en Configuración → Usuarios). Es blindaje de **pantalla**: la RLS solo acota hoy a
los perfiles de piso. Pruebas PV. Ver `PERFIL_VER_CONFIGURACION.md`.

**La ruta dice por dónde pasa, no en qué orden fijo (22-sep-2026, decisión de la usuaria):** tabla editable
`S.params.tramosParalelos` (Configuración → Centros y recursos → «Tramos paralelos»; `TRAMOS_PARALELOS_DEF` siembra una vez
**estampado · sublimado · apliques · bordado · modulos** marcado `sugerido`; `tramoParaleloDe`, `mismoTramoParalelo`,
`set/add/quitarTramoParalelo` con bitácora, `quitarTramoParalelo` en la GUARDIA). En `secuenciaCentro` los pendientes del
**mismo tramo** ya no bloquean: cerrado corte, la orden queda **disponible en confección aunque bordado no esté hecho**
(y al revés), con el motivo escrito; lo anterior al tramo **sí** manda. `listaParaEmpezar` usa `centroAnteriorFueraTramo`
(el paso de fuera del tramo, que es el que entrega prendas). **El motor de fechas NO cambió**: `programar()` sigue en orden;
programar el tramo en paralelo necesitaría autorización. **Buscador del centro**: `buscarEnCentroHTML(cens,P,lun,dom)` se
cuelga del `cab` de `vCentro` (sale en las cuatro pestañas) y responde «¿dónde está y cuándo entra aquí?» sobre TODA la
cartera que el perfil ve (`ordenesQueVe` + `matchBusq`, hasta 6): estado (semáforo), `dondeEsta().n` y `llegadaACentroTxt`
(ya pasó · en proceso · lista para entrar · todavía no: falta X · no está en su ruta, con la fecha del programa). Pruebas TP.
Ver `TRAMOS_PARALELOS_Y_BUSCADOR_CENTRO.md`.

**Varias referencias a la vez en un puesto (23-sep-2026, decisión de la usuaria):** un módulo corre 3–4 referencias
simultáneas («sale una, otra va por la mitad, otra entra»). `tramosAbiertosDe(c,rec)` (lista) y `maxTramosAbiertos()`
(`prm('maxTramosAbiertos',4)`) reemplazan la regla de un solo tramo: `iniciarTramo` ya no pide cerrar la anterior y avisa
cuáles corren al llegar al tope. **El tiempo no se duplica**: en `calcTramo`, si el tramo no trae `t.persManual` las personas
del puesto se dividen entre los tramos que **solapan en el tiempo** (`tramosSolapados(t)`, no «los abiertos ahora») y queda
`persFuente:'repartida'` con el texto a la vista; `setPersonasTramo(tid,oid,n)` deja declarar cuántas van en cada orden (manda
sobre el reparto, va a bitácora). La tablet dibuja **una tarjeta con su reloj por orden en curso** (`tarjetaAbierta` dentro de
`flujoTramoHTML`) y la cola queda debajo; el reloj pasó de `id="crono-vivo"` a **`class="crono-vivo"`** y `tickCrono` recorre todos.
No cambian el SAM, el cierre del paso ni el motor. Pruebas TS. Ver `VARIAS_ORDENES_A_LA_VEZ.md`.

**Freno de borrado en masa (23-sep-2026, tras perder los datos):** `frenoBorrado(t,ids,cur)` dentro del `del()` de `_save`:
si la pestaña **no tiene ninguna fila** de esa tabla en memoria y el guardado iba a borrar `prm('minBorradoSospechoso',10)`
o más, **no se borra nada**: aviso fijo con botón de recargar (`#aviso-freno`), línea en bitácora y `BORRADO_FRENADO`. Quitar
filas sueltas y reemplazar un conjunto teniendo datos en memoria siguen funcionando; el borrado de datos de prueba pasa
por `BORRANDO`. Pruebas FB. **La cabecera quedó solo con «Salir»**: Actualizar, Respaldo y Restaurar salieron (Respaldo y
Restaurar viven en Configuración → Borrado, `respaldoPanelHTML`). **Rutas a archivo**: `exportarRutasXLSX`/`exportarRutasCSV`
(una fila por WH con la ruta en orden, códigos, tiempos y confirmación) y `mCargarRutas`/`planRutasArchivo`/`aplicarRutasArchivo`
(cruza por WH o ID de tarea, deja la ruta confirmada, previa, auditoría, bitácora y registro de cargas tipo `rutas`), en
Órdenes → Rutas. Ver `INCIDENTE_23SEP_BORRADO.md`.

**La Macro del mes es de TELA PROPIA (23-sep-2026, decisión de la usuaria):** «en la macro, lo de proveedores
externos quitemoslo; dejamos tejeduria: cuanto stock tenemos y con eso se calcula todo». macroMes deja fuera las lineas
cuyo origen no es PROPIO (las cuenta en rep.externas / rep.externasKg / rep.externasM) y gana porTela = [{tela, corta,
kgMerma, stock, porTejer, sobra}] con el stock de stockTela() descontado POR TELA (no por color ni por tipo).
La pantalla abre con el bloque «Que hay que tejer» (requerido - stock), dice de donde sale el stock (Planificacion
textil -> Stock de tela cruda), marca las telas sin stock como 0 en bodega sin estimar nada, y dice que lo externo esta
en Compras del mes. El detalle por tela y tipo y la tintoreria siguen, solo con tela propia. Pruebas MT.

**Auditoría de simplificación (23-sep-2026, PROPUESTA — nada movido todavía):** `AUDITORIA_SIMPLIFICACION_23SEP.md`.
Lo medido: el motor (`programar`) es el **1,7 %** del sistema y la interfaz **278 piezas** (191 `…HTML` + 34 pantallas +
53 modales); **44 clicables** en el menú sobre 29 páginas, **19 de 32 solo las ve la usuaria**; 4 pantallas contestan
«¿alcanza la capacidad?» con 4 motores (`cargaSemanal`/`cargaUnica`/`matrizCapacidad`/`nivelar`), 5 de avance, 3 cosas
llamadas «congelar», 4 fichas de orden, 5 motores de agrupación. **Estado de las correcciones (23-sep, tarde; cada una pasó por analista + verificador adversarial):** PUBLICADAS la (4)
foto del mes y la (6) mover baño (ver sus párrafos), más los motivos de cierre (`MOTIVOS_CIERRE_DEF`/`sembrarMotivosCierre`,
bandera `motivosCierreSembrados`, una sola vez). La **(5) no existía**: `programar()` está cacheado (`if(PLAN&&!LIB_ALL)return PLAN`),
agrupar por próximo paso NO corre el motor por fila. **PENDIENTES, con rediseño:** (1) 180 de 224 — `a.centros[c]=o.cant`
fuera de módulos borra el faltante, pero guardar `q` a secas ROMPE el flujo normal: el cuadro de «Hecho» trae por defecto
«lo que falta» (después de un tramo), así que el avance bajaría y la orden quedaría atascada; hoy mismo, en ese flujo, `delta=q-prev`
ya resta turnos. Correcto: «Hecho» SUMA lo que salió ahora, guardado donde el tramo (`a.tallas[c][TALLA_TOTAL]`), con historial,
y sin motivos de cierre la orden quedaría atrapada (por eso se sembraron). (2) «vencida» y (3) «hechas»: **PUBLICADAS en la noche del 23-sep con las reglas de la usuaria** (párrafos «La fase prueba lo que ya pasó» y
«Terminada = fase 8» más abajo); la primera propuesta del verificador (partir la fase 8 por «sin carga») quedó descartada por ella. **Brechas del objetivo:** la fase no se mueve sola al cerrar un paso (la regla, no la
infraestructura: el rpc ya corre), no hay bandeja de órdenes estancadas en una fase (`diasEnFase` existe y se usa una sola
vez), la tabla 15 casi vacía bloquea devoluciones/reversiones/rechazos, el calendario sin festivos y `portadaRol` = 0
referencias (la portada por rol aprobada el 19-sep nunca se construyó). **Esperar el visto bueno antes de mover pantallas.**

**La fase prueba lo que ya pasó (23-sep-2026, decisión de la usuaria).** «La orden de trabajo de Odoo es hecho o no hecho y nada
más: bloqueado por material, esperando, en proceso… da igual, el inventario no es confiable» y, ante WH/MO/29094 (8Lavandería con la OT
de Bordado «bloqueado por material»): **«hecho: la OT no la cerraron»**. `faseEstado0`: la OT **terminada AGREGA** el paso a «hechos»;
una OT **no terminada ya no BORRA** lo que la fase da por hecho… **salvo dentro del tramo paralelo en que está la orden** (tabla «Tramos
paralelos»; fase → centros por el grupo de la tabla 1 y la etapa de la tabla 4: hoy 7Confección/7Pulido → modulos), donde manda la OT
(confeccionar primero y estampar después). Sin esa excepción el estampado se perdía en silencio: con la tabla 5 de fábrica (todo
«secuencial») 7Confección da por hechos estampado, bordado, sublimado y apliques (26 órdenes / 6.811 pz en el volcado). Fuera del tramo
(Lavandería, Empaque, Maquila externa, prenda terminada) la fase manda. La excepción configurada `pasoExtra` (tabla 1) no se tocó.
El Reporte OT, la pantalla de Tramos paralelos y la ventana de reabrir un cierre lo dicen (reabrir no devuelve a la cola si la fase ya
pasó el centro: `causasHechoSinCierre(o,c)` dice la causa real —OT terminada, la fase o las unidades completas—). Medido: WH/MO/29016 (8Empaque Terminado, OT «esperando») deja de tener bordado programado.
Pendientes chicos para la usuaria: maquila (5Maquila Recepción da por hecho estampado; 27763 y 28174 tienen estampado «esperando») y
«excluye» (5CD/5Maquila Conf excluyen módulos: ¿excluido = hecho?). D10 anotado en `PISO_TIEMPOS_PROPUESTA_V2.md` (6 órdenes / 1.518 pz en
fase 8 con módulos «en proceso»). Pruebas OF (fuera/dentro del tramo, el paso vuelve a la ruta pendiente por `empatarRutaConOT`).

**Terminada = fase 8, y «vencida» con UNA definición (23-sep-2026, decisión de la usuaria: «todo lo terminado está en fase 8; es la
fase del final; no la dividas»).** Parámetro `faseTerminada` (8, Configuración → Calendario y parámetros, `setFaseTerminada` con bitácora;
solo enteros de 1 a 9; vacío, decimales o 0 se rechazan: con 0 todo quedaba «terminado»), `faseTerminadaMin()` / `faseTerminadaDe(o)`. `diagAtraso` devuelve
`terminada` y `metaVencida` = meta pasada y no terminada, **sin el motor** (el motor no calcula `ro.atraso` en bloqueadas/sin liberar:
salidas tempranas de `programar()`); `esMetaVencida` = `d.metaVencida`; `esOrdenVaTarde` = atraso sin vencer ni terminar. Lo usan Hoy
(bandejas y tarjetas; antes con la fecha cruda de Odoo), Advertencias (la lista de vencidas trae también las no fechadas y dice por
qué —sin WH (diseño), sin fecha de entrega o el bloqueo—, ordenada por días desde la fecha meta, cada lista con su propio
orden; antes Hoy decía 203 y la lista 142 y las no fechadas quedaban fuera de las 150 visibles), el Plan (vencidas, riesgo, terminadas, entregas reales), el Resumen gerencial (`estadoGERDe`
y `pesoFase`: fase 8 = «Terminadas»; antes quedaban «En curso»), la predicción de entregas y `terminadaF` (Cumplimiento; las fechas
ya registradas no se recalculan). **`MARCAS_CEN` NO cambió**: en la cola la marca es por el paso de ese centro y sale también en fase 8
con el paso pendiente (su texto lo dice). Medido: gerencial 199 → 203 «meta vencida» (entran 61 no fechadas, salen 57 de fase 8).
Pruebas VN (leen la pantalla de Hoy y Advertencias) y GV (reconstruye la definición y prueba dónde coincide con la marca).

**«Hechas» sobre la ruta COMPLETA (23-sep-2026):** `rutaHechasDe(o)` = `pasosProCompleta` en orden de proceso (`ordenPaso`; la
unión NO viene ordenada) y `pzHechasOrden` la usa: la ruta pendiente se vacía al terminar y daba 0 hechas justo en las terminadas
(WH/MO/29016: 0 de 18); y **antes que nada, una orden en fase ≥ `faseTerminada` cuenta TODAS sus prendas** (la misma regla de
«Terminadas»: antes el gerencial decía Terminadas 5.803 y Hechas 659, 53 de 66 terminadas con 0). `brechaHechas` es la MISMA cuenta que
Salud (`diagRutasSinEmpaque`): una sola «ruta sin Empaque», la que se puede corregir. La foto del mes guarda `reglas` y las fotos viejas salen «reglas anteriores» (un mes cerrado no se
toca). Pruebas HC. **`guardarOrden`**: si la orden no tenía ruta completa (35 de 426 en el volcado), la edición de la ficha ahora la
crea en orden de proceso; antes no quedaba en ningún lado y la siguiente carga podía revertirla (prueba RC2b).

**La fase la pone quien recibe (23-sep-2026, DISEÑO sin construir):** `FASE_LA_PONE_QUIEN_RECIBE.md`. Acordado con la usuaria: la
fase la pone el centro que toca INICIO. Falta que ella confirme la columna nueva «fase de este centro» (hoy NO existe: bordado,
serigrafía y sublimado comparten el grupo 6); candado: un INICIO nunca da por hecho un paso pendiente; SQL acotado nuevo (la tablet
no manda la fase). **Aviso**: `mover_fase` (producción, 16-sep) no valida la fase ni el motivo en el servidor (línea 148 del SQL).

**Maquila en el tramo, reabrir = reprogramación con motivo, «Hecho» que suma y ruta pendiente real (23-sep-2026 noche, decisiones de
la usuaria; cada cambio pasó por un revisor adversarial).** (1) «Se cortó, se fue a maquila y vuelve para estampado»: la tabla de
**Tramos paralelos** gana `t.grupos=[{grupo,centro}]` (grupos de fases que cuentan como un centro del tramo; `addTramoGrupo` /
`quitarTramoGrupo`, éste con confirmación y en la GUARDIA) y `sembrarTramoMaquila()` siembra una vez `{grupo:'maquila externa',centro:'modulos'}`.
En `faseEstado0` esas fases cuentan como modulos: la OT decide los OTROS centros del tramo, nunca el propio (5Maquila Recepción, con
«desde» = terminados, daba por hecho el estampado). (2) **Reabrir un cierre = reprogramación**: pide el porqué de la lista del uso `fase`
(renombrado «devolver a un área (fase o reabrir un paso)»; `MOTIVOS_DEVOLUCION_DEF` = Falta de material · Incompletos · Reproceso, sembrados
una vez) y **cuántas prendas ya registradas se vuelven a hacer** (`rc-n`; se descuentan del cubo y de `centros[c]` con una línea
`ajusteReapertura` que no cuenta como producción del día), así el motor, la cola y la tablet las ven pendientes. Un paso reabierto no está hecho
(`pasoReabierto` al principio de `pasoHecho`; `faseEstado0` lo quita de «hechos»: manda sobre la fase y la OT), va en la cola como
«reabierto · motivo» (no como anomalía), y para volver a cerrarlo cuenta solo el tiempo trabajado DESPUÉS de reabrir (`tiempoEfectivoCentro`);
se vuelve a cerrar solo al completar lo que llegó (tramo de la tablet o «Hecho»), o con «Hecho» en 0 si ya estaba completo.
(3) **«Hecho» SUMA** lo que salió ahora (corrección 1 de la auditoría): una sola cuenta en `a.tallas[c]['(total)']` → `centros[c]` (también
`setAvance` de Control de piso escribe por ahí); una orden con curva de tallas va al registro por talla (`mRegistroTallas`, como la tablet);
`curvaCorte` ignora «(total)»; si llega a lo que entró al centro y el paso no cuenta como hecho, se cierra solo (`autoHecho`; deshacer ese
«Hecho» lo deja pendiente); deshacer resta solo el último registro, marca su línea `deshecho` y restaura el anterior una vez (`hechoCHist`).
(4) **Ruta pendiente real**: `conPasosPendientes(o,pend,completa)` = lo que deja la fase + todo paso de PRODUCCIÓN de la ruta completa que
`pasoHecho` no da por hecho (reabiertos y los del tramo con la OT abierta). Está en los cinco sitios que rearman `o.ruta` desde la fase,
en `aplicarOT` y en una pasada única `sembrarRutaPendienteReal` para lo ya cargado (bitácora con ejemplos). Las siembras nuevas no corren
desde un perfil de piso. Pendiente de la usuaria: la tabla «fase de cada centro» se le mandó en `FASE_DE_CADA_CENTRO.xlsx` (armada con
`test/xlsx_build.js` sobre el catálogo real). Límites conocidos: un paso agregado por la OT con 0 minutos entra a la cola sin fecha del motor;
una orden que sale de maquila a servicios vuelve a tener confección pendiente si la OT de módulos sigue abierta (se salva con
`recursoFijo modulos:'maquila'`). Pruebas MH, MH2, MH3, MH4 (y CC4, OF, registrar actualizadas).

**«Maquila es confección pero afuera, entra, y debe tener fecha pero una alerta de que falta algo» (usuaria, 23-sep-2026 noche; dos
rondas de revisión adversarial).** (1) **Paso sin tiempo estándar** (pendiente, sin SAM, no «por días»): el motor lo trataba como HECHO
(`hecho:minRef<=0`) y lo saltaba. Ahora `sinT` en el prep de `programar()` y `fechaSinT(o,ro,phs,modo)` le da fecha = fin del
paso anterior con tiempo; si no hay, inicio del siguiente; sin vecinos, hacia atrás `antLabR(límite)` y hacia adelante la tela lista; nunca
antes de la tela lista. El «Arranca» (`progCentro.desde`) vale como en un paso real (corre el cursor; hacia atrás, si pasa el límite, `ok=false`).
**La fecha vive SOLO en `ro.pasos`** (`sinTiempo:true`, `min:0`, `limite`): **no entra a `P.pro` ni a `secMod`** (la primera
versión lo hacía e inflaba prendas del día, % del Resumen y cumplimiento: de ~101k a ~201k prendas), y el recurso **solo si está fijado**
(`recFijadoDe`; elegir el «menos cargado» con 0 minutos mandaba todo al mismo puesto). **La tablet sigue la regla del 17-sep**
(`programadoPara` solo mira `P.pro`; el operario la ve con `fijadaPara`). Medido con datos reales: fechas de pasos con tiempo, minutos,
prendas de `P.pro` y atraso idénticos; 463 pasos ganan fecha; 23 órdenes con todo lo pendiente sin tiempo pasan su fin de «hoy» a su fecha
meta (motor hacia atrás). `SIN_T_FECHA` (false = motor de antes) es SOLO para medir, como `TEJ_MODO`. Avisos: `mandaCola`, marca de
cercanía (separa «con fecha» de «sin fecha / por días»), ficha, `mDetalleAsig` («sin SAM», no 0), Resumen del centro (`avisosFaltaHTML`),
buscador del centro (`llegadaACentroTxt` ahora lee `ro.pasos`: antes buscaba en `P.pro` un `oid` que no existe y nunca daba fecha) y
Hoy → Pendientes `pasoSinTiempoFecha`. `pasosSinProgramar` ya no los lista (tienen fecha). (2) **Maquila = confección hecha afuera**:
`sembrarMaquilaEsConfeccion()` (una vez, no desde el piso; bandera `maquilaEsConfeccion` con `cambios`/`ordenes`/`ejemplos`) quita
`modulos` de «excluye» en las fases de la tabla 1 del grupo del tramo que tiene recurso (5CD Maquila, 5Maquila Conf), pone `rec:'maquila'`
en la fila `{grupo:'maquila externa',centro:'modulos'}` de Tramos paralelos y rearma la ruta pendiente de las órdenes en esas fases;
`defFaseMapeo` ya no excluye. `recFijadoDe` cae al final en `recDeFaseTramo(o,c)` (no si la tabla da el paso por hecho —Recepción— ni si
la fase excluye OTRO centro —5Corte Maquila Ibarra: nadie decidió su confección—). `avisoAfuera(o,c)`: «en Maquila · falta que regrese» /
«por salir a Maquila» / «fase de Maquila · fijada en X» (lo fijado en la cola manda). `posicionFaseCentro` la trata como «en proceso» del
centro y la cola dice «en proceso afuera» (`txtEnProceso`/`tipEnProceso`). `quitarMaquila` se niega mientras la FASE diga maquila;
`setTramoGrupoRec` (Configuración → Tramos paralelos) cambia el recurso con bitácora y avisa que sin recurso esas fases van a planta.
**Segunda ronda:** el límite de un paso sin tiempo es el inicio del paso con tiempo que le sigue (`iniSig`); por sí mismo nunca es «paso tarde» ni «cuello
de botella» (`diagAtraso` y `sob` lo saltan) salvo que lo cause su propio «Arranca» (`paso.porArranca`); dos seguidos no quedan al revés (el anterior
incluye pasos sin tiempo ya fechados); `faltaTiempoTxt(o,c)` dice qué falta según el centro (técnica, puntadas o SAM). `afueraDeOrden(o)` hace que el
**semáforo** y el buscador del centro digan «En Maquila · falta que regrese» sea cual sea el próximo paso (el rojo de meta vencida sigue mandando).
Recurso de maquila inactivo → aviso «va a planta»; quitar el tramo entero lo dice y va a la bitácora; la lista «Ya en maquila» marca «por la fase»
en vez de ofrecer «devolver a planta». **Congelado semanal**: un paso que la fase, la OT o el cierre dan por hecho durante la semana cuenta como hecho
(`porFase` en `avanceCongelado`; la maquila no registra en el piso). Hojas impresas: «sin tiempo estándar» en vez de 0,0. Planificación del centro
lista el paso sin tiempo de la semana sin sumar prendas. Pruebas ST1–ST16, MQ1–MQ19 (y VN, aplicarOT, fases de maquila y MQ de descarte actualizadas).

**Maquila: INICIO y FIN de control, como un centro más pero afuera (usuaria, 23-sep-2026 noche: «solo 5Maquila Conf es lo que está en
maquila confeccionándose… mantenerle igual un inicio fin pero por control, porque es un centro solo que afuera, para no complicarnos»).**
`esRecAfuera(rec)` = el recurso que la tabla de Tramos paralelos pone como «afuera» (hoy Maquila); se decide en INICIO y queda en el tramo
(`t.afuera`): cambiar la configuración después no rehace el historial. Mi centro → Confección → Maquila usa el MISMO INICIO / FIN;
INICIO sin tope de órdenes a la vez, con el recurso fijado aunque se mire «todo el centro», con la salida real tomada de la fase
(`salidaAfueraDe`: el día en que entró a 5Maquila Conf, `t.iniFuente='fase'`) y con `t.debeVolver` = fin del programa al salir (un paso sin tiempo
no tiene fecha real de vuelta: `t.sinVuelta` dice por qué y va a la bandeja `afueraSinVuelta` de Hoy, sin inventar fecha). `calcTramo` de un tramo
afuera da días fuera, sin minutos-persona ni SAM real; `tramosOlvidados` lo marca solo si pasó `debeVolver` y la orden no consta como vuelta
(`pasoHecho`); `puedeCerrarPaso` cierra con un tramo afuera ya cerrado (después de reabrir, si hubo), sin mínimo de minutos ni comparación
con el SAM. Lo que vuelve **sí** suma a `S.turnos` como real de Maquila, igual que por «Hecho» o Control de piso (una sola regla). En la tablet
cada orden afuera es una línea (salió el · debe volver el · días afuera · FIN · volvió) sin personas, Paro, reloj ni aviso de tope; el buscador de
la tablet ya no dice «termínala primero» por otra orden abierta (desde el 23-sep un puesto corre varias a la vez; solo frena el máximo, y afuera
no hay máximo). `visibleOperario` deja ver a la tablet de afuera lo que está allá, lo que ya puede salir o lo que tiene abierto (no todo lo marcado
del mes). Bitácora «Volvió de Maquila · N días afuera»; `tallasLog` lleva `afuera`. Pendiente: devolución parcial (lo que sigue afuera tras un FIN
con faltante queda sin control), ligado a D10. `FASE_DE_CADA_CENTRO.xlsx` ya lleva la fila de Maquila decidida (INICIO → 5Maquila Conf, FIN → 5Maquila
Recepción; falta decir quién toca INICIO y FIN). Pruebas MT1–MT14 y MB3 actualizada.

**Aspecto como Odoo (24-sep-2026, usuaria: «como están acostumbrados a Odoo sería más fácil la adaptación, sin dar tantas vueltas»).**
Solo cambia el aspecto; pantallas, botones y flujo son los mismos. Todo el CSS nuevo va bajo `html[data-tema="odoo"]` al final del `<style>`
(tokens `--o-brand` #714B67, `--o-primary`, `--o-sec`; los tokens de siempre `--t-primary`/`--navy`/`--ink` se reasignan ahí), así el aspecto
**clásico** queda intacto. `temaVisual()` / `aplicarTema()` (corre al inicio de `render()`) / `setTema(v)` (permiso `config`, bitácora):
parámetro `S.params.tema` = `'odoo'` (por defecto) | `'clasico'`, en Configuración → Calendario y parámetros. Con Odoo, `aplicarTema` **mueve
`#nav` dentro del `<header>`** (los menús van en la barra de arriba, como Odoo; los desplegables son blancos) y lo devuelve al volver al
clásico; la cabecera de cada pantalla (`.pagehead`) es el panel de control blanco; botones primario morado y secundario gris; listas, etiquetas
(colores suaves de Bootstrap 5), bloques y ventanas al estilo Odoo. **Barra de fases con flechas** (`statusbarFasesHTML(o)`, vale en los dos
aspectos): los grupos de la tabla 5 en orden, el actual resaltado con el nombre de la fase, las lejanas plegadas en «…», clic = `mCambiarFase`;
está arriba de la ficha (`abrirFichaOrden`). **Colores (24-sep, la usuaria mandó captura de su Odoo: «la interfaz está ok, pero tampoco quiero ese morado»):** `S.params.temaColor` / `temaColor()` / `setTemaColor(v)`
(permiso `config`, bitácora), atributo `data-color` en `<html>`; `TEMA_COLORES` = **azul marino (por defecto: lo eligió la usuaria el 24-sep)**, verde azulado (el del botón NUEVO de su Odoo),
 azul, verde, gris grafito, barra blanca con verde azulado (letras oscuras en la barra) y morado Odoo; cada paleta solo define
`--o-brand` (barra), `--o-primary` (botón), `--o-brand-soft`/`--o-brand-line` (lo elegido) y `--o-ring` (foco). Pruebas OD1–OD8.

**Buscador como Odoo (24-sep-2026, la usuaria mandó capturas de Filtros y Agrupar por de su Odoo: «¿podemos copiarlos?»).** Con el
aspecto Odoo, `simplificarPagina` llama a `panelBusquedaOdoo(root,pg)` en vez de `plegarFiltros` («Filtrar» queda solo en el clásico). **No crea filtros:**
toma los que `controlesFiltro` ya reconoce, los agrupa por contenedor y arma, por grupo, el panel de Odoo: campo (`.o-sbox`) con el
buscador adentro y cada filtro puesto como etiqueta (`.o-facet`, texto `facetFiltroTxt`, la ✕ = `soltarFiltro` que usa el «Seleccionar
todas»/«Limpiar» del propio control o vacía el select); **Filtros** (`details.o-dd.o-f`) con fases, selecciones múltiples y selectores adentro
(sus desplegables quedan abiertos dentro del menú; `esDesplegable` no los cierra); **Agrupar por** = la lista de `GRP_CAMPOS` con ✓ (`togCampoGRP`:
clic agrega o quita un nivel, hasta 3; `desagruparGRP`), el select del agrupador queda oculto; **Favoritos** (solo el primer grupo) guarda la
búsqueda actual con `navSnap` en `localStorage` por usuario y pantalla (`favClave`/`favoritosDe`/`guardarFavorito`/`aplicarFavorito`/`quitarFavorito`,
éste con confirmación y en la GUARDIA). El panel del primer grupo va en la franja del título (`.pagehead`); los demás, arriba de su lista.
`OSRCH` recuerda qué menú quedó abierto entre redibujos; los menús pegados al borde se abren hacia adentro. Mi centro (tablet) no cambia.
Pruebas OB1–OB11; F2 y la H de «Filtrar» corren en el aspecto clásico.

**Compras del mes RETIRADA (24-sep-2026, usuaria: «eso ya no nos va a servir en este aplicativo, borremos»).** Se quitaron el menú, la
sección, `vCompras`, `comprasMes`, el agrupador `COMP`/`COMP_CAMPOS`, `exportarRequerimientoXLSX` y `exportarComprasCSV`, y la bandeja `sinProv`
de Hoy. **Se conserva** lo que usan otras partes: la tabla de días por proveedor (`diasProveedor`/`diasProvOrden`, el motor la usa
para la ruta textil comprada), las alertas «pasaron a compras» (`S.params.alertasCompras`; ahora se ven en la ventana `mAlertasCompras()`
que abre la bandeja `pasoCompras` de Hoy, con el botón «pedida»), la Macro del mes (ya no enlaza a Compras) y los helpers de Excel
(`cargarExcelJS`/`xlsHoja`/`xlsPortada`, los usa la exportación de rutas). `PAGINAS_REDIRIGIDAS.compras='macro'`; `irEstadoOrden` lleva una orden
en fase 0 a Órdenes. Donde este archivo hable de «Compras del mes», es historia. Pruebas CO1–CO2 y TC/RQ actualizadas.

**Sub-áreas como pestañas dentro del centro (24-sep-2026, usuaria: «está todo muy mezclado… todo se ve como si fuera un solo centro»).**
`armarNavSubCentros` ya **no** cuelga sub-ítems en el menú (↳ Calandrado, ↳ Plancha…): cada ítem de planificación sale una sola vez y
lleva un «!» si alguna de sus sub-áreas tiene alerta (tooltip con la lista de `alertaSubArea`). Dentro del centro, `subAreasTabsHTML(cid,todos)`
dibuja la fila de pestañas «Todo <ítem>» + una por sub-área (`subAreasDe`, orden del proceso; cada una con su «!» y la misma explicación),
que fija `CEN.solo`; el título dice «Ítem / Sub-área». Un centro sin subprocesos (Corte) no tiene pestañas. Las pestañas de vista (Resumen,
Planificación, Programación, Ejecución) siguen a la derecha del título. Esto reemplaza lo del menú del 16-sep («un sub-ítem por sub-área»).
Pruebas MN2/MN3 reescritas.

**Servidor interno (24-sep-2026, la usuaria: «hay un equipo Ubuntu en la red con dos aplicaciones; ¿cómo se alberga ahí?» y «el 80 y el
8080 ya están usados»).** Opción 1: solo la pantalla adentro; los datos siguen en Supabase. `despliegue-interno/instalar.sh` (se baja con curl de
raw.githubusercontent y se corre con `sudo bash instalar.sh`, **sin número**). **Elige solo el puerto** (`PUERTO_DESDE` 8790, rango poco usado): ocupado =
lo que escucha `ss`, los `listen`/`Listen`/`<VirtualHost>` activos de nginx/Apache, los destinos «algo:NNNN» / `PORT=` / `--port` en nginx, Apache,
Caddy y `/etc/systemd/system`, y los `PortBindings` de Docker aunque el contenedor esté apagado; **pregunta antes de tocar nada** (`/dev/tty`,
`TEMPO_TTY` en pruebas; `--si` la salta); al volver a correrlo reusa su puerto (`puerto_actual`) salvo que ahora lo tenga otro proceso. Usa el
nginx o Apache que esté FUNCIONANDO y solo le agrega un sitio: nginx en `/etc/nginx/conf.d/tempo-pcp.conf` (lo incluyen el de Ubuntu y el de
nginx.org; la versión de la mañana usaba sites-available y se muda sola), comprobado con `nginx -T`; Apache con la marca `# tempo-pcp` en la
línea de ARRIBA del `Listen` (Apache no admite comentarios al final) y **sin `a2enmod`**; el `Listen` se escribe DESPUÉS del sitio y `quitar_apache_listen` solo borra la marca + `Listen <nuestro puerto>` (con
`--follow-symlinks`, y solo si hay marca) (Cache-Control dentro de `<IfModule mod_headers.c>`: habilitar
el módulo cambiaría a las otras apps). Si no hay servidor web funcionando: nginx apagado con otros sitios → se detiene; si no, lo enciende (o lo
instala con `policy-rc.d`, `NEEDRESTART_MODE=l` y `DPkg::Lock::Timeout`) y **aparta** (no borra) el sitio de ejemplo solo si es el enlace del
paquete Y su md5 es el de `dpkg-query … nginx-common` (un default editado = otro sitio → se detiene); un nginx/Apache funcionando FUERA de systemd
(visto en `ss`) también lo detiene; y no enciende nginx si abriría otros puertos. **Baja el sistema ANTES de tocar el servidor web** y, desde que escribe algo, toda falla
pasa por `deshacer`: quita su sitio (y su `Listen`), devuelve el default, deja nginx apagado si lo estaba y, si ya recargó (`RECARGADO`),
recarga o vuelve a arrancar el servidor y dice si quedó funcionando; **una reinstalación que falla devuelve la anterior** (copia en `$LIB/antes`, `restaurar_antes`) en vez de borrarla,
y Ctrl-C/SIGHUP/SIGTERM en los pasos 5-6 también pasan por `deshacer` (`trap … INT TERM HUP`, bandera `DESHACIENDO`); candado del instalador
(`$LIB/.instalando`). Antes de recargar Apache revisa que ningún `Listen` suyo (aunque sea de otra app, pendiente) lo tenga otro proceso
(el graceful lo apagaría) y con `apache2ctl -S` que cargó el vhost; si nginx/Apache estaba funcionando al empezar y alguien lo apagó durante
la instalación, no lo enciende; si nada cambió (misma huella, mismo puerto) no recarga. Después de recargar **exige que el servidor esté activo y dueño del puerto**
(`dueno_puerto` con `ss -ltnp`): el graceful de Apache devuelve 0 aunque luego se apague por no poder abrir el puerto, y eso tumbaría a las otras
apps. Un código HTTP distinto de 200 queda solo como aviso (`curl --noproxy`). `$LIB/estado` guarda cómo estaba el equipo en la PRIMERA
instalación (nginx instalado/encendido por él, habilitado antes) y `--quitar` lo devuelve así, **pero nunca apaga un nginx que ahora sirve a otros sitios** (`otros_sitios_nginx` + `nginx_listens`) ni devuelve
el ejemplo del 80 a un nginx habilitado; recarga solo el servidor que tenía algo nuestro (`recargar_y_comprobar`). ufw: se anotan en `$LIB/ufw`
solo las reglas que el instalador agregó de verdad («Rule added») y solo esas se borran, nunca si el puerto ahora es de otra app; el puerto
de la última instalación buena queda en `$LIB/puerto`. Docker: se le pregunta solo si está funcionando (con `timeout`); si está apagado se
leen sus `hostconfig.json` (preguntarle lo despertaría por el socket). Sin terminal y sin `--si` no instala (la pregunta es la última
salvaguarda: solo Enter/s/sí siguen). apt con `--no-remove`. `umask 022`. Actualizador `/opt/tempo-pcp/actualizar.sh`
cada 15 min: `flock`, exige `APP_BUILD` y que el archivo TERMINE en `</html>` (index.html tiene otro `</html>` dentro de una plantilla), guarda
las últimas 30 (la primera vez no hay copias y no es error: la versión publicada de la mañana abortaba ahí y dejaba la instalación a medias)
y deja el **latido** `revisado.txt` (segundos) en cada revisión buena: `revisarLatidoServidor()` (desde `revisarVersion`, nunca en github.io/netlify.app)
avisa si pasan más de `prm(horasLatidoServidor,2)` horas — sin él, `revisarVersion` compara la copia interna consigo misma y nunca vería que
quedó vieja. `iniciar()` avisa si no cargó la librería de Supabase (cdn.jsdelivr.net) en vez de dejar «Entrar» mudo. **Supabase: NO registrar la
dirección interna http en Redirect URLs** (el enlace de recuperación viajaría sin cifrar): la recuperación cae en la Site URL pública; por eso la
dirección pública NO se apaga mientras la interna no tenga HTTPS. Guía para sistemas: `despliegue-interno/GUIA_SERVIDOR_UBUNTU.md`.
`.gitattributes` deja los `.sh` con saltos de Linux. **Simulador de servidor**: `bash test/instalador_simulado.sh` (nginx/Apache/Docker/ufw/apt/curl
falsos en una raíz temporal, enlaces como archivos `SIMLINK:`; 38 escenarios + actualizador, 262 comprobaciones); correrlo antes de publicar
cualquier cambio del instalador. Dos rondas de revisión adversarial el 24-sep: 18 + 17 hallazgos reales corregidos.

**Archivo de tareas con los nombres internos de Odoo (24-sep-2026).** La exportación «compatible con importación» (la que trae la columna
`id`, p. ej. `__export__.project_task_64104_…` → `normTareaId` da 64104) cambia TODAS las cabeceras a los nombres internos (`x_studio_many2one_field_RLFKj`,
`stage_id`, `project_id`, `x_studio_ocd_1`…) y pone Técnica y Puntadas en otro orden; los valores son idénticos. `planTarea` busca cada columna con
`columnaTareaEn(h,n)`: su nombre de siempre o cualquiera de la tabla **«Nombres de columna del archivo de tareas»** (Configuración → Órdenes y
materiales, `columnasTareaHTML`/`setAliasColumnaTarea` con bitácora; `S.params.columnasTarea`, sin configurar = `COLUMNAS_TAREA_DEF`, los nombres
internos de esa exportación). `plan.columnasPorAlias` lo cuenta y la vista previa lo dice; si falta una obligatoria (`COLUMNAS_TAREA_OBLIG`: OP, Fase,
Fecha Entrega) `leerTarea` dice cuál (`columnasFaltantesTarea`). Medido con la exportación de tareas del 24-sep
contra el volcado del 13-sep: 4.509 tareas todas con ID, 1.422 órdenes en alcance, freno de incompleto no salta (2,3 %), 3 WH con varias tareas en
Odoo (25112, 25347, 24121: no se aplican). Estado OP nuevo `to_close` (2 órdenes, fase 8). Pruebas CT1–CT6.

**Archivo de OT exportado con filtro: lo terminado no se pierde (24-sep-2026).** `aplicarOT` toma el archivo como la verdad de cada orden que
trae y le rearma `o.ot`; la usuaria mandó una exportación con solo las OT NO terminadas y, medido sobre el volcado, **172 órdenes abiertas perdían un
paso que Odoo ya daba por terminado** (casi siempre el corte: volvían a «por cortar»). Ahora una OT **terminada** que el archivo no trae **se conserva**
(`termPrev` dentro de `aplicarOT`, con sus unidades de `a.centros` y la marca `a.centrosOT`): en Odoo una OT terminada no vuelve atrás. Si el
archivo la trae en otro estado (reabierta), manda el archivo. `otTerminadasQueNoVienen(p)` / `avisoOTFiltradaHTML(p)` avisan en la vista previa
(«no trae ninguna OT terminada: parece filtrado», cuántos pasos se conservan) y `terminadasConservadas` queda en el aviso final, en `S.params.otCarga`
y en el registro de cargas. Con los archivos reales del 24-sep: 0 pérdidas, 336 pasos conservados en 175 órdenes. Recomendación a la usuaria:
exportar las OT sin filtrar por estado (lo filtrado no trae lo que se terminó desde la última carga). Pruebas OTF1–OTF5.

**Órdenes: ruta en lote desde la lista, recuadro alto y estado en líneas (24-sep-2026, usuaria: «déjame editar la ruta masivamente, uno a uno
nos vamos a demorar», «el recuadro es muy chiquito», «que el estado baje como las telas, todo en una pantalla»).** La lista de Órdenes lleva
casilla por orden y por grupo (`grpSt('ord').selFn='selGrupoOrdRut'`) y la barra `barraSelOrdHTML` con «Definir ruta para las marcadas»
(`abrirRutaLote`) y «Confirmar como están» (`confirmarRutasSel`): **la misma ventana y la misma selección (`RUT.sel`) que Órdenes → Rutas**, no
un segundo camino; solo con `puedeEditarRuta()` y solo en `entraRutaLote(o)` (= `rutasBase`: abiertas sin «prenda terminada»). `listaOrdActual()`
es la única definición de la lista visible (pantalla, redibujo y «marcar todas»). `.scroll.alto` (alto hasta el final de la pantalla) y
`.td-envuelve .sem{white-space:normal}` (el estado se parte en líneas; también el color y las etiquetas de la OP): a 1.510 px la tabla cabe
sin moverse a los lados. Pruebas OL1–OL7.

## Principio general (decisión de la usuaria, 13-sep-2026) — aplica a TODO lo nuevo
1. Ningún valor de negocio en el código: todo sale de una configuración visible y editable (tablas y
   parámetros en Configuración). Lo que la usuaria dicta es siembra inicial, idempotente: lo editado no se pisa.
2. Si un número aparece en pantalla, debe verse de dónde salió y dónde se cambia (nota, tooltip o enlace).
3. Un valor configurado se respeta aunque sea 0, vacío o raro (`prm()`, `prmCal()`; nunca `x||default`).
4. Si falta un dato se reporta en una bandeja y se detiene; no se rellena con suposiciones ni fallbacks.
5. Si dos lugares hablan de lo mismo, la pantalla dice cuál manda. Días: manda el calendario del mes
   (Planificar el mes); la regla base del área (días por semana) es solo el punto de partida sin marca.
6. Los cambios de configuración que mueven el plan quedan en la bitácora (quién, cuándo, de qué a qué).
7. Versión: `APP_BUILD` en index.html la sella el hook `.git/hooks/pre-commit` (fecha/hora local) y la app
   avisa en pantalla cuando la copia cargada es más vieja que la publicada (`revisarVersion`).

## Convenciones de desarrollo
- **Simulador de pruebas** en `test/` (ver `test/README.md`): `node test/build.js`
  y `node test/server.js`, abrir http://127.0.0.1:8765/ y revisar `__R` en la
  consola. Recorre todas las páginas, el flujo completo de tintorería y pulsa
  todos los botones. Correrlo antes de publicar cambios grandes.
- Antes de cualquier cambio: `node --check app3.js`-equivalente (revisar sintaxis
  del `<script>` extraído) y correr las pruebas relevantes si existen.
- Los tests viven como scripts `test*.js` sueltos (no hay carpeta formal de
  tests) que cargan el HTML con un mock de `supabase` y prueban funciones
  puntuales del motor (`programar()`, `armGrupos()`, etc.).
- Reconstruir el archivo final: el `<script>` de trabajo se inyecta entre las
  marcas correspondientes del HTML; verificar que `index.html` no quede con
  placeholders sin reemplazar (`PEGA_AQUI_...`).
- Siempre hacer commit + push al terminar un cambio para que Netlify republique.

## Pendientes conocidos
- Cargar el catálogo completo de máquinas de confección (156 máquinas de
  costura + 11 de corte, archivo de mantenimiento preventivo ya analizado).
- Pestañas de maestros de operaciones (Centro/Subcentro/Sección/Familia de
  Operación) en Configuración — los datos ya se cargan desde Odoo pero falta
  la UI de edición dedicada.
- Confirmar que las capacidades reales de las máquinas de tintorería
  (DANITECH 1/2, STUART) estén siempre actualizadas en Configuración →
  Centros y recursos — es la causa más común de resultados raros en
  "Armar baños" si quedan desactualizadas.