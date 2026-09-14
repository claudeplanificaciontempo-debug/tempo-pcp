# Plan mensual: la fase decide, prenda terminada, cuadre contra Odoo, plana — reporte

Fecha: 2026-09-14. Commits `95a994b` → `7bf7f08`. Pruebas locales: 466/466. Producción guardada 09:58 y 10:23.

## 1 · Órdenes sin fecha de entrega (bandeja, para corregir en Odoo)

| WH | Cliente | ODC | Estilo | Categoría | Color | Cantidad | Fase | Estado OP | Proyecto |
|---|---|---|---|---|---|---:|---|---|---|
| WH/MO/23498 | Comercializadora de Ropa Fashion Club | POLOS-AVIÓN | ESMA | POLOS / Polo Basica | CADET NAVY | 14 | 8Embodegado | done | DICIEMBRE 2025 |
| WH/MO/23499 | Comercializadora de Ropa Fashion Club | POLOS-AVIÓN | ESMA | POLOS / Polo Basica | CADET NAVY | 82 | 8Embodegado | done | DICIEMBRE 2025 |
| WH/MO/23503 | Comercializadora de Ropa Fashion Club | POLOS-SIN AVIÓN | ESMA | POLOS / Polo Basica | CADET NAVY | 24 | 8Embodegado | done | DICIEMBRE 2025 |
| WH/MO/23505 | Comercializadora de Ropa Fashion Club | POLOS-SIN AVIÓN | ESMA | POLOS / Polo Basica | CADET NAVY | 24 | 8Embodegado | done | DICIEMBRE 2025 |

## 2 · La fase decide, no el Estado OP

Regla nueva del cargador (Parte 2): **historia** = fase con sistema "cerrada" (Facturado, Stand by); **cancelada** = fase
que contenga "cancel"; **fuera de rango** = fecha pasada y fase cerrada. El Estado OP ya no saca a nadie del plan; solo se
reporta: *done* o *cancel* en una fase abierta aparece como contradicción. Es la misma regla que el filtro de Odoo (fase
sin FAC, STAN ni CAN).

Aplicado en producción sin recargar todo: 46 órdenes *done* sin facturar volvieron al plan (7.480 prendas) y entraron 27
*done* en fases de prenda terminada con fecha pasada que antes quedaban "fuera de rango". Ahora hay **128 órdenes con
Estado OP = done** en el sistema; dónde están:

| Fase | Grupo | Órdenes | Prendas | En el plan |
|---|---|---:|---:|---|
| 8Novedades | prenda terminada | 31 | 5.988 | sí, cero minutos |
| 8Exportacion | prenda terminada | 19 | 2.495 | sí, cero minutos |
| 8Centro Distribucion | prenda terminada | 9 | 910 | sí, cero minutos, **sin medir** |
| 8Cross | prenda terminada | 7 | 794 | sí, cero minutos |
| 8Embodegado | prenda terminada | 6 | 1.141 | sí, etiquetado 1 min/pz |
| **4Preparacion Insumos** | corte | **1** | **42** | sí — **contradicción: WH/MO/28598** (PRICE CLUB, entrega 16-sep): la fase dice corte, el estado dice terminada. No se resolvió; sale en la bandeja de contradicciones. |
| Facturado | cerrada | 55 | 22.894 | no |

Ninguna otra *done* quedó en una fase que no sea de terminados.

## 3 · Grupo prenda terminada (tabla 1)

- **Cero minutos**: 8Exportacion, 8Novedades, 8Cross (como estaban).
- **8Embodegado**: sin carga + **paso extra Etiquetas** con el parámetro `minEtiqEmbodegado` (Configuración → Calendario y
  parámetros, sembrado en 1 min/prenda). En 0 o vacío el paso queda sin tiempo y sale en la bandeja "paso extra sin
  minutos". Hoy 7 órdenes, 1.411 prendas.
- **8Centro Distribucion**: sin carga + **"sin medir"**: bandeja visible en Órdenes ("carga real sin medir": 10 órdenes ·
  970 prendas). No se inventó ningún número.
