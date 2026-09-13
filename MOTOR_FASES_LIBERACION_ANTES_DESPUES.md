# Cambio al motor: `faseEstado()` y `liberada()` leen de las tablas — antes y después

Fecha: 2026-09-13. Commit `68c3ad4`. 287/287 verificaciones en el simulador (incluye una prueba por cada caso que
pediste). El "antes" se capturó en producción con el código viejo aún desplegado y el "después" con el nuevo, sobre
las mismas 691 órdenes (583 abiertas), en la misma pestaña (`tempo-pcp`, Supabase `bypdfogmksbxjaiydhlg`).

**Único cambio de datos en producción:** al abrir la app con el código nuevo se sembró la tabla 5 (grupos con orden de
flujo y liberación) y se completó la tabla 1 con la columna "tela" (solo en filas que no la tenían) y la fila interna
`1Calidad Tintoreria`; lo guardé con `save()`. Nada más. No toqué capacidades, stock, lavado/plancha ni pantallas
pendientes.

---

## 1 · Diseño

**Tabla 5 (nueva, Configuración → Órdenes y materiales):** grupo · **orden de flujo** (número editable; ya no se
deduce del nombre ni del prefijo) · **libera tela** · **libera corte**. Sembrada: previo 1 · textil 2 · planificación 3
· preparación de corte 4 · corte 5 · maquila externa 6 · servicios 7 · confección 8 · terminados 9 · prenda terminada
10 · cerrada 11; "libera tela" desde textil, "libera corte" desde preparación de corte. Todo pendiente de validar.

**Tabla 1:** columna nueva **tela** (solo grupo textil): 1Tejeduria = —, 1CD Tintoreria = tejida, 1Tintoreria = tejida,
1INCOMPLETOS TIN = tejida, **1Calidad Tintoreria = tinturada** (fila añadida: es la fase que la propia app escribe al
marcar un baño listo; sin ella, aprobar calidad dejaría la orden "sin fila"). Siembra idempotente: solo se completó
donde no había dato.

