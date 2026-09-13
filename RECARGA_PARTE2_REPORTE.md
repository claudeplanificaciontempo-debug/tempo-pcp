# RECARGA — PARTE 2: órdenes y materiales — Reporte final (BLOQUE K)

Fecha de carga: 2026-09-13 (hoy = 2026-09-13). Archivo `Tarea__project_task__95_.xlsx`, hoja Sheet1: 65.001 filas de
datos, 22 columnas, 3.733 cabeceras, 61.268 filas sin "Orden de producción" (64.499 líneas de componente en total,
porque la fila de cabecera también trae su primer componente).

Ejecutado contra producción (Supabase `bypdfogmksbxjaiydhlg`) subiendo el Excel por la pantalla nueva
Órdenes → "Recarga Parte 2 (tareas)". Verificado con recarga real desde la nube: **691 órdenes guardadas, las 691 con
sus materiales**. Código: commit `05f7206`. Se reemplazaron las 0 órdenes que había (la Parte 1 dejó la tabla vacía).
**No se tocó `programar()` ni las capacidades.** Todo el reporte de abajo se calculó desde las tablas editables y las
órdenes cargadas, no desde el motor.

Todo lo de la carga vive también en la app: Órdenes → "Reporte Parte 2" (mismas tablas), y los detalles quedaron en
`S.params.tareaCarga`.

---

## 1 · Alcance: cargadas y excluidas por motivo (BLOQUE C)

| Resultado | Órdenes |
|---|---:|
| Cabeceras en el archivo | 3.733 |
| **Cargadas** | **691** |
| · de ellas, Estado OP = done con entrega futura → **historia** (sin carga, sin demanda) | 101 |
| · de ellas, entrega vencida y Estado OP abierto → **carga vencida** contra septiembre | 132 |
| Excluidas: Estado OP = cancel | 2 |
| Excluidas: entrega pasada y NO abiertas (done 1.996 + sin Estado OP 1.004) | 3.036 |
| Bandeja "órdenes sin fecha" (no cargadas, no se inventó fecha) | 4 |

Suma: 691 + 2 + 3.036 + 4 = 3.733.

**Estado OP vacío (1.004 órdenes)**: tu regla no dice nada de él. Todas tienen entrega pasada, así que quedaron fuera
de rango por la regla (b) sin que hiciera falta decidir; las dejo anotadas porque si alguna vez aparece una con
entrega futura, entra por la regla (a) sin estado. Ninguna en este archivo.

**Órdenes sin fecha (4)** — todas done, fase 8Embodegado, POLOS / Polo Basica: WH/MO/23498 (14), WH/MO/23499 (82),
WH/MO/23503 (24), WH/MO/23505 (24 prendas).

## 2 · Números de orden duplicados (para decisión, no fusionados)

Son **3 números en 7 filas** (tú esperabas 4 duplicados; en el archivo hay 3 números repetidos). Todas están fuera de
rango (entrega pasada, done o sin estado), así que hoy ninguna se cargó; si se cargaran, irían como órdenes separadas.

| Orden | Fila | Estado OP | Fase | Prendas | Entrega | Total $ |
|---|---:|---|---|---:|---|---:|
| WH/MO/25112 | 72 | done | Facturado | 85 | 2026-07-01 | 765 |
| WH/MO/25112 | 94 | done | Facturado | 84 | 2026-08-19 | 756 |
| WH/MO/25112 | 2925 | (vacío) | Facturado | 334 | 2026-04-30 | 3.006 |
| WH/MO/25347 | 116 | done | Facturado | 85 | 2026-07-08 | 765 |
| WH/MO/25347 | 2860 | (vacío) | Facturado | 335 | 2026-04-29 | 3.015 |
| WH/MO/24121 | 18025 | done | Facturado | 24 | 2026-01-26 | 163 |
| WH/MO/24121 | 19551 | done | Facturado | 482 | 2026-01-26 | 3.278 |

Los dos primeros parecen una orden partida (mismo cliente Almacenes De Prati, Hoodies, cantidades parecidas en fechas
distintas, con una fila "vieja" de 334/335 prendas sin estado). El tercero tiene la misma fecha y cantidades 24 y 482:
más parece export duplicado con cantidad corregida. Decisión tuya.

## 3 · Conteo por cada valor de Fase del archivo (todo el archivo, 3.733 órdenes)

