# Configuración de centros y capacidades — TEMPO PCP

Extraído en vivo de la base de datos el 12/9/2026, 11:29:59 a. m..

## Calendario laboral por área (días trabajados por semana)

| Área | Días/semana |
|---|---|
| Tejeduría | 5 |
| Tintorería | 6 |
| Producción | 6 |

Excepciones de calendario registradas hoy (feriados, días extra puntuales): **0**.

## Parámetros de tintorería (armado de baños)

| Parámetro | Valor |
|---|---|
| Baño bueno desde (% de capacidad) | 95% |
| Baño con aprobación desde (% de capacidad) | 70% |
| Llenado mínimo STUART (%) | 80% |
| Tolerancia chica (%) | 0% |
| Tolerancia grande (%) | 0% |
| Baño "previo aprobación" desde (kg) | 180 |
| Umbral máquina grande vs chica (kg) | 120 |

## Centros (12)

| Centro | Área | Unidad de medida |
|---|---|---|
| Bordado | Producción | puntadas |
| Botones | Producción | min |
| Corte | Producción | min |
| Empaque | Producción | min |
| Estampado | Producción | min |
| Etiquetas | Producción | min |
| Lavado | Producción | prendas_h |
| Confección | Producción | min |
| Plancha | Producción | min |
| Proveedor de tela | Externo | dias |
| Tejeduría | Tejeduría | kg |
| Tintorería | Tintorería | bano |

## Recursos / máquinas / módulos por centro (28 activos hoy)

### Tejeduría (4 recursos)

| Recurso | Horas/día | Días/semana | Kg/h referencia |
|---|---|---|---|
| C1-ORIZIO | 24 | 6 | 14,7 |
| C2-ORIZIO | 24 | 6 | 12,9 |
| C3-MAYER | 24 | 6 | 21,9 |
| C4-MAYER | 24 | 6 | 7,1 |

### Tintorería (3 recursos)

| Recurso | Capacidad normal (kg) | Capacidad piqué (kg) | Horas/día | Días/semana | Rol de color | Telas compatibles listadas |
|---|---|---|---|---|---|---|
| DANITECH 1 | 240 | 200 | 24 | 6 | cualquiera | 0 |
| DANITECH 2 | 240 | 200 | 24 | 6 | cualquiera | 0 |
| STUART | 40 | — | 24 | 6 | cualquiera | 6 |

### Producción (21 recursos)

| Recurso | Personas | Minutos/persona/día | Eficiencia | Días/semana | Capacidad hoy (min) |
|---|---|---|---|---|---|
| Maquila (externa) | 20 | 480 | 85% | 5 | 8.160 |
| Módulo 1 | 11 | 480 | 85% | 5 | 4.488 |
| Módulo 10 | 9 | 480 | 80% | 5 | 3.456 |
| Módulo 11 | 7 | 480 | 80% | 5 | 2.688 |
| Módulo 2 | 11 | 480 | 85% | 6 | 4.488 |
| Módulo 3 | 11 | 480 | 85% | 5 | 4.488 |
| Módulo 4 | 8 | 480 | 85% | 5 | 3.264 |
| Módulo 5 | 8 | 480 | 85% | 5 | 3.264 |
| Módulo 6 | 9 | 480 | 85% | 5 | 3.672 |
| Módulo 7 | 8 | 480 | 85% | 5 | 3.264 |
| Módulo 8 | 8 | 480 | 85% | 5 | 3.264 |
| Módulo 9 | 8 | 480 | 85% | 5 | 3.264 |
| Corte | 10 | 480 | 85% | 5 | 4.080 |
| Empaque | 5 | 480 | 85% | 5 | 2.040 |
| Plancha | 3 | 480 | 80% | 5 | 1.152 |
| Estampado | 9 | 480 | 85% | 5 | 3.672 |
| Etiquetas | 2 | 480 | 85% | 5 | 816 |
| Bordado | 10 | 480 | 80% | 5 | 3.840 |
| Botones | 3 | 480 | 85% | 5 | 1.224 |
| Lavado | 1 | 480 | 85% | 5 | 408 |
| Bordadora nueva | 1 | 480 | 85% | 5 | 408 |

> **Nota sobre "Días/semana" de Producción:** esa columna es el valor propio guardado en cada recurso, pero el sistema en realidad usa el calendario del área (tabla de arriba: Producción = **6 días/semana**) porque tiene prioridad sobre el valor del recurso. Es decir, estos módulos sí trabajan 6 días a la semana hoy, aunque el campo individual diga 5; conviene actualizar ese campo para que no queden desactualizados.
