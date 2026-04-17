"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FULFILLMENT_STATUS_OPTIONS,
  TAX_INVOICE_STATUS_OPTIONS,
} from "@/lib/order-status";
import type {
  FulfillmentStatus,
  OrderItemRecord,
  OrderRecord,
  TaxInvoiceStatus,
} from "@/lib/types";

function formatPrice(value: number) {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminOrderDetail({
  order,
  orderItems,
}: {
  order: OrderRecord;
  orderItems: OrderItemRecord[];
}) {
  const [fulfillmentStatus, setFulfillmentStatus] = useState<FulfillmentStatus>(
    order.fulfillment_status
  );
  const [taxInvoiceStatus, setTaxInvoiceStatus] = useState<TaxInvoiceStatus>(
    order.tax_invoice_status ?? "NOT_REQUESTED"
  );
  const [taxInvoiceNote, setTaxInvoiceNote] = useState(order.tax_invoice_note ?? "");
  const [shippingCarrier, setShippingCarrier] = useState(order.shipping_carrier ?? "");
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number ?? "");
  const [adminMemo, setAdminMemo] = useState(order.admin_memo ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/orders/${order.order_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fulfillment_status: fulfillmentStatus,
          tax_invoice_status: taxInvoiceStatus,
          tax_invoice_note: taxInvoiceNote,
          shipping_carrier: shippingCarrier,
          tracking_number: trackingNumber,
          admin_memo: adminMemo,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "주문 상태 저장에 실패했습니다.");
      }

      setMessage("주문 정보가 저장되었습니다.");
    } catch (error) {
      console.error("ADMIN ORDER DETAIL SAVE ERROR:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "주문 정보 저장 중 오류가 발생했습니다."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-500">ADMIN ORDER DETAIL</div>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
              주문 상세
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              주문번호 {order.order_id}의 상태, 배송정보, 주문 상품을 확인합니다.
            </p>
          </div>
          <Link
            href="/admin/orders"
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
              <h2 className="text-xl font-bold text-slate-900">주문 정보</h2>
              <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                <div>주문번호: {order.order_id}</div>
                <div>주문명: {order.order_name}</div>
                <div>결제금액: {formatPrice(order.amount)}</div>
                <div>결제상태: {order.status}</div>
                <div>결제수단: {order.payment_method || "-"}</div>
                <div>주문일시: {formatDateTime(order.created_at)}</div>
                <div>승인일시: {formatDateTime(order.approved_at)}</div>
                <div>저장된 order_items: {orderItems.length}건</div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">주문자 / 배송지</h2>
              <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                <div>주문자명: {order.customer.name}</div>
                <div>연락처: {order.customer.phone}</div>
                <div>이메일: {order.customer.email}</div>
                <div>회사명: {order.customer.company || order.business?.companyName || "-"}</div>
                <div>수령인: {order.shipping.receiver}</div>
                <div>수령인 연락처: {order.shipping.phone}</div>
                <div>우편번호: {order.shipping.zipCode}</div>
                <div>배송메모: {order.shipping.deliveryMemo || "-"}</div>
                <div className="md:col-span-2">
                  주소: {order.shipping.address1} {order.shipping.address2 || ""}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">주문 상품</h2>
              <div className="mt-5 space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={`${item.productId}-${index}`}
                    className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700"
                  >
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      <div>규격: {item.spec}</div>
                      <div>수량: {item.quantity}개</div>
                      <div>단가: {formatPrice(item.unitPrice)}</div>
                      <div>소계: {formatPrice(item.subtotal)}</div>
                      <div>배송: {item.shipping}</div>
                      <div>판매단위: {item.unit}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">운영 상태 변경</h2>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    배송 상태
                  </label>
                  <select
                    value={fulfillmentStatus}
                    onChange={(event) =>
                      setFulfillmentStatus(event.target.value as FulfillmentStatus)
                    }
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                  >
                    {FULFILLMENT_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    세금계산서 상태
                  </label>
                  <select
                    value={taxInvoiceStatus}
                    onChange={(event) =>
                      setTaxInvoiceStatus(event.target.value as TaxInvoiceStatus)
                    }
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none"
                  >
                    {TAX_INVOICE_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    택배사
                  </label>
                  <input
                    value={shippingCarrier}
                    onChange={(event) => setShippingCarrier(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
                    placeholder="택배사"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    송장번호
                  </label>
                  <input
                    value={trackingNumber}
                    onChange={(event) => setTrackingNumber(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
                    placeholder="송장번호"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    세금계산서 메모
                  </label>
                  <textarea
                    value={taxInvoiceNote}
                    onChange={(event) => setTaxInvoiceNote(event.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    관리자 메모
                  </label>
                  <textarea
                    value={adminMemo}
                    onChange={(event) => setAdminMemo(event.target.value)}
                    rows={5}
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
                {saving ? "저장 중..." : "주문 상태 저장"}
              </button>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
