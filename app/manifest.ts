import type { MetadataRoute } from "next";
import pwaAssets from "@/lib/pwa-assets.generated.json";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Retrievo - Lost & Found",
    short_name: "Retrievo",
    description: "Find what you lost, return what you found.",
    start_url: "/items",
    display: "standalone",
    background_color: pwaAssets.background,
    theme_color: "#0C364B",
    icons: pwaAssets.icons as MetadataRoute.Manifest["icons"],
  };
}
