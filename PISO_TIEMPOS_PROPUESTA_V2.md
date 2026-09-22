# Registro de piso y tiempos reales — versión 2, mejorada contra lo que ya tenemos

**21-sep-2026 · Propuesta, SIN construir.** Es la respuesta a «¿cómo lo mejorarías, respecto a lo que tenemos?» sobre la
propuesta `PISO_TIEMPOS_PROPUESTA.md` (registro de piso en dos niveles: módulo y operación, piloto de 2–3 módulos de
camisetas). Para armarla, cuatro diseñadores independientes (adopción en piso · un solo dato · ingeniería y estándares ·
construir lo mínimo) rehicieron la propuesta verificando cada afirmación contra `index.html`, tres jueces las puntuaron y
un crítico buscó lo que faltaba en todas. Lo que sigue es la síntesis; cada hallazgo de código lo comprobé yo después.

---

## 0 · En una página: qué cambia respecto a la propuesta original

1. **La RLS del piso ya corrió el 15-sep**: `SUPABASE_POLITICAS_TABLET.sql` lo dice en su cabecera (8 políticas, la tablet
   guardó el 16-sep 08:08). La propuesta la daba por pendiente y el `CLAUDE.md` estaba viejo (queda corregido). Lo que sigue
   abierto de P02 es solo **ampliar la lista de roles** para perfiles nuevos del catálogo; para un piloto con perfiles
   `tablet`/`modulos` no hace falta. Lo único pendiente de SQL es lo nuevo.
2. **No se aplica ningún suplemento (12 % / 15 %) al SAM durante el piloto.** Tu decisión del 21-sep dice que los tiempos de
   Kronos **ya llevan suplementos y eficiencia**, y el motor además descuenta la eficiencia del módulo (`efic` 85 %) y la
   polivalencia. Aplicar un % encima descontaría dos o tres veces. El suplemento queda como columna comparativa hasta la
   decisión D9 (qué factor corrige el dato real).
3. **Las nueve tablas `mes_*` de Supabase no se usan.** Cero referencias en la app, esquema relacional que `_save` no sabe
   escribir, y duplican lo que ya existe (operarias, asistencia, paros, operaciones). Se documentan, no se borran.
4. **Antes de que una operaria toque nada hay que tapar siete fugas del registro actual** (sección 1): el recorte de 90 días
   de la asistencia, el estándar del tramo que queda en 0 al cerrar el paso, el «deshacer» que deja la línea contando, la
   orden dibujada dos veces en Mi centro, los paros de la tablet que no salen en ningún reporte, el paro «Cierre del día» que
   deja el tramo abierto toda la noche, y el tramo con FIN sin Guardar que se vuelve invisible.
5. **Nivel 1 se lee agregado por semana y por tipo de producto, nunca por orden**: un módulo solo puede tener un tramo
   abierto, y el traslape entre órdenes carga todos los minutos a una sola.
6. **El comparador se calibra contra lo que el motor espera**: esperado = SAM ÷ polivalencia ÷ eficiencia, con los tres
   factores a la vista. Hoy el semáforo alerta a +15 % cuando una eficiencia de 85 % espera +17,6 %: un módulo perfecto
   saldría «bajo sospecha».
7. **Compuerta medida antes de construir el Nivel 2**, con números que ya existen: órdenes programadas con tramo, cierres
   sin tiempo ÷ cierres, tramos olvidados, días con asistencia. Dos semanas seguidas.
8. **Nivel 2 empieza en UN módulo y sin QR** (tocar el paquete en pantalla); los eventos van a una tabla nueva
   `registros` con el esquema de la casa, insert-only, fuera de la carga completa — no dentro de `avance[oid]`, donde dos
   tablets sobre la misma WH chocan. Plan B si la conciliación no llega a 95 %: el líder cuenta operaria × operación en
   cortes fijos del día (cero toques de la operaria).
