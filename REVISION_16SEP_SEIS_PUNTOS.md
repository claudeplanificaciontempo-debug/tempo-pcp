# Revisión del 16-sep-2026 · los seis puntos

**Harness:** 1235 pruebas verdes, sin errores de consola. **Motor:** no se tocó (solo lee el cierre del paso, que ya
estaba autorizado). Todo publicado.

| Punto | Commit |
| --- | --- |
| 1 · Liberación: meses en multiselección y filtro de fases | `45af33e` |
| 6 · "va tarde" en los centros | `aed9aea` |
| 3 · Terminados por sub-área | `2a01ff0` |
| 2 y 4 · Agrupador anidado, Tela y minutos | `fbf3991` |
| 5 · Mi centro: En proceso / Disponibles / Próximas | `3d55699` |

---

## 1 · Liberación a producción

**1a · «Mes del Proyecto» es multiselección.** Usa el mismo componente que Categoría y Tipo de tela, que ahora tiene
**«Seleccionar todos»** (marca todos los meses) y **«Limpiar»** (quita el filtro). Se pueden ver varios meses a la
vez y el texto de la base los nombra: «base: órdenes del Proyecto de enero de 2027, marzo de 2027».

*De paso, un hallazgo:* el filtro **«Mes de entrega»** filtraba por el **mismo mes del Proyecto** (usaba `mesPlan`,
no la fecha de entrega). Estaba mal rotulado y duplicaba el filtro nuevo, así que lo quité del panel.

**1b · El bug de los checkboxes de fases.** Causa: el filtro tiene tres estados —todas (sin marcas), ninguna
(centinela `∅`) y una selección— y el conmutador no los distinguía. Después de tocar **Limpiar**, marcar una
casilla añadía la fase **junto al centinela**, así que la pantalla seguía diciendo «Ninguna fase» y ninguna casilla
se marcaba. Y partiendo de «todas», desmarcar una dejaba **solo esa** en vez de todas menos esa.

Ahora el conmutador parte del estado real: de *todas* quita una, de *ninguna* marca una, y al quedarse sin ninguna
vuelve al centinela. **Seleccionar todas**, **Limpiar** y el **todas/quitar por grupo** quedan coherentes.

**Y el filtro ahora filtra de verdad.** Desde el rediseño del bloque 1, el bloque solo miraba ODC, familia y
cliente: las fases, la categoría y el tipo de tela **no se aplicaban**. Ahora acotan la lista, las tarjetas por
familia, el conteo de la tarjeta y el botón **«Liberar todo lo filtrado (N)»**.

*Otro hallazgo:* el «todas/quitar» por grupo de fase **no hacía nada** en Centro ni en Carga general, porque el
resolutor de estado no conocía esas dos pantallas. Arreglado.

---

## 2 · Plan mensual → «Agregar órdenes al plan»

El «Agrupar por» simple se reemplazó por el **agrupador anidado de Liberación** (hasta 3 niveles, se recuerda por
usuario). Opciones: **Cliente, Fase, Familia, Tipo de producto, Tela, Color, ODC, Mes de entrega**, y además Próximo
paso, Proyecto y Etapa, que ya existían. Cada grupo trae un **checkbox «marcar el grupo»** que marca o desmarca
todas sus órdenes de una vez (el agrupador común aprendió a mostrar checkbox, no solo el enlace de «seleccionar
todo»).

---

## 3 · Terminados por sub-área

**Sigue siendo un solo ítem de planificación**, pero abre con un **consolidado** de sus sub-áreas —ojales y
botones, plancha, lavado, empaque y etiquetas— con, por cada una: órdenes en cola, prendas por hacer, min/prenda,
carga pendiente, programado de la semana, capacidad de la semana y ocupación. Debajo sigue la cola y la
programación de cada sub-área por separado, como ya estaba. **El orden entre sub-áreas lo pone la ruta de cada
orden**, no el código.

**Configurable, nada fijo:**
- columna **«Ítem de planificación»** por centro (Configuración → Centros): a qué ítem pertenece cada sub-área;
- columna **«Por días»**: procesos que se miden en días y **no consumen capacidad de planta** (lavado);
- **Min/prenda** y **% estimado** dejan de ser exclusivos de lavado y plancha: cualquier sub-área los puede cargar.

