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

**Mi centro (15-sep-2026 noche, 3ª entrega):** reloj vivo `#crono-vivo` + `tickCrono/arrancarCrono/fmtHMS` (actualiza SOLO el texto; `data-ini`, `data-paros`, `data-pausa`). Paros del tramo sin minutos: `mPararTramo`→`pararTramo` (motivo de la tabla 15 uso **paro**) y `reanudarTramo` calcula `min`; `paroAbierto`/`minParos`. `sembrarMotivosParo` migra `S.params.tiposParo` (bandera `parosMigrados`) y siembra Almuerzo (`esAlmuerzo`), Cierre del día (`cierreDia`) y Fallo de máquina. `calcTramo`: si hay paro de almuerzo NO descuenta el horario (`almuerzoMarcado`), si no avisa (`avisoAlmuerzo`); `tramosOlvidados` mide tiempo EFECTIVO (el cierre del día no dispara aviso). `tablaTallasTramoHTML` (Pedido/Cortado/Hechas/Faltan con + − +10 +25) durante el tramo y `tallasSegHTML` al cerrar. Operarios: `esOperario()` (perfil tablet) entra directo sin selectores, `ordenesQueVe` lo acota a su recurso, alta con centro y recurso en `mNuevoUsuario`/`crearUsuario` y `recursosSinAsignar()`. **Mi centro único (corregido):** Modo línea BORRADO (función, despachador, sección, catálogo, ícono y estado; asistencia/paros/segundas siguen). `personasTramo(rec,c,dia)` elige asistencia del día → ajuste de la semana → personas del recurso → 1 (y dice cuál usó en `persFuente`/`persTxt`). Descansos = **ventanas** por centro (`S.params.horarios[c].ventanas[{ini,fin}]`, tabla 18, `addVentana/setVentana/delVentana`); `minutosVentana(ini,fin,c)` descuenta solo el solape. Segundas por talla en el tramo (`t.segundas`, `setSegTramo`) suman a `S.avance[oid].seg[centro]` (un solo dato con Control de piso) y `calcTramo` da `minPrendaReal` (buenas) y `minPrendaTot`. Botones de avance rápido con `pasoRapido1`/`pasoRapido2`. **Tramos de trabajo:** `S.avance[oid].tramos[]` =
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