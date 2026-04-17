import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type RawStage2Product = {
  categoryMain: string;
  categorySub: string;
  title: string;
  spec: string;
  price: number | null;
  shipping: string;
  stockHint: number | null;
  brand: string;
  manufacturer: string;
  origin: string;
  unit: string;
  quoteRequired: boolean;
  bulkyItem: boolean;
  featuredCandidate: boolean;
  sourceSite: string;
  sourceQuery: string;
  sourceUrl: string;
  searchKeywords: string[];
  applications: string[];
  caution?: string;
  imageUrl: string;
  sortOrder: number;
  collectionMode: string;
};

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

type ExcludedEntry = {
  name: string;
  reason: string;
  categoryMain: string;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "scripts", "output");
const docsDir = path.join(projectRoot, "docs");

const categoryToneMap: Record<
  string,
  {
    focus: string;
    directPurchaseLine: string;
    quoteLine: string;
    caution: string;
  }
> = {
  철물: {
    focus: "체결, 고정, 보강 작업에서 기본적으로 검토하는 철물류",
    directPurchaseLine: "반복 구매와 현장 비축에 맞춰 바로 비교하기 쉬운 품목입니다.",
    quoteLine: "하중 조건이나 대량 수량에 따라 별도 확인이 필요한 품목입니다.",
    caution: "피착재 상태와 허용 하중을 확인한 뒤 시공에 사용해 주세요.",
  },
  건재: {
    focus: "시공, 마감, 보수 공정에서 자주 찾는 건재류",
    directPurchaseLine: "현장 소모와 유지보수에 맞춰 발주하기 쉬운 기준으로 정리했습니다.",
    quoteLine: "수량, 납기, 현장 반입 조건에 따라 견적 확인이 필요한 품목입니다.",
    caution: "바탕면 상태와 작업 순서를 먼저 확인하고 적정 사용량을 맞춰 주세요.",
  },
  골재: {
    focus: "충진, 배수, 미장, 조경 공정에서 자주 쓰는 골재류",
    directPurchaseLine: "소포장 기준으로 소규모 현장과 보수 작업에 활용하기 좋습니다.",
    quoteLine: "중량과 납품 거리 영향이 커 현장 조건에 따른 견적 확인이 중요합니다.",
    caution: "중량물 특성상 반입 동선과 하차 장비 조건을 함께 확인해 주세요.",
  },
  목재: {
    focus: "구조, 마감, 데크, 인테리어 작업에 쓰는 목재류",
    directPurchaseLine: "규격 비교와 수량 산정이 쉬운 기준으로 정리했습니다.",
    quoteLine: "장척물과 판재류는 현장 납품과 절단 조건에 따라 상담이 필요한 품목입니다.",
    caution: "함수율, 휨, 절단 조건을 시공 전에 다시 확인해 주세요.",
  },
  "PVC배관 및 부속": {
    focus: "배수, 급수, 연결 공정에 필요한 PVC 배관 및 부속류",
    directPurchaseLine: "반복 보수와 부속 교체에 바로 대응하기 쉬운 품목입니다.",
    quoteLine: "장척 배관과 현장 물류 조건에 따라 견적 상담이 필요한 품목입니다.",
    caution: "구경과 연결 부속 호환 여부를 먼저 확인해 주세요.",
  },
  공구: {
    focus: "시공, 절단, 체결, 가공 작업에 필요한 공구류",
    directPurchaseLine: "현장 작업성과 유지보수를 고려해 바로구매 기준으로 정리했습니다.",
    quoteLine: "장비 구성이나 납기 조건에 따라 상담이 필요한 품목입니다.",
    caution: "사용 전 안전장비와 공구 규격 호환 여부를 확인해 주세요.",
  },
};

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "");
}

function normalizeNameKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, "");
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9가-힣]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function getJaccardSimilarity(left: string, right: string) {
  const leftTokens = new Set(tokenize(left));
  const rightTokens = new Set(tokenize(right));

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let intersection = 0;

  leftTokens.forEach((token) => {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  });

  const union = new Set([...leftTokens, ...rightTokens]).size;

  return union === 0 ? 0 : intersection / union;
}

function buildOverview(product: RawStage2Product) {
  const tone = categoryToneMap[product.categoryMain];

  return `${product.title}은 ${tone.focus}로, ${product.spec || "규격 확인이 필요한"} 기준에 맞춰 발주와 비교가 쉬운 형태로 정리한 상품입니다. ${
    product.quoteRequired ? tone.quoteLine : tone.directPurchaseLine
  }`;
}

function buildFeatureBullets(product: RawStage2Product) {
  return [
    `${product.categorySub} 품목 기준으로 규격과 판매단위를 한눈에 확인하기 쉽습니다.`,
    product.price === null
      ? "가격 변동성과 물류 조건을 고려해 상담형 품목으로 분류했습니다."
      : "반복 구매와 현장 소모에 맞춰 가격 비교가 쉬운 기준으로 정리했습니다.",
    product.bulkyItem
      ? "중량물 또는 장척물 성격을 고려해 납품 조건 확인이 중요합니다."
      : "소량 보충이나 자재점 재고 운영에도 무난하게 대응할 수 있습니다.",
  ];
}

function buildApplications(product: RawStage2Product) {
  if (product.applications.length > 0) {
    return product.applications;
  }

  return [`${product.categorySub} 관련 현장 작업`, `${product.categoryMain} 유지보수`, "반복 발주 품목 관리"];
}

function buildQualityScore(product: RawStage2Product) {
  return (
    (product.imageUrl ? 15 : 0) +
    (product.price !== null ? 18 : 8) +
    (product.spec ? 14 : 0) +
    (product.categoryMain ? 10 : 0) +
    (product.categorySub ? 8 : 0) +
    (product.shipping ? 8 : 0) +
    (product.sourceUrl ? 10 : 0) +
    Math.min(product.searchKeywords.length * 2, 16) +
    (product.applications.length >= 2 ? 8 : 0) +
    (product.quoteRequired && product.price === null ? 6 : 0) +
    (product.bulkyItem && product.shipping !== "택배" ? 4 : 0)
  );
}

function buildShortDescription(product: RawStage2Product) {
  const tone = categoryToneMap[product.categoryMain];
  const actionLine =
    product.price === null
      ? "수량과 물류 조건에 따라 견적 상담이 필요한 품목입니다."
      : `${product.spec} 기준으로 바로 비교하기 좋고 재발주에도 무난한 품목입니다.`;

  return `${product.categoryMain} 현장에서 자주 찾는 ${product.categorySub} 상품입니다. ${actionLine} ${tone.directPurchaseLine}`;
}

function buildDescription(product: RawStage2Product) {
  return `${buildOverview(product)} ${product.spec ? `${product.spec} 규격 기준으로 검토할 수 있으며,` : ""} 배송 방식은 ${product.shipping} 기준으로 안내합니다.`;
}

