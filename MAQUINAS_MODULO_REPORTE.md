# Máquinas por módulo · Etapa 1 del balanceo — reporte

Fecha: 03-oct-2026. Sobre `main` = 18582b0. **El motor no se tocó** (`programar`, `capDia` y la capacidad siguen igual: el
programa no lee máquinas). Este reporte no trae seriales, marcas ni modelos: solo conteos y tipos.

Con el «adelante» de la usuaria y sus cuatro respuestas:

| # | Decisión | Cómo quedó |
|---|---|---|
| 15 | Las 9 máquinas de ejemplo (`mq_ej_*`) | **No se borran.** Al entrar un administrador quedan `estado:'baja'` + `ejemplo:true`, con su estado anterior y una línea de bitácora. Una sola vez. La «×» de la tabla pasó a **«dar de baja»** (pide motivo; la máquina sigue en la lista y deja de contar). Desde la segunda vuelta (§7) es el **único** camino para dar de baja. |
| 16 | Las 10 de Botones y ojales (B/O) | Van al **recurso del centro Botones**, buscado por su centro (no por un id escrito). Nunca cuentan como «stock» para los módulos. |
| 17 | «MANTENIMIENTO PREVENTIVO 2026» | **Operativa**, con el texto guardado en la observación. |
| 18 | Tipos de máquina | **Una sola tabla** `tiposMaq` con los 19 tipos, su familia y sus alias, para el inventario, las operaciones y el balanceo. |

## 1 · Tipos de máquina: una sola tabla

Configuración general → Centros y máquinas → **Tipos de máquina**.

- **Los 19 tipos**, con su familia: Recta, Overlock, Recubridora, Recta doble aguja, Tirilladora, Cerradora de codos,
  Atracadora, Elasticadora, Pretinadora, Ojaladora de lágrima, Remachadora, Ojaladora, Botonera, Plancha, Multiagujas,
  Bordadora, Tampográfica, Pulpo y **Manual** (familia «manual»; «A mano» es uno de sus nombres).
- **Otros nombres con que llega cada máquina (alias):**
  - de la hoja de operaciones: OVERLOK 4 HILOS, OVERLOCK 4 HILOS, RECUBRIDORA COLLARETERA, PULPO MANUAL, BOTONADORA…;
  - de Kronos: los de la homologación del paquete de balanceo;
  - del inventario: RECTA ELECTRÓNICA (también calza escrita ELECTRONICA o ELÉCTRONICA), RECTA CONVENCIONAL, COLLARETERA.
- **Los TP** (RECTA TP, ATRACADORA TP, OVERLOCK 5 HILOS TP…) van en una columna aparte, **«Por confirmar con planta»**:
  calzan con su tipo base y la pantalla los marca hasta que alguien pulse **«confirmar»** (con bitácora).
- **Lo que no calza no se inventa.** Sale arriba de la tabla como **«nombres sin homologar»** con un selector «es otro
  nombre de…» o «es un tipo propio». Hoy, en la hoja de operaciones: **VERTICAL (27 operaciones) y SESGADORA (7)**.
  También sale en Configuración → Inicio → «Falta completar».
- **Todo pasa por `normMaquina`**: el inventario al cargar, la hoja de operaciones, pegar operaciones y el balanceo.
  La lista fija `TIPOS_MAQ` del código se retiró.
- **Siembra** (`sembrarTiposMaq`): una sola vez, con bandera `tiposMaq19` y bitácora, desde `render()` y nunca desde un
  perfil de piso. **Ya no siembra dentro de una vista** (antes corría en cada llamada a `normMaquina`).
  - A una fila que ya existe solo le agrega los alias que le faltan: lo editado no se pisa.
  - Las filas sueltas que sembró la versión del 15-sep, y que ahora son alias de un tipo, **se apagan, no se borran**, y
    dicen de qué tipo son.
  - Sin configurar, la pantalla usa la lista de fábrica (solo lectura). Por eso una sesión de piso también la ve.
- **Un tipo no se borra: se apaga** (segunda vuelta, §7). Editar la tabla exige el permiso `config`.

## 2 · Cargar el inventario de máquinas

Configuración general → Centros y máquinas → Máquinas de confección → **«Cargar inventario»** (permiso `config`).