El archivo trae **40 valores distintos** (no 42). La tabla tiene 43 filas (tu lista del BLOQUE A suma 43, no 42).
**Ninguna fase del archivo quedó sin calzar.** Filas de la tabla que NO aparecen en el archivo: **0Diseño, 0Recetas
Insumos, 6 CD SERIGRAFIA** (por eso no puedo confirmar el texto exacto de "6 CD SERIGRAFIA" contra el archivo: hoy no
tiene órdenes; la comparación es tolerante a espacios, mayúsculas y tildes, así que "6CD Serigrafía" también calzaría).

| Fase | Órdenes | Prendas | Grupo |
|---|---:|---:|---|
| Facturado | 2.605 | 592.585 | cerrada |
| Stand by | 468 | 87.423 | cerrada |
| 0Adquisición | 106 | 66.149 | previo a producción |
| 1Tejeduria | 60 | 14.572 | textil |
| 0Macro | 37 | 8.818 | previo a producción |
| 8Novedades | 33 | 6.004 | prenda terminada |
| 5Maquila Conf | 32 | 4.223 | maquila externa |
| 8Empaque | 29 | 1.152 | terminados |
| 4CD Ensamble | 27 | 7.369 | corte |
| 8Exportacion | 26 | 3.104 | prenda terminada |
| 3CD CORTE | 25 | 5.270 | preparación de corte |
| 1CD Tintoreria | 25 | 6.813 | textil |
| 7Confección | 24 | 6.371 | confección |
| 1Tintoreria | 21 | 6.839 | textil |
| 4Preparacion Insumos | 21 | 4.279 | corte |
| 0Ord Compras | 20 | 3.679 | previo a producción |
| 6Bordado | 17 | 3.775 | servicios |
| 5CD Maquila | 16 | 2.930 | maquila externa |
| 8Servicios y Terminados | 15 | 2.647 | terminados |
| 2Planificacion | 14 | 3.416 | planificación |
| 0Reproceso diseño | 12 | 2.761 | previo a producción |
| 8Embodegado | 11 | 1.555 | prenda terminada |
| 8Centro Distribucion | 10 | 970 | prenda terminada |
| 3Trazos | 9 | 3.646 | preparación de corte |
| 1INCOMPLETOS TIN | 9 | 4.133 | textil (bloqueo) |
| 7Pulido | 8 | 1.438 | confección |
| 4Corte Planta | 8 | 3.380 | corte |
| 8Cross | 7 | 794 | prenda terminada |
| 3AEROPUERTO | 6 | 2.394 | preparación de corte |
| 5Maquila Recepción | 6 | 1.067 | maquila externa |
| 8Lavanderia | 4 | 1.151 | terminados |
| 6 CD BORDADO | 4 | 1.290 | servicios |
| 6 Etiquetado | 4 | 1.394 | servicios |
| 8Botones | 3 | 1.007 | terminados |
| 6Serigrafia | 3 | 295 | servicios |
| 8Lavanderia Quito | 2 | 760 | terminados |
| 8Empaque Terminado | 2 | 180 | prenda terminada |
| 5Corte Maquila Ibarra | 2 | 733 | maquila externa |
| 4Incompletos | 1 | 265 | corte (bloqueo) |
| 4 Calidad Produccion | 1 | 224 | corte |

## 4 · Órdenes por Estado OP (todo el archivo)

done 2.137 · (vacío) 1.004 · draft 347 · progress 239 · cancel 2 · confirmed 2 · to_close 2.
De las 691 cargadas: 101 done (historia) y 590 abiertas: draft 347, progress 239, to_close 2, confirmed 2.

## 5 · Órdenes atrasadas abiertas (carga vencida, BLOQUE C-b)

**132 órdenes, 20.793 prendas, 209.281 minutos pendientes**, cargados contra septiembre. A qué centros cargan
(minutos, solo lo pendiente por fase):

| Centro | Minutos |
|---|---:|
| Confección (modulos) | 173.402 |
| Botones | 13.076 |
| Empaque | 7.906 |
| Bordado | 6.724 |
| Corte | 6.079 |
| Estampado | 1.159 |
| Etiquetas | 935 |

## 6 · Grupos sin carga: cuánto del archivo es historia

De las 691 cargadas, 120 están en grupos que cuentan como demanda y facturación pero cero minutos:

| Grupo | Órdenes | Prendas |
|---|---:|---:|
| cerrada (Facturado 55 done + Stand by 7) | 62 | 23.049 |
| prenda terminada (Novedades 19, Exportacion 15, Distribución 7, Embodegado 2, Cross 2, done casi todas) | 58 | 8.573 |

Y en el archivo entero, el 82 % de las cabeceras (3.073 de 3.733) están en Facturado o Stand by: la mayor parte es
historia.

