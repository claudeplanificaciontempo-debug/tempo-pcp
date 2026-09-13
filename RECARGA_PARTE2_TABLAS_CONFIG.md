# RECARGA — PARTE 2: tablas de configuración sembradas (revisión previa)

Fecha: 2026-09-12. **No se cargó ninguna orden, ningún material, ninguna capacidad. No se tocó `programar()`.**
El archivo `Tarea__project_task__95_.xlsx` todavía no está adjunto en la sesión — esto es solo la preparación
de las tres tablas de configuración para que las revises mientras lo consigues.

Código commiteado y publicado: commit `d6575bd`, rama `main`. Se ve en la app en **Configuración → Órdenes y
materiales (Parte 2)**. Probado localmente (201/201 verificaciones automáticas, 0 errores) — no aplicado sobre
producción todavía porque no hay nada que cargar sin el archivo; las tablas viven en `S.params`, igual que las
de la Parte 1, así que se sembrarán solas la primera vez que alguien abra esa pestaña en producción.

Todo lo sembrado se marca **pendiente de validar** en pantalla (etiqueta naranja junto a cada fila), con un
botón para pasarlo a "validado" fila por fila, y todo es editable: agregar, cambiar valor y borrar filas.

## 1 · Fase del archivo → fase del sistema (PASO 3)

Agrupado por el prefijo numérico que diste. La hoja real trae 36 valores distintos de Fase; aquí solo sembré
los que nombraste explícitamente en cada grupo (30 valores). Un valor de Fase que aparezca en el archivo real
y no esté en esta tabla **no se asigna por parecido**: la función que resuelve esto (`faseSistemaDe`) devuelve
vacío para que la Parte 2, cuando cargue el archivo, lo reporte en vez de adivinar.

| Fase (archivo) | Fase del sistema |
|---|---|
| 0Adquisición, 0Macro, 0Ord Compras, 0Reproceso diseño | previo a producción |
| 1Tejeduria, 1CD Tintoreria, 1Tintoreria, 1INCOMPLETOS TIN | textil |
| 2Planificacion | planificación |
| 3Trazos, 3CD CORTE, 3AEROPUERTO | preparación de corte |
| 4Corte Planta, 4CD Ensamble, 4Preparacion Insumos, 4Incompletos | corte |
| 5Maquila Conf, 5Maquila Recepción, 5CD Maquila, 5Corte Maquila Ibarra | maquila externa |
| 6Bordado, 6 Etiquetado | bordado/etiquetado |
| 7Confección, 7Pulido | confección |
| 8Empaque, 8Botones, 8Lavanderia, 8Servicios y Terminados, 8Exportacion, 8Embodegado, 8Cross, 8Centro Distribucion, 8Novedades, 8Empaque Terminado | terminados y despacho |
| Facturado | cerrada |

**A revisar**: para "5Maquila*" y "8*" tuve que escribir valores concretos de ejemplo (tomados de los nombres
de fase que ya existían en el sistema de la Parte 1, como `5Maquila Conf` o `5CD Maquila`), porque tú diste el
patrón con asterisco, no la lista completa de 36. Cuando tengas el archivo real, revisa que estos nombres
coincidan exactamente con los que trae — si no coinciden, la fila queda huérfana y esa fase se reportará como
"no calzó" en vez de mapearse, aunque el grupo sea el correcto.

## 2 · Segundo nivel de categoría de material → clasificación (PASO 5)

| Segundo nivel | Clasificación |
|---|---|
| MP | tela |
| INSUMOS | insumo |
| PT | producto terminado |
| GASTOS MAQUILA | servicio externo de confección |
| LAVANDERIA INDUSTRIAL | servicio externo de lavado |
| TINTURADO INDUSTRIAL | servicio externo de tintura |

Un segundo nivel que aparezca en el archivo y no esté aquí se reporta, no se clasifica por parecido.

## 3 · Tercer nivel de MP → origen de tela (PASO 6 — tu decisión pendiente)

24 tipos sembrados, los 24 que diste:

| Origen | Tipos (tercer nivel) |
|---|---|
| PROPIA | NUEVOS TEMPO, FLECCE TEMPO, PIQUE TEMPO, PIQUE LYCRA TEMPO, PIQUE TEMPO OXFORD, TEJIDOS TEMPO A COLOR |
| EXTERNA | PLANA IMPORTACION, JEAN IMPORTADOS, TELA TEJIDA |
| SIN CLASIFICAR | RIB, JERSEY, PLANA, PUÑOS, CUELLOS, LYCRA, SPANDEX, FLECCE S, FLECCE SIN PERCHAR, FLECCE PERCHADO, JEANS, FAJON, CUELLOS DISEÑOS, PIQUE, INTERLOCK |

Las 15 "SIN CLASIFICAR" quedaron exactamente así, sin adivinar — es la decisión que dijiste que te corresponde.

**Excepciones por cuarto nivel** (tabla aparte, anulan la regla del tercer nivel de arriba):

| Tercer nivel | Cuarto nivel | Origen |
|---|---|---|
| NUEVOS TEMPO | SERVICIO TINTURADO | EXTERNA TEÑIDA |
| NUEVOS TEMPO | TELA IMPORTADA TINTURADA | EXTERNA TEÑIDA |

Verificado con una prueba automática: `NUEVOS TEMPO` con cualquier otro cuarto nivel normal sigue dando
`PROPIA` — la excepción solo dispara con esos dos textos exactos en el cuarto nivel, tal como pediste.

## Cómo se usan estas tablas cuando llegue el archivo (ya programado, sin datos todavía)

- `faseSistemaDe(faseDelArchivo)` — fase del sistema, o vacío si no calza.
- `clasifDe(nivel2)` — clasificación del material, o vacío si no calza.
- `origenDeTela(nivel3, nivel4)` — mira primero la excepción de cuarto nivel; si no hay, la regla del tercero;
  vacío si el tercer nivel no está en la tabla (eso es lo que arma la bandeja "origen de tela sin definir").

## Qué falta

Todo lo demás de la Parte 2 (leer el archivo real, PASO 1 de alcance de carga, PASO 2 de campos de cabecera,
PASO 4 de componentes, PASO 7 de ruta textil, PASO 8 de carga en kg, y el PASO 9 de reporte final con la
tabla de carga por centro) sigue sin empezar: necesito que adjuntes `Tarea__project_task__95_.xlsx` (o el
archivo correcto con las 65.001 filas) para continuar. En cuanto lo subas, retomo desde ahí.

---
*Preparado sin tocar producción: estas tablas viven en el código ya publicado, listas para sembrarse solas
la próxima vez que se abra Configuración → Órdenes y materiales (Parte 2), tanto en local como en producción.*