9. **Dejar de leer tickets en Kronos por compuerta (conciliación ≥ 95 % durante N días), nunca por fecha.**
10. **Tres cosas que la propuesta daba por hechas y no existen**: una WH partida entre dos módulos (el sistema programa y
    cierra por centro, un recurso por paso), la maquila como módulo (es un recurso con 20 personas sembradas: hay que
    excluirla), y el ciclo de segundas (reparar / descartar / recuperada) en producción.

---

## 1 · Lo que encontré en el código y cambia la propuesta (todo verificado)

| # | Hallazgo | Dónde | Qué implica |
|---|---|---|---|
| H1 | RLS del piso **ya ejecutada** (avance, bitacora, turnos, paros: insert + update, sin delete; roles tablet/corte/modulos/terminado fijos) | `SUPABASE_POLITICAS_TABLET.sql:1-27` | P02 no bloquea el piloto (solo ampliar roles si entra un perfil nuevo); lo pendiente es la RLS de lo nuevo. Las políticas no acotan por fila: cualquier tablet puede reescribir el avance de cualquier orden (H15) |
| H2 | Los tiempos del 21-sep **ya llevan suplementos y eficiencia** (decisión tuya) | `TIEMPOS_21SEP_CARGA.md:12` | No aplicar 12 % encima; `capDia` = personas × min × efic/100 (`index.html:931-937`) ya descuenta el 85 %; `poliPct` (939) descuenta otra vez por familia |
| H3 | `setAsist` **recorta `S.turnos` a 90 días** y borra la fila al vaciar; el mismo filtro se lleva las **paradas de máquina** (`guardarParada` escribe en `S.turnos` con `d`) | `setAsist 9592-9593`, `guardarParada 9636` | Mata el histórico de eficiencia y de novedades. Solo lo dispara planificación/admin (la tablet no ve Control de piso y el piso no tiene delete). Quitarlo = autorización «nada se borra» + GUARDIA |
| H4 | El estándar del tramo sale de `o.ruta`, que es **solo lo pendiente** (`o.ruta = pasosPendientes(...)`, 5715): **al cerrar el paso, el tramo histórico queda con estándar 0** y sin semáforo; `propagarTiempos` lo reescribe además | `calcTramo 2331-2334` | Sin `t.sam` congelado al guardar, el comparador semanal cambia al cerrar el paso o al corregir un SAM |
| H5 | `deshacerHechoCentro` resta `turnos` y `centros` pero **deja la línea «(total)» en `tallasLog`**, y `hechasDelDia` la sigue contando | `7719-7724`, `hechasDelDia 2269-2273` | Un «deshacer» del supervisor deja las hechas del día infladas |
| H6 | Mi centro **dibuja cada orden dos veces** (secciones del flujo + `cola.map(card)`), y la tarjeta trae «Hecho», «Cambiar fase» y un **cronómetro viejo** (`cronoTablet` escribe `avance.crono` que ni `calcTramo` ni `hechasDelDia` leen) | `vTablet 2599-2610`, `cronoTablet 2198` | Para el líder: «¿cuál toco?». Una sola lista, un botón por estado |
| H7 | Los **paros marcados en la tablet** (`t.paros`) **no salen en ningún reporte**: Ejecución, Costura y `hayRegistroEn` leen solo `S.paros` | `vCentro 8061`, `vCostura 8535`, `hayRegistroEn 5751` | Mantenimiento y el avance del día no ven los paros del módulo |
| H8 | La marca **`cierreDia`** de la tabla 15 se siembra pero **nadie la consume** (`motivoParoEs` solo se llama con `esAlmuerzo`); el paro «Cierre del día» deja el tramo abierto toda la noche → ese día queda «sin registros» y las unidades caen en el día que se guarda | `2322`, `datosDiaCentro 5524`, `guardarTramo 2412-2414` | Cierre diario obligatorio (FIN + parcial + continúa mañana) en vez del paro |
| H9 | **Cada toque llama `save()` → `PLAN=null` → `vTablet` corre `programar()` entero** | `save 762`, `vTablet 2583` | Nadie midió cuánto tarda en una Lenovo Android; si pasa de ~2 s por toque, la adopción muere antes que el software |
| H10 | `terminarTramo` guarda `fin` **antes** de las tallas: un tramo con FIN y sin Guardar (tablet cerrada) queda con `pz` indefinido, no es «abierto», nadie lo lista, cuenta como registro del día con 0 prendas | `2393-2397`, `tramoAbiertoDe 2280` | Bandeja `tramoSinUnidades` con «Completar unidades»; los comparadores lo excluyen y lo dicen |
| H11 | `hechasDelDia` acepta **líneas sin recurso para cualquier módulo** (`!x.rec`); lo que el supervisor registra por centro se cuenta en la eficiencia de todos los módulos | `2271`, `guardarRegistroTallas 1883` | Exigir recurso al registrar desde Control de piso en centros con varios; las líneas sin recurso cuentan solo en la vista del centro |
| H12 | Registrar la asistencia desde la tablet **mueve el programa**: `capDia` toma `S.turnos.pers` del día → `programar()` → `programadoPara`; «Hoy somos 10» puede sacar una orden de la cola del módulo | `capDia 934-935`, `programadoPara 2234-2237` | Lo iniciado no se mueve: fijar el recurso al primer INICIO (auditado) o mirar el congelado del día. Toca `programadoPara` → autorización |
| H13 | Un evento por paquete **no puede vivir en `avance[oid]`**: `fusionarFila` compara por clave de primer nivel y dos tablets sobre la misma WH van a `CONFLICTOS` («Dejar lo mío / Quedarme con lo del servidor») a la operaria | `fusionarFila 704-712`, `prepararSubida 736-749` | Tabla propia insert-only con id por fila (sin fusión) |
| H14 | `prepararSubida` **sube como siempre si no pudo releer** del servidor (wifi que falla en lectura y pasa en escritura = pisar sin aviso); `refrescar()` recarga todo sin guardar y con un `SAVE_ERR` pendiente descarta el tramo; no hay cola local | `741`, `refrescar 863` | Si falla la lectura no subir esas filas; `refrescar` bloqueado con `SAVE_ERR`; cola en localStorage para avance/turnos/paros |
| H15 | Las políticas del piso permiten **update en bitácora** y en cualquier fila de avance/turnos | `SUPABASE_POLITICAS_TABLET.sql:47-55` | Nueva política por fila (`actualizado_por = auth.uid()` o recurso de la tablet) y solo insert en bitácora y en la tabla de eventos. SQL nuevo, sin ejecutar |
| H16 | `mCorregirTramo` arma la fecha con `toISOString` (UTC: la hora sale corrida); `topeHorasTramo` usa `||10` (un 0 configurado no se respeta); `hoy()` es UTC → **la jornada del sistema cambia a las 19:00 hora Ecuador** | `2423-2426`, `2419`, `hoy 670` | Corregir los dos primeros; la regla de «hoy» se decide UNA vez para todo el sistema (130 llamadas), no un `hoyLocal()` para el piso |
| H17 | **Una WH partida entre dos módulos no existe**: `programar()` elige un recurso por paso, el supervisor fija uno, `programadoPara` exige `x.rec===rec`, y el cierre es por centro: «Terminar orden» desde el módulo 1 cierra el paso de toda la WH | `1645-1651`, `8092-8093`, `2237`, `7497-7499` | Decisión D10 antes de la semana 0 |
| H18 | **Maquila es un recurso del centro módulos con `pers:20, min:480, efic:85` sembrados**: un INICIO/FIN desde su tablet multiplicaría el tiempo por 20 | `526`, `personasTramo 2282` | `esMaquila(rec)` excluye de tramos, asistencia, eficiencia y sospecha; su registro es recepción por total con fecha de guía |
| H19 | El semáforo del tramo compara el minuto real **directo contra el SAM con 15 % de tolerancia**; el motor espera SAM ÷ (poli/100) ÷ (efic/100) | `calcTramo 2332-2334` | Esperado con sus tres fuentes a la vista; decidir con Ingeniería qué factor corrige (D9) |
| H20 | **Segundas sin ciclo** en producción: `avance.seg[centro]` es un contador sin causa ni destino; `setSeg` asigna y `guardarTramo` suma (dos escritores); una prenda reparada y vuelta a registrar entra como buena | `2409-2410`, `setSeg 9594` | Destino reparar/descartar/recuperada, tramo `reproceso:true` fuera del comparador, un solo escritor aditivo |
| H21 | `t.pers` se congela al guardar pero `calcTramo` recalcula `personasRec` en vivo: si la asistencia se corrige después, **dos SAM reales para el mismo tramo** | `2327-2328`, `2409` | Manda `t.pers` congelado + `persFuente` a la vista; recalcular solo por corrección auditada |
| H22 | **Borrar datos de prueba** vacía avance/turnos/paros (`TABLAS_OPERATIVAS`) y **Restaurar** reemplaza esas tablas por las del archivo | `9013`, `borrarOperativo 9111-9125`, `restaurarDesde 12364-12377` | El borrado de prueba se decide ANTES de la semana 0 (o nunca); Restaurar debe negarse o conservar filas del piso posteriores al respaldo |
| H23 | `aplicarLMO` regenera `S.operaciones` con ids nuevos y **pierde `orden`/`ordenMeta`**; solo recuelga `opsSam` por `cod|catP` | `10300-10310` | Todo estudio de Ingeniería se guarda por `cod|catP`, nunca por id de operación; y recolgar también `orden` |
| H24 | Las operarias **ya existen** (`S.params.operarias`: nombre, módulo, especialidad) y solo las usa el balanceo; `delOperaria` hace `splice` (desaparece el id); `operariasDe(rec)` no contempla prestadas | `8796-8804`, `modulosVistaHTML 8822` | Es el catálogo del Nivel 2: `activa:false` en vez de borrar (GUARDIA), «módulo del día» en la asistencia para prestadas |
| H25 | No existe perfil `ingenieria` ni `gerencia`; `veCentro` filtra por centro, no por persona: la eficiencia por operaria sería visible desde cualquier tablet del centro | `defPerfiles 588-596`, `PERMISOS_DEF 586` | Permiso `verPorPersona`; decisión D13 sobre el uso laboral del dato |

