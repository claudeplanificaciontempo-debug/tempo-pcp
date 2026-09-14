# Recarga del 14-sep (BASE_14-9-26_TAREAS + Orden_de_trabajo14-9-26) — reporte

Producción guardada 11:18 (órdenes) y 11:19 (órdenes de trabajo). Código: commits `057deba` → `85c7bf2`, pruebas 482/482.

## 1 · Órdenes sin WH: ahora son órdenes

Una fila sin número de orden pero con cliente, fase u ODC es una **cabecera de orden no lanzada** (0Diseño, 0Recetas
Insumos…), no un componente. Entran con identificador provisional estable (`SIN WH #xxxx`, calculado de cliente + ODC +
estilo + categoría + color + fecha + cantidad + proyecto), marcadas "sin lanzar": cuentan en Plan mensual y Entregas,
**no se liberan ni se programan** (la liberación las rechaza con "sin lanzar en Odoo"; el programa no las toma). Cuando
Odoo les dé WH entran como órdenes nuevas normales y la provisional se elimina en esa recarga.

En el archivo: 499 filas sin WH → 492 cargadas abiertas + 6 en Facturado/Stand by (cerradas por la fase) + 1 sin
fecha de entrega (bandeja).

## 2 · Precio por prenda fuera de rango (se reporta, no se corrige)

Regla: precio por prenda ≥ 10 × la mediana del archivo (mediana $ 5,64). Cuatro órdenes, todas sin WH, Comercializadora
de Ropa Fashion Club, ODC **3033**, Level 1, fase 0Recetas Insumos, **1.091 prendas y $ 1.190.281 cada una = $ 1.091 por
prenda** (la cantidad quedó en el campo del precio): estilos 6446 BIRCH, 6431 BLEACH, 6427 DARK BLACK y 6427 BLEACH.
Entre las cuatro inflan $ 4,76 millones de octubre. Bandeja visible en Órdenes; corregir en Odoo.

## 3 · Qué se conservó y qué se actualizó (recarga con la regla de la tabla 14)

| | Órdenes |
|---|---:|
| Actualizadas desde el archivo (cantidad, cliente, categoría, color, materiales, técnica, puntadas, precio, ruta) | 709 |
| Nuevas | **495** (3 con WH + 492 sin WH) |
| Eliminadas (ya no vienen en el archivo) | 9: 7 Stand by con fecha pasada (WH/MO/27097, 27129, 27131, 27160, 27169, 27480, 28076), WH/MO/28937 y una más; 8 tenían OT/avance |
| **Fase: se conservó la del sistema** | 709 (12 movidas aquí por supervisores; ninguna se pisó) |
| Historial de fases | 709 |
| Fotos | 654 |
| Módulo fijado (desde OT) | 202 |
| Cierres de OT y avance de piso | 658 (luego reaplicados con el archivo de OT nuevo) |
| Liberación, prioridad, programación, compromiso, ajustes por referencia, telas, rutas editadas, fecha cambiada aquí | 0 (no había ninguna todavía) |

Total en el sistema: 718 → **1.204 órdenes** (abiertas 656 → **1.149**, de las cuales 492 sin WH).

**Bandeja "decisiones que ya no calzan": 110**
- **90 fases distintas**: el sistema conserva la suya y el archivo trae otra. 11 son las que tú moviste aquí (el archivo
  sigue con la fase vieja); las otras 79 son órdenes que **avanzaron en Odoo** y aquí nadie las movió — quedan en la fase
  vieja hasta que decidas caso por caso (pares más frecuentes: 3CD CORTE → 4Corte Planta 8, 1Calidad Tintoreria →
  1Tintoreria 7, 4CD Ensamble → 7Confección 7, 2Planificacion → 4Corte Planta 6, 7Pulido → 6 Etiquetado 5).
- **20 módulos fijados** en órdenes cuya ruta ya no tiene confección. (162 avisos más de "módulo fijado" en órdenes con
  confección ya hecha se quitaron: no eran decisiones que calzaran mal; la regla quedó corregida en el código.)

**Sin fecha de entrega (5)**: las 4 WH de diciembre 2025 ya reportadas + una sin WH (proyecto OCTUBRE 2026, ODC
"PENDIENTE ODC", estilo 6098, 118 prendas, 0Diseño).

## 4 · Órdenes de trabajo (Orden_de_trabajo14-9-26_OPERACIONES)

27.370 filas, 3.990 órdenes en el archivo; **687 del sistema cruzan** (las sin WH no pueden cruzar); 1.194 centros
cerrados; 211 contradicciones fase vs OT; 1.737 OT esperando componentes en 391 órdenes; 5.779 filas de bodegas
ignoradas; 55 módulos reales tomados de la columna Operaciones. Sin centros ni estados desconocidos.

## 5 · Cuadre contra Odoo

Tus cifras por mes salen de **Proyecto (mes)**, no de la fecha de entrega. Con Proyecto y tu filtro (fase sin FAC, STAN
ni CAN), el archivo da:

| Proyecto | Archivo / sistema | Odoo (usuaria) |
|---|---|---|
| Agosto 2026 | 40 · 5.028 · $ 40.275 | 40 · 5.028 · $ 40.274,88 ✔ |
| Septiembre 2026 | 340 · 62.971 · $ 413.289 | 341 · 63.026 · $ 413.778,84 — falta **una orden de 55 prendas y $ 489,50** que está en tu consulta y no en el archivo exportado |
| Octubre 2026 | **352 · 133.661 · $ 5.361.860** ✔ | 352 · 133.661 · $ 5.361.859,88 |
| Noviembre 2026 | **239 · 138.432 · $ 543.921** ✔ | 239 · 138.432 · $ 543.920,98 |
| Diciembre 2026 | **175 · 69.106 · $ 315.763** ✔ | 175 · 69.106 · $ 315.762,82 |

Ojo: el Plan mensual agrupa por **fecha de entrega**; por fecha, octubre da 351 (la orden sin WH de 118 prendas no tiene
fecha y va a la bandeja). Si quieres el plan por Proyecto, es un cambio de base que hay que decidir.

## 6 · Carga por centro, septiembre, antes → después (minutos programados)

| Centro | Antes | Después | Por qué |
|---|---:|---:|---|
| Confección | 501.880 | 491.704 | cantidades actualizadas y centros cerrados por las OT nuevas |
| Corte | 12.359 | 11.363 | ídem |
| Estampado | 3.608 | 3.079 | ídem |
| Empaque | 21.711 | 21.908 | ídem |
| Botones | 23.262 | 23.260 | — |
| Etiquetas | 2.817 | 2.818 | — |
| Tejeduría (h) | 260 | 239 | tela ya tejida según OT / fases |

Las 492 órdenes sin WH no cargan nada (no se programan); sí cuentan en prendas y facturación del plan.
