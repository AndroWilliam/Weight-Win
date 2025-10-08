-- Quick Check: Are Applications Being Stored?
-- Run this to see if your test application was saved

-- 1. Count total applications
select 
  'Total Applications:' as info,
  count(*) as count
from public.nutritionist_applications;

-- 2. Show recent applications (last 5)
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
limit 5;

-- 3. Check if documents are linked
select 
  'Application Documents:' as info,
  na.id as app_id,
  na.first_name,
  na.family_name,
  ad.kind as document_type,
  ad.file_path
from public.nutritionist_applications na
left join public.application_documents ad on ad.application_id = na.id
order by na.created_at desc
limit 10;

-- 4. Check application events
select 
  'Application Events:' as info,
  na.id as app_id,
  na.first_name,
  na.family_name,
  ae.event_type,
  ae.created_at as event_time
from public.nutritionist_applications na
left join public.application_events ae on ae.application_id = na.id
order by na.created_at desc, ae.created_at desc
limit 10;

-- 5. Test admin view
select 
  'Admin View Test:' as info,
  id,
  first_name,
  family_name,
  email,
  status,
  created_at
from public.admin_applications_view
limit 5;
