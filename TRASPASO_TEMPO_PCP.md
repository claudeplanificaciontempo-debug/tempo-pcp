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
Entregas, **Plan mensual**, Demanda agregada, Escenarios, Auditoría, Capacidad y decisiones.
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
2 **Resumen del mes** (KPIs; **Vencidas** (entrega pasada) y **En riesgo** (no llegan) separados, con enlace a Hoy →
   Advertencias de fecha filtrado por mes, donde las vencidas muestran la fecha posible; Horizonte rodante sin tocar).
3 **Meta de facturación** (15-sep, sin repetir con el Bloque 4): "Base del plan" solo el número de sin-liberar + enlace a
   Liberación (sin lista propia); facturación esperada = solo lo que **termina dentro del mes** según `finPro`, lo
   liberado que termina después se muestra aparte; línea "liberando todo lo pendiente llegas a $A (B% de la meta)"; la
   tabla "Por liberar" es la única lista de detalle (foto/WH/fase) y las órdenes que ya son candidatas del Bloque 4
   solo se resumen con enlace (`#pm-agregar`) en vez de repetirse.
4 **Agregar órdenes al plan** (`agregarAlPlanHTML`): borrador `S.params.planMes[ym].oids`, órdenes del Proyecto del mes
   agrupadas (ODC/cliente/entrega/familia/hija, colapsables), "jalar del mes siguiente", buscador, **aviso de capacidad
   antes de guardar** por centro ("alcanza: te sobran X min" / "YA NO ALCANZA en centro: te pasas X min"; nunca impide)
   calculado con **minutos pendientes** (`cargaPlanCentros`, 15-sep) contra la capacidad del mes.
5 **Congelar** (`congelarPlan`: versión en `S.planes` con `oids`; `planMes[ym].congelado={ver,ts,u}`; agregar/quitar
   vuelve a borrador). Liberación marca "EN EL PLAN — pendiente de liberar"; cada centro → Carga que viene muestra el
   plan congelado con foto/WH/fase y "pendiente de liberar" (`planCongeladoCentroHTML`).
El plan **arranca con lo en proceso** (`planBase`: grupos con la columna "en el plan cuenta como en proceso" de la tabla 5,
de cualquier Proyecto, minutos pendientes); en "Agregar" solo los demás grupos, agrupados por fase por defecto; órdenes sin
mes de Proyecto → bandeja Hoy `sinMesProyecto`;
resumen por centro compacto; semanas vacías ocultas (15-sep). Estado: septiembre sin órdenes agregadas todavía; ella agrega y congela.

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
- **Ajustes de capacidad por semana** (15-sep): Plan mensual → Bloque 1 → Simular: minutos/personas/eficiencia por recurso y
  semana, provisional hasta "Guardar ajustes" (motivo obligatorio); se guarda en `S.params.ajustesCap` como base + extra sin
  tocar Configuración; `capDia` lo aplica; gerencia lo ve en el resumen del plan y en Capacidad y decisiones ("extras").
  Ver `SIMULADOR_CAPACIDAD_PLAN_REPORTE.md`.

### 2.5 Tejeduría y tintorería
- Tejeduría teje contra stock por tipo de tela (Stock de tela cruda, **primera entrada del menú textil**, anticipación
  `tejAnticipSem` 2). **Programación manual (15-sep)**: la pantalla ya no muestra la grilla automática; muestra pedido vs
  cargado por tela y la persona programa tela × máquina × día × kg (`S.params.progTej`, bitácora; avisa sin impedir si la tela no está en `kgTela` o se pasa de `kgDiaTela`). El motor sigue
  estimando la fecha de tela lista internamente; para que use lo manual hace falta tocar la sección de tejeduría del motor
  (opciones B1/B2 en `OBSERVACIONES_PLAN_TEJEDURIA_REPORTE.md` §5, pendiente de autorización). Sin imprimir. Pendiente: descontar stock en el programa; carga de stock por
  Excel; código propio de corrida.
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

### 2.31 Menú de Planificación de producción (16-sep)
- **Empaque sale del primer nivel**: es sub-área de **Terminados**. No es código: sale de la columna **«Ítem de
  planificación»** de Configuración → Centros; cambiarla rehace el menú en el mismo dibujado.
- **Sub-ítems dinámicos**: `armarNavSubCentros()` cuelga un `↳ sub-área` de **todo** ítem de planificación con 2 o
  más sub-áreas (hoy Terminados y Estampado), en el orden del proceso, con un `!` y el motivo cuando la sub-área
  tiene brecha (sin minutos o fuera de toda ruta). El aviso reusa `origenTiempoCentro()`: no hay segunda fuente.
- **`CEN.solo`**: el sub-ítem abre **esa sub-área sola** (con enlace «ver las N juntas»); el ítem padre sigue siendo
  el consolidado y la cabecera dice cuál es cuál. Sin esto, `↳ Estampado` bajo `Estampado` era un duplicado.
- **Etiquetas pasa al ítem Estampado**, verificado antes de mover: sus **dos únicas** operaciones de la LMO son
  «Etiquetar» en **SER-01 (serigrafía)**, TAMPOGRÁFICA 0,35 y MANUAL 0,40 — **ninguna cosida**. Siembra idempotente
  con bitácora; los **perfiles se mueven con ella** (`sembrarPerfilesEtiquetas`): «Producto terminado» deja de
  verla, «Corte, estampado y bordado» la ve. Las **tablets no cambian**: cada una apunta a un centro real.
