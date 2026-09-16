# Búsqueda general, buscador y agrupador en todas las listas — reporte

Fecha: 15-sep-2026. Motor sin tocar. Pruebas del simulador: **941 (18 nuevas), todas verdes, 0 errores**.

## 1 · Barra de búsqueda general
Arriba, en la cabecera, visible en **todas las pantallas** y también en teléfono, donde ocupa el ancho completo.
Escribes WH, ODC, cliente o referencia y los resultados salen al instante, con **foto, WH, fase, cliente, referencia y
dónde está ahora**. Un clic abre la **ficha de la orden**: foto, fase, cliente, ODC, color, entrega pedida, compromiso y
la fecha que da el programa, la **ruta con el paso actual marcado** y las fechas de cada paso, el **avance por talla**
contra lo cortado o lo pedido, y el **historial de fases** con motivos y observaciones. Desde la ficha, el botón «Ir a
donde está» lleva a la pantalla que resuelve su estado, con el «← atrás» de siempre.

**Respeta los perfiles**: quien no tiene permiso general solo encuentra órdenes que pasan por los centros que su perfil
puede ver. Cuando no hay resultados lo dice con esas palabras: «entre las que tu perfil puede ver».

## 2 · Buscador de lista sin elegir campo
Escribir ya busca en WH, ODC, referencia, color, fase, cliente y categoría a la vez. El menú que antes empujaba a elegir
un campo ahora dice que **ya está buscando en todos** y ofrece, como opción, acotar a uno solo. Ese texto sale de la
tabla de ayudas.

## 3 · Agrupador
«Categoría padre» pasó a **Familia** y «Categoría hija» a **Tipo de producto**. El orden de las opciones es el que
pediste: Cliente, Fase, Familia, Tipo de producto, Color, ODC, Mes de entrega, Próximo paso, Proyecto, y al final Etapa
actual. Los nombres salen de la **tabla 17 · Textos de pantalla** (Configuración → Órdenes y materiales): si cambias ahí
un texto, cambia en todas las pantallas, y dejarlo vacío devuelve el nombre por defecto.

## 4 · Lista confirmada de pantallas

**Ya tenían buscador y agrupador comunes**: Órdenes, Liberación y Liberación a producción, Control de piso, Producto en
proceso, Vista general de órdenes, Asignación por orden, Centro (programación y carga que viene), Plan mensual →
Agregar, Carga general y Mi centro.

**Les faltaban y se agregaron ahora**:
- **Entregas**: buscador común.
- **Costura**: buscador común en la secuencia por módulo.
- **Capacidad y decisiones**: buscador y agrupador comunes en el detalle de la celda, con los grupos abiertos.

**No llevan buscador de órdenes porque no listan órdenes** (lo reporto en vez de forzarlo):
- **Tejeduría**: lista telas, kilos y la programación manual por máquina y día.
- **Tintorería**: lista baños por máquina y día, y kilos por color.
- **Stock de tela cruda**: lista telas con kilos disponibles y requeridos.
- **Compras del mes** y **Macro del mes**: listan materiales y proveedores.
- **Reportería** y **Avance del mes**: son sumas por centro, semana o mes, no listas de órdenes.

Si quieres, en Tejeduría, Tintorería y Stock puedo poner un buscador **por tela o color**, que es otro componente. Dime y
lo hago.

**Agrupadores propios que NO se reemplazaron, porque perderían funciones**:
- **Entregas**: su agrupador tiene departamento y estilo, que el común no maneja, y sostiene la selección para el PDF al
  cliente y la fecha de compromiso masiva.
- **Plan mensual → Agregar**: sus grupos llevan casillas de selección para armar el plan.
- **Costura → secuencia por módulo**: la lista va en el orden en que el módulo hace las órdenes; agruparla rompería
  justamente eso.

En los tres, el orden o la selección son la función principal, así que los dejé como están.

**Ya se había migrado antes**: la cola por centro pasó al agrupador común en el trabajo de centros, conservando el
arrastre para cambiar el puesto.

## 5 · Memoria por pantalla y usuario
La agrupación elegida se guarda por pantalla **y por usuario**: si dos personas usan el mismo navegador, cada una
conserva la suya. Lo guardado antes sin usuario se sigue leyendo, así que nadie pierde su configuración.

## 6 · Qué se probó
- La barra general está en la cabecera; buscar por WH encuentra al instante; también por ODC, cliente y referencia.
- El resultado muestra foto, WH, cliente, fase y dónde está; la ficha trae ruta, fechas, avance por talla e historial.
- Un perfil de piso solo encuentra lo que su perfil puede ver.
- El buscador de lista filtra por todos los campos sin elegir, y el selector queda como opción.
- El agrupador dice Familia y Tipo de producto, en el orden pedido, y cambiar el texto en la tabla 17 cambia lo que se ve.
- Entregas, Costura y Capacidad y decisiones tienen el buscador común; en Capacidad, también el agrupador.
- La agrupación se recuerda por pantalla y por usuario.
