# Hoja de operaciones por familia — para llenar ORDEN y revisar MÁQUINA

Fecha: 13 de septiembre de 2026. Fuente: las 595 operaciones de la hoja LMO de OPERACIONES.xlsx cargadas en el sistema de planificación. Documento para imprimir y llenar a mano en producción.

**Qué se pide**
- **ORDEN (en blanco)**: escribir en qué número de paso va cada operación dentro de la prenda (1, 2, 3…). Este dato **no existe** ni en el archivo original ni en el sistema: la columna "SEC OP" de la hoja LMO no es la secuencia de la prenda, es un contador de variantes de la misma operación (480 de 595 filas dicen "01"; solo cambia cuando la misma operación existe con dos máquinas, p. ej. PEGAR TIRILLA 01 en recta doble aguja y 02 en tirilladora). Se muestra en la columna "Variante" solo como referencia.
- **MÁQUINA (revisar)**: la hoja LMO ya trae una máquina para 594 de las 595 operaciones. Está impresa tal cual vino; si es correcta no hace falta escribir nada, si está mal se tacha y se escribe la correcta en el espacio en blanco de al lado. Ojo: el archivo mezcla escrituras ("OVERLOCK 4 HILOS" y "OVERLOK 4 HILOS" son la misma máquina; "RECTA" y "RECTA TP" también aparecen separadas): conviene unificar al revisar.
- **Minutos** = tiempo estándar por prenda de la hoja LMO (columna TIEMPO REF). No se pide corregirlo aquí, pero si está claramente mal se puede anotar al margen.
- **Centro** = a qué centro del sistema pertenece la operación (Corte, Confección, Empaque, Estampado, Bordado, Botones, Etiquetas). Sale de la familia de operación (CORTE → Corte; ENSAMBLE, SUBENSAMBLE y PULIDO → Confección; EMPAQUE → Empaque; BORDADO → Bordado; BOTONES y OJALES → Botones; SERIGRAFIA → Estampado, salvo ETIQUETAR → Etiquetas).
- Las filas van agrupadas por **familia de categoría** (la hoja LMO está por familia, no por cada categoría hija: todas las camisetas comparten la misma lista) y dentro de cada familia por **sección de la prenda** (Frente, Hombros, Mangas, Cuello, Costados, Bajos…) tal como vienen en el archivo. Ese orden de filas es solo el del archivo, no la secuencia real; por eso se pide la columna ORDEN.
- Las cuatro primeras familias (CAMISETAS, POLOS, SHORT PLANOS, PANTALONES PLANOS) son las que planificación pidió llenar primero; el resto va de mayor a menor volumen de órdenes abiertas hoy en el sistema.

| # | Familia | Operaciones en la hoja | Órdenes abiertas hoy | Prendas |
|---:|---|---:|---:|---:|
| 1 | CAMISETAS | 44 | 205 | 81.916 |
| 2 | POLOS | 24 | 126 | 44.289 |
| 3 | SHORT PLANOS | 35 | 39 | 10.284 |
| 4 | PANTALONES PLANOS | 40 | 17 | 3.503 |
| 5 | FITS | 19 | 33 | 7.141 |
| 6 | SHORT CARGO | 43 | 24 | 5.913 |
| 7 | CAMISAS | 34 | 18 | 3.200 |
| 8 | JEANS | 49 | 12 | 2.713 |
| 9 | HENLEY | 34 | 6 | 1.700 |
| 10 | BODY | 25 | 6 | 1.424 |
| 11 | VESTIDOS | 35 | 7 | 1.279 |
| 12 | CHOMPAS | 35 | 13 | 985 |
| 13 | SHORT FLEECE | 29 | 3 | 760 |
| 14 | HOODIES | 29 | 9 | 727 |
| 15 | BVD | 19 | 7 | 638 |
| 16 | BOMBER | 37 | 8 | 629 |
| 17 | PANTALÓN (fleece) | 32 | 0 | 0 |
| 18 | BOXER | 32 | 0 | 0 |

---

## 1 · CAMISETAS — 44 operaciones · 205 órdenes abiertas · 81.916 prendas

Minutos de confección por prenda que suma esta familia: **13,46**. Los minutos de corte, empaque y servicios van aparte por centro.

| Código | Operación | Sección | Familia op. | Minutos | Centro | Variante | ORDEN (llenar) | MÁQUINA (revisar) | Corrección |
|---|---|---|---|---:|---|---|---|---|---|
| TENCAM | TENDIDO | GENERAL | CORTE | 0,30 | Corte | 01 | | MANUAL | |
| CORCAM | CORTE | GENERAL | CORTE | 0,10 | Corte | 01 | | VERTICAL | |
| PAQCAM | PAQUETEO | GENERAL | CORTE | 0,05 | Corte | 01 | | MANUAL | |
| CMACAM | CORTE MATERIAL | GENERAL | CORTE | 0,05 | Corte | 01 | | SESGADORA | |
| DOBBBL | DOBLAR BOCA DE BOLSILLO | FRENTE | SUBENSAMBLE | 0,30 | Confección | 01 | | RECUBRIDORA | |
| PEGBL | PEGAR BOLSILLO | FRENTE | SUBENSAMBLE | 1,00 | Confección | 01 | | RECTA | |
| UNIPZH | UNIR PIEZA HORIZONTAL | FRENTE | SUBENSAMBLE | 0,20 | Confección | 01 | | OVERLOCK 4 HILOS | |
| UNIPZV | UNIR PIEZA VERTICAL | FRENTE | SUBENSAMBLE | 0,20 | Confección | 01 | | OVERLOCK 4 HILOS | |
| UNIHB | UNIR HOMBROS | HOMBROS | ENSAMBLE | 0,35 | Confección | 01 | | OVERLOK 4 HILOS | |
| UNIHI | UNIR HOMBRO IZQUIERDO | HOMBROS | ENSAMBLE | 0,25 | Confección | 01 | | OVERLOK 4 HILOS | |
| UNIHD | UNIR HOMBRO DERECHO | HOMBROS | ENSAMBLE | 0,30 | Confección | 01 | | OVERLOK 4 HILOS | |
| UNIPZ | UNIR PIEZA | HOMBROS | SUBENSAMBLE | 0,20 | Confección | 01 | | OVERLOCK 4 HILOS | |
| PESHB | PESPUNTE DE HOMBROS | HOMBROS | ENSAMBLE | 0,30 | Confección | 01 | | RECTA | |
| UNIPZH | UNIR PIEZA HORIZONTAL | POSTERIOR | SUBENSAMBLE | 0,20 | Confección | 01 | | OVERLOCK 4 HILOS | |
| UNIPZV | UNIR PIEZA VERTICAL | POSTERIOR | SUBENSAMBLE | 0,20 | Confección | 01 | | OVERLOCK 4 HILOS | |
| UNIPZH | UNIR PIEZA HORIZONTAL | MANGAS | SUBENSAMBLE | 0,20 | Confección | 01 | | OVERLOCK 4 HILOS | |
| UNIPZV | UNIR PIEZA VERTICAL | MANGAS | SUBENSAMBLE | 0,20 | Confección | 01 | | OVERLOCK 4 HILOS | |
| PEGMG | PEGAR MANGAS | MANGAS | ENSAMBLE | 0,54 | Confección | 01 | | OVERLOK 4 HILOS | |
| DOBMG | DOBLAR MANGAS | MANGAS | ENSAMBLE | 0,50 | Confección | 01 | | RECUBRIDORA | |
| REMMG | REMATE DE MANGAS | MANGAS | ENSAMBLE | 0,35 | Confección | 01 | | RECTA | |
| DOBDBL | DOBLE DOBLADO | MANGAS | ENSAMBLE | 0,45 | Confección | 01 | | RECTA | |
| PEGCOL | PEGAR COLLARETE MANGAS | MANGAS | ENSAMBLE | 0,40 | Confección | 01 | | RECUBRIDORA | |
| PEGPÑ | PEGAR PUÑOS | MANGAS | ENSAMBLE | 0,40 | Confección | 01 | | OVERLOK 4 HILOS | |
| REMPÑ | REMATAR PUÑO | MANGAS | ENSAMBLE | 0,30 | Confección | 01 | | RECTA | |
| CERCU | CERRAR CUELLO | CUELLO | SUBENSAMBLE | 0,08 | Confección | 01 | | OVERLOCK 4 HILOS | |
| PEGCU | PEGAR CUELLO | CUELLO | ENSAMBLE | 0,39 | Confección | 01 | | OVERLOK 4 HILOS | |
| PESCU | PESPUNTE DE CUELLO | CUELLO | ENSAMBLE | 0,26 | Confección | 01 | | RECTA | |
| PEGCOL | PEGAR COLLARETE | CUELLO | ENSAMBLE | 0,70 | Confección | 01 | | RECUBRIDORA | |
| PEGTIR | PEGAR TIRA CUELLO | CUELLO | ENSAMBLE | 1,00 | Confección | 01 | | RECTA | |
| PEGTIRI | PEGAR TIRILLA | CUELLO | ENSAMBLE | 0,35 | Confección | 02 | | TIRILLADORA | |
| PEGTIRI | PEGAR TIRILLA | CUELLO | ENSAMBLE | 0,35 | Confección | 01 | | RECTA DOBLE AGUJA | |
| PEGET | PEGAR ETIQUETA | CUELLO | ENSAMBLE | 0,40 | Confección | 01 | | RECTA | |
| PREIN | PREPARAR INSTRUCCIÓN | COSTADOS | SUBENSAMBLE | 0,15 | Confección | 01 | | RECTA | |
| PREET | PREPARAR ETIQUETA | CUELLO | ENSAMBLE | 0,20 | Confección | 01 | | RECTA | |
| UNIPZ | UNIR PIEZA | COSTADOS | ENSAMBLE | 0,20 | Confección | 02 | | OVERLOK 4 HILOS | |
| CERCS | CERRAR COSTADOS | COSTADOS | ENSAMBLE | 0,61 | Confección | 01 | | OVERLOK 4 HILOS | |
| PESCS | PESPUNTE DE COSTADOS | COSTADOS | ENSAMBLE | 0,35 | Confección | 01 | | RECTA | |
| DOBAV | DOBLAR AVERTURA | COSTADOS | ENSAMBLE | 1,16 | Confección | 01 | | RECTA | |
| DOBBJ | DOBLAR BAJOS | BAJOS | ENSAMBLE | 0,42 | Confección | 01 | | RECUBRIDORA | |
| BORCAM | BORDAR | GENERAL | BORDADO | 0,51 | Bordado | 01 | | BORDADORA | |
| REVCAM | REVISAR PRENDA | GENERAL | EMPAQUE | 0,12 | Empaque | 01 | | MANUAL | |
| DOBCAM | DOBLAR PRENDA | GENERAL | EMPAQUE | 0,20 | Empaque | 01 | | MANUAL | |
| ETICAM | ETIQUETAR PRENDA | GENERAL | EMPAQUE | 0,12 | Empaque | 01 | | MANUAL | |
| ESTCAM | ESTAMPAR | GENERAL | SERIGRAFIA | 0,47 | Estampado | 01 | | PULPO MANUAL | |

## 2 · POLOS — 24 operaciones · 126 órdenes abiertas · 44.289 prendas

Minutos de confección por prenda que suma esta familia: **13,69**. Los minutos de corte, empaque y servicios van aparte por centro.

