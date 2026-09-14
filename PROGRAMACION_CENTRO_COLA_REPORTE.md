# Programación por centro: agrupar y ordenar arrastrando — reporte

Fecha: 14-sep-2026. Pantalla: Planificación de producción → cada centro (Corte, Confección, Estampado, Bordado,
Terminados, Empaque) → pestaña **Programación del centro**. Pruebas 531/531. No se tocaron capacidades ni el motor,
salvo el valor por defecto de `prioCentro` (sin puesto = al final), autorizado el 14-sep.

## 1 · Qué cambió en la pantalla

**Una cola por centro.** La tabla ahora es la cola completa del centro: todas las órdenes abiertas con un paso
pendiente ahí, en el mismo orden que usa el motor. Por defecto muestra las de esta semana y la siguiente (como antes);
la casilla "toda la cola" muestra todas. En Terminados hay cuatro colas (Etiquetas, Botones, Lavado, Plancha), una tabla
por centro, porque el orden es uno solo **por centro**.

**Puesto = el número de prioridad que ya existía.** La columna "Pri." (1 urgente · 2 alta · 3 normal) pasó a ser
**Puesto**: el mismo campo `progCentro[centro].pri`, ahora con cualquier número (1..n). Es el número que el motor ya
usaba (`prioCentro`) para ordenar las órdenes; no hay otro sistema de orden.

**Arrastrar.** Cada fila se arrastra con el asa ⠿ y se suelta sobre otra fila (queda delante de ella) o en la franja
"⤓ poner al final". También se puede escribir el puesto a mano. Al soltar:
1. la cola completa del centro se renumera 1..n (todas las órdenes del centro, no solo las visibles ni las del grupo);
2. se recalcula el programa y, si con ese orden **alguna orden del sistema** deja de llegar a su fecha (pedida o
   compromiso), sale un aviso con la lista (orden · meta · estimada) y cada una queda en **Advertencias de fecha**
   (Hoy). No se impide el cambio;
3. queda en bitácora: "Cola de Corte: WH/MO/x del puesto 7 al 2 · 61 órdenes numeradas 1..61 · ya no llegan a su
   fecha: …", con quién y cuándo (la bitácora guarda usuario y hora en cada línea).

Solo pueden arrastrar los perfiles con permiso `programa` o `reprogramar` en ese centro (los mismos que antes podían
cambiar la prioridad); en solo lectura la tabla se ve pero no se mueve.

**Agrupar.** Selector "Agrupar por" con Cliente · Familia · Categoría · ODC, anidado hasta tres niveles, igual que
Entregas y Avance del mes. Cada cabecera de grupo dice cuántas órdenes y cuántas prendas **pendientes en el centro**
suma. Agrupar reordena y suma, no esconde: dentro de cada grupo las órdenes van en el orden de la cola y los grupos se
ordenan por la primera orden que aparece en la cola. Arrastrar dentro de un grupo mueve la orden en la cola completa
del centro (si sueltas WH/A sobre WH/B, A queda justo delante de B en la cola del centro, aunque estén en grupos
distintos). La agrupación elegida se recuerda en el navegador de cada persona.

**Foto.** Miniatura de la prenda al lado de la OP en cada fila (ya estaba en esta pestaña; se mantiene). Clic = ampliar.

**Columnas nuevas:** Cliente. El buscador también busca por cliente y ODC.

## 2 · Qué manda (la pantalla lo dice)

El motor ordena las órdenes así (no se tocó): primero la **prioridad global** de la orden (la de Órdenes, 1/2/3),
después el **menor puesto entre todos los centros** de la orden, después la fecha de entrega. Por eso:

- Si la orden tiene prioridad global 1 o 2, la fila dice **"prio global N manda"**.
- Si otro centro le puso un puesto menor, la fila dice **"Confección la tiene en 4: manda ese"**.
- Si nadie ha ordenado la cola, el título dice **"cola sin numerar: el motor ordena por fecha de entrega"**. En cuanto
  alguien arrastra, toda la cola queda numerada.
