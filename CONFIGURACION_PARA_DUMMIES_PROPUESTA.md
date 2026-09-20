# Configuración «para Dummies» — propuesta para tachar (20-sep-2026)

**Estado: propuesta. No se construyó nada.** Este documento es para que lo leas y taches (o marques ☐ → ☑)
lo que no te convenza. Sigue el patrón ya aprobado el 19-sep (`UX_PARA_DUMMIES_PROPUESTA.md`,
`DUMMIES_1_CABECERA_PALABRAS_SEMAFORO.md`): el «?» en el título en vez de párrafos, botón «Filtrar», palabras
de planta, un recuadro por pantalla, nada de bloques encadenados. **Entregas no se toca.**

Lo que sale de aquí se hizo con tres diseños independientes y tres jueces (uno con tu ojo de usuaria, uno con el
ojo de un supervisor que casi nunca entra a Configuración, uno con el ojo del que mantiene el código). Dos de los
tres jueces eligieron el mismo diseño; el tercero eligió otro por muy poco. Abajo va el ganador con los injertos
de los otros dos que los tres pidieron.

---

## 1 · Qué tiene Configuración hoy

Se inventarió TODO lo que hay detrás del menú Configuración (las siete pestañas de «Centros y recursos» más
Categorías, Operaciones y Usuarios): **335 renglones de inventario**, que después de descontar los que aparecen
en dos pestañas (horas de baño, velocidad de bordado, motivos de reproceso, columna Nivelación de la tabla 1…)
son **unos 295 elementos distintos** entre paneles, columnas, botones, notas y parámetros.

| Cómo se reparten (aprox.) | Cuántos | Ejemplos |
|---|---|---|
| **Se tocan cada día o cada semana** | ~40 (14 %) | personas por módulo, máquina en uso, colores nuevos sin clasificar, feriados y días extra, «El programa empieza el», kg que entran en una tina, registro de cargas, minutos estimados de un producto |
| **Se tocan una vez (siembra) o rara vez** | ~165 (56 %) | fases de Odoo, etapas, centros de trabajo de Odoo, familia de baño de cada tela, % de llenado de tina, esperas de lavado, motivos, tallas, descansos, mapeo del Excel de operaciones |
| **Solo diagnóstico o texto** (notas al pie, tooltips, avisos, columnas de solo lectura, migraciones ya corridas) | ~90 (30 %) | «PASO 7», «BLOQUES A, B, E», «Fuente: 57 códigos», DENIM/JEANS unificado, Clave única, «Kg/día» de tejeduría (muestra horas), «Días/sem (propio 6)», marca PENDIENTE DE VALIDAR (nadie la siembra) |

**Con texto técnico o de cuaderno de desarrollo** (nombres de sistema, siglas, claves internas, referencias a etapas
del proyecto): **más de 60 rótulos** a la vista. Los más repetidos: «Recursos», «Ítem de planificación», «Parte 2»,
«tabla 1 / 8 / 10 / 14 / 15 / 17 / 18», «LMO», «TCX», «Familia A / B / IND», «Efic. %», «Kg cap. reducida»,
«mrp.workorder», «alias que llegan de la hoja», «nivelMinEsp», «labDiaGeneral», «capDia», «(enc)», «sl_ / prev_».

**Los diez problemas de fondo que encontró el inventario** (los nombres de función son para el que construye;
tú solo necesitas la frase en negrita):

1. **La misma decisión vive en dos o tres pestañas sin enlace.** Tintorería: familia de baño y cupo reducido en
   Telas; cupo/colores/telas aptas de cada tina en Centros; horas y % de llenado en Calendario. Merma: «Encogimiento»
   en Telas y «merma» en la tabla 10. «Por días» del centro y la tabla de esperas hablan de lo mismo y **la casilla
   no manda** sin decirlo. Las 11 etapas de la planta están en tres tablas con tres nombres (grupo del sistema /
   grupo / etapa). Motivos de reproceso aparece dos veces en la misma pestaña.
2. **«Profundidad» del panel Colores no clasifica de verdad.** Elegir «Medio» ahí no pone la marca que el motor
   exige (`profConf`); solo la bandeja de Tintorería lo hace bien. Y los colores que entran de Odoo sin Pantone se ven
   como «Claro (11)» por defecto del navegador aunque estén SIN clasificar.
3. **Números que mienten o rellenan en silencio**: «Kg/día» de tejeduras muestra horas; una tejedora nueva teje
   «todas» las telas a 10 kg/h; una técnica nueva vale 1 minuto; una bordadora sin cabezas vale 1; una tela nueva nace
   con 8 % de merma; un color sin clasificar usa las horas de «medio»; «Tejer con N semanas de anticipación» se ve
   vacío pero usa 2; `diasTela` en 0 vuelve a 10; kilos mínimos de baño (granMin/granOk) tienen campo en ninguna
   parte y respaldos en el código (120/170/180) distintos de la semilla (140/180).
4. **Cosas que el sistema lee y nadie puede editar**: «En uso» de un centro (`c.activo`), la polivalencia de los
   módulos (la Nivelación manda a cargarla «en Centros y recursos» y ahí no hay editor), `semCarga` (Carga general
   manda a un campo que no existe), tope de horas del tramo, tolerancia del semáforo SAM, filas del Resumen.
5. **Cosas que se editan y nadie lee**: «Costos para valorar decisiones» (siete campos de dinero; `costoMin` no se
   llama), «Parámetros por tela» (tabla 9), «Carry over», «Grupos de módulos» (solo los lee el simulador de pruebas),
   columna «Provisional» de técnicas, campo `des` de telas, `hDesencolado`.
6. **Siembras escondidas dentro del dibujo de una celda**: `sembrarRutaDefecto` corre dentro de la casilla «va por
   defecto» de la tabla Centros y arrastra tres siembras más; `sembrarTiposMaq` corre cada vez que se dibuja Tipos de
   máquina; `sembrarDiasProveedor` y `aplicarTiemposBotones` al dibujar Parte 2. Si el panel se pliega, la siembra
   deja de correr.
7. **Casi nada deja bitácora**: cambiar la familia de baño de una tela, un kg/día de tejeduría, el SAM de una
   técnica, apagar la bordadora grande o el Pantone de un color mueve el programa entero y no queda quién ni cuándo.
   `setParam` escribe «Parámetro pctBueno: 90 → 85» (la clave técnica) y no revisa perfil.
8. **«El programa empieza el» (Inicio) no avanza sola** y está enterrada entre 26 campos: si queda vieja todo sale
   atrasado sin aviso.
9. **Cargas disfrazadas de configuración**: Cargar pedido por tallas, Cargar maestro de productos, Cargar facturas,
   Recalcular telas, Registro de cargas y Alcance de las cargas viven en «Órdenes y materiales (Parte 2)» y no en
   «Actualizar datos».
10. **La ficha de un producto está partida en dos páginas**: consumo, módulos y lavado/plancha en Categorías;
    tiempos, hoja de Odoo, minuto estimado y etiqueta en Operaciones. La lista de Categorías no dice si un producto
    tiene tiempos.

Y un hallazgo que cambia la respuesta a tu pregunta de la nivelación: **lo que pediste ya está construido desde
esta mañana** (commit `9dfd685`, Dirección → Planificar el mes). Va aparte en la sección 8.

---

## 2 · El diseño elegido y por qué

### Ganador: «Configuración en cajones» (frecuencia primero) con los injertos de los otros dos

**La regla es una sola: la frecuencia decide dónde vive cada cosa, no la tabla del código.**

- **Mi planta** = lo que tocas cada semana. Arriba, grande, agrupado por parte de la fábrica.
- **Reglas** = lo que se afina rara vez. Tarjetas plegadas, una abierta a la vez, cada una con su «?».
- **Productos y tiempos** = Categorías + Operaciones fundidas en una ficha por producto (permiso propio).
- **Personas y permisos** = Usuarios.
- **Administrador** = lo que se hizo una vez y no debería volver a tocarse (copia de seguridad, vaciar, migraciones,
  «cambios que el sistema hizo solo», lo que todavía no está conectado).

**Por qué este y no los otros dos:**

| Diseño | Qué tenía de bueno | Por qué no ganó |
|---|---|---|
| 1 · «Siete preguntas» (una pantalla por pregunta) | El mejor lenguaje: «¿Cuánta gente y qué máquinas tengo?», «¿Cómo se tiñe cada color?». Bitácora con el rótulo que viste en pantalla. Medir antes de retirar cada relleno del código. | Pasa el menú de 4 a 10 entradas (contra el menú corto ya aprobado). Es el más caro (10 pasos, 8 páginas nuevas). Guarda los «días» en un escenario y no en el calendario: contradice «manda el calendario del mes» y lo que ya se publicó hoy. |
| 2 · «Tres cajones» (Mi planta · Ajustes · Administrador) | La frecuencia como brújula: un supervisor sabe que solo va a Mi planta. Cada afirmación técnica se sostiene en el código. Único que vio el hueco real vigente (la nivelación no cuenta un sábado marcado solo para Producción). Nada se renombra por dentro (claves, ids, funciones). | «Ajustes» es nombre genérico y trae 14 tarjetas en una página; Productos y tiempos con otro permiso metido dentro de una página de permiso config. |
| 3 · «Mi planta + interruptor Avanzado» | El más barato (mismas 4 entradas, una sola página con secciones que se abren de a una). La regla de oro: **una sección con dato faltante muestra el contador, se abre sola y ningún interruptor la esconde**. | «Cómo leemos Odoo» y «Reglas del programa» dentro de Mi planta siguen siendo la pared de siempre, solo que plegada. Mismo error de los «días» al escenario. |

**Injertos obligatorios (los pidieron los tres jueces):**

- Del 3: la regla «**lo que falta no se esconde**» (contador en el título, se abre sola, ni «Avanzado» ni el plegado
  la tapan); **Productos y tiempos** como entrada propia con su permiso; **Respaldo/Restaurar siguen también en la
  cabecera** durante la transición; el interruptor **«Avanzado» por usuario** (misma mecánica que «Filtrar») para lo
  de ingeniería que queda dentro de Mi planta; «Desactivar»/«Dar de baja» entran en la lista GUARDIA; no migrar las
  claves espejo (`c.puntMin ↔ puntadasMin`, `r.telas ↔ r.kgTela`) en esta entrega.
- Del 1: las **preguntas de planta como subtítulo y texto del «?»** de cada pestaña y tarjeta (sin multiplicar
  entradas del menú); **bitácora con el rótulo visible** y en `onchange` («Tinas · DANITECH 1 · Kg que entran en un
  baño: 240 → 230»); **una sola marca** «sin confirmar» / «falta dato» en toda Configuración (hoy hay tres: est.,
  PENDIENTE DE VALIDAR, sugerido); «El programa empieza el» arriba y en rojo si está en el pasado; «Nuevo módulo /
  puesto en <este centro>» que crea en la tarjeta abierta; Administrador con «Se borra / Se conserva» en dos columnas
  y tres viñetas; el **PASO 0 que mide contra el volcado real** cuántas filas dependen hoy de cada relleno del código
  antes de retirarlo; alias de pestañas viejas + prueba que recorre los 21 saltos a Configuración.
- Cambio de nombre pedido por el juez-supervisor: «Ajustes» → **«Reglas»**, agrupado en cuatro cabeceras.

---

## 3 · La estructura nueva, pantalla por pantalla

Menú **Configuración**: hoy 4 entradas (Categorías · Operaciones · Centros y recursos · Usuarios) + 7 pestañas
adentro de la tercera → **5 entradas**: **Mi planta · Reglas · Productos y tiempos · Personas y permisos ·
Administrador**. La pestaña «Nivelación» de Configuración desaparece (su contenido se reparte). Las pestañas viejas
quedan como alias para que ningún enlace se rompa.

Formato de las tablas: ☐ para tachar · **Hoy se llama** → **Se llamará** · **Dónde queda** · **Por qué**.

### 3.1 · MI PLANTA (permiso config; planificación lo ve y edita lo que ya podía) — seis pestañas

Cabecera de tres líneas con «?» y un solo «Filtrar». Cada pestaña lleva como subtítulo su pregunta.
Interruptor **«Avanzado»** por usuario: al apagarlo se pliega lo de ingeniería; **nunca pliega una sección con dato
faltante** (contador rojo en el título y se abre sola).

#### Pestaña 1 · «Días que trabaja la planta» — ¿Qué días trabajamos?

