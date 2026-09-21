# Entrega de la noche del 20 al 21 de septiembre de 2026

Resumen para la mañana, en el orden en que lo pediste. Todo está publicado en `main` (GitHub Pages se
actualiza solo). Al final, lo que quedó pendiente y lo que conviene revisar tú.

## 1 · Tiempos: cambiar uno cambia todo el plan (comprobado)

- **Todo cambio de tiempo se aplica al momento a todas las órdenes abiertas** (las cerradas no): SAM que
  manda por tipo de producto, hoja de operaciones, minuto del centro, botones estándar, etiquetas, minuto
  estimado, recarga de la hoja. Queda en bitácora (antes/después) y lo escrito a mano en la ficha no se pisa.
- **Todo lo que es tiempo vive en Configuración → Operaciones**, en orden de mando: lo que manda por tipo →
  la hoja → minuto del centro (sin operaciones) → ojales y botones (tabla y estándar; salió de Calendario) →
  etiquetas → minuto estimado. Ya no hay que buscar en tres pantallas.
- Prueba de punta a punta (**T21e**): al cambiar el SAM de un tipo de producto, cambian la ruta de la orden,
  los minutos del programa (`programar`), el saldo de la nivelación y Carga general, en la misma proporción;
  al volverlo, todo vuelve.

## 2 · Nivelación: Confección = módulos + maquila en un solo recuadro; en riesgo y sin SAM con lista

- Maquila va **dentro de la bandeja Confección**; botoncitos por módulo para ver personas/horas y el tambor
  de ese módulo.
- ⚠ **En riesgo** y **sin SAM** son clicables: lista de órdenes en riesgo (las de entrega más lejana cuyo
  trabajo cae en los últimos días de holgura) y lista por tipo de producto sin SAM con el enlace a donde se
  arregla.

## 3 · Reportería (tu pedido de anoche)

- Menú Reportería: **Resumen gerencial · Producto en proceso · Avance por área · Cumplimiento · Avance del
  mes**. Se quitaron Asignación por orden, Vista general, Reportería textil y Reportería por área; los enlaces
  viejos llevan a las nuevas y los perfiles que las tenían reciben las nuevas solos.
- **Producto en proceso = una pivot como la de Odoo**: por fase (por defecto) con **Órdenes · Prendas pedidas ·
  Total $**, total arriba; botones para Cliente → Fase, Fase → Cliente, Familia, Familia → Tipo
  de producto, Cliente, o armar la tuya con el agrupador; cada grupo se despliega hasta la orden (foto, WH,
  fase, cliente, ODC, estilo, color, entrega, dónde está, estado) y el clic abre el detalle. Base: abiertas
  (como Odoo), y se puede cambiar a lanzadas o liberadas. Filtro de fases y buscador comunes.
- **Avance por área**: una fila por área (Corte, Confección, Estampado, Bordado, Terminados…) con programadas,
  hechas, pendientes, cumplimiento, ocupación, atrasadas y contra lo congelado, **con los mismos números del
  «Avance de la semana» de cada centro**; **cada ingeniero ve solo su área**, los demás todas; clic → día por día y las
  órdenes programadas de la semana con lo hecho, y «abrir el centro». Tejeduría y tintorería de la semana
  para quien ve textil.
- La **Auditoría del sistema** y lo técnico que estaba en «por área» no se perdió: está en **Configuración →
  Salud del sistema** (solo admin y planificación). De paso apareció ahí el panel de rutas sin Empaque, que
  existía pero no se mostraba en ninguna pantalla.
- Los **días de holgura** (parámetro de «en riesgo») se editan ahora en Calendario y parámetros (antes solo en
  Asignación por orden).
- Detalle en `REPORTERIA_21SEP.md`.

## 4 · Tallas desde tu archivo de Odoo (Tarea_project.task85.xlsx)

- Sí se puede: la talla va **dentro del texto** de cada línea y el sistema la saca comparando la línea con el
  nombre del pack («… ESCO- S- CAFE -» → S; «BLANCO SMALL» → S; «PEARLXSMALL» → XS; «MEDIUM WASH 2R» → 2R,
  porque MEDIUM WASH es color; «28X32»; «28- NEGRO» → 28). Los alias (SMALL=S, XLARGE=XL…) están en la
  tabla 16, editables.
- Se carga en **Órdenes → Actualizar datos → 4 · Tallas del pedido**. La vista previa te enseña **cómo leyó
  cada talla** y las curvas (talla → cantidad) antes de guardar nada.
