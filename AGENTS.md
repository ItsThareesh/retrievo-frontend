# AGENTS.md

**Stack:** Next.js 16 App Router + NextAuth v5 + SWR + shadcn/ui + Tailwind (sonner, next-themes)

## Auth Flow
- Google OAuth → POST `id_token` → receive `{ access_token, expires_at }`
- `@nitc.ac.in` only in production; redirect others to error. Otherwise allow all domains in testing.
- JWT: initial sign-in caches `/profile/me`; refresh on `trigger="update"`; no auto-refresh — session invalidated when the backend token expires (backend issues 30-day tokens, `LOGIN_TOKEN_TTL_DAYS`)
- **Guards in page.tsx:** redirect to signin or onboarding for pages that need it (profile, admin, report, onboarding); never in middleware
- **SessionProvider** is in the root layout — `useSession()` available everywhere

## Data Flow
- **All reads and writes:** Browser → Backend API directly via `clientFetch()` / `clientMutate()` in `lib/client-fetch.ts`
  - Uses `NEXT_PUBLIC_BACKEND_URL` + Bearer token from `useSession().backendToken`
  - Data never passes through Vercel servers
  - Used in: ItemsGrid, ItemDetail, Profile, UserProfile, Resolution, Admin tabs, Notifications, LinkableItems
- **Mutations (writes):** thin endpoint wrappers in `lib/api/` over `clientMutate()` (plain functions, no Server Actions)
  - `postLostFoundItem`, `updateItem`, `deleteItem`, `flagItem` — `lib/api/items.ts`
  - `createResolution`, `approveResolution`, `rejectResolution`, `completeResolution`, `failResolution` — `lib/api/resolutions.ts`
  - `moderateUser`, `moderateItem` — `lib/api/admin.ts`
  - `readNotification`, `readAllNotifications` — `lib/api/notifications.ts`
  - `updateOnboarding`, `updateContact` — `lib/api/profile.ts`

## API Rules
- **Transport** (`lib/client-fetch.ts` — the only two primitives):
  - `clientFetch(path, token?, options?)` — reads; throws `APIError` (has `.status`, `.code`, `.data`)
  - `clientMutate(path, token?, options?)` — writes; resolves to `{ ok, status?, data? }`; rethrows only `USER_BANNED`
- **Endpoints** live ONLY in `lib/api/<domain>.ts` as plain functions, one uniform convention:
  - Reads: `get<Thing>(...args, token?)` → returns data, throws on failure
  - Writes: `<verb><Thing>(...args, token?)` → returns `{ ok }` result
  - To add a new endpoint: add a one-liner to the relevant domain module (create the module if new domain); never call `clientFetch`/hardcode paths in components
- **Token**: callers pass `session?.backendToken` from `useSession()` as trailing arg
- **Server->Backend**: `internalFetchWithTimeout` in `lib/api/helpers.ts` (NextAuth signIn/jwt callbacks only)
- **Env:** `NEXT_PUBLIC_BACKEND_URL` (browser), `INTERNAL_BACKEND_URL` + `INTERNAL_SECRET_KEY` (NextAuth server callbacks only)

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
