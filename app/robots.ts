import type { MetadataRoute } from "next";
import { companyInfo } from "@/lib/data";
import { hasConfiguredPublicSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const hasPublicSiteUrl = hasConfiguredPublicSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/mypage", "/login", "/signup", "/forgot-password", "/reset-password"],
      },
    ],
    host: hasPublicSiteUrl ? companyInfo.domain : undefined,
    sitemap: hasPublicSiteUrl ? `${companyInfo.domain}/sitemap.xml` : "/sitemap.xml",
  };
}