---

## 2 · La versión mejorada, paso a paso

Cada paso dice qué reutiliza, qué es nuevo, cuánto cuesta y qué tiene que ser verdad antes de empezarlo. **Ninguno toca
`programar()`/`nivelar()`**; los dos puntos que rozan una definición única (H12, `programadoPara`; H3, «nada se borra») van
marcados «autorización».

### Paso 0 · Semana 0: configuración y decisiones, sin código (tú + Ingeniería)

- P01: un usuario `tablet` por módulo piloto (Usuarios → Tablet: centro y recurso). P03: motivos de la tabla 15 en los
  usos `paro`, `piso`, `cierre`, `cierreSinTiempo` (hoy vacíos = «Hecho» no aparece en la tablet). Tabla 18: ventanas de
  descanso de módulos (sin ellas el minuto real sale inflado). Parámetros de tablet (`minMinutosCierre`, `topeHorasTramo`,
  `diasVentanaTablet`, `tolMinPrenda`) revisados con Ingeniería.
- **P02 no**: ya está ejecutada (H1).
- Decisión D10 (WH entera por módulo) y D11 (borrado de prueba antes o nunca) — sin ellas el piloto no arranca.
- **Medir en una Lenovo** (H9): `cargarTodo`, `programar()` y `_save` por toque con los datos reales. Si pasa de ~2 s,
  D15 antes de seguir.
