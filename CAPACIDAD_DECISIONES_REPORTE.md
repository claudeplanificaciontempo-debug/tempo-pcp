# Capacidad y decisiones (Dirección) + buscadores + borrado — reporte

Fecha: 14-sep-2026. Commits `d804a25` → (siguiente). Pruebas 530/530. No se tocaron capacidades ni el motor.

## 1 · Pantalla "Capacidad y decisiones" (menú Dirección, permiso `programa`)

**Base.** El plan por **Proyecto** (mes de Odoo), con **todas las órdenes abiertas, liberadas o no**. Cada celda dice
cuántas órdenes de esa carga aún no están liberadas.

- **Carga** de un centro-mes = Σ prendas pendientes × min/prenda del centro (la misma regla con la que el motor calcula
  un paso, `minRef`; para estampado, la técnica de la orden). Sin repartir por días: es la demanda del Proyecto.
- **Capacidad** = calendario del mes × recursos activos (`capDia`, como el Plan mensual). El **mes en curso** cuenta solo
  los días que quedan desde hoy (la celda dice "desde hoy"); los **meses ya pasados** se marcan "vencido" (esa carga se
  ejecuta después y no cuenta como problema de capacidad; es atraso, y vive en Entregas).
- **Tejeduría y tintorería** no tienen min/prenda por Proyecto: se muestran **por programa con toda la cartera**
  (`programarTodo`: el motor reparte la tela por fecha requerida) y la celda lo marca "programa". Tintorería aparece
  solo si el programa tiene baños con día (hoy no tiene: nada confirmado que ocupe máquina).
- Colores: verde alcanza · **ámbar** desde el umbral `capAmbar` (sembrado en 85 %, editable arriba de la tabla, solo
  perfil con `config`, con bitácora) · **rojo** más de 100 % o sin recursos activos.

**Detalle de una celda** (clic): faltan (min y h), carga, capacidad y de dónde sale cada una, cuántas órdenes NO están
liberadas y cuántos minutos son ("ahí todavía puedes decidir"), meses a ±3 con holgura en ese centro y cuánto cabe, y
las órdenes ordenadas por peso (foto, OP, cliente, categoría, pendientes, minutos, % del mes, liberación, entrega).

**Decisiones.** Texto libre por centro-mes; queda con quién, cuándo, el % y lo que faltaba en ese momento; "dar por
resuelta" guarda quién y cuándo (y se puede reabrir). Solo se anota: el sistema no ejecuta nada. Cada anotación va a
bitácora.

**Problemas nuevos.** Cada centro-mes en rojo se registra la primera vez que alguien lo ve (`capProblemas`: quién,
cuándo, %, faltante) con bitácora; queda marcado **"nuevo"** hasta que alguien pulsa "visto" o anota una decisión; se
cierra solo cuando vuelve a alcanzar (también a bitácora). **Hoy** muestra un aviso "Capacidad y decisiones: N centro-mes
no alcanzan · M nuevos sin ver" con enlace. El historial (abajo, filtrable por centro) lista problemas y decisiones con
estado: en enero se puede ver qué se vio en septiembre y qué se decidió.

### Estado en producción (14-sep 12:18; sep = solo los días que quedan desde hoy)

| Centro | sep-26 (desde hoy) | oct-26 | nov-26 | dic-26 |
|---|---:|---:|---:|---:|
| Corte | 22 % | 68 % | 79 % | 39 % |
| Estampado | 8 % | 5 % | · | · |
| Bordado | **385 %** (34 no lib. de 120) | 81 % | **175 %** (89 no lib. de 96) | 32 % |
| Confección | 72 % | **141 %** (279 no lib. de 312) | **164 %** (221 no lib. de 228) | 81 % |
| Etiquetas | 13 % | 11 % | 7 % | 7 % |
| Botones | **199 %** | **149 %** | **187 %** | 78 % |
| Empaque | 72 % | **100 %** (pasa por poco) | **111 %** | 56 % |
| Tejeduría (programa) | 44 % | 25 % | · | · |

Nueve centro-mes en rojo quedaron registrados como problemas al abrir la pantalla por primera vez (los registró mi
sesión; están "sin ver" hasta que los marques; el % guardado al detectarlos fue con el mes completo, la pantalla
muestra el de hoy). Columna "vencido": carga pendiente de Proyectos ya pasados (dic-25 a ago-26: Etiquetas 4+2+1
órdenes, Empaque 1, y en ago-26 Corte 1, Estampado 3, Bordado 1, Confección 4, Botones 6, Empaque 12); es atraso, no
problema de capacidad.

