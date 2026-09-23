# Auditoría: dónde da vueltas el sistema y cómo dejarlo simple (23-sep-2026)

**Pedido de la usuaria:** «El sistema está dando muchas vueltas. Manda a hacer una auditoría de qué está
duplicándose por todo lado y hagamos lo más simple. Lo que queremos abarcar es la planificación, la
programación y el control por piso por cada fase, con el archivo de Odoo y las fotos. Si todo puede ser en una
sola pantalla sin que se vea como una mezcla de cosas, perfecto.»

**Esto es una propuesta: no se movió nada todavía.** Y nada se borra — las pantallas que salgan quedan
redirigidas, como ya se hizo con «Vista general de órdenes» y «Asignación por orden».

---

## 0 · Cómo se midió

Cuatro revisiones en paralelo sobre `index.html` (12.864 líneas / 1,94 M de caracteres de código) y sobre los
135 documentos del repo. Después comprobé a mano, con el archivo delante, **cada afirmación grave** antes de
escribirla aquí. Lo que no pude comprobar no está en este documento.

---

## 1 · El hallazgo de fondo

| | |
|---|---|
| **El motor de programación entero (`programar`)** | **33.769 caracteres = 1,7 % del sistema** |
| **La interfaz** | **278 piezas**: 191 funciones `…HTML` + 34 pantallas + 53 modales = **47 % del código** |
| Configuración | 18,2 % |
| Cargas (Odoo, OT, fotos, tallas) | 10,8 % |

**El cálculo no es el problema.** El problema es la cantidad de sitios distintos donde mirar lo mismo. Esa es,
literalmente, la sensación de «dar vueltas».

### Los números del menú

| | Hoy |
|---|---|
| Entradas de menú | **34 fijas + 10 sub-áreas** que se cuelgan solas = **44 clicables** |
| Páginas distintas | **29 en el menú**, 32 en el despachador (3 sin entrada: Costura, Nivelación, Albarán) |
| Páginas que **solo ve la usuaria** | **19 de 32** |
| Pantallas que responden «¿alcanza la capacidad?» | **4**, con **4 motores de cálculo distintos** |
| Pantallas de «avance / cómo va el mes» | **5** |
| Mecanismos de «congelar» | **3**, con el mismo nombre y tres significados |
| Listas de órdenes | **13 contextos** del mismo componente + **5 motores de agrupación** distintos |
| Fichas de detalle de una orden | **4** |
| Bandejas en Hoy | **34** |

Y la app **abre en Órdenes → «Por editar (ruta sin confirmar)»**: lo primero que ves al entrar es una lista de
deberes pendientes, no tu trabajo del día.

---

## 2 · PRIMERO: seis cosas que están mal

Esto no es simplificar, es corregir. Va antes que cualquier mudanza de pantallas. Las seis las comprobé
una por una en el código.

### 2.1 · Registrar 800 de 1000 cierra el paso como si hubieran salido 1000 — **el más grave**

`confirmarHechoCentro`, línea 7830:

```
a.centros[c] = permiteParcial(c) ? q : o.cant;
```

`permiteParcial` es **solo módulos, y solo si alguien prendió `modulosParcial`** (línea 7615). En corte,
empaque, terminados, estampado y bordado, registrar 800 de 1000 escribe **1000**.

Y `faltanteCierre` (línea 7629) lee exactamente ese número:

```
const hechas = ((S.avance[o.id]||{}).centros||{})[c] || 0;
return {cant, hechas, faltan: Math.max(0, cant-hechas)}
```

Resultado comprobado: al tocar «Terminé esta orden», el sistema calcula **0 faltantes**, no pide motivo, y
cierra el paso con el mensaje «Listo: la orden queda terminada». **Las 200 prendas que faltaban desaparecen
del cierre.** Mientras tanto `hechoC[c].pz` y el registro del día sí guardaron 800: en la misma pantalla
conviven 800 y 1000.

Al registrar sí sale el aviso «Se marca como diferencia», pero después esa diferencia no la mira nadie.

**Arreglo:** guardar siempre lo registrado (`q`); que «el paso avanza» sea el cierre (`cierres[centro]`), que
para eso existe desde el 16-sep. ~30 min y una prueba.

