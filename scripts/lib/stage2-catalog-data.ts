export type CatalogCategoryMain =
  | "철물"
  | "건재"
  | "골재"
  | "목재"
  | "PVC배관 및 부속"
  | "공구";

export type ShippingKind = "택배" | "화물배송" | "현장납품 문의" | "배송 문의";

export type Stage2Seed = {
  categoryMain: CatalogCategoryMain;
  categorySub: string;
  title: string;
  spec: string;
  price: number | null;
  shipping: ShippingKind;
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
  searchKeywords: string[];
  applications: string[];
  caution?: string;
  collectionMode?: "stage2-public-reference-seed" | "stage2-low-quality-seed";
};

type SeedOptions = {
  price: number | null;
  shipping?: ShippingKind;
  stockHint?: number | null;
  unit?: string;
  quoteRequired?: boolean;
  bulkyItem?: boolean;
  featuredCandidate?: boolean;
  searchKeywords?: string[];
  applications?: string[];
  sourceQuery?: string;
  caution?: string;
  brand?: string;
  manufacturer?: string;
  origin?: string;
  collectionMode?: "stage2-public-reference-seed" | "stage2-low-quality-seed";
};

function buildSeed(
  categoryMain: CatalogCategoryMain,
  categorySub: string,
  title: string,
  spec: string,
  defaults: {
    brand: string;
    manufacturer: string;
    origin: string;
    sourceSite: string;
    unit: string;
  },
  options: SeedOptions
): Stage2Seed {
  return {
    categoryMain,
    categorySub,
    title,
    spec,
    price: options.price,
    shipping: options.shipping ?? "택배",
    stockHint:
      options.stockHint === undefined
        ? options.price === null
          ? null
          : 60
        : options.stockHint,
    brand: options.brand ?? defaults.brand,
    manufacturer: options.manufacturer ?? defaults.manufacturer,
    origin: options.origin ?? defaults.origin,
    unit: options.unit ?? defaults.unit,
    quoteRequired: options.quoteRequired ?? options.price === null,
    bulkyItem: options.bulkyItem ?? false,
    featuredCandidate: options.featuredCandidate ?? false,
    sourceSite: defaults.sourceSite,
    sourceQuery: options.sourceQuery ?? title,
    searchKeywords: options.searchKeywords ?? [categorySub, title, spec].filter(Boolean),
    applications: options.applications ?? [],
    caution: options.caution,
    collectionMode: options.collectionMode ?? "stage2-public-reference-seed",
  };
}

const hardwareDefaults = {
  brand: "CK Select",
  manufacturer: "국내 철물 협력사",
  origin: "대한민국",
  sourceSite: "네이버쇼핑 공개 검색",
  unit: "1개",
};

const buildingDefaults = {
  brand: "CK Build",
  manufacturer: "국내 건재 협력사",
  origin: "대한민국",
  sourceSite: "건축자재 공개 검색",
  unit: "1포",
};

const aggregateDefaults = {
  brand: "CK Stone",
  manufacturer: "국내 골재 협력사",
  origin: "대한민국",
  sourceSite: "골재 공개 검색",
  unit: "1포",
};

const woodDefaults = {
  brand: "CK Timber",
  manufacturer: "국내 목재 협력사",
  origin: "대한민국",
  sourceSite: "목재 공개 검색",
  unit: "1본",
};

const pvcDefaults = {
  brand: "CK Pipe",
  manufacturer: "국내 배관 협력사",
  origin: "대한민국",
  sourceSite: "설비자재 공개 검색",
  unit: "1개",
};

const toolDefaults = {
  brand: "CK Tool",
  manufacturer: "국내 유통 협력사",
  origin: "중국",
  sourceSite: "공구몰 공개 검색",
  unit: "1개",
};

const hardware = (
  categorySub: string,
  title: string,
  spec: string,
  options: SeedOptions
) => buildSeed("철물", categorySub, title, spec, hardwareDefaults, options);

const building = (
  categorySub: string,
  title: string,
  spec: string,
  options: SeedOptions
) => buildSeed("건재", categorySub, title, spec, buildingDefaults, options);

const aggregate = (
  categorySub: string,
  title: string,
  spec: string,
  options: SeedOptions
) => buildSeed("골재", categorySub, title, spec, aggregateDefaults, options);

const wood = (
  categorySub: string,
  title: string,
  spec: string,
  options: SeedOptions
) => buildSeed("목재", categorySub, title, spec, woodDefaults, options);

const pvc = (
  categorySub: string,
  title: string,
  spec: string,
  options: SeedOptions
) => buildSeed("PVC배관 및 부속", categorySub, title, spec, pvcDefaults, options);

const tool = (
  categorySub: string,
  title: string,
  spec: string,
  options: SeedOptions
) => buildSeed("공구", categorySub, title, spec, toolDefaults, options);

