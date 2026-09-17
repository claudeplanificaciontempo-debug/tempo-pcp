# Cola por fase — construido (17-sep-2026)

Opción C con las ocho correcciones del refutador y las seis decisiones del 17-sep. Medido en el simulador con el
volcado real (1.206 órdenes), semana del lun 14 al dom 20 de septiembre, perfil planificación.

## Qué cambió

1. **El umbral en pasos se retiró.** Ya no existen `umbralCercania`, `setUmbralCercania` ni el campo en
   Configuración. Ninguna prueba ni pantalla lo usa. `cercaniaCentro` no cuenta pasos para decidir el grupo.
2. **La lista de fases visibles de cada centro decide.** Tabla nueva `S.params.fasesCentro[centro] =
   {fases:[…], sugerido, confirmado:{u,ts}|null, origen, ts}` (Configuración → Calendario y parámetros → «Fases
   visibles en la cola de cada centro»). Una lista por centro, editable sin código: subir/bajar, quitar (con
   confirmación), agregar cualquier fase de la tabla 1, «volver a la sugerida» y «confirmar» (queda quién y cuándo;
   tocarla la devuelve a sugerido). Solo el permiso `programa`.
3. **Siembra «sugerido»** desde la tabla 1 hacia atrás desde la etapa del centro (tabla 4), idempotente y solo
   para centros sin lista; una fase se excluye con la columna `excluye` de la tabla 1. Corte incluye
   `1Calidad Tintoreria` (la tela ya tinturada, columna tela). Lo que salió hoy:

   | Centro | Lista sugerida (de la más cercana a la más lejana) |
   |---|---|
   | Corte | 3CD CORTE › 3Trazos › 3AEROPUERTO › 2Planificacion › 1Calidad Tintoreria |
   | Estampado, Bordado, Etiquetas | 4 Calidad Produccion › 4CD Ensamble › 4Preparacion Insumos › 4Incompletos › 4Corte Planta › 3CD CORTE › 3Trazos › 3AEROPUERTO |
   | Confección | 6 Etiquetado › 6Serigrafia › 6Bordado › 6 CD SERIGRAFIA › 6 CD BORDADO › 4 Calidad Produccion › 4CD Ensamble › 4Preparacion Insumos › 4Incompletos › 4Corte Planta |
   | Botones, Lavado, Plancha, Empaque | 7Pulido › 7Confección › 6 Etiquetado › 6Serigrafia › 6Bordado › 6 CD SERIGRAFIA › 6 CD BORDADO › 5Maquila Recepción › 4 Calidad Produccion › … › 4Corte Planta |

   Un centro sin etapa en la tabla 4 no recibe lista inventada: sale en la bandeja de Hoy «Centros sin lista de
   fases para su cola» y su cola muestra todo lo no disponible como Por llegar con la etiqueta «sin lista de fases».
   Las listas son sugeridas: las confirmas tú con producción; Confección y Botones/Empaque seguramente cambian.
4. **Grupos de la cola** (`CERCANIA_GRUPOS`), en este orden y todos dentro de la misma tabla:
   - **Con puesto manual** — siempre a la vista, arriba de todo, aunque nadie haya numerado (entonces lo dice).
   - **Disponible** — el paso anterior terminó; subcabecera por fase en el orden de la lista. Aquí también las
     **«en proceso aquí»** (fase del propio grupo del centro, p. ej. 4Corte Planta en Corte), con etiqueta verde,
     primero de todas; esté o no en la lista.
   - **Por llegar** — solo fases **dentro de la lista**, de la más cercana a la más lejana; dentro de cada fase, por
     fecha de llegada.
   - **Revisar ruta** (colapsado) — sin cambios.
   - **Todo lo que viene** (colapsado) — fases fuera de la lista. La escape «llega ya» ya **no cambia de grupo**:
     solo etiqueta, y solo se ve al abrir el grupo (Confección: 3 hoy).
   - **Ya salió de aquí** — al final, abierto: fase del propio grupo tipo CD o posterior con el paso sin cerrar.
     Etiqueta roja, «lista para empezar» en gris, y bandeja en Hoy «Órdenes que ya salieron de un centro pero el
     paso no está cerrado».
5. **Orden dentro de la cola:** puesto manual → grupo → posición de la fase en la lista → fase (para que una misma
   fase quede junta) → llegada → entrega. `ordenCercania` = grupo·10⁹ + posición·10⁶ + llegada; ninguna llave pisa
   a la anterior (probado).
6. **Ruta incompleta** (decisión 4, reportado aparte): el centro es el único paso de producción de la ruta, no es
   el primero del flujo y la fase está antes → **no** es «lista para empezar»: va a Todo lo que viene con el
   desacuerdo «ruta incompleta» y a la bandeja de Hoy «Órdenes con ruta incompleta en la cola de un centro».

## Resultado por centro (volcado real, semana en curso, «ver todas»)

