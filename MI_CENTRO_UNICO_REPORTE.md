# Mi centro único: inicio, fin, tiempo y unidades por talla — reporte

Fecha: 15-sep-2026. Motor sin tocar. Pruebas del simulador: **958 (17 nuevas), todas verdes, 0 errores**.

## 1 · Qué hacía Modo línea que Mi centro no hacía
| Modo línea | ¿Estaba en Mi centro? |
| --- | --- |
| Elegir módulo con un desplegable grande | Sí, para admin y planificación |
| **Personas presentes hoy** por módulo (asistencia del día) | No |
| **Botón PARO** con motivo y minutos | No |
| **Avance rápido**: botones +10, +25, +50, +100 y campo de prendas | Parcial: Mi centro registraba el total o por talla |
| **Segundas** (prendas de segunda) con +1 | No |
| Barra de avance y prendas del día del módulo | Sí, en las tarjetas |

**Perfiles que lo tenían en el menú**: piso de corte, estampado y bordado; módulos (confección); producto terminado;
y el perfil genérico de piso. Cuatro perfiles en total, además de administración.

## 2 · Qué se movió y qué queda por borrar
Modo línea **ya no está en el menú ni en los perfiles**: los cuatro ahora llevan Mi centro. El enlace viejo, si alguien
lo tiene guardado, **abre Mi centro del mismo módulo**.

**No borré `vLinea` todavía**, como pediste. Esta es la lista de lo que se eliminaría cuando me confirmes:
- la función `vLinea` (la pantalla completa) y su entrada en el despachador de páginas;
- la sección vacía `p-linea` del HTML y la entrada `linea` del catálogo de páginas y de los íconos;
- el estado `LIN`.
**No se borra nada de datos**: la asistencia del día, los paros y las segundas siguen guardándose igual, y las funciones
que los manejan se conservan porque las usan otras pantallas. Tampoco hay botón de pantalla grande.

## 3 · El flujo, con botones grandes
En Mi centro, arriba de todo:
1. **Elegir orden**: solo las programadas en ese centro, con foto, fase y cuántas faltan. Botón **INICIO**.
2. Con el tramo abierto: la orden en grande, la hora de inicio, el tiempo corriendo, y dos botones: **FIN** y **Paro**.
3. **Paro**: motivo de la tabla 15 y minutos. El tiempo del paro se descuenta del tramo.
4. Al tocar FIN: **unidades por talla** con botones **+** y **−**, mostrando para cada talla cuánto llevas contra lo
   cortado o, si no hay corte, contra lo pedido, y avisando cuando se pasa.
5. **Guardar**. Nada más en ese flujo.

Debajo queda «Lo registrado hoy»: cada tramo con quién, desde, hasta, trabajado, paros, unidades y minutos por prenda
real con su semáforo.

## 4 · Cómo se calcula el tiempo
Una sola función hace toda la cuenta:
- **Tiempo trabajado** = fin − inicio − paros − descansos del horario del centro.
- **Minutos-persona** = tiempo trabajado × personas del recurso.
- **Minutos por prenda real** = minutos-persona ÷ unidades del tramo, con semáforo contra el estándar de la operación:
  verde si está en el estándar o mejor, ámbar hasta la tolerancia y rojo por encima.
- Parámetros en Configuración, no en el código: **tolMinPrenda** (tolerancia del semáforo, 15 %) y **topeHorasTramo**
  (tope de horas de un inicio sin fin, 10).

**Dos cosas que hoy faltan y se reportan, no se inventan**:
- **Ningún centro tiene descansos cargados** en su horario. Mientras no existan, el tiempo trabajado no descuenta
  ningún descanso, y la pantalla lo dice abajo con esas palabras.
- **Los centros que no son módulos no tienen personas configuradas**: ahí los minutos-persona se calculan con **1
  persona** y también queda dicho en pantalla.

## 5 · Olvidos
Si un inicio pasa del tope de horas sin fin, aparece un aviso rojo en Mi centro con la lista y un botón «corregir», y
una bandeja en **Hoy → Pendientes** para el supervisor. **El sistema no cierra el tramo ni inventa la hora**: el
supervisor escribe la hora real de fin y elige un motivo de la tabla 15, y la corrección queda en auditoría con quién,
cuándo, antes y después.

## 6 · Una orden a la vez por puesto
Si alguien intenta empezar otra orden en el mismo puesto, el sistema pregunta si cierra la anterior. Si dice que no, no
pasa nada; si dice que sí, cierra la primera y sigue con las unidades por talla de esa.

## 7 · Auditoría
Cada tramo guarda quién, cuándo empezó y terminó, centro, recurso, paros con su motivo, unidades por talla, tiempo
trabajado, minutos-persona y minutos por prenda. Cada registro por talla queda además en el historial con el tramo del
que salió. Son los datos que alimentan el seguimiento y el reporte de avance del tablero del responsable de centro.

## 8 · Qué se probó
- Modo línea salió del menú y de los perfiles, y el enlace viejo abre Mi centro.
- INICIO abre el tramo con quién y cuándo, y solo permite una orden a la vez por puesto; intentar otra pregunta.
- El paro se descuenta del tiempo trabajado.
- Un módulo con 8 personas calcula los minutos-persona como tiempo trabajado por 8.
- Sin descansos cargados, se reporta y no se inventan.
- Las unidades se cargan con + y −, y pasarse de lo cortado o lo pedido avisa y queda marcado.
- Los minutos por prenda reales salen de los minutos-persona entre las unidades, con semáforo.
- Un inicio sin fin que pasa del tope avisa en Mi centro y en Hoy, no se cierra solo, y la corrección del supervisor
  queda en auditoría.
