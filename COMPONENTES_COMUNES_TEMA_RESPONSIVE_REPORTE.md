# Componentes comunes, tema y base responsive (Prompt 2) — reporte

Fecha: 15-sep-2026. Motor de programación sin tocar. Pruebas del simulador: **791 (25 nuevas), todas verdes, 0 errores**.

## 0 · Lo que falta que decidas

El punto (g) del pedido decía «Tema visual: [PEGAR AQUÍ LA OPCIÓN ELEGIDA]» y la opción **no venía pegada**. No inventé una
paleta nueva: dejé el tema montado como **tokens** con los colores actuales (azul marino + verde azulado de acento). Cuando
me mandes la opción elegida, se cambian **solo esas seis líneas** de `:root` y todo el sistema cambia de color; no hay que
tocar ninguna pantalla.

```
--t-primary   azul de los números grandes y el borde de los bloques
--t-accent    color de acento (borde de tarjeta, borde del título de panel, botón de menú)
--t-accent-soft  fondo suave de la tarjeta
--t-card      fondo de la tarjeta
--t-block     fondo de la cinta de bloque del plan
--t-thead     fondo del encabezado de las tablas
```

## 1 · Dónde se aplica cada componente (lo que pediste reportar primero)

Todo esto es **un solo componente reutilizado**, no una copia por pantalla. En este prompt se aplicó **solo donde ya existía
algo equivalente**; no se rediseñó ninguna pantalla.

### a) Filtro de fases desplegable, agrupado por grupo de la tabla 5
Reemplaza **todos** los filtros de fase que había. Función única `filtroFasesHTML` (y `selFases` ahora solo la llama).
- Liberación y Liberación a producción (`LIB.fases`) — antes lista larga de casillas.
- Órdenes (`ORDF.fases`) — antes lista larga de casillas.
- Demanda agregada por familia (`FAM.fases`) — antes su propio desplegable agrupado, hecho aparte; ahora usa el común.

Muestra los grupos de la **tabla 5** con su número y nombre («1 · TEXTIL», «2 · PLANIFICACIÓN»…), cada grupo con su enlace
*todas / quitar*, y arriba **Seleccionar todas** y **Limpiar**. El botón resume el estado: «Todas las fases», «7 de 42 fases»
o «Ninguna fase».

### b) Agrupador único con totales de unidades y horas
El agrupador que ya existía (`GRP`) es ahora el único, con dos campos nuevos (**próximo paso** y **mes de entrega**) y **horas
por grupo** además de órdenes y prendas: «12 órdenes · 3.450 prendas · 512 h» (horas = minutos pendientes de la ruta / 60).
- Órdenes, Liberación (las dos), Control de piso, Producto en proceso, Vista general de órdenes: ya lo usaban, ahora con horas.
- **Asignación por orden** (Carga general) migró del árbol propio (`arbolAPO`) al agrupador común: mismos campos de antes
  (cliente, ODC, familia, categoría, próximo paso, mes) más fase y color, y los totales.
- Siguen con agrupador propio, a propósito, porque hacen algo más que agrupar: la **cola por centro** (se arrastra para
  reordenar), **Plan mensual → Agregar** (casillas de selección por grupo) y **Carga por tipo de producto** (suma del programa,
  no órdenes). Si quieres unificarlos también, es el prompt siguiente.

### c) Tarjeta resumen (número grande + texto, clic despliega la lista)
Componente `tarjetasResumenHTML`. Aplicado donde ya había KPIs que representaban órdenes:
- **Plan mensual → Bloque 2** (órdenes del mes, prendas, horas, facturación, vencidas, en riesgo).
- **Plan mensual → Bloque 3** (base del plan: sin bloqueo / por liberar).
- **Mi centro** (tablet): prendas del día, hechas, faltan, órdenes en cola.

La tarjeta con lista dice «▸ ver lista»; al hacer clic se abre debajo una tabla con **foto, WH y fase** (el `whCell` de
siempre), cliente, categoría, color, prendas y entrega. Las tarjetas que ya enlazaban a otra pantalla (vencidas, en riesgo)
conservan ese clic. Los demás KPIs del sistema (los ~25 bloques `kpis` que hay) quedaron igual: solo se convirtieron los que
representan órdenes, para no rediseñar pantallas.

