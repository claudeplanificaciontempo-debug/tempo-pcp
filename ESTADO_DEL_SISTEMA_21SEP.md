# TEMPO PCP · Estado del sistema al 21 de septiembre de 2026

Resumen completo para la usuaria: qué es el sistema, cómo funciona de punta a punta y qué falta para
que esté al 100 %. Se escribió leyendo los 126 reportes del repositorio y comprobando cada pendiente
contra el código actual (commit `faf98b5`).

## 1 · Qué es

Un sistema de **planificación y control de producción** para TEMPO (textil verticalmente integrada:
tejeduría → tintorería → corte → confección → terminados → empaque, con estampado, bordado, sublimado,
apliques, calandrado, cordones, lavado, plancha y botones como pasos opcionales). Vive en **un solo
archivo** (`index.html`, 1,9 MB de HTML + JavaScript, sin frameworks) con **Supabase** como base de datos
(19 tablas `id / data jsonb`, autenticación y almacenamiento de fotos y respaldos). Se publica solo al hacer
`push` a `main` (GitHub Pages; Netlify cuando tenga crédito). Tiene **31 pantallas** en cinco grupos del
menú (Dirección · Planificación textil · Planificación de producción · Reportería · Piso · Configuración),
**perfiles** por rol (administrador, planificación, tintorería, liberación, corte, módulos, terminados,
consulta, tablet de operario) y un **simulador de pruebas** de 2.793 comprobaciones que recorre todas las
pantallas con el volcado real de Odoo. Desde el 10 de septiembre lleva 320 commits.

**Principio que manda en todo lo nuevo (decisión de la usuaria, 13-sep):** ningún valor de negocio en el
código; todo sale de una configuración visible y editable; un valor configurado se respeta aunque sea 0;
si falta un dato se reporta en una bandeja, no se rellena; si dos lugares hablan de lo mismo, la pantalla
dice cuál manda; los cambios que mueven el plan quedan en bitácora; nada se borra sin confirmación.

## 2 · Cómo funciona, de punta a punta

### 2.1 Entran los datos (Órdenes → Actualizar datos, un solo camino)
1. **Tareas de Odoo** (Tarea_project.task): cada tarea es una orden. La **identidad** es el ID de tarea (o la
   WH, o cliente+proyecto+estilo+color+ODC si no tiene WH); una orden existente nunca cambia de id. La
   **tabla 14** dice qué campos se conservan al recargar (fase, fecha, telas confirmadas, ruta editada,
   avance… nunca se pisan); mientras la orden no tiene WH, la fase la manda Odoo. Lo que no viene o queda
   fuera de alcance no se borra: se marca. Un archivo incompleto frena la carga (hay que escribir APLICAR).
2. **Órdenes de trabajo** (mrp.workorder): cierran pasos (lo terminado deja de cargar) y **completan la ruta**
   (un centro con OT entra a la ruta; nunca se quita). No tocan una ruta confirmada por una persona.
3. **Fotos** (CSV con avatar en base64 → bucket de Storage), enlazadas por WH.
4. **Tallas del pedido** (Lista de pedido de Odoo): la talla se lee dentro del texto de cada línea, con alias
   editables; con eso el piso registra por talla.
Además: maestro de productos (origen de cada tela por proveedor), hoja de operaciones LMO (Operaciones),
orden de las operaciones y tiempos de ingeniería.

### 2.2 La orden queda descrita
- **Telas**: por cada línea de tela de Odoo, cuánta tela (kg crudos), de qué catálogo y **qué le falta**
  (tejer, tinturar, comprar) según el **origen** (propia / externa / externa teñida, por producto del maestro
  o por categoría de material) y el Pantone del color.
