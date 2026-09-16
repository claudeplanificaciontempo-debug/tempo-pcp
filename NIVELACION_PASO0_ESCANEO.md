# Paso 0 — Escaneo del repo antes de construir la Nivelación de carga

**Nada construido.** Esto es el inventario que pediste, con lo que existe, lo que está a medias y lo que no
está. Todo en `index.html`.

---

## La tabla

| # | Qué | Estado | Dónde |
| ---: | --- | --- | --- |
| 1 | Festivos y días hábiles | **Existe** | `excepciones[]`, `laborable()`, `labR()`, `labDiaGeneral()`, `dsumLab()`, `diasMesArea()` |
| 2 | Módulo ↔ familias que cose | **Parcial** | `poliPct(r,k)`, `recursosDe(k)`, `k.recursos[]` |
| 3 | Capacidad diaria por centro y módulo | **Existe** | `capDia(r,d)`, `capSemana()`, `capMesRecs()` |
| 4 | Agrupación de fases por proceso | **Existe** | `faseGrupos()`, `grupoDe()`, `centroEtapa()` |
| 5 | Maquila | **Parcial** | recurso `maquila`, fases `5Maquila*`, `seccionesModulos()` |
| 6 | Simulador de capacidad | **Existe** | `simuladorCapHTML()`, `SIM`, `ajusteRecDia()` |
| 6b | Motor backward | **Existe** | `fluirAtras()`, `programar()` sección 3 |
| 7 | Plan mensual y congelamiento | **Existe** | `calcularPlan()`, `congelarPlan()`, `S.planes[]` |
| 8 | Lista agrupada con fotos | **Existe** | `filasGRP()` + `whCell()` + `fotoMini()` |

---

## 1 · Festivos y días hábiles — **existe**

| Pieza | Qué hace |
| --- | --- |
| `S.params.cal = {tej:6, tin:6, pro:5}` | días por semana de cada área |
| `S.params.excepciones[]` | `{fecha, area, tipo:'trabaja'\|'no', motivo}` — **es la tabla de festivos**, editable en Configuración → Calendario |
| `laborable(d, diasSem)` | si el día de la semana entra |
| `labR(d, r)` | laborable **para un recurso**: excepción del área primero, luego sus días |
| `labDiaGeneral(d)` | laborable general (área producción + excepciones «todas») |
| **`dsumLab(d, n)`** | **avanza n días hábiles** — es justo lo que pide «fecha final = inicio + días necesarios» |
| `diasMesArea(a, ym)` | días hábiles del mes, con el detalle de excepciones sumadas y restadas |

**Se reutiliza tal cual.** No hay vínculo externo ni lista de festivos en el código: son filas editables.

**Lo único que falta** para tu regla de «dato faltante»: hoy, si nadie cargó excepciones, el calendario
simplemente usa los días por semana. Para la nivelación habría que decidir si eso cuenta como «festivos sin
cargar» o es válido.

---

## 2 · Módulo ↔ familias — **parcial, y es el punto más flojo**

Lo que hay:

- **`poliPct(r, k)`** — rendimiento en % de un módulo en una **familia (categoría padre)**. `r.poli[padreId]`.
  Sin dato = 100 %, **0 = no la hace**. Es el vínculo real que usa el motor.
- **`recursosDe(k)`** / `k.recursos[]` — qué módulos puede hacer una categoría (hereda del padre).

Lo que **no** hay:

- **No existe el concepto de «grupo de módulos»** como el del Excel (Camisetas = M1-M2-M3). Hoy la relación es
  módulo → familia, uno a uno con porcentaje, sin agrupar.
- **No existe el reparto de un módulo entre dos grupos.** Si M4 hace camisas y polos, hoy se expresa con dos
  porcentajes de polivalencia, no con una división de su capacidad. **Para tu punto b) hay que crear esa
  tabla**, y es la decisión de diseño más importante del Paso 2.

---

## 3 · Capacidad diaria — **existe**, con una trampa de unidades

`capDia(r, d)` devuelve, según el área del centro:

| Área | Unidad | Cómo |
| --- | --- | --- |
| Tejeduría | **horas-máquina** | `r.horas` |
| Tintorería | **horas-máquina** | `r.horas` |
| **Producción** | **minutos** | personas × min/día × eficiencia |

En producción respeta, en este orden: **asistencia real del día** (`S.turnos`) → **ajuste de la semana**
(`ajusteRecDia`, del simulador) → personas del recurso. También respeta paradas.

**La trampa:** tu cuadrito pide **unidades por día**, y `capDia` da **minutos**. La conversión necesita el SAM
de la familia — por eso tu punto b) dice «familia homogénea». Para el cuadrito global de confección, que
mezcla familias, hay que mostrar **minutos** (como pides) y las unidades solo como referencia.

