# TRASPASO — tempo-pcp (Planificación y control de producción, TEMPOCODECA)

Versión: **2026-09-15** (reemplaza a la del 13-sep y a todo traspaso anterior; el sistema se llama **tempo-pcp**, el
nombre viejo "plm-textil" ya no se usa). Sirve para retomar el trabajo en una conversación nueva sin perder contexto.
Cada regla de negocio de aquí vino de la usuaria (planificación de TEMPO); lo pendiente está marcado como tal.
Donde `CLAUDE.md` contradiga a este documento, manda este.

---

## 0 · Cómo trabajar con la usuaria (reglas de trato, vigentes)

1. **Lo configurado manda sobre el código.** Ningún valor de negocio escrito en el código: todo sale de tablas y
   parámetros visibles y editables en Configuración. Lo que ella dicta es siembra inicial idempotente (solo entra si la
   tabla **no existe**; una tabla vaciada a propósito no se vuelve a sembrar). Un valor configurado se respeta aunque
   sea 0, vacío o raro (`prm()`, `prmCal()`; nunca `x||default`).
2. **Si falta un dato se reporta y se detiene** (bandeja); no se rellena con suposiciones. Nada se asigna por parecido
   de texto o de nombre.
3. **Si dos lugares dicen cosas distintas, la pantalla dice cuál manda.** Días: manda el calendario del mes.
4. **Todo cambio que mueve el plan va a la bitácora** (quién, cuándo, de qué a qué). **La bitácora nunca se borra.**
5. **No decidir solo: reportar.** Si algo se mueve de forma inesperada, decirlo en vez de ajustarlo.
6. **No tocar el motor de programación ni las capacidades** salvo autorización expresa (autorizado hasta hoy: motor
   hacia atrás, `SIN_PUESTO`, `dsumLab` proveedor, regla `maqApta` de máquinas por profundidad).
7. **El sistema es la fuente de verdad, no Odoo**: Odoo alimenta (proyecto, fases, OT, fotos), pero las decisiones de
   persona (liberaciones, fases movidas a mano, puestos, módulo fijo, ODC, ajustes, avance de piso, registros de
   tintorería) se conservan en cada recarga (tabla 14) y si el archivo trae otra cosa va a una bandeja. Excepción
   única: la recarga del 14-sep (tarde) donde ella pidió que Odoo mandara en fase y fecha.
8. **Nada se borra**: datos definitivos desde el 15-sep. Toda acción que borre pide confirmación y dice qué se pierde;
   la recarga no elimina órdenes (quedan `noArchivo`); hay una prueba de guardia. Ver `AUDITORIA_BORRADOS_Y_RESPALDO.md`.
9. **Seguridad**: el repo es público (GitHub Pages). Nunca subir datos de clientes: fixtures reales en
   `test/fixtures/` están en `.gitignore` (`tarea_rows.json`, `ot_rows.json`, `macro_valid.json`, `fotos_*.csv`);
   facturas fuera del repo; fotos en Supabase Storage (bucket público `fotos-ordenes`), solo enlaces en la orden.
