# Menú de Planificación de producción — Terminados, Empaque y Etiquetas

> **CORRECCIÓN (ver `RECONCILIACION_CATALOGO.md`).** El «solo 3 de 24 categorías tienen familia LMO vinculada» de este
> reporte estaba **mal**: salía del catálogo de demostración del simulador. Lo real es **40 de 51 vinculadas, 11 sin
> vínculo**, que son las siete familias que producción ya había marcado «sin operaciones».

**Fecha:** 16-sep-2026 · **Commit:** `646008f` · **Harness:** 1.307 pruebas verdes, sin errores.

---

## 6 · El menú resultante completo

Así queda el menú de **Planificación de producción** (los `↳` son los sub-ítems que se despliegan solos):

```
Planificación de producción ▾
  Liberación a producción
  Carga general
  Corte
  Confección
  Estampado
    ↳ Estampado
    ↳ Etiquetas  !          ← ninguna orden la tiene en su ruta
  Bordado
  Terminados
    ↳ Ojales y botones
    ↳ Lavado  !             ← pendiente confirmar si ocupa capacidad de planta
    ↳ Plancha
    ↳ Empaque  !            ← ninguna orden la tiene en su ruta
  Balanceo
  Programa del día
  Reportería por área
```

Los demás grupos del menú no se tocaron:

| Grupo | Entradas |
| --- | --- |
| **Dirección** | Hoy · Resumen gerencial · Órdenes · Liberación · Entregas · Plan mensual · Demanda agregada · Auditoría de replanificación · Capacidad y decisiones |
| **Planificación textil** | Stock de tela cruda · Tejeduría · Macro del mes · Compras del mes · Tintorería · Reportería textil |
| **Reportería** | Vista general de órdenes · Asignación por orden · Producto en proceso · Cumplimiento de facturación · Avance del mes · Reportería textil · Reportería por área |
| **Piso** | Control de piso · Mi centro |
| **Configuración** | Categorías · Operaciones · Centros y recursos · Usuarios |

**Qué abre cada cosa:**

- **El ítem padre** (Terminados, Estampado) abre el **consolidado**: todas sus sub-áreas juntas, con su cola,
  su capacidad y su programación. La cabecera dice cuáles junta.
- **El sub-ítem** (`↳ Plancha`) abre **esa sub-área sola**, con el enlace «ver las 4 juntas» para volver.
  Antes no había forma de mirar una sola: el `↳ Estampado` bajo `Estampado` habría sido un duplicado del padre.

---

## 1 · Empaque sale del primer nivel

Empaque **ya no es una entrada suelta del menú**: pasa a ser **sub-área de Terminados**, junto a ojales y
botones, lavado y plancha.

- No es un valor en el código: sale de la columna **«Ítem de planificación»** de
  *Configuración → Centros y recursos*. Si mañana quieres a Empaque como ítem propio otra vez, se cambia ahí
  y el menú se rehace solo (hay prueba de eso: mover Empaque a Confección lo saca de Terminados y lo pone
  bajo Confección en el mismo dibujado).
- La siembra es idempotente: si ya editaste esa columna, **no se pisa**.

---

## 2 · Terminados es un desplegable con sub-ítems dinámicos

`armarNavSubCentros()` corre en cada dibujado del menú y, **por cada ítem de planificación que tenga 2 o más
sub-áreas**, inserta un sub-ítem por sub-área justo debajo, indentado, **en el orden del proceso**
(`ordenPaso`). Si un ítem se queda con una sola sub-área, los sub-ítems desaparecen.

Por eso el desplegable no es sólo de Terminados: **Estampado también lo tiene** ahora que Etiquetas se le
sumó (punto 3). Es la misma regla para todos, no un caso especial.

**Alerta por sub-ítem** (el `!` rojo, con el detalle en el tooltip). Se enciende cuando la sub-área tiene una
brecha de datos, y dice cuál:

| Sub-área | Alerta hoy |
| --- | --- |
| Etiquetas | ninguna orden la tiene en su ruta: su carga sale en 0 porque no hay nada programado ahí |
| Lavado | pendiente: dinos en la tabla de esperas si esta modalidad ocupa capacidad de planta o es sólo espera |
| Empaque | ninguna orden la tiene en su ruta |
| Ojales y botones, Plancha | sin alerta |

La alerta reusa `origenTiempoCentro()` (el mismo origen de minutos que ya muestra el consolidado), así que
**no hay una segunda fuente de verdad**: si la brecha se cierra en Configuración, el `!` se apaga solo.

---

## 3 · Etiquetas pasa a Estampado — **verificado antes de mover, como pediste**

Tu condición era: *«Si alguna es cosida, no moverla a Estampado sin mi confirmación»*. **Ninguna es cosida.**
Esto es lo que hay en la LMO cargada (596 operaciones):

| Operación | Min (SAM) | Máquina | Subcentro |
| --- | --- | --- | --- |
| Etiquetar | 0,35 | **TAMPOGRÁFICA** | SER-01 |
| Etiquetar | 0,40 | **MANUAL** | SER-01 |