**`faseEstado(fase)`** — sin ninguna regla por dígito ni por palabras (borradas):
- Sin fila en la tabla → nada hecho, no tejida, `sinFila:true`. Aparece en una **bandeja** al inicio de Órdenes ("fase
  que no calza con la tabla"). Hoy: 0 órdenes.
- `hechos` = centros cuya etapa (tabla 4) tiene orden **anterior** al grupo de la fase, o al grupo "carga desde" de la
  fila si lo tiene, más los centros de "excluye". Fila con "sin carga" → todos hechos.
- `tejida / tinturada / lista`: grupo posterior a textil → todo sí; grupo textil → columna "tela"; anterior → no.

**`liberada(orden, 'tela'|'corte')`** — firma humana (`o.lib`) **o** el grupo de la fase tiene marcado "libera
tela" / "libera corte". Sin fila → solo firma. La firma sigue siendo la compuerta para lo que aún no llegó a textil.
`pasosPendientes` (Parte 2) y los selectores usan el mismo orden de la tabla 5.

## 2 · Casos que pediste — verificados en producción

| Fase | Antes (código) | Después (tabla) |
|---|---|---|
| 8Lavanderia (4 órdenes) / 8Lavanderia Quito (2) | lavado **hecho** | lavado **pendiente**; corte, servicios, confección hechos |
| Stand by (7) | nada hecho, no tejida | todo hecho, tejida/tinturada/lista (grupo cerrada) |
| 5Maquila Conf (32) / 5CD Maquila (16) | módulos pendientes → cargaban confección interna | módulos hechos (excluidos): **no cargan** |
| 5Corte Maquila Ibarra (2) | nada hecho → cargaba corte | corte hecho: **no carga** |
| 4 Calidad Produccion (1) | por parecido ("4" y no "corte planta") → corte hecho | por tabla (grupo corte): tela lista, nada de producción hecho |
| 1INCOMPLETOS TIN (9) | por parecido ("1" sin "tejeduria") | por tabla: tejida, no tinturada |

## 3 · Liberación: qué cambia

| | Antes | Después |
|---|---:|---:|
| Liberadas a **tela** | 293 | **408** |
| Liberadas a **corte** | 264 | **279** |

- **De no liberada a liberada a tela: 115 órdenes** — exactamente 1Tejeduria (60), 1CD Tintoreria (25), 1Tintoreria
  (21), 1INCOMPLETOS TIN (9): las que Odoo ya tiene en textil. **Al revés: 0.**
- **De no liberada a liberada a corte: 15 órdenes, 6.040 prendas** — 3Trazos (9) y 3AEROPUERTO (6). **Al revés: 0.**
  → **Movimiento a revisar:** con el código viejo solo 3CD CORTE contaba como liberada a corte (por el texto "cd corte");
  ahora todo el grupo "preparación de corte" lo está, porque el flag es por grupo. Si Trazos y Aeropuerto no deben
  contar como liberadas a producción, la solución está en la tabla: mover esas dos fases a "planificación" o crear un
  grupo "preparación de corte" sin "libera corte" y otro para 3CD CORTE con él. No lo ajusté.

Bloqueos del motor: antes 290 "sin liberar" / 293 ok; después **175 "sin liberar", 100 "baño pendiente de decisión",
15 "tela pendiente"**, 293 ok. Los 175 que siguen sin liberar son fase 0 (previo a producción) y esperan la firma.

## 4 · Centros dados por hechos: 189 órdenes cambian

| Fase | Órdenes | Prendas | Antes → Después | Esperado |
|---|---:|---:|---|---|
| 5Maquila Conf | 32 | | bordado, corte, estampado → corte, **modulos** | sí (no carga módulos) |
| 5CD Maquila | 16 | | corte → corte, **modulos** | sí |
| 5Corte Maquila Ibarra | 2 | | nada → **corte** | sí |
| 5Maquila Recepción | 6 | | + etiquetas | sí (carga solo terminados) |
| 8Lavanderia / Quito | 6 | 1.911 | **− lavado**, + etiquetas | sí |
| 8Empaque / 8Servicios y Terminados / 8Botones | 47 | 4.806 | **− lavado**, + etiquetas | sí (lavado en terminados, pendiente) |
| 7Confección | 24 | 6.371 | + etiquetas | ver nota A |
| **7Pulido** | 8 | 1.438 | **− modulos** (antes confección hecha) | **NO esperado — ver nota B** |
| **4CD Ensamble** | 27 | 7.369 | **− corte** (antes corte hecho) | **NO esperado — ver nota C** |
| **4Preparacion Insumos** | 20 | 4.237 | **− corte** | **NO esperado — ver nota C** |
| 4 Calidad Produccion | 1 | 224 | − corte | por tabla (grupo corte) |

**Nota A — etiquetas.** La tabla 4 pone etiquetas en "servicios" (antes de confección), así que 7Confección la da por
hecha; pero `RUTA_ORDEN` (línea 619) ordena etiquetas **después** de confección. Si etiquetas va después de coser,
hay que cambiar su etapa a "terminados" en la tabla 4. Hoy afecta 992 min en septiembre (mismo valor antes y después
porque esas órdenes están en fases anteriores). No lo ajusté.

**Nota B — 7Pulido.** El código viejo daba la confección por hecha en Pulido ("pulido" = confeccionada). En tu tabla
7Pulido está en el grupo "confección", no es cola, así que la regla la trata como confección en curso y **vuelve a
cargar módulos** para 8 órdenes / 1.438 prendas. Si pulido es posterior a coser, la fila debería llevar "carga desde:
terminados" (o un grupo propio). No lo ajusté.

**Nota C — 4CD Ensamble y 4Preparacion Insumos.** Es el movimiento más grande: **47 órdenes, 11.606 prendas, vuelven a
cargar corte** (corte pasa de 12.640 a 20.709 min en septiembre). El código viejo daba corte por hecho en toda fase 4
salvo "Corte Planta"/"Incompletos". En tu tabla las tres están en el grupo "corte", y "es cola" (4CD Ensamble) hoy
solo dice que el siguiente centro no empezó; no dice que el propio ya terminó. Físicamente "CD Ensamble" y
"Preparación Insumos" están después del corte. Dos formas de resolverlo en la tabla, sin código: poner "carga desde:
servicios" en esas dos filas, o moverlas a un grupo "post-corte". También podría definirse que "es cola" implique
"el grupo propio ya está hecho", pero eso rompería 6 CD BORDADO / 6 CD SERIGRAFIA (cola *para entrar* a bordado, no
bordado hecho), así que no lo hice. Decisión tuya.

## 5 · Carga por centro (minutos que el motor programa, sep/oct/nov)

| Centro | Sep antes → después | Oct antes → después | Nov antes → después |
|---|---:|---:|---:|
| Confección (modulos) | 523.437 → 524.231 | 104.743 → 122.165 | 7.838 → 9.476 |
| Botones | 21.751 → 22.817 | 406 → 406 | 0 → 0 |
| Empaque | 21.334 → 20.581 | 3.606 → 4.358 | 345 → 345 |
| Corte | 12.640 → **20.709** | 0 → 0 | 0 → 0 |
| Estampado | 3.833 → 4.194 | 992 → 992 | 0 → 0 |
| Etiquetas | 992 → 992 | 0 → 0 | 0 → 0 |
| Bordado | 0 → 0 | 0 → 0 | 0 → 0 |
| Lavado / Plancha | 0 → 0 | 0 → 0 | 0 → 0 |

Lecturas: (1) el motor programa lo antes posible, por eso casi todo cae en septiembre; esto no es la tabla del Bloque K
(que reparte por mes de entrega), es lo que el programador coloca. (2) Corte sube 8.069 min por la nota C. (3)
Confección casi no se mueve en septiembre: lo que dejan de cargar 5Maquila Conf/5CD Maquila (48 órdenes) lo compensa
lo que entra por 7Pulido y por las 115 órdenes recién liberadas cuya tela ahora sí avanza; octubre sube 17 mil min
por lo mismo. (4) Bordado sigue en 0 en los dos escenarios porque la velocidad está vacía (paso anterior). (5)
Lavado/plancha en 0 en ambos: sin minuto estándar ni marcas de categoría (fuera de alcance).

## 6 · Tejeduría y tintorería

| | Antes | Después |
|---|---:|---:|
| Tejeduría: corridas programadas / órdenes / horas | 0 / 0 / 0 | **90 / 53 / 267 h** |
| Tintorería: órdenes en "Armar baños" / kg por armar | 0 / 0 | **100 / 6.784 kg** (70 grupos) |
| Baños confirmados que consumen máquina | 0 | 0 (siguen exigiendo confirmación manual — B12 de la auditoría) |
| Órdenes con kg por tejer (`kgPendiente`, liberadas o no) | — | 181 órdenes / 19.622 kg |

Las 60 de 1Tejeduria ahora sí se tejen (53 llegan a corrida; las otras 7 tienen telas SIN CLASIFICAR o sin kg y no
tienen paso de tejeduría). Las 25 de 1CD Tintoreria y las 21 de 1Tintoreria entran a "Armar baños" como tela tejida
pendiente de baño. Con esto la pantalla "Stock de tela cruda" deja de salir vacía.

## 7 · Fuera del alcance (no tocado, para que conste)

- `estadoTin()` (línea ~2334) sigue decidiendo "stock" / "incompleto" / "en máquina" por palabras en la fase (B31 de la
  auditoría); alimenta el panel "Estado de tintorería" y los kg de incompletos.
- `faseNum` sigue usado en Panorama, Gerencia (pesoFase), Familias, terminadaF y la agrupación de fases de los
  selectores (C11/A46/A47 de la auditoría).
- Capacidades, descuento de stock en tejeduría, lavado/plancha, pantallas pendientes de la Parte 1.
