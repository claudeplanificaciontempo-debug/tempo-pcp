# Método de la macro — reporte de implementación y validación

Fecha: 2026-09-13 (noche). Código en `index.html` (commit `0d32d95` y siguientes). Pruebas locales: 355/355.
Producción: tablas 8–12 sembradas 08:05 p.m., facturas aplicadas 08:06, Parte 2 recargada 08:07 (691 órdenes), OT
reaplicadas 08:07 (666 órdenes cruzan, 1.003 centros cerrados, 216 contradicciones).

Principio que rige todo lo de abajo: **ninguna regla va en el código; todo vive en tablas editables de Configuración →
Órdenes y materiales y lo que no calza se reporta, no se asume.**

## 1 · Qué se construyó

| Tabla | Contenido sembrado (valores iniciales, editables, nunca se re-siembran si ya existen) | Origen |
|---|---|---|
| **8 · Categoría Odoo → tela corta** | 80 filas: ruta completa de la categoría de MP (`INV / MP / nivel 3 / nivel 4`) → nombre corto de tela (el de la macro) → tela del catálogo del sistema (opcional). Sustituye al `MAPA_TELA` que estaba en el código (borrado). | hoja Categorías de `Octubre_Macro_V2.xlsx` |
| **9 · Parámetros por tela** | 25 filas: kg por metro (para líneas en metros) y **kg por unidad** (cuellos 0,026 · puños 0,0159). | hoja ParametrosT |
| **10 · Merma de tintura** | 63 filas: tela corta × tipo (LLANO/JASPE) → merma. Solo se usa cuando la tela corta **no** está enlazada a una tela del catálogo; si lo está, manda el `enc` de esa tela (Configuración → Telas). | hoja Memas |
| **11 · Palabras jaspe** | JASPE, JASPEADO. Si el nombre del producto contiene alguna, la línea es JASPE; el tipo queda corregible por producto en el catálogo. | decisión de la usuaria |
| **12 · Catálogo de productos** | 951 códigos con proveedor (desde facturas) + 763 códigos de la usuaria (hoja MP-IN: proveedor TEMPO / tipo). Se muestra tipo detectado y origen, ambos corregibles. | facturas + MP-IN |

Además: columna **montado** en la tabla 1 (hoy 0Macro, 1Tejeduria, 1CD Tintoreria); pantalla **Macro del mes**
(menú Planificación textil) con filtro por Proyecto (mes); tinturas **separadas por tipo** (LLANO y JASPE nunca en el mismo
baño); cargador de facturas con arrastre de proveedor/fecha (`mFacturas`) — el archivo de facturas **no** se sube al
repo ni al sistema, solo queda el catálogo resultante (código → proveedores).

Cómo calcula una línea de MP (`lineaMacro`): ruta de categoría → fila de la tabla 8 (si no hay: "sin categoría",
reportada) → kg crudos (kg directos; metros × kg/m; unidades × kg/ud; si falta el parámetro: "sin conversión",
reportada) → tipo por tabla 11 (o corrección del catálogo) → merma (enc de la tela enlazada, si no tabla 10 por tipo y
luego LLANO; si no hay: "sin merma", reportada) → origen (sección 3) → pantone del nombre del producto (`NN-NNNN`).

## 2 · Validación obligatoria contra los 7.905 kg de la usuaria

Base: las **124 órdenes exactas** de su hoja BASE (todas están en producción). Kilos con merma, solo tela propia (su
filtro: PROVEEDOR TEMPO y TTIPO MP). Tres columnas: sistema tal como quedó (merma = `enc` de la tela), sistema si la
merma fuera la de su hoja Memas, y su cifra.

