# Carga de órdenes de trabajo de Odoo — reporte

Fecha: 2026-09-13, 18:01–18:02. Archivo `Orden_de_trabajo__mrp_workorder__23_.xlsx` (27.335 filas, 3.987 órdenes,
dic-2025 a sep-2026). Código: commit `e233978`. Ejecutado en producción en el orden pedido, sin parar, con captura de
carga entre cada paso y recarga final desde la nube:

1. **Apagar "secuencial"** en servicios, confección y maquila externa (tabla 5).
2. **Recargar la Parte 2** (691 órdenes: 101 historia, 132 vencidas, 4 sin fecha) para que las órdenes recuperen
   estampado y bordado en su ruta. Las 17 de 7Confección los recuperaron.
3. **Cargar las órdenes de trabajo**: 666 órdenes con información, 771 centros cerrados, 204 contradicciones.

Datos que quedaron guardados: tablas 6 y 7 con la siembra confirmada por ti; `o.ot` (estado por centro), `o.esperandoMaterial`,
`o.recursoFijo` (módulo real) y `S.avance[...].centros` en cada orden; `S.params.otCarga` con el reporte (Órdenes → "Reporte OT").

---

## 1 · Cruce de órdenes

| | Órdenes |
|---|---:|
| Órdenes del sistema (Parte 2) | 691 (mismo número que en todos los reportes: 101 historia + 590 abiertas) |
| **Cruzan con el archivo** | **666** |
| No cruzan (no tienen OT en el archivo) | 25 — son WH/MO/29251 a 29274 y 29277, todas en 8Empaque, las más nuevas del sistema: el export de OT parece anterior a su creación; para ellas sigue mandando solo la fase |
| Órdenes del archivo que no están en el sistema (cerradas o fuera del alcance de la Parte 2) | 3.320 |
| Órdenes con al menos un centro **terminado** | 305 |

## 2 · Lo que se leyó y lo que se ignoró

| | Filas |
|---|---:|
| Filas totales | 27.335 |
| Bodegas (baja de materiales, no producción) — **ignoradas y contadas** | **5.768** (BODEGA INSUMOS 3.218 · BODEGA MP 2.550) |
| Centros con fila en la tabla 6 pero **sin centro TEMPO** — reportados, no cargan | PULIDO 3.427 · SERVICIOS Y TERMINADOS 1.416 |
| Centro **no listado** en la tabla 6 — reportado, no asignado por parecido | **ETIQUETADO 16** |
| Estados no reconocidos | ninguno (los 6 valores estaban en la tabla 7) |
| Módulo real tomado de la columna Operaciones (filas MODULO 1 / PLANTA) | 55 |
| OT no terminadas con fecha final | 0 (las 2 del archivo son bodegas canceladas, ignoradas) |

De las OT que sí cruzan con órdenes del sistema y tienen centro: terminadas **819**, en proceso 89, para hacer 10,
esperando a otra orden de trabajo 426, **esperando componentes 1.448**.

## 3 · Contradicciones fase vs órdenes de trabajo: 204 (gana la OT)

Por tipo:

| Centro | La fase decía | La OT dice | Casos | Efecto |
|---|---|---|---:|---|
| Confección | hecho | **en proceso** | 50 | vuelve a pendiente; casi todas 5Maquila Conf / 5CD Maquila: la OT MAQUILA sigue en proceso → carga el recurso Maquila (externo), no los módulos |
| Confección | pendiente | **terminado** | 26 | queda hecho |
| Estampado | pendiente | **terminado** | 22 | queda hecho |
| Bordado | pendiente | **terminado** | 20 | queda hecho |
| Corte | pendiente | **terminado** | 8 | queda hecho |
| Empaque | pendiente | terminado | 1 | queda hecho |
| Empaque / Estampado / Corte / Confección / Bordado | hecho | **esperando componentes** | 50 | vuelve a pendiente (21 son Stand by: la fase dice "todo hecho" pero las OT nunca arrancaron) |
| Estampado / Confección / Bordado / Empaque / Corte | hecho | esperando a otra OT | 21 | vuelve a pendiente |
| Estampado / Empaque | hecho | para hacer / en proceso | 6 | vuelve a pendiente |

