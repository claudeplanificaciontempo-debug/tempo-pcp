# Cola por fase — correcciones sobre lo construido (17-sep-2026)

Cuatro puntos sobre la cola entregada en `3bdd9f2`. Medido en el simulador con el volcado real (1.206 órdenes),
semana del lun 14 al dom 20 de septiembre, perfil planificación, «ver todas».

## 1 · Lo aprobado de «Pantallas de producción» (2, 5 y 7), aplicado a la cola

- **«asignar a operario» se retiró** de todas las filas (botón, modal y función). El supervisor sigue fijando
  recurso y fecha en la propia fila (columnas Recurso y Arranca) — es lo que hace visible en la tablet un paso sin
  minutos.
- **Acciones en un menú «⋯»** por fila (`accionesColaHTML`, un `<details>` inline, sin capas flotantes): ✓ hecho ·
  quitar lo fijado · ruta.
- **Ruta**: «ruta» (editar) **solo con `puede('ruta')`** (`puedeEditarRuta()`); para los demás perfiles el menú trae
  **«ver ruta»** de solo lectura, que abre la ficha de la orden (`abrirFichaOrden`, ruta con el paso actual).
- **Cabecera en tres líneas** en vez de dos párrafos de cinco líneas:
  - `Disponible N · Por llegar N · Todo lo que viene N · Ya salió de aquí N` (y Con puesto manual / Revisar ruta
    cuando hay).
  - `Orden de la cola: puesto manual (n de N) → cercanía a llegar → fecha de llegada → entrega ?` — la explicación
    completa (qué es cada grupo, de dónde sale la llegada, «hoy no cuenta») va en el «?».
  - `Marcas: N rojas meta vencida (x%) · N ámbar va tarde / paso tarde (y%) · N sin marca (z%) ?` — el porqué en
    el «?».
  - El texto explicativo de la pestaña (`lede`, 126 px) pasó al «?» junto al título «Cola de <centro>».
  `ayudaTipHTML(txt)` es el «?» común: tooltip al pasar el mouse y, **al tocarlo (tablet), despliega el mismo texto
  debajo** (`.ayuda-d.abierto`); las tres líneas envuelven, no se recortan. La línea «Marcas:» se calcula **sobre la
  misma cola que muestra la tabla** (la de la semana, o toda con «toda la cola»), no sobre otra base.

## 2 · Marcas de atraso: una línea, rojo solo la meta vencida

`MARCAS_CEN` (mismo cálculo, `diagAtraso`; solo cambia qué se pinta):

| Marca | Antes | Ahora | Color |
|---|---|---|---|
| meta vencida | «meta vencida», rojo | **meta vencida** | **rojo** (`t-alerta`) |
| la orden no alcanza su meta | «la orden va tarde», rojo | **va tarde** | ámbar (`t-aviso`) |
| este paso se pasa de su límite | «este paso va tarde», ámbar | **paso tarde** | ámbar |

Una sola etiqueta por fila, `white-space:nowrap`, «+1» cuando aplican más (todas en el tooltip; una fila cuenta una
sola vez, por su marca más grave). La pestaña **Costura** pinta las mismas marcas con los mismos nombres y colores
(`marcaCentro` sale ahora de `MARCAS_CEN`). Porcentaje de la cola en cada color, hoy, «ver todas» (`conteoColoresCola`):

| Centro | Cola | Rojo (meta vencida) | Ámbar (va tarde / paso tarde) | Sin marca |
|---|---:|---:|---:|---:|
| Corte | 72 | 13 · **18 %** | 15 · 21 % | 44 · 61 % |
| Confección | 76 | 16 · **21 %** | 16 · 21 % | 44 · 58 % |
| Empaque | 93 | 24 · 26 % | 19 · 20 % | 50 · 54 % |
| Bordado | 163 | 60 · 37 % | 54 · 33 % | 49 · 30 % |
| Estampado | 26 | 20 · **77 %** | 5 · 19 % | 1 · 4 % |
| Botones / Lavado | 28 | 7 · 25 % | 1 / 0 | 20 / 21 |

