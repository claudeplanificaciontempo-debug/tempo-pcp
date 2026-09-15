# Centros de producción (corte, confección y todos) — reporte

Fecha: 15-sep-2026. Motor sin tocar. Pruebas del simulador: **882 (16 nuevas), todas verdes, 0 errores**.
Todo con los componentes comunes ya publicados.

## 1 · Confección separada por módulo, con la maquila aparte
En Programación del centro, Confección arranca con una tarjeta por **módulo** (prendas del período, minutos usados
contra los disponibles y el porcentaje) y, debajo, una sección propia para la **maquila**. Cada tarjeta se abre y
muestra sus órdenes agrupadas por familia, con foto, WH y fase.

## 2 · Filtro de fases y agrupador comunes
La cabecera de todos los centros trae el **filtro de fases desplegable** agrupado por los grupos de la tabla 5, el mismo
de Liberación y Órdenes. Acota las cuatro pestañas del centro. La cola de Programación del centro y las listas de Carga
que viene usan el **agrupador común** (fase, familia, categoría, color, cliente, ODC, proyecto, etapa, próximo paso, mes)
con sus totales de órdenes, prendas y horas. En la cola los grupos vienen **abiertos**, porque es una lista de trabajo:
el clic los cierra, y se sigue arrastrando para cambiar el puesto.

## 3 · Resumen de la semana al programar
Arriba de la programación de cada centro: tabla **día × familia** con unidades y horas en cada celda, totales por familia,
por día y general. Responde de una mirada "el lunes, cuántas camisetas y cuántos polos".

## 4 · Carga que viene
Debajo del resumen de unidades:
- **Familia por fase**: cruce con las prendas que vienen, con un botón que lo da vuelta (familias en las filas o fases en
  las filas), totales por fila, por columna y general.
- **Sin liberar todavía**: tarjeta desplegable con las órdenes que este centro necesita y planificación aún no libera,
  agrupadas por familia.

## 5 · Color en corte y confección
Botón **«Juntar colores en la cola»**: renumera los puestos de la cola juntando los colores para bajar cambios de hilo.
Es **solo vista y orden manual**: queda en bitácora, no cambia el programa ni las fechas del motor, y la prueba del
simulador verifica justamente que las fechas del motor quedan idénticas. Además, el agrupador ya permite ver la cola
agrupada por color.

### Qué haría falta para que el motor secuencie por color (no se hizo)
Hoy `ventanaColor` es un parámetro que el motor usa en tintorería para juntar en el tiempo órdenes del mismo color. Para
que corte y confección secuencien por color harían falta cuatro cosas, todas decisiones tuyas:
1. **Cuánto cuesta el cambio de color**: un parámetro de minutos de cambio por centro, como el que ya existe para cambiar
   de tela en tejeduría. Sin ese número el motor no puede comparar "juntar colores" contra "entregar a tiempo".
2. **Hasta dónde se puede adelantar o atrasar una orden por juntar color**: reutilizar `ventanaColor` como ventana en
   días, con un valor propio para producción, o decidir que use el mismo de tintorería.
3. **Qué manda cuando chocan**: si una orden llega tarde por esperar a su color, quién gana. Propongo que la fecha meta
   siempre gane y que el color solo ordene dentro de lo que ya cabe en el día, pero es decisión de negocio.
4. **Dónde aplica**: solo corte, solo confección, o los dos, y si la maquila entra.
Con esas cuatro definidas, el cambio vive en la sección de producción del motor y se puede probar con el comparador
antes/después, igual que hicimos con tejeduría.

## 6 · Fuera la fecha de entrega en las vistas de centro
Las tablas de centro (planificación, cola, carga que viene y secuencia de costura) ya no muestran la fecha de entrega.
Muestran **plan inicio → fin** y una columna **Marca** con dos etiquetas: **prioridad**, cuando la orden la tiene puesta,
y **va tarde**, cuando el programa dice que no llega, con los días de atraso en el tooltip. El piso trabaja con las
fechas del plan, no con la del cliente.

## 7 · Costura dentro de Confección
«Costura: secuencia y rebalanceo» es ahora una **pestaña del centro Confección**, junto a planificación, carga que viene,
programación y ejecución. Adentro conserva sus tres vistas: secuencia por módulo, rebalanceo y andon. La entrada suelta
del menú se quitó porque quedaba duplicada, y el enlace de Andon que había en ejecución ahora abre esa pestaña.

## Qué se probó
- Confección muestra una sección por módulo y la maquila aparte.
- El resumen día × familia sale arriba de la programación, con unidades y horas.
- El filtro de fases común y el agrupador común están en programación y en carga que viene, y el filtro acota de verdad.
- El cruce familia por fase se da vuelta, y «sin liberar» es una tarjeta desplegable.
- Juntar colores numera la cola, queda en bitácora y **no cambia ninguna fecha del motor**.
- Las vistas de centro ya no muestran la entrega: muestran plan inicio → fin y la marca.
- Costura es pestaña del centro y ya no está suelta en el menú.