- `CENTROS_PROD` se **deriva** de `GRUPO_PLAN_DEF` y `SUBAREAS` se alinea: ya no hay listas fijas que contradigan
  la columna configurada. Los dos lugares que leían `CENTROS_PROD` directo usan `censDeGrupo()`.
- **Brechas medidas** sobre los datos reales: **sólo 3 de 24 categorías tienen familia LMO vinculada** (es la causa
  de que la etiqueta de 0,5 min no cargue en ninguna camiseta y de que 15 de las 16 operaciones de ojales y
  botones no lleguen a ningún producto); **0 órdenes** con Etiquetas, Plancha o Empaque en su ruta.
- Ver `MENU_PRODUCCION_REPORTE.md` (incluye las 16 operaciones de ojales y botones con minutos y fuente).

### 2.30 Ajustes finales del 16-sep
- **Reportería → «Rutas sin secuencia»**: brecha con conteo por motivo (sin ruta, centro repetido, avance fuera de
  la ruta) y la lista de órdenes. Medido sobre el volcado real: de 1.155 abiertas, **685 sin ruta de producción**;
  y con la regla nueva **413 pares orden-centro pasan de Próxima a Disponible** (bordado 272, corte 85, estampado
  52, botones 4) y 10 al revés.
- **Ojales y botones**: una regla **confirmada en 0 aplica 0** (cero es cero). Lo **no confirmado** no se aplica y
  sale como **brecha** en el consolidado, en vez de caer al SAM de la LMO en silencio.
- **Lavado**: la columna nueva **«¿Ocupa capacidad?»** de la tabla de esperas por paso decide por modalidad: sí /
  no (solo lead time) / **pendiente**. Quito = lead time; **en planta queda pendiente de confirmación y no se
  asume**. Se retiró la suposición anterior de que no ocupaba capacidad.

### 2.29 Ajustes sobre la revisión (16-sep-2026)
- **Mi centro**: Disponible/Próxima se decide con la **secuencia de la ruta** de cada orden, no con el número ni el
  grupo de la fase (el número dice grupo, no orden; estampado, bordado y confección son empíricos). Si la ruta no
  lo define —sin ruta, centro fuera de la ruta o repetido— va a **«Ruta sin secuencia»**: se ve, dice el motivo y
  se puede iniciar. `cambiosDisponibilidad()` cuenta cuántas cambian de lado.
- **Liberación**: «Mes de entrega» vuelve, en multiselección y por la **fecha de entrega real**; las órdenes sin
  fecha van a «Sin fecha de entrega».
- **Terminados**: el consolidado dice **de dónde sale el tiempo** de cada sub-área. Ojales y botones = SAM de la
  LMO, que la **tabla de ojales y botones reemplaza** en las categorías con regla **confirmada**. Plancha = 2
  min/prenda (columna del centro). Lavado = días de la tabla de esperas, sin consumir capacidad.
- **Reglas de ruta** (Órdenes → Rutas): tabla editable familia + categoría + atributo → sub-área y posición, con
  vista previa, sin pisar rutas editadas a mano y con auditoría. Arranca vacía; cada regla nace apagada.
- Ver `REVISION_16SEP_SEIS_PUNTOS.md` (sección de ajustes A–E).

### 2.28 Revisión de seis puntos (16-sep-2026)
- **Liberación**: el mes del Proyecto es multiselección (con «Seleccionar todos» y «Limpiar»); el filtro de fases
  ya marca bien (el bug era el centinela «ninguna») y **acota de verdad** la lista, las tarjetas, el conteo y el
  botón de liberar, igual que categoría y tipo de tela. «Mes de entrega» se quitó: filtraba por el mismo mes del
  Proyecto.
- **Plan mensual → agregar**: agrupador anidado de hasta 3 niveles (Cliente, Fase, Familia, Tipo de producto,
  Tela, Color, ODC, Mes…) con checkbox para marcar el grupo entero.
- **Terminados** sigue siendo un ítem de planificación y abre con el **consolidado de sus sub-áreas** (ojales y
  botones, plancha, lavado, empaque, etiquetas) con capacidad, carga y ocupación de cada una; debajo, la cola y la
  programación de cada una. La pertenencia y los tiempos son **columnas editables** en Configuración → Centros
  («Ítem de planificación», «Por días», min/prenda, % estimado). Plancha sembrada en 2 min/prenda; lavado se mide
  por días (3 en planta, 15 en Quito para denim/jean, en la tabla de esperas).
- **Lavado y plancha en 0 horas**: no están en la ruta de ninguna orden, no tienen min/prenda ni operaciones
  mapeadas, y la reserva depende de eso mismo. Ahora la pantalla lo dice en vez de mostrar un 0 mudo.
- **Agrupación en los centros**: se agregó **Tela** (de la orden o de la tabla categoría → tela; sin mapeo,
  «Sin tela asignada») y cada grupo muestra órdenes, prendas, horas y minutos.
- **Mi centro**: la cola se parte en **En proceso** (CONTINUAR, barra de avance y «Terminar orden»), **Disponibles**
  y **Próximas** (fase de un paso anterior: se ven, no se inician). Un inicio sin fin se ve «en curso» con su tiempo.