Para **tela** no hay capacidad en unidades: tejeduría y tintorería están en horas y kilos. Tu punto a) pide
«entrega diaria de textil en unidades», que **hoy no existe** y habría que derivarla del avance registrado.

---

## 4 · Fases por proceso — **existe y es editable**

Tabla 5, `faseGrupos()`, con 11 grupos sembrados:

`previo a producción · textil · planificación · preparación de corte · corte · maquila externa · servicios ·
confección · terminados · prenda terminada · cerrada`

Cada fila tiene `orden`, `enProceso`, `libTela`, `libCorte`, `secuencial`, `pendiente`. `grupoDe(fase)` mapea
cualquier fase de Odoo a su grupo vía la tabla 1.

Además, `centroEtapa()` mapea **centro → etapa** (tej/tin/proveedor → textil, corte → corte, estampado/bordado/
etiquetas → servicios…).

**Se reutiliza tal cual.** Tu «tabla editable de fases que cuentan como saldo, nada fijo en código» puede ser
una **columna nueva en esta tabla** en vez de una tabla aparte — te lo propongo así para no tener dos sitios
diciendo lo mismo.

**Ojo con tu punto a):** dices «Tela = fases 0 + tejeduría y tintorería, **sin calidad**». Hoy `1Calidad
Tintoreria` cae en el grupo *textil*, así que excluirla exige marcarla fase por fase, no por grupo. Eso empuja
a que la columna nueva sea **por fase**, no por grupo.

---

## 5 · Maquila — **parcial**

| Qué hay | Detalle |
| --- | --- |
| **Recurso** | un recurso del centro `modulos` con `id==='maquila'`; `seccionesModulos()` lo separa de los módulos propios |
| **Fases** | `5Maquila Conf`, `5CD Maquila`, `5Maquila Recepción`, `5Corte Maquila Ibarra`, y el grupo *maquila externa* |
| **Capacidad** | la misma `capDia` que un módulo: personas × minutos × eficiencia |

Lo que **no** hay:

- **No existe «maquila asignada en unidades» por orden ni por mes.** El motor asigna a maquila como a
  cualquier módulo, por capacidad y polivalencia. Tu «saldo neto = saldo − maquila asignada» necesita un dato
  nuevo: **cuántas unidades se decidió mandar a maquila**, que hoy no se guarda en ninguna parte.
- Tampoco hay decisión registrada de «esta orden va a maquila» — sí existe `recursoFijo` por centro, que
  podría servir de base.

---

## 6 · Simulador de capacidad — **existe**, y ampliarlo es viable

Hoy vive **dentro del Plan mensual, Bloque 1**, llamado desde una sola línea.

| Pieza | Qué es |
| --- | --- |
| `SIM = {on, ym, rec, cambios, motivo}` | estado del what-if, **en memoria** |
| `simSet(lun, rec, k, v)` | cambia min/personas/eficiencia de una semana |
| `simCopiar(lun, rec, ym)` | replica esa semana a las demás |
| **`ajusteRecDia(r, d)`** | **la clave**: `capDia` la consulta, y devuelve el cambio simulado si `SIM.on`, o el guardado si no |
| `guardarAjustesCap(ym)` | confirma con **motivo obligatorio** y bitácora |
| `S.params.ajustesCap[ym].semanas[lunes][recId]` | lo guardado (solo lo que difiere de la base) |

**Lo que se reutiliza sin tocar:** el what-if que no guarda hasta confirmar (tu requisito) ya funciona así, y
`ajusteRecDia` es el único punto por donde entra un cambio de capacidad al motor. **Eso es exactamente el
«un solo motor» que pides.**

**Lo que hay que cambiar para ampliarlo:**

1. **Sacarlo del Plan mensual a una pestaña propia** del menú de Planificación de producción, renombrada
   «Nivelación de carga», y que el Plan mensual la **llame** en vez de contenerla.
2. `SIM.ym` es de **un mes**; el horizonte que pides es **multi-mes** (sep–dic). Hay que generalizarlo.
3. Hoy es **por recurso y por semana**. Los cuadritos son **por proceso y por grupo de módulos**, en días. Es
   una vista nueva sobre el mismo estado, no un cálculo nuevo.
4. La vista semanal actual **se conserva** como detalle, como pides.

### Motor backward — qué se reutiliza

`fluirAtras(r, q, hasta, tag, dry)` coloca hacia atrás desde la fecha meta, con **pasada en seco** (`dry`) y
luego en firme. Respeta `labR`, esperas por paso y capacidad.

**Reutilizable para la nivelación:** la idea de la pasada en seco y el uso de días hábiles. **No reutilizable
directamente:** el motor trabaja **orden por orden contra recursos**; la nivelación es **agregada por proceso**
(saldo ÷ capacidad). Son dos cálculos distintos con las mismas entradas. Lo que sí deben compartir es
`capDia`, `labR`/`dsumLab` y la tabla de fases — si no, volveríamos a tener dos verdades.

