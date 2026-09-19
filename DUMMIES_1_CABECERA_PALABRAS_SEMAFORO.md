# Para Dummies · entrega 1: cabecera común (F), palabras de planta (G) y semáforo (H) — 19-sep-2026

Aprobado por la usuaria el 19-sep sobre `UX_PARA_DUMMIES_PROPUESTA.md`. Nada se borra ni se pierde: las tres cosas son
**presentación**; el motor, las reglas y las plantillas de cada lista siguen iguales (las pruebas del DOM de cada lista
siguen valiendo).

## F · La misma cabecera en todas las pantallas

- **Los 76 párrafos explicativos** (`p.lede`) ya no ocupan pantalla: cada uno vive en el **«?»** del título más cercano
  (junto al título de la pantalla, o dentro del título del panel). Se abre al tocar; el texto es el mismo, con sus
  enlaces. Es una transformación del DOM al final de `render()` (`ledesAAyuda`), así que **ninguna pantalla cambió su
  plantilla**.
- **Un solo botón «Filtrar»** por pantalla, en la cabecera. Buscador, filtro de fases, agrupador y selectores múltiples
  quedan plegados hasta tocarlo; **se abren solos si hay un filtro activo** (y el botón dice cuántos: «Filtrar ▴ 1»).
  Lo que el usuario abre o cierra se recuerda por usuario (`FILT`, localStorage). Los **botones de acción nunca se
  pliegan** (Reportar novedad, Liberar, PDF…). **Mi centro (tablet) no se pliega**: el operario siempre ve su buscador.
  Se oculta con atributos (`data-filt-oculto`), no con clases, para no tocar `class="busq"` de las plantillas.
- El agrupar/filtrar por **pedido (ODC), cliente y fase** que ya existía sigue en todas las pantallas donde estaba;
  solo cambia que ahora está detrás de «Filtrar».
- Pendiente de F (no entra aquí): tablas a 6 columnas con «más columnas».

## G · Palabras de planta (diccionario aprobado)

| Antes | Ahora | Dónde |
|---|---|---|
| cercanía (a llegar) | **orden de llegada** | cola de los centros, notas, bitácora, auditoría, botón «Volver al orden de llegada» |
| atasco | **cuello de botella** | Hoy → advertencias de fecha, Asignación por orden, Plan mensual, Capacidad y decisiones |
| colchón (de días) | **días de holgura** | Calendario y parámetros, Asignación por orden, Plan |
| min/prenda · minutos por prenda | **SAM** (la primera vez «SAM (minutos por prenda)») | columnas y etiquetas de tiempos, centros, categorías, tablet |
| Nivelación de carga | **¿Alcanza la capacidad?** | menú, título de la pantalla, Configuración, enlaces |
| «Todo lo que viene», congelar, WH, ODC | **se quedan** (decisión de la usuaria) | — |

94 reemplazos exactos en textos visibles, propuestos y **verificados uno por uno por un revisor independiente** (que
rechazó 3 por no existir literalmente y ajustó 9 por gramática); los identificadores del código, las claves de
configuración y los comentarios no se tocaron. Las pruebas del simulador que buscaban el texto viejo esperan el nuevo.

## H · Un solo estado con semáforo y verbo

`estadoSemaforo(o,P)` da **un color y un texto con verbo** por orden, sin calcular nada nuevo: usa `diagAtraso`
(fecha meta), `liberada`/`faltaLiberarA` (qué falta), el bloqueo del motor, `pasoProximoDe` + `cercaniaCentro`
(dónde está y cuándo llega). Las marcas técnicas quedan en el tooltip.

| Color | Texto | Cuándo |
|---|---|---|
| 🔴 | **Atrasada N días** (· falta ruta / falta tela …) | meta vencida por la definición única (`esMetaVencida`: la fecha meta pasó y el motor la marca en atraso) |
| 🟢 | **Lista en <centro>** | el paso anterior terminó (o la tela está lista) y nadie la empezó |
| 🟢 | **En <centro>** | empezada: unidades o tramo en el centro, o la fase de Odoo ya es la del centro |
| 🟢 | **Llega hoy / mañana / el <día> a <centro>** · **Por llegar a <centro>** | según el programa |
| 🟡 | lo mismo **· va tarde** / **· su pedido va tarde** | la orden (o su colección/ODC) no llega a su fecha meta |
| 🟡 | **Paso anterior atrasado N días hábiles · <centro>** | el paso anterior debía terminar y no |
| 🟡 | **Llegaron X de Y a <centro>** | el paso anterior cerró con faltante |
| 🟢/🟡 | **En maquila** | fase de maquila externa |
| ⚪ | **Falta ruta / Sin WH / Sin fecha de entrega / Color sin Pantone / Sin receta de tela / Falta tela / Falta calidad / Baño sin confirmar** (· meta vencida) | no liberada a producción: el primer motivo de `faltaLiberarA`, el resto en el tooltip |
| ⚪ | **Revisar: fase pasó de <centro>** · **Revisar ruta** · **Revisar: fase fuera de la lista** | anomalías de la cola (no se pintan de verde) |
| ⚪ | **Sin programar · <centro>: <causa del motor>** / **Sin fecha para <centro>** | el motor no le dio fecha (sin recurso, sin módulo con polivalencia, sin minutos) |
| 🟢 | **Terminada en producción** · **Sin pasos pendientes en planta** | lo dice el grupo de la fase (tabla de fases), no el número |
| ⚪ | **Sin ruta de producción** · **Cerrada en Odoo** | brecha visible / Estado OP cerrado |

