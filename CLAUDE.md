# TEMPO PCP — Sistema de Planificación y Control de Producción

## Qué es esto
Sistema de planificación y control de producción para TEMPOCODECA S.A. (TEMPO),
textil verticalmente integrado en Atuntaqui, Ecuador. Cubre: tejeduría → tintorería
→ corte → confección → empaque, con pasos opcionales (estampado, bordado, lavado,
botones, plancha).

## Arquitectura
- **Un solo archivo HTML** (`index.html`) con todo el JS embebido (vanilla JS, sin
  frameworks). El código fuente activo vive dentro de un `<script>` en ese archivo.
- **Backend: Supabase**, proyecto `bypdfogmksbxjaiydhlg` (us-west-2).
  URL: `https://bypdfogmksbxjaiydhlg.supabase.co`
  Clave pública: `sb_publishable_vycjn9icoWKANY9DPOiUDA_fXhCQG33`
- Tablas: `centros, recursos, telas, colores, rutas, operaciones, tecnicas,
  maquinas, categorias, ordenes, programas, cargas, propuestas, paros, turnos,
  bitacora, planes, salidas_tin, banos_conf` — todas con esquema
  `id text primary key, data jsonb, actualizado timestamptz, actualizado_por uuid`.
- Publicado desde este repo (rama `main`) en dos sitios que se actualizan solos al hacer push:
  **GitHub Pages** https://claudeplanificaciontempo-debug.github.io/tempo-pcp/ (siempre al día)
  y Netlify https://tempo-pcp.netlify.app (solo publica si la cuenta tiene crédito;
  en sept-2026 quedó bloqueado por crédito agotado). `test/` y `netlify.toml` se publican
  también; no poner ahí nada sensible.

## Reglas de negocio clave (tintorería — lo más delicado del sistema)

**Kilos:** los que se cargan en las órdenes son **crudos** (sin merma), no
acabados. `kgCrudo()` NO debe sumar merma — ya viene cruda. La merma solo se usa
para calcular cuánto sale acabado del baño (`kgAcabado`).

**Familias de baño:**
- Familia A (jersey 24/1 + ribb 24/1) y Familia B (fleece + french terry + ribb
  2x2) se pueden mezclar entre sí en el mismo baño.
- Telas de "baño propio" (piqué, piqué lycra — marcadas `pique:true` o `fam:'IND'`)
  van SIEMPRE solas, nunca mezcladas entre sí ni con A/B.
- Todas las telas (piqué y mezclas) se PARTEN para llenar el baño al máximo;
  solo se abre un baño nuevo cuando el actual ya está lleno (no fragmentar).

**Capacidad y llenado:**
- Cada máquina tiene `cap` (capacidad normal) y `capPique` (capacidad reducida
  para telas de baño propio).
- Un baño corre automático solo si llega al `pctBueno`% de la capacidad (90%
  por defecto); entre `pctAprob`% y `pctBueno`% requiere confirmación manual;
  por debajo, también requiere confirmación. Parámetros en `S.params`.
- Tolerancia: `tolGrande`% (5% por defecto) permite que un baño se pase un poco
  de la capacidad nominal antes de abrir uno nuevo.

**Máquinas claro/oscuro:** cada máquina de tintorería puede tener `rolColor`
('claro'/'oscuro'/'ambos'). Los colores claros van a máquinas de claros y
viceversa; la profundidad del color se detecta por código Pantone TCX
(`prefijoTCX`) y, si falta, por el nombre (`profColor`).

