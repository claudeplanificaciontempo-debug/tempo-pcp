# Configuración: portada corta (05-nov-2026)

**Pedido de la usuaria**, con captura de Configuración → Inicio: «mira, con muchas confunden».

## Qué estaba mal
La portada listaba **70 ajustes** seguidos, cada uno con dos líneas de explicación: las 46 tablas de Configuración y las 24 filas de
Ingeniería, que ya tienen su propio menú.

## Qué cambió
Solo la portada (`configInicioHTML`). Ninguna tabla se borró ni cambió de pestaña, y no cambia ningún dato ni ninguna cuenta.

| Dónde queda | Cuántos | Qué trae |
|---|---|---|
| **A la vista**, en tres tarjetas | 15 | Centros y máquinas (6) · Telas y colores (4) · Días, proveedores y listas (5) |
| Plegado: **Conexión con Odoo** | 14 | Fases, grupos, centros y estados de Odoo, tipos de material, origen y tela por categoría, qué se conserva al recargar |
| Plegado: **Ajustes avanzados** | 14 | Motor, parámetros, fases visibles, tramos paralelos, paquetes, metas, nivelación, textos, clave única |
| Plegado: **Historial y copias** | 3 | Registro de cargas, respaldo, borrar datos de prueba |
| Plegado: **En otras pantallas** | 4 | Categorías, Ingeniería, Usuarios, Auditoría |

- «Falta completar» sigue arriba, y cada línea lleva a su tabla aunque esté en un grupo plegado.
- El buscador de ajustes sigue encontrando todo, también lo de Ingeniería.
- Cada ajuste muestra una línea de explicación; el texto entero sale al pasar el mouse.

## Cómo está hecho
- `CONF_PORTADA`, `CONF_ODOO_T` y `CONF_HIST_T` clasifican por título; `cfgPortadaGrupos()` arma los grupos.
- Una tabla nueva sin clasificar cae sola en «Ajustes avanzados», nunca a la vista.
- Un grupo abierto sigue abierto mientras dure la sesión (`CFG_MAS`, `cfgMasTog`).

## Pruebas
CFG14–CFG20 (y CFG1, UX-V4 e ING8 pasadas a la portada nueva): 15 a la vista, cada tabla una sola vez, lo de Ingeniería fuera de la
lista, plegados por defecto, abierto al redibujar, tabla sin clasificar en Avanzados, y el buscador sigue encontrando lo plegado.

Simulador completo el 05-nov: 4.620 comprobaciones, 0 errores y 4 fallas: SR, las dos RC5 y N8. Las mismas 4 salen en main sin este cambio (4.613 comprobaciones), así que ninguna viene de aquí.

**N8 es nueva para el registro** (hasta el 28-oct solo fallaban SR y las dos RC5): al marcar las fases de Maquila el saldo da 0 unidades. Es de la Nivelación, no de esta pantalla, y falta revisarla. Sospecha sin comprobar: que dependa del mes en curso, porque el saldo mira un horizonte de meses.

## Lo que no se tocó
Las 8 pestañas de arriba siguen iguales. Reducirlas a 4 es parte de la Fase 3 de la simplificación y espera el «sigue» de la usuaria.
