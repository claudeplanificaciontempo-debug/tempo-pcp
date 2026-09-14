-- Columna opcional "modo" en la tabla perfiles (editar | ver). Sin ella, todos los usuarios editan según su perfil.
-- Ejecutar una vez en Supabase → SQL Editor si se quiere usar el permiso "solo ve".
alter table public.perfiles add column if not exists modo text;
