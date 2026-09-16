-- ============================================================================
-- EJECUTADO EN PRODUCCIÓN el 15-sep-2026 (noche) — TEMPO PCP
-- ============================================================================
-- Este archivo ya NO es una propuesta: es EL SQL QUE SE EJECUTÓ, tal cual.
-- La propuesta anterior (la que estaba aquí antes) NO se ejecutó; la versión
-- que corrió es más corta y más conservadora:
--   · no crea políticas de LECTURA nuevas (las que ya existían alcanzaban);
--   · no toca ninguna política existente (<tabla>_leer / <tabla>_escribir con
--     rol_actual()): solo AGREGA dos políticas por tabla;
--   · usa su propia función, public.rol_piso_usuario().
--
-- Qué resuelve: el usuario "Modulo 1 · tablet" recibía
--   "new row violates row-level security policy for table bitacora / avance"
-- porque las políticas de escritura que había exigen un rol que no incluye a
-- los perfiles de piso.
--
-- Criterio: el piso escribe SOLO donde registra su trabajo — avance, bitacora,
-- turnos y paros — y nada más. Sin DELETE: desde el piso no se borra nada.
-- El tramo de trabajo (inicio, fin, paros, unidades por talla) y las segundas
-- viven dentro de `avance`; la asistencia del día, en `turnos`; los paros
-- generales, en `paros`.
--
-- COMPROBADO después de ejecutarlo:
--   · pg_policies devuelve 8 filas nuevas (4 tablas × 2 políticas);
--   · "Modulo 1 · tablet" guardó en producción el 16-sep-2026 a las 08:08.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1 · el rol del usuario que hace la petición
-- ---------------------------------------------------------------------------
create or replace function public.rol_piso_usuario()
returns text
language sql
stable
security definer
set search_path = public
as $$ select rol from public.perfiles where id = auth.uid() $$;

revoke all on function public.rol_piso_usuario() from public;
grant execute on function public.rol_piso_usuario() to authenticated;

-- ---------------------------------------------------------------------------
-- 2 · escritura del piso en sus cuatro tablas (insert y update; nunca delete)
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['avance','bitacora','turnos','paros'] loop
    execute format('drop policy if exists piso_inserta on public.%I', t);
    execute format('create policy piso_inserta on public.%I for insert to authenticated
      with check (public.rol_piso_usuario() in (''tablet'',''corte'',''modulos'',''terminado''))', t);
    execute format('drop policy if exists piso_actualiza on public.%I', t);
    execute format('create policy piso_actualiza on public.%I for update to authenticated
      using (public.rol_piso_usuario() in (''tablet'',''corte'',''modulos'',''terminado''))
      with check (public.rol_piso_usuario() in (''tablet'',''corte'',''modulos'',''terminado''))', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 3 · comprobación (dio 8 filas)
-- ---------------------------------------------------------------------------
-- select tablename, policyname, cmd
--   from pg_policies
--  where schemaname = 'public'
--    and policyname in ('piso_inserta','piso_actualiza')
--  order by tablename, policyname;

-- ============================================================================
-- LO QUE HAY QUE SABER PARA MAÑANA
-- ============================================================================
-- · LA LISTA DE ROLES ESTÁ AQUÍ DENTRO, NO EN LA CONFIGURACIÓN DE LA APP.
--   Si creas un perfil nuevo de piso en Configuración → Usuarios (por ejemplo
--   "empaque"), ESE PERFIL NO PODRÁ ESCRIBIR NADA hasta que lo agregues a la
--   lista de esta función y vuelvas a ejecutar el bloque. Es el único lugar
--   del sistema donde una regla de negocio vive en la base y no en una tabla
--   editable: tenerlo presente.
--   (Ojo: no confundir con la columna «Piso» del catálogo de perfiles, que sí
--   es configuración y es la que usa mover_fase / set_prioridad_centro.)
--
-- · Roles realmente en uso en `perfiles` al 16-sep-2026:
--       admin 3 · terminado 1 · tablet 1 · corte 1
--   Ningún usuario tiene 'piso' ni 'planificacion', que son los roles que
--   aceptan las políticas de escritura antiguas (<tabla>_escribir con
--   rol_actual()). Si algún día creas un usuario con perfil planificación,
--   escribirá por esas políticas viejas, no por estas.
--
-- · Al ejecutar SQL con funciones en el editor de Supabase, elegir siempre
--   "Run without RLS". Con "Run and enable RLS" Supabase envuelve la consulta
--   y mete ALTER TABLE dentro de la función, y falla.
--   Los avisos de "destructive operation" por `drop policy if exists` o
--   `revoke` son esperables: no borran datos.
--
-- · Para quitar todo esto (vuelve al estado anterior):
--     do $$ declare t text; begin
--       foreach t in array array['avance','bitacora','turnos','paros'] loop
--         execute format('drop policy if exists piso_inserta on public.%I', t);
--         execute format('drop policy if exists piso_actualiza on public.%I', t);
--       end loop; end $$;
--     drop function if exists public.rol_piso_usuario();
-- ============================================================================
