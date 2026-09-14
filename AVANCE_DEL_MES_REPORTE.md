# Avance del mes (Dirección / gerencia) — reporte

Fecha: 2026-09-14. Pruebas locales: 430/430. Ni capacidades ni motor tocados: la pantalla lee el programa y los
registros; lo único que se escribe es la base del plan al congelar (Plan mensual → congelar), que ya existía y ahora
guarda además el detalle orden × centro.

## Qué es

Dirección → **Avance del mes**: cómo vamos contra **el plan del mes**, cortado por lo que se quiera mirar. La pantalla
lo dice arriba: *"Base: el plan del mes. Avance = unidades hechas desde que se congeló el plan, contra las unidades
programadas para el mes (no contra el total de la orden)."*

## Base: el plan congelado

- Al congelar el plan de un mes (Plan mensual → "Congelar"), se guarda por **orden × centro** lo que el programa tenía
  puesto en ese mes: unidades y minutos, y cuántas unidades ya estaban hechas en ese centro al congelar (`h0`).
- Avance de una orden en un centro = (hechas hoy − h0), acotado a lo planificado del mes. Así el avance mide lo que se
  hizo **desde el plan** contra lo que **el plan pedía para el mes**, no el acumulado de la orden.
- Sin plan congelado para el mes, la pantalla lo marca (etiqueta amarilla) y usa el programa de hoy como base
  provisional: todo parte en 0. En producción **no hay plan congelado de septiembre**; hay que congelarlo en Plan
  mensual para que el avance tenga sentido. Se puede congelar varias versiones; se usa la más reciente del mes.

## Unidades hechas: de dónde salen

Por orden y centro, en este orden: centro cerrado por **orden de trabajo** de Odoo (terminado) o por **fase** → toda la
orden; si no, **control de piso** (prendas registradas en ese centro). Si no hay ninguno de los tres, la orden queda
**"sin registro"** en ese centro: no se cuenta como 0 hecho ni como faltante; se suma aparte (unidades y minutos sin
registro), sale en una tarjeta y en una lista al final. Los porcentajes se calculan sobre lo que sí tiene registro.

## Agrupar y filtrar (distintos, y se ve cuál está aplicado)

- **Agrupar** (hasta tres niveles anidados, como en Entregas): reordena y suma, no esconde nada. Cada grupo muestra
  unidades planificadas / hechas / faltan / % avance y minutos planificados / hechos / faltan, más las unidades sin
  registro. Debajo de cada grupo (primer nivel y hojas), el **desglose por centro** (↳ Corte, Confección, Empaque…)
  para ver dónde está el cuello. Se recuerda en el navegador.
- **Filtrar** (multi-selección por campo): esconde lo que no calza; la línea "Aplicado:" dice qué filtros hay y
  "se muestran N de M orden·centro".
- Campos para ambos: cliente, proyecto (mes), departamento, categoría, ODC, centro, estilo, color, en cualquier orden.
- Tabla "Por centro" con todo lo visible cortado por centro.
- Una prenda cuenta en cada centro por el que pasa: las unidades planificadas son orden × centro (lo dice la tarjeta).

## Exportar

"Exportar (con la agrupación)" descarga un CSV (separado por `;`, UTF-8) con exactamente el árbol visible: total,
cada grupo por nivel, su desglose por centro y los subgrupos, con las mismas columnas de la pantalla. "Imprimir" imprime
la pantalla.

## Dónde está en el código

`hechasCentro`, `planMesFilas`, `baseAvance`, `filasAvance`, `sumAV`, `arbolAV`, `porCentroAV`, `vAvance`,
`exportarAvanceCSV`; `congelarPlan` guarda `base`. Página `avance` (Dirección), visible para todo perfil con esa entrada
en su menú (admin, planificación y consulta por defecto).
