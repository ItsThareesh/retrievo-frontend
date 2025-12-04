import { Suspense } from "react";
import ItemPageContent from "./page_content";
import Loading from "../../loading";
import { notFound } from "next/navigation";
import { fetchItem } from "@/lib/api";

export default async function ItemPage({ params }: { params: Promise<{ id: string; type: string }> }) {
    const { id, type } = await params;

    const item = await fetchItem(id, type);

    if (!item) {
        notFound();
    }

    const formattedItem = {
        ...item,
        type: type,
        date: new Date(item.date).toLocaleDateString("en-GB").replace(/\//g, "-"),
    };

    return (
        <Suspense fallback={<Loading />}>
            <ItemPageContent formattedItem={formattedItem} />
        </Suspense>
    );
}
