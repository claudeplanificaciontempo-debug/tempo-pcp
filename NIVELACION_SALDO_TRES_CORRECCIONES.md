# Nivelación — las tres correcciones del saldo (reporte)

**17-sep-2026.** Medido en el simulador con el volcado real, meses 2026-09 · 2026-10 · 2026-11 marcados, sin filtros.
Nada del motor se tocó; dos ajustes de presentación (al final).

## 1 · Validación con los números de la pantalla (Carga general, misma base y meses)

| Área | Nivelación (u / órdenes / min) | Carga general (pz / órdenes / min) | ¿Cuadra? |
|---|---:|---:|---|
| Corte | 29.987 / 72 / 21.550 | 29.987 / 72 / 21.550 | **sí, exacto** |
| Confección | 30.577 / 76 / 563.673 | 30.577 / 76 / 563.673 | **sí, exacto** |
| Empaque | 32.690 / 91 / 17.539 | 32.690 / 91 / 17.539 | **sí, exacto** |
| Botones | 6.054 / 24 / 1.574 | 6.054 / 24 / 1.574 | **sí, exacto** |
| Bordado | 121.470 / 288 / 379.318 min | 121.470 / 288 / **227.590.535 pt** | unidades y órdenes sí; la tercera columna **no es comparable**: Carga general mide bordado en **puntadas** (`medida:'puntadas'`) y la nivelación en **minutos** (`minPrenda` con la velocidad de bordado). Los dos son correctos. |
| Estampado, Lavado | 0 u (54 y 24 órdenes **sin SAM**) | no aparecen (Carga general excluye lo que no tiene minutos) | consistentes: ninguna cuenta lo que no tiene tiempo |
| Tela, Maquila | 0 | — | ver 3 |

Conclusión: **para todo lo que tiene SAM, la nivelación y Carga general dan el mismo número**; no hay dos definiciones.

## 2 · Empaque (32.690 u) mayor que Confección (30.577 u)

**No es un error del cálculo: es la ruta de las órdenes.** 15 órdenes del período tienen Empaque en la ruta y **no**
tienen Confección (`modulos`): son las que se confeccionan **afuera** —fases «5Maquila Conf», «5CD Maquila»,
«5Maquila Recepción» (50 órdenes del período en fases de maquila)— y vuelven a la planta solo para empacar (rutas como
`botones > lavado > empaque` o `empaque`). Empaque es el último paso de toda ruta (regla del 16-sep), así que
**Empaque ≥ Confección es lo esperado** mientras haya confección externa.

Lo que sí es una brecha: el recuadro **Maquila da 0** porque hoy solo cuenta las órdenes con `recursoFijo.modulos =
'maquila'` (lo que la Parte 1 definió como «marcadas a maquila»), y **ninguna orden del volcado está marcada así**,
aunque 50 estén en fases de maquila. **Decisión que necesito:** ¿Maquila se cuenta por **fase** (las fases «5Maquila…»
de la tabla 1, igual que Tela se cuenta por fase), por **ruta** (sin `modulos` y con pasos posteriores) o por la marca
`recursoFijo`? Mi propuesta: por fase, con una columna «nivelación = maquila» en la tabla 1, como Tela; sin
inventar nada hasta que lo decidas.

## 3 · Tela, Estampado y Bordado

- **Tela = 0 → era «dato faltante», no cero.** El saldo de Tela se cuenta por **fase** (columna «nivelación» de la tabla 1,
  decisión del Paso 1) y **esa columna está vacía**: ninguna fase marcada. La pantalla mostraba «0 u · ✓ llega», que es
  falso. **Corregido**: el recuadro dice «sin fases marcadas» y el estado es «? dato faltante» hasta que en Configuración →
  Órdenes y materiales → tabla 1 se marque qué fases cuentan para Tela (p. ej. 1Tejeduria, 1Tintoreria, 1CD Tintoreria,
  1INCOMPLETOS TIN; **no** 1Calidad Tintoreria). Es tu decisión, no la mía.
- **Estampado = 0 u → hay 54 órdenes y 9.040 u sin SAM.** Todas las órdenes del período con Estampado en la ruta tienen
  el paso con **t = 0 y sin técnica** (no hay técnica de estampado cargada en la orden ni tiempo por prenda), así que no
  suman minutos. El recuadro mostraba «0 u» a secas. **Corregido**: el recuadro dice «0 u **+ 9.040 u sin SAM**» y el cuadrito
  ya lo listaba. Lo mismo pasa con **Lavado** (24 órdenes, 6.054 u): Lavado es «por días» (`cap:'no'`), no tiene minutos por
  diseño; su nivelación no es por capacidad. Pendiente de decidir si Lavado y Plancha salen de los recuadros o se muestran
  como «por días, sin capacidad».
- **Bordado = 121.470 u, más que Corte.** Es real según las rutas cargadas, pero **252 de las 288 órdenes (103.930 u) tienen
  Bordado como único paso de producción** (ruta `tej > tin > bordado`, sin corte, confección ni empaque): son las **rutas
  incompletas** del 16-sep (`RUTAS_EMPAQUE_DIAGNOSTICO.md`), que en el simulador siguen así porque la corrección
  `sembrarRutasEmpaque` solo corre sobre la base real. **En producción hay que mirar Órdenes → Rutas**: si allí quedan pocas
  sin Empaque (348 → 22 tras la siembra), el saldo real de Bordado será mucho menor y Corte/Confección subirán por las
  mismas órdenes. No es un error del motor: la nivelación cuenta lo que dice la ruta.

## Ajustes hechos (presentación, sin tocar el motor)

- Recuadro de área: muestra «+N u sin SAM» cuando hay órdenes que no suman, y «sin fases marcadas» para Tela sin
  configuración; en ese caso el estado es «dato faltante», nunca «llega».
- `nivUICalcular` marca `sinFasesTela` y lo agrega a la lista de datos faltantes del cuadrito.

## Decisiones que necesito

1. Maquila: por fase (propuesta), por ruta o por marca `recursoFijo`.
2. Lavado y Plancha (por días, sin capacidad): ¿fuera de los recuadros o «por días» sin cuadrito?
3. Tela: qué fases marcar en la tabla 1 (lo haces en Configuración; la pantalla ya lo pide).
