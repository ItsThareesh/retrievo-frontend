"use server";

import { item_type, item_visibility } from "@/types/item";
import { revalidateTag, updateTag } from "next/cache";

// LOW-LEVEL HELPER FUNCTIONS FOR CACHE CONTROL

const VISIBILITY_SEGMENTS: Record<item_visibility, string[]> = {
    // Public items appear in all three feeds, so we must invalidate all three.
    // Boys/Girls items only appear in their own feed.
    public: ["public", "boys", "girls"],
    boys: ["boys"],
    girls: ["girls"],
};

function invalidateItemCache(itemId: string) {
    updateTag(`item-${itemId}`);
}

function invalidateFeedCache(
    visibility: item_visibility,
    strategy: "update" | "revalidate"
) {
    // Public items appear in all three feeds, so we must invalidate all three.
    // Boys/girls items only appear in their own feed.
    VISIBILITY_SEGMENTS[visibility].forEach((tag) => {
        if (strategy === "update") {
            // updateTag: correctness-critical — deletion/resolution completed items
            // must not appear in the feed for any new requests after this point.
            updateTag(`feed-${tag}`);
        } else {
            // revalidateTag with "max" profile: stale-while-revalidate.
            // Acceptable for cosmetic changes (title, display fields) where
            // brief staleness causes no functional harm.
            revalidateTag(`feed-${tag}`, "max");
        }
    });
}

function invalidateProfileCache(
    public_id: string,
    visibility: item_visibility,
    strategy: "update" | "revalidate"
) {
    VISIBILITY_SEGMENTS[visibility].forEach((tag) => {
        if (strategy === "update") {
            // updateTag: correctness-critical — items that have been deleted/resolved must not appear on profile for any new requests after this point.
            updateTag(`profile-${public_id}-${tag}`);
        } else {
            // revalidateTag with "max" profile: stale-while-revalidate.
            // Acceptable for cosmetic changes (title, display fields) where
            // brief staleness causes no functional harm.
            revalidateTag(`profile-${public_id}-${tag}`, "max");
        }
    });
}

// HIGH-LEVEL CACHE CONTROL FUNCTIONS

/** Call when a new item is posted. Feed must reflect the new item promptly. */
export async function onItemCreated(
    visibility: item_visibility,
    public_id: string
) {
    // Correctness-critical to update feed (no SWR staleness for now, can optimize later if needed)
    invalidateFeedCache(visibility, "update");
    // Correctness-critical to update profile cache
    invalidateProfileCache(public_id, visibility, "update");
}

/** Call when an item's details are changed (title, category, date, location and visibility). */
export async function onItemUpdated(
    itemId: string,
    public_id: string,
    change: {
        display_fields_changed: boolean;
        visibility_changed: boolean;
        old_visibility: item_visibility;
        new_visibility: item_visibility;
    }
) {
    // Invalidate the item cache so the detail page reflects the new visibility when refreshed.
    invalidateItemCache(itemId);

    if (change.visibility_changed) {
        // Invalidate both old and new visibility feeds so the item disappears from the old feed and appears in the new feed.
        invalidateFeedCache(change.old_visibility, "update");
        invalidateFeedCache(change.new_visibility, "update");

        // Invalidate both old and new visibility segments on profile so the item disappears from the old segment and appears in the new segment.
        invalidateProfileCache(public_id, change.old_visibility, "update");
        invalidateProfileCache(public_id, change.new_visibility, "update");
    } else if (change.display_fields_changed) {
        // If visibility didn't change but display fields did, we can use the less aggressive 
        // "revalidate" strategy since the item is still actionable in the feed and profile pages.
        invalidateFeedCache(change.new_visibility, "revalidate");
        invalidateProfileCache(public_id, change.new_visibility, "revalidate");
    }
}

/** Call when an item is deleted. Correctness-critical — dead links in feed. */
export async function onItemDeleted(
    itemId: string,
    public_id: string,
    visibility: item_visibility
) {
    invalidateItemCache(itemId);

    // Must use update — stale deleted item in feed/profile page causes 404 on click.
    invalidateFeedCache(visibility, "update");
    invalidateProfileCache(public_id, visibility, "update");
}

/** 
 * Call on any resolution state change that doesn't complete the resolution for the item. 
 * States include: `pending -> approved`, `pending -> rejected`, `return_initiated -> invalidated`.
 * Do not call this for resolution complete state changes. Use onResolutionCompleted instead.
*/
export async function onResolutionIntermediateStateChanged(itemId: string) {
    // Only the detail page needs updating — the item is still active in the feed.
    // Resolution state (pending -> approved etc.) is not surfaced on feed cards.
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
        invalidateFeedCache(visibility, "update");
        invalidateProfileCache(public_id, visibility, "update");
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
    invalidateFeedCache(visibility, "update");
    invalidateProfileCache(public_id, visibility, "update");
}