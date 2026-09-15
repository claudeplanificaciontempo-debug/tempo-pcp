# Control en línea (tablet), PDF del programa y cambio de fases — reporte

Fecha: 15-sep-2026. No se tocó el motor ni capacidades. Pruebas del simulador: 684 (19 nuevas), todas verdes.

## A · Control en línea para módulos (piloto tablet) — página "Mi centro"

**Cómo se arma un usuario de módulo (lo haces tú, yo no creo cuentas):**
1. Configuración → Usuarios → "Nuevo usuario": correo, nombre, contraseña, perfil **"Tablet de centro (operarios)"**.
2. En la fila de ese usuario, columna **Tablet**: elige el centro (Módulos) y el recurso (el módulo). Queda guardado en
   `S.params.tablets` y en la bitácora.
3. Al entrar, ese usuario ve **solo "Mi centro"**: sin configuración, sin otros módulos, sin plan. Nada más en el menú.

Repites 11 veces (uno por módulo). El perfil "Tablet" ya está sembrado en el catálogo de perfiles; se puede editar como
cualquier otro (es dato, no código).

**Qué ve el operario** (pantalla única, letras grandes):
- Arriba: nombre del módulo, **prendas del día** (lo programado hoy para ese módulo), **hechas hoy**, **faltan**, órdenes
  en cola.
- Debajo, una tarjeta por orden en el orden de la cola del módulo (la secuencia del programa; si el centro tiene puestos
  numerados, ese orden): **foto grande** (140 px, clic = se agranda), WH y fase, tipo de producto y color, cliente,
  hechas / total, fecha de entrega, y tallas si la orden las trae (hoy Odoo no manda tallas: cuando llegue el campo
  `tallas`, aparecen solas).

**Registrar**: botón **Hecho** grande → registra la orden completa en ese centro (el mismo registro de Control de piso:
quién, cuándo, cuántas, diferencia si no cuadra) y la orden pasa al siguiente centro. **Parcial** está preparado y
desactivado: se activa por el parámetro `modulosParcial` (Configuración), nada de código.

**Cronómetro** (opcional, discreto): botón pequeño "⏱ cronómetro" → "Terminar · N min". Guarda inicio, fin, minutos y
quién en el avance de piso; la tarjeta muestra "Tardó X min · estándar Y min" (estándar = minutos LMO del paso × prendas).
Si no lo usan, no pasa nada; no bloquea "Hecho".

**Otros centros**: la misma pantalla sirve para corte, estampado, bordado, terminados (etiquetas, botones, lavado,
plancha) y empaque: al asignar la tablet se elige el centro y, si aplica, el recurso. Agregar un centro nuevo = asignar
otro usuario, no rehacer nada. Planificación y admin pueden abrir "Mi centro" y elegir cualquier centro/recurso para ver
exactamente lo que ve la tablet.

## B · PDF del programa por centro

En cada centro → pestaña **Programación del centro**, botón **"PDF del programa (para operarios)"**. Abre una ventana
lista para imprimir o guardar como PDF (Ctrl+P → Guardar como PDF), **A4 horizontal**, con la cola de la semana que
está en pantalla (o toda si tienes "todas" activado), por cada centro del grupo:

| Puesto | Foto | Orden de producción | Cliente | Tipo de producto | Color | Min. estándar / prenda | Unidades | Min. totales |

Las filas no se cortan entre páginas; una hoja o varias según cuántas órdenes haya. No lleva eficiencia, módulo, costos
ni nada interno. Si el navegador bloquea la ventana, avisa (hay que permitir ventanas emergentes para el sitio).

## C · Cambio de fases centralizado

**1 · Control de piso → área "Cambio de fases"** (nueva opción del selector de área; la ven quienes tienen permiso de
órdenes, programa o avance):
- Selector **Fase actual** con el conteo de órdenes en cada fase (las 42 de la tabla más las que traiga Odoo).
- **Buscador inteligente** (el mismo de Odoo: WH, ODC, estilo, color, fase, cliente, categoría).
- Lista con casilla, **foto/WH/fase, ODC, cliente, estilo, categoría, color, cantidad, fecha de entrega**; casilla de
  cabecera para marcar todas.
- Abajo: **Mover a la fase** + **Motivo (obligatorio)** + "Mover N órdenes". Sin motivo no mueve. Queda en el historial de
  fases de cada orden (`fases[]` con motivo, quién, cuándo) y en la bitácora.

**2 · Tejeduría → Órdenes de compra.** Si una orden pasa de **1Tejeduria** a **0Ord Compras**:
- La **ruta cambia**: el paso de tejeduría se reemplaza por un paso **proveedor** con los días del proveedor de la orden
  (si no hay días configurados, queda en 0 y la alerta lo dice: "sin días de proveedor"). Las telas quedan marcadas como
  compradas (`ext`), así que tejeduría ya no las carga.
- Sale la **alerta** "Órdenes que pasaron de tejeduría a compras: la persona de compras tiene que pedirlas" en **Hoy →
  Pendientes** (con las WH) y un panel rojo en **Compras del mes** con telas, kg, días de proveedor, motivo y quién, y el
  botón **"pedida"** para atenderla.

**3 · Desde cualquier pantalla.** La etiqueta de fase que va junto a la WH (la de ayer, en todas las listas) ahora es
**clicable**: abre "Cambiar fase" con la fase nueva y el motivo obligatorio. Misma regla, mismo historial, misma alerta
si es tejeduría → compras.

Además se corrigió un residuo visible del buscador de ayer (`X.q=v)">` pegado al campo en las siete pantallas).

## Pendientes tuyos
- Crear los 11 usuarios de módulo (perfil Tablet) y asignarles centro/recurso en la columna Tablet.
- Decidir cuándo activar parcial (`modulosParcial`).
- Siguen: plan de septiembre vacío; agrupación (punto 4 del mensaje anterior, llegó cortado); SURF SPRAY; STUART telas /
  piqué; 35 baños < 70 %; 7 órdenes Odoo vs piso; foto WH/MO/29252; tabla 6 "T-BIANCO-SINTEC(COMPACTADORA)".
