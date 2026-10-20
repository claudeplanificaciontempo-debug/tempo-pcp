# Órdenes de producción en una sola pantalla (20-oct-2026)

## Qué pidió la usuaria
- La pestaña Rutas decía «6 por confirmar» y la pestaña Órdenes «Por definir ruta 221». Ella quiere una sola pantalla, bien separada en secciones.
- Después, con la captura de «Mis Tareas» de su Odoo, pidió dos cosas más: que la lista se vea amplia como la de Odoo y que «Últimas cargas» quede plegado.

## Por qué había dos cifras
- La pestaña Rutas contaba las órdenes abiertas sin ruta lista.
- El chip «Por definir ruta» contaba eso mismo y además las rutas confirmadas que una carga de órdenes de trabajo de Odoo marcó para revisar (`revisarRutaPendiente`).

## Cómo queda la pantalla
Ya no hay pestañas. Un enlace viejo que apunte a «Rutas» abre esta misma pantalla y la lleva a la sección de rutas. De arriba abajo:
1. Indicadores (con el aspecto Marino) y avisos, como antes.
2. **Rutas por resolver · N**: buscador, fases, «Agrupar por» y la barra de lo marcado («Definir ruta para las marcadas», «Confirmar como están»). Debajo van tres grupos plegables, cada uno con su número:
   - **Sin ruta confirmada**.
   - **Confirmadas que Odoo cambió**: cada fila trae «✓ Ruta ok» y «editar».
   - **Por defecto o estimadas sin revisar**.
   
   Al final de la sección, «Más herramientas de rutas» plegado.
3. **Todas las órdenes**: la lista de siempre, con sus filtros, su buscador y su agrupador.
4. **Lotes de ruta aplicados**: plegado y una sola vez.
5. **Últimas cargas**: plegado en una línea que dice cuál fue la última carga. Se recuerda abierto o cerrado por persona.

## Una sola cifra
- `porDefinirRuta()` junta los tres grupos. Ninguna orden está en dos grupos (`grupoRutaDe`).
- Dan esa misma cifra: el indicador, el chip, el título de la sección y Hoy → Pendientes (la bandeja ahora se llama «Rutas por definir»).

## Lista amplia
Solo cambió el aspecto, con CSS:
- la lista llega casi hasta abajo de la ventana;
- las celdas tienen 10 × 12 px de relleno y la letra tamaño normal;
- la foto es 16 px más grande;
- cada fila tiene una línea divisoria y se marca al pasar el mouse.

## Cifras con el volcado real
- **Por definir ruta: 1.066**, la misma en el indicador, el chip, la sección y Hoy.
  - Sin ruta confirmada: 1.029.
  - Confirmadas que Odoo cambió: 0. El volcado es del 13-sep y no tiene marcas de la OT; OU7 lo prueba con una orden marcada a propósito.
  - Por defecto o estimadas sin revisar: 37.
  - Órdenes en previsión: 0.
- En producción la cifra común va a ser la de hoy en el chip (221): ahí sí están las que Odoo cambió.

## Pruebas
- **Nuevas OU1–OU12:**
  - no hay pestañas;
  - el orden de las secciones;
  - los tres grupos con su número;
  - los grupos no se pisan;
  - la misma cifra en los cuatro lugares;
  - un enlace viejo sigue funcionando;
  - una ruta que Odoo cambió va a su grupo con «✓ Ruta ok»;
  - la casilla de un grupo marca solo ese grupo;
  - «✓ Ruta ok» la saca de la cuenta;
  - «Últimas cargas» plegado y recordado;
  - la lista alta y con aire, en Marino claro y oscuro.
- **Ajustadas:** RU3, UX-B1, RLT, UX3, FS20, LBN5 y LBR7. Hablaban de las pestañas o de los chips Por confirmar / Confirmadas, que ya no existen.
- **Resultado:** el bloque OU corrió con el volcado real y dio 13 de 13. No se corrió el simulador completo.
