# Reportería TEMPO PCP — propuesta de esquema (para aprobar) — 20-sep-2026

**Nada de esto está construido**: es la propuesta para que la usuaria la lea, tache y apruebe. Se armó con un equipo de agentes: cuatro inventariaron todo lo que hoy reporta el sistema (menú Reportería, Dirección y Plan, piso y centros, y los datos de registro que existen), tres diseñaron un esquema cada uno (por rol, por flujo, mínimo), nueve jueces (planificación, jefe de producción, gerencia) los calificaron (7,7 · 7,5 · 7,8 sobre 10) y una síntesis tomó lo mejor de cada uno. Documento para leer y aprobar antes de construir nada. Toma lo mejor de las tres propuestas revisadas: la portada por rol y la lista de limpieza (propuesta 1), la plantilla única de cuatro bandas por tramo y el Excel para ingeniería (propuesta 2), y los títulos como preguntas con menos pantallas y más reuso (propuesta 3).

## 1 · Diagnóstico breve de la reportería de hoy

**Qué hay.** Ocho entradas en el menú Reportería: Resumen gerencial, Vista general de órdenes, Asignación por orden, Producto en proceso, Cumplimiento de facturación, Avance del mes, Reportería textil y Reportería por área. Además hay reportes «escondidos» dentro de otras pantallas: Hoy (tarjetas y bandejas), Plan mensual (bloque 2), Carga general, Capacidad y decisiones, Tintorería (reporte del mes) y Liberación (resumen por período). Nada de esto se diseñó junto: se fue agregando pantalla por pantalla.

**Qué se solapa.**
- Tres listas de «todas las órdenes» (Vista general, Asignación por orden, Producto en proceso) que pintan el estado de cuatro maneras distintas. Solo una es correcta: el semáforo (verde / ámbar / rojo / gris con su verbo).
- «Hechas» se calcula de cuatro formas (turnos, avance del mes, último paso de la ruta, lo hecho del día). Deben quedar **dos**, declaradas: *hechas por centro y día* y *orden terminada (último paso de la ruta)*.
- Los minutos pendientes se suman por su cuenta en Producto en proceso, Reportería por área y Resumen gerencial, en vez de usar la cuenta única de carga.
- Dos «congelados semanales» distintos (Cumplimiento parte B vs. el congelado por centro). Vencidas y entregas de la semana aparecen dos veces en Hoy. Reportería textil está en dos menús.
- El Resumen gerencial programa «como si todo estuviera liberado» sin decirlo, y suma previsiones que no son ninguna de las cuatro bases de cartera.

**Qué no se usa o estorba.**
- Nueve paneles de auditoría, siembras y conteos pegados al pie de Reportería textil y por área; los ven hasta los perfiles de piso.
- Cumplimiento parte B (semanas congeladas del sistema viejo): nadie congela así hoy.
- Código muerto que no abre ninguna pantalla (`rutasSinEmpaqueHTML`, `tablaMezcla`).
- Valores de negocio fijos en código dentro de reportes: 30 días «probablemente entregada», pesos de avance 15/30/50/65/85 %, 5 % de sobrecapacidad, 3 % de diferencia de kg, tope de 1.500 filas que corta sin avisar.
- La pieza «cifra con su base escrita» (`cifraCarteraHTML`) ya existe y **ningún reporte la usa**.

**Qué falta y la planta sí necesita.** Un reporte por tramo con la misma forma para todos; paros y tiempos reales; el listado de tiempos faltantes para ingeniería (con Excel); una portada que le diga a cada persona qué mirar; y un cierre semanal guardado para tener historia.

## 2 · Esquema propuesto

