# Motor de programación hacia atrás — reporte

Fecha: 14-sep-2026. Commit `8ba0a97`, versión 2026-09-14 15:01, pruebas 591/591 (14 nuevas del motor; las 577 anteriores
siguen verdes con el motor nuevo como vigente). No se tocaron capacidades, tiempos, candidatos de recurso, módulo fijado,
puestos en cola, prioridad global ni reglas de liberación: solo el criterio de **cuándo** se coloca cada paso.

## 1 · Cómo programa ahora

- **Punto de partida: la fecha comprometida** (o la pedida si no hay compromiso). Se recorre la ruta de producción **hacia
  atrás** — empaque, terminados, confección, servicios, corte — y cada paso termina el día laborable anterior a que
  empiece el siguiente, **menos la espera del paso**. El recurso elegido en cada paso es el que puede **empezar más tarde**
  (menos anticipación); empate → menos carga. La ventana de color en confección sigue aplicando.
- **Primero en seco, luego en firme**: se calcula toda la cadena sin consumir capacidad; si el primer paso arranca en o
  después de la tela lista, del inicio del programa y de cualquier inicio fijado por el centro, se confirma consumiendo
  la capacidad exactamente igual. Dos motores conviven: `atras` (vigente) y `adelante` (el de siempre, intacto), se elige
  en **Configuración → Calendario y parámetros → Motor de programación** (queda en bitácora).
- **Lo que manda sobre el orden** se respeta tal cual: prioridad global → puesto en la cola del centro (sin puesto al
  final) → fecha; módulo fijado y recurso fijado por el centro; `desde` fijado por el centro actúa como piso.

## 2 · Cuando no llega

