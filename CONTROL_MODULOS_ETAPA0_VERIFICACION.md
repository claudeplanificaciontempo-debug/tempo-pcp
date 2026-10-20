# Control de módulos · etapa 0: verificación con datos reales (20-oct-2026)

**Pedido de la usuaria:** verificar con los datos de planta lo publicado hoy desde otra sesión (que no tenía los fixtures):
el reparto de personas por tiempo (`REPARTO_PERSONAS_POR_TIEMPO.md`) y el control de módulos, etapa 1
(`CONTROL_MODULOS_ETAPA1.md`). Corregir con su prueba lo que falle por esos cambios y reportar lo demás sin tocarlo.

## 1. Simulador completo con los fixtures de planta

**Lo publicado (`5598e94`) con los fixtures:** 4.523 comprobaciones, **10 fallas y 1 error**. Tres son las conocidas de `main`
(SR y las dos RC5, de la semana de los centros: miran los días ya pasados de la semana y fallan los martes también en la
versión de antes). Las otras siete y el error eran de los cambios de hoy: la sesión que los hizo no tenía los fixtures y su
simulador se detenía en 58 comprobaciones, así que nunca llegó a estas pruebas.

| Falla | Causa | Arreglo |
|---|---|---|
| TR y TS (3): «las personas del puesto se reparten…» daban 8 + 8 y 12 + 12 + 12 | las dos pruebas armaban el caso dándole a una copia de cada tramo un FIN una hora en el futuro, mientras las otras seguían abiertas «hasta ahora»: con el reparto por tiempo cada una quedaba sola esa hora | las pruebas ponen el inicio de las órdenes abiertas una hora atrás (siguen abiertas, como en la planta); el texto esperado es el nuevo («se reparten minuto a minuto…») |
| (de paso) recién tocado INICIO | con inicio = ahora no hay tiempo todavía y el reparto devolvía las personas enteras a cada orden | se reparten entre las órdenes del puesto abiertas en ese instante |
| CM4: Módulos en vivo daba salida 0 | la prueba tomaba la primera orden abierta del módulo, que con los fixtures era una de las que TS deja abiertas | la prueba usa un módulo sin otras órdenes abiertas y busca su propia orden |
| IMO1 (2): «cinco pestañas grandes» | Ingeniería tiene ahora seis (Módulos en vivo) | la prueba espera las seis, con su línea «Cada módulo ahora: flujo, ritmo y eficiencia» |
| fase de botones + 1 error: «Agregar operaria» sin su selector | la prueba pulsa los botones de una pantalla en orden; la pestaña nueva, que va al final, cambia de pestaña y los botones que siguen ya no están en pantalla | el botón lee su propio selector (`this.previousElementSibling`) en vez de buscarlo por id |

**Después de los arreglos:** ver el resumen al final.

## 2. Pantallas con el volcado real: igual que antes

Comparé el texto dibujado de **Planta en vivo** y de **Órdenes de trabajo** (las seis pestañas: General, Corte, Estampado,
Bordado, Confección y Terminados) entre la versión de antes de los dos cambios de hoy (`d47e942`) y la publicada (`5598e94`),
con `?captura=audit` (volcado real, catálogo real):

| Pantalla | Antes | Después |
|---|---|---|
| Planta en vivo | 25 filas, 5 tarjetas | igual; la única línea nueva es el botón «Módulos en vivo →» |
| Órdenes de trabajo · General | 193 filas | igual, texto idéntico |
| Corte / Estampado / Bordado / Confección / Terminados | 6 / 31 / 20 / 57 / 82 filas | igual |
| Eficiencia de hoy (`eficienciaHoy`) | sin registros (0 tramos) | igual |

En producción no hay tramos del piso, así que ninguna cifra ya vista se mueve.

## 3. Capturas (en `test/.out/etapa0/`, no se publican)

- `e0_tablet_1366_claro_x.png` — Mi centro → Confección → Módulo 1, después de tocar **INICIO** en una orden de su cola
  (WH/MO/28440, Short Cargo): reloj, FIN y Paro, personas del puesto y los tres puntos de control
  (Subensamble → Ensamble → Pulido · salida) con «de 144» y «en medio».
- `e0_ingops_1366_claro_x.png` y `…_oscuro_x.png` — Ingeniería → Módulos en vivo: el reloj de la planta, una tarjeta por módulo
  (once), la orden en curso en el Módulo 1 con su flujo por punto, ritmo, objetivo, fin estimado y «sin alertas».

