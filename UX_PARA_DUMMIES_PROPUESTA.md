# TEMPO PCP «para Dummies» — diagnóstico de la interfaz y propuesta (19-sep-2026)

Nada construido. Es el análisis para que digas **sí / no** punto por punto. Medido en el simulador con el volcado real,
perfil administrador, pantalla de 1.366 × 768 (una «pantalla» = 768 px de alto).

## 1 · Lo que medí

| Pantalla | Alto (pantallas) | Paneles | Tablas | Botones | Campos | Palabras |
|---|---:|---:|---:|---:|---:|---:|
| Tintorería | **63** | 49 | 63 | 204 | 210 | 8.321 |
| Categorías y operaciones | 31 | 2 | 3 | 171 | 663 | 1.385 |
| Plan mensual | **21** | 14 | 11 (una de **31 columnas**) | 12 | 62 (+94 chips) | 2.277 |
| Reportería por área | 21 | 11 | 10 | 215 | 11 | 7.556 |
| Resumen gerencial | 17 | 9 | 10 | 8 | 16 | 4.760 |
| Operaciones (config) | 15 | 6 | 6 | 110 | 55 | 2.087 |
| Entregas | 13 | 2 | 1 (12 col.) | 14 | 389 | 2.793 |
| Liberación | 10 | 11 | 4 | 23 | 142 | 742 |
| Hoy | 9 | 9 | 5 | 19 | 0 | 796 |
| Balanceo · Capacidad y decisiones · Tejeduría · Macro · Config | 7–9 | 4–7 | 2–7 | | | |
| **Resumen del centro (nuevo)** | **4** | 6 | 1 | 12 | 20 | 412 |
| Mi centro (tablet) | 1 | 1 | 0 | 0 | 1 | 32 |

- **Menú: 44 entradas en 6 grupos** (8 en Dirección, 6 textil, 16 producción, 8 reportería, 2 piso, 4 configuración).
- **14 de 30 pantallas miden más de 5 pantallas de alto**; la mitad abre con un párrafo explicativo de 3–6 líneas (`lede`)
  y solo el Resumen del centro usa el «?» compacto.
- Casi todas las pantallas tienen **buscador + filtro de fases + agrupador + selector de mes** arriba, aunque el usuario
  típico llega a hacer **una** cosa.

## 2 · Diagnóstico: por qué se siente complejo (seis causas, no cuarenta)

1. **Cada pantalla es un informe, no una tarea.** Tintorería muestra a la vez estado, armado, confirmados, cuadro, resumen
   por WH, calidad y reprocesos (49 paneles). Quien entra a «armar el baño de hoy» tiene que encontrarlo entre 63 tablas.
2. **El menú describe el sistema, no el trabajo.** «Demanda agregada», «Auditoría de replanificación», «Asignación por
   orden», «Macro del mes», «Carga general», «Nivelación de carga» son nombres de módulo; nadie llega desde una pregunta
   («¿qué corto hoy?», «¿qué falta liberar?»).
3. **Vocabulario de ingeniería en la cara del usuario**: WH, ODC, SAM, min/prenda, cercanía, `pctBueno`, congelar,
   nivelación, colchón, atasco, «Todo lo que viene», «anomalía». Cada uno tiene tooltip, pero hay que descubrirlo.
4. **Explicación por texto, no por diseño.** 20+ párrafos `lede`, notas al pie y tooltips largos compensan que la pantalla
   no se explica sola. El Resumen del centro demostró lo contrario: 412 palabras y se entiende.
5. **Todo abierto a la vez.** Detalles, tablas de 30 columnas, 663 campos editables en Categorías, 389 en Entregas. Sin
   «primero lo importante, el resto al tocar».
6. **Mismo home para todos.** Un supervisor de corte, la jefa de planificación y gerencia entran a la misma «Hoy» de 9
   paneles; cada uno necesita 2 o 3 cosas distintas.

## 3 · Propuesta «para Dummies»: cinco reglas y qué cambiaría

Las reglas del libro: **una pregunta por pantalla · primero la acción, después el detalle · palabras de planta ·
mostrar poco, abrir al tocar · el mismo patrón en todas partes**. Lo de abajo son cambios de **presentación**: no se
borra ninguna función, no se toca el motor, y toda pantalla actual queda accesible desde «Ver todo / Avanzado».

### A · Portada por rol («¿Qué hago hoy?») — reemplaza a «Hoy» como primera pantalla
Tres tarjetas grandes, en lenguaje de tarea, con el número y un botón:
- Planificación: **Liberar** (N esperando) · **Programar** (N centros sin congelar) · **Cargar datos** (última carga hace X).
- Supervisor de centro: abre directo en su **Resumen del centro** (ya existe).
- Tintorería: **Armar baños** (N colores esperan) · **Baños de hoy** · **Calidad** (N por aprobar).
- Gerencia: **Resumen gerencial** con 4 cifras y nada más.
La «Hoy» actual queda como «Ver todas las bandejas». **Esfuerzo: medio. ¿Sí / no?**

