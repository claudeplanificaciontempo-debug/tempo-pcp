# Auditoría del sistema — 19-sep-2026 (primera entrega: hallazgos y correcciones)

**Cómo se hizo.** Sobre el simulador con el **volcado real** (1.205 órdenes de tareas + 27.336 órdenes de trabajo +
catálogo real de 22 familias / 51 categorías + hoja LMO) se corrió el sistema de punta a punta desde la consola: carga de
órdenes (y recarga del mismo archivo), confirmación de rutas, liberación textil, armado y confirmación de baños,
programación, baño hecho → calidad → liberación a producción, programa por centro, tramo en tablet (inicio, fin,
tallas, guardado), congelado del plan mensual y del programa semanal, nivelación, y un barrido de **invariantes** sobre
el resultado del motor (orden de pasos, solapes, fin programado, recursos, días laborables, capacidad, prendas) y de las
fórmulas (capDia, calcTramo, cargaUnica, liberado + pendiente = total). Modo nuevo del driver `?captura=audit` para
repetirlo. Lo que **no** se puede auditar desde aquí: la **configuración de producción** (centros, recursos, telas,
colores, tablas) — la clave pública no lee nada bajo RLS. Para eso se construyó la **Auditoría del sistema en pantalla**
(abajo), que corre sobre los datos vivos.

## Hallazgos (por gravedad) y qué se hizo

| # | Hallazgo | Gravedad | Estado |
|---|---|---|---|
| 1 | **Cada «Actualizar datos» borraba todas las confirmaciones de ruta (`rutaConf`) y las curvas de tallas (`tallasPedido`)**: estaban en la tabla 14 como «se conservan», pero `aplicarTarea` nunca las copiaba. Como la liberación exige ruta confirmada, después de cada carga nada se podía liberar sin volver a confirmar. También se perdían `histLib`, `lavadoModo`, `compraTela` (la ruta volvía a tejeduría), `rutaRevGeneral`, `rutaPrecargada`, `esperandoMaterial`, la firma de catálogo y la marca «revisar». | **Crítico** | **Corregido**: se copian todos (tabla 14 con filas nuevas, editables); compras rehace el paso proveedor. Probado (AU1). |
| 2 | **El recálculo automático de rutas estaba muerto**: la firma de catálogo (`rutaFirma`) se perdía en cada carga (punto 1), las órdenes nuevas nacían sin firma y `rutaDesactualizada` daba «no» a toda orden sin firma. Resultado en el simulador: 150 lanzadas con ruta vacía cuya categoría sí tiene hoja. | **Crítico** | **Corregido**: firma conservada en la carga, orden nueva sellada al crearse, y toda orden sin firma se sella con el catálogo de hoy en el próximo recálculo (su ruta actual es la línea base: no se rehace nada a ciegas). Probado (AU2). |
| 3 | `recalcularRutas` rehacía la ruta con **todos** los pasos sin mirar la fase: a una orden en fase 8 le ponía corte → confección pendientes (no cargaba por `pasoHecho`, pero la ruta quedaba mal). | Medio | **Corregido**: rehace `rutaCompleta` y deja en `ruta` solo los pasos pendientes de la fase, como `aplicarFaseSistema`. Probado (AU4). |
| 4 | **El motor omite en silencio los pasos sin minutos** (p. ej. estampado con técnica «TEXTIL» sin tiempo): la orden sale con fecha de fin sin ese paso y sin `error` ni `bloqueo`. Reales: 16 en estampado, 14 en lavado (por días). | Alto | **Detectado fuera del motor** (no se tocó `programar()`): `pasosSinProgramar()` + bandeja **«Pasos de la ruta que el motor no programa»** en Hoy → Pendientes y en la auditoría. Marcar el paso dentro del motor (`ro.pasosSinTiempo`) queda **pendiente de tu autorización**. |
| 5 | `liberarCorte(id)` liberaba con `puedeLiberar` (sin la regla de ruta confirmada) mientras `liberarA`/`liberarProd` usan `puedeLiberarA`: dos puertas distintas. | Alto | **Corregido**: una sola puerta. Probado (AU6). |
| 6 | Plan mensual → «Capacidad del plan por centro»: **bordado comparaba puntadas contra minutos** (81,7 M «h» contra 598 h → uso de 227.000 %). | Alto | **Corregido**: capacidad en puntadas (`capMesRecs(…,true)`) y rótulo «(puntadas)». Probado (AU7). |
| 7 | Carga de OT: al juntar varias OT del mismo centro, la **fecha** de fin se tomaba de una fila y la **hora** de otra (`fin` 13-ago, `finTs` 12-ago); el inicio no era el más temprano. | Medio | **Corregido**: fecha y hora viajan juntas; inicio = mínimo. Probado (AU5). (El `Math.round` de `excelFecha` que anota CLAUDE.md como «sin corregir» **ya estaba corregido**; se actualiza la nota.) |
| 8 | Resumen del centro: el visto verde abría «Registrar hecho» y, sin tiempo corrido, moría en un `alert`. | Bajo | **Corregido**: el visto es el cierre del paso (`mCerrarCentro`), que explica o pide motivo. |
| 9 | Una prueba del simulador (ajuste semanal de personas) solo pasaba de lunes a viernes. | Bajo | **Corregido** (usa un día laborable). |