- Reunión de 30 min con líderes y operarias (igual que la propuesta original).

### Paso 1 · Base sin fugas (código, ~6 h + pruebas) — antes de que una operaria toque nada

| Arreglo | Hallazgo | Nota |
|---|---|---|
| Quitar el recorte de 90 días y el borrado al vaciar en `setAsist`; GUARDIA: ningún `filter` por fecha sobre `S.turnos` | H3 | **autorización «nada se borra»** |
| `t.sam` congelado en `guardarTramo` (y `std` en cada línea de `tallasLog`); `calcTramo` lo prefiere | H4 | el comparador deja de moverse |
| `deshacerHechoCentro` **anula** la línea «(total)» (marca `anulada`, motivo, auditoría) en vez de dejarla contando; `hechasDelDia` ignora anuladas | H5 | patrón «anular + reemplazar» para tramo, línea, paro y asistencia por fecha |
| `parosDia(rec,d)` = `t.paros` ∪ `S.paros`, única lectura para Ejecución, Costura y `hayRegistroEn` | H7 | un solo dato |
| Bandeja `tramoSinUnidades` (Hoy + arriba de Mi centro) con «Completar unidades» | H10 | reutiliza la pantalla de tallas |
| `hechasDelDia`: líneas sin recurso solo en la vista del centro; Control de piso pide recurso en centros con varios | H11 | |
| `mCorregirTramo` sin hora UTC; `topeHorasTramo` respeta 0; `esMaquila(rec)` fuera de tramos/asistencia/eficiencia | H16, H18 | |
| `prepararSubida` no sube si no pudo releer; `refrescar` bloqueado con `SAVE_ERR`; cola local de avance/turnos/paros | H14 | |
| `delOperaria` → `activa:false` (GUARDIA) | H24 | |

