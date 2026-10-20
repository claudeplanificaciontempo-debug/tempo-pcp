# Tiempo estimado cuando falta el dato (20-oct-2026)

**Pedido de la usuaria:** «¿puedes usar un tiempo promedio?» para los pasos de las órdenes abiertas que no tienen tiempo. Eligió la
**mediana** (la del medio: no se infla por unos pocos casos muy grandes) y **primero de las órdenes del mismo tipo de producto; si no hay,
de todo el paso**.

## Qué hace
- Un paso de producción **pendiente** de una orden **abierta** que no tiene dato real toma la mediana de las órdenes cargadas que sí lo tienen.
  Falta el dato cuando: el tipo de producto no tiene SAM en ese centro, el estampado no tiene técnica (o su técnica no tiene tiempo), o el
  bordado no tiene puntadas.
- La mediana sale **solo de datos reales** (una por orden y paso; nunca de otro estimado). Bordado en puntadas; los demás en minutos por prenda.
- El paso queda marcado (`p.tEst={t,base,metodo}`) y se ve **«tiempo estimado»** en: la columna Ruta de Órdenes y de la consulta de órdenes, la
  cola del centro, la tablet, la ficha, el editor de ruta, la hoja impresa del día («≈ … estimado»), la Nivelación y «¿alcanza?» de Hoy
  («de esto, N con tiempo estimado»), el Resumen gerencial («¿Se puede confiar…?») y Hoy → Pendientes («Pasos con tiempo estimado»).
- **Lo real manda en cuanto llega** (la técnica con tiempo, las puntadas o el tiempo del tipo de producto): la marca sale sola.
- **Un 0 escrito a mano** en «Tiempos por tipo de producto» es 0 confirmado: no se estima encima. **Un tiempo escrito a mano en la ficha**
  queda como «a mano» y manda.
- **No se pierde la marca**: ni al guardar la ficha sin cambios, ni cuando el sistema rehace la ruta (cambio de catálogo, completar Empaque,
  ruta por defecto), ni en la ruta en lote. Exportar rutas a Excel escribe 0 en un paso estimado (columna «Tiempo estimado (no se vuelve a
  cargar)») y cargar ese archivo no lo convierte en real.

## Sirve para programar, no para medir al piso (decisión tomada; se cambia si la usuaria lo pide)
El estimado ocupa capacidad en el programa (las fechas son más reales que con 0), pero **no se usa para medir a nadie**: el semáforo del
tramo, el «tiempo bajo» al cerrar un paso, la eficiencia de Planta en vivo, de Módulos en vivo y del Andon de Confección lo tratan como
**sin SAM** (`samMedirPaso`).

## Dónde se configura
Ingeniería → Tiempos del programa → «Tiempo estimado cuando falta el dato»: encenderlo o apagarlo, mediana o promedio, del mismo tipo o de
todo el paso; la tabla por paso con su mediana, cuántas órdenes tienen dato, cuántas abiertas usan el estimado y por tipo de producto.
Todo va a la bitácora. Lo sembró la decisión de la usuaria (activo, mediana, mismo tipo) y lo activa Administración al entrar.
Apagado, los pasos estimados vuelven a 0 («sin tiempo»).

## Cuándo se recalcula (para no pisar a otra sesión)
La pasada completa corre al leer del servidor, al cambiar la configuración, después de cargar tareas u órdenes de trabajo, y en las órdenes
que la propia sesión cambia (ficha, rutas rehechas, lote, carga de rutas). En los demás dibujos solo se quitan marcas por causas reales
(llegó el dato, 0 confirmado, la orden se cerró o el centro pasó a «por días»). Dos sesiones calculan la misma fila y no chocan.

## Con los datos del volcado
171 pasos pendientes con tiempo estimado en 89 órdenes (Corte, Estampado, Bordado, Confección y Empaque). Las medianas del paso: estampado
0,47 min, bordado 1.200 puntadas, confección 13,46 min, corte 0,5 min, empaque 0,44 min.

## Qué no cambia
`programar()` (lee `p.t` como siempre; prueba HUELLA). Con el estimado apagado el sistema queda como antes, salvo dos arreglos que se notan
igual: un tramo sin SAM sale en gris (antes rojo) y un tiempo escrito a mano en la ficha también queda en la ruta completa (antes se podía
perder al recargar una ruta confirmada).

## Pendiente para la usuaria
Si el estimado debe contar también en Capacidad y decisiones / Planificar el mes con su línea «incluye N h estimadas», y si cuenta para
`pctSinSAMDato`. Un paso reabierto en esta sesión toma el estimado en la siguiente lectura del servidor.

## Pruebas
TE1–TE39 (bloque «TE · Tiempo estimado»), con órdenes inventadas; cada prueba nueva falla con el código de antes. Dos revisiones con varios
revisores independientes: 17 + 10 hallazgos, todos corregidos.
