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

### 2.70 Planificar el mes en dos pasos: nivelación con días y personas, luego el plan (20-sep)
- Dirección → «Planificar el mes»: paso 1 Nivelación (calendario de días, personas por centro como escenario que al confirmar se
  vuelve el ajuste de cada semana y manda en todo el sistema, ¿alcanza?), paso 2 Plan mensual. Producción → Nivelación es la misma
  nivelación por meses. Capacidad: escenario > vigente > configurado, y la fila dice cuál manda. Ver `PLANIFICAR_EL_MES_DOS_PASOS.md`.

### 2.69 Orden real de las fases con decimales y listas ordenadas por esa secuencia (20-sep)
- Archivo de la usuaria con 40 fases numeradas 0 … 8.6 (mismo número = paralelas). Reemplaza la numeración del 19-sep; Confección
  después de servicios, Empaque después de Servicios y Terminados. Seis fases sin número en el archivo se ubicaron junto a su
  pareja (a confirmar). Toda lista de fases se ordena por esa secuencia (`cmpFases`). Ver `FASES_ORDENES_FICHA_19SEP.md`.

### 2.68 Pestaña Rutas en un solo recuadro y ruta en lote (20-sep)
- Órdenes → Rutas es UNA lista (por confirmar / confirmadas / todas, buscador) con el agrupador común y casilla por grupo y por
  orden; sobre lo marcado: «Definir ruta para las marcadas» (rutas actuales con «usar», casillas de centros, plan por orden — entra /
  sale / conserva lo hecho o excluido por la fase / sin tiempo / con avance —, motivo, confirmación, Empaque obligatorio, tiempos por
  `tiempoPaso`, confirmación y auditoría por orden, una bitácora, advertencias de fecha) y «Confirmar como están». Rutas estimadas,
  reglas de sub-áreas y Odoo plegados en «Más herramientas». Desplegar un grupo ya no manda la lista al inicio; filtros en una fila con
  filtro de fases. La ruta por orden y «qué dice Odoo» miran la ruta completa (los pasos hechos salían desmarcados). **La OT manda
  sobre la ruta**: al cargar órdenes de trabajo (y al recargar tareas o rehacer rutas) el centro con OT entra a la ruta; nunca se quita
  un paso por falta de OT. Redibujar (guardar, desplegar, marcar) ya no manda la pantalla al inicio. En la lista de Órdenes hay
  columna Ruta y botón «✓ Ruta ok» para confirmar una a una sin abrir la ficha. **Excedentes** (palabra en la ODC, parámetro):
  prenda ya hecha, ruta = solo el paso final (Empaque por defecto, parámetro). Rutas trae ODC y prendas. **La OT no toca una
  ruta confirmada**: lo que difiera se reporta en el Reporte OT. Ver `RUTA_EN_LOTE.md`.

### 2.67 Ruta lista sin editar y bloques de la ficha que no se cierran solos (20-sep)
- Decisión de la usuaria: una orden con la prenda terminada (fase con «sin carga» en la tabla 1: empaque terminado, cross, centro
  de distribución, novedades, embodegado, exportación, cotizaciones, facturado, stand by) o cerrada en Odoo **no necesita revisar
  la ruta**: `rutaNoAplica(o)` / `rutaLista(o)` (derivado de la fase, nada se escribe). Órdenes → «Por editar» ya no las lista;
  el chip se llama «Ruta lista (confirmada o prenda terminada)»; Rutas, liberación, auditoría y la ficha lo dicen.
- Un manejador global cerraba todo `<details>` al hacer clic fuera (desde el primer commit): la ficha se cerraba sola al tocar un
  campo. Ahora solo se cierran los desplegables (menú «⋯», filtro de fases, selectores múltiples). Ver `FASES_ORDENES_FICHA_19SEP.md`.

### 2.66 Fases con secuencia y significado, Órdenes «por editar», ficha por bloques, fotos con zoom (19/20-sep)
- Tabla 1: secuencia y «qué significa» de las 46 fases según la usuaria y el orden de Odoo (agrega 6Sublimado, 6Pulido Bordado,
  8Cotizaciones); el tramo estampado/bordado/confección/maquila no es secuencial (mismo número); las cuatro «esperando factura»
  son paralelas. Órdenes abre en «Por editar (ruta sin confirmar)»; guardar la ficha confirma la ruta. Ficha en cuatro bloques
  (datos, materia prima de Odoo con tela de la tabla 8, ruta y operaciones con sub-bloques, insumos), modal a 96 % de la pantalla.
  Fotos 44 px con zoom al pasar el mouse. Paneles con borde marcado y títulos en banda en todo el sistema. Ver
  `FASES_ORDENES_FICHA_19SEP.md`.

### 2.65 Maestro de productos y qué le falta a la tela por origen (19-sep)
- Tabla 12 → «Cargar maestro de productos»: origen POR PRODUCTO (TEMPO = se teje aquí; proveedor = externa; sin proveedor = tabla 3),
  proveedor facturas → maestro → usuaria, «Recalcular telas de las órdenes» sin recargar Odoo, tabla 12 por proveedor con «sin
  proveedor» primero. Tabla 13: sin palabra, decide el origen (PROPIA → tintura; EXTERNA → nada; sin clasificar → según Pantone).
  Ver `MAESTRO_PRODUCTOS.md`.

### 2.64 Orden de las operaciones (hoja de producción) y ruta por defecto al cargar (19/20-sep)
- Operaciones → «Cargar orden de las operaciones»: el paso de cada operación dentro de la prenda (595 de 595 calzan); el balanceo
  usa el orden real. Una orden nueva de familia sin hoja de operaciones nace con corte → confección → empaque (estimada; corte y
  empaque en 0 con aviso). Entrega `entregas/TIEMPOS_PARA_LLENAR3.xlsx` para ingeniería. Ver `TIEMPOS_SANTIAGO_REPORTE.md`.

### 2.63 ID de tarea de Odoo como identidad de la orden (19-sep)
- El archivo de tareas puede traer la columna «ID» (ID de la tarea en Odoo): con ella la orden se reconoce por el ID aunque
  no tenga WH todavía, y cuando la WH llegue o cambie sigue siendo la misma orden. Sin la columna, todo sigue como antes y
  nadie pierde su ID. Las OT y las fotos siguen entrando por WH. Una fila que traiga la WH de una orden que ya tiene otro ID
  no se aplica y la orden queda marcada «ID de tarea distinto — revisar» (bandeja en Hoy). Ver `CARGAS_ID_TAREA.md`.

### 2.62 Para Dummies · entrega 1 (19-sep)
- Misma cabecera en todas las pantallas: los párrafos explicativos viven en el «?» del título; buscador, filtro de fases y
  agrupador plegados bajo un botón «Filtrar» (se abre solo con un filtro activo; se recuerda por usuario; la tablet no se
  pliega). Palabras de planta: orden de llegada, cuello de botella, días de holgura, SAM, «Nivelación» (el 20-sep se descartó «¿Alcanza la capacidad?»).
  Semáforo (`estadoSemaforo`): un color y un verbo por orden en Órdenes, Liberación, Entregas y Control de piso.
  Propuesta completa (A–J) en `UX_PARA_DUMMIES_PROPUESTA.md`; ver `DUMMIES_1_CABECERA_PALABRAS_SEMAFORO.md`.

### 2.61 Auditoría del sistema (19-sep)
- Reportería por área → «Auditoría del sistema» (`auditoriaSistema`): 24 reglas sobre los datos vivos con cuántos, ejemplos y
  qué hacer; correrla en producción es la forma de revisar la parametrización (la clave pública no lee nada bajo RLS).
  Corregido en esa auditoría: la carga de tareas ya conserva rutaConf/tallasPedido/histLib/lavadoModo/compraTela/rutaFirma
  (antes cada «Actualizar datos» borraba las confirmaciones de ruta y mataba el recálculo automático de rutas);
  `recalcularRutas` respeta la fase; `liberarCorte` con ruta confirmada; bordado en puntadas en el plan; OT con fecha y hora
  coherentes; bandeja «Pasos de la ruta que el motor no programa». Ver `AUDITORIA_SISTEMA_19SEP.md`.

