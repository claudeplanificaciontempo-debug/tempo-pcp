# Se perdieron los datos el 23-sep-2026 · qué pasó y qué se hizo

**Lo que pasó:** a media mañana la base quedó sin órdenes, sin avance y casi sin bitácora. La configuración (centros,
recursos, telas, colores, categorías, perfiles) y las fotos quedaron intactas.

---

## 1 · Auditoría (hora de Ecuador)

| Hora | Quién | Qué |
|---|---|---|
| 08:23–08:28 | — | 35 intentos de ingreso fallidos (contraseña incorrecta) |
| 08:29 y 08:36 | Jannine | Se crean los dos usuarios nuevos. A las 08:36 el servidor **rechaza dos guardados (401)** y hay un cierre de sesión |
| **09:12** | **Jannine** | **DELETE** de órdenes (6 lotes), avance (3 lotes) y bitácora (5 lotes) |
| **09:23** | **Fernando** | DELETE de avance (4 lotes) y un turno |
| **09:28** | **Fernando** | DELETE de rutas, operaciones, cargas, plan de octubre y el resto de la bitácora; y se reescribe `params` con las siembras de «instalación nueva» |

**No fue una función de borrado.** Las peticiones son `DELETE /rest/v1/<tabla>?id=in.(…)` por lotes: la firma del
`del()` de `_save`, que quita del servidor las filas que **esa pestaña ya no tiene en memoria**. Se descarta el resto:

- **No fue «Borrar datos de prueba»**: deja respaldo, escribe INICIADO/TERMINADO en la bitácora y `S.params.borrados[]`,
  y **no** toca la bitácora. Nada de eso está.
- **No fue «Restaurar»**: habría dejado `S.params.restauraciones[]`. Está vacío.
- `params` quedó **sin** `borrados`, `restauraciones`, `auditoriaCambios` ni `fotosIdx`: fue **reemplazado** por un
  params recién sembrado, que es lo que hace una sesión que arranca sin datos.

**Causa:** dos pestañas guardaron con la memoria vacía o a medias. La sesión se rompió al crear los usuarios (los dos
401 y el cierre de sesión de las 08:36); desde ahí, lo que la pestaña tenía cargado dejó de coincidir con el servidor y
al guardar «sincronizó» borrando. Con Fernando pasó lo mismo: su sesión arrancó como instalación nueva —por eso escribió
las siembras— y se llevó lo que quedaba.

## 2 · El freno (para que no vuelva a pasar)

`frenoBorrado(tabla, ids, memoria)` dentro de `_save`: **si la pestaña no tiene NINGUNA fila de esa tabla en memoria y
el guardado iba a borrar 10 o más en el servidor, no se borra nada.** Sale un aviso fijo en pantalla («Se frenó un
borrado… recarga la página») con botón de recargar, y queda una línea en la bitácora.

- El umbral es un parámetro (`minBorradoSospechoso`, 10), no un número escondido.
- **Quitar filas sueltas sigue funcionando** (probado: quitar 3 órdenes las quita).
- **Reemplazar un conjunto teniendo datos en memoria sigue funcionando** (restaurar un respaldo, cargar el demo).
- El borrado de datos de prueba tiene su propio camino (`BORRANDO`) y no se ve afectado.
- Pruebas **FB** (5) sobre el volcado real: con la memoria vacía la base queda intacta, sale el aviso y la línea de
  bitácora; con datos, todo normal.

## 3 · La cabecera

Por pedido de la usuaria salen de la cabecera **Actualizar, Respaldo y Restaurar**: arriba solo queda **Salir**.
Respaldo y Restaurar viven ahora en **Configuración → Borrado**, que es la pestaña de administrador. Para releer del
servidor está el aviso de «hay datos nuevos», que ya trae su propio botón.

## 4 · Que el trabajo de rutas no dependa de la base

**Órdenes → Rutas → «Exportar rutas»**: un Excel con una fila por WH — WH, ID de tarea, cliente, estilo, color, ODC,
categoría, fase, prendas, **la ruta completa en orden** (nombres y códigos), los tiempos por paso, si está confirmada,
quién y cuándo, y qué pasos se agregaron o quitaron a mano. También hay CSV.

**Órdenes → Rutas → «Cargar rutas»**: lee ese mismo archivo, cruza por **WH** (o por el **ID de tarea**) y deja cada
ruta tal cual, **confirmada por persona**, con quién y cuándo según el archivo. Vista previa antes de aplicar: cuántas
calzan, cuántas cambian, qué WH del archivo no existen aquí, qué centros no se reconocen. Auditoría por orden y una
línea de bitácora; queda en el registro de cargas como tipo «Rutas por WH (archivo)».

Con eso, el trabajo de rutas se saca a un archivo y se vuelve a poner después de recargar las órdenes desde Odoo.

## 5 · Qué se puede recuperar del incidente

- **Respaldo en el servidor**: `respaldos/respaldo_antes_de_borrar_2026-09-20T02-42-25-110Z.json` (5,3 MB), del
  **19-sep 21:42**. Trae cartera, avance, rutas y bitácora de ese momento; se perdería lo del 20, 21, 22 y 23.
- **Copias diarias de Supabase**: hay que mirarlas en el panel (Database → Backups). Si existen, se pierde mucho menos.
- **Las órdenes se reconstruyen** cargando el archivo de Odoo. Lo que no vuelve así: avance del piso, liberaciones,
  rutas confirmadas, congelados y bitácora.
- **Fotos intactas** (755 archivos) y toda la configuración.

## 6 · Lo que queda por decidir

- Restaurar el respaldo del 19-sep, restaurar una copia diaria si existe, o partir de cero con la carga de Odoo.
- La RLS solo acota hoy a los perfiles de piso: un perfil de planificación puede escribir y borrar en todas las tablas.
  El freno es del lado de la app; la regla dura sería en la base.
