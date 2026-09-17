# Búsquedas — revisión de correcciones (puntos 2, 3 y menú)

**16-sep-2026.** Un commit por bloque, cada uno con el harness verde antes de empezar el siguiente,
como pediste. **Nada de la nivelación ni de la cola por cercanía se tocó** (sus pendientes siguen aparte).

| Commit | Bloque | Harness |
|---|---|---|
| `f71a809` | Menú: «Nivelación de carga» primera · foto del DOM de la cola del centro (2a, tests) | 2.076 |
| `ce42a1a` | Cola del centro: extracción sin cambio de comportamiento (2a) | 2.076 |
| `94255f5` | Cola del centro: redibujo parcial (2b) | 2.084 |
| `d51c3af` | Liberación: foto del DOM de la lista (2a, tests) | 2.098 |
| `c8431e0` | Liberación: extracción sin cambio de comportamiento (2a) | 2.098 |
| `e31757d` | Liberación: redibujo parcial (2b) | 2.107 |
| `147cede` | Aviso de base acotada en las siete pantallas (3) | 2.142 |
| `9cd3965` | Tablet del operario: Paso 0, solo escaneo (5) | — |

Estado final: **2.142 checks, 0 fallos, 0 errores**.

---

## 2 · Commit 4 completado: cola del centro y Liberación, en dos pasos cada una

### Cola del centro

**2a · Foto del DOM antes de tocar nada** (17 pruebas): las 14 columnas y su orden, 14 celdas por fila,
asa de arrastre + puesto numérico, foto/WH/fase, selector de recurso con «auto», fecha de arranque,
acciones (ruta / ✓ hecho), los cinco eventos de arrastre, cabeceras de grupo de cercanía, fila «soltar
al final», conteos de la cabecera, la nota del orden, agrupación cliente→categoría con sus cabeceras, y
el panel «Hecho hoy» exactamente cuando hay hechas. **Pasaron con el código de hoy** → commit.

**Extracción:** el cuerpo de `cens.map(c=>{…})` se movió **tal cual** a `colaCentroHTML(c, ctx)`;
`vCentro` solo la llama con el contexto. Las 17 fotos pasaron igual → commit. Dos pruebas viejas
inspeccionaban el **texto fuente** de `vCentro` buscando `whCell(` y `hechasDelDia(`; ahora miran
`vCentro + colaCentroHTML`. La condición es la misma, solo cambió dónde vive el código.

**2b · Redibujo parcial:** `vCentro` registra con `listaRegistrar('CEN.q', …)` cómo repintar solo la
cola (recalcula `filas` y `porQue` con el texto nuevo y vuelve a llamar a `colaCentroHTML`) y la envuelve
en `<div data-lista="CEN.q">`. El buscador vive fuera.

| Cola de Corte, 1.210 órdenes (242 en la cola) | por tecla |
|---|---:|
| redibujo completo (antes) | **57–70 ms** |
| solo la cola (ahora) | **11–24 ms** |

Y el input **no se destruye ni una vez** en cinco teclas; texto «22918» y cursor en 5; la cola queda
filtrada; las 14 columnas siguen en su orden.

### Liberación

**2a · Foto del DOM** (17 pruebas): `#lib-lista` solo con «Ver todas» abierto; **8 columnas** de tela en
su orden; tantas filas como pendientes (tope 400); encabezado con el conteo; 8 celdas por fila;
foto/WH/fase; **la celda de tela con las casillas tintura/lavado por tela (`setFaltaTela`)** — la que
perdí la vez anterior, ahora vigilada; qué la frena + control de ruta; casilla de selección **exactamente**
en las órdenes listas para liberar; la seleccionada sale marcada tras redibujar; agrupar por cliente
**arranca con los grupos cerrados**, las cabeceras suman todas las filas y abrir un grupo muestra las
suyas; sin «Ver todas» no hay lista y sale la ayuda. → commit.