### 2.60 Resumen del centro: la pantalla simple (18-sep)
- Pestaña **Resumen** de todo centro de producción y sub-área, abre por defecto (`CEN.tab='resumen'`, `irCentro` sin
  pestaña). Cabecera con semana ISO, rango laborable y hoy; aviso de congelado (`congeladoDe`) con «Congelar el programa»
  (planificación) o «Pedir congelamiento» (supervisor: línea en bitácora `k:'pedirCongelar'`, bandeja `pedirCongelar` en
  Hoy → Pendientes, se cierra sola al congelar); botoncitos por recurso cuando el centro tiene 2+ (Confección: módulos +
  Maquila al final; `CEN.rec`); tres tarjetas (¿Cómo voy? = hechas de programadas con ▲ «debías llevar» = carga de los
  días pasados; Órdenes atrasadas = listas con fin programado ya pasado; Días sin registrar = días pasados con carga y sin
  registro); día por día planeado vs. hecho (tocar filtra, `togDiaCEN`); lista **Listas para <centro>** (puesto manual
  o grupo Disponible; orden puesto → atrasada → hoy → futuro → sin programar) y **En espera** (resto, en el orden de la
  cola, sin visto) con foto+WH+fase (`whCell`), producto, color, hechas de pedidas, debía salir, estado
  (`estadoListaCentro`) y el **visto verde** = `marcarHechoCentro`. `prm('filasResumenCentro',8)` filas y «Ver las N
  restantes». `datosDiaCentro` ganó `rec` opcional. Nada nuevo en el motor. Ver `RESUMEN_CENTRO_REPORTE.md`.

### 2.59 Borrar datos de prueba (17-sep)
- Un solo botón en Configuración → Borrado, solo `config`, palabra `BORRAR`. Guarda antes y relee el servidor; respaldo
  local + Storage `respaldos/` y verificación de que el del servidor se carga con Restaurar (si falla, no borra); marca «en
  curso» + bitácora INICIADO antes del primer delete; borrado de las diez tablas (órdenes al final) leyendo por páginas hasta
  vaciar y comprobando que el servidor borró (RLS silencioso), parándose en el primer fallo (INCOMPLETO, con «Restaurar el
  respaldo (deshacer)»); limpieza de lo que en params apunta a órdenes (auditoría —la del piso se copia—, bitácora, cierres
  de mes, metas y tejeduría se conservan; `fotosIdx` solo con la casilla); bitácora con quién, cuándo, conteos y rutas;
  pantalla «Base vacía · configuración conservada». Bucket `respaldos`: `SUPABASE_BUCKET_RESPALDOS.sql` (sin ejecutar).
  Ver `BORRADO_DATOS_PRUEBA.md`.

### 2.58 Cola por fase: la lista de fases del centro decide (17-sep)
- `S.params.fasesCentro[centro]={fases,sugerido,confirmado,origen,ts}`: lista de fases visibles por centro, editable en
  Configuración → Calendario y parámetros (subir/bajar/quitar/agregar/volver a la sugerida/confirmar; permiso `programa`).
  Sembrada «sugerido» desde la tabla 1 hacia atrás desde la etapa (tabla 4); Corte incluye 1Calidad Tintoreria; un centro
  sin etapa no recibe lista y sale en la bandeja `colaSinLista`. El umbral en pasos (`umbralCercania`) ya no existe.
- Grupos: Con puesto manual (siempre a la vista) · Disponible (por fase; «en proceso aquí» = fase del propio grupo, con
  etiqueta) · Por llegar (solo fases de la lista, en su orden) · Revisar ruta · Todo lo que viene (fuera de la lista; «llega
  ya» solo etiqueta) · Ya salió de aquí (CD del propio grupo o posterior con el paso sin cerrar; bandeja `colaYaSalio`).
- Ruta incompleta (único paso de producción, no el primero, fase antes) nunca es «lista para empezar»: Todo lo que viene +
  bandeja `colaRutaIncompleta`. Reales: Bordado 114, Estampado 17. Ver `COLA_POR_FASE_REPORTE.md`.
- Correcciones (17-sep tarde): sin «asignar a operario»; acciones en menú «⋯» (ruta editable solo con permiso `ruta`, «ver ruta»
  para el resto); cabecera en tres líneas con «?»; marcas cortas, rojo solo meta vencida y ámbar el resto (% por color a la vista);
  corte por fecha `diasPorLlegar` (15, editable, 0 = solo hoy): lo que llega a más de N días baja a Todo lo que viene marcado.
  Ver `COLA_POR_FASE_CORRECCIONES.md`.

### 2.57 Nivelación: pantalla propia, un área a la vez (17-sep) — solo Corte conectado
- «Nivelación de carga» abre su pantalla (`vNivelacion`, prefijo `nivUI*`); Configuración conserva grupos, fases y
  parámetros con enlace «Configurar». Meses multiselección, filtros cliente/familia, recuadros por área (centros
  configurados), detalle: tabla cliente × mes y cuadrito de 13 filas (4 se escriben). Motor del Paso 1 intacto.
- Órdenes de demostración: `esDemo`, `carteraAbiertaCarga()` para el freno; no existen en producción.
- La nivelación NO lista WH: «ver órdenes» abre Carga general → «Saldo por procesar en <área>» (misma función
  `saldoAreaNiv`), con «← volver a la nivelación»; al llegar así, el resto de Carga general queda colapsado.
- Tela y Maquila por fase (tabla 1, columna nivelación); Lavado y Plancha por días, sin cuadrito; todas las áreas conectadas.
- Ver `NIVELACION_PANTALLA_CORTE.md`, `NIVELACION_SALDO_TRES_CORRECCIONES.md`, `NIVELACION_DECISIONES_17SEP.md`.

### 2.56 Restaurar con respaldo automático y registro unificado de cargas (17-sep)
- Restaurar: solo administrador, palabra RESTAURAR, respaldo automático descargado Y subido a Storage (bucket privado
  `respaldos`, carpeta respaldos/; si la subida falla no se restaura) antes de reemplazar, bitácora unida,
  `S.params.restauraciones`.
- `registrarCarga()` única para tareas, OT y fotos → `S.cargas` (nunca se recorta), visible en Configuración → Órdenes y
  materiales → Registro de cargas. Ver `CARGAS_7_Y_8.md`.

### 2.55 Cargas: UN solo camino, «Actualizar datos» (17-sep)
- Una pantalla con tres pasos (tareas de Odoo → `planTarea`/`aplicarTarea`; órdenes de trabajo; fotos). Nada se escribe en
  S durante la vista previa; nada se guarda antes de confirmar. Vista previa: nuevas, actualizadas, cerradas, fuera de
  alcance, no vinieron, no calzan, clave incompleta, clave repetida, fechas ilegibles, errores.
- Archivo sin componentes: aviso y solo actualiza lo que viene. Pasos 2 y 3 avisan órdenes no encontradas.
- Retirados «Actualizar desde Odoo» (con su plan y su aplicar), «Recarga Parte 2» y los diálogos sueltos de OT y fotos.
- Freno por archivo incompleto (umbral % de la cartera abierta en Configuración, 10): aviso rojo, desglose por cliente y
  mes, y confirmación escrita APLICAR. Pasos 2 y 3: «Conviene cargar primero las tareas» si no se cargaron en la sesión o
  hace más de 1 día.
- Clave repetida en el archivo con clave ya existente: no se aplica, se marca «clave repetida — revisar» (Hoy).
- Reconocidas exactas sobre el volcado: 1.206 = 1.211 − 5 de demostración. Ver `CARGAS_CAMINO_UNICO.md`.

### 2.54 Cargas: clave única, migración y regla de alcance (17-sep)
- `claveOrden()` única para tareas, Odoo, OT y fotos (con WH: la WH; sin WH: cliente+proyecto+stilo+color+ODC). Clave
  incompleta = no se reconoce ni se crea, se reporta. Repetida en el archivo = entran aparte y se reportan las dos.
- El id de una orden existente no cambia: `planTarea` lo resuelve por clave contra el sistema. Sin WH → WH una sola vez
  con `claveAnterior`. Migración en Configuración → Órdenes → «Clave única de orden» (vista previa + guardar).
- `alcanceOrden()` única, parámetros `alcanceDiasAtras` y `alcanceSinFechaConProyecto` en Configuración → Órdenes →
  «Alcance de las cargas». Fuera de alcance = marcada (`fueraAlcance`), nunca borrada. Sin `hoy+21`; `fechaDe` con
  `excelFecha` y fechas ilegibles reportadas. Odoo sobre el mismo archivo: 1.206 reconocidas, 0 nuevas (antes 710 / 3.508).
  Ver `CARGAS_CLAVE_UNICA.md`.

