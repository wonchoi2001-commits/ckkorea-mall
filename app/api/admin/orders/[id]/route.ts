import { NextResponse } from "next/server";
import { jsonError, jsonOk, requireAdminApiUser } from "@/lib/admin-api";
import { FULFILLMENT_STATUS_OPTIONS, TAX_INVOICE_STATUS_OPTIONS } from "@/lib/order-status";
import {
  getOrderItemRecords,
  getOrderRecord,
  isMissingOrdersTableError,
} from "@/lib/orders";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const allowedFulfillmentStatuses = new Set<string>(
  FULFILLMENT_STATUS_OPTIONS.map((option) => option.value)
);
const allowedTaxInvoiceStatuses = new Set<string>(
  TAX_INVOICE_STATUS_OPTIONS.map((option) => option.value)
);

function getAllowedFulfillmentStatusesByPaymentStatus(status: string) {
  switch (status) {
    case "DONE":
      return new Set(["PREPARING", "READY_TO_SHIP", "SHIPPED", "DELIVERED"]);
    case "FAILED":
      return new Set(["PAYMENT_FAILED"]);
    case "READY":
      return new Set(["PENDING_PAYMENT"]);
    default:
      return new Set<string>();
  }
}

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Props) {
  const { response } = await requireAdminApiUser();

  if (response) {
    return response;
  }

  try {
    const { id } = await params;
    const order = await getOrderRecord(id);

    if (!order) {
      return jsonError("주문을 찾을 수 없습니다.", 404);
    }

    const orderItems = order.id ? await getOrderItemRecords(String(order.id)) : [];

    return jsonOk({ order, orderItems });
  } catch (error) {
    console.error("ADMIN ORDER DETAIL GET ERROR:", error);

    if (isMissingOrdersTableError(error)) {
      return jsonError(
        "orders 테이블이 아직 없습니다. Supabase SQL Editor에서 orders 스키마를 먼저 실행해주세요.",
        500
      );
    }

    return jsonError("주문 상세 조회 중 오류가 발생했습니다.", 500);
  }
}

export async function PATCH(req: Request, { params }: Props) {
  const { response } = await requireAdminApiUser();

  if (response) {
    return response;
  }

  try {
    const { id } = await params;
    const existingOrder = await getOrderRecord(id);

    if (!existingOrder) {
      return jsonError("주문을 찾을 수 없습니다.", 404);
    }

    const body = await req.json();
    const fulfillmentStatus = body?.fulfillment_status;
    const shippingCarrier =
      typeof body?.shipping_carrier === "string" ? body.shipping_carrier.trim() : "";
    const trackingNumber =
      typeof body?.tracking_number === "string" ? body.tracking_number.trim() : "";
    const adminMemo =
      typeof body?.admin_memo === "string" ? body.admin_memo.trim() : "";
    const taxInvoiceStatus =
      typeof body?.tax_invoice_status === "string" ? body.tax_invoice_status.trim() : "";
    const taxInvoiceNote =
      typeof body?.tax_invoice_note === "string" ? body.tax_invoice_note.trim() : "";

    if (
      !fulfillmentStatus ||
      typeof fulfillmentStatus !== "string" ||
      !allowedFulfillmentStatuses.has(fulfillmentStatus)
    ) {
      return jsonError("유효한 배송 상태를 선택해주세요.", 400);
    }

    if (taxInvoiceStatus && !allowedTaxInvoiceStatuses.has(taxInvoiceStatus)) {
      return jsonError("유효한 세금계산서 상태를 선택해주세요.", 400);
    }

    if (existingOrder.status === "CANCELED") {
      return jsonError("취소된 주문은 배송 상태를 변경할 수 없습니다.", 400);
    }

    const allowedStatusesForOrder = getAllowedFulfillmentStatusesByPaymentStatus(
      existingOrder.status
    );

    if (!allowedStatusesForOrder.has(fulfillmentStatus)) {
      return jsonError("현재 결제 상태에서는 선택한 배송 상태로 변경할 수 없습니다.", 400);
    }

    if (fulfillmentStatus === "SHIPPED" && (!shippingCarrier || !trackingNumber)) {
      return jsonError("배송중으로 변경하려면 택배사와 송장번호를 입력해주세요.", 400);
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("orders")
      .update({
        fulfillment_status: fulfillmentStatus,
        tax_invoice_status: taxInvoiceStatus || existingOrder.tax_invoice_status || "NOT_REQUESTED",
        tax_invoice_note: taxInvoiceNote || null,
        shipping_carrier: shippingCarrier || null,
        tracking_number: trackingNumber || null,
        admin_memo: adminMemo || null,
      })
      .eq("order_id", id)
      .select("*")
      .single();

    if (error) {
      console.error("ADMIN ORDER DETAIL PATCH ERROR:", error);
      return jsonError(error.message, 500);
    }

    return jsonOk({ order: data });
  } catch (error) {
    console.error("ADMIN ORDER DETAIL PATCH ERROR:", error);
    return jsonError("주문 상태 변경 중 오류가 발생했습니다.", 500);
  }
}
