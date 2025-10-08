-- Test Nutritionist Application Submission
-- This script simulates submitting a nutritionist application to test the data collection

-- 1. Insert a test application
insert into public.nutritionist_applications (
  first_name,
  family_name, 
  phone_e164,
  email,
  id_type,
  id_number,
  status,
  cv_file_path,
  id_file_path,
  ocr_status
) values (
  'Test',
  'Applicant',
  '+1234567890',
  'test.applicant@example.com',
  'national_id',
  '123456789',
  'new',
  'applicant-docs/test-cv-2024.pdf',
  'applicant-docs/test-id-2024.jpg',
  'pending'
) returning id as application_id;

-- 2. Insert corresponding documents
insert into public.application_documents (application_id, kind, file_path)
select 
  na.id,
  doc.kind,
  doc.file_path
from public.nutritionist_applications na,
lateral (values 
  ('cv', na.cv_file_path),
  ('id', na.id_file_path)
) as doc(kind, file_path)
where na.email = 'test.applicant@example.com'
and doc.file_path is not null;

-- 3. Insert application event
insert into public.application_events (application_id, event_type, meta)
select 
  id,
  'submitted',
  json_build_object(
    'submission_method', 'test_script',
    'timestamp', now()
  )
from public.nutritionist_applications
where email = 'test.applicant@example.com';

-- 4. Verify the test data was inserted
do $$
declare
  v_app_id bigint;
  v_doc_count integer;
  v_event_count integer;
begin
  -- Get the application ID
  select id into v_app_id 
  from public.nutritionist_applications 
  where email = 'test.applicant@example.com';
  
  -- Count documents
  select count(*) into v_doc_count
  from public.application_documents
  where application_id = v_app_id;
  
  -- Count events
  select count(*) into v_event_count
  from public.application_events
  where application_id = v_app_id;
  
  raise notice '=== TEST APPLICATION CREATED ===';
  raise notice 'Application ID: %', v_app_id;
  raise notice 'Documents created: %', v_doc_count;
  raise notice 'Events created: %', v_event_count;
  
  if v_doc_count >= 2 and v_event_count >= 1 then
    raise notice 'SUCCESS: Test application data collection working properly!';
  else
    raise notice 'WARNING: Test application may have issues with data collection';
  end if;
end $$;

-- 5. Show the test application details
select 
  'Test Application Details:' as info,
  na.id,
  na.first_name,
  na.family_name,
  na.email,
  na.status,
  na.created_at,
  ad.kind as document_type,
  ad.file_path,
  ae.event_type,
  ae.created_at as event_time
from public.nutritionist_applications na
left join public.application_documents ad on ad.application_id = na.id
left join public.application_events ae on ae.application_id = na.id
where na.email = 'test.applicant@example.com'
order by na.created_at desc, ad.kind, ae.created_at desc;

-- 6. Clean up test data (uncomment to remove test data)
/*
delete from public.application_events where application_id in (
  select id from public.nutritionist_applications where email = 'test.applicant@example.com'
);

delete from public.application_documents where application_id in (
  select id from public.nutritionist_applications where email = 'test.applicant@example.com'
);

delete from public.nutritionist_applications where email = 'test.applicant@example.com';

raise notice 'Test data cleaned up';
*/
