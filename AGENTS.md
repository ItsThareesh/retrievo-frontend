# AGENTS.md

**Stack:** Next.js 16 App Router (RSC + Server Actions) + NextAuth v5 + SWR + shadcn/ui + Tailwind (sonner, next-themes)

## Auth Flow
- Google OAuth → POST `id_token` → receive `{ access_token, expires_at }`
- `@nitc.ac.in` only; redirect others to error
- JWT: initial sign-in caches `/profile/me`; refresh on `trigger="update"`; auto-refresh if within 10min expiry
- **Guards in page.tsx:** redirect to signin or onboarding; never in middleware

## API Rules
- **No direct backend calls from client components** — use server actions or SWR + server action
- **Re-throw `UnauthorizedError`** — never swallow (enables signin redirect)
- `authFetch` (adds Bearer token), `publicFetch`, `internalFetchWithTimeout` (X-Internal-Secret header), `safeJson`
- **Env:** `INTERNAL_BACKEND_URL`, `INTERNAL_SECRET_KEY`

## Server Actions
- `lib/api/items.ts`: `getPaginatedItems` (120s, `items-{segment}` tag; bypass with `no-store` on filters), `fetchItem` (120s), `getUserProfile` (120s), `getUserItems` (no-store)
- `lib/api/authenticated-api.ts`: CRUD, resolutions, reports, notifications, onboarding
- `lib/api/admin.ts`: stats, activity, moderation (403 enforced)

## Cache Tags & TTL
| Tag | TTL | Invalidated by |
|---|---|---|
| `items-{public/boys/girls}` | 120s | `revalidateFeedByVisibility` |
| `item-{id}` | 60s | update, delete, claim |
| `profile-{id}-{segment}` | 120s | `revalidateProfileByVisibility` |

Public visibility invalidates all segments; `boys`/`girls` only their tag.

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