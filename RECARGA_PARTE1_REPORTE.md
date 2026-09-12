# RECARGA — PARTE 1: Operaciones, categorías y rutas — Reporte final (PASO 12)

Fecha: 2026-09-12. Ejecutado contra producción real (Supabase `bypdfogmksbxjaiydhlg`),
verificado con recarga real desde la nube después de cada escritura (no solo en memoria).

**Estado: PARTE 1 completa. NO se cargaron órdenes ni materiales — eso es la Parte 2, sin definir todavía.**

## 0. Resumen ejecutivo

- Se vació `ordenes, avance, programas, cargas, propuestas, paros, turnos, salidas_tin, banos_conf` y `operaciones`, y se limpió `k.ops` de las 85 categorías. `centros, recursos, telas, colores, params` y las categorías mismas quedaron intactos.
- Se cargaron las 595 operaciones reales de la hoja LMO de `OPERACIONES.xlsx`, con id propio generado por la app (nunca el `CODIGO GEN` de origen).
- `armarRuta()` fue reescrito para deducir los centros de producción a partir de las operaciones propias de cada categoría, en vez de un juego fijo de rutas.
- Se corrigieron dos supuestos que el motor hacía "por su cuenta" (ver sección 8) — el usuario los detectó al preguntar por el "safety fallback" y pidió quitarlos.
- 16 categorías (hijas) quedan **sin operaciones vinculadas** — se listan completas en la sección 4. No se les asignó nada por defecto.

## 1. Operaciones por centro (595 en total)

| Centro | Operaciones |
|---|---:|
| Confección (modulos) | 448 |
| Corte | 66 |
| Empaque | 47 |
| Botones | 16 |
| Estampado | 9 |
| Bordado | 7 |
| Etiquetas | 2 |
| **Total** | **595** |
| Sin centro (ninguna regla les calzó) | 0 |

Reglas usadas (editables en Configuración → Operaciones → Mapeo, tabla 1): `SERIGRAFIA`+prefijo `ESTAMPAR`→estampado, `SERIGRAFIA`+prefijo `ETIQUETAR`→etiquetas, `OJALES`→botones, `BOTONES`→botones, `BORDADO`→bordado, `CORTE`→corte, `EMPAQUE`→empaque, y comodín `*`→confección (modulos) para cualquier otra familia (PULIDO, ENSAMBLE, SUBENSAMBLE, etc.), tal como se pidió originalmente.

## 2. Matriz SAM por categoría LMO × centro (18 filas, min/prenda)

| Categoría LMO | corte | modulos | empaque | estampado | bordado | botones | etiquetas |
|---|---:|---:|---:|---:|---:|---:|---:|
| PANTALON PLANO | 0.87 | 27.96 | 0.60 | 0.78 | — | 0.13 | — |
| JEANS | 2.31 | 18.94 | 0.36 | — | — | 0.40 | — |
| HODDIE | 1.22 | 13.56 | 0.69 | 2.25 | — | 0.26 | — |
| CHOMPA | 1.24 | 16.75 | 1.18 | 1.18 | — | 0.26 | — |
| BOMBER | 1.06 | 31.90 | 0.58 | 1.89 | 0.89 | — | — |
| HENLEY | 0.87 | 14.58 | 0.44 | — | 2.21 | 2.34 | — |
| CAMISA | 1.31 | 23.81 | 0.58 | — | 0.56 | 3.25 | — |
| SHORT PLANO | 0.87 | 19.27 | 0.63 | — | 0.89 | — | — |
| VESTIDOS | 1.27 | 17.59 | 0.48 | — | 0.40 | 1.16 | — |
| SHORT CARGO | 1.00 | 30.11 | 0.60 | — | — | 0.36 | — |
| POLO | 0.50 | 13.69 | 0.20 | — | 0.51 | 1.56 | — |
| PANTALON | 1.05 | 18.50 | 0.60 | — | — | 0.26 | — |
| BOXER | 0.85 | 17.71 | — | — | — | — | — |
| FITS | 0.75 | 6.78 | 0.42 | — | — | — | 0.35 |
| BODY | 1.05 | 13.39 | 0.34 | 1.18 | — | — | — |
| SHORT FLEECE | 0.87 | 12.44 | 0.85 | 1.19 | — | 0.26 | — |
| CAMISETA | 0.50 | 13.46 | 0.44 | 0.47 | 0.51 | — | — |
| BVD | 0.42 | 4.23 | 0.30 | 1.67 | — | — | 0.40 |

(18 categorías LMO, tal como esperaba el usuario.)

## 3. Categorías padre → categoría LMO vinculadas automáticamente

44 categorías hija quedaron vinculadas por el mapeo inicial (editable en Configuración → Operaciones → Mapeo, tablas 2 y 3):

