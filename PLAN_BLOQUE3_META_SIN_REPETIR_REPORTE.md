# Plan mensual · Bloque 3 · Meta de facturación (sin repetir) — reporte

Fecha: 15-sep-2026. Motor sin tocar. Pruebas del simulador: 766 (10 nuevas), todas verdes.

## 1 · Se quitó el desplegable duplicado

"Base del plan: lo liberado" ya no tiene el desplegable "Ver las N sin liberar o sin decidir (foto y fase)". Ese panel
queda solo con los dos números (liberadas / sin liberar, con sus prendas y $) y el enlace "ir a Liberación". El detalle
por orden (foto, WH, fase y qué la frena) vive **una sola vez**, en "Por liberar" de la Meta de facturación.

## 2 · Facturación esperada = solo lo que termina dentro del mes

Antes contaba toda orden liberada del mes, sin mirar cuándo termina. Ahora:
- **Facturación esperada (termina dentro del mes)**: suma solo las órdenes liberadas cuya fecha estimada de fin del
  motor (`finPro`) cae en el mes del plan.
- **Liberado pero termina después del mes (N órdenes)**: aparte, las liberadas cuyo `finPro` cae en otro mes (o no
  tiene `finPro` calculado). No suman a la facturación esperada ni a la brecha.
- La brecha (meta − esperada) se calcula contra la facturación que sí cae dentro del mes.

## 3 · Nueva línea: qué pasa si liberas todo

Debajo de la brecha: **"Liberando todo lo pendiente del mes llegas a $ A (B % de la meta)."** Suma la facturación
esperada de hoy más el valor de **todas** las órdenes del mes pendientes de liberar (no solo las necesarias para cerrar
la brecha, que es lo que hace la tabla "Por liberar" de abajo). Si aun así no alcanza la meta, agrega: **"Faltan $ C que
no están en el Proyecto del mes: jalar del mes siguiente en el Bloque 4."**

## 4 · Textos corregidos

- "Órdenes del mes liberadas y con fecha" → **"Órdenes del mes sin bloqueo en el programa"** (es más preciso: liberada
  no implica tener fecha, lo que importa es que el programa no la tenga bloqueada).
- "tienes estas órdenes del mes **sin fecha**, ordenadas por valor" → **"sin liberar"** (el texto hablaba de fecha
  cuando en realidad son órdenes bloqueadas por liberación).

## 5 · Sin duplicar con el Bloque 4

La tabla "Por liberar" de la Meta separa las órdenes pendientes en dos grupos:
- Las que **ya son candidatas para agregar en el Bloque 4** (fase temprana, no marcada "en proceso" en la tabla 5, y
  todavía no están en el plan): no se listan aquí con botón de liberar; se resumen en una línea —
  **"N de ellas ($ X) ya están disponibles para agregar en el Bloque 4 → Agregar: decide ahí"** — con un enlace que hace
  scroll al panel de Agregar (ancla `id="pm-agregar"`).
- Las que **no** son candidatas de Bloque 4 (por ejemplo, ya están en una fase "en proceso" pero igual bloqueadas por
  algún motivo, o ya en el plan) siguen en la tabla con el botón "liberar" como antes.

Así, en el Bloque 3 se ve el **valor** (cuánto suman, cuántas son) y la **decisión** de agregarlas queda en el Bloque 4,
sin repetir la misma orden en dos listas de acción.

## Qué se probó
Un caso con cuatro órdenes sintéticas: una que termina dentro del mes (cuenta en la esperada), una que termina después
(se resta y aparece en "termina después del mes"), una bloqueada que es candidata de Bloque 4 (se resume y enlaza, no
se lista) y una bloqueada que no es candidata (sí se lista con botón liberar). Se verificó también que el ancla
`pm-agregar` existe en el panel de Agregar y que los dos desplegables/tablas duplicadas desaparecieron.

## Nota técnica
Al aplicar el parche descubrí que el archivo usa terminadores de línea CRLF; mi primer intento de extraer el bloque
original con herramientas de línea de comandos generó un desfase de unas líneas y produjo un archivo con sintaxis rota
(detectado antes de publicar nada, con `node --check` en el harness). Lo revertí con `git checkout -- index.html` y
rehice el parche con el bloque exacto tomado del commit anterior. Quedó documentado por si ayuda en el futuro: al tocar
`index.html` a mano, conviene normalizar CRLF/LF explícitamente al comparar fragmentos.