- Sin cambio: 8Empaque, 8Servicios y Terminados, 8Botones, 8Lavanderia, 8Lavanderia Quito.
- La tabla 1 tiene ahora dos columnas editables más: "paso extra" (centro + nombre del parámetro) y "sin medir".

## 4 · Cuadre contra Odoo (fase sin FAC/STAN/CAN)

El sistema se cargó con el archivo del **13-sep**; tu Odoo es de hoy. Con la regla nueva el plan da exactamente lo que da
ese archivo con tu filtro:

| Mes | Sistema ahora | Odoo (usuaria, hoy) | Dónde no cuadra |
|---|---|---|---|
| Agosto | 40 · 5.028 · $ 40.275 | 40 · 5.028 · $ 40.274,88 | cuadra |
| Septiembre | 342 · 63.306 · $ 416.719 | 341 · 63.026 · $ 413.778,84 | **WH/MO/28463** (8Cross, 280 pz, $ 2.940): abierta en el archivo, facturada en Odoo después del 13-sep |
| Octubre | 162 · 50.873 · $ 308.836 | 352 · 133.661 · $ 5.361.859,88 | 190 órdenes nuevas en Odoo desde el archivo |
| Noviembre | 104 · 66.146 · $ 331.832 | 239 · 138.432 · $ 543.920,98 | 135 órdenes nuevas |
| Diciembre | 4 · 815 · $ 5.929 | 175 · 69.106 · $ 315.762,82 | 171 órdenes nuevas |

Las 8 órdenes de septiembre que faltaban (333 → 341): eran 9 *done* con fecha pasada, excluidas por la regla vieja
"fecha pasada y no abierta" — WH/MO/29014, 28641, 28643, 28614, 28626, 28532, 28534, 28550 y 28463 — menos 28463, que
ya se facturó en Odoo.

**Precio de octubre ($ 40/prenda)**: no está en el archivo que tengo (octubre en el archivo: $ 6,07/prenda sobre 162
órdenes). Está en las 190 órdenes nuevas. Con una exportación nueva del `Tarea__project_task` lo cuadro y localizo la
orden con precio mal cargado.

## 5 · Carga por centro, antes → después (minutos programados)

| Centro | Sep antes | Sep después | Oct antes | Oct después | Nov antes | Nov después |
|---|---:|---:|---:|---:|---:|---:|
| Confección | 476.633 | 476.633 | 94.842 | 94.842 | 9.221 | 9.221 |
| Corte | 11.360 | 11.360 | — | — | — | — |
| Botones | 22.398 | 22.398 | 407 | 407 | — | — |
| Empaque | 21.767 | 21.767 | 3.525 | 3.525 | 345 | 345 |
| Estampado | 3.163 | 3.163 | — | — | — | — |
| **Etiquetas** | 1.407 | **2.817** | — | — | — | — |

Tejeduría 260 h antes y después; tintorería 0 baños programados antes y después (los baños se arman a mano). Las 46 + 27
órdenes reabiertas no movieron ni un minuto: están en fases sin carga. El único cambio es el etiquetado de Embodegado:
+1.410 min (1 min × 1.411 prendas, redondeo).

## 6 · Cuartos niveles de NUEVOS TEMPO en el archivo (para que decidas cuáles son externos)

Órdenes = cabeceras del archivo que tienen al menos una línea en esa categoría (abiertas = fase sin FAC/STAN/CAN).
Los que vienen en **metros** o con nombre de servicio/externo son los candidatos a no ser propios; no decido.

