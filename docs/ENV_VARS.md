# Environment Variables

This file lists environment variables referenced in code and required for local and Vercel deployments. Do not commit secrets.

## Supabase

- `NEXT_PUBLIC_SUPABASE_URL` (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; used in API routes for Storage upload/signing)

Used in:
- `lib/supabase/client.ts`, `lib/supabase/server.ts`
- `app/api/upload/anonymous/route.ts`, `app/api/upload/preview/route.ts`
- `app/api/admin/files/[documentId]/route.ts`

## OCR

- `GOOGLE_APPLICATION_CREDENTIALS_JSON` (server-only)
  - When set, production OCR paths are used (`@google-cloud/vision`), otherwise dev mock.
  - Used in `lib/ocr/google-vision.ts` and `lib/ocr/id-extraction.ts`.

## Vercel

- `VERCEL_URL` (optional; improves redirect computation in `app/auth/callback/route.ts`)

## Local `.env.local` vs Vercel Project Settings

- Local development: define all variables in `.env.local`.
- Vercel: set all variables in Project → Settings → Environment Variables.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.


