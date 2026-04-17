export type ProductType = "즉시결제" | "견적문의";
export type ShippingType =
  | "택배"
  | "화물배송"
  | "현장납품 문의"
  | "배송 문의";

export type CatalogCategory =
  | "철물"
  | "건재"
  | "골재"
  | "목재"
  | "PVC 배관 및 부속"
  | "공구"
  | "전기자재"
  | "안전용품"
  | "접착제/실리콘"
  | "소모품/부자재";

export type ProductStockStatus =
  | "IN_STOCK"
  | "SOLD_OUT"
  | "QUOTE"
  | "CHECK_STOCK";

export type ProductBadgeTone = "slate" | "blue" | "emerald" | "amber" | "rose";

export type ProductDetailJson = {
  overview?: string | null;
  features?: string[] | null;
  applications?: string[] | null;
  useCases?: string[] | null;
  specifications?: string | null;
  specGuide?: string | null;
  shipping_notice?: string | null;
  shippingNotice?: string | null;
  caution?: string | null;
};

export type ProductDetailSection = {
  title: string;
  content?: string;
  bullets?: string[];
};

export type ProductRecord = {
  id: string | number;
  slug?: string | null;
  name: string;
  price: number | null;
  spec?: string | null;
  shipping?: string | null;
  description?: string | null;
  image_url?: string | null;
  is_active?: boolean | null;
  stock?: number | null;
  category?: string | null;
  brand?: string | null;
  unit?: string | null;
  featured?: boolean | null;
  category_main?: string | null;
  category_sub?: string | null;
  manufacturer?: string | null;
  origin?: string | null;
  options_json?: Record<string, unknown> | string | null;
  detail_json?: ProductDetailJson | string | null;
  short_description?: string | null;
  quote_required?: boolean | null;
  bulky_item?: boolean | null;
  source_site?: string | null;
  source_url?: string | null;
  search_keywords?: string[] | string | null;
  sort_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryMain: CatalogCategory | string;
  categorySub?: string | null;
  brand: string;
  manufacturer?: string | null;
  origin?: string | null;
  spec: string;
  unit: string;
  price: number | null;
  salePrice?: number | null;
  type: ProductType;
  shipping: ShippingType;
  stock: string;
  stockStatus: ProductStockStatus;
  stockQuantity?: number | null;
  desc: string;
  shortDesc: string;
  description: string;
  image: string;
  featured: boolean;
  badge?: string | null;
  badgeTone?: ProductBadgeTone | null;
  tags: string[];
  quoteRequired: boolean;
  bulkyItem: boolean;
  minimumOrderQuantity: number;
  searchKeywords: string[];
  qualityScore: number;
  sortOrder: number;
  detailSections: ProductDetailSection[];
  sourceSite?: string | null;
  sourceUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  isActive: boolean;
  createdAt?: string | null;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CartContextType = {
  cartItems: CartItem[];
  selectedProductIds: string[];
  selectedCartItems: CartItem[];
  totalCount: number;
  totalPrice: number;
  selectedTotalCount: number;
  selectedTotalPrice: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  toggleCartItemSelection: (productId: string) => void;
  selectAllCartItems: () => void;
  clearCartSelection: () => void;
  clearCart: () => void;
};

export type MemberRole = "personal" | "business" | "admin";
export type BusinessStatus = "pending" | "approved" | "rejected";

export type MemberProfileRecord = {
  id: string;
  role?: MemberRole | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  default_address?: string | null;
  default_detail_address?: string | null;
  zipcode?: string | null;
  receive_marketing?: boolean | null;
  is_active?: boolean | null;
  company_name?: string | null;
  business_number?: string | null;
  business_status?: BusinessStatus | null;
  tax_email?: string | null;
  business_address?: string | null;
  business_detail_address?: string | null;
  manager_name?: string | null;
  manager_phone?: string | null;
  business_type?: string | null;
  business_item?: string | null;
  bulk_purchase_enabled?: boolean | null;
  business_discount_rate?: number | null;
  memo?: string | null;
  preferred_payment_method?: string | null;
  saved_delivery_requests?: string[] | null;
  order_count?: number | null;
  total_purchase_amount?: number | null;
  favorite_categories?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type MemberProfile = {
  id: string;
  role: MemberRole;
  name: string;
  email: string;
  phone: string;
  defaultAddress: string;
  defaultDetailAddress: string;
  zipcode: string;
  receiveMarketing: boolean;
  isActive: boolean;
  companyName: string;
  businessNumber: string;
  businessStatus: BusinessStatus;
  taxEmail: string;
  businessAddress: string;
  businessDetailAddress: string;
  managerName: string;
  managerPhone: string;
  businessType: string;
  businessItem: string;
  bulkPurchaseEnabled: boolean;
  businessDiscountRate: number;
  memo: string;
  preferredPaymentMethod: string;
  savedDeliveryRequests: string[];
  orderCount: number;
  totalPurchaseAmount: number;
  favoriteCategories: string[];
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type SavedAddressRecord = {
  id?: string;
  user_id: string;
  label?: string | null;
  recipient_name?: string | null;
  phone?: string | null;
  zipcode?: string | null;
  address?: string | null;
  detail_address?: string | null;
  delivery_memo?: string | null;
  site_name?: string | null;
  is_default?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type SavedAddress = {
  id: string;
  userId: string;
  label: string;
  recipientName: string;
  phone: string;
  zipcode: string;
  address: string;
  detailAddress: string;
  deliveryMemo: string;
  siteName: string;
  isDefault: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type FavoriteProductRecord = {
  user_id: string;
  product_id: string;
  created_at?: string | null;
};

export type RecentlyViewedProductRecord = {
  user_id: string;
  product_id: string;
  last_viewed_at?: string | null;
  view_count?: number | null;
};

export type AccountSummary = {
  profile: MemberProfile | null;
  addresses: SavedAddress[];
  favoriteProducts: Product[];
  recentlyViewedProducts: Product[];
  orders: OrderRecord[];
  quotes: QuoteRequestRecord[];
  setupMessage?: string | null;
};

export type ShopperContextType = {
  userId: string | null;
  userEmail: string | null;
  profile: MemberProfile | null;
  addresses: SavedAddress[];
  favoriteIds: string[];
  recentIds: string[];
  loading: boolean;
  isLoggedIn: boolean;
  isBusinessMember: boolean;
  businessApproved: boolean;
  signOut: () => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  recordRecentlyViewed: (productId: string) => Promise<void>;
  reloadAccount: () => Promise<void>;
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

export type CatalogCategoryMeta = {
  name: CatalogCategory;
  description: string;
  lead: string;
  image: string;
  href: string;
  accent: string;
};

export type ShippingPolicy = {
  baseFee: number;
  freeShippingThreshold: number;
  freightNotice: string;
};

export type OrderCustomer = {
  name: string;
  phone: string;
  email: string;
  company?: string;
};

export type TaxInvoiceStatus = "NOT_REQUESTED" | "REQUESTED" | "ISSUED";

export type BusinessOrderDetails = {
  isBusinessOrder: boolean;
  companyName?: string;
  businessNumber?: string;
  ceoName?: string;
  businessType?: string;
  businessItem?: string;
  projectName?: string;
  purchaseOrderNumber?: string;
  taxInvoiceRequested: boolean;
  taxInvoiceEmail?: string;
};

export type OrderShipping = {
  receiver: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
  deliveryMemo?: string;
};

export type PaymentStatus = "READY" | "DONE" | "FAILED" | "CANCELED";
export type FulfillmentStatus =
  | "PENDING_PAYMENT"
  | "PREPARING"
  | "READY_TO_SHIP"
  | "SHIPPED"
  | "DELIVERED"
  | "PAYMENT_FAILED"
  | "CANCELED";

export type OrderItemSnapshot = {
  productId: string;
  slug: string;
  name: string;
  spec: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  shipping: ShippingType;
  image: string;
};

export type OrderRefundItemAdjustment = {
  productId: string;
  slug?: string | null;
  name: string;
  quantity: number;
  amount: number;
};

export type OrderRefundHistoryEntry = {
  id: string;
  canceledAt: string;
  cancelReason: string;
  cancelAmount: number;
  isFullRefund: boolean;
  adminEmail?: string | null;
  items: OrderRefundItemAdjustment[];
};

export type OrderRecord = {
  id?: string;
  user_id?: string | null;
  order_id: string;
  order_name: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  customer: OrderCustomer;
  shipping: OrderShipping;
  items: OrderItemSnapshot[];
  payment_key?: string | null;
  payment_method?: string | null;
  approved_at?: string | null;
  canceled_at?: string | null;
  cancel_reason?: string | null;
  refunded_amount?: number | null;
  failure_code?: string | null;
  failure_message?: string | null;
  business?: BusinessOrderDetails | null;
  tax_invoice_status?: TaxInvoiceStatus | null;
  tax_invoice_note?: string | null;
  shipping_carrier?: string | null;
  tracking_number?: string | null;
  admin_memo?: string | null;
  stock_deducted?: boolean | null;
  refund_history?: OrderRefundHistoryEntry[] | null;
  toss_payment_data?: unknown;
  created_at?: string | null;
  updated_at?: string | null;
};

export type OrderSummary = {
  orderId: string;
  orderName: string;
  amount: number;
  method?: string;
  approvedAt?: string;
  canceledAt?: string;
  status: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  refundedAmount?: number | null;
  customerName?: string;
  customerEmail?: string;
  isBusinessOrder?: boolean;
  taxInvoiceStatus?: TaxInvoiceStatus | null;
};

export type OrderItemRecord = {
  id?: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  price?: number | null;
  quantity: number;
  created_at?: string | null;
};

export type QuoteRequestStatus = "NEW" | "IN_PROGRESS" | "COMPLETED";

export type QuoteRequestRecord = {
  id?: string;
  user_id?: string | null;
  customer_name: string;
  phone: string;
  email: string;
  is_business_order?: boolean | null;
  company_name?: string | null;
  business_number?: string | null;
  project_name?: string | null;
  tax_invoice_needed?: boolean | null;
  tax_invoice_email?: string | null;
  product_name?: string | null;
  product_slug?: string | null;
  quantity?: string | null;
  spec?: string | null;
  delivery_type?: string | null;
  delivery_area?: string | null;
  request_date?: string | null;
  message: string;
  status: QuoteRequestStatus;
  admin_memo?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};