| Cuarto nivel | Órdenes (abiertas) | Prendas | Líneas · unidad |
|---|---:|---:|---|
| JERSEY 24 | 863 (176) | 268.039 | 1.508 kg |
| RIBB 24 | 758 (173) | 249.863 | 1.261 kg |
| CUELLOS TEJIDOS TEMPO | 355 (118) | 105.899 | 585 uds |
| PUÑOS TEJIDOS TEMPO | 345 (117) | 104.679 | 556 uds |
| JERSEY LYCRA TEMPO | 250 (72) | 73.161 | 436 kg |
| RIBB 2X2 GRUESO TEMPO | 243 (44) | 27.649 | 449 kg |
| PIQUE TEMPO | 230 (66) | 78.879 | 406 kg |
| FRENCH TERRY TEMPO | 224 (19) | 28.957 | 439 kg |
| FLECCE PERCHADO TEMPO | 189 (48) | 25.136 | 346 kg |
| SERVICIO TINTURADO *(ya EXTERNA TEÑIDA)* | 164 (17) | 33.867 | 224 kg |
| PIQUE LYCRA TEMPO | 160 (59) | 34.996 | 276 kg |
| JERSEY 30 | 145 (12) | 47.559 | 172 kg |
| TELA IMPORTADA TINTURADA *(ya EXTERNA TEÑIDA)* | 108 (40) | 22.663 | 162 **m** |
| RIBB 30 | 107 (10) | 33.793 | 115 kg |
| RIBB 2X2 LIVIANO TEMPO | 71 (15) | 16.848 | 121 kg |
| RIBB ALGODON TEMPO | 49 (8) | 8.784 | 77 kg |
| JERSEY ALGODON MEDIANO TEMPO | 42 (11) | 7.238 | 76 kg |
| CUELLOS TEJIDOS COMBINADOS TEMPO | 38 (13) | 6.676 | 65 uds |
| FALLAS TEMPO (TERCERAS) | 36 (2) | 8.742 | 36 kg · 4 **m** |
| RIBB 1X1 MICROFIBRA TEMPO | 33 (0) | 9.427 | 38 kg |
| PUÑOS TEJIDOS COMBINADOS TEMPO | 32 (13) | 5.578 | 52 uds |
| GALLETA TEMPO | 29 (7) | 5.237 | 49 kg |
| MICROFIBRA GALLETA TEMPO | 27 (0) | 6.086 | 54 kg |
| RIBB RAYADO TEMPO | 20 (9) | 5.472 | 32 kg |
| TELA TINTURADA (EXTERNA) *(ya EXTERNA TEÑIDA)* | 19 (3) | 4.582 | 39 kg |
| TERMOFIJADO EXTERNO | 18 (0) | 3.263 | 19 kg |
| MICRODRILL TEMPO | 18 (0) | 5.090 | 20 kg |
| SERVICIO LAVADO | 17 (4) | 3.139 | 21 kg · 1 **m** |
| PIQUE TEMPO SEGUNDA (FALLA) | 14 (2) | 2.299 | 15 kg |
| JERSEY FANTASIA TEMPO | 13 (0) | 7.250 | 24 kg |
| JERSEY ALGODON PESADO TEMPO | 12 (3) | 2.386 | 18 kg |
| FAJAS TEJIDOS COMBINADO TEMPO | 12 (5) | 1.364 | 22 uds |
| AMOROSA TEMPO | 11 (0) | 1.694 | 18 kg |
| JERSEY TEMPO SEGUNDA (FALLA) | 11 (2) | 2.920 | 12 kg |
| MICROFIBRA SPACE TEMPO | 10 (0) | 2.979 | 10 kg |
| JERSEY ARCOIRIS 24 | 9 (0) | 3.886 | 9 kg |
| SOFTWAFFLE TEJIDO TEMPO | 7 (4) | 1.442 | 8 kg |
| FRENCH TERRY TEMPO SEGUNDA (FALLA) | 7 (0) | 1.026 | 7 kg |
| SERVICIO MATIZADO | 7 (3) | 1.434 | 6 kg · 2 uds |
| RIBB 6X6 HANDEL TEMPO | 6 (4) | 1.426 | 10 kg |
| JERSEY ARCOIRIS TEMPO SEGUNDA (FALLA) | 5 (0) | 2.132 | 5 kg |
| JERSEY LISTADO TEMPO ALGODON | 5 (0) | 1.074 | 11 kg |
| PIQUE DOBLE TEMPO | 4 (1) | 692 | 4 kg |
| TINTURADAS CHINA SEGUNDA (FALLA) | 4 (3) | 369 | 4 **m** |
| MICROFIBRA COMPACTADA TEMPO | 4 (2) | 570 | 9 kg |
| CUELLOS TEMPO SEGUNDA (FALLA) | 4 (0) | 537 | 4 uds |
| SILKY RIBB TEJIDO TEMPO | 3 (0) | 273 | 5 kg |
| JERSEY ARCOIRIS 30 | 3 (0) | 990 | 4 kg |
| JERSEY ALGODON TEMPO SEGUNDA (FALLA) | 3 (0) | 574 | 3 kg |
| FLECCE PERCHADO TEMPO SEGUNDA (FALLA) | 3 (1) | 232 | 3 kg |
| PUÑOS TEMPO SEGUNDA (FALLA) | 3 (0) | 420 | 3 uds |
| CUELLOS POLIESTER TEJIDOS TEMPO | 3 (0) | 864 | 6 uds |
| FAJAS TEJIDOS TEMPO | 2 (2) | 214 | 2 uds |
| JERSEY SUPER LISTADO TEMPO | 2 (0) | 271 | 4 kg |
| JERSEYLINE TEJIDO TEMPO | 2 (2) | 518 | 2 kg |
| INTERLOCK FERRANO TEMPO | 2 (0) | 324 | 2 kg |
| BRONTEXA TEJIDO TEMPO | 2 (0) | 324 | 4 kg |
| BINCHA TEJIDO COMBINADO TEMPO | 2 (0) | 324 | 4 uds |
| MICROFIBRAS TEMPO SEGUNDA (FALLA) · RIB 2X2 LIVIANO TEMPO SEGUNDA (FALLA) · AMOROSA TEMPO SEGUNDA (FALLA) · PIQUE FANTASIA TEMPO · CUELLOS FANTASIA TEMPO · JERSEY LISTADO TEMPO · FLEECE PERCHADO ARCOIRIS TEMPO · RIBB 2X2 ARCOIRIS TEMPO · AMOROSA LIVIANA TEMPO · JERSEY LYCRA TEMPO SEGUNDA (FALLA) · RIBB TEMPO ARCOIRIS · RIBELLE TEJIDO TEMPO · RIBB 2X2 LIVIANO LISTADO TEMPO · RIBB 1X1 DELGADO TEMPO SEGUNDA (FALLA) · SCRAMBLE TEJIDO TEMPO | 1 cada uno | 60–414 | 1–2 líneas (kg / uds) |