## 7 · Órdenes por mes de entrega (las 691 cargadas, incluye historia)

| Mes | Órdenes | Prendas | Facturación (Total $) |
|---|---:|---:|---:|
| Septiembre 2026 | 383 | 83.779 | 512.986 |
| Octubre 2026 | 167 | 52.039 | 315.060 |
| Noviembre 2026 | 104 | 66.146 | 331.832 |
| Diciembre 2026 | 4 | 815 | 5.929 |

Las 132 vencidas tienen entrega anterior a hoy (conservan su fecha original) y no están en estas filas; para la carga
por centro se suman a septiembre.

## 8 · Órdenes cuya categoría no tiene operaciones (respuesta a tu pregunta)

**51 órdenes abiertas, 8.241 prendas** (54 si se cuentan las 3 done). Las 10 categorías afectadas **existen todas en el
catálogo y son exactamente parte de las 14 hijas sin operaciones** de la Parte 1 — ninguna categoría del archivo faltó
en el catálogo (las 50 combinaciones padre/hija calzan):

| Categoría | Órdenes | Prendas |
|---|---:|---:|
| TEJIDOS / Camiseta Tejida | 11 | 3.028 |
| Fleece Pesado / Crew Moda | 8 | 1.301 |
| Fleece Pesado / Crew Zip | 7 | 1.105 |
| JOGGER / Jogger Moda | 6 | 707 |
| Fleece Basico / Crew | 6 | 542 |
| FALDAS / Faldas | 5 | 290 |
| JOGGER / Jogger | 5 | 401 |
| TEJIDOS / Henley Tejida | 4 | 804 |
| ENTERIZO / Enterizo | 1 | 254 |
| TEJIDOS / Polo Tejida | 1 | 4 |

Las otras 4 de las 14 (Accesorios, Chalecos, JUMPER, Hoodie Tejido) no tienen órdenes en el alcance. Estas 51 órdenes
cargan **0 minutos** en corte/confección/empaque (no se asume nada, tal como pediste) — en la tabla del punto 12 esos
minutos faltan. Jogger y Fleece son los que más pesan: 6 categorías con 4.300 prendas.

## 9 · Tela: origen y SIN CLASIFICAR (BLOQUES H/I)

Origen resuelto para las 590 abiertas: PROPIA 417 · EXTERNA 15 · EXTERNA TEÑIDA 1 · **SIN CLASIFICAR 18** · sin tela
en kg 139 (solo Uds/m, o sin línea MP: no van a tejeduría ni tintorería, se reportan).

Bandeja "origen de tela sin definir" (tipos de tercer nivel SIN CLASIFICAR con órdenes abiertas): **LYCRA 19 órdenes,
JERSEY 3, RIB 3** (algunas órdenes tienen dos). Ningún tercer nivel de MP quedó fuera de la tabla (los 24 del archivo
son los 24 sembrados). Excepción de cuarto nivel aplicada: hay líneas NUEVOS TEMPO / SERVICIO TINTURADO y
NUEVOS TEMPO / TELA IMPORTADA TINTURADA clasificadas EXTERNA TEÑIDA.

**Para tu decisión** — dentro de NUEVOS TEMPO hay otros cuartos niveles que por nombre tampoco parecen tejerse y hoy
quedan PROPIA por la regla del tercer nivel (no los cambié): TELA TINTURADA (EXTERNA) 39 líneas, SERVICIO LAVADO 22,
TERMOFIJADO EXTERNO 19, SERVICIO MATIZADO 8, TINTURADAS CHINA SEGUNDA (FALLA) 4, y las "… SEGUNDA (FALLA)" /
"FALLAS TEMPO (TERCERAS)". Si alguno debe ser EXTERNA TEÑIDA, se agrega en la tabla de excepciones de cuarto nivel.

## 10 · Estampado y bordado por orden

De las 590 abiertas: **69 con técnica** (estampado) y **340 con puntadas > 0** (bordado). Todas las técnicas del
archivo existen en el catálogo (0 no encontradas). Los 340 pasos de bordado llevan sus puntadas por prenda; el
**centro Bordado no tiene velocidad configurada** ("Puntadas/min" vacío), así que las 340 quedan marcadas "sin
velocidad de bordado configurada" y para los minutos de abajo el motor usa su valor por defecto (600 puntadas/min,
`S.params.puntadasMin`, sembrado en el código original — ver nota 14.3).

## 11 · Materiales: segundos niveles no reconocidos (todo el archivo)

