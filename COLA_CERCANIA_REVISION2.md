# Cola por cercanía — revisión 2

**16-sep-2026 · commit `4c23f37`.** Harness: **2.059 checks, 0 fallos, 0 errores**.
**El motor no se tocó**: el punto 3 es solo diagnóstico.

---

## 1 · El cero de «Por llegar» en corte: verificado

La regla está cambiada como pediste: **la fase manda sobre la falta de WH.**

```
tela en grupo textil (tejeduría / tintorería / calidad)  → POR LLEGAR, tenga WH o no
sin WH  Y  fase previa a producción                      → LEJANAS
fase previa a producción (con WH)                        → LEJANAS
sin WH, fase ya pasada de «previo a producción»          → POR LLEGAR (nunca «disponible»)
tela lista y sin bloqueo                                 → DISPONIBLE
```

### Desglose de las 84 Lejanas, por fase y por WH

| Fase | Grupo (tabla 5) | Con WH | **Sin WH** | Unidades | Grupo |
|---|---|---:|---:|---:|---|
| `0Diseño` | previo a producción | 0 | **14** | **7.701** | Lejanas |
| `0Recetas Insumos` | previo a producción | 0 | **70** | **21.409** | Lejanas |
| **Total Lejanas** | | **0** | **84** | **29.110** | |

**Las 84 son todas sin WH y todas en fases 0.** **Ninguna está en tejeduría, tintorería ni calidad
textil.** Así que la regla nueva no mueve ni una en este volcado.

### Las 96 Disponibles, para que se vea el cuadro completo

| Fase | Grupo | Órdenes | Unidades |
|---|---|---:|---:|
| `2Planificacion` | planificación | 10 | 2.401 |
| `3AEROPUERTO` | preparación de corte | 6 | 2.394 |
| `3CD CORTE` | preparación de corte | 23 | 4.901 |
| `3Trazos` | preparación de corte | 7 | 3.197 |
| `4CD Ensamble` | corte | 25 | 7.119 |
| `4Corte Planta` | corte | 9 | 3.524 |
| `4Preparacion Insumos` | corte | 16 | 3.493 |
| **Total** | | **96** | **27.029** |

### Conteos antes y después

| Grupo | Antes | Después | Unidades |
|---|---:|---:|---:|
| Disponible | 96 | **96** | 27.029 |
| Por llegar | 0 | **0** | 0 |
| Revisar ruta | 0 | **0** | 0 |
| Lejanas | 84 | **84** | 29.110 |

**El cero de «Por llegar» es real y ahora está explicado:** no hay ni una orden con la tela en el área
textil esperando a corte. O la tela ya está lista (96) o la orden todavía es de diseño (84). No hay
estado intermedio en este volcado.

La regla sí funciona — hay una prueba con un caso construido a propósito que recorre los tres caminos
(con WH y fase de producción → Disponible; sin WH → nunca Disponible; con la tela bloqueada → tampoco).

### Un choque de reglas que tienes que decidir

Al probarlo apareció un caso que tus dos reglas resuelven distinto: **una orden en `1Calidad Tintoreria`
(grupo textil) con `avance.lista` marcado**. La tela ya está aprobada y lista para cortar, pero la fase
sigue siendo textil.

- Por la regla de la **fase**: va a **Por llegar**.
- Por la regla de la **tela lista**: sería **Disponible**.

**Dejé que mande la fase**, porque así lo dijiste («la fase manda»). Pero si calidad ya aprobó y la tela
está lista, en la planta esa orden se puede jalar. **Dime cuál prefieres**: que la fase mande siempre, o
que `avance.lista` gane cuando la tela está explícitamente aprobada.

---

## 2 · Etiquetas y regla de escape: aplicado

### «paso sin tiempo: \<centro\>»

`pasosSinTiempo(o, pendientes, ro)` detecta los pasos de la ruta que el motor **no programa** porque no
tienen minutos. La fila lleva la etiqueta y el tooltip lo explica:

> la ruta pasa por Estampado, pero esa orden no tiene el tiempo por prenda cargado (técnica, puntadas o
> SAM). El motor no programa ese paso y la cercanía SÍ lo cuenta como pendiente: por eso salen más
> pasos de los que parece. **Es un dato que falta, no un error de ruta.**

**Siguen contando como paso pendiente**, como pediste. Las etiquetas que salen en el volcado:

