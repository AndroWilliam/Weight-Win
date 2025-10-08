-- Quick Verification Script for Nutritionist Applications
-- Run this after the setup script to verify everything is working

-- 1. Check if tables exist
do $$
declare
  v_app_table_exists boolean;
  v_doc_table_exists boolean;
  v_event_table_exists boolean;
begin
  select exists(
    select 1 from information_schema.tables 
    where table_schema = 'public' 
    and table_name = 'nutritionist_applications'
  ) into v_app_table_exists;
  
  select exists(
    select 1 from information_schema.tables 
    where table_schema = 'public' 
    and table_name = 'application_documents'
  ) into v_doc_table_exists;
  
  select exists(
    select 1 from information_schema.tables 
    where table_schema = 'public' 
    and table_name = 'application_events'
  ) into v_event_table_exists;
  
  raise notice '=== TABLE VERIFICATION ===';
  raise notice 'nutritionist_applications table exists: %', v_app_table_exists;
  raise notice 'application_documents table exists: %', v_doc_table_exists;
  raise notice 'application_events table exists: %', v_event_table_exists;
  
  if v_app_table_exists and v_doc_table_exists and v_event_table_exists then
    raise notice 'SUCCESS: All tables created successfully!';
  else
    raise notice 'ERROR: Some tables are missing!';
  end if;
end $$;

-- 2. Check if created_at column exists
do $$
declare
  v_column_exists boolean;
begin
  select exists(
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'nutritionist_applications'
    and column_name = 'created_at'
  ) into v_column_exists;
  
  raise notice '=== COLUMN VERIFICATION ===';
  raise notice 'created_at column exists in nutritionist_applications: %', v_column_exists;
  
  if v_column_exists then
    raise notice 'SUCCESS: created_at column exists!';
  else
    raise notice 'ERROR: created_at column is missing!';
  end if;
end $$;

-- 3. Test inserting a sample application
do $$
declare
  v_app_id bigint;
begin
  raise notice '=== TESTING APPLICATION INSERT ===';
  
  -- Insert a test application
  insert into public.nutritionist_applications (
    first_name,
    family_name, 
    phone_e164,
    email,
    id_type,
    id_number,
    status
  ) values (
    'Test',
    'User',
    '+1234567890',
    'test.user@example.com',
    'national_id',
    '123456789',
    'new'
  ) returning id into v_app_id;
  
  raise notice 'SUCCESS: Test application inserted with ID: %', v_app_id;
  
  -- Insert corresponding document
  insert into public.application_documents (application_id, kind, file_path)
  values (v_app_id, 'cv', 'test-cv.pdf');
  
  raise notice 'SUCCESS: Test document inserted';
  
  -- Insert event
  insert into public.application_events (application_id, event_type)
  values (v_app_id, 'submitted');
  
  raise notice 'SUCCESS: Test event inserted';
  
  -- Clean up test data
  delete from public.application_events where application_id = v_app_id;
  delete from public.application_documents where application_id = v_app_id;
  delete from public.nutritionist_applications where id = v_app_id;
  
  raise notice 'SUCCESS: Test data cleaned up';
  
exception when others then
  raise notice 'ERROR: Failed to insert test data: %', SQLERRM;
end $$;

-- 4. Check admin view
do $$
declare
  v_view_exists boolean;
begin
  select exists(
    select 1 from information_schema.views 
    where table_schema = 'public' 
    and table_name = 'admin_applications_view'
  ) into v_view_exists;
  
  raise notice '=== ADMIN VIEW VERIFICATION ===';
  raise notice 'admin_applications_view exists: %', v_view_exists;
  
  if v_view_exists then
    raise notice 'SUCCESS: Admin view created successfully!';
  else
    raise notice 'ERROR: Admin view is missing!';
  end if;
end $$;

-- 5. Check storage bucket
do $$
declare
  v_bucket_exists boolean;
begin
  select exists(
    select 1 from storage.buckets where id = 'applicant-docs'
  ) into v_bucket_exists;
  
  raise notice '=== STORAGE BUCKET VERIFICATION ===';
  raise notice 'applicant-docs bucket exists: %', v_bucket_exists;
  
  if v_bucket_exists then
    raise notice 'SUCCESS: Storage bucket created successfully!';
  else
    raise notice 'ERROR: Storage bucket is missing!';
  end if;
end $$;

-- 6. Final success message
do $$
begin
  raise notice '=== VERIFICATION COMPLETE ===';
  raise notice 'If all checks above show SUCCESS, your nutritionist applications system is ready!';
  raise notice 'You can now:';
  raise notice '1. Test the application form on your website';
  raise notice '2. Check the admin dashboard';
  raise notice '3. Submit real applications';
end $$;
