# Tiempos del 21-sep: lo que faltaba, cargado una vez desde Kronos — 21-sep-2026

**Decisiones de la usuaria (madrugada del 21-sep), tras `KRONOS_TIEMPOS_FEEDBACK.md`:**
- Kronos **no** es la fuente oficial: es de donde se sacó la base para decidir qué usar. **No** nos conectamos a Kronos ni volvemos a
  extraer: se carga **una vez** lo realmente valioso y se sigue trabajando aquí. Santiago (quien llena Kronos) confirma.
- Se trabaja **por familia/tipo de producto**, no por estilo (un estilo puede ser cualquier prenda). Tickets, «void», «por leer» y todo
  lo que no sea una operación clara: fuera.
- **Camisetas: el estándar es el 4 y pico por tipo; los 13,46 eran todas las opciones sumadas.**
- **Denim, Fits y Camisas no se suben**: se quedan como estaban (la hoja). Tejidos se quedan con Santiago (se corregirán después).
- Henley ↔ POLOS · Chompa ↔ CAPUCHA CIERRE · Hoodie ↔ HOODIES · Short cargo dentro de SHORTS (para el contraste; no cambian valores).
- **Ojales y botones: estándar 0,40** donde falte; mañana se ajusta en Configuración con los ingenieros.
- **Cordones** es un paso aparte (como plancha) con su minuto. Los tiempos de Kronos **ya llevan suplementos y eficiencia**.
- «Subámoslos como están, pero confirmamos con Santiago» → todo entra marcado **por confirmar** y se confirma con ✓.

---

## Qué se cargó (siembra `sembrarTiempos21`, una vez, bandera `S.params.tiempos21Sembrado`; todo con origen y «por confirmar»)

### 1 · SAM que manda sobre la hoja, por tipo de producto (`k.samManda[centro]`)
Nuevo: un valor por tipo de producto y centro que **gana** a la suma de la hoja de operaciones (`samPorCentro` lo aplica al final).
Se ve y se edita en **Operaciones → «Tiempos que mandan sobre la hoja»** (`samMandaHTML`: confección · corte · empaque, con lo que
da la hoja entre paréntesis, origen, ✓ para confirmar; vacío = manda la hoja o el estimado). `setSamManda` / `confirmarSamManda`, bitácora.

**Camisetas (confección, mediana de los estilos propios de TEMPO en Kronos, línea CAMISETAS):**
Camiseta CR 4,47 (105 órdenes, 6 estilos) · Level 1 4,47 (13 estilos) · Level 2 4,47 (18) · Camiseta CV 5,64 (3) · Camiseta Corte Moda
4,62 (8) · Fashion Graphics 5,71 (4) · BasicaCrop 5,42 (2) · Camiseta Bolsillo 6,51 (1) · Camiseta ML 5,33 (1) · **Ranglan ML y MC Ranglan
4,68** (sin estilos propios: mediana de la línea, por confirmar). Corte y empaque de camisetas siguen con la hoja (0,50 / 0,44).

**Familias sin hoja (corte y empaque, que estaban en 0; la confección sigue siendo la de Santiago):**
Jogger y Jogger Moda 0,60 / 0,69 (línea JOGGER) · Crew y Crew Moda 0,50 / 0,73 (CREW) · Crew Zip 0,70 / 0,62 (CAPUCHA CIERRE) · Faldas
0,87 / 0,65 (FALDA) · Enterizo y JUMPER 0,70 / 0,50 (ENTERIZO, 4 estilos) · Accesorios 0,43 / 0,82 (3 estilos) · Chalecos 0,80 / 0,64 (9) ·
Camiseta Tejida 0,35 / 0,32 (CAMISETAS) · Polo y Henley Tejida 1,00 / 0,60 (POLOS) · Hoodie Tejido 0,65 / 0,96 (HOODIES). Corte = mediana de
`corte_min`; empaque = minutos de las operaciones de Empaque de la línea por estilo (sin tickets).

### 2 · Ojales y botones: estándar 0,40 (`prm('botonesEstandar')`, Calendario y parámetros)
`tiempoPaso` lo usa para el paso Botones cuando **ni la hoja ni la tabla de ojales y botones traen un valor > 0** (marcado `estandar`).
Reemplaza el 0 «confirmado» del 16-sep para jeans/denim y vestidos (decisión de hoy). Se ajusta con los ingenieros; 0 = sin estándar.