| Centro | Total | Disponible | Por llegar | Todo lo que viene | Ya salió | En proceso aquí | Ruta incompleta |
|---|---:|---:|---:|---:|---:|---:|---:|
| Corte | 72 | 30 | — | 39 | 3 | 11 | 0 |
| Estampado | 26 | 6 | 0 | 19 | 1 | 5 | 17 |
| Bordado | 163 | 19 | 19 | 121 | 4 | 19 | 114 |
| Confección | 76 | 4 | 14 | 58 | 0 | 4 | 0 |
| Botones | 28 | 3 | 3 | 22 | 0 | 3 | 0 |
| Lavado | 28 | 3 | 3 | 22 | 0 | 3 | 0 |
| Empaque | 93 | 13 | 18 | 62 | 0 | 13 | 0 |
| Etiquetas, Plancha | 0 | | | | | | |

**Corte** (captura `capturas/cola_fase_corte.png`): Disponible 30 = 4Corte Planta 3 + 4Preparacion Insumos 8
(«en proceso aquí») + 3CD CORTE 10 + 3Trazos 6 + 3AEROPUERTO 1 + 2Planificacion 2. Todo lo que viene 39 =
0Recetas Insumos 25 + 0Diseño 14. Ya salió 3 = 4CD Ensamble (CD del propio grupo: esperando a Confección, pero el
paso de corte no está cerrado). No hay Por llegar porque en Corte la tela lista manda y ninguna orden tiene fase
textil en la cola.

**Confección** (captura `capturas/cola_fase_confeccion.png`): Disponible 4 = 7Confección 3 + 7Pulido 1 («en
proceso aquí»). Por llegar 14 = 4CD Ensamble 3 (dos «hoy», una «en 105 días hábiles»: el motor programa su corte en
febrero) + 4Preparacion Insumos 8 + 4Corte Planta 3. Todo lo que viene 58 (3CD CORTE 10, 3Trazos 6, 0Recetas 25,
0Diseño 14…), tres de ellas con «llega ya».

### Anomalías: cuántas vienen de rutas incompletas

| Centro | «Ya salió de aquí» | Ruta incompleta (Todo lo que viene) |
|---|---:|---:|
| Corte | 3 (4CD Ensamble) | 0 |
| Estampado | 1 (6 CD BORDADO) | **17** (3CD CORTE 4, 4CD Ensamble 9, 4Preparacion Insumos 1, 5CD Maquila 1, 5Maquila Conf 2) |
| Bordado | 4 (6 CD BORDADO) | **114** (0Recetas Insumos 45, 5Maquila Conf 16, 4CD Ensamble 12, 3CD CORTE 10, 2Planificacion 8, 4Preparacion Insumos 7, 3AEROPUERTO 5, 4Corte Planta 5, 5CD Maquila 5, 3Trazos 1) |

Las 17 de Estampado y las 114 de Bordado son las rutas `[estampado]` / `[bordado]` solas (un único paso de
producción) del diagnóstico del 16-sep (`RUTAS_EMPAQUE_DIAGNOSTICO.md`): antes salían como «lista para empezar»
en ese centro; ahora quedan en Todo lo que viene con el desacuerdo a la vista y en la bandeja. Las 8 «ya salió» son
legítimas: fase 4CD Ensamble / 6 CD BORDADO (CD del propio grupo) con el paso del centro sin cerrar → cerrar el
paso o corregir la fase.

## Pruebas

`node test/build.js` + harness: **2.378 comprobaciones, 0 errores, 0 rojas** (la única roja es B0, el hallazgo del borrado que queda rojo a propósito hasta que apruebes construirlo). Nuevas/rehechas:
CC1 (la lista decide, no los pasos), CC2 (tabla de fases: siembra por centro con etapa, centro sin etapa → bandeja,
`rangoFaseCentro` 0/−1/null con `normFase`, mover/quitar/volver/confirmar/permiso, Configuración sin umbral),
CF (grupos, `ordenCercania` monotónico, Por llegar ordenado por posición, «llega ya» solo etiqueta, puesto manual
siempre a la vista, subcabeceras por fase y una sola por fase, «en proceso aquí» en Disponible aunque esté fuera de
la lista y con la tela sin dato deja desacuerdo, «ya salió» al final + bandeja, `__R.cf` con anomalías por centro y
por ruta incompleta, liberada a corte manda, ruta `[bordado]` sola con 3CD CORTE no es «lista para empezar»).
GUARDIA: `quitarFaseCentro` pide confirmación y está en la lista.

## Capturas

- `capturas/cola_fase_corte.png` — Corte, «ver todas» (`?captura=cola1`).
- `capturas/cola_fase_confeccion.png` — Confección, «ver todas» (`?captura=cola2`).
- Modo del driver: `?captura=cola1|cola2` (`cola1b|cola2b` = solo la semana, como abre por defecto).

## Pendiente de ti

- Confirmar las listas por centro en Configuración (sobre todo Confección y Botones/Empaque).
- Marcar en la tabla 1 las fases de Tela y Maquila que faltan; la lista de Corte tomará lo que marques.
- Las 131 rutas incompletas de Estampado/Bordado siguen siendo rutas: se corrigen en Órdenes → Rutas, no aquí.
