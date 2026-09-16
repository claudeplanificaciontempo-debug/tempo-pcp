# Kg reales con la regla apagada · y chequeo de las siembras

**Commit:** `36297c4` · **Harness:** 1.686 pruebas verdes, sin errores.

---

## 1 · Tu pregunta: **sí**

**Con la regla apagada, el motor ya usa los kg reales de las filas marcadas como tejidas.**

Son dos cosas separadas, y me di cuenta de que no lo había dicho con claridad:

| | Qué decide | ¿Depende del interruptor? |
| --- | --- | --- |
| **Qué filas entran** al motor | `tejCuentaComoLista(p)` | **sí** — es lo que enciende el interruptor |
| **Cuántos kilos aporta cada fila** | `kgDeFilaTej(p)` | **no** — una fila tejida siempre da sus kilos reales |

Es lo correcto conceptualmente — un kilo medido es un hecho, no un compromiso — pero tiene una consecuencia
que hay que tener presente:

> **Marcar una fila como tejida con kilos distintos a los programados puede mover la fecha de tela lista de
> las órdenes que esperaban esa tela, aunque la regla esté apagada.**

Si se tejió **menos** de lo programado, esa tela alcanza para menos órdenes y alguna se retrasa. Si se tejió
**más**, alguna puede adelantarse.

---

## 2 · El panel ahora lo muestra, separado

En **Tejeduría → «Tejido sin confirmar»** hay ahora **dos efectos distintos**, rotulados como tales:

### Arriba — **«ya aplicado»**, con la regla apagada

```
┌─ ya aplicado · Los kilos reales ya están moviendo fechas ────────────────┐
│ Una fila marcada como tejida aporta sus kilos reales, no los programados,│
│ esté la regla encendida o no: es un hecho medido.                        │
│                                                                          │
│  3 filas con kilos distintos a los programados       −180 kg             │
│  7 órdenes que YA cambiaron su fecha de tela lista por eso               │
│                                                                          │
│  OP            Con los kg programados   Con los reales   Días            │
│  WH/MO/29136   mar 22 sept              vie 25 sept       +3             │
└──────────────────────────────────────────────────────────────────────────┘
```

### Abajo — **«si enciendes la regla»**

El otro efecto, el de dejar de contar lo programado sin confirmar, con su propia lista de órdenes y su
interruptor. El rótulo dice explícitamente *«efecto distinto del de arriba»*.

**Cómo se mide:** corriendo el motor dos veces, con los kilos reales y como si fueran los programados, y
comparando la fecha de tela lista de cada orden. La medición **no deja nada cambiado** — hay una prueba que lo
verifica.

---

## 3 · Chequeo de las siembras, en Reportería

Panel nuevo **«Siembras pendientes de la puesta al día»** en Reportería por área:

| Corrección | Estado | Esperado | Encontrado | Cuándo |
| --- | --- | --- | --- | --- |
| JEANS → DENIM | aplicada | 13 órdenes · 3 categorías · 49 operaciones | familia DENIM presente · 13 órdenes bajo DENIM | 17 sept 08:14 |
| Rutas corregidas para terminar en Empaque | aplicada | 326 rutas (326 completadas, 0 reordenadas) | 447 de 469 terminan en Empaque · quedan 22 | 17 sept 08:14 |
| Ruta por defecto (familias sin hoja) | aplicada | 22 órdenes · 22 sin minuto estimado | 22 con ruta por defecto · faltan 0 | 17 sept 08:14 |

**Lo «esperado» no es un número que yo escribí**: cada siembra guarda lo que midió **antes de tocar nada**, y
el panel lo compara con lo que se ve ahora. Así, si una siembra corre sobre datos distintos a los del volcado
que yo medí, el chequeo sigue siendo válido.

**Tres estados posibles:**

- **aplicada** — corrió y lo encontrado cuadra
- **pendiente** — todavía no corrió (se aplica al abrir la app; si sigue así tras recargar, avísame)
- **revisar** — corrió pero lo encontrado no cuadra, con la explicación de qué no cuadra

Hay pruebas para los tres casos, incluida la de que una siembra borrada a mano sale como pendiente.

---

## Archivos tocados

| Archivo | Qué cambió |
| --- | --- |
| `index.html` | `kgDeFilaTej`/`TEJ_KG_MODO`/`efectoKgReales`; el motor toma los kilos por esa función; `tejEstrictoPanelHTML` separa los dos efectos; `chequeoSiembras`/`chequeoSiembrasHTML` en Reportería por área |
| `test/driver.js` | 19 pruebas nuevas |
| `KG_REALES_Y_CHEQUEO.md` | este reporte |

---

## Qué esperar en tu próxima apertura

1. Corren las siembras: **JEANS → DENIM**, las **326 rutas** y las **22 rutas por defecto**.
2. Entras a **Reportería por área** y el panel «Siembras pendientes» debe mostrar las tres en **aplicada**.
3. Si alguna sale **pendiente** o **revisar**, el panel dice qué pasó y me avisas.

## Brechas

1. **La regla de tejeduría sigue apagada.** Los kilos reales ya pesan, pero lo programado sin confirmar aún
   cuenta como tela lista.
2. **Las 22 seguirán con carga 0** hasta que se cargue el minuto estimado de sus categorías.
3. Siguen esperando tu decisión: el **centro de las dos operaciones de BVD y FITS** y los **datos de las
   lavadoras**.