| Código | Operación | Sección | Familia op. | Minutos | Centro | Variante | ORDEN (llenar) | MÁQUINA (revisar) | Corrección |
|---|---|---|---|---:|---|---|---|---|---|
| PREIN | PREPARAR INSTRUCCIÓN | COSTADOS | SUBENSAMBLE | 0,12 | Confección | 01 | | RECTA | |
| PEGVSC | PEGAR VINCHA Y SUJETAR CUELLO | CUELLO | ENSAMBLE | 2,10 | Confección | 01 | | RECTA | |
| UNIHB | UNIR HOMBROS | HOMBROS | ENSAMBLE | 0,35 | Confección | 01 | | OVERLOK 4 HILOS | |
| PEGVHB | PEGAR VIVO EN HOMBROS | HOMBROS | ENSAMBLE | 1,15 | Confección | 01 | | RECTA | |
| PEGCU | PEGAR CUELLO | CUELLO | ENSAMBLE | 0,50 | Confección | 03 | | OVERLOK 4 HILOS | |
| ASEPÑ | PESPUNTE DE PUÑOS | PUÑOS | ENSAMBLE | 0,55 | Confección | 02 | | RECTA | |
| PEGPÑ | PEGAR PUÑOS | PUÑOS | ENSAMBLE | 0,55 | Confección | 02 | | OVERLOK 4 HILOS | |
| PEGMG | PEGAR MANGAS | MANGAS | ENSAMBLE | 0,78 | Confección | 01 | | OVERLOK 4 HILOS | |
| CERCS | CERRAR COSTADOS | COSTADOS | ENSAMBLE | 0,90 | Confección | 01 | | OVERLOK 4 HILOS | |
| DOBACS | DOBLAR ABERTURA COSTADOS | COSTADOS | ENSAMBLE | 1,50 | Confección | 01 | | RECTA | |
| ORIVI | ORILLAR VINCHA | FRENTE | ENSAMBLE | 0,15 | Confección | 01 | | OVERLOK 4 HILOS | |
| PEGTIR | PEGAR Y ASENTAR TIRA EN CUELLO | CUELLO | ENSAMBLE | 1,52 | Confección | 02 | | RECTA | |
| PESVI | PESPUNTE DE VINCHA | FRENTE | ENSAMBLE | 0,50 | Confección | 01 | | RECTA | |
| REMVI | REMATAR VINCHA | FRENTE | ENSAMBLE | 0,07 | Confección | 01 | | RECTA | |
| REMPÑ | REMATAR PUÑOS | PUÑOS | ENSAMBLE | 0,30 | Confección | 01 | | RECTA | |
| DOBBJ | DOBLAR BAJOS | BAJOS | ENSAMBLE | 0,70 | Confección | 02 | | RECUBRIDORA | |
| PREET | PREPARAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,30 | Confección | 01 | | RECTA | |
| PEGET | PEGAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,40 | Confección | 01 | | RECTA | |
| PULPOL | PULIDO PRENDA | GENERAL | PULIDO | 1,25 | Confección | 01 | | MANUAL | |
| HACOJ | HACER OJALES | GENERAL | OJALES | 0,78 | Botones | 03 | | OJALADORA | |
| PEGBOT | PEGAR BOTONES | GENERAL | BOTONES | 0,78 | Botones | 01 | | BOTONADORA | |
| CORPOL | CORTE | GENERAL | CORTE | 0,50 | Corte | 01 | | VERTICAL | |
| ETIPOL | ETIQUETAR PRENDA | GENERAL | EMPAQUE | 0,20 | Empaque | 01 | | MANUAL | |
| BORPOL | BORDAR | GENERAL | BORDADO | 0,51 | Bordado | 01 | | BORDADORA | |

## 3 · SHORT PLANOS — 35 operaciones · 39 órdenes abiertas · 10.284 prendas

Minutos de confección por prenda que suma esta familia: **19,27**. Los minutos de corte, empaque y servicios van aparte por centro.

| Código | Operación | Sección | Familia op. | Minutos | Centro | Variante | ORDEN (llenar) | MÁQUINA (revisar) | Corrección |
|---|---|---|---|---:|---|---|---|---|---|
| PREIN | PREPARAR INSTRUCCIÓN | COSTADOS | SUBENSAMBLE | 0,15 | Confección | 01 | | RECTA | |
| PERPRE | PERFILADO PRETINA | PRETINA | SUBENSAMBLE | 0,18 | Confección | 01 | | OVERLOCK 4 HILOS | |
| PEGBCS | PEGAR BOLSILLO COSTADO | COSTADOS | ENSAMBLE | 1,70 | Confección | 01 | | RECTA | |
| ORIBL | ORILLAR BOLSILLO | BOLSILLOS | ENSAMBLE | 0,32 | Confección | 03 | | OVERLOK 4 HILOS | |
| CERTID | CERRAR TIRO DELANTERO | FRENTE | ENSAMBLE | 0,30 | Confección | 01 | | OVERLOK 4 HILOS | |
| CERTIP | CERRAR TIROS POSTERIOR | POSTERIOR | ENSAMBLE | 0,28 | Confección | 01 | | OVERLOK 4 HILOS | |
| CERTIB | CERRAR TIRO BRAGUETA | FRENTE | ENSAMBLE | 0,15 | Confección | 01 | | RECTA | |
| FIGBRG | FIGURAR BRAGUETA | FRENTE | ENSAMBLE | 0,45 | Confección | 01 | | RECUBRIDORA | |
| PESTDE | PESPUNTE TIRO DELANTERO | FRENTE | ENSAMBLE | 0,25 | Confección | 01 | | RECTA | |
| PESTPO | PESPUNTE TIRO POSTERIOR | POSTERIOR | ENSAMBLE | 0,30 | Confección | 02 | | RECTA | |
| CERCS | CERRAR COSTADOS | COSTADOS | ENSAMBLE | 0,89 | Confección | 02 | | OVERLOK 4 HILOS | |
| PESCS | PESPUNTE DE COSTADOS | COSTADOS | ENSAMBLE | 0,86 | Confección | 01 | | RECTA | |
| CERFA | CERRAR FAJON | CINTURA | SUBENSAMBLE | 0,25 | Confección | 02 | | OVERLOK 4 HILOS | |
| CEREL | CERRAR ELASTICO | CINTURA | SUBENSAMBLE | 0,20 | Confección | 01 | | RECTA | |
| FIJELA | FIJAR ELASTICO | CINTURA | SUBENSAMBLE | 1,31 | Confección | 01 | | RECTA | |
| PEGPRE | PEGAR PRETINA | PRETINA | ENSAMBLE | 0,78 | Confección | 02 | | OVERLOK 4 HILOS | |
| PEGBVI | PEGAR BOLSILLO VIVIADO | BOLSILLOS | ENSAMBLE | 3,45 | Confección | 01 | | RECTA | |
| ORIBVI | PEGAR BOLSILLO PARCHE | BOLSILLOS | SUBENSAMBLE | 1,23 | Confección | 00 | | RECTA | |
| ORIBVI | ORILLAR BOLSILLO VIVIADO | BOLSILLOS | SUBENSAMBLE | 0,50 | Confección | 01 | | RECTA | |
| CEREN | CERRAR ENTREPIERNAS | ENTREPIERNA | ENSAMBLE | 0,62 | Confección | 01 | | OVERLOK 4 HILOS | |
| DDOBBJ | DOBLE DOBLADO DE BAJOS | BAJOS | ENSAMBLE | 1,56 | Confección | 02 | | RECTA | |
| PREET | PREPARAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,30 | Confección | 01 | | RECTA | |
| ELAPRE | ELASTICAR PRETINA | PRETINA | ENSAMBLE | 0,45 | Confección | 02 | | ELASTICADORA | |
| COSMAR | COSER MARQUILLA | POSTERIOR | ENSAMBLE | 0,75 | Confección | 01 | | RECTA | |
| PEGET | PEGAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,40 | Confección | 01 | | RECTA | |
| CORSHP | CORTE | GENERAL | CORTE | 0,25 | Corte | 01 | | VERTICAL | |
| TENSHP | TENDIDO | GENERAL | CORTE | 0,25 | Corte | 01 | | MANUAL | |
| PAQSHP | PAQUETEO | GENERAL | CORTE | 0,25 | Corte | 01 | | MANUAL | |
| CMASHP | CORTE MATERIAL | GENERAL | CORTE | 0,12 | Corte | 01 | | VERTICAL | |
| BORSHP | BORDAR | GENERAL | BORDADO | 0,89 | Bordado | 01 | | BORDADORA | |
| PULSHP | PULIDO PRENDA | GENERAL | PULIDO | 1,10 | Confección | 01 | | MANUAL | |
| REVSHP | REVISAR PRENDA | GENERAL | EMPAQUE | 0,15 | Empaque | 01 | | MANUAL | |
| DOBSHP | DOBLAR PRENDA | GENERAL | EMPAQUE | 0,28 | Empaque | 01 | | MANUAL | |
| ETISHP | ETIQUETAR PRENDA | GENERAL | EMPAQUE | 0,20 | Empaque | 01 | | MANUAL | |
| ORIBJ | ORILLAR BAJOS | BAJOS | ENSAMBLE | 0,55 | Confección | 02 | | OVERLOK 4 HILOS | |

## 4 · PANTALONES PLANOS — 40 operaciones · 17 órdenes abiertas · 3.503 prendas

Minutos de confección por prenda que suma esta familia: **27,96**. Los minutos de corte, empaque y servicios van aparte por centro.

| Código | Operación | Sección | Familia op. | Minutos | Centro | Variante | ORDEN (llenar) | MÁQUINA (revisar) | Corrección |
|---|---|---|---|---:|---|---|---|---|---|
| PREIN | PREPARAR INSTRUCCIÓN | COSTADOS | SUBENSAMBLE | 0,15 | Confección | 01 | | RECTA | |
| DOBBBL | DOBLAR BOCA BOLSILLO PARCHE | BOLSILLOS | SUBENSAMBLE | 0,60 | Confección | 03 | | RECTA | |
| ORIBLP | ORILLAR BOLSILLO PARCHE | BOLSILLOS | SUBENSAMBLE | 0,64 | Confección | 01 | | RECTA | |
| PEGBLP | PEGAR BOLSILLO PARCHE | BOLSILLOS | ENSAMBLE | 2,36 | Confección | 01 | | RECTA | |
| PESCF | PESPUNTE CORTE PIEZAS FRENTE | FRENTE | ENSAMBLE | 0,88 | Confección | 01 | | RECTA | |
| ARMTBL | ARMAR TAPA BOLSILLO CARGO | BOLSILLOS | SUBENSAMBLE | 1,20 | Confección | 02 | | RECTA | |
| PESTBC | PESPUNTE TAPA BOLSILLO CARGO | BOLSILLOS | SUBENSAMBLE | 0,88 | Confección | 01 | | RECTA | |
| DOBBBL | DOBLAR BOCA BOLSILLO CARGO | BOLSILLOS | SUBENSAMBLE | 0,76 | Confección | 03 | | RECTA | |
| PEGBCS | PEGAR BOLSILLO COSTADO | BOLSILLOS | ENSAMBLE | 1,69 | Confección | 01 | | RECTA | |
| ORIBL | ORILLAR BOLSILLO | BOLSILLOS | ENSAMBLE | 0,38 | Confección | 03 | | OVERLOK 4 HILOS | |
| ORITD | ORILLAR TIRO DELANTERO | FRENTE | ENSAMBLE | 0,36 | Confección | 01 | | OVERLOK 4 HILOS | |
| CERTIP | CERRAR TIROS POSTERIOR | POSTERIOR | ENSAMBLE | 0,35 | Confección | 01 | | OVERLOK 4 HILOS | |
| CERTIB | CERRAR TIRO BRAGUETA | FRENTE | ENSAMBLE | 0,17 | Confección | 01 | | RECTA | |
| FILALN | FILETEAR ALETILLON | FRENTE | ENSAMBLE | 0,32 | Confección | 01 | | OVERLOCK 3 HILOS TP | |
| PESTPO | PESPUNTE TIRO POSTERIOR | POSTERIOR | ENSAMBLE | 0,35 | Confección | 02 | | RECTA | |
| FIGBRG | FIGURAR BRAGUETA | FRENTE | ENSAMBLE | 0,47 | Confección | 02 | | RECTA | |
| FORTRI | FORMAR TRIANGULO | GENERAL | ENSAMBLE | 0,25 | Confección | 01 | | RECTA | |
| CERCS | CERRAR COSTADOS | COSTADOS | ENSAMBLE | 1,05 | Confección | 05 | | OVERLOK 4 HILOS | |
| PESCS | PESPUNTE DE COSTADOS | COSTADOS | ENSAMBLE | 0,88 | Confección | 02 | | RECTA | |
| CEREN | CERRAR ENTREPIERNAS | ENTREPIERNA | ENSAMBLE | 0,92 | Confección | 02 | | OVERLOK 4 HILOS | |
| PEGPS | PEGAR PIEZA SOBREPUESTA | FRENTE | ENSAMBLE | 0,98 | Confección | 01 | | RECTA | |
| PEGBLC | PEGAR BOLSILLO CARGO | BOLSILLOS | ENSAMBLE | 2,40 | Confección | 01 | | RECTA | |
| PEGTBL | PEGAR Y PESPUNTAR TAPA BOLSILLO CARGO | BOLSILLOS | ENSAMBLE | 2,16 | Confección | 01 | | RECTA | |
| PEGPRI | PEGAR PRETINA INTERNA | PRETINA | ENSAMBLE | 1,36 | Confección | 01 | | OVERLOK 4 HILOS | |
| EMBEL | EMBOLSAR ELASTICO | CINTURA | ENSAMBLE | 0,78 | Confección | 01 | | RECTA | |
| PESVPI | PESPUNTE DE VENCIMIENTO PRETINA INTERNA | PRETINA | ENSAMBLE | 0,68 | Confección | 01 | | RECTA | |
| PESCS | PESPUNTE DE COSTADOS | COSTADOS | ENSAMBLE | 1,48 | Confección | 02 | | RECTA | |
| DDOBBJ | DOBLE DOBLADO DE BAJOS | BAJOS | ENSAMBLE | 1,66 | Confección | 02 | | RECTA | |
| PREET | PREPARAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,30 | Confección | 01 | | RECTA | |
| PEGET | PEGAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,40 | Confección | 01 | | RECTA | |
| PULPAM | PULIDO PRENDA | GENERAL | PULIDO | 1,10 | Confección | 01 | | MANUAL | |
| ESTPAM | ESTAMPAR | GENERAL | SERIGRAFIA | 0,78 | Estampado | 01 | | PULPO MANUAL | |
| HACOJ | HACER OJALES | GENERAL | OJALES | 0,13 | Botones | 06 | | OJALADORA | |
| TENPAM | TENDIDO | GENERAL | CORTE | 0,25 | Corte | 01 | | MANUAL | |
| CORPAM | CORTE | GENERAL | CORTE | 0,25 | Corte | 01 | | VERTICAL | |
| PAQPAM | PAQUETEO | GENERAL | CORTE | 0,25 | Corte | 01 | | MANUAL | |
| CMAPAM | CORTE MATERIAL | GENERAL | CORTE | 0,12 | Corte | 01 | | SESGADORA | |
| REVPAM | REVISAR PRENDA | GENERAL | EMPAQUE | 0,15 | Empaque | 01 | | MANUAL | |
| DOBPAM | DOBLAR PRENDA | GENERAL | EMPAQUE | 0,25 | Empaque | 01 | | MANUAL | |
| ETIPAM | ETIQUETAR PRENDA | GENERAL | EMPAQUE | 0,20 | Empaque | 01 | | MANUAL | |