Ojo con **Botones**: 199/149/187 % — hay que revisar si la capacidad configurada del centro (personas × minutos) es
real, porque la carga por prenda de botones es alta en la tabla de operaciones. Y **Confección** oct-nov > 140 % con
casi todo sin liberar: es justo el caso "todavía puedo decidir". **Tintorería** no aparece: el programa no tiene
baños con día (nada confirmado ocupa máquina).

## 2 · Buscadores: el campo perdía el foco

Causa: `oninput` llamaba a `render()`, que redibuja la página entera; el input se recreaba y el cursor se perdía tras
la primera tecla. Estaba en **seis** campos de texto: Órdenes (`ORDF.q`), Liberación (`LIB.q`), Programación por centro
(`CEN.q`), Control de piso (`CTL.q`), Operaciones (`OPV.q`) y Configuración → catálogo de productos (`CONF.qProd`).
Entregas y Avance del mes no tienen campo de texto (solo selectores; los selectores no pierden nada).

Arreglo: un solo helper `buscarQ` — espera 150 ms después de la última tecla cuando hay más de 300 órdenes (con menos,
filtra al instante), redibuja y devuelve el foco al mismo campo en la misma posición del cursor. Los seis usan el mismo
helper.

## 3 · Borrado fuera de las pantallas de trabajo

- **Órdenes**: se quitaron "Vaciar" y "Borrar datos operativos".
- Ahora viven en **Configuración → pestaña "Borrado (administrador)"** (solo perfil con `config`). El panel muestra
  cuánto hay (órdenes, con foto, con OT, con fases movidas aquí, registros de avance, baños confirmados, salidas,
  programas, novedades, bitácora) y cada acción abre un diálogo que lista lo que se pierde y exige escribir exactamente
  `BORRAR 1154 ORDENES` (o `BORRAR 1154 ORDENES Y 658 AVANCES` para el borrado total). Frase distinta = no borra nada.
  Queda en bitácora.
- **Borrar una orden (×)** en la lista de Órdenes borraba sin preguntar. Ahora pide confirmación diciendo qué se pierde
  (foto, OT, avance, historial de fases) y queda en bitácora. Lo dejé porque sirve para duplicados; si quieres que
  desaparezca de la lista, dímelo.

**Otros botones de borrado/vaciado/reseteo que encontré** (ninguno borra datos definitivos sin más):

| Dónde | Botón | Qué hace | Riesgo |
|---|---|---|---|
| Órdenes (lista) | × por orden | borra esa orden — **ahora con confirmación** | medio |
| Órdenes → Ajustes por referencia | quitar ajuste | vuelve al estándar, motivo obligatorio, bitácora | bajo |
| Tintorería → Armar baños | Deshacer baño | quita la confirmación; la WH vuelve a la lista | bajo (es la operación normal) |
| Programación por centro | quitar | quita puesto/recurso/fecha fijados, bitácora | bajo |
| Configuración → Centros y recursos | × centro / × recurso | borra un centro o recurso (no tej/tin/proveedor) | medio, solo config |
| Configuración → tablas (fases, origen tela, catálogos, perfiles…) | × fila | borra una fila de configuración | medio, solo config |
| Categorías y operaciones | × categoría / × operación / "Volver a heredar / vaciar" | borra maestro o vacía operaciones de una familia | medio, solo `categorias` |
| Calendario | quitar marca de excepción | bitácora | bajo |
| Entregas, Liberación, Auditoría, Escenarios, Demanda | Limpiar / Limpiar filtros | solo limpian filtros de pantalla | ninguno |

Los de Configuración/Categorías están fuera de las pantallas diarias y detrás de permisos; no los toqué.

## 4 · Código

- `vCapacidad`, `matrizCapacidad` (cache por render), `minPendCentro`, `capMesRecs`, `estadoCel`, `revisarProblemasCap`,
  `avisoCapacidadHTML` (Hoy), `anotarDecisionCap`, `resolverDecisionCap`, `verProblemaCap`, `setCapAmbar`. Datos en
  `S.params.capProblemas`, `capDecisiones`, `capAmbar`.
- `buscarQ` (+ `data-q` en los seis campos). `cuentaBorrado`, `panelBorradoHTML`, `mBorrar`, `ejecutarBorrado`;
  `borrarOperativo` ya no pide nada por sí mismo (solo lo llama `ejecutarBorrado`). `delOrden` con confirmación.
