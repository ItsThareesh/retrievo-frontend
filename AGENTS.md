# AGENTS.md

**Stack:** Next.js 16 App Router + NextAuth v5 + SWR + shadcn/ui + Tailwind (sonner, next-themes)

## Auth Flow
- Google OAuth → POST `id_token` → receive `{ access_token, expires_at }`
- `@nitc.ac.in` only in production; redirect others to error. Otherwise allow all domains in testing.
- JWT: initial sign-in caches `/profile/me`; refresh on `trigger="update"`; no auto-refresh — session invalidated when the backend token expires (backend issues 30-day tokens, `LOGIN_TOKEN_TTL_DAYS`)
- **Guards in page.tsx:** redirect to signin or onboarding for pages that need it (profile, admin, report, onboarding); never in middleware
- **SessionProvider** is in the root layout — `useSession()` available everywhere

## Data Flow
- **All reads and writes:** Browser → Backend API directly via `clientFetch()` in `lib/client-fetch.ts`
  - Uses `NEXT_PUBLIC_BACKEND_URL` + Bearer token from `useSession().backendToken`
  - Data never passes through Vercel servers
  - Used in: ItemsGrid, ItemDetail, Profile, UserProfile, Resolution, Admin tabs, Notifications, LinkableItems
- **Mutations (writes):** thin endpoint wrappers in `lib/api/` over `clientFetch()` (plain functions, no Server Actions)
  - `postLostFoundItem`, `updateItem`, `deleteItem`, `flagItem` — `lib/api/items.ts`
  - `createResolution`, `approveResolution`, `rejectResolution`, `completeResolution`, `failResolution` — `lib/api/resolutions.ts`
  - `moderateUser`, `moderateItem` — `lib/api/admin.ts`
  - `readNotification`, `readAllNotifications` — `lib/api/notifications.ts`
  - `updateOnboarding`, `updateContact` — `lib/api/profile.ts`

## API Rules
- **Transport** (`lib/client-fetch.ts` — the single primitive, axios-style):
  - `clientFetch(path, token?, options?)` — ALL reads and writes; throws `APIError` on any non-2xx (`err.status`, `err.code`, `err.data` = raw backend body)
  - Aborts after `options.timeout` (default **15s**) and throws `APIError(408, "Request timed out", "TIMEOUT")`; image upload passes 60s
  - Handles Bearer token, JSON + FormData bodies, tolerant response parsing
- **Endpoints** live ONLY in `lib/api/<domain>.ts` as plain functions, one uniform convention:
  - Reads: `get<Thing>(...args, token?)` → returns parsed data
  - Writes: `<verb><Thing>(...args, token?)` → returns parsed data too; failures throw
  - To add a new endpoint: add a one-liner to the domain module; never import fetch helpers or hardcode paths in components
- **Callers**: wrap mutations in try/catch — check `handleBanError(err)` first, then `err.status` / `err.data.detail`
- **Token**: pass `session?.backendToken` from `useSession()` as trailing arg
- **Auth flow server calls**: NextAuth signIn (`/auth/google`) and jwt profile fetch (`/auth/me`) also go through `clientFetch()` with `AbortSignal.timeout()` — same primitive as the browser
- **Env:** `NEXT_PUBLIC_BACKEND_URL` only (browser + NextAuth server callbacks)

## Mutations & Reads (client-side wrappers in `lib/api/`)
- `items.ts`: getItems, getItem | postLostFoundItem, updateItem, deleteItem, flagItem
- `resolutions.ts`: getResolution, getLinkableItems | createResolution, approveResolution, rejectResolution, completeResolution, failResolution
- `admin.ts`: getStats, getActivity, getUsers, getReportedItems, getAdminResolutions | moderateUser, moderateItem
- `notifications.ts`: getNotifications, getNotificationCount | readNotification, readAllNotifications
- `profile.ts`: getMyItems, getUserProfile | updateOnboarding, updateContact
- (No Server Actions — all requests are direct browser→backend)

## SWR (Notifications)
- `notifications/all`: 300s dedup, no focus revalidate
- `notifications/count`: 5s dedup, never mutated
- Count derived from list (race safety)
- Optimistic writes: `rollbackOnError: true, revalidate: false`

## Ban Handling
- **Backend contract (verified):** banned users get `403 { detail, code: "USER_BANNED" }` on every authenticated request — from `BanCheckMiddleware` (Redis fast path, all routes) and the DB backstop in `get_db_user` (fail-safe when Redis is down)
- **Frontend:** `lib/ban-handler.ts` is the single source of truth — `isBanError()` classifies, `handleBanError()` toasts + signs out to `/auth/error?error=UserBanned`
- Every request path must route bans through `handleBanError`:
  - **SWR hooks**: covered automatically by the global `onError` in `app/swr-provider.tsx` — do NOT add per-hook onError
  - **Everything else** (effect reads, mutation catches, manual fetches): call `handleBanError(err)` first
- Login-time rejection (no JWT yet) is server-side only → NextAuth redirects to `/auth/error?error=UserBanned`

## Key Conventions
- Images: compress to WebP ≤ 0.9 MB before FormData
- PATCH sends diffs only
- After `updateOnboarding()`: call `session.update()` to refresh JWT
- Feed segment (`public`/`boys`/`girls`): backend-enforced; token passed in `Authorization` header
- Onboarding: hostel + ≥1 contact (phone or Instagram)
- Locations: `LOCATION_MAP` in `lib/constants/locations.ts`
- Report reasons: `"harassment"` | `"inappropriate"` | `"spam"` | `"fake"` | `"duplicate"` | `"other"`

<!-- CODEGRAPH_START -->
## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tool** (when available): `codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them, including dynamic-dispatch hops grep can't follow. Name a file or symbol in the query to read its current line-numbered source. If it's listed but deferred, load it by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` prints the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.
<!-- CODEGRAPH_END -->
