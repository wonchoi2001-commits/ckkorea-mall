import type {
  OrderItemSnapshot,
  OrderRecord,
  OrderRefundHistoryEntry,
  OrderRefundItemAdjustment,
} from "@/lib/types";

function normalizeAdjustment(value: unknown): OrderRefundItemAdjustment | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;
  const productId =
    typeof item.productId === "string" && item.productId.trim()
      ? item.productId.trim()
      : null;
  const name =
    typeof item.name === "string" && item.name.trim() ? item.name.trim() : null;
  const quantity =
    typeof item.quantity === "number"
      ? item.quantity
      : typeof item.quantity === "string"
        ? Number(item.quantity)
        : NaN;
  const amount =
    typeof item.amount === "number"
      ? item.amount
      : typeof item.amount === "string"
        ? Number(item.amount)
        : NaN;

  if (!productId || !name || !Number.isFinite(quantity) || quantity <= 0) {
    return null;
  }

  return {
    productId,
    slug: typeof item.slug === "string" && item.slug.trim() ? item.slug.trim() : null,
    name,
    quantity: Math.floor(quantity),
    amount: Number.isFinite(amount) && amount >= 0 ? Math.floor(amount) : 0,
  };
}

function normalizeRefundEntry(value: unknown): OrderRefundHistoryEntry | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const entry = value as Record<string, unknown>;
  const id = typeof entry.id === "string" && entry.id.trim() ? entry.id.trim() : null;
  const canceledAt =
    typeof entry.canceledAt === "string" && entry.canceledAt.trim()
      ? entry.canceledAt.trim()
      : null;
  const cancelReason =
    typeof entry.cancelReason === "string" && entry.cancelReason.trim()
      ? entry.cancelReason.trim()
      : "";
  const cancelAmount =
    typeof entry.cancelAmount === "number"
      ? entry.cancelAmount
      : typeof entry.cancelAmount === "string"
        ? Number(entry.cancelAmount)
        : NaN;
  const items = Array.isArray(entry.items)
    ? entry.items
        .map((item) => normalizeAdjustment(item))
        .filter((item): item is OrderRefundItemAdjustment => item !== null)
    : [];

  if (!id || !canceledAt || !Number.isFinite(cancelAmount) || cancelAmount < 0) {
    return null;
  }

  return {
    id,
    canceledAt,
    cancelReason,
    cancelAmount: Math.floor(cancelAmount),
    isFullRefund: entry.isFullRefund === true,
    adminEmail:
      typeof entry.adminEmail === "string" && entry.adminEmail.trim()
        ? entry.adminEmail.trim()
        : null,
    items,
  };
}

export function normalizeRefundHistory(value: unknown): OrderRefundHistoryEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => normalizeRefundEntry(entry))
    .filter((entry): entry is OrderRefundHistoryEntry => entry !== null);
}

export function getRefundedQuantityMap(order: Pick<OrderRecord, "refund_history">) {
  const refundedQuantityMap = new Map<string, number>();

  for (const entry of normalizeRefundHistory(order.refund_history)) {
    for (const item of entry.items) {
      refundedQuantityMap.set(
        item.productId,
        (refundedQuantityMap.get(item.productId) ?? 0) + item.quantity
      );
    }
  }

  return refundedQuantityMap;
}

export function getRemainingRefundableAmount(
  order: Pick<OrderRecord, "amount" | "refunded_amount">
) {
  const refundedAmount =
    typeof order.refunded_amount === "number" && order.refunded_amount > 0
      ? order.refunded_amount
      : 0;

  return Math.max(order.amount - refundedAmount, 0);
}

export function hasPartialRefund(
  order: Pick<OrderRecord, "amount" | "refunded_amount">
) {
  const refundedAmount =
    typeof order.refunded_amount === "number" && order.refunded_amount > 0
      ? order.refunded_amount
      : 0;

  return refundedAmount > 0 && refundedAmount < order.amount;
}

export function getRefundableItems(
  order: Pick<OrderRecord, "items" | "refund_history">
): Array<
  OrderItemSnapshot & {
    refundedQuantity: number;
    remainingQuantity: number;
    refundedAmount: number;
    remainingAmount: number;
  }
> {
  const refundedQuantityMap = getRefundedQuantityMap(order);

  return order.items.map((item) => {
    const refundedQuantity = Math.min(
      refundedQuantityMap.get(item.productId) ?? 0,
      item.quantity
    );
    const remainingQuantity = Math.max(item.quantity - refundedQuantity, 0);

    return {
      ...item,
      refundedQuantity,
      remainingQuantity,
      refundedAmount: item.unitPrice * refundedQuantity,
      remainingAmount: item.unitPrice * remainingQuantity,
    };
  });
}
