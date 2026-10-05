-- ============================================================================
-- INGENIERÍA · tres tablas nuevas y quién puede guardar · TEMPO PCP
-- ============================================================================
-- ESTADO: SIN EJECUTAR. Lo corre la usuaria (Administración) en el editor SQL
-- de Supabase. Decisión de la usuaria del 05-oct-2026: «un módulo de
-- ingeniería: centros de producción, subprocesos y dentro de los subprocesos
-- las operaciones, como una base de datos general; y por otro lado
-- seleccionar las operaciones que corresponden por referencia … las
-- operaciones no van en configuración: pertenecen a ingeniería», con un
-- perfil «Ingeniería» que VE TODO MENOS LA CONFIGURACIÓN y EDITA SOLO LO DE
-- INGENIERÍA.
--
-- ---------------------------------------------------------------------------
-- QUÉ HACE
-- ---------------------------------------------------------------------------
--   0. Comprueba primero lo que necesita (las tablas perfiles y params, la
--      fila 'global' con el catálogo de perfiles y las tablas de la casa que
--      abre). Si falta algo, se DETIENE con un mensaje y no cambia nada.
--   1. Crea tres tablas con el esquema de la casa
--      (id text primary key, data jsonb, actualizado timestamptz,
--       actualizado_por uuid):
--        · ing_subprocesos — centro de producción → subproceso
--          (id 'isp|<centro>|<código>', p. ej. 'isp|modulos|CON-02'). En la
--          misma tabla van las equivalencias (nombre de subproceso de Kronos o
--          familia de operación de la hoja de Odoo → subproceso: 'ieq|…'), las
--          familias de prenda con sus nombres en cada fuente ('ifam|…') y la
--          marca de la siembra ('imeta|siembra': se siembra UNA vez).
--        · ing_operaciones — la base general: UNA fila por operación, con su
--          SAM por familia de prenda dentro de data (Camisetas, Polos,
--          Hoodies…) y sus fuentes (hoja de Odoo, Kronos o a mano)
--          (id 'iop|OP-0001': el código de la casa, consecutivo). Medido con
--          la hoja de Odoo y la base de Kronos del 02-oct: 877 filas, ≈1 MB;
--          por eso NO se lee al entrar: se lee al abrir Ingeniería.
--        · ing_referencias — una fila por tipo de producto + referencia con
--          sus operaciones elegidas (id 'ir|<tipo de producto>|<referencia>').
--      La app lee ing_subprocesos al entrar (≈17 KB), ing_operaciones al abrir
--      Ingeniería y ing_referencias solo al buscar una referencia. NO cambian ningún minuto del programa.
--   2. Un sello (trigger) pone «actualizado» y «actualizado_por» en cada
--      inserción y actualización.
--   3. public.puede_editar_ingenieria(): SÍ si el perfil del usuario
--      (perfiles.rol) tiene en el catálogo de perfiles (params, fila 'global',
--      data->perfilesDef) el permiso «*» o «ingenieria». Si su rol no está en
--      el catálogo, solo 'admin' (red de seguridad, como puede_mover_fase en
--      SUPABASE_MOVER_FASE.sql). Dar o quitar Ingeniería a alguien se hace en
--      la app (Configuración → Usuarios): no hace falta otro SQL.
--   4. RLS de las tres tablas: leer = cualquier usuario con sesión;
--      insertar y actualizar = puede_editar_ingenieria(); BORRAR = NADIE (no
--      hay política de borrado y se revoca el privilegio: nada se borra).
--   5. Abre a quien tiene Ingeniería, SOLO para insertar y actualizar (nunca
--      borrar), las tablas de la casa donde viven hoy los datos que se
--      mudaron a Ingeniería: categorias (tiempos por tipo de producto),
--      operaciones (hoja de operaciones de Odoo), maquinas (inventario por
--      módulo), tecnicas (técnicas de estampado), bitacora (cada cambio deja
--      su línea) y cargas (registro de archivos cargados). Se SUMAN políticas
--      nuevas: las que ya existen (admin, planificación…) quedan igual.
--      NO abre params (ahí está el catálogo de perfiles: abrirla dejaría a
--      cualquiera cambiar los permisos), ni ordenes, ni centros, ni recursos.
--      Por eso lo que hoy vive en los parámetros (tipos de máquina,
--      operarias, ojales y botones, etiqueta de serigrafía, pasos por
--      categoría, insumos que agregan un paso, reglas de la hoja) lo sigue
--      guardando solo Administración: la app lo muestra apagado con su porqué.
--      Ojo: en categorias el candado es de pantalla; la base no filtra por
--      campo, así que quien tiene Ingeniería podría tocar por fuera de la app
--      también los consumos de tela de una categoría.
--
-- ---------------------------------------------------------------------------
-- CÓMO SE CORRE
-- ---------------------------------------------------------------------------
--   1. Supabase → proyecto bypdfogmksbxjaiydhlg → SQL Editor → New query.
--   2. Pegar ESTE archivo entero y pulsar «Run». Si pregunta, elegir
--      «Run without RLS» (con «Run and enable RLS» Supabase mete un ALTER
--      TABLE dentro de la función y falla). Los avisos de «destructive
--      operation» por los REVOKE y los DROP POLICY IF EXISTS son esperables:
--      no borran datos.
--   3. Se puede correr dos veces: no duplica nada ni borra filas.
--   4. Recargar la app: Ingeniería deja de decir «Falta correr
--      SUPABASE_INGENIERIA.sql en Supabase».
--
-- ---------------------------------------------------------------------------
-- CÓMO SE COMPRUEBA
-- ---------------------------------------------------------------------------
--   -- ¿existen las tres tablas, con RLS?   (3 filas, rls = true)
--   select relname as tabla, relrowsecurity as rls
--     from pg_class where relnamespace = 'public'::regnamespace
--      and relname in ('ing_subprocesos','ing_operaciones','ing_referencias');
--
--   -- ¿qué políticas tienen?   (9 filas: leer, inserta y actualiza por tabla; ninguna DELETE)
--   select tablename, policyname, cmd from pg_policies
--    where schemaname = 'public' and tablename like 'ing\_%'
--    order by tablename, policyname;
--
--   -- ¿nadie puede borrar en las tablas de Ingeniería?   (las tres en false)
--   select has_table_privilege('authenticated','public.ing_subprocesos','delete') as subprocesos,
--          has_table_privilege('authenticated','public.ing_operaciones','delete') as operaciones,
--          has_table_privilege('authenticated','public.ing_referencias','delete') as referencias;
--
--   -- ¿qué se abrió en las tablas de la casa?   (12 filas: inserta y actualiza en seis tablas)
--   select tablename, policyname, cmd from pg_policies
--    where schemaname = 'public' and policyname like '%\_ing\_%'
--      and tablename in ('categorias','operaciones','maquinas','tecnicas','bitacora','cargas')
--    order by tablename, policyname;
--
--   -- ¿el catálogo de perfiles ya tiene el perfil Ingeniería?   (lo siembra la app
--   -- la primera vez que entra Administración; 1 fila con sus permisos)
--   select d->>'id' as perfil, d->'permisos' as permisos
--     from public.params p, jsonb_array_elements(coalesce(p.data->'perfilesDef','[]'::jsonb)) d
--    where p.id = 'global' and d->>'id' = 'ingenieria';
--
-- ---------------------------------------------------------------------------
-- CÓMO SE DESHACE
-- ---------------------------------------------------------------------------
--   Cerrar SOLO lo que se abrió en las tablas de la casa (todo lo demás sigue):
--     drop policy if exists categorias_ing_inserta  on public.categorias;
--     drop policy if exists categorias_ing_actualiza on public.categorias;
--     drop policy if exists operaciones_ing_inserta  on public.operaciones;
--     drop policy if exists operaciones_ing_actualiza on public.operaciones;
--     drop policy if exists maquinas_ing_inserta  on public.maquinas;
--     drop policy if exists maquinas_ing_actualiza on public.maquinas;
--     drop policy if exists tecnicas_ing_inserta  on public.tecnicas;
--     drop policy if exists tecnicas_ing_actualiza on public.tecnicas;
--     drop policy if exists bitacora_ing_inserta  on public.bitacora;
--     drop policy if exists bitacora_ing_actualiza on public.bitacora;
--     drop policy if exists cargas_ing_inserta  on public.cargas;
--     drop policy if exists cargas_ing_actualiza on public.cargas;
--   Apagar la escritura de Ingeniería SIN perder nada (la app sigue leyendo):
--     drop policy if exists ing_subprocesos_inserta  on public.ing_subprocesos;
--     drop policy if exists ing_subprocesos_actualiza on public.ing_subprocesos;
--     drop policy if exists ing_operaciones_inserta  on public.ing_operaciones;
--     drop policy if exists ing_operaciones_actualiza on public.ing_operaciones;
--     drop policy if exists ing_referencias_inserta  on public.ing_referencias;
--     drop policy if exists ing_referencias_actualiza on public.ing_referencias;
--   Quitar todo (BORRA lo cargado en las tres tablas: antes baja un Respaldo
--   desde Configuración general → Respaldo y borrado, que ya las incluye):
--     drop table if exists public.ing_subprocesos;
--     drop table if exists public.ing_operaciones;
--     drop table if exists public.ing_referencias;
--     drop function if exists public.puede_editar_ingenieria();
--     drop function if exists public.ing_sello();
--   (y las doce políticas de arriba). Sin las tablas la app vuelve a decir
--   «Falta correr SUPABASE_INGENIERIA.sql» y el resto sigue igual.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0 · comprobar lo que se necesita (si falta algo, se detiene sin cambiar nada)
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  if to_regclass('public.perfiles') is null then
    raise exception 'Falta la tabla public.perfiles: este SQL es para la base de TEMPO PCP (proyecto bypdfogmksbxjaiydhlg). No se cambió nada.';
  end if;
  if not exists (select 1 from information_schema.columns
                  where table_schema = 'public' and table_name = 'perfiles' and column_name = 'rol') then
    raise exception 'La tabla perfiles no tiene la columna «rol»: no se puede saber el perfil de cada usuario. No se cambió nada.';
  end if;
  if to_regclass('public.params') is null then
    raise exception 'Falta la tabla public.params (configuración y catálogo de perfiles). No se cambió nada.';
  end if;
  if not exists (select 1 from public.params where id = 'global') then
    raise exception 'Falta la fila ''global'' de params (ahí vive el catálogo de perfiles). Entra una vez a la app como Administración y vuelve a correr esto. No se cambió nada.';
  end if;
  foreach t in array array['categorias','operaciones','maquinas','tecnicas','bitacora','cargas'] loop
    if to_regclass('public.' || t) is null then
      raise exception 'Falta la tabla public.% (una de las de la casa que este SQL abre a Ingeniería). No se cambió nada.', t;
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 1 · las tres tablas (esquema de la casa)
-- ---------------------------------------------------------------------------
create table if not exists public.ing_subprocesos (
  id              text primary key,
  data            jsonb not null default '{}'::jsonb,
  actualizado     timestamptz not null default now(),
  actualizado_por uuid default auth.uid()
);
create table if not exists public.ing_operaciones (
  id              text primary key,
  data            jsonb not null default '{}'::jsonb,
  actualizado     timestamptz not null default now(),
  actualizado_por uuid default auth.uid()
);
create table if not exists public.ing_referencias (
  id              text primary key,
  data            jsonb not null default '{}'::jsonb,
  actualizado     timestamptz not null default now(),
  actualizado_por uuid default auth.uid()
);

