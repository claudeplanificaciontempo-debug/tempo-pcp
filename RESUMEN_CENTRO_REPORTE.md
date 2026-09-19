# Resumen del centro — la pantalla simple del bosquejo (18-sep-2026)

Construido sobre el bosquejo de «Mi centro · Corte» (semana, congelado, tres tarjetas, día por día, lista de órdenes
con el visto). Es la pestaña **Resumen** de **todo centro de producción y sub-área** (Corte, Estampado, Etiquetas,
Confección, Botones, Lavado, Plancha, Empaque, Bordado) y **abre por defecto** (también desde «Planta hoy» y desde
`irCentro`). Las pestañas Planificación, Programación del centro y Ejecución siguen intactas para el detalle.

Capturas: `capturas/resumen_corte.png` (Corte, semana en curso), `capturas/resumen_confeccion.png` (Confección,
resumen general con los botoncitos), `capturas/resumen_confeccion_modulo.png` (Confección con un módulo elegido),
`capturas/resumen_corte_espera.png` (pestaña En espera). Modos del driver `?captura=res1 | res2 | res2m | res1e` (+ `n`
= semana siguiente, la primera con carga en el volcado).

## Qué hay en la pantalla (de arriba abajo) y de dónde sale cada número

| Bloque | Qué muestra | De dónde sale (nada nuevo) |
|---|---|---|
| Cabecera | «Semana 39 · lun 21 sept al vie 25 sept · **hoy sáb 19 sept**» | `semanaISO`, días laborables de los recursos (`labR`), `hoy()` |
| Aviso de congelado | ámbar «El plan de esta semana no está congelado» + botón; verde «Plan de la semana congelado el … por …» | `congeladoDe(c,lun)` (el congelado semanal de siempre) |
| Botón | **Congelar el programa** (planificación, `congelarPrograma`) o **Pedir congelamiento** (supervisor) | nuevo `pedirCongelamiento` (ver abajo) |
| Botoncitos de módulo | solo en centros con 2+ recursos: «Todo Confección · Módulo 1 … Módulo 11 · Maquila (externa)» (maquila al final, borde punteado) | recursos activos del centro; `CEN.rec` filtra todo lo de abajo |
| ¿Cómo voy en la semana? | hechas **de** programadas, %, barra roja y marca ▲ «Al cierre de ayer debías llevar N» | `datosDiaCentro` por día (carga del motor y `hechasDelDia`); ▲ = carga de los días ya pasados |
| Órdenes atrasadas | órdenes **listas** cuyo fin programado en este centro ya pasó y siguen abiertas | `estadoListaCentro` (paso.fin < hoy) |
| Días sin registrar avance | días laborables pasados **con carga** y sin registro alguno, nombrados | `datosDiaCentro.reg` (= `hayRegistroEn`: talla, tramo, turno o paro) |
| Día por día | barra planeado (gris) y hecho (azul) por día; nota «Faltaron N» / «Sin registro de avance» / «En curso · faltan N» / «Programado» / «Sin carga»; tocar un día filtra la lista | `datosDiaCentro`, `togDiaCEN` + `filaEnDiaCEN` (los mismos de Planificación) |
| Listas para <centro> N · En espera N | pestañas con conteo | `listasYEspera` = `colaCentro` partida en dos |
| Tabla | # · Orden (**foto + WH + fase**, `whCell`) · Producto y cliente · Color · Prendas hechas de pedidas con barra · Debía salir · Estado · **visto verde** | `whCell`, `estadoListaCentro`, `llegadaHTML`, `marcarHechoCentro` |
| Ver las N restantes | primero `prm('filasResumenCentro',8)` filas, luego todas | parámetro (editable; sin valor en código) |
| Detalle por sub-área | plegado, solo en Terminados / Estampado | `resumenSubCentrosHTML` |
| Sin fecha todavía | plegado, solo para quien ve sin fecha | igual que Planificación |

## Cómo se ordenan las órdenes (lo que pediste: primero lo listo, luego lo que viene)

- **Listas** = las que **ya pueden trabajarse**: el paso anterior terminó (grupo *Disponible* de la cercanía; en el
  primer centro, tela lista) **o** alguien les puso puesto a mano. Orden: **puesto manual → atrasadas (fin programado
  ya pasado, la más vieja primero) → para hoy → mañana / en N días → sin programar → entrega**.
