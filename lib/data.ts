import { CompanyInfo, Product } from "@/lib/types";

export const companyInfo: CompanyInfo = {
  companyName: "주식회사 씨케이코리아",
  ceo: "김혜영",
  businessNumber: "609-86-14101",
  ecommerceNumber: "통신판매업 신고번호 추후 입력",
  phone: "055-266-7007",
  email: "khy030900@naver.com",
  address: "경상남도 창원시 성산구 공단로 770(천선동)",
  hours: "평일 09:00 - 18:00",
  kakaoLabel: "카카오 상담",
  heroTitle: "건축자재 · 안전용품 · 철물 · 공구를 온라인으로 빠르게 주문하는 씨케이코리아 자사몰",
  heroSubtitle:
    "주식회사 씨케이코리아의 건축자재 전문 자사몰입니다. 건축자재, 철물, 공구, 안전용품은 온라인으로 바로 확인하고, 대량 발주나 현장 납품 건은 견적 문의로 빠르게 연결할 수 있습니다.",
  metaTitle: "건축자재 도소매 온라인몰 | 주식회사 씨케이코리아",
  metaDescription:
    "주식회사 씨케이코리아 자사몰. 건축자재, 철물, 공구, 안전용품을 온라인으로 주문하고 대량 납품 및 현장 배송은 견적으로 문의할 수 있는 건축자재 전문몰입니다.",
  domain: "https://www.ckkorea.co.kr",
};

export const categories = [
  "철물/부속",
  "실리콘/접착제",
  "목재/합판",
  "배관/설비",
  "전기자재",
  "공구/소모품",
  "안전용품",
];

export const products: Product[] = [
  {
    id: 1,
    slug: "industrial-silicone-300ml",
    name: "산업용 실리콘 300ml",
    category: "실리콘/접착제",
    brand: "CK",
    spec: "백색 / 투명 / 회색",
    unit: "1개",
    price: 3900,
    type: "즉시결제",
    shipping: "택배",
    stock: "재고있음",
    desc: "욕실, 주방, 창호, 실내외 마감 작업용 표준 규격 실리콘",
    image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80",
    featured: true
  },
  {
    id: 2,
    slug: "anchor-bolt-set",
    name: "앙카 볼트 세트",
    category: "철물/부속",
    brand: "CK",
    spec: "M8 / M10 / M12",
    unit: "1봉",
    price: 8500,
    type: "즉시결제",
    shipping: "택배",
    stock: "재고있음",
    desc: "콘크리트 고정용 표준 규격 앙카 볼트 세트",
    image: "https://images.unsplash.com/photo-1581147036324-c1c121d8d1cf?auto=format&fit=crop&w=1200&q=80",
    featured: true
  },
  {
    id: 3,
    slug: "pvc-pipe",
    name: "PVC 배관 파이프",
    category: "배관/설비",
    brand: "CK",
    spec: "옵션별 상이",
    unit: "1본",
    price: null,
    type: "견적문의",
    shipping: "화물배송",
    stock: "주문제작/문의",
    desc: "규격, 길이, 수량에 따라 운임과 단가가 달라지는 배관 자재",
    image: "https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?auto=format&fit=crop&w=1200&q=80",
    featured: true
  },
  {
    id: 4,
    slug: "safety-work-gloves",
    name: "안전 작업용 장갑",
    category: "안전용품",
    brand: "CK",
    spec: "M / L / XL",
    unit: "10켤레",
    price: 9900,
    type: "즉시결제",
    shipping: "택배",
    stock: "재고있음",
    desc: "현장 작업 필수 소모품, 반복 구매율 높은 품목",
    image: "https://images.unsplash.com/photo-1581579188871-45ea61f2a6c8?auto=format&fit=crop&w=1200&q=80",
    featured: true
  },
  {
    id: 5,
    slug: "cutting-disc-4inch",
    name: "절단석 4인치",
    category: "공구/소모품",
    brand: "CK",
    spec: "금속용",
    unit: "10장",
    price: 14500,
    type: "즉시결제",
    shipping: "택배",
    stock: "재고있음",
    desc: "절단기와 함께 사용하는 금속 가공용 소모품",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 6,
    slug: "plywood-1220x2440",
    name: "합판 1220x2440",
    category: "목재/합판",
    brand: "CK",
    spec: "9T / 12T / 15T",
    unit: "1장",
    price: null,
    type: "견적문의",
    shipping: "화물배송",
    stock: "문의필수",
    desc: "현장 납품이 많은 표준 규격 합판, 수량별 견적 필요",
    image: "https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&w=1200&q=80"
  }
];
