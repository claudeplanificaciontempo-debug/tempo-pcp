# Varias cosas pendientes (15-sep-2026) — reporte

Commits `ddaf998` y el siguiente. Pruebas del simulador: 703 (18 nuevas), todas verdes. Motor sin tocar.

## 1 · Aviso de capacidad del plan: ahora con minutos PENDIENTES
`cargaPlanCentros` (Bloque 4) ya no suma la ruta completa: por cada centro cuenta solo las prendas que faltan en ese
centro (hechas por fase o por avance de piso descontadas) × minutos/prenda, igual que la carga por centro del resto del
sistema. Una orden que ya pasó por corte no consume corte en el aviso. Las horas de confección del plan también son
pendientes. Prueba: una orden con corte ya hecho aporta 0 minutos a corte.

## 2 · Agrupación colapsable como Odoo (Órdenes, Liberación, Control de piso, Producto en proceso)
Selector "Agrupar por (anidado, hasta 3)" en las cuatro pantallas: **fase, cliente, ODC, categoría padre, categoría
hija, color, proyecto** (y etapa actual). Los grupos salen **cerrados** con el conteo de órdenes y la suma de prendas a
la derecha; clic para abrir; anidado hasta tres niveles en cualquier orden. La preferencia queda en el navegador. En
Órdenes reemplaza a los tres chips viejos (por fase / familia / categoría).

## 3 · Producto en proceso agrupa por COLOR
Sí (estaba en su lista y ahora usa el mismo agrupador colapsable): color, y además fase y proyecto.

## 4 · Gantt de tintorería
En el cuadro máquina × día, un baño que dura más que las horas del día de la máquina se pinta también en los días
laborables siguientes con el mismo color: el primer día dice "día 1 de 3" y los siguientes "↳ sigue · día 2 de 3".
Solo vista (`diasBano`); el motor no cambió. Prueba: un baño de 2,5 días ocupa 3 días laborables.

## 5 · Tintorería: colores y máquinas (hecho en producción, todo en bitácora)
- **SURF SPRAY → CLARO** (clasificado a mano). Sus dos baños ya existían (TOCT26-SURFSPRAY-01, 200 kg; -02, 14 kg): con
  la regla pasaron solos a **DANITECH 1**. No había kilos de SURF SPRAY esperando, así que no hubo baño nuevo que armar.
- **STUART**: agregadas **Jersey 24/1** y **Galleta**. Telas que tiene hoy: Ribb 24/1, Jersey lycra, Ribb 6x6, Jersey 30/1,
  Ribb 30/1, Ribb 2x2 liviano, Jersey 24/1, Galleta. Piqué: sigue en 0 (no tiñe). Telas del catálogo que STUART **no**
  tiene y podría faltar: **Fleece perchado, French terry, Ribb 2x2 grueso** (las de familia B). Dime si las tiñe.
  Resultado: **5 baños se fueron solos a STUART** (143 kg): CONCORD GRAPE 24, BLANCO 37, CAFE 37, GREEN 18, CRUDO 27.
- **Baños bajo 70 %**: se quedan confirmados tal cual (ya estaban confirmados y programados; el % es solo la etiqueta).
  Hoy son 24 en las grandes.
- **3 contradicciones piso/Odoo, manda piso**: cerrados (quitados del armado) TSEP26-TRUERED-01 (WH/MO/28521),
  TSEP26-POMEGRANAT-01 (28950) y TSEP26-POMEGRANAT-02 (28220). El TOCT26-TRUERED-01 (28994/29026/29047) es otro baño,
  sigue programado.

**Cómo queda (48 baños confirmados y programados)**:

| Máquina | Baños | Kg |
|---|---:|---:|
| DANITECH 1 (claro) | 21 | 2.365 |
| DANITECH 2 (oscuro) | 22 | 3.098 |
| STUART (ambos) | 5 | 143 |