-- ---------------------------------------------------------------------------
-- 2 · «actualizado» y «actualizado_por» en cada inserción y actualización
--     (la app compara el «actualizado» de cada fila para no pisar a otra sesión)
-- ---------------------------------------------------------------------------
create or replace function public.ing_sello()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.actualizado := now();
  new.actualizado_por := auth.uid();
  return new;
end;
$$;

drop trigger if exists ing_subprocesos_sello on public.ing_subprocesos;
create trigger ing_subprocesos_sello before insert or update on public.ing_subprocesos
  for each row execute function public.ing_sello();
drop trigger if exists ing_operaciones_sello on public.ing_operaciones;
create trigger ing_operaciones_sello before insert or update on public.ing_operaciones
  for each row execute function public.ing_sello();
drop trigger if exists ing_referencias_sello on public.ing_referencias;
create trigger ing_referencias_sello before insert or update on public.ing_referencias
  for each row execute function public.ing_sello();

-- ---------------------------------------------------------------------------
-- 3 · quién edita Ingeniería: manda el catálogo de perfiles («*» o «ingenieria»)
-- ---------------------------------------------------------------------------
create or replace function public.puede_editar_ingenieria()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_rol  text;
  v_fila jsonb;
begin
  select rol into v_rol from public.perfiles where id = auth.uid();
  if v_rol is null then
    return false;
  end if;

  select c.d into v_fila
    from (select jsonb_array_elements(coalesce(data->'perfilesDef', '[]'::jsonb)) d
            from public.params where id = 'global') c
   where c.d->>'id' = v_rol
   limit 1;

  -- el catálogo manda: «*» (Administración) o «ingenieria»
  if v_fila is not null then
    return coalesce(v_fila->'permisos' ? '*', false)
        or coalesce(v_fila->'permisos' ? 'ingenieria', false);
  end if;

  -- red de seguridad SOLO si el rol no está en el catálogo
  return v_rol = 'admin';
