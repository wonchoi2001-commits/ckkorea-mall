export type ProductType = "즉시결제" | "견적문의";
export type ShippingType = "택배" | "화물배송";

export type Product = {
  id: number;
  slug: string;
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

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CartContextType = {
  cartItems: CartItem[];
  totalCount: number;
  totalPrice: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  clearCart: () => void;
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