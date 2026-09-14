# Cuatro cosas: días de proveedor · ojales/botones · las dos liberaciones · tintorería

Fecha: 14-sep-2026. Commits `c636cc1` (A+B), `3b848a7` (C), `e7a1678` (D). Pruebas 577/577. No se tocaron capacidades ni
el motor, salvo lo autorizado en A (días de proveedor en laborables).

## A · Días de proveedor (15 laborables, estimado)

- La tabla se siembra con los 127 proveedores del catálogo a **15 días LABORABLES**, marcados **"estimado"**
  (pendiente de confirmar). Cuando editas un proveedor, se quita la marca y queda **"confirmado"**. En Configuración →
  Órdenes y materiales.
- **Días laborables, no corridos.** El código contaba días corridos (`dsum`). Ahora la espera de tela externa avanza en
  días laborables por el calendario del sistema (`dsumLab`, área producción + excepciones a todas).
- **Próxima recarga.** `rutaTextilDe` usa `diasProvOrden(o)` = el mayor de los días definidos de los proveedores de la
  orden (hoy 15 estimado). Verificado en producción: las 7 órdenes con paso de proveedor conservan `t=15`; con la espera
  en laborables su tela-lista se corre solo **+2 días** (de un arranque 7-sep: 22-sep corridos → 24-sep laborables),
  porque a 6 días/semana solo se saltan domingos. En la próxima recarga todas toman los días de la tabla.

## B · Ojales y botones (tiempos reales)

Los tiempos inflados venían de la **hoja LMO**: el centro Botones sumaba dos operaciones (ojal + botón) con SAM alto
(Polo 0,78+0,78 = 1,56 · Camisas 1,56+1,69 = 3,25 · Henley 1,56+0,78 = 2,34). **Para que no vuelvan, corrige también la
hoja LMO**; mientras tanto una tabla editable los sobrescribe.

Tabla nueva (Configuración → Órdenes y materiales), ojales + botones por prenda, que se suman:

| Coincidencia | Ojales | Botones | Centro Botones (antes) |
|---|---:|---:|---:|
| Polo (Básica/Moda) | 0,47 | 0,59 | 1,06 (antes 1,56) |
| Henley (MC/ML) | 0,47 | 0,59 | 1,06 (antes 2,34) |
| Camisa (MC/ML) | 1,73 | 0,36 | 2,09 (antes 3,25) |
| Capucha, Hoodies, Pantalón, Falda, Short | 0,26 | **0 (no aplica)** | 0,26 |

"No aplica" = 0 (hay prendas con ojal pero sin botón). Migré el paso de Botones en las **687 rutas** ya cargadas.

**Verificación contra producción:** promedio ponderado de septiembre — ojales **0,547** (producción 0,52) y botones sobre
las prendas que sí llevan botón **0,564** (producción 0,57). Cuadran. (Sobre todas las prendas con paso de botones el
promedio de botones baja a 0,46 porque los shorts/pantalones no llevan botón.)

**Capacidad de botones** (sep/oct/nov): **199→133 % · 149→101 % · 187→122 %**. Bajó mucho pero **sep y nov siguen sobre
100 %**: el tiempo por prenda ya es el real, así que ahora la duda es la **capacidad configurada** (¿son 3 personas
reales en ojales/botones, o parte va en los módulos?). Falta ese dato tuyo.

Sin regla (siguen con la LMO, reportado en Configuración): Vestidos y Jeans/Denim — no estaban en tu lista de ojales.

## C · Las dos liberaciones

- **Liberación general (Dirección)**: sin cambios de fondo — masiva **o** una por una, revisa la tela y edita la ruta.
  Al editar la ruta aquí queda marcada **"ruta revisada en general"**.
- **Liberación a producción**: **una por una siempre** — se quitó "Liberar todo lo filtrado" y "Marcar todas". Cada
  orden muestra si la ruta ya fue revisada en general, un botón para revisar/corregir la ruta, y **dos casillas
  obligatorias**: *materia prima verificada en bodega* e *insumos verificados en bodega*. Sin las dos, el botón Liberar
  está deshabilitado. Es una **firma humana** (el sistema no sabe si el material llegó; esa persona va a bodega y el
  stock sigue en el sistema anterior). Se guarda la **fecha de la verificación**.
- **Auditoría de ruta**: toda edición de ruta (en las dos liberaciones y en los centros) queda con quién, cuándo, qué
  cambió, por qué y **en qué etapa** (general / producción / centro). Se ve en Dirección → Auditoría de replanificación,
  panel "Auditoría de ruta".

## D · Tintorería

- **Perfil de tintorería**: nuevo permiso `armarBanos`, que tiene planificación pero **no** tintorería. Con el perfil de
  tintorería se **ve** el programa pero no aparece el panel Armar baños; sigue registrando salidas (Control de piso →
  Tintorería), dando el OK de calidad o marcando reproceso. No arma, no confirma, no reprograma.
- **Motivos de reproceso**: tabla editable (Configuración), sembrada con **"Falla de tela (viene de tejeduría)"** y
  **"No dio el tono / matización"**. Se quitó la lista fija del código. Cada motivo marca si viene de tejeduría.
- **Faltantes vs reprocesos** (los dos cargan tintorería, no son lo mismo):
  - **Faltante**: al confirmar el baño hecho, si salieron menos kilos que los programados por tela, la diferencia se
    reparte entre las órdenes del baño y queda en la **cola de planificación de tintorería** (panel Faltantes). El
    sistema **no decide la máquina**: muestra las restricciones y la planificadora asigna. Restricciones (tabla editable
    sembrada con **cuellos, puños, algodón**): si faltan complementos o algodón → **baño grande**; si el color ya está
    en el programa → entra con los grandes; si solo falta tela → **máquina pequeña posible**. Lo no marcado se reporta.
    "A armar baños" devuelve el faltante a la cola con esos kilos.
  - **Reproceso**: salió todo pero una parte está mal → vuelve a ocupar máquina y tinte (carga nueva sobre algo ya
    contado). Es el flujo que ya existía, ahora con los motivos configurables.
- **Reporte de tintorería del mes** (en la página de Tintorería): kilos **pedidos vs entregados**, **pendientes por
  faltante** y cuántos esperan baño grande, **kilos reprocesados por motivo** y **horas de máquina en rehacer**. Los
  reprocesos por *falla de tela* se marcan como problema de **tejeduría** (el problema está antes de tintorería).

## Pendientes tuyos
- Confirmar la capacidad real de ojales/botones (3 personas, o parte en módulos) — la capacidad sigue > 100 % en sep/nov.
- Corregir los tiempos de ojal/botón también en la hoja LMO para que no regresen en la próxima carga.
- Ir confirmando los días reales por proveedor (hoy todos en 15 laborables estimado).
