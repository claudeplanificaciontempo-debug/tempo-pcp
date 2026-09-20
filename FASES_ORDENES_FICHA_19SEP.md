# Fases (secuencia y significado), Órdenes «por editar», ficha por bloques y foto con zoom — 19/20-sep-2026

## 1 · Fases: la secuencia y el «qué es» dictados por la usuaria

Fuente: tabla dinámica de tareas de Odoo (4.480 tareas, orden de las etapas) + explicación de la usuaria fase por fase.
`FASES_SEC_19` / `sembrarFasesSecuencia19()` (una vez, solo llena lo vacío; las tres fases que faltaban en la tabla 1 se
agregan: **6Sublimado, 6Pulido Bordado, 8Cotizaciones**). En la tabla 1 cada fase muestra ahora **qué significa** (editable).

| # | Fases | Qué es |
|---|---|---|
| 1 | 0Diseño | todavía no tiene fichas |
| 2 | 0Reproceso diseño | ya sacaron fichas, pero por AOV se devolvió |
| 3 | 0Recetas Insumos | ya tiene fichas, todavía no tiene la receta |
| 4 | 0Adquisición | ya están todas las recetas; para liberarse |
| 5 | 0Macro | ya se liberó a tintorería |
| 6 | 0Ord Compras · 1Tejeduria | se compra por fuera · se está tejiendo |
| 7 | 1CD Tintoreria | tejido, en cola para tinturarse |
| 8 | 1Tintoreria | se está tinturando |
| 9 | 1Calidad Tintoreria · 1INCOMPLETOS TIN | salió del baño, calidad revisa · salió incompleto, hay que completar |
| 10 | 2Planificacion · 3AEROPUERTO · 3Trazos · 3CD CORTE | ya tiene tela; en cola para entrar a corte |
| 11 | 4Incompletos · 4Corte Planta · 5Corte Maquila Ibarra | incompletos de producción · se está cortando |
| 12 | 4Preparacion Insumos | cortado; preparando insumos |
| 13 | 4CD Ensamble | corte + insumos; esperando liberarse a confección / bordado / estampado / sublimado |
| 14 | 6 Etiquetado · 6 CD SERIGRAFIA · 6Serigrafia · 6Sublimado · 6 CD BORDADO · 6Bordado · 6Pulido Bordado · 7Confección · 7Pulido · 5CD Maquila · 5Maquila Conf · 5Maquila Recepción | el tramo estampado / bordado / confección / maquila **no es secuencial**: moverse entre ellas no es devolución |
| 16 | 8Lavanderia · 8Lavanderia Quito · 8Botones · 8Servicios y Terminados | terminados (lavado, botones, plancha, cordón) |
| 17 | 8Empaque | doblando y etiquetando |
| 18 | 8Empaque Terminado | listo; esperando que pidan cross |
| 19 | 8Cross | ya lo pidieron |
| 20 | 8Centro Distribucion | trabajando en cajas |
| 21 | 8Novedades · 8Embodegado · 8Exportacion · 8Cotizaciones | todo listo; esperando fecha de factura (paralelas; Exportación es lo último) |
| 22 | Facturado · Stand by | cerradas: no entran |

Efecto: `esDevolucionFase` ya no pide motivo entre bordado ↔ confección ↔ maquila ni entre las cuatro «esperando factura»;
sí lo pide al volver a CD Ensamble, a corte, o de Empaque a Botones. La bandeja «fases sin secuencia» queda vacía para las
fases de Odoo (4 Calidad Produccion, sin órdenes, queda sin número a propósito).

### Corrección del 20-sep: el orden real, con decimales (archivo de la usuaria)
«Capaz que no te lo expliqué bien»: la usuaria mandó `Tabla_din_mica_Tareas_project.task6.xlsx` con 40 fases y un número decimal por
fase (0 … 8.6). `FASES_SEC_20` + `sembrarFasesSecuencia20()` (una vez, bandera `fasesSecuencia20`, corre en `sembrarDecisiones16`
después de la del 19-sep) **reemplazan** la numeración del 19-sep. Mismo número = puede entrar a una o a otra (paralelas, sin
motivo): Macro / Ord Compras 0.4 · Incompletos / Preparación Insumos 4.1 · Serigrafía / Bordado 6 · Etiquetado / Pulido Bordado 6.1 ·
Lavandería / Botones / Servicios y Terminados 8 · Embodegado / Exportación / Cotizaciones 8.6. Confección (7) va DESPUÉS de servicios
(6) — ya no es un tramo no secuencial — y Empaque (8.1) después de Servicios y Terminados (8). Las seis fases que no venían en el archivo
se ubicaron junto a su pareja y quedan **a confirmar**: 6 CD SERIGRAFIA y 6Sublimado = 6, 5Corte Maquila Ibarra = 5, 8Lavanderia Quito
= 8, 4 Calidad Produccion = 4.2, Facturado y Stand by = 9. Dudas para la usuaria: 6 CD BORDADO quedó en 6.3 (después de Bordado 6 y
Pulido 6.1) tal como venía en el archivo.
**Todas las listas ordenan las fases con `cmpFases`** (secuencia de la tabla 1 → número de Odoo → nombre): agrupador común,
filtro de fases, Rutas, Órdenes, Carga general, centros. Antes se ordenaba por número y nombre, por eso «8Empaque» salía antes
que «8Servicios y Terminados». Pruebas FS20.

