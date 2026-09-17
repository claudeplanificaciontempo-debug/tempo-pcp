# Pantallas de producción — reporte de los puntos 2, 5 y 7 (antes de construir)

**17-sep-2026.** Medido en el simulador con el volcado real, pantalla de 1.366 × 768 (portátil típico), perfil admin.
Nada construido todavía.

## 2 · Marca de la orden: qué estados existen hoy y cuáles se pueden mostrar sin inventar

Hoy la columna **Marca** de la cola muestra **una sola** etiqueta (`marcaCentroUna`, la más grave; las otras en el tooltip):
`meta vencida` · `la orden va tarde` · `este paso va tarde` · `prioridad`. Todas salen de `diagAtraso` (fecha meta vs. fin
programado). **Ninguna dice qué falta para trabajarla**. Y en la tablet/cola, `tagListaEmpezar` («lista para empezar») se pinta
junto a la WH mientras la marca dice «meta vencida»: por eso salen juntas y confunden.

Estados que **ya existen en el sistema** (dato calculado, no inventado) y que dicen qué falta:

| Estado | De dónde sale | Texto posible en la marca |
|---|---|---|
| Sin liberar (tela) | `ro.bloqueo = 'sin liberar'` / `'sin liberar tela'` (motor) | **«sin liberar»** / «sin liberar tela» |
| Tela pendiente (tejiendo / tiñendo, sin fecha de tela lista) | `ro.bloqueo = 'tela pendiente'` | **«falta tela»** |
| Baño pendiente de decisión | `ro.bloqueo = 'baño pendiente de decisión'` | «baño sin confirmar» |
| Tela llega en N días hábiles | `llegadaTela` → `{tipo:'fecha', dias}` (primer centro de producción) | «tela llega en N días» / «tela llega mañana» |
| Tela lista | `llegadaTela` → `{tipo:'lista'}` (avance.lista o fase) | **«tinturada · lista para cortar»** (en Corte) |
| Tinturada pero sin liberar a producción | `avance.tinturada`/`calidadOk` + `!liberada(o,'corte')` (`faltaLiberarA`) | **«tinturada · falta liberar»** |
| Sin liberar a producción por otra causa | `faltaLiberarA(o,'corte')`: «falta confirmar ruta», «sin lanzar en Odoo (sin WH)», «calidad de tintorería pendiente» | el texto de `faltaLiberarA` tal cual |
| Falta el paso anterior de la ruta | `cercaniaCentro` → grupo Por llegar, `motivoEstadoCentro` («falta Corte») | **«falta Corte»** (+ «llega en N días» si el programa lo fechó) |
| Paso anterior terminado (cierre o unidades completas) | `listaParaEmpezar(o,c)` / `cercaniaCentro` → Disponible | **«lista para empezar»** |
| Sin programar (el motor no le dio fecha en este centro) | `paso.ini` vacío (`llegadaHTML` → «sin programar») | **«sin programar»** + el motivo del motor si existe (`ro.error`: «sin recurso», «sin máquina para la técnica», «ningún módulo con polivalencia para esta familia») |
| Revisar ruta | `secuenciaCentro` → `sinSecuencia` | «revisar ruta» |
| Atrasada respecto al programa | `llegada.tipo='atrasado'` (paso anterior debía terminar y no) | «atrasado N días» (ya existe en la columna Llega) |
| Meta vencida / la orden va tarde / este paso va tarde | `diagAtraso` | **separadas** en su propia columna «Fecha», no mezcladas con lo de arriba |

Propuesta para construir: dos columnas en la cola, **«Qué falta»** (uno de los textos de arriba, en orden de precedencia:
sin liberar → falta tela / tela llega → tinturada · falta liberar → falta <paso> → sin programar → lista para empezar) y
**«Fecha»** (meta vencida / va tarde / este paso va tarde / ·). La tablet usa las mismas funciones. No se inventa ningún
estado: los diez de la tabla ya están calculados hoy en `cercaniaCentro`, `llegadaTela`, `faltaLiberarA`, `listaParaEmpezar`
y `programar()`.