---

## 7 · Plan mensual y congelamiento — **existe**

**`calcularPlan(ym)`** devuelve `{dem, areas, mods, metas, …}`: demanda del mes (órdenes, prendas, horas de
confección, USD, sin precio), capacidad y carga por área, por módulo, y metas semanales.

**`congelarPlan(ym)`** guarda en `S.planes[]` una versión nueva (v1, v2, …) con:

- `oids` — las órdenes del plan
- `dem` — la demanda
- `areas` — capacidad, carga y días por área
- `mods` — por módulo: personas, capacidad, carga, prendas, familias
- `metas` — metas semanales
- `base` — la foto de las filas
- `ts`, `u` — cuándo y quién

Y marca `S.params.planMes[ym].congelado = {ver, ts, u}`.

**Lo que NO guarda hoy y tu Paso 4 pide:** compromisos, maquila asignada, rezago aceptado y **las decisiones**.
Son campos nuevos en el mismo registro — no hace falta una estructura aparte.

**Congelar hoy no exige nada**: solo pide confirmación. Tu «no se puede congelar con rezagos sin decisión» es
una puerta nueva antes de ese `confirm`.

---

## 8 · Lista agrupada con fotos — **existe**

- **`filasGRP(id, items, filaFn, nCols, oDe, pzDe)`** — agrupador anidado de hasta 3 niveles, con
  `grpSelHTML(id)` para elegir los campos. Campos disponibles: cliente, fase, familia, tipo de producto, tela,
  color, ODC, mes, próximo paso, proyecto, etapa.
- **`whCell(o)`** = `fotoMini(o)` + WH + etiqueta de fase.

**Se reutiliza tal cual para el rezago.** Tu «agrupable por tipo de producto, fase y orden» ya son tres campos
existentes (`hija`, `fase`, y la orden es la fila).

---

## Lo que hace falta decidir antes de construir

1. **Grupos de módulos y reparto (punto 2).** Es lo único que no tiene base en el sistema. Mi propuesta: una
   tabla editable `grupo → módulos[] → familias[]` con **% de capacidad de cada módulo asignado al grupo**, de
   modo que M4 pueda estar 60 % en Camisas y 40 % en Polos y la suma se vea. Los ejemplos del Excel los cargo
   como **siembra**, no como código, y quedan a confirmar con producción.
2. **Fases que cuentan como saldo (punto 4).** ¿Columna nueva **por fase** en la tabla 1 — que es lo que
   permite excluir «1Calidad Tintoreria» de Tela — o por grupo en la tabla 5? Recomiendo por fase.
3. **Capacidad de tela en unidades (punto a).** No existe. Propongo derivarla del avance registrado de los
   últimos N días (N configurable) y mostrarla **junto al valor planificado editable**, como pides — pero si
   no hay avance registrado, sale **«dato faltante»**, no un promedio de cero.
4. **Maquila asignada en unidades (punto 5).** Dato nuevo. ¿Se asigna por mes y proceso, o marcando órdenes
   concretas? Tu Paso 6 sugiere lo segundo («marcar órdenes para maquila»); entonces el número del cuadrito
   sería la suma de lo marcado.
5. **Permisos.** Confirmas que editar capacidades, compromisos, decisiones y congelar es **planificación y
   admin**, y que ingeniería y centros es **solo lectura**. Hoy el permiso `programa` ya cubre exactamente eso
   — lo usaría tal cual, sin crear un permiso nuevo.
6. **NIVELACION_CARGA.xlsx no me lo adjuntaste** en este mensaje. Trabajé con los ejemplos que escribiste. Si
   quieres que replique los cuadritos con más fidelidad, mándamelo.

---

## Riesgos que veo

1. **Dos verdades de capacidad.** Si la nivelación calcula su propia capacidad diaria en unidades y el motor
   sigue en minutos, en dos semanas no van a coincidir. Hay que decidir **quién manda** — propongo que la
   nivelación siempre derive de `capDia` y que las unidades sean una conversión visible, con su SAM a la vista.
2. **«Saldos acumulados: cada proceso cuenta todo lo que aún no pasó por él»** es una definición distinta de la
   carga por centro que ya existe (que cuenta lo que tiene ese centro **en su ruta**). Una orden sin corte en
   su ruta **sí** cuenta en el saldo de corte con tu definición. Conviene confirmarlo: es correcto para nivelar
   capacidad global, pero dará números distintos a los de las pantallas de centro, y hay que decirlo en
   pantalla para que nadie piense que una está mal.
3. **El horizonte multi-mes contra el plan de un mes** (tu Paso 3) va a producir dos cifras distintas en la
   misma pantalla. Tu solución —separar «del mes» y «arrastrado»— lo resuelve; solo hay que ser estrictos en
   rotularlo siempre.
