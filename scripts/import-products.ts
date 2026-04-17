const fs = require("node:fs/promises");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");

type NormalizedProduct = {
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
};

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
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    parsed[key] = value;
  }

  return parsed;
}

async function loadLocalEnv() {
  const envPaths = [".env.local", ".env"];

  for (const relativePath of envPaths) {
    const fullPath = path.join(projectRoot, relativePath);

    try {
      const content = await fs.readFile(fullPath, "utf8");
      const values = parseEnvFile(content);
      Object.entries(values).forEach(([key, value]) => {
        if (!process.env[key]) {
          process.env[key] = value;
        }
      });
    } catch {
      // 파일이 없으면 그대로 진행합니다.
    }
  }
}

function pickAvailableColumns(
  product: NormalizedProduct,
  availableColumns: Set<string>
) {
  const next: Record<string, unknown> = {};

  Object.entries(product).forEach(([key, value]) => {
    if (availableColumns.has(key)) {
      next[key] = value;
    }
  });

  return next;
}

function buildImportPayload(
  product: NormalizedProduct,
  availableColumns: Set<string>
) {
  const payload = pickAvailableColumns(product, availableColumns);
  const usingLegacyQuoteFallback = !availableColumns.has("quote_required");

  if (usingLegacyQuoteFallback && product.quote_required) {
    payload.price = 0;
    payload.stock = 0;
    return payload;
  }

  if (payload.price === null || payload.price === undefined) {
    payload.price = 0;
  }

  if (payload.stock === null || payload.stock === undefined) {
    payload.stock = 0;
  }

  return payload;
}

async function detectOptionalColumns(supabase: any) {
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

async function main() {
  await loadLocalEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase 환경변수가 부족합니다. NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY를 확인하세요.");
  }

  const normalizedPath = path.join(outputDir, "normalized_products.json");
  const normalizedContent = JSON.parse(await fs.readFile(normalizedPath, "utf8")) as {
    meta: Record<string, unknown>;
    products: NormalizedProduct[];
  };

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { available, unavailable } = await detectOptionalColumns(supabase);
  const { data: existingRows, error: existingError } = await supabase
    .from("products")
    .select("id, slug");

  if (existingError) {
    throw new Error(`기존 products 조회 실패: ${existingError.message}`);
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
    const payload = buildImportPayload(product, available);
    const existingId = existingMap.get(product.slug.toLowerCase());

    if (existingId) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", existingId);

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
    sourceFile: "normalized_products.json",
    totalInFile: normalizedContent.products.length,
    inserted,
    updated,
    failedCount: failed.length,
    failed,
    totalInDatabase: count ?? null,
    availableColumns: Array.from(available),
    unavailableOptionalColumns: unavailable,
    note:
      unavailable.length > 0
        ? "일부 확장 컬럼이 없어 기본 컬럼 위주로 import했습니다. 상세 메타데이터는 normalized_products.json에도 보관됩니다."
        : "확장 컬럼까지 포함해 import를 완료했습니다.",
  };

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, "import_result.json"),
    JSON.stringify(result, null, 2),
    "utf8"
  );

  console.log(
    `import 완료: insert ${inserted}개 / update ${updated}개 / 실패 ${failed.length}개 / DB 총 ${count ?? 0}개`
  );
}

main().catch((error: unknown) => {
  console.error("import-products 실패:", error);
  process.exitCode = 1;
});

export {};
