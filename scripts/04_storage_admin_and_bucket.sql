-- A) Admin registry + helper (safe to re-run)
create table if not exists public.admins (
  user_id uuid primary key,
  added_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(
    (auth.jwt() ->> 'role') = 'admin'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or exists (select 1 from public.admins a where a.user_id = auth.uid()),
    false
  );
$$;

-- B) Create private bucket (idempotent)
do $$
begin
  insert into storage.buckets (id, name, public)
  values ('applicant-docs', 'applicant-docs', false);
exception
  when unique_violation then null;
end $$;

-- C) Create Storage policies only if missing (owner-safe)
do $plpgsql$
declare
  has_read   boolean;
  has_insert boolean;
  has_update boolean;
  has_delete boolean;
begin
  select exists(select 1 from pg_policies
    where schemaname='storage' and tablename='objects'
      and policyname='applicant_docs_read_owner_or_admin') into has_read;
  if not has_read then
    execute $sql$
      create policy "applicant_docs_read_owner_or_admin"
      on storage.objects for select to authenticated
      using (
        bucket_id = 'applicant-docs' and (
          auth.uid()::text = split_part(name, '/', 1) or public.is_admin()
        )
      );
    $sql$;
  end if;

  select exists(select 1 from pg_policies
    where schemaname='storage' and tablename='objects'
      and policyname='applicant_docs_insert_owner') into has_insert;
  if not has_insert then
    execute $sql$
      create policy "applicant_docs_insert_owner"
      on storage.objects for insert to authenticated
      with check (bucket_id = 'applicant-docs'
        and auth.uid()::text = split_part(name, '/', 1));
    $sql$;
  end if;

  select exists(select 1 from pg_policies
    where schemaname='storage' and tablename='objects'
      and policyname='applicant_docs_update_owner') into has_update;
  if not has_update then
    execute $sql$
      create policy "applicant_docs_update_owner"
      on storage.objects for update to authenticated
      using (bucket_id = 'applicant-docs'
        and auth.uid()::text = split_part(name, '/', 1))
      with check (bucket_id = 'applicant-docs'
        and auth.uid()::text = split_part(name, '/', 1));
    $sql$;
  end if;

  select exists(select 1 from pg_policies
    where schemaname='storage' and tablename='objects'
      and policyname='applicant_docs_delete_owner_or_admin') into has_delete;
  if not has_delete then
    execute $sql$
      create policy "applicant_docs_delete_owner_or_admin"
      on storage.objects for delete to authenticated
      using (
        bucket_id = 'applicant-docs' and (
          auth.uid()::text = split_part(name, '/', 1) or public.is_admin()
        )
      );
    $sql$;
  end if;
end
$plpgsql$;