| ☐ | Hoy se llama | Se llamará | Dónde queda | Por qué |
|---|---|---|---|---|
| ☐ | Inicio del programa (uno de 26 campos de «Parámetros») | **El programa empieza el: [fecha]** + aviso rojo «está en el pasado: todo saldrá atrasado» + botón «desde hoy» | Arriba de todo en esta pestaña | Es el campo más peligroso de Configuración y está enterrado |
| ☐ | «Planificar el mes» (calendario clicable, solo en Dirección → Plan mensual) | **Calendario del mes** (el mismo `planMesHTML`, modo «solo días») | Aquí, con selector de mes y de parte de la fábrica; Plan mensual conserva el suyo con enlace «cambiar los días →» | Es el dato que manda (principio 5) y en Configuración solo había un aviso que mandaba para allá |
| ☐ | Tejeduría / Tintorería / Producción · días por semana (regla base del área) | **Semana normal de cada área: lunes a viernes / lunes a sábado / todos los días** | Debajo del calendario, una línea | Es el punto de partida; el calendario manda |
| ☐ | Excepciones (Desde · Hasta · Área · Tipo Sí trabaja / No trabaja · Motivo) | **Feriados, paradas y días extra** (Día extra / No se trabaja), lista filtrada por mes, botón «Cargar feriados del año» | Debajo, plegado | «Excepciones» es palabra de programador; la lista de feriados está vacía y la nivelación avisa «sin festivos cargados» sin enlace aquí |
| ☐ | Aviso amarillo «Manda el calendario del mes… regla base… excepciones son esas mismas marcas» | Al «?» del título | «?» | Un aviso permanente deja de leerse |
| ☐ | «Convención única… labDiaGeneral» (pestaña Nivelación) | «Cómo cuento los días: el día que empiezo cuenta, el de entrega cuenta; no cuento fines de semana ni feriados» | «?» del título | Nombre de función en pantalla |
| ☐ | Columna «Días/sem (base del área) · propio N» + párrafo de 5 líneas (tres tablas de máquinas) | **Se retira** (una línea en el «?»: «Los días salen de Días que trabaja la planta →») | — | Columna de solo lectura que exhibe un campo obsoleto |

#### Pestaña 2 · «Personas y puestos» — ¿Cuánta gente tengo en cada centro?

| ☐ | Hoy se llama | Se llamará | Dónde queda | Por qué |
|---|---|---|---|---|
| ☐ | Panel «Recursos de producción — módulos, mesas, máquinas» (tabla plana) | **Personas y puestos por centro**, agrupado por centro en el orden del menú: Corte · Confección (módulos) · Estampado (pulpos + Etiquetas) · Bordado · Terminados (Botones · Lavado · Plancha · Empaque) | Recuadro principal | «Recursos» es palabra de sistema; hoy módulos, mesa y maquila van mezclados |
| ☐ | Fila «Maquila (externa)» con 20 personas · 480 min · 85 % | **Maquila (taller externo)**: sección propia, casilla «es taller externo», sin personas/minutos; nota «se cuenta por fase en ¿Alcanza la capacidad?; las órdenes se marcan en la cola de Confección» | Debajo de Confección | Una empresa externa aparece como módulo propio y la nivelación la cuenta por fase |
| ☐ | Botón «Agregar recurso» (siempre crea en Corte) | **Nuevo módulo / puesto en <este centro>** | En cada grupo de centro | Hoy hay que crearlo y cambiarle el centro |
| ☐ | Máquina / Centro (select con una sola opción en tej/tin) | **Puesto** (el select de centro solo si hay más de una opción) | Columna 1 | Columna inútil cuando hay una opción |
| ☐ | Personas | **Personas (normal)** + al lado en gris «esta semana: N (ajuste de Planificar el mes del 21-sep)» o «hoy: N (asistencia)» | Columna 2 | Hay tres capas encima (asistencia, ajuste semanal, base) y la tabla no dice cuál manda; es justo tu pregunta |
| ☐ | Min/día (480) | **Horas de jornada por persona** (8 h = 480 min; el dato sigue siendo `r.min`) con nota «descansos → Reglas · Piso; horas extra → Planificar el mes» | Columna 3 | Se pide en minutos sin decir si descuenta almuerzo |
| ☐ | Efic. % | **Eficiencia % (85 = rinde el 85 % de la jornada)** con marca «estimado» hasta que alguien lo confirme | Columna 4 | Abreviatura; todos vienen en 85 sin saber si es medido |
| ☐ | Min efectivos/día | **Capacidad por día = personas × horas × eficiencia** (en minutos y en horas) | Columna 5 | Es el número que luego aparece como «capacidad» en tres pantallas sin que se vea que nace aquí |
| ☐ | Activa (casilla) | **En uso** con «desde» y bitácora; ayuda «para una parada temporal usa Paros» | Columna 6 | Único dato diario mezclado con siembra, sin fecha ni bitácora |
| ☐ | × (borrar recurso) | **Quitar** solo si no tiene historial (tramos, tablets, máquinas, operarias); si lo tiene, **Desactivar** | Última columna | Borrar un módulo deja huérfanos sin aviso |
| ☐ | Tabla Centros (11 columnas: Centro · Área · Cómo se mide el tiempo · va por defecto · Ítem de planificación · Por días · Recursos · SAM · % estimado · Puntadas/min · ×) | **Estructura de los centros** — 4 columnas a la vista: Nombre del centro · Parte de la fábrica (Tejeduría · Tintorería · Producción · Proveedor externo) · Se muestra dentro de (grupo del menú, nota «cambia el menú de Planificación de producción») · **En uso** (casilla NUEVA sobre `c.activo`, que Nivelación, cola y auditoría ya leen). Resto en «más columnas»: Unidad de tiempo (Minutos por prenda · Puntadas por prenda · Prendas por hora; bloqueada con confirmación) · Está en toda ruta de producción · Solo espera (no ocupa planta) **mostrando «hoy manda: tabla de esperas → sí / no / falta decidir»** · Minutos por prenda si no hay hoja de operaciones (con «de dónde sale el tiempo» en cada fila) · % de prendas que pasan por aquí (para reservar capacidad; con «real N %» y quién lo calculó) · Máquinas / módulos (enlace correcto por centro; 0 en rojo) · Etapa de la planta (tabla 4 como columna) | Plegada bajo **Avanzado**, al final de la pestaña | Es siembra de una vez; la mayoría de sus celdas son «—»; «Por días» no manda y no lo dice |
| ☐ | Puntadas/min (columna de la tabla Centros, fila Bordado) | Se muda a la pestaña Bordadoras (ver 5) | — | Es EL dato de bordado y no está con las bordadoras |
| ☐ | × (borrar centro) | **Quitar centro** solo sin máquinas ni historial; si no, **Desactivar** | Estructura | Casi siempre lo que se quiere es apagar |
| ☐ | Nota «Lavado y plancha no salen de las operaciones (PASO 7)… (Categorías → editar)… Bordado se mide en puntadas…» | Al «?»: «¿Por qué lavado, plancha y bordado tienen columnas propias?» | «?» | «PASO 7» es jerga de desarrollo; «Categorías → editar» no existe aquí |
| ☐ | Esperas después de un paso (panel Motor, Calendario) + casilla «Por días» + «¿Ocupa capacidad? sí / no: solo lead time / pendiente» + «Sin regla» | **Días de espera de Lavado (en planta N · en Quito N)** · **¿Usa gente de la planta o solo espera? (sí / solo espera / falta decidir)** · columna **Activa** en vez de «Sin regla» | Fila propia dentro del grupo Lavado (y de cualquier centro con regla); también en Reglas · Cómo se acomodan las fechas | Está dentro del panel del motor, no junto al centro Lavado |
| ☐ | Fila «Lavado en Quito: prenda tinturada — el sistema no sabe qué órdenes son prenda tinturada; dime cómo se identifican» | Bandeja de **Hoy → Pendientes**: «Falta definir cómo se reconoce la prenda tinturada que va a lavar a Quito» | Hoy | Una pregunta a la usuaria vive en la columna Nota de una tabla |
| ☐ | Fases visibles en la cola de cada centro (Calendario y parámetros) | **Qué ve cada centro en su cola (por fase de Odoo)**: una tarjeta plegada por centro, «propuesta / revisada», ▲▼, «Revisar y confirmar» | Plegado al final de esta pestaña (y enlazado desde Reglas · Cola del centro) | Vive en Calendario sin ser calendario ni parámetro |
| ☐ | 18 · Descansos por centro (ventanas) + aviso de 4 líneas sobre «SAM real inflado» | **Horario de almuerzo y refrigerio por centro** con «copiar a todos los centros»; aviso: «faltan los descansos de Corte y Módulos» | Plegado al final de esta pestaña (y en Reglas · Piso) | Es de centros y horarios, no de «Órdenes y materiales» |
| ☐ | Tipos de máquina · Operarias y especialidades · Máquinas de confección + cuadro módulo × tipo · Polivalencia (sin editor) | **Costura y balanceo (ingeniería)**: «Máquinas de costura (catálogo)» (Nombre · También aparece como · Grupo · Operaciones que la usan · Vigente) · «Quién trabaja en cada módulo (opcional)» (un solo «Agregar persona») · «Inventario de máquinas de costura» (con «Cargar desde Excel» con vista previa) · **«Qué familias cose cada módulo»** (editor nuevo sobre `setPoli`, que existe y nadie dibuja) | Bajo **Avanzado**, en la pestaña; enlace desde Balanceo | Son catálogos de ingeniería/balanceo, no planificación diaria; la Nivelación manda a cargar polivalencia «aquí» y no hay editor |

#### Pestaña 3 · «Telas y colores» — ¿Qué telas tejemos y cómo se tiñe cada color?

| ☐ | Hoy se llama | Se llamará | Dónde queda | Por qué |
|---|---|---|---|---|
| ☐ | Panel «Telas» (26 filas en orden de siembra, sin buscador) | **Telas que tejemos y teñimos**, agrupadas por «¿Con qué se mezcla en la tina?» y ordenadas por nombre, con buscador bajo «Filtrar» | Bloque 1 | Jersey 24/1 y Jersey 30/1 quedan lejos; no se ve cuál va sola |
| ☐ | Tela (nombre) | **Nombre (como la llama la planta)** | Columna 1 | El nombre NO es lo que cruza con Odoo |
| ☐ | Familia de baño: Familia A / Familia B / Baño propio (valores A / B / IND) | **¿Con qué se puede mezclar en la tina?**: Grupo jersey / ribb 24/1 · Grupo fleece / french terry · Va sola en su baño (valores internos intactos) | Columna 2 | «Familia A» no dice nada |
| ☐ | Encogimiento % (campo `enc`; bandeja de Hoy dice «(enc)») | **Merma de tintura % (kg que se pierden en la tina)** con nota «si la tela está enlazada, este valor manda sobre la tabla de mermas»; 0 o vacío en rojo «falta» | Columna 3 | La misma merma tiene dos nombres en dos pestañas; la bandeja usa el nombre del campo |
| ☐ | Capacidad reducida (casilla) | **Ocupa cupo reducido en la tina (tipo piqué)** con enlace «ver cupo de cada máquina» | Columna 4 | No dice de qué ni cuánto |
| ☐ | Exclusión de «Plana e importada» por el id fijo `t12` | Casilla **¿La tejemos nosotros?** (en el paso 3; hasta entonces se deja y se dice) | Columna 5 | Otra tela externa aparecería como si se tejiera |
| ☐ | tabla 8 «Tela del catálogo» (otra pestaña) | Columna **Cómo la llama Odoo →** (enlace a la tabla en Reglas; «sin enlazar = no entra al programa») | Columna 6 | Nadie sabe que una tela nueva no sirve hasta enlazarla allá |
| ☐ | (no existe) | **Usada en N órdenes abiertas** | Columna 7 | Para saber si borrar o renombrar rompe algo |
| ☐ | Campo oculto `des` | **Activa** (o se retira de la semilla) | Última columna | Se guarda y nadie lo lee |
| ☐ | Botón «Agregar» (nace «Nueva tela», Baño propio, 8 %) | **Agregar tela**: mini formulario (nombre, grupo, merma, cupo) y aviso «marca en qué tinas se puede teñir» | Título del bloque | Valores inventados por el código sin decirlo |
| ☐ | × (borrar tela): «¿Borrar esta fila de telas?» | **Dar de baja** con aviso «N órdenes abiertas usan esta tela» y opción «inactivar sin borrar» | Última columna | Las órdenes quedan apuntando a un id que no existe |
| ☐ | Nota «Las familias A y B se mezclan… 200 kg en DANITECH en vez de 240» | Al «?», con los números armados en vivo desde las máquinas («hoy: DANITECH 1 240 kg, 200 con piqué») | «?» | Describe la regla vieja de mezcla y escribe 240/200 a mano |
| ☐ | Cuadro «Tinas» (no existe) | **Tinas** solo lectura: «DANITECH 1 · 240 kg (200 con piqué) · solo claros · todas las telas → editar» | Debajo de Telas, enlaza a la pestaña Máquinas de teñir | La mitad de la regla de tintorería está aquí y la otra allá sin enlace |
| ☐ | Panel «Colores» (tabla plana, sin buscador, sin marcar los nuevos) | **Colores y su Pantone** con buscador y filtro «solo con tela esperando baño»; ARRIBA la fila **«Nuevos · sin clasificar (N) → clasificar»** | Bloque 2 | Se llena solo con cada carga y no se distingue un color clasificado de uno recién llegado |
| ☐ | Color (nombre, editable) | **Nombre en Odoo** (solo lectura si vino de una carga; «Cambiar a mano, con motivo» para el nombre mal tipeado) | Columna 1 | Es la llave con que Odoo lo reconoce; renombrar duplica |
| ☐ | Código TCX | **Pantone (ej. 18-3949)** con texto vivo al escribir: «18 → oscuro → DANITECH 2 · 8 h» | Columna 2 | «TCX» es jerga; nadie dice que decide máquina, horas y si la tela externa necesita tintura |
| ☐ | Profundidad: Claro (11) / Medio (12–17) / Oscuro (18–19) / Lavado suavizado | **¿Claro u oscuro?**: Claro → máquina de claros · Medio → cualquiera · Oscuro → máquina de oscuros · **— sin clasificar — (visible)**. En el paso 1 muestra el estado REAL; en el paso 3 pasa a usar `setProfundidadColor` (marca confirmada + permiso + bitácora, como la bandeja de Tintorería) | Columna 3 | Hoy elegir «Medio» aquí no clasifica para el motor |
| ☐ | Lápiz ✎ | **Cambiar a mano** (pide motivo, guarda quién y cuándo) | Junto al select | Ícono sin texto; el Pantone pisa la elección sin avisar |
| ☐ | Marca `profConf` (invisible) | Columna **Quién lo clasificó**: Pantone / nombre y fecha / — | Columna 4 | Dos «Medio» iguales en pantalla pueden ser uno clasificado y otro no |
| ☐ | Horas (calculada; se cambia en otra pestaña) | **Horas en la tina** («—» si no está clasificado) con enlace a Reglas · Tintorería | Columna 5 | Se ve aquí y se cambia allá sin enlace; el «medio» de relleno parece dato |
| ☐ | Muestra de color (solo en Tintorería) | **Muestra** (puntito) | Columna 6 | Se adivina por palabras del nombre y no se ve donde se define |
| ☐ | Opción «Lavado / suavizado» dentro de Profundidad | Casilla **Es un proceso sin tintura (blanqueo / suavizado)** con texto «va a la máquina de claros, N h, primero en el día» | Fila | No es una profundidad |
| ☐ | Color interno «LAVADO DE TELA (proceso interno)» (editable y borrable) | Fila fija **Lavado de tela (proceso, no es un color)** sin ×, con sus horas visibles | Fila fija | El sistema lo vuelve a crear solo; sus horas de «oscuro» son una decisión invisible |
| ☐ | Pegar desde Excel (colores) | **Cargar carta de colores (nombre + Pantone)** con vista previa «N nuevos · N con código actualizado · N sin Pantone»; el «(7 h)» sale del parámetro | Título del bloque | Sin vista previa; crea duplicados por doble espacio; el 7 escrito a mano |
| ☐ | Agregar (color a mano) | Bajo «Más…»: **Agregar color** con formulario que pida ¿claro u oscuro? si no hay Pantone | «Más…» | Los colores entran solos desde Odoo |
| ☐ | × (borrar color) | **Dar de baja**, bloqueado si hay órdenes abiertas con ese color | Última columna | Deja borrar colores en uso |

