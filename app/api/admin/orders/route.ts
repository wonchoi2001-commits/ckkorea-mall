import { NextResponse } from "next/server";
import { enforceAdminMutationSecurity, jsonError, jsonOk, requireAdminApiUser } from "@/lib/admin-api";
import { FULFILLMENT_STATUS_OPTIONS, TAX_INVOICE_STATUS_OPTIONS } from "@/lib/order-status";
import { getOrderRecord, getOrderRecords, isMissingOrdersTableError } from "@/lib/orders";
import { logServerError } from "@/lib/security";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { adminOrderUpdateSchema } from "@/lib/validation";

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

export async function GET() {
  const { response } = await requireAdminApiUser();

  if (response) {
    return response;
  }

  try {
    const orders = await getOrderRecords();

    return jsonOk({ orders }, 200);
  } catch (error) {
    logServerError("admin-orders-get", error);

    if (isMissingOrdersTableError(error)) {
      return jsonError(
        "orders 테이블이 아직 없습니다. Supabase SQL Editor에서 저장용 orders 스키마를 먼저 생성해주세요.",
        500
      );
    }

    return jsonError("주문 목록 조회 중 오류가 발생했습니다.", 500);
  }
}

export async function PATCH(req: Request) {
  const { response } = await requireAdminApiUser();

  if (response) {
    return response;
  }

  const securityResponse = enforceAdminMutationSecurity(req, "orders-patch");

  if (securityResponse) {
    return securityResponse;
  }

  try {
    const parsed = adminOrderUpdateSchema.safeParse(await req.json());

    if (!parsed.success) {
      return jsonError("주문 상태 변경 입력값을 확인해주세요.", 400);
    }

    const {
      orderId,
      fulfillment_status: fulfillmentStatus,
      shipping_carrier: shippingCarrier = "",
      tracking_number: trackingNumber = "",
      admin_memo: adminMemo = "",
      tax_invoice_status: taxInvoiceStatus = "",
      tax_invoice_note: taxInvoiceNote = "",
    } = parsed.data;

    if (
      !fulfillmentStatus ||
      typeof fulfillmentStatus !== "string" ||
      !allowedFulfillmentStatuses.has(fulfillmentStatus)
    ) {
      return jsonError("유효한 배송 상태를 선택해주세요.", 400);
    }

    if (
      taxInvoiceStatus &&
      !allowedTaxInvoiceStatuses.has(taxInvoiceStatus)
    ) {
      return jsonError("유효한 세금계산서 상태를 선택해주세요.", 400);
    }

    const nextFulfillmentStatus = fulfillmentStatus;

    const existingOrder = await getOrderRecord(orderId);

    if (!existingOrder) {
      return jsonError("주문을 찾을 수 없습니다.", 404);
    }

    if (existingOrder.status === "CANCELED") {
      return jsonError("취소 또는 환불된 주문은 배송 상태를 변경할 수 없습니다.", 400);
    }

    const allowedStatusesForOrder = getAllowedFulfillmentStatusesByPaymentStatus(
      existingOrder.status
    );

    if (!allowedStatusesForOrder.has(nextFulfillmentStatus)) {
      return jsonError("현재 결제 상태에서는 선택한 배송 상태로 변경할 수 없습니다.", 400);
    }

    const nextTaxInvoiceStatus =
      taxInvoiceStatus || existingOrder.tax_invoice_status || "NOT_REQUESTED";
    const canManageTaxInvoice =
      existingOrder.business?.taxInvoiceRequested === true ||
      existingOrder.tax_invoice_status === "REQUESTED" ||
      existingOrder.tax_invoice_status === "ISSUED";

    if (!canManageTaxInvoice && nextTaxInvoiceStatus !== "NOT_REQUESTED") {
      return jsonError("세금계산서를 요청한 주문만 발행 상태를 변경할 수 있습니다.", 400);
    }

    if (nextFulfillmentStatus === "SHIPPED" && (!shippingCarrier || !trackingNumber)) {
      return jsonError("배송중으로 변경하려면 택배사와 송장번호를 입력해주세요.", 400);
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("orders")
      .update({
        fulfillment_status: nextFulfillmentStatus,
        tax_invoice_status: nextTaxInvoiceStatus,
        tax_invoice_note: taxInvoiceNote || null,
        shipping_carrier: shippingCarrier || null,
        tracking_number: trackingNumber || null,
        admin_memo: adminMemo || null,
      })
      .eq("order_id", orderId)
      .select("*")
      .single();

    if (error) {
      logServerError("admin-orders-patch", error, { orderId });
      return jsonError("주문 상태 변경 중 오류가 발생했습니다.", 500);
    }

    return jsonOk({ order: data }, 200);
  } catch (error) {
    logServerError("admin-orders-patch", error);

    if (isMissingOrdersTableError(error)) {
      return jsonError(
        "orders 테이블이 아직 없습니다. Supabase SQL Editor에서 저장용 orders 스키마를 먼저 생성해주세요.",
        500
      );
    }

    return jsonError("주문 상태 변경 중 오류가 발생했습니다.", 500);
  }
}
