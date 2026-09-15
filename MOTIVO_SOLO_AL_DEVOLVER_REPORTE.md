# Urgente · Motivo solo al devolver una fase — reporte

Fecha: 15-sep-2026. Motor sin tocar. Pruebas del simulador: **801 (10 nuevas), todas verdes, 0 errores**.

## Qué estaba pasando
Desde el commit anterior, **todo** cambio de fase exigía un motivo de la tabla 15, y la tabla venía vacía: nadie podía
mover fases. Queda arreglado como pediste.

## 1 · El motivo se exige solo al devolver
**Devolución** = la fase nueva cae en un **grupo anterior** de la tabla 5 (se compara la columna *orden* del grupo, no el
número de la fase). Ejemplos: de planificación a tintorería sí es devolución; de tintorería a planificación no.
- **Avanzar**: no pide motivo. Se mueve y queda en auditoría con quién y cuándo, marcado «cambio de fase».
- **Moverse dentro del mismo grupo**: tampoco pide motivo, por la regla que definiste.
- **Devolver**: exige motivo de la tabla 15, uso *devolución de fase*. Sin motivo o con texto libre no se mueve y el aviso
  dice dónde configurarlo.
- Al mover varias órdenes a la vez, si alguna es devolución se pide el motivo y el aviso dice cuántas lo son.
- En Auditoría, las devoluciones salen en negrita y separadas de los avances.

### Lo que pediste reportar: retrocesos dentro del mismo grupo
Diez grupos tienen más de una fase, así que un movimiento hacia atrás dentro de ellos **no pedirá motivo**. Los que en la
práctica son devoluciones reales:

| Grupo | Fases donde un paso atrás no pedirá motivo |
| --- | --- |
| previo a producción | Diseño, Reproceso diseño, Recetas Insumos, Adquisición, Macro, Ord Compras |
| textil | Tejeduría, CD Tintorería, Tintorería, Incompletos, Calidad Tintorería, Tela Stock |
| preparación de corte | Aeropuerto, Trazos, CD Corte |
| corte | Corte Planta, Incompletos, Preparación Insumos, CD Ensamble, Calidad Producción |
| maquila externa | Corte Maquila Ibarra, CD Maquila, Maquila Conf, Maquila Recepción |
| servicios | CD Bordado, CD Serigrafía, Bordado, Serigrafía, Etiquetado |
| confección | Confección, Pulido |
| terminados | Lavandería, Lavandería Quito, Botones, Servicios y Terminados, Empaque |
| prenda terminada | Empaque Terminado, Cross, Centro Distribución, Novedades, Embodegado, Exportación |
| cerrada | Stand by, Facturado |

Los tres casos que más me preocupan, por si quieres que también pidan motivo: **de Calidad Tintorería a Tintorería**
(rechazo de calidad), **de CD Ensamble a Corte Planta** y **de Facturado a Stand by**. Hoy los tres pasan sin motivo
porque quedan dentro de su grupo. No los cambié por mi cuenta: dime si quieres que la regla mire también el orden de la
fase dentro del grupo, o si prefieres marcar fase por fase cuáles son «punto de no retorno» en la tabla 1.

## 2 · Revertir liberación
Sin cambios: sigue pidiendo motivo de la tabla 15, uso *reversión de liberación*, y queda en auditoría con antes y después.

## 3 · Reproceso unificado en la tabla 15
Los motivos de reproceso de tintorería ahora son filas de la tabla 15 con uso **reproceso de tintorería**, y conservan su
columna propia **«¿viene de tejeduría?»** (falla de tela), que aparece en la tabla 15 solo para esas filas.
- La migración corre una sola vez y **no borra nada**: el arreglo anterior se conserva tal cual y queda anotado en bitácora.
- Se migraron los dos motivos que había: *Falla de tela (viene de tejeduría)*, marcado como tejeduría, y *No dio el tono /
  matización*.
- El panel «Motivos de reproceso de tintorería» de Configuración sigue donde estaba y edita esas mismas filas; agregar,
  cambiar o quitar desde cualquiera de los dos lados es lo mismo. Quitar pide confirmación y no toca los reprocesos ya
  registrados.

## 4 · Aviso en Hoy en vez de bloquear en el momento
Nueva bandeja en **Hoy → Pendientes**: «Configurar motivos de devolución». Cuenta lo que falta, dice cuál falta
(devolución de fase, reversión de liberación o las dos) y aclara que avanzar de fase sí funciona. Se va sola cuando
configuras al menos un motivo de cada uso, y se puede posponer como cualquier pendiente.

## Qué se probó
- Avanzar de fase sin motivo funciona y queda en auditoría con quién y cuándo, marcado como cambio, no como devolución.
- Devolver sin motivo se rechaza; devolver con texto libre se rechaza; devolver con motivo de la tabla se hace y queda
  auditado con usuario, fecha, antes, después y motivo.
- La regla de devolución compara grupos: planificación a tintorería es devolución, tintorería a planificación no, y
  moverse dentro del grupo textil no lo es.
- Reproceso migrado: los motivos viven en la tabla 15 con uso reproceso, conservan la marca de tejeduría y la migración
  quedó sellada para no repetirse.
- La bandeja de Hoy aparece con dos faltantes, baja a uno y desaparece al configurar los dos.