Antes, en Corte y Confección el rojo cubría rojo + ámbar (39 % y 42 %). Ahora el rojo queda en 18 % y 21 %: avisa.
Estampado sigue en 77 % rojo porque **son** metas vencidas (20 de 26; 17 de ellas con ruta incompleta `[estampado]`
sola, ver el reporte anterior): ahí el color dice la verdad, la brecha es la ruta.

## 3 · Corte por fecha dentro de «Por llegar»

- Parámetro **`diasPorLlegar`** (`prm('diasPorLlegar',15)`, editable en Configuración → Calendario y parámetros →
  «Cola del centro: “Por llegar” hasta (días hábiles)», `setDiasPorLlegar` con bitácora; **0 = solo lo que llega
  hoy**).
- `cortePorFecha(out)` corre en los dos caminos de `cercaniaCentro` (primer centro por tela y el resto por el paso
  anterior): si el grupo es Por llegar y la llegada programada (`llegada.tipo==='fecha'`) supera N días hábiles, la
  orden **baja a «Todo lo que viene»** con `lejosPorFecha` y la etiqueta **«llega en X días · más de N»** («llega
  mañana» en singular) en la columna Llega. Dentro de ese grupo **se ordena por fecha junto a las demás** (no encima
  de las que «llegan ya»). No toca Disponible, anomalías ni «sin programar» (no se estima). Las notas de los dos grupos
  dicen el corte a la vista («Por llegar … llega dentro de N días hábiles, o sin fecha conocida»).
- Órdenes que se mueven hoy (corte 15):

| Centro | Por llegar antes | Se mueven | Por llegar ahora | Días hábiles de las movidas |
|---|---:|---:|---:|---|
| Confección | 14 | **7** | 7 | 45, 87, 89, 93, 96, 105, 108 |
| Empaque | 18 | **7** | 11 | 45, 87, 89, 94, 97, 106, 109 |
| Bordado | 19 | 0 | 19 | — |
| Botones, Lavado | 3 | 0 | 3 | — |
| Corte, Estampado | 0 | 0 | 0 | — |

Las 7 de Confección son las que el motor programa para enero–febrero (la de «105 días hábiles» de la captura
anterior entre ellas); dentro de «Todo lo que viene» van por fecha, marcadas, y su fase sigue en la lista.

## 4 · «En proceso aquí» por grupo — queda como estaba.

## Revisión adversarial antes del commit

Un workflow de 28 agentes (3 lentes: correctitud, reglas del proyecto, pruebas; cada hallazgo refutado por un
verificador independiente) dejó 25 hallazgos confirmados; los de fondo se corrigieron antes de publicar: la línea de
marcas contaba sobre otra base que la tabla; el «?» quedaba recortado en tablet y solo servía con mouse; con el corte
en 0 la orden de mañana perdía la etiqueta «llega ya» y salía «1 días»; las movidas por fecha quedaban encima de las
que llegan ya; la nota de Por llegar prometía fecha a lo que no la tiene; el «?» repetía el texto viejo «renumera la
cola completa»; Costura seguía con tres etiquetas rojas; el tooltip de «paso sin tiempo» apuntaba al botón retirado;
y las pruebas del corte y de los colores corrían sobre la demo (pasaban en vacío) — ahora se miden sobre el volcado
real en el bloque CF2R, con asserts de cantidad, orden y consistencia con la pantalla.

## Pruebas

Harness: **2.404 comprobaciones, 0 errores**; única roja B0 (hallazgo del borrado, a propósito hasta que apruebes construirlo). Nuevas/rehechas: TO5 (asignar a
operario retirado; recurso y fecha siguen en la fila), CN4 (nombres cortos, graduación rojo/ámbar, sin partir la
línea), CF2 (lede en «?», conteos en una línea, nota en una línea con la convención de días en el tooltip, línea de
marcas con %, acciones en `details.acc` y ninguna suelta, «ruta» solo con permiso / «ver ruta» → ficha, parámetro
`diasPorLlegar` editable con campo en Configuración, corte 15 mueve exactamente lo que supera 15 y lo deja marcado,
0 es 0, N enorme no mueve nada, `cortePorFecha` con 40/3/Disponible/sin programar, notas de grupo con el corte,
rojo + ámbar + sin marca = toda la cola por centro).

## Capturas

`capturas/cola_fase_corte.png` y `capturas/cola_fase_confeccion.png` (`?captura=cola1|cola2`, «ver todas»).
