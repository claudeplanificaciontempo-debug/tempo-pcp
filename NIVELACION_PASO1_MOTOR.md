# Nivelación de carga — PASO 1: el motor y el cuadrito

**16-sep-2026.** Alcance entregado: **solo el Paso 1** — el motor de nivelación y el cuadrito
reutilizable. **No se tocó el simulador de capacidad ni el plan mensual.** No se pasa al Paso 2
hasta tu aprobación.

Del Excel de nivelación se tomó **solo el esquema de trabajo** (los once pasos del cálculo y el
orden en que se leen). **Ninguna cifra del Excel entró al sistema**: todos los números de este
reporte salen del volcado real de Odoo que ya está cargado.

---

## 1 · El motor: `nivelar()`

Un solo cálculo, en **minutos**, con las unidades al lado. Devuelve los once pasos del cuadrito.
Lo que falte vuelve como `null` y se pinta como **«dato faltante»**: nunca un valor por defecto
silencioso, nunca un cero disimulado.

| Paso | Fórmula |
|---|---|
| 1 Saldo por procesar | de `saldoProceso()` / `saldoGrupo()` |
| 2 − marcado a maquila | órdenes con `recursoFijo.modulos = maquila` |
| 3 = Saldo neto | saldo − maquila, nunca negativo |
| 4 Capacidad diaria | `capDia()` — **el mismo del motor**, con turnos y ajustes de semana |
| 5 Días necesarios | `ceil(neto ÷ capacidad)` |
| 6 Fecha de inicio | editable · **no puede ser anterior a hoy** |
| 7 Fecha final | `dsumLab(inicio, días necesarios)` — solo hábiles |
| 8 Fecha de compromiso | editable |
| 9 Días disponibles | `diasHabilesEntre(inicio, compromiso)` |
| 10 Producción alcanzable | capacidad × días disponibles |
| 11 **Rezago** | `max(0, neto − alcanzable)` |
| + Meta diaria | neto ÷ días disponibles |
| + Holgura | días disponibles − días necesarios |

**Cero es cero.** Una capacidad configurada en 0 no se reemplaza: alcanzable = 0 y el rezago es
**todo** el saldo. Un saldo de 0 da 0 días y «cabe». Probado.

**Lo compartido es lo de siempre, no hay una segunda versión de nada:** `capDia`, `labR`/`dsumLab`,
`minPrenda` (el SAM del motor) y la tabla de fases. El motor de programación **no se tocó**.

---

## 2 · El SAM: `samOrdenCentro(o, centro)`

Sale de `minPrenda(centro, técnica)` — exactamente el mismo que usa `programar()`. Devuelve
**`null`, nunca 0**, cuando no hay minuto por prenda. Una orden sin SAM **no suma como cero y no se
descarta**: queda fuera del cálculo y **a la vista**, con sus unidades.

El **SAM ponderado** (minutos ÷ unidades del saldo) es la conversión minutos ↔ unidades y se
muestra escrito en el cuadrito, para que se pueda rehacer la cuenta a mano.

---

## 3 · La tabla de fases tiene una columna nueva: «nivelación»

Tabla 1 (Configuración → Órdenes y materiales). Por cada fase se elige a qué proceso de la
nivelación cuenta. **Solo «Tela por entregar» se define por fase**; Corte, Confección y Empaque
salen de la **ruta** de la orden, no de la fase.

Así queda resuelto lo que pediste en el punto 2: `1Calidad Tintoreria` **no se marca** como tela y
por lo tanto no cuenta en el saldo de tela.

## 4 · El saldo es «por procesar», no la carga del centro

`saldoProceso(proc, horizonte)` toma las órdenes **abiertas** (la definición única, `abiertaDe`) que
tienen ese proceso **en su ruta** y todavía no lo terminaron (`pasoHecho`), **estén en la fase que
estén**. Una orden que hoy está en tintorería ya suma en el saldo de corte.

El cuadrito lo dice con todas las letras:

> **Saldo por procesar (incluye órdenes en fases anteriores)** · distinto de la carga actual del centro

El horizonte es por **mes de entrega** (`fechaMetaDe`) y, sin elegir nada, arranca en el **mes en
curso**.

---

## 5 · Datos de prueba — cuadrito de **CORTE**

Volcado real. Base **abiertas: 1.078 órdenes** (lanzadas: 582). Horizonte: **2026-09** (el mes en
curso, el valor por defecto). Fechas puestas para la prueba: inicio 17-sep, compromiso 15-oct.

