# Rutas confirmadas + Liberación según el boceto

**Fecha:** 15/16-sep-2026 (trabajo nocturno, sin supervisión)
**Commits:** `220708c` (Parte A · Rutas confirmadas) y `f059d10` (Parte B · Liberación según el boceto) — publicados.
**Harness:** 1085 pruebas, todas verdes, sin errores de consola.
**Motor:** no se tocó.

> **Lo que quedó SIN ejecutar, como pediste:** el paso A2 (confirmar automáticamente las rutas que coinciden con
> Odoo) **no se aplicó en producción**. La función y el botón están listos; el conteo se ve en pantalla antes de
> tocar nada. Tampoco se cargó ningún archivo nuevo ni se ejecutó SQL.

---

## PARTE A · RUTAS CONFIRMADAS

### A1 · Cada orden tiene un estado de ruta
Nuevo campo `o.rutaConf = {estado, origen, u, ts, nota}`:

| Cosa | Cómo queda |
|---|---|
| Ruta por defecto de Configuración (corte, confección, empaque) | **NO confirma**. Solo precarga el editor. |
| Guardar la ruta en el editor (con o sin cambios) | **Confirmada**, origen **persona**, con quién y cuándo. |
| `rutaEditada` (el historial de ediciones que ya existía) | **No es** una confirmación: esas órdenes siguen «por definir». |
| Coincidencia exacta con las órdenes de trabajo de Odoo | **Confirmada**, origen **Odoo OT** (solo al apretar el botón). |

Toda confirmación y toda des-confirmación quedan en **auditoría** (`registrarAuditoria('ruta', …)`) y en la bitácora.
La confirmación **se conserva en las recargas**: `rutaConf` entró en la tabla 14 (Campos conservados) como
«Ruta confirmada (quién, cuándo y de dónde salió)».

### A2 · Confirmación automática solo cuando coincide con Odoo — **pendiente de que la apruebes**
Regla exacta (`diagRutaOdoo`): los centros de Odoo de la WH son los de sus OT en cualquier estado, **sin canceladas
y sin bodegas**. Se confirma sola **solo** si (a) todos esos centros tienen centro TEMPO en la tabla 6, (b) el
conjunto de centros de Odoo es **idéntico** al conjunto de pasos de la ruta actual (ni uno más ni uno menos) y
(c) la WH no está en las contradicciones fase vs OT. **Nunca pisa una ruta confirmada por una persona.**

Lo que no coincide **no se toca**: se queda «por definir» y la pantalla dice en qué difiere, en texto claro
(«Odoo tiene Bordado, la ruta no», «la ruta tiene Empaque, Odoo no», «centro PULIDO sin centro TEMPO en la tabla 6»,
«sin órdenes de trabajo cargadas»).

**Dónde ves el conteo antes de aplicar:** Dirección → Órdenes de producción → pestaña **Rutas**. Arriba sale una
línea fija:

> **Qué dice Odoo hoy:** N coinciden exacto · N difieren de la ruta · N con un centro sin mapear ·
> N con contradicción fase vs OT · N sin órdenes de trabajo cargadas.

y el botón **«Confirmar las que coinciden con Odoo (N)»**. Ese botón es el paso A2: **hasta que lo aprietes no se
confirma nada**. Yo no lo apreté.

Los números reales salen de tus datos en el navegador (no los puedo calcular desde aquí sin entrar a tu cuenta de
producción, y no lo hago). Para que veas que la cuenta funciona, así queda con la base de pruebas del simulador:

| | base de pruebas |
|---|---|
| Órdenes abiertas revisadas | 5 |
| Coinciden exacto con Odoo (se confirmarían solas) | 0 |
| Difieren de la ruta | 0 |
| Con un centro de Odoo sin mapear en la tabla 6 | 0 |
| Con contradicción fase vs OT | 0 |
| Sin órdenes de trabajo cargadas | 5 |
| Ya confirmadas | 0 |
| Con **solo** historial de ediciones (`rutaEditada`, que ya no cuenta como confirmada) | 0 |
| Referencias distintas por definir | 4 |

En la base de pruebas ninguna WH tiene OT cargadas, por eso las 5 caen en «sin órdenes de trabajo». En producción
(OT del 13-sep) el reparto es otro y lo verás en esa misma línea al abrir la pestaña.

### A3 · Pestaña «Rutas» en Órdenes de producción
- Tarjeta: «Faltan N rutas por confirmar · N referencias · N unidades» (desplegable, agrupada por familia).
- Lista **Por definir agrupada por REFERENCIA**: foto, referencia, familia, cliente, cuántas WH y prendas, la ruta
  actual en pasos y lo que dice Odoo como referencia. Buscador y agrupador comunes.
