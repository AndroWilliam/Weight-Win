-- Create weight photos storage bucket

-- Create bucket for weight photos
do $$ 
begin
  insert into storage.buckets (id, name, public)
  values ('weight-photos', 'weight-photos', false);
exception when unique_violation then
  null; -- Bucket already exists
end $$;

-- Storage policies for weight photos bucket
do $plpgsql$
declare
  has_read boolean;
  has_insert boolean;
  has_update boolean;
  has_delete boolean;
begin
  -- Check if policies already exist
  select exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='weight_photos_read_owner') into has_read;
  select exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='weight_photos_insert_owner') into has_insert;
  select exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='weight_photos_update_owner') into has_update;
  select exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='weight_photos_delete_owner') into has_delete;

  -- Create policies if they don't exist
  if not has_read then
    execute $sql$
      create policy "weight_photos_read_owner" on storage.objects for select to authenticated
      using (
        bucket_id = 'weight-photos' and 
        auth.uid()::text = split_part(name, '/', 1)
      );
    $sql$;
  end if;

  if not has_insert then
    execute $sql$
      create policy "weight_photos_insert_owner" on storage.objects for insert to authenticated
      with check (
        bucket_id = 'weight-photos' and 
        auth.uid()::text = split_part(name, '/', 1)
      );
    $sql$;
  end if;

  if not has_update then
    execute $sql$
      create policy "weight_photos_update_owner" on storage.objects for update to authenticated
      using (
        bucket_id = 'weight-photos' and 
        auth.uid()::text = split_part(name, '/', 1)
      )
      with check (
        bucket_id = 'weight-photos' and 
        auth.uid()::text = split_part(name, '/', 1)
      );
    $sql$;
  end if;

  if not has_delete then
    execute $sql$
      create policy "weight_photos_delete_owner" on storage.objects for delete to authenticated
      using (
        bucket_id = 'weight-photos' and 
        auth.uid()::text = split_part(name, '/', 1)
      );
    $sql$;
  end if;
end $plpgsql$;

-- Also allow anonymous uploads for weight photos (temporary)
do $plpgsql$
declare
  has_anon_insert boolean;
begin
  select exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='weight_photos_insert_anon') into has_anon_insert;

  if not has_anon_insert then
    execute $sql$
      create policy "weight_photos_insert_anon" on storage.objects for insert to anon
      with check (
        bucket_id = 'weight-photos' and 
        name like 'weights/%'
      );
    $sql$;
  end if;
end $plpgsql$;