**Regla de forma.** Todo reporte tiene la misma cabecera de tres líneas: (1) el título es la pregunta que responde, (2) una línea de contexto con **base · período · datos al día/hora**, (3) el «?» con la explicación y un solo botón «Filtrar» que despliega buscador, filtro de fases, agrupador y período. Los reportes de tramo (bloque 5) tienen siempre las mismas cuatro bandas en el mismo orden: **CARGA · AVANCE · CUMPLIMIENTO · CALIDAD**. Se aprende una vez y sirve para todos. Los reportes solo leen: nada se edita desde ellos, cada fila tiene «ir a resolver».

### 0 · Mis reportes (portada por rol) — Prioridad 1
- **Para quién / cuándo:** todos, al entrar a Reportes.
- **Pregunta:** ¿cuáles son mis reportes, en qué orden los leo y cuál es el número principal de cada uno?
- **Contenido:** una tarjeta por reporte del rol (nombre corto, la pregunta, una cifra con su base, botón Abrir), ordenadas en el orden del flujo. Debajo, plegado, «otros reportes que puedo ver». Gerencia ve cuatro cifras: órdenes abiertas (base lanzadas), prendas pedidas del mes, % hechas, meta vencida. Roles: Santiago → Corte, Servicios, Planta esta semana (su fila), Paros. Mariela y Paola → Confección y maquila, Planta esta semana, Paros. Maquila → solo su recurso dentro de Confección. Terminados → Terminados y Empaque. Jordan y Fernanda → Dónde está cada orden, Rutas por confirmar, Liberaciones a producción, Planta esta semana, Capacidad. La usuaria → todo. Gerencia → Cómo va el mes y Dónde está cada orden.
- **Base escrita:** la de cada tarjeta.
- **Ya existe:** registro `REPORTES[]` con la barra de chips, catálogo de perfiles, tarjetas resumen.
- **Falta:** columna «reportes» por perfil en Configuración → Usuarios (siembra con los roles dictados el 19-sep, editable, con bitácora); perfiles **producción** (Jordan y Fernanda) y **maquila** (acotado por recurso, como hoy la tablet) que hoy no existen.

### 1 · ¿Cómo va el mes? — Prioridad 1
*(Funde Resumen gerencial + Avance del mes + Cumplimiento parte A + Plan mensual bloque 2 + historia.)*
- **Para quién / cuándo:** gerencia y la usuaria; lunes, cierre de mes y cuando gerencia quiera.
- **Pregunta:** de los meses del Proyecto elegidos, ¿cuánto hay, cuánto está hecho, cuánto falta, cuánto vale, cuánto está vencido o va tarde, y cómo viene mes a mes?
- **Contenido:** filtros globales aplicados UNA vez (meses del Proyecto en suma, cliente, estado, buscador). Tarjetas: órdenes (con base) · prendas pedidas · hechas (último paso de la ruta; si quedan rutas sin Empaque, «N rutas por corregir» con enlace) · falta · facturación esperada $ («N prendas sin precio») · meta vencida · va tarde · liberadas del mes n/total. UNA tabla con selector de corte [Cliente | Fase | ODC | Estilo | Familia] y siempre las mismas 8 columnas (órdenes, pedidas, hechas, falta, % avance, valor, vencidas, va tarde); los cinco cortes cuadran entre sí (ya hay prueba). Fila → lista de órdenes con foto, WH, fase, semáforo y agrupador común. Al pie, plegado: **Historia** (una fila por mes cerrado; barras solo con 3 meses o más; «desde cuándo hay datos», nunca se rellena hacia atrás). Imprimible: tarjetas + tabla del corte.
- **Base escrita:** «abiertas del Proyecto del mes (incluye diseño sin WH) · programa real»; interruptor a lanzadas.
- **Ya existe:** casi todo el Resumen gerencial actual, cierres de mes, fotos de cartera, avance del plan congelado.
- **Falta / decisión:** el «avance ponderado» (15/30/50/65/85 %) sale del código: se retira o pasa a una tabla editable «peso de avance por etapa». El cierre del mes deja de guardarse al dibujar (corre una vez al día al guardar). Costos y márgenes: solo nota, viven en Costos TEMPO.

