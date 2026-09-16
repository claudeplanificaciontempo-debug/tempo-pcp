# Decisiones de producción del 16-sep-2026

**Commit:** `92a04fe` · **Harness:** 1.349 pruebas verdes, sin errores.

Los seis puntos están implementados. Dos de ellos (1 y 6) los pediste **reportados antes de mover nada**:
los números de abajo salen del volcado real, no de datos inventados.

---

## 1 · Etiquetado

**Regla aplicada:** solo **Level 1, Level 2, Camiseta CR y Camiseta CV** llevan etiqueta de serigrafía, 0,5 min.

Esa etiqueta **no existe en la hoja LMO** para ninguna de esas cuatro categorías, así que no podía salir de ahí.
Ahora sale de una **tabla editable** en *Configuración → Operaciones → «Etiqueta de serigrafía»*: categoría,
min/prenda, centro y una casilla de **confirmada**. Una fila sin confirmar **no aplica** y sale como brecha.
El calce es **exacto**: «Camiseta CR» no arrastra a «Camiseta CV» ni al revés (está probado).

### Las operaciones de BVD y FITS — qué son exactamente

Tenías razón: **no cargan a Estampado**. Buscando en la LMO, las operaciones que la regla mandaba a Etiquetas
son **exactamente dos**, y las dos son de BVD y FITS:

| Categoría LMO | Sección | Familia | Operación | Máquina | Min |
| --- | --- | --- | --- | --- | --- |
| **FITS** | GENERAL | SERIGRAFIA | Etiquetar | **TAMPOGRÁFICA** | 0,35 |
| **BVD** | GENERAL | SERIGRAFIA | Etiquetar | **MANUAL** | 0,40 |

Qué hice: **retiré la regla** «SERIGRAFIA + ETIQUETAR → Etiquetas» del mapeo familia→centro, con lo que esas
dos operaciones quedan **sin centro**. **No se borraron**: aparecen en el panel nuevo **«Operaciones sin
centro»** (Configuración → Operaciones), con su categoría, máquina, minutos, el motivo por el que quedaron
así y un desplegable para que **tú decidas a qué centro pertenecen**. Mientras tanto no suman minutos en
ninguna parte, y eso se ve — no es un cero mudo.

**Ojo con estas otras, que NO toqué** (son distintas y están bien donde están):

- **«PEGAR ETIQUETA» / «PREPARAR ETIQUETA»** (familia ENSAMBLE, máquina RECTA): son etiquetas **cosidas**,
  van a confección. Están en casi todas las categorías.
- **«ETIQUETAR PRENDA»** (familia EMPAQUE, MANUAL): va a empaque. También en casi todas.

### Brecha que aparece de inmediato

**«Level 1» y «Level 2» no existen en el catálogo de categorías cargado.** La tabla las tiene y el panel lo
marca en rojo: *«2 reglas apuntan a una categoría que no está en el catálogo»*. Hasta que existan, esa
etiqueta no carga en ninguna orden. Si en tu base sí están, la regla funciona sola.

---

## 2 · Plancha

**2 min/prenda confirmado.** Se quitó la marca de «estimado» y el consolidado dejó de pedirte que lo
confirmes. Sigue editable en Configuración → Centros.

---

## 3 · Lavado

| | Días | Capacidad | Estado |
| --- | --- | --- | --- |
| **En planta** | 3 | **Solo tiempo de espera** | con la nota *«ocupa capacidad propia; pendiente datos de lavadoras»* a la vista |
| **En Quito** | 15 | Solo tiempo de espera | confirmado |

La nota del lavado en planta va **pegada a la fila**, en la tabla de esperas por paso, cada vez que se dibuja.
No es definitivo y la pantalla lo dice.

**El lavado ya no se asigna por regla automática.** La modalidad vive **en la orden** (`lavadoModo`) y manda
sobre cualquier calce por categoría: una orden marcada Quito cuenta 15 días aunque su categoría diga otra cosa.

**Cómo se agrega o se quita:**

- **A varias a la vez:** en **Liberación**, marcas las órdenes y usas **«Lavado de las marcadas (n)»**.
- **A una:** desde la **ruta de cualquier orden** (el botón «ruta» que ya está en todas las pantallas con
  órdenes) hay una línea que dice a qué lavado va y un botón **«agregar o quitar lavado»**.

El modal ofrece **Lavado en planta**, **Lavado en Quito** y **Quitar el lavado**, dice cuántas ya lo tienen y
cuántas tienen **ruta editada a mano** (esas se avisan aparte). El **motivo es obligatorio**, todo queda en la
**auditoría de ruta** y en la bitácora, y el paso entra en su lugar: después de confección, **antes de plancha
y empaque**. Cambiar de modalidad no duplica el paso.

---

## 4 · Ojales y botones

Los tiempos de la tabla quedan **definitivos**: se confirmaron las 3 filas que estaban sin confirmar
(vestido, jean, denim). Ya no hay ninguna categoría con regla sin confirmar. Un **0 confirmado sigue
aplicando 0**.

De paso corregí un error real que apareció al probar: al renombrar o unificar una fila, el sistema la
**reponía sola en blanco y sin confirmar**. Ya no lo hace.

---

## 5 · Órdenes sin ruta — ruta estimada aprobada

Tres estados, visibles en toda la pantalla de rutas:

1. **estimada – sin revisar** · 2. **estimada – revisada** · 3. **real** (confirmada por una persona o por
coincidencia exacta con las OT de Odoo).

**Dónde:** *Órdenes → Rutas → «Rutas estimadas»*. Un botón pone la ruta estimada a todas las que no tienen
ninguna; cada una se puede **ver, editar y marcar como revisada** (queda quién y cuándo), y hay dos pestañas,
sin revisar y revisadas.