## 5 · FITS — 19 operaciones · 33 órdenes abiertas · 7.141 prendas

Minutos de confección por prenda que suma esta familia: **6,78**. Los minutos de corte, empaque y servicios van aparte por centro.

| Código | Operación | Sección | Familia op. | Minutos | Centro | Variante | ORDEN (llenar) | MÁQUINA (revisar) | Corrección |
|---|---|---|---|---:|---|---|---|---|---|
| PREIN | PREPARAR INSTRUCCIÓN | COSTADOS | SUBENSAMBLE | 0,15 | Confección | 01 | | RECTA | |
| UNIHBD | UNIR HOMBRO DERECHO | HOMBROS | ENSAMBLE | 0,55 | Confección | 02 | | OVERLOK 4 HILOS | |
| UNIHBI | UNIR HOMBRO IZQUIERDO | HOMBROS | ENSAMBLE | 0,67 | Confección | 03 | | OVERLOK 4 HILOS | |
| EMBEFF | EMBOLSAR ESCOTE FRENTE CON FRAMILÓN | FRENTE | ENSAMBLE | 0,88 | Confección | 01 | | OVERLOK 4 HILOS | |
| EMBEEF | EMBOLSAR ESCOTE ESPALDA CON FRAMILÓN | POSTERIOR | ENSAMBLE | 0,60 | Confección | 01 | | OVERLOK 4 HILOS | |
| EMBSIS | EMBOLSAR SISAS | SISA | ENSAMBLE | 0,90 | Confección | 01 | | OVERLOK 4 HILOS | |
| PEGMG | PEGAR MANGAS | MANGAS | ENSAMBLE | 0,35 | Confección | 03 | | OVERLOK 4 HILOS | |
| RECMG | RECUBRIR MANGAS | MANGAS | ENSAMBLE | 0,27 | Confección | 01 | | RECUBRIDORA | |
| CERCSE | CERRAR COSTADOS EMBOLSADOS | COSTADOS | ENSAMBLE | 0,97 | Confección | 01 | | OVERLOK 4 HILOS | |
| DOBBJ | DOBLAR BAJOS | BAJOS | ENSAMBLE | 0,52 | Confección | 01 | | RECUBRIDORA | |
| PULFIT | PULIDO PRENDA | GENERAL | PULIDO | 0,92 | Confección | 01 | | MANUAL | |
| TENFIT | TENDIDO | GENERAL | CORTE | 0,30 | Corte | 01 | | MANUAL | |
| CORFIT | CORTE | GENERAL | CORTE | 0,18 | Corte | 01 | | VERTICAL | |
| PAQFIT | PAQUETEO | GENERAL | CORTE | 0,15 | Corte | 01 | | MANUAL | |
| CMAFIT | CORTE MATERIAL | GENERAL | CORTE | 0,12 | Corte | 01 | | SESGADORA | |
| REVFIT | REVISAR PRENDA | GENERAL | EMPAQUE | 0,12 | Empaque | 01 | | MANUAL | |
| DOBFIT | DOBLAR PRENDA | GENERAL | EMPAQUE | 0,15 | Empaque | 01 | | MANUAL | |
| ETIFIT | ETIQUETAR PRENDA | GENERAL | EMPAQUE | 0,15 | Empaque | 01 | | MANUAL | |
| ETIFIT | ETIQUETAR | GENERAL | SERIGRAFIA | 0,35 | Etiquetas | 01 | | TAMPOGRÁFICA | |

## 6 · SHORT CARGO — 43 operaciones · 24 órdenes abiertas · 5.913 prendas

Minutos de confección por prenda que suma esta familia: **30,11**. Los minutos de corte, empaque y servicios van aparte por centro.

| Código | Operación | Sección | Familia op. | Minutos | Centro | Variante | ORDEN (llenar) | MÁQUINA (revisar) | Corrección |
|---|---|---|---|---:|---|---|---|---|---|
| PREIN | PREPARAR INSTRUCCIÓN | COSTADOS | SUBENSAMBLE | 0,15 | Confección | 01 | | RECTA | |
| ARMTBL | ARMAR TAPA BOLSILLO CARGO | BOLSILLOS | SUBENSAMBLE | 0,63 | Confección | 01 | | RECTA | |
| PESTBC | PESPUNTE TAPA BOLSILLO CARGO | BOLSILLOS | SUBENSAMBLE | 0,88 | Confección | 01 | | RECTA | |
| PEGFUB | PEGAR FUELLE BOLSILLO CARGO | BOLSILLOS | SUBENSAMBLE | 1,05 | Confección | 01 | | RECTA | |
| PESFU | PESPUNTE FUELLE CARGO | BOLSILLOS | ENSAMBLE | 0,88 | Confección | 01 | | RECTA | |
| DDOBBL | DOBLE DOBLADO BOCA BOLSILLO CARGO | BOLSILLOS | SUBENSAMBLE | 0,38 | Confección | 01 | | RECTA | |
| PEGBLC | PEGAR BOLSILLO CARGO | BOLSILLOS | ENSAMBLE | 2,26 | Confección | 01 | | RECTA | |
| PEGTCS | PEGAR Y PESPUNTE DE TAPA COSTADO | COSTADOS | ENSAMBLE | 1,26 | Confección | 01 | | RECTA | |
| PEGBCS | PEGAR BOLSILLO COSTADO | COSTADOS | ENSAMBLE | 1,70 | Confección | 01 | | RECTA | |
| ORIBL | ORILLAR BOLSILLO | BOLSILLOS | SUBENSAMBLE | 0,32 | Confección | 03 | | OVERLOK 4 HILOS | |
| CERTID | CERRAR TIRO DELANTERO | FRENTE | ENSAMBLE | 0,30 | Confección | 01 | | OVERLOK 4 HILOS | |
| CERTIP | CERRAR TIROS POSTERIOR | POSTERIOR | ENSAMBLE | 0,32 | Confección | 01 | | OVERLOK 4 HILOS | |
| CERTIB | CERRAR TIRO BRAGUETA | FRENTE | ENSAMBLE | 0,15 | Confección | 01 | | RECTA | |
| FIGBRG | FIGURAR BRAGUETA | FRENTE | ENSAMBLE | 0,45 | Confección | 01 | | RECUBRIDORA | |
| PESTDE | PESPUNTE TIRO DELANTERO | FRENTE | ENSAMBLE | 0,25 | Confección | 01 | | RECTA | |
| PESTPO | PESPUNTE TIRO POSTERIOR | POSTERIOR | ENSAMBLE | 0,30 | Confección | 02 | | RECTA | |
| CERCS | CERRAR COSTADOS | COSTADOS | ENSAMBLE | 0,89 | Confección | 02 | | OVERLOK 4 HILOS | |
| PESCS | PESPUNTE DE COSTADOS | COSTADOS | ENSAMBLE | 0,86 | Confección | 01 | | RECTA | |
| CERFA | CERRAR FAJON | CINTURA | SUBENSAMBLE | 0,25 | Confección | 02 | | OVERLOK 4 HILOS | |
| CEREL | CERRAR ELASTICO | CINTURA | SUBENSAMBLE | 0,20 | Confección | 01 | | RECTA | |
| FIJELA | FIJAR ELASTICO | CINTURA | SUBENSAMBLE | 1,31 | Confección | 01 | | RECTA | |
| ELAPRE | ELASTICAR PRETINA | PRETINA | ENSAMBLE | 0,45 | Confección | 02 | | ELASTICADORA | |
| PEGPRE | PEGAR PRETINA | PRETINA | ENSAMBLE | 0,95 | Confección | 02 | | OVERLOK 4 HILOS | |
| PEGBVI | PEGAR BOLSILLO VIVIADO | BOLSILLOS | ENSAMBLE | 3,20 | Confección | 01 | | RECTA | |
| ORIBVI | ORILLAR BOLSILLO VIVIADO | BOLSILLOS | SUBENSAMBLE | 0,42 | Confección | 01 | | RECTA | |
| CEREN | CERRAR ENTREPIERNAS | ENTREPIERNA | ENSAMBLE | 0,62 | Confección | 01 | | OVERLOK 4 HILOS | |
| DDOBBJ | DOBLE DOBLADO DE BAJOS | BAJOS | ENSAMBLE | 1,56 | Confección | 02 | | RECTA | |
| COSMTC | COSER MARQUILLA EN TAPA CARGO | BOLSILLOS | ENSAMBLE | 0,40 | Confección | 01 | | RECTA | |
| PREET | PREPARAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,30 | Confección | 01 | | RECTA | |
| PEGETA | PEGAR ETIQUETA AZUL | POSTERIOR | ENSAMBLE | 0,30 | Confección | 01 | | RECTA | |
| PEGET | PEGAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,40 | Confección | 01 | | RECTA | |
| HACOJ | HACER OJALES | GENERAL | OJALES | 0,36 | Botones | 06 | | OJALADORA | |
| REMPCO | REMATAR PUNTAS DE CORDÓN | GENERAL | ENSAMBLE | 0,31 | Confección | 01 | | RECTA | |
| CORSHC | CORTE | GENERAL | CORTE | 1,00 | Corte | 01 | | VERTICAL | |
| PULSHC | PULIDO PRENDA | GENERAL | PULIDO | 1,10 | Confección | 01 | | MANUAL | |
| HACTB | HACER TABLÓN BOLSILLO CARGO | BOLSILLOS | SUBENSAMBLE | 0,84 | Confección | 01 | | RECTA | |
| REMPAS | REMATAR PASADORES | GENERAL | ENSAMBLE | 3,20 | Confección | 01 | | RECTA | |
| FORTRI | FORMAR TRIANGULO | GENERAL | ENSAMBLE | 0,25 | Confección | 01 | | RECTA | |
| CEREN | CERRAR ENTREPIERNAS | ENTREPIERNA | ENSAMBLE | 0,39 | Confección | 01 | | OVERLOK 4 HILOS | |
| ORITBL | ORILLAR TAPA DE BOLSILLO | BOLSILLOS | SUBENSAMBLE | 0,22 | Confección | 01 | | OVERLOK 4 HILOS | |
| REMEBL | REMATAR EXTREMOS DE BOLSILLO X4 | BOLSILLOS | ENSAMBLE | 0,41 | Confección | 01 | | RECTA | |
| REVSHC | REVISAR PRENDA | GENERAL | EMPAQUE | 0,30 | Empaque | 01 | | MANUAL | |
| DOBSHC | DOBLAR PRENDA | GENERAL | EMPAQUE | 0,30 | Empaque | 01 | | MANUAL | |

## 7 · CAMISAS — 34 operaciones · 18 órdenes abiertas · 3.200 prendas

Minutos de confección por prenda que suma esta familia: **23,81**. Los minutos de corte, empaque y servicios van aparte por centro.

