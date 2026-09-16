# Nivelación de carga — Paso 1, correcciones

**16-sep-2026 · commit `dce7921`.** Los siete puntos, en orden. Harness verde: **1.833 checks, 0 fallos,
0 errores**. Sigo sin pasar al Paso 2.

---

## 1 · Días hábiles: una sola convención

**Tenías razón: el ejemplo estaba mal.** El cuadrito usaba `dsumLab`, que cuenta *n días hábiles
DESPUÉS* del inicio, así que el día de inicio no contaba y todo salía corrido un día.

Ahora hay **una convención escrita y una sola**:

> **El día de inicio cuenta como día 1 y el compromiso es el último día disponible (los dos inclusive).**

- `finLabInc(inicio, n)` — el n-ésimo día hábil contando el inicio como día 1.
- `diasHabilesInc(a, b)` — los hábiles del tramo, los dos extremos incluidos.
- Las dos concuerdan: contar hasta el día N devuelve exactamente N (probado para N = 1…20).

**El ejemplo de corte corregido: 5 días desde el 17-sep terminan el 23-sep** (antes decía 24).

| | Antes | Ahora |
|---|---|---|
| 5 días hábiles desde el 17-sep | 24-sep | **23-sep** |

**`dsumLab` no se tocó** y no usa esta convención a propósito: es un **plazo** («n días hábiles
después de»), que es el lead time del proveedor dentro del motor. Son dos cosas distintas y mezclarlas
sería el error de vuelta. Hay una prueba que fija las dos semánticas por separado.

### Días disponibles 17-sep → 15-oct

**21 días hábiles.** Se descontaron **8 días, todos fines de semana**:

`19-sep · 20-sep · 26-sep · 27-sep · 3-oct · 4-oct · 10-oct · 11-oct`

**El 9-oct NO está cargado.** Y no es que falte solo ese: **la tabla de excepciones está vacía — 0
excepciones en todo el sistema**. En septiembre, octubre, noviembre y diciembre **no hay ni un festivo
cargado**, así que hoy la nivelación solo descuenta sábados y domingos.

Eso no se rellena solo. Aparece como aviso en tres lugares:
- en el cuadrito: `calendario · sin festivos cargados para 2026-09, 2026-10…`;
- en el tooltip de los tres pasos que dependen del calendario;
- en **Configuración → Nivelación de carga**, con enlace directo a cargar las excepciones.

### El tooltip que pediste

Al pasar el cursor por **Días necesarios**, **Fecha final** y **Días disponibles** sale la cuenta
completa. Textual, del sistema:

> el día de inicio cuenta como día 1 y el compromiso es el último día disponible (los dos inclusive).
> jue, 17 sept → jue, 31 dic: 76 hábiles, 30 no hábiles descontados · ninguna excepción cargada en el
> tramo · SIN FESTIVOS CARGADOS para 2026-09, 2026-10, 2026-11, 2026-12

Y bajo la fila de días disponibles se listan los primeros seis días descontados, con el resto contado.

---

## 2 · «Sin SAM»: cada cifra dice su alcance

Las dos cifras eran correctas pero medían cosas distintas y no lo decían. Ahora el cuadrito escribe
las dos, rotuladas, con el horizonte a la vista:

> **sin SAM** · 10 unidades en N órdenes **en este horizonte** (2026-09, 2026-10, 2026-11, 2026-12) no
> tienen minutos por prenda · 2.179 u en 12 órdenes **en todo el saldo** (todos los meses). **No se
> suman como cero** ni se descartan.

Hay una prueba que exige que el saldo del horizonte nunca sea mayor que el total.

---

## 3 · El compromiso: 15-oct salió de mi script, no de los datos

**El 15-oct lo puse yo en el script de prueba para poder enseñar el cálculo completo.** No hay ningún
compromiso cargado en el sistema y **no hay valor por defecto**. Comprobado con una prueba:

- sin nada guardado, `nivFecha(...,'compromiso')` viene vacío;
- el cuadrito marca **`dato faltante`** y lo pone en la lista de faltantes;
- **días disponibles, alcanzable, rezago y «cabe» quedan en `null`, no en 0**.

En este reporte, cada cifra que use una fecha dice explícitamente que es de prueba.

---

## 4 · Corrida con horizonte sep–dic

