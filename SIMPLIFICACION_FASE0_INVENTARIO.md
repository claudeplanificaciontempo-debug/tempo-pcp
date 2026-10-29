# Simplificación · Fase 0 · Inventario (29-oct-2026, solo lectura)

No se cambió nada del sistema. Todo lo de abajo se midió leyendo la base de producción (consultas de solo lectura), el
`index.html` publicado (a581a32) y el volcado del simulador. Aquí van solo cuentas. El detalle sin nombres está en
`test/.out/simplificacion/` (local, no se publica).

## 1. Lo más importante: casi nadie usa el sistema todavía

| Qué se midió | Desde el 01-oct |
|---|---|
| Cuentas que entraron | **2, las dos de Administración** |
| Cuentas de piso (2 de corte, 1 tablet, 1 de módulos) | **ninguna**: la última entrada fue el 17, 21 y 23 de septiembre |
| Líneas de bitácora | 1.191, **todas de Administración** |
| Cambios en la auditoría | 4.314: 4.307 de rutas, 4 de cierres y 3 de fases |
| Cargas | 2 de tareas, 2 de OT, 2 de fotos, 1 de tiempos y 1 de secuencias de Ingeniería |

**Qué significa:** hoy el sistema lo usa una sola persona, la planificadora. El piso no lo usa: los 25 tramos de trabajo que hay
son de prueba. La bitácora guarda acciones, **no pantallas abiertas**. Por eso «no tiene rastro» quiere decir «nadie hizo nada ahí»,
no «nadie la miró».

**DECIDE:** ¿empezamos a contar las visitas a cada pantalla? Sería un contador por persona y página, sin datos de órdenes. Con eso,
la Fase 4 (portada por rol) se decidiría con números de verdad.

## 2. Uso por función (lo que deja rastro)

| Función | Uso desde el 01-oct | Uso total |
|---|---|---|
| Confirmar y editar rutas (Órdenes → Rutas, ficha, lote) | **4.307 cambios** · 6 lotes · 117 fichas | la más usada |
| Actualizar datos (tareas, OT, fotos) | 6 cargas | — |
| Mover fase a mano | 3 | — |
| Liberación **1 · Tela** (firma textil) | **0** | **0 órdenes, nunca** |
| Liberación **2 · Producción** (firma de bodega) | 16 (15 una por una + 1 lote) | 16 |
| Congelar el plan mensual | 1 | 1 |
| Congelado **semanal** por centro | **0** | **0, nunca** |
| Pedir congelamiento | 0 | 0 |
| Solicitudes de fase desde el piso | **0** | **0, nunca** |
| Cierres de paso (con faltante o sin tiempo) | 4 órdenes | 4 |
| Tramos INICIO/FIN (tablet) | 25, de prueba | 25 |
| Tiempos (SAM que manda, cargar Excel) | ~35 | — |
| Ingeniería (cargar secuencias, máquinas) | 3 | — |
| Configuración: secuencia de fases, horarios, metas | ~15 | — |

## 3. Tamaño

| Medida | Hoy |
|---|---|
| `index.html` | 3,4 MB · 22.334 líneas · 3.039 funciones |
| Entradas del menú | 26 (27 enlaces con Mi centro) |
| Pantallas (`v…`) | 32 · 297 KB |
| Piezas de pantalla (`…HTML`) | 358 · 850 KB |
| Ventanas (`m…`) | 57 · 114 KB |
| Ingeniería (`iom/ibl/ing…`) | 488 funciones · 434 KB (la parte más grande) |
| Configuración: `vConfig` sola | 72 KB, la función más grande del sistema |
| Tablas de Configuración en el catálogo | 70 (16 en Órdenes y fases, 24 en Ingeniería, 10 en Telas, 7 en Calendario, 6 en Planta, 4 en Nivelación, 2 en Respaldo, 1 en Bordado) |
| Siembras (`sembrar…`) | 48 funciones |
| Claves en `S.params` en producción | 166, de las que **52 son marcas de siembra o migración** |
| Páginas viejas redirigidas | 20 |
| Botones con acción (`onclick`) | 865 |

**Tiempo de dibujo con el volcado real** (Chrome, mediana de 5, con el programa ya calculado):