- Por defecto del padre: CAMISETAS→CAMISETA, POLOS→POLO, CAMISAS→CAMISA, SHORT PLANOS→SHORT PLANO, PANTALONES PLANOS→PANTALON PLANO, DENIM→JEANS, BODY→BODY, BOMBER→BOMBER, BVD→BVD, CHOMPA→CHOMPA, FITS→FITS, HENLEY→HENLEY, HODDIE→HODDIE, VESTIDOS→VESTIDOS, SHORT FLECCE→SHORT FLEECE.
- Excepción por hija: (SHORT PLANOS, Short Cargo)→SHORT CARGO, (PANTALONES PLANOS, Pantalon Cargo)→PANTALON.

## 4. Categorías SIN mapeo ni operaciones (16 hijas) — impacto

Ninguna de estas tiene hoy operaciones ni centros de producción propios en `armarRuta()`. Una orden de estas categorías queda con ruta solo tej/tin (o proveedor), sin ningún centro propio, hasta que se les asigne mapeo. Debe vivir en la bandeja "Categorías sin operaciones" (Paso 9, todavía pendiente de construir):

| Padre | Hija |
|---|---|
| ACCESORIOS | Accesorios |
| BOXER | Boxer |
| CHALECOS | Chalecos |
| ENTERIZO | Enterizo |
| ENTERIZO | JUMPER |
| FALDAS | Faldas |
| Fleece Basico | Crew |
| Fleece Pesado | Crew Moda |
| Fleece Pesado | Crew Zip |
| JEANS | Jeans |
| JOGGER | Jogger |
| JOGGER | Jogger Moda |
| TEJIDOS | Camiseta Tejida |
| TEJIDOS | Henley Tejida |
| TEJIDOS | Hoodie Tejido |
| TEJIDOS | Polo Tejida |

Nota: BOXER (padre) y JEANS (padre) sí tienen operaciones cargadas (ver matriz sección 2) pero sus hijas concretas (Boxer, Jeans) no están vinculadas porque el mapeo inicial dado por el usuario no incluía esos padres — es una omisión del mapeo inicial, no un problema de datos. CHALECOS fue detectado ya en el análisis previo como padre sin regla dada por el usuario.

## 5. Filas del archivo sin mapear

0 filas de las 595 quedaron sin centro. Las 595 filas de la hoja LMO calzaron con alguna regla (la mayoría con el comodín "cualquier otra → Confección").

## 6. Códigos generados duplicados (7 códigos, 14 filas) — para decisión humana, no corregidos

| CODIGO GEN | Operación | Filas |
|---|---|---:|
| CON-02-VES-CS-ENS-CERCS-04 | Cerrar Costados | 2 |
| CON-02-SHC-EP-ENS-CEREN-01 | Cerrar Entrepiernas | 2 |
| CON-01-PAM-BS-SUB-DOBBBL-03 | (ver detalle en app) | 2 |
| CON-02-PAM-CS-ENS-PESCS-02 | (ver detalle en app) | 2 |
| CON-02-BOX-FR-ENS-PEGAL-01 | (ver detalle en app) | 2 |
| CON-02-BOX-FR-ENS-DOBAL-01 | (ver detalle en app) | 2 |
| CON-02-JNS-FR-ENS-PEGCIA-01 | (ver detalle en app) | 2 |

Cada operación duplicada se cargó igual, con su propio id generado por la app (nunca el `CODIGO GEN`), tal como se pidió. Decide si son una operación repetida por error de origen o dos operaciones distintas que casualmente comparten código. El detalle completo (con las dos filas de cada duplicado) está en `S.params.lmoDuplicados` y se puede ver en Operaciones → Cargar operaciones al volver a subir el archivo.

## 7. Inconsistencias código generado vs. subcentro (4 filas) — para decisión humana, no corregidas

| Operación | CODIGO GEN | Subcentro (COD CENTRO) real |
|---|---|---|
| Orillar Bolsillo | CON-01-SHP-BS-ENS-ORIBL-03 | (no coincide con el prefijo del código) |
| Pegar Bolsillo Parche | CON-01-SHP-BS-SUB-PEGBPH-01 | CON-00 |
| Pegar Bolsillo Viviado | CON-01-SHC-BS-ENS-PEGBVI-01 | (no coincide con el prefijo del código) |
| Rematar Extremos De Bolsillo X4 | CON-01-SHC-BS-ENS-REMEBL-01 | (no coincide con el prefijo del código) |

Se cargaron tal cual, sin corregir nada. Detalle completo en `S.params.lmoInconsistencias`.

## 8. Antes / después de la ruta — 5 categorías de ejemplo

