"use client";

import { FormEvent, useMemo, useState } from "react";

type ProductOption = {
  name: string;
  slug: string;
};

type FormState = {
  customerName: string;
  companyName: string;
  isBusinessOrder: boolean;
  businessNumber: string;
  projectName: string;
  taxInvoiceNeeded: boolean;
  taxInvoiceEmail: string;
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

const createInitialState = (initialProductName?: string): FormState => ({
  customerName: "",
  companyName: "",
  isBusinessOrder: false,
  businessNumber: "",
  projectName: "",
  taxInvoiceNeeded: false,
  taxInvoiceEmail: "",
  phone: "",
  email: "",
  productName: initialProductName ?? "",
  quantity: "",
  spec: "",
  deliveryType: "",
  deliveryArea: "",
  requestDate: "",
  message: "",
});

export default function QuoteForm({
  initialProductName,
  initialProductSlug,
  productOptions,
}: {
  initialProductName?: string;
  initialProductSlug?: string;
  productOptions: ProductOption[];
}) {
  const [form, setForm] = useState<FormState>(createInitialState(initialProductName));
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const matchedProduct = useMemo(() => {
    const normalizedProductName = form.productName.trim().toLowerCase();

    if (!normalizedProductName) {
      return null;
    }

    return (
      productOptions.find(
        (product) => product.name.trim().toLowerCase() === normalizedProductName
      ) ?? null
    );
  }, [form.productName, productOptions]);

  const derivedProductSlug = useMemo(() => {
    if (matchedProduct?.slug) {
      return matchedProduct.slug;
    }

    if (
      initialProductSlug &&
      initialProductName &&
      form.productName.trim() === initialProductName.trim()
    ) {
      return initialProductSlug;
    }

    return null;
  }, [form.productName, initialProductName, initialProductSlug, matchedProduct]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.customerName || !form.phone || !form.email || !form.message) {
      setResultMessage("이름, 연락처, 이메일, 문의내용은 필수 입력입니다.");
      return;
    }

    if ((form.isBusinessOrder || form.taxInvoiceNeeded) && (!form.companyName || !form.businessNumber)) {
      setResultMessage("사업자 문의는 회사명과 사업자등록번호를 입력해주세요.");
      return;
    }

    if (form.taxInvoiceNeeded && !(form.taxInvoiceEmail || form.email)) {
      setResultMessage("세금계산서 수신 이메일을 입력해주세요.");
      return;
    }

    setLoading(true);
    setResultMessage("");

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: form.customerName,
          company_name: form.companyName,
          is_business_order: form.isBusinessOrder,
          business_number: form.businessNumber,
          project_name: form.projectName,
          tax_invoice_needed: form.taxInvoiceNeeded,
          tax_invoice_email: form.taxInvoiceNeeded
            ? form.taxInvoiceEmail || form.email
            : null,
          phone: form.phone,
          email: form.email,
          product_name: form.productName,
          product_slug: derivedProductSlug,
          quantity: form.quantity,
          spec: form.spec,
          delivery_type: form.deliveryType,
          delivery_area: form.deliveryArea,
          request_date: form.requestDate || null,
          message: form.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "문의 접수 중 오류가 발생했습니다.");
      }

      setResultMessage("견적문의가 정상적으로 접수되었습니다.");
      setForm(createInitialState(initialProductName));
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

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={form.isBusinessOrder}
              onChange={(e) => updateField("isBusinessOrder", e.target.checked)}
            />
            사업자 / 법인 견적입니다
          </label>

          <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={form.taxInvoiceNeeded}
              onChange={(e) => updateField("taxInvoiceNeeded", e.target.checked)}
            />
            세금계산서 발행 상담이 필요합니다
          </label>
        </div>

        {form.isBusinessOrder || form.taxInvoiceNeeded ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                사업자등록번호
              </label>
              <input
                type="text"
                value={form.businessNumber}
                onChange={(e) => updateField("businessNumber", e.target.value)}
                placeholder="사업자등록번호"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                현장명 / 프로젝트명
              </label>
              <input
                type="text"
                value={form.projectName}
                onChange={(e) => updateField("projectName", e.target.value)}
                placeholder="예: OO현장 / OOO 리모델링"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            {form.taxInvoiceNeeded ? (
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  세금계산서 수신 이메일
                </label>
                <input
                  type="email"
                  value={form.taxInvoiceEmail}
                  onChange={(e) => updateField("taxInvoiceEmail", e.target.value)}
                  placeholder="발행 받을 이메일"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>
            ) : null}
          </div>
        ) : null}
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
            상품명 또는 상품 참조
          </label>
          <input
            list="quote-product-options"
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

      {resultMessage ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm font-medium ${
            resultMessage.includes("정상적으로")
              ? "bg-green-50 text-green-700 ring-1 ring-green-200"
              : "bg-red-50 text-red-700 ring-1 ring-red-200"
          }`}
        >
          {resultMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "접수 중..." : "견적문의 보내기"}
      </button>

      <datalist id="quote-product-options">
        {productOptions.map((product) => (
          <option key={product.slug} value={product.name} />
        ))}
      </datalist>
    </form>
  );
}