**Qué lee.** El Excel de Mantenimiento **tal como viene**, con sus dos hojas (con SheetJS por CDN, como los otros
cargadores), o el CSV `maquinas_por_modulo.csv` del paquete.
- Cada hoja se reconoce por la fila que dice «NUMERO DE MAQUINA».
- La hoja que trae la columna «MODULO» es la **por módulo** y manda.
- La otra completa lo que falta: fecha de mantenimiento, área e «inventario feb-2026».

**Patrón de la casa:** leer → plan (`planMaquinas`, que no escribe nada) → vista previa → aplicar. Aplicar pide
confirmación y deja bitácora y `registrarCarga('maquinas')`; `TIPOS_CARGA` tiene ahora «Inventario de máquinas».

**Cómo lee cada dato:**
- **Llave = número de máquina como texto.** El serial también es texto: hay seriales con cero adelante y nunca pasan a
  número. Lo mismo al editarlos a mano: `setMaq` es un setter de texto y reemplaza a `setRow` en esta tabla.
- **Dónde va cada máquina:**
  - módulo «n» → el recurso «Módulo n» del centro Confección, por su número;
  - «B/O» → el centro Botones, según la tabla «Cómo se lee el archivo del inventario»;
  - sin módulo → el inventario de su **área** (Corte, Confección o Tintorería), sin recurso: **no cuenta para ningún
    módulo** y el área queda a la vista.
- **Estado, por la observación,** con la misma tabla editable:
  - «O.K» y «MANTENIMIENTO PREVENTIVO» → operativa;
  - «PARADA» → parada;
  - **una observación sin regla deja la máquina «por revisar»**: no cuenta y se lista para que alguien diga qué significa;
  - **«baja» (escrito en el archivo, en lo pegado o por una regla) tampoco da de baja**: entra «por revisar» con el motivo
    «el archivo dice baja: confirmar con dar de baja» (segunda vuelta, §7).
- **Qué se guarda de cada máquina:** marca, modelo, serial, fecha de mantenimiento, «inventario feb-2026», área, el tipo
  como lo escribe Mantenimiento (`tipoInv`) y el archivo de donde vino.

**La vista previa muestra:**
- tarjetas: nuevas · iguales · cambian · no entran · repetidas idénticas (se toman una vez) · ya en el sistema y no
  vinieron;
- la tabla por módulo (en el archivo, hoy en el sistema, personas configuradas);
- el detalle de cada grupo, con su motivo;
- las observaciones sin regla, los tipos sin homologar y las diferencias entre las dos hojas (manda la hoja por módulo).

**Recargar y editar:**
- **Recargar el mismo archivo no cambia nada**: dice «no hay nada que aplicar».
- Las que estaban y no vinieron **quedan**, marcadas «no vino»; se conserva la primera marca.
- **Lo cambiado a mano no se pisa:** queda la marca «a mano» y la vista previa dice qué conserva.

**«Pegar desde Excel»** pasa por el mismo camino (plan, vista previa, aplicar, bitácora, registro). Lo que no se pegó
no se marca «no vino». El número es obligatorio.

**Panel de máquinas:**
- resumen por módulo o lugar × tipo, con las personas configuradas;
- la lista una por una, plegada: número, tipo, módulo o lugar, estado, observación, marca y modelo, serial y «dar de baja»;
- el desplegable de lugar ofrece **cualquier recurso de producción**, no solo los módulos;
- la tabla editable «Cómo se lee el archivo del inventario»: observación → estado, módulo del archivo → centro, y lo que
  no es máquina de producción (sembrada con «GENERADOR»). Sin configurar usa la lista de fábrica.

## 3 · Totales del archivo real (Maquinaria_por_Modulo_.xlsx)

Medidos en el simulador con el archivo de la usuaria (copiado a `test/fixtures/maquinaria_hojas.json`, ignorado por git).

| Hoja | Filas después de la cabecera |
|---|---|
| MODULOS (por módulo) | 139 |
| CONFECCIÓN (inventario completo) | 184 |

**Entran 161 máquinas:**

| Dónde | Máquinas |
|---|---|
| Módulos 1 a 11 | 13 · 12 · 12 · 11 · 10 · 11 · 10 · 11 · 10 · 12 · 14 = **126** |
| Botones (B/O) | **10** |
| **Con módulo o Botones** | **136** |
| Sin módulo · Confección | 14 |
| Sin módulo · Corte | 8 |
| Sin módulo · Tintorería | 3 |