MERCADERIAS 14 líneas · GASTOS MAQUILA ESTAMPADO 2 líneas · vacío (ruta de un solo nivel "All") 166 líneas. No se
clasificaron; quedan con clasificación vacía en el detalle de la orden.

Contradicciones Estado OP vs Fase (8, bandeja aparte, cargadas con su fase): WH/MO/28598 done en 4Preparacion
Insumos; y 7 órdenes Stand by con Estado OP draft (WH/MO/28076, 27480, 27129, 27131, 27160, 27169, 27097).
Bloqueadas por material (1INCOMPLETOS TIN / 4Incompletos): 10. Devoluciones (fase 0/1 con progress): 3. En colas
"CD": 97.

## 12 · CARGA POR CENTRO — septiembre, octubre, noviembre (minutos vs capacidad)

Capacidad = recursos activos del centro × su capacidad diaria × días laborables del recurso en el mes (calendario y
excepciones actuales de Configuración). Minutos = prendas × tiempo estándar por prenda de la categoría (convertido con
`minPrenda` del motor). Vencidas en septiembre. Historia (done) excluida. **"Pendiente" = solo los centros que faltan
según la fase (BLOQUE E); "Completa" = ruta entera de cada orden.**

### 12a · Solo lo PENDIENTE según la fase — la tabla que pediste

| Centro | Sep min | Sep cap | Uso | Oct min | Oct cap | Uso | Nov min | Nov cap | Uso |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Confección (modulos) | 601.217 | 1.241.760 | 48 % | 686.801 | 1.289.520 | 53 % | 958.384 | 1.194.000 | 80 % |
| · sin el recurso "Maquila (externa)" | 601.217 | 1.029.600 | **58 %** | 686.801 | 1.069.200 | **64 %** | 958.384 | 990.000 | **97 %** |
| Botones | 36.074 | 31.824 | **113 %** | 20.888 | 33.048 | 63 % | 31.144 | 30.600 | **102 %** |
| Empaque | 21.783 | 53.040 | 41 % | 19.440 | 55.080 | 35 % | 25.587 | 51.000 | 50 % |
| Bordado | 19.120 | 110.448 | 17 % | 6.194 | 114.696 | 5 % | 12.743 | 106.200 | 12 % |
| Corte | 17.572 | 106.080 | 17 % | 30.072 | 110.160 | 27 % | 35.751 | 102.000 | 35 % |
| Estampado | 2.474 | 95.472 | 3 % | 1.446 | 99.144 | 1 % | 0 | 91.800 | 0 % |
| Etiquetas | 973 | 21.216 | 5 % | 1.351 | 22.032 | 6 % | 0 | 20.400 | 0 % |
| Lavado | 0 | 10.608 | — | 0 | 11.016 | — | 0 | 10.200 | — |
| Plancha | 0 | 29.952 | — | 0 | 31.104 | — | 0 | 28.800 | — |

### 12b · Ruta COMPLETA de cada orden (como si nada estuviera hecho)

| Centro | Sep min | Uso | Oct min | Uso | Nov min | Uso |
|---|---:|---:|---:|---:|---:|---:|
| Confección (modulos) | 798.997 | 64 % (78 % sin maquila) | 714.894 | 55 % (67 %) | 958.384 | 80 % (97 %) |
| Botones | 36.958 | 116 % | 20.888 | 63 % | 31.144 | 102 % |
| Empaque | 22.235 | 42 % | 19.440 | 35 % | 25.587 | 50 % |
| Bordado | 23.036 | 21 % | 6.388 | 6 % | 12.743 | 12 % |
| Corte | 36.913 | 35 % | 31.970 | 29 % | 35.751 | 35 % |
| Estampado | 3.190 | 3 % | 1.446 | 1 % | 0 | 0 % |
| Etiquetas | 1.213 | 6 % | 1.541 | 7 % | 0 | 0 % |

**Diferencia**: contar solo lo pendiente quita 198 mil minutos de confección en septiembre (798.997 → 601.217) y
19 mil de corte (36.913 → 17.572): es el trabajo de órdenes que ya están en confección, terminados o más allá. En
noviembre no hay diferencia porque todo lo de noviembre está todavía en fase 0/1.

### 12c · Tejeduría y tintorería en kg (BLOQUE J, sin convertir a minutos)

| Mes | kg tejeduría pendiente (órdenes) | kg tintorería pendiente (órdenes) | kg tej. ruta completa | kg tin. ruta completa |
|---|---:|---:|---:|---:|
| Septiembre | 3.386 (60) | 3.397 (62) | 12.798 (214) | 12.834 (220) |
| Octubre | 6.768 (88) | 6.772 (91) | 9.159 (111) | 9.188 (120) |
| Noviembre | 13.683 (84) | 13.683 (84) | 13.863 (89) | 13.863 (89) |