- **«Va tarde» en los centros**: se calcula contra la **fecha meta de la orden** y el fin de la **orden completa**,
  no contra el paso. Ahora se distingue «meta vencida», «la orden va tarde» y «este paso va tarde», y cada cola
  explica arriba cuántas caen en cada causa.
- Detalle y datos faltantes en `REVISION_16SEP_SEIS_PUNTOS.md`.

### 2.27 Estado real de los permisos en Supabase (16-sep-2026) — YA EJECUTADO
- **Escritura del piso (15-sep noche)**: función `rol_piso_usuario()` + políticas `piso_inserta` y `piso_actualiza` en
  **avance, bitacora, turnos y paros** para `tablet, corte, modulos, terminado`. Sin DELETE. No se tocó ninguna
  política existente. Comprobado: 8 filas en pg_policies; la tablet guardó el 16-sep 08:08. El SQL realmente
  ejecutado está en `SUPABASE_POLITICAS_TABLET.sql` (la propuesta anterior NO fue la que corrió).
- **Funciones de fase y cola (16-sep)**: `SUPABASE_MOVER_FASE.sql` ejecutado; existen `fase_num`, `puede_mover_fase`,
  `mover_fase` y `set_prioridad_centro`. Los supervisores de piso ya mueven fases y reordenan la cola de verdad.
- **Roles en uso en perfiles**: admin 3 · terminado 1 · tablet 1 · corte 1. Nadie tiene `piso` ni `planificacion`.
- **Al ejecutar SQL con funciones, elegir siempre «Run without RLS»**; los avisos de «destructive operation» por
  `drop policy if exists` o `revoke` son esperables.
- **Un perfil nuevo del catálogo no escribe hasta habilitarlo en Supabase**: para las cuatro tablas del piso hay
  que agregarlo a la lista de `rol_piso_usuario()` (única regla de negocio que vive en la base); para mover fases
  basta marcarlo «Supervisor de piso» en la columna Piso del catálogo.

### 2.26 Entrar: recuperar la contraseña (16-sep-2026)
- La ventana de ingreso tiene **«¿Olvidaste tu contraseña?»**: pide el correo, manda el enlace y responde siempre
  lo mismo exista o no el correo («Si el correo está registrado, te llegará un enlace. Revisa también spam»).
- Al volver del enlace, la app **no entra directo**: pide la contraseña nueva dos veces (mínimo 8) y recién ahí entra.
- En **Configuración → Usuarios**, columna **Contraseña** → «enviar enlace» manda el mismo correo y queda en bitácora.
  La app **no puede poner la contraseña de otra persona** (haría falta la clave de servicio, que no puede vivir en
  una página pública): nadie ve ni elige la contraseña ajena.
- **Pendiente de la usuaria en Supabase**: URL Configuration (Site URL y Redirect URLs), plantilla del correo, y
  sobre todo un **SMTP propio**, porque el de Supabase manda muy pocos correos por hora. Paso a paso en
  `LOGIN_RECUPERAR_CONTRASENA.md`.

### 2.25 Nadie pisa lo que cambió otra persona (16-sep-2026)
Al leer se guarda el `actualizado` de cada fila. Antes de subir **órdenes** o **avance**, se relee del servidor lo que
va a cambiar: si nadie la tocó, se sube igual que siempre; si la tocaron, se **fusiona campo por campo** (lo que esta
sesión no cambió se queda como está en el servidor); y si los dos cambiaron el **mismo** campo no se sobrescribe:
sale el aviso «otra persona cambió esta orden» con dos salidas —dejar lo mío o quedarme con lo del servidor— y la
pantalla muestra lo del servidor hasta que se decida. Las demás tablas tienen un solo escritor o solo crecen
(bitácora, turnos, paros); para sumar alguna basta agregarla a `TABLAS_FUSION`.

### 2.24 Fases desde el piso: operario que pide, supervisor que mueve (16-sep-2026)
- El catálogo de perfiles tiene la columna **Piso** (Configuración → Usuarios): **operario** (tablet: registra y
  **pide** el cambio de fase) y **supervisor de piso** (corte, módulos, terminado: registra y **mueve** fases).
  Los dos siguen subiendo solo avance, bitácora, turnos y paros. Lo configurado manda sobre el código.
- El supervisor mueve la fase llamando a **`mover_fase`** en la base (rpc) y reordena la cola de su centro con
  **`set_prioridad_centro`**, no escribiendo en `ordenes`. Editar la ruta no se le habilita: la confirma planificación. La propuesta
  está en `SUPABASE_MOVER_FASE.sql` (**sin ejecutar**): valida al que llama leyendo `perfiles` y el catálogo, cambia
  **solo** `data->>'fase'` y el historial `data->'fases'`, y escribe la auditoría en `bitacora`. Si la función no existe,
  la app avisa «Falta ejecutar SUPABASE_MOVER_FASE.sql» y no cambia nada.
- La solicitud del operario la puede aplicar planificación **o** el supervisor.
- Si un cambio no se puede guardar con ese perfil (ruta, orden de la cola), la pantalla lo dice.
  **Pendiente de decidir**: reordenar la cola y editar la ruta también viven en `ordenes`; haría falta otra función
  igual de acotada si se quiere que el supervisor las guarde.
- **Centro → Programación** abre con **«Listas para empezar · aún no programadas»**: paso anterior cerrado, prendas
  ya en el centro, pero el motor las pone más adelante. Dice dónde terminó, cuándo, cuántas salieron y para cuándo
  están programadas, con botón **adelantar** para quien puede reprogramar.

