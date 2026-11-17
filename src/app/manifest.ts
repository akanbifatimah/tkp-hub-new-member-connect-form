import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TKP New Members Connect",
    short_name: "TKP Connect",
    description: "Welcome to The King's Palace (RCCG), Katy, Texas. Tell us about yourself.",
    start_url: "/",
    display: "standalone",
    background_color: "#210e0a",
    theme_color: "#210e0a",
    icons: [{ src: "/tkp-logo.png", sizes: "520x576", type: "image/png" }],
  };
}
