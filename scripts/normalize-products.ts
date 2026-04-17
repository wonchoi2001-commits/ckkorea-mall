const fs = require("node:fs/promises");
const path = require("node:path");

type RawProductCandidate = {
  categoryMain: string;
  categorySub: string;
  referenceName: string;
  referenceSpec: string;
  referencePrice: number | null;
  shipping: "택배" | "화물배송" | "현장납품 문의" | "배송 문의";
  stockHint: number | null;
  brand: string;
  manufacturer: string;
  origin: string;
  unit: string;
  quoteRequired: boolean;
  bulkyItem: boolean;
  featuredCandidate: boolean;
  sourceSite: string;
  sourceUrl: string;
  overviewNote: string;
  featureNotes: string[];
  useCaseNotes: string[];
  cautionNote: string;
  searchKeywords: string[];
  imageUrl: string;
  sortOrder: number;
};

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
  detail_json: {
    overview: string;
    features: string[];
    useCases: string[];
    specGuide: string;
    shippingNotice: string;
  };
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
const docsDir = path.join(projectRoot, "docs");

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "");
}

function createShortDescription(item: RawProductCandidate) {
  const purchaseLine = item.referencePrice === null
    ? "물류 조건과 수량에 따라 견적 상담이 필요한 품목입니다."
    : `${item.referenceSpec} 기준으로 바로 비교하기 좋고 반복 구매에도 무난한 규격입니다.`;

  return `${item.categoryMain} 현장에서 자주 찾는 ${item.categorySub} 품목입니다. ${purchaseLine}`;
}

function createDescription(item: RawProductCandidate) {
  const shippingLine =
    item.shipping === "택배"
      ? "소량 주문은 택배 기준으로 빠르게 확인할 수 있습니다."
      : "장척물이나 중량물 성격이 있어 현장 납품 또는 화물 조건을 함께 확인하는 것이 좋습니다.";

  return `${item.overviewNote} ${item.referenceSpec} 규격 기준으로 검토하기 쉬운 구성으로 정리했으며, ${shippingLine}`;
}

function normalizeProduct(item: RawProductCandidate): NormalizedProduct {
  const name = item.referenceName.replace(/\s+/g, " ").trim();

  return {
    name,
    slug: makeSlug(name),
    price: item.referencePrice,
    spec: item.referenceSpec,
    shipping: item.shipping,
    stock: item.quoteRequired ? null : item.stockHint,
    description: createDescription(item),
    image_url: item.imageUrl,
    is_active: true,
    category: `${item.categoryMain} > ${item.categorySub}`,
    brand: item.brand,
    unit: item.unit,
    featured: item.featuredCandidate,
    category_main: item.categoryMain,
    category_sub: item.categorySub,
    manufacturer: item.manufacturer,
    origin: item.origin,
    options_json: {
      packageUnit: item.unit,
      shippingType: item.shipping,
    },
    detail_json: {
      overview: `${item.overviewNote} 우리몰에서는 현장 기준으로 다시 정리해 필요한 규격과 납품 방식을 빠르게 판단할 수 있도록 구성했습니다.`,
      features: item.featureNotes,
      useCases: item.useCaseNotes,
      specGuide: `${item.referenceSpec} / 판매단위 ${item.unit} 기준입니다. 실제 적용 전 현장 치수, 소요 수량, 부속 규격을 다시 확인해 주세요.`,
      shippingNotice: `${item.cautionNote} ${
        item.quoteRequired || item.bulkyItem
          ? "대량 주문이나 지역 납품은 운임과 하차 조건에 따라 별도 안내될 수 있습니다."
          : "재고 상황에 따라 출고 일정이 달라질 수 있습니다."
      }`,
    },
    short_description: createShortDescription(item),
    quote_required: item.quoteRequired,
    bulky_item: item.bulkyItem,
    source_site: item.sourceSite,
    source_url: item.sourceUrl,
    search_keywords: item.searchKeywords.join(", "),
    sort_order: item.sortOrder,
  };
}

async function main() {
  const rawPath = path.join(outputDir, "raw_products.json");
  const rawContent = JSON.parse(await fs.readFile(rawPath, "utf8")) as {
    meta: Record<string, unknown>;
    products: RawProductCandidate[];
  };

  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(docsDir, { recursive: true });

  const dedupedMap = new Map<string, NormalizedProduct>();

  rawContent.products.forEach((item) => {
    const normalized = normalizeProduct(item);
    dedupedMap.set(normalized.slug, normalized);
  });

  const normalizedProducts = Array.from(dedupedMap.values());
  const categoryCounts = normalizedProducts.reduce<Record<string, number>>((acc, product) => {
    acc[product.category_main] = (acc[product.category_main] || 0) + 1;
    return acc;
  }, {});

  const normalizedPayload = {
    meta: {
      generatedAt: new Date().toISOString(),
      source: "raw_products.json",
      totalCollected: rawContent.products.length,
      totalNormalized: normalizedProducts.length,
      categoryCounts,
      note: "실웹 자동수집 제한으로 공개 검색 기반 seed를 정제한 결과입니다.",
    },
    products: normalizedProducts,
  };

  await fs.writeFile(
    path.join(outputDir, "normalized_products.json"),
    JSON.stringify(normalizedPayload, null, 2),
    "utf8"
  );

  const summaryLines = [
    "# Product Content Summary",
    "",
    `- 총 수집 개수: ${rawContent.products.length}개`,
    `- 최종 반영 대상 개수: ${normalizedProducts.length}개`,
    "- 수집 방식: 실웹 자동수집 제한으로 공개 검색/상품 소개 페이지를 참고한 seed 기반 구성",
    "",
    "## 카테고리별 개수",
    ...Object.entries(categoryCounts).map(([category, count]) => `- ${category}: ${count}개`),
    "",
    "## 제외한 상품 이유",
    "- 중복 slug가 발생한 항목은 정규화 단계에서 병합했습니다.",
    "- 과도하게 정보가 모호한 품목은 이번 1차 리스트에 포함하지 않고 범용 규격 위주로 구성했습니다.",
    "",
    "## 수동 보완이 필요한 상품",
    "- 장척 목재, 골재, 대형 보드류는 지역/수량별 실운임 확인 후 실판매가를 다시 반영하는 것이 좋습니다.",
    "- 현재 대표 이미지는 카테고리 기반 SVG 비주얼을 사용하고 있으므로, 실판매 전에는 실물 이미지 교체를 권장합니다.",
    "- 단열재, 톤백 골재, 장척 배관류는 현장 하차 조건과 최소 주문 수량을 최종 검수해야 합니다.",
    "",
    "## 추천상품 선정 기준",
    "- 각 대분류에서 최소 1개 이상 보이도록 균형 있게 노출",
    "- 가격이 있거나 반복 구매 전환이 쉬운 품목 우선",
    "- 이미지, 규격, 설명이 명확한 항목 우선",
    "- 시멘트, 구조목, PVC 파이프, 해머드릴처럼 대표성이 높은 품목 우선",
  ];

  await fs.writeFile(
    path.join(docsDir, "product-content-summary.md"),
    summaryLines.join("\n"),
    "utf8"
  );

  console.log(`normalized_products.json 생성 완료: ${normalizedProducts.length}개`);
}

main().catch((error: unknown) => {
  console.error("normalize-products 실패:", error);
  process.exitCode = 1;
});

export {};