**Extracción:** el bloque `${detalle?…:'Toca una familia…'}` se movió tal cual a `listaLibB1HTML(et, ctx)`.
Las 17 fotos pasaron igual → commit. **Esta vez no se perdió nada.**

**2b · Redibujo parcial:** `bloqueLibB1` registra la lista (recalcula pendientes, familias, familia
elegida y detalle con las **mismas cuentas** de la pantalla) y la envuelve junto con el aviso de base
acotada en `<div data-lista="LIB.q">`.

| Liberación, 1.210 órdenes (1.205 pendientes) | por tecla |
|---|---:|
| redibujo completo (antes) | **327–365 ms** |
| solo la lista (ahora) | **11–21 ms** |

Input intacto en cinco teclas; texto y cursor; lista filtrada; 8 columnas en su orden; el aviso
«fuera del filtro» se repinta con la lista.

**Nada se perdió en ningún punto**, así que no hubo que revertir.

---

## 3 · Aviso de base acotada, las siete pantallas, una sola función

`avisoFueraDeBaseHTML(id, dentro, filtroTxt)` — la misma de Liberación — en las otras seis. Cada
pantalla pasa **su lista ya filtrada** y **el texto de su filtro**:

| Pantalla | `dentro` | Filtro que nombra |
|---|---|---|
| Liberación | pendientes tras filtros | el mes del Proyecto y los filtros de esta pantalla |
| **Centro** | la cola **que se ve** (tras el corte de la semana) | este centro y la semana que se está mirando |
| **Órdenes** | la lista (en la registrada y en la pintada) | el estado elegido y el filtro de fases |
| **Carga general** | la base filtrada (`ordsF`), a nivel de página | el área o centro elegido y el filtro de fases |
| **Resumen gerencial** | `ordenesGER(P)` | los meses, el cliente y el estado del filtro |
| **Plan mensual → agregar** | las candidatas | el mes del plan y los grupos que se pueden agregar |
| **Entregas** | la lista | los meses, la familia, el tipo de producto y la tela del filtro |
| **Producto en proceso** | la lista | lo liberado a planta |

Dos ajustes que salieron de las pruebas, para que lo sepas: en **Centro** el aviso compara contra la cola
**visible** (con «toda la cola» apagado, una orden fuera de la semana se avisa, no se esconde); en
**Carga general** el aviso va **a nivel de página**, porque el bloque de detalle solo existe con una celda
elegida y ahí el aviso no salía nunca.

Pruebas (AB12) en las siete: sin búsqueda no hay aviso; una WH que existe fuera de la base sale en el
aviso; el aviso nombra el filtro; «Ver» la muestra marcada; **ningún filtro de la pantalla cambió**.

---

## Menú

«Nivelación de carga» es la **primera** entrada de Planificación de producción. Orden final: Nivelación
de carga · Liberación a producción · Carga general · Corte · Confección · Estampado · Bordado ·
Terminados · Balanceo · Programa del día.

**Una aclaración:** la pantalla propia de la nivelación es el **Paso 2, que no has aprobado**. Por eso
la entrada abre hoy **Configuración → Nivelación de carga** (motor, tablas y parámetros, que es lo que
existe) y lo dice en su tooltip. Cuando apruebes el Paso 2, la entrada pasa a la pantalla nueva sin
mover nada más.

---

## 4 · Commit 5 (14 pantallas restantes)

Sigue en espera de tu aprobación del punto 2. El mecanismo ya está probado en tres pantallas distintas
(Órdenes, cola del centro, Liberación) y en la tablet.

## 5 · Tablet del operario

Solo el Paso 0, en `TABLET_OPERARIO_PASO0.md` (commit propio). Resumen: la lista no exige programa
por recurso, el buscador muestra órdenes fuera del plan, no hay mensaje de «sin programación», no hay
ventana parametrizada, y **el cierre del paso no valida ni tramo ni tiempo** (solo permiso y motivo con
faltante). No hay rpc de cierre. Los cierres del volcado **no se pueden contar desde aquí** (viven en
`avance`, Supabase): dejé la consulta SQL de solo lectura.
