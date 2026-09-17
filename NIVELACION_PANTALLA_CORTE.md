# Nivelación — pantalla nueva (diseño 17-sep-2026), solo Corte conectada

**Commit propio. Prefijo `nivUI*`. El motor del Paso 1 (`nivelar`, `saldoProceso`, `capDia`, `diasHabilesInc`/`finLabInc`)
no cambió.** Del Excel se tomó únicamente la lógica y la forma; ninguno de sus números se usó ni para comparar.
Las demás áreas esperan aprobación: sus recuadros muestran el saldo (mismo motor) y dicen «pendiente de conectar»;
al elegirlas se ve la tabla cliente × mes y un aviso, sin cuadrito.

Capturas (Chrome sin cabeza sobre el simulador con el volcado real, 1.400 px de ancho):
`capturas/nivelacion_corte_1.png` (tres meses marcados, recuadros de área, Corte sin fechas → dato faltante),
`capturas/nivelacion_corte_2.png` (tabla por familia con la celda SHORT PLANOS · 2026-10 abierta: tipos de producto → órdenes; escenario sin guardar; «Ver cálculo» abierto),
`capturas/nivelacion_corte_3.png` (déficit y «qué no entra»).

## Antes: órdenes de demostración (punto 1)

- `demo()` marca sus 5 órdenes `demo:true`; `esDemo(o)` también las reconoce por OP (`OP-1001…1005`) para las que ya
  existan sin la marca. `carteraAbiertaCarga()` = abiertas **sin** demo y es la base del freno de archivo incompleto:
  cargar el volcado real sobre la cartera de demostración **ya no dispara el freno** (prueba D1) y los bloques del
  harness que recargan el volcado **ya no responden APLICAR**. La prueba F6 con el archivo filtrado a un cliente sí lo dispara.
- **No corregí `abiertaDe`** para excluirlas, y te digo por qué: lo probé y rompe el simulador entero (566 checks
  antes del primer fallo): todo el flujo de tintorería, liberación y tablet corre sobre esas 5 órdenes como cartera
  abierta, que es para lo que existen. La exclusión vive en la base del freno, que era el problema.
- **Producción: no existen.** El bloque 0 de tu SQL dio 100 % Recarga Parte 2; una `OP-1001…1005` habría salido como
  «a mano / otro». Nada que borrar ni reportar.

## Pantalla

- **2.1** «Nivelación de carga» abre su pantalla (`data-p="nivelacion"`, sin `data-conf`). Arriba a la derecha, el enlace
  «Configurar». Grupos de módulos, fases del saldo y parámetros de tela siguen en Configuración → Nivelación, que perdió el
  botón «Ver el boceto» (el boceto de la etapa A se retiró entero: `NIVD`, `NIVV`, `nivTarjetaHTML`, `nivLineaHTML`, `nivSimHTML`).
- **2.2** Meses como chips de selección múltiple (`nivUIMeses`/`nivUITogMes`; al menos uno, avisa si se intenta quitar el
  último; arranca con el mes en curso o el primero con saldo). Filtros: cliente y familia, nada más.
- **2.3** Recuadros por área desde los centros configurados (`nivUIAreas`): Tela + todos los centros `area:'pro'` en orden de
  proceso (`ordenPaso`) + Maquila. En el simulador salen Tela · Corte · Estampado · Bordado · Confección · Botones ·
  Etiquetas · Lavado · Plancha · Empaque · Maquila (los sub-centros de Terminados también son centros configurados: si
  no deben aparecer, es una decisión de configuración, no de código). Cada uno: saldo, fecha final y estado con ícono,
  color y texto (✓ llega · ⚠ riesgo, holgura ≤ `colchonDias` · ✕ déficit · ? dato faltante). Clic → abajo solo esa área.
- **2.4a (cambiado a pedido, mismo día)** Tabla **familia × mes de entrega** (unidades por procesar): para nivelar se mira el tipo de
  producto, no las órdenes una por una. Filas ordenadas por saldo, totales de fila y columna. Selector «filas por»: **Familia**
  (por defecto) · Tipo de producto (categoría hija) · Cliente — cambia solo el agrupamiento, no el cálculo (probado: mismo total).
  Clic en una celda → debajo, ESA familia y ese mes: **primero por tipo de producto con sus unidades**, y adentro las órdenes con
  foto/WH/fase (`filasGRP('nivui')` + `whCell`, agrupador común); las WH quedan en el último nivel (probado). Título: «Saldo por
  familia y mes de entrega» (o tipo de producto / cliente según el selector). Aplica a todas las áreas.
