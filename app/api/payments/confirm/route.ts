import { NextRequest, NextResponse } from "next/server";
import { notifyOrderPaid } from "@/lib/notifications";
import { getRemainingRefundableAmount } from "@/lib/order-refunds";
import {
  getOrderRecord,
  isInventoryProcessingError,
  isMissingOrdersTableError,
  mapOrderRecordToSummary,
} from "@/lib/orders";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import type { OrderRecord } from "@/lib/types";
import { cancelTossPayment, getTossAuthHeader } from "@/lib/toss-payments";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await req.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { message: "paymentKey, orderId, amount는 필수입니다." },
        { status: 400 }
      );
    }

    let existingOrder: OrderRecord | null;

    try {
      existingOrder = await getOrderRecord(orderId);
    } catch (error) {
      console.error("ORDER LOOKUP ERROR:", error);

      if (isMissingOrdersTableError(error)) {
        return NextResponse.json(
          {
            message:
              "orders 테이블이 아직 없습니다. Supabase SQL Editor에서 저장용 orders 스키마를 먼저 생성해주세요.",
          },
          { status: 500 }
        );
      }

      throw error;
    }

    if (!existingOrder) {
      return NextResponse.json(
        { message: "저장된 주문을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (existingOrder.status === "DONE") {
      return NextResponse.json(mapOrderRecordToSummary(existingOrder), { status: 200 });
    }

    if (existingOrder.status === "CANCELED") {
      return NextResponse.json(
        { message: "이미 취소 또는 환불 처리된 주문입니다." },
        { status: 409 }
      );
    }

    const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: getTossAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const data = await tossResponse.json();
    const supabase = createAdminSupabaseClient();

    if (!tossResponse.ok) {
      await supabase
        .from("orders")
        .update({
          status: "FAILED",
          fulfillment_status: "PAYMENT_FAILED",
          failure_code: data?.code || null,
          failure_message: data?.message || "결제 승인 실패",
          toss_payment_data: data,
        })
        .eq("order_id", orderId);

      return NextResponse.json(
        {
          message: data?.message || "결제 승인 실패",
          code: data?.code || null,
        },
        { status: tossResponse.status }
      );
    }

    try {
      const { data: updatedOrder, error } = await supabase
        .rpc("mark_order_paid", {
          order_id_input: orderId,
          amount_input: data.totalAmount,
          payment_key_input: data.paymentKey,
          payment_method_input: data.method ?? null,
          approved_at_input: data.approvedAt ?? null,
          toss_payment_data_input: data,
        })
        .single();

      if (error) {
        throw error;
      }

      try {
        await notifyOrderPaid(updatedOrder as OrderRecord);
      } catch (notificationError) {
        console.error("ORDER PAID NOTIFICATION ERROR:", notificationError);
      }

      return NextResponse.json(
        mapOrderRecordToSummary(updatedOrder as OrderRecord),
        { status: 200 }
      );
    } catch (error) {
      console.error("ORDER PROCESS AFTER CONFIRM ERROR:", error);

      if (isInventoryProcessingError(error)) {
        const cancelReason =
          "재고 부족 또는 상품 정보 오류로 자동 환불되었습니다.";
        const cancelAmount = getRemainingRefundableAmount(existingOrder);
        const { response: cancelResponse, data: cancelData } = await cancelTossPayment({
          paymentKey,
          cancelReason,
          cancelAmount,
          idempotencyKey: `auto-cancel-${orderId}-${Date.now()}`,
        });

        if (!cancelResponse.ok) {
          console.error("AUTO CANCEL AFTER INVENTORY ERROR FAILED:", cancelData);
          return NextResponse.json(
            {
              message:
                "결제는 승인되었지만 재고 처리에 실패했고 자동 환불도 실패했습니다. 즉시 수동 확인이 필요합니다.",
            },
            { status: 500 }
          );
        }

        const latestCancel = Array.isArray(cancelData?.cancels)
          ? cancelData.cancels[cancelData.cancels.length - 1]
          : null;
        const refundedAmount =
          typeof cancelData?.totalCancelAmount === "number"
            ? cancelData.totalCancelAmount
            : cancelAmount;
        const latestCancelAmount =
          typeof latestCancel?.cancelAmount === "number"
            ? latestCancel.cancelAmount
            : cancelAmount;

        const { error: cancelOrderError } = await supabase.rpc("record_order_refund", {
          order_id_input: orderId,
          cancel_reason_input: cancelReason,
          canceled_at_input: latestCancel?.canceledAt ?? new Date().toISOString(),
          refunded_amount_input: latestCancelAmount,
          toss_payment_data_input: cancelData,
          refund_history_entry_input: {
            id: crypto.randomUUID(),
            canceledAt: latestCancel?.canceledAt ?? new Date().toISOString(),
            cancelReason,
            cancelAmount: latestCancelAmount,
            isFullRefund: refundedAmount >= existingOrder.amount,
            items: [],
          },
          restock_items_input: [],
        });

        if (cancelOrderError) {
          console.error("ORDER AUTO CANCEL UPDATE ERROR:", cancelOrderError);
        }

        return NextResponse.json(
          { message: cancelReason },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { message: "결제 승인 후 주문 처리 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("PAYMENTS CONFIRM ERROR:", error);

    return NextResponse.json(
      { message: "결제 승인 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
