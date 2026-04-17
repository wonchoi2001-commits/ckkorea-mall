import type {
  BusinessOrderDetails,
  OrderCustomer,
  OrderItemSnapshot,
  OrderItemRecord,
  OrderRecord,
  OrderShipping,
  OrderSummary,
  Product,
} from "@/lib/types";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export function makeOrderId() {
  return `ck_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function buildOrderItem(product: Product, quantity: number): OrderItemSnapshot {
  const unitPrice = product.price ?? 0;

  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    spec: product.spec,
    unit: product.unit,
    unitPrice,
    quantity,
    subtotal: unitPrice * quantity,
    shipping: product.shipping,
    image: product.image,
  };
}

export function buildOrderName(items: OrderItemSnapshot[]) {
  if (items.length === 0) {
    return "씨케이코리아 주문";
  }

  if (items.length === 1) {
    const [firstItem] = items;

    return firstItem.quantity > 1
      ? `${firstItem.name} ${firstItem.quantity}개`
      : firstItem.name;
  }

  return `${items[0].name} 외 ${items.length - 1}건`;
}

export function buildOrderRecordInput(params: {
  orderId: string;
  customer: OrderCustomer;
  shipping: OrderShipping;
  items: OrderItemSnapshot[];
  business?: BusinessOrderDetails;
}) {
  const { orderId, customer, shipping, items, business } = params;

  return {
    order_id: orderId,
    order_name: buildOrderName(items),
    amount: items.reduce((sum, item) => sum + item.subtotal, 0),
    total_amount: items.reduce((sum, item) => sum + item.subtotal, 0),
    currency: "KRW",
    status: "READY" as const,
    fulfillment_status: "PENDING_PAYMENT" as const,
    customer_name: customer.name,
    customer_phone: customer.phone,
    customer_email: customer.email,
    receiver_name: shipping.receiver,
    receiver_phone: shipping.phone,
    zip_code: shipping.zipCode,
    address: shipping.address1,
    detail_address: shipping.address2 ?? null,
    delivery_memo: shipping.deliveryMemo ?? null,
    payment_method: null,
    customer,
    shipping,
    items,
    business: business ?? null,
    tax_invoice_status: business?.taxInvoiceRequested ? "REQUESTED" : "NOT_REQUESTED",
  };
}

export function mapOrderRecordToSummary(order: OrderRecord): OrderSummary {
  return {
    orderId: order.order_id,
    orderName: order.order_name,
    amount: order.amount,
    method: order.payment_method ?? undefined,
    approvedAt: order.approved_at ?? undefined,
    canceledAt: order.canceled_at ?? undefined,
    status: order.status,
    fulfillmentStatus: order.fulfillment_status,
    refundedAmount: order.refunded_amount ?? null,
    customerName: order.customer?.name,
    customerEmail: order.customer?.email,
    isBusinessOrder: order.business?.isBusinessOrder ?? false,
    taxInvoiceStatus: order.tax_invoice_status ?? null,
  };
}

export function isMissingOrdersTableError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "42P01"
  );
}

export function isInventoryProcessingError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    (error.message.includes("INSUFFICIENT_STOCK") ||
      error.message.includes("PRODUCT_NOT_FOUND"))
  );
}

export async function getOrderRecord(orderId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as OrderRecord | null) ?? null;
}

export async function getOrderRecordByDbId(id: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as OrderRecord | null) ?? null;
}

export async function getOrderRecords() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as OrderRecord[];
}

export async function getOrderItemRecords(orderRecordId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderRecordId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as OrderItemRecord[];
}