### 2.53 Tablet del operario: ajustes aprobados (17-sep)
- Fallo de `programar()`: además del aviso en la tablet, UNA alerta por falla en bitácora (`k:'errProg'`, hora, error,
  centro) y en Hoy → Pendientes para admin y planificación, con «atendida» (`S.params.errProgAtendidos`).
- `minMinutosCierre(c)`: general en `S.params.minMinutosCierre` y por centro en `S.params.minMinutosCierreCentro[c]`
  (vacío = general); `puedeCerrarPaso` dice de dónde salió el mínimo (`fuente`).
- Tablas 15 y 18 avisan cuando están vacías y qué deja de funcionar.
- Sin tiempo corrido la tablet NO muestra «Hecho» ni «Terminar orden»: muestra cuánto lleva y el mínimo (`hintCierreHTML`).
- `S.cargas` ya no se recorta (antes 60). Ver `TABLET_OPERARIO_REPORTE.md`.

### 2.52 Cargas: diagnóstico de claves y duplicados (17-sep) — SOLO REPORTE
- Cuatro cargadores, tres normalizaciones de la WH: `normTxt` (Parte 2, Fotos), texto crudo (Odoo), `normFase` (OT).
- La orden **sin WH** tiene dos claves: Parte 2 `SIN WH #<hash de cliente|ODC|stilo|catHija|color|fecha|pedido|proyecto>`
  (única pero inestable: cambia si cambian cantidad o fecha) y Odoo `prev_<cliente|proyecto|stilo|color>` (estable pero
  7 pares chocan). Propuesta: `claveOrden` única — con WH `normFase(op)`; sin WH cliente+proyecto+stilo+color+ODC.
- «Actualizar desde Odoo» sobre el mismo archivo: 710 reconocidas; 3.019 nuevas por ALCANCE (fuera de la regla de
  Parte 2) y 489 por RECONOCIMIENTO (las 496 sin WH). Regla única → 0 por alcance; clave única → 0 por reconocimiento.
- `SUPABASE_DUPLICADOS_ORDENES.sql` (solo SELECT, sin ejecutar). `S.cargas` se recorta a 60: lo quita el punto 8.
  Ver `CARGAS_DIAGNOSTICO_CLAVES.md`.

### 2.51 Cargas: protección inmediata (17-sep)
- `aplicarTarea` ya no vacía `S.avance` (guardia en el harness). Tabla 14: `avance`, `lib`, `fases` (historial) y
  `progCentro` bloqueados «siempre» (`CAMPOS_BLOQUEADOS`); la fase actual sigue editable en la tabla.
- `planOdoo(rows,nombre)` es función pura; `aplicarOdoo` respeta la tabla 14 y manda lo que no calza a la misma
  bandeja `noCalzan` con `tipo` (fase, fecha, tela, ruta).
- «Actualizar desde Odoo» DESHABILITADO (`ODOO_DESHABILITADO`): botón inactivo «Temporalmente deshabilitado — use
  Recarga Parte 2»; solo admin lo fuerza escribiendo FORZAR, con aviso de duplicados y bitácora. Se quita con el
  camino único (punto 6). Ver `CARGAS_1_A_3.md`.

### 2.50 Tablet del operario: solo lo programado y cierre con tiempo (17-sep)
- **`programadoPara(o,c,rec,P)`** es la ÚNICA definición de «programado para mí»: exige carga del motor en
  `P.pro` para ese centro y recurso, entre hoy y `finVentanaTablet()` (**`prm('diasVentanaTablet',5)`** días
  hábiles). La usan `tabletFilas`, `ordenesQueVe` y el buscador. **Se quitó la entrada por `recursoFijo` o por
  secuencia sin programa.**
- **Sin fallback**: si `programar()` falla, el operario ve **cero** órdenes y sale «Error en la programación —
  avise al supervisor» (`ERR_PROG`, `errProgHTML`). Nunca se muestra todo.
- **Fuera del plan**: una orden que ese puesto empezó sigue visible mientras el tramo esté abierto, marcada y
  **sin INICIO**; al terminarlo desaparece. El supervisor la ve como «en proceso fuera del plan»
  (`enProcesoFueraDelPlan`).
- **Pasos sin minutos** (`pasoSinTiempo`): el motor no los programa y el operario no los ve, salvo que el
  supervisor les fije recurso y fecha (`fijadaPara`; desde el 17-sep en la propia fila de la cola, columnas Recurso y
  Arranca con «toda la cola» activado — el botón «asignar a operario» se retiró). Entonces salen
  marcados **«sin tiempo estándar»** y el tramo registra tiempo real igual.
- Cola vacía: **«Sin programación cargada — avise al supervisor»**. Buscador fuera del plan: **«No está
  programada — consulte al supervisor»**, sin INICIO.
- **CIERRE CON TIEMPO**: `tiempoEfectivoCentro` suma `calcTramo().trabajado` de **todos** los tramos de esa
  orden en ese centro (varios operarios y días). **`puedeCerrarPaso(oid,c)`** bloquea sin tramo o por debajo de
  **`prm('minMinutosCierre',5)`**; por encima permite y marca **`tiempoBajo`** si queda por debajo de
  `unidades × SAM × (1 − tolMinPrenda)`. **Sin SAM no marca** (dato faltante, no falso positivo).
- **UNA sola puerta**: `cerrarCentro`, `confirmarHechoCentro` y `terminarOrdenCentro` pasan por
  `puedeCerrarPaso`. El supervisor puede cerrar sin tiempo con **motivo obligatorio** (tabla 15, uso nuevo
  **`cierreSinTiempo`**): `cierres[c].sinTiempo`, bitácora y auditoría. Los cierres guardan `minutos`,
  `tiempoBajo` y `sinEstandar`.
- **Encaje con la revisión 3 del motor**: `programadoPara` mira `P.pro`, y un paso sin duración no genera
  `P.pro` ni ahora ni con el paso conservado en error. El camino del operario no cambia.
- Ver `TABLET_OPERARIO_REPORTE.md` y `TABLET_OPERARIO_PASO0.md`.

### 2.49 Búsquedas y filtros: correcciones (16-sep)
- **Un temporizador POR buscador** (`_qTimers[id]`) y espera **`prm('msBuscar',150)`** editable; ya no depende de
  tener más de 300 órdenes. `estadosPantalla()` es el único mapa de estados (17 buscadores); `refEstado` y `navRefs`
  lo usan. `normTxt(0)` es `"0"`.
- **Filtro de fases, una semántica**: `estadoFases(sel)` → todas | ninguna | seleccion; `faseOkFiltro(sel,fase)`
  decide; `podarFases` conserva el centinela `FASE_NINGUNA`. Las cinco pantallas pasan por ahí; se quitó la poda
  de Órdenes que dejaba «Limpiar» en «todas». El botón dice «Limpiar (ninguna)».
- **Base acotada**: `fueraDeBase(id,dentro)` + `avisoFueraDeBaseHTML(id,dentro,filtroTxt)` en Liberación, Centro,
  Órdenes, Carga general, Resumen gerencial, Plan→agregar, Entregas y Producto en proceso: «N órdenes coinciden
  fuera de <filtro>» + Ver (marcadas, sin cambiar filtros). Cada pantalla pasa SU lista ya filtrada.
- **Redibujo parcial**: `listaRegistrar(id,fn)` + `<div data-lista="<id>">` + `redibujarLista(id)`; `buscarQ` lo
  intenta y solo si no puede cae a `render()`. Hecho en **Órdenes** (`listaOrdHTML`), **cola del centro**
  (`colaCentroHTML(c,ctx)`, extraída sin cambio: 17 fotos del DOM lo vigilan) y **Liberación** (`listaLibB1HTML`,
  ídem). Medido con 1.210 órdenes: cola 57–70 → 11–24 ms por tecla; Liberación 327–365 → 11–21 ms. **Regla: antes
  de extraer una lista, fijar su DOM con pruebas; si se pierde algo, revertir.** El operario de tablet busca al
  escribir y conserva el botón Buscar. Quedan 14 pantallas (commit 5, pendiente de aprobación).
- **Menú**: «Nivelación de carga» es la primera entrada de Planificación de producción; por ahora abre
  Configuración → Nivelación de carga (`data-conf`), porque la pantalla propia es el Paso 2 sin aprobar.
- **Tablet del operario**: solo Paso 0 (`TABLET_OPERARIO_PASO0.md`): la lista no exige programa por recurso, el
  buscador muestra órdenes fuera del plan, no hay ventana parametrizada y **`cerrarCentro` no valida tramo ni
  tiempo**. No hay rpc de cierre. Ver `BUSQUEDAS_CORRECCIONES.md` y `BUSQUEDAS_CORRECCIONES_2.md`.

