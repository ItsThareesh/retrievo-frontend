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
    const res = await fetchItem(id, session?.backendToken);

    if (!res.ok) {
        notFound();
    }

    const { item, reporter, claim_status } = res.data;

    return (
        <Suspense fallback={<Loading />}>
            <ItemEditable item={item} reporter={reporter} resolution_status={claim_status} session={session} />
        </Suspense>
    );
}

