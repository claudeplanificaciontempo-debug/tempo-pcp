# Balanceo · Etapa 1 — reporte

Fecha: 15-sep-2026. Motor sin tocar. Pruebas del simulador: **923, todas verdes, 0 errores** (las de esta parte van
etiquetadas BE1).

## 1 · Tipos de máquina con alias
Tabla nueva en Configuración → Centros y recursos: **Tipos de máquina**, con tipo, alias, familia, cuántas operaciones
lo usan, activa y el botón de quitar.

- Se siembra sola con **cada nombre distinto que trae la hoja de operaciones, sin agrupar nada**: hoy entran 27 filas.
- Los nombres con sufijo **TP** quedan como tipos separados y marcados **«por confirmar con planta»**. No asumí nada.
- Para juntar dos nombres: dejas uno como tipo, escribes el otro en su columna de alias y desactivas el duplicado. El
  alias manda sobre el tipo desactivado, así que nada se pierde.
- Cada cambio queda en bitácora, y quitar un tipo pide confirmación.

### Propuesta de agrupación, para que la confirmes (no está aplicada)
| Tipo que propongo dejar | Alias que le pondría | Operaciones |
| --- | --- | --- |
| OVERLOCK 4 HILOS | OVERLOK 4 HILOS | 138 |
| OVERLOCK 5 HILOS | OVERLOK 5 HILOS | 2 (más el TP, ver abajo) |
| RECUBRIDORA | — (dejo aparte RECUBRIDORA COLLARETERA) | 33 |
| MANUAL | — (dejo aparte PULPO MANUAL) | 96 |

Todo lo demás lo dejaría como está: recta (207), vertical (27), ojaladora (10), pulpo manual (9), sesgadora (7),
bordadora (7), elasticadora (5), botonadora (4), recubridora collaretera (4), tirilladora (1), recta doble aguja (1),
tampográfica (1).

**Los nueve nombres con TP quedan sin tocar y marcados**: recta TP (17), overlock 3 hilos TP (6), atracadora TP (6),
recta 2 agujas TP (5), cerradora de codo TP (3), overlock 5 hilos TP (2), recubridora TP (1), pretinadora multiaguja TP
(1), ojal lágrima TP (1), remachadora TP (1). Necesito que planta diga si TP es otra planta, otra máquina o un
proveedor externo.

Dos dudas más que me gustaría que resuelvas: si **recta doble aguja** y **recta 2 agujas TP** son la misma máquina, y si
**recubridora collaretera** es un tipo propio o una recubridora con aditamento.

## 2 · Máquinas por módulo
La tabla ya existía y está vacía, como corresponde: la llena planta. Lo único que cambió es que el desplegable de tipo
ahora sale de la tabla de tipos de máquina, no de una lista fija del código, así que lo que se registre va a cuadrar con
lo que pide el balanceo.

## 3 · Operarias y especialidades
Tabla nueva: **nombre, módulo, especialidad por tipo de máquina con tres niveles** (1 aprende, 2 hace, 3 referente) y
activa. Solo eso: ningún otro dato personal. **Llenarla no es obligatorio**: el nombre puede quedar vacío y el balanceo
funciona con puestos numerados. Cada cambio queda en bitácora y quitar una operaria pide confirmación, sin borrar
ningún registro de producción.

## 4 · Parámetros
- **tolPuesto**: la tolerancia del puesto, 2 % sembrado. Antes estaba escrita como 1.02 dentro del reparto.
- **nivelMinEsp**: nivel mínimo de especialidad para que una sugerencia asigne una operación, sembrado en 2.
- Son **distintos** del semáforo de carga de los centros, que sigue con su propio umbral.

## 5 · Vista de módulos
Balanceo ahora abre con una tarjeta por módulo: **personas, máquinas registradas, operarias cargadas y la referencia en
curso** con sus prendas del mes. La tarjeta se abre y muestra sus órdenes agrupadas por familia. Los módulos sin
máquinas registradas salen marcados. Es el mismo componente de tarjetas del resto del sistema.

## 6 · Lo que queda para la etapa 2 (no construido)
Según lo que decidiste: la asignación se guarda **por módulo y hoja de operaciones**, con ajuste por referencia; el
ingeniero guarda la base y la supervisora hace cambios del día, auditados, que no pisan la base. Falta también el
arrastre de operaciones a puestos, la carga por puesto contra el takt, la impresión por operaria y la sugerencia
automática como punto de partida. Todo eso espera tu visto bueno y la hoja con el orden de las operaciones.

## 7 · Qué se probó
- Los 27 tipos se siembran con los nombres de la hoja, sin agrupar, y los TP quedan marcados por confirmar.
- Con el alias cargado, OVERLOK y OVERLOCK quedan como el mismo tipo; sin alias, dos nombres distintos no se juntan solos.
- Existen los dos parámetros y el reparto de puestos ya no tiene el 1.02 escrito en el código.
- Las operarias guardan nombre, módulo y nivel por tipo de máquina.
- Las tres tablas están en Configuración y Balanceo abre con la vista de módulos.