### 2.23 Piso: guardado del operario, total sin tallas y cierre del paso (16-sep-2026)
- **El guardado del operario solo sube sus cuatro tablas**: `avance`, `bitacora`, `turnos` y `paros` (las mismas de las
  políticas RLS). Un perfil es «solo piso» por la columna **Solo piso** de Configuración → Usuarios (por defecto
  tablet, corte, módulos, terminado y los perfiles antiguos de piso; **planificación no**). En esas sesiones las
  demás tablas y `params` **ni se intentan**: las siembras y migraciones automáticas se usan en memoria, así que un
  rechazo de permisos ya no puede tumbar el registro del piso. El aviso de error dice en qué tabla falló.
- **Decidido por la usuaria (16-sep-2026)**: planificación **no** se marca «solo piso» aunque no tenga permiso de
  Configuración (escribe órdenes, programa y plan), y las siembras se quedan así: **no las guarda el piso**, sí
  planificación y administración. No se hace la versión estricta.
- **Lo que el operario hace fuera de esas tablas pasa a avance**: el pedido de reprogramación, su auditoría y —lo
  más importante— el **cambio de fase**, que ya no escribe en `ordenes`: queda como **solicitud** y planificación la
  aplica desde Control de piso → Cambio de fases (regla de secuencia y auditoría de siempre). Bandeja en Hoy.
- **Sin curva de tallas** hay una fila única **Total** para registrar; guardar el tramo con 0 unidades pregunta.
- **El resultado del buscador se ve siempre** como tarjeta: INICIO si está programada en ese puesto, «pedir
  reprogramación» si no, y aviso si hay un tramo abierto o uno pendiente de confirmar.
- **Cerrar la orden en el centro** («Terminé esta orden en mi centro», en «Confirma lo que salió»): completo cierra
  sin preguntar; con faltante muestra cuántas prendas faltan (por talla si hay curva) y exige motivo de la tabla 15
  con el uso **cierre con faltante** (sembrado vacío). Al cerrar, el paso cuenta como terminado (único cambio en el
  motor), la orden sale de la cola, el recurso queda libre y todo va a auditoría. Los centros siguientes trabajan
  contra **lo que realmente salió**. El faltante se ve en la ficha, en Control de piso y en el reporte de avance.
  **La fase no cambia**: la orden queda «terminada en <centro> · fase sin actualizar» en todas las listas, «Dónde
  está» dice «esperando en <siguiente centro>», y el supervisor la mueve desde Hoy → Pendientes o Control de piso →
  Cambio de fases. Reabrir un cierre: solo supervisor, con motivo y auditoría.
- Ver `TABLET_PERMISOS_REPORTE.md` (2ª entrega) y `MI_CENTRO_UNICO_REPORTE.md` (8ª y 9ª entregas).

### 2.22 Rutas confirmadas (15-sep-2026 noche, PARTE A)
**Ninguna orden se libera —ni textil ni a producción— sin RUTA CONFIRMADA.** Cada orden tiene `rutaConf`
(estado, origen `persona` u `Odoo OT`, quién, cuándo, nota), en auditoría y en la tabla 14 (se conserva en las
recargas). La ruta por defecto de Configuración **no confirma**: solo precarga el editor. Guardar la ruta en el
editor confirma (persona). El historial `rutaEditada` **no** es confirmación.
- **Confirmación automática (A2)**: solo si el conjunto de centros de las OT de Odoo (en cualquier estado, sin
  canceladas ni bodegas, todas con centro TEMPO en la tabla 6, sin contradicción fase vs OT) es **idéntico** a los
  pasos de la ruta actual. Lo demás queda «por definir» **sin tocar su ruta** y la pantalla dice en qué difiere.
  Nunca pisa una confirmación de una persona. El botón **«Confirmar las que coinciden con Odoo (N)»** está en la
  pestaña Rutas junto a la línea «Qué dice Odoo hoy: N coinciden · N difieren · N sin mapear · N contradicción ·
  N sin OT»: **el conteo se ve antes de aplicar**.
- **Pestaña Rutas** (Dirección → Órdenes de producción): tarjeta «Faltan N rutas por confirmar», lista **Por
  definir agrupada por referencia** (editar y confirmar, confirmar como está, solo esta WH) y lista de confirmadas
  con origen, quién y cuándo. Una WH nueva de una referencia confirmada entra precargada y por definir.
- **Freno**: «Qué la frena» dice «falta confirmar ruta →» y enlaza a Rutas; las ya liberadas sin ruta confirmada
  **no se desliberan** y salen en Hoy → Pendientes (`libSinRuta`, `rutasPorDefinir`).

### 2.20 Centros: limpieza de la pestaña Planificación (15-sep-2026 noche)
- El **total de órdenes de la semana** va en grande y con el color del tema; siguen ordenadas por fecha de inicio.
- **Vienen después** está en el mismo bloque, por fecha de inicio, con la columna **Dónde está** (de dondeEsta(), con
  color según qué tan cerca está de llegar al centro). **La fecha de entrega del cliente ya no se muestra** en la
  pestaña Planificación.
- La pestaña **Carga que viene salió de los centros**: su resumen completo (programado del mes con toda la cartera,
  liberado, por liberar, órdenes en camino, plan congelado y la lista agrupada por dónde está) se ve en
  **Planificación de producción → Carga general**, eligiendo el centro en el selector.