#### Pestaña 4 · «Máquinas de teñir» — ¿Cuánto cabe en cada tina?

| ☐ | Hoy se llama | Se llamará | Dónde queda | Por qué |
|---|---|---|---|---|
| ☐ | Panel «Máquinas de tintorería» | **Máquinas de teñir** (DANITECH 1, DANITECH 2, STUART) | Recuadro único | Palabra de planta |
| ☐ | Kg/baño | **Kg que entran en un baño** con nota «se considera lleno al 90 % → Reglas · Tintorería» | Columna | Sin unidad de referencia ni enlace al % de llenado |
| ☐ | Kg cap. reducida | **Kg con piqué (0 = no tiñe piqué)** | Columna | Abreviatura críptica; el 0 solo se explica al pie |
| ☐ | Tiñe (Claros y oscuros / Solo claros / Solo oscuros) | **Colores que acepta** (Cualquiera · Solo claros · Solo oscuros); «?»: medio o sin clasificar va a cualquiera | Columna | No dice que es una restricción por profundidad |
| ☐ | Telas aptas (desplegable «6 de 57») | **Telas que puede teñir** mostrando los nombres o «todas»; aviso al crear una tela nueva | Columna | STUART viene con 6 telas por id que ya no coinciden con el catálogo |
| ☐ | Horas/día | **Horas que trabaja al día** («para paradas usa Control de piso → Paros») | Columna | Sin contexto de turnos ni paradas |
| ☐ | Activa | **En uso** con «desde» | Columna | Igual que en producción |
| ☐ | (no existe) | **Última revisión** (fecha y quién, de la bitácora) | Columna | CLAUDE.md señala la capacidad desactualizada como la causa más común de resultados raros en Armar baños |
| ☐ | Nota al pie «Kg cap. reducida es lo que admite…» | Al «?» | «?» | Debería ser el título de la columna |
| ☐ | Párrafo «Un baño corre solo cuando llega al 90 %… (240 → 216, piqué 200 → 180)» (Calendario, con números escritos a mano) | Cuadro vivo **«Cómo se llena una tina hoy»**: «DANITECH 1 · 240 kg (200 con piqué) · corre sola desde 216 kg (90 %) · pide confirmación desde 168 kg (70 %) · se puede pasar hasta 252 kg (5 %) → editar en Reglas» | Debajo de la tabla, solo lectura | Si cambia la capacidad el ejemplo miente |

#### Pestaña 5 · «Tejedoras» — ¿Qué teje cada máquina?

| ☐ | Hoy se llama | Se llamará | Dónde queda | Por qué |
|---|---|---|---|---|
| ☐ | Panel «Máquinas de tejeduría» | **Tejedoras** (C1-ORIZIO, C2-ORIZIO, C3-MAYER, C4-MAYER) | Recuadro único | Palabra de planta |
| ☐ | Kg/hora (promedio, solo lectura) | **Se retira** (o «Kg por hora, promedio solo de referencia») | — | Parece editable; el promedio esconde que cada tela tiene su velocidad |
| ☐ | Kg/día (muestra HORAS: `capDia` de tejeduría devuelve `r.horas`) | **Se retira** (la función NO se toca: el motor la usa así; queda comentario y prueba) | — | Número falso en pantalla |
| ☐ | Horas/día | **Horas que trabaja al día** | Columna | — |
| ☐ | Telas que teje («N telas con kg/día · en pestaña Telas y colores») | **Telas que teje (N) → editar**, que abre AQUÍ la matriz | Columna | Dos pestañas para configurar una máquina |
| ☐ | Panel «Tejeduría: kg/día por máquina y tela» (en Telas y colores; nota «al 80 % de eficiencia en jornada de 24 h») | **Qué teje cada máquina y cuántos kg por día**, con fila por máquina «trabaja N h/día → capacidad real X kg/día», «vacío = no la teje», bitácora al cambiar una celda | Aquí, plegado bajo la tabla | Está bajo «Telas y colores» aunque es capacidad de máquinas; el 24 h / 80 % vive en un comentario del código |
| ☐ | Columna «Prom.» de la matriz | **Se retira** (o «promedio solo de referencia; el programa usa el kg/día de cada tela») | — | Promedio entre telas muy distintas no sirve para decidir |
| ☐ | Nota «El programa elige… Fuente: resumen de tejeduría por código (57 códigos)» | Al «?»: «El programa manda cada tela a la máquina que la termina antes. Las horas por día se ponen arriba.» | «?» | Nota histórica del desarrollador |
| ☐ | Tejeduría: semanas de anticipación (campo vacío en Calendario; el 2 escondido en el código) | **Tejer con __ semanas de anticipación a corte** (sembrado 2 y visible) | Tarjeta chica al pie | Campo vacío con valor oculto (contra «0 se respeta, faltante se reporta») |
| ☐ | Kg/hora genérico `r.kgh` = 10 (invisible; una máquina nueva teje «todas» las telas a 10 kg/h) | Paso 3: se retira el respaldo; bandeja **«Máquina de tejeduría sin kg/día»** | Hoy → Pendientes | Relleno silencioso |

#### Pestaña 6 · «Bordadoras y estampado» — ¿Cuándo una orden pasa por aquí y cuánto rinde cada máquina?

| ☐ | Hoy se llama | Se llamará | Dónde queda | Por qué |
|---|---|---|---|---|
| ☐ | Una tabla de 10 columnas «Máquinas de bordado y estampado» con «Capacidad propia» que cambia por fila | **Dos tablas**: **Bordadoras** y **Máquinas de estampado** | Dos recuadros | Bordado y estampado son procesos distintos con datos distintos |
| ☐ | Puntadas/min (tabla Centros, fila Bordado; espejo en `S.params.puntadasMin`) | **Velocidad general de bordado (puntadas por minuto por cabeza)** ARRIBA de la tabla de bordadoras; a su lado la bandeja «Falta la velocidad de bordado (N órdenes)» (hoy en Tejeduría y Reportería) | Cabecera de Bordadoras | Es EL dato de bordado y no está con las bordadoras; la bandeja está en otras pantallas |
| ☐ | cabezas (apretado dentro de una celda) | **Cabezas (prendas que borda a la vez)**; vacío = «falta dato» (no 1 en silencio, paso 3) | Columna | Nadie dice que multiplica la capacidad |
| ☐ | puntadas/min (placeholder gris con la general) | **Velocidad de esta bordadora** con «vacío = usa la general: 800» y enlace | Columna | No se distingue «tiene 800» de «hereda 800» |
| ☐ | Rinde («N mil puntadas/día» o «N× la técnica») | **Capacidad al día** (bordado: puntadas por día y ≈ prendas; estampado: prendas por hora al estándar); «falta dato» cuando falte | Columna | Dos unidades en una columna; «0 mil puntadas/día» en vez de «falta la velocidad» |
| ☐ | (no existe) | Fila total **«Capacidad del centro: N mil puntadas por día ≈ N prendas de X puntadas»** | Pie de Bordadoras | Es el número del Plan mensual y no se ve de dónde sale |
| ☐ | Chips de técnicas dentro de «Capacidad propia» | **Técnicas que hace** («si no marcas ninguna, las hace todas») | Columna de Estampado | La regla «ninguna = todas» solo está en el código |
| ☐ | estaciones en paralelo | **Prendas a la vez (brazos / estaciones del pulpo)** | Columna | Vacío cuenta como 1 sin avisar |
| ☐ | factor de tiempo (0,4 = tarda el 40 %) | **Rapidez frente al estándar (100 % = igual; 40 % = tarda el 40 %)**, mostrado como %; el dato sigue siendo `vel` | Columna | Un número menor significa más rápido |
| ☐ | Personas · Min/día · Efic. % · Min efectivos · Activa · × | Igual que en Personas y puestos (Personas por turno · Horas · Eficiencia · Capacidad por día · En uso · Quitar/Desactivar) | Columnas | Uniformidad |
| ☐ | Botones «Agregar bordadora» / «Agregar máquina de estampado» (nacen activas con 480 / 85 % / 1 cabeza / «Pulpo nuevo») | **+ Bordadora** / **+ Máquina de estampado** (nacen sin confirmar, con «falta dato» hasta llenar cabezas y velocidad; paso 3) | Títulos | Valores de negocio en el código |
| ☐ | Panel «Técnicas de estampado» (Técnica · SAM · Máquina/nota · Provisional · ×; «Sin técnicas.») | **Técnicas de estampado y su tiempo por prenda**: Nombre (igual que en Odoo) · Minutos por prenda (SAM) «vacío = usa el tiempo de la categoría» · Observación · Quitar (avisa N órdenes). Sin «Provisional». Estado vacío: «Las órdenes cargadas traen estas técnicas: … [crear]» | Debajo de Estampado | «Provisional» nunca se llena; «Máquina/nota» no la lee nadie |
| ☐ | Técnicas de Odoo que no calzan (`tecnicasNoEncontradas`, solo se cuentan) | Bandeja **«Técnicas que vinieron de Odoo y no están aquí»** | Junto a la tabla y en Hoy → Pendientes | Se cuenta, no se muestra |
| ☐ | Regla oculta `centrosPorOrden` (estampado si trae técnica; bordado si trae puntadas) | Recuadro solo lectura **«¿Cuándo una orden pasa por aquí?»**: «Estampado: si trae técnica en Odoo · Bordado: si trae puntadas» + enlace «Etiquetas de serigrafía → Productos y tiempos» | Pie de la pestaña | Es la regla más importante para saber por qué una WH tiene o no bordado y no existe en pantalla |
| ☐ | Dos pies grises con las fórmulas (duplicados) | Un solo «?»: «¿Cómo calcula el programa el tiempo de bordado y estampado?» | «?» | Se leen cuando ya se llenó todo |
| ☐ | Enlace «Recursos» de la tabla Centros para Bordado/Estampado (lleva a Recursos de producción, donde no están) | Enlace directo a esta pestaña | Estructura de los centros | Enlace roto |

### 3.2 · REGLAS (permiso config; lo que mueve el plan también con programa) — cuatro cabeceras, tarjetas plegadas, una abierta a la vez

Cada tarjeta: título en palabras de planta + «?» + contador «N sin revisar» / «N falta dato». Cada campo con
ejemplo vivo en kg tomado de las máquinas de Mi planta, nunca escrito a mano. **Una tarjeta con dato faltante se
abre sola y no se pliega.**

#### Cabecera A · «Cómo se programa»