- Tres acciones por referencia: **Editar y confirmar**, **Confirmar como está** (se aplica a todas sus WH abiertas
  y no liberadas) y **Solo esta WH** para las excepciones.
- Al confirmar, la referencia sale de la lista y el contador baja sin recargar.
- Lista **Con ruta confirmada**: origen (persona u Odoo OT), quién y cuándo; se puede volver a editar, queda en
  auditoría y avisa si la orden ya está liberada porque le cambia el programa.

### A4 · Recargas del Proyecto
Una WH nueva de una referencia con ruta confirmada entra **«por definir» con la ruta precargada**
(`precargarRutasNuevas`): confirmarla es un clic. Las confirmaciones ya hechas se conservan (tabla 14).

### A5 · Ninguna orden se libera sin ruta confirmada
- `puedeLiberarA` devuelve false sin ruta confirmada, en **las dos liberaciones** (textil y a producción).
- «Qué la frena» muestra **falta confirmar ruta →** y ese enlace abre Órdenes → Rutas con su referencia buscada.
- Las que ya estaban liberadas **no se desliberan**: aparecen en Hoy → Pendientes como «Órdenes liberadas sin ruta
  confirmada», con enlace a Rutas. Se agregó también la bandeja «Rutas por confirmar».

---

## PARTE B · LIBERACIÓN SEGÚN EL BOCETO

**Base de toda la pantalla:** las órdenes del **Proyecto del mes elegido**, con el selector **«Mes del Proyecto»**
arriba. Arranca en el mes en curso; si eliges «Todos los meses» se respeta y no vuelve solo.

### Bloque 1 · Pendiente de liberar
- **Fila superior a todo el ancho**: la tarjeta «N órdenes pendientes de liberar a la planta · N unidades»
  (desplegable, agrupada por familia) y, al lado, **ODC · Familia · Cliente**, el agrupador y el buscador comunes.
- Debajo, los botones de siempre: **Liberar todo lo filtrado (N)**, **Marcar todas**, **Ninguna**,
  **Liberar las marcadas (N)**. En Liberación a producción no hay botón masivo: sigue siendo una por una con las
  dos verificaciones (materia prima e insumos en bodega).
- **Tarjetas por familia** con sus unidades pendientes, **de mayor a menor**, que responden a los filtros
  (CAM BÁSICA 4.000 · POLO PIQUÉ 3.000 · HOODIE 700…).
- **Clic en una familia → su detalle debajo**: Foto · WH · Fase · Cliente · Color · Prendas · Entrega ·
  Tela «qué le falta» (tintura / lavado, la propuesta del catálogo) · **Qué la frena**, con casilla para marcar y
  liberar. También hay **«Ver todas las pendientes (N)»** para trabajar la lista completa, y al buscar o agrupar se
  abre sola.

### Bloque 2 · Resumen de lo liberado (grilla 2 × 2; en teléfono, en columna)
Los cuatro cuadrantes usan **la misma base del mes** y el mismo cálculo — **liberado + pendiente = total** —
y **no cambian con los filtros del bloque 1** (lo dice la propia nota del bloque):

| Cuadrante | Qué mide |
|---|---|
| Carga por familia | prendas liberadas de las totales de esa familia · **% = liberado ÷ total** (1.000 de 5.000 · 20 %) |
| Por tipo de producto | lo mismo por subcategoría (Camiseta CV · 1.000 de 5.000 · 20 %) |
| Por tipo de tela | **kilos crudos** liberados de los kilos totales (Jersey 24/1 · 360 kg de 720 kg · 50 %) |
| Por color | de lo ya liberado: código y nombre, kilos y órdenes |

Cada fila lleva barra. **Con órdenes marcadas en el bloque 1**, la barra pinta en el color de acento cuánto subiría
el % y la fila lo escribe («20 % → 100 %»). Al liberar se actualiza solo.

### Bloque 3 · Órdenes liberadas
Debajo del resumen, igual que antes: buscador común, agrupador, **revertir** con motivo de la tabla 15
(queda en auditoría con quién, cuándo, antes y después) y **devolver la fase** según la secuencia de la tabla 1.

### B3 · Qué va a dónde (nada se perdió)