| Paso | Minutos | Unidades |
|---|---:|---:|
| Saldo por procesar | **13.565,53 min** | **22.442 u** |
| − marcado a maquila | 0 | 0 |
| = Saldo neto | **13.565,53 min** | 22.442 u |
| Capacidad diaria | **3.264 min/día** | ≈ 5.400 u/día |
| Días necesarios | **5** hábiles | |
| Fecha de inicio | 2026-09-17 | |
| Fecha final | **2026-09-24** | |
| Fecha de compromiso | 2026-10-15 | |
| Días disponibles | **20** hábiles | |
| Producción alcanzable | **65.280 min** | ≈ 108.000 u |
| **Rezago** | **0** | **0** → **cabe** |
| Meta diaria para cumplir | **678,28 min/día** | ≈ 1.122 u/día |
| Holgura | **+15 días** | |

- **SAM ponderado: 0,6045 min/prenda** (13.565,53 ÷ 22.442). Con ese SAM se convierte cada fila a
  unidades; está escrito en el cuadrito.
- **109 órdenes** en el saldo. Ejemplos: `WH/MO/28950 · CAMISETAS / Camiseta CR · 448 u`,
  `WH/MO/28936 · SHORT PLANOS / Short Basico · 78 u`, `WH/MO/28918 · CAMISAS / Camisas MC · 66 u`.
- Capacidad: **«1 recursos · capDia de hoy»** — la nota va al lado del número, se ve de dónde sale.
- **Sin SAM en este cuadrito: 5 órdenes · 1.123 unidades**, avisadas aparte y **no sumadas como cero**.

Sin el horizonte (todos los meses), corte da **397 órdenes · 152.279 u · 89.034,55 min**
(SAM ponderado 0,5847).

---

## 6 · Datos de prueba — cuadrito de un **GRUPO DE MÓDULOS**

Grupo armado para la prueba con el volcado real (la tabla real **nace vacía**, como decidiste):

- **Módulo 1 al 100 %** → 4.896 min/día × 100 % = **4.896**
- **Módulo 2 al 50 %** → 4.896 min/día × 50 % = **2.448**
- **Capacidad del grupo: 7.344 min/día**
- Familias: **BODY, BOMBER**

| Paso | Minutos | Unidades |
|---|---:|---:|
| Saldo por procesar | **10.312,70 min** | **596 u** |
| − marcado a maquila | 0 | 0 |
| = Saldo neto | **10.312,70 min** | 596 u |
| Capacidad diaria | **7.344 min/día** | ≈ 424 u/día |
| Días necesarios | **2** hábiles | |
| Fecha de inicio | 2026-09-17 | |
| Fecha final | **2026-09-21** | |
| Fecha de compromiso | 2026-10-15 | |
| Días disponibles | **20** hábiles | |
| Producción alcanzable | **146.880 min** | ≈ 8.489 u |
| **Rezago** | **0** | **0** → **cabe** |
| Meta diaria para cumplir | **515,64 min/día** | ≈ 30 u/día |
| Holgura | **+18 días** | |

- **SAM ponderado: 17,3032 min/prenda** (10.312,70 ÷ 596).
- **5 órdenes**. Ejemplos: `WH/MO/28772 · BOMBER / Bombers · 28 u`, `WH/MO/28767 · BOMBER / Bombers · 28 u`,
  `WH/MO/28493 · BODY / Body · 90 u`. **Ninguna sin SAM** en este grupo.
- Reparto: si un módulo queda repartido a más del 100 % entre todos los grupos, sale como **error
  visible** y **no se corrige solo**. Probado con 60 % + 60 % = 120 %.

**Las 21 familias del volcado** disponibles para armar grupos: BODY, BOMBER, BVD, CAMISAS,
CAMISETAS, CHOMPA, **DENIM** (JEANS ya está unificado), ENTERIZO, FALDAS, FITS, Fleece Basico,
Fleece Pesado, HENLEY, HODDIE, JOGGER, PANTALONES PLANOS, POLOS, SHORT FLECCE, SHORT PLANOS,
TEJIDOS, VESTIDOS.

---

## 7 · Cuántas órdenes quedaron **sin SAM**

Sobre las **1.078 órdenes abiertas**, sin horizonte (todos los meses):

| Proceso | Órdenes en el saldo | Unidades | Minutos | SAM ponderado | **Sin SAM** | Unidades sin SAM |
|---|---:|---:|---:|---:|---:|---:|
| Corte | 397 | 152.279 | 89.034,55 | 0,5847 | **12** | **2.179** |
| Confección | 426 | 158.921 | 2.416.163,47 | 15,2036 | **14** | **2.427** |
| Empaque | 469 | 163.877 | 67.690,16 | 0,4131 | **22** | **3.125** |

**Órdenes distintas sin SAM en algún proceso: 22.** Caen todas en las categorías que ya conocemos
(las que no tienen hoja LMO vinculada):