### 2.48 La cola del centro se ordena por CERCANÍA a llegar (16-sep)
- **`cercaniaCentro(o,c,P)`** es la única función y no crea ninguna definición nueva: se apoya en
  **`secuenciaCentro`** (clasifica y **manda** si hay desacuerdo), **`centroAnteriorPro`** (el paso anterior) y
  **`pasoHecho`** (si terminó). El desacuerdo se anota en `desacuerdo` y sale como etiqueta «ojo» con su motivo:
  los dos casos reales son el **tramo no secuencial** (estampado/bordado/confección, donde mandan las OT) y el
  **primer centro de producción**.
- Cuatro grupos (`CERCANIA_GRUPOS`): **Disponible** · **Por llegar** · **Revisar ruta** (`sinSecuencia`,
  colapsado) · **Lejanas** (colapsado, con `filasGRP`). El umbral en pasos pendientes se **retiró el 17-sep**: decide
  la lista de fases de cada centro (2.58).
- **Etiqueta de llegada** (`txtLlegada`/`llegadaHTML`, columna «Llega», en negrita): **hoy** · **mañana** ·
  **en X días hábiles** · **sin programar** · **atrasado X días** · **llegaron X de Y** (`cantCentro`) ·
  **sin dato de llegada**. Sale del **fin programado del paso anterior** (`P.ordenes[oid].pasos[].fin`) y se
  cuenta con **`labR` del recurso de ese paso** (`habilesHasta`/`habilesDesde`).
- **CONVENCIÓN: hoy NO cuenta; el siguiente día hábil es 1 («mañana»)** — es un **plazo**, como `dsumLab`, y
  **distinta a propósito** de la convención inclusiva de la nivelación (`diasHabilesInc`/`finLabInc`). No
  mezclarlas. Cada etiqueta lleva tooltip con la fecha, el recurso y la convención.
- **Primer centro de producción** (`llegadaTela`): `centroAnteriorPro` da null, así que la llegada sale de la
  tela, en este orden: **`ro.bloqueo` manda** (si el motor no la puede programar, NO se dice «lista») →
  `avance.lista`/`faseEstado().lista` → `ro.telaLista` → **«sin dato de llegada»**. **Sin dato NUNCA es
  «disponible»**, y hay una prueba sobre las órdenes reales que lo verifica.
- **`colaCentro` ordena**: puesto manual → grupo de cercanía → fecha de llegada → entrega. La cercanía se
  calcula una vez por fila en `filasDeCentros` (que sí tiene `P`) y viaja en `f.cerc`.
- **`moverEnCola` ya NO renumera la cola entera**: numera la movida, las que ya tenían puesto y —**solo si se
  la baja**— las que quedan por encima, porque una orden CON puesto siempre va delante de una SIN puesto y el
  destino no se puede expresar de otra forma. Lo de abajo sigue por cercanía; la bitácora lo dice.
- **`ordenarColaPorColor` entra en conflicto a propósito**: numera TODAS y el puesto manual manda, así que
  después de usarlo la cola deja de ordenarse por cercanía. No se bloquea; **avisa en el diálogo y en bitácora**.
- **ODC en columna propia**; **`whCell` NO se tocó** (hay una prueba que falla si alguien le mete la ODC).
- **Hora de las OT**: al cargar se guardan **`o.ot[c].iniTs`/`finTs`** (`excelFechaHora`, `traeHora`).
  **`excelFecha` no se tocó** y `ini`/`fin` siguen en `YYYY-MM-DD`. **HALLAZGO sin corregir:** `excelFecha` usa
  `Math.round`, así que **toda hora ≥ 12:00 se guarda como el día siguiente** — **24.727 de 45.421 fechas de OT
  del volcado (54,4 %) están corridas un día**. El arreglo es `Math.floor`; pendiente de autorización.
- **Punto flaco medido**: el grupo se decide en **pasos** y la etiqueta en **días**, y no siempre coinciden. En
  el volcado, **4 de 48 lejanas de botones y 14 de 160 de empaque llegan hoy o mañana** y quedan en el grupo
  colapsado. Propuesta pendiente: que llegar hoy/mañana (o estar atrasada) saque a una orden de Lejanas.
- Ver `COLA_CERCANIA_REPORTE.md`, `COLA_CERCANIA_PASO0.md`, `COLA_POR_FASE_PASO0.md` y `COLA_POR_FASE_REPORTE.md` (17-sep: la lista de fases reemplaza al umbral).

### 2.47 Nivelación — correcciones del Paso 1 (16-sep)
- **UNA convención de días hábiles** (`CONV_HABILES`): **el inicio cuenta como día 1 y el compromiso es el
  último día disponible, los dos inclusive**. `finLabInc(ini,n)` y `diasHabilesInc(a,b)` la implementan y
  concuerdan entre sí (contar hasta el día N devuelve N). Reemplazó a `diasHabilesEntre`, que era exclusiva.
  **`dsumLab` NO se tocó y NO sigue esta convención**: es un **plazo** («n días hábiles DESPUÉS de»), el lead
  time del proveedor dentro del motor. No mezclar las dos semánticas.
- `noHabilesEntre(a,b)` (qué días se descontaron y por qué), `mesesSinFestivos(a,b)` y `txtHabiles(a,b)` dan el
  **tooltip** de Días necesarios / Fecha final / Días disponibles. **La tabla de excepciones está VACÍA**: hoy
  solo se descuentan fines de semana y se avisa «sin festivos cargados para <mes>» (decisión 7).
- **Toda cifra dice su alcance**: el cuadrito trae `saldo` (el horizonte) y `saldoTot` (todos los meses) y
  rotula «en este horizonte (<meses>)» / «en todo el saldo». `horTxt()` escribe el horizonte.
- **El compromiso no tiene valor por defecto**: sin fecha cargada el cuadrito dice *dato faltante* y deja
  días disponibles, alcanzable, rezago y «cabe» en **`null`**.
- La lista del rezago arranca agrupada por **tipo de producto y fase** (`filasGRP` + `whCell`).
- **Configuración → Nivelación de carga** (pestaña nueva, solo tablas y validaciones): grupos de módulos
  (`gruposModHTML`) y parámetros de tela (`nivParamsHTML`) + el panel de días hábiles (`calendarioNivHTML`).
  Cada grupo **nace «sugerido»** y sigue así hasta `confirmarGrupoMod` (guarda **responsable y fecha**);
  **cambiar un grupo confirmado lo devuelve a sugerido**. `validarGruposMod()`: más del 100% por módulo y una
  familia en dos grupos son **error**; una familia sin grupo es **aviso**. `famsCatalogo()` saca las familias
  del catálogo real, nunca de una lista en código.
- **La clave pública de Supabase no lee nada sin sesión** (RLS): `perfiles`, `params`, `ordenes` y `centros`
  devuelven 0 filas con la anon key. Para listar qué personas tienen `programa` hay que consultarlo desde una
  sesión real; la consulta SQL de solo lectura está en el reporte.
- Ver `NIVELACION_PASO1_CORRECCIONES.md`.

### 2.46 Nivelación de carga — PASO 1: el motor y el cuadrito (16-sep)
- **Del Excel de nivelación se tomó SOLO el esquema de trabajo, no sus datos.** El Excel no es fuente de ningún
  número; todo sale del volcado de Odoo.
- **`nivelar(e)`** es el único cálculo: saldo → − maquila → neto → capacidad diaria → días necesarios → inicio →
  fin (`dsumLab`) → compromiso → días disponibles (`diasHabilesEntre`) → alcanzable → **rezago** → meta diaria →
  holgura. Todo en **minutos**, con unidades al lado vía **SAM ponderado** (`samPonderado`, `aUnid`). Lo que falta
  vuelve **`null`** y se pinta como *dato faltante*; **cero es cero** (capacidad 0 → alcanzable 0 y el rezago es todo
  el saldo, no se reemplaza por nada).
- **Comparte lo que ya existía, no hay segunda versión de nada**: `capDia` (turnos y ajustes de semana),
  `labR`/`dsumLab` (calendario y festivos), `minPrenda` vía **`samOrdenCentro(o,c)`** (devuelve **`null`, nunca 0**)
  y la tabla 1 de fases. **El motor de programación no se tocó.**
