-- Test Nutritionist Applications Data Collection
-- This script helps verify that nutritionist applications are being collected properly

-- 1. Check if tables exist and have data
do $$
declare
  v_app_count integer;
  v_doc_count integer;
  v_event_count integer;
begin
  -- Count applications
  select count(*) into v_app_count from public.nutritionist_applications;
  
  -- Count documents
  select count(*) into v_doc_count from public.application_documents;
  
  -- Count events
  select count(*) into v_event_count from public.application_events;
  
  raise notice '=== NUTRITIONIST APPLICATIONS DATA CHECK ===';
  raise notice 'Total applications: %', v_app_count;
  raise notice 'Total documents: %', v_doc_count;
  raise notice 'Total events: %', v_event_count;
  
  if v_app_count = 0 then
    raise notice 'WARNING: No applications found! The submission form may not be working.';
  else
    raise notice 'SUCCESS: Applications are being collected!';
  end if;
end $$;

-- 2. Show recent applications (last 10)
select 
  'Recent Applications:' as info,
  id,
  first_name,
  family_name,
  email,
  status,
  created_at
from public.nutritionist_applications
order by created_at desc
limit 10;

-- 3. Check application status distribution
select 
  'Status Distribution:' as info,
  status,
  count(*) as count
from public.nutritionist_applications
group by status
order by count desc;

-- 4. Check if documents are being stored
select 
  'Document Storage Check:' as info,
  ad.kind,
  count(*) as count,
  count(case when ad.file_path is not null then 1 end) as with_file_path
from public.application_documents ad
group by ad.kind;

-- 5. Check application events
select 
  'Recent Events:' as info,
  ae.event_type,
  count(*) as count,
  max(ae.created_at) as last_event
from public.application_events ae
group by ae.event_type
order by last_event desc;

-- 6. Test admin access (if you're an admin)
do $$
declare
  v_is_admin boolean;
begin
  select public.is_admin() into v_is_admin;
  
  if v_is_admin then
    raise notice 'SUCCESS: You have admin access to view all applications';
    
    -- Show all applications for admin
    raise notice 'All applications (admin view):';
    for rec in 
      select id, first_name, family_name, email, status, created_at
      from public.nutritionist_applications
      order by created_at desc
    loop
      raise notice 'ID: %, Name: % %, Email: %, Status: %, Created: %', 
        rec.id, rec.first_name, rec.family_name, rec.email, rec.status, rec.created_at;
    end loop;
  else
    raise notice 'INFO: You are not an admin. Only your own applications are visible.';
  end if;
end $$;

-- 7. Check storage bucket
do $$
declare
  v_bucket_exists boolean;
  v_file_count integer;
begin
  -- Check if bucket exists
  select exists(
    select 1 from storage.buckets where id = 'applicant-docs'
  ) into v_bucket_exists;
  
  if v_bucket_exists then
    raise notice 'SUCCESS: applicant-docs storage bucket exists';
    
    -- Count files in bucket
    select count(*) into v_file_count
    from storage.objects 
    where bucket_id = 'applicant-docs';
    
    raise notice 'Files in applicant-docs bucket: %', v_file_count;
  else
    raise notice 'ERROR: applicant-docs storage bucket does not exist!';
  end if;
end $$;

-- 8. Sample query to test the admin view
select 
  'Admin View Test:' as info,
  id,
  first_name,
  family_name,
  email,
  mobile_e164,
  id_type,
  status,
  created_at
from public.admin_applications_view
limit 5;