`Fleece Basico / Crew` · `Fleece Pesado / Crew Moda` · `Fleece Pesado / Crew Zip` ·
`JOGGER / Jogger` · `JOGGER / Jogger Moda` · `TEJIDOS / Camiseta Tejida`

Ninguna de esas unidades se cuenta como cero ni se descarta: aparecen en el cuadrito con la marca
**«sin SAM»** y su número de unidades.

---

## 8 · Quién puede tocar la nivelación — permiso `programa`

| Perfil | ¿Tiene `programa`? | Por qué |
|---|---|---|
| **Administrador** (`admin`) | **Sí** | permisos `*` |
| **Planificación** (`planificacion`) | **Sí** | tiene `programa` en su lista |
| Tintorería | No | |
| Liberación | No | |
| Corte, estampado y bordado | No | |
| Módulos (confección) | No | |
| Producto terminado | No | |
| Consulta | No | |
| Tablet de centro (operarios) | No | |

**Solo esos dos perfiles.** Ningún ingeniero ni jefe de centro lo tiene hoy.

**Sobre los usuarios con nombre:** la tabla `perfiles` (qué persona tiene qué rol) **vive en
Supabase, no en el simulador de pruebas** — desde acá se pueden listar los **roles**, no las
personas. Para darte la lista con nombre y apellido hay que mirarla en producción: **eso lo haces
tú, o me autorizas y te digo exactamente qué consulta correr.** No entro a producción con tu cuenta.

Probado: con un perfil sin `programa` **no se puede mover una fecha** del cuadrito ni **crear un
grupo de módulos** — avisa y no cambia nada.

---

## 9 · Las fechas

- El **inicio no puede ser anterior a hoy**: se rechaza con aviso y no se guarda.
- El compromiso es libre.
- Ambas quedan en `S.params.nivelacion.fechas[<cuadrito>]` y **cada cambio va a la bitácora** con
  quién y de qué a qué.
- Los días hábiles salen de `labR`/`dsumLab` — el **mismo calendario** del motor, con las
  excepciones (festivos) ya cargadas.

---

## 10 · Lo que quedó listo pero **todavía sin pantalla**

Las funciones están hechas y probadas, pero **no las puse en ninguna pantalla** porque eso es el
Paso 2 y dijiste que no lo toque:

- **Tabla editable de grupos de módulos** (nace vacía, sugerencia desde la polivalencia, suma ≤ 100 %
  con error visible): `addGrupoMod`, `setGrupoMod`, `setPctModGrupo`, `delGrupoMod`,
  `erroresGruposMod`, `sugerirGruposMod`, `aplicarSugerenciaGrupos`.
- **Parámetros de tela** (promedio de 10 días hábiles configurable, junto al valor planificado):
  `nivParam`, `setNivParam`, `capTelaReal`.
- **La pestaña de nivelación** con el horizonte por mes y los cuadritos.

Dime si prefieres que la tabla de grupos y los parámetros de tela entren ya en **Configuración**
(no es ni el simulador ni el plan mensual), o si esperan al Paso 2 completo.

---

## 11 · Pruebas

**Harness verde: 1.786 checks, 0 fallos, 0 errores** (`node test/build.js` + corrida en el
navegador). Se agregaron **26 pruebas nuevas** de nivelación:

- el motor paso a paso con números a mano (se verifica a ojo);
- cero es cero: capacidad 0 no se reemplaza, el rezago es todo el saldo;
- dato faltante = `null`, nunca 0, y se nombra qué falta;
- el SAM es exactamente `minPrenda` y devuelve `null`, no 0;
- el saldo va por ruta y no por fase, e incluye órdenes de fases anteriores;
- la tela va por fase y cuenta unidades, no minutos;
- los grupos nacen vacíos; 60 % + 60 % da error visible; la capacidad es el `capDia` por el %;
- el inicio anterior a hoy se rechaza;
- sin el permiso `programa` no se edita nada;
- acotar el horizonte nunca agranda el saldo;
- más el bloque de medición sobre el volcado real que produjo las cifras de este reporte.

`delGrupoMod` se sumó a la lista GUARDIA (pide confirmación y dice qué se pierde).

---

## 12 · Pendiente de tu decisión

1. **Aprobar el Paso 1** para pasar al Paso 2.
2. ¿La tabla de grupos y los parámetros de tela entran ya en Configuración, o esperan al Paso 2?
3. La **lista de usuarios con nombre** que tienen el permiso `programa`: la miras tú en producción,
   o me autorizas la consulta.
4. Las **22 órdenes sin SAM** son las mismas categorías sin hoja LMO de siempre: cuando se carguen
   esos tiempos, desaparecen solas del aviso.
