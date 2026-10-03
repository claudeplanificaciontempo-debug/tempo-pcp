# Reportería: el tablero de la gerencia

Fecha: 03-oct-2026. Pedido de la usuaria: «la parte de reportes: borra lo que no debe ir, y pon lo que sí es importante». Este documento dice cómo quedó la Reportería después del lote del 03-oct y de su revisión (los arreglos del mismo día). No lleva nombres de clientes ni datos de la planta.

## 1. Qué quedó en Reportería (5 reportes)
El grupo Reportería del menú tiene cinco entradas: las mismas de REPORTES, PAGINAS_DEF e ICO_NAV (la prueba TG1 falla si se separan).
| Reporte | Qué contesta |
|---|---|
| Resumen gerencial | ¿Cómo vamos? Cinco tarjetas y, debajo, la cartera partida por cliente, fase, ODC, estilo o familia. |
| Órdenes de producción | Todas las órdenes, solo para mirar: estado, fase, ruta, telas y entrega. |
| Producto en proceso | Órdenes y prendas en cada fase y su valor (como la pivot de Odoo). |
| Avance por área | Semana (programadas, hechas, cumplimiento, atrasadas) o Mes (lo hecho contra el plan congelado del mes). Cada ingeniero ve solo su área en las dos vistas. |
| Órdenes de trabajo | Cada orden en cada centro, como la lista de Odoo, para ver qué hacen los operarios. |
Salieron del menú: Cumplimiento de facturación (un enlace viejo abre el Resumen gerencial; la cuenta, las semanas congeladas y la vista se conservan: nada se borró) y Avance del mes (se fundió en Avance por área → Mes, con los mismos cálculos; un enlace viejo abre la vista Mes; la vista elegida se recuerda por usuario).

## 2. Qué salió del Resumen gerencial y adónde fue
| Lo que estaba | Dónde quedó |
|---|---|
| Segunda franja de cifras | Salió: las cinco tarjetas dicen lo mismo, cada una con su base. |
| «Pedido y avance» (pesos 15/30/50/65/85 % escritos en el código) | Salió. Qué % de avance mostrar es decisión pendiente de la usuaria. |
| «Carga contra capacidad» sumando todos los centros | Salió (escondía el cuello de botella). La tarjeta 4 sale de la nivelación, área por área. |
| Tablas por mes del Proyecto y por cliente | Una tabla, «La cartera por…», con chips. Lo que quedaba abierto de cada mes está en «Historia por Proyecto» (plegada). |
| «Órdenes que van tarde, las más grandes» | Es la lista de la tarjeta «La orden va tarde». |
| Rutas que no terminan en Empaque y categorías sin hoja | Salud del sistema. |
El Resumen gerencial usa el programa real (programar(), el mismo de Hoy y de Planificar el mes). Antes usaba «como si todo estuviera liberado». La única excepción es la Historia por Proyecto: sus fotos se tomaron así y un mes cerrado no se toca; su título lo dice.

## 3. Las cinco tarjetas
Ninguna tiene una cuenta propia: cada una llama a la definición que ya existe. Las tarjetas no cambian con los filtros. Cada una dice su base en la línea gris y, al pasar el mouse, cómo se calcula y dónde se cambia su meta.
| # | Tarjeta | Definición única | Al tocarla |
|---|---|---|---|
| 1 | Facturación del mes | facturacionPlanMes(): lo liberado (sin bloqueo en el programa) cuya fecha de fin cae en el mes, a precio de Odoo × prendas. Es la misma cuenta del Bloque 3 de Planificar el mes. Es una proyección, no lo facturado. | Planificar el mes → paso 2 → Meta de facturación. |
| 2 | Meta vencida | esMetaVencida() en la cartera abierta: la fecha meta (compromiso si hay, si no la de Odoo) pasó y la orden no está terminada. No depende del programa. Las de diseño sin WH se dicen aparte. | Lista por familia con la fecha meta y el enlace a Advertencias de fecha. |
| 3 | La orden va tarde | esOrdenVaTarde() con el programa real: la meta no pasa, pero el programa la termina después. Dice el cuello de botella que más se repite. | Lista y enlace a Advertencias de fecha. |
| 4 | ¿Alcanza el mes? | La nivelación del paso 1 de Planificar el mes, área por área: los mismos meses, sin los filtros ni el escenario sin guardar de la nivelación (no los cambia). Rojo = déficit; ámbar = justa (holgura ≤ días de holgura); gris = falta un dato; verde = todas llegan. Sin Maquila ni áreas por días. | Planificar el mes → paso 1. |
| 5 | Producto en proceso | Lanzadas (con WH) en fases de un grupo marcado «en proceso» (tabla 5) y no terminadas (enWIPGerencia). Valor = precio × prendas. Dice cuántas están en Maquila. Informativa, sin meta. | Producto en proceso con la base «lanzadas» y solo esas fases; el total de la pivot es el de la tarjeta. |
Arreglo de la revisión: antes, el clic en la tarjeta 5 abría la pivot con todas las fases y no cuadraba. Ahora fija también las fases y suelta la búsqueda y los filtros listos de la pivot. La regla depende solo de la fase, así que las órdenes son exactamente las de la tarjeta. Lo prueba TG7.