**Sembrado** (idempotente, en bitácora, editable): **plancha 2 min/prenda** y **lavado como proceso por días**. Las
esperas de lavado ya estaban en la tabla de esperas por paso: **3 días en planta** y **15 días en Quito** para
denim/jean.

### Por qué Lavado y Plancha mostraban 0 horas
Son **tres datos faltantes**, no un fallo de cálculo:

1. **ninguna orden tiene esos pasos en su ruta.** La ruta por defecto es corte → confección → empaque y las
   órdenes de trabajo de Odoo no traen lavado ni plancha. El motor solo programa lo que está en la ruta: sin paso,
   no hay horas. ← la causa principal;
2. aunque los tuviera, **el minuto por prenda de esos centros estaba vacío** y **no hay ninguna operación mapeada**
   a ellos (0 operaciones en cada uno), así que el tiempo del paso sale 0;
3. la **reserva** (la estimación de lo que caerá ahí aunque no esté en la ruta) da 0 por lo mismo, y eso ya lo
   avisaba la bandeja de Hoy.

El consolidado ahora **dice las dos cosas en pantalla** —qué sub-áreas no tienen minutos y cuáles no aparecen en
ninguna ruta— en vez de mostrar un 0 mudo.

---

## 4 · Agrupación en todos los centros que programan

Todos los centros (Corte, Confección, Estampado, Bordado, Terminados con sus sub-áreas y Empaque) comparten la
misma pantalla, así que la agrupación plegable ya estaba en todos. Lo que faltaba:

- **Tela** como criterio de agrupación: sale de la tela de **mayor consumo** de la orden y, si la orden no la trae,
  de la **tabla categoría → tela**; las que no tienen mapeo caen en **«Sin tela asignada»**;
- cada grupo muestra ahora **órdenes, prendas, horas y minutos** (antes solo horas).

Fase y Familia ya estaban. Los tres se pueden anidar hasta 3 niveles.

---

## 5 · Piso · pantalla del operario

Cada orden tiene un **estado en el centro**: pendiente → en proceso → terminada. «En proceso» es tener un **inicio
sin fin** o **cantidades ya registradas** sin haber cerrado la orden en el centro.

- **«En proceso» va arriba de todo**: foto, WH, hechas/total, **barra de avance**, botón **CONTINUAR** (no INICIO) y
  **«Terminar orden»** para cerrar el paso.
- Un **INICIO sin FIN** se ve como **EN CURSO con el tiempo transcurrido**: en el propio puesto con el reloj grande
  de siempre, y desde otro puesto del mismo centro, en la línea de la orden.
- **«Disponibles»** (la orden ya está en la fase de este centro, se puede iniciar) queda separada de **«Próximas»**
  (su fase todavía es de un paso anterior: se ven, dicen en qué fase están y **no ofrecen INICIO**).

La comparación sale de la **tabla centro → etapa** y del **orden de grupos de la tabla 5**, no de una lista en el
código. Con eso, Módulo 1 deja de poder iniciar órdenes que siguen en Trazos, Corte Planta, CD Bordado o CD
Tintorería: las verá en «Próximas».

---

## 6 · Las 26 órdenes de Corte que decían «va tarde»

**Contra qué fecha se calcula:** contra la **fecha meta de la ORDEN** —el compromiso si existe, si no la fecha de
Odoo— comparada con el día en que el programa **termina la orden completa**. **No** contra el paso del centro. Por
eso una orden que entra y sale de Corte el mismo día igual aparece «va tarde»: lo que no llega es la orden entera,
por lo que le falta después de Corte (o porque su fecha ya pasó).

El cálculo no estaba mal; **la etiqueta sí**, porque en la cola de un centro se lee como si el paso fuera el
atrasado. Ahora hay tres marcas distintas:

| Marca | Qué dice |
| --- | --- |
| **meta vencida** | la fecha meta de la orden **ya pasó**: llega tarde desde antes de entrar a ese centro |
| **la orden va tarde** | el programa la termina después de su meta (el tooltip da meta, fin y días) |
| **este paso va tarde** | el paso **de ese centro** termina después de su propio límite — lo único que el centro puede mover |

Y **arriba de cada cola** hay una línea que explica contra qué fecha se compara y **cuántas de las que están en la
cola caen en cada causa**, para no tener que abrir orden por orden. Abre Corte y esa línea te dice, de las 26,
cuántas son «meta vencida» y cuántas «la orden no alcanza».

---

