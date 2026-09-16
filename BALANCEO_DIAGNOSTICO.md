# Balanceo de módulos — diagnóstico y diseño (no se construyó nada)

Fecha: 15-sep-2026. Solo diagnóstico y diseño. No se tocó `index.html` ni el motor.

## 1 · Qué hace hoy el sistema y qué se puede reutilizar

**Balanceo (pantalla propia)** parte de lo que **ya está programado** en un módulo en un mes: agrupa las órdenes por
hoja de operaciones, y para la hoja elegida calcula minutos por prenda, ritmo teórico con las personas del módulo,
operarias necesarias, y reparte las operaciones en puestos. Muestra también el cuello de botella, la salida real que
permite ese cuello y una comparación de máquinas que pide contra las que el módulo tiene registradas. Deja fijar un
**objetivo de prendas por hora** por módulo, con motivo obligatorio, historial y bitácora, y permite **ajustar el tiempo
de una operación para una referencia concreta**, con motivo y auditoría.

El reparto lo hace `repartirPuestos`: recorre las operaciones en orden, junta consecutivas **de la misma máquina**
mientras no pasen del ritmo, y parte en varios puestos la operación que sola dura más que el ritmo. Es automático y no
se puede corregir a mano.

**Costura: secuencia y rebalanceo** (ahora pestaña del centro Confección) es otra cosa: mira las órdenes en curso por
módulo, marca las que van en rojo contra su fecha y propone mover una orden de módulo, con evaluación de alternativas y
registro de la propuesta. No toca operaciones ni puestos.

**Se puede reutilizar tal cual**: el cálculo de minutos por prenda de una hoja, el ritmo y las operarias necesarias, el
objetivo por hora con su historial, el ajuste de tiempo por referencia con auditoría, la comparación con el inventario
de máquinas, la impresión, y los componentes comunes (tarjetas, agrupador, filtro de fases, ← atrás).
**Hay que reemplazar**: el reparto automático como única opción.

## 2 · Datos: qué hay y qué falta

Medido sobre la base de prueba del simulador, que trae la carga real de operaciones:

| Dato | Estado |
| --- | --- |
| Operaciones de la hoja LMO | **596 filas**, 18 categorías con hoja |
| SAM por operación | **595 de 596 con tiempo** (una sin tipo de máquina y sin tiempo) |
| Tipo de máquina por operación | **595 de 596** |
| Sección de la prenda | **595 de 596** (14 secciones: general, frente, hombros, posterior, mangas, cuello, costados, bajos, puños, capucha, sisa, cintura, pretina, bolsillos) |
| **Orden de la operación dentro de la prenda** | **0 de 596**. Es exactamente lo que falta: hoy el orden es el del archivo, y la pantalla lo advierte |
| Máquinas por módulo | **0 registradas**. La tabla existe, está vacía |
| Operarias | **No existe la tabla** |
| Especialidad por operaria | No existe |
| Personas por módulo | Sí: 11 módulos con 12 personas cada uno, más maquila con 20 |

**Los nombres de máquina vienen sin normalizar.** En las 596 filas conviven «OVERLOK 4 HILOS» (120) y «OVERLOCK 4
HILOS» (18), y hay 27 variantes en total, varias con el sufijo TP: recta (207), overlock 4 hilos (138 entre las dos
grafías), manual (96), recubridora (33 + 4 collaretera + 1 TP), vertical (27), recta TP (17), ojaladora (10), pulpo
manual (9), sesgadora (7), bordadora (7), overlock 3 hilos TP (6), atracadora TP (6), elasticadora (5), recta 2 agujas
TP (5), botonadora (4), cerradora de codo TP (3), overlock 5 hilos (2+2), y una de cada: tirilladora, recta doble
aguja, tampográfica, pretinadora multiaguja TP, ojal lágrima TP, remachadora TP. Sin una tabla que diga cuáles son el
mismo tipo, el balanceo pedirá máquinas que no existen y el inventario nunca va a cuadrar.

## 3 · Tablas editables que harían falta

1. **Tipos de máquina** — `tipo` (nombre oficial), `alias` (los nombres que llegan de la hoja, separados por coma),
   `familia` (recta, overlock, recubridora, especial, manual), `activa`. Sirve para normalizar las 27 variantes.
2. **Máquinas por módulo** — ya existe la tabla de máquinas de confección, pero está vacía: `id`, `tipo`, `módulo`,
   `estado` (operativa, en mantenimiento, de baja), `código interno`.
3. **Operarias** — `nombre`, `módulo`, `activa`, `fecha de ingreso`, `notas`. La llenas tú; el sistema no crea personas.
4. **Especialidades por operaria** — `operaria`, `tipo de máquina`, `nivel` (1 aprende, 2 hace, 3 referente),
   `eficiencia %` opcional. Es lo que permite que la sugerencia respete quién sabe qué.
5. **Secuencia de operaciones** — `categoría`, `operación`, `orden`. Es la hoja de 595 operaciones que producción está
   llenando. Mientras no llegue, el orden queda por sección y marcado como provisional, como hoy.
6. **Asignación guardada** — `módulo`, `hoja o referencia`, `puesto`, `operación`, `operaria`, `quién`, `cuándo`. Sin
   esto, cada vez que se abre la pantalla el balanceo se vuelve a calcular y se pierde el criterio del ingeniero.

## 4 · Valores de negocio que hoy están en el código

