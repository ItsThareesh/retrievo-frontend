# AGENTS.md

This document is the implementation-accurate guide for contributors and coding agents working in this frontend.
Scope: `frontend/` (Next.js 15 App Router + NextAuth v5 + SWR + shadcn/ui).

---

## 1) Runtime Architecture

- Framework: **Next.js 15 App Router** (RSC + Server Actions)
- Auth: **NextAuth v5** (Google OAuth → backend JWT)
- UI: **shadcn/ui** over Tailwind CSS
- Analytics: Vercel Analytics + SpeedInsights
- Toast: `sonner` via `<Toaster />`
- Theme: `next-themes` wrapped in `ThemeProvider`
- SWR: Client-side caching for notifications only

---

### Authentication & Onboarding Guards

Guards are applied directly in server-component page files (not middleware):

```ts
// Pattern used in /report, /profile, /resolution/[id]
const session = await auth();
const isAuthenticated = !!session?.user && Date.now() < (session?.expires_at ?? 0);

if (!isAuthenticated) redirect(`/auth/signin?callbackUrl=...`);
if (needsOnboarding(session)) redirect('/onboarding');
```

---

## 2) Authentication & Session Management

### Provider

`lib/auth.ts` exports `{ handlers, signIn, signOut, auth }` from NextAuth v5.

- **Provider**: Google OAuth (`next-auth/providers/google`)
- **Strategy**: `jwt`
- **Domain restriction**: Only `@nitc.ac.in` email addresses may sign in; others are redirected to `/auth/error?error=AccessDenied`

### Sign-In Flow

1. Google OAuth completes and `signIn` callback receives `account.id_token`.
2. NextAuth POSTs the `id_token` to `INTERNAL_BACKEND_URL/auth/google`.
3. Backend returns `{ access_token, expires_at }`.
4. `account.backendToken` and `account.expires_at` are attached for the `jwt` callback.

### JWT Callback Behavior

| Trigger | Action |
|---|---|
| Initial sign-in (`account && profile` present) | Store `backendToken` + `expires_at`; fetch `/profile/me` and cache full user in `token.user` |
| `trigger === "update"` | Re-fetch `/profile/me` and refresh cached `token.user` (used after onboarding or profile edits) |
| Token within 10 min of expiry | Call `/auth/refresh` with existing token; update `backendToken` + `expires_at` |
| Token already expired | Set `backendToken`, `expires_at`, `user` to `null` (forces logout) |

## 3) API Layer

All server-to-backend communication flows through a set of helper utilities and Server Action files. **Never call the backend directly from client components.**

### `lib/api/helpers.ts`

Core utilities shared by all server-side API functions:

| Export | Purpose |
|---|---|
| `internalFetchWithTimeout(url, options, timeout)` | Base fetch with timeout and automatic `X-Internal-Secret` header injection |
| `authFetch(input, options, timeout)` | Reads session → injects `Authorization: Bearer <backendToken>` → calls `internalFetchWithTimeout`. Throws `UnauthorizedError` if no token or 401 returned |
| `publicFetch(input, options, timeout)` | No auth; calls `internalFetchWithTimeout` |
| `safeJson(res)` | `res.json()` wrapped in try/catch, returns `null` on failure |
| `UnauthorizedError` | Custom error class; must be re-thrown by callers so Next.js can handle redirects |

**Required env vars**:
- `INTERNAL_BACKEND_URL` — internal URL of the FastAPI backend (no trailing slash)
- `INTERNAL_SECRET_KEY` — shared secret injected as `X-Internal-Secret` on every request

### `lib/api/server.ts` — Public Server Fetches

Regular server-side module (not `"use server"`). Functions here are only callable from server components.

| Function | Backend Endpoint | Cache |
|---|---|---|
| `fetchItem(itemId, token?)` | `GET /items/{id}` | `revalidate: 60s`, tag `item-{id}` |

### `lib/api/items.ts` — Item & Profile Server Actions

`"use server"` file. Callable from both server and client components.

