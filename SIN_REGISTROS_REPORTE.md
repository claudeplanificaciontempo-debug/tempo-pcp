# Avance sin registros · y qué es «Vienen después»

**Commit:** `1fc0bcc` · **Harness:** 1.630 pruebas verdes, sin errores.

---

## 6 · «0 hechas» no es lo mismo que «sin registros»

Tenías razón en que eran dos cosas distintas mostradas igual. Un centro en 0 puede **no haber producido** —
problema de planta — o **no haber registrado** — problema de registro. Ahora se ven distinto.

### Qué cuenta como registro

Cualquiera de estos, en ese centro y ese día:

- avance por **talla** o por **total** en Mi centro
- un **tramo cerrado**
- la **producción de un turno** en Control de piso
- un **paro registrado** — si alguien registró un paro, estuvo ahí

**Un turno sin producción no cuenta** (está probado): marcar asistencia no es registrar producción.

### Solo se reclama en días laborables

`diasConTurno` mira el calendario de los recursos del centro. A un centro no se le reclama registro un día en
que no tiene turno, y un centro que no trabajó en toda la semana **no aparece** en la brecha.

### Cómo se ve

**En las tarjetas de día:**

```
┌──────────────────────────┐    ┌──────────────────────────┐
│ mar, 15 sept             │    │ mié, 16 sept             │
│ Carga              980   │    │ Carga            1.100   │
│ 2.450 / 7.344 min · 33%  │    │ 2.750 / 7.344 min · 37%  │
│ Avance             740   │    │ Avance   [sin registros] │
│ Pendientes         240   │    │ Pendientes           —   │
└──────────────────────────┘    └──────────────────────────┘
```

Los pendientes quedan en **—**, no en un número: sin registros no se sabe cuánto falta.

**En el avance de la semana:**

| Centro | Programadas | Hechas | Pendientes | Cumplimiento |
| --- | ---: | ---: | ---: | --- |
| Corte | 4.820 | 3.110 | 1.710 | ▓▓▓░░ 65 % · **2 días sin registrar** |
| Estampado | 1.200 | **—** | **—** | **sin registros esta semana** |

Cuando hay registros pero faltan días, el cumplimiento se muestra **con la advertencia de cuántos días
quedaron sin registrar** — porque ese % está calculado sobre información incompleta.

### La brecha, en Reportería por área

Panel nuevo **«Registro de producción por centro y día»**: una matriz de centro × día de la semana con ✓ donde
hubo registro, — donde el día era laborable y no lo hubo, y · donde el centro no trabaja. Al final, el
resumen: qué centros no registraron **nada** y cuántos días laborables quedaron sin registrar en total.

---

## 7 · «Vienen después»: qué es, y por qué se queda

### Qué muestra

Órdenes que **el programa ya fechó en este centro**, pero con **fecha de inicio posterior a la semana que
estás viendo**. Es el adelanto de lo que llega la semana que viene y la siguiente.

### En qué se diferencia del «Lo que viene» que eliminamos

| | **Lo que viene** *(eliminado)* | **Vienen después** *(se queda)* |
| --- | --- | --- |
| Qué mostraba | órdenes **en un paso anterior** de su ruta | órdenes **ya fechadas** en este centro |
| Tenían fecha aquí | **no**, todavía no les tocaba | **sí**, para después de esta semana |
| Qué columna traía | «dónde está ahora» (Tintorería, En confección…) | fecha de inicio y dónde está |
| Por qué sobraba | **la lista principal ya dice dónde está cada orden** | — |

### ¿Repite la lista de arriba? **No**

Los dos conjuntos son **disjuntos por construcción**, y hay una prueba que lo verifica:

- **Órdenes de la semana** = las que tienen prendas **esta** semana
- **Vienen después** = las que tienen **cero** prendas esta semana y empiezan **después** del domingo

Ninguna orden puede estar en las dos. Por eso **lo mantuve**.

Lo que sí hice es **arreglar el rótulo**, que era ambiguo. Antes decía «órdenes con inicio posterior»; ahora
dice: *«órdenes que el programa ya fechó en este centro, pero para **después** de esta semana · ninguna está en
la lista de arriba»*.

Si prefieres quitarlo igual, dímelo — pero mi recomendación es dejarlo: es la única vista que tiene el
ingeniero de lo que le llega, sin tener que ir semana por semana con las flechas.

---

## Archivos tocados

| Archivo | Qué cambió |
| --- | --- |
| `index.html` | `hayRegistroEn`/`diasConTurno`/`registroSemana`/`brechaRegistro`/`brechaRegistroHTML`; `datosDiaCentro` y `avanceSemanaCentro` devuelven `sinRegistro`/`sinReg`/`diasSinReg`; las tarjetas y el avance los pintan; rótulo de «Vienen después» |
| `test/driver.js` | 22 pruebas nuevas |
| `SIN_REGISTROS_REPORTE.md` | este reporte |

---

## Brechas

1. **Esta brecha se va a ver grande al principio.** Hasta que los centros usen Mi centro o Control de piso a
   diario, casi todos van a salir «sin registros». Eso es correcto — antes se veía como 0 % de cumplimiento,
   que era peor: parecía un problema de producción.
2. Siguen pendientes tus decisiones: **la ruta por defecto de las 22**, el **diseño de tejeduría**, el
   **centro de las operaciones de BVD y FITS** y los **datos de las lavadoras**.