| Estaba en… | Ahora está en… |
|---|---|
| Bloque 1 · «Por liberar»: botones de liberar, marcar todas, ninguna | Bloque 1, en la barra de acciones |
| «Elegir órdenes 1×1» (lista oculta con un botón) | Ya no hace falta: el detalle se abre al tocar una familia, y queda **«Ver todas las pendientes»** para la lista completa |
| Desplegable «Prendas por familia» | **Tarjetas por familia** del bloque 1 (y el cuadrante «Carga por familia» del bloque 2) |
| Desplegable «Tela en crudo por tela y color» | Cuadrantes **«Por tipo de tela»** y **«Por color»** del bloque 2 |
| Desplegable «Aún no pueden liberarse» | Ya no es una lista aparte: cada orden dice en su fila **«Qué la frena»** |
| Chips «Tela · qué le falta» (tintura / lavado por tela) | Columna del detalle del bloque 1 (igual que antes) |
| Botón «ruta» y casilla «revisada» de cada orden | Columna del detalle del bloque 1 |
| Etiqueta «EN EL PLAN — pendiente de liberar» | Detalle del bloque 1, junto a la WH |
| Bloque 2 viejo · «Liberadas a la planta» (familia + tela/color) | Cuadrantes del bloque 2 nuevo |
| Bloque 3 viejo · tarjetas (órdenes, referencias, kg, horas) | Debajo de los cuatro cuadrantes, en el mismo bloque 2 |
| Bloque 3 viejo · carga de tejeduría, baños de tintorería y carga por centro | Desplegable **«Qué cargó lo liberado»**, dentro del bloque 2 |
| Bloque 4 viejo · «Órdenes liberadas» | **Bloque 3**, sin cambios de fondo |
| Barra de arriba «% liberado / % pendiente» | Sigue arriba, pero ahora mide **la misma base del mes** y lo dice |
| Filtros Familia y Cliente del panel de arriba | Se movieron a la fila superior del bloque 1 (son los mismos, no hay dos filtros para lo mismo) |
| Panel de arriba | Queda con Mes del Proyecto, Categoría, Tipo de tela, Fases y Mes de entrega |

Todo esto vale igual para **Liberación** (textil) y para **Liberación a producción**, que comparten pantalla.

---

## Pruebas (harness verde: 1085)

Parte A: la ruta por defecto no confirma · el historial de ediciones tampoco · coincide exacto con Odoo → se puede
confirmar sola · un centro de más o de menos → por definir y dice en qué difiere · centro sin mapear → por definir ·
sin OT → por definir · el análisis cuenta por motivo **antes** de aplicar · al aplicar solo se confirma la que
coincide · nunca pisa una confirmación de persona · confirmar por referencia aplica a sus WH abiertas y no liberadas ·
«solo esta WH» no toca a las demás · la WH nueva de una referencia confirmada entra precargada · la confirmación se
conserva en las recargas · sin ruta confirmada no se libera (las dos liberaciones) · las ya liberadas no se
desliberan y salen en Hoy.

Parte B: la base son las órdenes del Proyecto del mes · el mes deja fuera lo que no es de ese Proyecto ·
**liberado + pendiente = total** (en órdenes, en prendas y en kilos) · la suma de las familias es el total de la base ·
por tipo de producto da el mismo total que por familia · **% de familia = liberado ÷ total** · con órdenes marcadas la
fila dice a cuánto subiría y la barra lo pinta en otro color · las tarjetas por familia van de mayor a menor · al tocar
una familia se abre su detalle con WH, fase, cliente, color, prendas, entrega y qué la frena · el detalle solo trae las
órdenes de esa familia · «falta confirmar ruta» enlaza a Rutas · «Todos los meses» se respeta · al liberar sube el
liberado y baja el pendiente sin mover el total · la orden liberada sale del bloque 1 y entra en las liberadas ·
los tres bloques, los cuatro cuadrantes y el desplegable «Qué cargó lo liberado».

---

## Para mañana

1. **Revisar el conteo de A2** en Órdenes de producción → Rutas («Qué dice Odoo hoy») y, si estás de acuerdo,
   apretar **«Confirmar las que coinciden con Odoo (N)»**. Es el único paso que dejé sin ejecutar.
2. **Subir las OT actualizadas**: cárgalas primero y vuelve a mirar el conteo; la regla es la misma y las
   confirmaciones de personas no se pisan.
3. Las referencias que queden «por definir» se resuelven desde esa misma pantalla, por referencia (una edición baja
   a todas sus WH abiertas y no liberadas).
4. Mientras haya rutas sin confirmar, esas órdenes **no se pueden liberar**: es el freno que pediste, y se ve en
   «Qué la frena» y en Hoy → Pendientes.
