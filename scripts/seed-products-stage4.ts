import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildStage4RawProducts,
  type Stage4RawProduct,
} from "./lib/stage4-catalog-data.ts";
import { makeSlug } from "../lib/utils.ts";

type NormalizedStage4Product = {
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
  categoryMain: string;
  reason: string;
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
    focus: "체결, 고정, 보강 작업에서 빠르게 회전하는 철물류",
    directPurchaseLine: "반복 구매와 기본 재고 운영에 맞춰 규격 비교가 쉬운 형태로 정리했습니다.",
    quoteLine: "하중 조건과 수량에 따라 별도 단가와 납기 확인이 필요한 품목입니다.",
    caution: "피착재 상태와 허용 하중을 확인한 뒤 시공에 사용해 주세요.",
  },
  건재: {
    focus: "미장, 마감, 보수, 단열 공정에서 자주 찾는 건재류",
    directPurchaseLine: "현장 보수와 반복 발주에 맞춰 비교가 쉬운 규격으로 구성했습니다.",
    quoteLine: "현장 조건, 반입 방식, 수량에 따라 견적 상담이 필요한 품목입니다.",
    caution: "바탕면 상태와 사용량 산출을 먼저 확인하고 시공해 주세요.",
  },
  골재: {
    focus: "충진, 배수, 조경, 미장 보조에 쓰는 현장형 골재류",
    directPurchaseLine: "소포장과 현장형 규격을 함께 구성해 소량 보수부터 운용이 가능합니다.",
    quoteLine: "운임 비중이 큰 중량 자재라 납품지와 수량 기준 견적 확인이 중요합니다.",
    caution: "하차 동선과 현장 반입 조건을 사전에 확인해 주세요.",
  },
  목재: {
    focus: "구조, 마감, 데크, 목공 작업에 폭넓게 쓰는 목재류",
    directPurchaseLine: "자주 찾는 규격을 중심으로 비교와 재발주가 쉬운 구조입니다.",
    quoteLine: "장척물과 판재류는 절단 조건과 납품 방식에 따라 상담이 필요한 품목입니다.",
    caution: "함수율, 절단 오차, 운송 파손 가능성을 함께 고려해 주세요.",
  },
  "PVC 배관 및 부속": {
    focus: "배수, 급수, 연결, 차단 작업에 필요한 PVC 자재류",
    directPurchaseLine: "배관 보수와 반복 구매에 맞춰 구경별로 빠르게 비교할 수 있습니다.",
    quoteLine: "대구경 자재와 장척 파이프는 납품 조건에 따라 별도 상담이 필요합니다.",
    caution: "구경, 연결 방식, 접착제 호환 여부를 먼저 확인해 주세요.",
  },
  공구: {
    focus: "시공, 절단, 체결, 유지보수 작업에 필요한 공구류",
    directPurchaseLine: "현장 작업성과 즉시 투입성을 고려한 일반 구매형 품목입니다.",
    quoteLine: "세트 구성이나 납기 확인이 필요한 장비는 별도 상담으로 안내합니다.",
    caution: "사용 전 안전보호구와 공구 호환 규격을 확인해 주세요.",
  },
  전기자재: {
    focus: "기본 전기 보수와 현장 배선 작업에 자주 쓰는 범용 전기자재",
    directPurchaseLine: "실무에서 자주 쓰는 규격 중심으로 정리해 빠른 재구매에 적합합니다.",
    quoteLine: "배관 물량이나 프로젝트 단위 발주는 별도 견적이 효율적입니다.",
    caution: "전기 안전 기준과 설치 환경을 먼저 확인해 주세요.",
  },
  안전용품: {
    focus: "현장 안전 확보를 위해 기본적으로 갖추는 보호구류",
    directPurchaseLine: "작업자 지급과 반복 구매에 맞춰 실용적인 규격을 중심으로 정리했습니다.",
    quoteLine: "법인 지급이나 현장 단체 구매는 수량 기준으로 별도 상담이 가능합니다.",
    caution: "사용 환경에 맞는 보호 등급과 착용 적합성을 확인해 주세요.",
  },
  "접착제/실리콘": {
    focus: "실링, 접착, 충진, 보수 작업에 바로 쓰는 소모재",
    directPurchaseLine: "현장 소모와 빠른 보수 작업에 맞춰 바로 주문 가능한 구성입니다.",
    quoteLine: "대량 사용 또는 프로젝트 단위 발주는 견적 상담으로 더 정확히 안내합니다.",
    caution: "도포 면 상태, 경화 시간, 사용 온도를 먼저 확인해 주세요.",
  },
  "소모품/부자재": {
    focus: "보양, 보조 시공, 현장 정리 작업에서 빠지기 쉬운 소모품류",
    directPurchaseLine: "작업 흐름이 끊기지 않도록 기본 품목을 쉽게 재주문할 수 있는 구성입니다.",
    quoteLine: "현장 세트 단위 구매나 대량 공급은 별도 상담이 가능합니다.",
    caution: "사용 환경에 맞는 규격과 소모량을 미리 산정해 주세요.",
  },
};

function normalizeNameKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9가-힣]/g, "");
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

function buildQualityScore(product: Stage4RawProduct) {
  return (
    (product.imageUrl ? 12 : 0) +
    (product.price !== null ? 18 : 8) +
    (product.salePrice ? 6 : 0) +
    (product.spec ? 14 : 0) +
    (product.categoryMain ? 10 : 0) +
    (product.categorySub ? 8 : 0) +
    (product.shipping ? 8 : 0) +
    (product.sourceUrl ? 8 : 0) +
    Math.min(product.searchKeywords.length * 2, 18) +
    (product.applications.length >= 2 ? 10 : 0) +
    (product.badge ? 8 : 0) +
    (product.minimumOrderQuantity && product.minimumOrderQuantity > 1 ? 4 : 0)
  );
}

function buildOverview(product: Stage4RawProduct) {
  const tone = categoryToneMap[product.categoryMain];

  return `${product.title}은 ${tone.focus}로, ${
    product.quoteRequired ? tone.quoteLine : tone.directPurchaseLine
  } ${product.spec ? `${product.spec} 기준으로 검토할 수 있고,` : ""} 배송 방식은 ${product.shipping} 기준으로 안내합니다.`;
}

function buildShortDescription(product: Stage4RawProduct) {
  const tone = categoryToneMap[product.categoryMain];

  return `${product.categoryMain} 현장에서 자주 찾는 ${product.categorySub} 상품입니다. ${
    product.quoteRequired
      ? "수량과 납품 조건에 따라 상담이 필요한 품목입니다."
      : `${product.spec} 규격 기준으로 바로 비교하고 재구매하기 좋습니다.`
  } ${tone.directPurchaseLine}`;
}

function buildFeatureBullets(product: Stage4RawProduct) {
  return [
    `${product.categorySub} 품목 기준으로 규격과 판매단위를 빠르게 확인하기 좋습니다.`,
    product.quoteRequired
      ? "운임과 현장 납품 조건의 영향이 커 상담형 품목으로 운영합니다."
      : "즉시결제 또는 반복 구매 대응이 쉬운 기준으로 정리했습니다.",
    product.bulkyItem
      ? "장척물 또는 중량물 성격을 고려해 배송 안내를 별도로 확인해야 합니다."
      : "소량 보수부터 일반 현장 재고 운영까지 무난하게 대응할 수 있습니다.",
  ];
}

