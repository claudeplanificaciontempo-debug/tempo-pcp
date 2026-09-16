-- ============================================================================
-- DOS FUNCIONES para que los SUPERVISORES DE PISO (corte, módulos,
-- terminado) muevan la fase de una orden y reordenen la cola de su centro
-- SIN poder escribir en la tabla `ordenes`. TEMPO PCP.
-- ============================================================================
-- EJECUTADO EN PRODUCCIÓN el 16-sep-2026. Comprobado en pg_proc: existen
-- fase_num, puede_mover_fase, mover_fase y set_prioridad_centro.
--
-- Nota de la ejecución: el primer intento falló porque se eligió "Run and
-- enable RLS" y Supabase insertó un ALTER TABLE dentro de la función. Se
-- volvió a ejecutar con "Run without RLS" y pasó limpio; no quedaron objetos
-- a medias. Para el futuro: SQL con funciones, siempre "Run without RLS".
-- Los avisos de "destructive operation" por revoke son esperables.
--
-- Versión 2 (16-sep-2026), con tus correcciones:
--   · la lista fija de roles es solo una red de seguridad MIENTRAS el catálogo
--     no tenga la clave "piso"; si ya la tiene, manda la configuración;
--   · se quitó la validación de que la fase "exista en alguna orden" (rechazaba
--     la primera orden que llegaba a una fase nueva); eso lo valida la app;
--   · puede_mover_fase() ya no recibe parámetro (usa auth.uid()) y no se le da
--     permiso de ejecución: solo la llaman las otras dos funciones por dentro;
--   · mover_fase pone `terminadaF` igual que la app cuando la orden entra a
--     facturado/terminada;
--   · se agrega set_prioridad_centro() para el orden de la cola.
--
-- ---------------------------------------------------------------------------
-- CÓMO ESTÁ GUARDADA LA ORDEN (para que las funciones toquen solo lo suyo)
-- ---------------------------------------------------------------------------
-- Todas las tablas del sistema tienen el mismo esquema:
--     id text primary key, data jsonb, actualizado timestamptz, actualizado_por uuid
-- No hay columnas de negocio: la orden entera vive dentro de `data` (jsonb).
--   ordenes.id                    = id interno de la orden (no es la WH)
--   ordenes.data->>'op'           = la WH (p. ej. "WH/MO/28513")
--   ordenes.data->>'fase'         = LA FASE ACTUAL        ← mover_fase
--   ordenes.data->'fases'         = historial; cada entrada:
--                                   {"f":"5CD Empaque","antes":"4CD Ensamble",
--                                    "ts":"...","u":"Nombre","origen":"manual",
--                                    "motivo":"..."}      ← mover_fase
--   ordenes.data->>'terminadaF'   = día en que la orden llegó a facturado/terminada
--                                   (la app la pone una sola vez)  ← mover_fase
--   ordenes.data->'progCentro'
--          ->'<centro>'->>'pri'   = PUESTO en la cola de ese centro
--                                                          ← set_prioridad_centro
-- Todo lo demás (cant, fecha, ruta, telas, lib, odc, recursoFijo…) se copia tal
-- cual: las funciones hacen jsonb_set solo sobre esas claves. No tocan otras
-- filas ni otras tablas, salvo la línea de auditoría en `bitacora`:
--   bitacora.data = {"ts": "...", "u": "quién", "t": "texto"}
--
-- QUIÉN PUEDE LLAMARLAS: se lee de `perfiles.rol` y del catálogo de perfiles,
-- que vive en params (id='global') → data->'perfilesDef'. Deja pasar si:
--   · el perfil tiene permisos '*', 'ordenes' o 'programa' (admin, planificación); o
--   · su fila del catálogo dice  "piso": "supervisor"  (columna «Piso» de
--     Configuración → Usuarios).
-- Si la fila del catálogo YA trae la clave "piso", esa es la única regla: si le
-- quitas «supervisor» a corte, corte deja de mover fases. La lista fija de roles
-- de más abajo solo se usa mientras el catálogo no tenga esa clave (o mientras
-- no exista el perfil en el catálogo).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0 · número de fase, igual que en la app: "5CD Empaque" → 5, "Facturado" → 9
-- ---------------------------------------------------------------------------
create or replace function public.fase_num(p_fase text)
returns int
language sql
immutable
as $$
  select case
           when coalesce(p_fase,'') ~* '^factur' then 9
           else coalesce(nullif(substring(btrim(coalesce(p_fase,'')) from '^[0-9]'), '')::int, 0)
         end;
$$;

