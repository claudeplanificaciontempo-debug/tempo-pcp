# Tablet del operario — PASO 0 (escaneo, sin construir)

**16-sep-2026.** Respuesta a las cuatro preguntas del Paso 0 del punto 5. **No se construyó nada.**

---

## a) Qué arma la lista del operario y qué filtra hoy

| Pieza | Función | Qué hace hoy |
|---|---|---|
| **La cola de la tablet** | `tabletFilas(c, rec, P)` | `filasDeCentros([c], P, lun, dom, '')` → `colaCentro(c, filas)`. Es decir: **órdenes abiertas con el centro en su ruta y el paso no hecho**, ordenadas por cercanía, **acotadas a la semana en curso** (`lun..dom`) solo por `pzSem` (prendas programadas en la semana) o por `paso.ini`. Si hay `rec`, se queda con las filas cuyo `paso.rec===rec`, o con `recursoFijo[c]===rec`, o que estén en `P.secMod[rec]` (secuencia de costura). |
| **Lo que el operario puede ver** | `ordenesQueVe()` (rama `esOperario()`) | Si el perfil es `tablet`: toma **todo `P.pro`** (todos los días, no solo la semana), filtra por `centro` (y `rec` si lo tiene) y devuelve las órdenes con carga programada ahí. **Sin fallo del motor.** Si `programar()` falla, cae a *«toda orden con el centro en su ruta»* — un fallback silencioso que contradice tu regla. |
| **El buscador del operario** | `tabletBuscadorHTML(c, cola, rec)` → `calza()` | Busca en **la cola** (`enCola`) **y en `S.ordenes` entero** (`otras`): una WH que no está programada **sí aparece**, marcada por `tarjetaWHTabletHTML(o,c,rec,null)` como «pedir reprogramación». Calce por `normTxt(o.op)`, `o.ref` y por número (≥ 3 dígitos). Desde el commit `588d47e` busca al escribir (`buscarQ`) y conserva el botón **Buscar**. |
| **Secciones de la cola** | `seccionColaTabletHTML` + `estadoOrdenCentro` | `proceso` (tramo abierto o unidades registradas) · `disponible` · `proxima` (`secuenciaCentro`) · `terminada`. |

**Lo que hoy contradice el punto 5A:**
- La lista **no exige** que la orden esté programada para el recurso: basta con que esté en la cola del centro (cercanía) y que `paso.rec` coincida **o** que tenga recurso fijo **o** esté en la secuencia. Una orden **sin programa** (`paso` vacío) con `recursoFijo[c]===rec` **aparece**.
- El buscador **muestra órdenes fuera del plan** (con la tarjeta «pedir reprogramación»), aunque no deja iniciarlas desde ahí… **salvo que `tabletFilas` la incluya** por recurso fijo.
- **No existe** el mensaje «Sin programación cargada — avise al supervisor»: con cola vacía se muestra la cola vacía.
- **No existe** ningún parámetro de ventana: la semana viene fija de `lunesDe(hoy())..+6`.

## b) Qué define «programado» por recurso, y en qué ventana existe el dato

- **`P.ordenes[oid].pasos[]`** = `{centro, min, rec, ini, fin, limite}` por paso de producción. `rec` es el recurso que el motor eligió (o el fijado). Lo produce `programar()` sección 3 (`fluirAtras` en el motor hacia atrás) **al día**, sin hora.
- **`P.pro[]`** = `{op, centro, rec, dia, pz, min}` — el reparto **día × recurso** de cada paso. Es lo que `ordenesQueVe` mira para el operario.
- **Ventana del dato:** el motor programa **hasta colocar toda la carga**, sin tope de calendario (el bucle de `fluirAtras`/`fluir` avanza día a día con guarda de 400 iteraciones ≈ 400 días). Así que `P.pro` puede tener días muy lejanos. **`tabletFilas` mira la semana en curso; `ordenesQueVe` mira todo.** Son dos ventanas distintas y ninguna es un parámetro.
- **Un paso sin minutos** (sin técnica/puntadas/SAM) **no está en `pasos` ni en `P.pro`** — es el hallazgo del diagnóstico del motor (revisión 2 de la cola): esas órdenes **no aparecen como programadas** en ese centro aunque la ruta pase por él.
- **Programación manual del centro:** `o.progCentro[c]={pri, rec, desde}` (puesto, recurso y fecha fijados por el supervisor) alimenta al motor; no es un «programa» por sí mismo.

**Para el parámetro de ventana** propongo `prm('diasVentanaTablet', 7)` en días hábiles hacia adelante desde hoy, aplicado sobre `P.pro` (día del paso en el recurso) — una sola definición de «programado para mí» que usen `tabletFilas`, `ordenesQueVe` y el buscador.

## c) Cómo se registra inicio / fin / pausa, y dónde se valida el cierre

**Tramos** (`S.avance[oid].tramos[]`): `{id, centro, rec, ini, fin, u, uFin, paros:[{ini,fin,min,motivo,u}], tallas, pz, min, minPersona, pers, minPrenda}`.

| Acción | Función | Qué guarda |
|---|---|---|
| INICIO | `iniciarTramo(oid,c,rec)` | `ini` (ISO con hora), `u`; exige `regHechoOk(c)`; una sola orden abierta por puesto (`tramoAbiertoDe`) |
| PARO | `pararTramo` (motivo tabla 15, uso «paro») | `paros[].ini` |
| REANUDAR | `reanudarTramo` | `paros[].fin` y `min` |
| FIN | `terminarTramo` | `fin`, `uFin`; bitácora con el tiempo |
| Guardar unidades | `guardarTramo` | `pz` por talla, suma a `S.turnos`; **permite 0 unidades con confirmación** |