| Código | Operación | Sección | Familia op. | Minutos | Centro | Variante | ORDEN (llenar) | MÁQUINA (revisar) | Corrección |
|---|---|---|---|---:|---|---|---|---|---|
| PREIN | PREPARAR INSTRUCCIÓN | COSTADOS | SUBENSAMBLE | 0,15 | Confección | 01 | | RECTA | |
| ARMCU | ARMAR CUELLO | CUELLO | SUBENSAMBLE | 0,79 | Confección | 02 | | RECTA | |
| DOBPCU | DOBLAR PIE DE CUELLO | CUELLO | SUBENSAMBLE | 0,43 | Confección | 01 | | RECTA | |
| PESCU | PESPUNTE DE CUELLO | CUELLO | SUBENSAMBLE | 0,68 | Confección | 01 | | RECTA | |
| ENSCU | ENSAMBLE DE CUELLO | CUELLO | SUBENSAMBLE | 1,10 | Confección | 01 | | RECTA | |
| ARMPÑ | ARMAR PUÑOS | PUÑOS | SUBENSAMBLE | 0,35 | Confección | 01 | | RECTA | |
| PESPÑ | PESPUNTE DE PUÑOS | PUÑOS | ENSAMBLE | 0,48 | Confección | 02 | | RECTA | |
| DOBVI | DOBLAR VINCHA | FRENTE | ENSAMBLE | 1,36 | Confección | 01 | | RECTA | |
| DPESVI | DOBLE PESPUNTE DE VINCHA | FRENTE | ENSAMBLE | 1,04 | Confección | 01 | | RECTA | |
| COSTES | COSER TABLÓN ESPALDA | POSTERIOR | ENSAMBLE | 0,45 | Confección | 01 | | RECTA | |
| UNIEAL | UNIR ESPALDA CON ALMILLA | POSTERIOR | ENSAMBLE | 0,75 | Confección | 01 | | OVERLOK 4 HILOS | |
| EMBHB | EMBOLSAR HOMBROS | HOMBROS | ENSAMBLE | 1,20 | Confección | 01 | | OVERLOK 4 HILOS | |
| PESALM | PESPUNTE DE ALMILLA | POSTERIOR | ENSAMBLE | 0,39 | Confección | 01 | | RECTA | |
| PEGCU | PEGAR CUELLO Y PESPUNTE DE CUELLO | CUELLO | ENSAMBLE | 2,20 | Confección | 04 | | RECTA | |
| PEGCPÑ | PEGAR COLLARETE EN PUÑOS | PUÑOS | ENSAMBLE | 0,66 | Confección | 01 | | RECUBRIDORA COLLARETERA | |
| PEGVIP | PEGAR VINCHA PUÑO | PUÑOS | ENSAMBLE | 1,20 | Confección | 01 | | RECTA | |
| ASEVIP | ASENTAR VINCHA PUÑO | PUÑOS | ENSAMBLE | 2,90 | Confección | 01 | | RECTA | |
| CERCS | CERRAR COSTADOS | COSTADOS | ENSAMBLE | 1,18 | Confección | 06 | | OVERLOK 5 HILOS | |
| ORIBJ | ORILLAR BAJOS | BAJOS | ENSAMBLE | 0,42 | Confección | 01 | | OVERLOK 4 HILOS | |
| PEGMGL | PEGAR MANGA LARGA | MANGAS | ENSAMBLE | 0,93 | Confección | 02 | | OVERLOK 5 HILOS | |
| DDOBBJ | DOBLE DOBLADO DE BAJOS | BAJOS | ENSAMBLE | 1,08 | Confección | 01 | | RECTA | |
| PEGPÑ | PEGAR PUÑOS Y PESPUNTE DE PUÑOS | PUÑOS | ENSAMBLE | 2,18 | Confección | 04 | | RECTA | |
| PREET | PREPARAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,30 | Confección | 01 | | RECTA | |
| PEGET | PEGAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,28 | Confección | 01 | | RECTA | |
| PULCAS | PULIDO PRENDA | GENERAL | PULIDO | 1,30 | Confección | 01 | | MANUAL | |
| HACOJ | HACER OJALES | GENERAL | OJALES | 1,56 | Botones | 04 | | OJALADORA | |
| PEGBOT | PEGAR BOTONES | GENERAL | BOTONES | 1,69 | Botones | 02 | | BOTONADORA | |
| TENCAS | TENDIDO | GENERAL | CORTE | 0,25 | Corte | 01 | | MANUAL | |
| CORCAS | CORTE | GENERAL | CORTE | 0,56 | Corte | 01 | | VERTICAL | |
| PAQCAS | PAQUETEO | GENERAL | CORTE | 0,35 | Corte | 01 | | MANUAL | |
| CMACAS | CORTE MATERIAL | GENERAL | CORTE | 0,15 | Corte | 01 | | VERTICAL | |
| DOBCAS | DOBLAR PRENDA | GENERAL | EMPAQUE | 0,28 | Empaque | 01 | | MANUAL | |
| ETICAS | ETIQUETAR PRENDA | GENERAL | EMPAQUE | 0,30 | Empaque | 01 | | MANUAL | |
| BORCAS | BORDAR | GENERAL | BORDADO | 0,56 | Bordado | 01 | | BORDADORA | |

## 8 · JEANS — 49 operaciones · 12 órdenes abiertas · 2.713 prendas

Minutos de confección por prenda que suma esta familia: **18,94**. Los minutos de corte, empaque y servicios van aparte por centro.

| Código | Operación | Sección | Familia op. | Minutos | Centro | Variante | ORDEN (llenar) | MÁQUINA (revisar) | Corrección |
|---|---|---|---|---:|---|---|---|---|---|
| PREIN | PREPARAR INSTRUCCIÓN | COSTADOS | SUBENSAMBLE | 0,15 | Confección | 01 | | RECTA TP | |
| TENJNS | TENDIDO | GENERAL | CORTE | 0,90 | Corte | 01 | | MANUAL | |
| CORJNS | CORTE | GENERAL | CORTE | 0,71 | Corte | 01 | | VERTICAL | |
| PAQJNS | PAQUETEO | GENERAL | CORTE | 0,25 | Corte | 01 | | MANUAL | |
| CMAJNS | CORTE MATERIAL | GENERAL | CORTE | 0,45 | Corte | 01 | | VERTICAL | |
| DOBREL | DOBLADILLAR RELOJERO | FRENTE | ENSAMBLE | 0,08 | Confección | 01 | | RECTA 2 AGUJAS TP | |
| CERBL | CERRAR BOLSILLO | FRENTE | ENSAMBLE | 0,16 | Confección | 01 | | OVERLOCK 3 HILOS TP | |
| ASEFBL | ASENTAR FORRO DE BOL | BOLSILLOS | ENSAMBLE | 0,20 | Confección | 01 | | RECTA TP | |
| FILALA | FILETEAR ALETILLA | FRENTE | ENSAMBLE | 0,25 | Confección | 01 | | OVERLOCK 3 HILOS TP | |
| EMBAL | EMBOLSAR ALETILLÓN | FRENTE | ENSAMBLE | 0,08 | Confección | 01 | | OVERLOCK 3 HILOS TP | |
| FILALN | FILETEAR ALETILLON | FRENTE | ENSAMBLE | 0,19 | Confección | 01 | | OVERLOCK 3 HILOS TP | |
| FILTD | FILETEAR TIRO DELANTERO | FRENTE | ENSAMBLE | 0,10 | Confección | 01 | | OVERLOCK 3 HILOS TP | |
| COLAL | COLOCAR ALETILLÓN | FRENTE | ENSAMBLE | 0,10 | Confección | 01 | | RECTA TP | |
| DOBBLP | DOBLADILLAR BOL POST X2 | BOLSILLOS | ENSAMBLE | 0,27 | Confección | 01 | | RECTA 2 AGUJAS TP | |
| COLASA | COLOCAR Y ASENTAR ALETILLA | FRENTE | ENSAMBLE | 0,40 | Confección | 01 | | RECTA TP | |
| ARMPS | ARMAR PASADORES X6 | CINTURA | ENSAMBLE | 0,40 | Confección | 01 | | RECUBRIDORA TP | |
| PEGCIA | PEGAR CIERRE EN ALETILLA | FRENTE | ENSAMBLE | 0,13 | Confección | 01 | | RECTA TP | |
| PEGCIA | PEGAR CIERRE EN ALETILLA | FRENTE | ENSAMBLE | 0,97 | Confección | 01 | | RECTA TP | |
| FIJBL | FIJAR BOLSILLO | FRENTE | ENSAMBLE | 0,28 | Confección | 01 | | RECTA TP | |
| COLBL | COLOCAR BOLSILLO DELANT X2 | FRENTE | ENSAMBLE | 0,36 | Confección | 01 | | RECTA TP | |
| EMBFOR | VIRAR Y EMBONAR FORRO BOL DELANTERO | BOLSILLOS | ENSAMBLE | 0,50 | Confección | 01 | | RECTA TP | |
| ASEBL | ASENTAR BOLSILLO DELANT X2 | FRENTE | ENSAMBLE | 0,32 | Confección | 01 | | RECTA 2 AGUJAS TP | |
| UNITF | UNIR TIRO FRENTE | FRENTE | ENSAMBLE | 0,24 | Confección | 02 | | RECTA 2 AGUJAS TP | |
| FIGAL | FIGURAR ALETILLA | FRENTE | ENSAMBLE | 0,13 | Confección | 01 | | RECTA 2 AGUJAS TP | |
| UNICOT | UNIR COTILLAS | CINTURA | ENSAMBLE | 0,41 | Confección | 01 | | CERRADORA DE CODO TP | |
| UNITP | UNIR TIRO POSTERIOR | POSTERIOR | ENSAMBLE | 0,36 | Confección | 01 | | CERRADORA DE CODO TP | |
| PEGBLP | PEGAR BOL POST X2 | POSTERIOR | ENSAMBLE | 2,60 | Confección | 01 | | RECTA TP | |
| CEREN | CERRAR ENTREPIERNAS | ENTREPIERNA | ENSAMBLE | 0,80 | Confección | 02 | | OVERLOCK 5 HILOS TP | |
| PESEN | PESPUNTE ENTREPIERNA | FRENTE | ENSAMBLE | 0,70 | Confección | 01 | | CERRADORA DE CODO TP | |
| CERCS | CERRAR COSTADOS | COSTADOS | ENSAMBLE | 1,40 | Confección | 07 | | OVERLOCK 5 HILOS TP | |
| PESCS | PESPUNTE DE COSTADOS | COSTADOS | ENSAMBLE | 0,98 | Confección | 04 | | RECTA TP | |
| PEGPAS | PEGAR PASADORES X6 | CINTURA | ENSAMBLE | 1,20 | Confección | 01 | | ATRACADORA TP | |
| UNIPRE | UNIR PRETINA | PRETINA | ENSAMBLE | 0,08 | Confección | 01 | | RECTA TP | |
| PEGPRE | PEGAR PRETINA | PRETINA | ENSAMBLE | 0,50 | Confección | 01 | | PRETINADORA MULTIAGUJA TP | |
| FIJPAS | FIJAR PASADORES | CINTURA | ENSAMBLE | 0,38 | Confección | 01 | | ATRACADORA TP | |
| REMAL | REMATAR PUNTA DE ALETILLÓN | FRENTE | ENSAMBLE | 0,13 | Confección | 01 | | ATRACADORA TP | |
| REMPRE | REMATAR / PUNTAR / PRETINA / REVISAR | CINTURA | ENSAMBLE | 0,83 | Confección | 01 | | ATRACADORA TP | |
| ATRBLP | ATRAQUE BOL POST | BOLSILLOS | ENSAMBLE | 0,32 | Confección | 01 | | ATRACADORA TP | |
| ATRCS | ATRAQUE COSTADOS | COSTADOS | ENSAMBLE | 0,60 | Confección | 01 | | ATRACADORA TP | |
| DOBBO | DOBLADILLAR BOTA | BAJOS | ENSAMBLE | 0,10 | Confección | 01 | | RECTA TP | |
| PEGMA | PEGAR MARQUILLA EN PRETINA | PRETINA | ENSAMBLE | 0,41 | Confección | 01 | | RECTA TP | |
| HACOJ | HACER OJAL | GENERAL | OJALES | 0,20 | Botones | 07 | | OJAL LÁGRIMA TP | |
| PEGBT | PEGAR BOTÓN | GENERAL | BOTONES | 0,20 | Botones | 01 | | REMACHADORA TP | |
| PULJNS | PULIDO PRENDA | GENERAL | PULIDO | 1,25 | Confección | 01 | | MANUAL | |
| REVJNS | REVISAR PRENDA | GENERAL | EMPAQUE | 0,12 | Empaque | 01 | | MANUAL | |
| DOBJNS | DOBLAR PRENDA | GENERAL | EMPAQUE | 0,12 | Empaque | 01 | | MANUAL | |
| ETIJNS | ETIQUETAR PRENDA | GENERAL | EMPAQUE | 0,12 | Empaque | 01 | | MANUAL | |
| PREET | PREPARAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,30 | Confección | 01 | | RECTA TP | |
| PEGET | PEGAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,28 | Confección | 02 | | RECTA TP | |

