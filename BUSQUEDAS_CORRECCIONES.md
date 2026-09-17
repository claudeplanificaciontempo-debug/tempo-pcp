# Búsquedas y filtros — correcciones (commits 1 a 4)

**16-sep-2026 · commit `588d47e`.** Harness: **2.061 checks, 0 fallos, 0 errores**.
**Las 11 pruebas en rojo del Paso 0 están en verde.** Ninguna se borró ni se ablandó.

---

## Antes de nada: dos cosas que no salieron como pediste

**1 · Los cuatro commits quedaron en uno.** Los hice como cuatro bloques de trabajo, pero al terminar el
árbol tenía los cuatro mezclados y separarlos después habría exigido rehacer parches sobre un estado
verde, con riesgo de romperlo. El mensaje del commit está dividido en las cuatro partes. Si lo quieres
partido de verdad, dímelo y lo rehago con calma.

**2 · El commit 4 quedó incompleto: falta la cola del centro y Liberación.** Lo intenté y **lo deshice**.
El motivo, con nombre y apellido: para redibujar solo la lista hay que separarla del buscador, y en esas
dos pantallas la lista está escrita dentro de una plantilla larga. Al extraerla a mano **perdí columnas
de Liberación** (las casillas de tintura y lavado tela por tela) y una prueba existente lo cazó. Revertí
en el acto. Está hecho en **Órdenes**, que es donde se demuestra que el mecanismo funciona, y **en la
tablet del operario**. Las otras dos las hago con el cuidado que merecen en cuanto apruebes.

---

## Commit 1 · Causas comunes (las 17 pantallas)

### Un temporizador por buscador

```js
const _qTimers={};                      // antes: let _qTimer = uno solo para todo el sistema
function buscarQ(el,fn){const id=el.dataset.q||'_';clearTimeout(_qTimers[id]);…}
```

**El fallo que reproducimos:** escribir «229» en el buscador del bloque 1 de Liberación y pasar al del
bloque 4 antes de los 150 ms dejaba `LIB.q` **vacío** — lo escrito no llegaba nunca al estado.
**Ahora los dos textos se conservan**, y la prueba lo fuerza con más de 300 órdenes, que es la condición
en la que aparece (con menos no hay temporizador y el fallo no se manifiesta).

### La espera, un parámetro

`prm('msBuscar', 150)`, editable en **Configuración → Calendario y parámetros**, con `setMsBuscar`
(permiso, validación y bitácora). **0 es 0**: filtra en cada tecla. Y **ya no depende de tener más de
300 órdenes**: la espera es la misma siempre.

### Un solo mapa de estados

`estadosPantalla()` es ahora el **único** mapa; `refEstado` y `navRefs` lo usan. Alcanza **los 17
buscadores** (antes llegaba a 10: faltaban TAB, CTLF, EG, GER, RUT, COS y CAPD). Hay una prueba que
deriva la lista de buscadores del código y comprueba que ninguno queda fuera.

### `normTxt` y el cero

`String(x||'')` → `String(x==null?'':x)`. Un valor **0** ya no se convierte en cadena vacía.

---

## Commit 2 · Filtro de fases: una sola semántica

Tres estados **explícitos**, que ya no dependen de que un Set esté vacío:

```js
estadoFases(sel,fasesAll) → 'todas' | 'ninguna' | 'seleccion'
faseOkFiltro(sel,fase)    → decide si una orden pasa
podarFases(sel,fasesAll)  → quita fases que ya no existen SIN borrar el centinela
```

**Las cinco pantallas** —Órdenes, Centro, Carga general, Liberación y Familias— pasan por `faseOkFiltro`.
Ninguna vuelve a interpretar el Set por su cuenta.

**Se eliminó la poda de Órdenes** (la línea 7176 del Paso 0). Era lo que borraba el centinela y dejaba
«Limpiar» convertido en «todas». `podarFases` hace lo que aquella línea quería —quitar fases que ya no
existen— sin tocar el centinela, y si al podar no queda ninguna, el resultado es **«ninguna»**, no
«todas».

**El botón dice lo que hace:** «Seleccionar todas» (quita el filtro) y **«Limpiar (ninguna)»** (deja la
lista vacía), cada uno con su tooltip.

**La prueba, en las cinco pantallas:** «Limpiar (ninguna)» deja la lista **en 0 filas**; «Seleccionar
todas» la devuelve completa; y el estado sigue siendo «ninguna» después del redibujo.

---

## Commit 3 · Base acotada: «no aparece» no es «no existe»

```js
fueraDeBase(id, dentro)                       // ¿hay coincidencias fuera de lo que la pantalla filtró?
avisoFueraDeBaseHTML(id, dentro, filtroTxt)   // el aviso y el botón «Ver»
```

Compara lo que la pantalla ya filtró contra **todo lo que el perfil puede ver** (`ordenesQueVe`), con el
mismo `matchBusq`. Si hay coincidencias fuera:

> **N órdenes coinciden fuera de el mes del Proyecto y los filtros de esta pantalla** · la búsqueda
> «22918» sí las encuentra, pero esta pantalla no las muestra por sus filtros **[Ver]**

Al pulsar **Ver**, se listan con `whCell`, **marcadas «fuera del filtro»**, con enlace a la orden, y un
pie que dice que **no se cambió ningún filtro**. La prueba verifica justo eso: que aparecen y que ni
`LIB.ym` ni `LIB.q` se tocaron.

