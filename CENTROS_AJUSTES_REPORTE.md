# Pantallas de centro — los cinco ajustes

**Commit:** `1e34550` · **Harness:** 1.578 pruebas verdes, sin errores.
Aplicado en **todos los centros y sub-centros**, no solo en Corte.

---

## 1 · «Lo que viene» eliminado

Fuera de todos los centros y sub-centros. **También borré sus funciones**
(`loQueVieneDe`, `loQueVieneHTML`): dejarlas sin uso habría sido código muerto. Hay una prueba que verifica
que ya no existen ni en el código ni en pantalla.

La lista de órdenes **sigue diciendo dónde está cada una**: dentro del centro muestra su estado propio
(«Por cortar», «Cortando», «Cortada») y fuera del centro, dónde está («Textil lista · por liberar a
producción», «En confección»…). Eso no se tocó.

---

## 2 · Agrupador — tabla pantalla por pantalla

Tenías razón: **«Órdenes de la semana» no tenía agrupador**, solo el filtro de fases. Ahora hay cuatro
agrupadores, uno por lista, todos con el componente común:

| Pestaña | Lista | Agrupador | Antes |
| --- | --- | --- | --- |
| **Planificación** | Órdenes de la semana | `cenplan` | **no tenía** |
| **Planificación** | Vienen después | `cenluego` | **no tenía** |
| **Programación del centro** | La cola | `cen` | ya lo tenía |
| **Ejecución y desviaciones** | Desviaciones por orden | `cenejec` | **no tenía** |

Los cuatro ofrecen **Cliente, ODC, Familia, Fase y Tela** (más Tipo de producto, Color, Mes, Próximo paso,
Proyecto y Etapa, que ya venían en el componente).

**Verificado centro por centro y pestaña por pestaña** — 18 combinaciones, todas con agrupador:

| Ítem | Planificación | Programación | Ejecución |
| --- | :---: | :---: | :---: |
| Corte | ✓ | ✓ | ✓ |
| Confección | ✓ | ✓ | ✓ |
| Estampado | ✓ | ✓ | ✓ |
| Bordado | ✓ | ✓ | ✓ |
| Terminados | ✓ | ✓ | ✓ |
| *(sub-área sola)* | ✓ | ✓ | ✓ |

La prueba recorre esa matriz y falla nombrando la pantalla si alguna se queda sin agrupador.

---

## 3 · Tarjetas de los días

Cada tarjeta diaria quedó así:

```
┌──────────────────────────┐
│ lun, 14 sept             │
│ Carga            1.240   │
│ 3.100 / 7.344 min · 42%  │
│ Avance             860   │
│ Pendientes         380   │
└──────────────────────────┘
```

- **Carga** = prendas programadas ese día, y debajo **min programados / min disponibles · %**
- **Avance** = prendas hechas registradas ese día (lo que reportó el piso)
- **Pendientes** = las programadas que faltan

**Al hacer clic**, la lista de órdenes se filtra a **las de ese día con prendas pendientes**. La tarjeta se
marca «filtrando», y arriba de la lista aparece un aviso: *«filtro activo — mostrando solo las órdenes del lun
14 sept con prendas pendientes · quitar el filtro»*. **Clic de nuevo lo quita.** El contador del panel también
lo dice («12 de 47»).

---

## 4 · Una sola marca

La columna Marca muestra **una sola etiqueta**, la más grave:

**meta vencida** > **la orden va tarde** > **este paso va tarde**

Si aplican varias, la etiqueta lleva un **`+1`** y el **tooltip** trae todas con su explicación completa
(«También aplica: este paso va tarde — el paso de Corte tenía que terminar el…»). La marca de **prioridad**
sigue aparte, porque no es un atraso.

**El cálculo no cambió**: sigue saliendo de `diagAtraso()`. Hay una prueba que verifica que las marcas
coinciden con lo que devuelve `diagAtraso` y que llamarlo no altera su resultado. **La línea resumen de causas
arriba de la cola se mantiene.**

---

## 5 · Avance visible para cada ingeniero

La pestaña **Planificación** abre ahora con este panel, antes de todo lo demás:

| Centro | Programadas | Hechas | Pendientes | Cumplimiento | Órdenes atrasadas | Contra lo congelado |
| --- | ---: | ---: | ---: | --- | ---: | --- |
| Corte | 4.820 | 3.110 | 1.710 | ▓▓▓░░ 65 % | 7 | **78 %** de 4.000 |

