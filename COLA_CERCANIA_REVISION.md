# Cola por cercanía — revisión: puntos 1, 2 y 3a

**16-sep-2026 · commits `2973daa` (excelFecha, aparte) y `5fdf69a`.** Harness: **2.016 checks, 0 errores**.
**El 3b no está aplicado**: espera tu visto bueno, como pediste.

---

## 1 · Corte: la cercanía sale del estado de la tela

Tenías razón. En el primer centro de producción los pasos de producción pendientes son **siempre 0**,
así que el umbral en pasos no decía nada y todo caía en «Por llegar».

**`grupoTela(o, llegada)`** decide ahora el grupo, con las reglas que diste:

| Situación | Grupo |
|---|---|
| **Sin WH** (`!o.op` o `o.sinLanzar`) | **Lejanas** |
| Fase del grupo **«previo a producción»** (orden 1 de la tabla 5) o **sin grupo** | **Lejanas** |
| Tela en **tejeduría / tintorería / calidad** | **Por llegar**, con fecha si la hay; si no, «sin dato de llegada» |
| **Tela lista y sin bloqueo** | **Disponible** |

El orden de fuentes de la llegada no cambia: **`ro.bloqueo` manda** → `avance.lista`/fase → `ro.telaLista`.
La llegada se calcula **siempre**, aunque el grupo sea Lejanas, y cada fila lleva en el tooltip **por qué
está en ese grupo** (`porQueTela`).

### Conteos de corte, otra vez

| Grupo | **Antes** | **Ahora** | Prendas |
|---|---:|---:|---:|
| Disponible | 96 | **96** | 27.029 |
| Por llegar | 84 | **0** | 0 |
| Revisar ruta | 0 | **0** | 0 |
| **Lejanas** | 0 | **84** | 29.110 |
| **Total** | 180 | **180** | 56.139 |

Las **84 que estaban mal clasificadas** son las órdenes **sin WH, en fases 0** (`0Diseño`,
`0Recetas Insumos`): ahora están en Lejanas, colapsadas al final, y no ensucian la lista de trabajo.

> **Ojo con un cero:** «Por llegar» queda en **0** porque en este volcado **ninguna orden con WH tiene
> la tela en tejeduría o tintorería** esperando a corte — o ya está lista (96) o todavía es de diseño
> (84). No es que la regla no funcione: es que hoy no hay ese caso. Hay pruebas que fuerzan los tres
> caminos por separado.

**Botones no cambia** (no es el primer centro): 7 Disponible · 39 Por llegar · 0 Revisar · 48 Lejanas.

---

## 2 · `excelFecha` — arreglado, commit aparte (`2973daa`)

`Math.round` → **`Math.floor`**. La parte entera del serial de Excel **es** el día; la fracción es la
hora.

### Revisión de TODOS los conversores de fecha

| Función | Qué convierte | ¿Tenía el problema? |
|---|---|---|
| **`excelFecha`** | seriales numéricos de Excel, texto ISO, `dd/mm/aaaa`, `Date` | **SÍ — arreglado** |
| `excelFechaHora` | seriales a fecha+hora (campos nuevos `iniTs`/`finTs`) | **No** (su `Math.round` es al milisegundo, correcto) |
| `fechaDe` (carga de Odoo, `mOdoo`) | solo `Date` y texto | **No** — y **no acepta seriales numéricos**: si llegaran, los descarta |
| `dsum`, `lunesDe`, `semanaISO`, `diasEntre` | aritmética de fechas ya normalizadas | No |

**`excelFecha` es el único que convierte seriales numéricos.** Lo llaman tres cargadores:

| Cargador | Campo | ¿Afectado? |
|---|---|---|
| **`planOT`** (órdenes de trabajo) | `Fecha de inicio`, `Fecha final` | **SÍ** |
| `planTarea` (órdenes de Odoo) | `fecha` de entrega | **No**: medido sobre el volcado, **0 de 4.230 valores traen hora** |
| carga de proveedores/compras | `fecha` | No trae hora |

