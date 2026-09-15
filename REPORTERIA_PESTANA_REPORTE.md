# Reportería: pestaña propia y Vista general de órdenes — reporte

Fecha: 15-sep-2026. Motor y capacidades sin tocar.

## 1 · Qué va ahí
Nueva pestaña **Reportería** en el menú principal (entre Planificación de producción y Piso), al mismo nivel que las
otras. Entradas:
- **Vista general de órdenes** (nueva)
- Producto en proceso
- Cumplimiento de facturación
- Avance del mes
- Reportería textil y Reportería por área (las que ya existían, para que todo lo de reportes esté en un solo sitio)

Producto en proceso, Cumplimiento y Avance del mes viven **solo en Reportería** (se quitaron de Dirección el mismo día; ver
el ajuste al final).

## 2 · Quién la ve
- Dirección, planificación, admin y consulta: todo (ya tenían todo el menú).
- **Supervisores de centro** (perfiles Corte/estampado/bordado, Módulos, Tintorería, Producto terminado y piso de
  tejeduría): ven Reportería completa **en modo consulta**: sus perfiles no tienen permiso de órdenes ni de programa, así
  que los botones de editar de esas pantallas no aparecen. Las entradas se agregaron a sus perfiles una sola vez (queda
  en bitácora); si tú las quitas en Usuarios → perfiles, no se vuelven a agregar.
- **Tablet**: no la ve (su perfil solo tiene "Mi centro").

## 3 · Vista general de órdenes
Todas las órdenes abiertas (hoy 1.223) en una lista: **foto, WH, fase**, cliente, ODC, estilo, categoría padre,
categoría hija, color, prendas, fecha de entrega, proyecto y **estado** (dónde está según el programa: sin liberar,
textil, en qué centro, terminada; con marca de atraso).
- **Buscador inteligente** (el mismo de Odoo): WH, ODC, estilo, color, fase, cliente, categoría; Enter = todos.
- **Agrupación colapsable** hasta tres niveles anidados por fase, cliente, ODC, categoría padre, categoría hija, color,
  proyecto (y etapa actual). Grupos cerrados con conteo de órdenes y suma de prendas a la derecha; la preferencia queda
  en el navegador.
- **Clic en una orden → detalle completo**: entrega meta y fecha estimada, cada paso de la ruta con recurso, inicio,
  fin, límite y estado (hecho / programado / se pasa), dónde está, **qué le falta** (pasos pendientes de producción),
  liberación, si está en el plan mensual, telas con kg, **historial de fases** (cuándo, de → a, quién, origen y
  motivo) y la **foto** grande. Es el mismo detalle de Asignación por orden, ampliado.

## 4 · Preparada para crecer
Los reportes viven en una lista `REPORTES` (nombre, página, descripción). Agregar un reporte nuevo = una línea en esa
lista + su entrada en el menú (+ la pantalla). Con eso aparece solo en la **barra de reportes** que va arriba de cada
pantalla de Reportería (chips para saltar entre reportes) y en el menú. Hoy son seis entradas; mañana ocho sin
reorganizar nada.

## Pendientes tuyos
- Siguen: usuarios de módulo, plan de septiembre, STUART (Fleece perchado / French terry / Ribb 2x2 grueso), foto
  WH/MO/29252, tabla 6 "T-BIANCO-SINTEC(COMPACTADORA)".

## Ajuste (15-sep, después): Dirección sin duplicados
Por pedido de la usuaria, Producto en proceso, Cumplimiento y Avance del mes **salieron de Dirección**: viven solo en
Reportería. Dirección queda con: Hoy, Resumen gerencial, Órdenes, Liberación, Entregas, Plan mensual, Demanda agregada,
Escenarios, Auditoría de replanificación y Capacidad y decisiones.