Dónde se ve: **Órdenes** (columna Estado, reemplaza a «sin liberar / bloqueo / atraso / a tiempo»), **Liberación**
(«Qué la frena» empieza con el semáforo; «falta confirmar ruta →» sigue siendo clicable), **Entregas** (columna nueva),
**Control de piso → producción** (columna nueva). El Resumen del centro ya lo tenía a su manera.

Sobre el volcado real en el simulador (1.079 abiertas, rutas sin confirmar): ⚪ Falta ruta 742 (+52 con meta vencida) ·
🔴 Atrasada 183 (+6 con lo que les falta) · 🟡 Lista, va tarde 54 · 🟡 En <centro>, va tarde / su pedido va tarde 25 ·
🟢 Lista 8 · 🟢 En maquila 4 · 🟢 En <centro> 2 · ⚪ Revisar 1 · ⚪ Sin programar 1 · 🟡 Llega 1.

## Revisión adversarial antes del commit (4 lentes, 30 hallazgos) — lo que cambió

- **Semáforo**: rojo **solo** con la definición única de meta vencida (`esMetaVencida`); el paso anterior atrasado es
  ámbar y dice «días hábiles»; una orden empezada dice **«En <centro>»** (antes «Lista en»); las anomalías de la cola no se
  pintan de verde (**«Revisar: fase pasó de X»**, **«Revisar ruta»**, **«Revisar: fase fuera de la lista»**); «Llegaron X de
  Y» sale cuando el paso anterior cerró con faltante; la causa que el motor ya sabe (sin recurso, sin módulo con
  polivalencia) se muestra; «Terminada en producción» lo decide la **tabla de fases** (grupo prenda terminada / cerrada),
  no el número 8; una orden en fase de maquila dice **«En maquila»**; el atraso por colección dice **«su pedido va tarde»**;
  lo que falta sale de `faltaLiberarA` con verbo propio (Falta ruta · Sin WH · Sin fecha de entrega · Color sin Pantone ·
  Sin receta de tela · Falta tela · Falta calidad); una orden cerrada por el Estado OP de Odoo dice «Cerrada en Odoo».
- **Filtrar**: un clic cierra (antes hacían falta dos cuando se había abierto solo); la preferencia se guarda con la
  clave del usuario **logueado** (antes se leía de `anon` y se escribía en otra clave: nunca se recordaba); los
  **selectores de base** (Área de Control de piso, Centro, Mes, Semana…) **nunca se pliegan**; agrupar **no** cuenta como
  filtro; tocar un control del panel lo deja abierto (no se plegaba solo al vaciar el filtro); en pantallas largas (Plan,
  Liberación) hay un botón chico junto a cada fila de filtros lejana; botón y «?» no se imprimen.
- **«?»**: la explicación de la página va al título de la página aunque haya un panel en medio (Cumplimiento caía en
  «Por ODC»); el aviso «sin plan congelado» de Avance del mes es **estado, no explicación**: se queda a la vista.
- **Vocabulario**: «Cuello de botella» del Resumen gerencial nombraba otra cosa (el área más cargada) → **«Área más
  cargada»**; «cuello de botella: —» ya no se pinta cuando no hay; Balanceo «Min/pz» → SAM; Auditoría «Minutos/prenda» → SAM;
  tablet «SAM real 0,850 min/prenda»; columna de la tabla 1 → «¿Alcanza la capacidad?».
- **Tablas**: colspan de las filas de grupo en Entregas y Control de piso; y un `</td` sin cerrar (preexistente) que
  desalineaba la tabla de producción de Control de piso.
- Los errores de la simplificación ya no se tragan en silencio (consola y `__R.errors` en el simulador).

## Pruebas

Bloque `dummies` en `test/driver.js`: F1 (ningún lede suelto en 28 pantallas; el «?» cuelga del título; el texto es el
mismo y se abre), F2 (un botón por pantalla, controles ocultos, ningún botón de acción oculto, abre/cierra y se
recuerda, se abre solo con filtro activo, tablet excluida, redibujo parcial intacto), H (color y verbo para toda orden
abierta; rojo solo con motivo; sin liberar nunca verde; disponible = «Lista en»; tooltip con el motivo; columnas en
Órdenes, Entregas, Control y Liberación). Tres pruebas viejas se ajustaron porque la pantalla cambió de verdad (el
buscador se abre con «Filtrar» antes de escribir).

## Capturas

`capturas/dummies_ordenes.png` (cabecera con «?» y «Filtrar», semáforo), `capturas/dummies_ordenes_filtros.png`
(filtros abiertos), `capturas/dummies_ordenes_ayuda.png` («?» abierto), `capturas/dummies_liberacion.png`,
`capturas/dummies_entregas.png`, `capturas/dummies_control.png`. Modo del driver `?captura=ux<pantalla>[f][q]`.

## Siguiente

A (portada «¿Qué hago hoy?» por rol) + B (menú de tareas) con los roles que dictaste: Santiago (Corte + Estampado +
Bordado), Mariela y Paola (Confección: módulos + Maquila), Terminados (Botones, Lavado, Plancha, Empaque: «listas para
jalar»), Maquila (una persona que solo ve Maquila), Jordan y Fernanda (liberar a producción + cambiar rutas), tú
(cargar, liberar textil, tintorería, congelar). Después: terceras en Empaque y el registro «salió / volvió» de maquila.