### 2 · ¿Dónde está cada orden y cuál no llega? — Prioridad 1
*(Funde Vista general de órdenes + Asignación por orden + lista de Producto en proceso + advertencias de fecha + órdenes sin fecha + pasos sin programar.)*
- **Para quién / cuándo:** Jordan y Fernanda, la usuaria, gerencia; los supervisores la ven acotada a sus centros. Diaria.
- **Pregunta:** para cada orden con WH: ¿dónde está hoy, cuál es su próximo paso y recurso, cuándo termina, llega o no a la fecha meta, cuántos días tarde, dónde está el cuello de botella, qué fecha posible le doy al cliente y, si no avanza, qué la frena?
- **Contenido:** tarjetas = el semáforo, una por color y verbo (verde lista/en proceso · ámbar llega el… / va tarde · rojo meta vencida · gris falta liberar / falta tela / falta ruta / sin programar con motivo / probablemente entregada y sin cerrar en Odoo); cada tarjeta abre su lista. UNA tabla «unidades en proceso por etapa» (tejeduría → empaque, etapas sacadas de la tabla de centros, nunca lista fija) con órdenes, prendas, horas pendientes y atrasadas; clic filtra. UNA lista: foto+WH+fase, cliente, ODC, categoría, color, prendas, dónde está, próximo paso · recurso · termina, termina todo, fecha meta (dice si es compromiso u Odoo), semáforo con tooltip (días tarde, cuello de botella, fecha posible). Clic → ficha. Si la lista se corta, dice «N más». Botón «Exportar fechas posibles» (CSV) para avisar al cliente. Hoy → «Unidades en proceso» pinta estas mismas tarjetas, no otra cuenta.
- **Base escrita:** «lanzadas (abiertas con WH) · las de diseño sin WH: K → Órdenes · programa real (liberadas)».
- **Ya existe:** semáforo, dónde está, próximo paso, atraso y cuello de botella del motor, ficha, agrupador común.
- **Falta:** los 30 días de «probablemente entregada» pasan a parámetro; el **motivo del atraso** por orden no se registra en ningún lado → se anotaría al atender una advertencia de fecha o al cambiar la fecha compromiso, con motivo de la tabla 15 (uso nuevo «atraso») y auditoría.

### 3 · ¿Alcanza la capacidad? (carga contra capacidad) — Prioridad 1
- **Para quién / cuándo:** la usuaria, Jordan y Fernanda (semanal); gerencia solo el mes.
- **Pregunta:** ¿alcanza la capacidad de cada centro esta semana, este mes y el que viene, y con qué base está contado?
- **Contenido:** UN cuadro centro × período con selector de horizonte (semanas · mes del Proyecto · mes calendario) y selector de base en la cabecera. Celda: % de uso (verde / ámbar / rojo), minutos firme · en proceso · reserva. Filas por ítem de planificación y sub-área (nunca lista fija); tejeduría y tintorería en horas de máquina y kg, bordado en puntadas. Tarjetas: no alcanzan · justos · con extras · sin capacidad. Clic en celda → lista de órdenes. Enlaces «anotar decisión» (Capacidad y decisiones) y «simular personas/días» (Plan mensual bloque 1). Solo lectura.
- **Base escrita:** programadas (motor, liberadas) por defecto | abiertas | plan congelado (número oficial del mes).
- **Ya existe:** cuenta única de carga, capacidad por día con ajustes, matriz de capacidad, número oficial del mes.
- **Falta:** nada que registrar. Las cuentas paralelas (Producto en proceso, Reportería por área, Resumen gerencial, Mes en curso de Hoy) se retiran y todas leen la cuenta única.

