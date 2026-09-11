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
- Publicado en Netlify desde este repo (rama `main`), se actualiza solo al hacer push.

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

**Armado manual de baños ("Armar baños" en Tintorería):** el algoritmo
YA NO programa baños automáticamente. Solo genera PROPUESTAS (`P.banosPend`),
agrupadas por color (una tarjeta por color, con las telas como subsecciones).
El usuario marca/desmarca WH (nunca se parte una WH al armar a mano) y confirma
con el botón — eso crea una o más entradas en `S.banos_conf` (con `opsKg` exacto
por orden, para soportar una WH partida entre dos baños confirmados). Solo lo
confirmado ocupa máquina/día real (`P.banos`). "Deshacer" quita la confirmación
y la WH vuelve a la lista de espera.

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
- `1Tintoreria` = **en máquina ahora**: no se vuelve a armar; `programar()` da la
  tela por llegar en `params.diasEnMaquina` (1) días (`ro.enMaquinaTin`). Botón
  "Hecho → calidad" en el panel "Estado de tintorería" de la página Tintorería.
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

**Operaciones:** el catálogo se muestra por categoría padre (`o.catP`) →
familia de operación (`o.famOp`) → operaciones (sección, máquina, sec, tiempo),
con buscador (`OPV`). `LMO_BASE` lleva incorporada la hoja LMO de
OPERACIONES.xlsx (11-sep-2026, 595 filas); `cargarLMOBase()` la aplica con
`planLMO()`/`aplicarLMO()` (reemplaza todas las operaciones). `centroLMO()`
mapea los códigos COR/CON/EMP/SER/BOR/TER a centros PCP (TER → terminados,
plancha, botones… el primero que exista). "Subir otro Excel" usa el mismo
parser y elige la hoja que tenga columnas Operación y Centro.

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