### Impacto sobre el archivo

| | |
|---|---:|
| Fechas de OT numéricas | **45.421** |
| Con hora | **45.421** (todas) |
| **Que cambian de día con el arreglo** | **24.727 · 54,4 %** |

Ejemplos reales:

```
WH/MO/22918 · CORTE Y BODEGA · 2025-12-29 17:21 · antes 2025-12-30 → ahora 2025-12-29
WH/MO/22918 · CORTE Y BODEGA · 2025-12-29 17:57 · antes 2025-12-30 → ahora 2025-12-29
WH/MO/22918 · SERIGRAFIA     · 2026-01-30 12:30 · antes 2026-01-31 → ahora 2026-01-30
```

### Impacto aguas abajo: **ninguno, y el motivo importa**

Medí el antes y el después cargando las OT reales de las dos maneras, en caja cerrada:

| | Antes | Después |
|---|---:|---:|
| Órdenes con OT | 681 | 681 |
| **Contradicciones fase vs OT** | 275 | **275** |
| Órdenes atrasadas (`diagAtraso`) | 239 | **239** |
| Meta vencida | 209 | **209** |
| Pasos hechos · corte / confección | 100 / 24 | **100 / 24** |
| Pasos pendientes · corte / confección / empaque / botones | 348 / 428 / 469 / 192 | **348 / 428 / 469 / 192** |
| Cola de corte (disp/porllegar/revisar/lejanas) | 48/0/0/84 | **48/0/0/84** |
| Cola de botones | 7/50/0/37 | **7/50/0/37** |

**Todo idéntico.** No es casualidad: revisé cada uso de `o.ot` en el sistema y **todos leen solo
`.estado`** (y `.odoo` para el mapeo de centros). `pasoHecho`, `faseEstado0`, `hechasCentro`,
`centrosOdooDe` — ninguno mira `.ini` ni `.fin`. **Las fechas de OT se guardan y se muestran en el
reporte de OT, pero no deciden nada.**

Así que el arreglo **corrige lo que se ve y no mueve nada de lo que se calcula**. Es el mejor caso
posible: sin riesgo. Cuando vuelvas a cargar el archivo de OT, las 24.727 fechas se corrigen solas.

**Prueba nueva en el harness**: el mismo día a las 00:00, 04:48, 11:59, **12:00**, 17:22 y 23:58 da
siempre el mismo día; y una comprobación de que la conversión vieja sí saltaba a partir de las 12:00.

---

## 3a · Por qué hay lejanas que llegan hoy — **una sola causa, en 17 de 18**

| Centro | Casos | Causa |
|---|---:|---|
| Botones | **4** | Estampado en la ruta, **sin fecha en el programa** |
| Empaque | **14** | 13 lo mismo (Estampado o Bordado) · 1 sin causa evidente |
| Confección | 0 | — |

**No es el tramo no secuencial, ni una ruta mal armada, ni fechas incoherentes.** Es esto:

> **La ruta tiene Estampado, pero el motor no lo programa: no aparece en `ro.pasos` en absoluto.**

Los cuatro casos de botones, textuales del diagnóstico:

| OP | ODC | Fase | Ruta | Lo que programa el motor |
|---|---|---|---|---|
| WH/MO/28918 | 2774 | 4CD Ensamble | Corte → **Estampado** → Confección → Botones → Empaque | corte 86 min · modulos 1.571 · botones 138 · empaque 38 |
| WH/MO/28741 | SEPTIEMBRE COLOMBIA-H | 4CD Ensamble | Corte → **Estampado** → Confección → Botones → Empaque | corte 88 · modulos 977 · botones 19 · empaque 50 |
| WH/MO/28753 | SEPTIEMBRE COLOMBIA-H | 4Preparacion Insumos | Corte → **Estampado** → Confección → Botones → Empaque | corte 33 · modulos 366 · botones 7 · empaque 19 |
| WH/MO/28808 | 2749 | 3CD CORTE | Corte → **Estampado** → Confección → Botones → Empaque | corte 102 · modulos 2.779 · botones 215 · empaque 41 |

