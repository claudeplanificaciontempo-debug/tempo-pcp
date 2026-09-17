# Carga de datos — puntos 1 a 3

**17-sep-2026.** Un commit por punto, harness verde antes del siguiente.
**No se tocó nivelación, cola por cercanía, búsquedas ni tablet.**

| Commit | Punto | Harness |
|---|---|---|
| `d755db9` | 1 · el avance de piso nunca se borra desde una carga | verde |
| `73ed971` | 2 · `planOdoo(rows)` llamable + medición | verde salvo el hallazgo |
| `36ef2b9` | 3 · la tabla 14 en los dos caminos | **2.201 checks, 0 errores** |

Queda **una prueba en rojo a propósito**, que es el hallazgo del punto 2 y que resuelve el punto 6.

---

## 1 · Protección inmediata

**Eliminado el vaciado masivo.** `aplicarTarea` ya no tiene la rama que hacía `S.avance = {}`. Antes,
desmarcar la fila «avance» de la tabla 14 borraba **el avance de piso de toda la planta** —unidades,
tramos, paros, tallas y cierres— sin confirmación y sin aviso. Ese camino ya no existe, y hay una
**guardia de código** que falla si alguien lo reintroduce.

**La fila «avance» está bloqueada.** `CAMPOS_BLOQUEADOS = ['avance']`: `conserva('avance')` devuelve
siempre `true`, `setCampoConservado` avisa y no cambia nada, y el panel la muestra marcada,
deshabilitada y con la etiqueta **«siempre»**. La nota del panel dice por qué: *«unidades, tramos,
paros, tallas y cierres los registran las personas y ningún archivo los devuelve»*.

### ¿Hay otras filas cuyo desmarcado haga borrado masivo?

**No. `avance` era la única.** Las otras 18 filas funcionan distinto: si se desmarcan, la recarga
simplemente **no copia ese campo** de la orden vieja a la nueva, orden por orden. Eso es el sentido de
la tabla —decidir qué manda, el sistema o el archivo— y es reversible volviendo a marcar la fila antes
de la siguiente carga. `avance` era la excepción porque vaciaba **la tabla entera de una vez**,
incluidas las órdenes que el archivo sí traía.

Dicho eso, **tres filas merecen la misma atención** aunque hoy no borren en masa, porque también
guardan trabajo que ningún archivo devuelve: `lib` (firmas de liberación), `fases` (el historial de
movimientos con su motivo) y `progCentro` (el orden que armó el centro). **Dime si las bloqueo también**
o si prefieres que sigan siendo decisión de la tabla.

**Prueba:** la fila está bloqueada; intentar desmarcarla avisa y no cambia nada; y **aunque se fuerce a
`false` por código**, tras recargar el avance sigue intacto —unidades, tramo y cierre—.

---

## 2 · `planOdoo(rows)` llamable

El plan que se armaba **dentro de `leerOdoo(ev)`** —el manejador del `<input file>`— se movió tal cual a
**`planOdoo(rows, nombre)`**. `leerOdoo` solo lee el archivo y pinta. Lo único distinto: el nombre del
archivo entra por parámetro en vez de leerse del objeto `File`. **La prueba en rojo del Paso 0 pasó a
verde.**

### Qué pisa «Actualizar desde Odoo» — y por qué la respuesta no es la que parece

Con el volcado real, en caja cerrada, sobre los doce datos trabajados: **no pisó ninguno**.

**Pero ese número no se puede leer solo**, y por eso dejé una prueba nueva en rojo:

| | |
|---|---:|
| Cartera antes | **1.211** |
| Cartera después | **4.719** |
| Cabeceras que ve en el archivo | 4.218 |
| Órdenes existentes que **reconoce** | **710** |
| Órdenes **nuevas** que crea | **3.508** |

**Pasar «Actualizar desde Odoo» sobre el mismo archivo que ya cargó la Parte 2 casi cuadruplica la
cartera.** Los dos caminos no coinciden ni en qué órdenes ya existen ni en la regla de alcance: la
Parte 2 carga 1.206 aplicando sus reglas (excluye `cancel`, entregas pasadas no abiertas y sin fecha),
y Odoo ve 4.218 porque **no tiene regla de alcance**.

Así que «no pisa nada» significa sobre todo que **a la mayoría de las órdenes ni siquiera las
reconoce**. Es el argumento más fuerte para el punto 6.

> Esto no pasa hoy en producción porque nadie corre las dos cargas seguidas sobre el mismo archivo.
> Pero **puede pasar**, y nada lo impide.

---

## 3 · La tabla 14 en los dos caminos

`aplicarOdoo` consulta ahora `conserva()`, igual que la Parte 2:

| Qué | Antes | Ahora |
|---|---|---|
| **Fase** | `registrarFase(o, d.fase, 'archivo')` sin preguntar | si `conserva('fase')`, **no se pisa** y va a la bandeja |
| **Fecha de entrega** | se pisaba | si se cambió aquí (`fechaManual`), **no se pisa** |
| **Telas** | se pisaban salvo `telasManual` | si hay decisión de tintura/lavado confirmada, **no se pisan** |
| **Ruta** | **agregaba pasos** (estampado, bordado, lavado, botones, plancha) aunque estuviera editada a mano | si la ruta está **editada o confirmada**, no se toca: el paso que el archivo pediría se **reporta** |

Todo lo que no calza va a la **misma bandeja «decisiones que ya no calzan»** que usa la Parte 2, con su
**tipo** (`fase`, `fecha`, `tela`, `ruta`), queda en bitácora y el conteo entra en el registro de la
carga.

**Y la tabla sigue siendo la que decide:** hay una prueba que desmarca la fila `fase` y comprueba que
entonces el archivo **sí** actualiza la fase. No se cambió quién manda; se cambió que **los dos caminos
preguntan**.

---

## Antes de seguir con 5 y 6

Dos cosas que conviene que decidas ahora, porque cambian el trabajo:

1. **¿Bloqueo también `lib`, `fases` y `progCentro`?** (punto 1). Son trabajo de personas que ningún
   archivo devuelve, aunque su desmarcado no borre en masa.
2. **La regla de alcance única** (punto 5) va a mover la cartera: la de Parte 2 excluye lo que Odoo hoy
   carga. Antes de aplicarla te reporto, como pediste, **cuántas órdenes y unidades cambian de estado en
   cada camino, con ejemplos** — pero ya sabemos el orden de magnitud: **Odoo ve 4.218 cabeceras y la
   Parte 2 carga 1.206**. La diferencia no es un detalle.

El punto 4 (`fechaDe` con seriales numéricos) es pequeño y va junto con el 5. El punto 6 es el que
elimina de raíz el problema de las 3.508 órdenes duplicadas.