- **2.4b** Cuadrito con las trece filas, en ese orden y con esos nombres. Solo **Fecha inicio, Fecha compromiso, Días
  adicionales y Maquila** se escriben (fondo distinto, etiqueta «se escribe»); lo demás es solo lectura. Cambiar un valor
  recalcula al instante en memoria (`NIVUI.esc`); nada se guarda hasta «Guardar escenario» (motivo obligatorio, permiso
  `programa`): inicio y compromiso van por el mismo camino del Paso 1 (`setNivFecha`), días adicionales y maquila a
  `S.params.nivelacion.escenarios[area]`, todo a bitácora. Dato faltante (sin compromiso, sin capacidad, sin SAM) se dice
  como tal, nunca un número. «Ver cálculo» colapsado: minutos, SAM ponderado, capacidad por recurso (personas, min/día,
  eficiencia, fuente), días hábiles con los no hábiles descontados y el aviso de festivos sin cargar.
- **Maquila**: lo escrito manda; si no hay nada escrito, la suma de órdenes marcadas a maquila del saldo.
- **Déficit** = saldo − total del período, rojo si > 0; clic → «qué no entra»: las órdenes de entrega más lejana hasta cubrir
  el déficit, con foto.
- **2.5** Eliminado del boceto: tarjetas de todas las áreas con detalle, línea de tiempo, panel lateral de simulación.

### Qué se derivó fuera del motor (y por qué no lo cambia)
`nivelar()` da saldo, capacidad, días necesarios, fin, días disponibles, holgura. La pantalla deriva tres filas del Excel que
el Paso 1 no tenía: **días disponibles + adicionales**, **maquila escrita** (unidades × SAM ponderado) y **total del período =
capacidad × (disponibles + adicionales) + maquila**; el déficit es saldo − total. Están en `nivUICalcular`, con prueba.
Dos cambios aditivos al Paso 1, sin efecto en lo que ya hacía: `saldoProceso(procId, horizonte, filtro)` acepta un filtro
opcional (cliente/familia) y `procNivel(id)` acepta cualquier centro de producción configurado (por ruta).

## Lo que pediste en el reporte

**Saldo de Corte del cuadrito vs. suma de órdenes por cortar, mismos meses y filtros** (prueba N5, en el simulador con el
volcado real, tres meses marcados):

| | Órdenes | Unidades | Minutos |
|---|---:|---:|---:|
| Cuadrito (saldoProceso, con SAM) | 13 | 2.316 | 1.300 |
| Cuadrito, sin SAM (no suman) | 0 | 0 | — |
| Suma directa: abiertas con Corte en ruta y no hecho, `pendCentroUnid` | — | 2.316 | — |
| Carga general (`cargaUnica('abiertas')`, misma base y meses), centro Corte | 13 | 2.316 | 1.300 |

**Coinciden.** Dónde podrían diferir y la prueba lo acota: (1) órdenes **sin SAM** — Carga general no las cuenta (minutos 0) y
el cuadrito las lista aparte como «no suman»; (2) `pendCentroUnid` usa `cantCentro` (lo que realmente llega al centro si el paso
anterior cerró con menos) y Carga general usa `cant`; en el volcado no hay casos. La pantalla de Corte (cola por cercanía) es
otra base: solo lo programado en la semana, no se compara.

**Capacidad día** (capacidad de hoy, `capDia`): en el simulador Corte tiene un recurso activo con **8 personas × 480 min ×
85 % = 3.264 min/día** (fuente: configuración; la asistencia del día o un ajuste de la semana mandarían si existieran), que con
SAM ponderado 0,719 min/u son **4.542 u/día**. El recurso `maquila` de Confección no suma a la capacidad de planta.

**Días hábiles**: con inicio 17-sep y compromiso 07-oct (captura 2): **15 hábiles, 6 no hábiles descontados** (sáb 19, dom 20,
sáb 26, dom 27 sept, sáb 3, dom 4 oct), ninguna excepción cargada, y el aviso **«sin festivos cargados para 2026-09, 2026-10»**
a la vista. Convención del Paso 1: el inicio cuenta como día 1 y el compromiso es el último día disponible, los dos inclusive.

## Harness

Prueba N0 nueva: **ninguna función declarada dos veces en `index.html`** (1.494 funciones) y el prefijo `nivUI*`. Pruebas
N1–N7 (pantalla propia, meses, recuadros, tabla y cuadrito, coherencia, escribir/guardar/permisos/dato faltante, qué no entra)
y D1 (demo). **2.335 checks, 0 errores, 0 rojas** (tras la tabla por familia).
