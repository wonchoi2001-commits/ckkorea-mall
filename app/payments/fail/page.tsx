"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PaymentFailPage() {
  const [reason, setReason] = useState("다시 주문 페이지에서 결제를 진행해주세요.");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    const code = params.get("code");
    const message = params.get("message");

    if (message) {
      setReason(message);
    }

    if (!orderId) {
      return;
    }

    fetch("/api/payments/fail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        code,
        message,
      }),
    }).catch((error) => {
      console.error("PAYMENT FAIL SAVE ERROR:", error);
    });
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-sm font-bold text-red-600">PAYMENT FAIL</div>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
            결제가 실패했거나 취소되었습니다
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {reason}
          </p>

          <div className="mt-8 flex gap-3">
            <Link
              href="/order"
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
            >
              주문 페이지로 이동
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
