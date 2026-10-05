-- ============================================================================
-- UNA FUNCIÓN para que los SUPERVISORES DE PISO cambien el RECURSO y la FECHA
-- DE ARRANQUE de una orden en la cola de su centro SIN poder escribir en la
-- tabla `ordenes`. TEMPO PCP.
-- ============================================================================
-- ESTADO: SIN EJECUTAR. Lo corre la usuaria en el editor SQL de Supabase.
--
-- POR QUÉ (decisión de la usuaria, 04-oct-2026): en Centro → Programación, la
-- cola de cada centro tiene las columnas «Recurso» y «Arranca». El supervisor de
-- piso las veía habilitadas, pero su sesión no sube la tabla `ordenes` (las
-- políticas de SUPABASE_POLITICAS_TABLET.sql solo le dejan escribir avance,
-- bitacora, turnos y paros): el cambio se veía en pantalla y SE PERDÍA AL
-- RECARGAR. Decisión: el supervisor Y planificación cambian recurso y arranque.
-- Planificación sigue guardando como siempre (sube la orden); el supervisor de
-- piso pasa por esta función, igual que ya pasa por set_prioridad_centro para
-- el puesto en la cola (SUPABASE_MOVER_FASE.sql, v2, ejecutado el 16-sep-2026).
--
-- Mientras esta función NO exista, la app le muestra al supervisor de piso los
-- campos Recurso y Arranca BLOQUEADOS con el texto
--   «lo cambia planificación (falta un paso en Supabase)»
-- y, si alguien intenta el cambio, avisa «Falta correr
-- SUPABASE_RECURSO_CENTRO.sql en Supabase» y no cambia nada.
--
-- ---------------------------------------------------------------------------
-- CÓMO SE CORRE
-- ---------------------------------------------------------------------------
--   1. Supabase → proyecto bypdfogmksbxjaiydhlg → SQL Editor → New query.
--   2. Pegar ESTE archivo entero y pulsar «Run».
--      Si Supabase pregunta, elegir «Run without RLS» (con «Run and enable RLS»
--      mete un ALTER TABLE dentro de la función y falla, como pasó el 16-sep).
--      Los avisos de «destructive operation» por los REVOKE son esperables.
--   3. Requisito: que ya exista public.puede_mover_fase() (SUPABASE_MOVER_FASE.sql
--      v2). Si no existe, el paso 2 falla y no queda nada a medias.
--   4. Los supervisores que ya tenían la app abierta: recargar la página (la app
--      vuelve a comprobar la función como mucho una vez por minuto).
--
-- ---------------------------------------------------------------------------
-- CÓMO SE COMPRUEBA
-- ---------------------------------------------------------------------------
--   -- ¿existen las funciones?  (deben salir set_recurso_centro y puede_programar_centro)
--   select proname, pg_get_function_identity_arguments(oid) as argumentos
--     from pg_proc
--    where pronamespace = 'public'::regnamespace
--      and proname in ('set_recurso_centro','puede_programar_centro','puede_mover_fase');
--
--   -- ¿quién puede llamarla?  (authenticated: sí; anon y public: no)
--   select has_function_privilege('authenticated', 'public.set_recurso_centro(text,text,text,text)', 'execute') as authenticated,
--          has_function_privilege('anon',          'public.set_recurso_centro(text,text,text,text)', 'execute') as anon;
--
--   Más pruebas, con la sesión de un supervisor de piso, en la sección 5.
--
-- ---------------------------------------------------------------------------
-- CÓMO SE DESHACE
-- ---------------------------------------------------------------------------
--   drop function if exists public.set_recurso_centro(text, text, text, text);
--   drop function if exists public.puede_programar_centro(text);
--   (No toca puede_mover_fase, mover_fase ni set_prioridad_centro. Los recursos y
--   fechas que ya se guardaron se quedan en las órdenes; la app vuelve a mostrar
--   los campos bloqueados al supervisor de piso y planificación sigue igual.)
--
-- ---------------------------------------------------------------------------
-- QUÉ TOCA (y nada más)
-- ---------------------------------------------------------------------------
-- Todas las tablas tienen el mismo esquema:
--     id text primary key, data jsonb, actualizado timestamptz, actualizado_por uuid
-- La orden entera vive dentro de `ordenes.data`. Esta función toca SOLO:
--   ordenes.data->'progCentro'->'<centro>'->>'rec'    = recurso fijado en ese centro
--   ordenes.data->'progCentro'->'<centro>'->>'desde'  = fecha de arranque ('YYYY-MM-DD')
-- y, si después del cambio ese centro ya no tiene puesto ('pri'), recurso ni
-- arranque, quita la entrada del centro entera (lo mismo que hace la app con
-- «quitar lo fijado»). El puesto ('pri') NO lo toca: es de set_prioridad_centro.
-- Además deja UNA línea en `bitacora`:
--   bitacora.data = {"ts": "...", "u": "quién", "t": "texto"}
--
-- PARÁMETROS:  set_recurso_centro(p_orden, p_centro, p_rec, p_desde)
--   p_orden   id interno de la orden (ordenes.id, no la WH)
--   p_centro  id del centro (p. ej. 'modulos', 'corte')
--   p_rec     NULL = no se toca ·  ''  = quitar el recurso fijado · 'id' = fijarlo
--   p_desde   NULL = no se toca ·  ''  = quitar el arranque       · 'YYYY-MM-DD' = fijarlo
--   p_orden NULL = SONDA: la app la llama así UNA vez para saber si la función
--   existe; devuelve {"ok":true,"sonda":true} y no lee ni escribe nada.
--
-- QUIÉN PUEDE (puede_programar_centro, que se apoya en puede_mover_fase()):
--   · administración y planificación (permisos '*', 'ordenes' o 'programa'),
--     en cualquier centro;
--   · un supervisor de piso (columna «Piso» = supervisor en Configuración →
--     Usuarios; o la red de seguridad de puede_mover_fase mientras el catálogo
--     no tenga esa columna) SOLO si su fila del catálogo tiene el permiso
--     «reprogramar» y el centro está entre los suyos (el centro, su área o '*'),
--     igual que la app (puede('reprogramar') && veCentro(centro));
--   · un perfil que no está en el catálogo (perfil viejo): la misma regla que
--     set_prioridad_centro (solo puede_mover_fase()).
--   · un operario (columna «Piso» = operario): NO.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1 · quién puede cambiar recurso y arranque en un centro (no se llama desde la app)
-- ---------------------------------------------------------------------------
create or replace function public.puede_programar_centro(p_centro text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_rol  text;
  v_fila jsonb;
  v_area text;
begin
  -- la misma puerta que el puesto en la cola y la fase: administración,
  -- planificación o supervisor de piso según el catálogo
  if not public.puede_mover_fase() then
    return false;
  end if;

  select rol into v_rol from public.perfiles where id = auth.uid();

  select c.d into v_fila
    from (select jsonb_array_elements(coalesce(data->'perfilesDef', '[]'::jsonb)) d
            from public.params where id = 'global') c
   where c.d->>'id' = v_rol
   limit 1;

  -- perfil viejo, fuera del catálogo: igual que set_prioridad_centro
  if v_fila is null then
    return true;
  end if;

  -- administración y planificación: cualquier centro
  if v_fila->'permisos' ? '*'
     or v_fila->'permisos' ? 'ordenes'
     or v_fila->'permisos' ? 'programa' then
    return true;
  end if;

  -- supervisor de piso: el catálogo manda (permiso «reprogramar» + sus centros)
  if not coalesce(v_fila->'permisos' ? 'reprogramar', false) then
    return false;
  end if;
  if jsonb_typeof(v_fila->'centros') is distinct from 'array' then
    return true;   -- sin lista de centros en el catálogo: igual que set_prioridad_centro
  end if;
  if v_fila->'centros' ? '*' or v_fila->'centros' ? p_centro then
    return true;
  end if;
  select data->>'area' into v_area from public.centros where id = p_centro;
  return v_area is not null and v_fila->'centros' ? v_area;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2 · recurso y arranque de una orden en un centro: solo progCentro.<centro>.rec / .desde
-- ---------------------------------------------------------------------------
create or replace function public.set_recurso_centro(p_orden text, p_centro text, p_rec text, p_desde text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_data  jsonb;
  v_ent   jsonb;
  v_antes jsonb;
  v_nom   text;
  v_ts    text := to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
  v_txt   text := '';
begin
  if v_uid is null then
    raise exception 'sin sesión';
  end if;

  -- SONDA: la app pregunta si la función existe. No lee ni escribe nada.
  if p_orden is null then
    return jsonb_build_object('ok', true, 'sonda', true);
  end if;

  if p_centro is null or btrim(p_centro) = '' then
    raise exception 'falta el centro';
  end if;
  if not public.puede_programar_centro(p_centro) then
    raise exception 'tu perfil no cambia el recurso ni el arranque en %', p_centro;
  end if;
  if p_rec is null and p_desde is null then
    return jsonb_build_object('ok', true, 'sin_cambio', true);
  end if;

  -- el recurso tiene que ser de ese centro
  if coalesce(p_rec, '') <> '' and not exists (
       select 1 from public.recursos where id = p_rec and data->>'centro' = p_centro) then
    raise exception 'el recurso % no es del centro %', p_rec, p_centro;
  end if;
  -- la fecha, como la guarda la app: AAAA-MM-DD
  if coalesce(p_desde, '') <> '' then
    if p_desde !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
      raise exception 'fecha de arranque inválida: %', p_desde;
    end if;
    perform p_desde::date;   -- rechaza 2026-02-31
  end if;

  select data into v_data from public.ordenes where id = p_orden for update;
  if v_data is null then
    raise exception 'la orden % no existe', p_orden;
  end if;

  v_ent := v_data->'progCentro'->p_centro;
  if v_ent is null or jsonb_typeof(v_ent) <> 'object' then
    v_ent := '{}'::jsonb;
  end if;
  v_antes := v_ent;

  -- solo estas dos claves de la entrada del centro
  if p_rec is not null then
    if p_rec = '' then v_ent := v_ent - 'rec';
    else v_ent := jsonb_set(v_ent, '{rec}', to_jsonb(p_rec), true);
    end if;
  end if;
  if p_desde is not null then
    if p_desde = '' then v_ent := v_ent - 'desde';
    else v_ent := jsonb_set(v_ent, '{desde}', to_jsonb(p_desde), true);
    end if;
  end if;

  -- nada que cambiar... salvo una entrada del centro que ya no tiene puesto, recurso ni arranque
  -- (la deja así set_prioridad_centro al quitar el puesto): esa se limpia
  if v_ent = v_antes and ((v_ent ? 'pri') or (v_ent ? 'rec') or (v_ent ? 'desde')
                          or v_data->'progCentro'->p_centro is null) then
    return jsonb_build_object('ok', true, 'sin_cambio', true, 'antes', v_antes, 'despues', v_ent);
  end if;

  if v_data->'progCentro' is null or jsonb_typeof(v_data->'progCentro') <> 'object' then
    v_data := jsonb_set(v_data, '{progCentro}', '{}'::jsonb, true);
  end if;
  if (v_ent ? 'pri') or (v_ent ? 'rec') or (v_ent ? 'desde') then
    v_data := jsonb_set(v_data, array['progCentro', p_centro], v_ent, true);
  else
    -- sin puesto, recurso ni arranque: la entrada del centro sobra (como «quitar lo fijado»)
    v_data := v_data #- array['progCentro', p_centro];
  end if;

  select coalesce(nombre, email, v_uid::text) into v_nom from public.perfiles where id = v_uid;

  update public.ordenes
     set data = v_data, actualizado = now(), actualizado_por = v_uid
   where id = p_orden;

  if v_ent = v_antes then
    v_txt := 'sin puesto, recurso ni arranque: se quita la entrada vacía del centro';
  end if;
  if p_rec is not null and v_ent <> v_antes then
    v_txt := v_txt || 'recurso ' || coalesce(v_antes->>'rec', 'automático') || ' → ' ||
             coalesce(nullif(p_rec, ''), 'automático');
  end if;
  if p_desde is not null and v_ent <> v_antes then
    v_txt := v_txt || case when v_txt <> '' then ' · ' else '' end ||
             'arranque ' || coalesce(v_antes->>'desde', '—') || ' → ' || coalesce(nullif(p_desde, ''), '—');
  end if;

  insert into public.bitacora (id, data, actualizado, actualizado_por)
  values ('b' || replace(gen_random_uuid()::text, '-', ''),
          jsonb_build_object('ts', v_ts, 'u', coalesce(v_nom,''),
            't', 'Recurso y arranque en la cola de ' || p_centro || ' · ' ||
                 coalesce(v_data->>'op', p_orden) || ': ' || v_txt ||
                 ' (' || coalesce(v_nom,'') || ' · desde el piso)'),
          now(), v_uid);

  return jsonb_build_object('ok', true, 'antes', v_antes,
                            'despues', coalesce(v_data->'progCentro'->p_centro, 'null'::jsonb));
end;
$$;

-- ---------------------------------------------------------------------------
-- 3 · permisos de ejecución
-- ---------------------------------------------------------------------------
-- puede_programar_centro NO se llama desde la app: solo desde set_recurso_centro.
revoke all on function public.puede_programar_centro(text) from public, anon, authenticated;

revoke all on function public.set_recurso_centro(text, text, text, text) from public, anon;
grant  execute on function public.set_recurso_centro(text, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 4 · (nada que migrar: los recursos y arranques que planificación ya guardó
--     siguen donde estaban, en ordenes.data->progCentro)
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 5 · comprobaciones (con la sesión de un supervisor de piso)
-- ---------------------------------------------------------------------------
-- -- ¿qué orden voy a usar de prueba?
-- select id, data->>'op' as wh, data->'progCentro' as prog
--   from public.ordenes where data->>'op' = 'WH/MO/28513';
--
-- -- la sonda (lo que hace la app para saber si la función existe)
-- select public.set_recurso_centro(null, null, null, null);      -- {"ok": true, "sonda": true}
--
-- -- fijar recurso y arranque, y ver que solo cambió eso
-- select public.set_recurso_centro('<id>', 'modulos', '<id del recurso>', '2026-10-10');
-- select data->'progCentro' from public.ordenes where id = '<id>';
--
-- -- quitar solo el arranque ('' = quitar; null = no tocar)
-- select public.set_recurso_centro('<id>', 'modulos', null, '');
--
-- -- quitar los dos (si tampoco tiene puesto, la entrada del centro desaparece)
-- select public.set_recurso_centro('<id>', 'modulos', '', '');
--
-- -- la auditoría
-- select data->>'ts', data->>'u', data->>'t'
--   from public.bitacora order by actualizado desc limit 5;
--
-- -- un perfil que NO debería poder (entrando con ese usuario: un operario, o un
-- -- supervisor en un centro que no es suyo):
-- select public.set_recurso_centro('<id>', 'modulos', '<id del recurso>', '');  -- error de permiso
--
-- ============================================================================
-- LO QUE ESTA FUNCIÓN NO HACE (y se sigue validando en la app)
--   · la regla «no se puede fijar un arranque anterior a hoy» (salvo la orden
--     que ya arrancó, que conserva su fecha real): la valida la app con
--     fechaArranqueValida antes de llamar;
--   · el aviso de fechas (Advertencias de fecha) y la línea de la bitácora con
--     la fecha estimada antes → después: los escribe la app;
--   · el PUESTO en la cola: es de set_prioridad_centro (SUPABASE_MOVER_FASE.sql);
--   · EDITAR LA RUTA: no se habilita para el piso.
-- ============================================================================