| Tela corta \| tipo | Kg crudo | Sistema (enc) | Sistema (Memas) | Ella | Dif. (Memas − ella) |
|---|---:|---:|---:|---:|---:|
| PIQUE \| LLANO | 1.421,5 | 1.528,9 | 1.528,9 | 1.528,9 | 0 |
| FRENCH TERRY \| LLANO | 783,8 | 858,7 | 858,7 | 858,7 | 0 |
| **PIQUE LYCRA \| LLANO** | 775,1 | 833,6 | 833,6 | 771,7 | **+61,9** |
| JERSEY 24/1 \| LLANO | 730,5 | 792,3 | 792,3 | 792,3 | 0 |
| JERSEY LYCRA \| LLANO | 610,0 | 661,6 | 661,6 | 661,6 | 0 |
| SOFTWAFFLE TEJIDO \| LLANO | 426,6 | 462,7 | 473,6 | 473,6 | 0 |
| RIBB 2X2 GRUESO \| LLANO | 426,8 | 462,6 | 462,6 | 462,6 | 0 |
| GALLETA \| LLANO | 254,5 | 276,3 | 276,3 | 276,3 | 0 |
| PUÑOS TEJIDOS \| LLANO | 257,3 | 261,8 | 261,8 | 261,8 | 0 |
| CUELLOS TEJIDOS \| LLANO | 204,5 | 208,1 | 208,1 | 208,1 | 0 |
| JERSEY ALGODON MEDIANO \| LLANO | 218,6 | 237,1 | 240,5 | 240,5 | 0 |
| RIBB 6X6 \| LLANO | 186,2 | 201,9 | 200,3 | 200,3 | 0 |
| RIBB 2X2 LIVIANO \| LLANO | 181,9 | 197,2 | 200,1 | 200,1 | 0 |
| JERSEYLINE TEJIDO \| LLANO | 127,8 | 138,6 | 141,9 | 141,9 | 0 |
| JERSEY 24/1 \| JASPE | 121,7 | 131,9 | 131,9 | 131,9 | 0 |
| RIBB RAYADO \| LLANO | 112,8 | 122,3 | 125,3 | 125,3 | 0 |
| RIBB 24/1 \| LLANO | 107,8 | 116,9 | 116,9 | 116,9 | 0 |
| JERSEY LYCRA \| JASPE | 94,9 | 102,9 | 102,9 | 102,9 | 0 |
| PIQUE \| JASPE | 82,7 | 88,9 | 88,9 | 88,9 | 0 |
| FLEECE PERCHADO \| LLANO | 73,0 | 81,0 | 81,0 | 81,0 | 0 |
| PIQUE DOBLE \| LLANO | 72,0 | 78,2 | 78,2 | 78,2 | 0 |
| JERSEY LISTADO \| LLANO | 49,9 | 54,1 | 55,3 | 55,3 | 0 |
| **PIQUE FANTASIA \| LLANO** | 44,2 | 44,2 | 44,2 | 0 | **+44,2** |
| **PUÑOS TEJIDOS COMBINADOS \| LLANO** | 39,7 | 40,4 | 40,4 | 6,7 | **+33,7** |
| **CUELLOS TEJIDOS COMBINADOS \| LLANO** | 32,5 | 33,0 | 33,0 | 5,5 | **+27,6** |
| RIBB ALGODON \| LLANO | 11,8 | 12,8 | 12,8 | 12,8 | 0 |
| PUÑOS TEJIDOS \| JASPE | 9,2 | 9,4 | 9,4 | 9,4 | 0 |
| CUELLOS TEJIDOS \| JASPE | 7,5 | 7,7 | 7,7 | 7,7 | 0 |
| RIBB 24/1 \| JASPE | 4,1 | 4,5 | 4,5 | 4,5 | 0 |
| CORDON PLANO, FAJAS TEJIDOS, PLANA IMPORTACION, REATA, TELA IMPORTADA TINTURADA | 0 | 0 | 0 | 0 | 0 |
| **Total** | **7.468,9** | **8.049,6** | **8.072,7** | **7.905,4** | **+167,4** |

Lectura:

