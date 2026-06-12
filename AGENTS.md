# AGENTS.md

**Stack:** Next.js 16 App Router (RSC + Server Actions) + NextAuth v5 + SWR + shadcn/ui + Tailwind (sonner, next-themes)

## Auth Flow
- Google OAuth → POST `id_token` → receive `{ access_token, expires_at }`
- `@nitc.ac.in` only in production; redirect others to error. Otherwise allow all domains in testing.
- JWT: initial sign-in caches `/profile/me`; refresh on `trigger="update"`; auto-refresh if within 10min expiry
- **Guards in page.tsx:** redirect to signin or onboarding; never in middleware

## API Rules
- **No direct backend calls from client components** — use server actions or SWR + server action
- **Re-throw `UnauthorizedError`** — never swallow (enables signin redirect)
- `authFetch` (adds Bearer token), `publicFetch`, `internalFetchWithTimeout` (X-Internal-Secret header), `safeJson`
- **Env:** `INTERNAL_BACKEND_URL`, `INTERNAL_SECRET_KEY`

## Server Actions (`"use server"` files in `lib/api/`)
- `items.ts`: `getPaginatedItems`, `fetchItem` (conditional `no-store` when authed), `postLostFoundItem`, `updateItem`, `deleteItem`, `flagItem`
- `resolutions.ts`: `createResolution`, `getLinkableItems`, `getResolutionStatus`, `approveResolution`, `rejectResolution`, `completeResolution`, `failResolution`
- `admin.ts`: `getStats`, `getActivity`, `getResolutions`, `getUsers`, `getReportedItems`, `moderateUser`, `moderateItem`
- `notifications.ts`: `getNotifications`, `getNotificationsCount`, `readNotification`, `readAllNotifications`
- `profile.ts`: `updateOnboarding`, `getUserItems`, `getUserProfile`

## Cache Rules
- `authFetch` always uses `cache: "no-store"` — user-specific responses must not leak across users via Next.js Data Cache.
- `publicFetch` callers that pass auth headers (`Authorization`) must also pass `cache: "no-store"` — enforced at each call site.
- Public (unauthenticated) `publicFetch` calls use Next.js defaults (`force-cache`). Cache is per-URL and not actively invalidated — acceptable since dataset is <1K items.
- No custom cache tags, no `cacheController.ts`, no `revalidateTag`/`updateTag` calls. Backend rate limiter (120 req/60s per identity) is the sole abuse protection.

## SWR (Notifications)
- `notifications/all`: 300s dedup, no focus revalidate
- `notifications/count`: 5s dedup, never mutated
- Count derived from list (race safety)
- Optimistic writes: `rollbackOnError: true, revalidate: false`

## Key Conventions
- Images: compress to WebP ≤ 0.9 MB before FormData
- PATCH sends diffs only
- After `updateOnboarding()`: call `session.update()` to refresh JWT
- Feed segment (`public`/`boys`/`girls`): server-side, prop to grid
- Onboarding: hostel + ≥1 contact (phone or Instagram)
- Locations: `LOCATION_MAP` in `lib/constants/locations.ts`
- Report reasons: `"harassment"` | `"inappropriate"` | `"spam"` | `"fake"` | `"duplicate"` | `"other"`