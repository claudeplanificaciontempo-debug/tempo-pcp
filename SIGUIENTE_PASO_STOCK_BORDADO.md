# Siguiente paso: demo, velocidad de bordado, stock de tela cruda, anticipación de tejeduría

Fecha: 2026-09-13. Commits `060f337` (funcionalidad) y `9e7057e` (ancho de campos). 265/265 verificaciones en el
simulador local. No se tocó la regla de liberación ni `faseEstado()`. Único cambio de datos en producción: el vaciado
del punto 1, a pedido tuyo.

## 0 · Datos de demo en producción

**No hay rastro.** Verificado en producción:
- Las 691 órdenes son todas de la Parte 2 (`origenParte2`); no existe ninguna OP-1001…OP-1005 ni ninguna orden con
  referencia CAM BÁSICA / POLO PIQUÉ / HOODIE / JEAN.
- No existen las categorías de la demo (CAM BÁSICA, POLO PIQUÉ, HOODIE, JEAN).
- Ninguna ruta guardada tiene los tiempos de la demo (lavado 120, plancha 1,2, bordado 2,2).
- Los cinco colores que la demo usa (DARK BLACK, LHG, CADET NAVY, BLEACH, POMEGRANATE) existen, pero vienen del seed
  inicial y tienen Pantone real: no son de la demo.
- Sin salidas de tintorería ni baños confirmados; bitácora sin entradas de demo.

