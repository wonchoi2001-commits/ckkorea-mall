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
import { adminOrderPartialRefundSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const { user, response: authResponse } = await requireAdminApiUser();

  if (authResponse || !user) {
    return authResponse;
  }

  const securityResponse = enforceAdminMutationSecurity(req, "orders-partial-refund");

  if (securityResponse) {
    return securityResponse;
  }

  try {
    const parsed = adminOrderPartialRefundSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: "부분 환불 입력값을 확인해주세요." },
        { status: 400 }
      );
    }

    const {
      orderId,
      refundItems: requestedItems,
      cancelReason = "관리자 요청으로 부분 환불했습니다.",
    } = parsed.data;

    const order = await getOrderRecord(orderId);

    if (!order) {
      return NextResponse.json(
        { message: "주문을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (order.status === "CANCELED") {
      return NextResponse.json(
        { message: "이미 전체 환불된 주문입니다." },
        { status: 400 }
      );
    }

    if (order.status !== "DONE" || !order.payment_key) {
      return NextResponse.json(
        { message: "결제 완료 주문만 부분 환불할 수 있습니다." },
        { status: 400 }
      );
    }

    const refundableItems = getRefundableItems(order);
    const refundableItemMap = new Map(
      refundableItems.map((item) => [item.productId, item])
    );
    const mergedRequest = new Map<string, number>();

    for (const item of requestedItems) {
      mergedRequest.set(item.productId, (mergedRequest.get(item.productId) ?? 0) + item.quantity);
    }

    const refundItems = Array.from(mergedRequest.entries()).map(([productId, quantity]) => {
      const item = refundableItemMap.get(productId);

      if (!item) {
        throw new Error("ORDER_ITEM_NOT_FOUND");
      }

      if (quantity > item.remainingQuantity) {
        throw new Error("REFUND_QUANTITY_EXCEEDED");
      }

      return {
        productId,
        slug: item.slug,
        name: item.name,
        quantity,
        amount: item.unitPrice * quantity,
      };
    });

    const refundAmount = refundItems.reduce((sum, item) => sum + item.amount, 0);
    const remainingRefundableAmount = getRemainingRefundableAmount(order);

    if (refundAmount <= 0) {
      return NextResponse.json(
        { message: "부분 환불 금액이 0원입니다." },
        { status: 400 }
      );
    }

    if (refundAmount >= remainingRefundableAmount) {
      return NextResponse.json(
        {
          message:
            "선택한 상품 금액이 남은 환불 가능 금액과 같거나 큽니다. 전체 환불 버튼을 사용해주세요.",
        },
        { status: 400 }
      );
    }

    const { response, data } = await cancelTossPayment({
      paymentKey: order.payment_key,
      cancelReason,
      cancelAmount: refundAmount,
      idempotencyKey: `partial-refund-${orderId}-${Date.now()}`,
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || "토스 부분 환불에 실패했습니다." },
        { status: response.status }
      );
    }

    const latestCancel = Array.isArray(data?.cancels)
      ? data.cancels[data.cancels.length - 1]
      : null;
    const latestCancelAmount =
      typeof latestCancel?.cancelAmount === "number"
        ? latestCancel.cancelAmount
        : refundAmount;

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
          isFullRefund: false,
          adminEmail: user.email ?? null,
          items: refundItems,
        },
        restock_items_input: refundItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      })
      .single();

    if (error) {
      console.error("ORDER PARTIAL REFUND UPDATE ERROR:", error);
      return NextResponse.json(
        { message: "부분 환불 후 주문 업데이트에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ order: updatedOrder }, { status: 200 });
  } catch (error) {
    logServerError("admin-order-partial-refund", error);

    if (error instanceof Error) {
      if (error.message === "ORDER_ITEM_NOT_FOUND") {
        return NextResponse.json(
          { message: "주문 상품 정보를 다시 확인해주세요." },
          { status: 400 }
        );
      }

      if (error.message === "REFUND_QUANTITY_EXCEEDED") {
        return NextResponse.json(
          { message: "남은 환불 가능 수량을 초과했습니다." },
          { status: 400 }
        );
      }
    }

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
      { message: "부분 환불 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