**Por tipo, de las 136 con módulo o Botones:** Recta 49 · Overlock 46 · Recubridora 25 · Tirilladora 2 · Atracadora 2 ·
Cerradora de codos 2 · Recta doble aguja 2 · Ojaladora 2 · Botonera 2 · Elasticadora 1 · Pretinadora 1 · Ojaladora de
lágrima 1 · Remachadora 1. **Todos los nombres del inventario de módulos calzan** con la tabla de tipos.

| Módulo | Overlock | Recta | Recubridora | Otras |
|---|---|---|---|---|
| 1 | 7 | 1 | 3 | Cerradora de codos 1, Tirilladora 1 |
| 2 | 6 | 1 | 5 | — |
| 3 | 6 | 1 | 4 | Tirilladora 1 |
| 4 | 3 | 7 | 1 | — |
| 5 | 3 | 6 | 1 | — |
| 6 | 3 | 6 | 2 | — |
| 7 | 3 | 6 | 1 | — |
| 8 | 3 | 6 | 1 | Elasticadora 1 |
| 9 | 3 | 5 | 2 | — |
| 10 | 2 | 4 | — | Cerradora de codos 1, Ojaladora de lágrima 1, Pretinadora 1, Recta doble aguja 2, Remachadora 1 |
| 11 | 6 | 1 | 5 | Atracadora 2 |
| Botones | 1 | 5 | — | Botonera 2, Ojaladora 2 |

**Estados** (con las reglas del 04-oct, §8):
- **148 operativas.** Entre ellas, las **29 con «MANTENIMIENTO PREVENTIVO 2026»** (todas de módulos o Botones), las **7 «EN
  BODEGA»** (Confección sin módulo: reserva de los módulos) y las **3 «TINTORERIA»** (en Tintorería, sin módulo).
- 7 paradas: las de Corte con «PARADA».
- **6 de baja por regla**: «NO FISICAMENTE», con el motivo «no está físicamente».
- **0 por revisar.** Antes del 04-oct eran 138 operativas y 16 por revisar (EN BODEGA 7, NO FISICAMENTE 6, TINTORERIA 3).

**No entran 8, cada una con su motivo:**
- 3 filas sin número (dos ventiladores y un esmeril);
- 2 «S/N»;
- 2 filas con solo el número;
- 1 generador, por la regla «GENERADOR».

**Además:**
- 3 números repetidos idénticos en la hoja por módulo: se toman una vez.
- 15 filas vacías: no se cuentan.
- 1 máquina con el modelo escrito distinto en las dos hojas: manda la hoja por módulo y la vista previa lo muestra.
- Tipos sin homologar del inventario completo (4, todos de Corte): RECTA PUNTADA FRANCESA, HILBANADORA, RECTA PUNTADA
  ZIGZAG y PULIDORA. Entran con su nombre, marcados.

## 4 · Pantalla Balanceo: solo los arreglos del Paso 0

La pantalla se rehace en la etapa 3; aquí solo se corrigió esto:

| Hallazgo | Arreglo |
|---|---|
| H1: «tiene» con el nombre crudo y «necesita» normalizado | `cuadroMaqBalanceo(rec,puestos)`: los dos lados con `normMaquina`. Ya no sale «RECTA: faltan» y «Recta: sobra» a la vez |
| «MANUAL» salía como máquina que falta | Lo de la familia «manual» no se pide ni falta |
| Stock | Solo las operativas de Confección sin módulo. Las de Botones, Corte o Tintorería tienen su centro y no se ofrecen |
| H2: «17 de 2 operaciones sin orden real» | Divide entre las operaciones (`opsC.length`) |
| H3: asterisco «provisional» en todas | Solo en las operaciones provisionales (la prueba ahora dibuja la pantalla, §7) |
| «Este módulo no tiene máquinas registradas» contaba las de baja | Una sola regla, `maqOperativa`, en la tarjeta del módulo y en el aviso (§7) |
| H4: pegar usaba la lista fija `TIPOS_MAQ` | Pasa por `normMaquina`, con vista previa, la observación guardada, bitácora y `registrarCarga` |
| H5: «nivel mínimo de especialidad» (no se usa) | Ya no se muestra; el parámetro queda |
| Maquila en el selector | Fuera del selector y de las tarjetas de módulos (`esMaquilaRec`: la misma regla de la cola, `esRecAfuera` u `ordenRecChip`) |

