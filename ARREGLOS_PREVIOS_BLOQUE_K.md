# Arreglos previos a volver a correr el Bloque K

Fecha: 2026-09-13. Solo los cuatro puntos pedidos, más los dos reportes sin arreglar. No se tocó `faseEstado()` ni
nada de lavado/plancha. Verificado con el simulador local (247/247) y publicado en `main`. No se cargó ni se
modificó ningún dato en producción; lo único que cambia en producción es el comportamiento del código al leer lo
que ya está guardado (ver punto 2: las tolerancias 0 ahora sí aplican).

---

## 1 · El calendario del mes manda

**Cómo funciona hoy (después del arreglo).** La única fuente de días laborables es `labR(d, recurso)` / `labArea(d,
área)`: primero mira las excepciones por fecha (lo que se marca en "Planificar el mes" y en Configuración →
Calendario → Excepciones), y si no hay excepción, los días base por semana del área (`S.params.cal`, editable en
Configuración → Calendario). Ya la usaban el motor, el plan mensual (capacidad por área y por módulo), la carga
semanal y el reporte de la Parte 2. Faltaban dos sitios, corregidos:

- **Metas semanales del plan mensual** (`semanasLV`, L1238): tenía fijo "lunes a viernes" (`g===0||g===6` excluidos)
  aunque el calendario de producción marcara sábados. Ahora cada día entra si `labArea(d,'pro')` lo da laborable: con
  `cal.pro = 6` (como está en producción) los sábados cuentan, y un día marcado "no trabaja" en el mes se quita.
- **Carga semanal sin periodo** (`capSemana`, L1005): calculaba capacidad como `capDia × días base por semana`; ahora
  cuenta los días laborables reales de la semana actual con el calendario.

**El campo `dias` de cada recurso — qué hace hoy.** Solo se usa como respaldo en `diasDe(r)` cuando el área no tiene
calendario (`S.params.cal[área]` inexistente). Como el calendario existe para las tres áreas (y `cargarTodo` mezcla
el seed si faltara), **en la práctica nunca se lee**. En Configuración → Centros y recursos ya no es editable: se
muestra como texto "N d/sem" con el aviso "Lo fija el calendario del área". Solo sirve al crear un recurso nuevo (se
guarda `dias:6` y nunca más se consulta). **Recomendación para tu decisión (no la apliqué): sobra; se puede dejar de
mostrar y dejar de guardar. En producción todos los módulos tienen `dias:5` guardado mientras el calendario dice
`pro:6`, lo que confirma que nadie lo usa.**

## 2 · Lo configurado no se sobrescribe

**Regla nueva:** `prm(clave, default)` devuelve el valor guardado si es un número (incluido 0) y solo usa el default
si el parámetro no existe. `prmCal(área, default)` hace lo mismo para los días por semana. Se reemplazaron los 48
sitios `S.params.X || N` / `PP.X || N` y los 3 `cal.pro || 5`. Lista completa de lo corregido:

| Parámetro | Default que se imponía | Valor en producción hoy | Sitios |
|---|---:|---:|---|
| `tol` (tolerancia baño chico) | 15 % | **0** | programar L863 |
| `tolGrande` (tolerancia baño grande) | 5 % | **0** | programar L863/909, confirmarBanoProp, confirmarArmColor, capsTin, moverBano, tagArm |
| `umbral` (llenado mínimo chicas) | 80 % | 80 | programar L863 |
| `pctBueno` | 90 % | 95 | programar, propuestaColor, armarBanosHTML, tagArm, texto de Configuración |
| `pctAprob` | 70 % | 70 | programar |
| `granMin` (máquina grande ≥ granMin×1.2) | 120 kg | 120 | programar ×4, vLiberacion, capsTin, tagArm |
| `granOk` (baño bueno) | 170 kg en programar, **180** en armado y tags (dos defaults distintos) | 180 | programar ×2, armarBanosHTML ×2, tagArm |
| `hReproceso` | 10 h | 10 | programar ×2, mReproceso |
| `tinHorizonteDias` | 0 | 45 | programar ×2 |
| `tejBloqueDias`, `tejCambioHoras` | 0 | 6 / 4 | programar, texto Tejeduría |
| `ventanaColor` | 0 | 0 | programar, escenarios |
| `puntadasMin` | 600 | **6.000** | minPrenda, minPrendaR, Configuración (placeholder y rendimiento), addRecEsp |
| `cal.pro` (días/semana producción) | 5 en costos de escenario, **6** en el selector (inconsistente) | 6 | escenarios ×3, selector |
| `faseMapeoVer` | 1 | 2 | faseMapeo (ver punto 3) |