Volcado real. Horizonte **2026-09 a 2026-12**. Inicio **17-sep** (día hábil siguiente a hoy),
compromiso de prueba **31-dic-2026** → **76 días hábiles** (30 no hábiles, todos fines de semana).

### Corte

| Paso | Minutos | Unidades |
|---|---:|---:|
| Saldo por procesar | **88.918,55** | **152.047** |
| = Saldo neto (sin maquila) | 88.918,55 | 152.047 |
| Capacidad diaria | **3.264 /día** (1 recurso) | ≈5.582 /día |
| Días necesarios | **28** | |
| 17-sep → **26-oct** | | |
| Días disponibles | **76** | |
| Alcanzable | **248.064** | ≈424.176 |
| **Rezago** | **0 → cabe** | holgura **+48 días** |
| Meta diaria | 1.169,98 | ≈2.001 |

SAM ponderado **0,5848** · 394 órdenes · sin SAM: **10 órdenes / 2.115 u en el horizonte**, 12 / 2.179 en todo el saldo.

### Confección (global)

| Paso | Minutos | Unidades |
|---|---:|---:|
| Saldo por procesar | **2.413.039,82** | **158.689** |
| Capacidad diaria | **62.016 /día** (12 recursos) | ≈4.078 /día |
| Días necesarios | **39** | |
| 17-sep → **10-nov** | | |
| Días disponibles | **76** | |
| Alcanzable | **4.713.216** | ≈309.955 |
| **Rezago** | **0 → cabe** | holgura **+37 días** |
| Meta diaria | 31.750,52 | ≈2.088 |

SAM ponderado **15,2061** · 423 órdenes · sin SAM: **12 / 2.363 u en el horizonte**, 14 / 2.427 en todo el saldo.

### Grupo de módulos — **este SÍ da rezago, sin forzar nada**

Grupo de prueba con las tres familias de más carga, sobre **Módulo 1 al 100 % + Módulo 2 al 50 %**:

- Capacidad: 4.896 × 100 % + 4.896 × 50 % = **7.344 min/día**
- Familias: **CAMISETAS** (1.128.903 min / 83.846 u) · **SHORT PLANOS** (606.229 / 26.235) · **POLOS** (593.270 / 43.336)

| Paso | Minutos | Unidades |
|---|---:|---:|
| Saldo por procesar | **2.328.401,39** | **153.417** |
| Capacidad diaria | **7.344 /día** | ≈484 /día |
| Días necesarios | **318** | |
| 17-sep → **6-dic-2027** | | |
| Días disponibles | **76** | |
| Alcanzable | **558.144** | ≈36.776 |
| **Rezago** | **1.770.257,39** | **≈116.641 u** → **NO cabe** |
| Meta diaria para cumplir | 30.636,86 | ≈2.019 |
| Holgura | **−242 días** | |

SAM ponderado **15,1769** · 380 órdenes · ninguna sin SAM.

> Ojo con leer esto como un diagnóstico de planta: el grupo de prueba carga **tres familias enteras
> sobre 1,5 módulos**, cuando confección global tiene 12 recursos. El rezago es real para *ese reparto*,
> y es exactamente lo que la herramienta debe dejar ver antes de repartir en serio.

### El rezago desplegado

La lista arranca agrupada por **tipo de producto** y **fase**, con la orden como fila (foto, WH, fase,
cliente, categoría, pendientes, SAM, minutos, entrega), usando `filasGRP` + `whCell`.

**Por tipo de producto** (13 grupos):

| Tipo de producto | Unidades | Minutos |
|---|---:|---:|
| CAMISETAS / Camiseta CR | 58.218 | 783.847 |
| POLOS / Polo Basica | 42.246 | 578.348 |
| SHORT PLANOS / Short Basico | 16.909 | 325.803 |
| SHORT PLANOS / Short Cargo | 9.291 | 279.752 |
| CAMISETAS / Camiseta CV | 15.379 | 207.063 |
| CAMISETAS / Level 2 | 5.660 | 76.206 |
| CAMISETAS / Level 1 | 2.455 | 33.054 |
| POLOS / Polo Moda | 1.090 | 14.922 |
| CAMISETAS / Camiseta Corte Moda | 1.096 | 14.757 |
| CAMISETAS / BasicaCrop | 599 | 8.065 |
| CAMISETAS / Fashion Graphics | 397 | 5.345 |
| SHORT PLANOS / Short Moda | 35 | 674 |
| CAMISETAS / Camiseta Bolsillo | 42 | 565 |