| Pantalla | ms | | Pantalla | ms |
|---|---|---|---|---|
| **Órdenes** | **541** | | Liberación | 151 |
| **Hoy** | **418** | | Entregas | 136 |
| **Órdenes de trabajo** | **320** | | Control de piso | 124 |
| **Tejeduría** | **316** | | Gerencial | 116 |
| Planificar el mes | 258 | | Confección | 114 |
| Tintorería | 208 | | Corte | 100 |
| Producto en proceso / Avance | 103 | | Capacidad / Planta en vivo | 90 |
| Configuración / Ingeniería | 64–66 | | | |

Cuatro pantallas pasan de 300 ms. Esas se memorizan en la Fase 5.

## 4. Propuesta · tú marcas cada línea (DECIDE)

### QUITAR (sin uso y con reemplazo)
1. **Liberación «1 · Tela»**: nadie firmó nunca. La tela la libera la fase de Odoo (tabla 5). → Fase 2.
2. **Congelado semanal por centro, «Pedir congelamiento» y «Contra lo congelado»**: nunca se usaron. El plan mensual sí. → Fase 2.
3. **Solicitudes de fase del piso**: 0. Se reemplazan con «la fase la pone quien recibe». → Fase 1.
4. **El panel «Ya están libres, falta mover la fase» y la bandeja «cierre sin fase»**: nacen del mismo hueco. → Fase 1.
5. **Selector de aspecto (Tablero, Como Odoo, Clásico)**: queda Marino con modo oscuro, y el CSS se conserva. → Fase 4.
6. **Tejeduría → «regla estricta» (`tejEstricto`) con su panel de efecto**: apagada desde el 16-sep, sin uso. Se apaga la pantalla y el parámetro se conserva.
7. **Cumplimiento (la vista vieja)**: ya redirige al gerencial y hoy mide 0. Que lo reemplace la medición contra el plan mensual (Fase 2).

### FUNDIR (dos o más cosas que contestan lo mismo)
1. **«¿Alcanza?»**: Capacidad y decisiones (`matrizCapacidad`) se vuelve la vista por mes de la Nivelación, que queda como único cálculo. Las decisiones guardadas se conservan.
2. **Avance por área + Órdenes de trabajo** → una pantalla con pestañas Semana · Mes · Por orden.
3. **Hoy + Resumen gerencial**: Hoy deja de repetir las cifras del gerencial y enlaza a él.
4. **Órdenes (lista de trabajo) + Reportería → Órdenes de producción (consulta)**: la consulta queda como filtro «solo ver» de la misma lista. **DECIDE.**
5. **48 siembras y 52 marcas** → una lista numerada de migraciones. → Fase 3.
6. **Tablas chicas de parámetros** (motivos 15, textos 17, metas, alertas de módulos, valores del balanceo) → «Listas y textos». → Fase 3.
7. **Configuración general**: de 8 pestañas a 4 (Planta, Reglas, Listas y textos, Respaldo). → Fase 3.
8. **Control de piso → Producción y Centro → Programación**: los dos registran prendas con la misma función (`registrarPrendasCentro`). Control de piso quedaría solo para tejeduría y tintorería. **DECIDE.**

### DEJAR (se usa o es la base)
Órdenes con Rutas y lote (lo más usado) · Actualizar datos · Liberación a producción · Planificar el mes con el congelado mensual ·
Centros (Plan y Programación) · Mi centro (para cuando el piso arranque) · Tintorería · Tejeduría · Ingeniería · Planta en vivo ·
Producto en proceso · Usuarios · Categorías · Auditoría · Respaldo.

## 5. Antes de la Fase 1 necesito de ti
1. Marca QUITAR / FUNDIR / DEJAR, línea por línea.
2. ¿Contamos las visitas a cada pantalla? (punto 1)
3. El archivo **FASE_DE_CADA_CENTRO.xlsx** lleno: qué fase pone cada centro al tocar INICIO y cuál al terminar.
4. Una advertencia para la Fase 1: el piso no usa el sistema. «La fase la pone quien recibe» solo funciona si las tablets tocan
   INICIO. Mientras no lo hagan, la fase sigue llegando de Odoo, como hoy. Por eso el panel de la Fase 1 se retiraría sin que nadie lo extrañe.