**Dónde está el botón:** pantalla Órdenes de producción, solo cuando la base no tiene ninguna orden ("Todavía no hay
órdenes" → "Cargar ejemplo"). **Ahora**: se llama "Cargar ejemplo (datos ficticios)", se niega si hay órdenes, y pide
una confirmación explícita que dice que son 5 órdenes ficticias. Con 691 órdenes cargadas no puede pulsarse.

## 1 · Velocidad de bordado

**Valor real que había**: `ppm = 921.600` (no 9.216: el campo medía 65 px y solo dejaba ver cuatro dígitos — ver
punto 4) y `cabezas = 24` en la máquina "Bordado" (r7); `S.params.puntadasMin = 6.000`.

**Hecho en producción (verificado con recarga desde la nube):** `r7.ppm = null` y `S.params.puntadasMin = null`. El
seed ya no trae `puntadasMin`, así que no queda ningún valor por defecto detrás. Con ambos vacíos:
- `velBordado()` devuelve nulo; `minPrenda` y `minPrendaR` devuelven **0 minutos** para bordado (antes caían a 600).
- **293 órdenes abiertas con bordado** quedan marcadas "sin velocidad de bordado configurada" y aparecen en la
  **bandeja** nueva al inicio de Órdenes (cantidad, prendas y lista de OP). El reporte de la Parte 2 las cuenta igual.
- Escribir "Puntadas/min" en Configuración → Centros (fila Bordado) llena también el parámetro; vaciarlo vacía los dos.
- Las bordadoras con `ppm` propio (por máquina) siguen usando el suyo.

**Lo que preguntas sobre la máquina "Bordado" (r7):** tiene 10 personas, 480 min/día, eficiencia 80 %, 24 cabezas y
era la única con capacidad. **Parece el centro entero modelado como una sola máquina**: 10 operarios y 24 cabezas no
describen una bordadora, describen la sección (por ejemplo, tres máquinas de 8 cabezas, o dos de 12). El motor la
trata como una máquina de 24 cabezas trabajando en paralelo sobre la misma orden. Si son varias máquinas, cada una
debería ser un recurso con sus cabezas y su ppm (como las máquinas de tintorería), o al menos ese recurso debería
representar una máquina real. **La "Bordadora nueva"** (id `xaladjhe`) tiene `ppm = 800`, `cabezas = 0` (el motor usa 1),
1 persona, activa: parece creada al probar el botón "Agregar bordadora" y nunca configurada; hoy suma capacidad
ficticia. Recomiendo desactivarla o borrarla al cargar la ficha real; no la toqué.

## 2 · Pantalla "Stock de tela cruda" (Planificación textil)

- **Requerido**: kg crudos de las telas propias de las órdenes **liberadas a tela**, abiertas, con etapa de tejeduría y
  todavía no tejidas, por tela y por mes.
- **Mes** = mes de (fecha de entrada a corte − semanas de anticipación). La fecha de corte es la programada por el
  motor si existe; si no, se estima como entrega − lead time (la misma regla que el motor usa para la fecha requerida)
  y la fila lleva "≈".
- **Stock (edito)**: por tela; al escribirlo se guarda kg, fecha y hora y usuario, y se muestra "registrado dd mmm
  hh:mm · usuario". Con más de 7 días aparece la etiqueta roja "dato viejo · N d".
- **A tejer** = requerido − stock, nunca negativo.
- **Stock sin escribir = desconocido**, no cero: esas telas van en un panel aparte "Telas sin stock registrado" con su
  requerido, y no se suman al "a tejer". Al borrar un stock vuelve a desconocido.
- Un tercer panel muestra el requerido por tela y mes para todos los meses.
- Dato guardado en `S.params.stockTela[tela] = {kg, ts, u}`. Carga por Excel: pendiente, como acordado.

**Advertencia honesta:** hoy la pantalla sale **vacía (0 telas, 0 órdenes)** en producción. Están liberadas a tela 293
órdenes, pero las 293 tienen fase 2 o posterior y `faseEstado` las da por **ya tejidas**; y las 60 de 1Tejeduria y
25 de 1CD Tintoreria, que son las que sí habría que tejer, **no están liberadas** (fase 1 sin firma). Es el mismo
problema reportado en `ARREGLOS_PREVIOS_BLOQUE_K.md` (sección B): la pantalla funciona (probada con órdenes liberadas
a mano en fase 1), pero mostrará datos reales cuando se resuelva la liberación en el paso siguiente.

**Otra decisión pendiente:** el "a tejer" todavía **no descuenta el stock en el programa de tejeduría** del motor
(`programar()` sigue tejiendo los kg completos de cada orden). Hacerlo es tocar el motor; lo dejo para cuando lo
autorices.

## 3 · Anticipación de tejeduría

Parámetro nuevo `tejAnticipSem`, editable en Configuración → Calendario y parámetros ("Tejeduría: semanas de
anticipación"), valor inicial 2 (solo aplica el default si el parámetro no existe; un 0 escrito se respeta). Uso: una
orden entra en el requerido del mes M si su entrada a corte menos `tejAnticipSem × 7` días cae en M. Probado: con más
semanas el requerido se adelanta de mes.

## 4 · Los campos numéricos mostraban menos dígitos de los que guardan

El campo "puntadas/min" medía 65 px; con relleno, borde y las flechas del control quedaban ~35 px de texto: cuatro
dígitos. Por eso 921.600 se veía como "9216". Medido en producción contra el ancho anterior de cada campo, **fue el
único valor guardado que no cabía**; los otros 20 campos estrechos (personas, minutos, eficiencia, horas, capacidad,
kg/día por tela, encogimiento, cabezas, mult, vel, técnicas, costos, metas) tienen valores de 2–4 dígitos que sí se
veían completos; "cabezas = 24" cabía justo. Ahora todo campo numérico tiene un ancho mínimo de 92 px (7 dígitos) y
puntadas/min 110 px, con prueba automática.

## Qué queda para el paso siguiente (no tocado)

- Regla de liberación (`liberada`, L2444–2445) y `faseEstado()`: sin ellas, tejeduría/tintorería y esta pantalla
  siguen en cero para lo que Odoo ya tiene en fase 1.
- Ficha real de la bordadora (ppm por cabeza y cabezas reales; una máquina por recurso).
- Descuento del stock en el programa de tejeduría (motor).
