# Carga de datos — puntos 7 y 8

**17-sep-2026.** Dos commits aparte, como se pidió. Con esto se cierran los ocho puntos del Paso 0 de cargas.

## 7 · Restaurar con respaldo automático

`restaurarDesde(nuevo, nombre)` es ahora el único camino (`importJSON` solo lee el archivo y la llama):

1. **Solo el administrador** (`puede('config')`); a los demás les avisa y no hace nada.
2. Si el archivo no es un respaldo del sistema (sin `params`), avisa y no hace nada.
3. **Confirmación escrita**: hay que escribir exactamente `RESTAURAR`. El texto dice cuántas órdenes, cuántas con avance y
   cuántas entradas de bitácora hay ahora, cuántas trae el archivo, que lo que no esté en el archivo se pierde y que la bitácora
   se conserva y se une. Cualquier otra respuesta = nada.
4. **Antes de tocar nada** se descarga `respaldo_automatico_antes_de_restaurar_<fecha-hora>.json` con TODO lo que hay.
5. Recién entonces se reemplaza; la bitácora anterior se une a la del archivo; queda una línea en bitácora
   («RESTAURADO desde «x» por quién: había N órdenes, trae M; respaldo automático previo: …») y una fila en
   `S.params.restauraciones` (quién, cuándo, archivo, respaldo, antes/después).

Pruebas R7: planificación no puede; sin la palabra no pasa nada (ni respaldo ni reemplazo); con la palabra primero baja el respaldo
**con la cartera que había** y después reemplaza; la bitácora se conserva y la restauración queda registrada; el flujo usa
`prompt` con la palabra y no un `confirm` suelto.

## 8 · Registro unificado de cargas

Harness al cierre: **2.286 checks, 0 errores, 0 rojas.**

- **Una función, `registrarCarga(tipo, archivo, resumen)`**, y una sola tabla: `S.cargas` (`cargas` en Supabase), que **nunca se
  recorta** (el recorte a 60 se quitó en `aeabde5`). Tipos: `tareas`, `ot`, `fotos`. Cada fila: id, hora, quién, archivo y un resumen
  con lo que pasó:
  - tareas: actualizadas, nuevas, no vinieron, fuera de alcance, no calzan, clave incompleta, clave repetida (y no aplicadas),
    fechas ilegibles, sin componentes, conservado por campo;
  - OT: órdenes con centros, centros cerrados, no encontradas, contradicciones;
  - fotos: subidas, reemplazadas, convertidas, sin orden, errores, bytes.
- Antes cada cargador guardaba en un sitio distinto (`params.tareaCarga`, `params.otCarga` + `S.cargas`, `params.fotosCarga`). Esos
  detalles siguen ahí para los reportes (`mReporteTarea`, `mReporteOT`), pero **el registro de qué se cargó, cuándo y por quién es
  uno solo**.
- **Visible en Configuración → Órdenes y materiales → «Registro de cargas»**: última carga de cada tipo arriba y la tabla completa
  (últimas 300 en pantalla). En Hoy, el panel «Última carga» sale del mismo registro y ya no dice «de Odoo».
- Las filas viejas de `cargas` (de «Actualizar desde Odoo», sin `tipo`) se muestran como «Actualizar desde Odoo (retirado)» con su
  resumen antiguo; no se borran.