- **En espera** = todo lo demás, **en el orden de la cola**: Por llegar (por fase, la más cercana primero) → Todo lo
  que viene → Revisar ruta → Ya salió de aquí. El estado dice cuándo llegan («en 3 días hábiles», «sin dato de
  llegada») y el grupo. **Sin visto**: todavía no llegan.
- El **visto verde** (columna Liberar) es el «✓ hecho» de siempre (`marcarHechoCentro`): abre el registro de prendas y
  la orden queda libre para el siguiente centro. Solo lo ve quien registra en ese centro (`regHechoOk`).
- Tocar la fila abre la ficha de la orden (`abrirFichaOrden`); la fase es clicable como en toda pantalla.

## Confección: módulos y maquila

Los botoncitos salen de los **recursos activos del centro** (hoy 11 módulos + Maquila (externa)); no hay lista en
código, así que un módulo nuevo en Configuración aparece solo. «Todo Confección» es el resumen general; al elegir un
módulo, las tres tarjetas, el día por día y la lista se acotan a **su** carga (recurso fijado por el centro en la cola o,
si no, el que el motor le dio). Las órdenes sin recurso se ven en «Todo». `datosDiaCentro` ganó un quinto parámetro
opcional `rec`; sin él, sigue contando todo el centro (las otras pantallas no cambian; probado).

## Pedir congelamiento (nuevo, pequeño)

El supervisor no puede congelar (`congelarPrograma` exige `programa`). «Pedir congelamiento» deja **una línea en la
bitácora** (`k:'pedirCongelar'`, centro, semana, quién) — la única tabla que el piso escribe — y planificación la ve en
**Hoy → Pendientes** («Pedidos de congelamiento del programa semanal»). No hay «marcar atendido»: el pedido se cierra
solo cuando existe un congelado de esa semana en ese centro. Pedirlo dos veces no duplica.

## Medido en el volcado real (semana 21–25 sept, la primera con carga)

- Corte: cola 72 → **Listas 30 · En espera 42** (39 Todo lo que viene + 3 Ya salió); 9.076 prendas programadas
  (4.734 lun · 3.940 mar · 402 vie).
- Confección: cola 76 → **Listas 4 · En espera 72**; Módulo 1: 144 prendas el lunes, 2 en espera.
- Semana en curso (14–20 sept): sin carga en ningún centro (el motor arranca el 21); la tarjeta lo dice
  («nada programado esta semana», «Ningún día pasado tenía carga programada») en vez de inventar «sin registros».

## Lo que NO se tocó

`programar()` y `nivelar()` no cambian. La cola de «Programación del centro» sigue igual (misma partición
Disponible → Por llegar → resto). Sin fotos en el volcado de prueba, `whCell` muestra solo WH + fase; con fotos cargadas
salen a 40 px.

## Pruebas (bloque RC, en `test/driver.js`)

RC1 pestaña por defecto · RC2 Listas + En espera = la cola sin repetir ni perder, criterio de cada lado, orden por
urgencia, orden de la cola en espera, conteos de las pestañas, N filas + «Ver las restantes», columnas de la fila, sin
visto en espera · RC3 `estadoListaCentro` (atrasada con `habilesDesde`, para hoy, futuro, sin programar) y el orden de
urgencia · RC4 el visto abre `marcarHechoCentro` para esa orden y no aparece a quien no registra · RC5 tarjetas y día
por día = `datosDiaCentro`, filtro por día, rama «sin registro» forzada sin tocar datos, ▲ debía llevar, sin carga no
inventa «sin registros» · RC6 botoncitos = recursos + maquila al final, Corte sin botoncitos, filtro por módulo en lista
y tarjetas, `datosDiaCentro` con y sin recurso · RC7 congelado: aviso, botón por perfil, pedido en bitácora, sin
duplicar, en Hoy → Pendientes, se cierra al congelar · RC8 sub-áreas y cabecera · GUARDIA: la pantalla usa las
funciones de siempre. Se corrigió además una prueba (PT) que solo pasaba en días de semana y la A1 ahora espera Resumen.