**Tiempo efectivo** (`calcTramo`): `trabajado = max(0, (fin − ini) − paros − ventanas de descanso del centro)`. Los paros se descuentan por `minParos` (cerrados por `fin−ini`; abiertos hasta «ahora»). Las **ventanas** (tabla 18, `minutosVentana`) solo se descuentan si el operario **no** marcó el almuerzo como paro (`almMarcado`). Hoy **ningún centro tiene ventanas cargadas** (`centrosSinDescansos()` las reporta), así que `trabajado = bruto − paros`.

**El cierre del paso** (`cerrarCentro(oid,c,motivo)`) valida **solo dos cosas**: permiso (`regHechoOk`) y, si hay faltante, un motivo de la tabla 15 (uso «cierre»). **No mira si hubo tramo, ni cuánto tiempo pasó.** `mCerrarCentro` lo llama directo cuando no hay faltante; `terminarOrdenCentro(tid,oid,c)` primero guarda el tramo si tiene uno y después cierra. `confirmarHechoCentro` (el «✓ hecho» del supervisor) tampoco mira tiempo.

**Rpc del supervisor de piso:** solo existen `mover_fase` y `set_prioridad_centro`. **No hay rpc de cierre** — el cierre escribe en `avance` (tabla de piso, permitida por RLS a los perfiles de piso). Así que «la misma regla en el cierre por rpc» hoy no aplica a un rpc: aplica a `cerrarCentro`, que es la única puerta.

**Parámetros que ya existen** (para reutilizar): `topeHorasTramo` (10 h, tramos olvidados), `tolMinPrenda` (15 %). **No existe** `minMinutosCierre`.

## d) Cuántos cierres del volcado se hicieron sin tramo o con tiempo cero

**No se puede medir desde aquí, y el motivo es concreto:** los cierres y los tramos viven en **`avance` (Supabase)**, no en el volcado de Odoo (`tarea_rows`, `ot_rows`, `lmo_rows`). La clave pública no lee `avance` sin sesión (RLS), y no entro con tu cuenta. Lo que sí puedo dejar es la consulta de **solo lectura**, para que la corras en el editor SQL:

```sql
-- cierres por centro, cuántos SIN tramo en ese centro y cuántos con tiempo efectivo cero
with c as (
  select id as oid, k.key as centro, k.value as cierre
  from avance, jsonb_each(data->'cierres') k
  where data ? 'cierres'
), t as (
  select id as oid, t.value as tramo
  from avance, jsonb_array_elements(coalesce(data->'tramos','[]'::jsonb)) t
)
select c.centro,
       count(*) as cierres,
       count(*) filter (where not exists (
         select 1 from t where t.oid=c.oid and t.tramo->>'centro'=c.centro)) as sin_tramo,
       count(*) filter (where exists (
         select 1 from t where t.oid=c.oid and t.tramo->>'centro'=c.centro
           and coalesce((t.tramo->>'min')::numeric,0)<=0)) as con_tiempo_cero
from c group by c.centro order by cierres desc;
```

Si prefieres, la app puede mostrar lo mismo en Reportería por área con una sesión tuya (misma cuenta que ya lee `avance`).

---

## Lo que construiría en el Paso 1 (cuando lo apruebes)

**A · Visibilidad**
- `programadoPara(o,c,rec)`: una sola definición — hay `P.pro` con `centro=c`, `rec=rec` y `dia` dentro de `prm('diasVentanaTablet',7)` días hábiles desde hoy. La usan `tabletFilas`, `ordenesQueVe` (rama operario, **sin el fallback**) y el buscador.
- Excepción única: tramo abierto de ese puesto → visible con etiqueta **«fuera del plan»**, solo con **Terminar**.
- Cola vacía → **«Sin programación cargada — avise al supervisor»**.
- Buscador: solo dentro de lo programado; si la orden existe fuera → **«No está programada — consulte al supervisor»**, sin INICIO.
- `colaCentro` del supervisor no cambia.

**B · Cierre con tiempo**
- `prm('minMinutosCierre', <valor inicial que tú digas>)`, editable en Configuración.
- `puedeCerrarPaso(oid,c,rec)` → `{ok, motivo, minutos}`: exige tramo con `ini` y `calcTramo(...).trabajado ≥ mínimo` (tiempo **efectivo**: bruto − paros − ventanas).
- Botón de cierre deshabilitado con **«Debe iniciar y registrar tiempo antes de cerrar»**.
- Supervisor (`puede('programa')` o `reprogramar`): puede cerrar sin tiempo **con motivo obligatorio** de la tabla 15 (uso nuevo «cierre sin tiempo»); queda `cierres[c].sinTiempo=true` + bitácora + auditoría; `cierresConFaltanteHTML` lo saca en reportería.
- La misma `puedeCerrarPaso` dentro de `cerrarCentro` (única puerta), así que vale para cualquier camino, rpc futuro incluido.

**Las 8 pruebas del harness** que pediste quedan escritas contra esas funciones.

**Dos decisiones que necesito:** el **valor inicial** de `minMinutosCierre` y de `diasVentanaTablet`, y si el «fuera del plan» de una orden iniciada **caduca** al terminar el tramo o se mantiene hasta que el supervisor la reprograme.