function buildNormalizedProduct(product: Stage4RawProduct): NormalizedStage4Product {
  const qualityScore = buildQualityScore(product);
  const metaTitle = `${product.title} | ${product.categoryMain} | 씨케이코리아`;
  const metaDescription = `${product.categoryMain} 카테고리의 ${product.title} 상품입니다. ${product.spec} 규격, 배송 방식, 구매 정보를 확인하세요.`;

  return {
    name: product.title,
    slug: makeSlug(product.title),
    price: product.price,
    spec: product.spec,
    shipping: product.shipping,
    stock: product.quoteRequired ? null : product.stockHint,
    description: buildOverview(product),
    image_url: product.imageUrl,
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
      qualityScore,
      collectionMode: product.collectionMode,
      priceKnown: product.price !== null,
      salePrice: product.salePrice ?? null,
      badge: product.badge ?? null,
      badgeTone: product.badgeTone ?? "slate",
      minimumOrderQuantity: product.minimumOrderQuantity ?? 1,
      tags: Array.from(
        new Set([
          product.categoryMain,
          product.categorySub,
          ...product.searchKeywords.slice(0, 6),
        ])
      ),
      metaTitle,
      metaDescription,
    },
    detail_json: {
      overview: buildOverview(product),
      features: buildFeatureBullets(product),
      applications:
        product.applications.length > 0
          ? product.applications
          : [`${product.categorySub} 관련 작업`, `${product.categoryMain} 유지보수`, "반복 발주 품목 운영"],
      specifications: `${product.spec} / 판매단위 ${product.unit} 기준입니다. 실제 적용 전 현장 치수와 수량을 다시 확인해 주세요.`,
      shipping_notice: `${
        product.bulkyItem ? "중량물 또는 장척물" : "일반 자재"
      } 기준으로 ${product.shipping} 안내를 우선 적용하며, 대량 주문 시 운임과 납기가 달라질 수 있습니다.`,
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

function dedupeProducts(products: NormalizedStage4Product[]) {
  const selected = new Map<string, NormalizedStage4Product>();
  const selectedBySource = new Map<string, NormalizedStage4Product>();
  const excluded: ExcludedEntry[] = [];

  for (const product of products) {
    if (product.quality_score < 60) {
      excluded.push({
        name: product.name,
        categoryMain: product.category_main,
        reason: "품질 점수 부족",
      });
      continue;
    }

    const sourceKey = product.source_url.trim().toLowerCase();
    const slugKey = product.slug.toLowerCase();
    const normalizedNameKey =
      `${product.category_main}|${product.category_sub}|${normalizeNameKey(product.name)}|${normalizeNameKey(product.spec)}`;

    const duplicate =
      selectedBySource.get(sourceKey) ||
      selected.get(slugKey) ||
      selected.get(normalizedNameKey);

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
        categoryMain: loser.category_main,
        reason: "중복 제거",
      });
      continue;
    }

    let similarDuplicate: NormalizedStage4Product | null = null;

    for (const existing of selected.values()) {
      if (
        existing.category_main === product.category_main &&
        existing.category_sub === product.category_sub &&
        existing.spec === product.spec &&
        getJaccardSimilarity(existing.name, product.name) >= 0.9
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
        categoryMain: loser.category_main,
        reason: "유사명 중복 제거",
      });
      continue;
    }

    selected.set(slugKey, product);
    selected.set(normalizedNameKey, product);
    selectedBySource.set(sourceKey, product);
  }

  return {
    finalProducts: Array.from(
      new Map(
        Array.from(selected.values()).map((product) => [product.slug.toLowerCase(), product])
      ).values()
    ),
    excluded,
  };
}