### Paso 2 · Mi centro del líder (código, ~8 h + pruebas) — Nivel 1, semanas 1–2

- **Una lista y un botón** para el perfil tablet: se dejan de dibujar `cola.map(card)`, «Cambiar fase» y el cronómetro viejo
  (las funciones no se borran) (H6).
- **«Hoy somos N»** arriba de Mi centro, prellenado con ayer → ajuste de la semana → personas del recurso (mismo orden que
  `personasTramo`), confirmado en un toque en el primer INICIO; escribe en `S.turnos` con `u`/`ts`. **Lo iniciado no se
  mueve** (H12): al primer INICIO se fija el recurso de esa orden (auditado) — **autorización**, toca `programadoPara`.
- **Cambio de orden en un toque**: INICIO sobre B con A abierta = FIN de A → tallas de A → Guardar → arranca B sola
  (`TRAMO.siguiente`); B queda encadenada a A y, si A cerró con faltante y B empezó dentro de X min (parámetro), los dos
  se marcan `traslape` (no se esconde: se lee agregado).
- **«Cerrar el día»** = FIN + tallas parciales + `continua:true`; a la mañana la orden sale en En proceso con CONTINUAR. El
  paro «Cierre del día» se desactiva para los módulos piloto (H8).
- `t.pers` congelado manda (H21); segundas con destino (reparar / descartar / recuperada) y un solo escritor (H20).
- **Tablero de adopción** (Control de piso y Salud del sistema, solo lectura): por módulo y día, asistencia registrada,
  órdenes programadas con tramo / sin tramo, tramos olvidados y corregidos, tramos con 0 unidades o `excede`, cierres sin
  tiempo ÷ cierres. Es lo que Ingeniería revisa 5 minutos cada mañana con el líder.

### Paso 3 · Ingeniería desde la semana 1 (código, ~8 h + pruebas)

- **`samRealSemana(rec, tipoProducto)`** = Σ minutos-persona ÷ Σ prendas de los tramos cerrados de la semana, contra
  `t.sam` congelado; **nunca por orden** (H4, traslape). Con mínimos como parámetros (`minTramosSAM`, `minPrendasSAM`);
  por debajo, «pocas observaciones» en gris, no una alerta.
- **Esperado con tres fuentes a la vista** (H19): esperado = SAM ÷ (poli/100) ÷ (efic/100); el semáforo de `calcTramo` y la
  sospecha comparan contra ese esperado, y la pantalla dice de dónde sale cada factor y dónde se cambia.
- **Bandeja «SAM bajo sospecha»** en Hoy y en Operaciones (`tiemposHubHTML`): real ÷ esperado fuera de `tolMinPrenda`
  durante `diasSospecha` días (parámetro), con dónde se arregla.
- **Estudios de Ingeniería** en `S.params.estudiosSAM` por `cod|catP` (H23): tiempo normal, fuente (Kronos / PCP),
  analista, fecha, observaciones; se recuelgan al recargar la hoja LMO (y `orden` con ellos).
