# Tres cosas de pantalla: menú horizontal · pendientes en Hoy · ODC a mano — reporte

Fecha: 14-sep-2026. Commit `c7652f2` (+ ajuste de orden en Hoy), versión 2026-09-14 15:24, pruebas 609/609 (18 nuevas).
No se tocaron capacidades ni el motor.

## 1 · Menú horizontal arriba

- La barra lateral (232 px) desapareció. Arriba, bajo la cabecera, hay una barra con los cinco grupos: **Dirección ·
  Planificación textil · Planificación de producción · Piso · Configuración**. Clic en un grupo despliega su submenú;
  abrir otro cierra el anterior; clic fuera cierra todo. El grupo de la página activa queda subrayado.
- El contenido usa **todo el ancho** (una sola columna): las tablas de muchas columnas ya no se aprietan.
- **Ícono en todas las entradas**, parejo: faltaban Avance del mes, Auditoría de replanificación, Capacidad y decisiones
  y Compras del mes. Verificado en producción: 0 entradas sin ícono.
- Nada cambió por debajo: los mismos enlaces, permisos por perfil (un grupo sin entradas visibles se oculta),
  contadores (órdenes, baños, atrasos) e impresión (el menú no sale en papel).

## 2 · Una sola lista de pendientes en Hoy

Primer panel de **Hoy**: **Pendientes**, con conteo por tipo y enlace directo a donde se resuelve. Es un **índice**:
las bandejas siguen donde están (Órdenes, Liberación, Macro, Compras, Capacidad, Configuración); esto no las reemplaza.

| Pendiente | Hoy | Dónde se resuelve |
|---|---:|---|
| Órdenes sin fecha de entrega | 5 | Órdenes |
| Órdenes sin ODC asignado ("PENDIENTE ODC") | 1 | Órdenes → Asignar ODC |
| Órdenes sin WH por emparejar | 493 | Órdenes |
| Precio por prenda fuera de rango | 4 | Órdenes |
| Telas sin clasificar (origen) | 0 | Macro del mes |
| Tela × tipo sin merma de tintura | 1 | Macro del mes |
| Productos a comprar sin proveedor | 0 | Compras del mes |
| Proveedores con días de entrega estimados sin confirmar | 127 | Configuración → Órdenes y materiales |
| Categorías con pasos sin tiempo de operaciones | 8 | Categorías y operaciones |
| Fases o centros de Odoo que no calzan con las tablas | 1 | Configuración → Órdenes y materiales |
| Decisiones que ya no calzan con el archivo | 22 | Órdenes (bandeja) |
| Centro-mes sin capacidad o que no alcanza | 7 | Capacidad y decisiones |
| Carga real sin medir | 11 | Órdenes (bandeja) |

680 casos en 11 tipos con pendientes. Los que están en cero no se muestran (aparecen cuando haya algo).

**Posponer sin que desaparezca**: cada línea tiene "posponer" (pide días y motivo). Pasa a un desplegable
**Pospuestos (N)** dentro del mismo panel, con fecha, quién y motivo, y vuelve sola a la lista cuando llega la fecha;
"reactivar" la devuelve antes. Queda en bitácora. (`S.params.pendPospuestos`.)

Nota: "proveedores sin días" está en 127 porque todos tienen el **estimado de 15 laborables** sin confirmar; a medida que
confirmes, baja. "Centros que no calzan" toma los centros de trabajo de Odoo sin fila en la tabla 6 de la última carga
de OT.

## 3 · Asignar ODC a mano

En **Órdenes**, panel **Asignar ODC**: lista las órdenes abiertas con "PENDIENTE ODC" o sin ODC (hoy **1**). Se asigna
**de a una** (campo + botón en la fila) o **en bloque** (marcar varias, escribir el ODC, "Asignar a las N marcadas").
- Queda en **bitácora** (quién, cuándo, de qué a qué) y en la orden (`o.odcManual`: usuario, hora, valor anterior).
- Al asignarlo, esas órdenes **forman colección con ese ODC** (misma clave que usa el motor para "se entregan juntas").
- **No se pierde en la recarga**: fila nueva en la tabla 14 (`odc`, conservar = sí). Si el archivo luego trae un ODC
  real distinto, se conserva el tuyo y va a la bandeja "decisiones que ya no calzan" para que decidas.
- Vacío o "PENDIENTE" no se acepta como ODC.

## Código
`navToggle`/`navCerrarTodo` (desplegables; el acordeón viejo se fue), `ICO_NAV` completo, grupo activo en `render()`;
`pendientesHoy`/`pendientesHoyHTML`/`posponerPend`/`reactivarPend`; `esOdcPendiente`, `asignarODC`, `panelODCHTML`,
tabla 14 `odc` + conservación en `aplicarTarea`.
