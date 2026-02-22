# Retrievo - Lost & Found Platform

A modern Lost & Found web application built with Next.js 16, TailwindCSS, shadcn/ui, and NextAuth v5.

## Features

- **Report Lost Items**: Submit details about lost items including photos, location, and category
- **Report Found Items**: Help others by reporting items you've found
- **Browse Items**: Search and filter through lost and found items with infinite scroll
- **Smart Feed Segments**: Feed visibility based on user hostel choice (boys, girls, or public)
- **Item Management**: View, edit, and delete your reported items
- **Item Claims**: Claim found items or advertise returns for lost items
- **User Profile**: Manage your profile, hostel selection, and contact preferences
- **Notifications**: Real-time notifications for claims and resolutions
- **Admin Dashboard**: Moderation tools for admins to manage items and users

## Tech Stack

- **Framework**: Next.js 16 (App Router + React Server Components)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: NextAuth v5 (Google OAuth, JWT backend)
- **Data Fetching**: Next.js Server Actions + native fetch cache
- **Client State**: SWR for notifications
- **Language**: TypeScript
- **Analytics**: Vercel Analytics + SpeedInsights

## Architecture Overview

### Authentication Flow

- **Provider**: Google OAuth (`@nitc.ac.in` email addresses only)
- **Session**: JWT issued by FastAPI backend, stored in NextAuth cookies
- **Sign-In**: Google OAuth → Backend token exchange → JWT stored in session
- **Token Refresh**: Automatic refresh when token nears expiry (10 min buffer)

### Caching Strategy

- **Default Feed Pages**: Native Next.js fetch cache (120s TTL, tagged per segment)
  - All paginated item feed pages are cached
  - Cache invalidated via tag revalidation when items are created/updated/deleted
- **Individual Items**: 60s TTL with tag-based invalidation
- **Search/Filtered Queries**: No cache (always fresh)
- **Notifications**: SWR client-side cache with 5-minute dedup interval

### Server Actions & API

- **Server Actions** (`lib/api/`): All backend communication flows through server actions
- **No Direct Browser→Backend**: Client components call server actions only; they use publicFetch/authFetch
- **Two Fetch Helpers**:
  - `publicFetch`: Unauthenticated requests (public items, etc.)
  - `authFetch`: Authenticated requests (requires valid JWT session token)

### Infinite Scroll Implementation

- **Generation Counter**: Prevents stale pages from old filter sets leaking into new ones
- **Race Condition Protection**: In-flight requests discarded if filters change mid-request
- **Efficient Page Accumulation**: Pages 1+ are cached, so secondary loads hit the cache immediately

## Getting Started

### Prerequisites

- Node.js 18+ (required by Next.js 16)
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ItsThareesh/retrievo-frontend.git
   cd retrievo-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (`.env.local`):
   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NEXTAUTH_SECRET=your_nextauth_secret
   INTERNAL_BACKEND_URL=http://localhost:8000  # or your backend URL
   INTERNAL_SECRET_KEY=your_internal_secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Key Concepts

### Visibility Segments

Items have a `visibility` field determining who can see them:
- **`"public"`**: Visible to all users and unauthenticated visitors
- **`"boys"`**: Visible only to users whose hostel is "boys" + public viewers
- **`"girls"`**: Visible only to users whose hostel is "girls" + public viewers

Feed segment shown is derived from user's hostel selection during onboarding.

### Onboarding Requirement

New users must complete onboarding before accessing protected routes:
1. Select hostel (`"boys"` or `"girls"` — immutable after first set)
2. Provide at least one contact method (Phone or Instagram handle)

### Item Types & Claims

- **Lost Items** (`type: "lost"`): Others can offer to **return** them
- **Found Items** (`type: "found"`): Others can **claim** them
- **Resolutions**: Track claim lifecycle from initiation to completion/rejection

### Diff-Only Updates

When editing items, only changed fields are sent to the backend (diff-based PATCH), minimizing bandwidth.

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `NEXTAUTH_SECRET` | Yes | NextAuth session encryption key |
| `INTERNAL_BACKEND_URL` | Yes | Internal backend API URL (never exposed to browser) |
| `INTERNAL_SECRET_KEY` | Yes | Shared secret for internal server-to-server requests |

> `INTERNAL_BACKEND_URL` is used **only in server actions and NextAuth callbacks** — it is never sent to the browser.

## Development Commands

```bash
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## Best Practices

1. **Server-First Approach**: Prefer server components; use `"use client"` only when needed (interactivity, hooks)
2. **Server Actions**: All backend communication flows through `lib/api/` server actions
3. **Error Handling**: Always re-throw `UnauthorizedError` from `authFetch` to allow proper redirects
4. **Image Compression**: Compress images to WebP before uploading (≤0.9 MB)
5. **Tag-Based Revalidation**: Update feed tags after
 mutations to keep cache fresh
6. **Debounced Search**: Search input is debounced (400ms) to reduce server load

## Backend Integration

This frontend communicates with a FastAPI backend at `INTERNAL_BACKEND_URL`:

- All requests include `X-Internal-Secret` header for server-to-server authentication
- Authenticated requests include `Authorization: Bearer <jwt_token>` header
- Session JWT is refreshed automatically when nearing expiry