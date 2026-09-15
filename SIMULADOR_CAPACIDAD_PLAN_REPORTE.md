# Simulador de capacidad en el plan mensual — reporte

Fecha: 15-sep-2026. Motor sin tocar (ver nota al final sobre `capDia`).

## 1 · Modo simulación
Plan mensual → Bloque 1 → panel **"Simulador de capacidad por semana"** → botón **Simular**.
- Eliges un centro o módulo (lista de todos los recursos de producción) y ves sus semanas del mes, cada una con
  **min/día, personas y eficiencia** editables, y al lado: capacidad **base** (Configuración), **vigente** (con los
  extras ya guardados), **simulada**, carga programada y uso.
- Cada cambio recalcula **al instante** (sin guardar): la fila muestra "480 → 540 (+60)" y debajo
  "capacidad sube de 17.512 h a 18.888 h · uso baja de 38 % a 35 %". Puedes sumar una hora, mirar, sumar otra, las
  veces que quieras; puedes pasar a otro recurso y volver (los cambios provisionales se conservan mientras el simulador
  está abierto; el selector marca con ✎ los recursos con cambios).
- Fila "Mes" del recurso y fila "Toda la planta" (capacidad vigente vs simulada del mes y uso antes/después).
- Todo es provisional: "Descartar y cerrar" (o cerrar sin guardar) no deja nada. Si hay cambios pide confirmación.

## 2 · Por semana, no solo por mes
Cada semana del mes es una fila; el ajuste se hace por semana. Botón "→ todas" copia los valores de una semana a todas.
Ejemplo real: semanas 1 y 2 a 540 min (9 h), semanas 3 y 4 a 480: se escribe 540 en las dos primeras y se deja 480 en
las otras. Las semanas salen del calendario del mes (días laborables reales de cada una).

## 3 · Lo que se guarda
"Guardar ajustes" pide **motivo obligatorio**. Guarda **por semana y por mes** en `S.params.ajustesCap[mes].semanas[lunes]
[recurso] = {min, pers, efic, base, motivo, quién, cuándo}` — solo lo que difiere de la base. **La base de Configuración
no se toca.** Bitácora por cada recurso × semana: "Capacidad extra MÓDULO 3 · semana 1 de septiembre: min/día 480 → 540,
personas 8 → 9 · motivo (quién)".
En el Bloque 1 queda el panel **"Ajustes de capacidad guardados"** con la lectura pedida:
"**480 base + 60 extra = 540** min/día (sem. 1, 2)" · "**8 base + 1 extra = 9** personas (sem. 1, 2)", motivo, quién,
cuándo, y ✕ para quitar un ajuste (con confirmación y bitácora).
Al guardar, el programa se recalcula con la capacidad ajustada de esas semanas (la asistencia real registrada por piso
para un día sigue mandando sobre las personas).

## 4 · Que gerencia lo vea
- **Resumen del plan (Bloque 2)**: aviso "Este mes lleva capacidad extra guardada: 2 semanas (sem. 1, 2) · 3 centros
  (…) · N recursos. Lo demás va con la capacidad normal."
- **Capacidad y decisiones**: la celda centro × mes lleva la marca **"extras"** cuando alguna semana de ese mes tiene
  ajustes guardados en un recurso del centro; la capacidad de la celda ya incluye el extra.

## Nota técnica (para que no haya sorpresas)
No se tocó la lógica del motor. Lo único que cambió fuera del plan es `capDia(recurso, día)`: además de la asistencia
del día, ahora consulta si esa semana tiene un ajuste guardado (o simulado) para ese recurso y usa esos minutos,
personas o eficiencia. Es una lectura de configuración por semana, sin ella los ajustes no tendrían efecto en la
capacidad ni en el programa. Pruebas del simulador: 728 (14 nuevas), todas verdes.
