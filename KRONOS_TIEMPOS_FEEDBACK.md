# Tiempos de Kronos vs LMO: qué conviene subir y qué no — 20-sep-2026

**Pedido de la usuaria:** «saqué de un sistema donde están los tiempos estándar unos archivos, y en otro chat los junté con lo
que nos falta; analízalo, todavía no lo subas, dame tu feedback de qué conviene subir y qué no, porque podemos estarlo dañando».

**Nada se subió.** Este documento es el análisis. Se revisaron los cuatro archivos (`base-tiempos-estandar-tempo.md`,
`kronos-sam-por-referencia.csv`, `kronos-catalogo-operaciones.csv`, `base-tiempos-lmo-vs-kronos.csv`) con cálculos sobre los
datos, cruzándolos contra las órdenes reales cargadas en el sistema (volcado del 13-sep, 583 órdenes abiertas con WH) y contra
cómo la app usa hoy cada tiempo. Cuatro revisores independientes (calidad de datos, validación del resumen, encaje con la app,
caso camisetas) y una síntesis; lo que sigue es lo que se sostiene con números.

---

## 1 · En cinco líneas

1. **Lo más valioso de Kronos no es lo que el otro chat propuso subir, sino lo que dejó de lado: el SAM por referencia (por
   estilo).** El código de referencia de Odoo existe en Kronos para **561 de las 583 órdenes abiertas con WH (96 %; 98 % de las
   prendas)**; con la línea correcta, 543 (93 %). Eso es mejor que cualquier promedio por familia.
2. **Camisetas:** la app usa 13,46 min de confección para las 11 camisetas por igual; Kronos por referencia dice **≈4,5**
   (CR 4,47 · Level 1/2 4,47 · CV 5,64 · Bolsillo 6,51) y **sí distingue tipos**. Son 81.916 prendas lanzadas: hay
   **≈11.700 horas de confección en el programa que no existen** (el 30 % de toda la confección pendiente). Y no es que la LMO
   tenga tiempos malos: **los minutos por operación son los mismos** (271 de 529 idénticos al tercer decimal — la hoja LMO se
   llenó de Kronos); lo que sobra es que la app **suma las 44 operaciones de la hoja, fijas y variantes**.
3. **Lo que el resumen propone subir no conviene tal cual:** las cifras para las 11 familias sin hoja son **totales** (corte +
   confección + estampado + pulido + empaque) y las quiere poner donde la app guarda **solo confección** (los estimados de
   Santiago); comparando confección con confección, **Kronos confirma a Santiago** (Jogger 12,06 vs 13,65 · Crew 9,89 vs 11,08 ·
   Faldas 11,87 vs 14,10 · Enterizo 21,2 vs 22,3 · Chalecos 17,29 vs 17,55). Los botones para camisetas (2,35) salen de **7
   referencias entre 1.923**. Los pasos nuevos tienen 8, 33 y ~180 usos.
4. **Los archivos no están limpios**: el SAM por referencia arrastra «Ticket por leer», «Void» y fichas de muestra de 60 min
   (1.036 usos de control), 87 «referencias» que son estudios incompletos (≤ 5 operaciones), y **el código de referencia se
   repite entre líneas** (373 referencias viven en 2+ líneas con prendas distintas: la «1» es un Body de 13,9 min y un
   Pantalón Jean de 19,5; la «1032» una Camisa de 38 y una Camiseta de 6,9). La clave tiene que ser **línea + referencia**.
5. **Recomendación:** no subir ningún valor ahora. Construir (con tu OK) una **capa de SAM por referencia**, apagada, importada
   con origen «Kronos · extracción dd-mm», que se prenda por familia con un antes/después a la vista, empezando por camisetas;
   y en paralelo el «¿Aplica a este tipo?» de la hoja LMO, que es la corrección de fondo. Todo lo confirmado por producción
   (Santiago, botones en 0, LMO) se queda como está.

---

## 2 · Qué es cada archivo (y qué no es)

