# Tablet del operario — construido

**17-sep-2026 · commit `4f93e58`.** Harness: **2.183 checks, 0 errores.** El único rojo es el hallazgo
del Paso 0 de cargas (`planOdoo` no existe), que va por otro camino. **No se tocó la nivelación ni la
cola por cercanía.**

---

## A · Visibilidad

**`programadoPara(o, c, rec, P)`** es la única definición: exige **carga real del motor** (`P.pro`) en
ese centro y ese recurso, con día entre hoy y el fin de la ventana. La usan `tabletFilas`,
`ordenesQueVe` (rama operario) y el buscador.

**Se quitó la entrada por `recursoFijo` o por secuencia sin programa.** Antes bastaba con tener el
recurso fijado para aparecer; hay una prueba que lo fija: una orden con recurso fijo **pero sin
programa ya no aparece**.

**Ventana:** `prm('diasVentanaTablet', 5)` días hábiles desde hoy, contados con `finLabInc` (hoy cuenta
como día 1). Editable en Configuración. **0 = solo hoy.**

**Sin fallback.** Si `programar()` falla, `ordenesQueVe` devuelve **cero órdenes** y deja `ERR_PROG`;
la pantalla muestra **«Error en la programación — avise al supervisor»**. Probado: con el motor
lanzando una excepción, el operario no ve **ninguna** orden.

**Fuera del plan.** Una orden que ese puesto ya empezó sigue visible **mientras el tramo esté abierto**,
marcada **«fuera del plan · solo terminar»** y **sin botón de iniciar**. Al cerrar el tramo **desaparece**
de su lista. En la cola del supervisor aparece **«en proceso fuera del plan»**, y la marca también
desaparece al terminar. Cuatro pruebas.

**Pasos sin minutos.** `pasoSinTiempo(o,c)` detecta la ruta que pasa por el centro sin minutos por
prenda. El motor no los programa, así que **el operario no los ve**. Si el supervisor les fija recurso y
fecha (`fijadaPara`), pasan a ser visibles **marcados «sin tiempo estándar»**, y el tramo **registra
tiempo real igual** (probado: 20 minutos de tramo dan 20 minutos, no dependen del estándar).

En la cola del supervisor se añadió la acción **«asignar a operario»** (recurso + día de arranque, a
bitácora) y la marca **«paso sin tiempo»** en la fila.

**Cola vacía:** «Sin programación cargada — avise al supervisor», diciendo el centro, el puesto y los
días de la ventana.

**Buscador del operario:** solo dentro de lo programado. Si la orden existe pero está fuera:
**«No está programada — consulte al supervisor»**, con las WH que coinciden y **sin ofrecer INICIO**.

### Cómo encaja con la revisión 3 del motor (pendiente)

Hoy el motor **omite** de `ro.pasos` los pasos sin minutos, así que `programadoPara` no los ve y la única
forma de trabajarlos es que el supervisor los asigne. **Eso es deliberado: nadie empieza a ciegas un paso
que el sistema no sabe medir.**

Si apruebas la revisión 3 —que el paso se conserve con `error:'sin tiempo'`, sin fechas— **nada de esto
se rompe**: `programadoPara` mira `P.pro` (el reparto día × recurso), y un paso en error **seguirá sin
generar `P.pro`**, porque no se puede colocar sin duración. Es decir: **con o sin revisión 3, el camino
del operario es el mismo** —lo ve solo si el supervisor se lo asigna— y lo que cambia es que el
supervisor **verá el paso en el programa marcado como error** en vez de no verlo. `pasoSinTiempo` ya
contempla los dos casos (el paso ausente y el paso con 0 minutos). **No hay que rehacer nada aquí.**

---

## B · Cierre con tiempo corrido

**`minMinutosCierre` = `prm('minMinutosCierre', 5)`**, editable en Configuración. **Queda pendiente que
planta confirme el valor**, como dijiste.

**Tiempo efectivo** = suma de `calcTramo(...).trabajado` de **todos** los tramos de esa orden en ese
centro. Varios operarios y varios días **cuentan juntos** — probado con dos tramos que por separado no
llegan al mínimo y sumados sí. `calcTramo` ya descuenta **paros** y **ventanas de descanso** (hoy ningún
centro tiene ventanas cargadas, así que en la práctica es *bruto − paros*).

**`puedeCerrarPaso(oid, c)`**:

| Situación | Resultado |
|---|---|
| Sin ningún tramo | **bloquea** · «Debe iniciar y registrar tiempo antes de cerrar» |
| Suma < mínimo | **bloquea** · mismo mensaje, diciendo los minutos y el mínimo |
| Suma ≥ mínimo | **permite** |
| …y menor que unidades × SAM × (1 − `tolMinPrenda`) | permite y marca **`cierres[c].tiempoBajo`** + bitácora |
| …**sin SAM** | permite y **no marca nada** (`sinEstandar`): dato faltante, no falso positivo |

**Una sola puerta:** `cerrarCentro`, `confirmarHechoCentro` (el «✓ hecho» del supervisor) y
`terminarOrdenCentro` pasan todos por `puedeCerrarPaso`. Hay dos pruebas que lo verifican leyendo el
código, para que nadie abra una puerta nueva.

**El supervisor puede cerrar sin tiempo** con **motivo obligatorio** de la tabla 15, uso nuevo
**«cierre sin tiempo»**. Queda `cierres[c].sinTiempo = true`, el motivo, **bitácora** y **auditoría**.
Un motivo inventado se rechaza. Al operario no se le ofrece ese camino: se le dice que avise al
supervisor.

Los cierres guardan ahora también **`minutos`** (el tiempo efectivo), **`tiempoBajo`** y **`sinEstandar`**,
que es lo que necesita reportería para mostrarlos junto a los de faltante.

---

## Lo que conviene mirar en la planta

1. **El mínimo de 5 minutos.** Es el valor inicial que pediste; si en corte o empaque hay pasos
   legítimos de menos de 5 minutos, bajarlo. Está en Configuración → Calendario y parámetros.
2. **La ventana de 5 días hábiles.** Si un operario dice que «no le aparece nada» y el supervisor ve la
   orden en la cola, lo primero es mirar si cae dentro de la ventana.
3. **Las ventanas de descanso siguen vacías** en todos los centros (tabla 18). Mientras sigan así, el
   almuerzo solo se descuenta si el operario lo marca como paro. Con el mínimo en 5 minutos da igual,
   pero cuenta para `tiempoBajo`.
4. **Los cierres viejos no tienen `minutos`**: los hechos antes de hoy no traen el dato. No se
   recalculan hacia atrás.

## Pendiente de ti

- **Confirmar el mínimo** con planta.
- **Cargar motivos de «cierre sin tiempo»** en la tabla 15: mientras esté vacía, el supervisor **no
   puede** usar ese camino (el botón queda deshabilitado y lo dice).
- **Commit 5** (las 14 pantallas del redibujo parcial) sigue pendiente; lo empiezo cuando digas.
