import { Suspense } from "react";
import Loading from "./loading";
import { notFound } from "next/navigation";
import { fetchItem } from "@/lib/api/server";
import { auth } from "@/lib/auth";
import ItemDetailPage from "./item-detail-page";

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
            <ItemDetailPage item={item} reporter={reporter} resolution_status={claim_status} session={session} />
        </Suspense>
    );
}

