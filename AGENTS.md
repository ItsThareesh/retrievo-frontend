# AGENTS.md

**Stack:** Next.js 16 App Router + NextAuth v5 + SWR + shadcn/ui + Tailwind (sonner, next-themes)

## Auth Flow
- Google OAuth → POST `id_token` → receive `{ access_token, expires_at }`
- `@nitc.ac.in` only in production; redirect others to error. Otherwise allow all domains in testing.
- JWT: initial sign-in caches `/profile/me`; refresh on `trigger="update"`; auto-refresh if within 10min expiry
- **Guards in page.tsx:** redirect to signin or onboarding for pages that need it (profile, admin, report, onboarding); never in middleware
- **SessionProvider** is in the root layout — `useSession()` available everywhere

## Data Flow
- **Reads (auth-gated data):** Browser → Backend API directly via `clientFetch()` in `lib/client-fetch.ts`
  - Uses `NEXT_PUBLIC_BACKEND_URL` + Bearer token from `useSession().backendToken`
  - Data never passes through Vercel servers
  - Used in: ItemsGrid, ItemDetail, Profile, UserProfile, Resolution, Admin tabs, Notifications, LinkableItems
- **Mutations (writes):** Still use Server Actions (`"use server"` in `lib/api/`) for convenience
  - `postLostFoundItem`, `updateItem`, `deleteItem`, `flagItem` — `lib/api/items.ts`
  - `createResolution`, `approveResolution`, `rejectResolution`, `completeResolution`, `failResolution` — `lib/api/resolutions.ts`
  - `moderateUser`, `moderateItem` — `lib/api/admin.ts`
  - `readNotification`, `readAllNotifications` — `lib/api/notifications.ts`
  - `updateOnboarding` — `lib/api/profile.ts`

## API Rules
- **Server->Backend**: `authFetch` / `publicFetch` / `internalFetchWithTimeout` in `lib/api/helpers.ts` (used by server actions & auth)
- **Browser->Backend**: `clientFetch` in `lib/client-fetch.ts` (used by client components)
  - Passes token from `useSession()` automatically; no cache headers needed (browser native cache)
- **Env:** `NEXT_PUBLIC_BACKEND_URL` (browser), `INTERNAL_BACKEND_URL` (server), `INTERNAL_SECRET_KEY`

## Server Actions (mutations only — kept in `lib/api/`)
- `items.ts`: `postLostFoundItem`, `updateItem`, `deleteItem`, `flagItem`
- `resolutions.ts`: `createResolution`, `approveResolution`, `rejectResolution`, `completeResolution`, `failResolution`
- `admin.ts`: `moderateUser`, `moderateItem`
- `notifications.ts`: `readNotification`, `readAllNotifications`
- `profile.ts`: `updateOnboarding`
- (Read-only server actions removed — migrated to client-side)

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