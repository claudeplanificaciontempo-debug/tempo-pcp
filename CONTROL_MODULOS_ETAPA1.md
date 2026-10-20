# Control de módulos · etapa 1 (20-oct-2026)

**Decisión de la usuaria:** «vamos con tu etapa 1, si es más ambiciosa, y lo que creas que sí es bueno de la v3 tómalo».
Antes se corrigió el reparto de personas por tiempo (`REPARTO_PERSONAS_POR_TIEMPO.md`), porque la eficiencia de
los módulos sale de esa cuenta.

## Qué se construyó

### 1. Puntos de control en la tablet del módulo (Mi centro → Confección → Módulo N)
- La orden en curso muestra una fila de **puntos de control**: los subprocesos de confección de la secuencia de
  Ingeniería, en su orden fijo — **Subensamble → Ensamble → Pulido** por defecto (`puntosControlCfg`, configurable).
  El último punto es la **salida del módulo**.
- En cada punto intermedio: el total que ya pasó, «de N» (lo que entró al centro para esa orden, `cantCentro`
  menos lo ya hecho), botones − / + / +10 / +25 y el número editable (`setPuntoTramo`, `setPuntoTramoVal`).
  Entre dos puntos se lee cuántas prendas hay **en medio** (WIP = pasaron el anterior y no el siguiente).
- La **salida no se anota dos veces**: es lo que la tablet ya registraba en «Este tramo» (`t.tallas`, por talla).
  Si la orden no tiene curva de tallas, el punto de salida trae sus propios botones y escribe el total
  (`setTallaTramo(…, '(total)')`, la misma clave que usa el FIN).
- Lo registrado vive en el tramo: `t.puntos[k]={u,ts}`, `t.puntosLog[]={k,de,a,ts,u}` y `t.ultMov` (también lo
  tocan `setTallaTramo`/`setTallaTramoVal`). Todo dentro de `avance`, que el piso ya escribe (sin SQL nuevo).
- Si la secuencia de Ingeniería está leída (`IOM.leido==='si'`), solo se muestran los puntos que la referencia
  tiene con operaciones (`puntosControlDe`); la tablet, que no la baja, muestra los configurados.
- Un total que pasa de lo que entró al centro pide confirmación. INICIO, PARO, FIN y la confirmación de unidades
  siguen igual.

### 2. Ingeniería → «Módulos en vivo» (pestaña nueva, `ING_OPS_TABS` `vivo`)
Una tarjeta por módulo de Confección (`modulosPlanta`, los que el perfil ve), con:
- **Eficiencia de hoy** = `eficienciaHoy([modulos], hoy, módulo)`, la misma de Planta en vivo (solo lo cerrado con
  Fin), con el semáforo contra la **meta del módulo** (`metaEficienciaModulo`: la suya o la general).
- Por cada orden en curso: foto, WH, desde cuándo y personas (`calcTramo`), el **flujo** por punto con el WIP en
  medio, **ritmo** real (prendas de la salida ÷ horas trabajadas del tramo) contra el **objetivo** (personas × 60 ÷
  SAM × meta), **fin estimado** (lo que falta al ritmo real; sin salida todavía, al objetivo) y la eficiencia **en
  curso** (salida × SAM ÷ minutos-persona del tramo).
- **Alertas** por regla: paro abierto · sin movimiento más de N minutos (`minSinMovModulo`, 30) · sin SAM de
  confección · ritmo bajo el 85 % del objetivo · prendas acumuladas entre dos puntos (≥ la mitad de lo que entró) ·
  eficiencia de hoy bajo la meta · personas de menos o sin configurar.
- Reloj de la planta y relectura de `avance` cada `segEnVivo` s, compartidos con Planta en vivo (`enVivoActivo()`:
  `refrescarEnVivo` y `envivoReloj` ya no miran solo `page==='envivo'`). Planta en vivo trae el botón
  «Módulos en vivo →».
- Abajo, con permiso `programa`: **Configurar** — qué subprocesos de confección son punto de control
  (`togPuntoControl`), los minutos sin movimiento (`setMinSinMovModulo`) y, en cada tarjeta, la meta de
  eficiencia del módulo (`setMetaEficienciaModulo`; vacía = la general). Todo con bitácora; fila en
  `CONF_CATALOGO` («Módulos en vivo»).

## Qué se tomó de la v3 de la usuaria
El ritmo real, la proyección/fin estimado, la eficiencia de lo que está en curso y la tarjeta por módulo. No se
tomaron: el horario fijo 07:50–16:20 (el sistema usa el del recurso y las ventanas de la tabla 18), la comida por
módulo, el cierre del día ni las dos eficiencias lado a lado (los tiempos de Ingeniería todavía no mandan).

## Qué no cambia
`programar()`; el cierre del paso (`puedeCerrarPaso`); `eficienciaHoy`; INICIO/FIN; la RLS (todo va en `avance`).

## Pendiente (etapas 2 y 3)
- **Paquetes por orden desde Corte** (numerados, prendas por talla) y marcar «pasó el paquete» en vez de escribir
  cantidades; QR opcional en la hoja de corte.
- Puntos de control por referencia desde el balanceo «Módulo real» (hoy: por subproceso, global).
- Más umbrales configurables (ritmo, WIP) y la meta de eficiencia por módulo también en Planta en vivo.
- Modo pantalla (TV) para Módulos en vivo.

## Pruebas
CM1–CM9 en `test/driver.js` (junto a las TS, con órdenes inventadas): puntos por defecto y por centro, registro por
punto con log, la tablet con el WIP y la salida sin curva, los datos del módulo (salida, faltan, ritmo, objetivo,
WIP, fin estimado, en curso), la alerta de sin movimiento con 30 y con 0, la pestaña dibujada con reloj y relectura,
la meta por módulo con bitácora, quitar un punto y Mi centro con los puntos. Comprobadas sobre la página del
simulador (los fixtures con datos de planta no están en este clon).
