# Carga de datos — freno por archivo incompleto y aviso en los pasos 2 y 3

**17-sep-2026.** Commit pequeño, pedido después de aprobar el punto 6. Los puntos 7 y 8 ya estaban hechos cuando llegó
el pedido (`3d3f50b`, `e671d90`), así que este va después de ellos; no los toca.

## Freno por archivo incompleto (paso 1)

- **Umbral en Configuración → Órdenes y materiales → Alcance de las cargas**: «Archivo incompleto: % de la cartera abierta
  que falta», `prm('umbralArchivoIncompleto', 10)`. 0 = frena con una sola.
- En la vista previa, `plan.prev.incompleto` = {faltan, abiertas, pct, umbral, frena, porCliente, porMes}. Cuentan las que
  **no vinieron** en el archivo (sin las fuera de alcance) contra la **cartera abierta** (`abiertaDe`).
- Si supera el umbral: aviso rojo arriba de todo —**«El archivo parece incompleto: faltan N órdenes (X %). ¿Exportaste con
  filtros?»**— con el desglose de las que faltan **por cliente y por mes** (para ver el filtro), y **aplicar exige escribir
  `APLICAR`**; queda en bitácora que se aplicó con confirmación escrita.
- Si se aplica igual, las que faltaban quedan «no está en el archivo» (no se borran). Una orden que ya estaba así **conserva su
  primera marca** (cuándo dejó de venir); antes cada carga la pisaba.

**Prueba** con el volcado filtrado a un solo cliente (el que más órdenes tiene): el freno dispara, el desglose por cliente no
incluye al cliente exportado, sin la palabra no se aplica (cartera y bitácora intactas), con la palabra se aplica y las N
faltantes quedan marcadas; con umbral 100 % no frena.

## Pasos 2 y 3: «Conviene cargar primero las tareas»

Aviso en órdenes de trabajo y fotos cuando **no se aplicó el paso 1 en esta sesión** (`ACT.tareasEnSesion`) **o la última carga
de tareas tiene más de 1 día** (`S.params.tareaCarga.fecha`). Dice cuál de las dos es y cuántos días hace. Sin aviso en el paso 1
ni cuando las tareas se cargaron hoy en la sesión.

## Harness

La cartera del simulador nace con 5 órdenes de demostración, así que **cualquier archivo real dispara el freno**: los bloques
que recargan el volcado responden `APLICAR` al aviso. Es el comportamiento esperado, no un ablandamiento.
