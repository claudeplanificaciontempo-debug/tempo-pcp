-- =====================================================================================================
-- BORRAR LA HOJA DE OPERACIONES DE ODOO (tabla public.operaciones) · 07-oct-2026 · SIN EJECUTAR
-- Pedido de la usuaria: «lo que se subió de operaciones lo necesito borrar» → eligió «Hoja de Odoo (596 ops)».
--
-- Qué hace, en orden (todo o nada: si un paso falla, no se cambia nada):
--   1. Guarda una COPIA de la tabla en respaldo.operaciones_07oct2026 (un esquema que la app y la clave
--      pública NO ven). Si esa copia ya existe, se detiene: nunca pisa un respaldo.
--   2. Comprueba que la copia tiene las mismas filas que la tabla. Si no, se detiene.
--   3. Borra todas las filas de public.operaciones.
--   4. Deja una línea en la bitácora (quién no se sabe: lo corre una persona en Supabase).
--
-- Qué pasa después en la app (medido el 07-oct con la base de producción, solo lectura):
--   - Ingeniería → Operaciones → «Hoja de Odoo» queda vacía.
--   - Los tiempos que ya tiene escrita cada orden en su ruta NO cambian solos; cambian en la próxima
--     «Actualizar datos» o al tocar cualquier tiempo. Desde ahí:
--       · 34 órdenes abiertas (9.658 prendas) quedan SIN tiempo de confección (Bombers, Boxer, Fit 6, Fit 61,
--         Henley MC/ML, Nueva hija, Oversize, Pantalon Cargo, Short Flecce Cargo, Yogga: no tienen «tiempo que manda»).
--       · 65 quedan sin tiempo de corte o de empaque.
--       · botones, estampado y etiquetas pueden quedar sin tiempo donde solo la hoja lo daba.
--     El programa les sigue dando fecha, pero sin minutos (no ocupan capacidad) y salen como «sin SAM».
--   - Lo que manda sobre la hoja («Tiempos que mandan», 49 tipos de producto) NO se toca.
--
-- ANTES de correrlo: cerrar todas las pestañas abiertas de la app. DESPUÉS: volver a abrirla.
--
-- Para DESHACER (vuelve todo como estaba):
--   insert into public.operaciones select * from respaldo.operaciones_07oct2026 on conflict (id) do nothing;
-- =====================================================================================================

begin;

create schema if not exists respaldo;
revoke all on schema respaldo from public, anon, authenticated;

-- 1 · copia (si ya existe, este paso da error y no se hace nada)
create table respaldo.operaciones_07oct2026 as table public.operaciones;

-- 2 · la copia tiene que estar completa
do $$
declare n_tabla int; n_copia int;
begin
  select count(*) into n_tabla from public.operaciones;
  select count(*) into n_copia from respaldo.operaciones_07oct2026;
  if n_tabla <> n_copia or n_copia = 0 then
    raise exception 'La copia no está completa (tabla %, copia %): no se borra nada', n_tabla, n_copia;
  end if;
end $$;

-- 4 · bitácora (antes del borrado, con el número de filas)
insert into public.bitacora (id, data)
select 'x' || substr(md5(random()::text || clock_timestamp()::text), 1, 7),
       jsonb_build_object(
         't', 'Hoja de operaciones de Odoo BORRADA por pedido de la usuaria (' || count(*) || ' operaciones). '
              || 'Copia en respaldo.operaciones_07oct2026; para deshacer, ver SUPABASE_BORRAR_HOJA_OPERACIONES.sql',
         'u', 'SQL en Supabase',
         'ts', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))
from public.operaciones;

-- 3 · borrar
delete from public.operaciones;

commit;

-- comprobación: tiene que decir tabla 0 y copia 596
select (select count(*) from public.operaciones) as tabla,
       (select count(*) from respaldo.operaciones_07oct2026) as copia;
