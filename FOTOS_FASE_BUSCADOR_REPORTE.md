# Fotos, fase junto a la WH y buscador como Odoo — reporte

Fecha: 15-sep-2026 (madrugada). No se tocó el motor ni capacidades. Pruebas del simulador: 665 (13 nuevas), todas verdes.

## 1 · Fotos en todas partes

Regla nueva en el código: **toda celda de orden se dibuja con `whCell(o)`** = miniatura (clic = se agranda) + número de WH +
fase. Donde ya había foto no se cambió la foto; solo se le sumó la fase. Dónde se agregó la foto:

| Pantalla | Dónde |
|---|---|
| Liberación (general y a producción) | ya la tenía en las listas "elegir una por una" y "liberadas"; ahora además con fase |
| Control de piso | **tejeduría, tintorería y producción**: cada fila de orden (tintorería ya la tenía por baño) |
| Tintorería | **Estado de tintorería** (4 bloques), **Resumen por WH**, **Control de reprocesos**, **Faltantes**, **cuadro del programa** (órdenes de cada baño) y el modal "baño hecho"; baños confirmados y calidad ya la tenían |
| Producto en proceso | la lista por orden ya la tenía; ahora con fase |
| Costura | **Secuencia por módulo** (cada fila) y "órdenes en rojo" del rebalanceo |
| Balanceo | la orden de referencia (foto junto al nombre) |
| Modo línea | la orden en curso (foto grande junto a la WH) |
| Plan mensual → en riesgo | ya la tenía |

Si una orden no tiene foto cargada, no se ve nada (no hay hueco vacío). Las fotos vienen de Órdenes → Cargar fotos.

## 2 · La fase junto a la WH, en todo

`faseTag(o)`: una etiqueta pequeña gris con la fase de Odoo (sin el número de orden de fase) pegada al número de WH. Está
ahora en: **Programación por centro** (cola y desviaciones), **Control de piso** (las tres áreas), **Producto en proceso**,
**Liberación** (además de la columna Fase que ya existía), **Asignación por orden** (las dos tablas), Tintorería (todas las
listas de arriba), Costura, Modo línea, Balanceo (también en el selector de referencia: `WH [fase]`), Plan mensual (en el
plan, disponibles, en riesgo) y Carga que viene (plan congelado y cola). Las listas que no muestran órdenes (por tela,
por familia) no cambian.

## 3 · Buscador inteligente como Odoo

Un solo campo, el mismo en las siete pantallas que tienen buscador de órdenes: **Órdenes, Liberación (las dos), Producto
en proceso, Asignación por orden, Centro (programación), Control de piso y Plan mensual → agregar órdenes**.

- Al escribir, se abre debajo la lista:
  `Buscar Orden de producción por: 3385` · `Buscar ODC por: 3385` · `Buscar Estilo por: 3385` · `Buscar Color por: 3385`
  · `Buscar Fase por: 3385` · `Buscar Cliente por: 3385` · `Buscar Categoría por: 3385` · `Buscar en todos los campos (Enter)`.
- Clic en una opción acota la búsqueda a ese campo y deja un chip a la derecha del campo (`Fase ✕`); el ✕ vuelve a
  "todos". **Enter** (o Escape) busca en todos los campos y cierra el menú. Borrar el texto limpia el campo elegido.
- Mientras no se elige campo, la lista se filtra por todos (como antes, y ahora también por ODC y fase donde no lo hacía).

Técnica: `busqHTML(id,valor,setter)` dibuja el campo; `BUSQ[id]` guarda el campo elegido por pantalla; `matchBusq(o,q,id)`
reemplazó las siete expresiones de búsqueda que había (cada una buscaba en campos distintos; ahora todas buscan en los
mismos siete).

## 4 · Agrupación

**No la hice: tu mensaje llegó cortado** después del punto 3 (termina en "Buscar Fase for: 3385"). Dime en qué pantallas y
por qué campos quieres agrupar (¿como en Plan mensual → agregar: ODC / cliente / entrega / familia / categoría hija, con
grupos que se colapsan y suman?) y lo hago.

## Pendientes tuyos
- Punto 4 (agrupación): mandar la parte del mensaje que faltó.
- Siguen: plan de septiembre vacío (agregar y congelar); SURF SPRAY sin profundidad; telas/capacidad piqué de STUART;
  35 baños < 70 %; 7 órdenes Odoo vs piso; foto WH/MO/29252; tabla 6 "T-BIANCO-SINTEC(COMPACTADORA)".
