import type {
  CatalogCategoryMeta,
  CompanyInfo,
  ShippingPolicy,
} from "@/lib/types";
import { getSiteOrigin } from "@/lib/site";

export const companyInfo: CompanyInfo = {
  companyName: "주식회사 씨케이코리아",
  ceo: "김혜영",
  businessNumber: "609-86-14101",
  // Final registration number is not available yet. Keep a clear placeholder only.
  ecommerceNumber: "[통신판매업 신고번호] (등록 후 반영 예정)",
  phone: "055-266-7007",
  email: "khy030900@naver.com",
  address: "경상남도 창원시 성산구 공단로 770(천선동)",
  hours: "평일 09:00 - 18:00",
  hostProvider: "[호스팅 제공자]",
  privacyOfficer: "[개인정보 보호책임자명]",
  privacyPolicyEffectiveDate: "[개인정보 처리방침 시행일]",
  kakaoLabel: "카카오 상담",
  heroTitle:
    "건축자재 · 안전용품 · 철물 · 공구를 온라인으로 빠르게 주문하는 씨케이코리아 자사몰",
  heroSubtitle:
    "주식회사 씨케이코리아의 건축자재 전문 자사몰입니다. 건축자재, 철물, 공구, 안전용품은 온라인으로 바로 확인하고, 대량 발주나 현장 납품 건은 견적 문의로 빠르게 연결할 수 있습니다.",
  metaTitle: "건축자재 도소매 온라인몰 | 주식회사 씨케이코리아",
  metaDescription:
    "주식회사 씨케이코리아 자사몰. 건축자재, 철물, 공구, 안전용품을 온라인으로 주문하고 대량 납품 및 현장 배송은 견적으로 문의할 수 있는 건축자재 전문몰입니다.",
  // Final production domain is not connected yet. Use env or local fallback.
  domain: getSiteOrigin(),
};

export const catalogCategories: CatalogCategoryMeta[] = [
  {
    name: "철물",
    description: "앙카, 볼트, 피스, 브라켓, 경첩 등 체결·고정 철물 품목",
    lead: "체결과 보강이 필요한 현장에서 가장 자주 찾는 기본 철물류",
    image: "/images/catalog/hardware.svg",
    href: "/products?category=%EC%B2%A0%EB%AC%BC",
    accent: "from-slate-900 via-slate-800 to-slate-700",
  },
  {
    name: "건재",
    description: "몰탈, 타일접착제, 보수재, 단열·마감 부자재",
    lead: "시공·보수·마감 공정 전반을 받쳐주는 건재 라인업",
    image: "/images/catalog/construction-materials.svg",
    href: "/products?category=%EA%B1%B4%EC%9E%AC",
    accent: "from-stone-900 via-stone-800 to-zinc-700",
  },
  {
    name: "골재",
    description: "모래, 자갈, 쇄석, 마사토, 채움재 등 중량 자재",
    lead: "배수·충진·조경·기초 작업에 쓰는 현장형 골재 품목",
    image: "/images/catalog/aggregate.svg",
    href: "/products?category=%EA%B3%A8%EC%9E%AC",
    accent: "from-amber-900 via-amber-800 to-stone-700",
  },
  {
    name: "목재",
    description: "구조목, 합판, MDF, 방부목, 루바, 몰딩류",
    lead: "구조부터 마감까지 폭넓게 대응하는 목재/판재 상품군",
    image: "/images/catalog/lumber.svg",
    href: "/products?category=%EB%AA%A9%EC%9E%AC",
    accent: "from-orange-900 via-amber-800 to-amber-700",
  },
  {
    name: "PVC 배관 및 부속",
    description: "파이프, 엘보, 티, 소켓, 밸브, 점검구, 트랩류",
    lead: "배수·급수·연결 작업에 필요한 PVC 자재를 한 번에",
    image: "/images/catalog/pvc.svg",
    href: "/products?category=PVC%20%EB%B0%B0%EA%B4%80%20%EB%B0%8F%20%EB%B6%80%EC%86%8D",
    accent: "from-sky-900 via-sky-800 to-cyan-700",
  },
  {
    name: "공구",
    description: "수공구, 전동공구, 비트, 절단석, 측정공구",
    lead: "시공·절단·체결·가공 작업용 공구와 소모품 구성",
    image: "/images/catalog/tools.svg",
    href: "/products?category=%EA%B3%B5%EA%B5%AC",
    accent: "from-slate-950 via-indigo-950 to-slate-800",
  },
  {
    name: "전기자재",
    description: "절연테이프, 멀티탭, 콘센트, 스위치, 보호관류",
    lead: "현장 보수와 기본 시공에 자주 쓰는 범용 전기자재",
    image: "/images/catalog/electrical.svg",
    href: "/products?category=%EC%A0%84%EA%B8%B0%EC%9E%90%EC%9E%AC",
    accent: "from-blue-900 via-indigo-800 to-sky-700",
  },
  {
    name: "안전용품",
    description: "장갑, 안전모, 보안경, 마스크, 조끼, 안전화",
    lead: "작업 전 안전 확보를 위한 현장 보호구 중심 구성",
    image: "/images/catalog/safety.svg",
    href: "/products?category=%EC%95%88%EC%A0%84%EC%9A%A9%ED%92%88",
    accent: "from-emerald-900 via-teal-800 to-green-700",
  },
  {
    name: "접착제/실리콘",
    description: "중성·변성 실리콘, 에폭시, 본드, 배관용 접착제",
    lead: "실링·접착·충진 작업에 바로 투입할 수 있는 소모재",
    image: "/images/catalog/adhesives.svg",
    href: "/products?category=%EC%A0%91%EC%B0%A9%EC%A0%9C%2F%EC%8B%A4%EB%A6%AC%EC%BD%98",
    accent: "from-rose-900 via-orange-800 to-amber-700",
  },
  {
    name: "소모품/부자재",
    description: "테이프, 작업비닐, 브러시, 롤러, 사포, 보조 부자재",
    lead: "현장 운영에서 빠지기 쉬운 소모품과 보조 부자재 모음",
    image: "/images/catalog/consumables.svg",
    href: "/products?category=%EC%86%8C%EB%AA%A8%ED%92%88%2F%EB%B6%80%EC%9E%90%EC%9E%AC",
    accent: "from-zinc-900 via-zinc-800 to-slate-700",
  },
];

