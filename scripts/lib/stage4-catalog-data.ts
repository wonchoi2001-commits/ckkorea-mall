import type {
  CatalogCategory,
  ProductBadgeTone,
  ShippingType,
} from "../../lib/types.ts";
import { makeSlug } from "../../lib/utils.ts";

export type Stage4RawProduct = {
  categoryMain: CatalogCategory;
  categorySub: string;
  title: string;
  spec: string;
  price: number | null;
  salePrice?: number | null;
  shipping: ShippingType;
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
  badge?: string;
  badgeTone?: ProductBadgeTone;
  minimumOrderQuantity?: number;
  collectionMode: "stage4-structured-seed";
};

type Stage4Variation = {
  spec: string;
  price: number | null;
  stockHint?: number | null;
  salePrice?: number | null;
  quoteRequired?: boolean;
  bulkyItem?: boolean;
  shipping?: ShippingType;
  badge?: string;
  badgeTone?: ProductBadgeTone;
  minimumOrderQuantity?: number;
  searchKeywords?: string[];
  applications?: string[];
  unit?: string;
};

type Stage4Family = {
  categoryMain: CatalogCategory;
  categorySub: string;
  namePattern: string;
  brand?: string;
  manufacturer?: string;
  origin?: string;
  unit?: string;
  shipping?: ShippingType;
  quoteRequired?: boolean;
  bulkyItem?: boolean;
  featuredCandidate?: boolean;
  sourceSite?: string;
  baseKeywords?: string[];
  applications?: string[];
  caution?: string;
  badge?: string;
  badgeTone?: ProductBadgeTone;
  minimumOrderQuantity?: number;
  variations: Stage4Variation[];
};

const CATEGORY_IMAGE_MAP: Record<CatalogCategory, string> = {
  철물: "/images/catalog/hardware.svg",
  건재: "/images/catalog/construction-materials.svg",
  골재: "/images/catalog/aggregate.svg",
  목재: "/images/catalog/lumber.svg",
  "PVC 배관 및 부속": "/images/catalog/pvc.svg",
  공구: "/images/catalog/tools.svg",
  전기자재: "/images/catalog/electrical.svg",
  안전용품: "/images/catalog/safety.svg",
  "접착제/실리콘": "/images/catalog/adhesives.svg",
  "소모품/부자재": "/images/catalog/consumables.svg",
};

const CATEGORY_DEFAULTS: Record<
  CatalogCategory,
  {
    brand: string;
    manufacturer: string;
    origin: string;
    sourceSite: string;
    unit: string;
    shipping: ShippingType;
  }
> = {
  철물: {
    brand: "CK Fasten",
    manufacturer: "국내 철물 협력사",
    origin: "대한민국",
    sourceSite: "철물점 공개 기준 seed",
    unit: "1개",
    shipping: "택배",
  },
  건재: {
    brand: "CK Build",
    manufacturer: "국내 건재 협력사",
    origin: "대한민국",
    sourceSite: "건재상 공개 기준 seed",
    unit: "1포",
    shipping: "택배",
  },
  골재: {
    brand: "CK Stone",
    manufacturer: "국내 골재 협력사",
    origin: "대한민국",
    sourceSite: "골재몰 공개 기준 seed",
    unit: "1포",
    shipping: "화물배송",
  },
  목재: {
    brand: "CK Timber",
    manufacturer: "국내 목재 협력사",
    origin: "대한민국",
    sourceSite: "목재상 공개 기준 seed",
    unit: "1본",
    shipping: "택배",
  },
  "PVC 배관 및 부속": {
    brand: "CK Pipe",
    manufacturer: "국내 설비자재 협력사",
    origin: "대한민국",
    sourceSite: "배관자재 공개 기준 seed",
    unit: "1개",
    shipping: "택배",
  },
  공구: {
    brand: "CK Tool",
    manufacturer: "국내 공구 유통 협력사",
    origin: "중국",
    sourceSite: "공구상 공개 기준 seed",
    unit: "1개",
    shipping: "택배",
  },
  전기자재: {
    brand: "CK Electric",
    manufacturer: "국내 전기자재 협력사",
    origin: "대한민국",
    sourceSite: "전기자재 공개 기준 seed",
    unit: "1개",
    shipping: "택배",
  },
  안전용품: {
    brand: "CK Safety",
    manufacturer: "국내 안전용품 협력사",
    origin: "대한민국",
    sourceSite: "안전용품 공개 기준 seed",
    unit: "1개",
    shipping: "택배",
  },
  "접착제/실리콘": {
    brand: "CK Seal",
    manufacturer: "국내 접착제 협력사",
    origin: "대한민국",
    sourceSite: "실리콘/접착제 공개 기준 seed",
    unit: "1개",
    shipping: "택배",
  },
  "소모품/부자재": {
    brand: "CK Supply",
    manufacturer: "국내 소모품 협력사",
    origin: "대한민국",
    sourceSite: "현장소모품 공개 기준 seed",
    unit: "1개",
    shipping: "택배",
  },
};

function v(
  spec: string,
  price: number | null,
  stockHint?: number | null,
  options?: Omit<Stage4Variation, "spec" | "price" | "stockHint">
): Stage4Variation {
  return {
    spec,
    price,
    stockHint: stockHint ?? (price === null ? null : 120),
    ...options,
  };
}

function f(definition: Stage4Family) {
  return definition;
}

