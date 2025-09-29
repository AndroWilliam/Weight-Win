# WeightWin — Project Overview

## Purpose

WeightWin helps users build a daily weight-tracking habit through a focused 7‑day challenge. Users authenticate with Google (via Supabase Auth), capture or upload scale photos, and the app performs OCR to auto-detect the weight. Progress visuals, daily tips, and streaks keep users motivated. Upon completing the challenge, they earn a free nutritionist session. The app also includes an "Apply as a Nutritionist" flow with backend primitives for admin review.

## Tech Stack

- Next.js App Router (v14), React 18, TypeScript
- Tailwind CSS + shadcn/ui + Radix UI
- Supabase: Auth, Postgres, RLS, Storage
- OCR: Google Cloud Vision (mocked in dev; production via `GOOGLE_APPLICATION_CREDENTIALS_JSON`)
- Deployment: Vercel

## Major Features

- Authentication: Google OAuth via Supabase (auth callback at `/auth/callback`)
- 7-Day Challenge: Start a challenge, submit daily weights, track completion
- OCR Ingestion: Extract weight from scale photos (`/api/weight/process`), ID/passport OCR for applications (`/api/ocr/id-extract`)
- Daily Tips and Progress: UI components for tips, countdown, progress circles
- Apply as a Nutritionist: Anonymous uploads for CV/ID → preview → submit application (`/apply/nutritionist`, `/api/applications/submit`)
- Admin Review (backend primitives): Admin-only signed previews for applicant documents (`/api/admin/files/[documentId]`)

## Deployment Flow

Typical flow: GitHub → Vercel CI → Deploy. Ensure environment variables are set in Vercel Project Settings.

Required env vars (see `docs/ENV_VARS.md` for full list and scopes):

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (Server only)
- GOOGLE_APPLICATION_CREDENTIALS_JSON (Production OCR)
- Optional: VERCEL_URL (for accurate redirects in callback)

## Notable Libraries and Files

- Supabase clients: `lib/supabase/client.ts`, `lib/supabase/server.ts`, constants in `lib/supabase/constants.ts`
- OCR: `lib/ocr/google-vision.ts`, `lib/ocr/id-extraction.ts`
- File uploads: `lib/storageUpload.ts`, API routes under `app/api/upload/**`
- SQL schema and policies: `scripts/*.sql`