- **`PROC_NIVEL`** = tela (por fase) · corte · confección · empaque (los tres de planta, **por RUTA**). La tabla 1
  tiene columna **nivelación** (`setNivelFase`, `procNivelDeFase`, `fasesDeProcNivel`): **solo Tela se define por
  fase**, por eso `1Calidad Tintoreria` no cuenta en tela.
- **`saldoProceso(proc,horizonte)`** = abiertas (`abiertaDe`) con ese proceso **en su ruta** y sin `pasoHecho`,
  **estén en la fase que estén**: es el **«Saldo por procesar (incluye órdenes en fases anteriores)»**, distinto de
  la carga actual del centro, y la pantalla lo dice. Horizonte por **mes de entrega** (`mesEntregaNiv`,
  `mesesNivDisp`, `horizonteNiv`); sin elegir nada arranca en el **mes en curso**.
- **Grupos de módulos** (`gruposMod`, tabla que **nace vacía**): `addGrupoMod`/`setGrupoMod`/`setPctModGrupo`/
  `delGrupoMod`; `pctModTotal` + **`erroresGruposMod`** (un módulo repartido a más del 100% es **error visible**, no
  se corrige solo); `sugerirGruposMod`/`aplicarSugerenciaGrupos` proponen desde la polivalencia ya cargada;
  `capGrupoDia` = `capDia` por el %; `saldoGrupo` acota el saldo de confección a las familias del grupo.
- **Maquila**: una orden con `recursoFijo.modulos==="maquila"` **sale del saldo propio** y se muestra como línea
  «− marcado a maquila». Lo *sugerido* no resta.
- **Tela**: `nivParam`/`setNivParam` y **`capTelaReal()`** = promedio de unidades que entraron a corte en los
  últimos N días hábiles (N configurable, 10 por defecto) **junto al valor planificado**; sin la mitad de los días
  con registro dice «sin avance suficiente» en vez de inventar un promedio. **No convierte horas ni kilos.**
- **Fechas** (`nivFecha`/`setNivFecha`): el **inicio no puede ser anterior a hoy** (se rechaza con aviso); cada
  cambio va a la bitácora. Editar cualquier cosa de la nivelación exige el permiso **`programa`**, que hoy solo
  tienen **admin** y **planificacion**.
- **`cuadritoNivHTML(cfg)`** es el componente reutilizable (los once pasos en orden, cada número con su nota de
  origen, lista de rezago con `filasGRP`+`whCell`); `cuadritoProceso(procId)` y `cuadritoGrupo(g)` lo alimentan.
- **Sin SAM**: la orden **no suma como cero ni se descarta**, queda fuera del cálculo y **a la vista** con sus
  unidades. Sobre el volcado real: 22 órdenes distintas (corte 12, confección 14, empaque 22), todas de las
  categorías sin hoja LMO.
- **Paso 1 no tiene pantalla todavía** (a propósito): el simulador y el plan mensual **no se movieron**. La
  pestaña, la tabla de grupos y los parámetros de tela son el Paso 2, pendiente de aprobación.
- Ver `NIVELACION_PASO1_MOTOR.md` y `NIVELACION_PASO0_ESCANEO.md`.

### 2.45 Contar cartera: hay que DECIR la base (16-sep) — CORRIGE cifras de 2.44
- **El error no fue la definición, fue la base.** El cálculo de los tiempos estimados usaba `abiertaDe()`, pero se
  reportó en base **abiertas** (79 órdenes / 16.232 pz / 197.573 min) al lado de un listado hecho en base
  **lanzadas**. Lo comparable es **50 órdenes / 8.232 pz / 89.253 min** (el listado decía 51 / 8.241 / ≈89.400).
  La diferencia son **29 órdenes en diseño, sin WH**, que no se pueden programar.
- **`BASES_CARTERA`** declara las cuatro con su explicación y **`carteraDe(base,filtro)`/`cuentaCartera()`** son el
  único camino para contar cartera; una base inexistente **lanza error**. **`cifraCarteraHTML`** pinta el número
  siempre con su base al lado.
- **`cargaTiemposEst(base)`/`cargaTiemposEstHTML()`** (Configuración → Operaciones): la carga de los tiempos
  estimados por categoría, con **selector de base**, el total rotulado y **las otras tres bases al pie**.
- **Guardia de cartera** (prueba): falla si alguna pantalla filtra por el estado interno a mano, si hay más de una
  definición de orden abierta, si `abierta()` deja de delegar en `abiertaDe()`, si las bases dejan de ser
  subconjuntos encajados o si una base inexistente deja de dar error. Un conteo que no sea de cartera (contar lo que
  trae un archivo) se marca en su línea con el motivo.
- Ver `TIEMPOS_CORRECCION_BASE.md`.

### 2.44 Tiempos estimados de confección (Santiago Garzón, 16-sep)
- `TIEMPOS_SG` trae las 14 categorías de la hoja «Para llenar» con su minuto, su referencia y su observación.
  `sembrarTiemposSG()` las carga en `k.minEstConf` + `k.minEstConfMeta` {fuente, obs, ref, pendiente}.
  **Solo confección**, y solo si la categoría **no tiene hoja LMO**; no pisa valores puestos a mano; idempotente.
  **Camiseta Tejida (4,57)** queda «pendiente de confirmar» con su motivo. 11 de 14 calzan con el volcado; las 3
  restantes (Hoodie Tejido, JUMPER, Chalecos) no tienen órdenes.
- **Efecto**: hoy **0 minutos y 0 órdenes cambian**, porque de las 79 órdenes solo **26 están liberadas** y el
  programa solo contiene lo liberado. Carga que aparecerá: **34.304 min (572 h) de lo ya liberado** y **197.573 min
  (3.293 h) del total**. El plan de confección estaba subestimado en esas ~3.300 h.
- **Tiempos actuales: NO se cambió nada** (la columna «¿Correcto?» vino vacía). `alertasTiempos()` **calcula solas**
  las incoherencias — Short Cargo > Pantalon Cargo, y categorías con confección sin empaque — y se apagan cuando
  alguien corrija el tiempo. Panel en Configuración → Operaciones.
- **HENLEY / «Nueva hija» es real y NO se borra** (producción lo confirmó); pendiente de nombre.
- Ver `TIEMPOS_SANTIAGO_REPORTE.md`.

### 2.43 Kg reales con la regla apagada y chequeo de siembras (16-sep)
- **Dos cosas separadas**: `tejCuentaComoLista(p)` decide **qué filas entran** (eso sí depende del interruptor) y
  `kgDeFilaTej(p)` decide **cuántos kilos aporta cada fila** (eso **no**: una fila `tejido` da siempre sus `kgReal`).
  Consecuencia: **marcar una fila con kilos distintos a los programados puede mover la fecha de tela lista aunque la
  regla esté apagada.**
- **`efectoKgReales()`** mide ese efecto corriendo el motor con `TEJ_KG_MODO='prog'` y `'real'` y comparando
  `telaLista`; devuelve filas con diferencia, kg de diferencia y las órdenes que **ya** cambiaron. No deja el modo
  cambiado. El panel «Tejido sin confirmar» lo muestra **arriba, marcado «ya aplicado»**, y rotula el bloque de la
  regla como **«efecto distinto del de arriba»**.
- **`chequeoSiembras()`/`chequeoSiembrasHTML()`** en Reportería por área: JEANS→DENIM, rutas a Empaque y ruta por
  defecto, con **esperado vs encontrado**. Lo esperado sale de lo que cada siembra guardó **antes** de tocar nada
  (`jeansUnificadoPrevio`, `rutasEmpaqueCorregidas`, `rutaDefectoAplicada`), no de un número escrito a mano; lo
  encontrado se verifica contra los datos de ahora. Tres estados: **aplicada / pendiente / revisar**.
- Ver `KG_REALES_Y_CHEQUEO.md`.

### 2.42 Ruta por defecto, firma con técnica y tejeduría programado/tejido (16-sep)
- **`sembrarRutaDefecto22()`**: la ruta por defecto de las 22 (aprobada) corre con las demás siembras.
- **La firma de ruta incluye ahora `ordenCentrosAuto(o)`** (técnica → estampado, puntadas → bordado): agregar o quitar
  la técnica de una orden rehace su ruta no editada a mano. **`rutaProSugerida(o,rehacer)`**: con `rehacer=true` los
  centros que dependen de la ORDEN se rehacen desde la técnica/puntadas de ahora — así se pueden **quitar**; sin él
  (completar rutas) no se pierde ningún paso.
- **Auditoría solo cuando la ruta cambia**: si la firma quedó vieja pero la ruta resultante es la misma, se vuelve a
  sellar en silencio; una editada a mano que no cambiaría **no se marca**. Tres pruebas lo fijan.