### 4 · Planta esta semana (cumplimiento del congelado por centro) — Prioridad 1
- **Para quién / cuándo:** Jordan y Fernanda y la usuaria; cada supervisor su fila; gerencia el total. Lunes (semana cerrada) y cada mañana.
- **Pregunta:** ¿cada centro cumplió lo congelado, quién está atrasado, qué días no se registró nada y qué se agregó o se sacó después de congelar?
- **Contenido:** selector de semana (cualquier lunes, con flechas). Tarjetas: programadas · hechas · cumplimiento % (o «sin registros esta semana») · centros sin registrar · paros min. UNA tabla centro y sub-centro × (programadas, hechas, pendientes, %, atrasadas, agregadas, sacadas, días sin registro, congelado vN del día X o «sin congelar») en el orden del flujo, con total planta. Matriz centro × día con ✓ registro / — laborable sin registro / · no laborable. Pedidos de congelamiento abiertos. Clic en fila → Resumen del centro. Vista mensual del mismo bloque = lo que hoy es Avance del mes (base: plan congelado del mes, con las cerradas con faltante).
- **Base escrita:** «liberadas a producción · programa real · contra el congelado semanal de cada centro».
- **Ya existe:** congelado por centro, avance contra el congelado, hechas del día (cuenta única), matriz de registro, resumen de sub-centros.
- **Falta:** guardar el **cierre de cada semana** por centro (programadas, hechas, paros, sin registro) al estilo del cierre de mes, fuera del dibujo de pantalla; sin eso no hay historia. Quitar el recorte de 90 días de asistencia y turnos (contradice «nada se borra»).

### 5 · Reportes por tramo (una sola plantilla, cuatro bandas) — Prioridad 1 (tejeduría, tintorería, corte, confección, empaque) · 2 (servicios, terminados)
- **Para quién / cuándo:** cada supervisor el suyo (Santiago, Mariela y Paola, Maquila, Terminados), Jordan y Fernanda y la usuaria todos; gerencia lee las tarjetas. Diaria y semanal.
- **Pregunta común:** ¿qué viene y cabe (CARGA), qué se hizo día a día (AVANCE), cumplimos lo congelado o la fecha (CUMPLIMIENTO), qué volvió y por qué (CALIDAD)?
- **Base escrita común:** «liberadas a producción · programadas por el motor · centro/recurso X · semana del…» (textil: «abiertas con tela propia · kg crudo sin merma»). Los sub-centros salen de la columna «Ítem de planificación», nunca de una lista fija. «Sin registros» nunca es 0.

