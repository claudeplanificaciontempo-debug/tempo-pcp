# Subir la fase y las OT sin perder las rutas ya trabajadas (22-sep-2026)

**Pregunta de la usuaria:** «Ya subimos la información y ya tenemos la ruta, pero no he actualizado nada hasta hoy.
Les voy a subir en qué fase están y las órdenes de trabajo que ya están hechas. ¿Cómo procedemos? **No quiero perder
las rutas, lo que ya trabajé.**»

---

## 1 · Qué pasaba hasta hoy

Al cargar de nuevo las tareas de Odoo, cada orden **se vuelve a armar** desde el catálogo (categoría → hoja LMO) y
encima se le devuelven las decisiones que la tabla 14 marca como conservadas. Se conservaban la **confirmación**
(`rutaConf`: quién, cuándo y de dónde salió), los pasos agregados o quitados a mano (`rutaEditada`), los centros que
aporta la OT, el lavado y la compra de tela.

El hueco: **una ruta confirmada «tal cual», sin haber pasado por el editor, no deja `rutaEditada`**. Es el caso del
botón «✓ Ruta ok» de la lista de Órdenes y de «Confirmar como están» en la pestaña Rutas. En esas órdenes se conservaba
la marca de confirmada, pero la ruta se rearmaba con el catálogo de hoy: si el catálogo había cambiado, quedaba
**confirmada una ruta distinta de la que se revisó**, sin avisar.

## 2 · Qué cambió

**Una ruta confirmada por una PERSONA ya no se vuelve a armar desde el catálogo.** En `aplicarTarea`, cuando la orden
trae `rutaConf.origen === 'persona'`, se conserva su `rutaCompleta` entera y lo único que se recalcula es **qué pasos
quedan pendientes**, con la fase que traiga el archivo (`pasosPendientes`). Si el catálogo de hoy hubiera armado otra
ruta, la diferencia **se reporta** en la bandeja «no calzan» (`tipo:'ruta'`) con las dos versiones escritas:
«con el catálogo de hoy se armaría A → B → C; la confirmada es A → D → C».

**La vista previa lo dice antes de aplicar nada**: una línea nueva cuenta las órdenes con ruta confirmada por una
persona y, si en alguna el catálogo armaría otra cosa, nombra las primeras con las dos rutas al lado.

**La firma de catálogo sigue viajando** (`rutaFirma`): si la categoría cambió, la orden queda marcada `rutaRevisar`
para que la revises — **nunca pisada**. Y una ruta que se confirmó sola desde Odoo (`origen:'odoo'`) **no** queda
blindada: esa sí se sigue recalculando, porque es derivada, no revisada por una persona.

## 3 · Cómo proceder con tu carga

1. **Respaldo antes** (Configuración → Respaldo). La carga no borra órdenes, pero es la red.
2. **Tabla 14 → fila «Fase»: destíldala solo para esta carga.** Hoy la fase la mueve la planta aquí y el archivo va a
   «no calzan»; como no has actualizado nada en el sistema, esta vez quieres que **mande Odoo**. Al terminar, vuelve a
   tildarla. (Las órdenes sin WH ya toman la fase de Odoo siempre, esas no dependen de la casilla.)
3. **Paso 1 · Tareas.** Mira la vista previa: cuántas nuevas, cuántas actualizadas, el aviso de archivo incompleto si
   faltan órdenes, y la línea nueva de rutas confirmadas. Aplica.
4. **Paso 2 · Órdenes de trabajo.** La OT **agrega** a la ruta los centros que tengan orden de trabajo, nunca quita, y
   **no toca una ruta confirmada** (lo reporta en «Reporte OT» como «confirmadas no tocadas»).
5. **Revisa después**: Órdenes → Rutas, chip «Confirmadas» (el número debe ser el mismo de antes) y la bandeja «no
   calzan» de la carga, que es donde quedó lo que el archivo contradijo.

Lo que **sí** va a cambiar con la fase nueva: los pasos ya hechos salen de la ruta **pendiente** (eso es lo correcto:
la ruta completa se conserva entera), la carga de los centros se recalcula y las órdenes que Odoo ya tiene en fases
avanzadas dejan de pesar en los centros anteriores.

## 4 · Lo que corrigió la revisión adversarial (22-sep, misma noche)

Tres revisores y catorce verificadores buscaron fallos en este cambio. Lo confirmado y corregido:

- **La ruta editada en la ficha se revertía.** Al guardar la ficha se actualizaba la ruta *pendiente* pero **no la
  completa**, así que quedaban desincronizadas; al conservar la completa en la carga siguiente, el paso que quitaste
  volvía y el que agregaste desaparecía. Arreglado **de fondo en el guardado de la ficha**: la completa sigue a la
  pendiente con la misma lógica que la ruta en lote (quita los que salieron, inserta por orden de proceso los que
  entraron). Ese desfase además ya afectaba a la ruta por orden y a «qué dice Odoo», aun sin recargar.
- **El tramo de tela no lo decide la persona.** Conservar la ruta entera congelaba también tejeduría / tintorería /
  proveedor, que salen del **origen de la tela del archivo**: si un producto pasaba a proveedor externo, volvía a
  aparecer tejeduría con 0 kg, y al revés la orden seguía pidiendo baño. Ahora se conservan **solo los pasos de
  producción** y el tramo textil se rehace con el archivo, con su propio aviso («el tramo de tela se rehace: X → Y»).
  **Si el archivo no trae líneas de tela para esa orden, no se rehace nada**: se conserva y se reporta.
- **Bordado.** Su minuto son las puntadas de la orden, no el catálogo. Si Odoo las corrige, la ruta confirmada las
  tenía viejas y nadie avisaba. Ahora la ruta confirmada **no se toca** y la diferencia sale en «no calzan».
- **El aviso mentía sobre el origen.** Se comparaba contra la ruta ya modificada por la OT y por la edición a mano, así
  que decía «el catálogo armaría…» algo que no venía del catálogo. Ahora la confirmación se restaura **antes** de esos
  bloques (con lo que la orden de trabajo respeta una ruta confirmada, como manda la regla del 20-sep) y la comparación
  es contra lo que armó el catálogo. El número de la vista previa y el de la bandeja coinciden.
- **La casilla de la tabla 14 decía menos de lo que hace.** Se llama ahora «Ruta confirmada por una persona: se
  conserva tal cual», y si está **desmarcada** la vista previa avisa cuántas rutas confirmadas se van a rearmar.
- **La bandeja «no calzan»** agrupa por tipo (rutas conservadas · tramo de tela · tiempos · liberaciones…) en vez de
  una lista plana cortada en 80: lo informativo ya no tapa lo que hay que decidir.

## 5 · Pruebas

Bloques **RC** (6) y **RC2** (7, las de la revisión: edición por la ficha en los dos sentidos, tramo de tela rehecho con el archivo, archivo sin líneas de tela, puntadas de bordado, casilla desmarcada y el texto de la tabla 14) sobre el volcado real: la vista previa cuenta las confirmadas por persona y lo dice
con palabras · después de recargar, la ruta confirmada tiene los mismos centros en el mismo orden y conserva quién la
confirmó · la fase del archivo sí entra y solo cambia qué queda pendiente · la diferencia contra el catálogo se
reporta en «no calzan» · una ruta confirmada desde Odoo no queda blindada.