- **Tejeduría: columna Estado** (`estadoTej`, `TEJ_ESTADOS`). **Programado** no acepta fecha pasada (al crear y al
  editar); **Tejido** sí, con `kgReal`, `confU` y `confTs`. `marcarTejido`/`desmarcarTejido` exigen `puedeTejer()`
  (tejeduría o planificación); deshacer pide motivo. **El motor usa los kg REALES** de lo tejido.
- **`tejCuentaComoLista(p)`** es lo que decide si una fila es tela lista. La regla «lo programado con día pasado sin
  confirmar NO es tela lista» vive detrás de **`S.params.tejEstricto`** (interruptor, solo planificación),
  **apagado por defecto**: mientras lo esté, el motor se comporta como siempre. `previaTejEstricto()` corre el motor
  con y sin la regla y dice cuántas filas sin confirmar hay, cuántos kg y **qué órdenes cambiarían su fecha de tela
  lista**; no deja la regla encendida. Panel `tejEstrictoPanelHTML` en Tejeduría.
- Ver `TEJEDURIA_Y_RUTAS_REPORTE.md`.

### 2.41 «0 hechas» vs «sin registros» y qué es «Vienen después» (16-sep)
- **`hayRegistroEn(c,d)`**: hubo registro si hay avance por talla o por total, un **tramo cerrado**, la **producción de
  un turno** o un **paro registrado**. Un turno sin producción **no** cuenta. `diasConTurno`/`registroSemana` solo miran
  los días **laborables** del centro: a un centro sin turno no se le reclama registro.
- **Tarjetas de día**: «sin registros» en vez de 0, y los pendientes en «—» (sin registros no se sabe cuánto falta).
- **Avance de la semana**: «**sin registros esta semana**» en vez de 0 % de cumplimiento; si hay registros pero faltan
  días, el % va con la advertencia de cuántos días laborables quedaron sin registrar.
- **`brechaRegistroHTML()`** en Reportería por área: matriz **centro × día** con ✓ / — / ·, los centros que no
  registraron nada y el total de días laborables sin registrar.
- **«Vienen después» se MANTIENE**: no repite la lista de arriba. Son conjuntos **disjuntos por construcción**
  (`enSem` = `pzSem>0`; `luego` = `pzSem===0 && paso.ini>dom`), y hay prueba que lo fija. Se diferencia del
  **«Lo que viene» eliminado** en que aquel mostraba órdenes **en un paso anterior de su ruta**, sin fecha en este
  centro, y eso sí repetía lo que ya dice la lista principal. El rótulo se reescribió para que la diferencia se lea.
- Ver `SIN_REGISTROS_REPORTE.md`.

### 2.40 Rutas: corrección aplicada y recálculo automático (16-sep)
- **`sembrarRutasEmpaque()`** — la corrección de las rutas sin Empaque, autorizada, corre **una sola vez** con las
  demás siembras y recalcula la foto del mes en curso. **Real: 348 → 22** rutas sin Empaque (122.788 → 3.125
  prendas); **326 corregidas**, 447 de 469 terminan ahora en Empaque. La foto del mes bajó de 348 a 22 en su marca
  de brecha y quedó `recalculada`; **los meses cerrados no se tocaron**.
- **Ruta por defecto** para las que ni su categoría tiene Empaque (`RUTA_DEFECTO_PRO` = corte → modulos → empaque,
  más lo que la orden pide): `rutaDefectoDe`/`previaRutaDefecto`/`aplicarRutaDefecto`/`rutaDefectoPanelHTML`. Quedan
  **«estimada – sin revisar»** y usan `minEstimadoConf`. **Sin minuto cargado la ruta se crea igual y la carga queda
  en 0 con aviso: es brecha de TIEMPOS, no de ruta.** Son **22**, todas sin minuto. **Con vista previa, SIN aplicar.**
- **Recálculo automático**: `firmaRutaDe(o)` = categoría + `familiaLMO` + centros que aporta la categoría.
  `rutaDesactualizada`/`recalcularRutas(motivo)` rehacen las rutas **no editadas a mano** y marcan las editadas con
  `o.rutaRevisar` (panel `rutasRevisarPanelHTML`, botón `marcarRutaRevisada2`). Corre en `render()` cuando hay
  pendientes; `sembrarFirmasRuta()` sella las órdenes existentes. Todo a auditoría.
  **Estampado y bordado NO entran en la firma a propósito**: dependen de la técnica/puntadas de la ORDEN.
- **`brechaHechas()` devuelve null** cuando no queda ninguna ruta sin Empaque: la etiqueta «con brecha» de Hechas
  desaparece sola. Fijado en prueba.
- **Tejeduría manual**: propuesta de diseño (columna **Estado** = programado | tejido, kg reales, quién y cuándo;
  el motor trataría «tejido» como hecho y dejaría de contar como tela lista lo **programado con día pasado sin
  confirmar**, que hoy sí cuenta). **NO construido**, esperando confirmación.
- Ver `RUTAS_CORRECCION_REPORTE.md`.

### 2.39 Pantallas de centro (16-sep)
- **«Lo que viene» eliminado** de todos los centros y sub-centros, junto con `loQueVieneDe`/`loQueVieneHTML` (no se
  deja código muerto). La lista sigue diciendo dónde está cada orden con `dondeEstaEnCentro`.
- **Agrupador común en las TRES pestañas** de todo centro y sub-centro: `cenplan` (Órdenes de la semana), `cenluego`
  (Vienen después), `cen` (la cola, ya lo tenía) y `cenejec` (Desviaciones por orden). Cliente, ODC, Familia, Fase y
  Tela. Prueba que recorre las 18 combinaciones (6 ítems × 3 pestañas) y falla nombrando la pantalla.
- **Tarjetas de día** (`datosDiaCentro`/`tarjetasDiaCENHTML`): **Carga** (prendas programadas + min programados /
  disponibles + %), **Avance** (hechas registradas ese día) y **Pendientes**. Al tocarlas, `CEN.dia` filtra la lista a
  las órdenes de ese día con prendas pendientes (`filaEnDiaCEN`), con aviso del filtro activo; tocar de nuevo lo quita.
- **Una sola marca** (`marcaCentroUna` + `MARCAS_CEN`): la más grave (meta vencida > la orden va tarde > este paso va
  tarde), las demás en el tooltip con contador. **El cálculo sigue siendo `diagAtraso()`**: solo cambia la
  presentación. `marcaCentro` (la vieja, con todas las etiquetas) sigue existiendo para otras pantallas.
- **Avance de la semana** arriba de Planificación (`avanceSemanaCentro`/`avanceSemanaHTML`): programadas, hechas,
  pendientes, % de cumplimiento, órdenes atrasadas y % contra el programa congelado (o **«sin congelar»**, sin inventar
  un número). Los ítems con sub-áreas lo muestran **por sub-centro** más el total.
- **`abrirCentroDelPerfil()`**: cada perfil de centro abre directo en el suyo (`CEN.auto`, una sola vez por sesión para
  no pisar la navegación del usuario); un perfil con `centros:['*']` no queda atado a ninguno.
- Ver `CENTROS_AJUSTES_REPORTE.md`.

### 2.38 Rutas que no terminan en Empaque (16-sep) — diagnosticado, SIN aplicar
- **No estaban mal ordenadas: estaban incompletas.** De 348 rutas malas, **0 contienen Empaque en otra posición**,
  0 están desordenadas, 0 editadas a mano y **0 tienen OT cargadas**. 338 tienen **un solo paso** de producción
  (`tej → tin → bordado`) y 10 tienen dos.
- **Causa**: `armarRuta()` toma los centros de la **hoja LMO de la categoría**, les quita los que dependen de la orden
  y suma los que la orden pide por técnica/puntadas. Cuando esas órdenes se crearon la categoría **no resolvía su
  hoja** (la brecha del catálogo), así que solo quedó lo de la orden: bordado o estampado. El orden nunca fue el
  problema — `RUTA_ORDEN` ya pone empaque último.
- **Regla fija**: `rutaProSugerida(o)` (hoja de la categoría + lo que pide la orden + lo que ya tenía) y
  `ordenarRutaPro(cens)`, que deja **Empaque siempre último venga de donde venga el orden** — blinda el caso del
  cierre tardío de OT. Estampado y bordado conservan su lugar entre corte y confección.
