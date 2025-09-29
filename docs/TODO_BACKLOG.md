# Backlog

## Admin UI

- Build admin dashboard to review `nutritionist_applications`, view `application_documents`, and update status.
- Wire actions to `application_events` and ID validation updates.

## Error States & Validations

- Improve client-side validation for application form (phone format, id number patterns).
- Surface detailed errors from `/api/upload/anonymous` and `/api/upload/preview`.
- Add retries/backoff for OCR calls in `/api/weight/process`.

## Security & RLS

- Confirm `applicant-docs` bucket path usage strictly follows `<auth.uid()>/<prefix>-<timestamp>.<ext>`.
- Ensure no client-side usage of `SUPABASE_SERVICE_ROLE_KEY` (server only).

## Tests

- Unit tests for `parseWeightFromText` and `id-extraction` validators.
- API route tests for `/api/weight/process`, `/api/applications/submit`.

## Observability

- Structured logging and request IDs for API routes.
- Basic analytics/metrics for OCR success rates.

## UX Polish

- Loading/skeleton states for uploads and OCR.
- Edge-case flows for challenge restart and completion.

## Links to Code

- Admin file preview: `app/api/admin/files/[documentId]/route.ts`
- Application submit: `app/api/applications/submit/route.ts`
- Weight OCR process: `app/api/weight/process/route.ts`
- ID OCR: `app/api/ocr/id-extract/route.ts`
- Upload (anon/preview): `app/api/upload/*`


