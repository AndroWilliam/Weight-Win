# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WeightWin is a Next.js 14 web application that helps users build healthy habits through a 7-day weight tracking challenge. Users track their weight daily using photo OCR of scale readings and earn a free nutritionist consultation upon completion.

**Tech Stack**: Next.js 14 (App Router), TypeScript, Supabase (PostgreSQL + Auth), Tailwind CSS, shadcn/ui, Google Cloud Vision API

## Development Commands

```bash
# Development
pnpm dev                 # Start dev server at localhost:3000
pnpm install            # Install dependencies (use pnpm, not npm)

# Testing
pnpm test               # Run Jest unit tests
pnpm test:watch         # Run tests in watch mode
pnpm test:e2e           # Run Playwright E2E tests
pnpm test:e2e:ui        # Run E2E tests with UI

# Build & Type Checking
pnpm build              # Production build
pnpm typecheck          # Run TypeScript compiler check (no emit)
pnpm lint               # Run ESLint
pnpm start              # Start production server

# Bundle Analysis
ANALYZE=true pnpm build # Analyze bundle size
```

## Architecture & Key Concepts

### Authentication & Session Management

**Custom Supabase Integration** (not using @supabase/ssr):
- **Client** (`lib/supabase/client.ts`): Uses `@supabase/supabase-js` with implicit OAuth flow, syncs session to custom cookies (`sb-access-token`, `sb-refresh-token`) for server-side access
- **Server** (`lib/supabase/server.ts`): Reads custom cookies and calls `setSession()` manually
- **Middleware** (`lib/supabase/middleware.ts`): Updates session on each request

**Why**: Google OAuth requires implicit flow with UUID-based codes, not PKCE. The custom cookie sync bridges client OAuth and server-side rendering.

### API Route Patterns

All API routes use standardized patterns:

```typescript
// Use withHandler wrapper for error handling + request IDs
import { withHandler } from '@/lib/api/with-handler'
import { ok, fail } from '@/lib/api/responses'

export const POST = withHandler(async (req, { params }, requestId) => {
  // Rate limiting
  const ip = ipFromRequest(req)
  const { success } = await limitByIp(ip, 'endpoint-name', 30)
  if (!success) return NextResponse.json(fail('RATE_LIMITED', 'Too many requests'), { status: 429 })

  // Input validation with Zod
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json(fail('BAD_REQUEST', 'Invalid payload', parsed.error), { status: 400 })

  // Business logic...
  return NextResponse.json(ok({ data: result }))
})
```

- Always use `withHandler()` wrapper
- Use `ok()` and `fail()` response helpers from `lib/api/responses.ts`
- Rate limit with `lib/rate-limit.ts` (uses in-memory LRU cache)
- Validate with Zod schemas from `lib/validation/schemas.ts`
- Log with `lib/logger.ts`

### OCR Weight Extraction

**Google Cloud Vision API** (`lib/ocr/google-vision.ts`):
- Production: Uses Google Vision API when `GOOGLE_APPLICATION_CREDENTIALS_JSON` env var is set
- Development: Mock OCR returns realistic weights (41-97 kg) with high confidence (0.92-0.99)
- Smart parsing handles LED display quirks (e.g., "974." → "97.4")
- Prioritizes decimal numbers in 40-150 kg range
- Filters out dates, times, and capacity labels (e.g., "Max: 400 kg")

### Admin System

**Role-Based Access Control** (RBAC):
- `public.admins` table stores admin user IDs
- `public.is_admin(uid)` PostgreSQL function checks admin status
- RLS policies allow admins to bypass restrictions
- Server-side guard: `lib/admin/guard.ts` → `userIsAdmin()`
- Client-side check: API route `/api/admin/check`
- Admin routes under `/app/admin/` are protected by layout guard

**Admin Features**:
- `/admin/applicants`: Review nutritionist applications with document viewing (signed URLs)
- `/admin/users`: Monitor user progress, streaks, challenge completion

**Making a user admin**:
```sql
INSERT INTO public.admins (user_id, notes)
VALUES ('user-uuid-here', 'Admin user')
ON CONFLICT (user_id) DO NOTHING;
```

### Database Schema

Key tables (see `scripts/` for migrations):
- `user_challenge_progress`: Tracks 7-day challenge state per user
- `weight_entries`: Daily weight logs with photos
- `user_settings`: Timezone, reminder time, weight units
- `nutritionist_applications`: Nutritionist signup applications
- `admins`: Admin user whitelist
- Helper functions: `record_weight_entry()`, `get_or_create_challenge()`, `calculate_streak()`