Contra la capacidad de tintorería configurada (DANITECH 240 kg/baño, 200 en piqué; STUART 45 kg): noviembre son ~57
baños grandes llenos. No calculé % de uso en textil porque la capacidad de tejeduría/tintorería está en horas-máquina
y depende de la tela y del armado de baños, que es lo que hace el motor; convertirlo aquí sería inventar un factor.

## 13 · Lo que estas cifras NO incluyen (para leerlas bien)

1. **Lavado y plancha = 0** en todos los meses porque (a) ninguna categoría tiene todavía marcada "lleva lavado/plancha
   por defecto" (los valores iniciales del PASO 7 de la Parte 1 — SHORT PLANOS, PANTALONES PLANOS, DENIM, CAMISAS
   lavado; CAMISAS plancha — nunca se aplicaron a los datos), y (b) el minuto estándar por prenda de esos centros está
   vacío. Con ambos configurados, la carga aparece sola al recargar.
2. **51 órdenes (8.241 prendas) sin operaciones** cargan 0 minutos (punto 8).
3. **Bordado** con 600 puntadas/min por defecto del código original, no un valor tuyo.
4. **Estampado**: 69 órdenes con técnica; 50 tienen tiempo (su categoría trae operación de estampado en la hoja LMO)
   y **19 quedaron con tiempo 0** porque su categoría no la tiene (solo CAMISETA, HODDIE, CHOMPA, BOMBER, BODY, SHORT
   FLEECE, BVD y PANTALON PLANO tienen operación de estampar). Se reportan como "sin tiempo estándar"; no se les
   asignó tiempo. Es el único centro con pasos sin tiempo entre las abiertas.
5. Las 132 vencidas se cargan completas contra septiembre aunque parte de su trabajo pueda estar en curso.

## 14 · Reglas que siguen en código y decisiones pendientes tuyas

1. **`faseEstado()` (línea ~694)** decide en código qué centros "ya pasaron" según el texto de la fase, y la usa el
   motor y las pantallas de piso. Contradice tu tabla en: 5Maquila Conf / 5CD Maquila (cargaría módulos), 5Corte Maquila
   Ibarra (cargaría corte), 8Lavanderia (da lavado por hecho), Stand by (como si nada estuviera hecho). Las órdenes
   cargadas llevan `ruta` = solo lo pendiente por tu tabla, así que el motor no puede cargar lo que la tabla quitó; pero
   donde la tabla deja un paso y `faseEstado` lo da por hecho (lavado en fase 8), el motor no lo carga. Este reporte no
   usa `faseEstado`. **Propuesta**: que `faseEstado` lea de la tabla del BLOQUE A + tabla 4. Es tocar el motor; espero
   tu autorización.
2. **`MAPA_TELA`** (mapa nombre de tela → tela del catálogo, para que tejeduría/tintorería sepan qué tela es) sigue
   fijo en código, heredado del importador Odoo anterior. Lo reutilicé tal cual; no estaba en los bloques.
3. **`S.params.puntadasMin = 600`** y `r.ppm` por bordadora: velocidad de bordado sembrada en el código original. Ahora
   "Puntadas/min" del centro Bordado y ese parámetro son una sola fuente (al editar uno se actualiza el otro), pero el
   600 inicial no lo puse yo y sigue ahí hasta que lo cambies.
4. Cuartos niveles sospechosos dentro de NUEVOS TEMPO (punto 9) y los 3 tipos SIN CLASIFICAR con órdenes (LYCRA,
   JERSEY, RIB).
5. Las 3 órdenes duplicadas (punto 2) y el Estado OP vacío (punto 1).

## 15 · Lo que NO se hizo (a propósito)

- No se construyeron las pantallas pendientes de la Parte 1 (pasos 8, 9, 10 y 11): las bandejas (sin fecha, origen
  sin definir, contradicciones, sin velocidad de bordado) solo se ven en Órdenes → "Reporte Parte 2".
- No se tocó `programar()` ni capacidades. No se modificó `faseEstado()`.
- El fixture de prueba con el archivo real (`test/fixtures/tarea_rows.json`) quedó **fuera del repo** (`.gitignore`):
  tiene clientes y facturación y el repo se publica en GitHub Pages.

---
*Generado desde los datos reales cargados en producción el 2026-09-13. 235/235 verificaciones automáticas del
simulador local con el mismo archivo.*
