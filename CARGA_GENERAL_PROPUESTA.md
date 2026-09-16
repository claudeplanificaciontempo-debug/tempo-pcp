# Carga general — propuesta (no se construyó nada)

Fecha: 15-sep-2026. Solo diagnóstico y propuesta. No se tocó `index.html` ni el motor.

## 1 · Qué muestra hoy cada pieza, y dónde se repite

La pantalla **Carga general** (menú Planificación de producción) tiene hoy tres bloques, en este orden:

| Bloque de hoy | Qué muestra | De dónde salen los números | Dónde más se ve lo mismo |
| --- | --- | --- | --- |
| Carga por centro y recurso | Tabla recurso × semana, minutos cargados contra capacidad, con prendas y órdenes en el tooltip | El programa vigente (minutos por recurso y día) | Reportería por área (misma tabla por semana), Centro → Planificación (la misma semana de un centro), Plan mensual bloque 1 (por área y por módulo) |
| Qué hay cargado en cada centro | Centro × categoría × semana, prendas y minutos, con el porcentaje que representa cada categoría | El programa vigente | Parcialmente en Plan mensual (carga por tipo de producto) y en Centro → Resumen de la semana (día × familia) |
| Asignación por orden | Una fila por orden abierta, clasificada en vencida de un paso, sin programar, no llega, justa y bien, con su próximo paso y el detalle de la ruta al clic | El programa vigente, orden por orden | Hoy → bandejas (en riesgo, vencidas, sin fecha), Vista general de órdenes, Producto en proceso, Advertencias de fecha |

**Carga por tipo de producto** (`cargaTipoProductoHTML`) no vive en Carga general: está dentro del **Plan mensual**.
Muestra, para el mes elegido, filas por familia, categoría, módulo y cliente con órdenes, prendas, minutos y
porcentaje, con su propio agrupador y sus propios filtros.

**Duplicados reales que hoy conviven**:
1. La tabla recurso × semana está en Carga general, en Reportería por área y, recortada a una semana, en cada centro.
2. La clasificación de órdenes de Asignación por orden repite lo que Hoy ya resume en tarjetas y lo que Vista general
   de órdenes muestra con más filtros.
3. El cruce por categoría existe en tres formas distintas: centro × categoría × semana (Carga general), familia × día
   (Centro → Resumen de la semana) y familia/categoría/módulo/cliente × mes (Plan mensual).

## 2 · Estructura propuesta

Carga general pasa a ser **solo consulta**: contesta «cuánta carga hay contra cuánta capacidad», por área, centro,
familia y semana. No clasifica órdenes, no propone decisiones y no decide el mes.

**Barra de arriba (una sola línea)**: área (textil / producción), centro (todos o uno), rango de semanas (4, 8 o 12),
filtro de fases común y buscador común. El agrupador común aparece cuando se baja al detalle.

**Bloque 1 · Carga contra capacidad por semana.** Una fila por centro (o por recurso al entrar a un centro) y una
columna por semana. Cada celda con tres números separados, no sumados a ciegas:
- **firme**: lo liberado y programado;
- **en proceso**: lo que ya arrancó y todavía carga;
- **reserva**: lo estimado que no está programado, hoy solo lavado y plancha.
Debajo de los tres, el **porcentaje de uso** contra la capacidad de esa semana. Semáforo con el mismo umbral que
Capacidad y decisiones (el parámetro de ámbar que ya existe).

**Bloque 2 · Familia por centro (o por área).** Cruce con unidades, horas y porcentaje sobre el total del centro, que
se da vuelta igual que en Carga que viene. Es el mismo componente, no uno nuevo.

**Bloque 3 · Detalle.** Al hacer clic en una celda o en una fila del cruce, se abre la lista de órdenes que generan esa
carga, con el agrupador común, foto, WH y fase, y el **← atrás** que devuelve a la celda de la que saliste.

Nada más. Sin clasificación de riesgo, sin propuestas de acción.

## 3 · Qué se mueve, qué se queda y qué propongo quitar (nada se borra sin tu confirmación)