Las 3 órdenes con paso de tejeduría solo por una plana en NUEVOS TEMPO vienen de los cuartos niveles en **metros**:
TINTURADAS CHINA SEGUNDA (FALLA), FALLAS TEMPO (TERCERAS) y SERVICIO LAVADO.

## 7 · Tintorería: tela plana

Configuración → Calendario y parámetros (Tintorería): **horas por tanda = 8** y **máquina grande = DANITECH 1** (240 kg;
DANITECH 2 es igual, elegí la primera), ambos marcados **PENDIENTE DE VALIDAR**; la marca se quita sola cuando los edites
y el cambio queda en la bitácora. Con eso la sección "Tela plana · tandas" ya deja armar tandas: hoy hay 4 líneas
pendientes de tanda (plana liberada a la planta que necesita tintura).

**Las 18 órdenes que ganaron paso de tintorería por la plana** (3.856 m en total): carga en tintorería antes **0 h ·
0 tandas**, después **0 h · 0 tandas**. La plana no entra sola al programa: solo carga cuando alguien arma la tanda
(máquina grande, 8 h por tanda). Cuánto será depende de cuántos metros entren por tanda, y eso todavía no se sabe: no
hay ningún lote registrado (la relación metros/kilos se va formando con cada tanda). Como referencia, si cada tanda
llevara todos los metros de una orden, serían 18 tandas × 8 h = 144 h; si se agrupan varias órdenes de la misma tela por
tanda, menos. Cuando haya lotes, la pantalla lo estima con el promedio real.