- Con la merma de su hoja Memas, **26 de 30 telas cuadran al decimal**. La diferencia total (+167,4 kg) está en cuatro
  telas y en todas el sistema tiene **más** que ella porque su catálogo MP-IN no tiene esos productos y por eso en su
  hoja no cuentan como "PROVEEDOR TEMPO":
  - PIQUE LYCRA +61,9: producto *Orchid HA* sin fila en MP-IN. El sistema lo da PROPIO por la categoría (tabla 3).
  - PIQUE FANTASIA +44,2: sin fila en MP-IN y **sin tipo** (única línea "sin merma" en producción; hoy suma 0 de merma).
  - CUELLOS/PUÑOS TEJIDOS COMBINADOS +27,6 / +33,7: los rayados de 4 órdenes, sin fila en MP-IN.
- La diferencia entre "Sistema (enc)" 8.049,6 y "Sistema (Memas)" 8.072,7 (23 kg) es porque el `enc` de 12 telas del
  catálogo no coincide con su hoja Memas. Como el `enc` **es** la merma de tintura del sistema (también la usa
  tintorería para el kg acabado), no lo cambié: hay que decidir cuál vale y corregirlo en Configuración → Telas:

  | Tela corta → tela del catálogo | enc (sistema) | Memas (su hoja) |
  |---|---:|---:|
  | JERSEY ALGODON MEDIANO / PESADO → Jersey algodón mediano / pesado | 8,45 % | 10 % |
  | JERSEY LISTADO → Jersey listado | 8,45 % | 11 % |
  | SOFTWAFFLE TEJIDO → Softwaffle | 8,45 % | 11 % |
  | JERSEYLINE TEJIDO → Jerseyline | 8,45 % | 11 % |
  | RIBB 2X2 LIVIANO → Ribb 2x2 liviano | 8,4 % | 10 % |
  | RIBB RAYADO → Ribb rayado | 8,4 % | 11 % |
  | RIBB 6X6 → Ribb 6x6 | 8,4 % | 7,55 % |
  | FAJAS TEJIDOS → Cuellos y puños tejidos | 1,75 % | 0 % |
  | PLANA / PLANA IMPORTACION / TELA IMPORTADA TINTURADA → Plana e importada | 6 % | 0 % |

- Sobre **todo lo montado** en producción (no solo sus 124): 122 órdenes, 30.203 prendas, 228 líneas de MP, 7.442 kg
  crudos → 8.020 kg con merma (enc); 156 baños/colores en tintorería. Por Proyecto: OCTUBRE 2026 76 órdenes / 5.591 kg,
  SEPTIEMBRE 2026 41 / 2.386, DICIEMBRE 2026 2 / 19, NOVIEMBRE 2026 1 / 14, AGOSTO 2026 2 / 10. Bandejas de la macro en
  producción: sin categoría 0, sin conversión 0, sin merma 1 (PIQUE FANTASIA), sin clasificar 0; orígenes PROPIO 223
  líneas, COMPRADO 5.

## 3 · Catálogo de productos desde facturas

Archivo `Asiento_contable (account.move)`: 6.959 filas (en esta exportación el proveedor venía en todas las filas; el
arrastre hacia abajo está implementado igual por si la próxima viene con huecos), **951 códigos** de producto, **113
proveedores** distintos, **52 productos con más de un proveedor** (marcados "revisar"; se guarda el más frecuente y los
demás quedan visibles), 3.670 líneas sin código entre corchetes (servicios/gastos, ignoradas).

Sobre los **799 productos que aparecen en las órdenes** de producción:

