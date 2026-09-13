# Dato nuevo: estampado, bordado y confección no son secuenciales — impacto y carga de órdenes de trabajo

Fecha: 2026-09-13. Commit `096774f` (304/304 verificaciones). **Nada cambió en producción todavía**: el código nuevo está
publicado, pero la columna "secuencial" de la tabla 5 quedó sembrada en "sí" para todos los grupos (comportamiento
idéntico al actual) y el archivo de órdenes de trabajo aún no se ha cargado.

---

## 1 · Qué depende de suponer que el tramo estampado → bordado → confección es secuencial

**En el diseño de hoy:**

1. **`faseEstado()`**: da por hechos los centros cuya etapa es anterior al grupo de la fase. Con el orden estampado/
   bordado (servicios, 7) → confección (8), una orden en 7Confección o 7Pulido queda con estampado y bordado
   "hechos", y una en 5Maquila Recepción también. Eso es exactamente la suposición que ya no vale.
2. **`pasosPendientes()`** (Parte 2): al cargar las órdenes grabó en la `ruta` solo los pasos pendientes con la misma
   regla, así que las órdenes en 7Confección **ya no tienen estampado ni bordado en su ruta**: aunque se corrija la
   regla, el motor no puede cargarlos hasta volver a correr la Parte 2 (es la "foto" que expliqué en el reporte
   anterior).
3. **Tabla 4 (centro → etapa)**: pone estampado y bordado en "servicios" antes de "confección"; es lo que hace que la
   deducción salga en ese orden.
4. **`RUTA_ORDEN`** (línea 619) y el motor: la ruta se programa en secuencia fija corte → estampado → bordado →
   confección → …, un paso arranca cuando termina el anterior. Las **fechas** de esos pasos son ficticias para las
   órdenes cuyo orden real es otro; la **carga total** no cambia por eso.
5. `armarRuta` y la corrección "estampado/bordado por orden" no dependen de la secuencia: solo deciden si el centro
   aplica, no cuándo. No se ven afectadas.

Lo que sí sigue siendo válido: textil → corte → terminados es secuencial, y la fase lo dice bien.

**Números del reporte antes/después que quedan mal (medido en producción):**

| Fase | Órdenes con técnica o puntadas | Prendas | Qué se supuso | Realidad |
|---|---:|---:|---|---|
| 7Confección | 17 | 4.856 | estampado y bordado hechos; 5 órdenes sin estampado en ruta, 13 sin bordado | no se sabe: pueden faltar |
| 7Pulido | 7 | 1.353 | estampado y bordado hechos; 7 sin bordado en ruta | no se sabe |
| 5Maquila Recepción | 3 | 216 | estampado y bordado hechos | no se sabe |
| **Subtotal subestimado** | **27** | **6.425** | | |
| 5Maquila Conf / 5CD Maquila | 26 | 3.019 | estampado y bordado **pendientes** | no se sabe; si ya se hicieron, está sobrestimado |

- **Carga por centro**: estampado en septiembre (4.194 min) está subestimado en al menos 255 min (las 5 órdenes de
  7Confección con técnica) y bordado en 17 millones de puntadas de 7Confección (los minutos dependen de la velocidad,
  hoy vacía). Es poco en minutos porque el estampado pesa poco por prenda; lo grande es el bordado en cuanto haya
  velocidad.
- **Tabla "centros dados por hechos"**: las filas 7Confección (+etiquetas), 7Pulido y 5Maquila Recepción daban por
  correctos estampado/bordado hechos; no lo son. Las filas de maquila (estampado/bordado pendientes) son
  sobreestimación deliberada, aceptable.
- La comparación "antes vs después" en sí sigue siendo válida como comparación (las dos reglas suponían lo mismo).
- Las 44 órdenes en fases 8 (terminados y prenda terminada) no cambian: pasar por terminados sí garantiza que
  servicios y confección terminaron.

## 2 · Carga de órdenes de trabajo (mrp.workorder) — construida y lista

