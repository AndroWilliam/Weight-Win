# Architecture

## High-level Diagram

```
[ Next.js App (Pages/Components) ]
        |                  
        | fetch/POST
        v
[ App Router API Routes ]  --server-->  [ Supabase (Auth, DB, RPC, RLS, Storage) ]
        |                                       ^
        | (OCR calls)                           |
        v                                       |
[ OCR Provider (Google Vision) ]                |
                                                |
        +---------------- Email Provider (future) +-- notifications
```

## Data Flows

### 1) Weight OCR and Tracking

1. User captures/uploads photo in UI (`/track`, `/weight-check`).
2. Client sends `{ imageBase64, photoUrl }` to `POST /api/weight/process`.
3. API verifies user session (Supabase), calls OCR (`lib/ocr/google-vision.ts`).
4. On success, inserts into `public.weight_entries` and invokes RPCs:
   - `update_user_streak(p_user_id)`
   - `get_weight_change_summary(p_user_id)`
5. Returns `{ success, weight, confidence, weightEntry, streak, summary }`.

### 2) Apply as a Nutritionist

1. Applicant uploads files anonymously via `POST /api/upload/anonymous` using service role.
2. UI may request a signed preview via `POST /api/upload/preview`.
3. Optional OCR feedback for docs via `POST /api/ocr/[kind]` (mock) or `POST /api/ocr/id-extract` (OCR for ID/passport). No persistence until submission.
4. On submit (`POST /api/applications/submit`):
   - Creates row in `nutritionist_applications` (status `new`).
   - Inserts `application_documents` rows `{cv,id}`.
   - Inserts `application_events` row `submitted`.
5. Admins can fetch signed preview URLs via `GET /api/admin/files/[documentId]` (checks `public.is_admin()` or `public.admins`).

## Security & RLS

- Tables `public.weight_entries`, `public.user_streaks` have RLS with per-user ownership rules.
- Storage buckets:
  - `weight-photos` with owner-only access policies.
  - `applicant-docs` with owner-or-admin read/delete and owner insert/update policies (see `scripts/04_storage_admin_and_bucket.sql`).
- Admin recognition via:
  - `public.admins` table, or JWT `role`/`app_metadata.role = 'admin'` (`public.is_admin()` function).

## Notable Files

- Supabase server/browser clients: `lib/supabase/server.ts`, `lib/supabase/client.ts`
- OCR: `lib/ocr/google-vision.ts`, `lib/ocr/id-extraction.ts`
- Upload helpers: `lib/storageUpload.ts`; APIs in `app/api/upload/*`
- Auth callback logic: `app/auth/callback/route.ts`
- SQL functions: `scripts/03_create_helper_functions.sql`, `scripts/05_weight_tracking_tables.sql`, `scripts/04_storage_admin_and_bucket.sql`, `scripts/07_id_ocr_extraction_updates_final.sql`


