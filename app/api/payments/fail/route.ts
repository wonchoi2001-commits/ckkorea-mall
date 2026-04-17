import { NextRequest, NextResponse } from "next/server";
import { getOrderRecord, isMissingOrdersTableError } from "@/lib/orders";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { orderId, code, message } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { message: "orderId는 필수입니다." },
        { status: 400 }
      );
    }

    try {
      const order = await getOrderRecord(orderId);

      if (!order) {
        return NextResponse.json(
          { message: "저장된 주문을 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      if (order.status === "DONE") {
        return NextResponse.json({ ok: true }, { status: 200 });
      }
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

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from("orders")
      .update({
        status: "FAILED",
        fulfillment_status: "PAYMENT_FAILED",
        failure_code: code || null,
        failure_message: message || "결제 실패 또는 취소",
      })
      .eq("order_id", orderId);

    if (error) {
      console.error("ORDER FAIL UPDATE ERROR:", error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("PAYMENTS FAIL ERROR:", error);

    return NextResponse.json(
      { message: "결제 실패 상태 저장 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