function createTitle(pattern: string, spec: string) {
  return pattern.replace("{spec}", spec).replace(/\s+/g, " ").trim();
}

function buildSourceUrl(categoryMain: string, categorySub: string, title: string) {
  return `seed://stage4/${makeSlug(categoryMain)}/${makeSlug(categorySub)}/${makeSlug(title)}`;
}

function expandFamily(family: Stage4Family, startSortOrder: number) {
  const defaults = CATEGORY_DEFAULTS[family.categoryMain];

  return family.variations.map<Stage4RawProduct>((variation, index) => {
    const title = createTitle(family.namePattern, variation.spec);
    const shipping = variation.shipping ?? family.shipping ?? defaults.shipping;
    const quoteRequired =
      variation.quoteRequired ?? family.quoteRequired ?? variation.price === null;
    const bulkyItem = variation.bulkyItem ?? family.bulkyItem ?? false;

    return {
      categoryMain: family.categoryMain,
      categorySub: family.categorySub,
      title,
      spec: variation.spec,
      price: variation.price,
      salePrice: variation.salePrice ?? null,
      shipping,
      stockHint: quoteRequired ? null : variation.stockHint ?? 120,
      brand: family.brand ?? defaults.brand,
      manufacturer: family.manufacturer ?? defaults.manufacturer,
      origin: family.origin ?? defaults.origin,
      unit: variation.unit ?? family.unit ?? defaults.unit,
      quoteRequired,
      bulkyItem,
      featuredCandidate: family.featuredCandidate === true || variation.badge === "추천",
      sourceSite: family.sourceSite ?? defaults.sourceSite,
      sourceQuery: `${family.categorySub} ${variation.spec}`,
      sourceUrl: buildSourceUrl(family.categoryMain, family.categorySub, title),
      searchKeywords: Array.from(
        new Set([
          family.categoryMain,
          family.categorySub,
          variation.spec,
          title,
          ...(family.baseKeywords ?? []),
          ...(variation.searchKeywords ?? []),
        ])
      ),
      applications: variation.applications ?? family.applications ?? [],
      caution: family.caution,
      imageUrl: CATEGORY_IMAGE_MAP[family.categoryMain],
      sortOrder: startSortOrder + index,
      badge: variation.badge ?? family.badge,
      badgeTone: variation.badgeTone ?? family.badgeTone,
      minimumOrderQuantity:
        variation.minimumOrderQuantity ?? family.minimumOrderQuantity ?? 1,
      collectionMode: "stage4-structured-seed",
    };
  });
}