### d) Buscador
Ya era un solo componente (`busqHTML` + `matchBusq`), en Órdenes, Liberación, Producto en proceso, Asignación por orden,
Centro, Control de piso, Cambio de fases, Vista general y Plan → Agregar. Único cambio: la referencia se llamaba «Estilo» y
ahora se llama **«Referencia (estilo)»**, con lo que el buscador ofrece explícitamente WH, ODC, cliente y referencia (más
color, fase y categoría).

### e) Devolver / revertir con motivo obligatorio de una tabla
Nueva **tabla 15 · Motivos** en Configuración → Órdenes y materiales, con columna **uso**: *devolución de fase*, *reversión de
liberación*, *observación de piso*. Sin texto libre en ningún lado.
- **Cambio de fase** (modal de la etiqueta de fase en cualquier pantalla y Control de piso → Cambio de fases): el motivo era
  un campo de texto; ahora es un desplegable de la tabla 15. `moverFases` **rechaza** cualquier motivo que no esté en la tabla.
- **Revertir liberación** (Liberación, botón «retirar»): antes solo pedía confirmación; ahora abre un modal con el motivo
  obligatorio de la tabla 15 y recién ahí revierte.
- Si no hay motivos configurados para ese uso, el modal lo dice y **no deja continuar**, con el camino exacto a la tabla 15.
- Todo queda en **Auditoría de replanificación** → panel «Devoluciones de fase y reversiones de liberación»: cuándo, quién,
  qué (devolución o reversión), la orden con foto/WH/fase, **antes**, **después** y motivo. También va a la bitácora.
- Quitar un motivo de la tabla pide confirmación y no toca los registros anteriores (nada se borra).

### f) «← atrás»
Cuando llegas a una pantalla **por un clic desde otra** (los enlaces «ir a Liberación», «ver dónde se atascan», etc.), arriba
aparece **← atrás** con el nombre de la pantalla de origen. Vuelve **al mismo lugar**: misma pantalla, mismos filtros
(incluidas las selecciones múltiples y la agrupación), misma búsqueda y la misma posición de scroll. Si navegas por el menú,
la pila se limpia y no aparece el botón. Pila de hasta 20 pasos.

### g) Tema
Los colores son tokens (arriba) aplicados a **tarjetas** (borde de acento, degradado suave, número en color primario, rojo
para vencidas, ámbar para avisos), **bloques del plan** (la cinta numerada) y **tablas** (fondo del encabezado y borde
izquierdo del título de cada panel). Un solo lugar para cambiarlos.

### h) Base responsive
- Botón **☰** en la cabecera: el menú se colapsa en pantallas de 860 px o menos y se abre con ese botón; los desplegables del
  menú se muestran en vertical, sin quedar fuera de pantalla.
- Cabecera que se acomoda en dos filas en lugar de cortarse.
- **Tarjetas en columna** (las tarjetas resumen y los KPIs) y bloques de la tablet en columna.
- **Tablas con scroll propio** (horizontal y vertical) dentro de su panel, sin mover la página.
- Prioridad a las pantallas de piso: se revisó a 375 px de ancho **Mi centro** y **Control de piso / Liberación**.

## 2 · Lo que se probó (25 pruebas nuevas)
- El filtro de fases es el común en Liberación, Órdenes y Demanda agregada, con encabezados de grupo, «Seleccionar todas» y «Limpiar».
- Los grupos muestran órdenes, prendas y horas; el agrupador ofrece fase, familia, categoría, color, cliente y ODC en todas las listas; Asignación por orden usa el común.
- Bloque 2, Bloque 3 y Mi centro usan la tarjeta resumen; al desplegarla sale la lista con foto, WH y fase.
- El buscador ofrece WH, ODC, cliente y referencia.
- **Motivo obligatorio**: con texto libre no se mueve la fase y avisa que debe salir de la tabla 15; sin motivos configurados el selector no deja continuar; con motivo de la tabla sí cambia y queda auditado con usuario, fecha, antes, después y motivo; revertir una liberación sin motivo no revierte, con motivo sí y queda auditado; el panel de auditoría los muestra.
- «← atrás» aparece al llegar por clic, vuelve a la pantalla anterior con sus filtros y no aparece al navegar por el menú.
- Tema por tokens y reglas responsive presentes.
- GUARDIA (nada se borra) actualizada con `delMotivoRow`.

## 3 · Nota
Cinco pruebas viejas cambiaron de texto porque cambió la pantalla (el nombre «Estilo», el rótulo del motivo y el bloque de
KPIs que ahora son tarjetas); dos se hicieron independientes del estado de agrupación para que no dependan del orden en que
corren. Ninguna perdió cobertura.
