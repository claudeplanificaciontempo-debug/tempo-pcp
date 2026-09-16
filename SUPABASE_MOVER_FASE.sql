-- ============================================================================
-- PROPUESTA: función mover_fase() para que los SUPERVISORES DE PISO
-- (corte, módulos, terminado) muevan la fase de una orden sin poder escribir
-- en la tabla `ordenes`. TEMPO PCP.
-- ============================================================================
-- NO EJECUTADO. Revísala y ejecútala tú (o autoriza que se ejecute).
-- Mientras no exista, la app avisa "Falta ejecutar SUPABASE_MOVER_FASE.sql"
-- y NO cambia nada.
--
-- ---------------------------------------------------------------------------
-- CÓMO ESTÁ GUARDADA LA FASE (para que la función toque solo eso)
-- ---------------------------------------------------------------------------
-- Todas las tablas del sistema tienen el mismo esquema:
--     id text primary key, data jsonb, actualizado timestamptz, actualizado_por uuid
-- No hay una columna "fase": la orden entera vive dentro de `data` (jsonb).
--   ordenes.id                 = id interno de la orden (no es la WH)
--   ordenes.data->>'op'        = la WH (p. ej. "WH/MO/28513")
--   ordenes.data->>'fase'      = LA FASE ACTUAL  ← lo único que cambia esta función
--   ordenes.data->'fases'      = historial, array de objetos, el último es el vigente:
--                                {"f":"5CD Empaque","antes":"4CD Ensamble",
--                                 "ts":"2026-09-16T13:40:00.000Z","u":"Nombre",
--                                 "origen":"manual","motivo":"..."}
--   ordenes.data->>'terminadaF'= fecha en que la orden llegó a facturado (la app la pone)
-- Todo lo demás de `data` (cant, fecha, ruta, telas, lib, odc, progCentro…) se
-- copia tal cual: la función hace jsonb_set sobre 'fase' y añade una entrada a
-- 'fases'. No toca ningún otro campo, ni otras filas, ni otras tablas salvo la
-- bitácora.
--
-- La auditoría queda en `bitacora`:
--   bitacora.data = {"ts": "...", "u": "quién", "t": "texto"}
--
-- Quién puede llamarla: se lee de `perfiles.rol` y del catálogo de perfiles, que
-- vive en params (id='global') → data->'perfilesDef'. Un perfil puede llamar si:
--   · su fila del catálogo tiene  "piso": "supervisor"   (columna «Piso» de
--     Configuración → Usuarios), o
--   · sus permisos incluyen '*', 'ordenes' o 'programa' (admin y planificación).
-- Así la regla de la base es LA MISMA configuración que usa la app.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1 · quién puede mover fases (lee el catálogo de perfiles)
-- ---------------------------------------------------------------------------
create or replace function public.puede_mover_fase(p_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with yo as (select rol from public.perfiles where id = p_uid),
       cat as (select jsonb_array_elements(coalesce(data->'perfilesDef','[]'::jsonb)) d
                 from public.params where id = 'global')
  select exists (
    select 1 from cat, yo
     where cat.d->>'id' = yo.rol
       and ( cat.d->>'piso' = 'supervisor'
          or cat.d->'permisos' ? '*'
          or cat.d->'permisos' ? 'ordenes'
          or cat.d->'permisos' ? 'programa' )
  )
  -- red de seguridad si el catálogo todavía no tiene la columna «piso»:
  or exists (select 1 from yo where rol in ('admin','planificacion','corte','modulos','terminado'));
$$;

-- ---------------------------------------------------------------------------
-- 2 · mover la fase: solo 'fase' y su historial, más la línea de bitácora
-- ---------------------------------------------------------------------------
create or replace function public.mover_fase(p_orden text, p_fase text, p_motivo text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_data  jsonb;
  v_antes text;
  v_nom   text;
  v_ts    text := to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
  v_ent   jsonb;
begin
  if v_uid is null then
    raise exception 'sin sesión';
  end if;
  if not public.puede_mover_fase(v_uid) then
    raise exception 'tu perfil no mueve fases';
  end if;
  if p_fase is null or btrim(p_fase) = '' then
    raise exception 'falta la fase';
  end if;

  select data into v_data from public.ordenes where id = p_orden for update;
  if v_data is null then
    raise exception 'orden % no existe', p_orden;
  end if;

  -- la fase tiene que existir hoy en alguna orden o en la tabla de fases de
  -- configuración (params.data->'faseGrupos' no trae las fases sueltas, así que
  -- se valida contra las fases realmente usadas; si prefieres no validar,
  -- borra este bloque: la app ya valida contra su lista).
  if not exists (select 1 from public.ordenes where data->>'fase' = p_fase) then
    raise exception 'la fase "%" no existe en ninguna orden', p_fase;
  end if;

  v_antes := v_data->>'fase';
  if v_antes is not distinct from p_fase then
    return jsonb_build_object('ok', true, 'sin_cambio', true);
  end if;

  select coalesce(nombre, email, v_uid::text) into v_nom from public.perfiles where id = v_uid;

  v_ent := jsonb_build_object(
    'f', p_fase, 'antes', v_antes, 'ts', v_ts,
    'u', coalesce(v_nom,''), 'origen', 'manual',
    'motivo', coalesce(p_motivo,''));

  -- solo estas dos claves de `data`; el resto queda intacto
  v_data := jsonb_set(v_data, '{fase}',  to_jsonb(p_fase), true);
  v_data := jsonb_set(v_data, '{fases}',
              (coalesce(v_data->'fases','[]'::jsonb) || v_ent), true);
  -- el historial no crece sin límite (la app guarda las últimas 60)
  if jsonb_array_length(v_data->'fases') > 60 then
    v_data := jsonb_set(v_data, '{fases}', (
      select coalesce(jsonb_agg(e order by n), '[]'::jsonb)
        from jsonb_array_elements(v_data->'fases') with ordinality as t(e, n)
       where n > jsonb_array_length(v_data->'fases') - 60), true);
  end if;

  update public.ordenes
     set data = v_data,
         actualizado = now(),
         actualizado_por = v_uid
   where id = p_orden;

  insert into public.bitacora (id, data, actualizado, actualizado_por)
  values (
    'b' || replace(gen_random_uuid()::text, '-', ''),
    jsonb_build_object(
      'ts', v_ts,
      'u',  coalesce(v_nom,''),
      't',  'Fase ' || coalesce(v_data->>'op', p_orden) || ': ' ||
            coalesce(v_antes,'—') || ' → ' || p_fase ||
            case when coalesce(p_motivo,'') <> '' then ' · ' || p_motivo else '' end ||
            ' (' || coalesce(v_nom,'') || ' · desde el piso)'),
    now(), v_uid);

  return jsonb_build_object('ok', true, 'antes', v_antes, 'despues', p_fase);
end;
$$;

-- ---------------------------------------------------------------------------
-- 3 · permisos de ejecución
-- ---------------------------------------------------------------------------
revoke all on function public.mover_fase(text, text, text) from public, anon;
grant execute on function public.mover_fase(text, text, text) to authenticated;
revoke all on function public.puede_mover_fase(uuid) from public, anon;
grant execute on function public.puede_mover_fase(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 4 · para comprobar después de ejecutarla (con la sesión de un supervisor)
-- ---------------------------------------------------------------------------
-- select public.puede_mover_fase(auth.uid());                 -- debe dar true
-- select public.mover_fase('<id de la orden>', '5CD Empaque', '');
-- select data->>'fase' from public.ordenes where id = '<id de la orden>';
-- select data->>'t' from public.bitacora order by actualizado desc limit 3;
--
-- Para quitarla:
--   drop function if exists public.mover_fase(text, text, text);
--   drop function if exists public.puede_mover_fase(uuid);
-- ============================================================================
-- LO QUE ESTA FUNCIÓN NO HACE (y se sigue validando en la app)
--   · la regla de secuencia de la tabla 1 y el motivo obligatorio al devolver;
--   · el paso de 1Tejeduría a 0Ord Compras (cambia la ruta: eso no es del piso);
--   · reordenar la cola del centro ni editar la ruta: eso también vive en
--     `ordenes` y hoy el piso no lo puede guardar. Si quieres que el supervisor
--     también lo haga, hace falta otra función igual de acotada — dímelo y la
--     propongo.
-- ============================================================================
