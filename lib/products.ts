import { unstable_noStore as noStore } from "next/cache";
import { categories as defaultCategories } from "@/lib/data";
import type {
  Product,
  ProductBadgeTone,
  ProductDetailJson,
  ProductDetailSection,
  ProductRecord,
} from "@/lib/types";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { makeSlug, parseKeywordString } from "@/lib/utils";

const CATEGORY_PLACEHOLDER_MAP: Record<string, string> = {
  철물: "/images/catalog/hardware.svg",
  건재: "/images/catalog/construction-materials.svg",
  골재: "/images/catalog/aggregate.svg",
  목재: "/images/catalog/lumber.svg",
  "PVC 배관 및 부속": "/images/catalog/pvc.svg",
  "PVC배관 및 부속": "/images/catalog/pvc.svg",
  공구: "/images/catalog/tools.svg",
  전기자재: "/images/catalog/electrical.svg",
  안전용품: "/images/catalog/safety.svg",
  "접착제/실리콘": "/images/catalog/adhesives.svg",
  "소모품/부자재": "/images/catalog/consumables.svg",
};

const FALLBACK_PRODUCT_IMAGE = "/images/product-placeholder.svg";
const CATEGORY_ALIASES: Record<string, string> = {
  "PVC배관 및 부속": "PVC 배관 및 부속",
};

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCategoryName(value?: string | null) {
  const normalized = normalizeText(value);

  return CATEGORY_ALIASES[normalized] || normalized;
}

function normalizeStringArray(value?: string[] | null) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => item.trim()).filter(Boolean);
}

function parseOptionsJson(value?: ProductRecord["options_json"]) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  return value as Record<string, unknown>;
}

