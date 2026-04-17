"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AdminPanelHeader from "@/components/admin/AdminPanelHeader";
import { QUOTE_STATUS_OPTIONS } from "@/lib/quote-status";
import type { QuoteRequestRecord, QuoteRequestStatus } from "@/lib/types";

type QuoteViewFilter = "all" | "new" | "business" | "tax_invoice";

type QuoteDraft = {
  status: QuoteRequestStatus;
  adminMemo: string;
};

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function createDraft(quote: QuoteRequestRecord): QuoteDraft {
  return {
    status: quote.status,
    adminMemo: quote.admin_memo ?? "",
  };
}

export default function AdminQuotesManager({
  initialQuotes,
  adminEmail,
  initialError,
}: {
  initialQuotes: QuoteRequestRecord[];
  adminEmail: string;
  initialError?: string;
}) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [drafts, setDrafts] = useState<Record<string, QuoteDraft>>(
    Object.fromEntries(
      initialQuotes
        .filter((quote) => quote.id)
        .map((quote) => [String(quote.id), createDraft(quote)])
    )
  );
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState(initialError ?? "");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewFilter, setViewFilter] = useState<QuoteViewFilter>("all");

  const counts = useMemo(() => {
    return {
      total: quotes.length,
      newCount: quotes.filter((quote) => quote.status === "NEW").length,
      inProgress: quotes.filter((quote) => quote.status === "IN_PROGRESS").length,
      completed: quotes.filter((quote) => quote.status === "COMPLETED").length,
    };
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return quotes.filter((quote) => {
      const matchesFilter =
        viewFilter === "all"
          ? true
          : viewFilter === "new"
            ? quote.status === "NEW"
            : viewFilter === "business"
              ? quote.is_business_order === true
              : quote.tax_invoice_needed === true;

      if (!matchesFilter) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const searchableText = [
        quote.customer_name,
        quote.phone,
        quote.email,
        quote.company_name,
        quote.business_number,
        quote.project_name,
        quote.product_name,
        quote.product_slug,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [quotes, searchTerm, viewFilter]);

  const handleExportCsv = () => {
    downloadCsv(
      "ckkorea-quotes.csv",
      [
        [
          "접수일시",
          "처리상태",
          "문의자",
          "연락처",
          "이메일",
          "회사명",
          "사업자등록번호",
          "사업자문의",
          "세금계산서상담",
          "세금계산서이메일",
          "프로젝트명",
          "상품명",
          "상품참조",
          "수량",
          "납품지역",
        ],
        ...filteredQuotes.map((quote) => [
          formatDateTime(quote.created_at),
          QUOTE_STATUS_OPTIONS.find((option) => option.value === quote.status)?.label ??
            quote.status,
          quote.customer_name,
          quote.phone,
          quote.email,
          quote.company_name || "",
          quote.business_number || "",
          quote.is_business_order ? "예" : "아니오",
          quote.tax_invoice_needed ? "예" : "아니오",
          quote.tax_invoice_email || "",
          quote.project_name || "",
          quote.product_name || "",
          quote.product_slug || "",
          quote.quantity || "",
          quote.delivery_area || "",
        ]),
      ]
    );
  };

  const handleDraftChange = (
    quoteId: string,
    field: keyof QuoteDraft,
    value: string
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [quoteId]: {
        ...(prev[quoteId] ?? {
          status: "NEW" as QuoteRequestStatus,
          adminMemo: "",
        }),
        [field]: value,
      },
    }));
  };

  const handleSave = async (quoteId: string) => {
    const draft = drafts[quoteId];

    if (!draft) {
      return;
    }

    setSavingId(quoteId);
    setMessage("");

    try {
      const response = await fetch("/api/admin/quotes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: quoteId,
          status: draft.status,
          admin_memo: draft.adminMemo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.message || "견적문의 상태 저장에 실패했습니다.");
        return;
      }

      setQuotes((prev) =>
        prev.map((quote) => (String(quote.id) === quoteId ? data.quote : quote))
      );
      setDrafts((prev) => ({
        ...prev,
        [quoteId]: createDraft(data.quote),
      }));
      setMessage("견적문의 상태가 저장되었습니다.");
    } catch (error) {
      console.error("ADMIN QUOTE SAVE ERROR:", error);
      setMessage("견적문의 상태 저장 중 오류가 발생했습니다.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-10">
        <AdminPanelHeader
          title="견적문의 관리"
          description="대량 주문, 화물배송, 현장 납품 문의를 확인하고 처리 상태를 관리합니다."
          adminEmail={adminEmail}
          activeTab="quotes"
        />

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">전체 문의</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{counts.total}</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">신규</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{counts.newCount}</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">확인중</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{counts.inProgress}</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">완료</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{counts.completed}</div>
          </div>
        </div>

        {message ? (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
            {message}
          </div>
        ) : null}

        <div className="mb-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr_auto]">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="문의자, 회사명, 사업자번호, 상품명으로 검색"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => setViewFilter("all")}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                viewFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-700"
              }`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => setViewFilter("new")}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                viewFilter === "new"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-700"
              }`}
            >
              신규
            </button>
            <button
              type="button"
              onClick={() => setViewFilter("business")}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                viewFilter === "business"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-700"
              }`}
            >
              사업자
            </button>
            <button
              type="button"
              onClick={() => setViewFilter("tax_invoice")}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                viewFilter === "tax_invoice"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-700"
              }`}
            >
              세금계산서
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900"
          >
            CSV 내보내기
          </button>
        </div>

        <div className="space-y-5">
          {filteredQuotes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-sm text-slate-500">
              조건에 맞는 견적문의가 없습니다.
            </div>
          ) : (
            filteredQuotes.map((quote) => {
              const quoteId = String(quote.id);
              const draft = drafts[quoteId] ?? createDraft(quote);

              return (
                <div
                  key={quoteId}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-2xl font-black text-slate-900">
                          {quote.product_name || "일반 견적문의"}
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {
                            QUOTE_STATUS_OPTIONS.find((option) => option.value === quote.status)
                              ?.label
                          }
                        </span>
                        {quote.is_business_order ? (
                          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                            사업자 문의
                          </span>
                        ) : null}
                        {quote.tax_invoice_needed ? (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            세금계산서 상담
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2 text-sm text-slate-500">
                        접수일시: {formatDateTime(quote.created_at)}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 text-sm text-slate-500">
                      <div>상품참조: {quote.product_slug || "-"}</div>
                      <Link
                        href={`/admin/quotes/${quoteId}`}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
                      >
                        견적 상세 보기
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-5">
                          <div className="text-sm font-bold text-slate-900">문의자 정보</div>
                          <div className="mt-3 space-y-2 text-sm text-slate-600">
                            <div>이름: {quote.customer_name}</div>
                            <div>연락처: {quote.phone}</div>
                            <div>이메일: {quote.email}</div>
                            <div>회사명: {quote.company_name || "-"}</div>
                            <div>사업자등록번호: {quote.business_number || "-"}</div>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-5">
                          <div className="text-sm font-bold text-slate-900">요청 정보</div>
                          <div className="mt-3 space-y-2 text-sm text-slate-600">
                            <div>수량: {quote.quantity || "-"}</div>
                            <div>규격: {quote.spec || "-"}</div>
                            <div>배송방식: {quote.delivery_type || "-"}</div>
                            <div>납품지역: {quote.delivery_area || "-"}</div>
                            <div>희망납기일: {quote.request_date || "-"}</div>
                            <div>프로젝트명: {quote.project_name || "-"}</div>
                            <div>
                              세금계산서 요청: {quote.tax_invoice_needed ? "예" : "아니오"}
                            </div>
                            <div>
                              세금계산서 이메일: {quote.tax_invoice_email || "-"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-5">
                        <div className="text-sm font-bold text-slate-900">문의 내용</div>
                        <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                          {quote.message}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-5">
                      <div className="text-sm font-bold text-slate-900">처리 상태 / 메모</div>

                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            처리 상태
                          </label>
                          <select
                            value={draft.status}
                            onChange={(event) =>
                              handleDraftChange(quoteId, "status", event.target.value)
                            }
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
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
                            관리자 메모
                          </label>
                          <textarea
                            value={draft.adminMemo}
                            onChange={(event) =>
                              handleDraftChange(quoteId, "adminMemo", event.target.value)
                            }
                            rows={6}
                            placeholder="회신 예정일, 통화 내용, 견적 발송 상태 등을 기록"
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSave(quoteId)}
                          disabled={savingId === quoteId}
                          className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white disabled:opacity-60"
                        >
                          {savingId === quoteId ? "저장 중..." : "상태 저장"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