| Origen | Productos |
|---|---:|
| COMPRADO (con proveedor en facturas o categoría EXTERNA) | 210 |
| PROPIO (TEMPO según MP-IN o categoría PROPIA) | 392 |
| SIN CLASIFICAR (ni factura, ni MP-IN, ni categoría que decida) | 197 |
| con más de un proveedor (revisar) | 36 |
| **contradicciones** (en facturas y a la vez TEMPO/propia) | 4: 01018720 LINEN LIKE PLANO NATURAL, 01018722 LINEN LIKE PLANO GRIS, 01018728 OXFORD CHINA 100% COTTON BONE, 01018729 GABARDINA CHINA PFD (categoría PLANA IMPORTACION, MP-IN dice TEMPO). Ninguna se resolvió sola: se muestran marcadas. |

Sus cifras (441 con proveedor / 148 propios) no coinciden con las mías porque el sistema cuenta por código de producto y
por nombre de proveedor tal como viene en la factura; si ella contó por RUC o agrupando variantes del nombre, el
número cambia. No supuse ninguna agrupación.

**¿Mantener la tabla 3 (origen por categoría) o unificar con el catálogo?** Recomiendo **mantener las dos, con
roles distintos**, que es como quedó: la tabla 3 decide por *categoría* (sirve para productos nuevos que todavía no
tienen factura ni fila en MP-IN) y el catálogo decide por *producto* (manda cuando existe). Unificarlas obligaría a
clasificar a mano cada producto nuevo antes de que la macro lo cuente. El sistema aplica: 1) proveedor en facturas →
COMPRADO; 2) TEMPO en MP-IN o categoría PROPIA → PROPIO; 3) categoría EXTERNA → COMPRADO sin factura; 4) resto SIN
CLASIFICAR; y reporta contradicción cuando 1) y 2) chocan.

## 4 · Jaspe: tinturas separadas

Con capacidad 240 kg por baño (`capN` de tintorería) sobre todo lo montado en producción: **156 baños** si LLANO y
JASPE se juntaran → **159 separados** (+3, en los 3 grupos pantone × tela que tienen ambos tipos). Llenado promedio
21,6 % → 21,2 % (los baños de la macro son por pantone × tela, sin la mezcla por familia que hace "Armar baños"; el
número real de baños lo da tintorería).

## 5 · Lo que la recarga de la Parte 2 reportó con la tabla 8

Líneas de MP en kg cuya categoría no tiene tela del catálogo en la tabla 8 (no entran al motor de tejeduría/tintorería;
antes iban a una tela genérica): NUEVOS TEMPO 27, TELA TEJIDA 47, JERSEY 5, LYCRA 27, RIB 7, FLECCE TEMPO 11, FLECCE
SIN PERCHAR 2. Se enlazan en la tabla 8 (columna "tela del catálogo") cuando la usuaria decida a cuál corresponde cada
categoría; el sistema no lo adivina.

## 6 · Decisiones pendientes de la usuaria

1. Tipo de **PIQUE FANTASIA** (LLANO/JASPE) y su merma → hoy suma 0 de merma y aparece en "sin merma".
2. **PIQUE LYCRA Orchid HA** y los **cuellos/puños combinados** (rayados): confirmar que son propios (el sistema lo
   dice por categoría); si son comprados, cargar la factura o corregir el origen en el catálogo.
3. Las 12 diferencias `enc` vs Memas de la sección 2: corregir en Configuración → Telas las que estén mal.
4. Las 4 contradicciones de la sección 3 y los 36 productos con varios proveedores.
5. Las 7 categorías sin tela del catálogo de la sección 5.

## 7 · Dónde está cada cosa

Configuración → Órdenes y materiales: tablas 8, 9, 10, 11, 12 (con botón "Cargar facturas"). Planificación textil →
**Macro del mes**. Órdenes → Reporte Parte 2 (bandejas de la recarga). Código: `filaCatTela`, `lineaMacro`,
`macroMes`, `banosJaspe`, `origenProducto`, `catalogoProd`, `catalogoUsuaria`, `planFacturas`/`aplicarFacturas`,
`vMacro`. El archivo de facturas y la hoja de la macro quedaron **fuera del repo** (contienen precios y proveedores).