- **Suplementos**: tabla sembrada «sugerida» en Operaciones, **sin aplicar** (H2); columna comparativa «SAM con
  suplemento» hasta D9; cuando se decida, UNA fórmula `samAplicado` y bitácora.
- **Compuerta** (dos semanas seguidas, medida en el tablero del paso 2): ≥ 90 % de órdenes programadas con tramo ·
  cierres sin tiempo ÷ cierres ≤ 10 % · ≤ 1 tramo olvidado por módulo y semana · ≥ 90 % de días con asistencia. Los
  umbrales son parámetros.

### Paso 4 · Nivel 2 mínimo, UN módulo, sin QR (código, ~20 h + pruebas) — solo si la compuerta pasa

- **Tabla `registros`** con el esquema de la casa (`id, data, actualizado, actualizado_por`), **insert-only para el piso**
  (política nueva, H15), **fuera de `TABLAS`** (lectura por módulo y rango de fechas, no la tabla entera al arrancar; `_save`
  no la serializa en cada toque). Un evento = `{ts, rec, operaria, operariaN, oid, paquete, operacion (cod|catP), cant,
  defectos[], sam (congelado), origen}`; un error se **anula** con otro evento (`origen:'ajuste'`, motivo, auditoría).
- **Paquetes** en `avance[oid].paquetes` con **corte como único escritor** (desde la curva de corte o archivo con
  `leerTabla`), `tallas{}` (no una sola), estado activo / anulado / dividido con motivo; número de Kronos como referencia
  si corte lo sigue generando allá (D4), sin depender de ningún POST. Conciliación de tres cifras a la vista: pedido ·
  cortado · empaquetado · registrado.
- **«Mi puesto»** como bloque de `vTablet` (no una página nueva): la operaria elige su nombre (catálogo del módulo ∪
  prestadas hoy, H24), ve su operación asignada (asignación del día = asistencia nominal en `S.turnos`, que alimenta el
  mismo `pers` que hoy lee el motor) y el paquete que sigue; toca **Listo** (≤ 6 toques, sin QR); defectos con motivo de la
  tabla 15 (uso `defecto`, sembrado vacío). Ve su conteo y su ritmo contra el esperado; **sin ranking**.
- **Regla de un solo dato**: en un módulo con registro por paquete, el **SAM real sale SOLO de los eventos**; el tramo del
  líder sigue existiendo para `hechasDelDia`, `puedeCerrarPaso` y el cierre (sus definiciones no cambian) y el FIN se
  **prellena** con los paquetes que pasaron la última operación.
- **Plan B (Nivel 1.5)**: si a las dos semanas la conciliación no llega a 95 %, el líder cuenta operaria × operación en
  2–3 cortes fijos del día (grilla con + / +10 / +25, ~40 toques del líder, cero de la operaria), también en `registros`.

### Paso 5 · Tablero, Gerencia y Kronos (código, ~8 h + pruebas)

- **Tablero del módulo**: por operaria y operación, paquetes, unidades, minutos ganados (unidades × sam congelado),
  minutos presentes (`ajusteRecDia(r,d).min` si existe, si no `r.min`, dicho en pantalla), eficiencia, real vs esperado,
  paros (con máquina opcional, motivo «cambio de estilo» sembrado), cuello de botella del día. Por semana en Avance por
  área con los mismos números.
- **Permiso `verPorPersona`** (Ingeniería / admin): sin él, todo se ve por módulo. Tarjeta en el Resumen gerencial por
  semana × módulo, sin personas, con la base escrita (H25, D13).
- **Kronos**: los módulos piloto dejan de leer tickets **cuando la conciliación llegue a ≥ 95 % durante N días**
  (parámetro), y se avisa a Gerencia con la nota de que la cifra de eficiencia cambia de base. Nunca por fecha fija.
- **Salud del sistema**: filas y bytes por tabla con umbrales (H9); tiempos de `cargarTodo` / `programar()` / `_save`
  medidos desde la tablet (`?captura=tablet` en el harness).