function buildNormalizedProduct(product: RawStage2Product): NormalizedStage2Product {
  const qualityScore = buildQualityScore(product);

  return {
    name: product.title,
    slug: makeSlug(product.title),
    price: product.price,
    spec: product.spec,
    shipping: product.shipping,
    stock: product.quoteRequired ? null : product.stockHint,
    description: buildDescription(product),
    image_url: product.imageUrl || "/images/product-placeholder.svg",
    is_active: true,
    category: `${product.categoryMain} > ${product.categorySub}`,
    brand: product.brand,
    unit: product.unit,
    featured: product.featuredCandidate,
    category_main: product.categoryMain,
    category_sub: product.categorySub,
    manufacturer: product.manufacturer,
    origin: product.origin,
    options_json: {
      packageUnit: product.unit,
      shippingType: product.shipping,
      qualityScore,
      collectionMode: product.collectionMode,
      priceKnown: product.price !== null,
    },
    detail_json: {
      overview: buildOverview(product),
      features: buildFeatureBullets(product),
      applications: buildApplications(product),
      specifications: `${product.spec || "규격 문의"} / 판매단위 ${product.unit} 기준입니다. 실제 적용 전 치수, 수량, 부속 호환 여부를 다시 확인해 주세요.`,
      shipping_notice: `${
        product.bulkyItem ? "중량물 또는 장척물" : "일반 택배 가능 품목"
      } 기준으로 ${product.shipping} 안내를 우선 적용하며, 대량 주문 시 납품 일정과 운임이 달라질 수 있습니다.`,
      caution: product.caution || categoryToneMap[product.categoryMain].caution,
    },
    short_description: buildShortDescription(product),
    quote_required: product.quoteRequired,
    bulky_item: product.bulkyItem,
    source_site: product.sourceSite,
    source_url: product.sourceUrl,
    search_keywords: Array.from(new Set(product.searchKeywords)).join(", "),
    sort_order: product.sortOrder,
    quality_score: qualityScore,
  };
}

function dedupeProducts(products: NormalizedStage2Product[]) {
  const selected = new Map<string, NormalizedStage2Product>();
  const selectedBySource = new Map<string, NormalizedStage2Product>();
  const excluded: ExcludedEntry[] = [];

  for (const product of products) {
    const collectionMode =
      typeof product.options_json.collectionMode === "string"
        ? product.options_json.collectionMode
        : "";

    if (collectionMode === "stage2-low-quality-seed" || !product.spec.trim()) {
      excluded.push({
        name: product.name,
        reason: "정보 부족으로 제외",
        categoryMain: product.category_main,
      });
      continue;
    }

    if (product.quality_score < 60) {
      excluded.push({
        name: product.name,
        reason: "품질 점수 부족",
        categoryMain: product.category_main,
      });
      continue;
    }

    const sourceKey = product.source_url.trim().toLowerCase();
    const slugKey = product.slug.toLowerCase();
    const normalizedNameKey =
      `${product.category_main}|${product.category_sub}|${normalizeNameKey(product.name)}|${normalizeNameKey(product.spec)}`;

    const sourceDuplicate = selectedBySource.get(sourceKey);
    const slugDuplicate = selected.get(slugKey);
    const normalizedNameDuplicate = selected.get(normalizedNameKey);

    const duplicate = sourceDuplicate || slugDuplicate || normalizedNameDuplicate;

    if (duplicate) {
      const keepCurrent = product.quality_score > duplicate.quality_score;
      const winner = keepCurrent ? product : duplicate;
      const loser = keepCurrent ? duplicate : product;

      if (keepCurrent) {
        selected.set(slugKey, winner);
        selected.set(normalizedNameKey, winner);
        selectedBySource.set(sourceKey, winner);
      }

      excluded.push({
        name: loser.name,
        reason: "중복 제거",
        categoryMain: loser.category_main,
      });
      continue;
    }

    let similarDuplicate: NormalizedStage2Product | null = null;

    for (const existing of selected.values()) {
      if (
        existing.category_main === product.category_main &&
        existing.category_sub === product.category_sub &&
        existing.spec === product.spec &&
        getJaccardSimilarity(existing.name, product.name) >= 0.92
      ) {
        similarDuplicate = existing;
        break;
      }
    }

    if (similarDuplicate) {
      const keepCurrent = product.quality_score > similarDuplicate.quality_score;
      const winner = keepCurrent ? product : similarDuplicate;
      const loser = keepCurrent ? similarDuplicate : product;

      if (keepCurrent) {
        selected.set(winner.slug.toLowerCase(), winner);
        selected.set(
          `${winner.category_main}|${winner.category_sub}|${normalizeNameKey(winner.name)}|${normalizeNameKey(winner.spec)}`,
          winner
        );
        selectedBySource.set(winner.source_url.trim().toLowerCase(), winner);
      }

      excluded.push({
        name: loser.name,
        reason: "유사명 중복 제거",
        categoryMain: loser.category_main,
      });
      continue;
    }

    selected.set(slugKey, product);
    selected.set(normalizedNameKey, product);
    selectedBySource.set(sourceKey, product);
  }

  const finalProducts = Array.from(
    new Map(
      Array.from(selected.values()).map((product) => [product.slug.toLowerCase(), product])
    ).values()
  );

  return { finalProducts, excluded };
}