## 9 · HENLEY — 34 operaciones · 6 órdenes abiertas · 1.700 prendas

Minutos de confección por prenda que suma esta familia: **14,58**. Los minutos de corte, empaque y servicios van aparte por centro.

| Código | Operación | Sección | Familia op. | Minutos | Centro | Variante | ORDEN (llenar) | MÁQUINA (revisar) | Corrección |
|---|---|---|---|---:|---|---|---|---|---|
| PREIN | PREPARAR INSTRUCCIÓN | COSTADOS | SUBENSAMBLE | 0,12 | Confección | 01 | | RECTA | |
| PEGVI | PEGAR VINCHA HACER CAJA X Y SUJETAR CUELLO | FRENTE | ENSAMBLE | 2,65 | Confección | 01 | | RECTA | |
| UNIHB | UNIR HOMBROS | HOMBROS | ENSAMBLE | 0,35 | Confección | 01 | | OVERLOK 4 HILOS | |
| PEGCU | PEGAR CUELLO | CUELLO | ENSAMBLE | 0,85 | Confección | 02 | | OVERLOK 4 HILOS | |
| ASECU | ASENTAR CUELLO | CUELLO | ENSAMBLE | 0,72 | Confección | 02 | | RECUBRIDORA | |
| PEGPÑ | PEGADO PUÑOS | PUÑOS | ENSAMBLE | 0,55 | Confección | 02 | | OVERLOK 4 HILOS | |
| ASEPÑ | ASENTAR PUÑOS | PUÑOS | ENSAMBLE | 0,60 | Confección | 01 | | RECUBRIDORA | |
| CERCS | CERRAR COSTADOS | COSTADOS | ENSAMBLE | 0,72 | Confección | 01 | | OVERLOK 4 HILOS | |
| PEGMG | PEGAR MANGAS | MANGAS | ENSAMBLE | 0,78 | Confección | 02 | | OVERLOK 4 HILOS | |
| CERPÑ | CERRAR PUÑOS | PUÑOS | ENSAMBLE | 0,22 | Confección | 01 | | OVERLOK 4 HILOS | |
| PESVI | PESPUNTE VINCHA | FRENTE | ENSAMBLE | 0,96 | Confección | 01 | | RECTA | |
| ORIVI | ORILLAR VINCHA | FRENTE | ENSAMBLE | 0,15 | Confección | 01 | | OVERLOK 4 HILOS | |
| REMPÑ | REMATAR PUÑOS | PUÑOS | ENSAMBLE | 0,30 | Confección | 01 | | RECTA | |
| REMVI | REMATAR VINCHA | FRENTE | ENSAMBLE | 0,07 | Confección | 01 | | RECTA | |
| DOBBJ | DOBLAR BAJOS | BAJOS | ENSAMBLE | 0,70 | Confección | 02 | | RECUBRIDORA | |
| PREET | PREPARAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,30 | Confección | 01 | | RECTA | |
| PEGET | PEGAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,40 | Confección | 01 | | RECTA | |
| TENHEN | TENDIDO | GENERAL | CORTE | 0,25 | Corte | 01 | | MANUAL | |
| CORHEN | CORTE | GENERAL | CORTE | 0,25 | Corte | 01 | | VERTICAL | |
| PAQHEN | PAQUETEO | GENERAL | CORTE | 0,25 | Corte | 01 | | MANUAL | |
| CMAHEN | CORTE MATERIAL | GENERAL | CORTE | 0,12 | Corte | 01 | | SESGADORA | |
| PULHEN | PULIDO PRENDA | GENERAL | PULIDO | 1,00 | Confección | 01 | | MANUAL | |
| REVHEN | REVISAR PRENDA | GENERAL | EMPAQUE | 0,12 | Empaque | 01 | | MANUAL | |
| DOBHEN | DOBLAR PRENDA | GENERAL | EMPAQUE | 0,20 | Empaque | 01 | | MANUAL | |
| ETIHEN | ETIQUETAR PRENDA | GENERAL | EMPAQUE | 0,12 | Empaque | 01 | | MANUAL | |
| ARMCU | ARMAR CUELLO | CUELLO | SUBENSAMBLE | 0,89 | Confección | 01 | | RECTA | |
| PESPCU | PESPUNTE PIE DE CUELLO | CUELLO | SUBENSAMBLE | 1,04 | Confección | 01 | | RECTA | |
| UNIPZV | UNIR CORTE VERTICAL ESPALDA | POSTERIOR | SUBENSAMBLE | 0,35 | Confección | 01 | | OVERLOCK 4 HILOS | |
| SUJCU | SUJETAR CUELLO | CUELLO | ENSAMBLE | 0,21 | Confección | 01 | | RECTA | |
| ASEPZV | ASENTAR CORTE CENTRO ESPALDA | POSTERIOR | SUBENSAMBLE | 0,40 | Confección | 01 | | RECUBRIDORA | |
| HACOJ | HACER OJALES | GENERAL | OJALES | 1,56 | Botones | 01 | | OJALADORA | |
| PEGBOT | PEGAR BOTONES | GENERAL | BOTONES | 0,78 | Botones | 01 | | BOTONADORA | |
| CERMG | CERRAR MANGAS | MANGAS | ENSAMBLE | 0,25 | Confección | 01 | | OVERLOK 4 HILOS | |
| BORHEN | BORDAR | GENERAL | BORDADO | 2,21 | Bordado | 01 | | BORDADORA | |

## 10 · BODY — 25 operaciones · 6 órdenes abiertas · 1.424 prendas

Minutos de confección por prenda que suma esta familia: **13,39**. Los minutos de corte, empaque y servicios van aparte por centro.

| Código | Operación | Sección | Familia op. | Minutos | Centro | Variante | ORDEN (llenar) | MÁQUINA (revisar) | Corrección |
|---|---|---|---|---:|---|---|---|---|---|
| PREIN | PREPARAR INSTRUCCIÓN | COSTADOS | SUBENSAMBLE | 0,12 | Confección | 01 | | RECTA | |
| TENBOD | TENDIDO | GENERAL | CORTE | 0,30 | Corte | 01 | | MANUAL | |
| CORBOD | CORTE | GENERAL | CORTE | 0,30 | Corte | 01 | | VERTICAL | |
| PAQBOD | PAQUETEO | GENERAL | CORTE | 0,30 | Corte | 01 | | MANUAL | |
| CMABOD | CORTE MATERIAL | GENERAL | CORTE | 0,15 | Corte | 01 | | SESGADORA | |
| UNIHEM | UNIR HOMBROS EMBOLSADOS | HOMBROS | ENSAMBLE | 1,00 | Confección | 04 | | OVERLOK 4 HILOS | |
| REMCU | REMATAR CUELLO | CUELLO | ENSAMBLE | 0,22 | Confección | 02 | | RECTA | |
| PEGCFR | PEGAR COLLARETE ESCOTE FRENTE | FRENTE | ENSAMBLE | 0,35 | Confección | 01 | | RECUBRIDORA COLLARETERA | |
| EMBEFF | EMBOLSAR ESCOTE FRENTE CON FRAMILÓN | FRENTE | ENSAMBLE | 1,33 | Confección | 02 | | OVERLOK 4 HILOS | |
| PEGCES | PEGAR COLLARETE EN ESCOTE ESPALDA | POSTERIOR | ENSAMBLE | 0,40 | Confección | 01 | | RECUBRIDORA COLLARETERA | |
| PEGTEE | PEGAR TIRAS EN ESCOTE ESPALDA | POSTERIOR | ENSAMBLE | 1,66 | Confección | 01 | | RECTA | |
| PEGFCM | PEGAR FRAMILÓN EN CONTORNO MUSLO | ENTREPIERNA | ENSAMBLE | 2,71 | Confección | 01 | | OVERLOK 4 HILOS | |
| CERCS | CERRAR COSTADOS | COSTADOS | ENSAMBLE | 1,06 | Confección | 04 | | OVERLOK 4 HILOS | |
| PEGMG | PEGAR MANGAS | MANGAS | ENSAMBLE | 0,61 | Confección | 03 | | OVERLOK 4 HILOS | |
| PESPBR | PESPUNTE PROTECTOR BROCHE | ENTREPIERNA | ENSAMBLE | 0,55 | Confección | 01 | | RECTA | |
| ASECOM | ASENTAR CONTORNO DE MUSLO | ENTREPIERNA | ENSAMBLE | 1,28 | Confección | 01 | | RECUBRIDORA | |
| ORIPBR | ORILLAR PROTECTOR BROCHES | ENTREPIERNA | ENSAMBLE | 0,18 | Confección | 01 | | OVERLOK 4 HILOS | |
| DOBPTY | DOBLAR FILO PANTY | ENTREPIERNA | ENSAMBLE | 0,54 | Confección | 01 | | RECTA | |
| PREET | PREPARAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,30 | Confección | 01 | | RECTA | |
| PEGET | PEGAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,40 | Confección | 01 | | RECTA | |
| PULBOD | PULIDO PRENDA | GENERAL | PULIDO | 0,68 | Confección | 01 | | MANUAL | |
| REVBOD | REVISAR PRENDA | GENERAL | EMPAQUE | 0,10 | Empaque | 01 | | MANUAL | |
| DOBBOD | DOBLAR PRENDA | GENERAL | EMPAQUE | 0,12 | Empaque | 01 | | MANUAL | |
| ETIBOD | ETIQUETAR PRENDA | GENERAL | EMPAQUE | 0,12 | Empaque | 01 | | MANUAL | |
| ESTBOD | ESTAMPAR | GENERAL | SERIGRAFIA | 1,18 | Estampado | 01 | | PULPO MANUAL | |

## 11 · VESTIDOS — 35 operaciones · 7 órdenes abiertas · 1.279 prendas

Minutos de confección por prenda que suma esta familia: **17,59**. Los minutos de corte, empaque y servicios van aparte por centro.