10. Después de cada cambio: harness verde (`node test/build.js` + http://127.0.0.1:8765/?r=x → `__R`), commit + push
    (GitHub Pages publica en 1–3 min), un `.md` de reporte en el repo, `CLAUDE.md` y este traspaso al día, y enviarle el
    reporte. Español informal, directo, sin recapitulaciones.

## 1 · Qué es y dónde está

- **Un solo archivo** `index.html` (JS vanilla) + backend **Supabase** proyecto `bypdfogmksbxjaiydhlg` (tablas
  `{id, data jsonb, actualizado, actualizado_por}`: ordenes, avance, centros, recursos, telas, colores, categorias,
  operaciones, rutas, tecnicas, maquinas, programas, cargas, propuestas, paros, turnos, bitacora, planes,
  salidas_tin, banos_conf, params; más `perfiles` para el rol por usuario). Clave pública en `CLAUDE.md`.
- **Repo** `claudeplanificaciontempo-debug/tempo-pcp`, rama `main`. **Producción**: GitHub Pages
  https://claudeplanificaciontempo-debug.github.io/tempo-pcp/ (Netlify sin crédito). `APP_BUILD` lo sella el hook
  pre-commit; la app avisa si la copia abierta es vieja (`revisarVersion`).
- **Simulador**: `test/build.js`, `test/server.js` (8765), `test/driver.js` (≈700 verificaciones; los bloques nuevos van
  antes de `__R.done=true;` y deben crear datos temporales y restaurar el estado). La producción tiene 1.223 órdenes:
  `programar()` tarda segundos; en Chrome por CDP conviene lanzar trabajos pesados con `setTimeout` y consultar después.
- **Entorno**: Node en `C:\Users\Tempo\AppData\Local\Programs\nodejs` (exportar al PATH en bash). Para producción se usa
  la pestaña autenticada de Chrome (Claude in Chrome) con una pestaña **nueva** por sesión; `alert()`/`confirm()` se
  sobreescriben antes de operar. Otro proyecto de ella, no confundir: "Costos TEMPO" (`costos-tempo`).
- **Perfiles**: catálogo `S.params.perfilesDef` (Configuración → Usuarios): admin, planificación, tintorería, liberación,
  corte/estampado/bordado, módulos, terminados, consulta y **tablet** (15-sep). `perfiles.rol` guarda el id del perfil;
  `puede()`, `vePagina()`, `veCentro/puedeCentro`; `modo: ver` solo mira. Las cuentas se crean en Usuarios → Nuevo usuario
  (Supabase Auth); **Claude no crea cuentas**.

## 2 · Flujo de negocio y pantallas (menú horizontal, cinco grupos)

**Dirección**: Hoy (tarjetas Pendientes / Advertencias de fecha / Otros; `pendientesHoy` = índice de todas las bandejas,
posponer con motivo, nunca desaparece), Resumen gerencial, Órdenes, **Liberación** (la principal, `LIB.et='tela'`),
Producto en proceso, Entregas, **Plan mensual**, Demanda agregada, Escenarios, Cumplimiento, Avance del mes, Auditoría,
Capacidad y decisiones.
**Planificación textil**: Tejeduría, Stock de tela cruda, Macro del mes, Compras del mes, **Tintorería**, Reportería textil.
**Planificación de producción**: Carga general (Asignación por orden), Centros, Costura, Balanceo, **Liberación a
producción** (`LIB.et='corte'`), Programa del día, Reportería por área.
**Reportería** (15-sep): Vista general de órdenes (todas las abiertas, buscador, agrupación, detalle completo), Producto en
proceso, Cumplimiento, Avance del mes, Reportería textil y por área; registro `REPORTES` para crecer; supervisores la ven en
consulta, tablet no. Ver `REPORTERIA_PESTANA_REPORTE.md`.
**Piso**: Control de piso (tej/tin/pro + **Cambio de fases**), Modo línea, **Mi centro** (tablet).
**Configuración**: Centros y recursos, Categorías y operaciones, Órdenes y materiales (tablas 1–14), Calendario y
parámetros, Usuarios, Borrado (con frase).

### 2.1 Órdenes y cargas desde Odoo
- **PROYECTO.xlsx** (Tarea__project_task): `mCargarTarea`/`aplicarTarea`. Lee columnas por nombre. **Tabla 14
  `camposConservados`** (Configuración → Órdenes y materiales): qué decisiones de persona se conservan por OP en cada
  recarga (liberación, prioridad, programación por centro, módulo fijo, compromiso, fotos, fases movidas a mano,
  ajustes de tiempo, telas confirmadas, rutas editadas, OT, avance, **ODC a mano**). Lo que ya no calza con el archivo
  sale en la bandeja "Decisiones que ya no calzan" (Órdenes). **Las órdenes que ya no vienen no se borran**: quedan con
  `estado:'noArchivo'` y todo lo suyo (15-sep).
- **Orden_de_trabajo.xlsx** (OT): `mOT`/`aplicarOT`; tabla 6 centro de trabajo Odoo → centro TEMPO, tabla 7 estado OT.
  Las OT mandan sobre corte, estampado, etiquetas, bordado, confección, plancha, botones y empaque (terminado = hecho).
  Pendiente: centro "T-BIANCO-SINTEC(COMPACTADORA)" sin fila en la tabla 6.
- **Fotos**: CSV (Orden de producción + Avatar base64), tandas < 10 MB, a Storage; `o.foto` + índice `S.params.fotosIdx`
  que las vuelve a colgar tras cada recarga. 669 órdenes con foto (14-sep); WH/MO/29252 dio error 502, reintentar.
- **Operaciones**: hoja LMO de OPERACIONES.xlsx (`mCargarLMO`/`aplicarLMO`, ahora con confirmación); mapeo familia de
  operación → centro y categoría padre/hija → categoría LMO (Configuración → Operaciones → Mapeo).
- **Facturas de compra** (catálogo de productos y proveedores, `mFacturas`; el archivo no se guarda) y **MP-IN** de ella.
- Estado de la carga completa del 14-sep (tarde): 1.223 órdenes (1.194 actualizadas, 29 nuevas, 15 que ya no venían),
  OT 695, fotos 664/665, 157 fases cambiadas por Odoo (aceptadas por instrucción expresa).

### 2.2 Fases (42 de Odoo + `1Calidad Tintoreria` interna), grupos y liberaciones
Tabla 1 (fase → grupo, es cola, sin carga, bloqueo, excluye, carga desde, tela, montado) y tabla 5 (grupos: orden 1–11,
libera tela, libera corte, secuencial). Orden: previo a producción → textil → planificación → preparación de corte →
corte → maquila externa → servicios → confección → terminados → prenda terminada → cerrada. CD = colas. Estampado /
bordado / confección **no son secuenciales**: lo dicen las OT. `faseEstado(fase,o)` calcula hechos/pendientes por
tabla; la OT manda. **Dos liberaciones**: textil (Dirección → Liberación, firma `o.lib.tela`) y a producción
(Planificación → Liberación a producción, una por una, dos casillas obligatorias en `o.lib.corte`: MP/insumos en
bodega + fecha de verificación; exige `calidadOk` para tela propia; los insumos no bloquean). Fase ≥ 2Planificacion =
liberada a producción por Odoo.
**Cambio de fases (15-sep)**: Control de piso → área "Cambio de fases" (`fasesCentralHTML`, `CTLF`): fase actual con
conteos, buscador inteligente, marcar varias, fase nueva + **motivo obligatorio** → `moverFases` (historial
`o.fases[]` con motivo/quién/cuándo + bitácora). La **etiqueta de fase junto a la WH es clicable en todas las pantallas**
(`faseTag` → `mCambiarFase`). **1Tejeduria → 0Ord Compras** = la tela se compra: `pasarACompras` reemplaza el paso `tej`
por `proveedor` (días de `diasProvOrden`), marca `telas[].ext='ext'`, guarda `o.compraTela` y una alerta en
`S.params.alertasCompras` → Hoy → Pendientes ("la persona de compras tiene que pedirlas") y panel rojo en Compras del
mes con botón "pedida" (`atenderCompra`).

### 2.3 Plan mensual (Dirección) — cinco bloques (14-sep noche)
1 **Días y capacidad** (calendario del mes por área arriba, `planMesHTML`; luego capacidad por área/centro/módulo).
2 **Resumen del mes** (KPIs; "en riesgo" se despliega con foto y dónde se atasca; Horizonte rodante sin tocar).
3 **Meta de facturación** (meta → liberado cubre / falta / qué liberar).
4 **Agregar órdenes al plan** (`agregarAlPlanHTML`): borrador `S.params.planMes[ym].oids`, órdenes del Proyecto del mes
   agrupadas (ODC/cliente/entrega/familia/hija, colapsables), "jalar del mes siguiente", buscador, **aviso de capacidad
   antes de guardar** por centro ("alcanza: te sobran X min" / "YA NO ALCANZA en centro: te pasas X min"; nunca impide)
   calculado con **minutos pendientes** (`cargaPlanCentros`, 15-sep) contra la capacidad del mes.
5 **Congelar** (`congelarPlan`: versión en `S.planes` con `oids`; `planMes[ym].congelado={ver,ts,u}`; agregar/quitar
   vuelve a borrador). Liberación marca "EN EL PLAN — pendiente de liberar"; cada centro → Carga que viene muestra el
   plan congelado con foto/WH/fase y "pendiente de liberar" (`planCongeladoCentroHTML`).
Estado: el plan de septiembre está **vacío** (borrador); ella debe agregar y congelar.

### 2.4 Motor de programación (no tocar sin permiso)
- `programar()` con caché `PLAN`; `programarTodo()` (toda la cartera, `LIB_ALL`) para vistas gerenciales.
- **Hacia atrás** (`S.params.motor='atras'`, 14-sep): cada orden parte de su fecha meta y se coloca de empaque a corte
  (`fluirAtras`, esperas por paso `S.params.esperasPaso`); si no cabe (cruza `S.params.inicio`, tela lista o `desde`
  del centro) se programa hacia adelante y queda `ro.motor='atras-no-llega'` con `diasTarde`, `atasco`, `fechaPosible`
  → Advertencias de fecha. Colecciones por ODC (`claveColeccion`) van tarde juntas. `inicio` = **2026-09-15**.
- Cola por centro: puesto `progCentro[c].pri` (arrastre en Centros → Programación, `moverEnCola`, aviso de qué órdenes
  dejan de llegar, bitácora); sin puesto = al final (`SIN_PUESTO`). Módulo fijo `recursoFijo`, prioridad `o.prio`.
- Capacidad de producción: `capDia(r,d)` = personas × minutos × eficiencia (asistencia del día manda); bordado por
  puntadas/min y cabezas (`velEfBordado`); tejeduría horas-máquina por tela (`kgTela`); tintorería horas por baño.
- Carga por centro en todo el sistema = **minutos pendientes** (prendas no hechas × min/prenda del centro).

### 2.5 Tejeduría y tintorería
- Tejeduría teje contra stock por tipo de tela (Stock de tela cruda, anticipación `tejAnticipSem` 2). Pendiente:
  descontar stock en el programa; carga de stock por Excel; código propio de corrida.
- **Tintorería** (lo más delicado; detalle en `CLAUDE.md`): baños por color (Pantone) armados a mano en "Armar baños"
  (`propuestaColor`, familias A/B se mezclan, piqué de baño propio, remanentes se mezclan, WH se parte), confirmados en
  `banos_conf` (código `T<MES><AA>-<COLOR>-<NN>`, kg por orden `opsKg`), máquina automática o fija (`recFijo`), arrastre
  máquina × día. **Reglas de máquina (14-sep noche, motor `maqApta`)**: DANITECH 1 rol **claro**, DANITECH 2 rol
  **oscuro**, STUART **ambos** (40 kg, sin piqué): claro → D1, oscuro → D2, medio → cualquiera, chico sin piqué → STUART.
  Profundidad = `fam` explícita / clasificación manual `profConf` (bandeja "Colores sin profundidad") / prefijo TCX
  (11 claro, 12–17 medio, 18–19 oscuro); nunca por nombre. Horas por profundidad (claro 4 / medio 7 / oscuro 8 / lavado
  3 / reproceso 10), `pctBueno` 95, `pctAprob` 70.
- **Gantt (15-sep)**: en el cuadro, un baño que dura más que las horas del día ocupa los días laborables siguientes
  ("sigue · día 2 de 3", `diasBano`, solo vista).
- **Registro**: Control de piso → Tintorería → "hecho" (`mBanoHecho`: kg reales por tela → `salidas_tin`, faltantes
  `avance.faltaKg`, la orden pasa a **Calidad de tintorería**); calidad aprueba (`calidadOk`, fase 2Planificacion) o
  rechaza (reproceso con motivo; `S.params.motivosReproceso`); faltantes (`faltantesPanelHTML`, `restriccionFaltante`);
  reporte mensual (`reporteTin`). `estadoTin(o)`: 1Tintoreria (Odoo) sigue disponible para armar; "incomplet" = solo
  los kg que faltan; "stock" = tinturada.
- Estado 15-sep: 48 baños confirmados y programados (ella deshizo 8 la noche del 14-sep y fijó 3 a máquina; 3 se cerraron por piso); STUART recibe Jersey 24/1 y
  Galleta (15-sep); SURF SPRAY clasificado claro; los 3 baños cuyo piso decía "ya salió" (TRUE RED-01, POMEGRANATE-01/02)
  cerrados; las órdenes con baño salido pero fase Odoo 1Tintoreria quedan en 1Calidad Tintoreria (piso manda). Los
  baños bajo 70 % se quedan como están (remanentes; decisión de ella).

### 2.6 Compras, macro y proveedores
- **Macro del mes** (Planificación textil): órdenes "montadas" (tabla 1 columna montado) → tela propia por tela/color con
  merma (`enc` de la tela o tabla 10), validada contra la hoja de ella (`METODO_MACRO_REPORTE.md`).
- **Compras del mes**: telas externas, insumos y servicios de las órdenes montadas por Proyecto, disponibilidad en
  bodega, proveedor (catálogo de facturas + MP-IN), agrupable, CSV; `S.params.diasProveedor` (15 laborables sembrados
  como estimado, confirmar uno por uno); fecha límite = requerida − días laborables (`dsumLab`). Panel de alertas
  "pasaron a compras" (15-sep).
- Ojales/botones: `S.params.tiemposOjalBoton` sobrescribe el SAM de Botones.

### 2.7 Producción: centros, control en línea y piso
- **Centros** (`vCentro`): Planificación, **Carga que viene** (plan congelado + cola normal), Programación del centro
  (cola con arrastre, agrupación, **PDF del programa para operarios** `imprimirProgramaCentro`: A4 horizontal, puesto,
  foto, WH, cliente, producto, color, min estándar, unidades; nada interno), Ejecución y desviaciones. Registrar hecho
  desde el centro (`marcarHechoCentro`, completo; parcial preparado con `S.params.modulosParcial`).
- **Mi centro (tablet, 15-sep, `vTablet`)**: perfil `tablet` ve solo esa página; centro y recurso por usuario en
  `S.params.tablets[uid]` (Usuarios → columna Tablet). Prendas del día / hechas / faltan; tarjetas con foto grande,
  WH+fase, producto, color, cliente, hechas/total, entrega, tallas (cuando Odoo las mande); **Hecho** (completo) y
  **cronómetro opcional** (`cronoTablet` → `avance.crono[c]`, vs estándar). Sirve para cualquier centro; agregar uno =
  asignar otro usuario. Las 11 cuentas de módulo las crea ella.
- Costura (secuencia por módulo, rebalanceo con aprobación, Andon), Balanceo por hoja estándar, Modo línea.
- **Asignación por orden** (Carga general): estados vencidaUnPaso / sinProgramar / noLlega / justo / bien, próximo paso,
  detalle de ruta, agrupación; colchón `S.params.colchonDias`.
- **Capacidad y decisiones**: matriz centro × mes, problemas y decisiones registradas (botones: decisión "con 4 personas
  cierran…"), comparación de motores.

### 2.8 Pantalla: fotos, fase, buscador, agrupación (15-sep)
- **`whCell(o)` = foto miniatura (clic agranda) + WH + `faseTag`** en toda lista de órdenes (Liberación, Control de piso,
  Tintorería, Producto en proceso, Programación por centro, Asignación por orden, Costura, Modo línea, Balanceo, Plan
  mensual, Carga que viene). Toda lista nueva debe usarlo.
- **Buscador como Odoo** (`busqHTML`/`matchBusq`/`BUSQ`): un campo que ofrece "Buscar <WH · ODC · Estilo · Color · Fase ·
  Cliente · Categoría> por: texto"; Enter = todos. En Órdenes, Liberación, Producto en proceso, Asignación por orden,
  Centro, Control de piso, Plan mensual → agregar, Cambio de fases.
- **Agrupación colapsable como Odoo** (`grpSelHTML`/`filasGRP`/`grpMap`, estado `GRP` con preferencia del navegador):
  hasta 3 niveles anidados por fase, cliente, ODC, categoría padre, hija, color, proyecto (y etapa actual); grupos
  cerrados con conteo y prendas a la derecha. En Órdenes, Liberación, Control de piso, Producto en proceso; Entregas,
  Avance del mes, Plan mensual → agregar y Carga general tienen la suya.

## 3 · Datos y dónde viven (memoria `S`, tabla `params` = `S.params`)
`S.params`: tablas 1–14, calendario/excepciones, `motor`, `inicio`, `esperasPaso`, `diasProveedor`, `tiemposOjalBoton`,
`motivosReproceso`, `restriccionFaltante`, `perfilesDef`, `tablets`, `planMes`, `metas`, `advertencias`, `capProblemas`,
`capDecisiones`, `pendPospuestos`, `alertasCompras`, `fotosIdx`, `colchonDias`, `modulosParcial`, tolerancias de
tintorería, `granMin`, etc. Órdenes: `op, ref, cliente, odc(+odcManual), proyecto, cat, color, cant, fecha, fase,
fases[], ruta[], telas[], lib{tela,corte}, prio, progCentro, recursoFijo, foto, ot, opsSam, rutaEditada, estado
(plan|prevision|cerrada|standby|noArchivo), compraTela`. `S.avance[oid]`: `centros{c:pz}, hechoC{c:{…}}, tinturada,
calidadOk, reprocesos[], faltaKg, crono{c:{ini,fin,min,u}}, seg`. `banos_conf`, `salidas_tin`, `planes` (versiones
congeladas con `oids`), `programas` (semanas congeladas), `bitacora` (**completa, sin tope**).

## 4 · Respaldo y restauración
Botón **Respaldo** (arriba) = `exportJSON`: todo `S` (datos + configuración + bitácora). Botón **Restaurar** (admin) =
`importJSON`: confirma con conteos, reemplaza por el archivo y **une la bitácora**. No incluye cuentas (Supabase Auth /
`perfiles`) ni las imágenes (Storage). Detalle y recomendaciones en `AUDITORIA_BORRADOS_Y_RESPALDO.md`.

## 5 · Pendientes (estado 15-sep-2026)
1. Ella: crear los 11 usuarios de módulo (perfil Tablet) y asignar centro/recurso; agregar órdenes al plan de
   septiembre y congelar; reintentar la foto WH/MO/29252; tabla 6 "T-BIANCO-SINTEC(COMPACTADORA)"; confirmar días de
   proveedor; tiempos LMO de las 14 categorías sin operaciones; ficha real de bordado; lavado/plancha (marcas, minutos,
   `pctEstimado`); decidir cuándo activar parcial en módulos.
2. Código: tejeduría descontar stock y carga por Excel; código de corrida de tejeduría; "avance incierto" (4 Calidad
   Produccion); confirmar qué ODC son colecciones reales; parámetro de tejeduría 2 semanas al motor hacia atrás; tallas
   en la tablet cuando Odoo las mande; resto de `AUDITORIA_REGLAS_FIJAS.md`.
3. Datos: 7 órdenes Stand by de PRICE CLUB sin rastro; decisiones de `METODO_MACRO_REPORTE.md` §6.

## 6 · Documentos del repo (por tema)
Auditorías: `AUDITORIA_PLANIFICACION.md`, `AUDITORIA_REGLAS_FIJAS.md`, `AUDITORIA_BORRADOS_Y_RESPALDO.md`.
Cargas: `RECARGA_PARTE1_REPORTE.md`, `RECARGA_PARTE2_*.md`, `CARGA_ORDENES_DE_TRABAJO_REPORTE.md`,
`ACTUALIZACION_14SEP_Y_MEJORAS_REPORTE.md`, `METODO_MACRO_REPORTE.md`, `LISTADO_CATEGORIAS_PRODUCCION.md`.
Motor y planificación: `MOTOR_HACIA_ATRAS_REPORTE.md`, `MOTOR_FASES_LIBERACION_ANTES_DESPUES.md`,
`ORDENES_DE_TRABAJO_Y_TRAMO_NO_SECUENCIAL.md`, `PROGRAMACION_CENTRO_COLA_REPORTE.md`, `CAPACIDAD_DECISIONES_REPORTE.md`,
`ASIGNACION_POR_ORDEN_REPORTE.md`, `PLAN_MENSUAL_FLUJO_REPORTE.md`.
Textil: `TINTORERIA_REGLAS_MAQUINA_COLOR_REPORTE.md`, `CUATRO_COSAS_PROVEEDOR_BOTONES_LIBERACIONES_TINTORERIA.md`,
`COMPRAS_Y_REGISTRO_CENTRO_REPORTE.md`, `SIGUIENTE_PASO_STOCK_BORDADO.md`.
Pantalla y piso: `PANTALLA_MENU_PENDIENTES_ODC_REPORTE.md`, `FOTOS_FASE_BUSCADOR_REPORTE.md`,
`CONTROL_LINEA_PDF_FASES_REPORTE.md`, `PERFILES_CENTROS_BALANCEO_REPORTE.md`, `VARIAS_COSAS_15SEP_REPORTE.md`.
Técnico: `CLAUDE.md` (resumen técnico y reglas de tintorería), `CONFIGURACION_CENTROS.md`, `SUPABASE_PERFILES.sql`,
`test/README.md`.
