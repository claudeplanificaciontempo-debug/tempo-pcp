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