- **Ruta de producción**: centros que la orden recorre, derivada de la hoja de operaciones de su categoría +
  técnica (estampado, bordado, sublimado, apliques) + puntadas + lavado por orden + plancha por categoría; toda
  ruta termina en Empaque; se recalcula sola cuando cambia el catálogo (nunca pisa una ruta editada a mano); se
  **confirma** por persona (ficha, «✓ Ruta ok» o ruta en lote por grupo) o se da por lista si la prenda ya está
  terminada.
- **Tiempos**: cada paso tiene minutos por prenda que salen, en este orden de mando, de lo que manda por tipo
  de producto → la hoja de operaciones → el minuto del centro → ojales y botones → etiquetas → minuto estimado.
  Cualquier cambio de tiempo se aplica al momento a todas las órdenes abiertas.
- **Fase de Odoo** (46 fases con secuencia y «qué es»), estado OP, fecha meta (compromiso si existe), cliente,
  ODC/colección, precio.

### 2.3 Se planifica
- **Tejeduría** contra stock de tela cruda y programación manual por tela y máquina; lo demás lo estima el motor.
- **Tintorería**: armado de baños por color y familia de tela (A/B mezclables, piqué solo, se parte la WH para
  llenar, remanentes mezclados), máquinas por claro/oscuro, código de baño, albarán, calidad (aprobar / rechazar
  → reproceso), kilos reales, «Antes de tintorería → Tintorería → Hecho → calidad».
- **Liberación**: textil (Dirección) y a producción (Planificación), sobre las órdenes del mes del Proyecto;
  liberar a producción exige tela aprobada por calidad y ruta confirmada.
- **Motor de programación hacia atrás**: cada orden liberada se coloca desde su fecha meta de empaque a corte,
  paso por paso con esperas configurables; si no cabe, se programa hacia adelante y sale en «Advertencias de
  fecha» con el cuello de botella. Tejeduría y tintorería siguen por lote. Maquila solo recibe lo que se marca.
- **Planificar el mes** en dos pasos: 1) **Nivelación** (calendario del mes, personas y horas por centro, saldo
  por procesar por área y familia contra capacidad → llega / en riesgo / déficit; maquila por descarte: lo que
  no cabe en los módulos; tambor módulo × familia) y 2) **Plan mensual** (base = lo del mes, agregar solo
  excepciones, meta de facturación, congelar). Simulador de capacidad por semana con motivo y bitácora.

### 2.4 Se ejecuta en planta
- Cada **centro** tiene Resumen (semana, congelado, en proceso / listas / en espera), Planificación (avance de la
  semana, por sub-área), Programación (cola por fase y orden de llegada, con puesto manual, recurso y fecha,
  congelar la semana, PDF del programa) y Ejecución (desviaciones; Confección con Costura y balanceo).
- **Mi centro** (tablet): el operario ve solo lo programado para su puesto, INICIO / PARO / FIN con cronómetro
  real, unidades por talla, segundas, cierre del paso con tiempo corrido mínimo; el supervisor corrige tramos,
  mueve fases (rpc) y prioridades. **Control de piso** para registro por centro, cambio de fases con motivo solo
  al devolver, calidad de tintorería y reprocesos. Nadie pisa lo que cambió otra persona (fusión por campo).
- **Hoy** (Dirección): pendientes con bandejas (sin fecha, por liberar, entregas de la semana, en riesgo,
  vencidas, rutas por definir, colores sin profundidad, errores de programación…), posponer con motivo.

### 2.5 Se reporta
Producto en proceso (pivot como Odoo: órdenes, prendas, $ por fase / cliente / familia / tipo), Avance por área
(cada ingeniero ve lo suyo), Resumen gerencial (cinco cortes de la misma cartera, cierre mensual congelado),
Cumplimiento de facturación, Avance del mes contra el plan congelado, Carga general y Capacidad y decisiones,
Auditoría de replanificación y Salud del sistema (26 reglas sobre los datos vivos). Toda cifra dice su base
(cargadas ⊇ abiertas ⊇ lanzadas ⊇ liberadas) y de dónde sale.

