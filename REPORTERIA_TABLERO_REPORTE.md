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
- Tabla «Metas de los indicadores» en Configuración general → Calendario y reglas (S.params.metasKPI). Nació vacía: sin meta, la tarjeta queda gris; no se inventa ninguna meta. Desde el 04-oct trae los números que la usuaria aceptó (sección 10).
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
6. ¿«Meta vencida» cuenta las de diseño sin WH? **Decidido (usuaria, 04-oct): sí cuentan**, como ya hacía la tarjeta, que lo dice aparte («incluye N de diseño sin WH»).
7. Los supervisores de piso recibían el Resumen gerencial porque tenían Cumplimiento. **Resuelto el 04-oct** con el permiso «Ver valores en $» (sección 9): ven Avance por área, sin dinero.
8. Las otras migraciones de perfiles siguen con la regla vieja de «no desde el piso» (ya corrieron en producción); para reutilizar el patrón, usar sesionDePisoMig().

## 9. La facturación solo la ven los altos mandos (04-oct-2026)
Decisión de la usuaria: «los supervisores deben ver el avance por área pero no como valores de facturación; la facturación es gerencial, de altos mandos».

**El permiso.** Nuevo en la lista de Configuración → Usuarios: «Ver valores en $ (facturación, precios, montos)» (`facturacion`). Es de **mirar**, no de hacer: `veFacturacion()` es la única regla del $ y no depende del modo «solo ve» (un perfil que solo mira y tiene el permiso sí ve los $). Lo tienen Administración (por «todo») y **Jefatura**, que lo recibe una sola vez por siembra (bandera `S.params.permFacturacion04`, línea en la bitácora con quién y cuándo, nunca desde un perfil de piso; si después se le quita en Usuarios, no vuelve). No lo tienen Planificación, Consulta, Liberación, Tintorería, los perfiles de centro, los de piso ni la tablet.

**El Resumen gerencial pide el permiso** (`PERM_PAGINA.gerencia`, la misma tabla que usan el menú, `render()`, `puedeAbrirPagina()` y la barra de Reportería). Sin él no sale en el menú aunque esté en las páginas del perfil (los supervisores lo tienen desde la migración del 03-oct: no se les quitó nada, solo no se abre). Un enlace a él, o a los viejos «Cumplimiento» y «Demanda agregada», lleva a **Avance por área**. Las migraciones que daban el Resumen gerencial ya no se lo dan a quien no tiene el permiso: le dan Avance por área. En Usuarios, la casilla de la página dice «(además pide «Ver valores en $»)».

**Sin el permiso, qué cambia en cada pantalla** (con el permiso todo se ve igual que antes: se comparó el dibujo de Administración y Jefatura antes y después, letra por letra):
- **Producto en proceso**: sin la columna «Total $», sin el valor en la cabecera ni en cada grupo, sin «sin precio». Quedan órdenes y prendas pedidas. El texto de la pestaña en la barra de Reportería no menciona el valor.
- **Planificar el mes, paso 2**: el Bloque 3 pasa a «Liberadas y por liberar» (órdenes y prendas, sin montos ni meta) con la línea gris «Los valores en $ los ven solo los perfiles con permiso «Ver valores en $»». En Congelar, las versiones y la comparación con el programa no llevan la fila Facturación ni los $. «Metas semanales de facturación» pasa a «Entregas por semana» (órdenes, prendas, por cliente en prendas, real y cumplimiento). La guía no habla de precios. La meta en $ del mes solo la escribe quien la ve (`setMeta`).
- **Entregas**: «Precio unitario» y «Total $» no aparecen en la ventana de columnas ni en el PDF para el cliente, aunque alguien con permiso los haya marcado, y no se pueden marcar.
- **Órdenes**: el aviso de precio fuera de rango dice la orden y «N veces el típico del archivo», sin montos. Lo mismo en la vista previa de «Actualizar datos → Tareas de Odoo».
- **Filtros de todas las listas**: «Añadir filtro personalizado» no ofrece «Precio (PVP)».
- **Configuración** (para un perfil que configure sin el permiso): sin «Costos para valorar decisiones» (y `setCosto` no cambia nada) ni la fila de facturación de «Metas de los indicadores».
- Avance por área (Semana y Mes), Órdenes de trabajo, Órdenes de producción, los centros, Control de piso, Mi centro, Hoy, Planta en vivo, la ficha y la búsqueda de arriba ya no tenían $: no cambiaron. Los archivos que baja un supervisor (Avance por área en CSV, rutas) no llevan $.