function selectFeaturedProducts(products: NormalizedStage2Product[]) {
  const byCategory = new Map<string, NormalizedStage2Product[]>();

  products.forEach((product) => {
    const bucket = byCategory.get(product.category_main) ?? [];
    bucket.push(product);
    byCategory.set(product.category_main, bucket);
  });

  byCategory.forEach((bucket) => {
    bucket.sort((left, right) => {
      const leftScore =
        left.quality_score +
        (left.price !== null ? 20 : 0) +
        (left.featured ? 10 : 0) -
        left.sort_order / 10;
      const rightScore =
        right.quality_score +
        (right.price !== null ? 20 : 0) +
        (right.featured ? 10 : 0) -
        right.sort_order / 10;

      return rightScore - leftScore;
    });
  });

  const selected: NormalizedStage2Product[] = [];
  const categorySelections = new Map<string, number>();

  for (const bucket of byCategory.values()) {
    const pick = bucket[0];

    if (pick) {
      selected.push(pick);
      categorySelections.set(pick.category_main, 1);
    }
  }

  const remainder = products
    .filter((product) => !selected.some((item) => item.slug === product.slug))
    .sort((left, right) => {
      const leftScore =
        left.quality_score + (left.price !== null ? 18 : 0) + (left.featured ? 12 : 0);
      const rightScore =
        right.quality_score + (right.price !== null ? 18 : 0) + (right.featured ? 12 : 0);

      return rightScore - leftScore;
    });

  for (const product of remainder) {
    if (selected.length >= 10) {
      break;
    }

    const currentCount = categorySelections.get(product.category_main) ?? 0;

    if (currentCount >= 2) {
      continue;
    }

    selected.push(product);
    categorySelections.set(product.category_main, currentCount + 1);
  }

  return selected;
}

