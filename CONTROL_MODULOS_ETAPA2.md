# Control de módulos · etapa 2 — paquetes por orden desde Corte (20-oct-2026)

Pedido de la usuaria: que el módulo marque «pasó el paquete» en vez de escribir cantidades.
Decisiones de la usuaria (20-oct): **un paquete por talla, sin partir**, por defecto; **los puntos de control
por referencia los define Ingeniería en el Balanceo**; y, al final del día, **«No se va a generar ningún QR,
eliminamos esa parte»**.

## Qué hace

1. **Los paquetes salen al cerrar Corte** (`cerrarCentro`, la única puerta: tablet, «Terminé esta orden»,
   registro por talla y el cierre automático). Tallas = lo cortado (`curvaCorte`); si Corte no registró tallas,
   la curva del pedido; si no hay ninguna, un solo paquete «(total)». Tamaño: `S.params.pzPaqueteCat[tipo]` o el
   general `prm('pzPaquete')`, los dos vacíos por defecto = un paquete por talla (Configuración general →
   Calendario y reglas → «Paquetes que salen de Corte»; permiso de planificación o administración, bitácora).
   Todo vive en `S.avance[oid]` (`paquetes`, `paquetesMeta`, `paquetesHist`): el piso lo puede escribir y nada
   se borra. Un paquete ya marcado conserva su número y su talla al rehacerse.
2. **Orden cuyo Corte lo dio Odoo** (fase u OT): «Hacer paquetes» para el supervisor o planificación.
3. **Etiquetas impresas solo en texto**: la hoja de Corte (semana y día) y «Imprimir paquetes» (⋯ de la cola de
   Corte y de Confección, y la ficha) traen una etiqueta por paquete: «WH · paquete 3 de 9 · talla M · 40 prendas».
   Antes de cortar salen los **previstos** desde la curva del pedido, con el mismo número y talla que tendrán.
4. **La tablet del módulo marca paquetes tocándolos**: cada punto de control muestra los paquetes como fichas;
   un paquete solo pasa un punto si ya pasó el anterior; la salida escribe su talla una sola vez en «Este tramo».
   Lo manual queda plegado en «corregir a mano».
5. **Puntos de control por referencia**: en Ingeniería → Balanceo cada estación tiene la casilla «punto de control
   al salir de esta estación» (solo quien edita Ingeniería); se guarda en la referencia. La tablet lee solo las
   referencias de su cola, una vez por sesión. Sin puntos en la referencia, siguen los subprocesos configurados.
6. **Módulos en vivo**: por orden y punto, paquetes pasados / total y los detenidos más de `minSinMovModulo()` min.

`programar()` no cambió (nadie del motor lee los paquetes). Sin SQL nuevo.

## QR retirado (decisión de la usuaria)

Se quitaron la librería (`QR_LIB_URL`, `QR_ESPERA_MS`, su carga en `hojaImprimirHTML`), `qrSVGde`, `qrPintarHoja`,
`scriptQRHoja`, `data-qr`, el código `PQ|<WH>|<n>` (`codigoPaquete`), el campo «Código del paquete» de la tablet
(`escanearPaquete`, `leerCodigoPaquete`, `PQSCAN`) y su CSS. La hoja de impresión vuelve a imprimir al abrir.

## Pruebas

CM10 en adelante (órdenes inventadas). CM16: la etiqueta es solo texto, sin QR ni código ni librería. CM17: no queda
ninguna función ni constante del QR o del escaneo. CM28: la tablet no tiene campo de código y el paquete se marca
tocándolo. CM19, CM33 y CM37 pasaron de escanear a tocar.