- Pruebas: matriz por Proyecto, capacidad, umbral 0 respetado, problema nuevo + bitácora + aviso en Hoy, detalle,
  decisión (quién/cuándo/%), resolver, historial, permiso, cierre del problema; buscador conserva foco; borrado con frase.

## 5 · Verificación pedida (14-sep, 12:30)

**Bordado: el 385 % / 175 % era un error de la pantalla nueva, no de la planta.** La matriz usaba el min/prenda del
centro (puntadas ÷ 650 ppm), que trata cada bordadora como si tuviera UNA cabeza. El motor (`minPrendaR`) divide por
`ppm × cabezas` de cada máquina (6C1 800×6, 8C 750×8, 4C 650×4, 6C2 800×6, 1C1/1C2/1C3 800×1 = 20.600 puntadas/min en
total). Corregido (`dbf9c90`): bordado va en **puntadas** contra **min-máquina × ppm × cabezas**. Con eso:
sep 85 % desde hoy (94,2 M puntadas / 110,7 M) y **52 % con el mes completo** (181,9 M; coincide con el 52 % que el
Plan mensual daba por programa), oct 18 %, **nov 39 %** (76,5 M / 197,8 M), dic 7 %. Los dos problemas de bordado se
cerraron solos. El "noviembre 200 %" reportado el 13-sep salía del mismo cálculo por centro sin cabezas: **bordado sí
alcanza**. Demanda agregada sigue usando min/prenda del centro para bordado (mismo sesgo); no la toqué.

**Botones (199 / 149 / 187 %) — con qué está calculado.** Un solo recurso "Botones": **3 personas × 480 min × 85 % =
1.224 min/día**, 6 días/semana (regla base pro; el calendario del mes manda): sep 23 días laborables (14 quedan →
17.136 min), oct 27 (33.048), nov 25 (30.600). Carga: sep 34.018 min, oct 49.146, nov 57.079. Min/prenda de botones
(LMO: familias OJALES + BOTONES → centro Botones, tabla de mapeo): Polo básica **1,56**, Polo moda 1,56, Camisas ML/MC
**3,25**, Henley 2,34, Vestidos 1,16, Jeans 0,40, Short cargo 0,36. Lo que pesa: Polo básica (sep 11.511 pz = 17.957
min; oct 11.299 pz; nov 20.028 pz = 31.244 min) y camisas (oct 5.800 pz = 18.843 min). Con esos tiempos y esas
prendas, botones necesita ~6 personas-equivalente en sep-nov; con 3 configuradas sale al doble. El dato a confirmar es
la **capacidad** (¿son 3 personas reales en ojales/botones, o parte se hace en los módulos?), no el tiempo por prenda.

**Confección oct 141 % / nov 164 % — órdenes sin liberar que más pesan** (cliente único: Comercializadora de Ropa
Fashion Club; min = pendientes × min/prenda de módulos):

Octubre: 279 sin liberar de 312 (1.577.951 de 1.812.516 min; capacidad 1.289.520). Las mayores: WH/MO/28951 Camiseta
CR 2.240 pz (30.159 min, 1Incompletos tin); SIN WH #1ljycgy Camiseta CV 1.640 pz (22.081, 0Diseño); WH/MO/28985 Polo
básica 1.195 pz (16.360, 1Tintorería); y **doce órdenes SIN WH de 1.091 pz** cada una (Level 1 / Level 2, 14.689 min
cada una = 176.268 min, fase 0Recetas Insumos, entrega 1–4 oct) — son las de la ODC 3033 con el precio raro.

Noviembre: 221 sin liberar de 228 (1.922.627 de 1.954.551 min; capacidad 1.194.000). Las mayores, todas en
0Adquisición: WH/MO/29142 Camiseta CR 3.133 pz (42.183 min), 29112 CR 2.685 (36.151), 29125 CR 2.652 (35.707), 29110
CR 2.273 (30.604), 29200 Polo básica 1.671 (22.876), 29143 CR 1.572 (21.165), 29153 CV 1.467 (19.752), 29193 Polo
básica 1.435 (19.645), SIN WH #4r93y6 Bombers 576 pz (18.374), 29113 CR 1.349 (18.163), 29198 y 29199 Polo básica
1.316 c/u (18.016 c/u), 29149 CV 1.259 (16.951), 29177 CR 1.195 (16.089), 29126 CR 1.166 (15.699). La lista completa,
ordenada por peso, está en la celda Confección · noviembre.

El × por orden se queda con confirmación (decisión de la usuaria).