| ☐ | Hoy se llama | Se llamará | Dónde queda | Por qué |
|---|---|---|---|---|
| ☐ | Panel «Parámetros» (26 campos sueltos en una fila, sin subtítulos) | Se reparte en las tarjetas de abajo | — | Mezcla tintorería, tejeduría, tablet, cola, excedentes y buscadores en el orden en que se agregaron al código |
| ☐ | Baño bueno desde % de capacidad (pctBueno) | **Tintorería · Un baño se programa solo desde __ % de la máquina (DANITECH 1: 240 → 216 kg)** | Tarjeta Tintorería | Jerga interna; ejemplo vivo |
| ☐ | Baño con aprobación desde % (pctAprob) | **Entre __ % y el de arriba, el baño pide tu confirmación** | Tarjeta Tintorería | ¿Aprobación de quién? |
| ☐ | granMin / granOk (SIN campo; semilla 140/180; respaldos en código 120/170/180) | **Kg mínimos para soltar un baño con aprobación: __ kg** y **Una máquina es grande desde __ kg**, expuestos con el valor que HOY usa el cálculo y anotada la diferencia con la semilla | Tarjeta Tintorería | Dos reglas para una decisión: una visible en % y otra oculta en kg (Armar baños usa la oculta) |
| ☐ | Llenado mínimo % (STUART) (umbral) | **Máquina pequeña: llenado mínimo __ %** (la máquina sale de Mi planta) | Tarjeta Tintorería | Nombra una máquina concreta |
| ☐ | Tolerancia chica % / Tolerancia grande % | **Máquina pequeña: se puede pasar hasta __ % (= __ kg)** / **Máquinas grandes: se pueden pasar hasta __ % (240 → __ kg)** | Tarjeta Tintorería | «Chica» y «grande» son tamaños de máquina, no de tolerancia |
| ☐ | Días tintorería → bodega | **Días entre que sale el baño y la tela está en bodega para corte (calendario)** | Tarjeta Tintorería | No dice si son días calendario |
| ☐ | Tintorería: horizonte de baños (días) | **Arma baños con lo que se necesita dentro de __ días; lo más lejano solo para llenar** | Tarjeta Tintorería | Describe el algoritmo, no la decisión |
| ☐ | Tela plana: horas por tanda (vacío) y Tela plana: máquina grande (select separados por otro campo) | **Tela plana: máquina donde se procesa · horas por tanda** juntos, con «falta» si están vacíos | Tarjeta Tintorería | El aviso de que falta aparece en Tintorería, lejos de aquí |
| ☐ | Horas claro · Horas medio · Horas oscuro · Horas lavado · Reproceso (colgados bajo el subtítulo «Costos») | **Horas de máquina por baño según el color: claro __ · medio __ (= color sin clasificar) · oscuro __ · lavado / suavizado de tela __ · reproceso __** | Tarjeta Tintorería; la columna «Horas en la tina» de Colores enlaza aquí | Tres campos sueltos que parecen costos |
| ☐ | Restricciones de faltante (Parte 2) | **Telas que solo van en baño grande** | Tarjeta Tintorería | Regla de tintorería entre tablas de Odoo |
| ☐ | Tejeduría: días mínimos con la misma tela / horas perdidas por cambio de tela | **Tejeduría (estimado automático) · Una máquina se queda con la misma tela al menos __ días · Cambiar de tela cuesta __ horas de máquina**, con nota «solo afecta la corrida que el sistema estima sola; la programación manual no lo usa» | Tarjeta Tejeduría | Parecen reglas de planta y solo alimentan el estimado |
| ☐ | Motor de programación: criterio «Hacia atrás (vigente) / Hacia adelante (el de siempre)» + párrafo de 5 líneas | **Cómo se acomodan las fechas: desde la entrega hacia atrás (recomendado) / lo antes posible**, con aviso «rehace todo el programa» | Tarjeta Cómo se acomodan las fechas, bajo Avanzado | «(el de siempre)» solo lo entiende quien vivió el cambio |
| ☐ | Confección: ventana de color (días, 0 = sin agrupar) | **Juntar en confección órdenes del mismo color si caen a menos de __ días (0 = no juntar)** | Tarjeta Cómo se acomodan las fechas | Nadie sabe qué es una «ventana de color» |
| ☐ | colchonDias (se edita en Carga general) | **Días de holgura para marcar riesgo** (campo aquí; Carga general enlaza) | Tarjeta Cómo se acomodan las fechas | El semáforo ⚠ de la nivelación depende de un número de otra pantalla |
| ☐ | semCarga (SIN campo; Carga general manda a «Configuración → Calendario y parámetros») | **Semanas que muestra Carga general: __** | Tarjeta Cómo se acomodan las fechas | La pantalla manda a un campo que no existe |
| ☐ | Cola del centro: «Por llegar» hasta (días hábiles) | **Mostrar como «por llegar» lo que llega dentro de __ días hábiles** + enlace a «Qué ve cada centro en su cola» | Tarjeta Cola del centro | Hay que conocer los grupos de la cola para entender el campo |
| ☐ | Excedentes: palabra en la ODC / centro del paso final | **Palabras del pedido que indican prenda ya hecha (solo etiquetar)** · **Dónde se etiquetan** | Tarjeta Excedentes | Están entre «Cierre del paso» y «Cola del centro» |

#### Cabecera B · «Cómo leemos Odoo»

| ☐ | Hoy se llama | Se llamará | Dónde queda | Por qué |
|---|---|---|---|---|
| ☐ | Chip «Órdenes y materiales (Parte 2)» + aviso amarillo «Todavía no se ha cargado ningún archivo…» | **Cómo leemos Odoo**; el aviso se reemplaza por la línea viva «Última carga de Odoo: fecha · N fases sin fila · N centros de trabajo sin fila · N filas sin revisar» | Cabecera B | «Parte 2» es una etapa de desarrollo; el aviso es falso en producción |
| ☐ | 5 · Grupos de fase (después de la tabla 1) | **Etapas de la planta, en orden** — ANTES de las fases; columnas «llegar aquí libera tela / corte», «sus centros ya terminaron», «cuenta como en proceso» | Tarjeta Fases | Es la lista que la tabla 1 usa y está después |
| ☐ | 1 · Fase del archivo → fase del sistema (14 columnas, nota «BLOQUES A, B, E — tabla definitiva (v2)») | **Fases de Odoo: qué significa cada una** — 4 columnas a la vista: Fase · **Qué es** (`r.que` como texto al lado del nombre) · **Etapa de la planta** · **Orden** (menor = devolver, igual = a la par); el resto en «más columnas» (con «N más con valor») | Tarjeta Fases | La tabla más importante del sistema y la peor entendida |
| ☐ | es cola · sin carga · bloqueo · excluye (ids con coma) · carga desde · tela · montado · paso extra + «parámetro min/pz» (escribir `minEtiqEmbodegado`) · sin medir · Nivelación | **Esperando al siguiente centro · Ya no ocupa planta · Parada por falta de material · No carga estos centros (casillas por centro) · Empieza a cargar desde la etapa… · Cómo está la tela en esta fase (solo grupo textil) · Cuenta en la macro de tela · Paso corto pendiente: centro + minutos por prenda (un número, no el nombre de un parámetro) · Trabajo sin tiempo medido · Cuenta en ¿Alcanza la capacidad? como… (solo Tela / Maquila)** | «más columnas» | Tooltips como única ayuda; pedir el identificador de un parámetro es lo más técnico de la pestaña |
| ☐ | 6 · Centro de trabajo de Odoo → centro TEMPO (mrp.workorder), 9 columnas | **Centros de trabajo de Odoo → centro de TEMPO**: 3 columnas (Odoo · Centro TEMPO · Módulo) + «más columnas» | Tarjeta Centros de trabajo | «(mrp.workorder)»; casillas que solo se entienden con tooltip |
| ☐ | 7 · Estado de la orden de trabajo → significado (panel de 6 filas) | Lista chica **«Estados de Odoo que cuentan como terminado»** dentro de la tarjeta anterior | Tarjeta Centros de trabajo | Seis filas que nunca cambian ocupan un panel |
| ☐ | 4 · Centro TEMPO → etapa del flujo (nota «BLOQUE E») | Columna **Etapa de la planta** en Estructura de los centros (Mi planta) | Mi planta | Tercer lugar con las mismas 11 etapas |
| ☐ | 2 · Segundo nivel de categoría de material → clasificación (nota «PASO 5», texto libre) | **Materiales de Odoo: qué es tela y qué es insumo** (clasificación como lista cerrada) | Tarjeta Materiales | Estructura interna de Odoo; texto libre que puede no calzar |
| ☐ | 14 · Qué se conserva al recargar la Parte 2 (ids de código: rutaConf, opsSam, histLib…; pie de 12 líneas) + casilla «Sin WH manda Odoo» dentro de una celda | **Al actualizar desde Odoo, esto NO se pisa**: lista en palabras («la ruta confirmada», «las tallas cargadas», «las firmas de liberación»…), las 4 fijas en gris arriba, el pie al «?». Aparte, como frase con su casilla: **Fase de las órdenes que todavía no tienen WH: la manda Odoo (sí / no)** | Tarjeta Qué no se pisa | Identificadores del código a la vista; interruptor importante escondido en una celda |
| ☐ | 8 · Categoría de Odoo → tela corta → tela del catálogo | **Categorías de tela de Odoo → tela del catálogo** (Categoría · Nombre corto · Tela con la que tejemos; «sin enlazar = la tela no entra al programa») | Tarjeta Telas y kilos | «Tela corta» es un nombre de la macro vieja |
| ☐ | 3 · Tercer nivel de MP → origen de tela + Excepciones por cuarto nivel (nota «PASO 6 — decisión pendiente», remite a una bandeja «todavía sin construir») | **Tipos de tela de Odoo: ¿la tejemos o la compramos?** con la línea «si el producto tiene proveedor en el maestro, manda el maestro» | Tarjeta Telas y kilos | Desde el 19-sep el maestro manda y solo lo dice una nota en otra tabla |
| ☐ | 13 · Qué le falta a la tela: por palabras del producto y, si no, por origen (título de 15 palabras) | **¿Hay que tinturar la tela?** en dos bloques: «Por palabra del producto» y «Si no hay palabra, por proveedor» | Tarjeta Telas y kilos | Una clase de teoría, no una pantalla |
| ☐ | 10 · Merma de tintura por tela corta × tipo (0,0845; columna «≠ tabla») | **Merma de tintura de las telas sin catálogo (pendientes de enlazar)**, en %, con «manda: la tela enlazada» | Tarjeta Telas y kilos | La misma merma en dos formatos y con prioridad solo en un comentario |
| ☐ | 11 · Palabras que marcan JASPE (panel entero) | Campo **«Palabras que significan jaspe»** dentro del catálogo de productos | Tarjeta Telas y kilos | Un panel para una lista de una palabra |
| ☐ | Sub-tabla «kg por unidad» (debajo de la tabla 9) | **Peso de cuellos y puños (kg por unidad)** | Tarjeta Telas y kilos | Colgada de una tabla que nadie usa |
| ☐ | Días de entrega por proveedor (primer panel de Parte 2; se siembra a cada render) | **Proveedores de tela: días que tardan en entregar** (siembra sacada del dibujo; contador «N estimados sin confirmar») | Tarjeta Telas y kilos (enlazada desde Compras del mes) | Es de Compras; la lista crece sola sin que se vea por qué |
| ☐ | 12 · Catálogo de productos (11 columnas, 3 de proveedor, «Corregir tipo», buscador suelto) | **Productos y proveedores**: una columna «Proveedor que manda», el resto en «más columnas», por defecto «solo lo que usan las órdenes», buscador bajo «Filtrar»; arriba «N productos sin proveedor → completar» | Tarjeta Telas y kilos | El usuario no sabe cuál proveedor manda |
| ☐ | Botones validar / pendiente de validar en más de 200 filas | Un **«Revisado ✓» por tabla** + contador «N filas sin revisar» en el título (el dato `r.pendiente` no cambia de significado) | Todas las tablas | No cambia nada en ningún cálculo; nadie sabe si tiene que validar |
| ☐ | Botones «+ Fase», «+ Grupo», «+ Categoría», «+ Tela», «+ Fila», «+ Palabra», «+ Centro», «+ Valor», «+ Nivel», «+ Tipo», «+ Excepción», «Agregar» (a veces arriba, a veces abajo) | Siempre **«+ Agregar»** en el mismo lugar | Todas las tablas | Cada tabla nombra el botón distinto |
| ☐ | × en todas las tablas («¿Borrar esta fila de tecnicas?») | **Quitar** con «N órdenes la usan hoy» | Todas las tablas | Borrar una fase deja órdenes sin fila sin avisar |

#### Cabecera C · «Piso»

