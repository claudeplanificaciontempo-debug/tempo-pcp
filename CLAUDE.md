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

**Mover baño de máquina:** cada tarjeta confirmada tiene un `<select>`
(`selMaquinaBano`) → `moverBano(id,rec)` guarda `banos_conf[].rec` +
`recFijo:true` y `programar()` restringe el pool a esa máquina; "auto" lo quita.
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
`SUPABASE_POLITICAS_ACTUALES.sql` (consultas para volcarlas) y `SUPABASE_POLITICAS_TABLET.sql` (propuesta SIN
ejecutar: lectura amplia y escritura solo en avance, bitacora, turnos y paros para los perfiles de piso). El tramo, las
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
`SUPABASE_MOVER_FASE.sql` (**sin ejecutar**): `puede_mover_fase(uid)` lee `perfiles.rol` + `params.data->perfilesDef` y
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
llame a `moverFases` genera **solicitud** en vez de cambiar la fase. Ver `SUPABASE_MOVER_FASE.sql` (v2, sin ejecutar:
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
`esMetaVencida`/`esOrdenVaTarde` envuelven a `diagAtraso()`, el mismo de `marcaCentro`; no crear un segundo cálculo ni
un tercer nombre (se eliminó el `o.fecha<h` que tenía `vGerencia`). **Cierre mensual** en `S.params.cierresMes`:
`guardarCierresMes(P)` corre al dibujar el resumen, actualiza el mes en curso una vez al día y **congela** los meses
pasados (`cerrado:true`, no se vuelven a tocar). Márgenes: solo una nota, pendiente de **Costos TEMPO** (otro repo).
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
**cuello de botella**, colchón → **días de holgura**, min/prenda → **SAM**, «Nivelación de carga» → **«¿Alcanza la
capacidad?»**; se quedan «Todo lo que viene», congelar, WH, ODC. **Semáforo**: `estadoSemaforo(o,P)` /
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