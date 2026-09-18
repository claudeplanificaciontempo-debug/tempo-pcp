-- ============================================================================
-- Bucket privado «respaldos» para los respaldos automáticos de Restaurar y de
-- «Borrar datos de prueba» (17-sep-2026). PROPUESTA: NO EJECUTAR sin revisarla.
-- La ejecuta (o autoriza) la usuaria en el SQL editor de Supabase.
--
-- Qué hace la app con este bucket:
--   · sube  respaldos/<nombre>.json   (subirRespaldo, upsert:false)
--   · baja  respaldos/<nombre>.json   (verificarRespaldoServidor / restaurarRespaldoServidor)
-- Sin permiso de INSERT la subida falla y la app cancela (no restaura / no borra).
-- Sin permiso de SELECT la verificación falla y el borrado se cancela.
-- ============================================================================

-- 1 · El bucket (privado). Si ya existe, esta línea da error y se puede omitir.
insert into storage.buckets (id, name, public, file_size_limit)
values ('respaldos', 'respaldos', false, 104857600)   -- 100 MB: un respaldo completo (órdenes + OT + bitácora) puede pesar decenas de MB
on conflict (id) do update set public = false, file_size_limit = 104857600;

-- 2 · Quién puede subir y leer: usuarios autenticados cuyo perfil tenga rol de
--    administrador (perfiles.rol = 'admin'). Ajustar el rol si el catálogo usa otro id.
create or replace function public.es_admin_respaldos()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol = 'admin');
$$;

drop policy if exists "respaldos: subir (admin)" on storage.objects;
create policy "respaldos: subir (admin)" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'respaldos' and public.es_admin_respaldos());

drop policy if exists "respaldos: leer (admin)" on storage.objects;
create policy "respaldos: leer (admin)" on storage.objects
  for select to authenticated
  using (bucket_id = 'respaldos' and public.es_admin_respaldos());

-- No hay política de UPDATE ni DELETE a propósito: un respaldo no se pisa ni se borra desde la app
-- (la subida usa upsert:false; si el nombre ya existe, falla y la app lo dice).

-- 3 · Comprobar (después de ejecutar):
-- select id, public, file_size_limit from storage.buckets where id = 'respaldos';
-- select policyname, cmd from pg_policies where tablename = 'objects' and policyname like 'respaldos%';