-- ---------------------------------------------------------------------------
-- 1 · quién puede mover fases y puestos (no se llama desde la app)
-- ---------------------------------------------------------------------------
create or replace function public.puede_mover_fase()
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

  -- administración y planificación, por sus permisos
  if v_fila is not null
     and ( v_fila->'permisos' ? '*'
        or v_fila->'permisos' ? 'ordenes'
        or v_fila->'permisos' ? 'programa' ) then
    return true;
  end if;

  -- si el catálogo ya trae la columna «Piso», MANDA la configuración
  if v_fila is not null and (v_fila ? 'piso') then
    return coalesce(v_fila->>'piso', '') = 'supervisor';
  end if;

  -- red de seguridad SOLO mientras el catálogo no tenga esa clave
  return v_rol in ('admin', 'planificacion', 'corte', 'modulos', 'terminado');
end;
$$;

-- ---------------------------------------------------------------------------
-- 2 · mover la fase: solo 'fase', su historial y (si corresponde) 'terminadaF'
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
begin
  if v_uid is null then
    raise exception 'sin sesión';
  end if;
  if not public.puede_mover_fase() then
    raise exception 'tu perfil no mueve fases';
  end if;
  if p_fase is null or btrim(p_fase) = '' then
    raise exception 'falta la fase';
  end if;

  select data into v_data from public.ordenes where id = p_orden for update;
  if v_data is null then
    raise exception 'la orden % no existe', p_orden;
  end if;

  -- La fase NO se valida aquí contra ninguna lista: la app ya la valida contra
  -- su catálogo, y validarla contra las fases en uso rechazaría la primera
  -- orden que llega a una fase nueva.

  v_antes := v_data->>'fase';
  if v_antes is not distinct from p_fase then
    return jsonb_build_object('ok', true, 'sin_cambio', true);
  end if;

  select coalesce(nombre, email, v_uid::text) into v_nom from public.perfiles where id = v_uid;

  -- solo estas claves de `data`; el resto queda intacto
  v_data := jsonb_set(v_data, '{fase}', to_jsonb(p_fase), true);
  v_data := jsonb_set(v_data, '{fases}',
              coalesce(v_data->'fases', '[]'::jsonb) ||
              jsonb_build_object('f', p_fase, 'antes', v_antes, 'ts', v_ts,
                                 'u', coalesce(v_nom,''), 'origen', 'manual',
                                 'motivo', coalesce(p_motivo,'')), true);

  -- el historial no crece sin límite (la app guarda las últimas 60)
  if jsonb_array_length(v_data->'fases') > 60 then
    v_data := jsonb_set(v_data, '{fases}', (
      select coalesce(jsonb_agg(e order by n), '[]'::jsonb)
        from jsonb_array_elements(v_data->'fases') with ordinality as t(e, n)
       where n > jsonb_array_length(v_data->'fases') - 60), true);
  end if;

  -- igual que la app: al entrar a facturado/terminada (fase 8 o 9) se sella el
  -- día, y solo si no estaba puesto. Si no corresponde, no se toca.
  if public.fase_num(p_fase) >= 8
     and public.fase_num(v_antes) < 8
     and coalesce(v_data->>'terminadaF','') = '' then
    v_data := jsonb_set(v_data, '{terminadaF}',
                to_jsonb(to_char(now() at time zone 'utc', 'YYYY-MM-DD')), true);
  end if;

  update public.ordenes
     set data = v_data, actualizado = now(), actualizado_por = v_uid
   where id = p_orden;

  insert into public.bitacora (id, data, actualizado, actualizado_por)
  values ('b' || replace(gen_random_uuid()::text, '-', ''),
          jsonb_build_object('ts', v_ts, 'u', coalesce(v_nom,''),
            't', 'Fase ' || coalesce(v_data->>'op', p_orden) || ': ' ||
                 coalesce(v_antes,'—') || ' → ' || p_fase ||
                 case when coalesce(p_motivo,'') <> '' then ' · ' || p_motivo else '' end ||
                 ' (' || coalesce(v_nom,'') || ' · desde el piso)'),
          now(), v_uid);

  return jsonb_build_object('ok', true, 'antes', v_antes, 'despues', p_fase);
end;
$$;

