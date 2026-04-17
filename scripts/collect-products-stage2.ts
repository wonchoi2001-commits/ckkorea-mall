import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stage2CatalogSeeds } from "./lib/stage2-catalog-data";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "scripts", "output");

const categoryImageMap = {
  철물: "/images/catalog/hardware.svg",
  건재: "/images/catalog/construction-materials.svg",
  골재: "/images/catalog/aggregate.svg",
  목재: "/images/catalog/lumber.svg",
  "PVC배관 및 부속": "/images/catalog/pvc.svg",
  공구: "/images/catalog/tools.svg",
};

function createSourceUrl(query: string) {
  return `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(query)}`;
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const products = stage2CatalogSeeds.map((seed: typeof stage2CatalogSeeds[number], index: number) => ({
    ...seed,
    imageUrl:
      categoryImageMap[seed.categoryMain as keyof typeof categoryImageMap] ||
      "/images/product-placeholder.svg",
    sourceUrl: createSourceUrl(seed.sourceQuery),
    sortOrder: index + 1,
  }));

  const payload = {
    meta: {
      generatedAt: new Date().toISOString(),
      collectionMode: "stage2-public-reference-seed",
      note: "실웹 자동수집 제약으로 공개 검색 결과와 공개 상품 페이지를 참고한 stage2 seed 데이터입니다.",
      totalCollected: products.length,
      categoryCounts: products.reduce<Record<string, number>>((acc, product) => {
        acc[product.categoryMain] = (acc[product.categoryMain] || 0) + 1;
        return acc;
      }, {}),
      publicReferenceDomains: ["search.shopping.naver.com", "공개 쇼핑/자재몰 상품 페이지"],
    },
    products,
  };

  await fs.writeFile(
    path.join(outputDir, "raw_products_stage2.json"),
    JSON.stringify(payload, null, 2),
    "utf8"
  );

  console.log(`raw_products_stage2.json 생성 완료: ${products.length}개`);
}

main().catch((error: unknown) => {
  console.error("collect-products-stage2 실패:", error);
  process.exitCode = 1;
});
