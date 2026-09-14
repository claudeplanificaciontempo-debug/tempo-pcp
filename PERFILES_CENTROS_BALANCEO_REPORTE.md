# Entregas, perfiles, carga que viene, advertencias y balanceo — reporte

Fecha: 2026-09-13 (noche). Commits `213f477` → `007ba2c`. Pruebas locales: 401/401. Publicado en GitHub Pages
(v 2026-09-13 22:49 en adelante). Capacidades: no se tocó ninguna.

## 1 · Entregas

- Columnas nuevas por fila en la pantalla: **ODC**, **Estilo**, **Departamento** (además de OP, foto, categoría,
  color, prendas, fecha pedida, estimada por el programa, liberación, fecha de compromiso).
- **Agrupación anidada, como Odoo**: selector "Agrupar por" con hasta tres niveles (ODC, categoría, departamento,
  familia, mes de entrega pedida, cliente, color, estilo). No esconde nada: reordena y suma; cada cabecera de grupo
  trae "N órdenes · N prendas". Por defecto ODC → categoría. Se recuerda en el navegador.
- **El PDF del cliente sale con la misma agrupación** y solo con las columnas marcadas en "Columnas del PDF" (se
  guardan para todos). Por defecto en el PDF: foto, OP, ODC, estilo, categoría, color, prendas, fecha comprometida,
  departamento. **Fuera por defecto y marcados "interno"**: estimada por el programa, liberación, fase, Estado OP,
  módulo, minutos, kg, precio, total $, avance en piso.
- **Base declarada**: todas las órdenes abiertas (con WH, no facturadas ni en stand by), **liberadas o no** — la
  misma base que el plan mensual. Ya era así antes (no filtraba solo liberadas); ahora lo dice en pantalla y hay una
  tarjeta "Sin liberar · N prendas · por resolver antes de comprometer".
- Cada cambio de fecha de compromiso (individual o masivo) queda en la bitácora con antes → después.

### Control de cumplimiento: NO construido, por los datos

Pregunta de la usuaria: ¿de dónde sale la fecha real de entrega y las prendas realmente entregadas?

| Dato | ¿Existe hoy? | Dónde | Sirve para… |
|---|---|---|---|
| Fecha en que **empaque terminó** la orden | Sí, para las 55 facturadas y las que tengan OT de empaque terminada | `o.ot.empaque.fin` (archivo de órdenes de trabajo de Odoo, `mrp.workorder`, columna Fecha de fin) | "salió de producción"; **no** es la entrega al cliente ni la factura |
| Fecha de **factura de venta** / entrega al cliente | **No** está cargada | Odoo: facturas de cliente (`account.move` de ventas) o el picking de entrega; hace falta una exportación nueva | fecha real de entrega |
| **Prendas entregadas** | **No** existen en ningún archivo cargado | Solo saldrían de las líneas de la factura de venta (cantidad facturada) o de un registro nuevo en la app | prendas comprometidas vs entregadas |
| Prendas **empacadas** registradas en piso | Sí, para 103 órdenes con avance en empaque | `S.avance[id].centros.empaque` (Control de piso) | aproximación de lo que salió, solo para lo registrado en la app |
| Fecha comprometida | Sí (la que pones en Entregas) | `o.fechaCompromiso` | la meta |

Conclusión: **hoy no hay fecha real de entrega ni prendas entregadas**; solo hay "empaque terminó" por OT y prendas
empacadas en piso. Un cumplimiento calculado sobre eso sería "cumplimiento de salida de empaque", no de entrega.
Opciones, a decidir: (a) exportar de Odoo las facturas de cliente (fecha + cantidad por OP) y cargarlas con un
cargador como el de facturas de compra; (b) que el perfil Producto terminado registre "entregado: fecha y prendas"
al despachar (dato nuevo en la app); (c) usar "empaque terminó" y llamarlo por su nombre. Tarde e incompleto se
mostrarían por separado (órdenes a tiempo %, prendas a tiempo %, atraso promedio; por mes, cliente y ODC), como
pediste; no se construye hasta que decidas la fuente.

### Decisión (14-sep): cumplimiento de FACTURACIÓN por fase

- Facturas descartadas (van por talla y sin OP). La fuente es la **fase**: cuando una orden llega a Facturado o
  Stand by (sistema "cerrada" en la tabla 1), se facturó.