## 5 · Pruebas

Simulador completo, sin ventana: **3.412 comprobaciones, 0 fallas, 0 errores** (antes de este lote: 3.382). También se
miraron capturas de la vista previa, del panel y de Balanceo, en modo claro y oscuro.

`test/driver.js`, junto a las de Balanceo (bloque «BALANCEO etapa 1»):

- **BE1** (pasadas a la regla nueva):
  - los 19 tipos, con bandera;
  - la siembra no corre dentro de las vistas;
  - los nombres de la hoja, Kronos e inventario caen en su tipo;
  - los TP «por confirmar»;
  - VERTICAL y SESGADORA «sin homologar»;
  - alias nuevo y homologar desde la tabla;
  - la siembra respeta lo de antes y una segunda siembra no cambia nada.
- **BAL**, **BAL-H1…H5**: maquila fuera del selector; tiene = necesita; MANUAL no falta; stock; H2 y H3 (desde la
  segunda vuelta, dibujando la pantalla, §7); H5; pegar desde Excel.
- **IM1–IM15**, con filas **sintéticas** (números y seriales inventados, uno con cero adelante, uno repetido idéntico,
  uno B/O, uno PARADA, uno sin número, un «S/N» y un generador):
  - las 9 de ejemplo dadas de baja y no borradas;
  - conteos de la vista previa;
  - el plan no escribe;
  - serial como texto;
  - B/O a Botones;
  - estados;
  - tipos;
  - aplicar con bitácora y registro;
  - recarga sin cambios;
  - lo cambiado a mano se conserva;
  - «dar de baja» con motivo;
  - el CSV del paquete.
- **IM-REAL** (solo si existe `test/fixtures/maquinaria_hojas.json`):
  - 136 con módulo o Botones;
  - 13,12,12,11,10,11,10,11,10,12,14 y 10 en Botones;
  - 29 operativas con mantenimiento preventivo;
  - 3 repetidas;
  - lo que no entra, con su motivo.
- **GUARDIA**: `delReglaInvMaq` (quitar una regla de «cómo se lee») pide confirmación.

## 6 · Pendientes

1. ~~**Observaciones sin regla (16 máquinas)**~~ **Resuelto el 04-oct** (§8): la usuaria decidió «solo deja activas las que
   están». **Falta en producción volver a cargar el Excel** con «Cargar inventario» para que las 16 se lean con las reglas
   nuevas (lo ya cargado no cambia solo; el panel lo avisa).
2. **Nombres sin homologar:**
   - de la hoja de operaciones: VERTICAL y SESGADORA;
   - del inventario de Corte: RECTA PUNTADA FRANCESA, HILBANADORA, RECTA PUNTADA ZIGZAG y PULIDORA.
3. **TP por confirmar con planta:** decisión 55; están en la columna aparte.
4. **Decisión 19** (Plancha, Bordadora y Multiagujas como máquinas del módulo): etapa 3.
5. **En producción:**
   - **lo siembra un administrador al entrar**: las 9 de ejemplo se marcan y la tabla de tipos se guarda la primera vez
     que entra alguien con permiso `config` cuya sesión puede guardar la configuración (§7, punto 9). Una tablet, un
     supervisor de piso o planificación no siembran nada;
   - después hay que cargar el Excel con «Cargar inventario».
6. **Sin SQL.** `maquinas` la escriben admin y planificación; `params` (tipos y reglas) solo admin.
7. **Queda para las etapas siguientes:**
   - el resto del Balanceo (etapa 3);
   - la máquina dañada del día en la tablet (`maqFuera`, etapa 5);
   - unificar los otros cargadores con `cargarSheetJS` (hoy solo lo usa este).

## 7 · Segunda vuelta (03-oct): nueve arreglos del lote

Sobre `main` = 97ef02d (los dos lotes de ayer juntos). **El motor no se tocó.** Sin seriales ni marcas: solo conteos.

