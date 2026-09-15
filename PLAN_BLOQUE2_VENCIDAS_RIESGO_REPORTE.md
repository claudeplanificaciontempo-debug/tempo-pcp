# Plan mensual · Bloque 2 · vencidas y en riesgo — reporte

Fecha: 15-sep-2026. Motor sin tocar. Pruebas del simulador: 756 (6 nuevas), todas verdes.

1. **Dos contadores.** "Vencidas" = órdenes abiertas del mes con entrega anterior a hoy. "En riesgo" = entrega de hoy en
   adelante que, según el programa (hacia atrás), no llegan. Antes iban juntas (las 275 eran casi todas vencidas).
   `calcularPlan` devuelve `dem.vencidas` y `dem.riesgo` separados; la Guía y la tarjeta de Hoy (Advertencias de fecha) también
   los separan ("N vencidas · M en riesgo según el programa").
2. **"Se atasca en" corregido.** `atascoTxt(r)`: muestra `ro.atasco.nombre` y "+N d"; si es por colección, lo dice; sin
   atasco, "—". Ya no sale [object Object].
3. **Sin tabla larga en el Bloque 2.** Los dos números son enlaces a **Hoy → Advertencias de fecha filtrado por el mes**
   (`irNoLlegan(ym,tipo)`: abre la tarjeta, filtra por mes y tipo, y baja a la lista). El filtro se ve como chip "Solo
   septiembre · vencidas ✕ ver todo". No hay dos listas.
4. **Vencidas con fecha posible.** En Advertencias de fecha, la sección "Vencidas" muestra la **fecha posible** (la que
   el programa puede cumplir, para avisar al cliente) en lugar de "días tarde"; "En riesgo" conserva días tarde, atasco
   y fecha posible.
