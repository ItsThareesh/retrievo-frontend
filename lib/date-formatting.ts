import { Item } from "@/types/item";

// Format a date string to "DD-MM-YYYY" in UTC timezone
export function formatDateString(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-GB").replace(/\//g, "-");
}

// Helper function to format item data
export function standardizeItemDate(item: Item) {
    return {
        ...item,
        date: formatDateString(item.date),
    };
}