| Código | Operación | Sección | Familia op. | Minutos | Centro | Variante | ORDEN (llenar) | MÁQUINA (revisar) | Corrección |
|---|---|---|---|---:|---|---|---|---|---|
| PREIN | PREPARAR INSTRUCCIÓN | COSTADOS | SUBENSAMBLE | 0,15 | Confección | 01 | | RECTA | |
| TENVES | TENDIDO | GENERAL | CORTE | 0,32 | Corte | 01 | | MANUAL | |
| CORVES | CORTE | GENERAL | CORTE | 0,52 | Corte | 01 | | VERTICAL | |
| PAQVES | PAQUETEO | GENERAL | CORTE | 0,25 | Corte | 01 | | MANUAL | |
| CMAVES | CORTE MATERIAL | GENERAL | CORTE | 0,18 | Corte | 01 | | SESGADORA | |
| UNIHB | UNIR HOMBROS | HOMBROS | ENSAMBLE | 0,39 | Confección | 01 | | RECTA | |
| PEGVSC | PEGAR VINCHA Y SUJETAR CUELLO | CUELLO | ENSAMBLE | 2,00 | Confección | 02 | | RECTA | |
| PEGCU | PEGAR CUELLO | CUELLO | ENSAMBLE | 0,50 | Confección | 05 | | OVERLOK 4 HILOS | |
| PEGMG | PEGAR MANGAS | MANGAS | ENSAMBLE | 0,88 | Confección | 03 | | OVERLOK 4 HILOS | |
| PEGPÑ | PEGAR PUÑOS | PUÑOS | ENSAMBLE | 0,67 | Confección | 03 | | OVERLOK 4 HILOS | |
| PESPÑ | PESPUNTE DE PUÑOS | PUÑOS | ENSAMBLE | 0,55 | Confección | 02 | | RECTA | |
| ORIVI | ORILLAR VINCHA | FRENTE | ENSAMBLE | 0,15 | Confección | 01 | | OVERLOK 4 HILOS | |
| PEGTIR | PEGAR Y ASENTAR TIRA EN CUELLO | CUELLO | ENSAMBLE | 2,00 | Confección | 02 | | RECTA | |
| PESVI | PESPUNTE DE VINCHA | FRENTE | ENSAMBLE | 0,96 | Confección | 02 | | RECTA | |
| REMVI | REMATAR VINCHA | FRENTE | ENSAMBLE | 0,07 | Confección | 02 | | RECTA | |
| CEREL | CERRAR ELASTICO | CINTURA | SUBENSAMBLE | 0,22 | Confección | 01 | | RECTA | |
| CERFA | CERRAR FAJON | CINTURA | SUBENSAMBLE | 0,22 | Confección | 03 | | OVERLOK 4 HILOS | |
| FIJELA | FIJAR ELASTICO | CINTURA | SUBENSAMBLE | 1,14 | Confección | 01 | | RECTA | |
| ELAPRE | ELASTICAR PRETINA | CINTURA | SUBENSAMBLE | 0,48 | Confección | 01 | | ELASTICADORA | |
| CERCS | CERRAR COSTADOS | COSTADOS | ENSAMBLE | 0,61 | Confección | 04 | | OVERLOK 4 HILOS | |
| CERCS | CERRAR COSTADOS | COSTADOS | ENSAMBLE | 0,61 | Confección | 04 | | OVERLOK 4 HILOS | |
| UNIPSU | UNIR PARTE SUPERIOR | FRENTE | ENSAMBLE | 0,68 | Confección | 01 | | OVERLOK 4 HILOS | |
| UNIPIN | UNIR PARTE INFERIOR | FRENTE | ENSAMBLE | 0,68 | Confección | 01 | | OVERLOK 4 HILOS | |
| UNICOF | UNIR CORTE FRENTE | FRENTE | ENSAMBLE | 0,95 | Confección | 01 | | OVERLOK 4 HILOS | |
| DOBBJ | DOBLAR BAJOS | BAJOS | ENSAMBLE | 0,90 | Confección | 04 | | RECUBRIDORA | |
| PREET | PREPARAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,58 | Confección | 01 | | RECTA | |
| PEGET | PEGAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,40 | Confección | 01 | | RECTA | |
| PULVES | PULIDO PRENDA | GENERAL | PULIDO | 1,30 | Confección | 01 | | MANUAL | |
| HACOJ | HACER OJALES | GENERAL | OJALES | 0,50 | Botones | 05 | | OJALADORA | |
| PEGBOT | PEGAR BOTONES | GENERAL | BOTONES | 0,66 | Botones | 03 | | BOTONADORA | |
| BORVES | BORDAR | GENERAL | BORDADO | 0,40 | Bordado | 01 | | BORDADORA | |
| REVVES | REVISAR PRENDA | GENERAL | EMPAQUE | 0,15 | Empaque | 01 | | MANUAL | |
| DOBVES | DOBLAR PRENDA | GENERAL | EMPAQUE | 0,18 | Empaque | 01 | | MANUAL | |
| ETIVES | ETIQUETAR PRENDA | GENERAL | EMPAQUE | 0,15 | Empaque | 01 | | MANUAL | |
| PRECOR | PREPARAR CORDÓN | GENERAL | SUBENSAMBLE | 0,50 | Confección | 01 | | RECUBRIDORA COLLARETERA | |

## 12 · CHOMPAS — 35 operaciones · 13 órdenes abiertas · 985 prendas

Minutos de confección por prenda que suma esta familia: **16,75**. Los minutos de corte, empaque y servicios van aparte por centro.

| Código | Operación | Sección | Familia op. | Minutos | Centro | Variante | ORDEN (llenar) | MÁQUINA (revisar) | Corrección |
|---|---|---|---|---:|---|---|---|---|---|
| PREIN | PREPARAR INSTRUCCIÓN | COSTADOS | SUBENSAMBLE | 0,15 | Confección | 01 | | RECTA | |
| UNICAP | UNIR CAPUCHA | CAPUCHA | SUBENSAMBLE | 0,62 | Confección | 01 | | OVERLOCK 4 HILOS | |
| ARMFCA | ARMAR FORRO CAPUCHA | CAPUCHA | SUBENSAMBLE | 0,65 | Confección | 01 | | OVERLOCK 4 HILOS | |
| UNIFCA | UNIR FORRO A CAPUCHA | CAPUCHA | SUBENSAMBLE | 0,65 | Confección | 01 | | OVERLOCK 4 HILOS | |
| PESCAP | PESPUNTE CENTRO DE CAPUCHA | CAPUCHA | SUBENSAMBLE | 0,50 | Confección | 01 | | RECTA | |
| RECCA | RECUBRIR CAPUCHA | CAPUCHA | SUBENSAMBLE | 0,60 | Confección | 01 | | RECUBRIDORA | |
| UNIHB | UNIR HOMBROS | HOMBROS | ENSAMBLE | 0,41 | Confección | 03 | | OVERLOK 4 HILOS | |
| ASEHB | ASENTAR HOMBROS | HOMBROS | ENSAMBLE | 0,88 | Confección | 01 | | RECUBRIDORA | |
| PEGCA | PEGAR CAPUCHA | CAPUCHA | ENSAMBLE | 0,65 | Confección | 01 | | OVERLOK 4 HILOS | |
| PEGMG | PEGAR MANGAS | MANGAS | ENSAMBLE | 0,70 | Confección | 02 | | OVERLOK 4 HILOS | |
| ASESIS | ASENTAR SISAS | SISA | ENSAMBLE | 0,72 | Confección | 01 | | RECUBRIDORA | |
| CERCS | CERRAR COSTADOS | COSTADOS | ENSAMBLE | 0,89 | Confección | 03 | | OVERLOK 4 HILOS | |
| UNIPZV | UNIR CORTE VERTICAL ESPALDA | POSTERIOR | ENSAMBLE | 0,90 | Confección | 01 | | RECUBRIDORA | |
| CERPÑ | CERRAR PUÑOS | PUÑOS | ENSAMBLE | 0,22 | Confección | 01 | | OVERLOK 4 HILOS | |
| CERFAJ | CERRAR 2 LADOS FAJON | BAJOS | SUBENSAMBLE | 0,36 | Confección | 01 | | OVERLOCK 4 HILOS | |
| PEGPÑ | PEGAR PUÑOS | PUÑOS | ENSAMBLE | 0,82 | Confección | 01 | | OVERLOK 4 HILOS | |
| PESPÑ | PESPUNTE DE PUÑOS | PUÑOS | ENSAMBLE | 0,78 | Confección | 01 | | RECUBRIDORA | |
| PEGFA | PEGAR FAJÓN | BAJOS | ENSAMBLE | 0,72 | Confección | 02 | | OVERLOK 4 HILOS | |
| PESFA | PESPUNTE FAJON | BAJOS | ENSAMBLE | 0,54 | Confección | 02 | | RECUBRIDORA | |
| PEGTIR | PEGAR Y ASENTAR TIRA EN CUELLO | CUELLO | ENSAMBLE | 1,16 | Confección | 03 | | RECTA | |
| DOBBBL | DOBLAR BOCA DE BOLSILLO CANGURO | FRENTE | SUBENSAMBLE | 0,43 | Confección | 02 | | RECUBRIDORA | |
| PEGBLC | PEGAR BOLSILLO CANGURO | FRENTE | SUBENSAMBLE | 1,22 | Confección | 02 | | RECTA | |
| PESCU | PESPUNTE DE CUELLO | CUELLO | ENSAMBLE | 0,37 | Confección | 02 | | RECTA | |
| PREET | PREPARAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,30 | Confección | 01 | | RECTA | |
| PEGET | PEGAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,40 | Confección | 01 | | RECTA | |
| HACOJ | HACER OJALES | CAPUCHA | OJALES | 0,26 | Botones | 01 | | OJALADORA | |
| PULCHO | PULIDO PRENDA | GENERAL | PULIDO | 1,11 | Confección | 01 | | MANUAL | |
| CORCHO | CORTE | GENERAL | CORTE | 0,80 | Corte | 01 | | VERTICAL | |
| TENCHO | TENDIDO | GENERAL | CORTE | 0,11 | Corte | 01 | | MANUAL | |
| PAQCHO | PAQUETEO | GENERAL | CORTE | 0,18 | Corte | 01 | | MANUAL | |
| CMACHO | CORTE MATERIAL | GENERAL | CORTE | 0,15 | Corte | 01 | | VERTICAL | |
| ETICHO | ETIQUETAR PRENDA | GENERAL | EMPAQUE | 0,70 | Empaque | 01 | | MANUAL | |
| REVCHO | REVISAR PRENDA | GENERAL | EMPAQUE | 0,18 | Empaque | 01 | | MANUAL | |
| DOBCHO | DOBLAR PRENDA | GENERAL | EMPAQUE | 0,30 | Empaque | 01 | | MANUAL | |
| ESTCHO | ESTAMPAR | GENERAL | SERIGRAFIA | 1,18 | Estampado | 01 | | PULPO MANUAL | |

## 13 · SHORT FLEECE — 29 operaciones · 3 órdenes abiertas · 760 prendas

Minutos de confección por prenda que suma esta familia: **12,44**. Los minutos de corte, empaque y servicios van aparte por centro.

| Código | Operación | Sección | Familia op. | Minutos | Centro | Variante | ORDEN (llenar) | MÁQUINA (revisar) | Corrección |
|---|---|---|---|---:|---|---|---|---|---|
| PREIN | PREPARAR INSTRUCCIÓN | COSTADOS | SUBENSAMBLE | 0,15 | Confección | 01 | | RECTA | |
| CERFA | CERRAR FAJON | CINTURA | SUBENSAMBLE | 0,25 | Confección | 01 | | OVERLOK 4 HILOS | |
| CEREL | CERRAR ELASTICO | CINTURA | SUBENSAMBLE | 0,20 | Confección | 01 | | RECTA | |
| FIJELA | FIJAR ELASTICO | CINTURA | SUBENSAMBLE | 1,31 | Confección | 01 | | RECTA | |
| ELAPRE | ELASTICAR PRETINA | PRETINA | ENSAMBLE | 0,74 | Confección | 01 | | ELASTICADORA | |
| PEGPRE | PEGAR PRETINA | PRETINA | ENSAMBLE | 0,95 | Confección | 01 | | OVERLOK 4 HILOS | |
| ORIBL | ORILLAR BOLSILLO | BOLSILLOS | SUBENSAMBLE | 0,38 | Confección | 01 | | OVERLOK 4 HILOS | |
| PEGRBB | PEGAR RIB EN BOCA BOLSILLO | BOLSILLOS | SUBENSAMBLE | 0,67 | Confección | 01 | | RECTA | |
| PESBB | PESPUNTE BOCA DE BOLSILLO | BOLSILLOS | SUBENSAMBLE | 0,36 | Confección | 01 | | RECTA | |
| PEGBCS | PEGAR BOLSILLO COSTADO | BOLSILLOS | ENSAMBLE | 1,70 | Confección | 01 | | RECTA | |
| CERTID | CERRAR TIRO DELANTERO | FRENTE | ENSAMBLE | 0,30 | Confección | 01 | | OVERLOK 4 HILOS | |
| CERTIP | CERRAR TIROS POSTERIOR | POSTERIOR | ENSAMBLE | 0,32 | Confección | 01 | | OVERLOK 4 HILOS | |
| PESTIDE | PESPUNTE TIRO DELANTERO | FRENTE | ENSAMBLE | 0,57 | Confección | 01 | | RECTA | |
| PESTPO | PESPUNTE TIRO POSTERIOR | POSTERIOR | ENSAMBLE | 0,30 | Confección | 02 | | RECTA | |
| CERCS | CERRAR COSTADOS | COSTADOS | ENSAMBLE | 0,88 | Confección | 02 | | OVERLOK 4 HILOS | |
| CEREN | CERRAR ENTREPIERNAS | ENTREPIERNA | ENSAMBLE | 0,62 | Confección | 01 | | OVERLOK 4 HILOS | |
| DOBBJ | DOBLAR BAJOS | BAJOS | ENSAMBLE | 0,94 | Confección | 03 | | RECUBRIDORA | |
| PREET | PREPARAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,30 | Confección | 01 | | RECTA | |
| PEGET | PEGAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,40 | Confección | 01 | | RECTA | |
| HACOJ | HACER OJALES | GENERAL | OJALES | 0,26 | Botones | 03 | | OJALADORA | |
| TENSHF | TENDIDO | GENERAL | CORTE | 0,25 | Corte | 01 | | MANUAL | |
| CORSHF | CORTE | GENERAL | CORTE | 0,25 | Corte | 01 | | VERTICAL | |
| PAQSHF | PAQUETEO | GENERAL | CORTE | 0,25 | Corte | 01 | | MANUAL | |
| CMASHF | CORTE MATERIAL | GENERAL | CORTE | 0,12 | Corte | 01 | | VERTICAL | |
| PULSHF | PULIDO PRENDA | GENERAL | PULIDO | 1,10 | Confección | 01 | | MANUAL | |
| REVSHF | REVISAR PRENDA | GENERAL | EMPAQUE | 0,30 | Empaque | 01 | | MANUAL | |
| DOBSHF | DOBLAR PRENDA | GENERAL | EMPAQUE | 0,30 | Empaque | 01 | | MANUAL | |
| ETISHF | ETIQUETAR PRENDA | GENERAL | EMPAQUE | 0,25 | Empaque | 01 | | MANUAL | |
| ESTSHF | ESTAMPAR | GENERAL | SERIGRAFIA | 1,19 | Estampado | 01 | | PULPO MANUAL | |