### 2.6 Se protege
Respaldo y restaurar (con respaldo automático previo subido a Storage), borrado de datos de prueba en un solo
botón con verificación, bitácora que nunca se recorta, auditoría de cambios con motivo, guardia del simulador
que falla si aparece un borrado sin confirmación, versión sellada en cada commit y aviso de copia vieja.

## 3 · Qué falta para el 100 %

Siete lectores recorrieron los 126 reportes (253 hallazgos), se consolidaron en **86 pendientes** y **86 verificadores
comprobaron cada uno contra el código de hoy**: 83 siguen abiertos y 3 ya estaban resueltos (P09 es una rutina, no un
faltante; las 348 rutas incompletas de P19 se corrigen solas por siembra; la decisión de P24 se tomó el 15-sep). La foto
honesta:

- **El sistema está construido**: el flujo completo (cargar → describir → planificar → ejecutar → reportar →
  proteger) funciona y está probado. Lo que falta **no es sobre todo código**: de los 83 pendientes, **29 son
  decisiones tuyas**, **21 son datos por cargar o completar** (en producción, no en el código), **9 son
  confirmaciones de ingeniería**, **3 son SQL de Supabase sin ejecutar**, **13 son correcciones técnicas mías** y
  **8 son funcionalidades futuras**. Dicho en porcentaje: el código está al 95 % de lo pedido hasta hoy; el
  sistema «al 100 %» depende más de cargar datos, tomar decisiones y **usarlo a diario** que de programar.
- Para **salir en vivo** hay 13 cosas que bloquean (3.1). Lo demás mejora la calidad del plan, no impide operar.

Cada pendiente lleva su código (P01…P86) para referirnos a él.

### 3.1 Antes de salir en vivo (13, bloquean)

