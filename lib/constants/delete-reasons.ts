export type DeleteCloseReason = "returned_offline" | "found_it_myself" | "decluttering";

export const delete_reasons_map: { value: DeleteCloseReason; label: string }[] = [
    { value: "returned_offline", label: "Returned offline" },
    { value: "found_it_myself", label: "Found it myself" },
    { value: "decluttering", label: "Just decluttering" },
];
