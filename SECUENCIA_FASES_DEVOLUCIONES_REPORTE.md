# Secuencia de fases para devoluciones — reporte y propuesta

Fecha: 15-sep-2026. Motor sin tocar. Pruebas del simulador: **817 (16 nuevas), todas verdes, 0 errores**.

## 1 · Qué quedó en el sistema

- **Tabla 1** (Configuración → Órdenes y materiales) tiene una columna nueva y editable: **secuencia**, número libre.
  Está **vacía**: no sembré ningún valor. Cada cambio queda en bitácora con quién, de qué a qué.
- **Regla de devolución**: la fase nueva con secuencia **menor** que la actual es devolución y pide motivo de la tabla 15.
  Secuencia **mayor** es avance, y secuencia **igual** son fases paralelas. Ninguna de las dos pide motivo.
- **Si a alguna de las dos fases le falta la secuencia**, se aplica la regla anterior por grupo de la tabla 5, y la fase
  aparece en **Hoy → Pendientes** como «Fases sin secuencia en la tabla 1», diciendo cuáles están en uso hoy.
  Hoy la bandeja muestra las 46 fases, porque la columna está vacía.
- La auditoría no cambia: quién, cuándo, antes, después y motivo, con las devoluciones marcadas aparte.

## 2 · Propuesta de secuencia (para que la cargues o la corrijas)

Números de 10 en 10 para que puedas intercalar sin renumerar. **Los repetidos son fases paralelas a propósito.**

| Sec. | Fase | Por qué |
| --- | --- | --- |
| 10 | 0Diseño | arranque |
| 10 | 0Reproceso diseño | **paralela**: es rehacer el diseño, no una etapa posterior |
| 20 | 0Recetas Insumos | |
| 30 | 0Adquisición | |
| 30 | 0Ord Compras | **paralela**: comprar tela e insumos corren juntos |
| 40 | 0Macro | |
| 50 | 1Tejeduria | |
| 55 | 1CD Tintoreria | cola antes de tintorería |
| 60 | 1Tintoreria | |
| 65 | 1INCOMPLETOS TIN | |
| 65 | 1Incompletos Tintoreria | **paralela**: es el mismo estado con otro nombre en Odoo |
| 70 | 1Calidad Tintoreria | |
| 70 | 1Tela Stock | **paralela**: la tela de stock entra ya aprobada, al mismo punto |
| 80 | 2Planificacion | |
| 90 | 3AEROPUERTO | |
| 90 | 3Trazos | **paralela**: las dos son preparación de corte, sin orden fijo |
| 100 | 3CD CORTE | cola de corte |
| 110 | 4Corte Planta | |
| 110 | 5Corte Maquila Ibarra | **paralela**: es el mismo corte, hecho afuera |
| 115 | 4Incompletos | |
| 115 | 4Preparacion Insumos | **paralela**: las dos ocurren entre corte y ensamble |
| 120 | 4CD Ensamble | cola de ensamble |
| 120 | 5CD Maquila | **paralela**: misma cola, ruta externa |
| 125 | 4 Calidad Produccion | |
| 128 | 6 CD BORDADO | |
| 128 | 6 CD SERIGRAFIA | **paralela**: colas de servicios, sin orden entre ellas |
| 130 | 7Confección | |
| 130 | 6Bordado | **paralela** |
| 130 | 6Serigrafia | **paralela** |
| 130 | 5Maquila Conf | **paralela**: confección, bordado y serigrafía no son secuenciales entre sí; el orden real lo dicen las órdenes de trabajo de Odoo (así está en el traspaso) |
| 140 | 6 Etiquetado | |
| 150 | 7Pulido | |
| 150 | 5Maquila Recepción | **paralela**: la prenda vuelve de maquila al mismo punto |
| 160 | 8Lavanderia | |
| 160 | 8Lavanderia Quito | **paralela**: misma etapa, otro taller |
| 165 | 8Botones | |
| 165 | 8Servicios y Terminados | **paralela** |
| 170 | 8Empaque | |
| 180 | 8Empaque Terminado | |
| 190 | 8Embodegado | |
| 190 | 8Centro Distribucion | **paralela** |
| 190 | 8Cross | **paralela** |
| 190 | 8Novedades | **paralela**: es un estado de excepción de la prenda ya terminada |
| 200 | 8Exportacion | |
| 210 | Stand by | |
| 220 | Facturado | |

### Los tres casos que pediste revisar
| Movimiento | Con esta propuesta | Resultado |
| --- | --- | --- |
| 1Calidad Tintoreria → 1Tintoreria | 70 → 60 | devolución: **pide motivo** |
| 4CD Ensamble → 4Corte Planta | 120 → 110 | devolución: **pide motivo** |
| Facturado → Stand by | 220 → 210 | devolución: **pide motivo** |

Los tres quedaban sin motivo con la regla por grupo. Con la secuencia cargada, los tres lo piden.

### Dos decisiones que te dejo a ti
1. **0Reproceso diseño** lo puse paralelo a 0Diseño. Si quieres que volver a diseño desde el reproceso pida motivo,
   dale a Reproceso diseño un número mayor, por ejemplo 15.
2. **8Novedades** lo puse paralelo a embodegado y centro de distribución. Si en la práctica es un paso atrás, súbelo o
   bájalo según corresponda.

## 3 · Cómo cargarla
Configuración → Órdenes y materiales → tabla 1, columna **secuencia**, un número por fila. Puedes cargarla por partes:
mientras una fase no tenga número, sigue mandando el grupo de la tabla 5 y la bandeja de Hoy te recuerda cuáles faltan.

## Qué se probó
- La columna existe, es editable, arranca vacía y guarda el número en bitácora.
- Secuencia menor pide motivo; mayor no; igual (paralelas) no.
- La secuencia manda sobre el grupo de la tabla 5 cuando las dos fases la tienen.
- Si a una de las dos le falta, se aplica la regla por grupo.
- Las fases sin secuencia salen en Hoy → Pendientes, y al cargar una, esa sale de la bandeja.
- Avanzar y moverse a una paralela no piden motivo; devolver sin motivo se rechaza y con motivo de la tabla 15 queda
  auditado como devolución.
