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
- Las OT solo mandan sobre corte, estampado, etiquetas, bordado, confección y empaque. Corte terminado implica tela
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
  "esperando componentes", 5.768 filas de bodegas ignoradas, ETIQUETADO (16) no mapeado, PULIDO y SERVICIOS Y TERMINADOS
  sin centro. Ver `CARGA_ORDENES_DE_TRABAJO_REPORTE.md`.
- Carga programada por el motor (sep, minutos): confección 475.898 · corte 10.837 · estampado 3.167 · etiquetas 1.406 ·
  botones 22.817 · empaque 22.589 · bordado 0 · lavado/plancha 0. Liberadas: 408 tela / 293 corte. Tejeduría 90 corridas.

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
4. Tabla 6: decidir ETIQUETADO, PULIDO y SERVICIOS Y TERMINADOS. Tiempos a mano de las 14 categorías sin operaciones.
5. Tejeduría: descontar stock en el programa; carga de stock por Excel. Método de la macro.
6. Resto de la auditoría (sección 9) según prioridad de la usuaria; documentar qué sistema usa "esperando componentes".

## 11 · Documentos en el repo

`AUDITORIA_PLANIFICACION.md` (auditoría inicial), `CONFIGURACION_CENTROS.md`, `RECARGA_PARTE1_REPORTE.md`,
`RECARGA_CORRECCION_RUTA_ORDEN.md`, `RECARGA_PARTE2_TABLAS_CONFIG.md`, `RECARGA_PARTE2_REPORTE.md` (nota: dice 600
puntadas/min donde producción tenía 6.000), `AUDITORIA_REGLAS_FIJAS.md`, `ARREGLOS_PREVIOS_BLOQUE_K.md`,
`SIGUIENTE_PASO_STOCK_BORDADO.md`, `MOTOR_FASES_LIBERACION_ANTES_DESPUES.md`, `ORDENES_DE_TRABAJO_Y_TRAMO_NO_SECUENCIAL.md`,
`CARGA_ORDENES_DE_TRABAJO_REPORTE.md`, `LISTADO_CATEGORIAS_PRODUCCION.md/.pdf`, y este traspaso. `CLAUDE.md` tiene el
resumen técnico y las reglas de tintorería; donde contradiga a este documento, manda este.