end;
$$;

revoke all on function public.puede_editar_ingenieria() from public, anon;
grant execute on function public.puede_editar_ingenieria() to authenticated;   -- la usan las políticas, con la sesión del usuario

-- ---------------------------------------------------------------------------
-- 4 · RLS de las tres tablas: leer = autenticados; insertar y actualizar =
--     puede_editar_ingenieria(); borrar = nadie
-- ---------------------------------------------------------------------------
alter table public.ing_subprocesos enable row level security;
alter table public.ing_operaciones enable row level security;
alter table public.ing_referencias enable row level security;

drop policy if exists ing_subprocesos_leer on public.ing_subprocesos;
create policy ing_subprocesos_leer on public.ing_subprocesos for select to authenticated using (true);
drop policy if exists ing_subprocesos_inserta on public.ing_subprocesos;
create policy ing_subprocesos_inserta on public.ing_subprocesos for insert to authenticated
  with check (public.puede_editar_ingenieria());
drop policy if exists ing_subprocesos_actualiza on public.ing_subprocesos;
create policy ing_subprocesos_actualiza on public.ing_subprocesos for update to authenticated
  using (public.puede_editar_ingenieria()) with check (public.puede_editar_ingenieria());

drop policy if exists ing_operaciones_leer on public.ing_operaciones;
create policy ing_operaciones_leer on public.ing_operaciones for select to authenticated using (true);
drop policy if exists ing_operaciones_inserta on public.ing_operaciones;
create policy ing_operaciones_inserta on public.ing_operaciones for insert to authenticated
  with check (public.puede_editar_ingenieria());
