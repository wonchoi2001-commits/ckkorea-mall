import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { FULFILLMENT_STATUS_OPTIONS, TAX_INVOICE_STATUS_OPTIONS } from "@/lib/order-status";
import { getOrderRecord, getOrderRecords, isMissingOrdersTableError } from "@/lib/orders";
import { createAdminSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";

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

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "관리자 로그인이 필요합니다." },
      { status: 401 }
    );
  }

  if (!isAdminUser(user)) {
    return NextResponse.json(
      { message: "관리자 권한이 없습니다." },
      { status: 403 }
    );
  }

  return null;
}

export async function GET() {
  const authResponse = await requireAdmin();

  if (authResponse) {
    return authResponse;
  }

  try {
    const orders = await getOrderRecords();

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("ADMIN ORDERS GET ERROR:", error);

    if (isMissingOrdersTableError(error)) {
      return NextResponse.json(
        {
          message:
            "orders 테이블이 아직 없습니다. Supabase SQL Editor에서 저장용 orders 스키마를 먼저 생성해주세요.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "주문 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const authResponse = await requireAdmin();

  if (authResponse) {
    return authResponse;
  }

  try {
    const body = await req.json();
    const orderId = body?.orderId;
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

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { message: "주문번호가 필요합니다." },
        { status: 400 }
      );
    }

    if (
      !fulfillmentStatus ||
      typeof fulfillmentStatus !== "string" ||
      !allowedFulfillmentStatuses.has(fulfillmentStatus)
    ) {
      return NextResponse.json(
        { message: "유효한 배송 상태를 선택해주세요." },
        { status: 400 }
      );
    }

    if (
      taxInvoiceStatus &&
      !allowedTaxInvoiceStatuses.has(taxInvoiceStatus)
    ) {
      return NextResponse.json(
        { message: "유효한 세금계산서 상태를 선택해주세요." },
        { status: 400 }
      );
    }

    const nextFulfillmentStatus = fulfillmentStatus;

    const existingOrder = await getOrderRecord(orderId);

    if (!existingOrder) {
      return NextResponse.json(
        { message: "주문을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (existingOrder.status === "CANCELED") {
      return NextResponse.json(
        { message: "취소 또는 환불된 주문은 배송 상태를 변경할 수 없습니다." },
        { status: 400 }
      );
    }

    const allowedStatusesForOrder = getAllowedFulfillmentStatusesByPaymentStatus(
      existingOrder.status
    );

    if (!allowedStatusesForOrder.has(nextFulfillmentStatus)) {
      return NextResponse.json(
        { message: "현재 결제 상태에서는 선택한 배송 상태로 변경할 수 없습니다." },
        { status: 400 }
      );
    }

    const nextTaxInvoiceStatus =
      taxInvoiceStatus || existingOrder.tax_invoice_status || "NOT_REQUESTED";
    const canManageTaxInvoice =
      existingOrder.business?.taxInvoiceRequested === true ||
      existingOrder.tax_invoice_status === "REQUESTED" ||
      existingOrder.tax_invoice_status === "ISSUED";

    if (!canManageTaxInvoice && nextTaxInvoiceStatus !== "NOT_REQUESTED") {
      return NextResponse.json(
        { message: "세금계산서를 요청한 주문만 발행 상태를 변경할 수 있습니다." },
        { status: 400 }
      );
    }

    if (nextFulfillmentStatus === "SHIPPED" && (!shippingCarrier || !trackingNumber)) {
      return NextResponse.json(
        { message: "배송중으로 변경하려면 택배사와 송장번호를 입력해주세요." },
        { status: 400 }
      );
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
      console.error("ADMIN ORDERS PATCH ERROR:", error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ order: data }, { status: 200 });
  } catch (error) {
    console.error("ADMIN ORDERS PATCH ERROR:", error);

    if (isMissingOrdersTableError(error)) {
      return NextResponse.json(
        {
          message:
            "orders 테이블이 아직 없습니다. Supabase SQL Editor에서 저장용 orders 스키마를 먼저 생성해주세요.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "주문 상태 변경 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