Son **las dos únicas** operaciones del centro Etiquetas. `SER-01` es **serigrafía**, y ni la tampográfica ni
la manual pasan por una máquina de coser. Por eso la moví: técnicamente Etiquetas **es serigrafía**, no un
proceso de producto terminado.

**Qué se movió con ella:**

- Ítem de planificación: `etiquetas → estampado` (siembra idempotente, con bitácora, editable en
  Configuración → Centros).
- **Perfiles** (punto 4): el perfil **«Producto terminado» deja de verla** y el perfil
  **«Corte, estampado y bordado» pasa a verla** (también con bitácora, editable en Configuración → Usuarios).
- El consolidado de Estampado ahora suma Estampado + Etiquetas; el de Terminados ya no la incluye.

### La inconsistencia BVD / FITS que pediste investigar

Tu regla era: *la etiqueta estampada (0,5 min) aplica sólo a Camiseta CR, Camiseta CV, Level 1 y Level 2*.
**Esa regla hoy no carga ningún minuto, y no por un error de cálculo:**

| Hecho medido sobre los datos reales | Resultado |
| --- | --- |
| Categorías que usan alguna operación de Etiquetas | **0 de 24** |
| Órdenes abiertas con Etiquetas en su ruta | **0** (de 1.155) |
| Camiseta CR / Camiseta CV con operación de etiqueta | **ninguna** (0,00 min) |
| Camiseta CV con operación de estampado | sí: «Estampar» 0,47 min |
| Órdenes abiertas con Estampado en su ruta | 58 |

**La causa raíz de la inconsistencia: sólo 3 de las 24 categorías tienen `familiaLMO` vinculada.**
Las tres son *Camiseta CV → CAMISETA*, *Short Cargo → SHORT CARGO* y *Short Basico → SHORT PLANO*. Las otras
21 categorías **no están enganchadas a ninguna familia de la LMO**, así que ni la etiqueta de 0,5 min ni
ningún otro SAM les llega. No es que BVD y FITS estén mal cargadas: es que el **mapeo padre/hija → categoría
LMO** (Configuración → Operaciones → Mapeo) está casi vacío.

**No inventé la etiqueta de 0,5 min en ningún lado.** Tal como está el principio vigente: el dato falta, se
ve como brecha (el `!` del menú y la línea del consolidado), y no se rellena con una suposición.

---

## 4 · Tablets y perfiles por sub-área

**Las tablets ya estaban bien y no hubo que cambiarlas:** en *Configuración → Usuarios*, la columna Tablet
asigna un **centro real** (sub-área), nunca un ítem de planificación. El desplegable ofrece Corte,
Confección, Estampado, Bordado, **Etiquetas, Ojales y botones, Lavado, Plancha y Empaque** — en el orden del
proceso — y opcionalmente un recurso dentro de ese centro. «Terminados» **no aparece** ahí, porque no es un
centro. Mi centro arma la cola de esa sub-área, no la del grupo.

**Perfiles que sí cambiaron** (uno solo, el traslado de Etiquetas):

| Perfil | Antes | Ahora |
| --- | --- | --- |
| **Corte, estampado y bordado** | corte, estampado, bordado | corte, estampado, bordado, **etiquetas** |
| **Producto terminado** | etiquetas, botones, lavado, plancha, empaque | botones, lavado, plancha, empaque |
| Tablet de centro (operarios) | — | **sin cambios**: cada tablet apunta a su centro, y Etiquetas sigue siendo un centro |

El cambio se aplica una sola vez (bandera `etiqPerfilSembrado`), deja línea en bitácora y **es editable** en
Configuración → Usuarios: si prefieres que Etiquetas la sigan viendo los de producto terminado, se marca ahí
y esto no lo vuelve a tocar.

Como efecto de lo mismo, la sub-área vieja de los perfiles de piso («Terminados: etiquetas, botones, lavado
y plancha») pasó a ser **«Terminados: botones, lavado, plancha y empaque»**, y la de corte incluye etiquetas.

---

## 5 · Las 16 operaciones de ojales y botones

Todas están en el subcentro **TER-01**. Fuente: la hoja **LMO de OPERACIONES.xlsx**, tal como se cargó.

| # | Operación | Min (SAM) | Máquina | Categoría que la usa hoy |
| --- | --- | --- | --- | --- |
| 1 | Hacer Ojales | 1,56 | OJALADORA | — |
| 2 | Hacer Ojales | 1,56 | OJALADORA | — |
| 3 | Hacer Ojales | 0,78 | OJALADORA | — |
| 4 | Hacer Ojales | 0,50 | OJALADORA | — |
| 5 | Hacer Ojales | **0,36** | OJALADORA | **SHORT PLANOS / Short Cargo** |
| 6 | Hacer Ojales | 0,26 | OJALADORA | — |
| 7 | Hacer Ojales | 0,26 | OJALADORA | — |
| 8 | Hacer Ojales | 0,26 | OJALADORA | — |
| 9 | Hacer Ojales | 0,26 | OJALADORA | — |
| 10 | Hacer Ojales | 0,13 | OJALADORA | — |
| 11 | Hacer Ojal | 0,20 | OJAL LÁGRIMA TP | — |
| 12 | Pegar Botones | 1,69 | BOTONADORA | — |
| 13 | Pegar Botones | 0,78 | BOTONADORA | — |
| 14 | Pegar Botones | 0,78 | BOTONADORA | — |
| 15 | Pegar Botones | 0,66 | BOTONADORA | — |
| 16 | Pegar BotóN | 0,20 | REMACHADORA TP | — |

