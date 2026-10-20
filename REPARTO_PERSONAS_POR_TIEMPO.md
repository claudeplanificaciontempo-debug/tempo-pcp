# Reparto de personas por tiempo entre órdenes que corren a la vez (20-oct-2026)

**Decisión de la usuaria:** «si primero hay que arreglar el problema del reparto», en todos los centros.

## Qué estaba mal

Desde el 23-sep un puesto puede correr varias órdenes a la vez. `calcTramo` repartía las personas del puesto
entre **todas las órdenes que se cruzaron en algún momento** con el tramo (`tramosSolapados`), y ese reparto
valía para **todo** el tramo:

- Módulo 3, 10 personas. La orden A corre de 07:50 a 16:20; la orden B entra a las 15:20.
- A se cruzó con B → A quedaba con 10 ÷ 2 = **5 personas todo el día**: 2.550 minutos-persona en vez de 4.800.
- Su SAM real salía a la mitad y su eficiencia al doble. Con tres órdenes que se cruzaran un rato, la primera
  quedaba con un tercio de la gente en todo su tramo.

## Qué cambia

`personasRepartidas(t, persBase)` (junto a `calcTramo`) parte el tramo en los instantes en que otra orden del
mismo puesto entra o sale (`solapesTramo`) y, en cada pedazo, divide las personas entre las órdenes abiertas
**en ese momento**. El resultado es el promedio ponderado por el tiempo:

- A = 10 personas × 450 min + 5 × 60 min = 4.800 minutos-persona → **9,4 personas en promedio**.
- B = 5 × 60 = 300. Las dos suman 5.100 = 10 personas × 510 min: el puesto no se cuenta dos veces.

`calcTramo` usa ese promedio como `pers` (`persFuente:'repartida'`), y el texto de pantalla dice
«9,4 en promedio: las 10 del puesto se reparten minuto a minuto entre las órdenes que corrían a la vez (hasta 2
juntas; se puede escribir cuántas van en cada una)». Lo escrito a mano (`persManual`) sigue mandando.

Es la misma fórmula para **todos los centros** (Corte, Confección, Empaque… registran INICIO/FIN con el mismo
`calcTramo`): eficiencia del día (`eficienciaHoy`), Planta en vivo, Órdenes de trabajo, el semáforo contra el
SAM y el cierre del paso. `tramosSolapados` (la cuenta de cuántas se cruzaron) se conserva: nadie más la usaba.

## Qué no cambia

- `programar()` (prueba HUELLA).
- Paros y descansos se descuentan como antes (el reparto se aplica al tiempo trabajado del tramo).
- Hoy no hay registros del piso en producción, así que ningún número ya visto cambia.

## Pruebas

TS-REP (junto a las TS del 23-sep): el ejemplo de arriba con las horas en la zona de la planta (`tsDeLocal`),
la suma de las dos órdenes = lo que tenía el puesto, y `persManual` por encima del reparto.