| Archivo | Qué es | Lo que hay que saber |
|---|---|---|
| `kronos-sam-por-referencia.csv` (5.152 filas, 29 líneas) | Por (línea, referencia, juego de tallas): número de operaciones y minutos de confección / corte / maquila / otros | **Está crudo**: entran las 126.552 filas del listado sin quitar nada (la limpieza solo se aplicó al catálogo). «otros» mezcla estampado (1.607 usos en camisetas), bordado, pulido, etiquetado, empaque, revisión y fichas. «maquila» es cero en la práctica (14 min en todo el archivo). 87 «referencias» tienen ≤ 5 operaciones (estudios sin terminar), 39 duran < 1 min. 373 referencias están en 2+ líneas; 17 pares solo difieren por ceros a la izquierda y tienen tiempos distintos; 23 referencias tienen dos juegos de talla (en 17 uno de los dos está incompleto). 1.500 referencias tienen letras o sufijos (-B, -BY, 9880-S). |
| `kronos-catalogo-operaciones.csv` (7.552 filas) | Por (línea, código, operación, máquina): usos, mediana del tiempo, mínimo y máximo | Quedan 354 filas Ticket/Void (1.036 usos). El mismo código aparece varias veces (1.373 pares con 2+ filas); «Armar cuello» se usa como nombre comodín (en jeans aparece con 12 máquinas). El 61 % de las filas tiene un solo tiempo medido. Sirve para ver **qué operaciones lleva de verdad cada prenda y cuántas referencias las usan**; no para sumar tiempos a ciegas. |
| `base-tiempos-lmo-vs-kronos.csv` (595 filas) | Las 595 operaciones de la hoja LMO con el tiempo Kronos al lado y una marca «revisar» | **No propone cambiar ningún tiempo** (`tiempo_propuesto` = `tiempo_tempo` en las 595). De las 86 «revisar», 19 se cruzaron contra OTRA línea y 15 contra ≤ 2 usos (el «CORTE VERTICAL» de 10 categorías se comparó contra CARDIGAN, una línea con 1 referencia). Quedan ~63 que sí vale la pena mirar; en 66 de las 86 Kronos es **mayor** que la LMO. |
| `base-tiempos-estandar-tempo.md` | El resumen del otro chat | Acierta en las reglas (mediana, no promediar entre líneas, columna de origen, no tocar la LMO). Falla en lo que propone subir (sección 4). |

**Un dato de fondo:** la LMO y Kronos **no son dos mediciones**. 271 de las 529 operaciones cruzadas tienen exactamente el
mismo tiempo (unir hombros 0,35 = 0,35 · pegar mangas 0,54 = 0,54 · cerrar costados 0,61 = 0,61 · pegar cuello 0,391 = 0,39…).
El «356 de 529 dentro de ±20 %» del resumen no valida nada: es la misma fuente vista dos veces. Hay que preguntar en la casa si
la hoja LMO se llenó desde Kronos.

---

## 3 · El hallazgo que cambia el cuadro: Kronos tiene el SAM por estilo

### 3.1 Cobertura contra las órdenes reales
Cruzando el código de referencia de Odoo (Stilo: 4204, 6206, 3763…) contra Kronos:

| | Órdenes | Prendas |
|---|---|---|
| Abiertas con WH (base «lanzadas») | 583 | 100 % |
| Con la referencia en Kronos (cualquier línea) | 561 (96 %) | 98 % |
| Con la referencia en Kronos **en la línea que corresponde a su familia** | 543 (93 %) | 96 % |

Por familia (con línea): CAMISETAS 199/205 · POLOS 120/126 · SHORT PLANOS 63/63 · FITS 27/33 · CAMISAS 18/18 · TEJIDOS 16/16 ·
PANTALONES PLANOS 14/17 · DENIM 12/12 · CHOMPA 11/13 · Fleece Pesado 7/14 · JOGGER 7/9 · VESTIDOS 7/7 · BOMBER 7/8 · BVD 7/7 ·
BODY 6/6 · HENLEY 6/6 · HODDIE 6/9 · FALDAS 5/5 · SHORT FLECCE 3/3 · ENTERIZO 1/1 · Fleece Basico 1/5.

