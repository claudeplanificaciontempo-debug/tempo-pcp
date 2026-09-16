# Reconciliación del catálogo — corrección de las cifras del 16-sep

**Commit:** `5f81616` · **Harness:** 1.457 pruebas verdes.

**Tenías razón: mis cifras estaban mal.** El listado del 13-sep era el correcto.

---

## 1 · Por qué no coincidían

### Qué fuente usó cada cifra

| Cifra | Fuente que usé | ¿Correcta? |
| --- | --- | --- |
| «60 categorías, 46 con operaciones» (listado 13-sep) | **catálogo real de Supabase** + órdenes abiertas reales | **sí** |
| «Level 1 y Level 2 no existen en el catálogo» (16-sep) | **catálogo sembrado del simulador** (datos de demo) | **no** |
| «solo 3 de 24 con familia LMO» (16-sep) | el mismo catálogo de demo | **no** |
| «2 operaciones de etiqueta en BVD y FITS» | hoja LMO real (fixture) | **sí** |
| «16 operaciones de ojales y botones» | hoja LMO real (fixture) | **sí** |

### La causa, en concreto

El simulador arranca con un **catálogo de demostración** de 24 filas cuyas familias son inventadas:
**CAM BÁSICA, POLO PIQUÉ, HOODIE, JEAN, TEJIDOS, Nuevo padre** y siete «Nueva hija».

La tabla que vincula una categoría con su hoja de operaciones es **padre → categoría LMO**, y sus claves son los
nombres **reales** de Odoo (CAMISETAS, POLOS, CAMISAS, DENIM, HODDIE…). De las familias del demo, solo
**CAMISETAS** y **SHORT PLANOS** existen de verdad — por eso salían «3 vinculadas».

Y cargar el volcado de órdenes **no crea categorías**: de las **1.206 órdenes reales** que carga el simulador,
**solo 133 lograban resolver su categoría** contra el catálogo de demo. Las otras 1.073 quedaban sin categoría,
y con ellas Level 1, Level 2 y casi todo lo demás.

**En resumen: medí las brechas del catálogo de pruebas y las reporté como si fueran las de tu operación.** Eso
estuvo mal y lo corregí.

---

## 2 · La medición rehecha, contra los datos reales

El simulador ahora **arma el catálogo real** desde el mismo volcado de órdenes y reenlaza las 1.206 órdenes por
su campo «PADRE / Hija». Todo lo de abajo está medido así y verificado con pruebas.

| | Real |
| --- | --- |
| **Familias (padre)** | **22** |
| **Categorías hija** | **51** |
| **Vinculadas a su familia de la LMO** | **40** |
| **Sin vínculo** | **11** |
| Operaciones en la hoja LMO | 595 |
| Categorías LMO distintas | 18 |
| Categorías LMO que nadie usa | 1 (**BOXER**) |

### Las 11 sin vínculo

| Familia / categoría |
| --- |
| JOGGER / Jogger · JOGGER / Jogger Moda |
| Fleece Basico / Crew |
| Fleece Pesado / Crew Moda · Fleece Pesado / Crew Zip |
| TEJIDOS / Camiseta Tejida · TEJIDOS / Polo Tejida · TEJIDOS / Henley Tejida |
| FALDAS / Faldas |
| ENTERIZO / Enterizo |
| ACCESORIOS / Accesorios |

**Son exactamente las que producción marcó «⚠ SIN OPERACIONES» en tu listado del 13-sep.** Ese listado contaba
14 porque incluía tres que hoy tienen 0 órdenes (Hoodie Tejido, JUMPER, Chalecos), que por eso no aparecen en el
volcado. **Las dos mediciones cuadran.**

Y el problema no son hijas sueltas: son **siete familias enteras** sin hoja de operaciones. Eso es lo que hay
que cargar, no un mapeo que falte.

### Comparación con lo que reporté mal

| | Reporté (16-sep) | Real |
| --- | --- | --- |
| Categorías | 24 | **51** (hijas) + 22 familias |
| Con familia LMO | 3 | **40** |
| Sin vínculo | 21 | **11** |