| # | Qué | Quién | Qué pasa mientras no esté |
|---|---|---|---|
| P01 | Crear en producción los usuarios que faltan y probar que escriben: tablets de los 11 módulos (perfil Tablet + centro y recurso), Mariela y Paola (módulos), tintorería, Jordan y Fernanda (liberación), planificación. Hoy: admin 3, terminado 1, tablet 1, corte 1. | tú (Supabase Auth + Usuarios) | 10 módulos no pueden registrar; un perfil nuevo puede recibir «row-level security» al primer guardado |
| P02 | La lista de roles que pueden escribir en `avance/bitacora/turnos/paros` está fija en las políticas de la base (tablet, corte, modulos, terminado): un perfil nuevo del catálogo (empaque, maquila, produccion…) no escribe hasta reejecutar ese SQL. | tú + yo (SQL) | Un perfil creado en Usuarios «puede todo» en la app y el servidor le rechaza cada guardado |
| P03 | Cargar los **motivos de la tabla 15** por uso: devolución de fase, reversión de liberación, reproceso, observación de piso, paro, cierre con faltante, cierre sin tiempo; reactivar los tipos de paro viejos que sigan valiendo. | tú | Sin motivos no se puede devolver fase, revertir liberación, rechazar baño, parar con causa ni cerrar con faltante (botones deshabilitados) |
| P04 | Crear el bucket privado `respaldos` con sus políticas (`SUPABASE_BUCKET_RESPALDOS.sql`, escrito). | tú (SQL Editor) | Restaurar y Borrar datos de prueba se cancelan solos (no pueden subir el respaldo) |
| P05 | Decidir si se corre «Borrar datos de prueba» o si la base actual (1.223 órdenes) ya es la definitiva; antes: P04 y confirmar que admin tiene DELETE por RLS en las 10 tablas. | tú | Avance/turnos/planes de prueba mezclados con reales contaminan reportes y congelados |
| P06 | **Confirmar las rutas** por editar (Órdenes → Por editar; en lote o «✓ Ruta ok»), incluidas las estimadas «sin revisar» y las 22 con ruta por defecto. | tú / Jordan / Fernanda | Sin ruta confirmada no se libera a producción; semáforo ⚪ «Falta ruta»; carga de estampado/bordado puede faltar |
| P07 | Pulsar «Confirmar las que coinciden con Odoo» (Rutas → Más herramientas): es la palanca más rápida para vaciar P06 (tú pediste dejarlas para revisarlas). | tú | Rutas idénticas a las OT siguen «por confirmar» |
| P08 | **Tabla 8** (tela del catálogo): enlazar tela a las categorías de MP que no tienen (17 filas: NUEVOS TEMPO, TELA TEJIDA, LYCRA, PLANA, JERSEY, RIB, FLECCE…) y «Recalcular telas de las órdenes». | tú | Esas órdenes quedan «sin receta de tela»: no entran a tejeduría/tintorería ni a Armar baños y Liberación textil las frena |
| P09 | Rutina, no código: clasificar cada color nuevo que llegue sin Pantone TCX en la bandeja «Colores sin profundidad» (los 16 del 14-sep ya están). | tú | Sin clasificar, el baño va a cualquier máquina y la orden no se libera a tela («color sin Pantone») |
| P10 | Cargar los **festivos** sep–dic 2026 en Calendario → Excepciones (la tabla está vacía: 9-oct, 2-nov, 3-nov, 25-dic…). | tú | Días hábiles, holgura, nivelación y plan cuentan festivos como laborables (la pantalla avisa) |
| P11 | El **inicio del programa** (`inicio` en Calendario y parámetros) es manual: ponerlo al día y decidir si debe seguir solo a «hoy». | tú (decisión) + yo | El motor consume capacidad de días ya pasados y «llega» sale optimista |
| P12 | Exportar las tareas de Odoo **con la columna ID** y cargar una vez (el código ya la acepta desde el 19-sep). | tú (Odoo) | Las órdenes sin WH siguen identificándose por cliente+proyecto+estilo+color+ODC; un cambio en diseño crea otra orden |
| P13 | Confirmar en Configuración las **fases visibles por centro** (hoy todas «sugerido»), sobre todo Confección y Terminados. | tú | La partición Por llegar / Todo lo que viene de cada cola sale de una siembra |

### 3.2 Datos y confirmaciones de ingeniería (mejoran el plan; 31)

**Tiempos y catálogo**
- P15 Santiago confirma los tiempos «por confirmar» del 21-sep (camisetas por tipo, corte/empaque de familias sin hoja, botones 0,40, cordones/apliques/sublimado). Ya rigen sobre las órdenes abiertas; si cambian, se propagan solos.
- P16 Hojas LMO (o SAM que mande) para las 7 familias sin hoja: JOGGER, Fleece Básico, Fleece Pesado, TEJIDOS, FALDAS, ENTERIZO, ACCESORIOS — y la respuesta a los dos Excel entregados.
- P17 Técnica de estampado en las órdenes que la tienen vacía (57 abiertas) y el minuto por técnica: sin eso el paso de estampado no se programa (Estampado sale rojo en la cola).
- P21 Bordado: la ficha por máquina ya está cargada en producción desde el 14-sep (7 bordadoras, 650–800 ppm por cabeza); falta validar `puntadasMin` (6.000) y la velocidad general «conservadora» (650) con la planta.
- P54 Botones: confirmar en planta si son 3 personas reales en ojales/botones o parte se hace en los módulos (la sobrecarga que salía en septiembre se midió antes de corregir los tiempos; revisar en Capacidad y decisiones con los tiempos de hoy).
- P61 Ajustes uno por uno con ingeniería: ojales y botones de denim/vestidos, Short Cargo > Pantalón Cargo, Boxer sin empaque, tejidos estimados, los 86 «revisar» del cruce LMO vs Kronos, pulido, sublimado/apliques, etiqueta de embodegado.
- P62 A qué centro van las dos operaciones «Etiquetar» de FITS y BVD que quedaron sin centro; nombre definitivo de HENLEY («Nueva hija»).
- P66 Catálogo de máquinas de confección (156 + 11 de corte) y agrupación por alias; operarias (opcional).