## 5 · «Asignar a operario» y edición de ruta

- **«asignar a operario»** (`mAsignarOperario`, botón en cada fila de la cola) aparece para `puede('programa') ||
  puede('reprogramar')`, es decir, planificación **y los supervisores de centro**. Se creó el 17-sep para hacer visible en la
  tablet un paso sin minutos. Se retira del centro/módulo; el puesto manual (arrastre / número) y el motor siguen.
- **Edición de ruta**: el botón «ruta» de la cola (`mRutaCentro`) y el guardado de la ruta pasan **solo** por
  `puedeEditarRuta()` = **`puede('ruta')`**. El 16-sep `sembrarPermisoRutas()` dejó el permiso `ruta` **únicamente en
  `planificacion` y `admin`** (bandera `rutasSoloJefe`), así que hoy ingeniería y los supervisores **no** lo ven. Lo que falta:
  para los demás perfiles no hay forma de **ver** la ruta desde la cola; propongo un enlace «ruta» de solo lectura que abra la
  ficha de la orden (`abrirFichaOrden`, que ya muestra la ruta con el paso actual) y que el botón de editar siga solo con `ruta`.

## 7 · Pantalla completa sin desplazar (1.366 × 768, pestaña «Programación del centro»)

| Bloque (de arriba abajo) | Alto (px) | Corte | Confección | Terminados |
|---|---:|---|---|---|
| ← atrás + cabecera + semana/filtros | 95 | | | |
| **Resumen de la semana** (día × familia) | 98–247 | 247 | 247 | 247 |
| Cuadritos de módulos (solo Confección: dos filas de KPIs) | — | | 139 + 75 | |
| Botones PDF / cola por color | 26–44 | | | |
| **Texto explicativo (`lede`)** | **126** | | | |
| Agrupador + «todas» | 55 | | | |
| Sub-áreas (resumen de sub-centros) | — | | | 473 (+ 397 en Estampado) |
| **Cola** (cabecera 48 + nota «Orden de la cola…» 101 + tabla con scroll 620) | 779–1.914 | 779 | 779 | 1.914 (dos colas) |
| Avance contra el programa congelado | 175 | | | |
| Nota final | 31 | | | |
| **Total** | | **1.676** | **2.003** | **3.286** |

La cola empieza en el píxel **~700** en Corte y **~900** en Confección: **fuera de la primera pantalla**. Y la tabla de la cola
mide **1.953 px de ancho** para 1.280 disponibles (14 columnas: Puesto, OP, ODC, Llega, Cliente, Categoría, Color, Pendientes,
Min, Recurso, Arranca, Plan inicio→fin, Marca, acciones): desplazamiento horizontal siempre.

Propuesta (qué colapsar por defecto y qué recortar):
1. **Colapsar por defecto** el «Resumen de la semana» (día × familia) y el «Avance contra el programa congelado», como
   `<details>` con su total en el título (el resumen de Confección lo pide el punto 4; se mantiene arriba, pero plegado).
2. **Quitar el `lede`** de 126 px (5 líneas de explicación): pasa a un tooltip «?» junto al título.
3. **Plegar la nota «Orden de la cola…»** (101 px) a una línea con «?».
4. **Cola más angosta**: quitar las columnas **Min** y **Plan inicio → fin** (van al tooltip de la fila) y **Cliente** cuando el
   agrupador ya agrupa por cliente; el `<select>` de recurso con ancho fijo; las acciones en un menú «⋯». Objetivo: ≤ 1.280 px.
5. **Cabecera con conteos** en una sola línea: Disponible N · Por llegar N · Lejanas N · N prendas por hacer, arriba de la cola.
6. En Terminados y Estampado, el resumen agrupado por sub-área **se conserva** (punto 8) pero plegado por defecto cuando el
   centro tiene más de una cola.

Con 1–4 la cola arranca alrededor del píxel **~330** y la tabla entra sin desplazamiento horizontal.

Espero tu aprobación para construir 2, 5 y 7 junto con 1, 3, 4, 6 y 8.