**Total estimado: ~50 h de construcción + pruebas del harness (≈ 5–6 noches), en ese orden.** Los pasos 1–3 son útiles
aunque el Nivel 2 no se construya nunca.

---

## 3 · Dónde vive cada dato y quién manda

| Dato | Hoy | Propuesta v2 | Quién manda |
|---|---|---|---|
| Operarias | `S.params.operarias` (solo balanceo) | el mismo catálogo + `activa:false` + módulo del día | el catálogo |
| Asistencia (personas) | `S.turnos[rec\|día].pers` (Control de piso) | el mismo dato, escrito también desde la tablet, con `u`/`ts`; nominal en `S.turnos[rec\|día].asist[]` que alimenta `pers` | `S.turnos` (es lo que lee `capDia` y `personasTramo`) |
| Tramo del módulo (INICIO/FIN) | `avance[oid].tramos[]` | igual + `sam` congelado + `siguiente` + `continua` + `traslape` | el tramo |
| Hechas del día | `hechasDelDia` (tallasLog + hechoC) | igual, ignorando anuladas y líneas sin recurso por módulo | `hechasDelDia`, única |
| Paros | `t.paros` (tablet) y `S.paros` (Control de piso), sin lector común | los dos siguen; **`parosDia` es la única lectura** | `parosDia` |
| Segundas | `avance.seg[centro]` (dos escritores) | un escritor aditivo con destino y causa | `guardarTramo` |
| Eventos por paquete y operaria | no existen (`mes_registro` sin uso) | tabla `registros`, insert-only, fuera de `TABLAS` | los eventos (SAM real del módulo con Nivel 2) |
| Paquetes | no existen (`mes_paquete` sin uso) | `avance[oid].paquetes`, corte único escritor | corte |
| Estándar | `samManda` → hoja → centro → botones → etiquetas → estimado | igual; `t.sam` / `evento.sam` son copias congeladas | la página Operaciones |
| Estudios de tiempo | no existen en el PCP | `S.params.estudiosSAM` por `cod\|catP` | Operaciones, con ✓ |
| Suplemento | no existe (los tiempos ya lo llevan, H2) | tabla sugerida sin aplicar hasta D9 | D9 |
| Esperado del tramo | SAM directo + 15 % | SAM ÷ poli ÷ efic, tres fuentes a la vista | Configuración (recurso, polivalencia, Operaciones) |

Las nueve tablas `mes_*` quedan documentadas en `SUPABASE_MES_SIN_USO.md` (a escribir) y no se borran ni se conectan.

---

## 4 · Decisiones

| # | Decisión | Recomendación v2 | Cambia vs original |
|---|---|---|---|
| D1 | ¿Nivel 1 primero? | Sí, y con **compuerta medida** antes de construir el 2 (no en paralelo) | sí |
| D2 | Catálogo de operaciones por referencia | Hoja LMO + estudios por `cod\|catP`; **no** `mes_operacion` | sí |
| D3 | Suplementos | **No se aplican** en el piloto; columna comparativa; ver D9 | sí |
| D4 | Código del paquete y etiqueta | Paquetes del PCP desde corte; número de Kronos como referencia; **sin QR** en el piloto; **sin POST** a Kronos | sí |
| D5 | Tablets | Reutilizar las Lenovo; **medir primero** `programar()` por toque en una | parcial |
| D6 | ¿Por operaria o por módulo? | Por operaria **en UN módulo**, sin QR; Plan B conteo del líder | parcial |
| D7 | ¿Estudios en Kronos o en el PCP? | Kronos cronometra; el resultado entra al PCP por `cod\|catP` desde la semana 1 | parcial |
| D8 | ¿Dejar de leer tickets desde la semana 3? | **Por compuerta** (conciliación ≥ 95 % N días), no por fecha | sí |
| D9 | **¿Qué factor corrige el dato real?** eficiencia del módulo (85 %), polivalencia por familia o el SAM — hoy los tres se multiplican | Decidir con Ingeniería antes de tocar cualquier % | nueva |
| D10 | **¿Una WH se trabaja entera en un módulo?** | Escribir la regla + bandeja si aparecen tramos de dos módulos en la misma WH; si no, autorizar recurso múltiple y cierre por recurso (motor) | nueva |
| D11 | ¿Borrado de datos de prueba antes de la semana 0 o nunca? ¿Bucket de respaldos creado? | Antes; toda tabla nueva del piso entra al respaldo completo | nueva |
| D12 | ¿Hay segundo turno u horas extra en camisetas? | Si sí, clave `rec\|día\|turno` (definición nueva, autorización); la regla de «hoy» se decide una vez para todo | nueva |
| D13 | ¿La eficiencia por operaria se usa para incentivos/evaluación? ¿Quién la ve? | Permiso `verPorPersona`; decidir el uso laboral antes del paso 4 | nueva |
| D14 | Segundas en confección: ¿se reparan en el módulo, van a un puesto, se descartan? ¿Quién decide? | Destino y causa en el registro; el descarte ajusta la cantidad del cierre con auditoría | nueva |
| D15 | Si la tablet tarda más de ~2 s por toque | Guardar sin recalcular el programa en la tablet (toca `save`/`vTablet`; autorización) | nueva |
| D16 | Maquila: ¿guía con fecha y cantidades? ¿registra algo más que la recepción? | Recepción por total con fecha de guía; excluida de tramos y eficiencia | nueva |

