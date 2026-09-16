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