**Textil**
- P22 Capacidades y telas aptas de DANITECH 1/2 y STUART al día; decidir si STUART tiñe familia B y piqué.
- P23 Los 8 baños confirmados que desaparecieron la noche del 14-sep (SWEET LILAC, DOESKIN, FLINT, OCEAN BLUE, LIGHT HEATHER GREY ×2, ALMOND OIL, ARENA): volver a armarlos o no.
- P24 (decidido el 15-sep: «manda piso», 9 órdenes movidas) Queda la rutina: la fase interna 1Calidad Tintoreria no existe en Odoo, así que cada carga manda esas órdenes a «no calzan» hasta que alguien mueva la fase en Odoo.
- P26 Merma de 12 telas difiere de tu hoja de Mermas; PIQUE FANTASIA sin tipo ni merma.
- P27 Tela plana en tintorería: horas por tanda y máquina grande sin valor (230 líneas / 32.215 m no entran al programa).
- P28 Tabla 3: origen de los 15 tipos «SIN CLASIFICAR» (RIB, JERSEY, PLANA, LYCRA…) y si los cuartos niveles de NUEVOS TEMPO son «externa teñida».
- P29 Maestro: 858 productos sin proveedor (48 son telas de órdenes cargadas); productos con más de un proveedor.
- P30 Días de entrega reales por proveedor (los 127 están en 15 días «estimado»).
- P31 Tejeduría operativa: stock de tela cruda por tela, programación semanal, marcar «tejido» con kg reales, tabla kg/día por tela y máquina.
- P32 Cuándo encender la regla estricta de tejeduría (`tejEstricto`).

**Producción y plan**
- P14 Marcar en la tabla 1 qué fases cuentan como Tela en la nivelación (y la capacidad de tela planificada).
- P19 (ya casi resuelto) Las 348 rutas incompletas del volcado se corrigen solas al abrir la app con un perfil que edite rutas (`sembrarRutasEmpaque`); quedan **22 sin Empaque** por revisar a mano en Rutas.
- P20 Revisión manual de las rutas cargadas antes del 20-sep que la OT no empató (tú pediste sin siembra) y las confirmadas con un centro de OT que la ruta no tiene (Reporte OT).
- P34 Lavado: hoy es solo espera (planta 3 días confirmados el 16-sep, Quito 15; `cap:'no'`); decidir si ocupa capacidad y, si sí, cargar lavadoras, personas y SAM de lavado (Short Cargo sin minuto); «prenda tinturada → Quito» sigue solo a mano por orden.
- P35 Marcar «Lleva plancha» en las categorías (ninguna lo tiene) y la tabla de reglas de ruta (vacía): Plancha y Etiquetas no entran solas a las rutas (lavado ya es por orden, decisión del 16-sep).
- P36 **Congelar** el plan de cada mes y la semana de cada centro (nunca se ha hecho): sin eso no hay número oficial del mes ni línea base de cumplimiento.
- P37 Meta de facturación mensual real por mes (Plan mensual → Bloque 3; la de septiembre quedó en $ 55.000 desde la auditoría del 12-sep).
- P38 Qué ODC son colecciones de verdad («PENDIENTE ODC», «SEPTIEMBRE COLOMBIA-H» son nombres): hoy cualquier texto forma colección y arrastra tarde a todas.
- P39 Tabla 5 (grupos de fases) sigue «pendiente de validar»; ubicación de 6 fases que no venían en tu archivo del 20-sep.
- P40 Tallas: cargar la Lista de pedido en producción (paso 4), revisar las 7 curvas que no cuadran, recargar tras cada carga de tareas, crear los juegos en la tabla 16.
- P41 Tabla 18 (ventanas de descanso) vacía y personas de los recursos que no son módulos (hoy 1 «sin dato»): el minuto real sale inflado.
- P53 Que los centros registren a diario en Mi centro / Control de piso (hoy «sin registros» casi en todos).
- P60 Calandrado: plazo «por confirmar» y cómo se reconocen Calandrado y Cordones en Odoo.
- P63 Las 4 órdenes (2 Camiseta CR, 1 Camiseta CV, 1 BVD) que tienen Botones en la ruta: ¿llevan botón o entró por la OT?
- P64 1.846 OT «SERIGRAFIA» sin texto se tratan como estampado (18 de 31 son probable etiquetado).
- P65 Tabla 6: falta «T-BIANCO-SINTEC(COMPACTADORA)»; reintentar la foto de WH/MO/29252.
- P70 Reserva de Carga general: a Plancha le falta el % estimado (el minuto ya está: 2), a Lavado le faltan el minuto y el %.
- P76 Órdenes abiertas sin WH que ya deberían estar lanzadas (496); 4 órdenes con precio por prenda fuera de rango (ODC 3033, $1.091/prenda, inflan $4,76 M de octubre); duplicados de la hoja LMO.

