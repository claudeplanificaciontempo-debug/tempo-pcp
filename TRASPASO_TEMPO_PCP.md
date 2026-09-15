# TRASPASO — tempo-pcp (Planificación y control de producción, TEMPOCODECA)

Versión: 2026-09-13 (reemplaza cualquier documento de traspaso anterior, incluido el que usaba el nombre viejo
"plm-textil"; el sistema se llama **tempo-pcp**). Sirve para retomar el trabajo en una conversación nueva sin perder
contexto. Cada afirmación de negocio de este documento vino de la usuaria (planificación de TEMPO); lo que es
decisión pendiente está marcado como tal.

---

## 1 · Qué es y dónde está

- **Sistema**: una sola página `index.html` (JS vanilla, sin frameworks), backend Supabase proyecto
  `bypdfogmksbxjaiydhlg` (tablas `{id, data jsonb}`: ordenes, avance, centros, recursos, telas, colores, categorias,
  operaciones, rutas, programas, cargas, propuestas, paros, turnos, bitacora, planes, salidas_tin, banos_conf, params).
- **Repo**: `claudeplanificaciontempo-debug/tempo-pcp`, rama `main`. **Producción**: GitHub Pages
  https://claudeplanificaciontempo-debug.github.io/tempo-pcp/ (se publica solo al hacer push; tarda 1–3 min). Netlify
  quedó sin crédito.
- **Simulador local**: `node test/build.js` → `node test/server.js` → http://127.0.0.1:8765/ ; resultados en
  `window.__R` (hoy 314 verificaciones). Fixtures reales de clientes en `test/fixtures/` están fuera del repo
  (`.gitignore`): `tarea_rows.json`, `ot_rows.json`; `lmo_rows.json` sí está.
- **Otro proyecto de la usuaria**, no confundir: "Costos TEMPO" (repo `costos-tempo`, Supabase `oepsutldxratrvozpulq`).
- Node está en `C:\Users\Tempo\AppData\Local\Programs\nodejs` (no en el PATH de bash); Chrome en
  `C:\Program Files\Google\Chrome\Application\chrome.exe` (sirve para imprimir PDF headless).
- Para ejecutar cargas en producción se usa la pestaña de Chrome autenticada y las mismas pantallas de la app (subir el
  Excel por el `<input type=file>`); `alert()` bloquea la pestaña, hay que sobreescribirlo antes.

## 2 · Principio rector (decisión de la usuaria)

**Ninguna regla de negocio va escrita en el código; todo vive en tablas editables desde Configuración y lo configurado
manda sobre el código.** Un valor puesto en 0 es una decisión, no un vacío (`prm(k,def)` solo usa el default si el
parámetro no existe). Nada se asigna por parecido de texto: lo que no calza con una tabla se carga marcado y se
reporta. Las siembras son idempotentes: solo entran si la tabla no existe; ni una versión nueva ni una tabla vaciada
a propósito la pisan. Cuando algo no se puede determinar se escribe "NO DETERMINADO", no se supone.

## 3 · Tablas de configuración (Configuración → Órdenes y materiales, salvo indicación)

1. **Fase del archivo → grupo** (43 fases del Bloque A + `1Calidad Tintoreria`, que escribe la propia app). Columnas:
   grupo, es cola, sin carga, bloqueo, excluye (centros que no carga), carga desde (grupo), tela (solo textil:
   —/tejida/tinturada/lista), pendiente de validar. Comparación tolerante a mayúsculas, tildes y espacios.
2. **Segundo nivel de categoría de material → clasificación** (MP tela, INSUMOS, PT, GASTOS MAQUILA, LAVANDERIA
   INDUSTRIAL, TINTURADO INDUSTRIAL).
3. **Tercer nivel de MP → origen de tela** (PROPIA / EXTERNA / EXTERNA TEÑIDA / SIN CLASIFICAR, 24 tipos; 15 quedaron SIN
   CLASIFICAR a decidir) + excepciones por cuarto nivel (NUEVOS TEMPO + SERVICIO TINTURADO / TELA IMPORTADA TINTURADA →
   EXTERNA TEÑIDA).
