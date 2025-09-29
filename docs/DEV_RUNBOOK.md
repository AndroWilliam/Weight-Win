# Dev Runbook

## Install & Run

```bash
pnpm install
pnpm dev
# or
npm install
npm run dev
```

Open http://localhost:3000

## Lint, Build, Start

```bash
pnpm lint
pnpm build
pnpm start
```

Note: `next.config.mjs` ignores build-time TypeScript and ESLint errors to avoid CI blockers.

## Database Setup (Supabase)

Run the SQL scripts in order:

1. `scripts/01_create_weightwin_tables.sql`
2. `scripts/03_create_helper_functions.sql`
3. `scripts/04_storage_admin_and_bucket.sql`
4. `scripts/05_weight_tracking_tables.sql`
5. `scripts/06_weight_photos_bucket.sql` (if applicable)
6. `scripts/07_id_ocr_extraction_updates_final.sql`

Alternatively, use `scripts/combined_weight_tracking_setup.sql` for weight-tracking + storage policies.

## Creating an Admin User

Option A (table): insert into `public.admins`:

```sql
insert into public.admins (user_id) values ('<auth_user_uuid>');
```

Option B (JWT/app_metadata): set `role = 'admin'` in the user's `app_metadata`.

Verify with RPC `is_admin()` used by `GET /api/admin/files/[documentId]`.

## Testing Upload & Preview

Anonymous upload:

```bash
curl -X POST http://localhost:3000/api/upload/anonymous \
  -F file=@/path/to/file.pdf \
  -F bucket=applicant-docs \
  -F path="<user-id>/<prefix>-<timestamp>.pdf"
```

Get preview URL:

```bash
curl -X POST http://localhost:3000/api/upload/preview \
  -H 'content-type: application/json' \
  -d '{"bucket":"applicant-docs","path":"<user-id>/<file>.pdf"}'
```

## Common Pitfalls

- Supabase OAuth Callback: ensure redirect URL points to `/auth/callback` in Supabase settings.
- Storage RLS: paths must start with the authenticated user id; service role endpoints bypass RLS safely on server.
- Google OAuth Consent: add test users and authorized redirect URIs.
- OCR in Dev: without `GOOGLE_APPLICATION_CREDENTIALS_JSON`, OCR is mocked. Set this in Vercel/Prod to enable real OCR.