Run SQL scripts in order:
```bash
# In Supabase SQL Editor:
01_create_weightwin_tables.sql
02_seed_expert_sessions.sql
03_create_helper_functions.sql
# ... (see scripts/ directory)
10_admin_rbac.sql
```

### Component Patterns

**Server Components** (default):
- Fetch data directly with `createClient()` from `lib/supabase/server.ts`
- No `'use client'` directive
- Examples: `app/dashboard/page.tsx`, `app/admin/applicants/page.tsx`

**Client Components**:
- Mark with `'use client'` directive
- Use `createClient()` from `lib/supabase/client.ts`
- For interactivity: forms, state, effects, event handlers
- Examples: `components/photo-capture.tsx`, `components/admin/ApplicantsTable.tsx`

**shadcn/ui Components**:
- Located in `components/ui/`
- Customize in `components.json` (uses Tailwind CSS v4)
- Add new components: `npx shadcn-ui@latest add <component>`

## Important Files & Patterns

### Onboarding Flow
1. `/` → Landing page
2. `/auth/login` → Google OAuth
3. `/auth/callback` → OAuth callback handler
4. `/consent` → Privacy consent
5. `/setup` → Weight units, timezone, reminder time
6. `/commit` → Review and start challenge
7. `/dashboard` → Main challenge dashboard

### Weight Tracking Flow
1. `/weight-check` → Camera/upload photo
2. OCR processing (`/api/weight/process`)
3. Confirmation modal
4. Save to DB (`/api/tracking/save`)
5. Update progress & streaks

### Key Utilities
- `lib/utils.ts`: cn() for className merging
- `lib/tips-service.ts`: Daily rotating tips (4 categories)
- `lib/images/compress.ts`: Client-side image compression
- `lib/storageUpload.ts`: Supabase storage uploads with retry

## Environment Variables

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Google Cloud Vision (optional, mock in dev)
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}

# Database (optional direct access)
POSTGRES_URL=<postgres-url>
POSTGRES_URL_NON_POOLING=<postgres-url-non-pooling>

# Sentry (optional)
SENTRY_DSN=<sentry-dsn>
```

## Testing

- **Jest**: Unit tests for utilities, OCR parsing, validation
- **Playwright**: E2E tests for user flows
- Test files colocated with source: `__tests__/` or `.test.ts` suffix
- Mock Supabase client in tests

## Common Gotchas

1. **Auth Issues**: If auth breaks, check custom cookie sync in `lib/supabase/client.ts`. Server must read `sb-access-token` and `sb-refresh-token` cookies.

2. **OCR in Dev**: Mock OCR is enabled by default. To test real OCR, set `GOOGLE_APPLICATION_CREDENTIALS_JSON` env var.

3. **Admin Access**: Users need entry in `public.admins` table. Check with `SELECT public.is_admin('<user-id>');`

4. **Type Errors Ignored**: `next.config.mjs` has `ignoreBuildErrors: true` and `ignoreDuringBuilds: true`. Run `pnpm typecheck` to see real errors.

5. **Image Optimization Disabled**: `next.config.mjs` has `unoptimized: true`. Supabase signed URLs are allowed via `remotePatterns`.

6. **Middleware Excludes API Routes**: Middleware config excludes `/api/*` to avoid double session checks.

## Code Style

- **No Emojis**: Don't add emojis to code or comments unless explicitly requested
- **Prefer Edit Over Write**: Always edit existing files rather than rewriting them
- **Error Handling**: Use try-catch with logging, return user-friendly error messages
- **Async/Await**: Prefer over promises/callbacks
- **TypeScript**: Full type safety, no `any` unless necessary
- **Server vs Client**: Be explicit about server/client boundaries

## Deployment

- **Platform**: Vercel (auto-deploy from GitHub)
- **Build Command**: `pnpm build`
- **Environment**: Set all env vars in Vercel dashboard
- **Database**: Supabase (migrations via SQL editor)
- **Monitoring**: Sentry for error tracking, Vercel Analytics

## Additional Documentation

- `ADMIN_SETUP.md`: Complete admin area setup guide
- `SUPABASE_OAUTH_FIX.md`: OAuth troubleshooting
- `VERCEL_ENV_SETUP.md`: Vercel environment setup
- `DEPLOYMENT.md`: Deployment checklist
- `README.md`: User-facing documentation