- **Tolerancia 1.02** del reparto por puestos: un puesto puede pasarse un 2 % del ritmo. Debe ser un parámetro
  (`tolPuesto`), visible y editable, como la tolerancia de los baños.
- **El 1.02 también aparece** en los semáforos de carga por día y por módulo de las pantallas de centro: el mismo
  parámetro debería servir para los tres, o hay que decidir que son dos cosas distintas.
- **Eficiencia del módulo**: hoy sale del recurso y se usa como `60 × eficiencia` para los minutos por hora. Está bien
  donde está, pero conviene que la pantalla diga de dónde sale.
- **Nivel mínimo de especialidad** para que la sugerencia asigne una operación a una operaria: parámetro nuevo.

## 5 · Diseño de pantallas

**A · Vista de módulos (entrada).** Una tarjeta por módulo con personas, máquinas registradas, referencia en curso,
salida esperada por hora y porcentaje del cuello. La maquila aparte. Clic en un módulo abre su balanceo. Es el mismo
componente de tarjetas que ya usa Confección por módulo, para no duplicar.

**B · Hoja de operaciones de la referencia.** Tabla por sección: número de orden, operación, tipo de máquina y minutos
por prenda, con el total, el ritmo y la producción esperada. Si la secuencia no está cargada, se muestra por sección y
con el aviso de provisional que ya existe. Permite el ajuste de tiempo por referencia que hoy ya funciona, con su
motivo y su auditoría.

**C · Asignación manual a puestos.** Dos columnas: a la izquierda, las operaciones sin asignar, agrupadas por tipo de
máquina; a la derecha, un puesto por operaria, con su nombre, la máquina que tiene y su especialidad. Se arrastra una
operación al puesto, igual que hoy se arrastra en la cola del centro. Cada puesto muestra sus minutos y su porcentaje
contra el takt, en verde, ámbar o rojo. Botón **«sugerir»** que propone un reparto como punto de partida, respetando
tipo de máquina y especialidad, y que **nunca se aplica solo**: deja la propuesta al lado para aceptarla, cambiarla o
descartarla. Botón para guardar la asignación con quién y cuándo.

**D · Carga por puesto y cuellos.** Barra por puesto contra el takt, con el cuello marcado y la salida real que permite.
Al cambiar personas o referencia, se recalcula el takt y se marcan los puestos que quedaron fuera de rango, sin borrar
la asignación hecha a mano.

**E · Impresión por operaria.** Una hoja por puesto: nombre de la operaria, módulo, referencia, foto de la prenda, las
operaciones que le tocan con su orden y minutos, la máquina, y el objetivo por hora. Sin datos internos, como el PDF del
programa por centro que ya existe.

## 6 · Relación con lo que ya se hizo, para no duplicar

- **Confección por módulo** (pantalla de centro) responde «qué hay programado en cada módulo esta semana». El balanceo
  responde «cómo reparto las operaciones dentro del módulo». No se pisan: el balanceo se abre desde la tarjeta del
  módulo.
- **Costura: secuencia y rebalanceo** sigue siendo mover órdenes entre módulos. El balanceo no mueve órdenes.
- **Mi centro y tallas**: la tablet registra lo hecho, por talla. El balanceo no registra producción; sí puede usar lo
  registrado para comparar la salida real contra la esperada, leyendo lo que ya existe.
- **El motor no se toca**: el balanceo es interno del módulo y no cambia fechas ni asignación de órdenes.

## 7 · Orden de construcción por etapas

**Etapa 1, sin la hoja de secuencia** (se puede empezar ya):
1. Tabla de tipos de máquina con alias, para normalizar las 27 variantes.
2. Registrar las máquinas de cada módulo.
3. Tabla de operarias y especialidades.
4. Mover la tolerancia 1.02 y el nivel mínimo de especialidad a parámetros.
5. Vista de módulos con personas, máquinas y referencia en curso.

**Etapa 2, con lo anterior cargado**:
6. Asignación manual a puestos con arrastre, guardada con quién y cuándo.
7. Carga por puesto, cuello y recálculo al cambiar personas.
8. Impresión por operaria.

**Etapa 3, cuando llegue la hoja de 595 operaciones con su orden**:
9. Secuencia real por prenda en lugar del orden por sección.
10. Sugerencia automática como punto de partida, respetando secuencia, máquina y especialidad.
11. Comparación de salida real contra esperada usando lo que registra el piso.

## 8 · Decisiones que necesito de ti

1. ¿La asignación se guarda **por módulo y referencia** o **por módulo y hoja de operaciones**? Con referencia es más
   preciso y más trabajo; con hoja se reutiliza entre órdenes parecidas.
2. ¿Cargas tú la lista de **operarias por módulo** con sus especialidades, o empezamos con puestos numerados sin nombre?
3. ¿Qué **niveles de especialidad** quieres: los tres que propongo, o solo sabe y no sabe?
4. ¿La **tolerancia** del puesto es la misma que el 2 % de los semáforos de carga, o son dos parámetros distintos?
5. ¿Los nombres con sufijo **TP** son máquinas distintas o la misma máquina en otra planta?
6. ¿Quién puede **guardar** una asignación: solo el ingeniero de planta, o también la supervisora del módulo?
7. ¿Empezamos por la etapa 1 ahora, o esperamos a que llegue la hoja con el orden de las operaciones?