### 2.2 · «Vencida» se calcula de tres maneras

- **Hoy** (línea 3281): `o.fecha && o.fecha<h && faseNum(o.fase)<8` — la fecha de Odoo pelada.
- **Planificar el mes**: `fechaMetaDe(o)` — el compromiso si existe, la de Odoo si no.
- **Resumen gerencial**: además exige que el motor la dé por atrasada.

Tres listas de vencidas que no cuadran. El propio `CLAUDE.md` dice desde el 16-sep que «vencida y va tarde
tienen UNA definición» (`esMetaVencida` / `diagAtraso`). Hoy no la usa. **Un renglón.**

### 2.3 · «Hechas» se mide sobre la ruta que queda, no sobre la completa

`pzHechasOrden` arranca con `pasosProDe(o)` = la ruta **pendiente**. Cuando una orden terminó todo, esa lista
está vacía → devuelve **0 hechas** para una orden que el resto del sistema da por terminada. Debe mirar
`pasosProCompleta`, que existe desde el 20-sep justamente para esto.

### 2.4 · La foto del mes solo se guarda si alguien abre el Resumen gerencial

`guardarCierresMes(P)` se llama **desde una sola línea, la 3392, dentro de `vGerencia`**. Si en todo un mes
nadie abre esa pantalla, el cierre de ese mes no se guarda nunca. Tiene que correr en `render()`.
*(Hay que arreglarlo **antes** de tocar el Resumen gerencial, o se pierde la historia.)*

### 2.5 · Agrupar por «próximo paso» corre el motor una vez por fila

Línea 2893: `case 'paso': … pasoProximoDe(o, programar())` — `programar()` dentro del `map` de cada fila. En
una lista de 600 órdenes, el motor 600 veces. Por eso esa agrupación se siente colgada. Se calcula una vez
fuera del bucle.

### 2.6 · «Mover baño de máquina» está documentado pero no existe

`selMaquinaBano` aparece **una sola vez en todo el archivo**: la definición. Ese `<select>` no se dibuja en
ninguna tarjeta. `CLAUDE.md` lo da por funcionando desde hace días. O se conecta, o se quita de la
documentación — pero hoy, en tintorería, un baño no se puede mover de máquina desde la tarjeta.

---

## 3 · Lo que le falta al objetivo que tú pediste

Ordenado por lo que más duele para «planificar, programar y controlar por fase».

### 3.1 · La fase no se mueve sola cuando el piso termina un paso — **el agujero central**

El operario cierra corte y la fase sigue diciendo otra cosa hasta que un supervisor la mueve a mano. El
sistema lo sabe: tiene la bandeja `cierreSinFase`, el panel `cierresSinFaseHTML` y el texto literal **«fase
sin actualizar»** en tres sitios.

Para un sistema cuyo objetivo declarado es *llevar control por cada fase*, esto es el hueco principal. Y la
infraestructura ya está: el RPC `mover_fase` **está ejecutado en producción desde el 16-sep** (lo dice la
cabecera del propio `SUPABASE_MOVER_FASE.sql`, comprobado en `pg_proc`). Lo que falta es **la regla**: qué
cierre implica qué fase. Eso es una tabla, no código.

*(De paso: `CLAUDE.md` dice dos veces que ese SQL está «sin ejecutar». Está desactualizado.)*

### 3.2 · No hay detección de órdenes estancadas en una fase

`diasEnFase` existe, pero se usa **una sola vez**, como promedio dentro del Resumen gerencial. No hay bandeja
«órdenes que llevan N días sin moverse de fase», que es justo lo que pide controlar por fase.

### 3.3 · La tabla de motivos (15) está casi vacía, y eso bloquea botones

`motivos()` arranca en `[]`; solo los tres motivos de paro están sembrados. El propio código lo declara: sin
motivos **no se puede devolver una fase, ni revertir una liberación, ni rechazar un baño, ni cerrar con
faltante**. No es código: son datos que faltan, y son el mayor freno a controlar por fase.

### 3.4 · El calendario no tiene festivos

`excepciones:[]`. Días hábiles, holgura, nivelación y plan cuentan 9-oct, 2-nov, 3-nov y 25-dic como
laborables. La pantalla avisa, pero el plan sale optimista.