**Por qué importa:** hoy el SAM sale de la **categoría** (todas las camisetas iguales; todos los polos iguales). Kronos lo tiene
**por referencia**, que es como se mide en ingeniería y como varía de verdad la prenda.

### 3.2 Camisetas: la brecha es la longitud de la ruta, no los minutos
- Hoja LMO CAMISETA: 44 operaciones (35 de confección = **13,46 min**; + corte 0,50, bordado 0,51, empaque 0,44, serigrafía 0,47 = 15,38).
  Son **excluyentes entre sí**: «unir hombros» (0,35) y «unir hombro izquierdo» + «derecho» (0,25 + 0,30); cinco acabados de cuello
  (cuello 0,39 / collarete 0,70 / tira 1,00 / tirilla 0,35 ×2 máquinas); seis acabados de manga; seis «unir pieza» de ranglan/cortes;
  bolsillo 1,30. La app **las suma todas** para las 11 camisetas.
- Tomando UNA variante por operación y solo lo que lleva una camiseta cuello redondo básica (11 operaciones), **con los tiempos de
  la LMO da 4,05 min**; con los de Kronos, 3,98. Kronos por referencia en las órdenes reales de TEMPO: **CR 4,47 (105 órdenes,
  56.313 prendas, casi constante) · Level 1 4,47 · Level 2 4,47 · CV 5,64 · Corte Moda 4,62 · Fashion Graphics 5,71 · Bolsillo 6,51**.
- **Impacto:** 176 órdenes de camisetas aún no pasan por confección = 78.122 prendas × (13,46 − 4,5) ≈ **700.000 min = 11.666 h =
  1.458 jornadas-persona** que hoy están en el programa y no existen. La confección pendiente total de la planta bajaría de 38.864 h a
  ≈27.200 h (−30 %). Esto distorsiona hoy la nivelación de Confección, Capacidad y decisiones, el plan del mes y las marcas «va tarde»
  de la familia más grande (35 % de las órdenes lanzadas).
- El mismo patrón (ruta larga) está en **HENLEY** (14,58 vs ≈4,9; pero Kronos no tiene línea henley: cruce dudoso), **SHORT CARGO**
  (30,1 vs 15,0) y **PANTALÓN PLANO** (28,0 vs 15,4). Las otras 14 categorías cuadran con Kronos dentro de ±30 %.

### 3.3 Carga de confección de las órdenes lanzadas: app vs Kronos por referencia (horas, cant × SAM, sin descontar avance)

| Familia | App hoy | Kronos por referencia | |
|---|---:|---:|---|
| CAMISETAS | 18.171 | 6.446 | −65 % |
| POLOS | 9.777 | 10.825 | +11 % |
| SHORT PLANOS | 6.270 | 5.826 | −7 % |
| PANTALONES PLANOS | 1.297 | 826 | −36 % |
| CAMISAS | 1.270 | 1.562 | +23 % |
| DENIM | 856 | 1.429 | +67 % |
| FITS | 647 | 1.028 | +59 % |
| HENLEY | 413 | 273 | −34 % (línea dudosa) |
| VESTIDOS · BODY · BOMBER | 375 · 318 · 297 | 394 · 321 · 302 | ≈ igual |
| CHOMPA · SHORT FLECCE · HODDIE · BVD | 206 · 158 · 104 · 45 | 303 · 202 · 118 · 68 | +47 · +28 · +13 · +52 % |
| **Total (cubiertas)** | **40.204** | **31.152** | **−22 %** |

No todo va hacia abajo: Denim, Fits, Camisas, Chompas y BVD están **por debajo** en la app. Las familias sin hoja (Jogger, Fleece,
Faldas, Enterizo, Tejidos) no están en la tabla porque su valor en la app es el estimado de Santiago, que Kronos confirma (sección 4).

---

## 4 · Revisión del resumen del otro chat

**Lo que está bien y hay que conservar:** manda la medición propia; mediana, no promedio; no promediar entre líneas; excluir
tickets/void; cada tiempo con columna de origen; no proponer cambios a la LMO; y la observación clave: «el minuto por operación
casi coincide; donde falla es la longitud de la ruta».