| ☐ | Hoy se llama | Se llamará | Dónde queda | Por qué |
|---|---|---|---|---|
| ☐ | 15 · Motivos (7 usos en una tabla, 7 botones «+» en el título, columnas que solo aplican a algunos) + panel duplicado «Motivos de reproceso de tintorería» | **Motivos que elige la gente**: una pestañita por uso (Devolver fase · Quitar liberación · Rechazo de baño · Observación de piso · Paros [aquí sí Activo · Almuerzo · Cierre del día] · Cierre con faltante · Cierre sin tiempo), un solo «+ Agregar» en la abierta; el panel duplicado desaparece (mismas filas); el aviso «este uso no tiene motivos → no se puede X» al lado de esa pestañita | Tarjeta Motivos | Dos paneles editan las mismas filas; siete botones en un título |
| ☐ | 16 · Tallas (juegos + «Qué juego usa cada categoría» + botón «Cargar pedido por tallas» + «Última carga…») | **Tallas de cada tipo de producto** solo con los juegos y el juego por categoría («sin definir → la tablet solo verá el total»). «Cargar pedido por tallas» → Actualizar datos | Tarjeta Tallas | Mezcla configuración con una carga que se hace con cada tanda |
| ☐ | Tablet: ventana de lo programado · Cierre del paso: minutos mínimos (+ desplegable por centro con el «general 5» como placeholder) | **Tablet y piso · El operario ve lo programado hasta __ días hábiles adelante · Para marcar Hecho tienen que haber corrido al menos __ minutos · …y si algún centro necesita otro valor (el general escrito fuera del campo)** | Tarjeta Tablet y piso | Palabras del sistema; el efecto se descubre en la tablet sin enlace |
| ☐ | topeHorasTramo (10 h) · tolMinPrenda (15 %) · filasResumenCentro (8) — solo en el código | **Aviso de tramo olvidado a las __ horas · Semáforo del SAM: tolerancia __ % · Filas del Resumen del centro: __** (expuestos con su valor actual como siembra visible) | Tarjeta Tablet y piso | Reglas de planta que no aparecen en ninguna pantalla |
| ☐ | 18 · Descansos por centro | **Horario de almuerzo y refrigerio por centro** (también en Mi planta) | Tarjeta Descansos | — |
| ☐ | 17 · Textos de pantalla (columna «Dónde» con claves grp.fam, busq.placeholder) | **Palabras del sistema** con columna «Se ve en…» (nombre de la pantalla), ampliada con el diccionario aprobado | Tarjeta Palabras | Claves de programador; no cubre las palabras que quieres cambiar |

#### Cabecera D · «Ingeniería» (bajo Avanzado, plegada, con la razón escrita en cada una)

| ☐ | Hoy se llama | Se llamará | Dónde queda | Por qué |
|---|---|---|---|---|
| ☐ | Grupos de módulos (pestaña Nivelación; avisos «familias sin grupo») | **Qué módulos cosen cada familia — no conectado al cálculo** (solo lo lee el simulador de pruebas; queda aquí hasta conectarlo o retirarlo con sus pruebas) | Tarjeta | Sus avisos alarman por algo que no se calcula |
| ☐ | 9 · Parámetros por tela (merma de tejido, gramaje, ancho, kg/m) | **Ficha técnica de la tela — todavía no la usa ningún cálculo** | Tarjeta | `filaParamTela` no tiene llamadores |
| ☐ | Costos para valorar decisiones (7 campos de dinero) | **Costos — pendiente de conectar con Costos TEMPO** (los valores no se borran) | Tarjeta | `costoMin` no se llama; parece que el sistema costea |
| ☐ | Buscadores: espera al escribir (ms) | **Los buscadores esperan __ ms** | Tarjeta | Ajuste de programador delante de la jefa |
| ☐ | Marca «PENDIENTE DE VALIDAR» (nadie la siembra) · hDesencolado (sin campo ni lector) | **Se retiran de la vista y de la semilla** (anotado en el reporte) | — | Código muerto |

### 3.3 · PRODUCTOS Y TIEMPOS (permiso categorias; entrada propia del menú) — Categorías + Operaciones en una

| ☐ | Hoy se llama | Se llamará | Dónde queda | Por qué |
|---|---|---|---|---|
| ☐ | Página «Categorías» (lede + panel DENIM/JEANS primero + tabla de 22 familias / 51 hijas sin buscador, 12 chips de módulos por fila) | **Productos** (familia ▸ tipo, plegado por familia) con buscador bajo «Filtrar» y columnas: Producto · Órdenes abiertas · **SAM por centro** (Corte 3,2 · Confección 12,5 · Empaque 0,8) · **Tiempos** («de Odoo (CAMISETA)» / «estimado 4,57» / «sin tiempos» en rojo) · Módulos que pueden coserla · Pasa por lavado / plancha | Recuadro principal | La lista no dice si un producto tiene tiempos |
| ☐ | Ventana «Categoría padre / hija» (Nombre · Padre · Carry over · Consumo · Lleva lavado/plancha) + ventana «Hoja» en Operaciones + «Categorías sin hoja» + «Etiqueta de serigrafía» + «Tiempos de ojales y botones» (Parte 2) | **Ficha del producto** en cuatro bloques (como la ficha de orden): **Datos** (nombre, familia, Nombre en Odoo) · **Tela** (consumo de referencia, plegado, «solo para órdenes escritas a mano») · **Ruta** (Pasa por lavado / por plancha / igual que la familia; Módulos que pueden coserla con nombres completos) · **Tiempos** (Operaciones de <producto> con «Usar la de la familia» separado de «Vaciar» · Minutos estimados por prenda con fuente · Productos con etiqueta estampada · Minutos por prenda en Botones). Todo con bitácora | Al tocar un producto | La ficha estaba partida en dos páginas |
| ☐ | Carry over (casilla; nadie la lee) | **Producto repetido (solo informativo)** o se retira | Datos | Sugiere un efecto que no existe |
| ☐ | Consumo por prenda (kg) (columna central; solo lo usan órdenes escritas a mano) | **Consumo de referencia por prenda (solo para órdenes escritas a mano)**, plegado bajo «ver más» | Tela | Parece el dato que manda para tejeduría y no lo es |
| ☐ | Botones «Nuevo padre» / «+ hija» (crean la fila ANTES de abrir la ficha) | **Agregar producto** (crea solo al guardar; paso 3). Las filas «Nueva hija» existentes NO se borran (HENLEY es real) | Título | Así nació la «HENLEY / Nueva hija» |
| ☐ | × de categoría («¿Borrar?» y después «no se puede») | **Quitar** deshabilitado con motivo cuando tiene órdenes o hijas | Fila | Avisos en orden inverso |
| ☐ | Página «Operaciones» (6 botones en la cabecera + lede de 4 líneas + catálogo + 4 paneles de diagnóstico + hoja por familia al final) | Pestaña **Operaciones y tiempos**: catálogo con 5 columnas (Operación · Máquina · Paso · Minutos · Productos que la usan) + «más columnas»; UN botón principal **«Cargar la hoja de operaciones de Odoo (reemplaza la actual)»** con vista previa que liste qué ediciones a mano se pierden; **«Más…»**: Cargar el orden de costura · Cómo se lee el Excel de Odoo (el Mapeo, dos pestañas: Familia de operación → centro con la fila «Cualquier otra → Confección» / Nombre en Odoo de cada familia + Productos que usan otra hoja) · Pegar desde Excel (manual) · Agregar una operación a mano (crea al guardar) | Pestaña | Seis botones sin jerarquía; «LMO», «SAM», «hoja» |
| ☐ | Resultado de la última carga LMO (lmoArchivo, lmoFecha, lmoDuplicados, lmoInconsistencias, lmoSinCentro: guardados SIN pantalla) | Línea **«Última carga de operaciones: archivo · fecha · N filas excluidas (ver)»** | Arriba del catálogo | La vista previa promete un «reporte final» que no existe |
| ☐ | Panel «Operaciones sin centro» (siempre visible, borde rojo aunque esté vacío) | **Operaciones sin centro: dime a dónde van** — solo cuando hay alguna, y bandeja en Hoy | Pestaña / Hoy | Se pierde lo asignado al recargar y nadie avisa |
| ☐ | Panel DENIM/JEANS (decisión ya ejecutada) · Tiempos por revisar (con nombres y fechas) · Carga de los tiempos estimados (selector de base) | → **Reportería → Salud del sistema** (solo cuando hay algo; las notas históricas van a bitácora) | Reportería | Diagnósticos de decisiones ya tomadas mezclados con configuración viva |
| ☐ | Familia (dos sentidos: de operación y de producto, en la misma pantalla) | **Familia de operación** siempre con apellido; **familia** a secas = de producto | Textos | Misma palabra, dos cosas |

### 3.4 · PERSONAS Y PERMISOS (permiso usuarios)

| ☐ | Hoy se llama | Se llamará | Dónde queda | Por qué |
|---|---|---|---|---|
| ☐ | «Usuarios y perfiles» con dos tablas grandes y botón «Actualizar» (= releer) | Dos pestañas: **Personas** · **Perfiles**; «Actualizar» → «Volver a leer» | Página | «Actualizar» parece guardar |
| ☐ | Cuentas (Correo · Nombre · Perfil · Permiso · Tablet (centro · recurso) · Contraseña · Perfil viejo) | **Personas**: Correo · Nombre · Perfil · **Centro y módulo de la tablet** (visible solo con perfil Operario de tablet) · **Restablecer contraseña (por correo)**. «Perfil viejo» se retira (solo en la fila afectada); «Permiso (modo)» oculto hasta que exista la columna en Supabase | Pestaña Personas | Columna de migración siempre en «—»; columna que falla con error técnico |
| ☐ | Ventana «Nuevo usuario» (fila que aparece y desaparece; avisos con «disparador», «política», «SUPABASE_PERFILES.sql») | **Nueva persona** en dos pasos: 1 correo y nombre · 2 perfil (si es tablet, centro y módulo) | Pestaña Personas | Avisos técnicos |
| ☐ | Panel «Perfiles» (≈50 casillas por fila: 11 permisos + centros + 30 páginas + textarea + id en gris; nota de 9 líneas sobre RLS y SQL) | **Perfiles como tarjetas**, una por perfil, con tres desplegables: **Qué puede hacer** (11 llaves con verbo de planta y «qué desbloquea») · **Qué centros ve** (agrupado como el menú: Corte · Confección · Estampado · Bordado · Terminados) · **Qué ve en el menú** (mismos grupos y nombres del menú; se retira la casilla «Costura» que ya no existe) · **Trabaja en el piso: Operario / Supervisor** con una sola línea: «solo guarda lo que registra en su centro» | Pestaña Perfiles | 50 casillas por fila |
| ☐ | Nuevo perfil (prompt del navegador; nace sin nada) | **Crear perfil copiando uno existente** | Pestaña Perfiles | Un perfil vacío no ve nada |

### 3.5 · ADMINISTRADOR (permiso config, con candado)

| ☐ | Hoy se llama | Se llamará | Dónde queda | Por qué |
|---|---|---|---|---|
| ☐ | Botones Respaldo / Restaurar de la cabecera | **Copia de seguridad: Descargar una copia / Volver a una copia** (mismas funciones; los botones SIGUEN también en la cabecera para config durante la transición) | Sección 1 | Viven lejos del borrado que los necesita |
| ☐ | Pestaña «Borrado (administrador)» · botón «Borrar datos de prueba (conserva la configuración)…» | **Vaciar todas las órdenes y registros (deja la configuración)** — mismo proceso (palabra BORRAR, copia verificada antes de borrar) | Sección 2 | «datos de prueba» ya no describe lo que hace en producción |
| ☐ | Párrafo de conteos («Hoy hay N órdenes, N con foto, N registros de avance de piso…», 20 cifras) | **Qué se borraría hoy**: tabla de dos columnas (Cosa · Cantidad) | Sección 2 | Nombres internos de tablas en prosa |
| ☐ | Ventana con listas «Se borra» / «Se conserva» (≈30 renglones) | «**Se borra:** las órdenes y todo lo registrado en planta · **Se conserva:** cómo está armada la planta» + «ver detalle» plegado | Ventana | Renglones que la jefa nunca vio en pantalla |
| ☐ | Casilla «conservar el índice de fotos por OP» (desmarcada) | **Guardar las fotos ya enlazadas a cada orden (recomendado)**, marcada por defecto | Ventana | Palabras técnicas; no se entiende por qué desmarcarla |
| ☐ | Texto «Pasos: 1) se espera el guardado… 6) queda en bitácora» + «Cierra las demás sesiones (tablets) antes» al final | **Antes de borrar: 1 Cierra las tablets · 2 El sistema hace una copia · 3 Si la copia falla, no borra nada**; el detalle (Storage, bucket) en el «?» | Ventana | La instrucción que depende de la usuaria está al final |
| ☐ | Avisos «borrado INTERRUMPIDO» / «INCOMPLETO» con rutas y errores de Supabase | **Un borrado quedó a medias — qué hacer** con dos botones: Terminar el borrado · Volver a la copia previa | Sección 2 | Dos avisos parecidos sin decir qué hacer primero |
| ☐ | Desplegable «Último borrado: …» (línea de log) | **Historial de borrados y restauraciones** (fecha · quién · órdenes · copia · «ver detalle») | Sección 3 | Solo muestra el último aunque se guardan todos |
| ☐ | Pantalla final «Base vacía · configuración conservada» (Fases de la tabla 1, Motivos (tabla 15), Parámetros: 212…) | **Listo: la planta sigue configurada** con seis cifras grandes (centros · máquinas · telas · productos · usuarios · bitácora) y «ver todo» | Pantalla final | Filas con nombres de tabla |
| ☐ | Clave única de orden (conteos sl_/prev_, botón «Guardar la clave en las N órdenes») | **Cómo reconocemos cada orden al recargar** (el botón de migración desaparece cuando ya corrió; el conteo útil «N órdenes que la próxima carga no reconocería» va como bandeja a Hoy) | Sección 4 | Pantalla de técnico que la jefa ve cada vez |
| ☐ | Panel DENIM/JEANS (Categorías) · chequeo de siembras (Reportería) | **Cambios que el sistema hizo una sola vez** (solo lectura: JEANS→DENIM, rutas con Empaque 348→22, tiempos de confección, rutas por defecto, motivos de paro migrados) | Sección 5 | Es historia, no configuración |

