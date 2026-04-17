import { NextRequest, NextResponse } from "next/server";
import {
  clearCheckoutSessionCookie,
  getCheckoutSessionTokenFromCookies,
  verifyCheckoutSessionToken,
} from "@/lib/checkout-security";
import { getOrderRecord, isMissingOrdersTableError } from "@/lib/orders";
import { applyRateLimit, getRequestIp, isSameOriginRequest, logServerError } from "@/lib/security";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { paymentFailSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (!isSameOriginRequest(req)) {
      return NextResponse.json(
        { message: "허용되지 않은 요청입니다." },
        { status: 403 }
      );
    }

    const rateLimit = applyRateLimit({
      key: `payments-fail:${getRequestIp(req)}`,
      limit: 20,
      windowMs: 60_000,
    });

    if (!rateLimit.ok) {
      return NextResponse.json(
        { message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const parsed = paymentFailSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: "결제 실패 요청값이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const { orderId, code, message } = parsed.data;
    const checkoutSessionToken = await getCheckoutSessionTokenFromCookies();
    const verifiedCheckoutSession = verifyCheckoutSessionToken(checkoutSessionToken, {
      orderId,
    });

    if (!verifiedCheckoutSession) {
      return NextResponse.json(
        { message: "주문 세션을 확인할 수 없습니다." },
        { status: 403 }
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
        return clearCheckoutSessionCookie(NextResponse.json({ ok: true }, { status: 200 }));
      }
    } catch (error) {
      logServerError("payments-fail-order-lookup", error, { orderId });

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
      logServerError("payments-fail-update", error, { orderId });
      return NextResponse.json(
        { message: "결제 실패 상태 저장 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return clearCheckoutSessionCookie(NextResponse.json({ ok: true }, { status: 200 }));
  } catch (error) {
    logServerError("payments-fail", error);

    return NextResponse.json(
      { message: "결제 실패 상태 저장 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