## 14 · HOODIES — 29 operaciones · 9 órdenes abiertas · 727 prendas

Minutos de confección por prenda que suma esta familia: **13,56**. Los minutos de corte, empaque y servicios van aparte por centro.

| Código | Operación | Sección | Familia op. | Minutos | Centro | Variante | ORDEN (llenar) | MÁQUINA (revisar) | Corrección |
|---|---|---|---|---:|---|---|---|---|---|
| TENHOD | TENDIDO | GENERAL | CORTE | 0,35 | Corte | 01 | | MANUAL | |
| CORHOD | CORTE | GENERAL | CORTE | 0,35 | Corte | 01 | | VERTICAL | |
| PAQHOD | PAQUETEO | GENERAL | CORTE | 0,35 | Corte | 01 | | MANUAL | |
| CMAHOD | CORTE MATERIAL | GENERAL | CORTE | 0,17 | Corte | 01 | | VERTICAL | |
| PREIN | PREPARAR INSTRUCCIÓN | COSTADOS | SUBENSAMBLE | 0,12 | Confección | 01 | | RECTA | |
| UNICAP | UNIR CAPUCHA | CAPUCHA | SUBENSAMBLE | 0,65 | Confección | 01 | | OVERLOCK 4 HILOS | |
| UNIFCA | UNIR FORRO A CAPUCHA | CAPUCHA | SUBENSAMBLE | 0,65 | Confección | 01 | | OVERLOCK 4 HILOS | |
| PEGTIR | PEGAR Y ASENTAR TIRA EN CUELLO | CUELLO | ENSAMBLE | 1,00 | Confección | 03 | | RECTA | |
| RECCA | RECUBRIR CAPUCHA TEJIDA | CAPUCHA | SUBENSAMBLE | 0,71 | Confección | 01 | | RECUBRIDORA | |
| UNIHB | UNIR HOMBROS | HOMBROS | ENSAMBLE | 0,35 | Confección | 01 | | OVERLOK 4 HILOS | |
| PEGCA | PEGAR CAPUCHA | CAPUCHA | ENSAMBLE | 0,65 | Confección | 01 | | OVERLOK 4 HILOS | |
| PEGMG | PEGAR MANGAS | MANGAS | ENSAMBLE | 0,75 | Confección | 02 | | OVERLOK 4 HILOS | |
| CERCS | CERRAR COSTADOS | COSTADOS | ENSAMBLE | 0,89 | Confección | 03 | | OVERLOK 4 HILOS | |
| DOBBBL | DOBLAR BOCA DE BOLSILLO CANGURO | FRENTE | SUBENSAMBLE | 0,43 | Confección | 02 | | RECUBRIDORA | |
| PEGBLC | PEGAR BOLSILLO CANGURO | FRENTE | SUBENSAMBLE | 1,22 | Confección | 01 | | RECTA | |
| CERPÑ | CERRAR PUÑOS | PUÑOS | ENSAMBLE | 0,25 | Confección | 01 | | OVERLOK 4 HILOS | |
| CERFAJ | CERRAR 2 LADOS FAJON | PUÑOS | SUBENSAMBLE | 0,36 | Confección | 01 | | OVERLOK 4 HILOS | |
| PEGPÑ | PEGAR PUÑOS | PUÑOS | ENSAMBLE | 0,74 | Confección | 01 | | OVERLOK 4 HILOS | |
| ASEPÑ | ASENTAR PUÑOS | PUÑOS | ENSAMBLE | 0,97 | Confección | 01 | | RECUBRIDORA | |
| PEGFA | PEGAR FAJÓN | BAJOS | ENSAMBLE | 0,80 | Confección | 01 | | OVERLOK 4 HILOS | |
| PESFA | PESPUNTE FAJON | BAJOS | ENSAMBLE | 0,92 | Confección | 01 | | RECTA | |
| PREET | PREPARAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,30 | Confección | 01 | | RECTA | |
| PEGET | PEGAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,40 | Confección | 01 | | RECTA | |
| PULHOD | PULIDO PRENDA | GENERAL | PULIDO | 1,40 | Confección | 01 | | MANUAL | |
| REVHOD | REVISAR PRENDA | GENERAL | EMPAQUE | 0,22 | Empaque | 01 | | MANUAL | |
| DOBHOD | DOBLAR PRENDA | GENERAL | EMPAQUE | 0,22 | Empaque | 01 | | MANUAL | |
| HACOJ | HACER OJALES | GENERAL | OJALES | 0,26 | Botones | 02 | | OJALADORA | |
| ETIHOD | ETIQUETAR PRENDA | GENERAL | EMPAQUE | 0,25 | Empaque | 01 | | MANUAL | |
| ESTHOD | ESTAMPAR | GENERAL | SERIGRAFIA | 2,25 | Estampado | 01 | | PULPO MANUAL | |

## 15 · BVD — 19 operaciones · 7 órdenes abiertas · 638 prendas

Minutos de confección por prenda que suma esta familia: **4,23**. Los minutos de corte, empaque y servicios van aparte por centro.

| Código | Operación | Sección | Familia op. | Minutos | Centro | Variante | ORDEN (llenar) | MÁQUINA (revisar) | Corrección |
|---|---|---|---|---:|---|---|---|---|---|
| PREIN | PREPARAR INSTRUCCIÓN | COSTADOS | SUBENSAMBLE | 0,15 | Confección | 01 | | RECTA | |
| UNIHBD | UNIR HOMBRO DERECHO | HOMBROS | ENSAMBLE | 0,35 | Confección | 02 | | OVERLOK 4 HILOS | |
| UNIHBI | UNIR HOMBRO IZQUIERDO | HOMBROS | ENSAMBLE | 0,35 | Confección | 03 | | OVERLOK 4 HILOS | |
| PEGCCU | PEGAR COLLARETE CUELLO | CUELLO | ENSAMBLE | 0,70 | Confección | 01 | | RECUBRIDORA | |
| REMCU | REMATAR CUELLO | CUELLO | ENSAMBLE | 0,60 | Confección | 01 | | RECTA | |
| CERCS | CERRAR COSTADOS | COSTADOS | ENSAMBLE | 0,48 | Confección | 01 | | OVERLOK 4 HILOS | |
| RECSS | RECUBRIR SISAS | SISA | ENSAMBLE | 0,63 | Confección | 01 | | RECUBRIDORA | |
| DOBBJ | DOBLAR BAJOS | BAJOS | ENSAMBLE | 0,38 | Confección | 01 | | RECUBRIDORA | |
| PULSHF | PULIDO PRENDA | GENERAL | PULIDO | 0,60 | Confección | 01 | | MANUAL | |
| TENBVD | TENDIDO | GENERAL | CORTE | 0,10 | Corte | 01 | | MANUAL | |
| CORBVD | CORTE | GENERAL | CORTE | 0,16 | Corte | 01 | | VERTICAL | |
| PAQBDV | PAQUETEO | GENERAL | CORTE | 0,08 | Corte | 01 | | MANUAL | |
| CMABVD | CORTE MATERIAL | GENERAL | CORTE | 0,08 | Corte | 01 | | SESGADORA | |
| REVBVD | REVISAR PRENDA | GENERAL | EMPAQUE | 0,10 | Empaque | 01 | | MANUAL | |
| DOBBDV | DOBLAR PRENDA | GENERAL | EMPAQUE | 0,10 | Empaque | 01 | | MANUAL | |
| ETIBVD | ETIQUETAR PRENDA | GENERAL | EMPAQUE | 0,10 | Empaque | 01 | | MANUAL | |
| ETIBVD | ETIQUETAR | GENERAL | SERIGRAFIA | 0,40 | Etiquetas | 01 | | MANUAL | |
| ESTESP | ESTAMPAR ESPALDAS | GENERAL | SERIGRAFIA | 0,51 | Estampado | 01 | | PULPO MANUAL | |
| ESTFRE | ESTAMPAR FRENTES | GENERAL | SERIGRAFIA | 1,16 | Estampado | 01 | | PULPO MANUAL | |

## 16 · BOMBER — 37 operaciones · 8 órdenes abiertas · 629 prendas

Minutos de confección por prenda que suma esta familia: **31,90**. Los minutos de corte, empaque y servicios van aparte por centro.

| Código | Operación | Sección | Familia op. | Minutos | Centro | Variante | ORDEN (llenar) | MÁQUINA (revisar) | Corrección |
|---|---|---|---|---:|---|---|---|---|---|
| PREIN | PREPARAR INSTRUCCIÓN | COSTADOS | SUBENSAMBLE | 0,15 | Confección | 01 | | RECTA | |
| UNIHB | UNIR HOMBROS | HOMBROS | ENSAMBLE | 0,92 | Confección | 01 | | OVERLOK 4 HILOS | |
| PESHB | PESPUNTE DE HOMBROS | HOMBROS | ENSAMBLE | 0,87 | Confección | 01 | | RECTA | |
| ORIFV | ORILLAR FALSO / SOLAPA DE VINCHA | FRENTE | ENSAMBLE | 0,87 | Confección | 01 | | OVERLOK 4 HILOS | |
| ASEFVI | ASENTAR FALSO DE VINCHA | FRENTE | ENSAMBLE | 0,94 | Confección | 01 | | RECTA | |
| UNIFF | UNIR FALSO FRENTE | FRENTE | SUBENSAMBLE | 0,92 | Confección | 01 | | OVERLOCK 4 HILOS | |
| PESFV | PESPUNTE FALSO DE VINCHA | FRENTE | ENSAMBLE | 0,89 | Confección | 03 | | RECTA | |
| ASEFHB | ASENTAR FALSO CON HOMBROS | HOMBROS | ENSAMBLE | 0,93 | Confección | 01 | | RECTA | |
| PEGBVI | PEGAR BOLSILLO VIVIADO | COSTADOS | ENSAMBLE | 3,70 | Confección | 01 | | RECTA | |
| EMBCU | EMBOLSAR CUELLO | CUELLO | ENSAMBLE | 1,90 | Confección | 01 | | OVERLOK 4 HILOS | |
| ASECU | ASENTAR CUELLO | CUELLO | ENSAMBLE | 2,09 | Confección | 01 | | RECTA | |
| ARMPZ | ARMAR PIEZA COCOTERA | POSTERIOR | ENSAMBLE | 0,55 | Confección | 01 | | RECTA | |
| ORIPC | ORILLAR PIEZA COCOTERA | POSTERIOR | ENSAMBLE | 0,47 | Confección | 01 | | OVERLOK 4 HILOS | |
| EMBCO | EMBOLSAR PIEZA COGOTERA | POSTERIOR | ENSAMBLE | 0,89 | Confección | 01 | | OVERLOK 4 HILOS | |
| ASECOG | ASENTAR COGOTERA | POSTERIOR | ENSAMBLE | 0,61 | Confección | 01 | | RECTA | |
| PEGMG | PEGAR MANGAS | MANGAS | ENSAMBLE | 1,10 | Confección | 02 | | OVERLOK 4 HILOS | |
| CERCS | CERRAR COSTADOS | COSTADOS | ENSAMBLE | 1,18 | Confección | 03 | | OVERLOK 4 HILOS | |
| PEGPÑ | PEGAR PUÑOS | PUÑOS | ENSAMBLE | 0,94 | Confección | 01 | | OVERLOK 4 HILOS | |
| ASEPÑ | ASENTAR PUÑOS | PUÑOS | ENSAMBLE | 0,79 | Confección | 01 | | RECTA | |
| PEGFAJ | PEGAR FAJÓN | BAJOS | ENSAMBLE | 1,08 | Confección | 01 | | OVERLOK 4 HILOS | |
| PESFAJ | PESPUNTE FAJON | BAJOS | ENSAMBLE | 1,14 | Confección | 01 | | RECTA | |
| ARMP | ARMAR PIEZA FAJÓN | BAJOS | SUBENSAMBLE | 0,95 | Confección | 01 | | RECTA TP | |
| PEGPFA | PEGAR PIEZA FAJÓN | BAJOS | SUBENSAMBLE | 1,04 | Confección | 01 | | RECTA | |
| EMBFJ | EMBOLSAR FAJÓN A PIEZA CENTRAL | BAJOS | ENSAMBLE | 1,40 | Confección | 01 | | RECTA | |
| PREET | PREPARAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,30 | Confección | 01 | | RECTA | |
| PEGET | PEGAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,40 | Confección | 01 | | RECTA | |
| CORBOM | CORTE | GENERAL | CORTE | 0,30 | Corte | 01 | | VERTICAL | |
| TENBOM | TENDIDO | GENERAL | CORTE | 0,18 | Corte | 01 | | MANUAL | |
| PAQBOM | PAQUETEO | GENERAL | CORTE | 0,27 | Corte | 01 | | MANUAL | |
| CMABOM | CORTE MATERIAL | GENERAL | CORTE | 0,31 | Corte | 01 | | VERTICAL | |
| REVBOM | REVISAR PRENDA | GENERAL | EMPAQUE | 0,18 | Empaque | 01 | | MANUAL | |
| DOBBOM | DOBLAR PRENDA | GENERAL | EMPAQUE | 0,21 | Empaque | 01 | | MANUAL | |
| ETIBOM | ETIQUETAR PRENDA | GENERAL | EMPAQUE | 0,19 | Empaque | 01 | | MANUAL | |
| ESTBOM | ESTAMPAR | GENERAL | SERIGRAFIA | 1,89 | Estampado | 01 | | PULPO MANUAL | |
| BORBOM | BORDAR | GENERAL | BORDADO | 0,89 | Bordado | 01 | | BORDADORA | |
| PEGCU | PEGAR CUELLO | CUELLO | ENSAMBLE | 2,54 | Confección | 06 | | RECTA | |
| CERBJE | CERRAR BAJOS EMBOLSADOS | BAJOS | ENSAMBLE | 2,34 | Confección | 01 | | RECTA | |

