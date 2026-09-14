# Asignación por orden (Carga general) — reporte

Fecha: 14-sep-2026. Commit `13048cb`, versión 2026-09-14 15:52, pruebas 621/621 (12 nuevas). No se tocó el motor:
la pantalla solo lee el programa.

## 1 · Separada por estado, lo que necesita atención arriba

| Bloque | Hoy | Prendas | Qué muestra |
|---|---:|---:|---|
| **Vencidas hace más de 30 días con un solo paso pendiente** | **8** | 1.245 | aparte, arriba, con el paso que falta y "¿entregada y mal cerrada en Odoo?" |
| **Sin programar** | 774 | 333.786 | por qué: sin WH 493 · sin liberar 177 · baño pendiente de decisión 83 · tela pendiente 17 · sin fecha de entrega 4 |
| **No llegan** | 179 | 25.696 | días tarde y en qué paso se atascan: por su colección 82 · esperar la tela 47 · confección 18 · sin paso identificado 32 (*) |
| **Llegan justo** | 148 | 41.188 | holgura dentro del colchón |
| **Llegan bien** | 45 | 7.962 | plegado por defecto |

Total 1.154 órdenes abiertas. Cada bloque con conteo y prendas; los que están vacíos no se muestran.

(*) Las 32 "sin paso identificado" van tarde pero el motor no las marcó como "no cabe": son órdenes sin nada pendiente
en planta con la meta ya pasada (atraso real, no de programación) o programadas hacia adelante por el motor de siempre.

**Colchón**: no existía. Es un parámetro visible en la misma pantalla (`Colchón (días)`), sembrado en **3** y marcado
"est." hasta que lo edites; cambiarlo queda en bitácora. "Llega justo" = termina dentro de esos días antes de la meta.

## 2 · La columna de ruta

Una sola ficha por fila: **próximo paso · recurso · termina**, más la columna **Termina todo**. El detalle completo
(paso, recurso, inicio, fin, límite para llegar, minutos, estado por paso, tela lista, colección, fecha posible) se abre
al hacer clic en la orden.

## 3 · Agrupar y filtrar

Como en Entregas y Avance: agrupar anidado hasta tres niveles por **cliente, ODC, familia, categoría, próximo paso
(centro) y mes de entrega**, con conteo y prendas por grupo; filtros por cliente, próximo paso y mes; buscador (WH,
estilo, cliente, ODC) que no pierde el foco. La agrupación se recuerda en el navegador.

## 4 · Foto

Miniatura de la prenda al lado de la OP en cada fila (clic = ampliar), como en las colas.

## 5 · Vencidas hace más de 30 días con un solo paso pendiente (para revisar)

| Orden | Cliente | Entrega | Días vencida | Único paso pendiente | Fase en Odoo | Prendas |
|---|---|---|---:|---|---|---:|
| WH/MO/27118 | Price Club | 08-may-2026 | 129 | Etiquetas | 8Embodegado | 46 |
| WH/MO/27435 | Comercializadora de Ropa Fashion Club | 20-may-2026 | 117 | Etiquetas | 8Embodegado | 171 |
| WH/MO/26941 | Comercializadora de Ropa Fashion Club | 01-jun-2026 | 105 | Etiquetas | 8Embodegado | 270 |
| WH/MO/27721 | JL Fashion Club Colombia | 20-jul-2026 | 56 | Empaque | 7Confección | 48 |
| WH/MO/27803 | Comercializadora de Ropa Fashion Club | 03-ago-2026 | 42 | Etiquetas | 8Embodegado | 414 |
| WH/MO/28042 | Comercializadora de Ropa Fashion Club | 03-ago-2026 | 42 | Empaque | 8Lavanderia | 232 |
| WH/MO/28027 | JL Fashion Club Colombia | 14-ago-2026 | 31 | Estampado | 1CD Tintoreria | 32 |
| WH/MO/28028 | JL Fashion Club Colombia | 14-ago-2026 | 31 | Estampado | 1CD Tintoreria | 32 |

Las cinco en **8Embodegado** con solo Etiquetas pendiente (27118, 27435, 26941, 27803) y 28042 (8Lavandería) encajan con
tu sospecha: ya entregadas y mal cerradas en Odoo. **28027 y 28028 son distintas**: fase 1CD Tintorería (la tela ni
siquiera está tinturada) y el único paso que les queda en planta es Estampado — no huele a "entregada"; huele a ruta
incompleta o a orden abandonada. Revísalas aparte.

## Código
`clasificarAsig`, `pasosPendPro`, `pasoProximoDe`, `mDetalleAsig`, `arbolAPO`/`filasArbolAPO`/`claveAPO`, estado
`APO`, `asignacionPorOrdenHTML` (reemplaza el panel viejo de fichas repetidas en `vPro`); parámetro
`S.params.colchonDias` (+`colchonEstimado`), `setColchon`.
