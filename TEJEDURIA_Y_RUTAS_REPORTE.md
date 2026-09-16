# Ruta por defecto, recálculo por técnica y tejeduría

**Commit:** `156d9f8` · **Harness:** 1.667 pruebas verdes, sin errores.

---

## 1 · Las 22 rutas

Aprobado y puesto en las siembras: corre **una sola vez**, sin preguntar, **en tu próxima apertura**. Cada
orden queda con `corte → confección → empaque` (más estampado o bordado si la orden los pide), marcada
**«estimada – sin revisar»**, y como las 22 son de categorías sin minuto estimado, **su carga queda en 0 con
el aviso de brecha de tiempos**, tal como estaba en la vista previa.

---

## 2 · Recálculo automático

### Técnica y puntadas: **no estaba, y lo agregué**

Lo verifiqué y **la firma no incluía la técnica ni las puntadas**: solo la categoría y su hoja LMO. Es decir,
agregar bordado a una orden **no** rehacía su ruta. Ya lo hace.

| Cambio en la orden | Qué pasa ahora |
| --- | --- |
| Se le **agregan** puntadas | entra **bordado**, entre corte y confección |
| Se le **agrega** técnica | entra **estampado**, entre corte y confección |
| Se le **quitan** las puntadas | **sale** bordado |
| La ruta está **editada a mano** | no se toca, queda **marcada para revisar** |

Para que «quitar» funcione hubo que separar dos modos: al **completar** una ruta no se pierde ningún paso; al
**recalcular**, los centros que dependen de la orden (estampado, bordado) se rehacen desde la técnica y las
puntadas de ahora, así que pueden salir. Todo con auditoría.

### Auditoría solo cuando cambia: **había un hueco, y lo cerré**

El recálculo automático ya evitaba escribir cuando la ruta quedaba igual, **pero las editadas a mano se
marcaban siempre**, aunque su ruta no fuera a cambiar. Eso habría llenado el panel de revisión con órdenes que
no necesitaban revisión.

Ahora, en los dos casos, **primero se compara la ruta resultante**:

- si es idéntica → **se vuelve a sellar en silencio**, sin auditoría ni marca
- si difiere → se rehace (o se marca, si es de mano) **y ahí sí** se escribe

Tres pruebas lo fijan: sin cambios no se escribe nada; una firma vieja cuya ruta queda igual se re-sella sin
auditoría; y una editada a mano que no cambiaría no se marca.

---

## 3 · Tejeduría: programado vs tejido

### La columna Estado

| | **Programado** | **Tejido** |
| --- | --- | --- |
| Fecha | **no antes de hoy** (ni al crear ni al editar) | cualquiera, incluso pasada |
| Kg | los programados | **kg reales**, aparte de los programados |
| Registro | quién y cuándo la creó | **además**, quién la confirmó y cuándo |
| En la tabla | `programado`, o **`sin confirmar`** en rojo si el día ya pasó | `tejido` en verde |

Al crear una fila se elige el estado; si se elige «Ya tejido», el campo de fecha deja de exigir hoy en
adelante.

### Quién

**«Marcar como tejido»** solo lo ven tejeduría y planificación. Pide los **kg reales** (propone los
programados) y guarda quién y cuándo. **Deshacer** existe, pide motivo y queda en bitácora.

### Qué hace el motor

- **Tejido** → la tela está lista ese día, **con los kg reales**. Antes usaba siempre los programados.
- **Programado a futuro** → igual que siempre.
- **Programado con día pasado sin confirmar** → **depende del interruptor**.

### El interruptor, con su vista previa

**La regla está apagada.** Mientras lo esté, el motor se comporta **exactamente como hoy**: lo programado
cuenta como tela lista, se haya confirmado o no. Así tejeduría tiene tiempo de marcar lo ya tejido sin que se
muevan las fechas.

El panel **«Tejido sin confirmar»**, en Tejeduría, muestra antes de encenderla:

- **cuántas filas** hay programadas con día pasado y sin confirmar, y **cuántos kg**
- el desglose **por tela**
- **cuántas órdenes cambiarían su fecha de tela lista**, con el antes, el después y los días de diferencia
- la lista de filas con su botón **«marcar como tejido»**

El botón de encender/apagar es **solo para planificación**, y al encender vuelve a mostrar el resumen para
confirmar. **Se puede apagar cuando quieras.**

La vista previa calcula el efecto real corriendo el motor con la regla puesta y sin ella, y **no deja la regla
encendida** — hay una prueba que lo verifica.

---

## 4 · Lo del envío anterior

Ya estaba hecho en `1fc0bcc` / `25d8c1a`, antes de que llegara tu mensaje:

- **Avance sin registros:** las tarjetas y el avance dicen **«sin registros esta semana»** en vez de 0 %, con
  los pendientes en «—». Cuenta como registro el avance por talla o total, un tramo cerrado, la producción de
  un turno o un paro; un turno **sin** producción no cuenta. Solo se reclama en días laborables del centro. La
  brecha **centro × día** está en Reportería por área.
- **«Vienen después»:** **no repite** la lista — son conjuntos disjuntos por construcción y hay prueba que lo
  fija. Se mantiene y se le arregló el rótulo. Se diferencia del «Lo que viene» eliminado en que aquel mostraba
  órdenes **en un paso anterior** de su ruta, que es justo lo que la lista principal ya dice.

Está en `SIN_REGISTROS_REPORTE.md`.

---

## Archivos tocados

| Archivo | Qué cambió |
| --- | --- |
| `index.html` | `sembrarRutaDefecto22`; `firmaRutaDe` con `ordenCentrosAuto`; `rutaProSugerida(o,rehacer)`; `recalcularRutas` solo audita si cambia; `TEJ_ESTADOS`/`estadoTej`/`kgTejidos`/`puedeTejer`/`tejSinConfirmar`/`tejEstrictoOn`/`tejCuentaComoLista`/`marcarTejido`/`desmarcarTejido`/`previaTejEstricto`/`togTejEstricto`/`tejEstrictoPanelHTML`; el motor usa `tejCuentaComoLista` y los kg reales; columna Estado y validación de fecha en la tabla y el alta |
| `test/driver.js` | 37 pruebas nuevas |
| `TEJEDURIA_Y_RUTAS_REPORTE.md` | este reporte |

---

## Lo que necesito de ti

1. **¿Cuándo enciendo la regla de tejeduría?** Avísame cuando tejeduría haya marcado lo ya tejido, o enciéndela
   tú desde el panel.
2. Siguen pendientes: el **centro de las dos operaciones de BVD y FITS** y los **datos de las lavadoras**.

## Brechas

1. **La regla de tejeduría está apagada**, así que por ahora el motor sigue dando por tejido todo lo
   programado. El panel dice cuántas filas y cuántas órdenes están afectadas.
2. **Las 22 seguirán con carga 0** hasta que producción escriba el minuto estimado de sus categorías.
