# Plan mensual · Bloque 2 contra la fecha meta — reporte

Fecha: 15-sep-2026. Motor sin tocar. Pruebas del simulador: 834 (4 nuevas), todas verdes.

## Qué cambió
El Bloque 2 contaba vencidas y en riesgo usando la fecha de entrega de Odoo. Ahora usa la **fecha meta**: el
compromiso con el cliente si existe y, si no, la de Odoo. Es exactamente la misma fecha que usa el motor para
programar, así que el resumen del plan y el programa ya no pueden contradecirse.

- **Vencidas**: fecha meta anterior a hoy y la orden todavía abierta.
- **En riesgo**: fecha meta de hoy en adelante y el motor dice que no llega a esa fecha.
- Los textos y el tooltip lo dicen: "Vencidas (fecha meta pasada)" y la nota aclara que la meta es el compromiso
  si existe, si no la de Odoo.

## Qué se probó
- Una orden con fecha de Odoo de hace 30 días y compromiso a 30 días: **no** cuenta como vencida.
- Esa misma orden, cuando el motor dice que no llega al compromiso: cuenta como **en riesgo**.
- Una orden con la misma fecha pasada y **sin** compromiso: sigue contando como vencida.