## Archivos tocados
`index.html` (los seis puntos) · `test/driver.js` (pruebas nuevas y las que había que poner al día) ·
`CLAUDE.md` y `TRASPASO_TEMPO_PCP.md` · este reporte.

---

## Datos que faltan (brechas visibles, ninguna inventada)

1. **Lavado y plancha no están en la ruta de ninguna orden.** Mientras no entren en la ruta —desde Órdenes → Rutas,
   o cuando Odoo las traiga— su carga seguirá siendo 0. Es el dato que más pesa.
2. **Sin operaciones mapeadas a lavado ni a plancha** (0 en cada uno). Plancha ya tiene 2 min/prenda sembrados;
   **lavado no necesita minutos** si se mide por días, pero **confírmame los 2–3 días de planta** (quedó sembrado
   en 3, marcado como estimado).
3. **Lavado en Quito (~15 días)**: está como espera para denim/jean. Para **prenda tinturada** el sistema **no sabe
   qué órdenes son**: la regla quedó marcada «sin regla» a la espera de que me digas cómo se identifican.
4. **Ojales y botones**: dijiste «según tiempos de operación corregidos». Hoy el centro tiene 16 operaciones
   mapeadas; **no sé cuáles son los tiempos corregidos**. Si me pasas la lista, la cargo; si prefieres, se puede
   poner un min/prenda de la sub-área en la columna nueva.
5. **Empaque como sub-área de Terminados**: lo puse dentro del consolidado (lo nombras como «Empaque, terminado
   final») **y** le dejé su propia entrada de menú, porque en el punto 4 lo vuelves a nombrar aparte. Si quieres
   una sola de las dos, se cambia en la columna «Ítem de planificación» sin tocar código.
6. **Las 26 órdenes de Corte**: no puedo darte el reparto exacto por causa desde aquí (la base de pruebas tiene
   otras órdenes). La línea nueva arriba de la cola te lo dice con tus datos en cuanto abras la pantalla.

---

# Ajustes pedidos sobre esta revisión (A–E)

**Harness:** 1270 pruebas verdes, sin errores.

| Letra | Commit |
| --- | --- |
| B y C · Mes de entrega real y de dónde sale cada tiempo | `28b4543` |
| A · Disponibles vs Próximas por la secuencia de la ruta | `507d59f` |
| D · Tabla de reglas de ruta | `3180b02` |

## A · Mi centro: manda la secuencia de la ruta

Tenías razón y estaba mal planteado: el número de fase dice **a qué grupo pertenece**, no en qué orden se hace, y en
estampado, bordado y confección el orden es empírico. Ya **no se usa el orden de grupos de la tabla 5** para decidir
si una orden llegó al centro. Ahora:

- **Disponible**: todos los pasos de producción **anteriores de su propia ruta** están hechos.
- **Próxima**: falta alguno, y la etiqueta dice cuál — «todavía no · falta Corte».
- **Ruta sin secuencia** (sección nueva, en rojo): la orden no tiene ruta de producción, el centro no está en su
  ruta, o el centro aparece dos veces. Ahí se **ve**, dice el motivo y **sí se puede iniciar**: ni bloqueada ni
  habilitada en silencio, como pediste.
- Si el tramo es **no secuencial** (grupo con `secuencial = false` en la tabla 5) y lo que falta es de ese mismo
  tramo, queda **disponible con el aviso** de que el orden real lo dan las órdenes de trabajo de Odoo.

**Cuántas cambian de lado.** Se agregó `cambiosDisponibilidad()`, que compara la regla vieja contra la nueva por
centro y en los dos sentidos. En la base del simulador (12 casos evaluables) dio: **4 pasan de Próxima a
Disponible** (corte 2, confección 1, botones 1), **1 pasa de Disponible a Próxima** (plancha) y **1 queda en «ruta
sin secuencia»**. Con tus datos el reparto es otro: la función recorre todos los centros y lo cuenta; dime si
quieres que lo deje fijo en algún panel.

## B · Mes de entrega

Restaurado, **multiselección**, y ahora filtra por la **fecha de entrega real** de la orden (antes usaba el mes del
Proyecto, que es lo que lo volvía un duplicado). Las órdenes sin fecha caen en **«Sin fecha de entrega»**, que
también se puede marcar para verlas juntas. Convive con «Mes del Proyecto»: son dos cosas distintas y cada filtro
dice cuál mira.

