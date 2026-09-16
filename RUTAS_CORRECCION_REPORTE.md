# Rutas: corrección aplicada, ruta por defecto y recálculo automático

**Commit:** `8031594` · **Harness:** 1.608 pruebas verdes, sin errores.

---

## 1 · Las 326 rutas: aplicado

La corrección quedó como **siembra autorizada**: corre **una sola vez, sin preguntar**, con las demás
decisiones del 16-sep. **Se aplicará la próxima vez que abras la app** — igual que la unificación DENIM, ya
que no puedo entrar a tu Supabase.

### Antes y después, medido sobre los datos reales

| | Antes | Después |
| --- | ---: | ---: |
| Órdenes abiertas con ruta | 469 | 469 |
| **Rutas que NO terminan en Empaque** | **348** | **22** |
| Prendas afectadas | 122.788 | **3.125** |
| Terminan en bordado | 301 | 12 |
| Terminan en estampado | 47 | 10 |
| **Rutas que terminan en Empaque** | 121 | **447** |

**326 rutas corregidas.** De las 348, ninguna estaba editada a mano y ninguna tenía Empaque mal puesto: las
326 eran incompletas y se completaron desde su categoría. Las 22 restantes son las del punto 2.

### La foto del mes en curso: recalculada

**Confirmado.** La foto quedó marcada **«vuelta a tomar»**, con el motivo, y su marca de brecha bajó:

| | Antes | Después |
| --- | ---: | ---: |
| Órdenes con ruta mal en la foto | **348** | **22** |
| Recalculada | — | **sí** |

Las fotos de **meses cerrados no se tocaron** — conservan su etiqueta de que se tomaron con la brecha, que es
la verdad de ese momento.

---

## 2 · Las 22 sin Empaque: ruta por defecto (vista previa, **sin aplicar**)

Tal como dijiste: **toda prenda pasa por corte, confección y empaque**, tenga o no hoja su familia.

| | |
| --- | ---: |
| Órdenes | **22** |
| De categorías **sin minuto estimado** | **22** |

Ejemplos de lo que quedaría:

| OP | Categoría | Min/prenda | Ruta hoy | Quedaría |
| --- | --- | --- | --- | --- |
| WH/MO/28768 | Fleece Pesado / Crew Moda | *sin valor* | `estampado → bordado` | `**corte** → estampado → bordado → **modulos** → **empaque**` |
| WH/MO/29079 | JOGGER / Jogger Moda | *sin valor* | `bordado` | `**corte** → bordado → **modulos** → **empaque**` |
| WH/MO/29232 | Fleece Pesado / Crew Zip | *sin valor* | `estampado` | `**corte** → estampado → **modulos** → **empaque**` |

**Estampado y bordado se conservan** donde la orden los pide, entre corte y confección.

Todas quedarían **«estimada – sin revisar»**, para revisarlas una por una.

**Las 22 son de categorías sin minuto estimado**, así que — como pediste — **la ruta se crea igual y su carga
queda en 0 con aviso**. La pantalla lo dice explícitamente: es una **brecha de tiempos, no de ruta**, y se
cierra poniendo el minuto estimado en Configuración → Operaciones. Probado que con minuto cargado el paso de
confección sí trae sus minutos.

**El panel está en Reportería con la vista previa. No lo apliqué**, como pediste.

---

## 3 · Recálculo automático

Cada orden guarda una **firma** de cómo se armó su ruta: su categoría, su vínculo con la hoja LMO y qué
centros aporta esa categoría hoy. Si la firma cambia, la ruta quedó vieja.

| Caso | Qué pasa |
| --- | --- |
| **Ruta no editada a mano** | se **rehace sola**, tomando los pasos nuevos en su lugar del proceso |
| **Ruta editada a mano** | **no se toca** y queda **marcada para revisión**, diciendo qué cambió |
| **Cambia la categoría de la orden** | dispara lo mismo |
| **Cambia el vínculo categoría → hoja LMO** | dispara lo mismo |

El recálculo corre **al dibujar**, cuando hay pendientes, así que no hay que acordarse de nada. Las marcadas
salen en un panel propio con el botón «revisada», y **todo queda en auditoría** — tanto lo rehecho como lo que
no se tocó.

**La prueba que pediste** hace exactamente esto: le agrega una operación de ojales y botones a la hoja de una
categoría y verifica que (a) sus rutas quedan desactualizadas, (b) la no editada se rehace y toma el paso
nuevo **antes de Empaque**, (c) la editada a mano **no cambia** pero sale marcada, (d) al marcarla revisada se
vuelve a sellar, y (e) cambiar la categoría de la orden dispara lo mismo.

