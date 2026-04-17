import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

type NormalizedStage2Product = {
  name: string;
  slug: string;
  price: number | null;
  spec: string;
  shipping: string;
  stock: number | null;
  description: string;
  image_url: string;
  is_active: boolean;
  category: string;
  brand: string;
  unit: string;
  featured: boolean;
  category_main: string;
  category_sub: string;
  manufacturer: string;
  origin: string;
  options_json: Record<string, unknown>;
  detail_json: Record<string, unknown>;
  short_description: string;
  quote_required: boolean;
  bulky_item: boolean;
  source_site: string;
  source_url: string;
  search_keywords: string;
  sort_order: number;
  quality_score: number;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "scripts", "output");

function parseEnvFile(content: string) {
  const parsed: Record<string, string> = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalIndex = trimmed.indexOf("=");

    if (equalIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalIndex).trim();
    const rawValue = trimmed.slice(equalIndex + 1).trim();
    parsed[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }

  return parsed;
}

async function loadLocalEnv() {
  for (const relativePath of [".env.local", ".env"]) {
    try {
      const content = await fs.readFile(path.join(projectRoot, relativePath), "utf8");
      const values = parseEnvFile(content);

      Object.entries(values).forEach(([key, value]) => {
        if (!process.env[key]) {
          process.env[key] = value;
        }
      });
    } catch {
      // 환경 파일이 없으면 넘어갑니다.
    }
  }
}

function pickAvailableColumns(
  product: NormalizedStage2Product,
  availableColumns: Set<string>
) {
  const payload: Record<string, unknown> = {};

  Object.entries(product).forEach(([key, value]) => {
    if (availableColumns.has(key)) {
      payload[key] = value;
    }
  });

  return payload;
}

async function detectColumns(supabase: any) {
  const baseColumns = [
    "slug",
    "name",
    "price",
    "spec",
    "shipping",
    "stock",
    "description",
    "image_url",
    "is_active",
    "category",
    "brand",
    "unit",
    "featured",
  ];

  const optionalColumns = [
    "category_main",
    "category_sub",
    "manufacturer",
    "origin",
    "options_json",
    "detail_json",
    "short_description",
    "quote_required",
    "bulky_item",
    "source_site",
    "source_url",
    "search_keywords",
    "sort_order",
  ];

  const available = new Set(baseColumns);
  const unavailable: string[] = [];

  for (const column of optionalColumns) {
    const { error } = await supabase.from("products").select(`id, ${column}`).limit(1);

    if (error) {
      unavailable.push(column);
      continue;
    }

    available.add(column);
  }

  return { available, unavailable };
}

function buildPayload(product: NormalizedStage2Product, availableColumns: Set<string>) {
  const payload = pickAvailableColumns(product, availableColumns);

  if (payload.price === null || payload.price === undefined) {
    payload.price = 0;
  }

  if (payload.stock === null || payload.stock === undefined) {
    payload.stock = 0;
  }

  if (
    availableColumns.has("options_json") &&
    product.options_json &&
    typeof product.options_json === "object"
  ) {
    payload.options_json = {
      ...product.options_json,
      qualityScore: product.quality_score,
    };
  }

  return payload;
}

async function main() {
  await loadLocalEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase 환경변수가 부족합니다.");
  }

  const normalizedContent = JSON.parse(
    await fs.readFile(path.join(outputDir, "normalized_products_stage2.json"), "utf8")
  ) as {
    products: NormalizedStage2Product[];
    meta: { categoryCounts?: Record<string, number> };
    featuredProducts?: { name: string; slug: string }[];
  };

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { available, unavailable } = await detectColumns(supabase);
  const { data: existingRows, error: existingError } = await supabase
    .from("products")
    .select("id, slug");

  if (existingError) {
    throw new Error(`products 기존 조회 실패: ${existingError.message}`);
  }

  const existingMap = new Map<string, string>();
  (existingRows || []).forEach((row: { id: string; slug: string | null }) => {
    if (row.slug) {
      existingMap.set(String(row.slug).toLowerCase(), row.id);
    }
  });

  let inserted = 0;
  let updated = 0;
  const failed: { slug: string; message: string }[] = [];

  for (const product of normalizedContent.products) {
    const payload = buildPayload(product, available);
    const existingId = existingMap.get(product.slug.toLowerCase());

    if (existingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", existingId);

      if (error) {
        failed.push({ slug: product.slug, message: error.message });
        continue;
      }

      updated += 1;
      continue;
    }

    const { data, error } = await supabase
      .from("products")
      .insert([payload])
      .select("id, slug")
      .single();

    if (error) {
      failed.push({ slug: product.slug, message: error.message });
      continue;
    }

    inserted += 1;
    existingMap.set(product.slug.toLowerCase(), data.id);
  }

  const { count, error: countError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  if (countError) {
    throw new Error(`products 총 개수 조회 실패: ${countError.message}`);
  }

  const result = {
    importedAt: new Date().toISOString(),
    sourceFile: "normalized_products_stage2.json",
    totalInFile: normalizedContent.products.length,
    inserted,
    updated,
    failedCount: failed.length,
    failed,
    totalInDatabase: count ?? null,
    categoryCountsInFile: normalizedContent.meta.categoryCounts ?? {},
    featuredCandidates: normalizedContent.featuredProducts ?? [],
    availableColumns: Array.from(available),
    unavailableOptionalColumns: unavailable,
  };

  await fs.writeFile(
    path.join(outputDir, "import_result_stage2.json"),
    JSON.stringify(result, null, 2),
    "utf8"
  );

  console.log(
    `stage2 import 완료: insert ${inserted}개 / update ${updated}개 / 실패 ${failed.length}개 / DB 총 ${count ?? 0}개`
  );
}

main().catch((error: unknown) => {
  console.error("import-products-stage2 실패:", error);
  process.exitCode = 1;
});
