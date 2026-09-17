# Carga de datos — punto 6: un solo camino («Actualizar datos»)

**17-sep-2026.** Commit propio. Antes, en el mismo día: `14ab0ee` (clave repetida no reasigna decisiones; guardar la clave solo admin).

## Respuestas a lo pedido antes del punto 6

### 1 · Clave repetida en el archivo (`_dup2`): cómo se decidía y qué se hace ahora

**Cómo se decidía hasta hoy: por el orden de las filas del Excel.** `planTarea` numera las filas con la misma clave en el orden en
que aparecen (`vistos[id]`): la primera recibe el id base y la segunda `id_dup2`. En la carga siguiente, la primera fila del
archivo vuelve a tomar el id base y hereda **las decisiones de quien tuviera ese id**. Si Odoo exporta las dos filas al revés, las
decisiones (liberación, prioridad, programación, avance por id) **se cruzan**. Antes del cambio de clave era igual —peor: las
dos filas heredaban las decisiones de la primera orden del sistema—. **No es determinista.**

**Ahora:** si dos filas comparten clave **y esa clave ya existe en el sistema**, esas filas **no se aplican**: las órdenes existentes
quedan como están, marcadas `claveRepetida = {ts, archivo, txt:'clave repetida — revisar'}`, salen en **Hoy → Pendientes** («Órdenes
con clave repetida — revisar») y en la bitácora y en el registro de la carga («N filas con clave repetida NO aplicadas»), hasta que
alguien las distinga (por ejemplo, que Odoo les dé WH distintas: entonces las claves dejan de repetirse). Si la clave todavía no
existe, entran las dos, marcadas. **Prueba K6**: se cargan dos filas iguales, se firma y prioriza una, se recarga con las filas al
revés y otras cantidades → ninguna cambia, ninguna queda `noArchivo`, la bandeja las reporta.

En el volcado hay **7 filas** así: `WH/MO/25112` (×3), `WH/MO/25347` (×2) y `WH/MO/24121` (×2).

### 2 · Reconocidas: número exacto

Medido en el harness sobre el volcado, después de la Recarga Parte 2 (cartera **1.211** = 1.206 del archivo + 5 de demostración
`OP-1001…1005`, que el simulador siembra y quedan `noArchivo`):

| | |
|---|---:|
| Reconocidas por «Actualizar desde Odoo» (con cambios) | 617 |
| Reconocidas sin cambios | 589 |
| **Total reconocidas** | **1.206** |
| No reconocidas | **5** = las 5 de demostración (no vienen en ningún archivo) |
| **Cuadre** | 1.206 + 5 = **1.211** ✓ |
| Fuera de alcance en el archivo | 3.023 = 3.019 con WH distintas + 4 filas repetidas de las 7 (`25112` ×2, `25347`, `24121`) |
| Nuevas | 0 |

Con el camino único (prueba U6, mismo archivo dos veces): **nuevas 0, actualizadas 1.206 = 1.211 − 5, no vinieron 0**
(las 5 de demostración ya estaban «no está en el archivo»), y aplicar el segundo archivo **no cambia ni un id, fase, cantidad
ni estado** de la cartera. Las 7 filas con clave repetida del volcado están **todas fuera de alcance** (Facturado con entrega
pasada), así que hoy no hay ninguna orden marcada «clave repetida — revisar» en el sistema; la regla se probó con filas construidas.

### 3 · Botón «Guardar la clave»

Solo con permiso `config`; el panel y la confirmación dicen **«Ejecutar después de revisar duplicados en producción
(SUPABASE_DUPLICADOS_ORDENES.sql)»**; planificación recibe el aviso y no puede. Probado.

## Punto 6 · «Actualizar datos»

- **Una pantalla, tres pasos** (`mActualizarDatos(paso)`): 1) Tareas de Odoo, 2) Órdenes de trabajo, 3) Fotos. Chips arriba
  para cambiar de paso; cada paso con su archivo, su vista previa y su botón de aplicar (deshabilitado hasta leer el archivo).
  Pie: **«Nada se guarda antes de confirmar»**.
- **Paso 1 usa `planTarea`/`aplicarTarea`** (clave única, regla de alcance, tabla 14). **Nada se escribe en S durante la vista
  previa**: los colores nuevos —lo único que `planTarea` escribía— quedan en `plan.coloresNuevosObj` y entran al aplicar
  (probado: colores, órdenes, categorías y técnicas iguales antes y después de la vista previa).
- **Vista previa** (`vistaPreviaTareaHTML`, arriba del detalle): nuevas · actualizadas · cerradas · fuera de alcance (y cuántas
  existentes quedan marcadas) · no vinieron · no calzan (fase, fecha, avance) · clave incompleta · clave repetida (y cuántas no se
  aplican) · fechas ilegibles · errores (fases fuera de la tabla 1, contradicciones Estado OP vs Fase). Cuadra: nuevas +
  actualizadas + no aplicadas = órdenes del plan (probado).
- **Archivo sin componentes**: se lee (antes `planTarea` lo rechazaba), aviso en la vista previa y **solo se actualiza lo que
  viene**: telas, materiales, ruta e insumos de las órdenes existentes se conservan (probado).
- **Pasos 2 y 3 avisan las órdenes no encontradas** en un recuadro arriba (OT: «se ignoran; si deberían estar, carga primero las
  tareas»; fotos: «se suben igual y se cuelgan cuando llegue la orden»).
- **Retirado**: `mOdoo`, `forzarOdoo`, `odooBotonHTML`, `ODOO_DESHABILITADO`, `planOdoo`, `nuevaOrden`, `aplicarOdoo`, `leerOdoo`,
  `mCargarTarea`, `mOT`, `mFotos` y los botones viejos («Actualizar desde Odoo», «Recarga Parte 2», «Órdenes de trabajo»,
  «Fotos»). En Órdenes queda **un** botón «Actualizar datos» + «Reporte de la última carga»; en Configuración → Última carga,
  «Actualizar datos» + «Reporte OT». `mReporteTarea` y `mReporteOT` siguen (los une el punto 8).
- Bitácora: «Actualizar datos · tareas de Odoo <archivo> (sin componentes)?: N actualizadas, N nuevas, …».

## Lo que sigue (commits aparte)

Harness: **2.275 checks, 0 errores, 0 rojas.**

7) respaldo JSON automático antes de Restaurar, solo config, confirmación escrita; 8) registro unificado de cargas en
Configuración (y ahí se unen los dos reportes).