| Tramo | Para quién | Lo propio de este tramo | Qué falta registrar (y dónde) |
|---|---|---|---|
| **Tejeduría** | usuaria, piso tejeduría | Kg pedidos vs stock · programado a mano · estimado por el sistema · por cubrir, por tela; máquina × semana en **kg**, no en horas; programado vs tejido (kg reales) por día; telas listas después de lo requerido; fallas de tela detectadas en calidad de tintorería | Registro del día (máquina, tela, kg, turno, quién) para lo tejido fuera de programa · paros de tejedoras · motivos de falla de tela marcados «tejeduría» en la tabla 15 |
| **Tintorería** | usuaria, tintorería | Kg esperando baño por color/familia; baños por máquina × semana y % de llenado; baños salidos con código, kg programados vs reales; kg pedidos vs entregados del mes; en calidad · faltantes; reprocesos por motivo y origen con kg y horas de máquina; merma real vs configurada | Hora real de entrada y salida del baño (en «Baño hecho») · motivo cuando salen menos kg (tabla 15, uso nuevo) · paros de máquina · el 3 % de tolerancia pasa a parámetro |
| **Corte** | Santiago | Semana × minutos vs capacidad; lo que viene (tela lista por liberar, liberadas sin fecha con motivo); día × programado vs hecho; cierres del paso; segundas y cierres con faltante | Tela consumida por orden (kg por tela y retazo) al cerrar el paso · motivo de segundas (tabla 15) · el tiempo real solo llega si se usa la tablet |
| **Servicios** (estampado, bordado, sublimado, etiquetas) | Santiago | Por sub-área; bordado en puntadas; OT de Odoo cerradas vs abiertas (tramo no secuencial); rutas incompletas contadas como **brecha** con enlace a Rutas, no como carga | Reprocesos con motivo · servicio externo: enviado / recibido |
| **Confección y maquila** | Mariela y Paola, Maquila | Módulo × semana (personas × min × eficiencia, manda la asistencia del día); módulo × día programado vs hecho; tramos del día con SAM real vs estándar y semáforo; eficiencia del módulo = SAM × prendas buenas ÷ minutos-persona; segundas por módulo y talla; **Maquila**: qué está afuera, prendas, días afuera, cuándo debe volver, volvió | Maquila: «Enviado / Recibido» (fecha, prendas por talla, taller) y catálogo de talleres · operaria(s) en el tramo si se quiere eficiencia por persona (decisión de la usuaria) · motivo de segundas · ventanas de descanso por centro (sin ellas el minuto real sale inflado y se avisa) |
| **Terminados** (botones y ojales, lavado, plancha) | Terminados | Botones/ojales en minutos; lavado y plancha «por días»: órdenes en espera, días desde que entraron, fecha esperada de vuelta (planta 3 / Quito 15, marcado no definitivo); mientras no estén en rutas: «0 órdenes con este paso en su ruta», nunca «0 h» | Lavado externo: enviado / recibido con prendas · motivo de reproceso de lavado |
| **Empaque y entrega** | Terminados (empaque), Jordan y Fernanda, gerencia | Día × programado vs empacado; ODC completos vs parciales; prendas empacadas vs pedidas por orden; por mes de fecha meta, cliente y ODC: a tiempo vs tarde y días de atraso, $ terminado vs meta; «no medibles» aparte. Entregas se queda como está y se enlaza | Fecha real de despacho y prendas despachadas (al cerrar Empaque o por ODC en Entregas) — hasta entonces se mide «terminada, no despachada» · 22 rutas sin Empaque (brecha visible) |

- **Ya existe:** Resumen del centro, avance de la semana, tarjetas de día, tramos de la tablet, cierres, segundas, reporte del mes de Tintorería, programación manual de tejeduría, resumen de sub-centros. Reportería textil y por área desaparecen: sus tablas viven aquí, cada una en su tramo.

### 6 · Liberaciones (textil y a producción) — Prioridad 2
- **Para quién / cuándo:** la usuaria (textil), Jordan y Fernanda (a producción), gerencia (ritmo). Semanal.
- **Pregunta:** ¿cuánto se liberó por día / semana / mes, quién lo hizo, cuánto falta del mes y qué lo frena?
- **Contenido:** dos columnas iguales (Tela · A producción): liberadas por período (órdenes, prendas, kg, $) con barras; por liberar del Proyecto del mes agrupado por causa (falta confirmar ruta, falta calidad de tintorería, tela por llegar, sin WH); días entre tela lista y liberación; reversiones del período con motivo. Enlace a Liberación.
- **Base escrita:** «Proyecto del mes · liberado + pendiente = total» (ya probado).
- **Ya existe:** resumen por período dentro de Liberación (se muda aquí y deja un enlace). **Falta:** nada; lo liberado antes del 16-sep queda «fecha desconocida», no se inventa.