**Lo que no se sostiene con los datos:**
1. **«11 familias sin hoja resueltas desde Kronos» (Jogger 17,0 · Crew 15,3 · Crew Zip 26,2 · Faldas 16,2…)**: son medianas de
   `total_min` (corte + confección + estampado + pulido + empaque) y se proponen para reemplazar `k.minEstConf`, que es **solo
   confección** y está **confirmado por producción** (Santiago, 16 y 19-sep). Confección contra confección: Jogger 12,06 vs 13,65 ·
   Crew 9,89 vs 11,08 · Faldas 11,87 vs 14,10 · Enterizo 21,2 vs 22,3 (4 refs) · Chalecos 17,29 vs 17,55 · Hoodie tejido 14,84 vs 14,42 ·
   Polo tejida 15,9 vs 14,77 · **Camiseta tejida 4,57 vs 4,68**. Kronos **confirma** a Santiago; solo **Crew Zip** queda lejos (15,3 vs
   21,6), y ese 21,6 es la línea CAPUCHA CIERRE (chompa con capucha y cierre), que no es necesariamente un crew con medio cierre.
   Accesorios 3 vs 0,97 sale de una línea con 13 referencias, 9 incompletas. Polo tejida 16,8 no es reproducible con ningún corte.
2. **Tejidos «con la línea más parecida, confianza baja»**: Kronos no tiene línea de prenda tejida. Un valor prestado de otra prenda
   es un valor inventado; se queda el estimado de Santiago.
3. **Ojales y botones**: Camiseta CR/CV **2,35** = «Pegar botones» 1,656 (7 usos) + «Hacer ojales» 0,699 (7 usos) sobre 1.923
   referencias — 7 camisetas con tapeta (henleys/polos cargados en esa línea); el 99,5 % no lleva la operación. BVD 0,56 (≤ 3 % de las
   referencias). Short 0,71 es doble conteo (la misma operación «Hacer ojales» en dos subprocesos: 0,32 + 0,26 + botones 0,13); lo que
   Kronos respalda es **un** ojal de 0,26–0,32, que es lo que ya tiene la tabla (0,26). **Jeans 0,40 y Vestidos 1,41** sí tienen
   respaldo parcial (jeans: 52 usos en 29 referencias; vestidos: 33 en 90) **pero el 0 está confirmado por producción desde el 16-sep** →
   es una pregunta para producción, no una carga.
4. **Pasos nuevos**: Sublimado tiene **8 usos** en camisetas (1,40) y 1–4 en las demás líneas: la misma base que el «CREW 5,0» que el
   resumen descarta. Apliques 0,38 (33 usos en camisetas) es lo único con algo de base. Cordones «SHORTS 0,90 con 227 usos» es falso: 227
   son los usos de «Pegar botones» en POLOS; «pasar cordón» en SHORTS tiene 180 usos (0,90) más «rematar puntas» (0,31); en JOGGER 0,36
   (157). Y en Kronos el cordón está **dentro** de la confección; si el paso Cordones se hace en módulos, no debería tener minuto aparte.
5. **«14 de 18 coinciden»**: enumera 12; JEANS 22,0 vs 31,7 (+44 %) va como «coincide»; VESTIDOS (−21 %) y SHORT PLANO (−19 %)
   desaparecen; CHOMPA y HODDIE se comparan contra la **misma** unión de líneas (21,6), que por separado da 26,2 y 18,4.
6. **La regla «no promediar entre líneas» se incumple en el propio resumen**: CAMISETAS+CREW (la mediana 8,32 es la de camisetas; CREW
   sola 15,25), SHORTS CARGO+SHORTS (2 + 317 referencias), CAPUCHA CIERRE+HOODIES. Tres de las cuatro «no coinciden» salen de ahí.
7. **«Kronos aporta donde el PCP no tiene hoja»**: al revés. Donde no hay hoja, Kronos confirma lo que ya hay. Donde **sí** hay hoja
   (camisetas) es donde Kronos muestra el problema.

---