| Categoría (hija) | Ruta ANTES (fija, siempre igual) | Ruta AHORA (deducida de sus operaciones) |
|---|---|---|
| CAMISETAS / BasicaCrop | tej, tin, corte, modulos, empaque | tej, tin, corte, **estampado, bordado**, modulos, empaque |
| SHORT PLANOS / Short Basico | tej, tin, corte, modulos, empaque | tej, tin, corte, **bordado**, modulos, empaque |
| CAMISAS / Camisas MC | tej, tin, corte, modulos, empaque | tej, tin, corte, **bordado**, modulos, **botones**, empaque |
| TEJIDOS / Camiseta Tejida | tej, tin, corte, modulos, empaque | tej, tin *(sin centros propios — categoría sin mapeo, ver sección 4)* |
| CHALECOS / Chalecos | tej, tin, corte, modulos, empaque | tej, tin *(sin centros propios — categoría sin mapeo, ver sección 4)* |

Las primeras tres muestran cómo la ruta ahora refleja exactamente lo que esa categoría realmente necesita (por ejemplo, Camisas ahora sí lleva botones porque tiene esa operación). Las últimas dos muestran el caso honesto: sin mapeo, la ruta ya NO asume corte/confección/empaque (antes sí lo hacía) — la orden queda visiblemente incompleta hasta que alguien la mapee, en vez de fingir una ruta completa.

## 9. Todo lo que ahora es configurable (y dónde editarlo)

Todo vive en `S.params`, editable desde Configuración → Operaciones → "Mapeo (familia→centro, categoría→LMO)" salvo donde se indica otra pantalla:

- **Regla familia de operación → centro TEMPO** (`S.params.reglasFamCentro`): tabla 1 del mapeo. Se evalúan en orden; primera que calza manda.
- **Mapeo categoría padre → categoría LMO por defecto** (`S.params.mapaCatLMO.porPadre`): tabla 2.
- **Excepciones por hija** (`S.params.mapaCatLMO.porHija`): tabla 3.
- **Lavado/plancha por defecto por categoría** (`k.lavaDefault`, `k.planchaDefault`): checkboxes en la ficha de cada categoría (Categorías → abrir categoría).
- **Minutos estándar por prenda y % estimado que pasa por lavado/plancha** (`c.minEstandar`, `c.pctEstimado`): columnas nuevas en Configuración → Centros y recursos, solo visibles en las filas `lavado`/`plancha`.

Ninguna de estas reglas quedó escrita en el código: los valores iniciales de este correo son solo el punto de partida.

## 10. Qué se dejó deliberadamente fuera (Parte 2, no definida todavía)

- No se cargó ninguna orden real ni materiales.
- No se tocó `programar()` más allá de `armarRuta()`.
- No se tocaron los cálculos de capacidad.
- Lavado/plancha "agregar/quitar por orden con motivo + vista previa de impacto + auditoría" (Paso 8) — no construido.
- Aprendizaje histórico del % real vs. estimado que pasa por lavado/plancha (Paso 8b) — no construido.
- Bandeja permanente "categorías sin operaciones" (Paso 9) — no construida; hoy la única forma de ver las 16 categorías sin mapeo es este reporte y una consulta directa a `S.categorias`.
- Etiquetado explícito "todo lo montado" vs. "solo lo liberado" + indicador "pendiente de liberar" en Plan mensual (Paso 10) — no construido.
- Pantalla de confirmación de ruta antes de liberar a producción (Paso 11) — no construida.

## 11. Corrección hecha durante esta carga (a pedido del usuario)

Al preguntar por el "safety fallback" mencionado durante las pruebas, se detectaron y quitaron dos supuestos que el código hacía por su cuenta, sin que el prompt lo pidiera:

1. `armarRuta()` rellenaba corte/confección/empaque cuando una categoría no tenía operaciones, para que la orden no quedara sin ruta. **Quitado**: ahora una categoría sin operaciones queda sin ningún centro de producción propio (ver sección 8, últimas dos filas) y debe reportarse, no rellenarse.
2. `centroPorFamilia()` devolvía `'modulos'` (Confección) como valor fijo en el código si ninguna regla calzaba, y `aplicarLMO()` repetía el mismo default. **Quitado**: ahora una fila sin regla que le calce queda excluida de la carga y aparece en `S.params.lmoSinCentro` (0 filas en esta carga real, porque el comodín "*" ya cubre todo — pero si se borra esa regla desde Configuración, esas filas no se cargarán silenciosamente en Confección).

Ambos cambios están commiteados y desplegados (commit `695199f`, rama `main`) antes de ejecutar esta carga real.

---
*Reporte generado automáticamente tras la carga real. Commit del código: `695199f`. Datos verificados con recarga real desde Supabase después de escribir, no solo en memoria.*