Y en recursos, donde un 0 también es decisión: `m.min||480` y `r.min||480` (minutos/persona/día) y `m.efic||85`
(eficiencia) pasan a `??` (solo si el campo no existe) en Andon (L1928, L1935) y escenarios (L1362–1363).

**Efecto inmediato en producción**: con `tol=0` y `tolGrande=0` los baños ya no se arman con 15 %/5 % de sobrellenado;
si eso no era intencional, ahora hay que ponerle el valor real en Configuración → Parámetros.

**No cambiados, para tu decisión** (un 0 aquí no es una configuración sino división por cero o capacidad nula):
`r.ppm||puntadasMin` (bordadora sin velocidad usa la del centro), `r.cabezas||1`, `r.mult||1`, `r.vel||1`,
`r.horas||0`, `r.capPique||0`, `poliPct` sin dato = 100 %, `precio||0`, `costos.*||0`. También los que ya eran
`||0` (mismo resultado con 0).

## 3 · La tabla de fases no se puede borrar sola

`faseMapeo()` ahora siembra **únicamente si `S.params.faseMapeo` no existe**. Ni una constante de versión nueva en
el código ni una tabla vaciada a propósito la vuelven a sembrar (`FASE_MAPEO_VER` queda solo como dato informativo
de qué siembra se usó la primera vez). Probado: editar filas y subir la versión no las pisa; una tabla vacía sigue
vacía.

**Sin tocar, para que lo sepas**: las otras tablas de la Parte 1 y 2 (`clasifMaterial`, `origenTela`, `centroEtapa`,
`reglasFamCentro`, `centrosPorOrden`, `mapaCatLMO`) no tienen versión, pero **sí se re-siembran si el usuario borra
todas sus filas**. Si quieres, se les aplica la misma regla.

## 4 · Velocidad de bordado — qué debería ir en r7 (no lo cambié)

La bordadora r7 ("Bordado") tiene `ppm = 921.600` y `cabezas = 24`. El motor calcula puntadas/min de la máquina como
`ppm × cabezas`, o sea 22,1 millones de puntadas por minuto: cualquier orden de bordado "cabe" en segundos.

**Lo que probablemente pasó**: 921.600 = 640 × 24 × 60. Es decir, alguien cargó las **puntadas por hora de toda la
máquina** (640 puntadas/min por cabeza × 24 cabezas × 60 minutos), en un campo que espera **puntadas por minuto de una
sola cabeza**.

**Qué debería ir ahí** (a confirmar por ti con la ficha de la máquina):

| Campo | Hoy | Debería ser |
|---|---:|---|
| `ppm` (puntadas/min por cabeza) | 921.600 | la velocidad nominal de una cabeza: si la cuenta anterior es correcta, **640**; las multicabeza industriales trabajan típicamente entre 600 y 1.000 |
| `cabezas` | 24 | el número real de cabezas de esa máquina (24 es plausible para una multicabeza grande; si son varias máquinas, van como recursos separados) |
| Centro Bordado → "Puntadas/min" | vacío | la misma velocidad por cabeza, para que las órdenes dejen de marcarse "sin velocidad de bordado configurada" y para que `S.params.puntadasMin` (hoy 6.000) coincida |

Con `S.params.puntadasMin = 6.000` el reporte de la Parte 2 convirtió las puntadas a minutos a esa velocidad (no a
600 como dice ese reporte en los puntos 10 y 13.3 — error del reporte, no de la carga). Si la velocidad real por
cabeza es ~640, los minutos de bordado del Bloque K estaban **subestimados unas 9 veces**; con 24 cabezas la
capacidad diaria se multiplica por 24 y la conclusión de ocupación cambia. Por eso conviene corregir r7 y el centro
antes de volver a correr el Bloque K.