## 5 · Qué subir, qué subir con condición, qué no subir

### NO subir (dañaría)
- **Los totales de Kronos para las 11 familias sin hoja** sobre `k.minEstConf`: mezclan centros y pisan una confirmación de persona.
- **Ojales y botones desde Kronos**: 2,35 en camisetas (7 de 1.923), 0,56 en BVD, 0,71 en short (doble conteo); ni Jeans/Vestidos por
  siembra (0 confirmado el 16-sep: si producción cambia de opinión, se edita la tabla con bitácora).
- **Los 86 «revisar» como cambios a la LMO**: el cruce no los propone; 66 de 86 empujan **hacia arriba** (camiseta subiría a 18,35) cuando
  el problema real es hacia abajo; 34 son ruido (otra línea o ≤ 2 usos).
- **`ref.csv` o `cat.csv` tal como están**: tickets, void, fichas de 60 min, estudios incompletos, referencias repetidas entre líneas.
- **Una línea de Kronos elegida «por parecido»** (Tejidos, Henley): sin línea confirmada, esa familia se queda con lo que tiene.
- **Nada que encienda solo**: ni siembra ni carga automática; la usuaria prende por familia con el antes/después a la vista.

### Subir CON condición
- **SAM por referencia (línea + referencia) como capa nueva, apagada** — condiciones: (a) extracción **cruda** de Kronos fila por fila
  (línea · tallas · ref · código · operación · subproceso · máquina · tiempo) con fecha, para separar confección de estampado/bordado/
  pulido/empaque por referencia y limpiar tickets/void/fichas y estudios incompletos con conteos en bitácora; (b) tabla **familia
  TEMPO → línea Kronos** en Configuración, confirmada por ti (las dudosas: HENLEY, TEJIDOS, CHOMPA/HODDIE, SHORT CARGO, Crew Zip);
  (c) regla de desempate escrita: texto exacto antes que sin ceros; dos líneas candidatas = **ambigua** (cae a la categoría y va a
  bandeja); dos juegos de talla = el que calce con las tallas pedidas, si no ambigua; (d) precedencia fija y visible: SAM puesto por
  persona en la orden > referencia confirmada > referencia Kronos (solo con el interruptor de la familia) > categoría (LMO / Santiago);
  (e) antes/después por familia (horas de confección, órdenes que dejan de ir tarde, nivelación) **en seco**, como se hizo con los motores.
- **Apliques 0,38 / Cordones / Sublimado** como **referencia para que producción ponga el minuto** («Kronos: pasar cordón 0,36–0,90
  según línea, 180 usos»), no como valor sembrado; antes hay que decidir si el cordón se hace dentro o fuera de módulos.
- **Jeans 0,40 y Vestidos 1,41 en ojales y botones**: solo si producción reconfirma (¿el 0 es «lo hace la maquila» o fue provisional?).
- **Lista depurada de ~63 operaciones de la LMO para ingeniería** (misma línea, ≥ 10 usos): como lista de trabajo, no como cambio.

### Subir (sin riesgo, útil ya)
- **Columna de contraste** al lado de cada tiempo de la LMO y de cada minuto estimado: «Kronos: X min · línea · N usos / N referencias ·
  extracción dd-mm», visible y **sin efecto en el motor**. Cumple el principio 2 (se ve de dónde sale) y deja que ingeniería decida.
- **Nota en los 14 estimados de Santiago**: «contrastado con Kronos dd-mm: mediana de confección de la línea X = Y» — sin cambiar el valor.
- **Corrección del resumen** (este documento) para que no circule con «14 de 18 coinciden», «Camiseta CR/CV 2,35» ni «SHORTS 227 usos».

---

## 6 · Preguntas que solo tú (o ingeniería) pueden responder
1. **¿Cuál es la fuente oficial de tiempos: Kronos o la hoja LMO del PLM?** ¿La LMO se llenó copiando de Kronos (271 tiempos idénticos)?
   ¿Kronos sigue vivo (ingeniería mide ahí) o es un histórico? ¿De qué fecha es la extracción?
