import { NextResponse } from "next/server";
import { enforceAdminMutationSecurity, requireAdminApiUser } from "@/lib/admin-api";
import {
  getRefundableItems,
  getRemainingRefundableAmount,
} from "@/lib/order-refunds";
import { getOrderRecord, isMissingOrdersTableError } from "@/lib/orders";
import {
  createAdminSupabaseClient,
} from "@/lib/supabase/server";
import { logServerError } from "@/lib/security";
import { cancelTossPayment } from "@/lib/toss-payments";
import { adminOrderRefundSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const { user, response: authResponse } = await requireAdminApiUser();

  if (authResponse || !user) {
    return authResponse;
  }

  const securityResponse = enforceAdminMutationSecurity(req, "orders-full-refund");

  if (securityResponse) {
    return securityResponse;
  }

  try {
    const parsed = adminOrderRefundSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: "환불 입력값을 확인해주세요." },
        { status: 400 }
      );
    }

    const {
      orderId,
      cancelReason = "관리자 요청으로 남은 결제금액을 전체 환불했습니다.",
    } = parsed.data;

    const order = await getOrderRecord(orderId);

    if (!order) {
      return NextResponse.json(
        { message: "주문을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (order.status === "CANCELED") {
      return NextResponse.json({ order }, { status: 200 });
    }

    if (order.status !== "DONE" || !order.payment_key) {
      return NextResponse.json(
        { message: "결제 완료 주문만 환불할 수 있습니다." },
        { status: 400 }
      );
    }

    const cancelAmount = getRemainingRefundableAmount(order);

    if (cancelAmount <= 0) {
      return NextResponse.json(
        { message: "이미 전액 환불된 주문입니다." },
        { status: 400 }
      );
    }

    const refundableItems = getRefundableItems(order);
    const restockItems = refundableItems
      .filter((item) => item.remainingQuantity > 0)
      .map((item) => ({
        productId: item.productId,
        quantity: item.remainingQuantity,
      }));
    const refundItems = refundableItems
      .filter((item) => item.remainingQuantity > 0)
      .map((item) => ({
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        quantity: item.remainingQuantity,
        amount: item.unitPrice * item.remainingQuantity,
      }));

    const { response, data } = await cancelTossPayment({
      paymentKey: order.payment_key,
      cancelReason,
      cancelAmount,
      idempotencyKey: `full-refund-${orderId}-${Date.now()}`,
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || "토스 결제 환불에 실패했습니다." },
        { status: response.status }
      );
    }

    const latestCancel = Array.isArray(data?.cancels)
      ? data.cancels[data.cancels.length - 1]
      : null;
    const latestCancelAmount =
      typeof latestCancel?.cancelAmount === "number"
        ? latestCancel.cancelAmount
        : cancelAmount;

    const supabase = createAdminSupabaseClient();
    const { data: updatedOrder, error } = await supabase
      .rpc("record_order_refund", {
        order_id_input: orderId,
        cancel_reason_input: cancelReason,
        canceled_at_input: latestCancel?.canceledAt ?? new Date().toISOString(),
        refunded_amount_input: latestCancelAmount,
        toss_payment_data_input: data,
        refund_history_entry_input: {
          id: crypto.randomUUID(),
          canceledAt: latestCancel?.canceledAt ?? new Date().toISOString(),
          cancelReason,
          cancelAmount: latestCancelAmount,
          isFullRefund: true,
          adminEmail: user.email ?? null,
          items: refundItems,
        },
        restock_items_input: restockItems,
      })
      .single();

    if (error) {
      console.error("ORDER CANCEL UPDATE ERROR:", error);
      return NextResponse.json(
        { message: "환불 후 주문 업데이트에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ order: updatedOrder }, { status: 200 });
  } catch (error) {
    logServerError("admin-order-cancel", error);

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
      { message: "결제 취소 또는 환불 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
