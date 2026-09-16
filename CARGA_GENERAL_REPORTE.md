# Carga general con una sola cuenta — reporte

Fecha: 15-sep-2026. Motor sin tocar. Pruebas del simulador: **923 (19 nuevas), todas verdes, 0 errores**.

## 0 · Una advertencia de orden
Pediste hacer esto **después de lavado y plancha**, pero ese prompt nunca llegó: en el mensaje original venía como
marcador, «[pegar el prompt completo de lavado y plancha]». Así que hice lo que no depende de él y dejé la reserva
leyendo lo que ya existe en la configuración de esos dos centros: minutos por prenda y porcentaje estimado. Si el
prompt de lavado y plancha cambia ese modelo, la reserva se ajusta en un solo lugar.

## 1 · Una sola cuenta, con la base dicha en pantalla
Nueva función única `cargaUnica(base)`, donde la base es el conjunto de órdenes:
- **programadas**: lo liberado que el motor ya colocó en el programa;
- **todas las abiertas**: todas las órdenes abiertas, estén liberadas o no;
- **plan del mes**: las órdenes del plan (en proceso más las agregadas).

La fórmula es siempre la misma: minutos pendientes por centro, separados en **firme**, **en proceso** y **reserva**.
Lo único que cambia entre pantallas es el conjunto de órdenes.

- **Carga general** dice «base: programadas» y muestra, como segunda línea de cada centro, el número con la base «todas
  las abiertas».
- **Capacidad y decisiones** dice «base: todas las abiertas» y aclara que el número oficial del mes es el plan congelado.
- **El aviso de capacidad del Plan mensual** ahora sale de la misma función, con la base del plan.
- Hay una prueba que falla si, con la misma base, la cuenta única y el aviso del plan dan números distintos.

## 2 · Número oficial del mes
El oficial es el **plan congelado** (en proceso más agregadas). Cuando otra pantalla muestra un número distinto porque
su base es otra, lo dice en una línea debajo: cuál es el oficial, cuánto da aquí y por qué difieren.

## 3 · Carga general, pantalla por pantalla
- **Barra**: área (producción, tejeduría, tintorería), centro, filtro de fases común, buscador común y la nota de que
  son 8 semanas, con el nombre del parámetro.
- **Bloque 1 · Carga contra capacidad por semana**: una fila por centro y una columna por semana, con firme, en proceso
  y reserva separados, y el porcentaje de uso con el mismo umbral ámbar que Capacidad y decisiones. Cada celda es
  clicable.
- **Bloque 2 · Familia por centro**: unidades, horas y porcentaje del total, con botón para dar vuelta el cruce.
- **Bloque 3 · Detalle**: al hacer clic en una celda se abre la lista de órdenes con el agrupador común, foto, WH y
  fase, y el enlace que lleva a la pantalla donde se resuelve el estado de cada orden.

## 4 · Reserva de lavado y plancha
Se calcula sobre las órdenes que **no** tienen ese paso en la ruta: prendas pendientes × minutos por prenda ×
porcentaje estimado. Si al centro le falta cualquiera de los dos números, la reserva es **cero** y aparece la bandeja
«Lavado y plancha sin minutos ni % para la reserva» en Hoy → Pendientes, con el enlace a Configuración.

## 5 · Qué se movió (nada se eliminó)
- **Asignación por orden** pasó a **Reportería**, como pantalla propia, con la misma clasificación de siempre. Sigue
  entera; solo cambió de lugar.
- **Qué hay cargado en cada centro** (la tabla centro × categoría × semana) fue reemplazada por el cruce familia ×
  centro del bloque 2, que es el componente común y muestra lo mismo con unidades, horas y porcentaje.
- La tabla de carga por recurso y semana de Reportería por área **se queda** donde está.

**Lista final de lo que dejó de existir como pantalla**: solo el bloque «Qué hay cargado en cada centro» dentro de Carga
general. Ninguna pantalla, ningún dato y ninguna función de cálculo se borraron. Si prefieres conservar ese bloque tal
como estaba, dilo y lo devuelvo.

## 6 · Menú
Planificación de producción: Liberación a producción · **Carga general** · los seis centros · Balanceo · Programa del
día · Reportería por área.
Reportería: Vista general de órdenes · **Asignación por orden** · Producto en proceso · Cumplimiento · Avance del mes ·
Reportería textil · Reportería por área.

## 7 · Qué se probó
- Con la misma base, la cuenta única y el aviso de capacidad del plan dan el mismo número por centro.
- Cambiar de base cambia el conjunto de órdenes, no la fórmula.
- La base «todas las abiertas» suma exactamente los minutos pendientes de las órdenes abiertas.
- Carga general y Capacidad y decisiones dicen su base en pantalla, y la segunda dice cuál es el número oficial.
- Ocho semanas por defecto, leídas del parámetro.
- Asignación por orden existe, está en Reportería y ya no se repite en Carga general.
- Sin minutos ni porcentaje, la reserva es cero y avisa en Hoy; con los dos cargados, se calcula sobre lo que no tiene
  el paso en la ruta.