**Los centros con sub-centros lo muestran por sub-centro**, con la fila de total abajo. Por ejemplo Terminados
trae una fila por Ojales y botones, Lavado, Plancha y Empaque.

Si la semana **no está congelada** en ese centro, la columna dice **«sin congelar»** en vez de inventar un
porcentaje.

**Cada perfil de centro abre directo en su centro:** el de Confección entra en Confección, el de Producto
terminado en su primera sub-área. Un perfil que ve todo (admin, planificación) **no queda atado** a ninguno y
puede navegar libre. Se aplica una sola vez por sesión, así que si el ingeniero cambia de centro a mano, no se
lo devuelve.

---

## Cómo quedó Corte

De arriba a abajo, en la pestaña Planificación:

```
Corte                      [Planificación] [Programación del centro] [Ejecución y desviaciones]
‹  Semana lun, 14 sept – dom, 20 sept  ›     2 recursos · 36.720 min disponibles esta semana
                                             [Reportar novedad]  [Todas las fases ▾]  [Buscar]

┌─ Avance de la semana · Corte ───────────────────────────────────────────────────────┐
│ Centro   Programadas   Hechas   Pendientes   Cumplimiento   Atrasadas   Congelado    │
│ Corte          4.820    3.110        1.710   ▓▓▓░░ 65 %             7   78 % de 4.000│
└─────────────────────────────────────────────────────────────────────────────────────┘

lun 14        mar 15        mié 16        jue 17        vie 18        sáb 19
Carga  1.240  Carga    980  Carga  1.100  Carga  1.500  Carga      0  Carga      0
3.100/7.344   2.450/7.344   2.750/7.344   3.750/7.344   0/7.344       0/0 min
· 42%         · 33%         · 37%         · 51%         · 0%          sin capacidad
Avance   860  Avance   740  Avance   510  Avance  1.000 Avance     0  Avance     0
Pendient 380  Pendient 240  Pendient 590  Pendient  500 Pendient   0  Pendient   0

┌─ Órdenes de la semana  47   4.820 prendas programadas   [Agrupar por ▾][y luego ▾] ─┐
│ OP · fase  Categoría  Color  Prendas  Esta semana  Hechas  Recurso  Inicio  Fin      │
│                                                              Marca      Liberada    │
└─────────────────────────────────────────────────────────────────────────────────────┘

Vienen después · 12 órdenes con inicio posterior      [Agrupar por ▾]
```

*(Los números del ejemplo son ilustrativos: en el simulador Corte no tiene carga esta semana y todo sale en 0,
que es justamente lo que debe mostrar cuando no hay nada programado.)*

---

## Archivos tocados

| Archivo | Qué cambió |
| --- | --- |
| `index.html` | `datosDiaCentro`/`togDiaCEN`/`filaEnDiaCEN`/`tarjetasDiaCENHTML`; `MARCAS_CEN`/`marcasDe`/`marcaCentroUna`; `avanceSemanaCentro`/`avanceSemanaHTML`; `centroDePerfil`/`abrirCentroDelPerfil`; agrupadores `cenplan`, `cenluego` y `cenejec`; `CEN.dia` y `CEN.auto`; **borradas** `loQueVieneDe`/`loQueVieneHTML` |
| `test/driver.js` | 27 pruebas nuevas, entre ellas la matriz de 18 pantallas |
| `CENTROS_AJUSTES_REPORTE.md` | este reporte |

---

## Brechas detectadas

1. **El % contra lo congelado sale «sin congelar» en todos los centros**: todavía nadie ha congelado una
   semana. Es lo correcto — no se inventa un número — pero hasta que planificación congele, esa columna no
   dice nada.
2. **«Avance» depende de que el piso registre.** Si un centro no registra en Mi centro ni en Control de piso,
   su avance sale en 0 aunque estén trabajando, y el cumplimiento se ve mal. No es un error de cálculo.
3. Siguen abiertas: **las 326 rutas por corregir** (esperando tu confirmación), las **22 sin arreglo posible**,
   las **dos operaciones de BVD y FITS**, los **datos de las lavadoras** y la decisión sobre **tejeduría
   manual**.