| Function | Backend Endpoint | Cache |
|---|---|---|
| `getPaginatedItems(segment, queryString?)` | `GET /items/all?segment=...` | `revalidate: 120s`, tag `items-{segment}` — **all pages cached; bypassed with `cache: "no-store"` when any filter/search is active** |
| `getUserItems()` | `GET /profile/items` | `cache: "no-store"` |
| `getUserProfile(public_id, segment)` | `GET /profile/{public_id}?segment=...` | `revalidate: 120s`, tag `profile-{public_id}-{segment}` (3 separate entries per user) |

### `lib/api/authenticated-api.ts` — Authenticated Server Actions

`"use server"` file. All functions use `authFetch`.

| Function | Backend Endpoint | Cache Behavior |
|---|---|---|
| `postLostFoundItem(formData)` | `POST /items/create` | `revalidateFeedByVisibility(result.visibility)` + `revalidateProfileByVisibility(public_id, result.visibility)` |
| `updateItem(itemId, data)` | `PATCH /items/{id}` | `updateTag("item-{id}")` + `revalidateFeedByVisibility` + `revalidateProfileByVisibility` (old + new visibility if changed) |
| `deleteItem(itemId)` | `DELETE /items/{id}` | `updateTag("item-{id}")` + `revalidateFeedByVisibility` + `revalidateProfileByVisibility` |
| `createResolution(itemId, description)` | `POST /resolutions/create` | `updateTag("item-{id}")` |
| `getResolutionStatus(resolutionId)` | `GET /resolutions/{id}` | No cache |
| `approveResolution(claimId)` | `POST /resolutions/{id}/approve` | No cache |
| `rejectResolution(resolutionId, reason)` | `POST /resolutions/{id}/reject` | No cache |
| `completeResolution(resolutionId)` | `POST /resolutions/{id}/complete` | No cache |
| `invalidateResolution(resolutionId)` | `POST /resolutions/{id}/invalidate` | No cache |
| `reportItem(itemId, reason)` | `POST /items/{id}/report` | No cache |
| `updateOnboarding(payload)` | `POST /profile/complete-onboarding` | No cache |
| `getNotifications()` | `GET /notifications/all` | `revalidate: 120s` (server-side) |
| `getNotificationsCount()` | `GET /notifications/count` | No cache |
| `readNotification(id)` | `POST /notifications/{id}/mark-read` | No cache |
| `readAllNotifications()` | `POST /notifications/mark-all-read` | No cache |

### `lib/api/admin.ts` — Admin Server Actions

`"use server"` file. All functions use `authFetch`. Admin role enforced server-side by the backend (403 on non-admins).

| Function | Backend Endpoint |
|---|---|
| `getStats()` | `GET /admin/stats` |
| `getActivity(limit?)` | `GET /admin/activity?limit=...` |
| `getResolutions(status?, limit?, skip?)` | `GET /admin/resolutions?...` |
| `getUsers(limit?, skip?)` | `GET /admin/users?...` |
| `moderateUser(userId, request)` | `POST /admin/users/{id}/moderate` |
| `getReportedItems(limit?, skip?)` | `GET /admin/reported-items?...` |
| `moderateItem(itemId, request)` | `POST /admin/items/{id}/moderate` → `updateTag` + `revalidateFeedByVisibility` |

---

## 4) Caching Architecture

### Next.js Fetch Cache Tags

| Tag | Revalidation | Invalidated By |
|---|---|---|
| `items-public` | 120 seconds | `revalidateFeedByVisibility("public")` — also revalidates `items-boys` and `items-girls` |
| `items-boys` | 120 seconds | `revalidateFeedByVisibility("boys")` |
| `items-girls` | 120 seconds | `revalidateFeedByVisibility("girls")` |
| `item-{id}` | 60 seconds | `updateTag("item-{id}")` on update, delete, or claim creation |
| `profile-{public_id}-public` | 120 seconds | `revalidateProfileByVisibility(public_id, visibility)` when that user's item is created, updated, or deleted |
| `profile-{public_id}-boys` | 120 seconds | Same — only invalidated when item visibility affects the boys segment |
| `profile-{public_id}-girls` | 120 seconds | Same — only invalidated when item visibility affects the girls segment |

