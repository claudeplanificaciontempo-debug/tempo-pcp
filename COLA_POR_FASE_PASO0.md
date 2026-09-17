# Cola del centro — orden por fase con corte de profundidad · Paso 0 (reporte, nada construido)

**17-sep-2026.** Medido en el simulador con el volcado real (semana 14–20 sep) con un modo nuevo del harness
(`?captura=fases`, queda en `test/driver.js`) que vuelca la cola completa de cada centro por fase. El análisis del encaje
lo hicieron dos agentes en paralelo y un tercero lo refutó contra el código y las pruebas; lo que sigue es la síntesis, con
lo que el refutador corrigió.

## 1 · Qué fases hay hoy en la cola de cada centro (órdenes por fase · grupo de cercanía actual)

`colaCentro` = órdenes abiertas con el centro en la ruta, no hechas y no bloqueadas por el motor. Entre paréntesis, las que
`filasDeCentros` trae y la cola descarta por `bloqueo` del motor (sin liberar / tela pendiente).

| Centro | Cola | Fases (n) · grupo que les da hoy la cercanía |
|---|---:|---|
| **Corte** (101 → 72, 29 bloqueadas) | 72 | 0Recetas Insumos 25 · 0Diseño 14 → *lejana* · **3CD CORTE 10 · 4Preparacion Insumos 8 · 3Trazos 6 · 4CD Ensamble 3 · 4Corte Planta 3 · 2Planificacion 2 · 3AEROPUERTO 1** → *disponible* |
| **Estampado** (57 → 26, 31 bloq.) | 26 | 4CD Ensamble 10 · 3CD CORTE 4 · 5Maquila Conf 4 · 6Bordado 3 · 6 CD BORDADO 1 · 6Serigrafia 1 · 5CD Maquila 1 · 4Preparacion Insumos 1 · 6 Etiquetado 1 → **todas *disponible*** |
| **Bordado** (342 → 163, 179 bloq.) | 163 | 0Recetas Insumos 49 → *lejana* · 5Maquila Conf 18 · 6Bordado 17 · **3CD CORTE 17** · 4CD Ensamble 14 · 4Preparacion Insumos 11 · 2Planificacion 9 · 4Corte Planta 7 · 3AEROPUERTO 6 · 5CD Maquila 5 · 6 CD BORDADO 4 · 6 Etiquetado 2 → *disponible* · 3Trazos 4 → *por llegar* |
| **Confección** (105 → 76, 29 bloq.) | 76 | 0Recetas Insumos 25 · 0Diseño 14 · 3CD CORTE 10 · 4Preparacion Insumos 8 · 3Trazos 6 · 4CD Ensamble 3 · 4Corte Planta 3 · 2Planificacion 2 · 3AEROPUERTO 1 → *por llegar* · **7Confección 3 · 7Pulido 1** → *disponible* |
| **Botones** (38 → 28, 10 bloq.) | 28 | 0Recetas Insumos 12 · 3Trazos 3 · 4CD Ensamble 2 · 0Diseño 2 · 4Preparacion Insumos 1 · 3CD CORTE 1 → *por llegar* · 5Maquila Conf 4 · **8Lavanderia 2 · 8Empaque 1** → *disponible* |
| **Lavado** (38 → 28, 10 bloq.) | 28 | las mismas 28 de Botones (van juntas en la ruta), un paso más atrás: 0Recetas Insumos 12 · 3Trazos 3 · 0Diseño 2 · 4Preparacion Insumos 1 · 3CD CORTE 1 → *lejana* · 5Maquila Conf 4 · 8Lavanderia 2 · 4CD Ensamble 2 · 8Empaque 1 → *por llegar* |
| **Empaque** (122 → 93, 29 bloq.) | 93 | 0Recetas Insumos 25 · 3CD CORTE 10 · 4Preparacion Insumos 8 · 3Trazos 6 · 4Corte Planta 3 · 4CD Ensamble 3 · 3AEROPUERTO 1 → *lejana* · 0Diseño 14 · 5Maquila Conf 4 · 8Lavanderia 3 · 7Confección 3 · 2Planificacion 2 · 7Pulido 1 → *por llegar* · **8Empaque 6 · 8Servicios y Terminados 4** → *disponible* |
| Etiquetas, Plancha | 0 | ninguna orden los tiene en la ruta |

Lo que la medición deja a la vista (y que la lista por centro corrige):

- **El umbral en pasos da resultados incoherentes para la MISMA orden según el centro**: las 39 sin WH (0Diseño / 0Recetas
  Insumos) son *Lejanas* en Corte y Lavado pero *Por llegar* —grupo abierto— en Confección (39), Botones (14) y Empaque (21),
  solo porque les quedan ≤ 2 pasos pendientes. Es el argumento más fuerte para cambiar la regla.