- **Historial de fases** (`o.fases`): cada entrada a una fase guarda fecha-hora, quién y origen. `app` = la movió un
  supervisor aquí (fecha exacta); `archivo` = venía así en una carga de Odoo (entre dos cargas no se sabe el día).
  Se registra en Control de piso (selector de fase), calidad de tintorería, baño listo, cargas de Odoo y la recarga
  de la Parte 2 (el historial viaja con la OP aunque la recarga reemplace la orden). La ficha de la orden lo muestra.
- **Cumplimiento de facturación** (página Cumplimiento, arriba): fecha de compromiso vs fecha en que llegó a
  Facturado. Solo entran órdenes facturadas con compromiso y con fecha exacta (origen app); las que venían facturadas
  del archivo se listan como "sin fecha exacta, no medibles" y las sin compromiso como "no medibles". Por mes de
  compromiso, por cliente y por ODC: órdenes medidas, a tiempo, % a tiempo, tarde, atraso promedio de las tardes.
  **Se mide por referencias, no por unidades** (decisión 14-sep): una referencia cuenta cumplida cuando llega a
  Facturado; no se registran ni se registrarán unidades por despacho. La pantalla lo dice: "% de referencias
  cumplidas a tiempo · no son unidades"; las prendas aparecen solo como dato informativo.
- Hoy en producción: las 55 facturadas vienen del archivo (sin fecha exacta) y sin compromiso → 0 medibles; el
  indicador empieza a llenarse cuando los supervisores muevan fases aquí y tú pongas compromisos.

## 2 · Usuarios y perfiles

- **Catálogo de perfiles en datos** (`S.params.perfilesDef`, editable en Configuración → Usuarios): permisos,
  centros que ve/registra y entradas de menú, por casillas. Sembrados: Administrador, Planificación, Tintorería,
  Liberación, Corte-estampado-bordado, Módulos, Producto terminado, Consulta. Un perfil nuevo o un cambio queda
  en la bitácora.
- Cómo quedó cada uno (editable):
  - **Tintorería**: registra en piso (kilos, faltantes, reprocesos) y hace calidad; ve solo tintorería (Tintorería,
    Control de piso, Reportería, Programa del día).
  - **Liberación**: permiso "liberar" (cola de tela y de producción); ve Liberación, Órdenes y Producto en proceso; no
    registra en piso. La regla "solo con insumos completos" sigue siendo de la persona: la lista de insumos de la
    orden es informativa (decisión anterior de que los insumos no bloquean).
  - **Corte, estampado y bordado**: ve y programa esas tres áreas (reprogramar, ruta, piso, reportería).
  - **Módulos**: los once módulos + Balanceo + Costura. Dos usuarios separados con el mismo perfil.
  - **Producto terminado**: plancha, botones, lavado, **etiquetas** y empaque (agregué etiquetas porque es un proceso
    final; quítalo en el catálogo si no corresponde).
  - **Administrador**: todo. **Ningún perfil de centro ve Configuración** (ni categorías, ni operaciones, ni usuarios).
- **Usuarios**: "Nuevo usuario" crea la cuenta en Supabase (correo, contraseña inicial, perfil). Si el proyecto exige
  confirmación de correo, la persona debe abrir el enlace antes de entrar. Se asigna/cambia el perfil desde la tabla.
  Nota de producción: la tabla `perfiles` **no tiene** las columnas `subarea` ni `modo` (el CLAUDE.md decía que sí);
  el alta funciona sin ellas; el permiso "solo ve" necesita `modo` (`SUPABASE_PERFILES.sql`, opcional).
- Usuarios existentes en producción: 3 administradores (claudeplanificacion, jefeplanificacion, planificacionmaestro)
  y productoterminado@tempo.ec en Consulta → asignarle "Producto terminado".
- Los perfiles viejos (rol piso + área + sub-área) siguen funcionando traducidos al catálogo.

## 3 · Qué ve y qué hace un perfil de centro

- **Carga que viene** (pestaña nueva en cada centro): órdenes con paso pendiente en el centro que hoy están en un
  paso anterior, en textil o sin liberar, agrupadas por "dónde está" (Sin liberar · Textil · por liberar a
  producción · En Corte · En Confección…), con prendas y la fecha en que el programa estima que entran.
- **Por liberar**: prendas programadas del mes con toda la cartera (liberada o no, la base del Resumen gerencial)
  vs. solo lo liberado (la base del Plan mensual) → "N por liberar · N órdenes". Cada número dice su base. Hoy en
  producción (septiembre) las dos bases casi coinciden por centro (Confección 32.248 = 32.248; Empaque 50.265 vs
  49.923): lo no liberado cae en los meses siguientes porque septiembre ya está lleno.
