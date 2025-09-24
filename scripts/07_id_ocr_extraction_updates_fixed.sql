-- Fixed: Update database schema for ID/Passport OCR extraction (Supabase compatible)

-- Add columns to document_ocr_extractions table for ID extraction
do $$ 
begin
  -- Add extracted_id column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'document_ocr_extractions' 
    and column_name = 'extracted_id'
  ) then
    alter table public.document_ocr_extractions 
    add column extracted_id text;
  end if;

  -- Add id_type column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'document_ocr_extractions' 
    and column_name = 'id_type'
  ) then
    alter table public.document_ocr_extractions 
    add column id_type text;
  end if;

  -- Add validation_status column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'document_ocr_extractions' 
    and column_name = 'validation_status'
  ) then
    alter table public.document_ocr_extractions 
    add column validation_status text default 'pending';
  end if;
end $$;

-- Add validation function for extracted IDs
create or replace function public.validate_extracted_id(
  p_extracted_id text,
  p_typed_id text,
  p_id_type text
) returns json
language plpgsql
security definer
as $$
declare
  v_match boolean := false;
  v_confidence decimal := 0.0;
  v_message text;
begin
  -- Check if extracted ID matches typed ID
  if p_extracted_id = p_typed_id then
    v_match := true;
    v_confidence := 1.0;
    v_message := 'Perfect match';
  elsif length(p_extracted_id) = length(p_typed_id) then
    -- Check character similarity for partial matches
    declare
      v_matches integer := 0;
      v_total integer := length(p_extracted_id);
      i integer;
    begin
      for i in 1..v_total loop
        if substring(p_extracted_id from i for 1) = substring(p_typed_id from i for 1) then
          v_matches := v_matches + 1;
        end if;
      end loop;
      
      v_confidence := v_matches::decimal / v_total::decimal;
      
      if v_confidence >= 0.8 then
        v_match := true;
        v_message := 'High similarity match';
      elsif v_confidence >= 0.6 then
        v_message := 'Moderate similarity - please verify';
      else
        v_message := 'Low similarity - please check input';
      end if;
    end;
  else
    v_message := 'Length mismatch - please verify';
  end if;
  
  return json_build_object(
    'match', v_match,
    'confidence', v_confidence,
    'message', v_message,
    'extracted_id', p_extracted_id,
    'typed_id', p_typed_id,
    'id_type', p_id_type
  );
end;
$$;

-- Create indexes for extracted IDs
create index if not exists idx_ocr_extractions_extracted_id 
on public.document_ocr_extractions (extracted_id);

create index if not exists idx_ocr_extractions_id_type 
on public.document_ocr_extractions (id_type);

-- Add trigger to log ID extraction events
create or replace function public.log_id_extraction_event()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Only log if extracted_id was added/changed
  if NEW.extracted_id is not null and (OLD.extracted_id is null or OLD.extracted_id != NEW.extracted_id) then
    insert into public.application_events (
      application_id,
      actor_user_id,
      event_type,
      meta,
      created_at
    )
    select 
      d.application_id,
      a.applicant_user_id,
      'id_extracted',
      json_build_object(
        'document_id', NEW.document_id,
        'extracted_id', NEW.extracted_id,
        'id_type', NEW.id_type,
        'confidence', NEW.confidence,
        'provider', NEW.provider
      ),
      now()
    from public.application_documents d
    join public.nutritionist_applications a on a.id = d.application_id
    where d.id = NEW.document_id;
  end if;
  
  return NEW;
end;
$$;

-- Create trigger if it doesn't exist
drop trigger if exists trg_log_id_extraction on public.document_ocr_extractions;
create trigger trg_log_id_extraction
  after insert or update on public.document_ocr_extractions
  for each row execute function public.log_id_extraction_event();

-- Update nutritionist_applications table to store validated ID info
do $$ 
begin
  -- Add id_validation_status column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'nutritionist_applications' 
    and column_name = 'id_validation_status'
  ) then
    alter table public.nutritionist_applications 
    add column id_validation_status text default 'pending';
  end if;

  -- Add id_validation_confidence column if it doesn't exist
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'nutritionist_applications' 
    and column_name = 'id_validation_confidence'
  ) then
    alter table public.nutritionist_applications 
    add column id_validation_confidence decimal(3,2);
  end if;
end $$;

-- Function to update application with ID validation results
create or replace function public.update_application_id_validation(
  p_application_id bigint,
  p_validation_result json
) returns void
language plpgsql
security definer
as $$
begin
  update public.nutritionist_applications
  set 
    id_validation_status = case 
      when (p_validation_result->>'match')::boolean then 'validated'
      else 'mismatch'
    end,
    id_validation_confidence = (p_validation_result->>'confidence')::decimal,
    updated_at = now()
  where id = p_application_id;
  
  -- Log the validation event
  insert into public.application_events (
    application_id,
    event_type,
    meta,
    created_at
  ) values (
    p_application_id,
    'id_validated',
    p_validation_result,
    now()
  );
end;
$$;

-- Create view for admin dashboard (ID validation summary) - using regular view instead of materialized view
create or replace view public.id_validation_summary as
select 
  na.id as application_id,
  na.first_name,
  na.family_name,
  na.email,
  na.id_type,
  na.id_number,
  na.id_validation_status,
  na.id_validation_confidence,
  doe.extracted_id,
  doe.confidence as ocr_confidence,
  doe.provider as ocr_provider,
  na.submitted_at,
  na.status as application_status
from public.nutritionist_applications na
left join public.application_documents ad on ad.application_id = na.id and ad.kind = 'id'
left join public.document_ocr_extractions doe on doe.document_id = ad.id
where na.submitted_at is not null
order by na.submitted_at desc;

-- Grant permissions for the view
grant select on public.id_validation_summary to authenticated;

-- RLS policy for the view (admins only)
alter view public.id_validation_summary owner to postgres;

create policy "Admins can view ID validation summary" 
on public.id_validation_summary for select 
using (public.is_admin());

-- Comments for documentation
comment on table public.document_ocr_extractions is 'OCR extraction results including ID numbers from documents';
comment on column public.document_ocr_extractions.extracted_id is 'ID number extracted from document via OCR';
comment on column public.document_ocr_extractions.id_type is 'Type of ID: national_id or passport';
comment on column public.document_ocr_extractions.validation_status is 'Status of ID validation: pending, validated, mismatch';

comment on function public.validate_extracted_id(text, text, text) is 'Validates extracted ID against user-typed ID and returns match confidence';
comment on function public.update_application_id_validation(bigint, json) is 'Updates application with ID validation results';
comment on view public.id_validation_summary is 'Summary view of ID validation results for admin dashboard';