-- ---------------------------------------------------------------------------
-- 3 · puesto en la cola de un centro: solo data->progCentro-><centro>->pri
-- ---------------------------------------------------------------------------
-- p_pri nulo o 0 = quitar el puesto (vuelve a "auto").
-- La app llama a esta función una vez por cada orden cuyo puesto cambió.
create or replace function public.set_prioridad_centro(p_orden text, p_centro text, p_pri int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_data  jsonb;
  v_nom   text;
  v_antes text;
  v_ts    text := to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
begin
  if v_uid is null then
    raise exception 'sin sesión';
  end if;
  if not public.puede_mover_fase() then
    raise exception 'tu perfil no reordena la cola';
  end if;
  if p_centro is null or btrim(p_centro) = '' then
    raise exception 'falta el centro';
  end if;

  select data into v_data from public.ordenes where id = p_orden for update;
  if v_data is null then
    raise exception 'la orden % no existe', p_orden;
  end if;

  v_antes := v_data->'progCentro'->p_centro->>'pri';

  if v_data->'progCentro' is null or jsonb_typeof(v_data->'progCentro') <> 'object' then
    v_data := jsonb_set(v_data, '{progCentro}', '{}'::jsonb, true);
  end if;
  if v_data->'progCentro'->p_centro is null
     or jsonb_typeof(v_data->'progCentro'->p_centro) <> 'object' then
    v_data := jsonb_set(v_data, array['progCentro', p_centro], '{}'::jsonb, true);
  end if;

  if p_pri is null or p_pri <= 0 then
    v_data := v_data #- array['progCentro', p_centro, 'pri'];
  else
    v_data := jsonb_set(v_data, array['progCentro', p_centro, 'pri'], to_jsonb(p_pri), true);
  end if;

  select coalesce(nombre, email, v_uid::text) into v_nom from public.perfiles where id = v_uid;

  update public.ordenes
     set data = v_data, actualizado = now(), actualizado_por = v_uid
   where id = p_orden;

  insert into public.bitacora (id, data, actualizado, actualizado_por)
  values ('b' || replace(gen_random_uuid()::text, '-', ''),
          jsonb_build_object('ts', v_ts, 'u', coalesce(v_nom,''),
            't', 'Puesto en la cola de ' || p_centro || ' · ' ||
                 coalesce(v_data->>'op', p_orden) || ': ' ||
                 coalesce(v_antes,'—') || ' → ' || coalesce(p_pri::text,'auto') ||
                 ' (' || coalesce(v_nom,'') || ' · desde el piso)'),
          now(), v_uid);

  return jsonb_build_object('ok', true, 'antes', v_antes, 'despues', p_pri);
end;
$$;

-- ---------------------------------------------------------------------------
-- 4 · permisos de ejecución
-- ---------------------------------------------------------------------------
-- puede_mover_fase NO se llama desde la app: solo desde las otras dos.
revoke all on function public.puede_mover_fase() from public, anon, authenticated;
revoke all on function public.fase_num(text) from public, anon;
grant  execute on function public.fase_num(text) to authenticated;

revoke all on function public.mover_fase(text, text, text) from public, anon;
grant  execute on function public.mover_fase(text, text, text) to authenticated;

revoke all on function public.set_prioridad_centro(text, text, int) from public, anon;
grant  execute on function public.set_prioridad_centro(text, text, int) to authenticated;

-- ---------------------------------------------------------------------------
-- 5 · comprobaciones (con la sesión de un supervisor de piso)
-- ---------------------------------------------------------------------------
-- -- ¿qué orden voy a usar de prueba?
-- select id, data->>'op' as wh, data->>'fase' as fase,
--        data->'progCentro' as prog, data->>'terminadaF' as terminada
--   from public.ordenes where data->>'op' = 'WH/MO/28513';
--
-- -- mover la fase y ver que solo cambió eso
-- select public.mover_fase('<id>', '5CD Empaque', '');
-- select data->>'fase', jsonb_array_length(data->'fases'), data->>'terminadaF'
--   from public.ordenes where id = '<id>';
--
-- -- poner y quitar el puesto en la cola
-- select public.set_prioridad_centro('<id>', 'modulos', 1);
-- select data->'progCentro' from public.ordenes where id = '<id>';
-- select public.set_prioridad_centro('<id>', 'modulos', null);
--
-- -- la auditoría
-- select data->>'ts', data->>'u', data->>'t'
--   from public.bitacora order by actualizado desc limit 5;
--
-- -- un perfil que NO debería poder (entrando con ese usuario):
-- select public.mover_fase('<id>', '5CD Empaque', '');   -- debe dar error de permiso
--
-- ---------------------------------------------------------------------------
-- 6 · para quitarlas (deja todo como estaba; la app vuelve a avisar que faltan)
-- ---------------------------------------------------------------------------
-- drop function if exists public.set_prioridad_centro(text, text, int);
-- drop function if exists public.mover_fase(text, text, text);
-- drop function if exists public.puede_mover_fase();
-- drop function if exists public.fase_num(text);
--
-- ============================================================================
-- LO QUE ESTAS FUNCIONES NO HACEN (y se sigue validando en la app)
--   · la regla de secuencia de la tabla 1 y el motivo obligatorio al devolver;
--   · el paso de 1Tejeduría a 0Ord Compras (cambia la ruta: eso no es del piso);
--   · EDITAR LA RUTA: no se habilita para el piso. La ruta la confirma
--     planificación (Órdenes → Rutas), que es donde vive esa decisión.
-- ============================================================================
