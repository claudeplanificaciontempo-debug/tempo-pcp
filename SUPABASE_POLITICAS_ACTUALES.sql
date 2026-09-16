-- ============================================================================
-- POLÍTICAS ACTUALES DE SUPABASE (row level security) — TEMPO PCP
-- ============================================================================
-- Estado: PENDIENTE DE VOLCAR. La clave pública de la app (anon) no puede leer
-- pg_policies, así que este archivo no se pudo llenar automáticamente.
--
-- Cómo llenarlo (2 minutos):
-- 1. Abrir Supabase → proyecto bypdfogmksbxjaiydhlg → SQL editor.
-- 2. Ejecutar la consulta de abajo.
-- 3. Exportar el resultado (botón "Download CSV" o copiar) y pegarlo debajo,
--    en la sección "RESULTADO", para que el repo tenga la foto de las políticas.
--
-- No hay datos de clientes en este archivo: solo nombres de tablas, roles y
-- condiciones. Se puede publicar sin riesgo.
-- ============================================================================

-- 1) Todas las políticas del esquema público
select schemaname, tablename, policyname, permissive, roles, cmd,
       qual        as condicion_lectura,
       with_check  as condicion_escritura
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;

-- 2) Qué tablas tienen RLS activo
select relname as tabla, relrowsecurity as rls_activo, relforcerowsecurity as rls_forzado
from pg_class
where relnamespace = 'public'::regnamespace and relkind = 'r'
order by relname;

-- 3) Cómo se decide el rol de cada usuario (tabla perfiles)
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'perfiles'
order by ordinal_position;

-- 4) Qué roles hay hoy en uso (sin exponer nombres ni correos)
select rol, count(*) as usuarios
from public.perfiles
group by rol
order by 2 desc;

-- 5) Funciones auxiliares que suelen usar las políticas (si existen)
select p.proname as funcion, pg_get_functiondef(p.oid) as definicion
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('mi_rol','rol_actual','es_admin','auth_rol','perfil_actual');

-- ============================================================================
-- RESULTADO (pegar aquí la salida de las consultas 1 a 5)
-- ============================================================================
-- (pendiente)
