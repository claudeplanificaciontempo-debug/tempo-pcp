# Liberación y Liberación a producción por bloques — reporte

Fecha: 15-sep-2026. Motor sin tocar. Pruebas del simulador: **866 (20 nuevas), todas verdes, 0 errores**.
Todo está hecho con los componentes comunes ya publicados; no se creó ninguna versión nueva de filtro, agrupador,
tarjeta, buscador ni motivo.

## 1 · Qué ya existía y qué faltaba (lo que pediste reportar primero)

| Pedido | Antes | Ahora |
| --- | --- | --- |
| Encabezado y explicación | ya estaban | se quedaron igual |
| Buscador más pequeño | buscador común, ancho completo | mismo componente, angosto (190 px) y con letra menor |
| Bloque 1 con familias y telas desplegables | las dos tablas siempre abiertas, ocupaban toda la pantalla | desplegables cerrados, con los totales en el título |
| «Elegir órdenes 1×1» arriba | estaba abajo, había que bajar | botón arriba del bloque, junto a los de liberar |
| «Seleccionar todo» por grupo | no existía | cada grupo del agrupador tiene su enlace |
| No perder selección ni posición | la selección se mantenía, la posición no | se recuerda también la posición de la lista |
| Ruta por defecto configurable | no existía | marca nueva por centro, sembrada en corte, confección y empaque |
| Bloque 2 «Liberadas a planta» | panel «Liberadas» | bloque 2 con nombre |
| Bloque 3 «Resumen de lo liberado» | solo tejeduría y baños, dentro del panel anterior | bloque propio con tarjetas: órdenes, referencias, kg y horas, más tejeduría y tintorería |
| Bloque 4 «Órdenes liberadas» con buscador y reversión | solo un desplegable «ver las órdenes liberadas» | bloque propio con buscador común, agrupador, revertir con motivo y cambio de fase |
| Liberación a producción con la misma estructura | compartía pantalla pero sin bloques | los mismos cuatro bloques, con sus nombres |

## 2 · Cómo quedó Liberación
- **Bloque 1 · Por liberar a la planta**: arriba, los botones de liberar todo lo filtrado, «Elegir órdenes 1×1»,
  marcar todas y liberar las marcadas. Debajo, la lista agrupada, donde cada grupo trae **seleccionar todo**. Al final,
  dos desplegables cerrados: **prendas por familia** (con familias, órdenes y prendas a la vista) y **tela en crudo por
  tela y color** (con kilos y cuántas combinaciones), más las que aún no pueden liberarse.
- **Bloque 2 · Liberadas a la planta**: por familia y por tela y color.
- **Bloque 3 · Resumen de lo liberado**: tarjetas con órdenes liberadas y prendas, referencias distintas, kilos de tela
  cruda que pidieron y horas de planta que cargaron, más lo que cargó tejeduría y los baños que armó tintorería.
- **Bloque 4 · Órdenes liberadas**: buscador común por WH, ODC, cliente y referencia, agrupador propio, y por cada orden
  los botones **revertir** (pide motivo de la tabla 15 y queda en auditoría con quién, cuándo, antes y después) y
  **fase** (devolver o cambiar la fase; pide motivo solo si la secuencia de la tabla 1 baja).

**Liberación a producción** tiene exactamente los mismos cuatro bloques, con los nombres cambiados a «a producción», y
conserva las dos verificaciones humanas de materia prima e insumos.

## 3 · Ruta por defecto
En Configuración → Centros hay una columna nueva: **«va por defecto en toda ruta»**, editable por centro. Viene sembrada
en **corte, confección y empaque**, una sola vez: si la cambias, el sistema no la vuelve a pisar, y el cambio queda en
bitácora. Al abrir la ruta de una orden que todavía no fue editada a mano, esos pasos aparecen **marcados** y con la
etiqueta «por defecto».

### Órdenes cargadas que contradicen la ruta por defecto
Liberación muestra un aviso desplegable con las órdenes que no siguen esa ruta, diciendo qué paso les falta y cuál es la
ruta cargada. Se reporta, no se cambia nada solo. En la base de prueba del simulador son 5 órdenes, a las que les falta
corte, confección y empaque, y ninguna pasa por maquila. El número real lo vas a ver en la pantalla con tus datos.

## 4 · Qué se probó
- Los cuatro bloques existen en Liberación y en Liberación a producción, con encabezado y explicación intactos.
- Familias y telas por color son desplegables cerrados con los totales visibles sin abrir.
- «Elegir órdenes 1×1» está arriba del bloque, antes de los desplegables.
- Cada grupo tiene «seleccionar todo» y marca las órdenes de ese grupo.
- Abrir y cerrar una orden no pierde la selección ni la posición de la lista.
- La marca de ruta por defecto existe, viene sembrada en los tres centros, es editable, queda en bitácora y no se vuelve
  a sembrar sola.
- Al abrir una orden sin ruta editada, los pasos por defecto vienen marcados.
- Se reportan las órdenes que contradicen la ruta por defecto.
- El resumen de lo liberado trae órdenes, referencias, kilos y horas.
- Revertir sin motivo no revierte; con motivo de la tabla 15 revierte y queda auditado con quién, cuándo, antes y después.