Por fase: 5Maquila Conf 49 · 6Bordado 28 · 5CD Maquila 23 · Stand by 21 · 7Pulido 14 · 5Maquila Recepción 8 ·
8Exportacion 7 · 4Corte Planta 6 · 8Empaque Terminado 5 · 8Lavanderia 4. Detalle completo (orden, fase, centro) en
Órdenes → Reporte OT. 127 órdenes cambiaron qué centros tienen por hechos al aplicar las OT.

## 4 · Carga por centro (minutos que programa el motor), tres momentos

S0 = antes de todo (secuencial en sí) · S2 = tras recargar la Parte 2 (inflado, esperado) · S3 = tras aplicar las OT.

| Centro | Sep S0 → S2 → S3 | Oct S0 → S2 → S3 | Nov S0 → S2 → S3 |
|---|---:|---:|---:|
| Confección | 523.437 → 524.231 → **475.898** | 104.743 → 103.948 → **88.128** | 7.838 → 7.838 → **2.693** |
| Corte | 12.027 → 12.027 → **10.837** | 0 | 0 |
| Estampado | 4.194 → 4.902 → **3.167** | 0 | 0 |
| Bordado | 0 → 0 → 0 (velocidad vacía) | 0 | 0 |
| Etiquetas | 992 → 1.406 → **1.406** | 0 | 0 |
| Botones | 22.817 → 22.817 → 22.817 | 406 | 0 |
| Empaque | 21.334 → 21.267 → **22.589** | 3.606 → 3.672 → **2.350** | 345 |

Lectura: apagar "secuencial" y recargar la Parte 2 subió estampado (+708) y etiquetas (+414) porque esas órdenes
recuperaron los pasos; las OT bajaron confección en 48 mil minutos en septiembre y 16 mil en octubre (confección
realmente terminada), corte en 1.190 y estampado en 1.735 (ya hecho según Odoo). Empaque sube un poco porque algunas
órdenes que la fase daba por empacadas tienen la OT de empaque sin arrancar. Tejeduría no cambia (90 corridas, 53
órdenes, 267 h): las OT no tocan textil. Liberación sin cambio: 408 tela / 293 corte.

## 5 · Órdenes con centros "esperando componentes" (información que no existía)

**418 órdenes abiertas, 143.390 prendas**, tienen al menos una OT en "Esperando componentes". Por centro: empaque 350,
corte 343, confección 334, bordado 215, estampado 163. Por fase: 0Adquisición 106, 1Tejeduria 60, 0Macro 37, 1CD
Tintoreria 25, 0Ord Compras 20, 3CD CORTE 20, 1Tintoreria 20, 6Bordado 16…

Ojo con la lectura: en Odoo, "Esperando componentes" es el estado de toda OT cuya orden todavía no tiene los materiales
consumidos, así que aparece en casi todas las órdenes que aún no han empezado producción (fases 0 y 1). Es bloqueo por
material real solo cuando la orden ya debería estar en ese centro; en las fases previas es simplemente "todavía no".
La lista por orden está en Órdenes → Reporte OT; cada orden guarda `esperandoMaterial` con los centros afectados.

## 6 · Lo que no está en el archivo, y por qué (aclaración tuya, incorporada al diseño)

- **Tejeduría** no trabaja por orden de producción: teje contra stock, por tipo de tela. Nunca tendrá OT. Sigue
  mandando la fase (y la pantalla de stock con anticipación).
- **Tintorería** sí trabaja con órdenes concretas (baño = órdenes + color + kilos), pero ese registro se lleva en el
  armado de baños del sistema, no en este archivo. Sigue mandando la fase y el armado de baños.
- Las OT solo mandan sobre los centros de la tabla 6: corte, estampado, etiquetas (serigrafía + ETIQUETADO), bordado,
  confección (módulos, MAQUILA, PLANTA), empaque; PULIDO y SERVICIOS Y TERMINADOS quedan reportados hasta que les
  asignes centro. La única conexión con textil: una OT de **corte terminado** marca la tela como lista (tramo
  secuencial).

## 7 · Decisiones pendientes tuyas

1. **ETIQUETADO como centro de trabajo** (16 filas): agregar fila en la tabla 6 → etiquetas, o dejarlo reportado.
2. **PULIDO (3.427 filas) y SERVICIOS Y TERMINADOS (1.416)**: no existen como centros. Si pulido cierra confección o
   servicios cierra botones/lavado/plancha, se asigna en la tabla 6; hoy no cargan ni cierran nada.
