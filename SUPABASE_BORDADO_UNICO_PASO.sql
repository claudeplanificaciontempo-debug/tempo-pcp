-- ============================================================================
-- BORDADO COMO ÚNICO PASO DE PRODUCCIÓN · SOLO LECTURA (17-sep-2026)
-- Pregunta: de las órdenes abiertas, ¿cuántas tienen Bordado en la ruta y NINGÚN
-- otro paso de producción (corte, modulos, empaque)? Con sus unidades.
-- Si son muchas, el saldo de Bordado de la nivelación está inflado por rutas
-- incompletas (tej > tin > bordado); si son pocas, el saldo es real.
-- No corrige nada: solo SELECT. Correr en el SQL Editor con la sesión de la usuaria.
--
-- «Abierta» aquí = estado no cerrado (data->>'estado' fuera de cerrada/standby/
-- archivada/noArchivo) y Estado OP de Odoo distinto de done/cancel. La fase de
-- cierre (columna «sistema» de la tabla 1) no se puede evaluar desde SQL: por eso
-- el bloque 2 desglosa por fase, para descontar a ojo las que ya son de cierre.
-- ============================================================================
with base as (
  select id, data->>'op' as op, data->>'fase' as fase, data->>'estado' as estado, data->>'estadoOP' as estado_op,
         (data->>'cant')::numeric as cant, data->>'proyecto' as proyecto,
         coalesce((select array_agg(x->>'centro') from jsonb_array_elements(coalesce(data->'ruta','[]'::jsonb)) x), array[]::text[]) as centros,
         (data ? 'rutaEditada') as ruta_editada, (data ? 'rutaConf') as ruta_confirmada,
         (data->'rutaConf'->>'origen') as ruta_origen
  from ordenes
  where coalesce(data->>'estado','plan') not in ('cerrada','standby','archivada','noArchivo')
    and coalesce(data->>'estadoOP','') not in ('done','cancel')
), clas as (
  select *,
         ('bordado' = any(centros)) as con_bordado,
         ('bordado' = any(centros) and not (centros && array['corte','modulos','empaque'])) as bordado_unico
  from base
)
-- 1) el número que se pide
select count(*) filter (where con_bordado)   as abiertas_con_bordado,
       sum(cant) filter (where con_bordado)  as unidades_con_bordado,
       count(*) filter (where bordado_unico)  as bordado_unico_paso,
       sum(cant) filter (where bordado_unico) as unidades_bordado_unico,
       count(*) filter (where bordado_unico and ruta_editada) as de_ellas_ruta_editada_a_mano,
       count(*) filter (where bordado_unico and ruta_confirmada) as de_ellas_ruta_confirmada
from clas;

-- 2) las «bordado único» por fase (para descontar las que ya están en fase de cierre)
select fase, count(*) as ordenes, sum(cant) as unidades
from clas where bordado_unico
group by fase order by ordenes desc;

-- 3) las «bordado único» por mes de Proyecto (lo que ve la nivelación por meses)
select proyecto, count(*) as ordenes, sum(cant) as unidades
from clas where bordado_unico
group by proyecto order by proyecto;

-- 4) las rutas exactas que tienen (cuáles combinaciones aparecen)
select array_to_string(centros,' > ') as ruta, count(*) as ordenes, sum(cant) as unidades
from clas where bordado_unico
group by 1 order by ordenes desc;
