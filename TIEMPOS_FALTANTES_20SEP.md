# Qué falta por poner tiempos — 20-sep-2026

Medido sobre el volcado del 13-sep con el catálogo real (51 tipos de producto, 583 órdenes lanzadas). En producción las
cifras de órdenes cambian; los tiempos por tipo de producto son los mismos porque salen del catálogo.

## 1 · Botones (lo que te salió)

El tiempo del paso **Botones** sale así: si la hoja de operaciones (LMO) del tipo de producto trae operaciones de ojales/botones,
se toma la **tabla de ojales y botones** (Configuración → Operaciones), que manda sobre la hoja; si la hoja **no** trae esa
operación, el paso entra en **0** aunque la tabla tenga un valor. Por eso:

| Tipo de producto | Órdenes con Botones en la ruta | Tabla de ojales y botones | Hoja LMO (botones) | Resultado | Qué decidir |
|---|---|---|---|---|---|
| **Jeans (DENIM)** | 12 | `denim`: 0 + 0 (se confirmó así el 16-sep) | Hacer ojal 0,20 + Pegar botón 0,20 = **0,40** | **0 → sin tiempo** | ¿La tabla debe decir 0,40 (o lo que sea real)? Hoy el 0 manda. |
| **Vestidos** | 7 | `vestido`: 0 + 0 (confirmado 16-sep) | Hacer ojales 0,50 + Pegar botones 0,66 = **1,16** | **0 → sin tiempo** | Igual: ¿1,16? |
| **Short Basico** | 1 | `short`: ojales 0,26 | sin operación de botones | **0 → sin tiempo** | La tabla no se aplica porque la hoja no trae la operación. ¿Aplicar la tabla igual (0,26)? |
| **Short Moda** | 0 | `short`: 0,26 | sin operación | 0 (no afecta hoy) | Ídem. |
| **Faldas** | 2 | `falda`: ojales 0,26 | sin hoja LMO | **0 → sin tiempo** | Ídem (y la familia entera no tiene hoja, ver punto 2). |
| **Camiseta CR** | 2 | sin fila | sin operación | **0 → sin tiempo** | ¿Una camiseta con botones? Revisar esas 2 rutas: probablemente Botones no va. |
| **Camiseta CV** | 1 | sin fila | sin operación | **0 → sin tiempo** | Ídem, revisar la ruta. |
| **BVD** | 1 | sin fila | sin operación | **0 → sin tiempo** | Ídem, revisar la ruta. |

Con tiempo y sin problema: Polo Básica / Polo Moda **1,06** · Camisas MC / ML **2,09** · Henley MC / ML **1,06** · Hoodies /
Hoodies Moda **0,26** · Pantalón Básico / Moda **0,26** · Short Cargo **0,26** · Capucha Cierre **0,26** · Short Fleece Básico /
Moda **0,26**.

**Propuesta (no aplicada, la decides tú):** que la tabla de ojales y botones se aplique también cuando la hoja LMO no trae la
operación — si alguien puso Botones en la ruta, es porque la prenda los lleva. Con eso Short Básico, Short Moda y Faldas
quedarían en 0,26 sin tocar nada más. Jeans y Vestidos siguen dependiendo del valor que escribas en la tabla (hoy 0 = 0).

## 2 · Corte, confección y empaque de las 11 familias sin hoja de operaciones

Son las mismas del Excel `TIEMPOS_PARA_LLENAR3.xlsx` (hoja «Corte y empaque»): **Jogger, Jogger Moda, Crew (Fleece Básico),
Crew Moda y Crew Zip (Fleece Pesado), Faldas, Camiseta Tejida, Polo Tejida, Henley Tejida, Enterizo, Accesorios**.
- **Corte: 0** y **Empaque: 0** en las 11 → cada orden de estas familias lleva esos dos pasos sin tiempo (ruta por defecto).
- **Confección**: el minuto estimado de Santiago (marcado «estimado»; Camiseta Tejida 4,57 confirmada) — a medir.
- Botones / Etiquetas / Estampado: 0 si entran a la ruta.
- Órdenes lanzadas hoy en esas familias: Camiseta Tejida 11, Crew Moda 7, Crew Zip 7, Jogger Moda 6, Crew 5, Faldas 5,
  Henley Tejida 4, Jogger 3, Polo Tejida 1, Enterizo 1, Accesorios 0.

## 3 · Los demás pasos

- **Etiquetas (serigrafía, 0,5 min)**: solo Level 1, Level 2, Camiseta CR y Camiseta CV (tabla de reglas de etiqueta). Cualquier
  otro tipo de producto al que se le ponga Etiquetas en la ruta entra en 0. Hoy ninguna orden tiene Etiquetas en la ruta.
- **Plancha**: 2 min/prenda para todo (confirmado). 15 órdenes la tienen en la ruta, ninguna sin tiempo.
- **Lavado**: va por días (planta 3 / Quito 15, no definitivo), no por minutos: nunca sale «sin tiempo», pero tampoco carga minutos.
- **Estampado**: el tiempo sale de la técnica de la orden (tabla de técnicas); una orden con Estampado en la ruta y sin técnica
  reconocida entra en 0.
- **Bordado**: el tiempo son las puntadas de la orden; con 0 puntadas y Bordado en la ruta → 0 (7 órdenes en el volcado).
- **Confección con hoja**: las 40 categorías con hoja LMO tienen tiempo en todas sus operaciones (595 de 595). Queda la duda ya
  reportada: Short Cargo 30,1 min > Pantalón Cargo.

## Dónde verlo en el sistema
Reportería por área → **Auditoría del sistema** (regla «pasos sin tiempo por prenda») y la bandeja «sin tiempo por prenda» de Hoy,
sobre tus datos reales.
