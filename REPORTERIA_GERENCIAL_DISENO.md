# Consultas del Resumen gerencial — propuesta de diseño

**Esto no está construido.** Es la propuesta que pediste antes de tocar nada. Dime qué apruebas, qué cambio y
qué sobra, y lo construyo.

El movimiento a Reportería y el filtro de meses **sí están hechos** (commit `33a6665`).

---

## La idea en una frase

Un solo **filtro global** arriba (el que ya existe: meses) y **cinco cortes de la misma cartera** debajo:
cliente, fase, ODC, estilo y familia. Todos responden la misma pregunta —**cuánto hay, cuánto se hizo, cuánto
falta y qué está en riesgo**— cambiando solo por qué se agrupa.

---

## Lo que ya existe hoy (para no duplicarlo)

| Dónde | Qué hace | Se queda |
| --- | --- | --- |
| Resumen gerencial | cartera por mes y por cliente, carga por área, avance ponderado | sí, es la base |
| Vista general de órdenes | todas las órdenes con el agrupador de 3 niveles | sí: es el **detalle**, no el resumen |
| Demanda agregada | familias contra capacidad | sí |
| Asignación por orden | cada orden contra el programa | sí |

**Lo que propongo no reemplaza nada:** agrega el corte agregado que hoy hay que armar a mano.

---

## Filtros que comparten TODOS los bloques

Uno solo, arriba, y todos los bloques obedecen:

| Filtro | Cómo | Nota |
| --- | --- | --- |
| **Meses del Proyecto** | multiselección, **suma** los elegidos | **ya está hecho** |
| **Cliente** | multiselección | propuesto |
| **Estado** | en curso / vencidas / en riesgo / terminadas | propuesto |
| Buscador | el común, por WH, ODC, estilo, color, cliente | propuesto |

**Decisión que necesito:** ¿los filtros de cliente y estado son **globales** (afectan a los cinco bloques) o
cada bloque tiene el suyo? Mi recomendación: **globales**, porque la gracia es cruzarlos; si quieres ver un
cliente, lo eliges arriba y los cinco bloques se acomodan.

---

## Las cinco consultas

**Las cinco tienen las mismas columnas.** Eso es a propósito: se aprende una vez y sirve para las cinco, y los
totales cuadran entre bloques.

### Columnas comunes

| Columna | Qué es | De dónde sale |
| --- | --- | --- |
| **Órdenes** | cuántas | cartera filtrada |
| **Prendas pedidas** | total | `o.cant` |
| **Hechas** | terminadas en el último paso de su ruta | avance del piso |
| **Falta** | pedidas − hechas | |
| **% avance** | hechas ÷ pedidas | barra |
| **Valor** | $ | `o.precio × o.cant`; **marca cuántas no tienen precio** |
| **Vencidas** | la fecha meta ya pasó | |
| **En riesgo** | el programa las termina después de la meta | |
| **Kg de tela** | pendientes de tejer y teñir | solo en Familia y Estilo |

### 1 · Por cliente

Agrupa por `o.cliente`. **Segundo nivel opcional: ODC**, para ver un cliente desglosado por pedido.

*Para qué:* «¿cómo vamos con PRICE CLUB este mes?» sin armarlo a mano.

### 2 · Por fase

Agrupa por la fase de Odoo, **ordenada por la secuencia de la tabla 1**, no alfabética. Columna extra:
**días promedio en la fase** (desde el último cambio de fase registrado).

*Para qué:* ver dónde se está acumulando la cartera. Los días en fase son la señal de atasco.

**Brecha conocida:** los días en fase solo salen de las órdenes que tienen historial de fases (`o.fases[]`).
Las que nunca cambiaron de fase en el sistema no tienen desde cuándo; **se muestran aparte como «sin
historial»**, no con un 0.

### 3 · Por ODC

Agrupa por `o.odc` (incluido el asignado a mano). Columnas extra: **cliente**, **fecha de entrega comprometida
del ODC** (la más temprana de sus órdenes) y **cuántas de sus órdenes ya están terminadas**.

*Para qué:* un ODC se entrega junto. Es el corte que dice si un pedido completo llega o no.

### 4 · Por estilo

Agrupa por `o.ref` (la referencia/estilo). Columnas extra: **categoría**, **color** y **cuántas órdenes
distintas** lo usan.

*Para qué:* ver el volumen real por estilo, que hoy está repartido entre muchas WH.

### 5 · Por familia

Agrupa por la categoría padre. Es el corte que ya usa Demanda agregada, pero con las mismas columnas que los
otros cuatro para que cuadre.

---

## Cómo se ve

Cada bloque, **colapsable**, con esta forma:

```
▾ Por cliente                                    12 clientes · 4.320 prendas
  ┌──────────────────┬────────┬─────────┬────────┬───────┬─────────┬──────────┬──────────┬────────┐
  │ Cliente          │ Órdenes│ Pedidas │ Hechas │ Falta │ % avance│ Valor    │ Vencidas │ Riesgo │
  ├──────────────────┼────────┼─────────┼────────┼───────┼─────────┼──────────┼──────────┼────────┤
  │ FASHION CLUB     │     31 │   1.840 │  1.210 │   630 │ ▓▓▓▓░ 66│ $ 18.400 │        2 │      4 │
  │ PRICE CLUB       │     18 │     980 │    340 │   640 │ ▓▓░░░ 35│ $  9.800 │        0 │      7 │
  └──────────────────┴────────┴─────────┴────────┴───────┴─────────┴──────────┴──────────┴────────┘
```

- Clic en una fila → **abre el detalle** de esas órdenes con el agrupador común (el mismo de todas las
  pantallas), sin salir de la página.
- Los cinco bloques **suman lo mismo**: si cambias el filtro de arriba, los cinco totales de «Pedidas» son
  idénticos. Eso es lo que hace confiable el tablero.

---

## Tres decisiones que necesito de ti

1. **¿Los filtros de cliente y estado son globales o por bloque?** (recomiendo globales)
2. **¿«Hechas» es el último paso de la ruta, o empaque siempre?** Hoy uso el **último paso de la ruta de cada
   orden**, porque no todas pasan por empaque. Si para ti «hecha» significa empacada, lo cambio — pero
   entonces las órdenes que no pasan por empaque quedarían siempre en 0 y habría que decidir qué hacer con
   ellas.
3. **¿Los cinco bloques a la vez, o pestañas?** Mi recomendación: los cinco colapsados, abiertos uno a la vez
   y recordando cuál dejaste abierto. Cinco tablas abiertas simultáneamente es mucha pantalla.

---

## Lo que NO propongo (y por qué)

- **Gráficos de tendencia mes a mes.** Requieren historia que hoy no se guarda: el sistema tiene la foto
  actual, no la serie. Se puede construir, pero hay que empezar a guardar cierres mensuales primero.
- **Márgenes o costos.** No hay costo por prenda en el sistema, solo precio. Sería inventar.
- **Un sexto corte por color.** El color ya está en el agrupador del detalle; como bloque agregado aporta poco.

---

## Esfuerzo estimado

| Parte | Tamaño |
| --- | --- |
| Los filtros globales compartidos | chico |
| Un motor de agregación común y los 5 bloques | mediano — es una sola función, cambia la clave |
| El detalle al hacer clic | chico: reusa `filasGRP` |
| Pruebas | mediano: que los cinco bloques cuadren entre sí es la prueba importante |