### 7 · Paros, asistencia y tiempos reales — Prioridad 2
- **Para quién / cuándo:** supervisores (su centro), Jordan y Fernanda, la usuaria, ingeniería. Semanal.
- **Pregunta:** ¿cuántos minutos se perdieron, por qué motivo, en qué recurso y qué % del tiempo disponible es; cuánta gente hubo cada día; y cómo van los minutos reales contra el SAM?
- **Contenido:** paros por motivo × recurso × semana (min, veces), uniendo los dos registros (Control de piso y tramo de la tablet) sin contar almuerzo ni cierre del día; asistencia por recurso y día vs personas configuradas; SAM real vs estándar por categoría y centro con semáforo y el número de tramos detrás de cada cifra; tramos olvidados y corregidos.
- **Base escrita:** «tramos cerrados y paros registrados del período · solo centros con registro».
- **Ya existe:** ambos registros de paros, cálculo del tramo, asistencia, motivos de la tabla 15. **Falta:** habilitar paros en tejeduría y tintorería (el registro existe, el botón no); un centro sin registro sale «sin registros», no «0 paros».

### 8 · Tiempos para ingeniería (con Excel) — Prioridad 1
- **Para quién / cuándo:** ingeniería (Santiago Garzón) y la usuaria. Semanal hasta cerrar la brecha; luego tras cada carga de Odoo.
- **Pregunta:** ¿a qué categorías y operaciones les faltan tiempos, cuántas órdenes y minutos afecta en cada base, y qué está pendiente de confirmar?
- **Contenido:** tabla categoría (padre / hija) × hoja de operaciones sí/no · minuto estimado y fuente · pendiente de confirmar · órdenes afectadas en las cuatro bases · prendas · minutos potenciales; operaciones sin centro; incoherencias derivadas de los datos (p. ej. Short Cargo > Pantalón Cargo); rutas estimadas sin revisar; las 11 hijas sin familia de operaciones (7 familias enteras: JOGGER, Fleece Básico, Fleece Pesado, TEJIDOS, FALDAS, ENTERIZO, ACCESORIOS). Botón **«Exportar a Excel»** con esas columnas más «minuto por prenda (ingeniería)» y «observación» vacías, para llenarlo y cargarlo de vuelta por la carga de tiempos (con vista previa, ya existe). Se mide contra el catálogo real, nunca contra el demo.
- **Base escrita:** por regla (cargadas / abiertas / lanzadas / liberadas).
- **Ya existe:** categorías sin hoja, carga por bases, alertas de tiempos, operaciones sin centro. **Falta:** solo la exportación a Excel; los tiempos mismos los pone ingeniería.

### 9 · Rutas por confirmar — Prioridad 1 (mover y juntar)
- **Para quién / cuándo:** Jordan y Fernanda (dueños de las rutas), la usuaria. Diaria.
- **Pregunta:** ¿qué órdenes tienen ruta sin confirmar, estimada sin revisar, sin Empaque, sin secuencia o contra la ruta por defecto, y cuáles frenan una liberación?
- **Contenido:** una tarjeta por causa con su lista (foto+WH+fase, categoría, pasos, diagnóstico contra las OT de Odoo: coincide / difiere / sin OT / sin mapear) y botones confirmar · aplicar a la referencia · editar (solo con permiso de rutas). Agrupador por referencia, categoría, cliente.
- **Base escrita:** lanzadas.
- **Ya existe:** todo, repartido entre Órdenes → Rutas, el Resumen gerencial y el pie de Reportería; aquí se junta y Órdenes → Rutas sigue siendo donde se edita. **Falta:** la decisión pendiente «confirmar las que coinciden con Odoo».

### 10 · Salud del sistema — Prioridad 2 (sale de Reportería)
- **Para quién / cuándo:** admin y planificación solamente; después de cada «Actualizar datos» y cuando una cifra no cuadre.
- **Pregunta:** ¿los datos están completos y coherentes como para confiar en los reportes, y quién corrige qué?
- **Contenido:** las 24 reglas de la auditoría agrupadas por quién resuelve (rutas → Jordan y Fernanda; catálogo y tiempos → ingeniería; motor y liberación → planificación), cada una con enlace a la bandeja o pantalla donde se arregla; conteo de órdenes con las cuatro bases y la tabla de restas; chequeo de siembras (se oculta solo al quedar todo aplicado); registro de cargas; motivos vacíos por uso; centros sin recurso, capacidad 0 o sin ventanas. Se calcula al abrir, no en cada pantalla. Ubicación: Configuración → «Salud del sistema».
- **Falta:** nada que registrar; el 5 % de sobrecapacidad de la auditoría pasa a parámetro.