### 3.6 · Lo que SALE de Configuración y va a donde se usa

| ☐ | Hoy | Va a | Por qué |
|---|---|---|---|
| ☐ | Registro de cargas (Parte 2) | **Actualizar datos → Historial de cargas** (y tarjeta en Hoy «Última carga hace X») | Es lo que la jefa sí mira seguido y está enterrado en Configuración |
| ☐ | Alcance de las cargas (5 parámetros) | **Actualizar datos → «Qué órdenes del archivo de Odoo entran y cuándo se frena»** (enlace «ajustes de la carga»; copia bajo Avanzado) | Pertenece a la carga, no a Configuración |
| ☐ | Cargar pedido por tallas (tabla 16) · Cargar maestro de productos · Cargar facturas · Recalcular telas de las órdenes (tabla 12) | **Actualizar datos → pasos 4 Pedido por tallas · 5 Maestro de productos · 6 Facturas · «Aplicar estas reglas a las órdenes cargadas»** (con aviso previo de cuántas órdenes cambiarían); todas registradas con `registrarCarga` | Son cargas, no configuración |
| ☐ | Pestaña «Nivelación» de Configuración («Días hábiles» informativo · «Tela por entregar» · Grupos de módulos) | «Días hábiles» → «?» de Días que trabaja la planta · **«Tela: prendas por día que llegan a corte»** (Promedio de los últimos N días de trabajo · Prendas por día que va a entregar textil, vacío = uso el promedio real, con etiqueta «manda» junto al valor en uso y «según lo registrado por Corte en la tablet») → cajón «Ajustes ▾» dentro de la propia pantalla **¿Alcanza la capacidad?** · Grupos de módulos → Reglas · Ingeniería | Nada de esa pestaña era de configuración diaria; la columna «fases del saldo» que anuncia vive en la tabla 1 y no está sembrada |
| ☐ | Bandeja «sin velocidad de bordado configurada» (Tejeduría y Reportería) · técnicas de Odoo sin fila · operaciones sin centro · órdenes que la próxima carga no reconocería · máquina de tejeduría sin kg/día | **Hoy → Pendientes**, cada una con enlace a la pestaña donde se arregla | Faltantes que hoy viven como texto en una tabla o en la pantalla equivocada |

---

## 4 · Diccionario de palabras (solo textos visibles)

Se suma al diccionario ya aprobado el 19-sep (cercanía → orden de llegada, atasco → cuello de botella, colchón →
días de holgura, min/prenda → SAM, Nivelación → ¿Alcanza la capacidad?; se quedan WH, ODC, congelar y «Todo lo que
viene»). **Los identificadores del código, las claves de `S.params`, los ids y las pruebas por id NO cambian.**

| ☐ | Técnico (hoy) | Planta (se verá) |
|---|---|---|
| ☐ | Configuración → Centros y recursos | **Mi planta** |
| ☐ | Calendario y parametros | **Días que trabaja la planta** (calendario) + **Reglas** (parámetros) |
| ☐ | Parámetros | **Reglas** |
| ☐ | Órdenes y materiales (Parte 2) | **Cómo leemos Odoo** |
| ☐ | Nivelación (pestaña de Configuración) | desaparece; «¿Alcanza la capacidad? · ajustes» dentro de esa pantalla |
| ☐ | Borrado (administrador) | **Administrador** |
| ☐ | Categorías + Operaciones | **Productos y tiempos** |
| ☐ | Usuarios y perfiles / Cuentas | **Personas y permisos** / **Personas** |
| ☐ | Recursos | **Máquinas y puestos** (producción: **Personas y puestos**) |
| ☐ | Recurso (de la tablet) | **Módulo o puesto de la tablet** |
| ☐ | Área (Externo) | **Parte de la fábrica** (Proveedor externo) |
| ☐ | Ítem de planificación · «(el centro mismo)» | **Se muestra dentro de** · «(solo)» |
| ☐ | Cómo se mide el tiempo en la ruta | **Unidad de tiempo** (Minutos por prenda · Puntadas por prenda · Prendas por hora) |
| ☐ | va por defecto en toda ruta | **Está en toda ruta de producción** |
| ☐ | Por días | **Solo espera (no ocupa planta)** |
| ☐ | Activa / Activo | **En uso** (con «desde») |
| ☐ | Min/día · Efic. % · Min efectivos/día | **Horas de jornada por persona** · **Eficiencia %** · **Capacidad por día = personas × horas × eficiencia** |
| ☐ | Kg/baño · Kg cap. reducida · Tiñe · Telas aptas · Horas/día | **Kg que entran en un baño** · **Kg con piqué (0 = no tiñe piqué)** · **Colores que acepta** · **Telas que puede teñir** · **Horas que trabaja al día** |
| ☐ | Máquinas de tintorería · Máquinas de tejeduría | **Máquinas de teñir** · **Tejedoras** |
| ☐ | cabezas · puntadas/min · estaciones en paralelo · factor de tiempo · Rinde · Capacidad propia | **Cabezas (prendas que borda a la vez)** · **Velocidad (puntadas por minuto)** · **Prendas a la vez** · **Rapidez frente al estándar (100 % = igual)** · **Capacidad al día** · (se parte en columnas) |
| ☐ | Puntadas/min (del centro) | **Velocidad general de bordado** |
| ☐ | Maquila (externa), como módulo | **Maquila (taller externo)** |
| ☐ | Esperas después de un paso · ¿Ocupa capacidad? (sí / no: solo lead time / pendiente) · Sin regla | **Días de espera de Lavado** · **¿Usa gente de la planta o solo espera? (sí / solo espera / falta decidir)** · **Activa** |
| ☐ | Fases visibles en la cola · sugerido / confirmada | **Qué ve cada centro en su cola** · **propuesta / revisada** |
| ☐ | Excepciones · Sí trabaja / No trabaja · regla base del área | **Feriados, paradas y días extra** · **Día extra / No se trabaja** · **Semana normal** |
| ☐ | Inicio del programa | **El programa empieza el** |
| ☐ | Familia A / Familia B / Baño propio (IND) | **Grupo jersey / ribb 24/1** · **Grupo fleece / french terry** · **Va sola en su baño** (columna: **¿Con qué se puede mezclar en la tina?**) |
| ☐ | Encogimiento % · (enc) · merma (tabla 10) | **Merma de tintura %** |
| ☐ | Capacidad reducida (tela) | **Ocupa cupo reducido en la tina (tipo piqué)** |
| ☐ | Tejeduría: kg/día por máquina y tela | **Qué teje cada máquina y cuántos kg por día** |
| ☐ | Código TCX | **Pantone (ej. 18-3949)** |
| ☐ | Profundidad · Claro (11) / Medio (12–17) / Oscuro (18–19) | **¿Claro u oscuro?** · Claro · Medio · Oscuro · **— sin clasificar —** |
| ☐ | Lavado / suavizado (opción de profundidad) | **Es un proceso sin tintura (blanqueo / suavizado)** |
| ☐ | LAVADO DE TELA (proceso interno) | **Lavado de tela (proceso, no es un color)** |
| ☐ | ✎ · Horas (colores) · Pegar desde Excel (colores) | **Cambiar a mano** · **Horas en la tina** · **Cargar carta de colores** |
| ☐ | tabla 8 / tela corta | **Cómo la llama Odoo** / **nombre corto** |
| ☐ | Baño bueno desde % · Baño con aprobación desde % | **Un baño se programa solo desde __ %** · **Entre __ % y el de arriba, pide tu confirmación** |
| ☐ | granOk / granMin | **Kg mínimos para soltar un baño con aprobación** / **Una máquina es grande desde __ kg** |
| ☐ | Llenado mínimo % (STUART) · Tolerancia chica % · Tolerancia grande % | **Máquina pequeña: llenado mínimo __ %** · **Máquina pequeña: se puede pasar hasta __ % (= __ kg)** · **Máquinas grandes: se pueden pasar hasta __ % (240 → __ kg)** |
| ☐ | Días tintorería → bodega · horizonte de baños | **Días entre que sale el baño y la tela está en bodega** · **Arma baños con lo que se necesita dentro de __ días** |
| ☐ | Horas claro / medio / oscuro / lavado · Reproceso | **Horas de máquina por baño según el color** (medio = color sin clasificar) · **Horas de máquina de un baño de reproceso** |
| ☐ | Tela plana: máquina grande / horas por tanda | **Tela plana: máquina donde se procesa / horas por tanda** |
| ☐ | Confección: ventana de color | **Juntar en confección órdenes del mismo color si caen a menos de __ días** |
| ☐ | Tejeduría: días mínimos con la misma tela / horas perdidas por cambio / semanas de anticipación | **(Estimado automático) Una máquina se queda con la misma tela al menos __ días / Cambiar de tela cuesta __ horas** / **Tejer con __ semanas de anticipación a corte** |
| ☐ | Tablet: ventana de lo programado · Cierre del paso: minutos mínimos | **El operario ve lo programado hasta __ días hábiles adelante** · **Para marcar Hecho tienen que haber corrido al menos __ minutos** |
| ☐ | topeHorasTramo · tolMinPrenda · semCarga | **Aviso de tramo olvidado a las __ horas** · **Semáforo del SAM: tolerancia __ %** · **Semanas que muestra Carga general** |
| ☐ | Excedentes: palabra en la ODC · centro del paso final | **Palabras del pedido que indican prenda ya hecha** · **Dónde se etiquetan** |
| ☐ | Cola: «Por llegar» hasta N | **Mostrar como «por llegar» lo que llega dentro de __ días hábiles** |
| ☐ | Motor: hacia atrás / hacia adelante (el de siempre) | **Cómo se acomodan las fechas: desde la entrega hacia atrás (recomendado) / lo antes posible** |
| ☐ | Costos para valorar decisiones · Buscadores (ms) | **Costos (pendiente de conectar con Costos TEMPO)** · **Los buscadores esperan __ ms** (ambos en Ingeniería) |
| ☐ | est. / PENDIENTE DE VALIDAR / sugerido / pendiente de validar | **una sola marca: sin confirmar** (y **falta dato** cuando la celda está vacía) |
| ☐ | validado / pendiente de validar (por fila) | **Revisado ✓** (por tabla) + **N filas sin revisar** |
| ☐ | 1 · Fase del archivo → fase del sistema · 5 · Grupos de fase | **Fases de Odoo: qué significa cada una** · **Etapas de la planta, en orden** |
| ☐ | Grupo del sistema / grupo / etapa | **Etapa de la planta** (un solo nombre) |
| ☐ | secuencia · es cola · sin carga · bloqueo · excluye · carga desde · tela · montado · paso extra + parámetro min/pz · sin medir · Nivelación (columna) | **Orden (menor = devolver, igual = a la par)** · **Esperando al siguiente centro** · **Ya no ocupa planta** · **Parada por falta de material** · **No carga estos centros** · **Empieza a cargar desde la etapa…** · **Cómo está la tela en esta fase** · **Cuenta en la macro de tela** · **Paso corto pendiente: centro + minutos por prenda** · **Trabajo sin tiempo medido** · **Cuenta en ¿Alcanza la capacidad? como…** |
| ☐ | 6 · Centro de trabajo de Odoo → centro TEMPO (mrp.workorder) · 7 · Estado de la OT · 4 · Centro → etapa · 2 · Segundo nivel · 3 · Tercer nivel de MP | **Centros de trabajo de Odoo → centro de TEMPO** · **Estados de Odoo que cuentan como terminado** · **Centros: en qué etapa de la planta están** · **Materiales de Odoo: qué es tela y qué es insumo** · **Tipos de tela de Odoo: ¿la tejemos o la compramos?** |
| ☐ | 9 · Parámetros por tela · 10 · Merma por tela corta × tipo · 11 · Palabras JASPE · 12 · Catálogo de productos · 13 · Qué le falta a la tela… · kg por unidad | **Ficha técnica de la tela** · **Merma de tintura de las telas sin catálogo** · **Palabras que significan jaspe** · **Productos y proveedores** · **¿Hay que tinturar la tela?** · **Peso de cuellos y puños** |
| ☐ | 14 · Qué se conserva al recargar la Parte 2 · Sin WH manda Odoo | **Al actualizar desde Odoo, esto NO se pisa** (rutaConf → «la ruta confirmada»; tallasPedido → «las tallas cargadas»; histLib → «las firmas de liberación») · **Fase de las órdenes que todavía no tienen WH: la manda Odoo** |
| ☐ | Alcance de las cargas · Clave única de orden · Registro de cargas | **Qué órdenes del archivo de Odoo entran** · **Cómo reconocemos cada orden al recargar** · **Historial de cargas** |
| ☐ | Restricciones de faltante · Días de entrega por proveedor · Tiempos de ojales y botones | **Telas que solo van en baño grande** · **Proveedores de tela: días que tardan en entregar** · **Minutos por prenda en Botones (ojales y botones)** |
| ☐ | 15 · Motivos · 16 · Tallas · 17 · Textos de pantalla (Dónde) · 18 · Descansos | **Motivos que elige la gente** · **Tallas de cada tipo de producto** · **Palabras del sistema (Se ve en…)** · **Horario de almuerzo y refrigerio por centro** |
| ☐ | Categoría (padre / hija) · Tipo de producto · Familia (de producto) | **Producto** (familia / tipo); **Familia de operación** siempre con apellido |
| ☐ | LMO / hoja LMO · Cargar operaciones (hoja LMO) · Cargar orden de las operaciones · Mapeo (familia→centro, categoría→LMO) · «*» | **hoja de operaciones de Odoo** · **Cargar la hoja de operaciones de Odoo (reemplaza la actual)** · **Cargar el orden de costura** · **Cómo se lee el Excel de Odoo** · **Cualquier otra** |
| ☐ | Sec. · SAM estimado · Categorías sin hoja · Etiqueta de serigrafía · Operaciones sin centro · Hoja de operaciones por familia | **Paso** · **Minutos estimados por prenda** · **Productos sin tiempos** · **Productos con etiqueta estampada** · **Operaciones sin centro: dime a dónde van** · **Minutos por prenda de cada producto** |
| ☐ | Quién puede hacerla (M1…M11) · Consumo por prenda · Lleva lavado/plancha por defecto · Carry over · Hoja · Volver a heredar / vaciar · Nueva operación | **Módulos que pueden coserla** · **Consumo de referencia por prenda (solo para órdenes escritas a mano)** · **Pasa por lavado / por plancha (igual que la familia · sí · no)** · **Producto repetido (solo informativo)** · **Operaciones de <producto>** · **Usar la de la familia · Vaciar** · **Agregar una operación a mano** |
| ☐ | Tipos de máquina · Alias que llegan de la hoja · Familia (de máquina) · Operarias y especialidades · Máquinas de confección · Sin asignar (stock) · Polivalencia · Grupos de módulos | **Máquinas de costura (catálogo)** · **También aparece como** · **Grupo** · **Quién trabaja en cada módulo (opcional)** · **Inventario de máquinas de costura** · **Sin módulo (bodega)** · **Qué familias cose cada módulo** · **Qué módulos cosen cada familia** |
| ☐ | Tela por entregar · Días hábiles del promedio real · Valor planificado (u/día) · Convención única · Guardar escenario | **Tela: prendas por día que llegan a corte** · **Promedio de los últimos N días de trabajo** · **Prendas por día que va a entregar textil** · **Cómo cuento los días** · **Guardar mi plan del período** |
| ☐ | Permiso (modo) · Tablet (centro · recurso) · Piso · enviar enlace · Nuevo usuario · Nuevo perfil · Permisos · Centros que ve y donde registra · Menú | **Solo consulta** · **Centro y módulo de la tablet** · **Trabaja en el piso (Operario / Supervisor)** · **Restablecer contraseña (por correo)** · **Nueva persona** · **Crear perfil copiando uno existente** · **Qué puede hacer** · **Qué centros ve** · **Qué ve en el menú** |
| ☐ | Respaldo / Restaurar · Borrar datos de prueba · índice de fotos por OP · Base vacía · configuración conservada · borrado INTERRUMPIDO / INCOMPLETO | **Descargar una copia / Volver a una copia** · **Vaciar todas las órdenes y registros (deja la configuración)** · **Fotos ya enlazadas a cada orden** · **Listo: la planta sigue configurada** · **Un borrado quedó a medias** |

