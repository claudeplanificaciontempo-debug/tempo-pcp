# Tablet: permisos, cabecera y búsqueda del operario — reporte

Fecha: 15-sep-2026, noche. Motor sin tocar. Pruebas del simulador: **1.008 (9 nuevas), todas verdes, 0 errores**.

## 1 · Permisos en Supabase

### a) Las políticas actuales: no las pude leer
La app se conecta con la **clave pública** (anon). Con esa clave **no se puede leer `pg_policies`**: es una vista del
catálogo del sistema y PostgREST no la expone. Tampoco entré a producción con tu cuenta: las credenciales son tuyas.

Dejé en el repo **`SUPABASE_POLITICAS_ACTUALES.sql`** con las cinco consultas listas (políticas, qué tablas tienen RLS,
columnas de `perfiles`, roles en uso y funciones auxiliares). Las corres en Supabase → SQL editor y pegas el resultado
al final del archivo. No lleva datos de clientes, así que se puede publicar sin riesgo.

### b) Por qué el perfil tablet queda fuera
El error dice **«new row violates row-level security policy»** en `bitacora` y `avance`. Eso significa que en esas
tablas hay RLS activo y una política de escritura cuya condición **no se cumple** para ese usuario. Las tres causas
posibles, y todas se distinguen con el volcado:
1. la política lista roles concretos (por ejemplo `admin`, `planificacion`, `corte`) y **`tablet` no está en la lista**;
2. la política mira una columna de `perfiles` que ese usuario no tiene llena;
3. no hay ninguna política de `insert`/`update` para esas tablas, y entonces **nadie** puede escribir salvo el service role.

Lo que sí es seguro: **la app guarda en `avance` y `bitacora` cada vez que el operario registra**, así que sin permiso
de escritura ahí, la tablet no puede trabajar.

### c) y d) La propuesta
Está en **`SUPABASE_POLITICAS_TABLET.sql`**, sin ejecutar. En resumen:
- **Lectura** para cualquier usuario autenticado en las tablas que Mi centro necesita (órdenes, avance, centros,
  recursos, categorías, colores, telas, rutas, operaciones, programas, planes, turnos, paros y bitácora).
- **Escritura solo en cuatro tablas**: `avance`, `bitacora`, `turnos` y `paros`, y solo para los perfiles de piso
  (`tablet`, `corte`, `modulos`, `terminado`, `piso`, `tejeduria`, `tintoreria`), para que los que ya registraban no
  pierdan lo que hacían.
- **Sin permiso de borrado** para el piso, y **sin escritura** en órdenes, params, centros, recursos ni configuración.

Un dato importante para entender el alcance: el **tramo de trabajo** (inicio, fin, paros, unidades por talla) y las
**segundas** se guardan dentro de `avance`; la **asistencia del día**, en `turnos`; los **paros generales**, en `paros`.
No hay ninguna tabla nueva: por eso la propuesta se limita a esas cuatro.

**No ejecuté nada.** Dime si la corres tú o si me autorizas a hacerlo.

### e) La app ya no pierde lo escrito
Antes, si el guardado fallaba, la app recargaba todo desde el servidor y el registro se perdía. Ahora:
- **no recarga nada**: lo que el operario registró sigue en pantalla;
- aparece un aviso arriba de Mi centro: **«No se guardó en el servidor. Lo que registraste sigue aquí: avisa a
  planificación y vuelve a tocar Guardar»**, con un botón **Reintentar**;
- si la causa es de permisos, el aviso lo dice con esas palabras en vez de mostrar un error técnico;
- cuando el guardado sale bien, el aviso desaparece solo.

## 2 · Cabecera del operario
**Respaldo** y **Restaurar** solo se ven con permiso de configuración. El operario y los perfiles de piso ven
únicamente **Actualizar** y **Salir**.

## 3 · Búsqueda por WH en Mi centro
El campo **«Buscar WH»**, grande, quedó **arriba de todo**, antes del flujo y de las tarjetas. Si la WH está programada
en su recurso, aparece su tarjeta; si existe pero no está programada ahí, sale bloqueada con **«no programada · pedir
reprogramación»** y el botón que avisa a planificación. En teléfono, la barra general de la cabecera pasa a ocupar el
ancho completo en su propia línea, así no queda cortada.

## 4 · Tallas en producción: no lo puedo comprobar desde aquí
No puedo leer la base de producción sin entrar con una cuenta, y no voy a usar la tuya. Lo que sí sé, por el trabajo
anterior: **el archivo que enviaste no era cargable** (traía WH, pedido y EAN, pero **sin cantidades por talla** y con
la WH repetida solo en la primera fila de cada grupo), así que, salvo que hayas cargado otro archivo distinto después,
**no debería haber ninguna orden con curva de tallas**.

Cómo verlo en dos clics, con tus datos:
- **Configuración → Órdenes y materiales → 16 · Tallas**: al final del panel dice la última carga, con fecha, quién y
  cuántas órdenes recibieron curva. Si no hay línea de última carga, no se cargó nunca.
- **WH/MO/28300**: escríbela en la barra de búsqueda general. La ficha muestra «Avance por talla» si tiene curva, o
  «Sin curva de tallas cargada» si no.

Si me confirmas que quieres que lo verifique yo, necesito que me digas cómo entrar sin usar tu cuenta personal.

## 5 · Sobre la prueba con el usuario tablet real
No entré a producción como «Modulo 1 · tablet»: no tengo su contraseña y no voy a crear ni usar cuentas. Además, el
error es de base de datos: **hasta que no corras el SQL, cualquier prueba con ese usuario va a fallar igual**. Lo que sí
está probado en el simulador es todo el flujo (iniciar, paro, fin, guardar), el aviso cuando el servidor rechaza el
guardado, la cabecera sin Respaldo ni Restaurar y el buscador arriba.

## Qué se probó
- Cuando el guardado falla, el aviso queda en pantalla con el botón de reintentar y **no se recarga nada**.
- El aviso distingue el problema de permisos de un error cualquiera, y desaparece al guardar bien.
- El operario no ve Respaldo ni Restaurar; quien tiene permiso de configuración sí.
- El buscador de WH está arriba, antes del flujo y de las tarjetas, y una WH no programada en el recurso sale bloqueada.