**Armado manual de baños ("Armar baños" en Tintorería) — regla vigente desde
el 12-sep-2026 (decisión del usuario, reemplaza "piqué siempre solo"):**
por color (Pantone), `propuestaColor(P,color,sel)` sugiere baños así:
1) dentro de cada **familia de tela** (los grupos de `armGrupos`: A, B o cada
tela de baño propio) se juntan las WH ordenadas por fecha requerida y kg y se
llenan baños consecutivos con `llenarEnOrden` — **la WH se parte** cuando no
cabe y el resto pasa al siguiente baño (la fila muestra "% aquí · resto en
Baño N"); 2) el último baño de cada familia, si no llega a `pctBueno`, es un
remanente y **los remanentes de todas las familias se mezclan** en baños
finales (`tipo:'mezcla'`). Capacidad 240 kg (`capN`) o 200 kg (`capPique`) en
cuanto el baño lleva piqué. Piezas de una misma WH que caen en el mismo baño se
funden en una fila. Selección por color en `ARM.sel[color]` (todo marcado por
defecto; desmarcar reacomoda; es la opción manual). La máquina se elige SOLO
en la barra del color (`maqc-…`, aparece cuando hay kg marcados, obligatoria)
y vale para "Confirmar baño N" (`confirmarBanoProp`) y para "Juntar todo lo
marcado" (`confirmarArmColor`, `llenarBins`; sin máquina = automática).
Lo confirmado se descuenta **por línea de tela** (`kgRestanteTela`: el `opsKg`
del baño se reparte entre las telas del baño en proporción), así el resto de
una WH partida sigue apareciendo en Armar baños.
Solo lo confirmado ocupa máquina/día real (`P.banos`). "Deshacer" quita la
confirmación y la WH vuelve a la lista.

**Calidad de tintorería (después del baño):** al registrar "salió" en Control de
piso → Tintorería, `banoListo()` marca `avance.tinturada` y pone la orden en fase
`1Calidad Tintoreria`. La orden queda "en calidad" (`enCalidad(o)`) hasta que
Calidad la apruebe (`calidadAprobar` → `avance.calidadOk`, fase `2Planificacion`)
o la rechace (`calidadRechazar` → modal `mReproceso` → `guardarReproceso`:
registra `avance.reprocesos[]` con motivo, qué se va a hacer, quién y origen
calidad/piso; marca `reproc` y fase `1Tintoreria`; el baño vuelve al plan).
Cuando ese baño vuelve a salir, `banoListo` cierra el reproceso pendiente
(`estado:'hecho'`). "Reprocesar" desde piso usa el mismo modal; "quitar" lo anula.
**Calidad NO libera a corte**: solo aprueba la tela. **Liberar a producción
exige `calidadOk`** para tela propia (`puedeLiberar`) y la hace planificación
en Liberación → "2 · A producción"; si la fase de Odoo ya es ≥2 se considera
aprobada. **Los insumos ya no bloquean la liberación** (se quitó de
`puedeLiberar`/`faltaLiberar`; la lista de insumos en la orden es solo
informativa). Los paneles "Calidad de tintorería" y "Control de reprocesos"
viven al final de Control de piso → Tintorería; en Control de piso no hay
botones de liberar.

**Baños confirmados a mano al programarse:** llevan `grupo:bc.id` (cada uno
elige su propia máquina) y solo consideran máquinas donde cabe el baño
(`capOf(r)*tolGrande >= kg`); sin eso, todos caían en la misma máquina o en
STUART (45 kg) con 250 kg.

**Baño "hecho" (Control de piso → Tintorería):** `mBanoHecho(bId)` muestra los
kg programados por tela (`b.telasKg`) y pide los kg reales por tela; guarda en
`salidas_tin` con `detalle:{tela:kg}` y llama `banoListo`. Un baño confirmado
cuyas órdenes ya están `tinturada/calidadOk/lista` (y no en `reproc`) **sale del
programa** (`programar()` lo omite) y la máquina queda libre. El rechazo de
calidad pide qué telas tienen el problema (`reprocesos[].telas`).

**Estado de tintorería según la fase de Odoo (`estadoTin(o)`):**
- `1Tintoreria` = **en tintorería según Odoo**: solo informativo
  (`ro.enMaquinaTin`); **sigue disponible para armar baños** (el usuario arma
  justamente esas órdenes). Botón "Hecho → calidad" en el panel "Estado de
  tintorería". No volver a excluirlas del armado: el 12-sep-2026 esa exclusión
  hizo que al deshacer un baño las órdenes no regresaran a la lista.
- fase 1 con "incomplet" = **incompleto**: tinturado pero faltan kg. El usuario
  anota `avance.faltaKg{tela:kg}` y **solo esos kg** entran a Armar baños
  (`kgTelaTin(o,tl)` reemplaza a `kgCrudo` en programar/armGrupos/banos_conf).
- fase 1 con "stock" = **tela en stock**: `faseEstado` la da por tinturada y
  lista → cola de liberación a producción.
- `enCalidad` = **completos** esperando calidad.
Los cuatro bloques se ven en Tintorería → "Estado de tintorería".

**Código interno de baño:** `codBano(colorN,req)` → `T<MES><AA>-<COLOR>-<NN>`
(ej. `TOCT26-DARKBLACK-03`; mes = del requerido más temprano del grupo, o del
día de confirmación). Se guarda en `banos_conf[].cod`, viaja en `P.banos[].cod`
y `salidas_tin[].cod`, y se ve en el cuadro, Control de piso, confirmados y el
modal "hecho". Tejeduría aún no tiene código propio (pendiente parametrizar).

**Armado, remanentes y máquina pequeña:** `tagArm()` etiqueta el resto de un
grupo como "baño lleno" (≥ pctBueno), "previo aprobación" (≥ granOk, se puede
soltar con aprobación) o "pendiente"; si el resto cabe en una máquina pequeña
(cap < granMin·1.2, p. ej. STUART) lo dice, y al programar un baño confirmado
que cabe en una pequeña, `programar()` lo manda solo a las pequeñas (no ocupa
una grande ni se fragmenta más). `lineaReparto()` escribe en la tarjeta, por
cada WH partida, "% aquí · resto: código 30% (COLOR), …" en una sola línea,
incluso si el resto está en baños de otros colores.

**Mover baño de máquina:** cada tarjeta confirmada tiene un `<select>`
(`selMaquinaBano`) → `moverBano(id,rec)` guarda `banos_conf[].rec` +
`recFijo:true` y `programar()` restringe el pool a esa máquina; "auto" lo quita.
**Albarán:** `imprimirAlbaranBanoId(bId)` usa `b.opsKg` (kg exactos por orden,
repartidos por tela) y muestra el código del baño (`ALB.cod`). **Resumen por
WH** (`resumenWHHTML`, al final de Tintorería): por cada WH, los baños/colores
en que está con código, máquina, día, kg y %.

**Tejeduría:** `resumenTelasHTML()` (arriba del cuadro) suma por tipo de tela
todo lo cargado: kg, liberados, tejidos, por tejer. Se teje por volumen.

**Liberación:** son dos páginas distintas por menú (misma `vLiberacion`, sin
pestañas): "Liberación" (Dirección, `LIB.et='tela'`, la principal) y "Liberación
a producción" (Planificación de producción, `LIB.et='corte'`).

**Operaciones (desde el 12-sep-2026):** se cargan desde la hoja LMO de
OPERACIONES.xlsx con `mCargarLMO()`/`planLMO()`/`aplicarLMO()`; el centro
TEMPO de cada fila sale de la tabla editable familia de operación → centro
(`reglasFamCentro`, Configuración → Operaciones → Mapeo) y las categorías se
vinculan con la tabla padre/hija → categoría LMO (`mapaCatLMO`). Ya no existe
`LMO_BASE` ni `cargarLMOBase()`.

**LEER PRIMERO `TRASPASO_TEMPO_PCP.md`** (versión 2026-09-13): principio
"lo configurado manda sobre el código", las 7 tablas de Configuración →
Órdenes y materiales, las 42 fases y sus grupos (CD = colas, línea del corte),
las dos liberaciones (textil desde el grupo textil, producción desde
planificación), el tramo estampado/bordado/confección NO secuencial resuelto
por las órdenes de trabajo de Odoo, tejeduría contra stock con 2 semanas de
anticipación, tintorería por armado de baños, lavado/plancha/bordado
pendientes de configurar, la auditoría de 187 reglas fijas y los pendientes.
Donde este archivo contradiga al traspaso, manda el traspaso.

**Perfiles (tabla `perfiles` en Supabase):** `rol`, `area` (piso: tej/tin/pro),
`subarea` (piso en producción: corte = corte+estampado+bordado · confeccion =
modulos · terminados = etiquetas+botones+lavado+plancha · empaque) y `modo`
(`editar` | `ver`). `puede()` devuelve false con `modo:'ver'`. `veArea/veCentro`
= puede mirar; `puedeArea/puedeCentro` = puede registrar. Control de piso y los
módulos por centro filtran por `veCentro` y habilitan por `puedeCentro`. Las
columnas `subarea` y `modo` deben existir como texto en Supabase.

**Reportería (`vReporteria`, página `reporteria`, estado `REP`):** vista
"textil" (tejeduría y tintorería: carga h vs capacidad por máquina y semana, kg,
baños, salidas, en calidad, reprocesos) y vista "producción" (una sección por
sub-área: min vs capacidad por recurso, plan vs real por semana, paros). Al final
siempre "Resumen de todos los procesos" por centro, filtrado por lo que el
perfil puede ver. Enlaces en el menú: "Reportería textil" y "Reportería por área".

## Principio general (decisión de la usuaria, 13-sep-2026) — aplica a TODO lo nuevo
1. Ningún valor de negocio en el código: todo sale de una configuración visible y editable (tablas y
   parámetros en Configuración). Lo que la usuaria dicta es siembra inicial, idempotente: lo editado no se pisa.
2. Si un número aparece en pantalla, debe verse de dónde salió y dónde se cambia (nota, tooltip o enlace).
3. Un valor configurado se respeta aunque sea 0, vacío o raro (`prm()`, `prmCal()`; nunca `x||default`).
4. Si falta un dato se reporta en una bandeja y se detiene; no se rellena con suposiciones ni fallbacks.
5. Si dos lugares hablan de lo mismo, la pantalla dice cuál manda. Días: manda el calendario del mes
   (Planificar el mes); la regla base del área (días por semana) es solo el punto de partida sin marca.
6. Los cambios de configuración que mueven el plan quedan en la bitácora (quién, cuándo, de qué a qué).
7. Versión: `APP_BUILD` en index.html la sella el hook `.git/hooks/pre-commit` (fecha/hora local) y la app
   avisa en pantalla cuando la copia cargada es más vieja que la publicada (`revisarVersion`).

## Convenciones de desarrollo
- **Simulador de pruebas** en `test/` (ver `test/README.md`): `node test/build.js`
  y `node test/server.js`, abrir http://127.0.0.1:8765/ y revisar `__R` en la
  consola. Recorre todas las páginas, el flujo completo de tintorería y pulsa
  todos los botones. Correrlo antes de publicar cambios grandes.
- Antes de cualquier cambio: `node --check app3.js`-equivalente (revisar sintaxis
  del `<script>` extraído) y correr las pruebas relevantes si existen.
- Los tests viven como scripts `test*.js` sueltos (no hay carpeta formal de
  tests) que cargan el HTML con un mock de `supabase` y prueban funciones
  puntuales del motor (`programar()`, `armGrupos()`, etc.).
- Reconstruir el archivo final: el `<script>` de trabajo se inyecta entre las
  marcas correspondientes del HTML; verificar que `index.html` no quede con
  placeholders sin reemplazar (`PEGA_AQUI_...`).
- Siempre hacer commit + push al terminar un cambio para que Netlify republique.

## Pendientes conocidos
- Cargar el catálogo completo de máquinas de confección (156 máquinas de
  costura + 11 de corte, archivo de mantenimiento preventivo ya analizado).
- Pestañas de maestros de operaciones (Centro/Subcentro/Sección/Familia de
  Operación) en Configuración — los datos ya se cargan desde Odoo pero falta
  la UI de edición dedicada.
- Confirmar que las capacidades reales de las máquinas de tintorería
  (DANITECH 1/2, STUART) estén siempre actualizadas en Configuración →
  Centros y recursos — es la causa más común de resultados raros en
  "Armar baños" si quedan desactualizadas.