async function main() {
  const rawPath = path.join(outputDir, "raw_products_stage2.json");
  const rawContent = JSON.parse(await fs.readFile(rawPath, "utf8")) as {
    meta: Record<string, unknown>;
    products: RawStage2Product[];
  };

  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(docsDir, { recursive: true });

  const normalizedCandidates = rawContent.products.map(buildNormalizedProduct);
  const { finalProducts, excluded } = dedupeProducts(normalizedCandidates);
  const featuredProducts = selectFeaturedProducts(finalProducts);
  const featuredSlugSet = new Set(featuredProducts.map((product) => product.slug));

  const normalizedProducts = finalProducts
    .map((product) => ({
      ...product,
      featured: featuredSlugSet.has(product.slug),
    }))
    .sort((left, right) => {
      if (left.category_main === right.category_main) {
        return left.sort_order - right.sort_order;
      }

      return left.category_main.localeCompare(right.category_main, "ko");
    });

  const categoryCounts = normalizedProducts.reduce<Record<string, number>>((acc, product) => {
    acc[product.category_main] = (acc[product.category_main] || 0) + 1;
    return acc;
  }, {});

  const quoteProducts = normalizedProducts.filter((product) => product.quote_required);
  const priceUnknownProducts = normalizedProducts.filter((product) => product.price === null);
  const placeholderImageProducts = normalizedProducts.filter((product) =>
    product.image_url.includes("/images/catalog/")
  );

  const normalizedPayload = {
    meta: {
      generatedAt: new Date().toISOString(),
      source: "raw_products_stage2.json",
      totalCollected: rawContent.products.length,
      totalNormalized: normalizedProducts.length,
      totalExcluded: excluded.length,
      categoryCounts,
      note: "실웹 자동수집 제한으로 공개 검색/상품 페이지 기반 seed를 정제한 stage2 결과입니다.",
      dedupeRules: [
        "source_url 기준 중복 제거",
        "slug 기준 중복 제거",
        "정규화된 이름 + 규격 + 카테고리 기준 중복 제거",
        "같은 카테고리/규격에서 유사명 Jaccard 0.92 이상이면 중복 제거",
      ],
    },
    products: normalizedProducts,
    excluded,
    featuredProducts: featuredProducts.map((product) => ({
      name: product.name,
      slug: product.slug,
      categoryMain: product.category_main,
      qualityScore: product.quality_score,
    })),
  };

  await fs.writeFile(
    path.join(outputDir, "normalized_products_stage2.json"),
    JSON.stringify(normalizedPayload, null, 2),
    "utf8"
  );

  const summaryLines = [
    "# Product Stage2 Summary",
    "",
    `- 총 수집 수: ${rawContent.products.length}개`,
    `- 최종 반영 수: ${normalizedProducts.length}개`,
    `- 제외 수: ${excluded.length}개`,
    "- 실웹 수집 제한 여부: 자동 대량수집은 제한되어 공개 검색/공개 상품 페이지 참고 seed 기반으로 구성",
    "",
    "## 카테고리별 반영 수",
    ...Object.entries(categoryCounts).map(([category, count]) => `- ${category}: ${count}개`),
    "",
    "## 중복 제거 기준",
    "- source_url 동일 시 더 높은 품질 점수 상품 유지",
    "- slug 동일 시 더 높은 품질 점수 상품 유지",
    "- 이름 정규화 + 규격 + 카테고리 동일 시 중복 제거",
    "- 같은 카테고리/규격에서 이름 유사도(Jaccard) 0.92 이상이면 중복 제거",
    "",
    "## 추천상품 선정 기준",
    "- 각 대분류에서 최소 1개 이상 우선 선발",
    "- quality_score, 가격 확인 여부, 기존 featured 후보 여부를 함께 반영",
    "- 한 카테고리 최대 2개까지 추천 배치",
    "",
    "## 수동 보완 필요 품목",
    "- 대형 목재, 골재, 장척 PVC 파이프는 지역별 운임과 현장 반입 조건 검토가 필요합니다.",
    "- 공구류는 실제 판매 브랜드/배터리 구성과 맞춘 상세 스펙 검수가 필요합니다.",
    "- 방수제, 단열재, CRC보드 등 건재류는 실판매 전 제조사별 규격표 재확인이 권장됩니다.",
    "",
    "## 이미지 부족 품목",
    placeholderImageProducts.length === 0
      ? "- 없음"
      : `- 현재 ${placeholderImageProducts.length}개 품목은 카테고리 대표 이미지 기반으로 노출 중이며, 실판매 전 실물 이미지 교체를 권장합니다.`,
    "",
    "## 가격 미확인 품목",
    ...priceUnknownProducts.map((product) => `- ${product.name}`),
    "",
    "## 견적형 상품 목록",
    ...quoteProducts.map((product) => `- ${product.name}`),
  ];

  await fs.writeFile(
    path.join(docsDir, "product-stage2-summary.md"),
    summaryLines.join("\n"),
    "utf8"
  );

  console.log(`normalized_products_stage2.json 생성 완료: ${normalizedProducts.length}개`);
  console.log(`featured 자동 선정: ${featuredProducts.length}개`);
}

main().catch((error: unknown) => {
  console.error("normalize-products-stage2 실패:", error);
  process.exitCode = 1;
});