- Agrupador (Fase, Familia, Cliente y el resto) y buscador común en las pestañas de centro, Carga general, Liberación
  a producción y Control de piso. La cola del centro ya usaba el agrupador común y conserva el arrastre.

### 2.19 Permisos de la tablet (15-sep-2026 noche)
- El operario recibía «new row violates row-level security policy» en avance y bitacora: las políticas de Supabase no
  incluyen al perfil tablet. Las políticas **no estaban en el repo**; ahora hay dos archivos:
  `SUPABASE_POLITICAS_ACTUALES.sql` (consultas para volcar las que existen hoy) y `SUPABASE_POLITICAS_TABLET.sql`
  (propuesta, **sin ejecutar**): lectura de lo que Mi centro necesita y escritura solo en **avance, bitacora, turnos y
  paros** para los perfiles de piso. Nada de escritura en órdenes, params, centros, recursos ni configuración.
- **Si el guardado falla, la app ya no recarga**: el registro se queda en pantalla, aparece el aviso «no se guardó,
  avisa a planificación» con botón Reintentar, y al guardar bien desaparece.
- La cabecera del operario no muestra Respaldo ni Restaurar (solo con permiso de configuración).
- El buscador de WH va arriba de todo en Mi centro; la barra general no se corta en teléfono.

### 2.18 Mi centro único: inicio, fin, tiempo y unidades por talla (15-sep-2026 noche)
- **Modo línea se juntó con Mi centro**: ya no está en el menú ni en los perfiles y el enlace viejo abre Mi centro del
  mismo módulo. La pantalla vieja sigue en el código hasta que la usuaria confirme borrarla.
- **El flujo es uno**: elegir orden programada en el centro (con foto) → INICIO → FIN → unidades por talla con + y −
  contra lo cortado o lo pedido → Guardar. Durante el tramo hay botón **Paro** con motivo de la tabla 15, y ese tiempo
  se descuenta.
- **Tiempo real**: trabajado = fin − inicio − paros − descansos del horario; minutos-persona = trabajado × personas
  del recurso; minutos por prenda real = minutos-persona / unidades, con semáforo contra el estándar. Parámetros
  `tolMinPrenda` y `topeHorasTramo` en Configuración.
- **Hoy no hay descansos cargados en ningún centro** y los centros que no son módulos no tienen personas: se reporta
  en pantalla y se calcula con 0 descansos y 1 persona. No se inventa nada.
- **Olvidos**: un inicio sin fin que pasa del tope avisa en Mi centro y en Hoy → Pendientes; el supervisor pone la hora
  real con motivo y queda en auditoría. El sistema no cierra solo.
- **Una orden abierta por puesto**: iniciar otra pregunta si cierra la anterior.
- **Reloj vivo** en h:mm:ss mientras el tramo corre (solo cambia el texto, no redibuja); se congela en el paro. Se
  arranca al final de cada dibujado de pantalla.
- **El operario busca la WH con un campo simple** (teclado numérico, acepta «28300» o la WH completa); los demás
  perfiles conservan el buscador común.
- **Arranque sin parpadeo**: hasta tener el perfil solo se ve «Cargando…»; nadie alcanza a ver el menú de otro perfil.
- **Lo hecho en el día se cuenta en un solo lugar** (`hechasDelDia`): sale de los registros por talla del tramo y del
  registro por total; los registros viejos solo suman si esa orden no dejó línea ese día. El tramo también suma a la
  producción del turno, que es lo que leen Reportería y Ejecución.
- **Cada paso del tramo guarda de inmediato**: si el servidor lo rechaza, queda en el aviso de reintento y no se pierde.
- **Sin curva de tallas** (hoy son todas): al confirmar lo que salió hay una **fila única «Total»** con el mismo formato
  que una talla (− / + / +10 / +25, número grande editable y segundas). Se guarda con la talla «(total)», suma en
  «Hechas hoy» y sube el avance de la orden en ese centro. Guardar el tramo **con 0 unidades pregunta** (puede haber
  sido solo un paro), ya no se bloquea.
- **El resultado de la búsqueda se ve siempre** como tarjeta debajo del buscador (foto, WH, fase, color, prendas y
  entrega), esté o no en la cola: **INICIO** si está programada en ese puesto, o bloqueada con «pedir reprogramación»
  si no. Si hay un tramo abierto —o uno terminado sin confirmar— de otra orden, la tarjeta lo dice y lleva a ella.
  Acepta «28513» o «WH/MO/28513» y muestra hasta seis coincidencias.
- **Quién trabajó el tramo** se conserva: las unidades se guardan en `pz` (antes pisaban el campo de la persona, y la
  columna «Quién» de «Lo registrado hoy» mostraba un número).
- **Paro sin minutos**: se elige el motivo (tabla 15, uso «paro»). Almuerzo, Cierre del día y Fallo de máquina se
  aseguran siempre; los tipos de paro viejos quedan en la tabla pero **inactivos** (el operario solo ve los activos) y
  la duración la calcula el sistema al Reanudar. El cierre del día no cuenta como trabajo ni dispara el aviso de olvido.
  Si el almuerzo está marcado como paro, el descanso del horario no se descuenta otra vez.
