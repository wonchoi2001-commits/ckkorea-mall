"use client";

import Link from "next/link";
import { useState } from "react";
import { QUOTE_STATUS_OPTIONS } from "@/lib/quote-status";
import type { QuoteRequestRecord, QuoteRequestStatus } from "@/lib/types";

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminQuoteDetail({
  quote,
}: {
  quote: QuoteRequestRecord;
}) {
  const [status, setStatus] = useState<QuoteRequestStatus>(quote.status);
  const [adminMemo, setAdminMemo] = useState(quote.admin_memo ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/quotes/${quote.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          admin_memo: adminMemo,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "견적문의 저장에 실패했습니다.");
      }

      setMessage("견적문의 상태가 저장되었습니다.");
    } catch (error) {
      console.error("ADMIN QUOTE DETAIL SAVE ERROR:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "견적문의 저장 중 오류가 발생했습니다."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-500">ADMIN QUOTE DETAIL</div>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
              견적문의 상세
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              문의자 정보, 상품 요청 조건, 관리자 메모를 확인합니다.
            </p>
          </div>
          <Link
            href="/admin/quotes"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
          >
            목록으로
          </Link>
        </div>

        {message ? (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
            {message}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">문의자 정보</h2>
              <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                <div>담당자명: {quote.customer_name}</div>
                <div>연락처: {quote.phone}</div>
                <div>이메일: {quote.email}</div>
                <div>회사명: {quote.company_name || "-"}</div>
                <div>사업자등록번호: {quote.business_number || "-"}</div>
                <div>프로젝트명: {quote.project_name || "-"}</div>
                <div>상태: {quote.status}</div>
                <div>접수일시: {formatDateTime(quote.created_at)}</div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">문의 내용</h2>
              <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                <div>상품명: {quote.product_name || "-"}</div>
                <div>상품 참조: {quote.product_slug || "-"}</div>
                <div>수량: {quote.quantity || "-"}</div>
                <div>규격: {quote.spec || "-"}</div>
                <div>배송 방식: {quote.delivery_type || "-"}</div>
                <div>납품 지역: {quote.delivery_area || "-"}</div>
                <div>희망 일정: {quote.request_date || "-"}</div>
                <div>사업자 문의: {quote.is_business_order ? "예" : "아니오"}</div>
                <div>세금계산서 상담: {quote.tax_invoice_needed ? "예" : "아니오"}</div>
                <div>세금계산서 이메일: {quote.tax_invoice_email || "-"}</div>
              </div>
              <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
                {quote.message}
              </div>
            </section>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">운영 처리</h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  처리 상태
                </label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as QuoteRequestStatus)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                >
                  {QUOTE_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  관리자 메모 / 답변 기록
                </label>
                <textarea
                  value={adminMemo}
                  onChange={(event) => setAdminMemo(event.target.value)}
                  rows={10}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? "저장 중..." : "견적문의 저장"}
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}