- Una orden que entra después a una cola ya numerada (por una recarga o una liberación nueva) no trae puesto: **va al
  final de la cola** y la fila dice **"sin puesto · va al final"** (decisión del 14-sep, ver §5).

## 3 · Estado en producción (14-sep, 12:00)

| Centro | Pendientes en el centro | Sin fecha aún (bloqueadas: sin liberar / sin decisión) | En la cola | Esta semana y la siguiente | Con foto |
|---|---:|---:|---:|---:|---:|
| Corte | 782 | 257 | 525 | 61 | 61 |
| Confección | 861 | 257 | 604 | 122 | 140 |
| Estampado | 48 | 29 | 19 | 19 | 19 |
| Bordado | 337 | 171 | 166 | 120 | 120 |
| Etiquetas | 73 | 18 | 55 | 28 | 32 |
| Botones | 380 | 124 | 256 | 82 | 102 |
| Lavado / Plancha | 0 | 0 | 0 | 0 | 0 |
| Empaque | 984 | 257 | 727 | 223 | 263 |

Ninguna cola tiene puesto todavía (nadie había usado la prioridad por centro). Las bloqueadas no entran a la cola
hasta que se liberen: no tiene sentido darles puesto antes.

## 4 · Tintorería y tejeduría: no se agregó arrastre, y por qué

Pediste arrastrar "en todas las programaciones: cada centro, tintorería y tejeduría" usando el campo de prioridad que ya
existe. Revisé el motor:

- **Tejeduría**: las corridas se arman **por tela** (todos los kilos pendientes de una tela juntos) y se ordenan por la
  fecha requerida más temprana de la tela. El puesto por centro no interviene en ese orden. Un arrastre ahí solo
  tendría efecto si el motor ordenara corridas por un número manual: eso es cambiar el motor.
- **Tintorería**: los baños automáticos se arman por color y fecha requerida; el puesto por centro tampoco interviene.
  Lo que ya se puede arrastrar es lo confirmado: cada **baño confirmado** se arrastra a máquina × día en el cuadro
  (`arrastrarBano/soltarBano`, ya existía) y esa sí es la programación real de tintorería.

Como la regla es no tocar el motor y no crear un orden paralelo que el motor ignore, en estos dos centros no puse un
arrastre "decorativo". Si quieres que tejeduría tenga orden manual de corridas (por tela) o que el armado automático de
baños respete un puesto, es un cambio de motor y lo hago solo con tu autorización; te diría antes qué cambia.

## 5 · Decisiones tomadas (14-sep, usuaria)

- **Sin puesto = al final de la cola.** Cambiado en el motor con autorización: `prioCentro` devuelve `SIN_PUESTO` (muy
  grande) cuando la orden no tiene puesto en ningún centro; antes devolvía 3. Una orden que nadie ordenó ya no se cuela
  delante de las ordenadas; entre las sin puesto sigue mandando la prioridad global y la fecha de entrega. La fila la
  marca "sin puesto · va al final". Único cambio en el motor de esta entrega.
- **Tejeduría y tintorería se quedan como están**: tejeduría trabaja por tela y tintorería por color, no por orden; un
  arrastre ahí sería decorativo.

## 6 · Código

- `filasDeCentros`, `colaCentro`, `puestoDe`, `agruparCola`, `moverEnCola` (renumera, avisa, bitácora), `arrastrarCola/
  overCola/soltarCola/finArrastreCola`, `mandaCola`, `selNivelesCEN` (niveles en `CEN.niveles`, guardados en el
  navegador), casilla `CEN.todo`.
- Sin cambios en `programar()` ni `setProgCen` (sigue sirviendo para recurso, fecha de arranque y "quitar"). En
  `prioCentro`, solo el valor por defecto: 3 → `SIN_PUESTO` (al final), autorizado el 14-sep.
- Pruebas nuevas en `test/driver.js`: arrastre, renumeración, motor ordena por ese número, bitácora, puesto a mano,
  agrupar conserva y suma, avisos "prio global manda" / "otro centro manda", permiso por centro, cuatro colas en
  Terminados.