**Conteo en Reportería:** un panel propio con las cuatro cifras — sin revisar, revisadas, todavía sin ninguna
ruta, y **cuántas podrían llevar estampado o bordado**.

**Los pasos que dependen del diseño no entran.** Estampado, bordado y etiquetas quedan fuera de la ruta
estimada. Y la pantalla lo advierte donde importa: si la categoría de esa orden **sí tiene minutos** en
estampado o bordado, la fila lleva una etiqueta roja «falta Estampado / Bordado» y arriba se lee que **esa
carga puede estar faltando en el plan** hasta que revises la ruta.

Sobre el volcado real eran **685 órdenes abiertas sin ruta de producción**.

---

## 6 · Catálogo

### DENIM y JEANS — lo que apunta a JEANS hoy

Lo primero: **el mismo producto tiene tres nombres distintos** según dónde se mire. Eso es la raíz del
problema:

| Dónde | Cómo se llama |
| --- | --- |
| Órdenes (Odoo) | Categoría padre **DENIM**, hija **Jeans** |
| Hoja LMO | Categoría **JEANS** |
| Catálogo de la app | Familia **JEAN** (singular), hija **Jeans** |

Lo que apunta a JEANS / Jeans:

| Qué | Cuántos | Detalle |
| --- | --- | --- |
| **Órdenes** (volcado real) | **31** | 30 hija *Jeans* + 1 *Short Denim*, todas bajo el padre DENIM. Clientes: FASHION CLUB y PRICE CLUB |
| **Operaciones de la LMO** | **49** | toda la categoría JEANS, con máquinas TP (RECTA TP, PRETINADORA MULTIAGUJA, OJAL LÁGRIMA TP, REMACHADORA TP…) |
| **Categorías del catálogo** | la familia **JEAN** y su hija *Jeans* | |
| **Filas de configuración** | **4** | Mapeo categoría→LMO: `DENIM → JEANS` y `JEANS → JEANS` · Tiempos de ojales y botones: fila `jean` · Esperas por paso: `lavado [denim, jean] 15 días` |

**Dónde verlo:** *Configuración → Categorías → panel «DENIM y JEANS»*, con todas esas cifras y la lista de
órdenes **antes** de tocar nada.

**Qué hace «Unificar en DENIM» — y qué no hace.** No borra nada, y está probado: después de unificar quedan
exactamente las mismas categorías, órdenes y operaciones que antes.

- La familia se **renombra** a DENIM (es la misma fila, no una nueva).
- Si hubiera otra familia JEANS aparte, sus **hijas se cuelgan de DENIM** y la fila vieja queda marcada
  `unificadaEn` e inactiva, **sin borrarse**.
- La fila `jean` de ojales y botones queda **unificada en `denim`** (si `jean` tenía valores y `denim` estaba
  en cero, se copian) y **tampoco se borra**.
- El mapeo a la hoja LMO **sigue apuntando a JEANS**, que es el nombre de origen del archivo: ese no se toca.
- Todo queda en la **bitácora** y en la auditoría.

### HENLEY y las «Nueva hija»

**No se tocan.** La unificación solo mira JEANS. HENLEY es una categoría real (34 operaciones en la LMO,
dos hijas en las órdenes: *Henley MC* y *Henley ML*) y sigue igual, **pendiente de su nombre definitivo**.
Lo mismo con las filas llamadas «Nueva hija»: quedan donde están hasta que les pongas nombre.

---

## Archivos tocados

| Archivo | Qué cambió |
| --- | --- |
| `index.html` | `reglasEtiqueta`/`etiquetaDe`/`reglasEtiquetaHTML`, `opsSinCentro`/`setCentroOp`/`opsSinCentroHTML`, `sembrarEtiquetado`, `sembrarPlanchaConfirmada`, `sembrarLavado`/`avisoLavadoPlanta`/`mLavado`/`aplicarLavado`/`posLavado`, `sembrarOjalBotonConfirmados`, `rutaEstimadaDe`/`generarRutasEstimadas`/`marcarRutaRevisada`/`estadoRuta`/`rutasEstimadasHTML`/`rutasEstimadasResumenHTML`, `diagJeans`/`unificarJeansEnDenim`/`jeansHTML`; `samPorCentro` suma la etiqueta e ignora operaciones sin centro; `esperaDeCentro` respeta la modalidad de la orden |
| `test/driver.js` | 42 pruebas nuevas de los seis puntos y 6 existentes actualizadas a las decisiones |
| `DECISIONES_PRODUCCION_16SEP.md` | este reporte |

---

## Brechas detectadas

1. **«Level 1» y «Level 2» no están en el catálogo de categorías.** Sin ellas, dos de las cuatro reglas de
   etiqueta no cargan en ninguna orden. El panel lo marca.
2. **Las dos operaciones de BVD y FITS quedaron sin centro**, esperando que decidas a cuál pertenecen.
3. **Solo 3 de 24 categorías tienen familia LMO vinculada** (Camiseta CV, Short Cargo, Short Basico). Esta es
   la brecha grande: por ella, 15 de las 16 operaciones de ojales y botones y casi toda la hoja LMO no llegan
   a ningún producto. Se arregla en *Configuración → Operaciones → Mapeo*.
4. **685 órdenes abiertas sin ruta de producción**; con la ruta estimada pasan a ser revisables, pero hay que
   revisarlas.
5. **Estampado y bordado no entran en la ruta estimada** (dependen del diseño): esa carga puede faltar en el
   plan mientras las rutas estén sin revisar.
6. **Lavado en planta: los datos de las lavadoras siguen pendientes.** Por ahora cuenta como tiempo de espera
   y la pantalla dice que no es definitivo.
7. **HENLEY y las «Nueva hija» siguen sin nombre definitivo.**