---

## 3 · La regla de etiqueta, confirmada con datos reales

**Las cuatro categorías existen** en el catálogo real, las cuatro bajo la familia **CAMISETAS**, y la regla les
carga sus **0,50 min**:

| | |
| --- | --- |
| Categorías | Level 1 · Level 2 · Camiseta CR · Camiseta CV |
| **Órdenes que llevan la etiqueta** | **423** |
| **Prendas** | **206.738** |
| **Minutos de etiqueta** | **103.369** (≈ 1.723 horas) |

Probado también que una categoría fuera de la regla (Polo Basica) **no** recibe la etiqueta — ni siquiera como
0: simplemente no aparece.

**Lo que dije el 16-sep («la etiqueta de 0,5 min no carga en ninguna camiseta») era falso.** Carga en 423
órdenes.

---

## 4 · JEANS → DENIM: **no se ejecutó**

**Solo está implementado y probado.** No se ha ejecutado sobre tus datos y **no se ejecutará solo**: la función
corre **únicamente** al pulsar «Unificar en DENIM» en Configuración → Categorías. No está en ninguna siembra
automática — lo verifiqué.

*(En el simulador sí se ejecuta dentro de una prueba, pero eso es memoria descartable: no toca Supabase.)*

**Lo que movería, con los datos reales:**

| Qué | Cuántos |
| --- | --- |
| Categorías del catálogo | **3** |
| **Órdenes** | **13** (de las abiertas y en rango; 31 contando todo el volcado) |
| Operaciones de la LMO | **49** (toda la categoría JEANS) |
| Filas de configuración | **4** |

Las 4 filas: `DENIM → JEANS` y `JEANS → JEANS` del mapeo a la LMO · la fila `jean` de ojales y botones ·
`lavado [denim, jean] 15 días` de las esperas.

Órdenes de ejemplo: WH/MO/29136, WH/MO/29134, WH/MO/29135, WH/MO/28276, WH/MO/28275.

**Queda a la espera de tu confirmación.** No lo ejecuto.

---

## 5 · Etiquetas BVD / FITS: se quedan en «sin centro»

Siguen las dos, **sin borrarse**, en el panel «Operaciones sin centro» de Configuración → Operaciones:

| Categoría LMO | Operación | Máquina | Min |
| --- | --- | --- | --- |
| FITS | Etiquetar | TAMPOGRÁFICA | 0,35 |
| BVD | Etiquetar | MANUAL | 0,40 |

Verificado que **nada les asigna centro automáticamente**: solo cambian si tú eliges uno en el desplegable.
Se quedan ahí hasta tu decisión con producción.

---

## Una advertencia importante sobre lo que sí corre solo

Para que no te tome por sorpresa: **la unificación no corre sola, pero las siembras del 16-sep sí.** La primera
vez que abras la app con esta versión se aplican, una sola vez y con línea en bitácora:

| Siembra | Qué hace en tus datos |
| --- | --- |
| Etiquetado | retira la regla «SERIGRAFIA + ETIQUETAR → Etiquetas» y deja **esas dos operaciones sin centro** (sin borrarlas) |
| Plancha | quita la marca de «estimado» de los 2 min/prenda |
| Lavado | fija planta 3 días y Quito 15, los dos como tiempo de espera |
| Ojales y botones | confirma las 3 filas que estaban sin confirmar |
| Rutas | quita el permiso `ruta` a los perfiles de centro |

Todas son **idempotentes y editables**: si ya cambiaste algo a mano, no se pisa. Si prefieres que alguna no se
aplique todavía, dime cuál y la dejo detrás de un botón en vez de automática.

---

## Cambio en el simulador

Las pruebas ya no miden contra el catálogo de demo. En el punto donde están cargadas las órdenes reales, el
simulador **arma el catálogo real** (22 familias, 51 hijas), reenlaza las 1.206 órdenes y vuelve a correr el
mapeo. Hay pruebas que fijan los números de arriba, así que **si vuelven a moverse, el harness lo dice**. Eso es
lo que faltaba para que no se repita el error.