---

## 5 · Qué NO cambia

- **Entregas**: no se toca ni una palabra (la prueba H ya lo protege). Tampoco el Resumen del centro ni Mi centro,
  que son el molde del patrón.
- **El motor** (`programar()`, `nivelar()`, `capDia`, `labR`, `cercaniaCentro`, `pasoHecho`, tintorería, tejeduría):
  ningún cálculo cambia en los pasos 1 y 2. El único cambio de cálculo autorizado va en el paso 3, aislado, y es el
  conteo de días de la nivelación (sección 8).
- **Los datos**: ninguna tabla de Supabase, ninguna clave de `S.params`, ningún id de centro/recurso/tela/color se
  renombra ni se borra. Lo que «se retira» sale de la pantalla, no de la base (Costos, Grupos de módulos, tabla 9,
  `des`, Carry over). Las filas «Nueva hija» existentes no se borran (HENLEY es real).
- **Las siembras**: todas siguen corriendo, pero desde un solo punto explícito al inicio de `render()` en vez de
  dentro de una celda; corren dos veces y dan el mismo estado (idempotentes) y `chequeoSiembrasHTML` las lista.
- **Las funciones**: `setRow`, `setRec`, `setCentro`, `setKgTela`, `setCod`, `mCat`, `mFamOps`, `mBorrar`,
  `restaurarDesde`, `planMesHTML`… se llaman desde otro lugar y ganan bitácora y permiso; no se reescriben. Solo
  cambia «desde dónde se dibuja» cada panel.
- **Las reglas de negocio**: qué manda entre dos datos (enc vs tabla 10; tabla de esperas vs «Por días»; maestro vs
  tabla 3; asistencia vs ajuste vs base) NO cambia: la pantalla pasa a DECIRLO.
- **Los permisos**: `config`, `programa`, `categorias`, `usuarios` siguen gobernando lo mismo; solo se agrega la
  revisión de perfil donde hoy falta (`setParam`, `setCal`, `setCosto`).
- **Nada se borra** (regla del 15-sep): toda función nueva de «Desactivar» / «Dar de baja» / «Quitar» pide
  confirmación y entra en la lista GUARDIA.
- **Lo que NO se esconde aunque sea de una sola vez**: fases de Odoo, etapas, centros de trabajo de Odoo y «qué no se
  pisa» siguen a la vista en Reglas, porque las bandejas de Hoy (faseNoCalza, provSinDias, noCalzan) mandan ahí
  cuando Odoo trae algo nuevo.

---

## 6 · Riesgos y cómo se cuidan

| # | Riesgo | Cómo se cuida |
|---|---|---|
| 1 | **Enlaces rotos.** Hay 21 saltos a Configuración en el código (`CONF.tab=…`, `data-conf="nivel"`, anclas `#bloque-cal/tej/tin/pro/maq/grupos-mod/niv-tela`) más las bandejas de Hoy que escriben «Configuración → Órdenes y materiales» o «Centros (fila Bordado)». | Tabla de alias viejo → nuevo (`CONF_TAB_ALIAS`) y anclas conservadas; una prueba del simulador recorre los 21 saltos y falla si alguno no aterriza en un elemento visible; los textos de las bandejas se actualizan en el mismo commit. |
| 2 | **Siembras que dejan de correr** al plegar un panel (`sembrarRutaDefecto` y su cadena dentro de una celda; `sembrarTiposMaq`, `sembrarDiasProveedor`, `aplicarTiemposBotones` al dibujar). | ANTES de mover nada: un solo `sembrarConfiguracion()` en `render()`, prueba «dos veces = mismo estado» y sin abrir Configuración. |
| 3 | **Pruebas del simulador que buscan textos y columnas viejas** (GUARDIA, N0, F1/F2/H, K, NIV, las del DOM de Parte 2, motivos, tallas, borrado). | Regla del 16-sep: fijar el DOM actual con pruebas, extraer cada panel a su función sin cambiar una letra, y solo después renombrar actualizando cada prueba una a una (como los 94 reemplazos de G); si algo se pierde, revertir. Nunca renombrar funciones, ids, claves de `S.params` ni líneas ya escritas en bitácora y respaldos. |
| 4 | **Perfiles que pierden pantallas** al fundir Categorías + Operaciones y crear Reglas, Administrador y Productos y tiempos. | Migración idempotente de `perfilesDef` con bandera (como `migReporteria`) y bitácora; `PAGINAS_DEF` e `ICO_NAV` con clave por cada página nueva; las páginas viejas quedan como alias que redirigen. |
| 5 | **Esconder algo que sí tiene efecto.** | Antes de mandar algo a «Ingeniería» o «Administrador» se comprueba por grep que no tiene llamadores (`costoMin`, `filaParamTela`, `capGrupoDia` solo en test/driver.js: verificado) y se escribe la razón en la tarjeta. **Regla dura: nada que se toque cada semana entra a Avanzado; una sección con dato faltante nunca se pliega.** «N más con valor» al plegar columnas. |
| 6 | **El selector de Colores mostrará el estado real**: decenas de colores que hoy se ven «Claro (11)» por defecto del navegador aparecerán como «— sin clasificar —» y la bandeja de Tintorería crecerá. | Es una corrección, no una pérdida. Se mide en el simulador con el volcado real cuántos cambian de estado visible y se avisa antes; el cambio de guardado (`setProfundidadColor`) va en el paso 3 con su prueba, no en la mudanza. |
| 7 | **Retirar rellenos del código cambia números** en máquinas/telas/técnicas creadas sin datos (kg/h 10, SAM 1, cabezas 1, 8 %, `‖10`, `‖240`, hMedio para sin clasificar). | PASO 0 mide contra el volcado real cuántas filas dependen hoy de cada uno (el catálogo demo distorsiona: `RECONCILIACION_CATALOGO.md`); se exponen primero con el valor que HOY usa el cálculo; se retiran en el paso 3, uno por uno, con prueba antes/después. |
| 8 | **Bitácora nueva que se llena de basura** si se engancha en `oninput` (una línea por tecla, como ya pasa con `setGrupoMod`). | Solo en `onchange` (al soltar el campo), con el rótulo visible y antes → después; nada se recorta. |
| 9 | **Nombres que son llaves de cruce** (nombre en Odoo de un color, de una técnica, de una categoría LMO, de un centro de trabajo). | Solo lectura si vinieron de una carga + camino explícito «Cambiar a mano, con motivo» para el nombre mal tipeado. |
| 10 | **Crear solo al guardar** cambia el flujo de botones que hoy crean la fila antes de abrir la ficha (y las pruebas que pulsan todos los botones). | Va en el paso 3; no se borra ninguna fila «Nueva …» existente. |
| 11 | **Un solo archivo de ~12.000 líneas**: mover bloques grandes invita a duplicar funciones o dejar un `</div>` sin cerrar. | `node --check` del script extraído + prueba N0 (ninguna función dos veces) + capturas `?captura=config*` por pestaña en cada entrega. |
| 12 | **Confusión en la transición** (la gente aprendió «Centros y recursos» y «Parte 2»). | «¿Dónde quedó…?» (mapa viejo → nuevo) en el «?» de Mi planta durante un mes; la Búsqueda general encuentra reglas por su nombre viejo y nuevo; Respaldo/Restaurar siguen también en la cabecera. |
| 13 | **Reusar `planMesHTML`** en Días que trabaja la planta: si se copia se duplica lógica, si se parametriza se toca lo que Plan mensual usa. | Parámetro opcional «solo días» que omite los bloques de carga; prueba del DOM del Plan mensual antes y después. |
| 14 | **Diagnósticos que nadie mira** al mandarlos a Salud del sistema. | Los que tienen acción pendiente (operaciones sin centro, técnicas de Odoo sin fila, órdenes no reconocibles, velocidad de bordado) van además como bandeja a Hoy; los que son historia (DENIM/JEANS) solo a Salud del sistema. |
| 15 | **Segunda definición de capacidad o de días** si la nivelación guardara personas o días en un lugar propio. | Personas → `ajustesCap` (el mismo ajuste semanal que ya lee todo el sistema); días → el calendario del mes (el que manda). Ver sección 8. |

---

## 7 · Plan en tres pasos (nada se construye hasta que taches y apruebes)

Cada paso cierra con: simulador completo (`node test/build.js` + driver: GUARDIA, N0, F1/F2/H, K, NIV y las pruebas
nuevas), capturas `?captura=config…` por pestaña, reporte `.md` de la entrega, nota en CLAUDE.md, commit + push.

### Paso 1 · Solo mover y renombrar (sin cálculos nuevos; ningún resultado del sistema cambia)

Antes que nada, el **PASO 0** que no toca pantalla: `CONFIG_DUMMIES_MAPA.md` (cada elemento: pestaña vieja → sitio
nuevo, nombre viejo → nombre claro, ancla vieja → ancla nueva) para que lo apruebes; pruebas que fijan el DOM actual
de cada panel; la prueba de los 21 saltos; `sembrarConfiguracion()` idempotente en `render()`; y la medición contra
el volcado real de cuántas filas dependen hoy de cada relleno del código y cuántos colores «Medio» están sin marca.

Después:
- Menú con las 5 entradas (Mi planta · Reglas · Productos y tiempos · Personas y permisos · Administrador), alias de
  las pestañas viejas, migración de perfiles con bandera y bitácora.