Además la "Bordadora nueva" (id `xaladjhe`) tiene `ppm = 800` y `cabezas = 0` (el código usa 1); si no existe,
conviene desactivarla o borrarla.

---

## Reportado, sin arreglar

### A · "Planificar el mes": los días de producción no se pueden editar con el clic

**No es un fallo de código, y no es del mismo tipo que el del Gantt (L2350).** Verificado de dos formas:
en el simulador local, hacer clic en un día de la fila Producción cambia el chip de ✓ a · y guarda la excepción
`{fecha, area:'pro', tipo:'no'}`; y en producción, sin guardar nada, el clic en un día de Producción dispara el diálogo
correcto ("Marcar como laborable dom, 13 sept en Producción?") con el `onclick` bien formado (`togDia('pro',
'2026-09-13', false)`). El del Gantt (L2350) es una expresión regular escrita sin las barras de escape que nunca
coincide con una fecha, así que el código de mover de día no se ejecuta jamás; aquí el código sí se ejecuta.

Causas posibles de lo que viste:
1. El clic abre un **diálogo de confirmación del navegador** ("Marcar como NO laborable …?"). Si en algún momento se
   marcó en Chrome la casilla "Impedir que esta página cree más cuadros de diálogo", `confirm()` devuelve falso de
   inmediato y el clic no hace nada, sin ningún aviso. Se arregla recargando la pestaña.
2. La tabla de días está en **Dirección → Plan mensual**, al pie del panel "Capacidad del mes por área". El 12-sep se
   quitó de Configuración → Calendario (commit `a3184ae`); en Configuración solo quedan los días base por semana y las
   excepciones por rango, no el cuadro de días clicable.
3. En la tabla "Capacidad del mes por área" la columna "Días" es solo texto; los chips clicables son los de la fila
   de abajo.

Si al probar de nuevo el diálogo aparece y al aceptar el día no cambia, dime el mes y el día exactos y lo reproduzco.

### B · Tejeduría y tintorería con 0 h teniendo 60 órdenes en 1Tejeduria y 25 en 1CD Tintoreria

**Causa: liberación.** El motor solo teje y tiñe órdenes que estén **liberadas a tela** (`liberada(o,'tela')`,
L2444), y eso se cumple solo si (a) alguien la liberó en Dirección → Liberación (`o.lib.tela.ok`), o (b) la fase de
Odoo empieza en 2 o más. Las órdenes de la Parte 2 llegaron sin `lib` y con fase 1 (1Tejeduria, 1CD Tintoreria,
1Tintoreria, 1INCOMPLETOS TIN) o 0, así que el motor las deja con bloqueo "sin liberar": no programa corridas de
tejeduría (`P.tej` vacío), no arma baños (`P.banos` vacío) y por eso ambas áreas muestran 0 h. Verificado en
producción: **290 de las 590 órdenes abiertas están "sin liberar"**, y las tres primeras en 1Tejeduria tienen ruta
tej→tin→… con tela y kg, pero `sinLib:'tela'`.

Es decir, el sistema está pidiendo una firma de liberación a órdenes que según Odoo **ya están en tejeduría o
esperando tintorería**. Antes de la Parte 2 no se notaba porque las órdenes entraban por la pantalla de Liberación.

Dos detalles más que pesan en el mismo resultado:
- La tintorería solo consume capacidad con **baños confirmados a mano** (B12 de la auditoría); aunque se liberen las
  órdenes, "Armar baños" seguirá pidiendo confirmar cada baño para que aparezcan horas.
- Las 9 órdenes en 1INCOMPLETOS TIN aportan **0 kg** hasta que alguien anote los kg faltantes (`faltaKg`, B31).

Opciones para tu decisión (no apliqué ninguna): que la carga de la Parte 2 marque `lib.tela.ok` en las órdenes cuya
fase del archivo esté en el grupo textil o posterior (es lo que Odoo ya afirma), o que `liberada()` lea de la tabla
de fases del Bloque A en vez del dígito. Las dos tocan la regla de liberación, que hoy está en código (C1–C2 de la
auditoría).

---
*Commit del código: ver `git log` (arreglos 1–3 en `index.html`, pruebas en `test/driver.js`). Nada más cambió.*
