# Route Map

## Pages (App Router)

- `/` — Landing page
- `/landing` — Marketing/landing
- `/auth/login` — Login UI; Google OAuth entry
- `/auth/auth-code-error` — Error page for OAuth callback failures
- `/consent` — Privacy consent step
- `/setup` — Initial setup (units, reminders)
- `/commit` — Commitment/confirmation step
- `/dashboard` — Main dashboard with tips and countdown
- `/track` — Daily tracking interface (camera/upload)
- `/weight-check` — Flow for weight photo capture
- `/progress` — Weight trends and stats
- `/complete` — Reward/Completion page
- `/apply/nutritionist` — Application form for nutritionists

## Auth Callback

- `GET /auth/callback` — Exchanges Supabase OAuth code for session, then redirects to next step (default `/consent`). Uses forwarded headers in production to compute redirect host.

## API Routes

### Challenge

- `POST /api/challenge/start`
  - Body: `{}`
  - Auth: user required
  - Response: `{ success: true, challenge }` or `{ error }`

### Tracking

- `POST /api/tracking/save`
  - Body: `{ challengeId: uuid, dayNumber: number (1-7), weight: number, photoUrl?: string }`
  - Auth: user required
  - Response: `{ success: true, entry }` or `{ error }`

### Weight OCR

- `POST /api/weight/process`
  - Body: `{ imageBase64: string, photoUrl: string }`
  - Auth: user required
  - Response: `{ success: true, weight, confidence, weightEntry, streak, summary }` or `{ error }`

### Uploads (Anonymous + Preview)

- `POST /api/upload/anonymous`
  - FormData: `file` (File), `bucket` (string), `path` (string)
  - Auth: no (uses service role on server)
  - Response: `{ path }` or `{ error }`

- `POST /api/upload/preview`
  - Body: `{ bucket: string, path: string }`
  - Auth: no (service role backend)
  - Response: `{ signedUrl }` or `{ error }`

### OCR — Nutritionist Docs

- `POST /api/ocr/[kind]` where `kind` ∈ `cv | id`
  - Body: `{ path: string }`
  - Auth: none (pre-submission UI feedback)
  - Response: `{ ok: true, confidence, data }` (mocked)

- `POST /api/ocr/id-extract`
  - Body: `{ imageBase64: string, idType: 'national_id' | 'passport' }`
  - Auth: none
  - Response: `{ success, extractedId?, confidence?, idType?, rawText? }` or `{ error }`

### Applications

- `POST /api/applications/submit`
  - Body: `{ firstName, familyName, phone, email, idType, idNumber, cvPath, idPath }`
  - Auth: optional (supports anonymous applicants)
  - Response: `{ ok: true, applicationId }` or `{ ok: false, message? }`

### Admin

- `GET /api/admin/files/[documentId]`
  - Params: `documentId: number`
  - Auth: user must be admin (`rpc('is_admin')`), otherwise 401/403
  - Response: `{ url }` signed URL (120s) to Storage object