- Sobre tu archivo: **3.395 líneas de prenda con WH, 0 sin talla** (más 310 líneas de **56 tareas que todavía no
  tienen WH**, que se cuentan aparte y no se cargan); 689 WH, de las cuales **595 existen** en el volcado del
  simulador (el del 14-sep; las 94 que faltan son WH nuevas, WH/MO/293xx, que en producción sí están);
  **578 suman exactamente** la cantidad de la orden; 7 no cuadran por pocas unidades (EXCEDENTES 12 vs 9,
  dos «Cross» 9 vs 90, 162 vs 168, 128 vs 220, 424 vs 414, 348 vs 342) y se cargan marcadas; el aplique de
  pedrería no entra.
- Con la curva cargada, **Control de piso y Mi centro registran por talla** (ya estaba hecho; solo faltaba
  la curva).
- Detalle en `TALLAS_LISTA_PEDIDO_ODOO.md`. Tu archivo no se subió al repositorio.

## 5 · Tintorería: Macro → Tintorería

- Estado de tintorería abre con **«Antes de tintorería»** (tela propia por tinturar cuya fase va antes de
  Tintorería) y el botón **«→ Tintorería»** mueve la fase; después sigue el «Hecho → calidad» de siempre.

## 6 · Pruebas

- Simulador completo: **2.793 comprobaciones, 0 rojas, 0 errores** (corrida r=93, la última, con todas las
  correcciones de la revisión), incluidas las nuevas: T21e, TL (tallas), TM (tintorería), REP (pivot), Avance por
  área, Salud, redirecciones, SR (sin registros solo días pasados).
- Revisión adversarial (agentes que intentan refutar cada hallazgo) sobre lo nuevo: ver la sección 8.

## 7 · Para que revises tú (decisiones tuyas)

1. **Santiago**: confirmar los tiempos marcados «por confirmar» (camisetas por tipo 4,47–6,51, corte/empaque
   de las familias sin hoja, botones 0,40) — en Operaciones → «Tiempos que mandan sobre la hoja» con el ✓.
2. **Tallas**: cargar el archivo en producción (Actualizar datos → 4) y mirar la vista previa (las 56 tareas sin
   WH salen aparte; cuando Odoo les dé WH, se vuelve a cargar el archivo). Cuando quieras, crear los juegos de
   tallas por categoría en la tabla 16 (hoy vacía; no hace falta para registrar).
3. **Reportería**: dime si en Producto en proceso quieres otra agrupación rápida por defecto o columnas
   distintas; y si en Avance por área los ingenieros deben ver también la semana siguiente.

## 8 · Revisión adversarial (4 revisores + 45 verificadores que intentaron refutar cada hallazgo)

**28 hallazgos confirmados, todos corregidos esta noche**; 17 rechazados (estilo, o ya cubiertos). Los que
importan para ti:

- **Tallas**: las filas sin WH pero con pack **no son otro color de la WH de arriba: son tareas sin orden de
  producción** (56 en tu archivo, 15.889 prendas) — ahora se cuentan aparte y no se cargan hasta que Odoo les dé
  WH. Antes se habrían pegado a la WH anterior y la suma no cuadraba. El lector de CSV entiende comillas
  («1,092.00» ya no se lee como 1); los alias de la tabla 16 mandan también en qué es talla («2XL», «UNICA»);
  «10/12», «6-8», «28 X 32» son una sola talla; una línea con otro código que el pack **no entra** y se lista;
  al recargar, la curva anterior se conserva y se avisa si el piso ya registró por talla.
- **Avance por área**: «sin registros» solo se reclama a los días laborables que **ya pasaron** (hoy y la semana
  que viene decían «sin registros» en rojo); esto también arregla el Avance de la semana y las tarjetas de día
  de cada centro. Un ingeniero que ve una sola sub-área de un ítem ve solo lo suyo (y se marca); «abrir el
  centro» abre el ítem completo; «contra lo congelado» dice cuántas sub-áreas están congeladas; «hechas» por
  orden dice que es el acumulado en el centro.
- **Producto en proceso**: un perfil que ve solo sus centros ve solo esas órdenes (y la pantalla lo dice) —
  **decisión tuya si prefieres que todos vean toda la cartera**; el filtro de fases se limpia al cambiar de base;
  Entrega = fecha meta (la misma del semáforo); las prendas/minutos pendientes salen de la misma cuenta que
  Carga general (no de un segundo cálculo); «Pedido» se llama «Prendas pedidas».
- **Enlaces muertos que existían desde antes**: la bandeja «Pasos que el motor no programa» y «rebalancear» en
  Ejecución de Confección no llevaban a ninguna parte; ahora sí (Salud del sistema y la pestaña Costura).
- **Antes de tintorería** solo lista órdenes lanzadas (con WH) y avisa si la tabla de fases no tiene
  «Tintorería» en vez de callarse.