**Aplicado en Liberación.** Las pantallas cuya base también filtra antes del buscador, para el siguiente
paso:

| Pantalla | Qué acota la base antes de buscar |
|---|---|
| **Liberación** | mes del Proyecto (`LIB.ym`) + etapa ya hecha — **hecho** |
| Centro | el centro en la ruta + la semana (`CEN.todo`) |
| Carga general | el centro seleccionado |
| Resumen gerencial | meses, cliente y estado |
| Plan mensual → agregar | el mes y los grupos sin `enProceso` |
| Entregas | meses, familia, tipo de producto, tela |
| Órdenes | el estado (plan / cerrada / anulada…) |
| Producto en proceso | la etapa |

---

## Commit 4 · Redibujo parcial (primera etapa)

### El mecanismo

La pantalla envuelve su lista en `<div data-lista="<id del buscador>">` y registra cómo repintarla:

```js
listaRegistrar('ORDF.q', listaOrdHTML);
redibujarLista(id)   // repinta SOLO la lista; si la pantalla no la registró, devuelve false
```

`buscarQ` intenta el redibujo parcial y **solo si no puede** cae al `render()` completo de siempre. Tras
el redibujo parcial **el input ni se toca**; y si algo le robó el foco, se le devuelve con el cursor
donde estaba.

### Medido en Órdenes, con 1.210 órdenes

| | Antes | Ahora |
|---|---:|---:|
| **Órdenes — por tecla** | **63–74 ms** | **4–10 ms** |
| Liberación — por tecla (sigue con redibujo completo) | 178–188 ms | 178–188 ms |

Y lo que importa más que los milisegundos:

| Prueba (5 teclas, «22918») | Resultado |
|---|---|
| Veces que el input se destruye y se vuelve a crear | **0** |
| Texto completo | **22918** |
| Posición del cursor | **5** |
| El texto llega al estado | **sí** |

### Pantallas corregidas en esta etapa

| Pantalla | Redibujo parcial | Nota |
|---|---|---|
| **Órdenes** | **sí** | mecanismo probado de punta a punta |
| **Mi centro · operario (tablet)** | — | **ahora busca mientras escribe**, con el mismo debounce, y conserva el botón **Buscar** |
| Liberación | **no** | revertido: ver arriba |
| Cola del centro | **no** | pendiente |
| Las otras 13 | no | commit 5, tras tu aprobación |

---

## Qué probar en la tablet real

El foco no lo pude reproducir sintéticamente ni antes ni ahora; en la tablet hay un factor que el
navegador de pruebas no tiene: **al quitar del DOM un input con foco, Android e iOS suelen cerrar el
teclado en pantalla** aunque el foco se restaure. Por eso lo de Órdenes importa: ahí el input ya no se
quita. Lo que conviene comprobar con una tablet de piso, con sesión de **operario**:

1. **Mi centro → Buscar WH.** Escribir `28300` **sin pulsar Enter**: los resultados deben ir saliendo
   solos. El botón **Buscar** sigue ahí y debe seguir funcionando.
2. **Que el teclado no se cierre** al escribir, y que el cursor no salte al principio.
3. Escribir **rápido** (5–6 dígitos seguidos): no debe perderse ningún dígito.
4. Probar con **la WH completa** (`WH/MO/28300`) y con **solo el número**.
5. **Órdenes** (con un perfil que la vea): escribir y comprobar que el cuadro no parpadea y que la lista
   se actualiza sola.
6. **Liberación**: ahí el redibujo **sigue siendo completo**, así que si el teclado se cierra en
   Liberación pero no en Órdenes, eso confirma el diagnóstico y justifica terminar el commit 4.
7. **Configuración → Calendario y parámetros → «Buscadores: espera al escribir»**: si en la tablet se
   siente lento, subirlo a 250–300 ms; si se siente perezoso, bajarlo. **0 filtra en cada tecla.**

---

## Las 11 rojas, una por una

| Prueba del Paso 0 | Ahora | Qué la arregló |
|---|---|---|
| `normTxt`: un 0 no se convierte en vacío | ✅ | `String(x==null?'':x)` |
| refEstado alcanza RUT.q | ✅ | `estadosPantalla()` |
| refEstado alcanza CTLF.q | ✅ | ídem |
| refEstado alcanza GER.q | ✅ | ídem |
| refEstado alcanza EG.q | ✅ | ídem |
| refEstado alcanza COS.q | ✅ | ídem |
| refEstado alcanza TAB.q | ✅ | ídem |
| refEstado conoce toda pantalla con buscador | ✅ | ídem |
| El buscador de Capacidad y decisiones está en pantalla | ✅ | es condicional por diseño (vive en el detalle de una celda): la prueba abre el detalle |
| Órdenes: «ninguna fase» no se convierte en «todas» | ✅ | `estadoFases` + `podarFases` |
| Liberación: dos buscadores no se pisan | ✅ | un temporizador por buscador |

---

## Para seguir

1. **¿Apruebas el commit 4 tal como quedó** (Órdenes + tablet), con Liberación y la cola del centro
   pendientes? Si sí, las hago con la extracción cuidadosa y después voy al commit 5 con las 13
   restantes.
2. **¿Rehago los cuatro commits por separado?**
3. El **aviso de base acotada** está solo en Liberación. La tabla de arriba lista las otras siete
   pantallas: dime si lo quieres en todas o solo en algunas.