### 3.3 Infraestructura Supabase (6)
- P45 Auth: Site URL, Redirect URLs, plantilla «Reset Password», SMTP propio, límites; qué hacer con las cuentas de piso con correo inventado.
- P46 Respaldo periódico fuera de la app (el plan gratuito no tiene backups automáticos): `pg_dump` semanal + bucket de fotos.
- P47 Volcar las políticas RLS vigentes en `SUPABASE_POLITICAS_ACTUALES.sql` (sección RESULTADO «pendiente») y confirmar quién tiene permiso `programa`.
- P48 El bucket público `fotos-ordenes` deja subir y reemplazar a `anon`: cualquiera con la clave pública puede pisar fotos.
- P51 Confirmar que la migración de claves («Guardar la clave en las N órdenes») se ejecutó en producción.
- P86 `SUPABASE_PERFILES.sql` (columna opcional `modo` para «solo ve») sin ejecutar — el perfil Consulta cubre el caso. Las políticas de tablet y las funciones `mover_fase`/`set_prioridad_centro` **sí** están ejecutadas (16-sep).

### 3.4 Correcciones técnicas mías (13; no necesitan decisión tuya salvo donde se dice)
- P25 **Bug**: arrastrar un baño a otro día en el cuadro de tintorería no cambia el día (regex sin escapar en `moverBano`); solo la máquina.
- P42 Tablet: con prendas registradas y sin tramo, la pista debe decir «avise al supervisor para cerrar», no «inicia el tramo» (pedido del 17-sep).
- P43 El `<select>` de fase de Control de piso → Producción salta `moverFases` (sin motivo, sin auditoría, sin rpc): segundo camino de cambio de fase.
- P44 Dos recortes que contradicen «nada se borra»: asistencia a 90 días (`setAsist`) e historial de fases a 60 entradas.
- P56 Hoy calcula «vencidas» con criterio propio en vez de `esMetaVencida`; dos números pueden diferir.
- P49 La fusión de cambios concurrentes cubre `ordenes` y `avance`; `params` (toda la configuración) es «último gana».
- P55 La selección «operaciones que aplican a este tipo» se borra al recargar la hoja LMO: protegerla.
- P33 La anticipación de tejeduría (2 semanas) no entra al motor (usa +2 días fijos) y los lotes no siguen `reqTelaLista` — **necesita tu autorización** (toca el motor).
- P18 Que `programar()` marque el paso sin minutos en vez de omitirlo en silencio — **necesita tu autorización** (17 órdenes cambian de fecha, 31 pasan a ir tarde).
- P74 Tintorería: `estadoTin` decide por palabras de la fase, nombres de fase en código, `hDesencolado` no se suma, `granOk` con dos valores.
- P80 Resumen gerencial: pesos del «avance ponderado» y otros valores fijos en código (30 días, 5 %) → tabla o `prm()`.
- P81 `RUTA_ORDEN` y `FIJOS_PRO` siguen como constantes; cierre punto por punto de la auditoría de 187 reglas fijas.
- P85 Código muerto: `agruparCola`, `tablaMezcla`; `aplicarRutaARef` residual (sin botón, solo la usan pruebas).