function getOptionNumber(options: Record<string, unknown> | null, key: string) {
  const value = options?.[key];

  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getOptionString(options: Record<string, unknown> | null, key: string) {
  const value = options?.[key];

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function getOptionStringArray(options: Record<string, unknown> | null, key: string) {
  const value = options?.[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function getBadgeTone(options: Record<string, unknown> | null) {
  const tone = getOptionString(options, "badgeTone");
  const allowedTones = new Set<ProductBadgeTone>([
    "slate",
    "blue",
    "emerald",
    "amber",
    "rose",
  ]);

  return tone && allowedTones.has(tone as ProductBadgeTone)
    ? (tone as ProductBadgeTone)
    : null;
}

function parseDetailJson(value?: ProductRecord["detail_json"]) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as ProductDetailJson;
    } catch {
      return null;
    }
  }

  return value as ProductDetailJson;
}

function getCategoryPlaceholder(categoryMain: string) {
  return CATEGORY_PLACEHOLDER_MAP[categoryMain] || FALLBACK_PRODUCT_IMAGE;
}

function buildDefaultDescription({
  name,
  spec,
  shipping,
  categoryMain,
}: {
  name: string;
  spec: string;
  shipping: string;
  categoryMain: string;
}) {
  return `${name} 상품입니다. ${spec} 규격 기준으로 현장과 매장 운영에 맞춰 확인하기 쉬운 ${categoryMain} 품목이며, 배송 방식은 ${shipping} 기준으로 안내합니다.`;
}

function buildDefaultTags({
  categoryMain,
  categorySub,
  spec,
  shipping,
}: {
  categoryMain: string;
  categorySub: string;
  spec: string;
  shipping: string;
}) {
  return [categoryMain, categorySub, spec, shipping]
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function buildDetailSections(record: ProductRecord, productLike: {
  name: string;
  spec: string;
  unit: string;
  shipping: string;
  price: number | null;
  categoryMain: string;
  categorySub?: string | null;
  bulkyItem: boolean;
  stockQuantity: number | null;
}) {
  const detail = parseDetailJson(record.detail_json);

  const overview =
    normalizeText(detail?.overview) ||
    normalizeText(record.description) ||
    buildDefaultDescription(productLike);

  const features = normalizeStringArray(detail?.features);
  const applications = normalizeStringArray(detail?.applications);
  const useCases = normalizeStringArray(detail?.useCases);

  const specGuide =
    normalizeText(detail?.specifications) ||
    normalizeText(detail?.specGuide) ||
    `${productLike.spec} 규격 기준이며 판매단위는 ${productLike.unit}입니다. 현장 적용 전 실제 치수와 수량 산출을 다시 확인해 주세요.`;

  const shippingNotice =
    normalizeText(detail?.shipping_notice) ||
    normalizeText(detail?.shippingNotice) ||
    `${
      productLike.bulkyItem ? "중량물 또는 장척물" : "일반 자재"
    } 특성상 ${productLike.shipping} 기준으로 출고되며, ${
      productLike.stockQuantity === 0
        ? "현재 품절 상태로 입고 일정 확인이 필요합니다."
        : "대량 주문 시 납기와 물류비가 달라질 수 있습니다."
    }`;

  const sections: ProductDetailSection[] = [
    {
      title: "제품 개요",
      content: overview,
    },
  ];

  if (features.length > 0) {
    sections.push({
      title: "주요 특징",
      bullets: features,
    });
  }

  if ((applications.length > 0 ? applications : useCases).length > 0) {
    sections.push({
      title: "사용 용도",
      bullets: applications.length > 0 ? applications : useCases,
    });
  }

  sections.push(
    {
      title: "규격 안내",
      content: specGuide,
    },
    {
      title: "배송 안내",
      content: shippingNotice,
    },
    {
      title: "주의사항",
      content:
        normalizeText(detail?.caution) ||
        "현장 적용 전 규격, 물류 조건, 사용 환경을 한 번 더 확인해 주세요.",
    }
  );

  return sections;
}

function getDerivedSearchKeywords({
  name,
  brand,
  manufacturer,
  spec,
  categoryMain,
  categorySub,
  description,
}: {
  name: string;
  brand: string;
  manufacturer: string;
  spec: string;
  categoryMain: string;
  categorySub: string;
  description: string;
}) {
  const tokens = [
    name,
    brand,
    manufacturer,
    spec,
    categoryMain,
    categorySub,
    description,
  ]
    .join(" ")
    .split(/[,\s/()x]+/i)
    .map((token) => token.trim().toLowerCase())
    .filter((token) => token.length >= 2);

  return Array.from(new Set(tokens));
}

function buildStockStatus({
  price,
  stockQuantity,
  quoteRequired,
}: {
  price: number | null;
  stockQuantity: number | null;
  quoteRequired: boolean;
}) {
  if (price === null || quoteRequired) {
    return "QUOTE" as const;
  }

  if (stockQuantity === 0) {
    return "SOLD_OUT" as const;
  }

  if (stockQuantity === null) {
    return "CHECK_STOCK" as const;
  }

  return "IN_STOCK" as const;
}

function calculateQualityScore({
  price,
  spec,
  image,
  categoryMain,
  categorySub,
  description,
  shipping,
  sourceUrl,
  searchKeywords,
}: {
  price: number | null;
  spec: string;
  image: string;
  categoryMain: string;
  categorySub: string;
  description: string;
  shipping: string;
  sourceUrl?: string | null;
  searchKeywords: string[];
}) {
  return (
    (image && image !== FALLBACK_PRODUCT_IMAGE ? 15 : 8) +
    (price !== null ? 20 : 10) +
    (spec && spec !== "규격 문의" ? 14 : 4) +
    (description.length >= 45 ? 18 : 8) +
    (categoryMain ? 10 : 0) +
    (categorySub ? 8 : 0) +
    (shipping ? 8 : 0) +
    (sourceUrl ? 10 : 0) +
    Math.min(searchKeywords.length, 8)
  );
}

function getProductScore(product: Product) {
  return (
    (product.featured ? 220 : 0) +
    (product.badge ? 30 : 0) +
    product.qualityScore * 3 +
    (product.price !== null ? 80 : 20) +
    (product.shortDesc ? 35 : 0) +
    (product.image !== FALLBACK_PRODUCT_IMAGE ? 20 : 0) +
    (product.tags.length > 0 ? 12 : 0) +
    (typeof product.stockQuantity === "number" && product.stockQuantity > 0 ? 20 : 0) -
    product.sortOrder
  );
}

function pickBalancedProducts(products: Product[], limit: number) {
  const grouped = new Map<string, Product[]>();

  products.forEach((product) => {
    const key = product.categoryMain || product.category;
    const bucket = grouped.get(key) ?? [];
    bucket.push(product);
    grouped.set(key, bucket);
  });

  grouped.forEach((bucket) => {
    bucket.sort((left, right) => getProductScore(right) - getProductScore(left));
  });

  const selected: Product[] = [];
  const used = new Set<string>();

  for (const bucket of grouped.values()) {
    const next = bucket.find((product) => !used.has(product.id));

    if (next) {
      selected.push(next);
      used.add(next.id);
    }

    if (selected.length >= limit) {
      return selected.slice(0, limit);
    }
  }

  const remainder = products
    .filter((product) => !used.has(product.id))
    .sort((left, right) => getProductScore(right) - getProductScore(left));

  return [...selected, ...remainder].slice(0, limit);
}

export function normalizeProductSlug(value: string) {
  return safeDecodeURIComponent(value).trim().toLowerCase();
}

export function getProductSlugVariants(value: string) {
  const decoded = safeDecodeURIComponent(value);
  const normalizedDecoded = normalizeProductSlug(decoded);
  const normalizedRaw = normalizeProductSlug(value);

  return Array.from(new Set([value.trim(), decoded.trim(), normalizedDecoded, normalizedRaw]));
}

export function mapProductRecordToProduct(product: ProductRecord): Product {
  const options = parseOptionsJson(product.options_json);
  const rawPrice = typeof product.price === "number" ? product.price : null;
  const price = rawPrice !== null && rawPrice > 0 ? rawPrice : null;
  const salePrice = getOptionNumber(options, "salePrice");
  let stockQuantity = typeof product.stock === "number" ? product.stock : null;
  const legacyCategory = normalizeText(product.category);
  const [legacyCategoryMain, legacyCategorySub] = legacyCategory
    .split(">")
    .map((item) => item.trim())
    .filter(Boolean);
  const categoryMain =
    normalizeCategoryName(product.category_main) ||
    normalizeCategoryName(legacyCategoryMain) ||
    normalizeCategoryName(legacyCategory) ||
    "기타";
  const categorySub =
    normalizeText(product.category_sub) ||
    legacyCategorySub ||
    (legacyCategoryMain ? legacyCategorySub || legacyCategoryMain : legacyCategory) ||
    categoryMain;
  const shortDescription =
    normalizeText(product.short_description) ||
    normalizeText(product.description) ||
    "상품 설명 준비 중입니다.";
  const description =
    normalizeText(product.description) ||
    shortDescription ||
    buildDefaultDescription({
      name: product.name,
      spec: normalizeText(product.spec) || "규격 문의",
      shipping: normalizeText(product.shipping) || "배송 문의",
      categoryMain,
    });
  const bulkyItem = product.bulky_item === true;
  const isQuoteOnly = price === null;
  const badge = getOptionString(options, "badge");
  const badgeTone = getBadgeTone(options);
  const tags = Array.from(
    new Set([
      ...getOptionStringArray(options, "tags"),
      ...buildDefaultTags({
        categoryMain,
        categorySub,
        spec: normalizeText(product.spec) || "규격 문의",
        shipping: normalizeText(product.shipping) || "배송 문의",
      }),
    ])
  );
  const minimumOrderQuantity = Math.max(getOptionNumber(options, "minimumOrderQuantity") ?? 1, 1);
  const quoteRequired = product.quote_required === true || price === null;
  const metaTitle = getOptionString(options, "metaTitle");
  const metaDescription = getOptionString(options, "metaDescription");

  if (isQuoteOnly && stockQuantity === 0) {
    stockQuantity = null;
  }

  const stockLabel =
    isQuoteOnly
      ? bulkyItem
        ? "물류/재고 문의"
        : "견적 문의"
      : stockQuantity === null
      ? bulkyItem
        ? "물류 조건 문의"
        : "재고 문의"
      : stockQuantity > 0
        ? `재고 ${stockQuantity}개`
        : "품절";

  const normalizedProduct: Product = {
    id: String(product.id),
    slug: safeDecodeURIComponent(normalizeText(product.slug) || makeSlug(product.name)),
    name: product.name,
    category: categorySub,
    categoryMain,
    categorySub,
    brand: normalizeText(product.brand) || "CK KOREA",
    manufacturer: normalizeText(product.manufacturer) || null,
    origin: normalizeText(product.origin) || null,
    spec: normalizeText(product.spec) || "규격 문의",
    unit: normalizeText(product.unit) || "1개",
    price,
    salePrice,
    type: price === null ? "견적문의" : "즉시결제",
    shipping: (normalizeText(product.shipping) || "배송 문의") as Product["shipping"],
    stock: stockLabel,
    stockStatus: buildStockStatus({
      price,
      stockQuantity,
      quoteRequired,
    }),
    stockQuantity,
    desc: shortDescription,
    shortDesc: shortDescription,
    description,
    image:
      normalizeText(product.image_url) ||
      getCategoryPlaceholder(categoryMain) ||
      FALLBACK_PRODUCT_IMAGE,
    featured: product.featured === true,
    badge,
    badgeTone,
    tags,
    quoteRequired,
    bulkyItem,
    minimumOrderQuantity,
    searchKeywords: [],
    qualityScore: 0,
    sortOrder: typeof product.sort_order === "number" ? product.sort_order : 999,
    detailSections: [],
    sourceSite: normalizeText(product.source_site) || null,
    sourceUrl: normalizeText(product.source_url) || null,
    metaTitle,
    metaDescription,
    isActive: product.is_active !== false,
    createdAt: product.created_at ?? null,
  };

  normalizedProduct.searchKeywords = Array.from(
    new Set([
      ...parseKeywordString(product.search_keywords),
      ...getDerivedSearchKeywords({
        name: normalizedProduct.name,
        brand: normalizedProduct.brand,
        manufacturer: normalizedProduct.manufacturer || "",
        spec: normalizedProduct.spec,
        categoryMain,
        categorySub,
        description,
      }),
    ])
  );

  normalizedProduct.qualityScore =
    typeof options?.qualityScore === "number"
      ? options.qualityScore
      : calculateQualityScore({
          price: normalizedProduct.price,
          spec: normalizedProduct.spec,
          image: normalizedProduct.image,
          categoryMain,
          categorySub,
          description,
          shipping: normalizedProduct.shipping,
          sourceUrl: normalizedProduct.sourceUrl,
          searchKeywords: normalizedProduct.searchKeywords,
        });

  normalizedProduct.detailSections = buildDetailSections(product, {
    name: normalizedProduct.name,
    spec: normalizedProduct.spec,
    unit: normalizedProduct.unit,
    shipping: normalizedProduct.shipping,
    price: normalizedProduct.price,
    categoryMain,
    categorySub,
    bulkyItem,
    stockQuantity,
  });

  return normalizedProduct;
}

type GetProductRecordOptions = {
  includeInactive?: boolean;
  onlyFeatured?: boolean;
  category?: string;
  skipNoStore?: boolean;
  includeDeleted?: boolean;
};

function isSoftDeletedProduct(product: ProductRecord) {
  if (product.deleted_at) {
    return true;
  }

  const options = parseOptionsJson(product.options_json);
  const deletedAt = options?.deletedAt;

  return typeof deletedAt === "string" && deletedAt.trim().length > 0;
}

export async function getProductRecords(options?: GetProductRecordOptions) {
  if (!options?.skipNoStore) {
    noStore();
  }

  try {
    const supabase = createAdminSupabaseClient();
    let query = supabase.from("products").select("*");

    if (!options?.includeInactive) {
      query = query.neq("is_active", false);
    }

    if (options?.onlyFeatured) {
      query = query.eq("featured", true);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("PRODUCTS LOAD ERROR:", error);
      return [];
    }

    const records = (data ?? []) as ProductRecord[];

    if (options?.includeDeleted) {
      return records;
    }

    return records.filter((product) => !isSoftDeletedProduct(product));
  } catch (error) {
    console.error("PRODUCTS LOAD ERROR:", error);
    return [];
  }
}

export async function getCatalogProducts(options?: GetProductRecordOptions) {
  const records = await getProductRecords(options);

  return records.map(mapProductRecordToProduct);
}

export async function getFeaturedProducts(limit = 6) {
  const products = await getCatalogProducts();
  const featuredProducts = products.filter((product) => product.featured);

  if (featuredProducts.length > 0) {
    const featuredSelected = pickBalancedProducts(featuredProducts, limit);

    if (featuredSelected.length >= limit) {
      return featuredSelected;
    }

    const remainder = pickBalancedProducts(
      products.filter((product) => !featuredSelected.some((item) => item.id === product.id)),
      limit - featuredSelected.length
    );

    return [...featuredSelected, ...remainder].slice(0, limit);
  }

  const representativePool = products.filter(
    (product) =>
      product.isActive &&
      product.qualityScore >= 70 &&
      product.shortDesc &&
      product.image &&
      product.stockQuantity !== 0
  );

  return pickBalancedProducts(representativePool, limit);
}

export async function getCatalogProductBySlug(slug: string) {
  noStore();

  const products = await getCatalogProducts();
  const slugVariants = getProductSlugVariants(slug);

  return (
    products.find((product) =>
      slugVariants.includes(product.slug) ||
      slugVariants.includes(normalizeProductSlug(product.slug))
    ) ?? null
  );
}

export async function getProductRecordById(
  productId: string,
  options?: Pick<GetProductRecordOptions, "includeInactive" | "includeDeleted" | "skipNoStore">
) {
  const products = await getProductRecords(options);

  return products.find((product) => String(product.id) === String(productId)) ?? null;
}

export async function getRelatedProducts(baseProduct: Product, limit = 4) {
  const products = await getCatalogProducts();

  return products
    .filter((product) => product.id !== baseProduct.id)
    .sort((left, right) => {
      const leftKeywordOverlap = left.searchKeywords.filter((keyword) =>
        baseProduct.searchKeywords.includes(keyword)
      ).length;
      const rightKeywordOverlap = right.searchKeywords.filter((keyword) =>
        baseProduct.searchKeywords.includes(keyword)
      ).length;
      const leftTagOverlap = left.tags.filter((tag) => baseProduct.tags.includes(tag)).length;
      const rightTagOverlap = right.tags.filter((tag) => baseProduct.tags.includes(tag)).length;
      const leftScore =
        Number(left.categoryMain === baseProduct.categoryMain) * 3 +
        Number(left.categorySub === baseProduct.categorySub) * 2 +
        Number(left.shipping === baseProduct.shipping) +
        Number(left.price !== null) +
        Number(left.featured) +
        leftKeywordOverlap +
        leftTagOverlap * 2 +
        Math.round(left.qualityScore / 20);
      const rightScore =
        Number(right.categoryMain === baseProduct.categoryMain) * 3 +
        Number(right.categorySub === baseProduct.categorySub) * 2 +
        Number(right.shipping === baseProduct.shipping) +
        Number(right.price !== null) +
        Number(right.featured) +
        rightKeywordOverlap +
        rightTagOverlap * 2 +
        Math.round(right.qualityScore / 20);

      return rightScore - leftScore;
    })
    .slice(0, limit);
}

export async function getCatalogCategories() {
  const products = await getCatalogProducts();
  const categorySet = new Set<string>(defaultCategories);

  products.forEach((product) => {
    if (product.categoryMain) {
      categorySet.add(product.categoryMain);
    }
  });

  return Array.from(categorySet);
}

export async function getNewestProducts(limit = 8) {
  const products = await getCatalogProducts();

  return [...products]
    .sort((left, right) => {
      const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;

      return rightTime - leftTime;
    })
    .slice(0, limit);
}

export async function getPopularProducts(limit = 8) {
  const products = await getCatalogProducts();
  const pool = products.filter((product) => product.isActive);

  return pickBalancedProducts(
    [...pool].sort((left, right) => {
      const leftScore =
        getProductScore(left) +
        Number(left.badge === "인기") * 80 +
        Number(left.price !== null) * 16 +
        Number(left.quoteRequired === false) * 12;
      const rightScore =
        getProductScore(right) +
        Number(right.badge === "인기") * 80 +
        Number(right.price !== null) * 16 +
        Number(right.quoteRequired === false) * 12;

      return rightScore - leftScore;
    }),
    limit
  );
}
