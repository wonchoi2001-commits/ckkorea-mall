import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

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

    parsed[trimmed.slice(0, equalIndex).trim()] = trimmed
      .slice(equalIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
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

async function main() {
  await loadLocalEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase 환경변수가 부족합니다.");
  }

  const candidateFiles = [
    "normalized_products_stage4.json",
    "normalized_products_stage2.json",
    "normalized_products.json",
  ];
  const productMap = new Map<
    string,
    { slug: string; name: string; featured: boolean; category_main: string; quality_score: number }
  >();

  for (const fileName of candidateFiles) {
    try {
      const content = JSON.parse(
        await fs.readFile(path.join(outputDir, fileName), "utf8")
      ) as {
        products: Array<{
          slug: string;
          name: string;
          featured: boolean;
          category_main: string;
          quality_score: number;
        }>;
      };

      content.products.forEach((product) => {
        const key = product.slug.toLowerCase();
        const existing = productMap.get(key);

        if (!existing || product.quality_score > existing.quality_score) {
          productMap.set(key, product);
        }
      });
    } catch {
      // 파일이 없으면 넘어갑니다.
    }
  }

  const featuredProducts = Array.from(productMap.values()).filter((product) => product.featured);
  const featuredSlugs = featuredProducts.map((product) => product.slug);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: resetError } = await supabase
    .from("products")
    .update({ featured: false })
    .neq("featured", false);

  if (resetError) {
    throw new Error(`추천상품 초기화 실패: ${resetError.message}`);
  }

  const chunkSize = 20;

  for (let index = 0; index < featuredSlugs.length; index += chunkSize) {
    const chunk = featuredSlugs.slice(index, index + chunkSize);
    const { error } = await supabase
      .from("products")
      .update({ featured: true })
      .in("slug", chunk);

    if (error) {
      throw new Error(`추천상품 반영 실패: ${error.message}`);
    }
  }

  const result = {
    refreshedAt: new Date().toISOString(),
    featuredCount: featuredProducts.length,
    featuredProducts,
    sourceFiles: candidateFiles,
  };

  await fs.writeFile(
    path.join(outputDir, "featured_result_stage2.json"),
    JSON.stringify(result, null, 2),
    "utf8"
  );

  await fs.writeFile(
    path.join(outputDir, "featured_result.json"),
    JSON.stringify(result, null, 2),
    "utf8"
  );

  console.log(`추천상품 refresh 완료: ${featuredProducts.length}개`);
}

main().catch((error: unknown) => {
  console.error("refresh-featured-products 실패:", error);
  process.exitCode = 1;
});