drop policy if exists ing_operaciones_actualiza on public.ing_operaciones;
create policy ing_operaciones_actualiza on public.ing_operaciones for update to authenticated
  using (public.puede_editar_ingenieria()) with check (public.puede_editar_ingenieria());

drop policy if exists ing_referencias_leer on public.ing_referencias;
create policy ing_referencias_leer on public.ing_referencias for select to authenticated using (true);
drop policy if exists ing_referencias_inserta on public.ing_referencias;
create policy ing_referencias_inserta on public.ing_referencias for insert to authenticated
  with check (public.puede_editar_ingenieria());
drop policy if exists ing_referencias_actualiza on public.ing_referencias;
create policy ing_referencias_actualiza on public.ing_referencias for update to authenticated
  using (public.puede_editar_ingenieria()) with check (public.puede_editar_ingenieria());

revoke all on public.ing_subprocesos from anon;
revoke all on public.ing_operaciones from anon;
revoke all on public.ing_referencias from anon;
revoke delete, truncate on public.ing_subprocesos from authenticated;
revoke delete, truncate on public.ing_operaciones from authenticated;
revoke delete, truncate on public.ing_referencias from authenticated;
grant select, insert, update on public.ing_subprocesos to authenticated;
grant select, insert, update on public.ing_operaciones to authenticated;
grant select, insert, update on public.ing_referencias to authenticated;

-- ---------------------------------------------------------------------------
-- 5 · las tablas de la casa donde viven hoy los datos mudados a Ingeniería:
--     se SUMAN políticas de insertar y actualizar para quien tiene Ingeniería
--     (las de siempre quedan igual; no se da DELETE; no se toca params,
--     ordenes, centros ni recursos)
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['categorias','operaciones','maquinas','tecnicas','bitacora','cargas'] loop
    execute format('drop policy if exists %I on public.%I', t || '_ing_inserta', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.puede_editar_ingenieria())', t || '_ing_inserta', t);
    execute format('drop policy if exists %I on public.%I', t || '_ing_actualiza', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.puede_editar_ingenieria()) with check (public.puede_editar_ingenieria())', t || '_ing_actualiza', t);
  end loop;
end $$;

-- PostgREST vuelve a leer el esquema (la app ve las tablas sin esperar)
notify pgrst, 'reload schema';