## 3 · Qué se quita o se funde del menú actual

| Hoy (menú Reportería) | Mañana |
|---|---|
| Resumen gerencial · Avance del mes · Cumplimiento (parte A) | **1 · ¿Cómo va el mes?** (una sola pantalla; historia plegada al pie) |
| Vista general de órdenes · Asignación por orden · Producto en proceso (lista) | **2 · ¿Dónde está cada orden y cuál no llega?** (las tres páginas quedan como alias que abren este bloque en su tarjeta) |
| Reportería por área (tabla recurso × semana) · «Mes en curso» de Hoy · matriz de Capacidad y decisiones | **3 · ¿Alcanza la capacidad?** (Carga general y Capacidad y decisiones siguen como pantallas de planificación con el mismo cuadro) |
| Reportería por área (plan vs real) · Avance del mes (vista mensual) | **4 · Planta esta semana** |
| Reportería textil · Producto en proceso (pestañas tej/tin) · reporte del mes de Tintorería · Reportería por área (por sub-área) | **5 · Reportes por tramo** (Tejeduría, Tintorería, Corte, Servicios, Confección y maquila, Terminados, Empaque y entrega) |
| Resumen por período dentro de Liberación | **6 · Liberaciones** (Liberación deja un enlace) |
| Cumplimiento parte B (semanas congeladas viejas) | **Se retira.** Las fotos guardadas se conservan como histórico plegado; el único congelado semanal es el de cada centro |
| Nueve paneles al pie de Reportería (auditoría, siembras, conteos, categorías sin hoja, sin fecha, rutas) | **9 · Rutas** (lo de rutas) · **8 · Tiempos** (categorías sin hoja) · **10 · Salud** (el resto, en Configuración). Ningún perfil de piso los vuelve a ver |
| Paneles de corrección de rutas del Resumen gerencial | Órdenes → Rutas (donde trabajan Jordan y Fernanda) |
| «Reportería textil» duplicada en Planificación textil · Vencidas y Entregas de la semana dos veces en Hoy | Una sola vez cada una; Hoy enlaza a los bloques 1 y 2 y no calcula por su cuenta |

**Limpieza de cuentas (no de datos: ningún registro ni función de piso se borra):** una sola cuenta de minutos pendientes; «hechas» con dos definiciones declaradas; el semáforo como único estado en columna; Resumen gerencial con el programa real (casilla explícita «como si todo estuviera liberado» que cambia la nota de base); previsiones fuera de la cartera o como base declarada; código muerto fuera; valores fijos → parámetros (30 días, pesos de avance, 5 %, 3 %, topes de filas que dicen «N más»); ningún cierre ni siembra se guarda mientras se dibuja una pantalla; sin recorte de 90 días en turnos.

## 4 · Principios visuales (aplican a Reportes y, por lo pedido el 20-sep, a todo el sistema)