Una nota sobre el diseño: **estampado y bordado no entran en la firma** a propósito. Dependen de la técnica y
las puntadas de **la orden**, no de la categoría, así que un cambio de hoja no debe moverlos.

---

## 4 · La etiqueta «con brecha»

Desaparece sola cuando no queda ninguna ruta sin Empaque, y vuelve si aparece una. Fijado en prueba: se
verifica que sin rutas malas el aviso es vacío y la etiqueta no está en el Resumen gerencial.

Con las 326 corregidas seguirá visible por las **22** hasta que apliques el punto 2.

---

## 5 · Tejeduría manual — propuesta de diseño (**no construido**)

### El problema

Hoy una fila es `tela · máquina · día · kg`, y significa dos cosas distintas según la fecha: **un compromiso**
(a futuro) o **un hecho** (pasado). Por eso no se le puede poner el tope de fecha sin romper el registro.

### Qué campos

Una sola columna nueva: **Estado**, con dos valores.

| | **Programado** | **Tejido** |
| --- | --- | --- |
| Qué significa | lo que se va a tejer | lo que ya se tejió |
| Fecha | **no antes de hoy** | cualquiera, incluso pasada |
| Kg | los planificados | **los reales** |
| Se puede editar | sí | solo con motivo, y queda en auditoría |

Y dos campos de apoyo en las filas ya tejidas: **kg reales** (que pueden diferir de los programados) y
**quién / cuándo** lo confirmó.

### Quién registra

- **Programado:** la persona de tejeduría, igual que hoy.
- **Tejido:** la misma persona, al cierre del día, con un botón **«marcar como tejido»** en la fila
  programada. Ese botón copia los kg programados a kg reales y deja corregirlos. Si se tejió algo que no
  estaba programado, se crea la fila directamente como «tejido».
- **Una fila programada cuyo día ya pasó y nadie marcó** sale como **brecha** («quedó sin confirmar»), igual
  que los tramos olvidados del piso. Hoy eso no se ve.

### Cómo lo usa el motor

| Estado | Qué hace el motor |
| --- | --- |
| **Tejido** | la tela está lista **desde ese día**, con los **kg reales**. Es un hecho: no se recalcula |
| **Programado** | la tela estará lista ese día, con los kg planificados — igual que hoy |
| **Programado con día pasado y sin confirmar** | **no cuenta como tela lista**. Hoy sí cuenta, y eso puede estar adelantando fechas que no ocurrieron |

Ese último punto es el que más valor tiene: **hoy el motor cree que está tejido todo lo que se programó**,
aunque nadie lo haya confirmado.

### Qué cambia para quien usa la pantalla

Poco: una columna más y un botón por fila. La comparación «pedido vs cargado» pasa a tener tres columnas
—pedido, programado, tejido— que es lo que de verdad hace falta para saber si vamos bien.

**No construí nada.** Dime si te sirve así y lo hago.

---

## Archivos tocados

| Archivo | Qué cambió |
| --- | --- |
| `index.html` | `sembrarRutasEmpaque`; `RUTA_DEFECTO_PRO`/`rutaDefectoDe`/`previaRutaDefecto`/`aplicarRutaDefecto`/`rutaDefectoPanelHTML`; `firmaRutaDe`/`rutaDesactualizada`/`sellarRuta`/`rutasPorRecalcular`/`recalcularRutas`/`rutasParaRevisar`/`marcarRutaRevisada2`/`rutasRevisarPanelHTML`/`sembrarFirmasRuta`; el recálculo en `render()` |
| `test/driver.js` | 24 pruebas nuevas y la medición del antes/después en `__R.empAplicado` y `__R.rutaDefectoPrevia` |
| `RUTAS_CORRECCION_REPORTE.md` | este reporte |

---

## Lo que necesito de ti

1. **¿Aplico la ruta por defecto a las 22?** Está lista con vista previa.
2. **¿Te sirve el diseño de tejeduría?**
3. Sigue pendiente: el **centro de las dos operaciones de BVD y FITS**, y los **datos de las lavadoras**.

## Brechas

1. **Las 22 son todas de categorías sin minuto estimado.** Aunque les pongas la ruta, su carga seguirá en 0
   hasta que producción escriba el minuto. Son las familias JOGGER, Fleece Basico, Fleece Pesado, TEJIDOS,
   FALDAS, ENTERIZO y ACCESORIOS.
2. **El recálculo automático empieza a funcionar desde ahora**: las órdenes existentes se sellan en la primera
   apertura. Un cambio de catálogo anterior a eso no se detecta hacia atrás.
