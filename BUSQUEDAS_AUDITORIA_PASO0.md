# Auditoría de búsquedas y filtros — PASO 0

**16-sep-2026 · commit `79a797d`.** Inventario, pruebas y diagnóstico. **No se corrigió nada.**
Harness: **1.999 checks, 0 errores**. De ellos **11 quedan en rojo a propósito**: son los hallazgos.

---

## Resumen en una línea

**La búsqueda en sí funciona bien** (13 de 13 pruebas de normalización, WH parcial, acentos, espacios
y números pasan). **Lo que falla es el andamiaje**: un temporizador compartido que pierde lo escrito,
un redibujo completo de la pantalla en cada tecla, una poda de filtro que convierte «ninguna» en
«todas», y pantallas cuya base ya viene filtrada sin decirlo.

---

## 1 · Inventario

**17 buscadores**, todos por el mismo componente `busqHTML(id, valor, setter)` → `buscarQ` → `matchBusq`
→ `valBusq` + `normTxt`. **No hay buscadores de órdenes propios**: los únicos tres `oninput` que no pasan
por `buscarQ` son campos de formulario (`ODCS.bloque`, `bhTotal`, `setCod`), no búsquedas.

| Pantalla | id | Evento | Filtra con | ¿Común? |
|---|---|---|---|---|
| Órdenes | `ORDF.q` | `input` → `buscarQ` | `matchBusq` | sí |
| Órdenes → Rutas | `RUT.q` | `input` → `buscarQ` | `matchBusq` | sí |
| Liberación · bloque 1 | `LIB.q` | `input` → `buscarQ` | `matchBusq` | sí |
| Liberación · bloque 4 | `LIB.q4` | `input` → `buscarQ` | `matchBusq` | sí |
| Centro | `CEN.q` | `input` → `buscarQ` | `matchBusq` | sí |
| Control de piso | `CTL.q` | `input` → `buscarQ` | `matchBusq` | sí |
| Control → Cambio de fases | `CTLF.q` | `input` → `buscarQ` | `matchBusq` | sí |
| Carga general | `CG.q` | `input` → `buscarQ` | `matchBusq` | sí |
| Producto en proceso | `WIPL.q` | `input` → `buscarQ` | `matchBusq` | sí |
| Vista general de órdenes | `VO.q` | `input` → `buscarQ` | `matchBusq` | sí |
| Asignación por orden | `APO.q` | `input` → `buscarQ` | `matchBusq` | sí |
| Resumen gerencial | `GER.q` | `input` → `buscarQ` | `matchBusq` | sí |
| Entregas | `EG.q` | `input` → `buscarQ` | `matchBusq` | sí |
| Costura | `COS.q` | `input` → `buscarQ` | `matchBusq` | sí |
| Capacidad y decisiones | `CAPD.q` | `input` → `buscarQ` | `matchBusq` | sí · **solo aparece al abrir el detalle de una celda** |
| Plan mensual → agregar | `PMADD.q` | `input` → `buscarQ` | `matchBusq` | sí |
| Mi centro (supervisor) | `TAB.q` | `input` → `buscarQ` | `matchBusq` | sí |
| **Mi centro (operario)** | `#tab-wh` | **`keydown` Enter + botón** | **`calza()` propia** | **NO** |
| Búsqueda general (cabecera) | `BUSG` | `input` | `buscarGeneral` | aparte |

**Filtros:** el de fases es un componente común (`filtroFasesHTML` + `togFaseFiltro` + `refEstado`) en
**Órdenes, Centro, Carga general, Liberación y Familias**. Los multiselección (`selMulti`) están en
Entregas, Liberación y Resumen gerencial. El resto son `<select onchange>` propios de su pantalla.

---

## 2 · Tabla de resultados