| Etiqueta | Casos |
|---|---:|
| paso sin tiempo: Corte, Bordado, Confección | 49 |
| paso sin tiempo: Corte, Bordado, Confección, Botones | 26 |
| paso sin tiempo: Estampado | 24 |
| paso sin tiempo: Corte, Confección, Botones, Lavado | 14 |
| paso sin tiempo: Lavado | 7 |
| paso sin tiempo: Corte, Confección | 3 |
| paso sin tiempo: Corte, Confección, Lavado | 1 |
| paso sin tiempo: Corte, Estampado, Confección | 1 |
| **revisar ruta** | **1** |

### El caso 18: `WH/MO/28300` — y no es un error de ruta

| | |
|---|---|
| Orden | **WH/MO/28300** · ODC 2719 · CAMISETAS / Camiseta CR |
| Fase | `2Planificacion` |
| Ruta | Corte → Bordado → Confección → Empaque |
| Pasos pendientes | 3 (Corte, Bordado, Confección) |
| Pasos sin tiempo | **ninguno** |
| Lo que programa el motor | corte 17-sep (110 min) · bordado 18-sep (440) · confección 18-sep (2.962) · empaque 18-sep (97) |
| Etiqueta de llegada | **mañana** |

**La causa:** la ruta está bien y **los tres pasos tienen tiempo y están programados** — el motor los
mete todos en **dos días** (17 y 18 de septiembre) porque la orden va comprimida. Tiene 3 pasos
pendientes, pasa el umbral de 2, y aun así el paso anterior termina mañana.

**No es un error de ruta: es la misma tensión entre medir en pasos y etiquetar en días**, solo que sin
la causa del dato faltante. Por eso te lo señalo: **la etiqueta «revisar ruta» mandaría a alguien a
arreglar una ruta que está bien.** Propongo quitarla en este caso y dejar solo el chip **«llega ya»**,
que ya explica lo que pasa. **Dime si lo quito o lo dejo.**

### La regla de escape

Llegada **hoy, mañana o atrasada** saca la orden de Lejanas y la pasa a Por llegar, **conservando su
etiqueta**, con un chip **«llega ya»** cuyo tooltip dice por qué.

| Centro | Lejanas antes | **Lejanas ahora** | Por llegar antes | **Por llegar ahora** |
|---|---:|---:|---:|---:|
| **Botones** | 48 | **44** | 39 | **43** |
| **Empaque** | 160 | **146** | 82 | **96** |
| Corte | 84 | 84 | 0 | 0 |

**18 órdenes salieron del grupo colapsado** y ya no se esconden.

---

## 3 · El motor: diagnóstico (sin tocar nada)

### a) Órdenes abiertas con pasos de ruta sin minutos

| Centro | Órdenes | Unidades | ¿El motor lo programa? |
|---|---:|---:|---|
| **Estampado** | **57** | 9.336 | **0 de 57**: desaparece del programa |
| **Lavado** | **38** | 10.941 | **0 de 38** |
| **Empaque** | **22** | 3.125 | **0 de 22** |
| **Confección** | **14** | 2.427 | **0 de 14** |
| **Corte** | **12** | 2.179 | **0 de 12** |
| **Botones** | **2** | 402 | **0 de 2** |
| **Total** | **145 pasos** | | **ninguno se programa** |

Por dato que falta:

| Dato faltante | Pasos |
|---|---:|
| **SAM** (minuto por prenda del centro) | **88** |
| **Técnica** (estampado) | **57** |
| Puntadas (bordado) | 0 |

> El bordado aparece en las etiquetas («Corte, Bordado, Confección») pero no en esta tabla por centro:
> ahí el paso sí tiene puntadas y el que falla es el SAM de corte o confección de la misma orden.

### b) Qué pasaría con la fecha de salida

Medido corriendo el motor con esos 163 pasos a **1 min/prenda** (solo para medir; se devolvió todo como
estaba):

| | |
|---|---:|
| Pasos que hoy no se programan | **163** |
| Órdenes que **cambian de fecha de salida** | **17** |
| Órdenes que **pasarían a ir tarde** | **31** |

Ejemplos del desplazamiento, que no es pequeño:

```
WH/MO/29271: 18-sep → 11-dic
WH/MO/29130: 02-oct → 22-dic
WH/MO/29128: 02-oct → 06-ene
WH/MO/29131: 02-oct → 15-ene
WH/MO/29221: 02-oct → 08-feb
```

**Esto es lo importante del diagnóstico:** hoy el sistema está prometiendo fechas que no tienen en
cuenta el estampado, el lavado ni el empaque de esas órdenes. **31 órdenes que hoy figuran a tiempo
irían tarde** si esos pasos contaran. Y con un minuto por prenda, que es un valor de prueba conservador
—el real del lavado o el estampado será mayor.

