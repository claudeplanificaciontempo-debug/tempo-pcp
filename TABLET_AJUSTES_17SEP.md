# Tablet del operario — ajustes aprobados (17-sep-2026)

Un commit. No se tocó nivelación, cola por cercanía, búsquedas ni cargas.

## 1 · Fallo de `programar()`: alerta en Hoy + bitácora

- **Una alerta por falla** (`registrarErrProg`): si ya hay una abierta con el mismo error y el mismo centro,
  no se repite aunque la tablet se redibuje veinte veces. Lleva **hora, centro y error**.
- **Vive en la bitácora** (entrada con `k:'errProg'`), no en `params`: es la única tabla que el perfil de piso
  puede escribir, así que la alerta llega al servidor aunque la sesión sea la de la tablet.
- **Hoy → Pendientes** la muestra a **admin y planificación** («Errores en la programación vistos desde una
  tablet», con las últimas tres fallas). Abre un listado con **«atendida»** (`S.params.errProgAtendidos`).
  Atenderla no corrige nada: saca la alerta de Hoy; la bitácora se conserva. El operario no la ve.
- De paso: `vTablet` llamaba a `programar()` sin `try`, así que un fallo reventaba la pantalla entera en vez de
  mostrar el aviso. Ahora se captura ahí también.

## 2 · `minMinutosCierre` por centro

- `minMinutosCierre(c)`: el general sigue en `S.params.minMinutosCierre`; por centro en
  `S.params.minMinutosCierreCentro[c]`. **Vacío = usa el general.**
- Configuración → Calendario y parámetros, bajo el general: desplegable «por centro (vacío = usa el general)» con
  un campo por centro de producción, placeholder «general N» y la marca «propio» / «usa el general».
- `puedeCerrarPaso` usa el del centro y dice de dónde salió (`fuente: 'centro' | 'general'`); el texto de espera
  en la tablet lo nombra («mínimo de este centro»). Cambios a bitácora.

## 3 · Avisos de tablas vacías

- **Tabla 15**: por cada uso sin motivos, aviso rojo con **qué deja de funcionar** (`SIN_MOTIVO_EFECTO`):
  «sin motivos de cierre sin tiempo → el supervisor no puede cerrar un paso sin tiempo corrido», «sin motivos de
  paro → el operario no puede registrar paros (el tiempo sale inflado)», etc. Desaparece al cargar uno.
- **Tabla 18**: aviso con los centros sin ventanas de descanso («en ningún centro» si están todos) y el efecto:
  el tiempo de los tramos no descuenta almuerzo ni refrigerio, el minuto real sale más alto y el semáforo contra el
  estándar no es confiable.

## 4 · Sin tiempo corrido no aparece «Hecho»

- En la tablet, **«Hecho»** (tarjeta) y **«Terminar orden»** (flujo En proceso) solo se dibujan cuando
  `puedeCerrarPaso` dice que sí. Si no, `hintCierreHTML` dice qué falta: «Hecho aparece con tiempo corrido:
  inicia el tramo» o «3,0 de 5 min».
- **La decisión sigue siendo una sola** (`puedeCerrarPaso`); la vista no tiene un segundo criterio, y hay una
  prueba que lo fija.
- La prueba PE2 (que esperaba «Terminar orden» con 30 prendas registradas y **sin tramo**) se ajustó a la regla
  nueva: sin tiempo no aparece, con un tramo de 8 min sí.

## Harness

2.240 checks, 0 errores. Pruebas nuevas TA1 (8), TA2 (6), TA3 (3), TA4 (5). La única roja sigue siendo P2
(duplicación de «Actualizar desde Odoo»), a propósito, hasta el camino único.
