-- Nutritionist Applications Setup Script
-- This script creates all necessary tables and policies for nutritionist applications

-- 1. Create enums if they don't exist
do $$ begin
  create type id_type as enum ('national_id','passport');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type application_status as enum ('new','in_review','waiting_on_applicant','approved','rejected');
exception when duplicate_object then null;
end $$;

-- 2. Create nutritionist_applications table
create table if not exists public.nutritionist_applications (
  id bigserial primary key,
  applicant_user_id uuid references auth.users(id) on delete set null, -- Optional for anonymous applicants
  first_name text not null,
  family_name text not null,
  phone_e164 text not null,
  email citext not null,
  id_type id_type not null,
  id_number text not null,
  status application_status not null default 'new',
  id_validation_status text default 'pending',
  id_validation_confidence decimal(3,2),
  cv_file_path text, -- Path in storage bucket
  id_file_path text, -- Path in storage bucket
  ocr_status text default 'pending', -- For admin display
  notes text, -- Admin notes
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Create application_documents table
create table if not exists public.application_documents (
  id bigserial primary key,
  application_id bigint not null references public.nutritionist_applications(id) on delete cascade,
  kind text not null check (kind in ('cv', 'id')),
  file_path text not null,
  created_at timestamptz not null default now()
);

-- 4. Create application_events table for tracking
create table if not exists public.application_events (
  id bigserial primary key,
  application_id bigint not null references public.nutritionist_applications(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null, -- Who performed the action
  event_type text not null, -- 'submitted', 'reviewed', 'approved', 'rejected', etc.
  meta jsonb, -- Additional event data
  created_at timestamptz not null default now()
);

-- 5. Create indexes for performance
create index if not exists idx_nutritionist_applications_email on public.nutritionist_applications (email);
create index if not exists idx_nutritionist_applications_status on public.nutritionist_applications (status);
create index if not exists idx_nutritionist_applications_created_at on public.nutritionist_applications (created_at);
create index if not exists idx_application_documents_app_id on public.application_documents (application_id);
create index if not exists idx_application_events_app_id on public.application_events (application_id);

-- 6. Enable RLS
alter table public.nutritionist_applications enable row level security;
alter table public.application_documents enable row level security;
alter table public.application_events enable row level security;

-- 7. RLS Policies for nutritionist_applications
-- Users can view their own applications
create policy "Users can view own applications" on public.nutritionist_applications
  for select using (auth.uid() = applicant_user_id);

-- Anyone can insert applications (for anonymous submissions)
create policy "Anyone can submit applications" on public.nutritionist_applications
  for insert with check (true);

-- Users can update their own applications
create policy "Users can update own applications" on public.nutritionist_applications
  for update using (auth.uid() = applicant_user_id);

-- Admins can view all applications
create policy "Admins can view all applications" on public.nutritionist_applications
  for select using (public.is_admin());

-- Admins can update all applications
create policy "Admins can update all applications" on public.nutritionist_applications
  for update using (public.is_admin());

-- 8. RLS Policies for application_documents
-- Users can view documents for their own applications
create policy "Users can view own application documents" on public.application_documents
  for select using (
    exists (
      select 1 from public.nutritionist_applications na 
      where na.id = application_id 
      and na.applicant_user_id = auth.uid()
    )
  );

-- Anyone can insert documents (for anonymous submissions)
create policy "Anyone can insert application documents" on public.application_documents
  for insert with check (true);

-- Admins can view all documents
create policy "Admins can view all application documents" on public.application_documents
  for select using (public.is_admin());

-- 9. RLS Policies for application_events
-- Users can view events for their own applications
create policy "Users can view own application events" on public.application_events
  for select using (
    exists (
      select 1 from public.nutritionist_applications na 
      where na.id = application_id 
      and na.applicant_user_id = auth.uid()
    )
  );

-- Anyone can insert events (for anonymous submissions)
create policy "Anyone can insert application events" on public.application_events
  for insert with check (true);

-- Admins can view all events
create policy "Admins can view all application events" on public.application_events
  for select using (public.is_admin());

-- 10. Create applicant-docs storage bucket
do $$ 
begin
  insert into storage.buckets (id, name, public)
  values ('applicant-docs', 'applicant-docs', false);
exception when unique_violation then
  null; -- Bucket already exists
end $$;

-- 11. Storage policies for applicant-docs bucket
do $plpgsql$
declare
  has_read boolean;
  has_insert boolean;
  has_update boolean;
  has_delete boolean;
begin
  -- Check if policies already exist
  select exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='applicant_docs_read') into has_read;
  select exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='applicant_docs_insert') into has_insert;
  select exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='applicant_docs_update') into has_update;
  select exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='applicant_docs_delete') into has_delete;

  -- Create policies if they don't exist
  if not has_read then
    execute $sql$
      create policy "applicant_docs_read" on storage.objects for select
      using (
        bucket_id = 'applicant-docs' and (
          -- Users can read their own files
          auth.uid()::text = split_part(name, '/', 1) or
          -- Admins can read all files
          public.is_admin()
        )
      );
    $sql$;
  end if;

  if not has_insert then
    execute $sql$
      create policy "applicant_docs_insert" on storage.objects for insert
      with check (
        bucket_id = 'applicant-docs' and (
          -- Users can upload to their own folder
          auth.uid()::text = split_part(name, '/', 1) or
          -- Anonymous users can upload (for applications)
          auth.uid() is null
        )
      );
    $sql$;
  end if;

  if not has_update then
    execute $sql$
      create policy "applicant_docs_update" on storage.objects for update
      using (
        bucket_id = 'applicant-docs' and (
          auth.uid()::text = split_part(name, '/', 1) or
          public.is_admin()
        )
      )
      with check (
        bucket_id = 'applicant-docs' and (
          auth.uid()::text = split_part(name, '/', 1) or
          public.is_admin()
        )
      );
    $sql$;
  end if;

  if not has_delete then
    execute $sql$
      create policy "applicant_docs_delete" on storage.objects for delete
      using (
        bucket_id = 'applicant-docs' and (
          auth.uid()::text = split_part(name, '/', 1) or
          public.is_admin()
        )
      );
    $sql$;
  end if;