**Lo que no cubre:** es blindaje de pantalla (como «ver la configuración»): los precios siguen llegando al navegador con las órdenes, porque la base no filtra columnas por perfil. El respaldo JSON completo (Configuración → Respaldo y borrado) solo lo baja quien configura y lleva todo. `mPrecios` y `vCumplimiento` no tienen entrada.

**Pruebas:** FAC1–FAC7 y la GUARDIA FAC del simulador. FAC2 dibuja cada pantalla que pueden abrir Corte, Módulos, Terminado, Tintorería, Consulta y Liberación (con «gerencia» en sus páginas, como en producción), con pestañas, tarjetas y desplegables abiertos, la ficha, el detalle y la búsqueda de arriba, y exige cero «$» y «USD» en el texto y en los title (la única excepción es la línea gris). La GUARDIA falla si una función nueva arma un monto («'$ '», «$ ${», usd(, usdOrden(…) sin pasar por `veFacturacion()`, salvo las del Resumen gerencial, que solo se llaman desde él.

## 10. Las metas del tablero (04-oct-2026)
La usuaria aceptó («ok») los números de la tabla de ejemplo:

| Qué | Valor | Dónde se cambia |
|---|---|---|
| Meta de facturación de **octubre 2026** | **$ 400.000** | Planificar el mes → paso 2 → Meta de facturación |
| Facturación del mes (% de la meta, más es mejor) | verde **desde 95 %** · ámbar **desde 80 %** | Configuración general → Calendario y reglas → «Metas de los indicadores» |
| Meta vencida (% de las prendas abiertas, menos es mejor) | verde **hasta 5 %** · ámbar **hasta 10 %** | ídem |
| La orden va tarde (% de las prendas abiertas, menos es mejor) | verde **hasta 5 %** · ámbar **hasta 10 %** | ídem |

**Siembra única** `sembrarMetasEjemplo04` (`METAS_EJEMPLO_04`), desde `render()` antes de dibujar, al lado de la tabla 1 al entrar:
- pone cada valor **solo si no está escrito**. Lo escrito manda, incluso 0; y lo **vaciado a propósito** también: `setMeta` y `setMetaKPI` dejan su línea en la bitácora, y si esa cifra ya se tocó no se vuelve a poner. Si completar una cifra chocaría con la otra ya escrita (verde debajo del ámbar en facturación), no se completa y la bitácora lo dice;
- dos banderas (`S.params.metasKPI04` y `S.params.metaFact04`) con quién y cuándo, y una línea en la bitácora por cada una que dice que son los números del ejemplo aceptados el 04-oct y dónde se cambian;
- nunca desde un perfil de piso ni sin poder guardar la configuración; los colores piden **config**; la meta en $ pide **programa** (como `setMeta`) y además **«Ver valores en $»**. En producción la pone el primer administrador (o, la meta en $, Jefatura) que entre.

**Con los datos reales** (simulador, volcado completo, hoy 04-oct), el Resumen gerencial dibujado sale así (los montos en $ no se escriben aquí: el repositorio es público):

| Tarjeta | Cifra | Medida | Color |
|---|---|---|---|
| Facturación de octubre | la proyección (lo liberado que termina en octubre) | por debajo del 80 % de la meta | **rojo** |
| Meta vencida | 321 órdenes (incluye 53 de diseño sin WH) | 22 % de las prendas abiertas (más de 10 %) | **rojo** |
| La orden va tarde | 36 órdenes (frena sobre todo Bordado) | 3,9 % de las prendas abiertas (hasta 5 %) | **verde** |

¿Alcanza el mes? y Producto en proceso no cambian (la primera sale de la nivelación; la segunda es informativa).

**Pruebas:** MK1–MK6 (la siembra corrió al entrar desde `render()`; desde cero pone todo; es única; lo escrito, el 0, lo vaciado a propósito y lo que chocaría se respetan; piso, Planificación, Jefatura y Administración; las tarjetas dibujadas llevan la clase y la luz que da cada meta; la tabla de Configuración muestra las cifras). TG3 sigue probando la tabla vacía (borra las metas y no vuelven: la siembra ya corrió).
