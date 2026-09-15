# Dirección · Escenarios fuera y Hoy con tarjetas — reporte

Fecha: 15-sep-2026. Motor sin tocar. Pruebas del simulador: **827 (10 nuevas), todas verdes, 0 errores**.

## 1 · Escenarios borrado
Antes de borrarlo revisé qué guardaba: **nada**. Los cambios que se probaban ahí (personas, días, maquila, horas de
tejeduría) vivían solo en memoria mientras la pantalla estaba abierta; nunca se escribían en la base ni en la
configuración. Por eso no se perdió ningún dato.

Se quitaron la entrada del menú, la página, el estado, la comparación con el programa y la única referencia que quedaba
(el enlace «probar más personas o días en Escenarios» de Programación por centro). El simulador de capacidad del Plan
mensual, que es donde hoy se prueban personas y días y sí guarda con motivo, quedó intacto.

## 2 · Hoy
**Arriba, tarjetas del componente común** en vez de los KPIs planos: a tejer hoy, baños hoy, programadas hoy, entregas en
7 días, vencidas y última carga. «A tejer hoy» y «Programadas hoy» abren la lista de qué se está haciendo, **agrupada por
familia** con órdenes y prendas por grupo.

**Sección «Bandejas del día»**, ocho tarjetas, cada una con su lista agrupada por familia:
órdenes sin fecha, por liberar (tela), entregas de esta semana, en riesgo según el programa, vencidas sin terminar, por
terminar en 7 días, tela externa por llegar y por liberar a corte (corte programado en 3 días).

Dentro de la lista, cada orden lleva **foto, WH y fase**, y un enlace **«ver dónde está →»** que abre la pantalla donde se
resuelve su estado: Órdenes si le falta fecha o WH, Compras si está en diseño o compras, Liberación si espera liberarse,
Tintorería si está en tela, Programación del centro del próximo paso si ya está en planta, y Control de piso como último
recurso. Siempre con el **← atrás**, que devuelve a Hoy con los filtros y la posición.

**Sección «En máquinas hoy»** agrupa con nombre los tres paneles de tejeduría, tintorería y planta, que quedaron como
estaban.

**Mes en curso** no se tocó.

## 3 · Necesita decisión
Sección propia con tarjetas, sin repetir ninguna tabla:
- **Baños por armar y confirmar**, con la lista corta de siempre y enlace a Tintorería.
- **Centro-mes que no alcanzan**, con el conteo de nuevos sin ver y enlace a **Capacidad y decisiones**, que sigue siendo
  una pantalla aparte: ahí vive el detalle, el historial y las decisiones anotadas.
- **Órdenes que el programa dice que no llegan**, que despliega la lista agrupada por familia.
- **Faltantes de tintorería esperando baño**, con enlace a Tintorería.

Si no hay nada que decidir, la sección lo dice en una línea.

## Qué se probó
- Escenarios no existe en el menú, ni como página, ni como código, ni en el catálogo de páginas.
- Hoy muestra las seis tarjetas de arriba y las ocho bandejas como tarjetas, con sus secciones con nombre.
- Al abrir una bandeja, la lista sale agrupada por familia, con foto, WH y fase, y con el enlace al estado de cada orden.
- El clic en una orden lleva a otra pantalla dejando el «← atrás», y el atrás devuelve a Hoy.
- «Necesita decisión» enlaza a Capacidad y decisiones en vez de repetir su tabla.
- Mes en curso sigue igual.

## Revisión posterior (mismo día)
Al repasar el punto «todo clic que lleva a otra pantalla usa el ← atrás» encontré uno que se me había escapado: el aviso
de capacidad de la tarjeta «Otros» saltaba a Capacidad y decisiones cambiando la página a mano, sin dejar rastro para
volver. Ya usa el mismo camino que el resto, así que también deja el ← atrás. Agregué una prueba que falla si aparece
cualquier clic de Hoy que salte de pantalla sin pasar por ahí. Harness: 830 pruebas, todas verdes.