export const categories = catalogCategories.map((category) => category.name);

export const shippingOptions = [
  "택배",
  "화물배송",
  "현장납품 문의",
  "배송 문의",
];

export const shippingPolicy: ShippingPolicy = {
  baseFee: 4000,
  freeShippingThreshold: 100000,
  freightNotice:
    "합판, 배관, 장척물, 대량 자재는 화물배송 또는 현장납품 별도 협의가 필요합니다.",
};

export const legalLinks = [
  { href: "/business-info", label: "사업자정보" },
  { href: "/shipping-policy", label: "배송정책" },
  { href: "/refund-policy", label: "교환/반품/환불" },
  { href: "/privacy", label: "개인정보처리방침" },
  { href: "/terms", label: "이용약관" },
  { href: "/disclaimer", label: "상품정보 유의사항" },
];

export const homeTrustPoints = [
  {
    title: "사업자·현장 납품 대응",
    description: "공사현장, 반복 발주, 법인 거래 조건에 맞춰 납기와 물류를 함께 안내합니다.",
  },
  {
    title: "즉시결제 + 견적상담 병행",
    description: "소량 구매는 바로 결제하고, 대량·장척·중량 자재는 견적문의로 자연스럽게 이어집니다.",
  },
  {
    title: "카테고리형 대량 운영 구조",
    description: "철물점, 건재상, 공구상에서 자주 취급하는 품목군 중심으로 빠르게 확장 가능한 구조입니다.",
  },
];

export const homeQuickActions = [
  {
    title: "상품 바로 찾기",
    description: "카테고리별 대표 품목과 인기 규격을 빠르게 비교합니다.",
    href: "/products",
    label: "상품목록 보기",
  },
  {
    title: "대량 발주 문의",
    description: "현장 납품, 화물배송, 반복 구매는 견적 요청으로 더 빠르게 연결됩니다.",
    href: "/quote",
    label: "견적 문의하기",
  },
  {
    title: "회사/취급품목 안내",
    description: "운영 범위, 취급 품목군, 사업자 거래 흐름을 한 번에 확인합니다.",
    href: "/about",
    label: "회사소개 보기",
  },
];

export const faqPreview = [
  {
    question: "가격이 없는 상품은 어떻게 주문하나요?",
    answer:
      "골재, 장척 목재, 대량 자재처럼 운임과 납품 조건의 영향이 큰 품목은 견적문의로 접수해 주시면 빠르게 회신드립니다.",
  },
  {
    question: "화물배송이나 현장납품도 가능한가요?",
    answer:
      "가능합니다. 상품별 배송 방식이 다르며, 화물배송 또는 현장납품 문의로 표시된 품목은 납품지와 수량을 기준으로 별도 안내합니다.",
  },
  {
    question: "사업자 주문과 세금계산서 요청도 되나요?",
    answer:
      "주문과 견적문의 단계에서 사업자 정보와 세금계산서 요청 여부를 함께 남길 수 있고, 관리자에서 발행 상태를 관리할 수 있습니다.",
  },
];

export const companyHighlights = [
  "건축자재, 철물, 공구, 배관, 전기, 안전용품까지 한 번에 운영 가능한 자재몰 구조",
  "소량 즉시결제와 대량 견적문의가 함께 가능한 B2B/B2C 하이브리드 흐름",
  "현장 납품, 화물배송, 반복 구매, 사업자 거래에 대응하는 운영형 구조",
];

export const supplyCategoryHighlights = [
  "체결류 / 앵커류 / 문창호 부속 / 배수·설비 부속",
  "건재 / 단열재 / 보수재 / 마감 부자재 / 현장 잡자재",
  "PVC 배관 및 부속 / 전기자재 / 안전용품 / 실리콘·접착제",
  "절단·연마류 / 측정·마킹 도구 / 작업·청소 용품 / 산업 소모품",
];