| Pantalla | Buscador/filtro | Prueba | Pasa | Causa raíz | Función a corregir |
|---|---|---|---|---|---|
| **todas** | `matchBusq` | WH completa, minúsculas, solo número, parcial, con espacios, un dígito, ODC, acentos | **✅ 13/13** | — | — |
| **todas** | `matchBusq` | OP guardada como **número** en vez de texto | **✅** | — | — |
| **todas** | `normTxt` | mayúsculas, acentos y espacios | **✅** | — | — |
| **todas** | `normTxt` | un **0** no se vuelve vacío | **❌** | `String(x\|\|'')` convierte `0` en `''` | `normTxt` |
| **todas** (17) | foco | escribir «22918» tecla a tecla conserva foco, texto y cursor | **✅ 16/16** con carga baja | — | — |
| **Liberación** | `LIB.q` + `LIB.q4` | dos buscadores en la misma pantalla | **❌ se pierde el primero** | **`_qTimer` es uno solo para todo el sistema** | `buscarQ` |
| **Órdenes** | `ORDF.fases` | «Limpiar» (ninguna fase) se respeta | **❌ se vuelve «todas»** | una poda propia de la pantalla borra el centinela `∅` | `vOrdenes` línea 7176 |
| Centro · Carga general · Liberación | `*.fases` | el centinela `∅` se respeta | **✅** | — | — |
| Órdenes, Centro, Carga general, Liberación | `*.fases` | al marcar queda marcado tras el redibujo | **✅** | — | — |
| Órdenes | fases + buscador | se aplican juntos, no se pisan | **✅** | — | — |
| Órdenes, Liberación, Centro, Carga general | `*.q` | al salir y volver | **✅ las cuatro CONSERVAN** | — | — |
| **Liberación** | base de la pantalla | una WH de otro mes del Proyecto | **❌ no aparece y no se avisa** | `baseLiberacion` filtra por mes **antes** de buscar | `baseLiberacion` / aviso en pantalla |
| **Capacidad y decisiones** | `CAPD.q` | el buscador está en pantalla | **❌ no existe** | es condicional: solo con el detalle abierto y con órdenes | por diseño; documentar |
| **Mi centro (operario)** | `#tab-wh` | busca al escribir | **❌ solo con Enter o botón** | camino propio, no usa `buscarQ` | `tabletBuscadorHTML` |
| **7 pantallas** | `refEstado` | alcanza el estado del buscador | **❌ TAB, CTLF, EG, GER, RUT, COS, CAPD** | el mapa de `refEstado` está escrito a mano | `refEstado` |
| Filtro de fases | catálogo | las fases del filtro calzan con las de Odoo | **✅** | — | — |
| Entregas | `selMulti` meses | queda marcado tras el redibujo | **✅** | — | — |
| **todas** | `buscarQ` | el debounce es configurable | **❌ 150 ms fijos, umbral 300 órdenes** | número en el código | `buscarQ` |

---

## 3 · Causas raíz, por cuántas pantallas afectan

### 1. Redibujo completo de la pantalla en cada tecla — **las 17**

`buscarQ` llama a **`render()` entero** y después vuelve a buscar el input para devolverle el foco:

```js
const run=()=>{const v=el.value,pos=el.selectionStart;fn(v);render();
  const n=document.querySelector('input[data-q="'+id+'"]');if(n){n.focus();n.setSelectionRange(pos,pos)}};
```

**Medido con 1.210 órdenes** (comprobado: `mismoElemento: false`, `elViejoSigueEnElDOM: false` — el
input se destruye y se vuelve a crear en cada tecla):

| Pantalla | Render por tecla |
|---|---:|
| Liberación | **181–186 ms** |
| Órdenes | 64–79 ms |
| Centro (Corte) | 58–87 ms |
| Vista general | 60–61 ms |
| Carga general | 36–37 ms |
| Producto en proceso | 13–14 ms |
| Control de piso | 5–6 ms |
| *Cuando además hay que reprogramar* | **387 ms** |

> **Honestidad sobre esto:** en la simulación a velocidad de mecanografía normal (120 ms por tecla) el
> foco **no** se perdió en ninguna pantalla, porque el debounce hace que el redibujo solo ocurra al
> parar de escribir. **No pude reproducir sintéticamente la pérdida de foco.** Lo que sí está
> demostrado es el mecanismo: el input se destruye y se recrea, y el foco depende de encontrarlo otra
> vez. En **tablet** eso además suele cerrar el teclado en pantalla aunque el foco se restaure — y es
> la explicación más probable del «se sale» que reportan en piso.

### 2. Un solo temporizador para todos los buscadores — **cualquier pantalla con dos**

`_qTimer` es una única variable global y `buscarQ` empieza con `clearTimeout(_qTimer)`. **Reproducido
en el harness:** escribir «229» en el buscador del bloque 1 de Liberación y pasar al del bloque 4 antes
de 150 ms deja `LIB.q = ""` — **lo escrito en el primero se pierde entero**, no llega nunca al estado.

Solo ocurre **con más de 300 órdenes**, que es la condición real de producción (1.078 abiertas). Con
menos, no hay temporizador y no se nota — por eso no había salido antes.

### 3. El debounce es un número fijo en el código — **las 17**

```js
const espera=(S&&S.ordenes&&S.ordenes.length>300)?150:0;
```

150 ms y el umbral de 300 están escritos en el código; `prm()` no se usa. Contradice el principio de
«ningún valor de negocio en el código».

### 4. La base de la pantalla filtra antes que el buscador — **Liberación (y el mismo patrón en otras)**

```js
function baseLiberacion(et,ym){ ... return todas.filter(o=>!yaHecha(o)&&mesEnFiltro(o,ym))}
```

