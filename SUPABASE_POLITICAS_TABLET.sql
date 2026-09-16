-- ============================================================================
-- PROPUESTA DE POLÍTICAS PARA EL PERFIL TABLET (operarios) — TEMPO PCP
-- ============================================================================
-- NO EJECUTADO. Esperando tu confirmación.
--
-- Qué resuelve: el usuario "Modulo 1 · tablet" recibe
--   "new row violates row-level security policy for table bitacora / avance"
-- porque las políticas de escritura exigen un rol que no incluye a 'tablet'.
--
-- Criterio: el operario puede LEER lo que su pantalla necesita y ESCRIBIR solo
-- donde registra su trabajo. No puede escribir en órdenes, params, centros,
-- recursos ni en ninguna tabla de configuración.
--
-- IMPORTANTE: el tramo de trabajo (inicio, fin, paros, unidades por talla) y las
-- segundas se guardan dentro de `avance` (S.avance[oid].tramos / .tallas / .seg).
-- La asistencia del día se guarda en `turnos`. Los paros generales, en `paros`.
-- Por eso el operario necesita escribir exactamente en: avance, bitacora, turnos
-- y paros. Nada más.
-- ============================================================================

-- 0) Función auxiliar: el rol del usuario que hace la petición.
--    Si ya existe una equivalente en tu base, usa esa y salta este bloque.
create or replace function public.mi_rol()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select rol from public.perfiles where id = auth.uid()
$$;

revoke all on function public.mi_rol() from public;
grant execute on function public.mi_rol() to authenticated;

-- ============================================================================
-- 1) LECTURA: el operario necesita ver estas tablas para armar Mi centro
--    (órdenes de su centro, rutas, categorías, colores, centros y recursos).
--    Es solo lectura: no puede modificarlas.
-- ============================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'ordenes','avance','centros','recursos','categorias','colores','telas','rutas',
    'operaciones','tecnicas','maquinas','programas','planes','turnos','paros','bitacora',
    'cargas','propuestas','salidas_tin','banos_conf'
  ]
  loop
    execute format('drop policy if exists tablet_lee on public.%I', t);
    execute format(
      'create policy tablet_lee on public.%I for select to authenticated using (true)', t);
  end loop;
end $$;

-- ============================================================================
-- 2) ESCRITURA del piso: avance, bitacora, turnos y paros.
--    Incluye al perfil tablet y a los perfiles de piso que ya registraban
--    (corte, modulos, terminado, piso), para que nadie pierda lo que hacía.
-- ============================================================================
do $$
declare t text;
declare roles_piso text := $roles$ array['tablet','corte','modulos','terminado','piso','tintoreria','tejeduria'] $roles$;
begin
  foreach t in array array['avance','bitacora','turnos','paros']
  loop
    execute format('drop policy if exists piso_escribe on public.%I', t);
    execute format(
      'create policy piso_escribe on public.%I for insert to authenticated with check (public.mi_rol() = any(%s))', t, roles_piso);

    execute format('drop policy if exists piso_actualiza on public.%I', t);
    execute format(
      'create policy piso_actualiza on public.%I for update to authenticated using (public.mi_rol() = any(%s)) with check (public.mi_rol() = any(%s))', t, roles_piso, roles_piso);
  end loop;
end $$;

-- Nota: NO se da permiso de delete al piso. Nada se borra desde la tablet.

-- ============================================================================
-- 3) Lo que el operario NO puede escribir (se deja explícito para que se lea)
--    ordenes, params, centros, recursos, categorias, colores, telas, rutas,
--    operaciones, tecnicas, maquinas, programas, planes, cargas, propuestas,
--    salidas_tin, banos_conf.
--    Si alguna de esas tablas tiene hoy una política que permite escribir a
--    'authenticated' sin mirar el rol, conviene restringirla a los perfiles que
--    corresponda. Revisar con el volcado de SUPABASE_POLITICAS_ACTUALES.sql.
-- ============================================================================

-- 4) Comprobación después de ejecutar (debe listar las políticas nuevas)
-- select tablename, policyname, cmd, roles
-- from pg_policies
-- where schemaname='public' and policyname in ('tablet_lee','piso_escribe','piso_actualiza')
-- order by tablename, policyname;