- **Fases del propio grupo o posteriores que salen «disponible»**: en Corte 3 «4CD Ensamble» + 3 «4Corte Planta» + 8
  «4Preparacion Insumos»; en Estampado 10 «4CD Ensamble» + 4 «5Maquila Conf» + 3 «6Bordado»; en Botones 2 «8Lavanderia» +
  1 «8Empaque»; en Empaque 4 «8Servicios y Terminados» + 3 «8Lavanderia». Son órdenes que **según Odoo ya pasaron o están en el
  centro** y cuyo paso no está cerrado aquí. Hay que separar «en proceso aquí» (4Corte Planta) de «ya salió de aquí» (CD del
  propio grupo, 5Maquila Conf en Estampado), y mandar lo segundo a una bandeja, no dejarlo arriba.
- **Bordado con 17 órdenes en «3CD CORTE» como «lista para empezar»**: son las rutas incompletas (`[bordado]` solo): sin centro
  anterior, la llegada sale de la tela y `grupoTela` las da por disponibles aunque la fase de Odoo esté dos grupos antes.
  Con la lista de fases esto se detecta (fase fuera de lista → desacuerdo), hoy no.
- **1Calidad Tintoreria nunca viene de Odoo** (la escribe la app al marcar el baño listo): para que sea la última fase visible de
  Corte hay que meterla desde la tabla 1 (columna `tela`), no de las rutas.

## 2 · Cómo encaja con `cercaniaCentro` (Disponible / Por llegar / Revisar ruta / Lejanas)

Hoy: `colaCentro` ordena puesto manual → grupo de cercanía → llegada → entrega; el grupo lo da `secuenciaCentro` (ruta real:
cierres, OT terminadas, unidades completas) y el umbral en **pasos** pendientes (`prm('umbralCercania',2)`); en pantalla
`partirPorCercania` parte la cola en los cuatro grupos. El motor no usa nada de esto. Tres opciones:

| Opción | Qué es | Qué rompe | Esfuerzo |
|---|---|---|---|
| **A** conservar los 4 grupos y ordenar por fase **dentro** | el umbral en pasos sigue; la fase solo reordena | casi nada (≈5 checks de texto) — pero **no corta por fase** y deja dos criterios para lo mismo (pasos y fases), que es justo lo que pediste cambiar | bajo |
| **B** reemplazar los grupos por el orden de fases | desaparecen grupos, umbral, `partirPorCercania`, `cabGrupoCercHTML`… | ~45 checks en 8 bloques, 4 documentos, y **pierde lo que la app sabe y Odoo no**: una orden con el paso anterior cerrado aquí (cierre / OT / unidades) pero fase atrasada en Odoo bajaría detrás de una que está en la fase CD; Revisar ruta se queda sin sitio | alto |
| **C** híbrido: **Disponible** sigue saliendo de la ruta real (arriba, como hoy); el resto se ordena **por la lista de fases del centro** hasta la fase límite; lo que queda fuera = «**Todo lo que viene**» colapsado; Revisar ruta aparte; **el umbral en pasos se retira** (un solo criterio) | ~12 checks (todos del umbral: CC1 parcial, CC2, campos de CCR/3a) y textos; **no cambian** `moverEnCola`/`puestoDe`, el arrastre, `ordenarColaPorColor`, `colaVisible`, `listasNoProgramadas`, `porQueTardeHTML`, `cabGrupoCercHTML`/`cercAbierto` ni `tabletFilas` (la tablet hereda el orden, sus secciones usan `estadoOrdenCentro`) | medio |

**Recomendación: la C**, que es la que menos rompe *cumpliendo la regla*. Los grupos **se conservan** (Disponible · En camino
· Revisar ruta · Todo lo que viene); lo que cambia es **quién decide** Por llegar/Lejanas: la lista de fases del centro en vez
del umbral en pasos. Dentro de En camino, subcabeceras por fase en el orden de la lista; dentro de cada fase, puesto manual y
luego lo programado (`paso.ini`), sin programar al final.

**Correcciones que el refutador impuso a la C** (las asumo en la construcción):

1. **Puesto manual**: hoy ya es global en el array (`prioCentro`, lo que usa el motor) y *por grupo* en la pantalla. Con las
   subcabeceras de fase, «dentro de cada fase primero el puesto» sale solo, sin tocar `moverEnCola` ni el arrastre. Lo que sí hay
   que resolver: **una orden con puesto manual que caiga en «Todo lo que viene» colapsado hoy es invisible** mientras el motor la
   trata como prioridad 1. Propongo una sección **«Con puesto manual»** arriba de todo (se ve siempre).
2. `ordenCercania` se **reescala** (`grupo·1e9 + faseRank·1e6 + min(9e5, orden+1e3)`): con la fórmula ingenua una orden de la
   primera fase sin programar caía detrás de todas las demás fases (verificado numéricamente).
3. **Fases del propio grupo o posteriores con el paso sin cerrar** no quedan arriba como Disponible: «en proceso aquí» (p. ej.
   4Corte Planta en Corte) va en Disponible con etiqueta; «ya salió de aquí» (CD del propio grupo, 5Maquila Conf en Estampado,
   8Lavanderia en Botones) va a **bandeja de anomalías** (Hoy) y al final, no se esconde.