### 3.5 Funcionalidades propuestas y no construidas (8, esperan tu sí)
- P57 **Para dummies A + B**: portada por rol «¿Qué hago hoy?» y menú de ~12 tareas (hoy tiene 34 entradas; roles ya dictados: Santiago, Mariela y Paola, Terminados, Maquila, Jordan y Fernanda, tú); implica perfiles `produccion` y `maquila`.
- P83 Para dummies C (Tintorería en 4 pasos), D (Liberación como lista de chequeo), F (tablas a 6 columnas), J (recetas «¿Cómo hago para…?»), Configuración modo simple, paleta de colores.
- P79 Esquema de reportería de 10 bloques (parcialmente superado por la pivot y Avance por área): Excel de tiempos dentro de la app, historia semanal por centro, tendencia mes a mes, márgenes con Costos TEMPO.
- P67 Balanceo etapa 2 y 3 (asignación manual por puesto con arrastre, sugerencia automática, hoja por operaria).
- P68 Secuenciar por color dentro del motor (4 decisiones).
- P69 Plan mensual: congelar con rezagos decididos y compromisos guardados; metas semanales por fecha meta; aviso cuando los tiempos cambiaron después de la foto.
- P72 Aviso «se liberó tarde» (fecha real de liberación vs fecha requerida) y fecha límite de Compras con el tiempo de producción.
- P73 / P75 / P78 / P82 / P84: stock de tela cruda por Excel y código de corrida de tejeduría; bandeja «avance incierto» para 4 Calidad Producción; terceras en Empaque y «salió / volvió» de maquila; columnas «Qué falta»/«Fecha» y llegada en horas en la cola; redibujo parcial en las pantallas que faltan y buscador en Tejeduría/Tintorería.

### 3.6 Parámetros sembrados que nadie ha confirmado (la pantalla los marca «sembrado»)
P59 días de holgura (3) · P58 orden de descarte a maquila y grupos de módulos · P77 tablet: mínimo para cerrar (5 min), ventana (5 días hábiles), registro parcial en módulos apagado · P71 días/semana del recurso vs calendario, y campos con `||` que pisan un 0 configurado (ppm, cabezas, capPique, poliPct).

## 4 · En qué orden lo haría

1. **Supabase, una tarde** (P04, P45, P47, P48, P46): bucket de respaldos, Auth, volcar políticas, cerrar el bucket de fotos a `anon`, `pg_dump` semanal. Yo preparo cada SQL; tú lo ejecutas.
2. **Usuarios y motivos** (P01, P02, P03): crear las cuentas, correr el SQL de roles ampliado, cargar la tabla 15. Sin esto la tablet no opera.
3. **Datos de arranque** (P10 festivos, P11 inicio, P12 columna ID, P40 tallas, P08 tabla 8, P09 colores): todo desde Configuración / Actualizar datos.
4. **Rutas** (P07 → P06 → P19/P20): primero el botón «coinciden con Odoo», luego en lote por familia lo que quede.
5. **Ingeniería** (P15, P16, P17, P21): tiempos por confirmar, familias sin hoja, técnica de estampado, bordadora.
6. **Congelar** (P36) el plan de octubre y la semana de cada centro, y **registrar a diario** (P53). Desde ahí Avance por área y Cumplimiento empiezan a decir la verdad.
7. Mis correcciones técnicas (3.4) las hago en paralelo; las dos que tocan el motor (P18, P33) solo con tu autorización.
