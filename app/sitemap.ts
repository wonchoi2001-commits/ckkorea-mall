import type { MetadataRoute } from "next";
import { companyInfo } from "@/lib/data";
import { getCatalogProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: companyInfo.domain,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${companyInfo.domain}/products`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${companyInfo.domain}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${companyInfo.domain}/business-benefits`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${companyInfo.domain}/quote`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${companyInfo.domain}/shipping`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${companyInfo.domain}/returns`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${companyInfo.domain}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${companyInfo.domain}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const products = await getCatalogProducts({ skipNoStore: true });
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${companyInfo.domain}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: product.featured ? 0.8 : 0.7,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    console.error("SITEMAP PRODUCTS LOAD ERROR:", error);
    return staticRoutes;
  }
}