## 4. Metas de los indicadores
- Tabla «Metas de los indicadores» en Configuración general → Calendario y reglas (S.params.metasKPI). Nace vacía: sin meta, la tarjeta queda gris; no se inventa ninguna meta.
- Facturación del mes se mide en % de la meta del mes (más es mejor). Meta vencida y La orden va tarde se miden en % de las prendas abiertas (menos es mejor). Hacen falta las dos cifras: verde y ámbar.
- Vacío = sin meta; 0 = 0.
- Solo quien configura (permiso config) cambia las metas, y queda en la bitácora.
- ¿Alcanza? toma su color de la nivelación. Producto en proceso es informativo.

La meta en $ del mes se escribe en Planificar el mes → paso 2 (setMeta). Exige el permiso programa y queda en la bitácora. Campo vacío = sin meta: se quita (antes el vacío se guardaba como 0). 0 = una meta en $ 0 escrita a propósito: el campo muestra 0 y la tarjeta dice «meta en $ 0», gris porque no hay % que medir. Una meta guardada en 0 antes de este arreglo ahora se ve como «meta en $ 0»; se deja sin meta vaciando el campo una vez.

## 5. «¿Se puede confiar en estas cifras?»
Una línea debajo de las tarjetas con números de bandejas que ya existen:
- rutas por confirmar;
- pasos con fecha sin tiempo estándar (la misma bandeja de Hoy);
- prendas sin precio;
- fases del archivo sin aceptar;
- última carga de Odoo: desde la revisión cuenta solo tareas, órdenes de trabajo, fotos y tallas. Antes un Excel de tiempos, de rutas o el inventario de máquinas la renovaba. Las filas viejas sin tipo eran cargas de Odoo y cuentan. Hoy usa la misma función;
- registro del piso de esta semana (solo los días ya pasados).
Lleva enlaces a Planta en vivo y a Salud del sistema, si el perfil puede abrirlas.

## 6. La tabla «La cartera por…»
- Una tabla siempre a la vista, con chips Cliente | Fase | ODC | Estilo | Familia. El total de prendas pedidas es igual en los cinco cortes.
- Base: la cartera abierta, incluidas las de diseño sin WH. La línea de la base lo dice.
- Los filtros (meses del Proyecto, cliente, estado, buscador) acotan solo esta tabla.
- Revisión: con el aspecto Odoo, la barra de estos filtros subía a la cabecera, encima de las tarjetas. Ahora queda dentro del panel, junto a la tabla. Es el mismo atributo de Capacidad y Entregas con un valor nuevo: data-filtro-local "1" deja los filtros fuera de la barra; "panel" arma la barra pero no la sube. Con "1" la gerencia habría perdido Filtros listos, el filtro personalizado y Favoritos.
- Prendas hechas = las del último paso de la ruta; una orden terminada cuenta todas. Hay un solo aviso: «“Hechas” puede estar afectado…», con el enlace a Salud. La etiqueta «con brecha» salió.
- Tocar una fila muestra sus órdenes. Márgenes: pendiente de Costos TEMPO.

## 7. Migración de perfiles
migReporteria5 corre una vez (bandera en S.params), deja línea en la bitácora y nunca corre desde una sesión de piso. Los perfiles con Cumplimiento reciben el Resumen gerencial; los que tenían Avance del mes reciben Avance por área. Revisión: «no desde el piso» se decide ahora con perfilSoloPiso(), la definición única, a través de sesionDePisoMig, protegida contra la vuelta por el catálogo. Antes, un perfil viejo de piso (rol «piso» con área) pasaba como si no fuera de piso. Avance por área → Mes ahora respeta «cada ingeniero ve su área» como la vista Semana: solo las filas de sus centros (también en el CSV y en «Cerradas con faltante»), y la pantalla dice «solo lo tuyo».

## 8. Pendientes
1. Terminadas a tiempo: no hay tarjeta; depende del punto 3.
2. Eficiencia: no está en el tablero; vive en Planta en vivo y sale «sin registros» hasta que las tablets marquen INICIO y FIN.
3. Cumplimiento mide 0: fechaFacturada solo toma como día exacto un cambio de fase con origen «app», y mover la fase desde la pantalla guarda origen «manual». Ninguna orden queda medible. Arreglarlo cambia lo que se mide: espera decisión.
4. Flechas mes contra mes: no están; falta juntar meses de historia.
5. Hoy repite «vencidas» (tarjeta y bandeja): está en las decisiones de la revisión «para dummies».
6. ¿«Meta vencida» cuenta las de diseño sin WH? Hoy sí, dicho aparte en la tarjeta. Decisión de la usuaria.
7. Los supervisores de piso reciben el Resumen gerencial porque tenían Cumplimiento. Si no deben verlo, se les quita en Configuración → Usuarios.
8. Las otras migraciones de perfiles siguen con la regla vieja de «no desde el piso» (ya corrieron en producción); para reutilizar el patrón, usar sesionDePisoMig().