---

## 5 · Qué se descarta de la propuesta original y por qué

- Las **nueve tablas `mes_*`** (0 referencias; esquema que `_save` no escribe; duplican operarias, asistencia, paros y
  operaciones). Se documentan, no se borran.
- Las **tres pantallas nuevas** (Arranque de turno, Mi puesto, Tablero) como páginas aparte: van como bloques de Mi centro y
  Control de piso, con los componentes comunes.
- **Aplicar 12 % / 15 %** al SAM (H2, D9).
- **QR y POST a Kronos** en el piloto; **la fecha fija «semana 3»** para dejar tickets.
- **Construir el Nivel 2 en paralelo** a las semanas 1–2 (compuerta primero).
- **Eventos dentro de `avance[oid]`** (H13) y cualquier rpc con `jsonb_set` sobre `avance`.
- **Un solo nivel por módulo** con el tramo derivado de los paquetes: obligaría a reescribir `hechasDelDia`,
  `puedeCerrarPaso` y `hayRegistroEn` antes de salir en vivo. El tramo sigue; el SAM real sale de una sola fuente.
- **Retirar `S.turnos.pz/std`** (segunda cuenta de hechas que leen Ejecución, `calcularPlan` y Cumplimiento) durante el
  piloto: es una entrega aparte, anotada, no del piloto.

---

## 6 · Preguntas que necesito respondidas antes de la semana 0

1. ¿Una WH se trabaja entera en un módulo o es normal partirla? (D10)
2. ¿Hay segundo turno u horas extra frecuentes en camisetas, y a qué hora empieza y termina cada uno? (D12)
3. ¿Cuándo se corre «Borrar datos de prueba» respecto al piloto? ¿Está creado el bucket `respaldos`? (D11)
4. ¿Qué se hace con una prenda de segunda en confección y quién decide? (D14)
5. ¿Las operarias se prestan entre módulos? ¿Hay volantes sin módulo?
6. ¿La eficiencia por operaria se usará para incentivos o evaluación, y quién puede verla? (D13)
7. ¿Los paquetes de Kronos son siempre de una talla o hay mixtos/remanentes? ¿Cuántas prendas trae un paquete de camiseta?
8. ¿Los módulos almuerzan a la misma hora o escalonado? (las ventanas de descanso hoy son por centro)
9. ¿Qué factor quieres que corrija el dato real: eficiencia del módulo, polivalencia o el SAM? (D9)
10. ¿Las tablas `mes_*` tienen RLS activado? (la clave pública está en el HTML publicado; no lo puedo ver desde el repo)

Con D1–D4, D9, D10 y D11 respondidas arranco por el paso 1 (base sin fugas), que es útil aunque no haya piloto.
