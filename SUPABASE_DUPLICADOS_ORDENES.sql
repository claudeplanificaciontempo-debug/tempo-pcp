-- ============================================================================
-- DIAGNÓSTICO DE ÓRDENES DUPLICADAS · SOLO LECTURA (17-sep-2026)
-- No modifica nada: solo SELECT. Correr en el SQL Editor de Supabase con la
-- sesión de la usuaria (la clave pública no lee las tablas bajo RLS).
-- Tabla: ordenes (id text PK, data jsonb, actualizado timestamptz, actualizado_por uuid)
--
-- Cómo se reconoce de dónde salió cada orden (marcas que deja cada cargador):
--   Recarga Parte 2 ........ data->>'origenParte2' = 'true'  (y data->>'cargaTs')
--   Actualizar desde Odoo .. NO tiene origenParte2 y sí tiene la clave 'samProv'
--                            (solo nuevaOrden() la escribe); las previsiones sin WH
--                            llevan id con prefijo 'prev_'
--   Creada a mano .......... ninguna de las dos marcas
-- ============================================================================

-- 0) Cuántas órdenes hay por origen (para leer los demás bloques con su base)
select
  case when data ? 'origenParte2' then 'Recarga Parte 2'
       when data ? 'samProv' or id like 'prev\_%' then 'Actualizar desde Odoo'
       else 'a mano / otro' end as origen,
  count(*) as ordenes,
  sum((data->>'cant')::numeric) as unidades
from ordenes
group by 1 order by 2 desc;

-- 1) DUPLICADAS POR WH: misma orden de producción normalizada
--    (minúsculas, sin espacios) bajo más de un id. Excluye las «SIN WH #…».
with base as (
  select id,
         lower(regexp_replace(coalesce(data->>'op',''),'\s+','','g')) as op_norm,
         data->>'op' as op, data->>'estado' as estado, data->>'fase' as fase,
         (data->>'cant')::numeric as cant, data->>'fecha' as fecha,
         case when data ? 'origenParte2' then 'Parte 2'
              when data ? 'samProv' or id like 'prev\_%' then 'Odoo'
              else 'mano' end as origen,
         actualizado
  from ordenes
  where coalesce(data->>'op','') <> '' and data->>'op' not like 'SIN WH%'
)
select op_norm, count(*) as veces,
       string_agg(id||' ['||origen||' · '||coalesce(estado,'')||' · '||coalesce(fase,'')||' · '||coalesce(cant::text,'')||']', ' | ' order by actualizado) as ids
from base
group by op_norm
having count(*) > 1
order by veces desc, op_norm;

-- 1b) Resumen del bloque 1: cuántas WH duplicadas y cuántos de esos ids
--     los creó «Actualizar desde Odoo»
with base as (
  select id,
         lower(regexp_replace(coalesce(data->>'op',''),'\s+','','g')) as op_norm,
         case when data ? 'origenParte2' then 'Parte 2'
              when data ? 'samProv' or id like 'prev\_%' then 'Odoo'
              else 'mano' end as origen
  from ordenes
  where coalesce(data->>'op','') <> '' and data->>'op' not like 'SIN WH%'
), dup as (
  select op_norm from base group by op_norm having count(*) > 1
)
select count(distinct d.op_norm) as wh_duplicadas,
       count(*) filter (where b.origen='Odoo')    as ids_de_odoo,
       count(*) filter (where b.origen='Parte 2') as ids_de_parte2,
       count(*) filter (where b.origen='mano')    as ids_a_mano
from dup d join base b using (op_norm);

-- 2) DUPLICADAS SIN WH: misma referencia + proyecto + cantidad
--    (aquí caen las «SIN WH #…» de la Parte 2 y las 'prev_…' de Odoo, que son
--    la MISMA orden de diseño bajo dos claves distintas)
with base as (
  select id,
         lower(trim(coalesce(data->>'ref','')))      as ref,
         lower(trim(coalesce(data->>'proyecto',''))) as proyecto,
         (data->>'cant')::numeric                    as cant,
         lower(trim(coalesce(data->>'cliente','')))  as cliente,
         upper(trim(coalesce(data->>'colorOdoo',''))) as color,
         data->>'op' as op, data->>'odc' as odc, data->>'fecha' as fecha, data->>'fase' as fase,
         case when data ? 'origenParte2' then 'Parte 2'
              when data ? 'samProv' or id like 'prev\_%' then 'Odoo'
              else 'mano' end as origen,
         actualizado
  from ordenes
  where coalesce(data->>'ref','') <> ''
)
select ref, proyecto, cant, count(*) as veces,
       count(distinct cliente||'|'||color) as combinaciones_cliente_color,
       string_agg(id||' ['||origen||' · '||coalesce(op,'')||' · ODC '||coalesce(odc,'')||' · '||coalesce(color,'')||' · '||coalesce(fecha,'')||']', ' | ' order by actualizado) as ids
from base
group by ref, proyecto, cant
having count(*) > 1
order by veces desc, ref, proyecto;

