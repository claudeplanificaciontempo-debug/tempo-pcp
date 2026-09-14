-- Bucket público para las fotos de las órdenes (tempo-pcp).
-- Ejecutar UNA vez en Supabase → SQL Editor (proyecto bypdfogmksbxjaiydhlg).
-- La clave pública (anon) no puede crear buckets, por eso se hace aquí.
-- Las fotos NO van al repo (GitHub Pages es público); en la orden queda solo el enlace.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-ordenes', 'fotos-ordenes', true, 2097152, array['image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/jpeg'];

-- Políticas sobre storage.objects, solo para este bucket:
drop policy if exists "fotos-ordenes leer" on storage.objects;
create policy "fotos-ordenes leer" on storage.objects
  for select using (bucket_id = 'fotos-ordenes');

drop policy if exists "fotos-ordenes subir" on storage.objects;
create policy "fotos-ordenes subir" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'fotos-ordenes');

drop policy if exists "fotos-ordenes reemplazar" on storage.objects;
create policy "fotos-ordenes reemplazar" on storage.objects
  for update to anon, authenticated using (bucket_id = 'fotos-ordenes') with check (bucket_id = 'fotos-ordenes');

-- (No hay política de delete: desde la app no se borran fotos; se reemplazan.)
