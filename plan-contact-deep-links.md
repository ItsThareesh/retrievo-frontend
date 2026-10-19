# Contact Deep Links — Plan (WhatsApp / Instagram QoL)

Status: **proposed** — frontend-only feature, no backend changes, no migrations.

## 1. Context & Motivation

Contact between the two parties of a resolution is **already gated** by the
backend: it is only exposed at lifecycle states where contact is legitimate,
and the frontend only ever renders what the resolution detail response
contains. The existing reveal surface is the `FinderContactCard`
(`app/resolution/[id]/components/finder-contact.tsx`), which today renders:

- `mailto:` link (email)
- `tel:` link (phone)
- profile link (`https://instagram.com/<handle>`)

The one channel students actually talk on — WhatsApp — is missing, and the
Instagram link lands on the profile page rather than a DM. For a student who
just got contact revealed, "copy the number, open WhatsApp" is 3+ manual
hops against a competitor app whose whole UX is one tap into WhatsApp.

Product context: the handshake (gated contact) is Retrievio's
differentiator versus the campus bulletin-board app; this feature is what
happens *after* the gate opens and must make Retrievo's contact hop strictly
**faster than the competitor's** — one tap, pre-filled message, correct
app. Reveal-then-deep-link, never deep-link-on-feed.

## 2. Decisions

| Topic | Decision | Rationale |
|---|---|---|
| Backend changes | **None.** Links are pure frontend derivation of already-revealed contact fields | Contact exposure authorization lives server-side and is unaffected; no endpoint, no migration, no schema change |
| WhatsApp format | `https://wa.me/<E.164 digits without '+'>`, prefill via `?text=` | Backend phone validator (`backend/app/schemas/profile.py`) already enforces `^\+[1-9]\d{7,14}$` E.164, so wa.me needs no transformation beyond stripping the leading `+` (kept defensive in code) |
| Prefill text | Static template: `Hi! I'm collecting my "<item title>" — connected through Retrievo.` | Removes the awkward stranger-opener item; title is already shared context between both parties. **No location, date, phone, or personal data in the prefill** |
| Prefill length | Cap item title at ~100 chars inside the helper | URL hygiene; titles are short but adversarial input is cheap to bound |
| Instagram | `https://ig.me/m/<handle>` (opens DM thread) | `ig.me/m/` deep-links to chat; Instagram web falls back to profile when not logged in. Handles are URL-safe by validator (`[a-zA-Z0-9._]` only) |
| Button hierarchy | Phone present → **"Message on WhatsApp"** primary button, `tel:` row demoted below; Instagram → accent-colored IG button; email stays a quiet text row | WhatsApp is the habitual channel; email/tel become fallbacks. Mirrors how students actually communicate |
| Copy fallback | Small copy-icon next to phone (`navigator.clipboard.writeText`) | Covers "WhatsApp isn't on this SIM" without cluttering the UI |
| Component boundary | Helper functions live in `lib/utils/contact.ts` next to the existing validators; UI only consumes | Links are string derivations — pure, testable, and re-stylable without touching logic |
| Gate invariant | Buttons render **only** inside `FinderContactCard` once the backend has revealed contact. No deep links anywhere in the feed, item cards, or item detail | The handshake is the product. Feeding `wa.me` to a public surface would convert the feature into the competitor's privacy model |
| Custody items | Untouched. Custody has no contact card by design (`plan-security-officer-custody.md`: claims rejected, face-to-face handover) | No surface exists to hang buttons on; adding one would reintroduce contact leakage the custody flow deliberately avoids |

## 3. Files touched

Frontend only:

| File | Change |
|---|---|
| `lib/utils/contact.ts` | Add `buildWhatsAppLink(phone, itemName)` and `buildInstagramDMLink(handle)` pure helpers |
| `app/resolution/[id]/components/finder-contact.tsx` | Convert phone/Instagram rows: primary WhatsApp button, IG DM link, copy-phone fallback |
| `app/resolution/[id]/page.tsx` (line ~531) | Pass `itemName` into `FinderContactCard` — `lostTitle` already exists at that scope (page.tsx:496) |
| `lib/utils/contact.test.ts` (new) | First frontend unit tests (see §6) |
| `package.json` | Add `vitest` devDependency + `"test": "vitest run"` script |

## 4. Helpers (reference implementation)

```ts
// lib/utils/contact.ts
const MAX_TITLE = 100;

export function buildWhatsAppLink(phone: string, itemName?: string | null): string {
    const digits = phone.replace(/^\+/, "");
    const title = (itemName ?? "").slice(0, MAX_TITLE);
    const text = title
        ? `Hi! I'm collecting my "${title}" — connected through Retrievo.`
        : "Hi! Connected through Retrievo.";
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function buildInstagramDMLink(instagramId: string): string {
    return `https://ig.me/m/${sanitizeInstagram(instagramId)}`;
}
```

Both are pure string derivations with no fetch/auth — safe to render in any
post-reveal surface the backend authorizes.

## 5. Flow (after gate opens, e.g. claim approved)

1. Resolution page loads; backend response includes `finderContact` only at
   states where contact is legitimately visible (unchanged behavior).
2. `FinderContactCard` renders:
   - phone present → **Message on WhatsApp** (primary, pre-filled message,
     opens the chat thread directly in-app on mobile / `web.whatsapp` on desktop)
   - instagramId present → **DM on Instagram** (accent, opens DM thread)
   - copy-phone icon as fallback
   - email row demoted to quiet text link
3. No other page changes. Empty states unchanged (no phone → no WhatsApp
   button; onboarding guarantees at least one contact method).

## 6. Explicit non-goals

- **No WhatsApp/Instagram notification channels.** Contact deep links are
  client-side strings; delivery channels touch the
  `NotificationDelivery`/outbox machinery (`plan-notification-revamp.md`)
  and have paid, metered vendor APIs. Separate decision, separate plan.
- No in-app chat. The handshake ends at revealed contact; WhatsApp/DM is the
  communication surface.
- No deep links on the public feed or item detail pages.
- No changes to `profile-client.tsx` self-contact display.
- No backend, schema, or messaging copy changes.

## 7. Acceptance criteria

1. With phone-only contact: resolution page shows a working WhatsApp button
   opening a chat with the pre-filled template message (mobile + desktop).
2. With Instagram-only contact: resolution page shows a working IG DM link.
3. No contact surface renders before the backend authorizes it (regression
   check: feed and item pages unchanged).
4. `npm run test` passes with the new helpers covered.
5. Phone without WhatsApp/SIM: copy fallback works.
