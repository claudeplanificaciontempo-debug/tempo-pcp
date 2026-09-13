# Corrección de ruta: estampado y bordado por orden, no por categoría

Fecha: 2026-09-12. Aplicado sobre lo cargado en `RECARGA_PARTE1_REPORTE.md`. Código commiteado y desplegado
(commit `dcad2d6`, rama `main`) antes de tocar producción. Verificado con recarga real desde la nube.

**No se cargaron órdenes ni materiales. No se tocó `programar()` más allá de `armarRuta()`, ni las capacidades.**

## El problema que se corrigió

`armarRuta()` deducía los centros de producción de una categoría a partir de sus operaciones cargadas (Parte 1).
Eso es correcto para corte, confección, empaque, botones y etiquetas — pero **no** para estampado y bordado:
la categoría CAMISETA, por ejemplo, tiene una operación de estampar y una de bordar en la hoja LMO, así que
*toda* orden de esa categoría heredaba ambos centros, sin importar si esa prenda en particular llevaba estampado
o bordado. Con datos reales (249 órdenes futuras de camisetas: 172 con bordado, 49 con estampado, según el
usuario) esto habría inflado la carga proyectada de esos dos centros.

## Qué cambió (código)

1. **Regla editable, no fija en código**: `S.params.centrosPorOrden` (Configuración; hoy `estampado, bordado,
   lavado, plancha`). Un centro en esta lista **nunca** entra a la ruta solo porque la categoría tenga una
   operación con SAM para él — `centrosDeCategoria()` los excluye siempre del cálculo automático por categoría.
2. **Quién decide si aplica**: `ordenCentrosAuto(orden)` — estampado entra si `orden.tecnica` tiene valor;
   bordado entra si `orden.puntadas > 0`. (Lavado/plancha siguen con su propio mecanismo ya existente de la
   Parte 1: marca de categoría + casilla manual.)
3. **El SAM sigue viniendo de la categoría** cuando el centro sí aplica — eso no cambió.
4. **Bordado en puntadas, no en SAM plano**: nuevo campo editable "Puntadas/min" en Configuración → Centros,
   fila Bordado. Si tiene valor, la carga de una orden = puntadas de la orden ÷ esa velocidad. Si está vacío,
   se usa el SAM de la categoría como respaldo y la orden queda marcada `pendBordadoVel` (sin velocidad de
   bordado configurada) — no se inventó ningún valor de velocidad.
5. **Campos nuevos en la orden**: `tecnica` (ya existía) y `puntadas` (nuevo, número), ambos editables desde
   la ficha de la orden. Cambiar cualquiera de los dos avisa si mueve la fecha de fin estimada, antes de
   guardar (no se persiste nada hasta pulsar "Guardar orden").
6. **Mapeo de categorías**: se agregaron las reglas que faltaban, `BOXER → BOXER` y `JEANS → JEANS`, en la
   tabla editable Configuración → Operaciones → Mapeo.
7. **Bug de paso, no pedido pero necesario**: `guardarOrden()` usaba una variable `d` que nunca se declaraba
   en ninguna parte del archivo — guardar cualquier orden existente habría lanzado un error y no habría
   guardado nada. Se corrigió para que use el registro encontrado por id, porque bloqueaba directamente esta
   corrección (los campos técnica/puntadas nuevos no se habrían podido guardar).

## Confirmación: estampado y bordado ya no son automáticos por categoría

Verificado en producción, categoría CAMISETA (que tiene operación de estampado y de bordado):

- `centrosDeCategoria()` ya no incluye `estampado` ni `bordado`, aunque la categoría sí tenga SAM para ambos.
- Una orden sin técnica ni puntadas arma su ruta **sin** estampado ni bordado.
- Una orden con técnica pero sin puntadas arma su ruta con estampado, sin bordado.
- Una orden con puntadas pero sin técnica arma su ruta con bordado, sin estampado.

## 6 categorías de ejemplo: ruta antes vs. después

"Antes" = como se comportaba hasta el commit anterior (todo lo que tuviera SAM en la categoría, siempre incluido).
"Después" = con esta corrección, para una orden con los datos indicados.

