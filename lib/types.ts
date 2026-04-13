export type ProductType = "즉시결제" | "견적문의";
export type ShippingType = "택배" | "화물배송" | "매장픽업" | "현장납품문의";

export type Product = {
  id: number;
  name: string;
  category: string;
  brand: string;
  spec: string;
  unit: string;
  price: number | null;
  type: ProductType;
  shipping: ShippingType;
  stock: string;
  desc: string;
  image: string;
  featured?: boolean;
};

export type CompanyInfo = {
  companyName: string;
  ceo: string;
  businessNumber: string;
  ecommerceNumber: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  kakaoLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  metaTitle: string;
  metaDescription: string;
  domain: string;
};