**Por fase** — esto es lo que muestra que el saldo **no** es la carga del centro: de 380 órdenes, solo
**3 están en `7Confección`**. Las demás vienen de atrás:

| Fase | Órdenes | Unidades |
|---|---:|---:|
| 0Adquisición | 104 | 65.602 |
| 0Recetas Insumos | 70 | 21.409 |
| 1Tejeduria | 40 | 10.670 |
| 0Diseño | 14 | 7.701 |
| 1Tintoreria | 20 | 6.459 |
| 4CD Ensamble | 16 | 6.056 |
| 3CD CORTE | 20 | 4.618 |
| 1INCOMPLETOS TIN | 9 | 4.133 |
| 1CD Tintoreria | 11 | 3.906 |
| 6Bordado | 16 | 3.663 |
| 4Preparacion Insumos | 14 | 3.311 |
| 3Trazos | 7 | 3.197 |
| 4Corte Planta | 6 | 3.117 |
| 2Planificacion | 10 | 2.401 |
| 0Macro | 8 | 2.349 |
| 3AEROPUERTO | 5 | 2.244 |
| 6 Etiquetado | 3 | 1.180 |
| 7Confección | **3** | 505 |
| 6 CD BORDADO · 0Reproceso diseño · 7Pulido · 6Serigrafia | 4 | 896 |

### Los dos what-if

**a) Bajar la capacidad** (grupo de módulos, 7.344 → **18.382** min/día, el 60 % de lo que haría falta):
alcanzable 1.397.032 · **rezago 931.369,39 min** · días necesarios 127 contra 76 · **holgura −51**.

**b) Adelantar el compromiso** (**corte**, que cabía con +48 días de holgura): compromiso 31-dic →
**6-oct** · días disponibles 76 → **14** · alcanzable 45.696 · **rezago 43.222,55 min** ·
holgura **−14**. Pasa de «cabe» a «no cabe» sin tocar el saldo ni la capacidad.

Pruebas que lo fijan: el rezago es exactamente `neto − alcanzable`, y la holgura es negativa cuando no cabe.

---

## 5 · Configuración (adelantado del Paso 2)

Pestaña nueva **Configuración → Nivelación de carga**. Solo tablas y validaciones, **sin vistas**.

**Grupos de módulos** — nace vacía. Columnas: grupo, módulos con su %, familias, capacidad de hoy,
estado, acciones.

- Cada grupo nace **«sugerido»**, venga del botón «sugerir desde la polivalencia» o de la mano.
- **Confirmar** pide confirmación explícita y guarda **responsable y fecha**; la tabla los muestra.
- **Cambiar un grupo confirmado lo devuelve a «sugerido»**: nada confirmado cambia a escondidas.
- «Volver a sugerido» existe y no pierde nada de lo escrito.
- Sin el permiso `programa` no se confirma ni se edita.

**Validaciones:**

| Situación | Trato |
|---|---|
| Un módulo repartido a más del 100 % entre todos los grupos | **error visible** |
| La misma familia en dos grupos (su saldo se contaría dos veces) | **error visible** |
| Un grupo sin módulos o sin familias | **error**, y no deja confirmar |
| Una familia que no está en ningún grupo | **aviso** plegado (hoy: 8 familias) |

**Tela por entregar** — los dos parámetros, juntos:

- **Días hábiles del promedio real** (N, hoy 10).
- **Valor planificado (u/día)**: si lo pones, manda sobre el real; **vacío = usar el promedio real**;
  **0 es 0**, no se reemplaza.
- Debajo, el real medido y, si no alcanza, `sin avance suficiente: X de N días con registro` — **no se
  calcula un promedio con menos de la mitad de los días**.
- Dice explícitamente que la tela va **en unidades, sin convertir horas ni kilos**.

**Días hábiles** — un panel que escribe la convención y avisa de los meses sin festivos cargados, con
enlace a Calendario.

---

## 6 · Usuarios con permiso `programa` — **no pude, y el motivo importa**

Corrí la consulta de solo lectura que autorizaste, contra `perfiles`:

```
GET /rest/v1/perfiles?select=*   →  200 OK, []
```