## C · Tiempos de Terminados

- **Plancha**: 2 min/prenda cargados como valor inicial en la columna editable (sembrado idempotente, en bitácora,
  marcado como estimado hasta que lo confirmes).
- **Ojales y botones**: **sí usa los tiempos corregidos**, y **no hay dos tablas compitiendo**. El orden es: base =
  SAM de las **operaciones de la LMO** del centro; encima, la **tabla de ojales y botones** (coincidencia por
  nombre de la categoría o de su padre) **reemplaza** ese SAM en las categorías que coinciden, pero **solo si la
  fila está confirmada** — las sembradas sin confirmar (vestido, jean, denim, en 0) no se aplican. Ese valor se
  escribe en el paso «botones» de la ruta de cada orden, que es lo que lee el motor. El consolidado de Terminados
  ahora **dice de dónde sale el tiempo de cada sub-área**, con cuántas operaciones hay mapeadas y cuántas reglas
  confirmadas.
- **Lavado**: 3 días en planta como valor inicial editable y 15 días en Quito, en la tabla de esperas por paso; el
  centro queda marcado **«por días»**, así que **no consume capacidad de planta**.

## D · Reglas de ruta

Tabla editable nueva en **Órdenes → Rutas**: familia + categoría + atributo (texto que se busca en producto,
referencia, color, categoría o WH) → **sub-área a insertar** y **dónde** (antes de un paso, después de un paso o al
final). **Arranca vacía** y cada regla nueva **nace apagada**.

- **Vista previa permanente**: por regla, a cuántas órdenes afecta, cuántas ya tienen esa sub-área, cuántas quedan
  fuera por ruta editada a mano y cuántas no tienen el paso de referencia.
- **Las rutas editadas a mano no se sobrescriben** (ahí entran las 247 que no siguen la ruta por defecto): se
  listan aparte, con su ruta actual y un botón para editarlas una por una.
- Nada cambia hasta apretar **Aplicar**, que confirma diciendo cuántas se tocan y cuántas quedan fuera.
- Cada cambio queda en la **auditoría de ruta**, en la **bitácora** y en el historial de la propia orden. Volver a
  aplicar no duplica el paso.

## E · Las dos aclaraciones

1. **«todas/quitar» por grupo en Centro y Carga general: quedó CORREGIDO**, no solo detectado. El resolutor de
   estado de los filtros comunes no conocía esas dos pantallas (ni Producto en proceso ni Plan → agregar); se
   agregaron las cuatro en el commit `45af33e`, el mismo del punto 1.
2. **Puntos 2 y 4 en `fbf3991`.** Los dos tocan los mismos dos archivos —`index.html` y `test/driver.js`—, porque
   la app es un solo archivo. Por función:
   - **punto 2** (Plan mensual): `agregarAlPlanHTML` (pasa a `filasGRP('pmadd')` + `grpSelHTML` en vez del select
     simple), `selGrupoPMADD` nuevo, y `filasGRP`, que aprendió `g.selChk` para el checkbox por grupo;
   - **punto 4** (centros): `telaPrincipalDe` nuevo, la clave `tela` en `claveGRP`, `GRP_ORDEN` y
     `GRP_CAMPOS_BASE`, la etiqueta `grp.tela` en la tabla 17 de textos, y los minutos en la fila de grupo de
     `filasGRP`.

## Brechas de datos que siguen abiertas

1. **Lavado y plancha no están en la ruta de ninguna orden.** La tabla de reglas de D es justamente la herramienta
   para arreglarlo, pero **las reglas las cargas tú**: familia/categoría/atributo → sub-área y posición.
2. **El atributo del lavado de Quito** (prenda tinturada) sigue sin definirse: la regla de 15 días quedó marcada
   «sin regla», y en la tabla nueva puedes usar el campo «atributo» en cuanto me digas por qué texto se reconoce.
3. **Tiempos corregidos de ojales y botones**: si los que hay en la tabla no son los definitivos, pásamelos y los
   cargo; hoy manda la LMO salvo en las categorías con regla confirmada.
4. **Confirmar** los 2–3 días de lavado en planta (quedó en 3, marcado estimado) y los 2 min/prenda de plancha.
5. **Órdenes sin ruta o con el centro repetido**: salen en «Ruta sin secuencia». En la base de pruebas es 1; con
   tus datos el número aparece en esa sección de cada centro.
