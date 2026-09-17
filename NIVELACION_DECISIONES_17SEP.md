# Nivelación — decisiones del 17-sep y todas las áreas conectadas

**Commit propio.** Motor del Paso 1 intacto (un solo cambio de datos: `PROC_NIVEL` gana la fila Maquila por fase).

1. **Enlace a Carga general.** Al llegar desde la nivelación se ve **solo** el bloque «Saldo por procesar en <área>» con
   «← volver a la nivelación»; debajo, una línea explica que el resto (carga por semana, familia por centro, carga que
   viene, sin liberar, detalle por semana) está colapsado para no confundir el saldo con lo programado, con el enlace
   «ver el resto de Carga general» (`CG.det.verResto`). Cerrar el detalle vuelve a la pantalla completa. Probado.
2. **Maquila por fase.** `PROC_NIVEL` tiene `maquila` con `porFase:true`: la columna «nivelación» de la tabla 1 ofrece
   **Maquila (por fase)** y el saldo de Maquila = órdenes abiertas en las fases marcadas (`saldoProceso('maquila')`, igual
   que Tela), en unidades. `recursoFijo = maquila` **ya no define el saldo**; sigue alimentando la fila «Maquila» del cuadrito
   de las otras áreas (suma de órdenes marcadas). Sin fases marcadas: «sin fases marcadas · dato faltante», nunca 0.
   Probado: al marcar las fases `5Maquila…` en la tabla 1 el recuadro calcula. **Las marcas en la tabla 1 las haces tú.**
3. **Lavado y Plancha.** La regla se aplica a todo centro con la columna «Por días» (`centroPorDias`), no a nombres fijos. **Ojo:
   en la configuración actual solo Lavado es «por días»; Plancha quedó por capacidad el 16-sep (2 min/prenda confirmado)**, así
   que Plancha sale con cuadrito como cualquier centro. Si quieres Plancha por días, es un cambio en Configuración → Centros,
   no de código. Los centros por días se quedan en los recuadros con la
   etiqueta «por días, sin capacidad»: muestran saldo (con «+N u sin SAM») y la tabla de órdenes por familia, **sin
   cuadrito ni fecha calculada**, y dicen qué haría falta para nivelarlos: minutos por prenda (hoja de operaciones o
   mínimo estimado por categoría) y un recurso con personas, minutos y eficiencia —o una capacidad en unidades por día—;
   hoy solo tienen un plazo de espera. Probado.
4. **Tela.** Probado que al marcar fases (`1Tejeduria`, `1Tintoreria`, `1CD Tintoreria`, `1INCOMPLETOS TIN` en la prueba) el
   recuadro calcula y deja de decir «sin fases marcadas». Las marcas reales las pones tú en Configuración.
5. **Bordado en producción.** No puedo leer producción (RLS); dejo `SUPABASE_BORDADO_UNICO_PASO.sql` (solo SELECT): cuántas
   abiertas tienen Bordado sin corte/módulos/empaque en la ruta, con unidades, por fase, por mes de Proyecto y por ruta
   exacta, y cuántas de ellas tienen ruta editada a mano o confirmada. No corrige nada. En el simulador (volcado, meses
   sep–nov) son 252 de 288 órdenes y 103.930 de 121.470 u.
6. **Todas las áreas conectadas** con las reglas de arriba: Tela y Maquila por fase (unidades, capacidad de Tela por
   `capTelaReal`/valor planificado; Maquila sin capacidad propia = dato faltante), centros por ruta (minutos), Lavado y Plancha
   por días. El recuadro «pendiente de conectar» desapareció.

Harness: **2.351 checks, 0 errores, 0 rojas.**