## 2 · Órdenes: «Por editar» por defecto

Chips **Edición**: *Por editar (ruta sin confirmar)* · *Editadas (ruta confirmada)* · *Todas*, con conteos
(`ORDF.edicion`, `matchEdicionOrd`, `EDICION_ORD`). Por defecto abre en «por editar»: lo que la usuaria todavía tiene que revisar.
**Guardar la ficha = editar**: `guardarOrden` confirma la ruta (persona, nota «ficha de la orden»), la sella (`sellarRuta`) y,
si la ruta cambió, la deja como editada a mano con auditoría; un perfil sin permiso de rutas guarda el resto de la ficha pero no
toca ni confirma la ruta. Al guardar (o al confirmar desde Rutas) la orden pasa a «ruta lista».

**Ruta lista sin editar (20-sep, decisión de la usuaria):** «lo que está en facturado, stand-by, cotizaciones y exportación ya está
listo; no necesito revisar la ruta porque ya está finalizada, solo falta facturar». `rutaNoAplica(o)` devuelve el motivo cuando la
orden **no tiene producción pendiente**: la fase tiene **«sin carga»** en la tabla 1 (prenda terminada / cerrada: 8Empaque
Terminado, 8Cross, 8Centro Distribucion, 8Novedades, 8Embodegado, 8Exportacion, 8Cotizaciones, Facturado, Stand by) o la orden ya no
está abierta (`abiertaDe`: Estado OP de Odoo cerrado, archivada, fuera de alcance). `rutaLista(o)` = confirmada por persona u Odoo
**o** no aplica. Es un estado **derivado** de la fase: no escribe `rutaConf`; si la fase vuelve atrás, la ruta vuelve a pedirse; si se
desmarca «sin carga» en la tabla 1, también (lo configurado manda). Lo usan: los chips de Órdenes (*Ruta lista (confirmada o prenda
terminada)*), `rutasPorDefinir` / la tarjeta de Rutas (que dice cuántas quedan fuera de la cuenta y por qué), `liberadasSinRuta`,
`puedeLiberarA` / `faltaLiberarA` (ya no dicen «falta confirmar ruta»), la regla de auditoría `libSinRutaConf`, `diagRutaOdoo`
(estado `noAplica`) y el bloque Ruta de la ficha («la ruta no se revisa»). Pruebas RL.

## 3 · Ficha de la orden por bloques (una pantalla)

`mOrden` en cuatro bloques plegables (`.ed-blk`): **Datos de la orden** (foto grande 170 px con zoom, cliente · ODC · proyecto ·
ID de tarea en el título, campos en grilla compacta, historial de fases plegado, fechas del programa) · **Materia prima**
(las líneas de tela de Odoo: tipo de tela, producto, cantidad, origen —maestro / tabla 3—, proveedor y **tela del catálogo de la
tabla 8 o «sin tela en tabla 8»**; debajo las telas del motor) · **Ruta y operaciones** (técnica, puntadas, proveeduría, centros,
tiempos; dice si la ruta está confirmada) · **Insumos** (cerrado; los componentes de Odoo y los insumos de la ficha).
Modal `.modal.orden` (1440 px, 96 vh, menos relleno).

**Los bloques se cerraban solos (corregido el 20-sep):** desde el primer commit había un manejador global que cerraba **todo**
`<details>` abierto al hacer clic fuera de él, pensado para los desplegables; por eso al tocar cualquier campo de Datos se
cerraban Materia prima, Ruta e Insumos. Ahora solo se cierran los desplegables (`esDesplegable`: menú «⋯» `details.acc`, filtro
de fases `details.ffases` y selectores múltiples con `summary.chip`); los bloques de contenido —la ficha, las tarjetas de Hoy, los
paneles plegables— se quedan como los dejó la persona. Prueba RL2.

## 4 · Fotos

`fotoMini` por defecto 44 px (`prm('fotoMiniPx',44)`), `data-zoom` en toda foto; `fotoZoomInit()` (arranca con el primer render)
abre una capa fija con la foto a 320 px (`prm('fotoZoomPx',320)`) al pasar el mouse y la cierra al salir; el clic sigue abriendo
la foto. Aplica en todas las listas (`whCell`), en la ficha y en el resumen de centro.

Pruebas: bloque **UI19** (16 comprobaciones) + 4 pruebas viejas ajustadas (47 fases, 5 sin uso en el archivo del 13-sep,
Órdenes con «todas»). Harness: 2.645 comprobaciones, 0 errores.
