import type { MetadataRoute } from "next";
import { companyInfo } from "@/lib/data";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${companyInfo.domain}/sitemap.xml`,
  };
}
