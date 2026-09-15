# Tejeduría en el motor: stock, programación manual y estimación — reporte

Fecha: 15-sep-2026. Autorizado tocar **solo la sección de tejeduría** de `programar()`; el resto del motor (tintorería,
producción, hacia atrás) quedó intacto. Pruebas del simulador: **846 (12 nuevas), todas verdes, 0 errores**.

## Cómo reparte ahora los kilos de cada tela
Antes de repartir nada, el motor ordena las órdenes de esa tela por **fecha requerida**, la más cercana primero. Luego:

1. **Stock de tela cruda**: descuenta lo que hay en Stock de tela cruda. Esos kilos no se tejen: la orden queda con la
   tela lista desde el inicio. La fecha requerida más cercana toma el stock primero.
2. **Programación manual**: lo que el stock no cubre lo toma lo que la persona de tejeduría cargó a mano, en orden de
   fecha, con su máquina y su día. La tela queda lista al día siguiente de esa corrida.
3. **Corrida automática**: lo que tampoco alcanza va a la corrida de siempre, marcada como **«fecha estimada por el
   sistema · sin programar a mano»** tanto en el programa como en la orden.

Nada de esto cambia cómo se calcula la corrida automática: es la misma lógica de máquina, ritmo, bloque mínimo y costo
de cambio de tela que ya existía. Lo único nuevo es cuántos kilos le llegan y de dónde salen los otros.

## Pedido vs cargado, ahora con tres columnas
La tabla de Tejeduría muestra por tela: **pedido**, **stock**, **programado a mano** y **estimado por sistema**, más lo
que falta cargar, la fecha requerida y la sugerida. El total de abajo suma las tres columnas. Lo estimado sale con
etiqueta ámbar, para que se vea de un vistazo cuánto está corriendo por cuenta del sistema y no por decisión de
tejeduría.

## Reporte antes y después
En Tejeduría, arriba de la programación manual, hay un panel **«Antes y después de usar el stock y lo programado a
mano»**. Compara la fecha de tela lista de cada orden contra la corrida automática de siempre y muestra:
- kilos cubiertos con stock, con programación manual y los que quedan estimados;
- **cuántas órdenes cambian de fecha de tela lista**, cuántas se adelantan y cuántas se atrasan;
- la tabla orden por orden con la fecha de antes, la de ahora y los días de diferencia, en verde si se adelanta y en
  ámbar si se atrasa.

Es en vivo, con los datos reales: cuando cargues el stock y la programación de la semana, ahí mismo ves el efecto.
En la base de prueba del simulador, sin stock ni programación manual cargados, el panel reporta 481 kg estimados por el
sistema y ninguna orden que cambie de fecha, que es justo lo esperado: sin stock ni programación a mano el resultado es
idéntico al de antes.

## Qué se probó
- (a) Sin stock ni programación manual, todo va a la corrida automática y queda marcado como estimado.
- (b) El stock se descuenta antes de repartir y lo toma la orden con la fecha requerida más cercana.
- (c) Esa orden queda con la tela lista antes que una que espera la corrida.
- (d) Lo que el stock no cubre lo toma la programación manual, con su máquina y su día, y la tela queda lista según ese día.
- (e) Lo que no cubren ni el stock ni lo manual va a corrida automática marcada como estimada por el sistema.
- La tabla pedido vs cargado trae las tres columnas y la pantalla las muestra.
- El reporte antes y después existe, trae días por orden, y la comparación no deja el motor en el modo viejo.