3. **SERIGRAFIA sin texto en Operaciones** (1.846 filas): quedaron como estampado por la fila por defecto; con la
   columna vacía no hay forma de saber si eran etiquetado.
4. Bordado sigue en 0 minutos hasta la ficha de velocidad.

---

## 8 · Ajuste de la tabla 6 (asignaciones de la usuaria) — 2026-09-13, 18:50

Aplicado en producción y verificado con recarga desde la nube. Se volvió a cargar el mismo archivo de OT (el archivo es
la verdad; reemplaza lo anterior): 666 órdenes, **1.003 centros cerrados** (antes 771), 216 contradicciones (antes 204).

| Centro de trabajo Odoo | Ahora | Cómo |
|---|---|---|
| ETIQUETADO (16 filas) | → etiquetas | 1 orden del sistema con etiquetas terminadas por esta vía |
| PULIDO (3.427 filas) | **cierra confección** (centro modulos), "solo cierra" | una OT de pulido terminada da la confección por hecha; una en proceso no reabre nada. **5 órdenes** cerraron confección por pulido |
| SERVICIOS Y TERMINADOS (1.416 filas) | **cierra plancha y botones** ("cierra también: botones", "solo cierra") | **116 órdenes** con plancha y botones terminados |

Columnas nuevas en la tabla 6: **cierra también** (una OT cierra varios centros) y **solo cierra** (solo la OT terminada
cuenta; en proceso / para hacer no reabren el centro). Ya no queda ningún centro de trabajo del archivo sin fila ni
sin centro.

**Recomendación sobre PULIDO** (pregunta de la usuaria): dejarlo **solo como cierre de confección**, sin crear centro
propio. Un centro sin tiempo estándar añadiría a cada ruta un paso de 0 minutos que no carga nada y que el motor
tendría que secuenciar; lo que aporta pulido es saber que la prenda ya salió de confección, y eso lo da el cierre. Si
algún día se quiere medir pulido, se crea con su minuto estándar y una fila propia en la tabla 6.

**Carga por centro antes → después de este ajuste (minutos, motor):** botones septiembre **22.817 → 21.759** (−1.058, las
116 órdenes con botones terminados por servicios); plancha 0 → 0 (sin minuto estándar); confección, corte, estampado,
etiquetas y empaque sin cambio (las 5 órdenes cerradas por pulido no tenían confección pendiente en el programa).

## 9 · Correcciones a este reporte

- **Stand by**: en la sección 3 dice "21 son Stand by" contando **centros**; son **7 órdenes** (tres centros por orden),
  las 7 en Stand by que hay en el sistema. Todas de **PRICE CLUB**, Estado OP `draft`, entrega mayo–junio 2026, y todas
  sus OT en "esperando componentes": la fase dice facturada y no hay rastro de producción (posible borrado de datos):

| Orden | Categoría | Prendas | Entrega |
|---|---|---:|---|
| WH/MO/27097 | CHOMPA / Capucha Cierre | 37 | 2026-05-21 |
| WH/MO/27129 | CHOMPA / Capucha Cierre | 21 | 2026-05-21 |
| WH/MO/27131 | CAMISETAS / Level 1 | 3 | 2026-05-21 |
| WH/MO/27160 | CAMISETAS / Level 1 | 68 | 2026-05-21 |
| WH/MO/27169 | JOGGER / Jogger | 9 | 2026-05-21 |
| WH/MO/27480 | POLOS / Polo Moda | 2 | 2026-06-05 |
| WH/MO/28076 | POLOS / Polo Basica | 15 | 2026-06-22 |

- **SERIGRAFIA sin texto en Operaciones (1.846 filas)**, hoy tratadas como estampado — impacto si fueran etiquetado (no
  se cambió): tocan 331 órdenes del sistema, 100 con esa OT terminada, 31 de ellas abiertas. 11 órdenes recuperarían el
  paso de estampado (**687 minutos** volverían a la carga) y 1 orden cerraría etiquetas (22 minutos). De las 31, 13
  traen técnica (probable estampado real) y 18 no (probable etiquetado). Con la columna vacía no hay forma de saberlo.
