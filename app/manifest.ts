import type { MetadataRoute } from "next";
import { companyInfo } from "@/lib/data";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: companyInfo.companyName,
    short_name: "CKKOREA",
    description: companyInfo.metaDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    lang: "ko",
  };
}