2. **Camisetas**: ¿producción confirma que una CR básica lleva ~11 operaciones y ≈4,0–4,5 min de confección? ¿Prefieres corregir la
   hoja (marcar por tipo qué aplica, con el Excel que te mandé) o encender el SAM por referencia solo para camisetas y ver el antes/después?
   Se pueden hacer las dos.
3. **¿Los 13,46 ya están dentro de algún compromiso?** (plan congelado del mes, metas, fechas prometidas). Corregir mueve ≈11.700 h de
   Confección y conviene avisarlo antes.
4. **Línea de Kronos por familia**: HENLEY (¿camisetas, crew o ninguna?), TEJIDOS (no existe: ¿se queda con Santiago?), CHOMPA/HODDIE
   (¿capucha cierre, hoodies o las dos?), SHORT CARGO (2 referencias), **Crew Zip** (¿crew con medio cierre o chompa con capucha y cierre?).
5. **Jeans y vestidos en ojales y botones**: el 0 confirmado el 16-sep, ¿significa «lo hace el proveedor/maquila» o fue provisional?
   Kronos muestra ojal + botón en 17 de 29 referencias de jean y en 8 de 90 vestidos.
6. **Cordones**: en Kronos el «pasar cordón» está dentro del ensamble. ¿El paso nuevo se hace fuera de módulos? Si es adentro, no lleva
   minuto propio. Sublimado/Apliques: ¿el minuto va por tipo de producto o por técnica?
7. **¿Los tiempos de Kronos ya llevan suplementos y eficiencia, o son tiempo básico?** Ninguna fuente lo dice y la app usa el minuto tal cual.
8. **¿Hay alguien de ingeniería que pueda confirmar referencias una por una?** La capa está pensada para que lo de Kronos entre «prestado» y
   una persona lo marque confirmado o descartado; sin dueño quedaría prestado para siempre.

---

## 7 · Cómo lo haría (cuando digas que sí; nada de esto está construido)
1. **Extracción cruda** de Kronos (las 31 líneas) guardada como archivo de origen con fecha; limpieza con conteos fijados en pruebas
   (126.552 usos crudos · ≈1.050 usos de control · 87 estudios incompletos · 373 referencias multi-línea · 17 pares por ceros).
2. **Tabla familia → línea** en Configuración → Operaciones, sembrada como «sugerida» desde el mapeo del resumen, confirmada por ti.
3. **Importador con vista previa** (patrón del maestro de productos: nada se escribe hasta aplicar): filas `{línea, ref, tallas, nOps,
   confección, corte, otros, fuente, fecha, estado: kronos | confirmada | descartada}`; una nueva extracción actualiza las «kronos» y
   nunca pisa las confirmadas/descartadas. Registro de cargas tipo «kronos» y bitácora.
4. **Un solo punto de entrada** en el cálculo del minuto de cada paso (donde hoy se congela `p.t` al armar la ruta), con origen visible en
   la ficha y en la columna Ruta: «SAM ref 4,47 · Kronos CAMISETAS 4204 · categoría 13,46» o «SAM de la categoría · sin referencia».
   Propagación a las órdenes ya cargadas al encender/apagar (como se hace con botones), con antes/después en horas en bitácora.
5. **Panel de cobertura** (Configuración y Reportería): por familia, órdenes con referencia / sin / ambiguas / tallas ≠, horas antes vs
   después; bandejas «referencia ambigua» y «sin referencia» en Hoy → Pendientes (cuentan, no bloquean).
6. **Encendido por familia**, empezando por CAMISETAS (199/205, −65 %), con el antes/después a la vista; luego Polos y Short planos.
7. En paralelo, cuando vuelva el «¿Aplica a este tipo?», la selección por hija entra en la hoja LMO (`k.ops`), protegida de las recargas
   de la LMO (hoy una recarga la borra: hay que arreglarlo antes).

**Lo que no cambia con nada de esto:** los tiempos de la LMO, los 14 estimados de Santiago, la tabla de ojales y botones, los pasos nuevos
en 0 con brecha visible. Todo valor prestado de Kronos se ve como prestado hasta que una persona lo confirme.