export const stage4CatalogFamilies: Stage4Family[] = [
  f({
    categoryMain: "철물",
    categorySub: "웨지앙카",
    namePattern: "스텐 웨지앙카 {spec}",
    baseKeywords: ["앙카볼트", "콘크리트고정", "스텐앙카"],
    applications: ["콘크리트 베이스 고정", "난간 브라켓 체결", "설비 프레임 고정"],
    badge: "인기",
    badgeTone: "amber",
    featuredCandidate: true,
    variations: [
      v("M6 x 50mm", 320, 950),
      v("M8 x 70mm", 480, 900),
      v("M10 x 100mm", 790, 760, { salePrice: 890 }),
      v("M12 x 120mm", 1180, 620),
    ],
  }),
  f({
    categoryMain: "철물",
    categorySub: "세트앙카",
    namePattern: "유니크롬 세트앙카 {spec}",
    baseKeywords: ["세트앙카", "앙카", "고정철물"],
    applications: ["콘크리트 매입 고정", "설비 브라켓 체결", "현장 고정 보강"],
    variations: [
      v("M8 x 60mm", 260, 980),
      v("M10 x 80mm", 390, 840),
      v("M12 x 100mm", 650, 720),
      v("M16 x 125mm", 1180, 480, { badge: "대량견적", badgeTone: "blue" }),
    ],
  }),
  f({
    categoryMain: "철물",
    categorySub: "육각볼트",
    namePattern: "고장력 육각볼트 {spec}",
    baseKeywords: ["볼트", "육각볼트", "체결철물"],
    applications: ["프레임 조립", "철물 체결", "기계 베이스 체결"],
    minimumOrderQuantity: 10,
    variations: [
      v("M8 x 30mm", 180, 1600, { minimumOrderQuantity: 20 }),
      v("M10 x 40mm", 220, 1480, { minimumOrderQuantity: 20 }),
      v("M12 x 50mm", 290, 1260, { minimumOrderQuantity: 10 }),
      v("M16 x 60mm", 520, 980, { minimumOrderQuantity: 10 }),
    ],
  }),
  f({
    categoryMain: "철물",
    categorySub: "직결피스",
    namePattern: "자천피스 {spec}",
    baseKeywords: ["피스", "직결피스", "스크류"],
    applications: ["철판 체결", "천장재 보강", "외장판 마감"],
    unit: "1박스",
    variations: [
      v("8 x 19mm", 5400, 260, { unit: "1박스", badge: "인기", badgeTone: "amber" }),
      v("8 x 25mm", 6200, 220, { unit: "1박스" }),
      v("8 x 32mm", 7100, 180, { unit: "1박스" }),
      v("8 x 38mm", 8200, 150, { unit: "1박스" }),
    ],
  }),
  f({
    categoryMain: "철물",
    categorySub: "브라켓",
    namePattern: "스텐 ㄱ자 브라켓 {spec}",
    baseKeywords: ["브라켓", "L브라켓", "보강철물"],
    applications: ["선반 보강", "목재 프레임 보강", "내장재 모서리 고정"],
    variations: [
      v("30 x 30mm", 890, 520),
      v("40 x 40mm", 1180, 470),
      v("50 x 50mm", 1480, 390),
      v("75 x 75mm", 2320, 280, { badge: "추천", badgeTone: "blue" }),
    ],
  }),

  f({
    categoryMain: "건재",
    categorySub: "드라이몰탈",
    namePattern: "일반 드라이몰탈 {spec}",
    baseKeywords: ["드라이몰탈", "몰탈", "미장재"],
    applications: ["바닥 미장", "벽체 보수", "일반 시공 보조"],
    unit: "1포",
    badge: "인기",
    badgeTone: "amber",
    variations: [
      v("10kg", 4900, 180, { unit: "1포" }),
      v("20kg", 7900, 150, { unit: "1포" }),
      v("25kg", 9300, 130, { unit: "1포" }),
      v("40kg", 14800, 95, { unit: "1포" }),
    ],
  }),
  f({
    categoryMain: "건재",
    categorySub: "타일접착제",
    namePattern: "폴리머 타일접착제 {spec}",
    baseKeywords: ["타일접착제", "타일본드", "내장마감"],
    applications: ["타일 부착", "실내 벽체 마감", "보수 시공"],
    unit: "1포",
    variations: [
      v("5kg", 4200, 220, { unit: "1포" }),
      v("10kg", 6900, 180, { unit: "1포" }),
      v("20kg", 11800, 140, { unit: "1포", badge: "추천", badgeTone: "blue" }),
      v("25kg", 14200, 110, { unit: "1포" }),
    ],
  }),
  f({
    categoryMain: "건재",
    categorySub: "보수몰탈",
    namePattern: "고강도 보수몰탈 {spec}",
    baseKeywords: ["보수몰탈", "크랙보수", "보수재"],
    applications: ["콘크리트 보수", "모서리 파손 보수", "균열 보강"],
    unit: "1포",
    variations: [
      v("5kg", 5800, 200, { unit: "1포" }),
      v("10kg", 9800, 160, { unit: "1포" }),
      v("20kg", 16900, 120, { unit: "1포" }),
      v("25kg", 19800, 90, { unit: "1포" }),
    ],
  }),
  f({
    categoryMain: "건재",
    categorySub: "CRC보드",
    namePattern: "CRC 보드 {spec}",
    baseKeywords: ["CRC보드", "시멘트보드", "외장보드"],
    applications: ["습식 구간 보강", "외장 마감 바탕", "보드 시공"],
    unit: "1장",
    bulkyItem: true,
    shipping: "화물배송",
    caution: "판재류는 운반 중 파손 가능성이 있어 상차·하차 조건을 함께 확인해 주세요.",
    variations: [
      v("6T 900 x 1800", 13800, 60, { unit: "1장", bulkyItem: true, shipping: "화물배송" }),
      v("8T 900 x 1800", 16900, 52, { unit: "1장", bulkyItem: true, shipping: "화물배송" }),
      v("10T 1200 x 2400", null, null, {
        unit: "1장",
        quoteRequired: true,
        bulkyItem: true,
        shipping: "현장납품 문의",
        badge: "대량견적",
        badgeTone: "blue",
      }),
      v("12T 1200 x 2400", null, null, {
        unit: "1장",
        quoteRequired: true,
        bulkyItem: true,
        shipping: "현장납품 문의",
      }),
    ],
  }),
  f({
    categoryMain: "건재",
    categorySub: "단열재",
    namePattern: "비드법 단열재 {spec}",
    baseKeywords: ["단열재", "보온재", "EPS"],
    applications: ["벽체 보온", "바닥 단열", "내단열 보강"],
    unit: "1장",
    variations: [
      v("30T 600 x 900", 4300, 160, { unit: "1장" }),
      v("50T 600 x 900", 5600, 140, { unit: "1장" }),
      v("80T 900 x 1800", null, null, {
        unit: "1장",
        quoteRequired: true,
        bulkyItem: true,
        shipping: "화물배송",
      }),
      v("100T 900 x 1800", null, null, {
        unit: "1장",
        quoteRequired: true,
        bulkyItem: true,
        shipping: "현장납품 문의",
        badge: "대량견적",
        badgeTone: "blue",
      }),
    ],
  }),

  f({
    categoryMain: "골재",
    categorySub: "세척모래",
    namePattern: "세척모래 {spec}",
    baseKeywords: ["모래", "세척모래", "미장재"],
    applications: ["미장용 혼합", "조적 보수", "바닥 메움"],
    unit: "1포",
    shipping: "화물배송",
    variations: [
      v("20kg", 3900, 120, { unit: "1포", shipping: "화물배송" }),
      v("25kg", 4500, 110, { unit: "1포", shipping: "화물배송" }),
      v("40kg", 6900, 90, { unit: "1포", shipping: "화물배송" }),
      v("1루베", null, null, {
        unit: "1루베",
        quoteRequired: true,
        bulkyItem: true,
        shipping: "현장납품 문의",
        badge: "대량견적",
        badgeTone: "blue",
      }),
    ],
  }),
  f({
    categoryMain: "골재",
    categorySub: "조경자갈",
    namePattern: "조경용 자갈 {spec}",
    baseKeywords: ["자갈", "조경자갈", "배수용자갈"],
    applications: ["조경 포설", "배수층 형성", "야외 마감"],
    unit: "1포",
    shipping: "화물배송",
    variations: [
      v("백색 20kg", 6900, 120, { unit: "1포", shipping: "화물배송" }),
      v("흑색 20kg", 7200, 110, { unit: "1포", shipping: "화물배송" }),
      v("혼합색 20kg", 7500, 110, { unit: "1포", shipping: "화물배송" }),
      v("혼합색 톤백", null, null, {
        unit: "1톤백",
        quoteRequired: true,
        bulkyItem: true,
        shipping: "현장납품 문의",
      }),
    ],
  }),
  f({
    categoryMain: "골재",
    categorySub: "쇄석",
    namePattern: "쇄석 골재 {spec}",
    baseKeywords: ["쇄석", "기초골재", "잡석"],
    applications: ["기초 메움", "배수층 조성", "바닥 다짐"],
    unit: "1포",
    shipping: "화물배송",
    variations: [
      v("13mm 25kg", 4300, 110, { unit: "1포", shipping: "화물배송" }),
      v("25mm 25kg", 4500, 100, { unit: "1포", shipping: "화물배송" }),
      v("40kg", 6900, 88, { unit: "1포", shipping: "화물배송" }),
      v("1톤", null, null, {
        unit: "1톤",
        quoteRequired: true,
        bulkyItem: true,
        shipping: "현장납품 문의",
        badge: "대량견적",
        badgeTone: "blue",
      }),
    ],
  }),
  f({
    categoryMain: "골재",
    categorySub: "혼합골재",
    namePattern: "혼합골재 {spec}",
    baseKeywords: ["혼합골재", "골재", "채움재"],
    applications: ["되메우기", "기초 메움", "현장 정리"],
    shipping: "화물배송",
    variations: [
      v("20kg", 3600, 140, { unit: "1포", shipping: "화물배송" }),
      v("40kg", 6200, 100, { unit: "1포", shipping: "화물배송" }),
      v("톤백", null, null, {
        unit: "1톤백",
        quoteRequired: true,
        bulkyItem: true,
        shipping: "현장납품 문의",
      }),
      v("3루베", null, null, {
        unit: "3루베",
        quoteRequired: true,
        bulkyItem: true,
        shipping: "현장납품 문의",
        badge: "현장납품",
        badgeTone: "emerald",
      }),
    ],
  }),
  f({
    categoryMain: "골재",
    categorySub: "마사토",
    namePattern: "마사토 {spec}",
    baseKeywords: ["마사토", "조경토", "채움재"],
    applications: ["조경 바닥재", "보도 포설", "기초 채움"],
    unit: "1포",
    shipping: "화물배송",
    variations: [
      v("20kg", 3800, 120, { unit: "1포", shipping: "화물배송" }),
      v("40kg", 6100, 90, { unit: "1포", shipping: "화물배송" }),
      v("톤백", null, null, {
        unit: "1톤백",
        quoteRequired: true,
        bulkyItem: true,
        shipping: "현장납품 문의",
      }),
      v("3루베", null, null, {
        unit: "3루베",
        quoteRequired: true,
        bulkyItem: true,
        shipping: "현장납품 문의",
      }),
    ],
  }),

  f({
    categoryMain: "목재",
    categorySub: "구조목",
    namePattern: "SPF 구조목 {spec}",
    baseKeywords: ["구조목", "SPF", "각재"],
    applications: ["벽체 구조", "목재 프레임", "보강 작업"],
    unit: "1본",
    variations: [
      v("38 x 89 x 3600", 8900, 130, { unit: "1본" }),
      v("38 x 140 x 3600", 12400, 110, { unit: "1본" }),
      v("38 x 184 x 3600", null, null, {
        unit: "1본",
        quoteRequired: true,
        bulkyItem: true,
        shipping: "화물배송",
      }),
      v("38 x 235 x 3600", null, null, {
        unit: "1본",
        quoteRequired: true,
        bulkyItem: true,
        shipping: "현장납품 문의",
      }),
    ],
  }),
  f({
    categoryMain: "목재",
    categorySub: "투바이",
    namePattern: "투바이 구조재 {spec}",
    baseKeywords: ["투바이", "2x4", "구조목"],
    applications: ["프레임 시공", "목재 보강", "데크 하부 구조"],
    unit: "1본",
    variations: [
      v("2 x 2 x 2400", 4200, 150, { unit: "1본" }),
      v("2 x 4 x 2400", 5900, 140, { unit: "1본", badge: "인기", badgeTone: "amber" }),
      v("2 x 6 x 3000", 8800, 120, { unit: "1본" }),
      v("2 x 8 x 3600", null, null, {
        unit: "1본",
        quoteRequired: true,
        bulkyItem: true,
        shipping: "화물배송",
      }),
    ],
  }),
  f({
    categoryMain: "목재",
    categorySub: "합판",
    namePattern: "내수합판 {spec}",
    baseKeywords: ["합판", "내수합판", "판재"],
    applications: ["가설 구조", "내장 바탕", "보강 판재"],
    unit: "1장",
    variations: [
      v("8.5T 1220 x 2440", 14800, 90, { unit: "1장" }),
      v("11.5T 1220 x 2440", 18600, 82, { unit: "1장" }),
      v("15T 1220 x 2440", 23600, 68, { unit: "1장" }),
      v("18T 1220 x 2440", 27500, 56, { unit: "1장", badge: "추천", badgeTone: "blue" }),
    ],
  }),
  f({
    categoryMain: "목재",
    categorySub: "MDF",
    namePattern: "MDF 합판 {spec}",
    baseKeywords: ["MDF", "가구판재", "목공판재"],
    applications: ["가구 제작", "실내 마감", "목공 시공"],
    unit: "1장",
    variations: [
      v("9T 1220 x 2440", 14200, 78, { unit: "1장" }),
      v("12T 1220 x 2440", 17800, 72, { unit: "1장" }),
      v("15T 1220 x 2440", 21900, 60, { unit: "1장" }),
      v("18T 1220 x 2440", 25900, 55, { unit: "1장" }),
    ],
  }),
  f({
    categoryMain: "목재",
    categorySub: "방부목",
    namePattern: "방부목 데크용 {spec}",
    baseKeywords: ["방부목", "데크재", "야외목재"],
    applications: ["데크 시공", "야외 프레임", "조경 목공"],
    unit: "1본",
    shipping: "화물배송",
    variations: [
      v("19 x 90 x 3600", 8300, 110, { unit: "1본", shipping: "화물배송" }),
      v("21 x 120 x 3600", 10900, 92, { unit: "1본", shipping: "화물배송" }),
      v("38 x 140 x 3600", 16200, 74, { unit: "1본", shipping: "화물배송" }),
      v("38 x 140 x 4200", null, null, {
        unit: "1본",
        quoteRequired: true,
        bulkyItem: true,
        shipping: "현장납품 문의",
      }),
    ],
  }),

  f({
    categoryMain: "PVC 배관 및 부속",
    categorySub: "PVC 파이프",
    namePattern: "PVC 배수 파이프 {spec}",
    baseKeywords: ["PVC파이프", "배수관", "설비자재"],
    applications: ["배수 배관", "배관 교체", "보수 설비"],
    unit: "1본",
    variations: [
      v("50A x 4M", 6200, 120, { unit: "1본" }),
      v("75A x 4M", 9800, 90, { unit: "1본", badge: "인기", badgeTone: "amber" }),
      v("100A x 4M", 13800, 80, { unit: "1본", bulkyItem: true, shipping: "화물배송" }),
      v("150A x 4M", null, null, {
        unit: "1본",
        quoteRequired: true,
        bulkyItem: true,
        shipping: "현장납품 문의",
      }),
    ],
  }),
  f({
    categoryMain: "PVC 배관 및 부속",
    categorySub: "PVC 엘보",
    namePattern: "PVC 엘보 {spec}",
    baseKeywords: ["엘보", "PVC엘보", "배관부속"],
    applications: ["배관 방향 전환", "배수 라인 보수", "배관 연결"],
    variations: [
      v("40A", 880, 420),
      v("50A", 1180, 380),
      v("75A", 1690, 290),
      v("100A", 2480, 220),
    ],
  }),
  f({
    categoryMain: "PVC 배관 및 부속",
    categorySub: "PVC 티",
    namePattern: "PVC 티 {spec}",
    baseKeywords: ["PVC티", "배관티", "배수분기"],
    applications: ["배관 분기", "점검 라인 증설", "유지보수"],
    variations: [
      v("40A", 990, 360),
      v("50A", 1360, 330),
      v("75A", 1890, 250),
      v("100A", 2990, 200),
    ],
  }),
  f({
    categoryMain: "PVC 배관 및 부속",
    categorySub: "PVC 소켓",
    namePattern: "PVC 소켓 {spec}",
    baseKeywords: ["소켓", "PVC소켓", "배관이음"],
    applications: ["직선 연결", "보수 연결", "배관 연장"],
    variations: [
      v("40A", 620, 520),
      v("50A", 820, 480),
      v("75A", 1290, 360),
      v("100A", 1850, 290),
    ],
  }),
  f({
    categoryMain: "PVC 배관 및 부속",
    categorySub: "PVC 볼밸브",
    namePattern: "PVC 볼밸브 {spec}",
    baseKeywords: ["볼밸브", "PVC밸브", "배관밸브"],
    applications: ["배관 차단", "유지보수", "라인 교체 작업"],
    badge: "추천",
    badgeTone: "blue",
    featuredCandidate: true,
    variations: [
      v("20A", 5200, 120),
      v("25A", 6200, 110),
      v("40A", 9800, 85),
      v("50A", 13800, 72),
    ],
  }),

  f({
    categoryMain: "공구",
    categorySub: "망치",
    namePattern: "빠루망치 {spec}",
    baseKeywords: ["망치", "빠루망치", "철거공구"],
    applications: ["못 제거", "가설 철거", "목공 작업"],
    variations: [
      v("8oz", 6200, 120),
      v("12oz", 7400, 110),
      v("16oz", 8900, 95, { badge: "인기", badgeTone: "amber" }),
      v("20oz", 11200, 80),
    ],
  }),
  f({
    categoryMain: "공구",
    categorySub: "드라이버세트",
    namePattern: "스크류드라이버 세트 {spec}",
    baseKeywords: ["드라이버세트", "드라이버", "수공구"],
    applications: ["전기 보수", "가구 조립", "현장 유지보수"],
    variations: [
      v("2pcs", 3900, 150),
      v("4pcs", 6800, 120),
      v("6pcs", 9800, 95),
      v("8pcs", 13800, 80, { badge: "추천", badgeTone: "blue" }),
    ],
  }),
  f({
    categoryMain: "공구",
    categorySub: "몽키렌치",
    namePattern: "몽키렌치 {spec}",
    baseKeywords: ["몽키", "몽키렌치", "렌치"],
    applications: ["설비 작업", "배관 체결", "현장 유지보수"],
    variations: [
      v("6인치", 7200, 130),
      v("8인치", 9300, 115),
      v("10인치", 12900, 90),
      v("12인치", 16800, 70),
    ],
  }),
  f({
    categoryMain: "공구",
    categorySub: "니퍼",
    namePattern: "강력 니퍼 {spec}",
    baseKeywords: ["니퍼", "절단공구", "전기공구"],
    applications: ["전선 절단", "케이블 작업", "부속 정리"],
    variations: [
      v("6인치", 7400, 120),
      v("7인치", 8600, 115),
      v("8인치", 9800, 100),
      v("절연형 8인치", 14800, 72),
    ],
  }),
  f({
    categoryMain: "공구",
    categorySub: "실리콘건",
    namePattern: "실리콘건 {spec}",
    baseKeywords: ["실리콘건", "코킹건", "실링공구"],
    applications: ["실리콘 시공", "본드 도포", "실링 작업"],
    variations: [
      v("표준형", 5900, 140),
      v("롱노즐형", 6900, 120),
      v("고강도형", 9800, 90, { badge: "인기", badgeTone: "amber" }),
      v("프리미엄형", 13800, 72, { salePrice: 16900 }),
    ],
  }),

  f({
    categoryMain: "전기자재",
    categorySub: "절연테이프",
    namePattern: "PVC 절연테이프 {spec}",
    baseKeywords: ["절연테이프", "전기테이프", "전선보수"],
    applications: ["전선 절연", "배선 마감", "간단 보수"],
    unit: "1롤",
    variations: [
      v("흑색 19mm", 700, 440, { unit: "1롤" }),
      v("적색 19mm", 700, 380, { unit: "1롤" }),
      v("청색 19mm", 700, 360, { unit: "1롤" }),
      v("황녹색 19mm", 790, 320, { unit: "1롤" }),
    ],
  }),
  f({
    categoryMain: "전기자재",
    categorySub: "멀티탭",
    namePattern: "멀티탭 {spec}",
    baseKeywords: ["멀티탭", "콘센트", "전기자재"],
    applications: ["현장 전원 분배", "사무공간 사용", "장비 전원 연결"],
    variations: [
      v("3구 1.5M", 6200, 120),
      v("4구 3M", 9800, 95),
      v("6구 5M", 14800, 80, { badge: "인기", badgeTone: "amber" }),
      v("개별스위치 4구 3M", 13200, 85),
    ],
  }),
  f({
    categoryMain: "전기자재",
    categorySub: "노출콘센트",
    namePattern: "노출 콘센트 {spec}",
    baseKeywords: ["콘센트", "노출콘센트", "전기보수"],
    applications: ["전원 증설", "창고 전기 보수", "가설 전원"],
    variations: [
      v("1구", 2400, 180),
      v("2구", 3200, 160),
      v("1구 방우형", 4900, 120),
      v("2구 방우형", 6200, 98),
    ],
  }),
  f({
    categoryMain: "전기자재",
    categorySub: "매입스위치",
    namePattern: "매입 스위치 {spec}",
    baseKeywords: ["매입스위치", "스위치", "전기자재"],
    applications: ["실내 조명 제어", "보수 공사", "전기 설비 교체"],
    variations: [
      v("1로 1구", 2600, 160),
      v("1로 2구", 3600, 140),
      v("2로 1구", 3900, 130),
      v("3로 1구", 4200, 110),
    ],
  }),
  f({
    categoryMain: "전기자재",
    categorySub: "PF 전선관",
    namePattern: "PF 전선 보호관 {spec}",
    baseKeywords: ["PF전선관", "보호관", "전선관"],
    applications: ["배선 보호", "노출 배관 정리", "실내외 배선"],
    unit: "1롤",
    variations: [
      v("16mm x 30M", 14900, 80, { unit: "1롤" }),
      v("22mm x 30M", 19800, 70, { unit: "1롤" }),
      v("28mm x 30M", 24800, 55, { unit: "1롤" }),
      v("36mm x 30M", null, null, {
        unit: "1롤",
        quoteRequired: true,
        shipping: "화물배송",
      }),
    ],
  }),

  f({
    categoryMain: "안전용품",
    categorySub: "코팅장갑",
    namePattern: "NBR 코팅장갑 {spec}",
    baseKeywords: ["작업장갑", "코팅장갑", "안전장갑"],
    applications: ["일반 작업", "자재 운반", "현장 유지보수"],
    unit: "1켤레",
    variations: [
      v("S", 1100, 220, { unit: "1켤레" }),
      v("M", 1100, 220, { unit: "1켤레" }),
      v("L", 1100, 240, { unit: "1켤레", badge: "인기", badgeTone: "amber" }),
      v("XL", 1100, 180, { unit: "1켤레" }),
    ],
  }),
  f({
    categoryMain: "안전용품",
    categorySub: "안전모",
    namePattern: "경량 안전모 {spec}",
    baseKeywords: ["안전모", "보호구", "현장안전"],
    applications: ["건설 현장", "설비 점검", "실내 공사"],
    variations: [
      v("백색", 8900, 120),
      v("황색", 8900, 110),
      v("청색", 8900, 98),
      v("통풍형 백색", 12800, 82, { badge: "추천", badgeTone: "blue" }),
    ],
  }),
  f({
    categoryMain: "안전용품",
    categorySub: "보안경",
    namePattern: "보안경 {spec}",
    baseKeywords: ["보안경", "안전안경", "절단보호"],
    applications: ["절단 작업", "분진 작업", "일반 시공"],
    variations: [
      v("투명", 2400, 180),
      v("그레이", 2600, 160),
      v("김서림 방지형", 3900, 120),
      v("밀착형", 4900, 95),
    ],
  }),
  f({
    categoryMain: "안전용품",
    categorySub: "방진마스크",
    namePattern: "방진마스크 {spec}",
    baseKeywords: ["마스크", "방진마스크", "보호구"],
    applications: ["분진 작업", "절단 작업", "실내 공사"],
    unit: "1매",
    variations: [
      v("일반형 1매", 800, 400, { unit: "1매" }),
      v("2급 1매", 1200, 360, { unit: "1매" }),
      v("2급 10매", 9800, 150, { unit: "1팩" }),
      v("활성탄형 10매", 14800, 110, { unit: "1팩" }),
    ],
  }),
  f({
    categoryMain: "안전용품",
    categorySub: "안전조끼",
    namePattern: "형광 안전조끼 {spec}",
    baseKeywords: ["안전조끼", "형광조끼", "현장복"],
    applications: ["현장 식별", "야외 작업", "교통 통제 보조"],
    variations: [
      v("L", 7600, 100),
      v("XL", 7600, 96),
      v("XXL", 7900, 88),
      v("망사형 XL", 9200, 82),
    ],
  }),

  f({
    categoryMain: "접착제/실리콘",
    categorySub: "중성실리콘",
    namePattern: "건축용 중성 실리콘 {spec}",
    baseKeywords: ["중성실리콘", "실리콘", "실링재"],
    applications: ["창호 실링", "내외장 마감", "패널 틈새 보수"],
    badge: "인기",
    badgeTone: "amber",
    featuredCandidate: true,
    variations: [
      v("백색 300ml", 3900, 180),
      v("투명 300ml", 3900, 170),
      v("회색 300ml", 4100, 160),
      v("흑색 300ml", 4100, 150),
    ],
  }),
  f({
    categoryMain: "접착제/실리콘",
    categorySub: "변성실리콘",
    namePattern: "변성 실리콘 {spec}",
    baseKeywords: ["변성실리콘", "외장실리콘", "접착실링"],
    applications: ["외장 패널 마감", "메탈 조인트", "방수 보강"],
    variations: [
      v("백색 290ml", 5900, 140),
      v("회색 290ml", 5900, 140),
      v("흑색 290ml", 6100, 130),
      v("투명 290ml", 6100, 118),
    ],
  }),
  f({
    categoryMain: "접착제/실리콘",
    categorySub: "에폭시접착제",
    namePattern: "2액형 에폭시접착제 {spec}",
    baseKeywords: ["에폭시", "2액형접착제", "보강접착"],
    applications: ["금속 보수", "석재 접착", "균열 보강"],
    variations: [
      v("5분 경화 50g", 4200, 130),
      v("30분 경화 50g", 4800, 120),
      v("5분 경화 200g", 9800, 95),
      v("30분 경화 200g", 11200, 88),
    ],
  }),
  f({
    categoryMain: "접착제/실리콘",
    categorySub: "순간접착제",
    namePattern: "순간접착제 {spec}",
    baseKeywords: ["순간접착제", "본드", "소형보수"],
    applications: ["작은 부속 보수", "현장 소형 접착", "가벼운 조립"],
    variations: [
      v("20g", 1500, 240),
      v("50g", 2800, 210),
      v("젤형 20g", 1900, 200),
      v("젤형 50g", 3200, 180),
    ],
  }),
  f({
    categoryMain: "접착제/실리콘",
    categorySub: "배관용접착제",
    namePattern: "PVC 배관용 접착제 {spec}",
    baseKeywords: ["PVC접착제", "배관본드", "배관부속"],
    applications: ["PVC 배관 접착", "부속 연결", "누수 보수"],
    variations: [
      v("100g", 2600, 170),
      v("250g", 4800, 140),
      v("500g", 8200, 110),
      v("1kg", 14900, 86),
    ],
  }),

  f({
    categoryMain: "소모품/부자재",
    categorySub: "청테이프",
    namePattern: "청테이프 {spec}",
    baseKeywords: ["청테이프", "포장테이프", "현장부자재"],
    applications: ["임시 고정", "포장 작업", "현장 보양"],
    unit: "1롤",
    variations: [
      v("45mm x 25M", 1800, 210, { unit: "1롤" }),
      v("45mm x 50M", 2600, 190, { unit: "1롤" }),
      v("50mm x 25M", 2200, 180, { unit: "1롤" }),
      v("50mm x 50M", 3200, 170, { unit: "1롤" }),
    ],
  }),
  f({
    categoryMain: "소모품/부자재",
    categorySub: "마스킹테이프",
    namePattern: "마스킹테이프 {spec}",
    baseKeywords: ["마스킹테이프", "도장부자재", "보양"],
    applications: ["도장 보양", "구획 표시", "임시 고정"],
    unit: "1롤",
    variations: [
      v("12mm x 40M", 1200, 220, { unit: "1롤" }),
      v("24mm x 40M", 1600, 210, { unit: "1롤" }),
      v("36mm x 40M", 2100, 180, { unit: "1롤" }),
      v("48mm x 40M", 2600, 160, { unit: "1롤" }),
    ],
  }),
  f({
    categoryMain: "소모품/부자재",
    categorySub: "작업비닐",
    namePattern: "작업비닐 {spec}",
    baseKeywords: ["작업비닐", "보양비닐", "현장보양"],
    applications: ["바닥 보양", "먼지 차단", "도장 보호"],
    unit: "1롤",
    variations: [
      v("0.05T 900mm x 50M", 6200, 120, { unit: "1롤" }),
      v("0.05T 1800mm x 50M", 9200, 100, { unit: "1롤" }),
      v("0.08T 1800mm x 50M", 12800, 82, { unit: "1롤" }),
      v("0.1T 1800mm x 50M", 16800, 70, { unit: "1롤" }),
    ],
  }),
  f({
    categoryMain: "소모품/부자재",
    categorySub: "사포",
    namePattern: "페이퍼 사포 {spec}",
    baseKeywords: ["사포", "연마지", "목공부자재"],
    applications: ["목재 연마", "금속 면정리", "도장 전처리"],
    unit: "10매",
    variations: [
      v("#80", 3200, 150, { unit: "10매" }),
      v("#120", 3200, 150, { unit: "10매" }),
      v("#240", 3400, 140, { unit: "10매" }),
      v("#400", 3900, 120, { unit: "10매" }),
    ],
  }),
  f({
    categoryMain: "소모품/부자재",
    categorySub: "브러시",
    namePattern: "페인트 브러시 {spec}",
    baseKeywords: ["브러시", "붓", "도장부자재"],
    applications: ["도장 작업", "실링 마감", "청소 보조"],
    variations: [
      v("1인치", 1500, 180),
      v("2인치", 2200, 160),
      v("3인치", 3200, 130),
      v("4인치", 4200, 110),
    ],
  }),
  f({
    categoryMain: "철물",
    categorySub: "케이블타이",
    namePattern: "나일론 케이블타이 {spec}",
    baseKeywords: ["케이블타이", "타이", "배선정리"],
    applications: ["배선 정리", "호스 고정", "자재 묶음 보관"],
    unit: "100개",
    variations: [
      v("100mm", 2200, 190, { unit: "100개" }),
      v("150mm", 2900, 180, { unit: "100개" }),
      v("200mm", 3600, 160, { unit: "100개" }),
      v("300mm", 5200, 140, { unit: "100개", badge: "인기", badgeTone: "amber" }),
    ],
  }),
  f({
    categoryMain: "PVC 배관 및 부속",
    categorySub: "점검구",
    namePattern: "PVC 점검구 {spec}",
    baseKeywords: ["점검구", "배관점검구", "설비부속"],
    applications: ["배관 점검", "유지보수 접근", "보수 작업"],
    variations: [
      v("50A", 4900, 120),
      v("75A", 6200, 100),
      v("100A", 8200, 90),
      v("150A", null, null, {
        quoteRequired: true,
        bulkyItem: true,
        shipping: "현장납품 문의",
      }),
    ],
  }),
  f({
    categoryMain: "공구",
    categorySub: "줄자",
    namePattern: "오토락 줄자 {spec}",
    baseKeywords: ["줄자", "측정공구", "자동줄자"],
    applications: ["자재 실측", "현장 치수 확인", "시공 기준선 측정"],
    variations: [
      v("3.5M", 5200, 140),
      v("5.5M", 6900, 128),
      v("7.5M", 9800, 96),
      v("10M", 14200, 78, { badge: "추천", badgeTone: "blue" }),
    ],
  }),
  f({
    categoryMain: "전기자재",
    categorySub: "케이블클립",
    namePattern: "케이블클립 {spec}",
    baseKeywords: ["케이블클립", "전선정리", "배선고정"],
    applications: ["배선 고정", "몰딩 정리", "전선 라인 정리"],
    unit: "100개",
    variations: [
      v("4mm", 1900, 200, { unit: "100개" }),
      v("6mm", 2200, 180, { unit: "100개" }),
      v("8mm", 2500, 160, { unit: "100개" }),
      v("10mm", 3200, 140, { unit: "100개" }),
    ],
  }),
  f({
    categoryMain: "소모품/부자재",
    categorySub: "롤러",
    namePattern: "페인트 롤러 {spec}",
    baseKeywords: ["롤러", "도장롤러", "도장부자재"],
    applications: ["벽체 도장", "천장 도장", "보양 후 마감 작업"],
    variations: [
      v("4인치", 2800, 150),
      v("7인치", 3900, 130),
      v("9인치", 5200, 120),
      v("리필형 9인치", 6900, 90),
    ],
  }),
];

export function buildStage4RawProducts() {
  let sortOrder = 1;

  return stage4CatalogFamilies.flatMap((family) => {
    const products = expandFamily(family, sortOrder);
    sortOrder += products.length;
    return products;
  });
}
