-- Combined SQL script for Weight Tracking with OCR

-- 1. Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "citext";

-- 2. Create enums for ID types and application status (if not exists)
do $$ begin
  create type id_type as enum ('national_id','passport');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type application_status as enum ('new','in_review','waiting_on_applicant','approved','rejected');
exception when duplicate_object then null;
end $$;

-- 3. Weight tracking tables
create table if not exists public.weight_entries (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_kg decimal(5,2) not null,
  photo_url text not null,
  ocr_confidence decimal(3,2),
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_weight_entries_user on public.weight_entries (user_id);
create index if not exists idx_weight_entries_recorded on public.weight_entries (recorded_at);

-- 4. User streaks table
create table if not exists public.user_streaks (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade unique,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_check_in date,
  streak_started_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Motivational quotes table
create table if not exists public.motivational_quotes (
  id bigserial primary key,
  quote text not null,
  author text,
  category text default 'weight_loss',
  created_at timestamptz not null default now()
);

-- 6. Insert motivational quotes
insert into public.motivational_quotes (quote, author) values
  ('Every step forward, no matter how small, is progress!', 'Unknown'),
  ('Your body is your temple. Keep it pure and clean for the soul to reside in.', 'B.K.S. Iyengar'),
  ('Success is the sum of small efforts repeated day in and day out.', 'Robert Collier'),
  ('The only bad workout is the one that didn''t happen.', 'Unknown'),
  ('You''re not losing weight, you''re gaining health!', 'Unknown'),
  ('Progress, not perfection.', 'Unknown'),
  ('A goal without a plan is just a wish.', 'Antoine de Saint-Exupéry'),
  ('The journey of a thousand miles begins with a single step.', 'Lao Tzu'),
  ('Believe you can and you''re halfway there.', 'Theodore Roosevelt'),
  ('Your future self will thank you.', 'Unknown')
on conflict do nothing;

-- 7. Enable RLS
alter table public.weight_entries enable row level security;
alter table public.user_streaks enable row level security;
alter table public.motivational_quotes enable row level security;

-- 8. Weight entries RLS policies
create policy "Users can view own weight entries" on public.weight_entries
  for select using (auth.uid() = user_id);
create policy "Users can insert own weight entries" on public.weight_entries
  for insert with check (auth.uid() = user_id);
create policy "Users can update own weight entries" on public.weight_entries
  for update using (auth.uid() = user_id);
create policy "Users can delete own weight entries" on public.weight_entries
  for delete using (auth.uid() = user_id);

-- 9. User streaks RLS policies
create policy "Users can view own streaks" on public.user_streaks
  for select using (auth.uid() = user_id);
create policy "Users can insert own streaks" on public.user_streaks
  for insert with check (auth.uid() = user_id);
create policy "Users can update own streaks" on public.user_streaks
  for update using (auth.uid() = user_id);

-- 10. Motivational quotes - everyone can read
create policy "Everyone can read quotes" on public.motivational_quotes
  for select using (true);

-- 11. Function to update streak
create or replace function public.update_user_streak(
  p_user_id uuid,
  p_check_in_date date default current_date
) returns json
language plpgsql
security definer
as $$
declare
  v_streak record;
  v_days_diff integer;
  v_new_streak integer;
begin
  -- Get or create streak record
  insert into public.user_streaks (user_id, last_check_in, current_streak, streak_started_at)
  values (p_user_id, p_check_in_date, 1, p_check_in_date)
  on conflict (user_id) do nothing;
  
  select * into v_streak from public.user_streaks where user_id = p_user_id;
  
  -- If this is the first check-in or same day, just update
  if v_streak.last_check_in is null or v_streak.last_check_in = p_check_in_date then
    update public.user_streaks 
    set last_check_in = p_check_in_date,
        updated_at = now()
    where user_id = p_user_id;
    
    return json_build_object(
      'streak', coalesce(v_streak.current_streak, 1),
      'message', 'Keep it up!'
    );
  end if;
  
  -- Calculate days difference
  v_days_diff := p_check_in_date - v_streak.last_check_in;
  
  -- Consecutive day
  if v_days_diff = 1 then
    v_new_streak := v_streak.current_streak + 1;
    
    update public.user_streaks
    set current_streak = v_new_streak,
        longest_streak = greatest(longest_streak, v_new_streak),
        last_check_in = p_check_in_date,
        updated_at = now()
    where user_id = p_user_id;
    
    return json_build_object(
      'streak', v_new_streak,
      'message', 'Great job maintaining your streak!'
    );
    
  -- Missed one day
  elsif v_days_diff = 2 then
    update public.user_streaks
    set last_check_in = p_check_in_date,
        updated_at = now()
    where user_id = p_user_id;
    
    return json_build_object(
      'streak', v_streak.current_streak,
      'message', 'Get back on your feet, you''re almost there!'
    );
    
  -- Missed two or more days - reset streak
  else
    update public.user_streaks
    set current_streak = 1,
        last_check_in = p_check_in_date,
        streak_started_at = p_check_in_date,
        updated_at = now()
    where user_id = p_user_id;
    
    return json_build_object(
      'streak', 1,
      'message', 'Starting fresh! Every journey begins with a single step.'
    );
  end if;
end;
$$;

-- 12. Function to get weight change summary
create or replace function public.get_weight_change_summary(p_user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_latest record;
  v_previous record;
  v_first record;
  v_change decimal;
  v_total_change decimal;
  v_trend text;
  v_quote text;
begin
  -- Get latest weight
  select * into v_latest 
  from public.weight_entries 
  where user_id = p_user_id 
  order by recorded_at desc 
  limit 1;
  
  if v_latest is null then
    return json_build_object(
      'current_weight', null,
      'change_from_previous', 0,
      'total_change', 0,
      'trend', 'neutral',
      'message', 'Start tracking to see your progress!'
    );
  end if;
  
  -- Get previous weight
  select * into v_previous 
  from public.weight_entries 
  where user_id = p_user_id 
    and recorded_at < v_latest.recorded_at
  order by recorded_at desc 
  limit 1;
  
  -- Get first weight
  select * into v_first 
  from public.weight_entries 
  where user_id = p_user_id 
  order by recorded_at asc 
  limit 1;
  
  -- Calculate changes
  if v_previous is not null then
    v_change := v_latest.weight_kg - v_previous.weight_kg;
  else
    v_change := 0;
  end if;
  
  v_total_change := v_latest.weight_kg - v_first.weight_kg;
  
  -- Determine trend and get quote
  if v_change < 0 then
    v_trend := 'down';
    select quote into v_quote 
    from public.motivational_quotes 
    order by random() 
    limit 1;
  elsif v_change > 0 then
    v_trend := 'up';
    v_quote := 'Stay focused on your goals!';
  else
    v_trend := 'neutral';
    v_quote := 'Consistency is key!';
  end if;
  
  return json_build_object(
    'current_weight', v_latest.weight_kg,
    'change_from_previous', v_change,
    'total_change', v_total_change,
    'trend', v_trend,
    'message', v_quote,
    'last_recorded', v_latest.recorded_at
  );
end;
$$;

-- 13. Create weight photos storage bucket
do $$ 
begin
  insert into storage.buckets (id, name, public)
  values ('weight-photos', 'weight-photos', false);
exception when unique_violation then
  null; -- Bucket already exists
end $$;

-- 14. Storage policies for weight photos bucket
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

-- 15. Trigger to keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_streak_touch on public.user_streaks;
create trigger trg_streak_touch
before update on public.user_streaks
for each row execute function public.touch_updated_at();