**Columnas que necesito del export de Odoo** (Fabricación → Órdenes de trabajo → exportar). Nombres de encabezado
como los muestra Odoo en español; la lectura tolera mayúsculas y tildes y busca por contenido:

| Columna Odoo (campo técnico) | Obligatoria | Para qué |
|---|---|---|
| **Orden de fabricación** (`production_id`) | sí | el WH/MO/… que enlaza con la orden cargada |
| **Centro de trabajo** (`workcenter_id`) | sí | qué centro es; se traduce con la tabla 6 |
| **Estado** (`state`) | sí | done / progress / ready / pending / waiting / cancel; se traduce con la tabla 7 |
| Fecha de inicio real (`date_start`) | no | se guarda por centro |
| Fecha de finalización real (`date_finished`) | no | se guarda por centro |
| Operación (`name`) | no | solo informativo |
| Cantidad producida (`qty_produced`) | no | se guarda; hoy no se usa para cerrar parcial |

Exporta **todas las órdenes de trabajo de las órdenes abiertas** (no solo las terminadas): las "en proceso" y "para
hacer" sirven para detectar contradicciones con la fase. Una hoja, primera fila = encabezados, una fila por orden de
trabajo. Si una orden tiene varias OT del mismo centro (varias operaciones de confección), el centro cuenta como
terminado solo si todas lo están.

**Cómo funciona (todo por tablas, Configuración → Órdenes y materiales):**
- **Tabla 6**: centro de trabajo de Odoo → centro TEMPO (+ módulo real opcional). Sembrada con Corte y Bodega → corte,
  Serigrafia y Sublimado → estampado, Bordado → bordado, Empaque → empaque, Maquila y Módulo 1…11 → confección con su
  módulo; **Pulido y Servicios y Terminados sin centro** (se reportan hasta que decidas). Un centro del archivo que no
  esté en la tabla se reporta, no se asigna por parecido.
- **Tabla 7**: valor de Estado → terminado / en proceso / para hacer / cancelado. Sembrada con los valores de Odoo en
  inglés y español. Un valor que no esté se reporta.
- **Aplicar**: solo "terminado" cierra el centro en la orden (el motor ya respeta cierres por centro). **La OT manda
  sobre la fase**: si la fase daba un centro por hecho y la OT dice "en proceso" o "para hacer", queda pendiente; si la
  fase lo daba pendiente y la OT dice terminado, queda hecho. Cada contradicción se reporta (Órdenes → "Reporte OT").
  Corte terminado implica tela tejida, tinturada y lista (secuencial).
- **Recargable**: el archivo es la verdad para las órdenes que trae; se puede subir cada vez que quieras sin tocar las
  órdenes. Botón "Órdenes de trabajo" en el panel de cargas de Órdenes.
- Se borró el importador viejo de OT, que mapeaba centros por texto en código.

**Lo que activa el cambio de diseño (pendiente de tu OK, es un clic en la tabla 5):** apagar "secuencial" en los grupos
**servicios** y **confección** (y maquila externa, si su orden también varía). Con eso la fase deja de dar estampado,
bordado y confección por hechos; solo los cierra la OT, y pasar por terminados sigue cerrándolos todos. Probado en el
simulador. Después de apagarlo hay que **volver a correr la Parte 2** para que las órdenes en 7Confección recuperen
estampado/bordado en su ruta, y luego cargar el archivo de OT para que lo ya hecho se descuente de verdad.

## 3 · Anotado para revisar con producción (del listado de categorías)

1. **Short Cargo 30,11 min vs Pantalón Cargo 18,50 min**: el short no puede tomar más que el pantalón. Revisar la hoja
   LMO de PANTALON (32 operaciones) contra la de SHORT CARGO (43): probablemente al pantalón le faltan operaciones.
2. **"Nueva hija" bajo HENLEY**: categoría con el nombre por defecto del botón "Agregar hija", sin órdenes. Candidata a
   borrar.
3. **Boxer sin operación de empaque**: hoja con corte y confección pero 0 minutos de empaque; sus prendas no cargan
   empaque.
