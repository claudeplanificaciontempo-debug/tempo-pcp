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

### Estado en producción al abrirla (14-sep 12:15, todos los meses con carga)

| Centro | sep-26 (desde hoy) | oct-26 | nov-26 | dic-26 |
|---|---:|---:|---:|---:|
| Corte | 13 % | 68 % | 79 % | 39 % |
| Estampado | 5 % | 5 % | · | · |
| Bordado | **235 %** (34 no lib. de 120) | 81 % | **175 %** (89 no lib. de 96) | 32 % |
| Confección | 44 % | **141 %** (279 no lib. de 312) | **164 %** (221 no lib. de 228) | 81 % |
| Etiquetas | 8 % | 11 % | 7 % | 7 % |
| Botones | **121 %** | **149 %** | **187 %** | 78 % |
| Empaque | 44 % | **100 %** | **111 %** | 56 % |
| Tejeduría (programa) | 26 % | 25 % | · | · |

Nueve centro-mes en rojo quedaron registrados como problemas (detectados por mi sesión al abrir la pantalla; están
"sin ver" hasta que los marques). Meses vencidos con carga pendiente: dic-25 (Etiquetas 4 órdenes), may/jun/jul-26
(1–2 órdenes de Etiquetas/Empaque), ago-26 (pocas órdenes en varios centros).

Ojo con **Botones**: 121/149/187 % — hay que revisar si la capacidad configurada del centro (personas × minutos) es
real, porque la carga por prenda de botones es alta en la tabla de operaciones. Y **Confección** oct-nov > 140 % con
casi todo sin liberar: es justo el caso "todavía puedo decidir".

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