- `diagRutasSinEmpaque()` separa: **le falta Empaque** / **lo tiene mal puesto** / **editada a mano (no se toca)** /
  **su categoría tampoco lo tiene**. `previaCompletarRutas()` + `rutasEmpaquePanelHTML()` muestran el antes y el
  después; **`completarRutasSinEmpaque()` NO corre sola**: confirmación, `puedeEditarRuta()` y auditoría por cambio.
- **Real: 326 de 348 se corregirían** y terminarían en Empaque; **22 no**, porque su categoría tampoco lo tiene.
- **La brecha está marcada mientras tanto**: `brechaHechas()`/`avisoHechasHTML()` en el Resumen gerencial, y
  `fotoCarteraMes` guarda `brechaRutas` para que la foto diga que se tomó con la brecha.
  `recalcularCierreMesEnCurso()` la vuelve a tomar al corregir; **los meses cerrados no se tocan nunca**.
- **Tejeduria manual es de PROGRAMACIÓN**, no de registro: el motor consume `progTej()` para saber cuándo estará
  lista la tela (`ro.telaDesde`). Una fila con fecha pasada significa «ya se tejíó», así que **NO se le aplicó el tope
  de «no antes de hoy»**: la bloquearía el registro de lo ya hecho. Para aplicarlo habría que distinguir primero
  «programado» de «ya tejido» (pendiente de decisión).
- Ver `RUTAS_EMPAQUE_DIAGNOSTICO.md`.

### 2.37 Definición única de orden abierta + DENIM + minuto estimado (16-sep)
- **`abiertaDe(o)` es LA definición**, y `abierta()` delega en ella: no archivada (`ESTADOS_CERRADOS`) · **Estado OP de
  Odoo no cerrado** (`estadosOPCerrados()`, por defecto `done`/`cancel`, en `S.params.estadoOPCerrado`) · y **fase no de
  cierre** (columna «sistema» de la tabla de fases). Antes `abierta()` miraba solo el estado interno y `esFacturada()`
  miraba la tabla de fases: dos nociones conviviendo, y ninguna miraba el Estado OP.
- **`lanzada(o)`** = abierta **con WH**. Es la cifra del listado del 13-sep. Las cuatro cifras reales:
  **1.206 cargadas = 1.078 abiertas + 51 archivadas + 77 con Estado OP cerrado**; de las abiertas, **582 lanzadas**
  (496 sin WH, en diseño) y **279 en planta**. `conteoOrdenesHTML()` lo explica en Reportería y hay prueba que fija la
  descomposición sin contar ninguna orden dos veces.
- **Etiqueta** en las tres bases: cargadas 452 / 219.283 · **abiertas 395 / 201.293** · **lanzadas 185 / 78.412**
  (esta última coincide con el listado del 13-sep).
- **JEANS → DENIM autorizado**: `sembrarUnificacionJeans()` entra a `sembrarDecisiones16()` y corre **una sola vez, sin
  preguntar**; guarda `S.params.jeansUnificadoPrevio` con lo que había antes. Mueve 3 categorías, 13 órdenes abiertas
  (31 en todo el volcado), 49 operaciones y 3 filas de configuración. **No borra nada** y es idempotente.
- **Minuto estimado de confección por categoría**: `k.minEstConf` / `minEstimadoConf(k)`, editable
  (`setMinEstConf`, con bitácora). Entra a `samPorCentro` **solo si la categoría no tiene hoja LMO** (`tieneHojaLMO`) y
  se marca **estimado**. **Sin valor la categoría sigue en 0** y sale como brecha en `categoriasSinHojaHTML`; un 0
  escrito a mano se respeta como 0 confirmado. Son **11 categorías de 7 familias, ~16.200 prendas abiertas en 0**.
- Ver `DEFINICION_ORDEN_ABIERTA.md`.

### 2.36 Consultas del Resumen gerencial (16-sep, diseño aprobado)
- **Filtros GLOBALES** en una cabecera: meses (suma), cliente, estado y buscador. Se aplican UNA vez en
  `pasaFiltrosGER`/`ordenesGER` sobre `ords` de `vGerencia`, por eso los cinco bloques cuadran.
- **Cinco bloques** (`GER_BLOQUES`: cliente, fase, ODC, estilo, familia) con `agruparGER`/`totGER`/`bloqueGERHTML`:
  mismas columnas (órdenes, pedidas, hechas, falta, % avance, valor, vencidas, va tarde) y extras por bloque
  (fase = días en la fase o «sin historial»; ODC = cliente, entrega más temprana, órdenes listas; estilo = categorías
  y colores). **Colapsables, uno abierto a la vez**, recordado en localStorage por usuario (`abrirBloqueGER`);
  clic en una fila abre el detalle con `filasGRP('gerdet')`.
- **«Hechas» = último paso de la ruta** (`pzHechasOrden`). Brecha **«Ruta no termina en Empaque»**
  (`rutaTerminaEnEmpaque`/`rutasSinEmpaque`/`rutasSinEmpaqueHTML`), sin trato especial en el cálculo. **Real: 349 de
  470 rutas no terminan en Empaque** (301 bordado, 48 estampado, 122.830 prendas).
- **Una sola definición de vencida y va tarde**: `esMetaVencida`/`esOrdenVaTarde` salen de `diagAtraso()`, el mismo
  que pinta las marcas de los centros. Se **eliminó** el segundo cálculo que tenía `vGerencia` (`o.fecha<h`) y se
  renombraron sus textos a «meta vencida» y «la orden va tarde». **Plan mensual no se tocó.**
- **Cierre mensual** (`S.params.cierresMes`): `fotoCarteraMes`/`guardarCierresMes` guardan por mes órdenes, pedidas,
  hechas, valor, vencidas, va tarde y el desglose por cliente y familia. El mes en curso se actualiza **una vez al
  día**; al pasar el mes la foto queda `cerrado:true` y **no se vuelve a tocar**. El gráfico de tendencia NO se
  construyó: falta juntar historia.
- **Márgenes**: solo una nota en pantalla, pendiente de integrar con **Costos TEMPO**. Nada construido.
- **Prueba principal**: los totales de «Pedidas» de los cinco bloques son idénticos con 12 combinaciones de filtros.
- Ver `CONSULTAS_GERENCIALES_REPORTE.md`.

### 2.35 Reconciliación del catálogo (16-sep) — CORRIGE cifras de 2.31 y 2.32
- **Las brechas de catálogo reportadas el 16-sep estaban medidas contra el catálogo de DEMO del simulador**, cuyas
  familias (CAM BÁSICA, POLO PIQUÉ, HOODIE, JEAN, Nuevo padre) no existen en Odoo; la tabla padre→LMO usa los nombres
  reales, así que casi nada calzaba. Cargar el volcado **no crea categorías**: de 1.206 órdenes reales, solo **133**
  resolvían su categoría contra el demo. De ahí salió el falso «3 de 24».
- **Cifras reales** (simulador con el catálogo real cargado): **22 familias, 51 categorías hija, 40 vinculadas a su
  familia de la LMO, 11 sin vínculo**; 595 operaciones, 18 categorías LMO, solo BOXER sin usar. Las 11 son siete
  familias enteras — JOGGER, Fleece Basico, Fleece Pesado, TEJIDOS, FALDAS, ENTERIZO y ACCESORIOS — y coinciden con
  las «⚠ SIN OPERACIONES» de `LISTADO_CATEGORIAS_PRODUCCION.md` (ahí son 14 porque incluye tres con 0 órdenes).
- **La etiqueta SÍ carga**: Level 1, Level 2, Camiseta CR y Camiseta CV existen (familia CAMISETAS) y la regla aplica
  0,50 min en **423 órdenes / 206.738 prendas / 103.369 min**.
- **El simulador ahora arma el catálogo REAL** desde el volcado (22/51) y reenlaza las 1.206 órdenes por su `catTxt`
  «PADRE / Hija» antes de medir, con pruebas que fijan esos números. Las brechas reportadas son las reales.
- **JEANS→DENIM NO se ejecutó** y no corre en ninguna siembra: solo con el botón de Configuración → Categorías.
  Movería 3 categorías, 13 órdenes abiertas (31 en todo el volcado), 49 operaciones y 4 filas de configuración.
- Las **dos operaciones de etiqueta de BVD y FITS** siguen en «Operaciones sin centro»; nada les asigna centro solo.
- Ver `RECONCILIACION_CATALOGO.md`.

