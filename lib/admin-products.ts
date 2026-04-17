import { createAdminSupabaseClient } from "@/lib/supabase/server";
import type { ProductRecord } from "@/lib/types";
import { makeSlug, parseKeywordString } from "@/lib/utils";

type BuildProductPayloadOptions = {
  isCreate?: boolean;
  existingProduct?: ProductRecord | null;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNullableText(value: unknown) {
  const text = normalizeText(value);

  return text || null;
}

function normalizeNonNegativeInteger(value: unknown, label: string) {
  if (value === null || value === undefined || value === "") {
    return { value: null, error: null };
  }

  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue < 0) {
    return {
      value: null,
      error: `${label}은 0 이상의 정수만 입력할 수 있습니다.`,
    };
  }

  return { value: numericValue, error: null };
}

function normalizeBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value === "true";
  }

  return fallback;
}

function mergeOptionsJson(
  existingValue: ProductRecord["options_json"],
  nextValues: Record<string, unknown>
) {
  const base =
    existingValue && typeof existingValue === "object" && !Array.isArray(existingValue)
      ? { ...existingValue }
      : {};

  return {
    ...base,
    ...nextValues,
  };
}

export async function buildUniqueProductSlug(seed: string, excludeId?: string | number) {
  const baseSlug = makeSlug(seed) || `product-${Date.now()}`;
  const supabase = createAdminSupabaseClient();
  let query = supabase
    .from("products")
    .select("id, slug")
    .ilike("slug", `${baseSlug}%`);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const existingSlugs = new Set((data ?? []).map((item) => item.slug).filter(Boolean));

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (existingSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

export async function buildAdminProductPayload(
  body: Record<string, unknown>,
  options?: BuildProductPayloadOptions
) {
  const isCreate = options?.isCreate === true;
  const existingProduct = options?.existingProduct ?? null;
  const payload: Record<string, unknown> = {};

  const name = normalizeText(body.name);
  if (isCreate || "name" in body) {
    if (!name) {
      return { error: "상품명은 필수입니다." };
    }
    payload.name = name;
  }

  const requestedSlug = normalizeText(body.slug);
  if (isCreate || "slug" in body || "name" in body) {
    payload.slug = await buildUniqueProductSlug(
      requestedSlug || name || existingProduct?.name || existingProduct?.slug || "",
      existingProduct?.id
    );
  }

  const categoryMain = normalizeNullableText(body.category_main ?? body.category);
  const categorySub = normalizeNullableText(body.category_sub);

  if (isCreate || "category_main" in body || "category" in body) {
    payload.category_main = categoryMain;
  }
  if (isCreate || "category_sub" in body) {
    payload.category_sub = categorySub;
  }
  if (isCreate || "category_main" in body || "category_sub" in body || "category" in body) {
    payload.category = [categoryMain, categorySub].filter(Boolean).join(" > ") || categoryMain;
  }

  const priceResult = normalizeNonNegativeInteger(body.price, "가격");
  if (priceResult.error) {
    return { error: priceResult.error };
  }
  if (isCreate || "price" in body) {
    payload.price = priceResult.value;
  }

  const stockResult = normalizeNonNegativeInteger(body.stock, "재고");
  if (stockResult.error) {
    return { error: stockResult.error };
  }
  if (isCreate || "stock" in body) {
    payload.stock = stockResult.value;
  }

  const textFields = [
    "spec",
    "shipping",
    "description",
    "short_description",
    "brand",
    "manufacturer",
    "origin",
    "unit",
    "image_url",
    "source_site",
    "source_url",
  ] as const;

  for (const field of textFields) {
    if (isCreate || field in body) {
      payload[field] = normalizeNullableText(body[field]);
    }
  }

  if (isCreate || "featured" in body) {
    payload.featured = normalizeBoolean(body.featured, existingProduct?.featured === true);
  }
  if (isCreate || "quote_required" in body) {
    payload.quote_required = normalizeBoolean(
      body.quote_required,
      existingProduct?.quote_required === true
    );
  }
  if (isCreate || "is_active" in body) {
    payload.is_active = normalizeBoolean(body.is_active, existingProduct?.is_active !== false);
  }
  if (isCreate || "bulky_item" in body) {
    payload.bulky_item = normalizeBoolean(body.bulky_item, existingProduct?.bulky_item === true);
  }

  if (isCreate || "search_keywords" in body) {
    const keywords = Array.isArray(body.search_keywords)
      ? body.search_keywords
      : parseKeywordString(
          typeof body.search_keywords === "string" ? body.search_keywords : null
        );
    payload.search_keywords = keywords.join(", ");
  }

  if (isCreate || "sort_order" in body) {
    const sortOrderResult = normalizeNonNegativeInteger(body.sort_order, "정렬 순서");
    if (sortOrderResult.error) {
      return { error: sortOrderResult.error };
    }
    payload.sort_order = sortOrderResult.value;
  }

  const quoteOnly =
    normalizeBoolean(body.quote_only, false) ||
    payload.price === null ||
    (isCreate && priceResult.value === null);

  if (quoteOnly) {
    payload.price = null;
    payload.quote_required = true;
  }

  if (!payload.short_description && payload.description) {
    const description = String(payload.description);
    payload.short_description =
      description.length > 120 ? `${description.slice(0, 117)}...` : description;
  }

  if (existingProduct) {
    payload.options_json = mergeOptionsJson(existingProduct.options_json, {
      deletedAt: null,
      deletedBy: null,
    });
  }

  return { payload };
}

export async function softDeleteProduct(product: ProductRecord, adminEmail?: string | null) {
  const supabase = createAdminSupabaseClient();
  const nextOptions = mergeOptionsJson(product.options_json, {
    deletedAt: new Date().toISOString(),
    deletedBy: adminEmail || null,
  });

  const { data, error } = await supabase
    .from("products")
    .update({
      is_active: false,
      featured: false,
      options_json: nextOptions,
    })
    .eq("id", product.id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as ProductRecord;
}