export const stage2CatalogSeeds: Stage2Seed[] = [
  hardware("실리콘", "건축용 중성 실리콘 300ml", "300ml", {
    price: 3900,
    stockHint: 160,
    featuredCandidate: true,
    searchKeywords: ["실리콘", "중성실리콘", "건축용 실리콘", "300ml"],
    applications: ["창호 실링", "조인트 마감", "패널 틈새 보수"],
  }),
  hardware("실리콘", "변성 실리콘 300ml", "300ml", {
    price: 5900,
    stockHint: 120,
    searchKeywords: ["변성실리콘", "외장 실리콘", "건축용 실링"],
    applications: ["외장 패널 마감", "메탈 주변 보수", "방수 보강"],
  }),
  hardware("실리콘", "욕실 바이오 실리콘 300ml", "300ml", {
    price: 5200,
    stockHint: 140,
    searchKeywords: ["바이오 실리콘", "욕실 실리콘", "주방 실링"],
    applications: ["욕실 마감", "주방 틈새 실링", "실내 습기 구간 보수"],
  }),
  hardware("실리콘", "내열 실리콘 300ml", "300ml", {
    price: 6400,
    stockHint: 80,
    searchKeywords: ["내열 실리콘", "고온 실리콘", "300ml"],
    applications: ["배기 덕트 주변 보수", "보일러 주변 마감", "고온 부위 실링"],
  }),
  hardware("앙카볼트", "스텐 앙카볼트 M8 x 70", "M8 x 70mm", {
    price: 1200,
    stockHint: 240,
    searchKeywords: ["앙카볼트", "M8", "스텐앙카"],
    applications: ["브라켓 고정", "설비 부속 체결", "콘크리트 고정"],
  }),
  hardware("앙카볼트", "스텐 앙카볼트 M10 x 100", "M10 x 100mm", {
    price: 1800,
    stockHint: 220,
    featuredCandidate: true,
    searchKeywords: ["앙카볼트", "M10", "고정볼트"],
    applications: ["난간 베이스 고정", "설비 프레임 고정", "배관 브라켓 체결"],
  }),
  hardware("앙카볼트", "스텐 앙카볼트 M12 x 120", "M12 x 120mm", {
    price: 2400,
    stockHint: 180,
    searchKeywords: ["앙카볼트", "M12", "스텐볼트"],
    applications: ["중량 브라켓 고정", "기계 장비 체결", "철물 보강"],
  }),
  hardware("철판앙카", "철판앙카 M8", "M8", {
    price: 780,
    stockHint: 260,
    searchKeywords: ["철판앙카", "M8 앙카", "보강철물"],
    applications: ["앵글 프레임 고정", "보강 철물 체결", "설비 브라켓 보강"],
  }),
  hardware("철판앙카", "철판앙카 M10", "M10", {
    price: 950,
    stockHint: 210,
    searchKeywords: ["철판앙카", "M10", "콘크리트앙카"],
    applications: ["중량 브라켓 보강", "금속 프레임 고정", "난간 하부 체결"],
  }),
  hardware("칼블럭", "나일론 칼블럭 6mm", "6mm", {
    price: 90,
    stockHint: 900,
    searchKeywords: ["칼블럭", "나일론 앙카", "6mm"],
    applications: ["벽체 부속 체결", "가벼운 선반 고정", "간단한 내장 보강"],
  }),
  hardware("칼블럭", "나일론 칼블럭 8mm", "8mm", {
    price: 120,
    stockHint: 840,
    searchKeywords: ["칼블럭", "8mm", "고정 앙카"],
    applications: ["벽체 앵커링", "부속 체결", "가벼운 철물 보강"],
  }),
  hardware("피스/스크류", "석고보드 피스 6 x 25", "6 x 25mm", {
    price: 5900,
    stockHint: 160,
    unit: "1박스",
    searchKeywords: ["피스", "석고보드피스", "6x25"],
    applications: ["석고보드 고정", "경량철골 마감", "보드류 보수"],
  }),
  hardware("피스/스크류", "석고보드 피스 6 x 38", "6 x 38mm", {
    price: 7200,
    stockHint: 170,
    unit: "1박스",
    searchKeywords: ["피스", "석고보드피스", "6x38"],
    applications: ["석고보드 체결", "경량벽체 시공", "보강 프레임 마감"],
  }),
  hardware("볼트/너트/와셔", "육각볼트 너트 와셔 세트 M10", "M10", {
    price: 950,
    stockHint: 480,
    unit: "1세트",
    searchKeywords: ["볼트", "너트", "와셔", "M10"],
    applications: ["철물 조립", "설비 체결", "프레임 보수"],
  }),
  hardware("볼트/너트/와셔", "육각볼트 너트 와셔 세트 M12", "M12", {
    price: 1250,
    stockHint: 420,
    unit: "1세트",
    searchKeywords: ["볼트", "너트", "와셔", "M12"],
    applications: ["중량 철물 체결", "기계 프레임 조립", "금속 구조 보강"],
  }),
  hardware("스텐브라켓", "스텐 L브라켓 40 x 40", "40 x 40mm", {
    price: 1350,
    stockHint: 190,
    searchKeywords: ["스텐브라켓", "L브라켓", "40x40"],
    applications: ["선반 보강", "가구 보수", "목재 프레임 체결"],
  }),
  hardware("고리볼트", "고리볼트 M10", "M10", {
    price: 2200,
    stockHint: 110,
    searchKeywords: ["고리볼트", "M10", "걸이볼트"],
    applications: ["천장 보조 체결", "간단한 고정 포인트 구성", "배관 행거 보강"],
  }),
  hardware("케이블타이", "케이블타이 흑색 300mm", "300mm", {
    price: 2800,
    stockHint: 260,
    unit: "1봉",
    searchKeywords: ["케이블타이", "300mm", "흑색타이"],
    applications: ["배선 정리", "임시 고정", "현장 자재 묶음"],
  }),
  building("시멘트", "포틀랜드 시멘트 25kg", "25kg", {
    price: 6900,
    stockHint: 90,
    bulkyItem: true,
    featuredCandidate: true,
    searchKeywords: ["시멘트", "포틀랜드", "25kg"],
    applications: ["미장 보수", "바닥 보강", "기초 작업"],
  }),
  building("시멘트", "백시멘트 20kg", "20kg", {
    price: 8600,
    stockHint: 72,
    bulkyItem: true,
    searchKeywords: ["백시멘트", "20kg", "마감시멘트"],
    applications: ["백색 줄눈 보강", "마감 보수", "소형 미장 작업"],
  }),
  building("몰탈", "레미탈 미장 몰탈 40kg", "40kg", {
    price: 7600,
    stockHint: 74,
    bulkyItem: true,
    searchKeywords: ["몰탈", "미장몰탈", "40kg"],
    applications: ["내외벽 미장", "바닥 보수", "균열 메움"],
  }),
  building("드라이몰탈", "드라이몰탈 40kg", "40kg", {
    price: 7900,
    stockHint: 68,
    bulkyItem: true,
    searchKeywords: ["드라이몰탈", "40kg", "레미탈"],
    applications: ["타설 보조", "기초 보수", "소규모 시공"],
  }),
  building("보수몰탈", "보수 몰탈 25kg", "25kg", {
    price: 9800,
    stockHint: 64,
    bulkyItem: true,
    searchKeywords: ["보수몰탈", "25kg", "보수재"],
    applications: ["콘크리트 보수", "바닥 파손 복구", "벽체 보강"],
  }),
  building("타일접착제", "타일 접착제 20kg", "20kg", {
    price: 12800,
    stockHint: 60,
    bulkyItem: true,
    searchKeywords: ["타일접착제", "타일본드", "20kg"],
    applications: ["욕실 타일 시공", "주방 벽면 보수", "실내 바닥 타일 작업"],
  }),
  building("타일접착제", "고탄성 타일 접착제 20kg", "20kg", {
    price: 16800,
    stockHint: 46,
    bulkyItem: true,
    searchKeywords: ["고탄성 타일접착제", "타일본드", "탄성본드"],
    applications: ["대형 타일 시공", "외부 타일 보강", "균열 우려 부위 보수"],
  }),
  building("줄눈재", "타일 줄눈재 2kg", "2kg", {
    price: 5800,
    stockHint: 110,
    searchKeywords: ["줄눈재", "타일줄눈", "2kg"],
    applications: ["욕실 타일 줄눈", "주방 벽면 보수", "타일 마감 보완"],
  }),
  building("방수제", "침투성 방수제 18L", "18L", {
    price: 42000,
    shipping: "화물배송",
    stockHint: 34,
    bulkyItem: true,
    searchKeywords: ["방수제", "침투성 방수제", "18L"],
    applications: ["옥상 보수", "외벽 방수 보강", "콘크리트 균열 보완"],
  }),
  building("방수제", "탄성 방수제 18kg", "18kg", {
    price: 46500,
    shipping: "화물배송",
    stockHint: 32,
    bulkyItem: true,
    searchKeywords: ["탄성방수제", "18kg", "방수도막"],
    applications: ["옥상 도막 보수", "외부 슬라브 보강", "상가 옥상 유지보수"],
  }),
  building("우레탄폼", "건축용 우레탄폼 750ml", "750ml", {
    price: 6400,
    stockHint: 140,
    searchKeywords: ["우레탄폼", "건축용폼", "750ml"],
    applications: ["창호 틈새 충진", "배관 관통부 보완", "단열 보강"],
  }),
  building("석고보드", "일반 석고보드 9.5T 900 x 1800", "9.5T / 900 x 1800mm", {
    price: null,
    shipping: "현장납품 문의",
    stockHint: null,
    unit: "1장",
    quoteRequired: true,
    bulkyItem: true,
    featuredCandidate: true,
    searchKeywords: ["석고보드", "9.5T", "900x1800"],
    applications: ["천장 마감", "경량 벽체 시공", "내장 보수"],
  }),
  building("석고보드", "방수 석고보드 9.5T 900 x 1800", "9.5T / 900 x 1800mm", {
    price: null,
    shipping: "현장납품 문의",
    stockHint: null,
    unit: "1장",
    quoteRequired: true,
    bulkyItem: true,
    searchKeywords: ["방수석고보드", "9.5T", "욕실보드"],
    applications: ["습식 공간 보강", "욕실 벽체 시공", "내수성 보강"],
  }),
  building("CRC보드", "CRC 보드 6T 900 x 1800", "6T / 900 x 1800mm", {
    price: null,
    shipping: "현장납품 문의",
    stockHint: null,
    unit: "1장",
    quoteRequired: true,
    bulkyItem: true,
    searchKeywords: ["CRC보드", "6T", "시멘트보드"],
    applications: ["외부 마감 보강", "내수 벽체 작업", "설비실 보드 시공"],
  }),
  building("단열재", "비드법 단열재 50T", "50T / 900 x 1800mm", {
    price: null,
    shipping: "현장납품 문의",
    stockHint: null,
    unit: "1장",
    quoteRequired: true,
    bulkyItem: true,
    searchKeywords: ["단열재", "비드법단열재", "50T"],
    applications: ["외벽 단열", "바닥 단열 보강", "경량 벽체 보강"],
  }),
  building("프라이머", "수성 프라이머 14L", "14L", {
    price: 26500,
    shipping: "화물배송",
    stockHint: 38,
    bulkyItem: true,
    searchKeywords: ["프라이머", "수성프라이머", "14L"],
    applications: ["바탕면 처리", "방수 전처리", "타일 접착 전 하도 작업"],
  }),
  building("퍼티", "인테리어 퍼티 25kg", "25kg", {
    price: 11800,
    stockHint: 62,
    bulkyItem: true,
    searchKeywords: ["퍼티", "25kg", "내장퍼티"],
    applications: ["벽면 평활 작업", "도장 전 보수", "석고보드 조인트 정리"],
  }),
  building("코킹재", "다목적 코킹재 300ml", "300ml", {
    price: 4300,
    stockHint: 120,
    unit: "1개",
    searchKeywords: ["코킹재", "300ml", "실링재"],
    applications: ["내장 틈새 보수", "창호 주변 마감", "가구/마감 보완"],
  }),
  aggregate("모래", "세척 모래 20kg", "20kg", {
    price: 6900,
    stockHint: 78,
    bulkyItem: true,
    searchKeywords: ["세척모래", "모래", "20kg"],
    applications: ["미장 보수", "바닥 보충", "틈새 메움"],
  }),
  aggregate("모래", "미장용 모래 20kg", "20kg", {
    price: 7200,
    stockHint: 70,
    bulkyItem: true,
    searchKeywords: ["미장용 모래", "20kg", "모래"],
    applications: ["미장 작업", "보수 몰탈 배합", "소형 현장 보충"],
  }),
  aggregate("모래", "강모래 1루베", "1루베", {
    price: null,
    shipping: "현장납품 문의",
    stockHint: null,
    unit: "1회차",
    quoteRequired: true,
    bulkyItem: true,
    featuredCandidate: true,
    searchKeywords: ["강모래", "1루베", "대량골재"],
    applications: ["대량 미장 작업", "토목 보조", "현장 메움"],
  }),
  aggregate("자갈", "강자갈 20kg", "20kg", {
    price: 7800,
    stockHint: 64,
    bulkyItem: true,
    searchKeywords: ["강자갈", "자갈", "20kg"],
    applications: ["조경 바닥 마감", "배수층 보강", "외부 바닥 채움"],
  }),
  aggregate("자갈", "조경용 자갈 백색 20kg", "20kg", {
    price: 9200,
    stockHint: 52,
    bulkyItem: true,
    searchKeywords: ["조경용 자갈", "백색 자갈", "20kg"],
    applications: ["조경 마감", "화단 정리", "외부 디자인 포인트"],
  }),
  aggregate("자갈", "배수용 자갈 25kg", "25kg", {
    price: 8600,
    stockHint: 58,
    bulkyItem: true,
    searchKeywords: ["배수용 자갈", "25kg", "골재"],
    applications: ["배수층 보강", "맨홀 주변 정리", "바닥 침수 구간 보수"],
  }),
  aggregate("쇄석", "쇄석 25kg", "25kg", {
    price: 8300,
    stockHint: 54,
    bulkyItem: true,
    searchKeywords: ["쇄석", "25kg", "기초 골재"],
    applications: ["기초 다짐", "배수층 보조", "현장 바닥 보강"],
  }),
  aggregate("혼합골재", "혼합골재 40kg", "40kg", {
    price: 11500,
    shipping: "화물배송",
    stockHint: 44,
    bulkyItem: true,
    searchKeywords: ["혼합골재", "40kg", "골재"],
    applications: ["기초 보강", "현장 메움", "배수층 보완"],
  }),
  aggregate("혼합골재", "혼합골재 1톤백", "1톤백", {
    price: null,
    shipping: "현장납품 문의",
    stockHint: null,
    unit: "1톤백",
    quoteRequired: true,
    bulkyItem: true,
    searchKeywords: ["혼합골재", "톤백", "현장납품"],
    applications: ["대량 메움", "기초 보강", "대형 현장 골재 납품"],
  }),
  aggregate("마사토", "마사토 20kg", "20kg", {
    price: 5900,
    stockHint: 82,
    bulkyItem: true,
    searchKeywords: ["마사토", "20kg", "조경토"],
    applications: ["조경 바닥 정리", "흙 보강", "소규모 토목 보수"],
  }),
  aggregate("석분", "석분 20kg", "20kg", {
    price: 6200,
    stockHint: 73,
    bulkyItem: true,
    searchKeywords: ["석분", "20kg", "돌가루"],
    applications: ["바닥 틈새 메움", "포장 보수", "배수층 마감"],
  }),
  aggregate("잡석", "잡석 25kg", "25kg", {
    price: 8100,
    stockHint: 56,
    bulkyItem: true,
    searchKeywords: ["잡석", "25kg", "골재"],
    applications: ["임시 메움", "기초 바닥 정리", "현장 보조 자재"],
  }),
  aggregate("채움재", "채움재 40kg", "40kg", {
    price: 9400,
    shipping: "화물배송",
    stockHint: 48,
    bulkyItem: true,
    searchKeywords: ["채움재", "40kg", "메움재"],
    applications: ["현장 채움", "바닥 레벨 조정", "배관 주변 보강"],
  }),
  aggregate("레미탈용 골재", "레미탈용 골재 20kg", "20kg", {
    price: 7600,
    stockHint: 50,
    bulkyItem: true,
    searchKeywords: ["레미탈용 골재", "20kg", "골재"],
    applications: ["레미탈 보조", "소형 시공", "미장 보수"],
  }),
  aggregate("자갈", "조경용 자갈 혼합색 20kg", "20kg", {
    price: 9400,
    stockHint: 40,
    bulkyItem: true,
    searchKeywords: ["조경용 자갈", "혼합색 자갈", "20kg"],
    applications: ["조경 포인트 마감", "화단 정리", "외부 인테리어"],
  }),
  wood("구조목", "구조목 SPF 38 x 89 x 3600", "38 x 89 x 3600mm", {
    price: null,
    shipping: "현장납품 문의",
    stockHint: null,
    quoteRequired: true,
    bulkyItem: true,
    featuredCandidate: true,
    sourceQuery: "구조목 38x89 3600",
    origin: "캐나다",
    searchKeywords: ["구조목", "SPF", "38x89", "3600"],
    applications: ["목구조 프레임", "가설 보강", "벽체 골조"],
  }),
  wood("구조목", "구조목 SPF 38 x 140 x 3600", "38 x 140 x 3600mm", {
    price: null,
    shipping: "현장납품 문의",
    stockHint: null,
    quoteRequired: true,
    bulkyItem: true,
    sourceQuery: "구조목 38x140 3600",
    origin: "캐나다",
    searchKeywords: ["구조목", "38x140", "SPF"],
    applications: ["장선 보강", "프레임 제작", "중량 구조 보강"],
  }),
  wood("각재", "각재 30 x 30 x 3600", "30 x 30 x 3600mm", {
    price: 4200,
    shipping: "현장납품 문의",
    stockHint: 60,
    quoteRequired: true,
    bulkyItem: true,
    searchKeywords: ["각재", "30x30", "보강목재"],
    applications: ["보조 프레임", "경량 보강", "가설 작업"],
  }),
  wood("각목", "각목 45 x 45 x 3600", "45 x 45 x 3600mm", {
    price: 6200,
    shipping: "현장납품 문의",
    stockHint: 54,
    quoteRequired: true,
    bulkyItem: true,
    searchKeywords: ["각목", "45x45", "목재보강"],
    applications: ["가설 구조", "목재 보강", "간단한 프레임 조립"],
  }),
  wood("투바이", "투바이 2 x 4 x 3600", "2 x 4 x 3600", {
    price: 7800,
    shipping: "현장납품 문의",
    stockHint: 52,
    quoteRequired: true,
    bulkyItem: true,
    origin: "캐나다",
    searchKeywords: ["투바이", "2x4", "목재"],
    applications: ["내장 프레임", "가설 보강", "목구조 보조재"],
  }),
  wood("투바이", "투바이 2 x 6 x 3600", "2 x 6 x 3600", {
    price: 9800,
    shipping: "현장납품 문의",
    stockHint: 46,
    quoteRequired: true,
    bulkyItem: true,
    origin: "캐나다",
    searchKeywords: ["투바이", "2x6", "구조목"],
    applications: ["장선 보강", "벽체 골조", "중량 프레임 보조"],
  }),
  wood("합판", "일반합판 8.5T 1220 x 2440", "8.5T / 1220 x 2440mm", {
    price: 17600,
    shipping: "현장납품 문의",
    stockHint: 44,
    unit: "1장",
    quoteRequired: true,
    bulkyItem: true,
    origin: "인도네시아",
    searchKeywords: ["합판", "8.5T", "1220x2440"],
    applications: ["가설 보강", "내장 보수", "바닥 보강"],
  }),
  wood("합판", "내수합판 11.5T 1220 x 2440", "11.5T / 1220 x 2440mm", {
    price: 26800,
    shipping: "현장납품 문의",
    stockHint: 38,
    unit: "1장",
    quoteRequired: true,
    bulkyItem: true,
    origin: "인도네시아",
    featuredCandidate: true,
    searchKeywords: ["내수합판", "11.5T", "1220x2440"],
    applications: ["습기 구간 보강", "바닥 보수", "가설 구조물"],
  }),
  wood("MDF", "MDF 12T 1220 x 2440", "12T / 1220 x 2440mm", {
    price: 19800,
    shipping: "현장납품 문의",
    stockHint: 36,
    unit: "1장",
    quoteRequired: true,
    bulkyItem: true,
    searchKeywords: ["MDF", "12T", "1220x2440"],
    applications: ["가구 제작", "실내 판재 보강", "인테리어 가공"],
  }),
  wood("MDF", "MDF 18T 1220 x 2440", "18T / 1220 x 2440mm", {
    price: 24800,
    shipping: "현장납품 문의",
    stockHint: 32,
    unit: "1장",
    quoteRequired: true,
    bulkyItem: true,
    searchKeywords: ["MDF", "18T", "가구판재"],
    applications: ["가구 구조판", "실내 보강", "목공 작업"],
  }),
  wood("OSB", "OSB 합판 11T 1220 x 2440", "11T / 1220 x 2440mm", {
    price: 18300,
    shipping: "현장납품 문의",
    stockHint: 34,
    unit: "1장",
    quoteRequired: true,
    bulkyItem: true,
    origin: "유럽",
    searchKeywords: ["OSB", "11T", "구조용 판재"],
    applications: ["바닥 보강", "가설 구조", "창고 보수"],
  }),
  wood("방부목", "방부목 38 x 140 x 3600", "38 x 140 x 3600mm", {
    price: null,
    shipping: "현장납품 문의",
    stockHint: null,
    quoteRequired: true,
    bulkyItem: true,
    searchKeywords: ["방부목", "38x140", "데크 구조목"],
    applications: ["데크 프레임", "외부 구조 보강", "야외 시설 유지보수"],
  }),
  wood("데크재", "데크재 21 x 120 x 3600", "21 x 120 x 3600mm", {
    price: null,
    shipping: "현장납품 문의",
    stockHint: null,
    quoteRequired: true,
    bulkyItem: true,
    searchKeywords: ["데크재", "21x120", "야외목재"],
    applications: ["야외 데크 시공", "테라스 보수", "조경 목재 마감"],
  }),
  wood("루바", "루바 12 x 100 x 2400", "12 x 100 x 2400mm", {
    price: 7600,
    shipping: "현장납품 문의",
    stockHint: 42,
    quoteRequired: true,
    bulkyItem: true,
    searchKeywords: ["루바", "12x100", "인테리어 목재"],
    applications: ["실내 벽면 마감", "천장 포인트 시공", "인테리어 보강"],
  }),
  wood("집성목", "집성목 18T 600 x 2400", "18T / 600 x 2400mm", {
    price: 22800,
    shipping: "현장납품 문의",
    stockHint: 28,
    unit: "1장",
    quoteRequired: true,
    bulkyItem: true,
    searchKeywords: ["집성목", "18T", "600x2400"],
    applications: ["선반 제작", "가구 상판", "목공 작업"],
  }),
  wood("폼목재", "폼목재 30 x 50 x 2400", "30 x 50 x 2400mm", {
    price: 3600,
    shipping: "현장납품 문의",
    stockHint: 48,
    quoteRequired: true,
    bulkyItem: true,
    searchKeywords: ["폼목재", "30x50", "목재 보조재"],
    applications: ["거푸집 보조", "가설 보강", "현장 목재 보충"],
  }),
  pvc("PVC 파이프", "PVC 배수 파이프 50A", "50A / 4m", {
    price: null,
    shipping: "현장납품 문의",
    stockHint: null,
    unit: "1본",
    quoteRequired: true,
    bulkyItem: true,
    featuredCandidate: true,
    searchKeywords: ["PVC 파이프", "50A", "배수관"],
    applications: ["욕실 배수 라인", "옥외 배수 보수", "설비 배관 교체"],
  }),
  pvc("PVC 파이프", "PVC 배수 파이프 75A", "75A / 4m", {
    price: null,
    shipping: "현장납품 문의",
    stockHint: null,
    unit: "1본",
    quoteRequired: true,
    bulkyItem: true,
    searchKeywords: ["PVC 파이프", "75A", "배수관"],
    applications: ["주배관 보수", "설비 배수 라인", "현장 배관 교체"],
  }),
  pvc("PVC 파이프", "PVC 배수 파이프 100A", "100A / 4m", {
    price: null,
    shipping: "현장납품 문의",
    stockHint: null,
    unit: "1본",
    quoteRequired: true,
    bulkyItem: true,
    searchKeywords: ["PVC 파이프", "100A", "대구경 배관"],
    applications: ["대형 배수 라인", "상가 설비 배관", "현장 배수 보강"],
  }),
  pvc("VG2", "VG2 전선관 16mm", "16mm / 4m", {
    price: null,
    shipping: "현장납품 문의",
    stockHint: null,
    unit: "1본",
    quoteRequired: true,
    bulkyItem: true,
    searchKeywords: ["VG2", "16mm", "전선관"],
    applications: ["배선 보강", "전기 설비 시공", "전선관 교체"],
  }),
  pvc("VG2", "VG2 전선관 22mm", "22mm / 4m", {
    price: null,
    shipping: "현장납품 문의",
    stockHint: null,
    unit: "1본",
    quoteRequired: true,
    bulkyItem: true,
    searchKeywords: ["VG2", "22mm", "전선관"],
    applications: ["배선 라인 확장", "분전반 배관", "전기 설비 보수"],
  }),
  pvc("엘보", "PVC 엘보 50A", "50A", {
    price: 980,
    stockHint: 260,
    searchKeywords: ["PVC 엘보", "50A", "배관부속"],
    applications: ["배수 방향 전환", "설비 보수", "현장 배관 교체"],
  }),
  pvc("엘보", "PVC 엘보 100A", "100A", {
    price: 1680,
    stockHint: 180,
    searchKeywords: ["PVC 엘보", "100A", "대구경 엘보"],
    applications: ["대구경 방향 전환", "주배관 보수", "배수 라인 시공"],
  }),
  pvc("티", "PVC 티 50A", "50A", {
    price: 1280,
    stockHint: 220,
    searchKeywords: ["PVC 티", "50A", "배수 분기"],
    applications: ["배수 분기 배관", "설비 보수", "현장 배관 연장"],
  }),
  pvc("티", "PVC 티 75A", "75A", {
    price: 1850,
    stockHint: 180,
    searchKeywords: ["PVC 티", "75A", "배관부속"],
    applications: ["중간 분기 배관", "주배관 보수", "설비 연결"],
  }),
  pvc("소켓", "PVC 소켓 100A", "100A", {
    price: 1420,
    stockHint: 150,
    searchKeywords: ["PVC 소켓", "100A", "배관연결"],
    applications: ["배관 연장", "배수 라인 보수", "설비 교체"],
  }),
  pvc("유니온", "PVC 유니온 50A", "50A", {
    price: 3200,
    stockHint: 96,
    searchKeywords: ["PVC 유니온", "50A", "배관유지보수"],
    applications: ["배관 분리 구간", "설비 유지보수", "펌프 라인 작업"],
  }),
  pvc("레듀샤", "PVC 레듀샤 100A x 75A", "100A x 75A", {
    price: 1850,
    stockHint: 120,
    searchKeywords: ["레듀샤", "100x75A", "배관부속"],
    applications: ["구경 축소 배관", "배수 라인 연결", "현장 보수"],
  }),
  pvc("캡", "PVC 캡 50A", "50A", {
    price: 850,
    stockHint: 210,
    searchKeywords: ["PVC 캡", "50A", "막음부속"],
    applications: ["배관 끝단 마감", "임시 막음", "설비 점검"],
  }),
  pvc("플러그", "PVC 플러그 25A", "25A", {
    price: 780,
    stockHint: 170,
    searchKeywords: ["PVC 플러그", "25A", "막음부속"],
    applications: ["부속 막음", "점검구 보조", "임시 배관 차단"],
  }),
  pvc("밸브류", "PVC 볼밸브 50A", "50A", {
    price: 18600,
    stockHint: 38,
    searchKeywords: ["PVC 볼밸브", "50A", "배관 밸브"],
    applications: ["라인 개폐", "펌프 연결", "설비 유지보수"],
  }),
  pvc("접착제", "PVC 접착제 500g", "500g", {
    price: 5800,
    stockHint: 135,
    unit: "1캔",
    searchKeywords: ["PVC 접착제", "배관본드", "500g"],
    applications: ["PVC 파이프 접합", "부속 시공", "배관 보수"],
  }),
  pvc("트랩류", "PVC 배수 트랩 50A", "50A", {
    price: 4800,
    stockHint: 92,
    searchKeywords: ["배수 트랩", "50A", "트랩류"],
    applications: ["싱크 배수 보강", "악취 차단 보조", "배수 설비 교체"],
  }),
  pvc("점검구", "PVC 점검구 100A", "100A", {
    price: 6200,
    stockHint: 88,
    searchKeywords: ["점검구", "100A", "배관 점검구"],
    applications: ["배관 점검 포인트 구성", "청소구 보강", "설비 유지보수"],
  }),
  pvc("클램프", "PVC 클램프 50A", "50A", {
    price: 950,
    stockHint: 160,
    searchKeywords: ["PVC 클램프", "50A", "배관고정"],
    applications: ["배관 고정", "벽체 체결", "보조 브라켓 구성"],
  }),
  tool("해머드릴", "충전 해머드릴 20V", "20V", {
    price: 129000,
    stockHint: 18,
    unit: "1세트",
    featuredCandidate: true,
    searchKeywords: ["해머드릴", "20V", "충전드릴"],
    applications: ["콘크리트 천공", "앙카 시공", "설비 보수"],
  }),
  tool("해머드릴", "충전 해머드릴 18V 브러시리스", "18V", {
    price: 169000,
    stockHint: 14,
    unit: "1세트",
    searchKeywords: ["해머드릴", "18V", "브러시리스"],
    applications: ["중량 천공 작업", "반복 앙카 시공", "현장 장비 보강"],
  }),
  tool("임팩드라이버", "충전 임팩드라이버 18V", "18V", {
    price: 112000,
    stockHint: 21,
    unit: "1세트",
    featuredCandidate: true,
    searchKeywords: ["임팩드라이버", "18V", "충전임팩"],
    applications: ["피스 체결", "목재 보강", "현장 유지보수"],
  }),
  tool("전동드릴", "충전 전동드릴 12V", "12V", {
    price: 79000,
    stockHint: 24,
    unit: "1세트",
    searchKeywords: ["전동드릴", "12V", "충전드릴"],
    applications: ["가벼운 천공", "비트 작업", "설비 보수"],
  }),
  tool("그라인더", "디스크 그라인더 4인치", "4인치", {
    price: 69000,
    stockHint: 26,
    unit: "1대",
    searchKeywords: ["그라인더", "4인치", "연마공구"],
    applications: ["철물 절단", "용접면 정리", "간단한 연마 작업"],
  }),
  tool("컷쏘", "컷쏘 18V", "18V", {
    price: 148000,
    stockHint: 12,
    unit: "1세트",
    searchKeywords: ["컷쏘", "18V", "절단공구"],
    applications: ["배관 절단", "목재 절단", "철물 해체 작업"],
  }),
  tool("직소", "직소 650W", "650W", {
    price: 76000,
    stockHint: 16,
    unit: "1대",
    searchKeywords: ["직소", "650W", "절단공구"],
    applications: ["목재 곡선 절단", "판재 가공", "인테리어 보조 작업"],
  }),
  tool("멀티커터", "멀티커터 300W", "300W", {
    price: 88000,
    stockHint: 15,
    unit: "1대",
    searchKeywords: ["멀티커터", "300W", "절단공구"],
    applications: ["몰딩 보수", "협소부 절단", "마감 자재 교체"],
  }),
  tool("줄자", "자동 줄자 5.5m", "5.5m", {
    price: 5400,
    stockHint: 130,
    searchKeywords: ["줄자", "5.5m", "자동줄자"],
    applications: ["치수 측정", "현장 산출", "자재 검수"],
  }),
  tool("니퍼", "강력 니퍼 8인치", "8인치", {
    price: 9800,
    stockHint: 88,
    searchKeywords: ["니퍼", "8인치", "절단공구"],
    applications: ["철선 절단", "배선 정리", "소모품 절단"],
  }),
  tool("플라이어", "롱노즈 플라이어 8인치", "8인치", {
    price: 8600,
    stockHint: 92,
    searchKeywords: ["플라이어", "롱노즈", "8인치"],
    applications: ["협소부 체결", "배선 정리", "간단한 철물 조정"],
  }),
  tool("스패너", "양구 스패너 10 x 12", "10 x 12mm", {
    price: 4200,
    stockHint: 90,
    searchKeywords: ["스패너", "10x12", "양구스패너"],
    applications: ["볼트 체결", "설비 보수", "철물 조립"],
  }),
  tool("몽키", "몽키 렌치 10인치", "10인치", {
    price: 11800,
    stockHint: 74,
    searchKeywords: ["몽키", "몽키렌치", "10인치"],
    applications: ["배관 체결", "철물 보수", "현장 유지보수"],
  }),
  tool("실리콘건", "실리콘건 수동형", "수동형", {
    price: 6800,
    stockHint: 72,
    searchKeywords: ["실리콘건", "수동실리콘건", "실링공구"],
    applications: ["실리콘 도포", "본드 작업", "틈새 보수"],
  }),
  tool("코킹건", "코킹건 프리미엄형", "프리미엄형", {
    price: 9800,
    stockHint: 58,
    searchKeywords: ["코킹건", "실리콘건", "프리미엄형"],
    applications: ["점도 높은 실링재 도포", "마감 작업", "틈새 보수"],
  }),
  tool("드릴비트", "콘크리트 드릴비트 8 x 160", "8 x 160mm", {
    price: 4200,
    stockHint: 145,
    searchKeywords: ["드릴비트", "콘크리트비트", "8x160"],
    applications: ["앙카 천공", "콘크리트 타공", "브라켓 시공"],
  }),
  tool("비트세트", "비트세트 32pcs", "32pcs", {
    price: 14800,
    stockHint: 66,
    searchKeywords: ["비트세트", "32pcs", "드라이버비트"],
    applications: ["다양한 체결 작업", "공구함 보충", "현장 유지보수"],
  }),
  tool("작업장갑", "작업장갑 코팅형 L", "L", {
    price: 2100,
    stockHint: 220,
    unit: "1켤레",
    origin: "베트남",
    searchKeywords: ["작업장갑", "코팅장갑", "L"],
    applications: ["일반 현장 작업", "자재 운반", "철물 조립"],
  }),
  tool("커터칼", "커터칼 대형", "대형", {
    price: 3200,
    stockHint: 150,
    searchKeywords: ["커터칼", "대형", "절단공구"],
    applications: ["포장 절개", "보드 재단 보조", "현장 소모 작업"],
  }),
  hardware("철물", "범용 철물 부속", "", {
    price: null,
    stockHint: null,
    quoteRequired: true,
    bulkyItem: false,
    collectionMode: "stage2-low-quality-seed",
    searchKeywords: ["철물", "부속"],
    applications: [],
  }),
  pvc("배관부속", "PVC 부속 모음", "", {
    price: null,
    stockHint: null,
    quoteRequired: true,
    bulkyItem: false,
    collectionMode: "stage2-low-quality-seed",
    searchKeywords: ["PVC", "배관부속"],
    applications: [],
  }),
  tool("공구", "현장 수공구 세트", "", {
    price: null,
    stockHint: null,
    quoteRequired: true,
    bulkyItem: false,
    collectionMode: "stage2-low-quality-seed",
    searchKeywords: ["공구", "수공구"],
    applications: [],
  }),
];