end $plpgsql$;

-- 12. Create trigger to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_nutritionist_applications_updated_at on public.nutritionist_applications;
create trigger trg_nutritionist_applications_updated_at
before update on public.nutritionist_applications
for each row execute function public.update_updated_at_column();

-- 13. Grant necessary permissions
grant usage on schema public to authenticated, anon;
grant select, insert, update on public.nutritionist_applications to authenticated, anon;
grant select, insert on public.application_documents to authenticated, anon;
grant select, insert on public.application_events to authenticated, anon;
grant usage, select on all sequences in schema public to authenticated, anon;

-- 14. Create a view for admin dashboard (simplified)
create or replace view public.admin_applications_view as
select 
  na.id,
  na.first_name,
  na.family_name,
  na.email,
  na.phone_e164 as mobile_e164,
  na.id_type,
  na.id_number,
  na.status,
  na.ocr_status,
  na.created_at,
  na.cv_file_path,
  na.id_file_path,
  na.notes
from public.nutritionist_applications na
order by na.created_at desc;

-- Grant access to the view
grant select on public.admin_applications_view to authenticated;

-- 15. Create a function to get application with documents
create or replace function public.get_application_with_documents(p_application_id bigint)
returns json
language plpgsql
security definer
as $$
declare
  v_application record;
  v_documents json;
  v_events json;
  v_result json;
begin
  -- Check if user can access this application
  if not public.is_admin() and not exists (
    select 1 from public.nutritionist_applications 
    where id = p_application_id 
    and applicant_user_id = auth.uid()
  ) then
    raise exception 'Access denied';
  end if;

  -- Get application details
  select * into v_application
  from public.nutritionist_applications
  where id = p_application_id;

  if v_application is null then
    raise exception 'Application not found';
  end if;

  -- Get documents
  select json_agg(
    json_build_object(
      'id', id,
      'kind', kind,
      'file_path', file_path,
      'created_at', created_at
    )
  ) into v_documents
  from public.application_documents
  where application_id = p_application_id;

  -- Get events
  select json_agg(
    json_build_object(
      'id', id,
      'event_type', event_type,
      'actor_user_id', actor_user_id,
      'meta', meta,
      'created_at', created_at
    )
  ) into v_events
  from public.application_events
  where application_id = p_application_id
  order by created_at desc;

  -- Build result
  v_result := json_build_object(
    'application', row_to_json(v_application),
    'documents', coalesce(v_documents, '[]'::json),
    'events', coalesce(v_events, '[]'::json)
  );

  return v_result;
end;
$$;

-- Grant execute permission
grant execute on function public.get_application_with_documents(bigint) to authenticated;

-- 16. Insert some sample data for testing (optional)
-- Uncomment the following lines if you want to add sample data
/*
insert into public.nutritionist_applications (
  first_name, family_name, phone_e164, email, id_type, id_number, status
) values 
  ('John', 'Doe', '+1234567890', 'john.doe@example.com', 'national_id', '123456789', 'new'),
  ('Jane', 'Smith', '+1234567891', 'jane.smith@example.com', 'passport', 'AB123456', 'in_review')
on conflict do nothing;
*/

-- Success message
do $$
begin
  raise notice 'Nutritionist applications setup completed successfully!';
  raise notice 'Tables created: nutritionist_applications, application_documents, application_events';
  raise notice 'Storage bucket created: applicant-docs';
  raise notice 'RLS policies configured for security';
  raise notice 'Admin view created: admin_applications_view';
end $$;