El buscador solo ve lo que quedó de esa base. **Si la WH es de otro mes del Proyecto, no aparece** — y
`LIB.ym` arranca solo en el mes en curso. La pantalla **no dice** «no está porque el mes seleccionado
es otro». **Esta es la explicación más probable de «la búsqueda por WH no encuentra órdenes».**
El mismo patrón está en Centro (semana), Carga general (centro) y Resumen gerencial (meses).

### 5. Una poda propia de pantalla que rompe el filtro común — **Órdenes**

```js
if(ORDF.fases&&ORDF.fases.size){const keep=new Set(fasesAll);ORDF.fases=new Set([...ORDF.fases].filter(f=>keep.has(f)))}
```

`fasesAll` nunca contiene el centinela `∅`, así que **«Limpiar» se queda en un Set vacío**, y un Set
vacío significa **«todas»**. Resultado: en Órdenes, pulsar «Limpiar» **no filtra nada**. Reproducido:
`ORDF.fases = Set(['∅'])` → tras `render()` queda `Set([])`.

Centro, Carga general, Liberación y Familias **no** tienen esa poda y funcionan bien. Es el único
parche por pantalla que contradice al componente común.

### 6. `refEstado` con el mapa escrito a mano — **7 de 17**

Conoce CEN, CG, WIPL, PMADD, LIB, ORDF, FAM, CTL, APO, VO. **No conoce TAB, CTLF, EG, GER, RUT, COS,
CAPD.** Hoy no rompe nada, porque esas siete no usan filtro de fases. Pero `togFaseFiltro` **depende**
de `refEstado`, y si mañana se le pone un filtro de fases a cualquiera de ellas **no funcionará y
fallará en silencio** (`if(!r.o)return`). Es una bomba de tiempo, no un fallo actual.

### 7. El operario de tablet tiene otro buscador — **Mi centro**

`#tab-wh` no usa `buscarQ`: busca **solo con Enter o el botón Buscar**. Además, el calce por número
exige **3 dígitos o más** (`qn.length>=3`). Un operario que escribe y espera resultados no ve nada
pasar. El placeholder no dice que hay que pulsar Enter.

### 8. `normTxt(0)` devuelve cadena vacía — **todas**

`String(x||'')` convierte el número `0` en `''`. Hoy no se ve porque ninguna OP ni ODC es 0, pero un
campo numérico con valor 0 sería invisible para el buscador.

---

## Una sola corrección arregla varias

**`buscarQ`** es la pieza clave: corregirla arregla las causas **1, 2 y 3** en las **17 pantallas** a la
vez. Las demás son puntuales: una línea en `vOrdenes` (causa 5), el mapa de `refEstado` (6), el campo de
la tablet (7), `normTxt` (8) y un aviso en pantalla para la causa 4.

---

## Lo que propongo para el Paso 1 (cuando lo apruebes)

1. **`buscarQ`**: un temporizador **por buscador** (`_qTimers[id]`), debounce desde
   `prm('msBuscar', 250)` editable en Configuración, y **redibujar solo la lista de resultados**
   —no la pantalla entera— conservando foco y cursor. Para eso hace falta que cada pantalla marque su
   contenedor de resultados (`data-lista="<id>"`); donde no lo tenga, cae al redibujo completo de hoy.
2. **Órdenes**: quitar la poda del centinela `∅` (una línea) y usar el mismo `faseOk*` que las demás.
3. **`refEstado`**: que el mapa se arme solo, o que avise si le piden un estado que no conoce, en vez
   de devolver `undefined` en silencio.
4. **Aviso de base filtrada**: cuando una búsqueda no encuentre nada pero la orden **sí exista** fuera
   de los filtros de la pantalla, decirlo con un enlace («está en otro mes del Proyecto · quitar el
   filtro»). Es lo que de verdad resuelve el «no encuentra».
5. **Tablet del operario**: que busque al escribir con el mismo debounce, o que el placeholder diga
   «escribe la WH y pulsa Buscar». Tú decides cuál.
6. **`normTxt`**: `String(x==null?'':x)` en vez de `String(x||'')`.

**Las 60 pruebas ya están en el harness** y se quedan ahí. Las 11 que fallan son exactamente estos
hallazgos: cuando se corrijan, se ponen verdes solas y no vuelve a pasar.

---

## Dos preguntas antes de corregir

1. **El redibujo parcial** (punto 1) es el cambio de fondo y toca las 17 pantallas. ¿Lo hago para
   todas, o empiezo por las tres donde más duele (Liberación, Órdenes, Centro) y el resto se queda con
   el redibujo completo pero con el temporizador por buscador ya arreglado?
2. **El aviso de base filtrada** (punto 4): ¿lo quieres solo en Liberación, o en todas las pantallas
   cuya base viene acotada (Centro por semana, Carga general por centro, Gerencial por meses)?