| # | Qué estaba mal | Cómo quedó |
|---|---|---|
| 1 | El desplegable de estado ofrecía «dada de baja» y daba de baja **sin motivo**. Un archivo o lo pegado con estado «baja» también daba de baja solo. | Elegir «baja» pasa por **«dar de baja»** (`darBajaMaq`): sin motivo no se da de baja; con motivo queda quién, cuándo y por qué. La opción «dada de baja» solo aparece en una máquina que **ya** está de baja (para volver a usarla se elige otro estado). Lo que viene del archivo, de lo pegado o de una regla que diga «baja» entra **«por revisar»** con el motivo «el archivo dice baja: confirmar con dar de baja»; la vista previa lo lista y la lista de máquinas muestra el motivo. Si la máquina ya estaba de baja en el sistema, coincide y no cambia. |
| 2 | La «×» de **Tipos de máquina** borraba el tipo de la tabla. | **Ya no se borra: se apaga** (`apagarTipoMaq`, con confirmación, quién y cuándo, bitácora). El botón dice «apagar»; un tipo apagado dice «encender» (`encenderTipoMaq`, también con confirmación). La tabla nunca pierde filas. **Qué pasa con un tipo apagado:** sus nombres **dejan de reconocerse** (`normMaquina` devuelve el nombre tal cual y sale «sin homologar», a la vista); antes un tipo inactivo seguía calzando si ningún otro tenía ese nombre. Al encenderlo vuelven. La columna «Activa» ya no es una casilla: dice «sí» o «apagado». Las filas «ahora es otro nombre de…» no llevan botón. |
| 3 | Agregar, editar, homologar, confirmar TP y quitar tipos no pedían permiso. | Las seis (`addTipoMaq`, `setTipoMaq`, `homologarNombreMaq`, `confirmarAliasTP`, `apagarTipoMaq`, `encenderTipoMaq`) empiezan con `if(!puede('config'))return`, como las reglas del inventario. |
| 4 | La tarjeta del módulo y el aviso de Balanceo contaban «máquinas» con dos reglas distintas: el aviso «no tiene máquinas registradas» contaba también las de baja. | Una sola regla, **`maqOperativa`**, en las dos. El aviso dice «no tiene máquinas operativas registradas» y, si las tiene de baja, paradas o por revisar, lo dice. |
| 5 | La prueba de H2/H3 solo buscaba texto dentro del código. | Ahora **dibuja** Balanceo con una referencia de verdad: deja 2 operaciones con orden real y el resto provisional, cuenta los «*» en la pantalla y lee el «X de Y» del aviso contra el número de operaciones. Restaura el orden de las operaciones al terminar. |
| 6 | Al cargar el Excel, número y serial se leían como número crudo: un serial guardado como número con formato de ceros («00099123») llegaba sin los ceros. | Para **número y serial** manda **el texto que muestra la celda** (`hojaInvMaqConTexto` / `hojasInvMaqDeLibro`: una lectura cruda y una con formato); la fecha de mantenimiento sigue leyéndose del número de Excel. Un número largo que la celda muestra en notación científica no se toma: queda el número entero. **Con el archivo real de hoy no cambia nada**: 12 seriales de la hoja por módulo y 13 de la del inventario vienen guardados como número, ninguno con formato de ceros. El arreglo protege la próxima carga. |
| 7 | En la vista previa, la fila de **Botones** decía «—» en «Personas configuradas». | Dice las personas del recurso, igual que los módulos. |
| 8 | Una máquina que cambió de número entraba como «nueva» y la vieja quedaba «no vino», sin aviso. | La vista previa **avisa** «posible cambio de número: la N.º X del sistema y la N.º Y del archivo tienen el mismo serial». Solo cuenta un serial no vacío (ni «S/N», «N/A», guiones o ceros) que aparece **una sola vez en el archivo y una sola vez en el sistema**. **No se aplica nada solo**: si es la misma máquina, se cambia a mano el número de la del sistema y se vuelve a cargar. |
| 9 | La siembra de tipos y de las máquinas de ejemplo podía correr en una sesión que no puede guardar la configuración. | `sembrarMaquinasAlEntrar` usa **la misma regla con que se guarda** (`puedeSubirTabla('params')`: un perfil de piso no sube la configuración) y no siembra si la última carga del servidor quedó incompleta. **En producción lo siembra un administrador al entrar.** |

**Pruebas nuevas** (`test/driver.js`, bloque «BALANCEO etapa 1»):
- **BAL-H2/H3 (dibujado)** y **MQA4** en el mismo dibujo de Balanceo.
- **MQA1–MQA3** y **MQA6–MQA9**, con datos sintéticos (números y seriales inventados). MQA6 arma un Excel de verdad con
  SheetJS si carga en el simulador; si no, prueba solo la lectura de celda y lo dice.