**Devuelve vacío, no un error.** La clave pública (`anon`) no puede leer **ninguna** tabla sin sesión
iniciada: probé también `params`, `ordenes` y `centros` y las cuatro dan **0 filas**. Es el RLS del
proyecto haciendo su trabajo — la app solo lee después de que alguien entra con su usuario.

Para leerla haría falta entrar con una cuenta real, y **no entro a producción con tu cuenta**. Dos
caminos, los dos tuyos:

**a) Tú, en el editor SQL de Supabase** (es solo lectura, no cambia nada):

```sql
select p.rol, p.correo, p.nombre, p.area, p.modo
from perfiles p
where p.rol in ('admin','planificacion')
order by p.rol, p.correo;
```

Si el correo no está en `perfiles` sino en `auth.users`:

```sql
select p.rol, u.email, p.area, p.modo, u.last_sign_in_at
from perfiles p join auth.users u on u.id = p.id
where p.rol in ('admin','planificacion')
order by p.rol, u.email;
```

**b) Desde la app**, entrando tú: Configuración → Usuarios ya lista rol y correo de cada persona.

Lo que sí está verificado desde acá es la otra mitad: **de los nueve perfiles del catálogo, solo
`admin` (por `*`) y `planificacion` tienen `programa`**. Ningún perfil de piso, centro ni consulta lo
tiene. Lo que falta es saber **qué personas** llevan esos dos roles.

---

## 7 · Categorías sin hoja LMO en el horizonte sep–dic

Para pasar a ingeniería. **19 órdenes distintas**, 6 categorías, todas **sin vínculo a familia LMO**:

| Categoría | Órdenes | Procesos afectados | Corte (u) | Confección (u) | Empaque (u) |
|---|---:|---|---:|---:|---:|
| JOGGER / Jogger Moda | 4 | corte, confección, empaque | 416 | 416 | 472 |
| Fleece Pesado / Crew Moda | 4 | corte, confección, empaque | 406 | 406 | 593 |
| Fleece Basico / Crew | 4 | corte, confección, empaque | 248 | 496 | 496 |
| JOGGER / Jogger | 3 | empaque | — | — | 311 |
| Fleece Pesado / Crew Zip | 2 | corte, confección, empaque | 325 | 325 | 325 |
| TEJIDOS / Camiseta Tejida | 2 | corte, confección, empaque | 720 | 720 | 720 |
| **Total** | **19** | | **2.115** | **2.363** | **2.917** |

Son las mismas familias sin hoja LMO de siempre (JOGGER, Fleece Basico, Fleece Pesado, TEJIDOS). En
cuanto se vinculen o se les cargue el minuto estimado, salen solas del aviso.

> `TEJIDOS / Camiseta Tejida` tiene el minuto estimado de Santiago (4,57) **marcado «pendiente de
> confirmar»**, por eso todavía no cuenta como SAM.

---

## Pruebas

**1.833 checks, 0 fallos, 0 errores.** 47 pruebas nuevas en esta entrega:

- **C1** (17): la convención inclusiva de las dos funciones, que concuerdan entre sí, que una excepción
  cargada descuenta un día y se puede nombrar, que un mes sin excepciones se avisa, que `nivelar` la usa
  de punta a punta, y que **`dsumLab` sigue siendo exclusiva**.
- **C2** (4): el cuadrito trae los dos alcances, el del horizonte nunca supera al total y ambos van rotulados.
- **C3** (4): sin compromiso cargado todo queda en `null` y en pantalla sale «dato faltante».
- **C4** (7): el what-if de capacidad y el de compromiso dan rezago, el rezago es `neto − alcanzable`,
  la holgura se vuelve negativa, y la lista arranca agrupada por tipo de producto y fase.
- **C5** (15): la pestaña existe, la tabla nace vacía, un grupo nace sugerido, no se confirma sin
  módulos ni familias, al confirmar queda responsable y fecha, tocarlo lo devuelve a sugerido, el doble
  conteo es error y las familias sueltas son aviso, y sin el permiso no se confirma.

---

## Sigo esperando

1. **Aprobación para el Paso 2.**
2. La **lista de usuarios** con rol `admin`/`planificacion` (punto 6): la consulta está escrita arriba.
3. **Cargar los festivos** de sep–dic en Configuración → Calendario: hoy la nivelación solo descuenta
   fines de semana porque la tabla de excepciones está vacía.
4. El **minuto de Camiseta Tejida (4,57)**, que sigue pendiente de confirmar.