**La columna de la derecha es la brecha:** de las 16, **una sola llega a una categoría** (Short Cargo,
0,36 min), por la misma razón del punto 3 — sólo 3 de 24 categorías tienen familia LMO vinculada. Las otras
15 operaciones existen en el catálogo pero **ningún producto las usa todavía**.

Encima de eso manda tu **tabla de tiempos de ojales y botones** (Configuración): cuando una categoría calza
con una fila **confirmada**, ese valor **reemplaza** al SAM de la LMO — y si la fila dice 0, aplica 0. Para
Short Cargo, la fila `short` (0,26 ojales + 0 botones) gana sobre los 0,36 de la LMO. Estado de la tabla:

- **9 filas confirmadas:** polo (0,47+0,59) · henley (0,47+0,59) · camisa (1,73+0,36) · capucha (0,26+0) ·
  hoodie (0,26+0) · hoddie (0,26+0) · pantalón (0,26+0) · falda (0,26+0) · short (0,26+0).
- **3 filas sin confirmar:** vestido, jean, denim (los tres en 0+0). Mientras estén sin confirmar **no se
  aplican** y salen como brecha en el consolidado, no en silencio.
- **37 órdenes abiertas** tienen ojales y botones en su ruta.

---

## Archivos tocados

| Archivo | Qué cambió |
| --- | --- |
| `index.html` | menú (Empaque fuera del primer nivel), `armarNavSubCentros`, `alertaSubArea`, `CEN.solo` en `vCentro`, delegación del clic del menú, CSS `nav a.subnav`, `GRUPO_PLAN_DEF.etiquetas='estampado'`, `sembrarPerfilesEtiquetas`, `defPerfiles`, `SUBAREAS`, `CENTROS_PROD` derivado |
| `test/driver.js` | 19 pruebas nuevas (menú, sub-ítems, alerta, `CEN.solo`, traslado de Etiquetas, perfiles, tablets) y 3 existentes actualizadas al traslado |
| `MENU_PRODUCCION_REPORTE.md` | este reporte |

**Una limpieza de paso:** `CENTROS_PROD` y `SUBAREAS` tenían su propia lista fija de sub-áreas que ya
contradecía a la columna configurada (seguían diciendo que Etiquetas era de Terminados y que Empaque iba
aparte). Ahora `CENTROS_PROD` se **deriva** de la misma siembra, y las dos pantallas que la leían directo
(visibilidad del menú por perfil y el aviso de horas extra) preguntan por `censDeGrupo()`, que respeta lo
configurado.

---

## Brechas de datos detectadas (nada de esto se rellenó solo)

1. **Sólo 3 de 24 categorías tienen familia LMO vinculada** — es la causa de que la etiqueta de 0,5 min no
   cargue en ninguna camiseta y de que 15 de las 16 operaciones de ojales y botones no lleguen a ningún
   producto. *Se arregla en Configuración → Operaciones → Mapeo.*
2. **0 órdenes tienen Etiquetas en su ruta** (y 0 tienen Plancha) — su carga sale en 0 porque no hay nada
   programado ahí, no por un error de cálculo. Depende de las **reglas de ruta** que aún no cargas.
3. **Empaque tampoco aparece en ninguna ruta** de las órdenes abiertas del volcado, pese a estar en la ruta
   por defecto.
4. **Lavado: sigue pendiente tu confirmación** de si en planta ocupa capacidad o es sólo tiempo de espera.
5. **3 reglas de ojales y botones sin confirmar** (vestido, jean, denim, las tres en 0). Si el 0 es el valor
   real, márcalas como confirmadas y el sistema aplicará 0.

## Lo que sigue esperando tu decisión

1. ¿**Lavado en planta** ocupa capacidad o es sólo lead time? (columna «¿Ocupa capacidad?» de la tabla de esperas).
2. Las **reglas de ruta** (la tabla vacía que te dejé): sin ellas, plancha sigue en 0 órdenes y lavado en 38.
3. El **atributo de la prenda tinturada** para el lavado de Quito.
4. **Tiempos definitivos de ojales y botones**, si los de la tabla no lo son.
5. Las **685 órdenes sin ruta de producción**: decidir cuáles ya deberían tenerla.
6. **El mapeo de categorías a familias de la LMO** (nuevo, punto 1 de las brechas): es el que desbloquea los
   minutos de etiquetas, ojales y botones.
