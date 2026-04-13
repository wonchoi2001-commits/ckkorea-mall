"use client";

import { FormEvent, useState } from "react";

type FormState = {
  customerName: string;
  companyName: string;
  phone: string;
  email: string;
  productName: string;
  quantity: string;
  spec: string;
  deliveryType: string;
  deliveryArea: string;
  requestDate: string;
  message: string;
};

const initialState: FormState = {
  customerName: "",
  companyName: "",
  phone: "",
  email: "",
  productName: "",
  quantity: "",
  spec: "",
  deliveryType: "",
  deliveryArea: "",
  requestDate: "",
  message: "",
};

export default function QuoteForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.customerName || !form.phone || !form.email || !form.message) {
      setResultMessage("이름, 연락처, 이메일, 문의내용은 필수 입력입니다.");
      return;
    }

    setLoading(true);
    setResultMessage("");

    const mergedMessage = `
[기본 문의 내용]
${form.message}

[추가 정보]
회사명: ${form.companyName || "-"}
상품명: ${form.productName || "-"}
수량: ${form.quantity || "-"}
규격/옵션: ${form.spec || "-"}
배송방식: ${form.deliveryType || "-"}
납품지역: ${form.deliveryArea || "-"}
희망납기일: ${form.requestDate || "-"}
    `.trim();

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.customerName,
          phone: form.phone,
          email: form.email,
          message: mergedMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "문의 접수 중 오류가 발생했습니다.");
      }

      setResultMessage("견적문의가 정상적으로 접수되었습니다.");
      setForm(initialState);
    } catch (error) {
      setResultMessage(
        error instanceof Error
          ? error.message
          : "문의 접수 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            담당자명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.customerName}
            onChange={(e) => updateField("customerName", e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            회사명
          </label>
          <input
            type="text"
            value={form.companyName}
            onChange={(e) => updateField("companyName", e.target.value)}
            placeholder="회사명 또는 상호명"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            연락처 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="연락 가능한 번호"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            이메일 <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="답변받을 이메일"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            상품명
          </label>
          <input
            type="text"
            value={form.productName}
            onChange={(e) => updateField("productName", e.target.value)}
            placeholder="문의할 상품명"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            수량
          </label>
          <input
            type="text"
            value={form.quantity}
            onChange={(e) => updateField("quantity", e.target.value)}
            placeholder="예: 50개 / 30장 / 1톤"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            규격 / 옵션
          </label>
          <input
            type="text"
            value={form.spec}
            onChange={(e) => updateField("spec", e.target.value)}
            placeholder="예: 백색 / M10 / 12T"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            배송 방식
          </label>
          <select
            value={form.deliveryType}
            onChange={(e) => updateField("deliveryType", e.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
          >
            <option value="">선택하세요</option>
            <option value="택배">택배</option>
            <option value="화물배송">화물배송</option>
            <option value="현장납품 문의">현장납품 문의</option>
            <option value="미정">미정</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            납품 지역
          </label>
          <input
            type="text"
            value={form.deliveryArea}
            onChange={(e) => updateField("deliveryArea", e.target.value)}
            placeholder="예: 창원 / 김해 / 부산"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            희망 납기일
          </label>
          <input
            type="date"
            value={form.requestDate}
            onChange={(e) => updateField("requestDate", e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          문의 내용 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.message}
          onChange={(e) => updateField("message", e.target.value)}
          placeholder="필요한 상품, 용도, 수량, 납품 조건 등을 자세히 적어주세요."
          rows={7}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-slate-500"
        />
      </div>

      <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        입력하신 정보는 견적 상담 및 회신 목적으로만 사용됩니다. 대량 발주나 현장
        납품 건은 상품명, 수량, 규격, 납품 지역을 함께 입력해주시면 더 빠르게
        안내받을 수 있습니다.
      </div>

      {resultMessage && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm font-medium ${
            resultMessage.includes("정상적으로")
              ? "bg-green-50 text-green-700 ring-1 ring-green-200"
              : "bg-red-50 text-red-700 ring-1 ring-red-200"
          }`}
        >
          {resultMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "접수 중..." : "견적문의 보내기"}
      </button>
    </form>
  );
}