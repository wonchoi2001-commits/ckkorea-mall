"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/CartProvider";
import type { OrderSummary } from "@/lib/types";

function formatPrice(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value) + "원";
}

export default function PaymentSuccessPage() {
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState<OrderSummary | null>(null);
  const clearCartRef = useRef(clearCart);

  useEffect(() => {
    clearCartRef.current = clearCart;
  }, [clearCart]);

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);

        const paymentKey = params.get("paymentKey");
        const orderId = params.get("orderId");
        const amount = params.get("amount");

        if (!paymentKey || !orderId || !amount) {
          setError("결제 승인에 필요한 값이 없습니다.");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data?.message || "결제 승인 실패");
          setLoading(false);
          return;
        }

        if (typeof window !== "undefined") {
          const checkoutSource = sessionStorage.getItem("ckkorea-checkout-source");

          if (checkoutSource === "cart") {
            clearCartRef.current();
          }

          sessionStorage.removeItem("ckkorea-checkout-source");
        }

        setResult(data);
      } catch (error) {
        console.error("PAYMENT SUCCESS PAGE ERROR:", error);
        setError("결제 승인 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-3xl px-4 py-16">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-sm font-bold text-slate-500">PAYMENT CHECK</div>
            <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
              결제 승인 확인 중입니다
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              잠시만 기다려주세요.
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-3xl px-4 py-16">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-sm font-bold text-red-600">PAYMENT FAILED</div>
            <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
              결제 승인에 실패했습니다
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">{error}</p>

            <div className="mt-8 flex gap-3">
              <Link
                href="/order"
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
              >
                주문 페이지로 돌아가기
              </Link>
              <Link
                href="/"
                className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-900"
              >
                메인으로 가기
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-sm font-bold text-green-600">PAYMENT SUCCESS</div>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
            결제가 완료되었습니다
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            결제 승인과 주문 상태 저장까지 완료되었습니다.
          </p>

          <div className="mt-8 rounded-2xl bg-slate-50 p-6">
            <div className="grid gap-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">주문번호</span>
                <span className="font-semibold text-slate-900">
                  {result?.orderId ?? "-"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">상품명</span>
                <span className="font-semibold text-slate-900">
                  {result?.orderName ?? "-"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">결제금액</span>
                <span className="font-semibold text-slate-900">
                  {formatPrice(result?.amount ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">결제수단</span>
                <span className="font-semibold text-slate-900">
                  {result?.method ?? "-"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">승인시각</span>
                <span className="font-semibold text-slate-900">
                  {result?.approvedAt ?? "-"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">주문상태</span>
                <span className="font-semibold text-slate-900">
                  {result?.status ?? "-"}
                </span>
              </div>
              {result?.isBusinessOrder ? (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">사업자 주문</span>
                  <span className="font-semibold text-slate-900">예</span>
                </div>
              ) : null}
              {result?.taxInvoiceStatus && result.taxInvoiceStatus !== "NOT_REQUESTED" ? (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">세금계산서</span>
                  <span className="font-semibold text-slate-900">
                    {result.taxInvoiceStatus === "ISSUED"
                      ? "발행 완료"
                      : "발행 요청 접수"}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
            >
              메인으로 돌아가기
            </Link>
            <Link
              href="/products"
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-900"
            >
              다른 상품 보기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
