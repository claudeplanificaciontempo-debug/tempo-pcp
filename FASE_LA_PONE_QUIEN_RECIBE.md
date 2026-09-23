# La fase la pone quien recibe la orden (diseño, 23-sep-2026 — SIN construir)

**Decisión de la usuaria:** «El operario de corte no siempre sabe a qué fase va: la ruta no es 1-2-3. De corte puede ir a
confección, a estampado o a bordado, y se puede confeccionar primero y estampar después, o al revés.» Acordado:

1. **La fase la pone quien recibe.** Cuando un centro toca **INICIO** en una orden, la fase pasa a la de ese centro.
   Nadie escoge ni adivina, y vale en cualquier orden dentro del tramo paralelo.
2. **Al cerrar** (visto o «Terminar orden»), la orden queda lista para todos los centros que le faltan. La fase no se toca.
3. **El supervisor o planificación**, al tocar el visto, ve «¿a qué fase pasa?» con la sugerida marcada.
4. **Moverse entre centros del mismo tramo paralelo no es retroceso.**
5. **Permiso acotado para el operario:** solo la fase de su propio centro, y solo al tocar INICIO.

El diseño lo hicieron cuatro analistas y lo atacaron cuatro revisores. Los cuatro coincidieron en que la idea funciona,
pero que **no se puede construir tal cual**. Lo que sigue es lo que hace falta.

---

## 1 · Lo que falta y solo tú puedes decir: «la fase de cada centro»

Hoy **no existe en ningún lado** cuál es la fase de un centro. La tabla de fases dice a qué **grupo** pertenece cada
fase, pero un grupo tiene varias: Serigrafía, Sublimado y Bordado están todas en el grupo «servicios», con el mismo
número 6. Si el sistema adivinara por el grupo, un INICIO en bordado podría poner «6Serigrafía».

Hace falta **una columna nueva, «fase de este centro»**, que tú confirmes fila por fila. **Mientras una fila no esté
confirmada, el INICIO de ese centro no mueve nada** (queda como hoy) y el centro sale en una bandeja de Hoy.

Propuesta para que la corrijas:

| Centro | Fase al tocar INICIO | ¿Seguro? |
|---|---|---|
| Corte | 4Corte Planta | sí |
| Estampado | 6Serigrafía | sí |
| Sublimado | 6Sublimado | sí |
| Bordado | 6Bordado | sí |
| Etiquetas | 6 Etiquetado | revisar |
| Confección (módulos) | 7Confección | sí |
| Confección · **maquila** | ¿5Maquila Conf? | **tú decides** |
| Botones | 8Botones | sí |
| Lavado | ¿8Lavandería o 8Lavandería Quito? | **tú decides** (¿según la modalidad de la orden?) |
| Plancha | ¿8Servicios y Terminados? | **tú decides** |
| Empaque | 8Empaque | sí |
| Apliques, Cordones, Calandrado | no hay ninguna fase que los describa | **tú decides** o se crea una |

## 2 · El candado principal: un INICIO nunca da por terminado un paso pendiente

Las fases «prueban» pasos: una orden en 7Confección, con la configuración de hoy, da por **hechos** el estampado y el
bordado. Si un módulo toca INICIO en una orden que todavía tiene que ir a bordado (confeccionar primero, bordar después),
pasar la fase a 7Confección **borraría el bordado en silencio**.

Regla: **si mover la fase dejaría por hecho un paso de su ruta que todavía no se cerró, no se mueve.** Queda como
pedido para el supervisor, con el motivo escrito.

Hay una forma de raíz: en la **tabla 5** (grupos de fases), apagar la casilla **«secuencial»** de *servicios* y
*confección*. Esa casilla existe justo para esto («el orden varía por orden: eso solo lo dice la orden de trabajo»),
pero viene encendida para todos los grupos. Apagarla cambia qué pasos se dan por hechos en las órdenes que están hoy en
confección. **Antes de apagarla se mide cuántas órdenes se reprograman, y tú decides.**

## 3 · El permiso del operario, en el servidor

Hoy la base de datos solo deja mover fases al supervisor. Hace falta una función nueva en Supabase (SQL que se deja
escrito, **no se ejecuta sin ti**) con estas reglas:

- la tablet **no manda la fase**: manda la orden y el centro, y el servidor calcula la fase con tu configuración;
- solo para el **centro asignado a esa tablet**;
- solo si hay un **INICIO abierto** de esa orden en ese centro;
- aplica el candado del punto 2 también en el servidor;
- si no puede mover, no escribe nada y la app deja el pedido para el supervisor, que lo aprueba con un clic.

**El reloj arranca siempre.** Aunque la fase no se pueda mover, el INICIO no se frena: el piso no se queda parado.

> **Aviso de seguridad (ya existe hoy, no lo trae este diseño):** la función `mover_fase`, que corre en producción
> desde el 16-sep, **no valida nada en el servidor**. Cualquier perfil que pueda mover fases (supervisores,
> planificación) puede, desde la consola del navegador, mandar cualquier orden a cualquier fase, sin motivo. Las
> reglas (motivo al devolver, etc.) viven solo en la pantalla. El riesgo es bajo (hace falta una sesión con permiso y
> saber usar la consola), y queda en la bitácora del servidor. Conviene endurecerla junto con la función nueva.

## 4 · La ventana de cierre del supervisor

- «¿A qué fase pasa?» ofrece **solo los centros que le faltan a esa orden** según su ruta, no las 46 fases.
- Con tramo paralelo salen todos: al cerrar corte → Estampado, Bordado y Confección.
- La sugerida sale en este orden: la fase actual si ya es una opción → un centro donde ya se empezó → el siguiente
  de la ruta.
- **Primero se guarda el cierre y se confirma que quedó**; recién después se mueve la fase. Si el cierre no se
  guardó (por ejemplo, otra persona tocó la misma orden), la fase no se mueve y se dice.

## 5 · Qué necesito de ti para construirlo

1. La tabla del punto 1, corregida (sobre todo maquila, lavado, plancha y los tres sin fase).
2. Si apagamos «secuencial» en servicios y confección (te traigo antes cuántas órdenes cambian).
3. Tu visto bueno para escribir el SQL del punto 3 (lo ejecutas tú).