- La lista **GUARDIA** ya no tiene `delTipoMaq` (no existe); MQA2 comprueba que apagar no hace `splice` y pide confirmación.

**Resultado:** simulador completo, sin ventana: **3.486 comprobaciones, 0 fallas, 0 errores** (antes de esta vuelta, con los
mismos archivos de prueba: 3.462). En el simulador SheetJS sí cargó, así que MQA6 probó también el Excel de verdad.

## 8 · Tercera vuelta (04-oct): las 16 «por revisar»

Decisión de la usuaria: **«solo deja activas las que están»**. El motor no se tocó; sin seriales ni marcas, solo conteos.

| Observación | Cuántas | Queda | Por qué |
|---|---|---|---|
| EN BODEGA | 7 | **operativa** | Están, en bodega. Son Confección sin módulo: cuentan como **reserva** de los módulos (el «en stock» del balanceo). |
| TINTORERIA | 3 | **operativa** | Están, en Tintorería. Sin módulo: no cuentan para ningún módulo de confección. |
| NO FISICAMENTE | 6 | **dada de baja** | Motivo «no está físicamente». |

**Cómo se hizo:**
- Las tres reglas están en la **lista de fábrica** de «Cómo se lee el archivo del inventario» (`REGLAS_INV_04` dentro de
  `MAQ_INV_DEF`). En producción esa tabla nunca se editó (`S.params.maqInv` no existe), así que manda la lista de fábrica.
- **Siembra única** `sembrarReglasInvMaq04` (desde `sembrarMaquinasAlEntrar`, o sea al entrar): si la tabla ya se había
  editado, le agrega las tres; si una regla de la tabla ya lee esa observación (igual o contenida, p. ej. «BODEGA»), se
  conserva y la nueva no entra. Bandera `S.params.reglasInvMaq04` con quién, cuándo, cuáles agregó y cuáles ya estaban, y
  una línea en la bitácora. Nunca desde el piso; solo con permiso `config`.
- **Columna nueva «Motivo (solo con «dada de baja»)»** en la tabla «Observación → estado»: visible y editable (apagada si la
  regla no es de baja). Una regla de baja **con motivo** da de baja al cargar: la máquina entra con
  `m.baja = {ts, u, motivo, antes, regla, porRegla:true, archivo}` (la forma de `darBajaMaq` más la regla). **Sin motivo,
  sigue como antes**: entra «por revisar» con «el archivo dice baja: confirmar con dar de baja». Así «dar de baja pide motivo»
  se cumple: el motivo lo dio la usuaria en la regla.
- Una máquina **ya de baja coincide** (no cambia su motivo); una con el estado **cambiado a mano se conserva**; una baja por
  regla no queda «a mano» (si el archivo la vuelve a traer en uso, cambia y la baja queda marcada como reactivada).
- **Vista previa:** un renglón con el estado con que quedan («148 operativas · 7 paradas · 6 de baja · 0 por revisar», contando
  lo cambiado a mano) y otro con cuántas entran de baja por regla y con qué motivo. La confirmación, la bitácora y el registro
  de cargas lo cuentan («6 de baja por regla («no está físicamente» ×6)»).
- **Lista de máquinas:** debajo del estado, «no está físicamente · por la regla «NO FISICAMENTE»»; el aviso de arriba dice
  cuántas de baja son por regla y, si hay máquinas «por revisar» cuya observación ya tiene regla, pide volver a cargar.

**Con el Excel real** (planMaquinas, lista de fábrica): entran **161** = **148 operativas + 7 paradas + 6 de baja + 0 por
revisar**; 136 con módulo o Botones; 8 Confección sin módulo operativas (las 7 de bodega y 1 sin observación) que cuentan como
reserva; 3 de Tintorería; 8 filas no entran (igual que antes).

**Pruebas:** IM6 cambió de observación (la fila «sin regla» ya no puede ser «EN BODEGA»); **IM-REAL (04-oct)**, tres
comprobaciones nuevas con el archivo real, una de ellas con la ventana «Cargar inventario» dibujada; **IM16–IM22** con filas
sintéticas (lista de fábrica, siembra sobre una tabla editada sin pisar, piso y permisos, columna motivo dibujada y editable,
baja por regla al leer y al aplicar, recarga sin cambios, regla sin motivo = por revisar, aviso de recargar).