function selectFeaturedProducts(products: NormalizedStage4Product[]) {
  const buckets = new Map<string, NormalizedStage4Product[]>();

  products.forEach((product) => {
    const bucket = buckets.get(product.category_main) ?? [];
    bucket.push(product);
    buckets.set(product.category_main, bucket);
  });

  buckets.forEach((bucket) => {
    bucket.sort((left, right) => {
      const leftScore =
        left.quality_score +
        (left.price !== null ? 22 : 8) +
        (left.featured ? 12 : 0) +
        (left.options_json.badge ? 8 : 0) -
        left.sort_order / 20;
      const rightScore =
        right.quality_score +
        (right.price !== null ? 22 : 8) +
        (right.featured ? 12 : 0) +
        (right.options_json.badge ? 8 : 0) -
        right.sort_order / 20;

      return rightScore - leftScore;
    });
  });

  const selected: NormalizedStage4Product[] = [];
  const categorySelections = new Map<string, number>();

  for (const bucket of buckets.values()) {
    const pick = bucket[0];

    if (pick) {
      selected.push(pick);
      categorySelections.set(pick.category_main, 1);
    }
  }

  const remainder = products
    .filter((product) => !selected.some((item) => item.slug === product.slug))
    .sort((left, right) => {
      const leftScore = left.quality_score + (left.price !== null ? 18 : 10);
      const rightScore = right.quality_score + (right.price !== null ? 18 : 10);

      return rightScore - leftScore;
    });

  for (const product of remainder) {
    if (selected.length >= 12) {
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
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(docsDir, { recursive: true });

  const rawProducts = buildStage4RawProducts();

  await fs.writeFile(
    path.join(outputDir, "raw_products_stage4.json"),
    JSON.stringify(
      {
        meta: {
          generatedAt: new Date().toISOString(),
          source: "structured-stage4-seed",
          note: "실웹 자동수집 제한으로 stage4 카테고리 패밀리 seed 기준으로 생성했습니다.",
        },
        products: rawProducts,
      },
      null,
      2
    ),
    "utf8"
  );

  const normalizedCandidates = rawProducts.map(buildNormalizedProduct);
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
  const placeholderImageProducts = normalizedProducts.filter((product) =>
    product.image_url.includes("/images/catalog/")
  );

  await fs.writeFile(
    path.join(outputDir, "normalized_products_stage4.json"),
    JSON.stringify(
      {
        meta: {
          generatedAt: new Date().toISOString(),
          source: "raw_products_stage4.json",
          totalCollected: rawProducts.length,
          totalNormalized: normalizedProducts.length,
          totalExcluded: excluded.length,
          categoryCounts,
          note: "실웹 수집 제한으로 structured seed 기반 stage4 데이터를 생성했습니다.",
          dedupeRules: [
            "source_url 기준 중복 제거",
            "slug 기준 중복 제거",
            "정규화된 이름 + 규격 + 카테고리 기준 중복 제거",
            "같은 카테고리/규격에서 유사명 Jaccard 0.9 이상이면 중복 제거",
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
      },
      null,
      2
    ),
    "utf8"
  );

  const summaryLines = [
    "# Product Stage4 Summary",
    "",
    `- 총 수집 수: ${rawProducts.length}개`,
    `- 최종 반영 대상 수: ${normalizedProducts.length}개`,
    `- 제외 수: ${excluded.length}개`,
    "- 실웹 수집 제한 여부: 자동 대량수집은 제한되어 structured seed 기반으로 구성",
    "",
    "## 카테고리별 반영 수",
    ...Object.entries(categoryCounts).map(([category, count]) => `- ${category}: ${count}개`),
    "",
    "## 추천상품 선정 기준",
    "- 각 대분류에서 최소 1개 이상 우선 선발",
    "- quality_score, 가격 확인 여부, 기존 featured 후보 여부, 뱃지 정보를 함께 반영",
    "- 한 카테고리 최대 2개까지 추천 배치",
    "",
    "## 수동 보완 필요 품목",
    "- 골재, 장척 목재, 대구경 PVC 자재는 지역 운임 기준으로 실판매가를 추가 검수하는 것이 좋습니다.",
    "- 전기자재와 안전용품은 실브랜드 정책에 따라 상품명 표기 기준을 한 번 더 맞추는 것이 좋습니다.",
    "- 접착제/실리콘과 소모품은 실사진 확보 시 전환율 개선 여지가 큽니다.",
    "",
    "## 이미지 부족 품목",
    placeholderImageProducts.length === 0
      ? "- 없음"
      : `- 현재 ${placeholderImageProducts.length}개 품목은 카테고리 대표 이미지 기준으로 노출 중이며, 실판매 전 실물 이미지 교체를 권장합니다.`,
    "",
    "## 견적형 상품 목록",
    ...quoteProducts.map((product) => `- ${product.name}`),
  ];

  await fs.writeFile(
    path.join(docsDir, "product-stage4-summary.md"),
    summaryLines.join("\n"),
    "utf8"
  );

  console.log(`raw_products_stage4.json 생성 완료: ${rawProducts.length}개`);
  console.log(`normalized_products_stage4.json 생성 완료: ${normalizedProducts.length}개`);
  console.log(`featured 자동 선정: ${featuredProducts.length}개`);
}

main().catch((error: unknown) => {
  console.error("seed-products-stage4 실패:", error);
  process.exitCode = 1;
});