**`revalidateFeedByVisibility(visibility)`** (`lib/utils/revalidateFeed.ts`):
- `"public"` → revalidates all three segment tags (`items-public`, `items-boys`, `items-girls`)
- `"boys"` or `"girls"` → revalidates only the matching segment tag

**`revalidateProfileByVisibility(public_id, visibility)`** (`lib/utils/revalidateFeed.ts`):
- `"public"` → revalidates all three profile segment tags for that user (public items appear in all segments)
- `"boys"` or `"girls"` → revalidates only `profile-{public_id}-{visibility}`

### SWR Client Cache (Notifications)

Managed in `lib/hooks/use-notifications.ts`. Two independent SWR keys:

| SWR Key | Fetcher Source | Config |
|---|---|---|
| `"notifications/all"` | `getNotifications()` server action | `dedupingInterval: 300_000` (5 min), `revalidateOnFocus: false`, `keepPreviousData: true` |
| `"notifications/count"` | `getNotificationsCount()` server action | `dedupingInterval: 5000`, `revalidateOnFocus: false` |

**Unread count resolution**: If full notifications data is loaded, unread count is computed locally from the list (`filter(!is_read).length`). The lightweight count endpoint is only used as a fallback before the full list is fetched.

### Filter Bypass

When `search=`, `category=`, or `item_type=` is present in the `queryString` passed to `getPaginatedItems`, the function opts out of all Next.js caching via `cache: "no-store"` to guarantee fresh results. Default feed pages (no filters) are all cached with a 120s TTL and tagged per segment for on-demand invalidation.

### Onboarding Requirement

New users must complete onboarding before accessing `/report`, `/profile`, or `/resolution/[id]`:
1. Select **hostel** (`"boys"` or `"girls"`) — immutable after first set.
2. Provide at least one contact: **phone** or **Instagram handle**.

After submission, `session.update()` (NextAuth) is called to refresh the JWT with the new `hostel`/contact data. The `trigger === "update"` path in the JWT callback then re-fetches `/profile/me`.

### Location Taxonomy

`lib/constants/locations.ts` exports `LOCATION_MAP` (key → `{ label, category }`).
`LocationKey` is the union type of all keys in `LOCATION_MAP`.

### Report Reasons

`lib/constants/report-reasons.ts` → `reasons_map` array used in item report dialog:
`"harassment"`, `"inappropriate"`, `"spam"`, `"fake"`, `"duplicate"`, `"other"`

---

## 5) Components

### Shared Components (`components/`)

| Component | Type | Description |
|---|---|---|
| `Navbar` | Server | Sticky top bar. Reads session; renders `NotificationsDropdown` if authenticated, `LoginButton` always |
| `LoginButton` | Client | Sign-in / user-menu toggle; receives `session` and `isAuthenticated` as props |
| `UserMenu` | Client | Dropdown with profile, admin link (role-gated), sign-out |
| `NotificationsDropdown` | Client | Bell icon + unread badge; renders full notification list from `useNotifications` hook |
| `ItemCard` | Client | Card UI for a single `Item`; links to `/items/[id]` |
| `ImageViewer` | Client | Lightbox/viewer for item images |
| `ThemeToggle` | Client | Light/dark/system toggle |

---

## 6) Key Conventions

- **Only Server Actions call the backend.** Client components call server actions (or SWR hooks backed by server actions). Direct `fetch` to the backend from the browser is never done.
- **`UnauthorizedError` must always be re-thrown.** Callers of `authFetch`-backed functions must catch `UnauthorizedError` and rethrow; they must not swallow it. This allows Next.js to redirect to sign-in properly.
- **Image uploads go through `compressImage` first.** Before appending an image to `FormData` for `postLostFoundItem`, compress it with `compressToWebP` → target ≤ 0.9 MB WebP.
- **Diff-only PATCH.** `useItemEditable.handleSave()` only sends changed fields to avoid unnecessary updates.
- **Session update after onboarding.** After a successful `updateOnboarding()` call, always call `session.update()` (from `useSession`) to trigger the `trigger === "update"` JWT callback and refresh cached user data.
- **Segment derivation is server-only.** The feed segment (`public` / `boys` / `girls`) is derived from the session on the server page; the client `ItemsGridClient` receives it as a prop and uses it for all subsequent fetches.