-- 2b) Resumen del bloque 2: cuántos grupos y cuántos ids vienen de Odoo
with base as (
  select id,
         lower(trim(coalesce(data->>'ref','')))||'|'||lower(trim(coalesce(data->>'proyecto','')))||'|'||coalesce(data->>'cant','') as k,
         case when data ? 'origenParte2' then 'Parte 2'
              when data ? 'samProv' or id like 'prev\_%' then 'Odoo'
              else 'mano' end as origen
  from ordenes
  where coalesce(data->>'ref','') <> ''
), dup as (select k from base group by k having count(*) > 1)
select count(distinct d.k) as grupos_duplicados,
       count(*) as ids_en_grupos,
       count(*) filter (where b.origen='Odoo')    as ids_de_odoo,
       count(*) filter (where b.origen='Parte 2') as ids_de_parte2,
       count(*) filter (where b.origen='mano')    as ids_a_mano
from dup d join base b using (k);

-- 3) QUÉ CARGAS DE «ACTUALIZAR DESDE ODOO» HUBO (tabla cargas: las filas SIN
--    tipo son de Odoo; las de OT llevan tipo='ot'; la Parte 2 no escribe aquí,
--    escribe en params.data->tareaCarga y en la bitácora)
select id, data->>'ts' as ts, data->>'usuario' as usuario, data->>'archivo' as archivo,
       coalesce(data->>'tipo','odoo') as tipo,
       (data->>'nuevas')::int as nuevas, (data->>'act')::int as actualizadas,
       (data->>'cerradas')::int as cerradas, (data->>'prev')::int as previsiones_nuevas
from cargas
order by data->>'ts' desc;

-- 3b) Y en la bitácora (por si la tabla cargas se recortó: hoy guarda solo 60)
select id, data->>'ts' as ts, data->>'u' as usuario, left(data->>'t',200) as texto
from bitacora
where data->>'t' ilike '%odoo%' or data->>'t' ilike '%recarga parte 2%'
order by data->>'ts' desc
limit 200;

-- 4) ÓRDENES QUE SOLO EXISTEN POR «ACTUALIZAR DESDE ODOO» Y ESTÁN FUERA DEL
--    ALCANCE DE LA PARTE 2 (cerradas o anuladas con entrega pasada): son las
--    que la regla única dejaría marcadas «fuera de alcance» (punto 5)
select data->>'estado' as estado, count(*) as ordenes, sum((data->>'cant')::numeric) as unidades,
       min(data->>'fecha') as entrega_min, max(data->>'fecha') as entrega_max
from ordenes
where not (data ? 'origenParte2')
  and (data ? 'samProv' or id like 'prev\_%')
  and data->>'estado' in ('cerrada','anulada','standby')
group by 1 order by 2 desc;

-- 5) ÓRDENES FUNDIDAS POR LA CLAVE DE ODOO (previsiones sin WH, id 'prev_…')
--    La clave de Odoo es cliente|proyecto|stilo|color y NO lleva ODC: si en los
--    datos existe esa combinación con MÁS DE UNA ODC, Odoo la fundió en una.
--    Con qué se cruza: NO hay tabla de tareas/ODC en Supabase (el archivo de
--    tareas no se guarda; solo quedan las órdenes que cada cargador creó).
--    Por eso se cruza contra la propia tabla ordenes: las 'SIN WH #…' de la
--    Parte 2 sí conservan su ODC (data->>'odc'), y una 'prev_…' cuyo
--    cliente|proyecto|stilo|color calce con 2+ ODC distintas ahí es un par fundido.
--    Si en producción no hay 'SIN WH #…' cargadas, este bloque devuelve 0 filas y
--    NO significa que no haya fundidas: significa que no hay con qué cruzar.
with prev as (
  select id,
         lower(trim(coalesce(data->>'cliente','')))||'|'||lower(trim(coalesce(data->>'proyecto','')))||'|'||
         lower(trim(coalesce(data->>'ref','')))||'|'||upper(trim(coalesce(data->>'colorOdoo',''))) as k,
         (data->>'cant')::numeric as cant, data->>'fecha' as fecha, data->>'fase' as fase, actualizado
  from ordenes
  where id like 'prev\_%'
), sinwh as (
  select id,
         lower(trim(coalesce(data->>'cliente','')))||'|'||lower(trim(coalesce(data->>'proyecto','')))||'|'||
         lower(trim(coalesce(data->>'ref','')))||'|'||upper(trim(coalesce(data->>'colorOdoo',''))) as k,
         coalesce(data->>'odc','') as odc, (data->>'cant')::numeric as cant, data->>'fecha' as fecha
  from ordenes
  where data->>'op' like 'SIN WH%'
), odcs as (
  select k, count(distinct odc) as n_odc,
         string_agg(distinct odc||' ('||coalesce(cant::text,'')||' u · '||coalesce(fecha,'')||')', ' | ') as odcs
  from sinwh group by k having count(distinct odc) > 1
)
select p.id as prev_id, p.k as clave_odoo, p.cant as cant_prev, p.fecha as fecha_prev, p.fase,
       o.n_odc as odc_distintas, o.odcs as odc_en_parte2
from prev p join odcs o using (k)
order by o.n_odc desc, p.k;

-- 5b) Cuántas 'prev_…' hay en total y cuántas 'SIN WH #…' (para saber si el
--     bloque 5 tenía con qué cruzar)
select count(*) filter (where id like 'prev\_%') as previsiones_odoo,
       count(*) filter (where data->>'op' like 'SIN WH%') as sin_wh_parte2
from ordenes;