### 3.5 · Nunca se hizo la portada por rol

`portadaRol` = **0 referencias**. La propuesta aprobada del 19-sep la pedía y quedó sin construir. Hoy todos
los perfiles entran al mismo menú de 34 entradas. **Es lo que más lograría con menos código:** una portada de
4–6 acciones por rol, con el menú completo detrás de «ver todo».

### 3.6 · La tabla 18 (descansos por centro) está vacía

`descansosCentro` devuelve 0 → el minuto/prenda real sale inflado. Y la función que reportaba ese problema,
`centrosSinDescansos`, **está muerta**: nadie la muestra.

---

## 4 · Las pantallas: hoy → propuesta

Una entrada de menú **por pregunta**, no por pantalla.

| Grupo | Hoy (44 clicables) | Propuesta (**11 entradas**) |
|---|---|---|
| **Dirección** | Hoy · Órdenes · Demanda agregada · Planificar el mes · Liberación · Entregas · Auditoría · Capacidad y decisiones | **Hoy** · **Órdenes** · **El mes** (demanda y capacidad adentro) · **Liberación** · **Entregas** |
| **Textil** | Stock · Tejeduría · Macro · Compras · Tintorería | **Textil** (stock, tejeduría, macro en pestañas) · **Tintorería** |
| **Producción** | Liberación a producción · Carga general · Corte · Confección · Estampado (+5) · Bordado · Terminados (+5) · Balanceo · Programa del día | **Centros** (un chip por centro; las sub-áreas vacías no se cuelgan) |
| **Reportería** | Resumen gerencial · Producto en proceso · Avance por área · Cumplimiento · Avance del mes | **Reportes** (una pivot con chips + avance por área) |
| **Piso** | Control de piso · Mi centro | **Control de piso** · **Mi centro** |
| **Config** | Categorías · Operaciones · Centros y recursos · Usuarios · Salud | **⚙ Configuración** |

### Qué se funde, con la evidencia

1. **Las 4 capacidades → 1.** `cargaSemanal`, `cargaUnica`, `matrizCapacidad` y `nivelar` son cuatro motores
   para la misma pregunta. El propio código lo admite en pantalla: *«Aquí no se decide el mes (eso es Plan
   mensual) ni qué hacer con la sobrecarga (eso es Capacidad y decisiones): esto solo muestra»*. Se queda la
   **nivelación del paso 1 de Planificar el mes**. *(Hay que reubicar el detalle por saldo de Carga general,
   que es el destino de un enlace de la nivelación.)*
2. **Los 3 «congelar» → 2.** `congelarPlan` (el mes) y `congelarPrograma` (la semana de un centro) se quedan.
   El tercero, `congelarSemana`, **lo dispara un único botón en toda la app** y solo lo lee esa misma
   pantalla: sale, y Cumplimiento con él.
3. **Resumen gerencial + Producto en proceso → 1.** Los cinco cortes del gerencial son exactamente los chips
   de Producto en proceso, y el código lo dice dos veces en comentarios. Es una pivot con chips.
   *(Conservar `diasEnFase`: hoy solo vive ahí, y sirve para 3.2.)*
4. **Los 3 avances → 1.** El texto de Avance por área ya dice *«son los mismos números del Avance de la
   semana de cada centro»*. Se queda Avance por área, conservando la columna contra el plan mensual congelado.
5. **Macro + Compras → una página, dos pestañas.** Comparten el mismo filtro base y la misma base de
   requerimiento.
6. **Las 5 sub-áreas vacías salen del menú** (etiquetas, calandrado, sublimado, apliques, cordones): el propio
   sistema las marca con ⚠ porque *ninguna orden abierta las tiene en su ruta*. Que se cuelguen solas cuando
   una orden las use.
7. **Un solo cargador de fotos.** Hoy hay dos inputs en el mismo paso (`f-fotos` para el CSV de Odoo,
   `f-fotosref` para los JPG por referencia), con nombres parecidos y nada que diga cuál usar. Se detecta por
   extensión. Las fotos son lo que más te importa: tiene que ser arrastrar y ya.
8. **Una sola ficha de orden.** Hay cuatro modales. Se quedan dos: la del buscador global (leer) y la de
   Órdenes (editar).