**Nunca queda sin programar.** Si la cadena hacia atrás cruza el inicio del programa o la tela no está lista a tiempo, la
orden se programa **igual, hacia adelante** (el motor de siempre, desde donde sí puede) y queda con:
- **días tarde** (fin programado − fecha meta),
- **en qué paso se atascó**: el paso que más se pasó de su límite; la espera de tela cuenta como paso ("esperar la tela
  (tintorería)", "esperar al proveedor de tela"),
- **fecha posible** (el fin programado hacia adelante, si todo sale bien).

Todo eso está en **Hoy → Advertencias de fecha → "Según el programa, no llegan a su fecha"**, con el resumen "dónde se
atascan" para atacar la causa, no la orden. No se persiste: se recalcula con el programa (no es una decisión de nadie).

## 3 · Colecciones

Colección = **ODC**; sin ODC, cliente + fecha meta. Si una orden de la colección no llega, **toda** la colección se marca
tarde junta (mismos días tarde, y se ve quién la causa). Es una marca dura del programador; no reprograma por separado.

## 4 · Esperas (dos no existían)

| Espera | Estado |
|---|---|
| Proveedor de tela: días de la tabla, **laborables** | ya existía (A del 14-sep); el motor la respeta |
| Tintorería → bodega: `diasTintBodega` = 1 | ya existía; se respeta |
| **Lavado en planta 2–3 días** | **no existía**. Sembrado 3 (marcado "est."), editable |
| **Lavado en Quito 15 días · denim** | **no existía**. Sembrado 15 con coincidencia "denim, jean" |
| **Lavado en Quito 15 días · prenda tinturada** | **no existía y no se puede aplicar**: el sistema no sabe qué órdenes son prenda tinturada. Fila "sin regla" (no se aplica, se reporta). Dime cómo se identifican. |
| **Tejeduría: 2 semanas de anticipación** | **no existe como parámetro** (hoy la tela requerida usa `+2 días` fijos). No lo apliqué: tejeduría y tintorería se arman por tela y por color (lotes), no orden por orden — ver §6. |

Ojo: hoy **ninguna orden abierta tiene el paso Lavado en su ruta**, así que las esperas de lavado están configuradas pero
no mueven nada todavía.

## 5 · Antes y después (producción, 14-sep 15:01; 657 órdenes programables, 378 con programa)

| | Motor de siempre (adelante) | Hacia atrás |
|---|---:|---:|
| Llegan a fecha | **245** | **193** |
| No llegan | 133 | **185** = 82 no caben + 21 sin nada pendiente y meta pasada + **82 solo por su colección** |
| Sin la regla de colecciones | 133 | **103** (llegan más: se ordenan por su fecha real, no por quién entró antes) |
| Colecciones que van tarde | — | 20 |
| Órdenes que cambian de mes de terminación | — | **45** |

**Dónde se atascan las 82 que no caben:** esperar la tela (tintorería) **64** · confección 18. Ni botones ni bordado
aparecen como causa. El cuello está en la tela, no en la planta.

**Carga por centro y mes (min; tejeduría en h) · antes → después**

| Centro | sep-26 | oct-26 | nov-26 | dic-26 |
|---|---:|---:|---:|---:|
| Corte | 11.755 → 7.803 | 0 → 3.928 | 0 → 24 | |
| Estampado | 2.888 → 2.398 | 0 → 491 | | |
| Bordado | 31.836 → 24.018 | 0 → 2.457 | 0 → 843 | |
| Confección | 490.241 → 360.354 | 91.893 → 202.547 | 6.986 → 26.221 | |
| Etiquetas | 2.817 → 2.192 | 0 → 625 | | |
| Botones | 16.792 → 14.606 | 342 → 2.528 | | |
| Empaque | 21.996 → 15.716 | 3.613 → 9.381 | 345 → 512 | 0 → 345 |
| Tejeduría (h) | 246 → 246 | 14 → 14 | | |

Septiembre se descarga (confección −130 k min) y la carga se corre a octubre/noviembre, que es lo que pediste.
Tejeduría no cambia: su lote no se movió (§6).

**Las 10 que más se mueven** (todas llegan a fecha en los dos motores; ahora terminan pegadas a su meta):
WH/MO/28962, 29104, 29127 (Fashion Club, meta 23-nov): 28-sep → 23-nov (+56 d) · WH/MO/29007 (Aero Dep, meta 30-oct):
07-sep → 30-oct (+53) · 29133 (meta 01-nov): 10-sep → 31-oct (+51) · 29062 (Aero Dep): 16-sep → 30-oct (+44) ·
28276 y 28278 (meta 16-oct): 10-sep → 16-oct (+36) · 28963 y 29050 (meta 01-nov): → 31-oct (+35/+33).

## 6 · Lo que se movió de forma que debes mirar (te lo digo, no lo ajusté)

1. **La regla de colecciones es una palanca enorme**: de 20 colecciones tarde, "ODC SEPTIEMBRE COLOMBIA-H" arrastra
   **44 órdenes** por 2 que no llegan (WH/MO/28745 y 28751); ODC 2763 arrastra 19 por 30 días; ODC 2731, 19 por 8 días.
   Varios "ODC" son nombres, no números de orden de compra ("SEPTIEMBRE COLOMBIA-H", "PENDIENTE ODC"): si esos no son
   colecciones reales, la marca infla el atraso. Confírmame qué ODC son colecciones de verdad.
2. **El inicio del programa está en 07-sep y hoy es 14-sep** (`Configuración → inicio`). Los dos motores lo toman como
   "hoy": consumen capacidad de días ya pasados y el motor nuevo considera factible lo que cabe desde el 07-sep (una
   semana de optimismo). No lo cambié: es configuración tuya. Al actualizarlo, las que "llegan" bajarán.
3. **Tejeduría y tintorería siguen por lote** (por tela y por color, ordenados por la fecha requerida de siempre). El
   motor nuevo calcula para cada orden cuándo debía estar lista la tela (`reqTelaLista`) y con eso detecta que **64
   órdenes no llegan por la tela**; pero **no** cambié el orden de los lotes para que sigan esas fechas. Es el siguiente
   paso lógico y es delicado (baños): lo hago cuando lo autorices.
4. **Las factibles se pegan a su fecha**: el motor deja capacidad libre ahora y llena octubre/noviembre. Es lo que
   pediste (just-in-time); operativamente significa que la planta puede verse con holgura en septiembre aunque el año
   esté apretado. Si prefieres un colchón (terminar N días antes de la meta), es un parámetro que puedo agregar.
5. 21 órdenes cuentan como "no llegan" **sin tener nada pendiente en planta** con la meta ya pasada (regla heredada del
   motor de siempre, mantenida para que antes/después sea comparable). Son atraso real, no de programación.

## 7 · Cómo volver atrás

Configuración → Calendario y parámetros → Motor: "Hacia adelante". Un clic, queda en bitácora. El botón **Comparar** en
Capacidad y decisiones muestra siempre los dos lado a lado sin cambiar el vigente.

## 8 · Código

`programar()` sección 3 reescrita con dos ramas; `fluirAtras` (consume capacidad hacia atrás), `antLabR`; pasada en seco
+ confirmación; `ro.motor` (`atras` | `atras-no-llega` | `adelante`), `ro.diasTarde`, `ro.atasco`, `ro.fechaPosible`,
`ro.limites`, `ro.reqTelaLista`, `ro.holgura`; sección 4 colecciones (`claveColeccion`, `res.colecciones`,
`ro.atrasoPorColeccion`). Helpers: `motorProgramacion`/`setMotor` (`S.params.motor`), `programarCon(modo)` (corre el otro
motor sin tocar la caché), `esperasPaso`/`esperaDeCentro` (`S.params.esperasPaso`), `diasEntre`, `compararMotores`. UI:
`motorConfigHTML`, `noLleganHTML` (en Advertencias de fecha), `motorComparaHTML` (Capacidad y decisiones, bajo demanda).