- Mover cada panel a su pestaña/tarjeta **sin cambiar su HTML** (solo desde dónde se llama): kg/día → Tejedoras;
  velocidad de bordado → Bordadoras; horas de baño y % de llenado → Reglas · Tintorería; esperas y «Por días» → grupo
  Lavado; fases visibles y descansos → Personas y puestos (plegado); tablas 15/16/17 → Reglas · Piso; tablas
  2/3/8/10/11/13 + restricciones + proveedores + catálogo 12 → Reglas · Telas y kilos; tablas 1/5/6/7/14 + excedentes
  → Reglas · Cómo leemos Odoo; calendario + semana normal + excepciones + Inicio → Días que trabaja la planta;
  tipos de máquina, operarias, inventario, grupos de módulos, tabla 9, costos, motor, msBuscar → Avanzado/Ingeniería;
  Borrado, Respaldo/Restaurar, Clave única, chequeo de siembras → Administrador; registro de cargas, alcance, tallas,
  maestro, facturas, recalcular telas → Actualizar datos; DENIM/JEANS, Tiempos por revisar, Carga de estimados,
  resultado LMO → Reportería → Salud del sistema; la fila «prenda tinturada» → bandeja de Hoy. El panel duplicado
  de Motivos de reproceso se quita (mismas filas).
- Renombrar solo textos visibles con el diccionario (revisor independiente, como en G); notas al pie y avisos
  permanentes → «?» del título; tilde en «parámetros»; fuera los textos de cuaderno (PASO 5/6/7, BLOQUES A/B/E, v2,
  Parte 2, mrp.workorder, 57 códigos, decisión del 16-sep, nombres de personas → bitácora); fuera el aviso amarillo
  falso; «+ Agregar» y «Quitar» uniformes; confirmaciones con nombre de planta.
- Retirar de la vista las columnas falsas o muertas: Kg/día (horas), Kg/hora, Prom., Días/sem + párrafo, Provisional,
  Máquina/nota, Perfil viejo, Permiso (modo) hasta que exista la columna, casilla «Costura», marca PENDIENTE DE
  VALIDAR, select «Centro» de una opción, «volver a sugerido».
- Un «Revisado ✓» por tabla + contador en vez de los 200 botones por fila.
- Mostrar el estado REAL en Colores («— sin clasificar —» visible) sin cambiar todavía cómo se guarda.
- Bitácora con rótulo de pantalla en `onchange` y revisión de perfil en `setParam` / `setCal` / `setCosto`.

**Tamaño estimado:** 5–6 commits · ~1.800 líneas de index.html tocadas (casi todo mover llamadas y reemplazar
rótulos) · ~40 pruebas nuevas o ajustadas · 4 días de trabajo. Es el paso grande y el que más se prueba, porque el
programa antes y después tiene que ser idéntico.

### Paso 2 · La forma: tarjetas plegadas, «Avanzado», «más columnas», fichas fundidas (presentación, sin cálculos)

- Mi planta: cabecera de tres líneas con «?» y «Filtrar»; tabla de Personas y puestos agrupada por centro con «esta
  semana: N» / «hoy: N» (lo que `nivUICapacidad` ya calcula como `fuente`); Maquila aparte; Estructura de los centros
  con 4 columnas + «más columnas» bajo Avanzado; casilla «En uso» de centro; «hoy manda: tabla de esperas»; Tejedoras
  con la matriz plegada y «trabaja N h → X kg/día»; Máquinas de teñir con «última revisión» y el cuadro vivo «Cómo se
  llena una tina hoy»; Bordadoras / Estampado en dos tablas con total del centro y «¿Cuándo una orden pasa por
  aquí?»; Telas agrupadas por grupo de tina con «Cómo la llama Odoo» y «usada en N órdenes»; Colores con la fila de
  nuevos, Pantone vivo y «Quién lo clasificó»; Días que trabaja la planta reusando `planMesHTML`.
- Reglas: cuatro cabeceras, tarjetas colapsadas una abierta a la vez recordada por usuario (patrón del Resumen
  gerencial), «N sin revisar» / «N falta dato» en el título, ejemplos vivos en kg; regla «una tarjeta con faltante se
  abre sola y no se pliega»; Motivos con pestañitas; Fases con etapas como cabeceras de grupo y 4 columnas + «más
  columnas» con «N más con valor».
- Productos y tiempos: lista de productos con columnas Órdenes abiertas / SAM por centro / Tiempos (datos que ya
  calculan `opsDe`, `samPorCentro`, `minEstimadoConf`) y ficha en cuatro bloques que llama a lo que ya existe (`mCat`,
  `mFamOps`, `setMinEstConf`, `reglasEtiqueta`, `tiemposOjalBoton`); catálogo de operaciones a 5 columnas, un botón
  principal y «Más…»; «Última carga de operaciones» visible.
- Personas y permisos: dos pestañas; perfiles como tarjetas con tres desplegables; «Nueva persona» en dos pasos;
  «Crear perfil copiando uno existente».
- Administrador: «Qué se borraría hoy» en dos columnas, «Se borra / Se conserva» en dos frases, tres viñetas, casilla
  de fotos marcada, historial, «Un borrado quedó a medias» con dos botones, «Listo: la planta sigue configurada».
- Interruptor «Avanzado» por usuario con atributos `data-*` (nunca clases), reusando la mecánica de «Filtrar».
- «¿Dónde quedó…?» y «¿Cómo hago para…?» en el «?» de Mi planta.

**Tamaño estimado:** 4–5 commits · ~1.200 líneas (componentes comunes nuevos: `tarjetaConfig`, `chipOrigen`,
`masColumnas`, `botonMas`, más las plantillas de tarjeta) · ~30 pruebas · 3 días.

### Paso 3 · Corregir lo que miente o no hace nada, cada cosa con su prueba (aquí sí hay cambios chicos de comportamiento, uno por uno)

a) Profundidad desde Colores usa `setProfundidadColor` (marca confirmada, permiso, bitácora) y «— sin clasificar —»
es un valor real; color sin clasificar → horas «—» (no las de «medio»). b) Tejedora nueva sin kg/día no teje nada
y sale bandeja; se retira el kg/h genérico 10. c) `diasTela` en 0 se respeta; el `‖240` de `capsTin` pasa a bandeja;
tela nueva sin 8 %, técnica nueva sin SAM 1, bordadora sin cabezas → «falta dato». d) `granMin/granOk`, `semCarga`,
`tejAnticipSem` (2), `topeHorasTramo`, `tolMinPrenda`, `filasResumenCentro` con campo real y semilla visible; los
respaldos del código pasan a `prm()` con la semilla. e) Casilla «¿La tejemos nosotros?» reemplaza la exclusión por
id `t12`. f) «Crear solo al guardar» en producto, operación, tela, color, técnica, máquina, perfil. g) «Desactivar»
antes de «Quitar» en máquinas y centros. h) «Inicio» con aviso rojo y «desde hoy». i) Editor «Qué familias cose cada
módulo» sobre `setPoli` (o corregir el mensaje de la nivelación). j) «Cargar feriados del año» desde una lista que
tú confirmas (no sembrada en código). k) Vista previa de «Cargar la hoja de operaciones» que liste las ediciones a
mano que se pierden; «Cargar máquinas desde Excel» reconoce por `normMaquina` con vista previa. l) **Nivelación:
conteo de días hábiles con el calendario del área** (sección 8) y fuente de cada número en el cuadrito.
m) Decisiones que se te preguntan, no se hacen solas: conectar «Qué módulos cosen cada familia» al cálculo de
Confección o retirarlo con sus pruebas; `centrosPorOrden` editable; Costos fuera de la vista hasta Costos TEMPO.

**Tamaño estimado:** 6–8 commits chicos e independientes · ~500 líneas · ~25 pruebas antes/después · 2–3 días.
Cada letra se puede aprobar o tachar por separado.

---

## 8 · Tu idea para la Nivelación: «elegir el centro, cuántas personas y qué días, sin ir a Configuración»

**Sí es buena idea. Y ya está construida desde esta mañana** (commit `9dfd685`, «Planificar el mes en dos pasos»):
Dirección → Planificar el mes → paso 1 tiene el calendario de días que manda (`planMesHTML`, se marca con un clic
por área) y la tabla **«Personas por centro»** (`personasNivHTML`) con tres columnas — **Configurado** (la base de
Configuración) · **Vigente** (el ajuste ya guardado de cada semana) · **Escenario** (lo que estás probando) — y una
columna **«Manda»** que dice cuál de las tres está usando el cálculo. «Confirmar escenario» pide motivo y lo graba
como el ajuste de cada semana del mes (`guardarAjustesCap` → `S.params.ajustesCap`, con bitácora); «Descartar» vuelve
a lo vigente. Los tres diseños y los tres jueces lo dieron por pendiente porque se escribió antes de ese commit.

**Contra el principio (13-sep), punto por punto:**

| Principio | ¿Se cumple hoy? |
|---|---|
| La capacidad base sigue en Configuración | ✓ El escenario nunca toca `r.pers` (la base); al confirmar escribe el ajuste semanal, que es la misma capa que ya usaba el simulador del Plan mensual. |
| La nivelación escribe un escenario que no toca la configuración | ✓ para personas (`SIM` en memoria hasta confirmar). Para **días** no hay escenario: marcar un día escribe directo en el calendario del mes (`excepciones` del área, con confirmación). **Eso es lo correcto**: por el principio 5 «manda el calendario del mes», y un segundo lugar para los días (como proponían dos de los diseños) haría que el motor y la nivelación contaran días distintos. |
| Dice de dónde sale cada número | ✓ en la tabla de personas (columna «Manda»). **✗ en el cuadrito de ¿Alcanza la capacidad?**: `nivUICapacidad` ya calcula la fuente de cada recurso («asistencia de hoy» / «ajuste de la semana» / «configuración») pero el cuadrito no la pinta. Ojo: la asistencia registrada hoy en la tablet manda sobre el escenario (`capDia`), y si no se dice, parecerá que «no se guardó». |
| `nivelar()` no se modifica | ✓ `nivelar()` recibe la capacidad como número; lo que cambió fue cómo `nivUICapacidad` la arma: promedio por día hábil del horizonte, con ajustes y escenario incluidos (líneas 6534-6541). `programar()` tampoco se tocó. |
| Un solo dato, tres pantallas | ✓ personas: Planificar el mes, Plan mensual (simulador) y la nivelación leen `ajustesCap`. Configuración → Mi planta solo tiene que MOSTRARLO al lado de «Personas (normal)»: «esta semana: N (ajuste del 21-sep) → Planificar el mes». |

**Lo que de verdad falta (chico, va en el paso 3 l):**

1. **La nivelación no cuenta un día marcado solo para Producción.** El calendario del paso 1 escribe la excepción con
   el área elegida (`togDia`, línea 10408), pero el conteo de días hábiles de la nivelación (`diasHabilesInc` /
   `finLabInc`, líneas 6227-6232) usa `labDiaGeneral` (línea 905), que solo mira las excepciones marcadas «todas». Un
   sábado extra de Corte marcado en Planificar el mes entra al motor pero NO a «¿alcanza?». Corrección: contar con el
   calendario del área de producción (o del recurso, `labR`), con prueba antes/después; mientras tanto la pantalla
   dice «marca el día para Todas las áreas».
2. **Pintar la fuente en el cuadrito**: junto a «Capacidad día planta», «personas: ajuste de la semana del 21-sep» /
   «asistencia de hoy manda» / «configurado». El dato ya existe (`fuente`).
3. **Que Producción → ¿Alcanza la capacidad? muestre el mismo calendario y la misma tabla de personas** en vez de solo
   el enlace «Planificar el mes →», para que no haya que ir ni a Configuración ni a Dirección. Misma función, otra
   pantalla; nada nuevo se guarda.
4. Un detalle para tu decisión: en Corte «tantas personas» es un número (una mesa); en Confección son 11 módulos más
   maquila, y la tabla ya va **por módulo**. Si prefieres un solo número para todo Confección, hace falta una regla
   de reparto que hoy no existe (proporcional a lo configurado sería lo natural); se pregunta, no se inventa.

**No hay que volver a implementar** personas ni escenario ni el promedio del período: está hecho. Cualquier propuesta
que guarde los días en un «escenario» aparte del calendario se descarta por el principio 5.

---

## 9 · Qué necesito de ti

- Tachar lo que no te guste en las tablas de la sección 3 y del diccionario (sección 4).
- Decidir: ¿«Reglas» o prefieres otro nombre para el segundo cajón? ¿«Mi planta» te suena?
- Decidir el orden de las pestañas de Mi planta (propuse: Días · Personas y puestos · Telas y colores · Máquinas de
  teñir · Tejedoras · Bordadoras y estampado).
- Las decisiones del paso 3 m (grupos de módulos, `centrosPorOrden` editable, Costos) y el punto 4 de la sección 8.
- Con eso se escribe el `CONFIG_DUMMIES_MAPA.md` del PASO 0 y se empieza el paso 1.

*No se modificó `index.html` ni ningún otro archivo. Entregas no se tocó ni se revisó.*