- **Tallas a la vista** durante el tramo: Pedido, Cortado, Hechas y Faltan, con + − +10 +25; sin curva, solo total.
- **Operarios**: el perfil tablet entra directo a su centro y recurso, sin selectores, y solo ve lo programado en su
  recurso. El alta de usuario pide centro y recurso (obligatorio en módulos) y lista los módulos sin operario.
- **Personas del tramo**: manda la asistencia real del día; si no hay, el ajuste de la semana (la pantalla dice
  «planificado para la semana (sin asistencia registrada hoy)»); si no, las personas
  del recurso; y solo si no hay nada, 1, avisado. La pantalla dice de cuál salió.
- **Descansos**: ventanas de hora por centro (tabla 18); se descuenta solo la parte que cae dentro del tramo.
- **Segundas** por talla en el mismo flujo: los minutos por prenda se calculan sobre las buenas y también se muestran
  con segundas. Es el mismo dato que ve Control de piso.
- **Avance rápido**: botones +10 y +25 por talla, tomados de parámetros.
- Cada tramo guarda quién, cuándo, centro, recurso, paros, tallas, tiempo y minutos-persona: es la base del
  seguimiento de avance del responsable de centro.

### 2.17 Búsqueda general, buscador y agrupador (15-sep-2026 noche)
- **Barra de búsqueda general** en la cabecera, en todas las pantallas y en teléfono: WH, ODC, cliente o referencia,
  con foto, fase y dónde está; el clic abre la ficha de la orden (ruta con el paso actual, fechas, avance por talla e
  historial). Respeta los perfiles.
- **Buscador de lista**: escribir busca en todos los campos; elegir uno es opcional.
- **Agrupador**: Familia y Tipo de producto (antes categoría padre e hija), en el orden Cliente, Fase, Familia, Tipo de
  producto, Color, ODC, Mes de entrega, Próximo paso, Proyecto. Los nombres salen de la tabla 17 · Textos de pantalla.
- **Se agregó el buscador común** en Entregas, Costura y el detalle de Capacidad y decisiones (ahí también el agrupador).
- **No lo llevan** Tejeduría, Tintorería, Stock, Compras, Macro, Reportería ni Avance: no listan órdenes.
- **Conservan su agrupador propio** Entregas (departamento y estilo, selección para el PDF), Plan → Agregar (casillas)
  y la secuencia de Costura (el orden es la función).
- Lo elegido se recuerda **por pantalla y por usuario**.

### 2.16 Carga general y Balanceo etapa 1 (15-sep-2026 noche)
- **Una sola cuenta de carga**: la misma fórmula (minutos pendientes por centro, separados en firme, en proceso y
  reserva) con tres bases: **programadas**, **todas las abiertas** y **plan del mes**. Cada pantalla dice con cuál está
  calculada. El número **oficial del mes es el plan congelado**; las demás lo muestran como referencia cuando difieren.
- **Carga general** es solo consulta: área y centro, filtro de fases y buscador comunes, carga contra capacidad por
  semana (8 semanas, parámetro `semCarga`), cruce familia por centro y detalle hasta las órdenes con el agrupador y el
  enlace al estado de cada una.
- **Reserva**: solo lavado y plancha, con los minutos por prenda y el % estimado del centro. Sin esos datos, cero y
  aviso en Hoy → Pendientes.
- **Asignación por orden** se mudó a Reportería, entera.
- **Balanceo etapa 1**: tabla de **tipos de máquina con alias** (se siembra con los nombres de la hoja sin agrupar; los
  TP quedan «por confirmar con planta»), **máquinas por módulo** (ya existía, ahora usa esos tipos), **operarias y
  especialidades** (nombre, módulo y nivel 1/2/3 por máquina, no obligatorio), parámetros **tolPuesto** y
  **nivelMinEsp**, y la **vista de módulos** con personas, máquinas y referencia en curso.

### 2.15 Piso: Mi centro, tallas y teléfono (15-sep-2026 noche)
- **Mi centro** muestra solo lo programado en ese centro. El buscador por WH: si la orden existe pero no está
  programada ahí, sale bloqueada con «no programada · pedir reprogramación»; el pedido avisa en Hoy → Pendientes a
  quien puede reprogramar. El operario no reprograma.
- **Carga del pedido por tallas** (Configuración → Órdenes y materiales → 16 · Tallas): Excel o CSV, columnas por
  nombre, formato largo o ancho (dice cuál detectó), vista previa con WH inexistentes, sumas que no cuadran y tallas
  nuevas (se proponen, no se crean solas). La curva se guarda en la orden y está en la tabla 14, así que las recargas
  no la pisan.
- **Registro por talla**: corte registra la curva real; los demás centros se miden contra lo cortado y, si no hay
  corte, contra lo pedido (marcado). Pasarse avisa y queda marcado. Sin curva ni corte, solo total y aviso en Hoy.
  Cada registro queda auditado con quién, cuándo, centro, talla y unidades.
- **Cronómetro** en minutos y segundos, con las unidades por talla del tramo.
- **Cambio de fase desde piso**: observación de la tabla 15 (uso «observación de piso»), sin texto libre; el motivo
  solo se pide si la fase nueva tiene secuencia menor en la tabla 1.
- **Teléfono**: Mi centro y Control de piso revisados a 375 px, respetando los perfiles.

### 2.14 Centros de producción (15-sep-2026 noche)
- **Confección** se ve por **módulo**, con la **maquila aparte**: una tarjeta por puesto con prendas, minutos usados y
  capacidad; al abrirla salen sus órdenes por familia.
