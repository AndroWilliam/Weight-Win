# Database Schema

This summarizes key tables, enums, functions, and RLS policies defined in `scripts/*.sql`.

## Enums

- `id_type`: `('national_id','passport')` (defined in `combined_weight_tracking_setup.sql`)
- `application_status`: `('new','in_review','waiting_on_applicant','approved','rejected')`

## Weight Tracking

### `public.weight_entries`
- `id bigserial PK`
- `user_id uuid` → `auth.users(id)`
- `weight_kg decimal(5,2)`
- `photo_url text`
- `ocr_confidence decimal(3,2)`
- `recorded_at timestamptz default now()`
- `created_at timestamptz default now()`

RLS:
- Select/Insert/Update/Delete allowed where `auth.uid() = user_id`.

Functions:
- `public.update_user_streak(p_user_id uuid, p_check_in_date date default current_date) returns json`
- `public.get_weight_change_summary(p_user_id uuid) returns json`

### `public.user_streaks`
- `id bigserial PK`
- `user_id uuid unique` → `auth.users(id)`
- `current_streak int default 0`
- `longest_streak int default 0`
- `last_check_in date`
- `streak_started_at date`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

RLS:
- Select/Insert/Update allowed where `auth.uid() = user_id`.

### `public.motivational_quotes`
- `id bigserial PK`
- `quote text`, `author text`, `category text default 'weight_loss'`
- `created_at timestamptz default now()`

RLS:
- Public read policy.

## 7-Day Challenge Core (from `01_create_weightwin_tables.sql`)

### `user_challenges`
- `id uuid PK default gen_random_uuid()`
- `user_id uuid` → `auth.users(id)`
- `start_date date`
- `status varchar(20)` ∈ `active|completed|restarted`
- Timestamps

RLS: owner-based select/insert/update.

### `tracking_entries`
- `id uuid PK default gen_random_uuid()`
- `challenge_id uuid` → `user_challenges(id)`
- `day_number int` (1..7) unique per challenge
- `weight_kg decimal(5,2)`
- `photo_url text`
- `recorded_at timestamptz default now()`

RLS: owner via join to `user_challenges`.

### `expert_sessions`
- `id uuid PK`
- `session_date date`, `max_participants int`, `current_participants int`
- Public SELECT policy.

### `challenge_completions`
- `id uuid PK`
- `user_id uuid`, `challenge_id uuid`, `expert_session_id uuid`
- `completed_at timestamptz`, `weight_change_kg decimal(5,2)`

RLS: owner-based select/insert.

### Helper Functions
- `get_current_challenge(user_uuid uuid)`
- `can_track_today(challenge_uuid uuid)`
- `get_next_expert_session()`
- `complete_challenge(challenge_uuid uuid)`

## Admins and Storage (from `04_storage_admin_and_bucket.sql`)

### `public.admins`
- `user_id uuid PK`
- `added_at timestamptz default now()`

### `public.is_admin() returns boolean`
Checks JWT role or membership in `public.admins`.

### Storage bucket: `applicant-docs`
Policies:
- Read: owner or admin
- Insert/Update: owner
- Delete: owner or admin
Ownership determined via first path segment equals `auth.uid()`.

## Applications + OCR

Tables referenced by code and scripts:

### `nutritionist_applications`
Columns observed in code and scripts:
- `id bigint PK`
- `applicant_user_id uuid` (optional for anonymous)
- `first_name text`, `family_name text`, `phone_e164 text`, `email citext`
- `id_type id_type`, `id_number text`
- `status application_status` (e.g., `new`)
- `id_validation_status text default 'pending'`
- `id_validation_confidence decimal(3,2)`
- Timestamps `created_at`, `updated_at`

### `application_documents`
- `id bigint PK`
- `application_id bigint` → `nutritionist_applications(id)`
- `kind text` (`cv` | `id`)
- `file_path text` (Storage path under `applicant-docs/...`)

### `document_ocr_extractions`
- `document_id bigint` → `application_documents(id)`
- `extracted_id text`, `id_type text`
- `validation_status text default 'pending'`
- Additional OCR fields such as `confidence`, `provider` (implied by triggers)

### `application_events`
- `id bigint PK`
- `application_id bigint`
- `actor_user_id uuid` (optional)
- `event_type text` (e.g., `submitted`, `id_extracted`, `id_validated`)
- `meta jsonb`
- `created_at timestamptz`

### Functions and Triggers
- `validate_extracted_id(p_extracted_id, p_typed_id, p_id_type) returns json`
- `update_application_id_validation(p_application_id, p_validation_result json)`
- Trigger `trg_log_id_extraction` on `document_ocr_extractions` → inserts into `application_events`

## Storage Buckets

- `weight-photos`: owner-only policies for weight images
- `applicant-docs`: per-user folder rule + admin visibility
  - Path pattern: `applicant-docs/<auth.uid()>/<prefix>-<timestamp>.<ext>`