### 2.34 Parte B — Reportería gerencial, sub-centros y congelado (16-sep)
- **Resumen gerencial** pasó de Dirección a **Reportería** (menú + registro `REPORTES`). Filtro global de meses
  (`GER.meses`, multiselección que **suma**) aplicado en `vGerencia` sobre `ords`, así que manda sobre TODOS los
  bloques; `filtroMesesGERHTML` pinta el selector y el total de lo seleccionado (órdenes, pedidas, hechas, falta,
  valor, vencidas, riesgo). `pzHechasOrden` = avance del último paso de la ruta.
  **Las consultas por cliente, fase, ODC, estilo y familia NO están construidas**: propuesta en
  `REPORTERIA_GERENCIAL_DISENO.md`, esperando confirmación (3 decisiones abiertas ahí).
- **Sub-centros**: `resumenSubCentros(g,P,lun,dom)` / `resumenSubCentrosHTML` — una fila por sub-área con carga,
  capacidad, ocupación, órdenes, prendas programadas, hechas de la semana, atrasadas y pendientes, más el total.
  Sale de `subAreasDe(g)` (columna «Ítem de planificación»): **mismo componente para cualquier centro**, y mover una
  sub-área de ítem lo cambia solo. No se muestra con una sola sub-área ni cuando `CEN.solo` está puesto.
- **Congelado del programa semanal**: `S.params.progCongelado[]` = `{id,k:centro|lunes,centro,lun,dom,ts,u,ords[{oid,op,pz,min,dias}],pz,min,hechasAl}`.
  `congelarPrograma(cens,lun,dom)` exige `puede('programa')`; **volver a congelar NO pisa**, deja historial.
  `avanceCongelado` mide solo lo hecho DESPUÉS del congelado (por eso guarda `hechasAl`) y detecta **agregadas** y
  **sacadas** comparando la foto con el programa vigente. `avanceCongeladoHTML` va al final de Centro → Programación.
  **No se contradice con el congelado del plan mensual (Bloque 5)**: el del mes fija **qué órdenes** entran; este fija
  **cuándo y cuánto** se hace esa semana en ese centro. La pantalla lo explica.
- Ver `PARTE_B_REPORTE.md` y `REPORTERIA_GERENCIAL_DISENO.md`.

### 2.33 Parte A — Dirección, Liberación y Producción (16-sep)
- **Hoy → Planta hoy**: cada centro con su propio «ver programa» (`irCentro(c,dia,tab)`), en la semana del día pedido y
  **aunque su carga sea 0** (se listan todos los centros, no solo los que tienen carga). `ir('centro')` pulsa la primera
  entrada del menú y el delegado pisaba el centro: ahora se navega primero y se fija `CEN` después.
- **Menú**: «Reportería por área» sale de Planificación de producción; queda en la pestaña Reportería.
- **Liberación**: `o.lib[et]={ok,u,ts}` + `o.histLib[]`. `libFechaDe/libFechaTxt` = registro → auditoría (etiqueta «aud.»)
  → **«fecha de liberación desconocida»** como brecha; nunca se inventa. Columna «Liberada» en la tabla y bloque
  `resumenLiberacionHTML` (día/semana/mes + rango desde/hasta, estado `LIBR`).
- **Desliberar** en producción: `mDesliberar`/`desliberar`/`aplicarDesliberacion`, en lote y una a una, permiso
  `puedeDesliberar()` = `puede('programa')`, motivo de la tabla 15, auditoría + `histLib`, y **advertencia previa si la
  orden ya tiene avance** (`avanceDeOrden`); el avance NO se borra y la marca `lista` se apaga, no se elimina.
- **Agrupador**: `detalleAgrupableHTML(id,ords,...)` lleva el componente común a **Balanceo** (`bal`) y **Programa del
  día** (`imp`); la hoja impresa conserva centro → recurso.
- **«Arranca»**: `yaArranco/minArranque/fechaArranqueValida`; `min=` en el input **y** validación en `setProgCen`. Las
  órdenes con avance o tramo iniciado conservan su fecha real. Pendiente: tejeduría manual (`addProgTej`) sigue sin tope.
- **Rutas**: `puedeEditarRuta()` reemplaza los 16 chequeos sueltos y se valida **en el guardado** de
  `guardarRutaCentro`, `add/set/delReglaRuta`, `aplicarReglasRuta`, `aplicarLavado`, `confirmarRuta`,
  `desconfirmarRuta`, `marcarRutaRevisada`, `generarRutasEstimadas` y `confirmarRutasOdoo`. `sembrarPermisoRutas()`
  quita `ruta` a corte, módulos y terminado (bitácora, editable en Configuración → Usuarios).
- **«Sin fecha todavía»**: sale de la vista del encargado (`veSinFecha()`) y aparece como brecha «Órdenes sin fecha»
  en Reportería (`sinFechaBrechaHTML` + `motivoSinFecha`, que dice qué frena cada una).
- **«Lo que viene»** por centro (`loQueVieneDe/loQueVieneHTML`): órdenes con ese centro en su **ruta** que siguen en un
  paso anterior, con dónde están, qué les falta y por qué sub-área entran; agrupable (`cenviene`).
- **«Dónde está»** dentro de un centro: `dondeEstaEnCentro` no repite el nombre del centro, muestra el estado propio
  (`estadosCentro`/`estadoEnCentro`/`estadoCentroTxt`, textos configurables por la tabla 17; siembra
  `ESTADOS_CENTRO_DEF`) y cuántas lleva. Fuera del centro sigue diciendo dónde está.
- Ver `PARTE_A_REPORTE.md`.

### 2.32 Decisiones de producción (16-sep, Jannine Cadena)
- **Etiquetado**: solo **Level 1, Level 2, Camiseta CR y Camiseta CV** llevan etiqueta de serigrafía (0,5 min), y sale de la
  tabla editable `reglasEtiqueta` (Configuración → Operaciones), no de la LMO: ninguna de las cuatro tiene esa operación.
  Calce EXACTO por nombre; fila sin confirmar no aplica. Se **retiró la regla** «SERIGRAFIA + ETIQUETAR → Etiquetas»: las dos
  operaciones que calzaban (**FITS** tampográfica 0,35 y **BVD** manual 0,40) quedan **sin centro, sin borrarse**, en el panel
  «Operaciones sin centro» con su motivo y un selector. Las etiquetas **cosidas** (ENSAMBLE/RECTA) y «ETIQUETAR PRENDA»
  (EMPAQUE) no se tocaron. Brecha: **Level 1 y Level 2 no existen en el catálogo**, y el panel lo marca.
- **Plancha**: 2 min/prenda **confirmado**; se quitó `minEstandarEstimado`.
- **Lavado**: planta 3 días, Quito 15, los dos como **solo tiempo de espera**, con la nota «ocupa capacidad propia; pendiente
  datos de lavadoras» pegada a la fila (`avisoLavadoPlanta`). **No se asigna por regla**: la modalidad vive en la orden
  (`o.lavadoModo`) y `esperaDeCentro` la respeta por encima del calce por categoría. `mLavado`/`aplicarLavado` agregan o quitan
  lavado a una o varias órdenes (Liberación → «Lavado de las marcadas», y desde la ruta de cualquier orden), con motivo
  obligatorio, auditoría de ruta y bitácora; `posLavado` lo mete después de confección y antes de plancha/empaque.
- **Ojales y botones**: los tiempos de la tabla son **definitivos**; se confirmaron las 3 filas pendientes y
  `tiemposOjalBoton()` ya **no repone** filas sin confirmar (antes las recién renombradas revivían en blanco).
- **Rutas estimadas**: `rutaConf.estado` acepta `estimada` con `revisada` → tres estados («estimada – sin revisar» /
  «estimada – revisada» / «real»). `generarRutasEstimadas` arma la ruta con la ruta por defecto + los minutos de la categoría
  y **excluye `CENTROS_DISENO`** (estampado, bordado, etiquetas); si la categoría tenía minutos ahí, la fila avisa que **esa
  carga puede faltar**. Panel de revisión en Órdenes → Rutas y conteo en Reportería (`rutasEstimadasResumenHTML`).
- **DENIM y JEANS**: `diagJeans()` **reporta antes de mover** (categorías, órdenes, operaciones y filas de configuración);
  `unificarJeansEnDenim()` renombra la familia, recuelga las hijas, marca `unificadaEn` y deja todo en bitácora **sin borrar**.
  El mapeo a la hoja LMO sigue diciendo JEANS (es su nombre de origen). **HENLEY y las «Nueva hija» no se tocan.**
- Ver `DECISIONES_PRODUCCION_16SEP.md`.

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
