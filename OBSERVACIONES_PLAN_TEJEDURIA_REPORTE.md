# Observaciones del plan maestro y tejeduría — reporte

Fecha: 15-sep-2026. Motor de programación sin tocar. Pruebas del simulador: 741 (13 nuevas), todas verdes.

## Plan mensual

**1 · El plan no arranca vacío.** El Bloque 4 arranca con **todo lo que ya está en proceso** (fase 2Planificacion en
adelante) de ese Proyecto y de meses anteriores aún abiertos: ya tienen tela y ocupan capacidad. "En el plan de
septiembre" dice "N en proceso + M agregadas" y lista las en proceso en un desplegable (foto, WH, fase, cliente,
categoría, color, prendas, entrega, proyecto). El aviso de capacidad y las barras por centro cuentan lo en proceso
**más** lo que agregas: lo que agregas se evalúa encima de lo que ya hay. Al congelar, la versión guarda ambas.
Regla exacta de "en proceso": orden abierta con fase ≥ 2 y Proyecto ≤ mes del plan (las de meses futuros ya en
producción no entran al plan de este mes).

**2 · Lo en proceso no se "agrega".** En "Agregar órdenes al plan" solo aparecen las de **fases tempranas** (fase 0 y 1:
diseño, recetas, adquisición, macro, órdenes de compra, tejeduría/tintorería) del mes, y las del mes siguiente cuando
activas "jalar" (también solo tempranas).

**3 · Agrupar por fase** en "Agregar": nuevo campo **Fase** (ahora es el agrupador por defecto), ordenado por número de
fase, grupos colapsados con conteo y prendas; siguen ODC, cliente, entrega, familia y categoría hija.

**4 · Resumen por centro compacto.** En el Bloque 1 la tabla larga por centro se reemplazó por **un bloque por centro**:
% de uso grande, unidades, horas programadas de horas disponibles, y la etiqueta "alcanza" / "no alcanza · faltan X h"
/ "sin capacidad"; borde de color según el uso; clic abre el centro.

**5 · Semanas vacías.** En las metas semanales de producción y facturación solo se muestran las semanas con algo
(prendas planificadas, reales, o entregas); el título dice cuántas quedaron ocultas. En el simulador de capacidad, las
semanas sin carga ni ajuste se colapsan en una línea con "mostrar".

**6 · Fotos y fase en liberación (dentro del plan).** Confirmado y completado en los dos bloques del Bloque 3:
- "Base del plan: lo liberado" → desplegable "Ver las N sin liberar o sin decidir" con **foto, WH y fase**, cliente,
  categoría, color, prendas, entrega y qué la frena.
- "Meta de facturación → Por liberar" → cada fila con **foto, WH y fase** (antes solo el número).
(En la pantalla Liberación ya estaban desde ayer.)

## Tejeduría

**7 · Stock de tela cruda primero**: es la primera entrada de Planificación textil (antes iba Tejeduría).

**8 · Programación manual.** La pantalla Tejeduría ya **no muestra la grilla automática máquina × día**. Ahora tiene:
- "Cargas por tela · pedido vs cargado": por cada tela, órdenes, **kg pedidos** (liberados por tejer), **kg cargados**
  (lo que la persona programó), falta cargar, fecha requerida (tela lista) y la fecha que el motor sugiere (solo
  informativa).
- "Programación manual de tejeduría": tela, máquina, día y kilos → "Programar"; la grilla máquina × día se arma con lo
  que la persona programó (con % del día según los kg/día de la máquina); tabla editable (día, máquina, kg) con
  "quitar" (confirma). Todo con quién, cuándo y bitácora (`S.params.progTej`).
El motor sigue calculando internamente la fecha de tela lista para el resto del programa (tintorería y producción
dependen de ella); no asigna máquinas a la vista ni manda sobre la persona. El resumen por tipo de tela y la carga
por orden siguen abajo.

**9 · Imprimir en tejeduría**: se quitó "Tejeduría" del Programa del día (imprimir queda para tintorería y producción)
y la página de imprimir del perfil de piso de tejeduría (que ahora tiene Stock de tela cruda).