4. En el **primer centro de producción** (`grupoTela`) «disponible» exige además que la fase esté en la lista del centro (o su grupo
   ≥ el límite); si no, se anota el desacuerdo («la fase dice que está en X, la ruta no tiene ese paso»). Y **la liberación a corte
   (`avance.lista`) manda** sobre una fase textil rezagada en Odoo.
5. La comparación de fases usa `normFase` (como `filaFaseDe`), no el texto crudo.
6. **Regla de escape «llega ya»** (paso anterior termina hoy/mañana o atrasado → sube a En camino aunque esté lejos): mantenerla
   **solo para fases dentro de la lista**; fuera de la lista se convierte en etiqueta sin cambiar de grupo. Si no, en cuanto el
   motor feche las de diseño (Empaque tiene 53 sin programar) reabre lo que el límite cerró. **Decisión tuya.**
7. Dato corregido: en el volcado **no hay Facturado ni Stand by en ninguna cola** (`abiertaDe` las excluye); lo que aparece como
   anomalía son las fases del propio grupo/posteriores del punto 3.
8. Las fases **CD** (`esCola`) no calzan mecánicamente con «ya en el centro»: 3CD CORTE y 4CD Ensamble viven en el grupo *anterior*
   al centro que esperan; 1CD Tintoreria, 5CD Maquila, 6 CD BORDADO/SERIGRAFIA en el *mismo*. Y el motor **no lee `esCola`**: una
   4CD Ensamble no marca corte hecho (por eso en Corte sale «disponible · lista para empezar» y en Confección «falta Corte»). Para
   la siembra hace falta una **columna «centro que espera»** en la tabla 1 (o la lista misma lo resuelve, que es lo que propongo).

## 3 · Configuración: tabla nueva y siembra

`S.params.fasesCentro[c] = {fases:[…en orden, la primera es la más cercana…], limite:'<última visible>', sugerido:true,
confirmado:null|{u,ts}}`, mismo patrón que los grupos de módulos (nace «sugerido», confirmar con permiso `programa`, tocarla la
devuelve a sugerido, bitácora). Centro sin lista → bandeja en Hoy y la cola muestra Disponible + el resto sin orden por fase (no se
inventa). Los textos de grupo salen de la tabla 17.

**Siembra sugerida** (de la tabla 1: grupo de la tabla 5 en orden descendente, fila invertida dentro del grupo, `excluye` poda,
`sinCarga` fuera, `tela` como límite del primer centro; contrastada con la medición real de arriba):

| Centro | Lista (más cercana → última visible) | Fuera (a «Todo lo que viene») |
|---|---|---|
| Corte | 3CD CORTE · 3Trazos · 3AEROPUERTO · 2Planificacion · **1Calidad Tintoreria** | 1Tintoreria, 1CD Tintoreria, 1INCOMPLETOS TIN, 1Tejeduria, 0… |
| Confección | 4CD Ensamble · 6 Etiquetado · 6Bordado · 6Serigrafia · 6 CD BORDADO · 6 CD SERIGRAFIA · 4 Calidad Produccion · 4Preparacion Insumos · 4Incompletos · 4Corte Planta | 3CD CORTE y anteriores |
| Bordado / Estampado / Etiquetas | 6 CD BORDADO ∣ 6 CD SERIGRAFIA · 4CD Ensamble · 4 Calidad Produccion · 4Preparacion Insumos · 4Corte Planta | 3CD CORTE y anteriores |
| Empaque / Botones / Lavado / Plancha | 7Pulido · 7Confección · 5Maquila Recepción · 6 Etiquetado · 6Bordado · 6Serigrafia · 4CD Ensamble | 4Corte Planta y anteriores |

Reproduce tu ejemplo de Corte. Servicios (bordado/estampado) queda «entre» corte y confección en la tabla 5 pero en la práctica es
paralelo: por eso la lista **nace sugerida** y la confirmas tú. Cargar la columna `secuencia` de la tabla 1 (propuesta ya escrita
en `SECUENCIA_FASES_DEVOLUCIONES_REPORTE.md`) haría el orden fino automático en vez de por posición de fila.

## Decisiones que necesito antes de construir

1. Opción **C** con las correcciones 1–8 (o me dices otra).
2. **Escape «llega ya»**: solo dentro de la lista (recomiendo) o etiqueta sin cambiar de grupo.
3. **Órdenes con puesto manual** que caen fuera de la lista: sección «Con puesto manual» arriba (recomiendo) o aviso en la cabecera del
   grupo colapsado.
4. **Fases del propio grupo / posteriores con el paso sin cerrar**: bandeja de anomalías + al final (recomiendo) o arriba con etiqueta.
5. Validar la siembra sugerida por centro (se confirma después en Configuración, pero conviene que la mires ya).