4. **Centro TEMPO → etapa del flujo** (tej/tin/proveedor = textil; corte = corte; estampado/bordado = servicios;
   modulos = confección; botones/lavado/plancha/**etiquetas** = terminados).
5. **Grupos de fase**: orden de flujo explícito (1–11), libera tela, libera corte, **secuencial**, pendiente.
6. **Centro de trabajo de Odoo → centro TEMPO** (órdenes de trabajo): operación contiene, recurso (módulo), ignorar,
   histórico, módulo desde operación.
7. **Estado de la OT → significado** (terminado / en proceso / para hacer / bloqueado por material / esperando /
   cancelado).
8. **Categoría Odoo → tela corta** (80 filas: ruta `INV / MP / n3 / n4` → nombre corto de la macro → tela del catálogo,
   opcional). Reemplazó al `MAPA_TELA` del código (borrado). Categorías sin tela del catálogo se reportan en la Parte 2
   (`telaSinCatalogo`) y no entran al motor textil.
9. **Parámetros por tela**: kg/m (líneas en metros) y kg/unidad (cuellos 0,026 · puños 0,0159).
10. **Merma de tintura** por tela corta × tipo (LLANO/JASPE); solo se usa si la tela corta no está enlazada a una tela
    del catálogo: si lo está, manda el **`enc` de la tela (Configuración → Telas), que es la merma de tintura del sistema**.
11. **Palabras jaspe** (JASPE, JASPEADO) → tipo de la línea; corregible por producto en el catálogo.
12. **Catálogo de productos**: proveedor desde facturas de compra (`mFacturas`, el archivo no se guarda) + catálogo de la
    usuaria (MP-IN). Origen por producto: facturas → COMPRADO; TEMPO en MP-IN o categoría PROPIA → PROPIO; categoría
    EXTERNA → COMPRADO sin factura; resto SIN CLASIFICAR; contradicción cuando chocan. La tabla 3 sigue decidiendo por
    categoría para productos sin factura ni fila.
- Tabla 1 tiene además la columna **montado** (0Macro, 1Tejeduria, 1CD Tintoreria): son las órdenes que entran a la
  **Macro del mes** (Planificación textil), liberadas o no. Ver `METODO_MACRO_REPORTE.md`.
- Operaciones → Mapeo: **familia de operación → centro TEMPO** (reglas en orden, comodín `*` → confección) y
  **categoría padre/hija → categoría LMO** (excepciones por hija).
- Centros: minuto estándar y % estimado para lavado/plancha, puntadas/min para bordado. Categorías: lleva lavado /
  plancha por defecto. Parámetros: `centrosPorOrden` (estampado, bordado, lavado, plancha), `tejAnticipSem` (2),
  stock de tela (`stockTela`), calendario y excepciones, tolerancias de tintorería (hoy 0 y 0), etc.

## 4 · Las fases de Odoo (42 en producción + 1 interna), su grupo y su significado

Orden de flujo de los grupos: previo a producción (1) → textil (2) → planificación (3) → preparación de corte (4) →
corte (5) → maquila externa (6) → servicios (7) → confección (8) → terminados (9) → prenda terminada (10) → cerrada (11).

| Grupo | Fases | Significado |
|---|---|---|
| previo a producción | 0Diseño, 0Reproceso diseño, 0Recetas Insumos, 0Adquisición, 0Macro, 0Ord Compras | nada hecho; **exige firma de liberación** |
| textil | 1Tejeduria (—), 1CD Tintoreria (tejida), 1Tintoreria (tejida), 1INCOMPLETOS TIN (tejida, bloqueo por material), 1Calidad Tintoreria (tinturada; la escribe la app) | liberada a tela sin firma |
| planificación | 2Planificacion | tela lista; **liberada a producción** desde aquí |
| preparación de corte | 3AEROPUERTO, 3Trazos, 3CD CORTE (cola) | todavía no cortado: cargan corte |
| corte | 4Corte Planta (cargan corte) · 4Incompletos, 4Preparacion Insumos, 4CD Ensamble (cola), 4 Calidad Produccion → "carga desde: servicios" (**ya cortado**) | **la línea del corte** |
| maquila externa | 5Corte Maquila Ibarra (excluye corte), 5CD Maquila (cola, excluye modulos), 5Maquila Conf (excluye modulos), 5Maquila Recepción (carga desde terminados) | no cargan módulos internos |
| servicios | 6 CD BORDADO (cola), 6 CD SERIGRAFIA (cola, sin órdenes hoy), 6Bordado, 6Serigrafia, 6 Etiquetado | **no secuencial** |
| confección | 7Confección, 7Pulido (carga desde terminados: ya salió de confección) | **no secuencial** |
| terminados | 8Lavanderia, 8Lavanderia Quito, 8Botones, 8Servicios y Terminados, 8Empaque | trabajo pendiente en terminados; lavado NO está hecho en 8Lavanderia |
| prenda terminada | 8Empaque Terminado, 8Cross, 8Centro Distribucion, 8Novedades, 8Embodegado, 8Exportacion | sin carga: cuentan como demanda y facturación, 0 minutos |
| cerrada | Facturado, Stand by | sin carga; Stand by = facturado, todo hecho |

- **CD = colas**: el centro siguiente todavía no empezó, así que carga completo. En las fases sin CD el trabajo de ese
  centro está en curso.
- **El prefijo numérico indica el grupo, no el paso exacto**: 4 Calidad Produccion lleva 4 aunque la prenda pueda estar
  ya confeccionada (se trata como si le faltara todo lo posterior al corte — sobrestimar es preferible; pendiente
  bandeja "avance incierto"). 4Incompletos = faltan unidades de un lote ya cortado; no vuelve a cortar.
- Filas de la tabla sin órdenes hoy: 0Diseño, 0Recetas Insumos, 6 CD SERIGRAFIA, 1Calidad Tintoreria.

## 5 · Reglas del motor que hoy leen de las tablas (cambiadas el 13-sep)

- **`faseEstado(fase, orden)`**: hechos = centros cuya etapa (tabla 4) es anterior al grupo (o al "carga desde") **solo
  si hay un tramo secuencial entre medio** (su propio grupo secuencial, o un grupo secuencial posterior ya alcanzado);
  más los excluidos de la fila. Tejida/tinturada/lista: grupo posterior a textil = sí; textil = columna "tela";
  anterior = no. Sin fila → nada hecho, `sinFila` (bandeja en Órdenes). **La orden de trabajo manda**: terminado → hecho;
  en proceso / para hacer / esperando → pendiente aunque la fase lo diera por hecho. Las reglas viejas por dígito y por
  palabras se borraron.
- **Dos liberaciones** (`liberada(o,'tela'|'corte')`): la firma humana (Dirección → Liberación) manda hasta que la orden
  llega al grupo marcado en la tabla 5: **liberación textil** desde textil; **liberación a producción** desde
  planificación (Planificación, Aeropuerto, Trazos y CD Corte ya tienen tela revisada y lista para cortar).
- **Estampado / bordado / confección NO son secuenciales** entre sí (una prenda puede ir a estampado, volver a
  confección y después a bordado; el orden varía por orden). Por eso "secuencial" está apagado en servicios,
  confección y maquila externa: la fase no da esos centros por hechos; **lo dicen las órdenes de trabajo de Odoo**
  (tabla 6/7). Pasar por terminados sí los cierra todos.
- **Estampado y bordado por orden, no por categoría**: estampado entra si la orden trae técnica; bordado si trae
  puntadas > 0. La categoría solo aporta el SAM.
- **La ruta guardada es una foto de la carga**: `pasosPendientes` graba solo los pasos pendientes según la tabla de ese
  día; `faseEstado` puede quitar pasos, no añadir. Si una edición de tabla debe añadir carga, hay que recargar la Parte 2.
- `armarRuta()`: los centros de producción salen de las operaciones de la categoría (más tej/tin/proveedor por origen y
  lavado/plancha por marca); sin operaciones → sin centros propios (no se rellena).

## 6 · Tejeduría y tintorería

- **Tejeduría teje contra stock, por tipo de tela, no por orden**: nunca tendrá órdenes de trabajo. Pantalla nueva
  "Stock de tela cruda" (Planificación textil): requerido por tela y mes de las órdenes liberadas a tela y no tejidas,
  con **anticipación de tejeduría de 2 semanas** (`tejAnticipSem`: la tela se teje para lo que entra a corte en ese
  plazo; mes = entrada a corte − 2 semanas), stock escrito a mano con fecha/hora y aviso a los 7 días, a tejer =
  requerido − stock (nunca negativo), stock no escrito = desconocido (aparte). **Pendiente**: que el "a tejer" descuente
  el stock en el programa de tejeduría del motor, y carga de stock por Excel.
- **Tintorería sí trabaja por orden** (baño = órdenes + color + kilos), pero se registra en el armado de baños del
  sistema, no en las OT. Solo los baños confirmados consumen máquina. Tolerancias `tol`/`tolGrande` están en 0 (ahora sí
  se respetan). Cola 100 órdenes / 6.784 kg en "Armar baños" tras las liberaciones.
- Las OT solo mandan sobre corte, estampado, etiquetas, bordado, confección, plancha, botones y empaque (tabla 6:
  PULIDO cierra confección; SERVICIOS Y TERMINADOS cierra plancha y botones; ETIQUETADO → etiquetas; columnas
  "cierra también" y "solo cierra"). Corte terminado implica tela
  lista.

## 7 · Datos operativos declarados por la usuaria (pendientes de configurar donde se indica)

- **Lavado**: 2–3 días en planta, 15 días en Quito. **Plancha**: 2 min/prenda. Hoy `minEstandar` y las marcas de
  categoría (`lavaDefault/planchaDefault`: SHORT PLANOS, PANTALONES PLANOS, DENIM y CAMISAS lavado; CAMISAS plancha)
  siguen vacías → lavado y plancha cargan 0. `pctEstimado` se edita pero no se usa aún.
- **Bordado**: velocidad **vacía a propósito** (`r7.ppm` y `S.params.puntadasMin` nulos; el valor 921.600 con 24 cabezas
  era el total por hora de la máquina; la "Bordadora nueva" ppm 800 / 0 cabezas es residual). Pendiente la ficha real
  (puntadas/min por cabeza y cabezas por máquina; r7 parece la sección entera). Hasta entonces 293 órdenes cargan 0
  minutos y están en la bandeja "sin velocidad de bordado".
- **Etiqueta estampada (0,5 min)** en Camiseta CR, Camiseta CV, Level 1 y Level 2: serigrafía hace estampado (523 OT)
  y etiquetado (745 OT); la etiqueta se estampa, no se cose. En la tabla 6, SERIGRAFIA + operación ETIQUET → etiquetas.
- Categorías sin operaciones (14, 51 órdenes / 8.241 prendas): lista para llenar a mano en
  `LISTADO_CATEGORIAS_PRODUCCION.md/.pdf`. Revisar con producción: Short Cargo 30,11 min vs Pantalón Cargo 18,50;
  "Nueva hija" bajo HENLEY (borrar); Boxer sin operación de empaque.
- **Método de la macro** (Odoo pasa la orden por la macro al liberarla): **pendiente de implementar**; hoy la
  liberación a producción se da por el grupo de fase (planificación en adelante).
- DENIM y JEANS son dos padres con una hija "Jeans" cada uno (posible duplicado; sin unificar).

## 8 · Cargas hechas en producción (estado a 2026-09-13)

- Parte 1: 595 operaciones de la hoja LMO (ids propios; 7 CODIGO GEN duplicados en 14 filas y 4 inconsistencias
  reportadas), 46 hijas vinculadas, 14 sin mapeo.
- Parte 2: 691 órdenes de `Tarea__project_task` (101 done como historia, 132 vencidas abiertas contra septiembre, 4 sin
  fecha en bandeja, 3 números duplicados en 7 filas reportados, 3.036 fuera de rango), con materiales, origen de tela
  y ruta pendiente. Recargada el 13-sep tras apagar "secuencial".
- Órdenes de trabajo: 666 órdenes cruzan, 771 centros cerrados, 204 contradicciones (gana la OT), 418 órdenes con OT
  "esperando componentes", 5.768 filas de bodegas ignoradas. Tras asignar ETIQUETADO, PULIDO y SERVICIOS Y TERMINADOS:
  1.003 centros cerrados, 216 contradicciones. Ver `CARGA_ORDENES_DE_TRABAJO_REPORTE.md`.
- Macro (13-sep, 08:05–08:07 p.m.): tablas 8–12 sembradas, facturas aplicadas (6.959 filas, 951 códigos, 113
  proveedores, 52 multi), Parte 2 recargada con la tabla 8 (691 órdenes) y OT reaplicadas (666 / 1.003 / 216). Validación
  contra los 7.905 kg de la usuaria: 26 de 30 telas exactas con la merma de su hoja; +167,4 kg en 4 telas por productos
  que faltan en su MP-IN; 12 `enc` distintos de su hoja Memas, sin cambiar. Detalle en `METODO_MACRO_REPORTE.md`.
- Fotos de las órdenes (código publicado el 13-sep, carga pendiente de que exista el bucket): ver sección 8b.
- Carga programada por el motor (sep, minutos): confección 475.898 · corte 10.837 · estampado 3.167 · etiquetas 1.406 ·
  botones 21.759 · empaque 22.589 · bordado 0 · lavado/plancha 0. Liberadas: 408 tela / 293 corte. Tejeduría 90 corridas.

## 8b · Fotos de las órdenes

- Van al **almacenamiento de Supabase** (Storage, bucket público `fotos-ordenes`, se puede cambiar con
  `S.params.fotosBucket`), **nunca al repo** (GitHub Pages es público y las fotos llevan referencias de clientes). La
  orden guarda **solo el enlace** (`o.foto`, URL pública con `?v=` para que un reemplazo se vea al instante).
- Índice `S.params.fotosIdx[op]={ts,b}`: como la recarga de la Parte 2 reemplaza todas las órdenes, `colgarFotos()`
  vuelve a colgar el enlace por OP al aplicar la recarga. Las fotos de órdenes que aún no existen se suben igual y se
  cuelgan cuando llegue la orden.
- Carga: Órdenes → botón **Fotos** (`mFotos`): CSV con columnas "Orden de produccion" y "Avatar" (base64). Por tandas:
  lo que viene reemplaza, lo demás se conserva. JPG de hasta 600 px sube tal cual; lo demás se convierte a JPG 600 px
  calidad 0,82 (`normalizarFoto`). Reporta subidas, órdenes con/sin foto, espacio (`S.params.fotosCarga`).
- Dónde se ve (`fotoMini`, miniatura 34 px con carga perezosa, clic = grande): lista de órdenes, ficha de la orden,
  programación por centro (`vCentro`), liberación (tabla de la liberación; la confirmación sigue siendo un `confirm()`
  sin imagen) y **hoja impresa del día** (54 px). No va en plan mensual, macro, stock, baños ni capacidades.
- El bucket lo crea la usuaria en el panel de Supabase (la clave pública no puede crear buckets): público, con
  políticas de `storage.objects` que permitan a `anon` select/insert/update en ese bucket.

## 9 · Auditoría de reglas fijas (`AUDITORIA_REGLAS_FIJAS.md`, 187 puntos) y qué se corrigió

Corregido: `faseEstado` y `liberada` por tabla (A1, A2, C1–C3); 48 defaults `||` que pisaban valores configurados
(B1–B4, A6 y otros: `prm()`); calendario del mes manda en metas y carga semanal (A35, A36, A38); tabla de fases no se
re-siembra (A27); velocidad de bordado sin default (A4–A7); estampado/bordado por orden (A15 parcial); campos numéricos
que escondían dígitos; importador viejo de OT con `MAPA_CENTRO_OT` en código (D14) reemplazado; `demo()` protegido;
bug `d` sin declarar en `guardarOrden`. **Siguen en código** (decisión pendiente): `MAPA_TELA` (nombre de tela → tela
del catálogo, D1), `estadoTin` por palabras (B31), `faseNum` en Panorama/Gerencia/Familias (A40, A46, A47, C11),
`RUTA_ORDEN` secuencial (A16), horas de baño sin desencolado (B17), regex rota del Gantt (B32), el campo `dias` de
recursos (sobra), lavado 120 / plancha 1 del importador Odoo antiguo (A11–A14), tablas 2–7 que se re-siembran si se
vacían (solo la de fases está protegida), `ESTADOS_OP_ABIERTOS` y contradicción/devolución de la Parte 2 en código.

## 10 · Pendientes, en orden sugerido

1. Ficha de bordado (velocidad por cabeza, cabezas, una máquina por recurso) → cargar en Centros y en la bordadora.
2. Lavado/plancha: marcas por categoría, minutos estándar (2 min plancha; lavado 2–3 días planta / 15 Quito), y que
   `pctEstimado` intervenga; pantallas del Paso 8 (agregar/quitar por orden con impacto) y 8b (% real).
3. Bandejas pendientes de la Parte 1 (Paso 9 categorías sin operaciones, Paso 10 plan mensual con bases explícitas y
   "pendiente de liberar", Paso 11 confirmación de ruta antes de liberar) y "avance incierto" (4 Calidad Produccion).
4. Tiempos a mano de las 14 categorías sin operaciones. Decidir si las 1.846 OT de SERIGRAFIA sin operación son estampado
   o etiquetado (impacto 687 min). Las 7 órdenes Stand by de PRICE CLUB sin rastro de producción.
5. Tejeduría: descontar stock en el programa; carga de stock por Excel. Macro: decisiones de
   `METODO_MACRO_REPORTE.md` §6 (PIQUE FANTASIA, Orchid HA, combinados, 12 `enc`, 4 contradicciones, 7 categorías sin tela).
6. Resto de la auditoría (sección 9) según prioridad de la usuaria; documentar qué sistema usa "esperando componentes".
7. **La recarga de la Parte 2 reemplaza todas las órdenes y con ellas se pierden `o.lib` (firmas de liberación manual),
   `o.prio`, `o.progCentro`, `o.recursoFijo` y `S.avance`**; `o.ot` se recupera reaplicando las OT y `o.foto` con el
   índice de fotos. Decidir si esos campos deben conservarse por OP al recargar (hoy no se conservan; no se cambió sin OK).
8. Cargar las fotos en producción en cuanto exista el bucket (sección 8b) y reportar cifras.

## 11 · Documentos en el repo

`AUDITORIA_PLANIFICACION.md` (auditoría inicial), `CONFIGURACION_CENTROS.md`, `RECARGA_PARTE1_REPORTE.md`,
`RECARGA_CORRECCION_RUTA_ORDEN.md`, `RECARGA_PARTE2_TABLAS_CONFIG.md`, `RECARGA_PARTE2_REPORTE.md` (nota: dice 600
puntadas/min donde producción tenía 6.000), `AUDITORIA_REGLAS_FIJAS.md`, `ARREGLOS_PREVIOS_BLOQUE_K.md`,
`SIGUIENTE_PASO_STOCK_BORDADO.md`, `MOTOR_FASES_LIBERACION_ANTES_DESPUES.md`, `ORDENES_DE_TRABAJO_Y_TRAMO_NO_SECUENCIAL.md`,
`CARGA_ORDENES_DE_TRABAJO_REPORTE.md`, `LISTADO_CATEGORIAS_PRODUCCION.md/.pdf`, `METODO_MACRO_REPORTE.md`, y este traspaso. `CLAUDE.md` tiene el
resumen técnico y las reglas de tintorería; donde contradiga a este documento, manda este.

### Programación del centro: cola única, arrastre y agrupación (14-sep-2026)
Ver `PROGRAMACION_CENTRO_COLA_REPORTE.md`. El puesto en la cola de un centro es `progCentro[c].pri` (1..n), el mismo
número que usa el motor (`prioCentro` = menor puesto entre centros; la prioridad global `o.prio` va antes). Arrastrar
(`moverEnCola`) renumera toda la cola del centro, avisa (sin impedir) qué órdenes dejan de llegar a su fecha
(Advertencias de fecha) y queda en bitácora. Agrupar por cliente/familia/categoría/ODC hasta 3 niveles (`agruparCola`,
preferencia del navegador). Tejeduría y tintorería no tienen arrastre por orden: el motor las ordena por tela/fecha
requerida y por color/fecha requerida; tintorería arrastra baños confirmados a máquina × día (decisión: se queda así).
Sin puesto = al final (`SIN_PUESTO` en `prioCentro`, decidido 14-sep).

### Capacidad y decisiones · buscadores · borrado (14-sep-2026)
Ver `CAPACIDAD_DECISIONES_REPORTE.md`. Página `capacidad` (Dirección, permiso `programa`): matriz centro × mes por
Proyecto con todas las órdenes abiertas (liberadas o no), carga = pendientes × min/prenda del centro, capacidad =
calendario × recursos (mes en curso desde hoy; mes pasado = vencido); tejeduría/tintorería por programa. Umbral ámbar
`params.capAmbar` (siembra 85). Problemas (`params.capProblemas`) se registran al verse y se cierran solos; decisiones
(`params.capDecisiones`) solo se anotan. Aviso en Hoy. Buscadores con `buscarQ` (data-q) para no perder el foco.
Vaciar/Borrar datos operativos solo en Configuración → Borrado (administrador) con frase escrita; `delOrden` confirma.

### Compras del mes + registrar hecho desde el centro (14-sep-2026)
Ver `COMPRAS_Y_REGISTRO_CENTRO_REPORTE.md`. Página `compras` (junto a Macro): telas externas/insumos/servicios de las
órdenes montadas por Proyecto, con merma, disponibilidad (bodega=aparte, sin dato=bandeja), agrupable por proveedor/
tipo/mes, CSV. Tabla `S.params.diasProveedor` (prov→días, sembrada en blanco); `diasProvDe`/`diasProvOrden`; fecha
límite = fecha requerida − días. `rutaTextilDe` ya no usa 15 fijo (usa diasProvOrden||0; aplica en la próxima recarga).
Registrar hecho desde la cola del centro: `marcarHechoCentro`/`confirmarHechoCentro`/`deshacerHechoCentro`,
`avance.hechoC[c]` (ts,u,pz,pedido,dif,turnoDelta), turnos con piezas reales, completo (módulos parcial preparado y
apagado con `S.params.modulosParcial`), "Hecho hoy" en la cola, "lista para <siguiente>". No reprograma; no toca motor.

### Días de proveedor · ojales/botones · dos liberaciones · tintorería (14-sep-2026)
Ver `CUATRO_COSAS_PROVEEDOR_BOTONES_LIBERACIONES_TINTORERIA.md`. A) `S.params.diasProveedor` sembrado 15 laborables
`estimado`; `dsumLab`/`labDiaGeneral` hacen la espera de tela externa en días laborables; `rutaTextilDe` usa
`diasProvOrden(o)`. B) `S.params.tiemposOjalBoton` (match→ojales+botones) sobrescribe el SAM de Botones de la LMO
(`samPorCentro`), `aplicarTiemposBotones` migra las rutas; corregir también la LMO. C) Liberación a producción una por
una con dos casillas obligatorias (MP/insumos en bodega + fechaVerif) en `o.lib.corte`; sin masivo; `o.rutaRevGeneral`;
edición de ruta con `etapa` en `o.rutaEditada` → panel "Auditoría de ruta" en vAuditoria. D) permiso `armarBanos` (solo
planificación); `S.params.motivosReproceso` y `S.params.restriccionFaltante` editables; faltante capturado en
`confirmarBanoHecho` (`avance.faltaKg`+`faltaTinPend`, `kgTelaTin` lo respeta), panel `faltantesPanelHTML` (cola de
planificación, restricciones), `reingresarFaltante` manual; `reporteTin`/`reporteTinPanelHTML` mensual.

### Motor de programación hacia atrás (14-sep-2026)
Ver `MOTOR_HACIA_ATRAS_REPORTE.md`. `S.params.motor` atras|adelante (Configuración → Calendario). Sección 3 de `programar()`
con dos ramas: hacia atrás desde la fecha meta con `fluirAtras` (seco + firme; piso = inicio del programa, tela lista, `desde`
del centro); si no cabe, hacia adelante igual y `ro.motor=atras-no-llega` con `diasTarde`, `atasco`, `fechaPosible`, `reqTelaLista`.
Esperas por paso `S.params.esperasPaso` (lavado planta 3 est., Quito denim 15, prenda tinturada sin regla). Colecciones por ODC
(`claveColeccion`, `res.colecciones`, `atrasoPorColeccion`). Antes/después: `compararMotores` (Capacidad y decisiones).
Pendientes: confirmar qué ODC son colecciones reales; actualizar `inicio` (07-sep vs hoy); decidir si los lotes de
tejeduría/tintorería siguen `reqTelaLista`; cómo identificar prenda tinturada; parámetro tejeduría 2 semanas.

### Menú horizontal · pendientes en Hoy · ODC a mano (14-sep-2026)
Ver `PANTALLA_MENU_PENDIENTES_ODC_REPORTE.md`. `#app` es una sola columna (64px cabecera + 46px menú + contenido);
`nav` horizontal con `.grp` y `.gbody.abierto` (desplegable), íconos completos en `ICO_NAV`. Hoy: `pendientesHoyHTML()`
primero, con `pendientesHoy()` (13 tipos), `posponerPend`/`reactivarPend` (`S.params.pendPospuestos`). Órdenes:
`panelODCHTML`/`asignarODC` (`o.odcManual`); tabla 14 fila `odc` conservada en la recarga con bandeja si el archivo trae otro.

### Asignación por orden por estado (14-sep-2026)
Ver `ASIGNACION_POR_ORDEN_REPORTE.md`. En Carga general: `clasificarAsig` (vencidaUnPaso / sinProgramar / noLlega / justo /
bien), `pasosPendPro`, `pasoProximoDe`, `mDetalleAsig`, `arbolAPO`/`filasArbolAPO`, estado `APO`; colchón
`S.params.colchonDias` (sembrado 3, `colchonEstimado` hasta que se edite; `setColchon` a bitácora). No toca el motor.

### Actualización completa 14-sep (tarde) y mejoras B–G
Ver `ACTUALIZACION_14SEP_Y_MEJORAS_REPORTE.md`. Recarga con Odoo mandando en fase/fecha (157 fases cambiadas, aceptadas);
OT 695 órdenes; fotos 664/665. Reversión de la numeración de la cola de Corte (536 puestos quitados) y 35 advertencias
atendidas. `profundidadDe`/`setProfundidadColor`/`bandejaProfundidadHTML`; 37 baños armados (D1 claros, D2 oscuros/medios),
16 colores sin clasificar en bandeja; 7 órdenes con contradicción Odoo (1Tintoreria) vs piso (baño salido).
`gruposAdvertencias`/`atenderGrupo`; fotos y "sale (est.)" en tintorería; `wipOrdenesHTML` (color); `tarjetasHoyHTML`.

### Tintorería: reglas de máquina y color (14-sep-2026 noche)
Ver `TINTORERIA_REGLAS_MAQUINA_COLOR_REPORTE.md`. `maqApta`: claro→rol claro, oscuro→rol oscuro, medio/sin clasificar→cualquiera;
chico sin piqué→STUART (rol ambos). 16 colores clasificados a mano, 42 baños a máquina automática, 17 nuevos, inicio 15-sep.
Pendientes: SURF SPRAY sin profundidad; telas/capacidad piqué de STUART; 35 baños <70 %.

### Plan mensual: flujo en cinco bloques (14-sep-2026 noche)
Ver `PLAN_MENSUAL_FLUJO_REPORTE.md`. Días y capacidad arriba; resumen con riesgo desplegable; meta; agregar órdenes al plan
(agrupado, jalar del mes siguiente, aviso de capacidad antes de guardar, sin bloquear); congelar con versión/fecha/quién.
Liberación marca "EN EL PLAN — pendiente de liberar"; los centros ven el plan congelado en "Carga que viene".
Datos: `S.params.planMes[ym]={oids,ts,u,congelado}`; `S.planes[].oids`. Motor y capacidades sin tocar.