**10 · Resumen del total del pedido**: es la tabla "pedido vs cargado" del punto 8, con totales: kg pedidos por tela y
kg cargados, y cuánto falta cargar.

## Pendientes tuyos
- Cargar la programación manual de tejeduría de esta semana (la grilla está vacía hasta que alguien programe).
- Siguen: usuarios de módulo, plan de septiembre (ahora arranca con lo en proceso), STUART (Fleece perchado / French
  terry / Ribb 2x2 grueso), foto WH/MO/29252, tabla 6 "T-BIANCO-SINTEC(COMPACTADORA)".

## Ajustes (15-sep, después del commit 52f9ab5)

**1 · "En proceso" sin filtro de Proyecto.** Toda orden abierta cuyo grupo de fase está marcado como en proceso cuenta en
el plan del mes con sus **minutos pendientes**, sea del Proyecto que sea (ya ocupa los centros). El desplegable de en
proceso muestra la columna **Proyecto** de cada una.

**2 · Órdenes sin mes de Proyecto.** Nueva bandeja en Hoy → Pendientes: "Órdenes sin mes de Proyecto: no entran al plan
mensual", con el conteo y los valores de Proyecto que no dan mes. No se les asigna mes por suposición; se corrige en Odoo.

**3 · El corte "fase ≥ 2" ya no está en el código.** Tabla 5 (grupos de fase) tiene la columna **"en el plan cuenta como
en proceso"** (sí/no), sembrada igual que hoy: planificación, preparación de corte, corte, maquila externa, servicios,
confección, terminados, prenda terminada y cerrada = sí; previo a producción y textil = no. Solo se siembra donde falta;
lo editado no se pisa. `planBase` y "Agregar" leen esa columna (`enProcesoPlan(o)` = grupo de la fase → columna).

**4 · Avisos en tejeduría manual (sin impedir).** Al programar: si la máquina no tiene esa tela en su tabla de kg
(`kgTela`) o si los kg de ese día en esa máquina pasan su capacidad para la tela (`kgDiaTela`), sale un aviso, la fila queda
marcada "con aviso" y la bitácora dice "CON AVISO: …". Se programa igual.

**5 · Solo reporte: qué haría falta para que el motor use la programación manual de tejeduría como fecha de tela lista.**
Hoy el motor calcula `telaLista` de cada orden con su propia corrida de tejeduría (lote por tela, por fecha requerida, con
calibración y bloqueo por máquina) y de ahí sale `telaDesde` para tintorería y producción. Para que mande lo programado a mano:
- (a) En la sección de tejeduría de `programar()`, para cada tela con filas en `S.params.progTej`, reemplazar la corrida
  automática por las filas manuales: repartir los kg programados (máquina × día × kg) entre las órdenes de esa tela en
  orden de fecha requerida, y la fecha de tela tejida de cada orden = el día en que se completa su kg. Es un cambio en el
  motor (unas 15–25 líneas en esa sección), por eso no lo hice.
- (b) Telas que nadie programó: dos opciones a decidir. **B1** el motor sigue con su corrida automática para esas telas
  (mezcla: manual donde hay, automático donde no; la pantalla lo marcaría "sin programar a mano · fecha estimada por el
  sistema"). **B2** sin programación manual no hay fecha de tela lista: la orden queda bloqueada "tejeduría sin programar"
  y sale en una bandeja (más estricto, coherente con "la persona decide", pero deja sin fecha todo lo no programado).
- (c) Kg programados menores al pedido: la parte no cubierta queda pendiente (misma decisión B1/B2 para ese resto);
  mayores al pedido: se avisa (ya se muestra en "pedido vs cargado").
- (d) Cambios: si tejeduría mueve una fila, el programa se recalcula (PLAN=null al guardar, ya ocurre).
- (e) Pruebas: casos manual completo, manual parcial, tela sin programar, y que tintorería/producción se muevan con la
  fecha manual.
Recomendación: B1 mientras la persona de tejeduría toma el hábito; pasar a B2 cuando toda tela liberada tenga programa.
Tú decides si se autoriza.
