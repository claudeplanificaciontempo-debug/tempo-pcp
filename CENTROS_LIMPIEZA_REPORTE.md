# Centros de producción: limpieza — reporte

Fecha: 15-sep-2026, noche. Motor sin tocar. Pruebas del simulador: **1.018 (10 nuevas), todas verdes, 0 errores**.

## 1 · Pestaña Planificación
- **Carga por días**: igual que antes.
- **Órdenes de la semana**: el total va ahora **en grande, en negrita y con el color del tema**, al lado del título;
  a su derecha, las prendas programadas y la nota de que van **ordenadas por fecha de inicio**. El orden no cambió.
- **Vienen después**: dejó de ser un desplegable aparte. Está **en el mismo bloque**, debajo de las de la semana,
  ordenadas por fecha de inicio, con columnas OP, Categoría, Prendas, Inicio y **Dónde está**.
- **Dónde está** sale de `dondeEsta()` y viene con color según qué tan cerca está de llegar al centro: verde si ya está
  en este centro o en el paso inmediatamente anterior, azul intermedio si le falta un paso más, ámbar si está por
  liberar y rojo si está sin liberar.
- **La fecha de entrega del cliente salió** de las dos tablas de la pestaña.

## 2 · Dónde quedó «Carga que viene»
La pestaña **salió de los centros**. Su contenido completo se ve ahora en **Planificación de producción → Carga
general**, al elegir un centro en el selector que esa pantalla ya tenía. Aparece al final, bajo la cinta **«Carga que
viene · <centro>»**, con **todo lo que tenía**:
- prendas programadas del mes con **toda la cartera** (liberada o no);
- de esas, las **liberadas a producción**;
- las que están **por liberar**, con cuántas órdenes son;
- **órdenes en camino** con sus prendas;
- el **plan congelado del mes** para ese centro;
- y la **lista agrupada por dónde está cada orden**, con el cruce familia por fase y la tarjeta de «sin liberar».

Si no hay centro elegido, Carga general lo dice en una línea en vez de mostrar el bloque vacío. Nadie perdió ninguna
función: es el mismo panel, con selector de centro en vez de una pestaña por centro.

## 3 · Agrupar y buscar en las pantallas de producción
El agrupador común ofrece **Fase, Familia y Cliente** (además de tipo de producto, color, ODC, mes de entrega, próximo
paso, proyecto y etapa) y el buscador común busca por WH, ODC, cliente y referencia. Está en:
- las pestañas de centro (programación del centro y planificación),
- **Carga general**, donde el agrupador ahora se ve en la barra de arriba y no solo al abrir el detalle,
- **Liberación a producción**,
- **Control de piso** de producción.

Sobre la cola del centro: ya usa el **agrupador común** desde el trabajo anterior de centros, conservando el arrastre
para cambiar el puesto y los totales por grupo. Es decir, ya tiene Familia y Cliente y no hizo falta tocar
`agruparCola`, que quedó sin uso en esa pantalla.

## 4 · Antes y después (Corte y Confección)

| | Antes | Después |
| --- | --- | --- |
| Pestañas de Corte | Planificación · Carga que viene · Programación del centro · Ejecución y desviaciones | Planificación · Programación del centro · Ejecución y desviaciones |
| Pestañas de Confección | las cuatro + Costura | Planificación · Programación del centro · Ejecución · Costura |
| Total de la semana | texto pequeño junto al título | número grande en el color del tema |
| Vienen después | desplegable aparte, con columna Entrega | dentro del bloque, con columna Dónde está y sin Entrega |
| Columnas de la semana | … Inicio, Fin, Marca, Liberada | iguales; la entrega ya no aparece |
| Carga que viene | una pestaña en cada centro | en Carga general, con selector de centro |

No pude adjuntar capturas de imagen: el navegador que uso guarda las pantallas en la conversación, no en el repositorio.
La tabla de arriba es la comparación exacta de lo que cambia en pantalla, tomada de las dos pantallas reales antes y
después del cambio.

## Qué se probó
- El total de la semana sale en grande con el color del tema, y las órdenes siguen por fecha de inicio.
- Las dos tablas de la pestaña ya no muestran la entrega del cliente.
- «Vienen después» está en el mismo bloque y trae la columna «Dónde está» con color.
- La pestaña «Carga que viene» ya no existe en los centros, y en Carga general aparece con todo su resumen al elegir
  centro; sin centro, lo dice.
- Centro, Carga general, Liberación a producción y Control de piso tienen buscador y agrupador comunes, con Fase,
  Familia y Cliente entre las opciones.