- Todos los centros tienen el **filtro de fases** común y el **agrupador** común (en la cola los grupos vienen abiertos
  y el clic los cierra; se sigue arrastrando para cambiar el puesto).
- **Resumen de la semana** arriba de la programación: día × familia, con unidades y horas.
- **Carga que viene**: cruce **familia por fase** que se da vuelta, y **sin liberar** como tarjeta desplegable.
- **Color**: botón «juntar colores en la cola» en corte y confección. Es vista y orden manual, queda en bitácora y no
  cambia ninguna fecha del motor. Lo que haría falta para que el motor secuencie por color está en `CENTROS_REPORTE.md`.
- Las vistas de centro **no muestran la fecha de entrega**: muestran plan inicio → fin y una marca (prioridad / va tarde).
- **Costura: secuencia y rebalanceo** es una pestaña del centro Confección; ya no está suelta en el menú.

### 2.13 Liberación y Liberación a producción, tres bloques sobre la base del mes (15-sep-2026 noche, PARTE B)
Las dos páginas comparten pantalla. **La base es una sola: las órdenes del Proyecto del mes elegido**, con el
selector «Mes del Proyecto» arriba (arranca en el mes en curso; «Todos los meses» se respeta). Sobre esa base,
**liberado + pendiente = total** en órdenes, prendas y kilos.
- **Bloque 1 · Pendiente de liberar**: fila superior a todo el ancho con la tarjeta «N órdenes · N unidades» y, al
  lado, ODC / Familia / Cliente, agrupador y buscador comunes; los botones de liberar (en producción no hay botón
  masivo: una por una con las dos verificaciones); **tarjetas por familia** con sus unidades pendientes de mayor a
  menor; al tocar una familia se abre su **detalle** (foto, WH, fase, cliente, color, prendas, entrega, chips «qué
  le falta» por tela, control de ruta y **Qué la frena**) con selección para liberar. «Ver todas las pendientes»
  abre la lista completa, y al buscar o agrupar se abre sola.
- **Bloque 2 · Resumen de lo liberado**: grilla 2 × 2 (en teléfono, en columna) — carga por familia, por tipo de
  producto, por tipo de tela en kilos y por color — con barra y **% = liberado ÷ total**; con órdenes marcadas la
  fila y la barra muestran a cuánto subiría. **Misma base y mismo cálculo en los cuatro cuadrantes**, y no cambian
  con los filtros del bloque 1 (la nota del bloque lo dice). Debajo, las tarjetas del resumen (órdenes,
  referencias, kilos, horas) y el desplegable «Qué cargó lo liberado» (tejeduría, tintorería y centros).
- **Bloque 3 · Órdenes liberadas**: buscador común, revertir la liberación con motivo de la tabla 15 y devolver la
  fase según la secuencia de la tabla 1. Todo queda en auditoría.
- **Ruta por defecto**: en Configuración → Centros, la marca «va por defecto en toda ruta» (sembrada en corte,
  confección y empaque, editable, con bitácora). Al abrir una orden sin ruta editada esos pasos vienen marcados, y
  Liberación avisa cuáles de las órdenes cargadas contradicen esa ruta. **Esa ruta por defecto no confirma nada.**
- El mapa completo de «qué había antes y dónde está ahora» está en `RUTAS_Y_LIBERACION_REPORTE.md`.

### 2.12 Tejeduría en el motor y Bloque 2 contra la fecha meta (15-sep-2026 noche)
- **Tejeduría**: al programar, los kilos de cada tela se cubren en este orden: **stock de tela cruda** (la orden con la
  fecha requerida más cercana lo toma primero y queda con la tela lista de una), **lo programado a mano** por la persona
  de tejeduría (con su máquina y su día) y, recién lo que falta, una **corrida automática** marcada «fecha estimada por
  el sistema · sin programar a mano». Es lo único del motor que se tocó.
- **Pedido vs cargado** en Tejeduría muestra por tela: pedido, stock, programado a mano y estimado por sistema.
- **Antes y después**: panel en Tejeduría que compara la fecha de tela lista contra la corrida automática de siempre y
  dice cuántas órdenes cambian y cuántos días, en vivo con los datos reales.
- **Plan mensual, Bloque 2**: vencidas y en riesgo se cuentan contra la **fecha meta** (compromiso si existe, si no la de
  Odoo), la misma que usa el motor. Una orden con fecha de Odoo pasada pero compromiso futuro no es vencida.

### 2.11 Dirección · Hoy (15-sep-2026 noche)
- **Escenarios ya no existe.** No guardaba nada: lo que se probaba ahí vivía solo en memoria. Para probar personas y
  días se usa el simulador de capacidad del Plan mensual, que sí guarda con motivo.
- **Hoy** arranca con Pendientes y sigue con tarjetas: a tejer hoy, baños, programadas hoy, entregas en 7 días,
  vencidas y última carga. Las de tejeduría y planta abren la lista de qué se está haciendo, agrupada por familia.
- **Bandejas del día**: ocho tarjetas (sin fecha, por liberar, entregas de la semana, en riesgo, vencidas, por terminar
  en 7 días, tela externa por llegar, por liberar a corte). Cada una abre su lista agrupada por familia, con foto, WH y
  fase, y cada orden tiene «ver dónde está →», que abre la pantalla donde se resuelve su estado y deja el «← atrás».