## 4. El reparto de personas: lo que no cuadraba y la corrección

Regla pedida: **las órdenes de un puesto suman personas × minutos del puesto**; lo escrito a mano manda; un tramo sin
solapes da lo mismo que antes. La comprobé con órdenes inventadas en el Módulo 1 (10 personas) sobre la versión publicada:

| Caso | Publicado | Debía dar | Después |
|---|---|---|---|
| A 07:50–16:20 y B 15:20–16:20, sin almuerzo | 5.100 | 10 × 510 = 5.100 | 5.100 |
| **Igual con almuerzo 12:30–13:00** | **4.817,6** | 10 × 480 = 4.800 | **4.800** (A 4.500 + B 300) |
| **A 07:50–12:00 y B 11:00–16:20 (B cruza sola el almuerzo)** | **4.828,1** | 10 × 480 = 4.800 | **4.800** (A 2.200 + B 2.600) |
| Tres a la vez (08–12, 09–11, 10–12) | 2.400 | 10 × 240 | 2.400 |
| Una sola orden con almuerzo | 4.800 | 10 × 480 | 4.800 (sin cambio) |
| B con 3 personas a mano | B = 180 | 3 × 60 | B = 180 (manda lo escrito) |

**Qué estaba mal.** `personasRepartidas` promediaba las personas sobre el tiempo **bruto** del tramo y `calcTramo` multiplicaba
ese promedio por el tiempo **trabajado** (sin el almuerzo). Como el almuerzo no cae parejo (A estaba sola a las 12:30), A
quedaba con 17,6 minutos-persona de más: la suma del puesto pasaba de lo que había.

**Qué cambia.** El reparto se integra sobre el tiempo **trabajado** de cada orden: en cada pedazo del tramo se saltan el
descanso del centro (salvo que la orden marcó el almuerzo como paro) y los paros con hora de la propia orden
(`huecosTramo`, `ventanasEn`, la misma regla de horas que `minutosVentana`), y `calcTramo` toma esos minutos-persona
integrados. Un tramo que no se cruza con otro no pasa por aquí: da exactamente lo de antes. Un paro viejo sin hora (solo
minutos) usa la cuenta de antes.

## 5. Para decidir (no se cambió)

**¿Cuando una orden está en paro, su gente queda parada o pasa a las otras órdenes del puesto?** Hoy (y así se dejó) una
orden en paro sigue contando como abierta: si A y B corren de 09:00 a 11:00 y A para de 10:00 a 10:30, en esa media hora A no
suma (está en paro) y B sigue con la mitad de la gente. El puesto suma 1.050 minutos-persona y no 1.200: los 150 son el paro de
A, que no carga a nadie. Si la gente de A pasa a B durante el paro, B debería tener las 10 personas esa media hora (y su
eficiencia bajaría). Es una regla de planta: la decide la usuaria.

## 6. Qué no cambia

`programar()` (prueba HUELLA); INICIO, FIN, Paro y el cierre del paso; lo escrito a mano (`persManual`); un tramo sin solapes.

## Pruebas

**TS-REP2** (junto a TS y TS-REP): cinco casos (con almuerzo, una orden que cruza sola el almuerzo, tres a la vez con almuerzo, un
paro mientras las otras siguen, el almuerzo marcado como paro) comparados contra una cuenta hecha aparte minuto a minuto, la
regla del puesto (sin paros, suman personas × minutos trabajados), una orden sin solape igual que antes y lo escrito a mano.
La prueba falla con la versión publicada (A + B = 4.817,6) y pasa con la corrección.

## Resumen (simulador completo con los fixtures, Chrome headless 1.520 × 1.000)

**4.526 comprobaciones · 3 fallas · 0 errores.** Las 3 fallas son las conocidas de `main` (SR y las dos RC5, de la semana de los
centros; también fallan con lo publicado antes de hoy). Los grupos pedidos, todos sin fallas:

| Grupo | Comprobaciones | Fallan |
|---|---|---|
| HUELLA | 8 | 0 |
| GUARDIA | 9 | 0 |
| GUARDIA FAC | 50 | 0 |
| DISEÑO | 3 | 0 |
| ASP9 | 1 | 0 |
| MAR1 | 27 | 0 |
| TS | 6 | 0 |
| TS-REP | 3 | 0 |
| TS-REP2 (nueva) | 3 | 0 |
| CM1–CM9 | 9 | 0 |
| TR | 16 | 0 |
| IMO1 | 6 | 0 |
