# Pasos de ruta nuevos: Sublimado, Calandrado, Apliques, Cordones — 20-sep-2026

**Pedido de la usuaria:** «nos falta una ruta de sublimado (ya comenzaron a montar órdenes); el calandrado, que es mandar la tela
cruda para que la estampen (ya llegaron productos con eso en la ruta); en estampado se suelen poner apliques; y las rutas de los
cordones, porque también van con cordones».

## Qué se sembró (una vez, `sembrarPasosNuevos20`, bandera `S.params.pasosNuevos20`)
Cuatro **centros de producción** nuevos, editables en Configuración → Centros y recursos, marcados «sin confirmar» y **sin tiempo**
por prenda hasta que ingeniería lo cargue (brecha visible, nunca un valor inventado):

| Centro | Ítem de planificación | Etapa (tabla 4) | Dónde va en la ruta | Cómo entra a una ruta |
|---|---|---|---|---|
| **Calandrado** | Estampado | preparación de corte | antes de Corte | a mano (ruta por orden o en lote) · cuenta **por días** (`sinCapacidad`): fila en «esperas por paso» con **0 días, estimado, plazo POR CONFIRMAR** |
| **Sublimado** | Estampado | servicios | después de Estampado | solo: si la **técnica** de la orden dice «sublim…», `ordenCentrosAuto` lo pone en vez de Estampado; o a mano |
| **Apliques** | Estampado | servicios | después de Estampado | solo: si la técnica dice «aplique»; o a mano |
| **Cordones** | Terminados | terminados | después de Lavado, antes de Plancha | a mano |

Además: `RUTA_ORDEN` (orden de paso), `GRUPO_PLAN_DEF` (sub-áreas del menú: Estampado → Estampado · Etiquetas · Sublimado ·
Apliques · Calandrado; Terminados → Botones · Lavado · Cordones · Plancha · Empaque), `CENTROS_DISENO` (fuera de las rutas
estimadas), `RUTA_EDITABLE_POR` (quién los edita: los perfiles de corte/estampado/bordado los tres de estampado, los de terminados
Cordones), `centrosPorOrden` (se pueden poner por orden), tabla 4 centro → etapa (filas agregadas si la tabla ya existía) y los
perfiles `corte` (ve Sublimado, Apliques, Calandrado) y `terminado` (ve Cordones).

## Lo que falta de la usuaria / ingeniería
- **Tiempos**: minuto por prenda de Sublimado, Apliques y Cordones (hoja LMO mapeada a esos centros en Configuración → Operaciones →
  Mapeo, o SAM del centro) y el **plazo en días** del Calandrado (Calendario y parámetros → esperas por paso). Hasta entonces entran
  en 0 y salen en «sin tiempo por prenda».
- **Cómo se reconocen en Odoo**: la técnica (sublimado / aplique) ya se lee; si Odoo trae el calandrado o los cordones en algún campo
  (componente, OT, nombre de tela), se puede automatizar.
- El «!» del menú en esos sub-centros dirá «ninguna orden tiene este centro en su ruta» hasta que se usen: es lo esperado.

Pruebas PS.