- **Necesita decisión**: tarjetas de baños por armar, centro-mes que no alcanzan, órdenes que no llegan y faltantes de
  tintorería. **Capacidad y decisiones sigue siendo una pantalla aparte**: Hoy solo enlaza, no repite su tabla.
- **Mes en curso** quedó igual.

### 2.10 Componentes comunes, tema y responsive (15-sep-2026)
Todo esto es **un componente por cosa**, reutilizado; al hacer una pantalla nueva se usan estos y no se copia nada.
- **Filtro de fases**: un desplegable con los grupos de la **tabla 5** ("1 · TEXTIL", "2 · PLANIFICACIÓN"…), casillas por
  fase, "todas/quitar" por grupo y arriba **Seleccionar todas** / **Limpiar**. Reemplazó todos los filtros de fase
  (Liberación, Liberación a producción, Órdenes, Demanda agregada por familia).
- **Agrupador**: hasta 3 niveles por fase, cliente, ODC, categoría padre/hija, color, proyecto, etapa, **próximo paso** y
  **mes de entrega**; cada grupo muestra órdenes, prendas y **horas**. Lo usan Órdenes, Liberación, Control de piso,
  Producto en proceso, Vista general y Asignación por orden. La cola por centro (se arrastra), Plan → Agregar (casillas)
  y Carga por tipo de producto conservan el suyo porque hacen algo más que agrupar.
- **Tarjeta resumen**: número grande + texto; si representa órdenes, al hacer clic despliega la lista con **foto, WH y
  fase**. En Plan mensual bloques 2 y 3 y en Mi centro.
- **Buscador**: el de siempre (WH, ODC, **referencia (estilo)**, color, fase, cliente, categoría) en todas las listas.
- **Devolver fase / revertir liberación**: el motivo se pide **solo cuando se devuelve**. Devolver = la fase nueva
  tiene **secuencia menor** en la columna «secuencia» de la tabla 1 (números libres; dos fases con el mismo número
  son **paralelas**). Mientras una fase no tenga secuencia se usa la regla por **grupo de la tabla 5** y la fase sale en
  Hoy → Pendientes («Fases sin secuencia»). La secuencia la carga la usuaria; el sistema no la siembra (propuesta en
  `SECUENCIA_FASES_DEVOLUCIONES_REPORTE.md`). Avanzar, o moverse a una fase paralela, no pide motivo (igual queda en
  auditoría con quién y cuándo). Revertir una liberación siempre pide motivo. Los motivos salen de la **tabla 15 ·
  Motivos** (Configuración → Órdenes y materiales), con usos: devolución de fase, reversión de liberación, **reproceso de
  tintorería** (estas filas conservan la columna "¿viene de tejeduría?" y son las que edita el panel de Tintorería) y
  observación de piso. **No hay texto libre.** Mientras falten motivos de devolución o de reversión, Hoy → Pendientes lo
  avisa ("Configurar motivos de devolución") en vez de bloquear recién en el momento. Cada cambio queda en Auditoría de
  replanificación con quién, cuándo, antes, después y motivo; las devoluciones se distinguen de los avances.
- **← atrás**: al llegar a una pantalla desde un clic en otra, arriba aparece "← atrás" y vuelve al mismo lugar (filtros,
  agrupación, búsqueda y posición). Navegar por el menú limpia esa pila.
- **Tema**: los colores viven en seis tokens de `:root`; cambiarlos cambia tarjetas, bloques y encabezados de tabla en
  todo el sistema. Si se elige otra paleta, se tocan solo esos tokens.
- **Responsive**: hasta 860 px de ancho el menú se colapsa tras el botón ☰, la cabecera se acomoda en dos filas, las
  tarjetas se apilan y las tablas tienen scroll propio. Revisado a 375 px en Mi centro, Control de piso y Liberación.
Detalle en `COMPONENTES_COMUNES_TEMA_RESPONSIVE_REPORTE.md`.

## 3 · Datos y dónde viven (memoria `S`, tabla `params` = `S.params`)
`S.params`: tablas 1–14, calendario/excepciones, `motor`, `inicio`, `esperasPaso`, `diasProveedor`, `tiemposOjalBoton`,
`motivos` (tabla 15, incluye los de reproceso), `motivosReproceso` (arreglo anterior, conservado), `motivosMigrados`, `auditoriaCambios`, `restriccionFaltante`, `perfilesDef`, `tablets`, `planMes`, `metas`, `advertencias`, `capProblemas`,
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
0. **Sin ejecutar, esperando su revisión:** el paso A2 de rutas (botón «Confirmar las que coinciden con
   Odoo» en Órdenes → Rutas) y `SUPABASE_POLITICAS_TABLET.sql`. Ver `RUTAS_Y_LIBERACION_REPORTE.md`.
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
Rutas y liberación: `RUTAS_Y_LIBERACION_REPORTE.md`.
Pantalla y piso: `PANTALLA_MENU_PENDIENTES_ODC_REPORTE.md`, `FOTOS_FASE_BUSCADOR_REPORTE.md`,
`CONTROL_LINEA_PDF_FASES_REPORTE.md`, `PERFILES_CENTROS_BALANCEO_REPORTE.md`, `VARIAS_COSAS_15SEP_REPORTE.md`.
Técnico: `CLAUDE.md` (resumen técnico y reglas de tintorería), `CONFIGURACION_CENTROS.md`, `SUPABASE_PERFILES.sql`,
`test/README.md`.