### 3 · Minuto por prenda de los pasos nuevos (`c.minEstandar` del centro, Configuración → Centros)
Cordones **0,90** (Pasar cordón · SHORTS, 180 estilos; JOGGER 0,36 · HOODIES 0,57) · Apliques **0,38** (Pegar aplique · CAMISETAS, 33
estilos) · Sublimado **1,40** (CAMISETAS, 8 estilos: confianza baja). `tiempoPaso` usa el minuto del centro en cualquier centro de
producción cuando la hoja no trae operaciones para ese centro (antes solo lavado/plancha); la columna se edita ahora en todos los centros.

### 4 · Las órdenes ya cargadas (versión de la mañana; reemplazada por la «Actualización automática» de abajo)
Las órdenes **nuevas** nacen con los valores de hoy (`planTarea` → `tiempoPaso` → `samPorCentro`). Las **cargadas** tienen el tiempo
congelado en su ruta (`p.t`): `tiemposRutasDif()` cuenta qué cambiaría (pasos, órdenes, horas por familia y por centro) y el panel de
Operaciones lo avisa; **«Ver el antes/después y aplicar →»** (`mAplicarTiempos`) muestra la tabla y, con motivo, permiso `programa` y
confirmación, `aplicarTiemposRutas` reescribe `p.t` (guardando `p.tAntes`), marca `o.tiemposAplicados`, registra por familia en bitácora y
en `S.params.tiemposAplicados[]`, y recalcula programa, nivelación y plan. Lo ajustado por persona por orden (`opsSam`) no aplica cuando
hay un SAM que manda (`samConfeccionOrden` devuelve null): el valor por tipo gana.

## Lo que NO se cargó (a propósito)
Denim, Fits, Camisas, Polos, Chompas (la hoja se queda); tejidos (Santiago); henley (≈ polo, se queda); short cargo y pantalón plano (ruta
larga como camisetas: **pendiente con Santiago**); los 86 «revisar» de la LMO; todo Kronos por estilo.

## Pruebas
**T21** (9): siembra una vez con bitácora; `samPorCentro` respeta lo que manda; botones estándar y minuto del centro en `tiempoPaso`; editar
(confirmado) / vaciar (vuelve la hoja) / ✓; antes/después cuenta sin tocar; panel en Operaciones y modal; sin motivo no aplica; aplicar
reescribe con `tAntes`, bitácora, params y recalcula; sin permiso no aplica; con SAM que manda la suma por orden no lo pisa. Actualizadas
ME (elige una categoría sin SAM que mande) y PS (los pasos nuevos ya tienen minuto del centro).

## Actualización automática (21-sep, decisión de la usuaria: «si cambiamos algún tiempo se debe cambiar en todo lo abierto en el momento; lo cerrado no»)
Ya no hay botón de «aplicar»: **`propagarTiempos(quien)`** es el único camino y lo llama **todo cambio de configuración que define un
tiempo**: SAM que manda (`setSamManda`), botones estándar (`setBotonesEstandar`), minuto o medida del centro (`setCentro`), SAM de una
operación (celda `setRow` y modal `guardarOp`), operación quitada o con otro centro (`delOp`, `setCentroOp`), operaciones que aplican a un
tipo (`guardarFamOps`), tabla de ojales y botones (`setTiempoOBRow`, `delTiempoOBRow`), reglas de etiqueta (`setReglaEtiqueta`), minuto
estimado (`setMinEstConf`), hoja recargada o categorías revinculadas (`aplicarLMO`, `revincularCategorias`) y «Actualizar datos»
(`aplicarTarea`). Reglas: solo órdenes **abiertas** (`abiertaDe`); **`tiempoEsperadoPaso(o,p,k,spc)`** es la única definición del tiempo que
le toca a un paso (hoja / lo que manda / estándar / minuto del centro; con ajustes por orden `opsSam` y sin SAM que mande, la suma ajustada);
un tiempo **escrito a mano en la ficha** distinto de la regla queda marcado `p.tManual` y **no se pisa** (se cuenta aparte); cada paso guarda
`tOrig` (una vez) y `tAntes` (el último); las horas de bitácora y del modal son **prendas pendientes × minuto, pasos no hechos** (la misma base
que las pantallas); un perfil de piso no propaga. La puesta al día tras las siembras tiene **su propia bandera** (`tiempos21Propagado`,
`sembrarPropagacionTiempos` al final de `sembrarDecisiones16`), porque en producción la siembra de valores ya había corrido. `fusionarFila`:
el mismo valor puesto por dos sesiones en el mismo campo ya no es choque. Revisión adversarial: 11 hallazgos reales, todos corregidos;
queda pendiente avisar en el plan congelado / avance del mes cuando los tiempos cambiaron después de la foto.