| Pieza | Propuesta | Por qué |
| --- | --- | --- |
| Carga por centro y recurso | **Se queda** en Carga general, como bloque 1, con firme / en proceso / reserva | Es el corazón de la consulta |
| Qué hay cargado en cada centro | **Se reemplaza** por el cruce familia × centro del bloque 2 | Mismo dato, con el componente común y sin tabla propia |
| Asignación por orden | **Se mueve** a Reportería, como reporte propio, con su nombre actual | Es análisis por orden, no carga contra capacidad. Tiene usuarios: no propongo borrarla |
| Carga por tipo de producto (Plan mensual) | **Se queda donde está** | Ahí sirve para decidir el mes; en Carga general sería el mismo cruce del bloque 2 |
| Tabla recurso × semana de Reportería por área | **Se queda**, pero apuntando al mismo cálculo que Carga general | Reportería mira hacia atrás; Carga general, hacia adelante |

Si prefieres que Asignación por orden desaparezca en vez de mudarse, dilo explícitamente: no la quito por mi cuenta.

## 4 · Cómo queda el menú

Planificación de producción: Liberación a producción · **Carga general** · Corte · Confección · Estampado · Bordado ·
Terminados · Empaque · Balanceo · Programa del día · Reportería por área.

Reportería: Vista general de órdenes · **Asignación por orden** (entra aquí) · Producto en proceso · Cumplimiento ·
Avance del mes · Reportería textil · Reportería por área.

No se agregan entradas nuevas: una se muda de grupo.

## 5 · Riesgos: por qué hoy los números pueden no cuadrar

Hoy la palabra «carga» significa tres cosas distintas según la pantalla, y ese es el riesgo principal:

1. **Carga general y Reportería** usan la carga del **programa vigente**: minutos por recurso y día que salieron de
   programar. Solo incluye lo que el motor pudo programar, es decir, lo liberado y sin bloqueo.
2. **Capacidad y decisiones** usa otra cuenta: recorre las **órdenes abiertas** y suma los minutos pendientes de cada
   centro, agrupados por el mes del Proyecto. Incluye órdenes que el motor no programó.
3. **Plan mensual** usa una tercera: los minutos pendientes de **las órdenes del plan** (las que están en proceso más
   las agregadas), que no son ni todas las abiertas ni solo las programadas.

Con tres bases distintas, tres pantallas pueden dar tres números para el mismo centro y el mismo mes sin que ninguna
esté mal. Propuesta para cerrarlo:

- **Una sola función de carga** con dos argumentos: qué conjunto de órdenes (programadas, plan del mes, todas las
  abiertas) y qué período. Las tres pantallas la llaman con distinto argumento y muestran, en una nota bajo el título,
  **con qué base está calculada**.
- **Cada pantalla dice su base** en pantalla, con el mismo texto que ya usamos en el Plan mensual.
- **Una prueba del simulador** que compare las tres pantallas con la misma base y falle si difieren. Hoy no existe.
- **La reserva de lavado y plancha** necesita definición: en la base de prueba esos centros no tienen minutos por
  prenda ni porcentaje estimado cargados, así que hoy la reserva sería cero. Sin esos dos números la columna queda vacía.

## 6 · Decisiones que necesito de ti

1. ¿Asignación por orden **se muda** a Reportería, o prefieres que se quite del todo?
2. ¿La columna **reserva** es solo lavado y plancha, o también quieres reservar algo en bordado y estampado externos?
3. Para la reserva hacen falta los **minutos por prenda y el porcentaje estimado** de lavado y plancha. ¿Los defines tú
   o los dejamos en cero hasta tenerlos?
4. Cuando Carga general y Capacidad y decisiones difieran, ¿cuál manda como número oficial?
5. ¿Carga general muestra **todas las órdenes abiertas** o solo las **liberadas y programadas**? Mi recomendación: las
   programadas como número principal, y las abiertas como segunda línea, para que se vea lo que falta liberar.
6. ¿Cuántas semanas quieres ver por defecto: 4, 8 o 12?