**Ojo, algo que no esperaba y te reporto**: ayer terminé con **59** baños confirmados (verificado en la base). Hoy la
base tenía **51** antes de mis cambios. Faltan 8: SWEET LILAC-01, DOESKIN-01, FLINT-01, OCEAN BLUE-01, LIGHT HEATHER
GREY-01 y -02, ALMOND OIL-01 y ARENA-01. La bitácora muestra que anoche (21:35–22:18) alguien con tu cuenta numeró la
cola de Confección y **movió tres baños a máquina fija** (GREEN GABLES-04 → D2, ROSADO COMBINADO-01 → D1, SUNLIGHT-01 →
D1), pero **no hay rastro de los 8 quitados** porque el botón "✕ Quitar este baño" pedía confirmación pero **no escribía
en la bitácora**. Eso ya está corregido (desde esta versión deja código, kg, órdenes y quién). Si los quitaste tú, no
hago nada; si no fuiste tú, dime y los vuelvo a armar (las órdenes siguen esperando en Armar baños).

## 6 · Las órdenes con baño salido según piso: manda piso
Movidas de 1Tintoreria a **1Calidad Tintoreria** con motivo "piso manda: el baño ya salió" (historial + bitácora).
Eran **9**, no 7: WH/MO/28204 POMEGRANATE, 28219 SURF SPRAY, 28342 POMEGRANATE, 28382 SURF SPRAY, 28395 POMEGRANATE,
28483 CELESTIAL, **28497 GREEN GABLES**, 29127 PORT ROYALE, 29215 NEGRO. Quedan esperando la revisión de calidad. En la
próxima recarga, si Odoo sigue diciendo 1Tintoreria, la fase movida a mano se conserva (tabla 14) y la diferencia va a la
bandeja, no se pisa.

## 7 · No se borra nada
Auditoría completa, protecciones y respaldo en **`AUDITORIA_BORRADOS_Y_RESPALDO.md`** (18 lugares revisados; qué borra,
cuándo, si confirma, qué se perdería, y qué se hizo). Resumen de lo cambiado:
- La **bitácora ya no se recorta** (antes quedaban las últimas 500 y el resto se borraba de la base al guardar); tampoco
  las salidas de tintorería. El borrado operativo de Configuración ya no toca la bitácora.
- **Las siembras no pisan tablas vaciadas** (solo entran si la tabla no existe).
- **La recarga de Odoo ya no elimina órdenes**: las que no vienen quedan como "noArchivo" con todo lo suyo; el avance de
  piso no se borra de paso.
- **Toda función que borra pide confirmación y dice qué se pierde** (recursos, centros, categorías, rutas, marcas de
  calendario, reglas, las 19 filas de tablas configurables, retirar liberación, deshacer baño, cargar operaciones
  LMO, restaurar respaldo).
- **Prueba de guardia** en el simulador: lista congelada de 37 funciones de borrado; una nueva, o una sin confirmación,
  hace fallar las pruebas; también vigila que nadie recorte bitácora/salidas ni llame `delete()` a la base fuera de los
  dos lugares conocidos.
- **Respaldo**: el botón "Respaldo" guarda TODO `S` (datos + configuración + bitácora completa) en un JSON; sí alcanza. No
  lleva cuentas (Supabase Auth) ni las imágenes (Storage; sí los enlaces). **Restaurar**: botón nuevo "Restaurar" (admin):
  confirma con conteos, reemplaza y une la bitácora. Detalle y recomendación de respaldo semanal de Supabase en el .md.

## 8 · Traspaso nuevo
`TRASPASO_TEMPO_PCP.md` reescrito completo (reemplaza al anterior): reglas de trato, arquitectura, flujo por pantallas,
cargas desde Odoo y "el sistema es la fuente", fases y dos liberaciones, cambio de fases y compras, plan mensual en
cinco bloques, motor hacia atrás, tejeduría/tintorería con reglas de máquina y registro, macro/compras/proveedores,
producción y tablet, fotos/buscador/agrupación, datos y dónde viven, respaldo, pendientes y mapa de documentos.

## Pendientes tuyos
- Decidir sobre los 8 baños que faltan (§5) y si STUART tiñe Fleece perchado / French terry / Ribb 2x2 grueso.
- Siguen: usuarios de módulo, plan de septiembre, foto WH/MO/29252, tabla 6 "T-BIANCO-SINTEC(COMPACTADORA)".