| Categoría (hija) | Caso de la orden | Ruta ANTES (siempre igual) | Ruta AHORA |
|---|---|---|---|
| CAMISETAS / BasicaCrop | con técnica y puntadas | corte, **estampado, bordado**, modulos, empaque | corte, **estampado, bordado**, modulos, empaque *(igual — sí corresponden)* |
| CAMISETAS / BasicaCrop | sin técnica ni puntadas | corte, **estampado, bordado**, modulos, empaque | corte, modulos, empaque *(ya no arrastra estampado ni bordado de la categoría)* |
| CAMISETAS / BasicaCrop | solo puntadas (sin técnica) | corte, **estampado, bordado**, modulos, empaque | corte, **bordado**, modulos, empaque *(sin estampado, porque no tiene técnica)* |
| CAMISAS / Camisas MC | con técnica y puntadas | corte, **bordado**, modulos, botones, empaque *(sin estampado — la categoría no tenía operación de estampado)* | corte, **bordado, estampado**, modulos, botones, empaque *(estampado ahora sí entra, porque lo trae la orden, aunque la categoría no tuviera esa operación mapeada)* |
| HENLEY / Henley MC | sin técnica ni puntadas | **bordado**, botones, corte, modulos, empaque | botones, corte, modulos, empaque *(sin bordado)* |
| BOXER / Boxer | solo puntadas | corte, modulos *(antes ni figuraba bordado — Boxer recién quedó mapeado en este mismo cambio)* | **bordado**, corte, modulos |

El caso de CAMISAS es el más importante de entender: antes, el estampado dependía de si la categoría tenía
o no una operación de estampado mapeada; ahora depende únicamente de si la orden trae técnica, sin importar
si la categoría tiene esa operación o no — que es justamente la regla que se pidió.

## Categorías sin mapeo restantes (14, antes 16)

Boxer y Jeans ya no aparecen (se agregó su regla). Quedan estas 14:

Accesorios, Chalecos, Enterizo, JUMPER, Faldas, Crew, Crew Moda, Crew Zip, Jogger, Jogger Moda,
Camiseta Tejida, Henley Tejida, Hoodie Tejido, Polo Tejida.

## Comparativa DENIM vs. JEANS

| Padre | Categorías hija | Órdenes hoy |
|---|---|---:|
| DENIM (mapeado a JEANS en la hoja LMO) | Jeans, Short Denim | 0 |
| JEANS | Jeans | 0 |

**0 órdenes en ambos porque la Parte 2 (carga de órdenes) todavía no se ha ejecutado** — este número no dice
nada todavía sobre cuál se usa más en la operación real.

Dato relevante para tu decisión: **ambos padres tienen una categoría hija literalmente llamada "Jeans"**
(DENIM → Jeans, JEANS → Jeans) — son dos registros de categoría distintos con el mismo nombre de hija, no la
misma fila. Esto sugiere fuertemente que son un duplicado del catálogo (quizás uno viejo y uno nuevo, o una
migración a medias), pero **no los unifiqué**: es una decisión que te corresponde a ti, con más contexto del
que tengo yo sobre por qué existen los dos.

## Qué falta / no se tocó

- No se construyó la bandeja de pendientes donde debería aparecer "sin velocidad de bordado configurada"
  (`o.pendBordadoVel`) de forma visible — el campo ya se calcula y se guarda en cada orden, pero mostrarlo en
  una bandeja permanente es parte del Paso 9 (categorías/pendientes sin resolver), que sigue sin construirse.
- La vista previa de impacto en la fecha de fin (`confirmarImpactoOrden`) es una versión mínima nueva, hecha
  ahora para técnica/puntadas: compara el fin estimado antes/después con `programar()` (sin modificarlo) y
  avisa con una alerta antes de guardar. No es la vista previa completa de lavado/plancha que se pidió en la
  Parte 1 (Paso 8) — esa nunca se construyó, así que no había nada que replicar; esta es la primera versión
  de ese tipo de aviso en el sistema.
- No se cargó ninguna orden real ni materiales.
- No se tocaron capacidades ni `programar()` más allá de `armarRuta()`.

---
*Reporte generado automáticamente tras aplicar la corrección en producción. Commit del código: `dcad2d6`.
Mapeo BOXER/JEANS aplicado y verificado con recarga real desde Supabase.*