Los cuatro tienen **3 pasos pendientes** (Corte, Estampado, Confección) → pasan el umbral de 2 → Lejanas.
Pero el paso **inmediatamente anterior** (Confección) sí tiene fecha y **termina hoy** → etiqueta «hoy».

### El mecanismo exacto

En `programar()`, un paso se omite de `ro.pasos` cuando el motor lo da por hecho **y** su tiempo por
prenda es 0:

```js
if(s.hecho){if(s.tPaso>0)ro.pasos.push({centro:s.p.centro,min:0,hecho:true,fin:cursor});return}
```

`s.hecho` es `minRef<=0`, y `minRef = pendientes × minPrenda(centro, tPaso)`. En estampado el tiempo
sale de la **técnica y las puntadas de la orden**; esas órdenes **no las tienen cargadas**, así que
`tPaso = 0`, `minRef = 0` y el paso **desaparece del programa**.

**El desencuentro está aquí:** el **motor** lo da por inexistente, pero **`pasoHecho()` no** —mira
cierre de piso, OT, fase y unidades, y ninguna dice que estampado esté hecho— así que la cercanía lo
cuenta como pendiente. Dos criterios distintos sobre el mismo paso.

**Conclusión: es una brecha de datos, no un error de ruta.** Falta la técnica/puntadas de esas
órdenes. Es la misma brecha que ya conocemos de estampado y bordado.

---

## 4 y 5, ya aplicados

**4 · Arrastre.** El tooltip del asa y el del campo de puesto dicen ahora:

> *arrastra para cambiar el puesto. Subirla al puesto 1 le pone puesto manual SOLO a ella; bajar una
> orden numera también las que quedan por encima (una orden con puesto siempre va delante de una sin
> puesto). Lo que quede por debajo sigue ordenándose por cercanía.*

**5 · «Volver al orden por cercanía».** Botón en la cola de cada centro, **solo si hay órdenes con
puesto manual**, con permiso `programa` y confirmación que dice exactamente qué se pierde y qué no se
toca (ni programa, ni fechas, ni recurso fijado, ni ruta). Quita el puesto **y** la marca `porColor`,
y deja **bitácora** (quién, cuándo, cuántas) y **una línea de auditoría por orden**. Si no hay nada que
quitar, avisa y no hace nada. Siete pruebas.

---

## Algo que encontré de paso y arreglé

**Los grupos colapsados no dibujaban sus filas**, así que **una búsqueda o un filtro de fases podía
esconder coincidencias dentro de «Lejanas» o «Revisar ruta»** — justo el problema que estamos
persiguiendo en la auditoría de búsquedas. Ahora, con **cualquier filtro puesto** (buscador, fases o
día), los grupos se abren solos y la cabecera lo dice: *«· abierto porque hay un filtro puesto»*.

---

## 3b — listo para aplicar, esperando tu palabra

La regla de escape queda así, si la apruebas:

- **llegada hoy, mañana o atrasada → sale de Lejanas y pasa a Por llegar.**
- **Si la causa es un error de ruta, además se marca «revisar ruta»** para que no se esconda.

Sobre esa segunda parte, con el diagnóstico en la mano: **en 17 de los 18 casos la causa no es un error
de ruta**, es que **falta la técnica/puntadas** y por eso el motor no programa estampado. Propongo
marcarlas con una etiqueta que diga eso — **«paso sin tiempo: Estampado»** con enlace a la orden— en
vez de «revisar ruta», que mandaría a corregir una ruta que está bien. El caso 18 (el «sin causa
evidente») sí lo dejo en «revisar ruta».

**Dime si lo hago así o prefieres «revisar ruta» para los 18.**
