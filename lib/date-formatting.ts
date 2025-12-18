import { Item } from "@/types/item";

// Helper function to format item data
export function formatDate(item: Item) {
    const formattedDate = new Date(item.date)
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-");

    return {
        ...item,
        date: formattedDate,
    };
}