1. **Bloques enmarcados y llenos.** Cada bloque es un panel con borde marcado y título en banda oscura; dentro, sub-bloques con marco propio y etiqueta de sección en negrita. Lo importante (cifras con base, semáforo rojo, totales) lleva borde más oscuro para que nada se vea plano. Cuando dos cosas conviven (proveeduría y centros en la ficha, con ruta y sin ruta en Órdenes), cada una va en su recuadro con título.
2. **Abiertos por defecto.** Los bloques nunca llegan cerrados; la usuaria cierra los que ya revisó y la app lo recuerda por usuario.
3. **Ancho completo.** El reporte ocupa toda la pantalla menos 16 px de margen, sin barras laterales vacías; las tablas anchas hacen scroll propio, no la página.
4. **Cabecera de tres líneas** en todos: la pregunta como título (lenguaje de planta: SAM, orden de llegada, cuello de botella, días de holgura), contexto con base · período · datos al…, y el «?» con la explicación larga. Un solo botón «Filtrar». Ningún párrafo suelto.
5. **Toda cifra dice su base y de dónde sale.** Número grande, debajo en gris la base (lanzadas · abiertas · programadas · plan congelado); tooltip o «?» con la tabla o parámetro que la produce y dónde se cambia.
6. **Cero es cero; faltante es faltante.** «—» con texto («sin registros», «sin congelar», «sin fecha real», «sin tramo», «dato faltante» con enlace a donde se registra). Nunca 0 % ni un valor supuesto. Si una lista se corta, dice cuántas quedaron fuera.
7. **Un solo semáforo.** Verde / ámbar / rojo / gris con su verbo en toda lista de órdenes (rojo solo meta vencida; ámbar va tarde o paso tarde; gris sin dato o bloqueo). El mismo código de color para % de uso y para SAM real vs estándar. Los colores no cambian de significado entre reportes.
8. **Una fila = una orden** con foto + WH + fase; ODC en columna propia; seis columnas visibles y «más columnas» al tocar; agrupador común de hasta tres niveles con horas por grupo; clic en fila → ficha, clic en centro → Resumen del centro, clic en cifra → su lista, siempre con «← atrás».
9. **Mismos ejes y mismos controles en el mismo lugar:** día × (programado, hecho, %) y semana × centro; centros siempre en el orden del flujo; unidades escritas en la cabecera (kg crudo, min, prendas, puntadas, h de máquina); barras simples, sin gráficos nuevos salvo la historia mensual.
10. **Cada bloque se imprime y se exporta** (PDF / Excel con las mismas columnas, sin datos internos para el piso) y funciona en teléfono y tablet con el responsive del sistema.

## 5 · Plan de entrega en tres pasos

**Paso 1 — Mover y juntar (sin cálculos nuevos).** Portada «Mis reportes» y menú nuevo con roles por perfil; bloques 1, 2, 3 y 4 armados con lo que ya existe (Resumen gerencial, Vista general, cuenta única de carga, congelado por centro); bloque 9 Rutas juntando lo repartido; bloque 10 Salud fuera de Reportería y fuera de la vista del piso; bloque 8 Tiempos con el **Excel para ingeniería**; principios visuales 1–3 (marcos, abiertos, ancho completo) aplicados a Órdenes, la ficha y los reportes. Se retiran Cumplimiento parte B y el código muerto. Pruebas del simulador antes de publicar.

**Paso 2 — La plantilla de tramo y las cuentas únicas.** Bloque 5 con las cuatro bandas para Tejeduría, Tintorería, Corte, Confección y maquila y Empaque y entrega (Servicios y Terminados con la misma función, parametrizada por ítem); bloque 6 Liberaciones y bloque 7 Paros y tiempos reales; una sola cuenta de minutos pendientes y de «hechas»; valores fijos → parámetros; ningún guardado durante el dibujo; sin recorte de turnos.

**Paso 3 — Registros nuevos e historia (cada uno con aprobación de la usuaria).** Maquila y lavado externo «enviado / recibido»; fecha real de despacho al cerrar Empaque; hora real de entrada y salida del baño; registro del día de tejeduría y paros textiles; motivo de segundas, de atraso y de diferencia de kg en la tabla 15; operaria(s) en el tramo si se decide medir por persona; cierre de cada semana guardado por centro y la Historia del bloque 1 alimentándose sola desde ese momento.



## Nota del 20-sep

El bloque 8 (Excel para ingeniería) ya se entregó esta misma noche como ; el botón «Exportar a Excel» dentro de la app queda para el paso 1. Los principios visuales 1–3 ya se aplicaron a Órdenes, la ficha y los paneles de todo el sistema (commit a5e5944).
