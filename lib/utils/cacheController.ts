"use server";

import { item_type, item_visibility } from "@/types/item";
import { revalidateTag, updateTag } from "next/cache";

// LOW-LEVEL HELPER FUNCTIONS FOR CACHE CONTROL

// Current architecture caches only unauthenticated public views:
// - feed tag: feed-public
// - profile tag: profile-{public_id}-public
// Authenticated feeds/profiles are fetched with no-store, so there are no
// boys/girls cache tags to invalidate.

function invalidateItemCache(itemId: string) {
    updateTag(`item-${itemId}`);
}

function invalidateFeedCache(
    strategy: "update" | "revalidate"
) {
    if (strategy === "update") {
        // correctness-critical updates: remove stale public feed entries immediately
        updateTag("feed-public");
    } else {
        // cosmetic-only changes can use stale-while-revalidate
        revalidateTag("feed-public", "max");
    }
}

function invalidateProfileCache(
    public_id: string,
    strategy: "update" | "revalidate"
) {
    const tag = `profile-${public_id}-public`;

    if (strategy === "update") {
        // correctness-critical updates: remove stale public profile entries immediately
        updateTag(tag);
    } else {
        // cosmetic-only changes can use stale-while-revalidate
        revalidateTag(tag, "max");
    }
}

// HIGH-LEVEL CACHE CONTROL FUNCTIONS

/** Call when a new item is posted. Feed must reflect the new item promptly. */
export async function onItemCreated(
    is_public: boolean,
    public_id: string
) {
    if (!is_public) {
        return;
    }

    // Correctness-critical to update feed (no SWR staleness for now, can optimize later if needed)
    invalidateFeedCache("update");
    // Correctness-critical to update profile cache
    invalidateProfileCache(public_id, "update");
}

/** Call when an item's details are changed (title, category, date, location and visibility). */
export async function onItemUpdated(
    itemId: string,
    public_id: string,
    public_cache_action: "none" | "update" | "revalidate"
) {
    // Invalidate the item cache so the detail page reflects the new visibility when refreshed.
    invalidateItemCache(itemId);

    if (public_cache_action === "update") {
        invalidateFeedCache("update");
        invalidateProfileCache(public_id, "update");
    } else if (public_cache_action === "revalidate") {
        invalidateFeedCache("revalidate");
        invalidateProfileCache(public_id, "revalidate");
    }
}

/** Call when an item is deleted. Correctness-critical — dead links in feed. */
export async function onItemDeleted(
    itemId: string,
    public_id: string,
    was_public: boolean
) {
    invalidateItemCache(itemId);

    if (!was_public) {
        return;
    }

    // Must use update — stale deleted item in feed/profile page causes 404 on click.
    invalidateFeedCache("update");
    invalidateProfileCache(public_id, "update");
}

/** 
 * Call on any resolution state change that doesn't complete the resolution for the item. 
 * States include: `pending -> approved`, `pending -> rejected`, `return_initiated -> invalidated`.
 * Do not call this for resolution complete state changes. Use onResolutionCompleted instead.
*/
export async function onResolutionIntermediateStateChanged(itemId: string) {
    // Only the detail page needs updating — the item is still active in the feed.
    // Resolution state is not surfaced on feed.
    invalidateItemCache(itemId);

    // No need to update the feed/profile page since they don't indicate resolution state.
}

/** 
 * Call only when a resolution is `completed` (includes both owner-initiated and finder-initiated methods). 
*/
export async function onResolutionCompleted(
    itemId: string,
    public_id: string,
    item_type: item_type,
    visibility: item_visibility
) {
    invalidateItemCache(itemId);

    if (item_type === "lost") {
        // For lost items, backend hides the item immediately upon resolution completed status to prevent
        // confusion and dead links, updating the feed with "update" strategy to ensure correctness.
        invalidateFeedCache("update");
        invalidateProfileCache(public_id, "update");
    }

    // For found items, backend keeps the item visible in the feed after resolution completion to allow
    // cross-claims by other users. Since feed doesn't indicate resolution state, we can avoid any action here.
}

/**
 * Call when a resolution is `invalidated` as a owner action. Essentially the same as onResolutionIntermediateStateChanged
 * but avoids confusion around `invalidated` state being intermediate when it's actually a final state. 
 * No feed invalidation needed since the item remains active in the feed, and the feed doesn't indicate resolution state.
*/
export const onResolutionInvalidated = onResolutionIntermediateStateChanged;

/**
 * Call when Admin moderates an item. Admin can either hide, restore, or delete an item.
 * So we must invalidate the item cache, update the feed and profile cache with "update" strategy to ensure correcntess.
*/
export async function onAdminItemModerationAction(
    itemId: string,
    public_id: string,
    visibility: item_visibility,
) {
    invalidateItemCache(itemId);
    invalidateFeedCache("update");
    invalidateProfileCache(public_id, "update");
}

/**
 * Call when Admin moderates a user (warn, temp_ban, unban).
 * - warn: no cache changes needed since no visibility or item state changes occur.
 * - temp_ban/unban: correctness-critical — items are hidden/restored, so feeds, profile pages,
 *   and item detail pages must reflect the change immediately.
 *   Since only public unauthenticated views are cached, invalidate public tags only.
*/
export async function onAdminUserModerationAction(
    public_id: string,
    action: "warn" | "temp_ban" | "perm_ban" | "unban",
    item_ids: string[] = []
) {
    if (action === "warn") {
        // Do nothing since warning doesn't change anything.
        // Only notifications are triggered but those are handled separately and don't require cache invalidation.
        return;
    }

    // For ban/unban: items are hidden/restored. Only cached public views need invalidation.
    invalidateFeedCache("update");
    invalidateProfileCache(public_id, "update");

    // Invalidate individual item detail caches for each affected item.
    item_ids.forEach((id) => invalidateItemCache(id));
}