### Y lo que está muerto y se puede retirar sin que nadie lo note

- **58 funciones declaradas y nunca llamadas** (1,88 % del archivo). *Cuidado: varias las menciona
  `test/driver.js`; hay que ajustar las pruebas a la vez.*
- **El catálogo de rutas plantilla**: su editor `mRuta` aparece **una sola vez** (la definición), `rutaId`
  aparece **una vez** en todo el archivo. Ninguna orden apunta a una plantilla. Es una de las 19 tablas de
  Supabase y está huérfana entera.
- **Balanceo + Costura + Auditoría de replanificación + Operarias + Tipos de máquina**: isla cerrada de
  46 KB. Está demostrado que **el SAM que usa el motor no pasa por ahí**. *Duda honesta: si alguien reparte
  operaciones a mano en Balanceo, perdería esa herramienta — dímelo antes.*
- **14 parámetros muertos.** Uno en particular: `minEtiqEmbodegado` **tiene su campo editable en
  Configuración y cero lectores**: escribes un número y no pasa nada.
- **`defCatalogoUsuaria`**: 58.036 caracteres (3 % del peso de cada carga de página) de catálogo de telas
  incrustado que **solo sirve como semilla** y se descarta en cuanto existe la fila en `params`.

---

## 5 · Orden de trabajo propuesto

| Paso | Qué | Esfuerzo | Riesgo | Se gana |
|---|---|---|---|---|
| **1** | Las seis correcciones del punto 2 | 4 h | **bajo** | Los números dejan de contradecirse. **Va primero sí o sí** |
| **2** | Portada por rol (4–6 acciones) + abrir en Hoy | 4–6 h | bajo | **Lo que más se nota.** Cada uno entra a lo suyo, no a un menú de 34 |
| **3** | Sub-áreas vacías fuera del menú + un solo cargador de fotos | 2 h | muy bajo | −5 entradas; la carga de fotos deja de tener trampa |
| **4** | **Centros con chips**: las 18 entradas de producción en 1 | 4–6 h | bajo | El menú más largo desaparece |
| **5** | Retirar Cumplimiento y el tercer congelar | 2 h | bajo | −1 pantalla, −1 concepto duplicado |
| **6** | Fundir las 4 capacidades en la nivelación | 6–8 h | **medio** | −3 entradas, −1 motor. La causa #1 de «da vueltas» |
| **7** | Fundir gerencial en Producto en proceso; los 3 avances en 1 | 6–8 h | medio | −3 pantallas de Reportería |
| **8** | Macro + Compras en pestañas; una sola ficha; limpiar lo muerto | 5 h | bajo | −1 entrada, −2 % de peso |

Total ≈ **33–41 h**. Con los pasos 1 a 5 (≈16 h) el menú baja de 44 a ~26 clicables, cada uno entra a su
portada y los números cuadran. Del 6 al 8 es donde llega a 11 entradas.

Cada paso se publica por separado con sus pruebas, y se puede parar en cualquiera.

---

## 6 · Lo que NO se toca

- **El motor** (`programar`) y **la nivelación** (`nivelar`): ni una línea sin autorización tuya.
- **Mi centro** (tablet) y el registro de tiempos: recién están funcionando.
- **La carga de Odoo, las OT, las fotos y las tallas**: el camino único quedó bien resuelto.
- **Tintorería** entera (baños, calidad, reprocesos).
- **Las rutas y su confirmación**: es el trabajo que acabas de hacer a mano.
- **Configuración**: es lo más pesado del sistema, pero es donde vive «lo configurado manda». Se ordena,
  no se recorta.

---

## 7 · Qué necesito que decidas

1. **¿Arranco por el paso 1** (las seis correcciones)? Lo recomiendo: son errores de número, no de gusto.
2. **¿La portada por rol va de segunda?** Es lo que más se nota por hora de trabajo.
3. **¿Hasta dónde llego?** 1–5 (lo barato y visible) o 1–8 (el menú de 11 entradas).
4. **Cumplimiento de facturación**: ¿lo usas? Si no, sale en el paso 5.
5. **Balanceo y Costura**: ¿los usa alguien hoy? Si no, salen.