### c) Propuesta: que motor y `pasoHecho` usen el mismo criterio

Hoy son dos criterios distintos sobre el mismo paso:

| | Paso de ruta con 0 minutos |
|---|---|
| `programar()` | lo **omite** de `ro.pasos` y programa la orden **como si no pasara por ese centro** |
| `pasoHecho()` | **no** lo da por hecho (mira cierre, OT, fase y unidades) |

**Lo que propongo, sin inventar ningún tiempo:**

1. **El paso se conserva en `ro.pasos`** con `error:'sin tiempo'` — igual que ya se hace con
   `'sin recurso'` o `'sin máquina para la técnica'`. No se le pone duración: se queda **sin `ini` ni
   `fin`**, que es exactamente lo que significa «no se puede programar».
2. **La orden no se da por terminada sin ese paso.** Hoy, al omitirlo, el motor encadena el siguiente
   paso como si el anterior no existiera. Con el paso presente y en error, la orden queda marcada
   **«no se puede programar entera: falta el tiempo de \<centro\>»**, en la misma bandeja que ya usan
   los otros errores de paso.
3. **La fecha de salida deja de ser una promesa falsa:** una orden con un paso sin tiempo **no debería
   mostrar `finPro` como si fuera firme**. Propongo que `finPro` quede marcado **«incompleto»** y que
   esas órdenes salgan en Hoy → Advertencias, no que se les invente una fecha.
4. **`pasoHecho` no cambia.** El que se alinea es el motor, y se alinea hacia **reconocer el paso**, no
   hacia darlo por hecho.
5. **Ningún tiempo por defecto.** Si falta el dato, se dice. Es la misma regla que ya aplicamos en la
   nivelación con el SAM: `null`, nunca 0.

**Riesgo que tienes que pesar antes de aprobarlo:** en cuanto esos 163 pasos entren al programa,
**17 órdenes cambian de fecha y 31 pasan a ir tarde**. No es que empeore la planta: es que el número
de hoy está mal. Pero cambia lo que la gente ve, y conviene avisar antes.

### d) Para ingeniería: categorías sin técnica o sin SAM

**35 combinaciones categoría × centro.** Las 14 de más peso:

| Categoría | Centro | Dato que falta | Órdenes | Unidades |
|---|---|---|---:|---:|
| SHORT PLANOS / Short Cargo | **Lavado** | SAM | **37** | **10.473** |
| CAMISETAS / Level 1 | Estampado | **técnica** | 13 | 2.455 |
| CAMISETAS / Camiseta Corte Moda | Estampado | **técnica** | 8 | 1.328 |
| BVD / BVD | Estampado | **técnica** | 6 | 598 |
| CAMISETAS / Level 2 | Estampado | **técnica** | 5 | 1.115 |
| Fleece Pesado / Crew Moda | Estampado | **técnica** | 4 | 593 |
| Fleece Pesado / Crew Moda | Empaque | SAM | 4 | 593 |
| JOGGER / Jogger Moda | Empaque | SAM | 4 | 472 |
| Fleece Basico / Crew | Confección | SAM | 4 | 496 |
| Fleece Basico / Crew | Empaque | SAM | 4 | 496 |
| TEJIDOS / Camiseta Tejida | Corte | SAM | 4 | 784 |
| TEJIDOS / Camiseta Tejida | Estampado | **técnica** | 4 | 784 |
| TEJIDOS / Camiseta Tejida | Confección | SAM | 4 | 784 |
| TEJIDOS / Camiseta Tejida | Empaque | SAM | 4 | 784 |

**Dos frentes distintos:**

- **El lavado de Short Cargo** es el más grande de todos: **37 órdenes, 10.473 unidades sin minuto por
  prenda**. Encaja con lo que ya sabíamos (lavado sigue `cap:'no'`, solo espera, pendiente de los datos
  de las lavadoras).
- **La técnica de estampado**: 57 órdenes sin técnica cargada, casi todas de CAMISETAS y TEJIDOS.

---

## Esperando tu palabra en tres cosas

1. **El choque fase textil vs `avance.lista`** (punto 1): ¿manda siempre la fase, o gana la tela cuando
   calidad ya la aprobó?
2. **La etiqueta «revisar ruta» de `WH/MO/28300`**: su ruta está bien. ¿La quito y dejo solo «llega ya»?
3. **La propuesta del motor** (punto 3c): si la apruebas, la aplico en un commit aparte y con su propio
   antes/después. **17 órdenes cambian de fecha y 31 pasan a ir tarde.**
