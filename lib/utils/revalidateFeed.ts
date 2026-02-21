"use server";

import { revalidateTag } from "next/cache";

export async function revalidateFeedByVisibility(visibility: "public" | "boys" | "girls") {
    if (visibility === "public") {
        revalidateTag("items-public", "max");
        revalidateTag("items-boys", "max");
        revalidateTag("items-girls", "max");
    } else {
        revalidateTag(`items-${visibility}`, "max");
    }
}