## Lo que se comprobó y está bien (no hay que tocar)

- **Motor** sobre el volcado: 0 pasos desordenados, 0 solapes, fin programado = último paso en todas, recurso siempre del
  centro, ningún paso en día no laborable, ninguna sobrecarga > 5 %, prendas programadas ≤ pendientes, ningún paso de
  producción antes de la tela lista. Los 26 «atraso = sí con fin ≤ meta» son **atraso por colección** (ODC que va tarde
  junta), por diseño.
- **Liberación**: liberadas + pendientes = total en textil (671) y producción (848); las causas que frenan se listan
  (ruta sin confirmar, sin WH, sin receta, tela sin tinturar, color sin Pantone).
- **Tintorería**: propuesta por color respeta capacidad 240/200 con tolerancia 5 %, remanentes en mezcla, máquina por
  rol de color (DARK BLACK → oscuro → DANITECH 2), código `TSEP26-DARKBLACK-01`, baño programado hoy, tela lista al día
  siguiente, «hecho» saca el baño del programa y deja la orden en calidad, calidad aprueba y la orden queda liberable.
- **Tablet**: tramo de 30 min × 8 personas = 240 min-persona, 50 prendas → 4,8 min/prenda; suma a `avance.centros`,
  `tallasLog`, `turnos`; `hechasDelDia` = 50; `puedeCerrarPaso` ok con 30 ≥ 5 min.
- **Congelados**: plan mensual (296 órdenes base, v1) y programa semanal (foto = lo programado esa semana, 5.701
  prendas / 17 órdenes en Corte); `avanceCongelado` mide contra la foto.
- **Fórmulas**: `capDia` = personas × minutos × eficiencia (4.896 para un módulo de 12); `cargaUnica` misma fórmula en
  las cuatro bases; `cargaOficialMes` = plan congelado; nivelación corre (60 órdenes, 19.147 min de saldo en Corte).
- **Pantallas y botones**: el harness recorre todas las páginas y perfiles sin errores (2.500+ comprobaciones).

## Auditoría del sistema en pantalla (nuevo) — para correrla sobre producción

**Reportería por área → «Auditoría del sistema»** (`auditoriaSistema()`): 24 reglas sobre los datos vivos, cada una
con cuántos, ejemplos y qué hacer. Rutas (lanzadas sin paso de producción, sin firma, pasos que el motor no programa,
liberadas sin ruta confirmada), motor (orden, solapes, fin, recurso, tela lista, día no laborable, sobrecapacidad,
prendas), liberación (cuadra), unidades (puntadas sin velocidad), OT (fechas incoherentes), avance > pedido, y datos
(órdenes sin categoría, categorías con órdenes sin hoja ni minuto estimado, fases fuera de la tabla, centros sin
recurso, recursos con capacidad 0, telas sin merma, colores sin Pantone, motivos vacíos, WH repetida). **Ábrela en
producción y mándame la lista**: ahí están las respuestas a «¿los datos están bien parametrizados?» que desde aquí no
puedo ver.

Sobre el volcado (con la configuración de demostración del simulador) quedan: 16 lanzadas sin ruta (categorías sin hoja
LMO: JOGGER, TEJIDOS, FALDAS, Fleece, ENTERIZO), 13 pasos sin programar (estampado sin minutos), 10 categorías con
órdenes sin hoja ni minuto estimado, 62 colores sin Pantone (demo), 6 usos de motivos vacíos (demo).

## Pendiente de tu decisión

1. **Motor**: marcar en `ro` los pasos sin tiempo (`pasosSinTiempo`) para que la orden lo diga en su ficha y en la cola
   (hoy lo detecta la bandeja, fuera del motor). Es un cambio pequeño en `programar()`; no lo toco sin tu OK.
2. **Rutas vacías reales**: las 5 familias sin hoja LMO (JOGGER, TEJIDOS, FALDAS, Fleece Básico/Pesado, ENTERIZO,
   ACCESORIOS): vincular hoja o cargar minuto estimado; hasta entonces su carga es 0 (la auditoría lo muestra).
3. Correr la auditoría en producción y mandarme la salida.