## 17 · PANTALÓN (fleece) — 32 operaciones · 0 órdenes abiertas · 0 prendas

Minutos de confección por prenda que suma esta familia: **18,50**. Los minutos de corte, empaque y servicios van aparte por centro.

| Código | Operación | Sección | Familia op. | Minutos | Centro | Variante | ORDEN (llenar) | MÁQUINA (revisar) | Corrección |
|---|---|---|---|---:|---|---|---|---|---|
| PREIN | PREPARAR INSTRUCCIÓN | COSTADOS | SUBENSAMBLE | 0,15 | Confección | 01 | | RECTA | |
| COSMAR | COSER MARQUILLA AERO | POSTERIOR | ENSAMBLE | 0,40 | Confección | 01 | | RECTA | |
| PEGBVI | PEGAR BOLSILLO VIVIADO | BOLSILLOS | ENSAMBLE | 3,20 | Confección | 01 | | RECTA | |
| CEREL | CERRAR ELASTICO | CINTURA | SUBENSAMBLE | 0,22 | Confección | 01 | | RECTA | |
| CERFA | CERRAR FAJON | CINTURA | SUBENSAMBLE | 0,28 | Confección | 01 | | OVERLOK 4 HILOS | |
| FIJELA | FIJAR ELASTICO | CINTURA | SUBENSAMBLE | 1,31 | Confección | 01 | | RECTA | |
| ELAPRE | ELASTICAR PRETINA | PRETINA | ENSAMBLE | 0,56 | Confección | 02 | | ELASTICADORA | |
| PEGPRE | PEGAR PRETINA | PRETINA | ENSAMBLE | 0,95 | Confección | 01 | | RECTA | |
| PEGBCS | PEGAR BOLSILLO COSTADO | BOLSILLOS | ENSAMBLE | 1,69 | Confección | 01 | | RECTA | |
| ORIBL | ORILLAR BOLSILLO | BOLSILLOS | ENSAMBLE | 0,32 | Confección | 02 | | OVERLOK 4 HILOS | |
| FIGBRG | FIGURAR BRAGUETA | FRENTE | ENSAMBLE | 0,47 | Confección | 01 | | RECUBRIDORA | |
| CERTIB | CERRAR TIRO BRAGUETA | FRENTE | ENSAMBLE | 0,12 | Confección | 01 | | RECTA | |
| CERTID | CERRAR TIRO DELANTERO | FRENTE | ENSAMBLE | 0,30 | Confección | 01 | | OVERLOK 4 HILOS | |
| CERTIP | CERRAR TIROS POSTERIOR | POSTERIOR | ENSAMBLE | 0,35 | Confección | 01 | | OVERLOK 4 HILOS | |
| PESTDE | PESPUNTE TIRO DELANTERO | FRENTE | ENSAMBLE | 0,44 | Confección | 01 | | RECTA | |
| PESTPO | PESPUNTE TIRO POSTERIOR | POSTERIOR | ENSAMBLE | 0,39 | Confección | 02 | | RECTA | |
| PESCS | PESPUNTE DE COSTADOS | COSTADOS | ENSAMBLE | 1,10 | Confección | 03 | | RECUBRIDORA | |
| CERCS | CERRAR COSTADOS | COSTADOS | ENSAMBLE | 0,98 | Confección | 05 | | OVERLOK 4 HILOS | |
| UNICVF | UNIR CORTE VERTICAL FRENTE | FRENTE | SUBENSAMBLE | 1,10 | Confección | 01 | | OVERLOCK 4 HILOS | |
| CEREN | CERRAR ENTREPIERNAS | ENTREPIERNA | ENSAMBLE | 1,04 | Confección | 02 | | OVERLOK 4 HILOS | |
| DDOBBJ | DOBLE DOBLADO DE BAJOS | BAJOS | ENSAMBLE | 1,55 | Confección | 02 | | RECTA | |
| PREET | PREPARAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,30 | Confección | 01 | | RECTA | |
| PEGET | PEGAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,40 | Confección | 01 | | RECTA | |
| PULPAB | PULIDO PRENDA | GENERAL | PULIDO | 0,88 | Confección | 01 | | MANUAL | |
| HACOJ | HACER OJALES | GENERAL | OJALES | 0,26 | Botones | 06 | | OJALADORA | |
| PAQPAB | PAQUETEO | GENERAL | CORTE | 0,30 | Corte | 01 | | MANUAL | |
| CORPAB | CORTE | GENERAL | CORTE | 0,30 | Corte | 01 | | VERTICAL | |
| TENPAB | TENDIDO | GENERAL | CORTE | 0,30 | Corte | 01 | | MANUAL | |
| CMAPAB | CORTE MATERIAL | GENERAL | CORTE | 0,15 | Corte | 01 | | VERTICAL | |
| REVPAB | REVISAR PRENDA | GENERAL | EMPAQUE | 0,20 | Empaque | 01 | | MANUAL | |
| DOBPAB | DOBLAR PRENDA | GENERAL | EMPAQUE | 0,20 | Empaque | 01 | | MANUAL | |
| ETIPAB | ETIQUETAR PRENDA | GENERAL | EMPAQUE | 0,20 | Empaque | 01 | | MANUAL | |

## 18 · BOXER — 32 operaciones · 0 órdenes abiertas · 0 prendas

Minutos de confección por prenda que suma esta familia: **17,71**. Los minutos de corte, empaque y servicios van aparte por centro.

| Código | Operación | Sección | Familia op. | Minutos | Centro | Variante | ORDEN (llenar) | MÁQUINA (revisar) | Corrección |
|---|---|---|---|---:|---|---|---|---|---|
| PREIN | PREPARAR INSTRUCCIÓN | COSTADOS | SUBENSAMBLE | 0,15 | Confección | 01 | | RECTA | |
| CORBOX | CORTE | GENERAL | CORTE | 0,10 | Corte | 01 | | VERTICAL | |
| EMBAL | EMBOLSAR ALETILLA | FRENTE | ENSAMBLE | 0,30 | Confección | 01 | | OVERLOK 4 HILOS | |
| PESVA | PESPUNTE DE VENCIMIENTO ALETILLA | FRENTE | ENSAMBLE | 0,26 | Confección | 01 | | RECTA | |
| ORIAL | ORILLAR ALETILLÓN | FRENTE | ENSAMBLE | 0,25 | Confección | 01 | | OVERLOK 4 HILOS | |
| PEGAL | PEGAR ALETILLÓN | FRENTE | ENSAMBLE | 0,26 | Confección | 01 | | RECTA | |
| PESVL | PESPUNTE DE VENCIMIENTO ALETILLÓN | FRENTE | ENSAMBLE | 0,25 | Confección | 01 | | RECTA | |
| CERTIP | CERRAR TIROS POSTERIOR | POSTERIOR | ENSAMBLE | 0,32 | Confección | 01 | | OVERLOK 4 HILOS | |
| PESTPO | PESPUNTE TIRO POSTERIOR | POSTERIOR | ENSAMBLE | 0,30 | Confección | 02 | | RECTA | |
| PEGBR | BRAGUETA FUNCIONAL | FRENTE | ENSAMBLE | 5,00 | Confección | 01 | | RECTA | |
| CERTID | CERRAR TIRO DELANTERO | FRENTE | ENSAMBLE | 0,30 | Confección | 01 | | OVERLOK 4 HILOS | |
| ORITD | ORILLAR TIRO DELANTERO | FRENTE | ENSAMBLE | 0,30 | Confección | 01 | | OVERLOK 4 HILOS | |
| PESTDE | PESPUNTE TIRO DELANTERO | FRENTE | ENSAMBLE | 0,66 | Confección | 01 | | RECTA | |
| PEGAL | PEGAR ALETILLA | FRENTE | ENSAMBLE | 0,26 | Confección | 01 | | RECTA | |
| CERCS | CERRAR COSTADOS | COSTADOS | ENSAMBLE | 0,68 | Confección | 02 | | OVERLOK 4 HILOS | |
| CEREN | CERRAR ENTREPIERNAS | ENTREPIERNA | ENSAMBLE | 0,40 | Confección | 01 | | OVERLOK 4 HILOS | |
| FIGBRG | FIGURAR BRAGUETA | FRENTE | ENSAMBLE | 0,72 | Confección | 02 | | RECTA | |
| HACATB | HACER ATRAQUE BRAGUETA | FRENTE | ENSAMBLE | 0,22 | Confección | 01 | | RECTA | |
| CEREL | CERRAR ELASTICO | CINTURA | SUBENSAMBLE | 0,22 | Confección | 01 | | RECTA | |
| PEGEPR | PEGAR ELÁSTICO PRETINA | PRETINA | ENSAMBLE | 1,02 | Confección | 01 | | OVERLOK 4 HILOS | |
| ASEELP | ASENTAR ELÁSTICO PRETINA | PRETINA | ENSAMBLE | 1,10 | Confección | 01 | | RECUBRIDORA | |
| COSMAR | COSER MARQUILLA | POSTERIOR | ENSAMBLE | 0,48 | Confección | 01 | | RECTA | |
| PEGET | PEGAR ETIQUETA | POSTERIOR | ENSAMBLE | 0,45 | Confección | 01 | | RECTA | |
| ORIBJ | ORILLAR BAJOS | BAJOS | ENSAMBLE | 0,45 | Confección | 03 | | OVERLOK 4 HILOS | |
| DDOBBJ | DOBLE DOBLADO DE BAJOS | BAJOS | ENSAMBLE | 1,55 | Confección | 02 | | RECTA | |
| PULBOX | PULIDO PRENDA | GENERAL | PULIDO | 0,68 | Confección | 01 | | MANUAL | |
| DOBAL | DOBLE DOBLADO ALETILLA 1 | FRENTE | ENSAMBLE | 0,31 | Confección | 01 | | RECTA | |
| DOBAL | DOBLE DOBLADO ALETILLA 2 | FRENTE | ENSAMBLE | 0,33 | Confección | 01 | | RECTA | |
| UNITF | UNIR TIRO FRENTE | FRENTE | ENSAMBLE | 0,49 | Confección | 01 | | RECTA | |
| TENBOX | TENDIDO | GENERAL | CORTE | 0,20 | Corte | 01 | | MANUAL | |
| PAQBOX | PAQUETEO | GENERAL | CORTE | 0,25 | Corte | 01 | | MANUAL | |
| CMABOX | CORTE MATERIAL | GENERAL | CORTE | 0,30 | Corte | 01 | | VERTICAL | |

Total: 595 operaciones.
