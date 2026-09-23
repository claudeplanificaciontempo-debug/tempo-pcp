# Varias referencias corriendo a la vez en el mismo puesto (23-sep-2026)

**Decisión de la usuaria:** «En piso pueden producir hasta tres o cuatro referencias al mismo tiempo, porque está
saliendo una, en la mitad está otra y está entrando otra producción. Que nos deje poner varias órdenes corriendo
tiempos.»

---

## 1 · Qué había

Un puesto solo podía tener **un tramo abierto**. Empezar otra orden preguntaba «ya hay una orden empezada: ¿la cierras
ahora?» y obligaba a cerrar la primera. En un módulo que corre tres referencias a la vez eso es falso: o se cierra algo
que no terminó, o no se registra el tiempo de las otras dos.

## 2 · Qué hay ahora

- **Hasta 4 órdenes a la vez por puesto** (`maxTramosAbiertos`, parámetro editable). Al llegar al máximo, la tablet
  dice cuáles están corriendo en vez de dejar abrir otra a ciegas.
- **Mi centro muestra una tarjeta por orden en curso**, cada una con **su propio reloj**, su PARO y su FIN, y debajo
  queda la cola para empezar la siguiente.
- **El tiempo no se cuenta dos ni tres veces.** Los minutos-persona de un tramo son `trabajado × personas`, y las
  personas del puesto **se reparten entre las órdenes que corrían a la vez**: con 12 personas y 3 órdenes, cada una
  toma 4. Una hora de trabajo da 240 min-persona a cada orden, 720 en total = 12 personas × 60 min. La capacidad del
  módulo sigue siendo la que es.
- **El líder puede decir cuántas personas van en cada orden** (campo en la tarjeta): eso manda sobre el reparto y queda
  en la bitácora. Si no lo dice, se reparte y **la pantalla escribe que está repartido** («repartidas entre 3 órdenes
  que corrían a la vez en este puesto»), no lo esconde.
- El reparto mira el **solape real en el tiempo**, no «cuántas hay abiertas ahora»: una orden que corrió sola media
  hora y acompañada la otra media no paga el reparto completo.

## 3 · Lo que no cambió

El SAM, el cierre del paso (`puedeCerrarPaso` sigue sumando el tiempo corrido de esa orden en ese centro), las
unidades por talla, los paros y el motor de programación. Solo cambió **cuántas órdenes puede tener abiertas un puesto
y cómo se reparten las personas entre ellas**.

## 4 · Pruebas

Bloque **TS** (6): un puesto abre varias sin cerrar la anterior y sin preguntar · las personas se reparten y la suma da
exactamente las del puesto (12 = 4+4+4) · la pantalla dice que están repartidas · lo que escribe el líder manda y queda
en bitácora · hay un máximo y al llegar se avisa cuáles corren · Mi centro dibuja un reloj por orden en curso. Se
actualizaron dos pruebas viejas que describían la regla anterior (una sola orden por puesto, un solo reloj).

Harness r=119: 2.860 comprobaciones, 0 rojas, 0 errores.

## 5 · Para mirar cuando se use

- **El tope de 4**: si en algún módulo corren cinco, se sube el parámetro.
- **El reparto automático** es lo razonable cuando nadie declara personas, pero el dato bueno es el que escribe el
  líder. Si al revisar los SAM reales aparecen tiempos raros, lo primero que hay que mirar es si las órdenes tenían
  personas declaradas o repartidas.