- **Reprogramar** (recurso, fecha de arranque, prioridad) sigue en "Programación del centro", ahora solo con permiso
  "reprogramar" y sobre los centros del perfil; queda en bitácora con antes → después.
- **Ruta editable por centro** (botón "ruta" en Programación del centro): marca/desmarca pasos de sus centros —
  corte/estampado/bordado pueden agregar o quitar estampado y bordado; producto terminado, lavado/plancha/botones/
  etiquetas; módulos, confección. Motivo obligatorio; bitácora con ruta antes ⇒ después. Un paso agregado toma el
  tiempo de la hoja de operaciones de la categoría; si no lo hay entra **sin tiempo** y se reporta (no se inventa).
- **Control de piso y reportería**: filtrados por los centros del perfil (ya existía; ahora sale del catálogo).
- **Plan congelado del mes**: la pestaña "Planificación" del centro muestra lo asignado por planificación; el plan
  congelado (`S.planes`) sigue siendo por área y módulo, no por centro-semana — no se cambió.

## 4 · Advertencias de fecha (para planificación)

Cuando un centro reprograma o cambia la ruta y con eso la fecha estimada por el programa queda **después de la fecha
meta** (la comprometida, o la pedida si no hay compromiso) — y antes no lo estaba o se corre más —, se registra una
advertencia: cuándo, quién, orden, qué hizo, fecha meta, estimada antes y estimada ahora. Aparece en **Hoy →
"Advertencias de fecha"** para quien tiene permiso de programa (planificación/admin), con botón "atendida". No se le
impide nada al centro. Se guarda en `S.params.advertencias` (últimas 300). En producción: 0 por ahora.

## 5 · Balanceo de módulos

- Sale de **lo programado en el módulo en el mes** (programa general): lista de hojas de operaciones (familia LMO)
  con sus categorías, órdenes y prendas; "estas N órdenes usan este balanceo" y se muestra una vez.
- Muestra operaciones **por sección de la prenda** (Frente, Hombros, Mangas…), minutos y máquina de cada una, total
  de minutos, operarias que hacen falta para el objetivo, puestos sin pasar del ritmo (takt), máquinas que pide vs
  tiene el módulo vs stock.
- **Personas: las del recurso**, no un número fijo. En producción coinciden con lo que dijiste: Módulos 1, 2, 3 = 11;
  6 y 10 = 9; 4, 5, 7, 8, 9 = 8; 11 = 7; Maquila 20. Módulos 10 y 11 tienen eficiencia 80 %, los demás 85 % (así
  estaba; no se tocó).
- El balanceo no depende de la cantidad de la orden.
- **Orden de las operaciones: PROVISIONAL**, marcado en pantalla (aviso amarillo y asterisco por fila): dentro de cada
  sección va en el orden del archivo LMO hasta que producción llene la hoja ORDEN (`HOJA_OPERACIONES_PRODUCCION.pdf`).
- Programado en septiembre por módulo (órdenes): Módulo 3 20, Módulo 8 19, Módulo 2 17, Módulo 1 15, Módulo 11 10,
  Maquila 10, Módulos 5 y 6 7, Módulo 4 6, Módulo 9 5, Módulo 7 4, Módulo 10 3.

## 6 · Objetivo de prendas por hora

- Lo fija la supervisora en la pantalla de Balanceo (perfil Módulos o Planificación); se guarda en el recurso con
  quién, cuándo y el valor anterior, más un historial (últimos 100) y la bitácora.
- Al lado, el **ritmo teórico**: personas del módulo × minutos efectivos por hora (60 × eficiencia) ÷ minutos por
  prenda de la hoja. Si hay objetivo, se muestra "objetivo ±N % frente al teórico"; si está más de 15 % por debajo, la
  tarjeta se marca. Solo los dos números; sin juicio.

## 7 · Lo que falta y no se inventó

- Orden real de las operaciones (hoja ORDEN en producción).
- Fuente de la fecha real de entrega y de las prendas entregadas (sección 1).
- Decisiones de la recarga de la Parte 2 (qué se conserva) — pendiente de tu respuesta a los 5 puntos.
- Columna `modo` en `perfiles` si quieres usuarios "solo ve".
