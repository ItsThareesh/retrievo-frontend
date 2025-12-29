import { Suspense } from "react";
import Loading from "./loading";
import { notFound } from "next/navigation";
import { fetchItem } from "@/lib/api/server";
import { auth } from "@/auth";
import ItemEditable from "./item-editable-client";

export default async function ItemPage({ params }: { params: Promise<{ id: string; }>; }) {
    const session = await auth();

    const { id } = await params;

    // Fetch item data
    const item_reporter_details = await fetchItem(id, session?.backendToken);
    if (!item_reporter_details.ok) notFound();

    const { item, reporter, claim_status } = item_reporter_details.data;

    return (
        <Suspense fallback={<Loading />}>
            <ItemEditable item={item} reporter={reporter} claim_status={claim_status} session={session} />
        </Suspense>
    );
}