### B · Menú de 44 a ~12 entradas, con nombres de tarea
`Hoy · Órdenes · Liberar · Programar (centros) · Tintorería · Tejeduría · Plan del mes · Entregas · Reportes ·
Piso · Configuración`. Lo demás (Demanda agregada, Auditoría de replanificación, Macro, Compras, Balanceo, Programa del
día, Asignación por orden, Carga general, Nivelación, Vista general, Producto en proceso, Cumplimiento, Avance) pasa a
ser **pestaña dentro de la pantalla madre** o entrada de «Reportes», no del menú principal. Nada desaparece.
**Esfuerzo: medio. ¿Sí / no?** (Dime cuáles de esas quieres que sigan en el menú principal.)

### C · Tintorería en cuatro pasos (asistente)
Una barra arriba: **1 Esperando tela → 2 Armar baños → 3 Baños programados → 4 Calidad**. Cada paso es UNA pantalla con
una tabla; el número del paso dice cuántas hay. «Resumen por WH», «cuadro» y «reprocesos» quedan en «Ver más». Es la
pantalla que más lo necesita (63 pantallas de alto). **Esfuerzo: alto. ¿Sí / no?**

### D · Liberación como lista de chequeo, no como bloques
Hoy: 11 paneles, 10 desplegables, 4 tablas. Propuesta: **una lista** («qué falta para liberar»: ruta ✓ · tela ✓ · calidad
✓ · insumos ✓) por orden, con un solo botón «Liberar las N que están completas», y el resumen por familia como
«Ver más». La verificación de insumos sigue siendo la firma de la persona. **Esfuerzo: medio. ¿Sí / no?**

### E · Plan mensual en tres pasos
**1 ¿Qué entra?** (base + agregar) → **2 ¿Cabe?** (capacidad por centro, semáforo) → **3 Fijar el mes** («congelar» se
llama **Fijar**). Bloques 1–5 actuales se reparten en esos tres; la tabla de 31 columnas se parte por semana con un
selector. **Esfuerzo: medio. ¿Sí / no?**

### F · Todas las pantallas: la misma cabecera de tres líneas
Como el Resumen del centro: **título + una línea de contexto + «?»**. Los 20 párrafos `lede` pasan al «?». Buscador,
filtro de fases y agrupador se pliegan bajo un botón **«Filtrar»** (hoy ocupan 55 px en cada pantalla). Las tablas
muestran **6 columnas** y el resto con «más columnas». **Esfuerzo: bajo, se hace pantalla por pantalla. ¿Sí / no?**

### G · Palabras de planta (diccionario de una sola vez, tabla 17 editable)
WH → **Orden** (el número se sigue viendo) · ODC → **Pedido del cliente** · SAM / min por prenda → **Minutos por prenda** ·
cercanía → **qué tan cerca está de llegar** · congelar → **Fijar** · nivelación → **¿Alcanza la capacidad?** ·
«Todo lo que viene» → **Más adelante** · anomalía / «Ya salió de aquí» → **Revisar** · colchón → **Días de holgura** ·
atasco → **Dónde se traba**. Ya existe la tabla 17 de textos: se amplía y se usa. **Esfuerzo: bajo. ¿Sí / no?**
(Dime cuáles palabras NO quieres cambiar; WH y ODC son las dudosas porque la gente ya las usa.)

### H · Estados con semáforo y verbo, no con etiqueta técnica
En toda lista de órdenes, UNA columna «Estado» con tres colores y un verbo: 🟢 **Lista para cortar** · 🟡 **Llega el
mié** · 🔴 **Atrasada 3 días** · ⚪ **Falta liberar** / **Falta tela** / **Falta ruta**. Las marcas actuales (meta vencida,
va tarde, paso tarde, sin puesto, en proceso aquí…) se quedan en el tooltip y en Programación del centro. Ya está hecho
en el Resumen del centro; se extiende a Órdenes, Liberación, Entregas y Control de piso. **Esfuerzo: bajo-medio. ¿Sí / no?**

### I · Configuración con «modo simple»
Categorías (663 campos) y Operaciones (110 botones) son de ingeniería; se quedan, pero detrás de un interruptor
**«Avanzado»**. En modo simple, Configuración muestra solo: Usuarios · Centros y personas · Calendario · Fases y motivos.
**Esfuerzo: bajo. ¿Sí / no?**

### J · Ayuda «¿Cómo hago para…?» dentro de la app
Un botón fijo con 8 recetas de tres pasos (cargar Odoo, liberar, armar un baño, programar un centro, registrar en la
tablet, fijar el mes, cambiar una fase, devolver una orden), cada una con enlace directo a la pantalla. Es el índice del
libro para Dummies. **Esfuerzo: bajo. ¿Sí / no?**

## 4 · Lo que NO cambiaría
- **Resumen del centro y Mi centro (tablet)**: ya cumplen las cinco reglas; son el molde para el resto.
- **Las reglas de negocio y el motor**: nada de esto los toca.
- **Las pantallas de ingeniería** (Programación del centro con su cola, Balanceo, Nivelación, Capacidad y decisiones,
  Auditoría): siguen enteras, solo bajan un nivel (pestaña o «Avanzado»).

## 5 · Orden que propongo (cada entrega con capturas, como siempre)
1. **F + G + H** (cabeceras, palabras, semáforo): barato, se nota en todas partes.
2. **A + B** (portada por rol y menú de tareas).
3. **D** Liberación como lista de chequeo.
4. **C** Tintorería en cuatro pasos.
5. **E** Plan mensual en tres pasos · **I** Configuración simple · **J** recetas.

Marca sí/no en A–J (y las palabras de G que no quieres tocar) y arranco por la 1.
