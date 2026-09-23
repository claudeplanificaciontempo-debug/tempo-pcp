# La ruta no es un orden fijo · y buscar una orden desde el centro (22-sep-2026)

**Lo que pediste:** «La ruta sí es por dónde va a pasar, pero tenemos la opción de que se corta y se va a confección, o
se va a bordado, o se va a estampado: no es fijo. Yo ya cerré una orden en corte y me parece que no puedo [entrar a
módulos] porque está la ruta en bordado, pero tengo listo para poder ingresar a módulos.» Y: «generar una búsqueda en
cada programación del centro para ver en qué estado está o cuándo va a ingresar: por WH, por cliente o por el estilo».

---

## 1 · Por qué te frenaba

La cola de cada centro decidía con `secuenciaCentro`: una orden está **disponible** solo si **todos** los pasos que van
antes en su ruta están hechos. Con la ruta `corte → bordado → confección`, al cerrar corte la orden seguía bloqueada en
confección porque bordado no estaba cerrado.

El sistema ya tenía una idea parecida —un «tramo no secuencial»— pero solo funcionaba si **todos** los pasos pendientes
eran de la **misma etapa** que el centro, y medido con los datos reales: bordado, estampado, sublimado y apliques están
en la etapa **«servicios»**, confección está en **«confección»**, y **ningún grupo estaba marcado como no secuencial**.
Es decir: tu caso no lo cubría nadie.

## 2 · Tramos paralelos

Tabla nueva y editable en **Configuración → Centros y recursos → «Tramos paralelos»**: un tramo es un conjunto de
centros que **no se esperan entre sí**. Sembrado una vez, marcado «sugerido» para que lo confirmes:

> **Estampado, bordado y confección** → estampado · sublimado · apliques · bordado · confección (módulos)

Con eso:

- Al **cerrar corte**, la orden queda **disponible en confección aunque bordado no esté hecho** — y también disponible
  en bordado. El motivo se ve escrito en la cola: *«tramo paralelo: Bordado no lo detiene (el orden real lo deciden las
  OT y el piso)»*.
- **Lo anterior al tramo sigue mandando**: con corte pendiente, confección sigue diciendo *«todavía no: falta Corte»*.
  El tramo no rompe la dependencia real, solo la de los compañeros de tramo.
- **«Lista para empezar»** en confección ahora apunta al paso anterior de **fuera** del tramo (corte), que es el que de
  verdad le entrega prendas.
- **Manda la tabla**: si sacas confección del tramo, vuelve a esperar a bordado. Cada cambio queda en la bitácora.
- **El motor de fechas no cambió**: sigue programando los pasos en orden. Esto es para la **cola y la disponibilidad**
  del piso, que es donde te frenaba.

## 3 · Buscar una orden desde el centro

En la cabecera de cada centro (en **cualquier** pestaña: Resumen, Planificación, Programación, Ejecución) el buscador
de siempre ahora abre un panel **«Resultado de la búsqueda»** con hasta 6 órdenes, buscando en **toda la cartera que tu
perfil ve** —no solo en la semana ni en la lista de ese centro— por **WH, cliente, estilo, color, ODC o fase**.

Por cada orden: foto, WH y fase · cliente · estilo · color · prendas · **estado** (el semáforo de siempre) · **dónde
está** · y **qué pasa en este centro**, que es una de estas:

- *ya pasó por aquí · cerrada el <fecha> con N de M*
- *en proceso aquí · N de M*
- *lista para entrar* (y, si aplica, «tramo paralelo: Bordado no lo detiene») **· programada para el <fecha>**
- *todavía no: falta Corte en su ruta · sin fecha en el programa*
- *este centro NO está en su ruta*

Si no encuentra nada, lo dice. Si no buscas nada, el panel no aparece y la pantalla queda igual que siempre.

## 4 · Pruebas

Bloque **TP** (9): la tabla se siembra con el tramo y queda «sugerida» · con corte pendiente confección sigue bloqueada ·
al cerrar corte confección y bordado quedan disponibles y el motivo lo explica · «lista para empezar» apunta a corte ·
al sacar confección del tramo vuelve a esperar a bordado y queda en bitácora · la tabla se ve y se edita en
Configuración · el buscador encuentra por WH, por cliente y por estilo y dice dónde está y qué pasa en este centro · sin
resultados lo dice · sin búsqueda no aparece.

Harness r=110: 2.845 comprobaciones, 0 rojas, 0 errores.

## 5 · Lo que queda por decidir

- **Confirmar el tramo** (hoy está «sugerido»): ¿son esos cinco centros, o hay que sacar o meter alguno?
- **El motor de fechas** sigue secuencial: si quieres que también programe bordado y confección en paralelo (fechas
  solapadas), eso es tocar `programar()` y lo hago solo con tu autorización expresa.
- **Entrega parcial entre pasos** (la WH en dos o tres centros a la vez, con cantidades): sigue pendiente, es lo que
  hablamos el 22-sep y está anotado en `PISO_TIEMPOS_PROPUESTA_V2.md` (D10).
