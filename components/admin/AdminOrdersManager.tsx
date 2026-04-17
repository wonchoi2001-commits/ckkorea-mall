"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AdminPanelHeader from "@/components/admin/AdminPanelHeader";
import {
  getRefundableItems,
  getRemainingRefundableAmount,
  hasPartialRefund,
  normalizeRefundHistory,
} from "@/lib/order-refunds";
import {
  FULFILLMENT_STATUS_OPTIONS,
  TAX_INVOICE_STATUS_OPTIONS,
} from "@/lib/order-status";
import type {
  FulfillmentStatus,
  OrderRecord,
  OrderRefundHistoryEntry,
  PaymentStatus,
  TaxInvoiceStatus,
} from "@/lib/types";

type OrderViewFilter = "all" | "paid" | "business" | "tax_invoice" | "refund";

type OrderDraft = {
  fulfillmentStatus: FulfillmentStatus;
  taxInvoiceStatus: TaxInvoiceStatus;
  taxInvoiceNote: string;
  shippingCarrier: string;
  trackingNumber: string;
  adminMemo: string;
  cancelReason: string;
  refundQuantities: Record<string, string>;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value) + "원";
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

function getRefundInputKey(productId: string, index: number) {
  return `${productId}:${index}`;
}

function createRefundQuantityDraft(order: OrderRecord) {
  return Object.fromEntries(
    getRefundableItems(order).map((item, index) => [
      getRefundInputKey(item.productId, index),
      "",
    ])
  );
}

function getPaymentBadge(order: OrderRecord) {
  if (order.status === "DONE" && hasPartialRefund(order)) {
    return "bg-sky-100 text-sky-700";
  }

  switch (order.status) {
    case "DONE":
      return "bg-green-100 text-green-700";
    case "FAILED":
      return "bg-red-100 text-red-700";
    case "CANCELED":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-amber-100 text-amber-800";
  }
}

function getPaymentLabel(order: OrderRecord) {
  if (order.status === "DONE" && hasPartialRefund(order)) {
    return "부분 환불";
  }

  switch (order.status) {
    case "DONE":
      return "결제 완료";
    case "FAILED":
      return "결제 실패";
    case "CANCELED":
      return "취소 / 환불 완료";
    default:
      return "결제 대기";
  }
}

function getFulfillmentLabel(status: FulfillmentStatus) {
  return (
    FULFILLMENT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
  );
}

function getTaxInvoiceLabel(status?: TaxInvoiceStatus | null) {
  return (
    TAX_INVOICE_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    "미요청"
  );
}

function getEditableFulfillmentOptions(status: PaymentStatus) {
  switch (status) {
    case "DONE":
      return FULFILLMENT_STATUS_OPTIONS.filter((option) =>
        ["PREPARING", "READY_TO_SHIP", "SHIPPED", "DELIVERED"].includes(option.value)
      );
    case "FAILED":
      return FULFILLMENT_STATUS_OPTIONS.filter(
        (option) => option.value === "PAYMENT_FAILED"
      );
    case "CANCELED":
      return FULFILLMENT_STATUS_OPTIONS.filter((option) => option.value === "CANCELED");
    default:
      return FULFILLMENT_STATUS_OPTIONS.filter(
        (option) => option.value === "PENDING_PAYMENT"
      );
  }
}

function createDraft(order: OrderRecord): OrderDraft {
  return {
    fulfillmentStatus: order.fulfillment_status,
    taxInvoiceStatus: order.tax_invoice_status ?? "NOT_REQUESTED",
    taxInvoiceNote: order.tax_invoice_note ?? "",
    shippingCarrier: order.shipping_carrier ?? "",
    trackingNumber: order.tracking_number ?? "",
    adminMemo: order.admin_memo ?? "",
    cancelReason: order.cancel_reason ?? "",
    refundQuantities: createRefundQuantityDraft(order),
  };
}

function getRefundHistory(order: OrderRecord) {
  return normalizeRefundHistory(order.refund_history);
}

function getRefundSummaryText(entry: OrderRefundHistoryEntry) {
  if (entry.items.length === 0) {
    return "금액 기준 환불";
  }

  return entry.items.map((item) => `${item.name} ${item.quantity}개`).join(", ");
}

export default function AdminOrdersManager({
  initialOrders,
  adminEmail,
  initialError,
}: {
  initialOrders: OrderRecord[];
  adminEmail: string;
  initialError?: string;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [drafts, setDrafts] = useState<Record<string, OrderDraft>>(
    Object.fromEntries(initialOrders.map((order) => [order.order_id, createDraft(order)]))
  );
  const [savingOrderId, setSavingOrderId] = useState("");
  const [cancelingOrderId, setCancelingOrderId] = useState("");
  const [partialRefundingOrderId, setPartialRefundingOrderId] = useState("");
  const [message, setMessage] = useState(initialError ?? "");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewFilter, setViewFilter] = useState<OrderViewFilter>("all");

  const counts = useMemo(() => {
    return {
      total: orders.length,
      paid: orders.filter((order) => order.status === "DONE").length,
      partialRefunded: orders.filter((order) => hasPartialRefund(order)).length,
      taxInvoiceRequested: orders.filter(
        (order) =>
          order.business?.taxInvoiceRequested ||
          order.tax_invoice_status === "REQUESTED" ||
          order.tax_invoice_status === "ISSUED"
      ).length,
      failed: orders.filter((order) => order.status === "FAILED").length,
      canceled: orders.filter((order) => order.status === "CANCELED").length,
      shipping: orders.filter((order) =>
        ["READY_TO_SHIP", "SHIPPED"].includes(order.fulfillment_status)
      ).length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const hasTaxInvoiceWorkflow =
        order.business?.taxInvoiceRequested ||
        order.tax_invoice_status === "REQUESTED" ||
        order.tax_invoice_status === "ISSUED";

      const matchesFilter =
        viewFilter === "all"
          ? true
          : viewFilter === "paid"
            ? order.status === "DONE"
            : viewFilter === "business"
              ? order.business?.isBusinessOrder === true
              : viewFilter === "tax_invoice"
                ? hasTaxInvoiceWorkflow
                : hasPartialRefund(order) || order.status === "CANCELED";

      if (!matchesFilter) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const searchableText = [
        order.order_id,
        order.order_name,
        order.customer.name,
        order.customer.phone,
        order.customer.email,
        order.customer.company,
        order.business?.companyName,
        order.business?.businessNumber,
        order.business?.projectName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [orders, searchTerm, viewFilter]);

  const handleExportCsv = () => {
    downloadCsv(
      "ckkorea-orders.csv",
      [
        [
          "주문번호",
          "주문명",
          "주문일시",
          "결제상태",
          "배송상태",
          "결제금액",
          "누적환불",
          "주문자명",
          "연락처",
          "이메일",
          "회사명",
          "사업자주문",
          "사업자등록번호",
          "프로젝트명",
          "세금계산서상태",
          "발행이메일",
        ],
        ...filteredOrders.map((order) => [
          order.order_id,
          order.order_name,
          formatDateTime(order.created_at),
          getPaymentLabel(order),
          getFulfillmentLabel(order.fulfillment_status),
          String(order.amount),
          String(order.refunded_amount ?? 0),
          order.customer.name,
          order.customer.phone,
          order.customer.email,
          order.business?.companyName || order.customer.company || "",
          order.business?.isBusinessOrder ? "예" : "아니오",
          order.business?.businessNumber || "",
          order.business?.projectName || "",
          getTaxInvoiceLabel(order.tax_invoice_status),
          order.business?.taxInvoiceEmail || "",
        ]),
      ]
    );
  };

  const handleDraftChange = (
    orderId: string,
    field: keyof Omit<OrderDraft, "refundQuantities">,
    value: string
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] ?? createDraft(orders.find((order) => order.order_id === orderId)!)),
        [field]: value,
      },
    }));
  };

  const handleRefundQuantityChange = (
    orderId: string,
    refundKey: string,
    value: string
  ) => {
    if (!/^\d*$/.test(value)) {
      return;
    }

    setDrafts((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] ?? createDraft(orders.find((order) => order.order_id === orderId)!)),
        refundQuantities: {
          ...(prev[orderId]?.refundQuantities ?? {}),
          [refundKey]: value,
        },
      },
    }));
  };

  const applyUpdatedOrder = (nextOrder: OrderRecord) => {
    setOrders((prev) =>
      prev.map((order) => (order.order_id === nextOrder.order_id ? nextOrder : order))
    );
    setDrafts((prev) => ({
      ...prev,
      [nextOrder.order_id]: createDraft(nextOrder),
    }));
  };

  const handleSave = async (orderId: string) => {
    const draft = drafts[orderId];

    if (!draft) {
      return;
    }

    setSavingOrderId(orderId);
    setMessage("");

    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          fulfillment_status: draft.fulfillmentStatus,
          tax_invoice_status: draft.taxInvoiceStatus,
          tax_invoice_note: draft.taxInvoiceNote,
          shipping_carrier: draft.shippingCarrier,
          tracking_number: draft.trackingNumber,
          admin_memo: draft.adminMemo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.message || "주문 상태 저장에 실패했습니다.");
        return;
      }

      applyUpdatedOrder(data.order);
      setMessage("주문 상태가 저장되었습니다.");
    } catch (error) {
      console.error("ADMIN ORDER SAVE ERROR:", error);
      setMessage("주문 상태 저장 중 오류가 발생했습니다.");
    } finally {
      setSavingOrderId("");
    }
  };

  const handleCancel = async (order: OrderRecord) => {
    const draft = drafts[order.order_id];
    const remainingRefundableAmount = getRemainingRefundableAmount(order);

    if (remainingRefundableAmount <= 0) {
      setMessage("이미 전체 환불이 완료된 주문입니다.");
      return;
    }

    const confirmed = window.confirm(
      `${order.order_name} 주문의 남은 금액 ${formatPrice(remainingRefundableAmount)}을 전체 환불할까요?`
    );

    if (!confirmed) {
      return;
    }

    setCancelingOrderId(order.order_id);
    setMessage("");

    try {
      const response = await fetch("/api/admin/orders/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.order_id,
          cancelReason:
            draft?.cancelReason?.trim() || "관리자 요청으로 남은 결제금액을 전체 환불했습니다.",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.message || "결제 취소 또는 환불에 실패했습니다.");
        return;
      }

      const nextOrder = "order" in data ? data.order : null;

      if (nextOrder) {
        applyUpdatedOrder(nextOrder);
      }

      setMessage("남은 결제금액 전체 환불이 완료되었습니다.");
    } catch (error) {
      console.error("ADMIN ORDER CANCEL ERROR:", error);
      setMessage("결제 취소 또는 환불 처리 중 오류가 발생했습니다.");
    } finally {
      setCancelingOrderId("");
    }
  };

  const handlePartialRefund = async (order: OrderRecord) => {
    const draft = drafts[order.order_id];

    if (!draft) {
      return;
    }

    const refundableItems = getRefundableItems(order);
    const refundItems = refundableItems
      .map((item, index) => {
        const refundKey = getRefundInputKey(item.productId, index);
        const quantity = Number(draft.refundQuantities[refundKey] || "0");

        if (!Number.isInteger(quantity) || quantity <= 0) {
          return null;
        }

        return {
          productId: item.productId,
          quantity,
          name: item.name,
          remainingQuantity: item.remainingQuantity,
          amount: item.unitPrice * quantity,
        };
      })
      .filter(
        (
          item
        ): item is {
          productId: string;
          quantity: number;
          name: string;
          remainingQuantity: number;
          amount: number;
        } => item !== null
      );

    if (refundItems.length === 0) {
      setMessage("부분 환불할 상품 수량을 먼저 입력해주세요.");
      return;
    }

    if (refundItems.some((item) => item.quantity > item.remainingQuantity)) {
      setMessage("남은 환불 가능 수량을 초과한 상품이 있습니다.");
      return;
    }

    const refundAmount = refundItems.reduce((sum, item) => sum + item.amount, 0);
    const refundSummary = refundItems
      .map((item) => `${item.name} ${item.quantity}개`)
      .join(", ");
    const confirmed = window.confirm(
      `${refundSummary}\n총 ${formatPrice(refundAmount)}을 부분 환불할까요?`
    );

    if (!confirmed) {
      return;
    }

    setPartialRefundingOrderId(order.order_id);
    setMessage("");

    try {
      const response = await fetch("/api/admin/orders/refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.order_id,
          cancelReason:
            draft.cancelReason.trim() || "관리자 요청으로 선택 상품을 부분 환불했습니다.",
          refundItems: refundItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.message || "부분 환불 처리에 실패했습니다.");
        return;
      }

      applyUpdatedOrder(data.order);
      setMessage("부분 환불이 완료되었습니다.");
    } catch (error) {
      console.error("ADMIN ORDER PARTIAL REFUND ERROR:", error);
      setMessage("부분 환불 처리 중 오류가 발생했습니다.");
    } finally {
      setPartialRefundingOrderId("");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-10">
        <AdminPanelHeader
          title="주문 운영 관리"
          description="결제 완료 주문을 확인하고 배송 상태, 택배사, 송장번호, 내부 메모, 부분 환불 이력을 관리합니다."
          adminEmail={adminEmail}
          activeTab="orders"
        />

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">전체 주문</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{counts.total}</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">결제 완료</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{counts.paid}</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">부분 환불</div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {counts.partialRefunded}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">세금계산서 요청</div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {counts.taxInvoiceRequested}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">배송 진행</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{counts.shipping}</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">결제 실패</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{counts.failed}</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">취소 / 환불</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{counts.canceled}</div>
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
            placeholder="주문번호, 주문자명, 회사명, 사업자번호로 검색"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
              onClick={() => setViewFilter("paid")}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                viewFilter === "paid"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-700"
              }`}
            >
              결제완료
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
            <button
              type="button"
              onClick={() => setViewFilter("refund")}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                viewFilter === "refund"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-700"
              }`}
            >
              환불건
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
          {filteredOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-sm text-slate-500">
              조건에 맞는 주문이 없습니다.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const draft = drafts[order.order_id] ?? createDraft(order);
              const fulfillmentOptions = getEditableFulfillmentOptions(order.status);
              const isCanceledOrder = order.status === "CANCELED";
              const refundableItems = getRefundableItems(order);
              const remainingRefundableAmount = getRemainingRefundableAmount(order);
              const refundHistory = getRefundHistory(order);
              const hasTaxInvoiceWorkflow =
                order.business?.taxInvoiceRequested ||
                order.tax_invoice_status === "REQUESTED" ||
                order.tax_invoice_status === "ISSUED";

              return (
                <div
                  key={order.order_id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-2xl font-black text-slate-900">
                          {order.order_name}
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getPaymentBadge(
                            order
                          )}`}
                        >
                          {getPaymentLabel(order)}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          배송 {getFulfillmentLabel(order.fulfillment_status)}
                        </span>
                        {hasPartialRefund(order) ? (
                          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                            누적 환불 {formatPrice(order.refunded_amount ?? 0)}
                          </span>
                        ) : null}
                        {order.business?.isBusinessOrder ? (
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                            사업자 주문
                          </span>
                        ) : null}
                        {hasTaxInvoiceWorkflow ? (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            세금계산서 {getTaxInvoiceLabel(order.tax_invoice_status)}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2 text-sm text-slate-500">
                        주문번호: {order.order_id}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        주문일시: {formatDateTime(order.created_at)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-slate-500">결제금액</div>
                      <div className="mt-2 text-3xl font-black text-slate-900">
                        {formatPrice(order.amount)}
                      </div>
                      <Link
                        href={`/admin/orders/${order.order_id}`}
                        className="mt-3 inline-flex rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
                      >
                        주문 상세 보기
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
                    <div className="space-y-6">
                      <div className="rounded-2xl bg-slate-50 p-5">
                        <div className="text-sm font-bold text-slate-900">주문 상품</div>
                        <div className="mt-4 space-y-3">
                          {refundableItems.map((item) => (
                            <div
                              key={`${order.order_id}-${item.productId}`}
                              className="rounded-2xl border border-slate-200 bg-white p-4"
                            >
                              <div className="font-bold text-slate-900">{item.name}</div>
                              <div className="mt-1 text-sm text-slate-600">
                                규격: {item.spec} / 단위: {item.unit}
                              </div>
                              <div className="mt-1 text-sm text-slate-600">
                                원주문 수량: {item.quantity} / 주문 소계:{" "}
                                {formatPrice(item.subtotal)}
                              </div>
                              {item.refundedQuantity > 0 ? (
                                <div className="mt-1 text-sm font-medium text-sky-700">
                                  환불됨: {item.refundedQuantity} / 남은 출고 수량:{" "}
                                  {item.remainingQuantity}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-5">
                          <div className="text-sm font-bold text-slate-900">주문자 정보</div>
                          <div className="mt-3 space-y-2 text-sm text-slate-600">
                            <div>이름: {order.customer.name}</div>
                            <div>연락처: {order.customer.phone}</div>
                            <div>이메일: {order.customer.email}</div>
                            <div>회사명: {order.customer.company || "-"}</div>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-5">
                          <div className="text-sm font-bold text-slate-900">결제 정보</div>
                          <div className="mt-3 space-y-2 text-sm text-slate-600">
                            <div>결제수단: {order.payment_method || "-"}</div>
                            <div>승인시각: {formatDateTime(order.approved_at)}</div>
                            <div>취소시각: {formatDateTime(order.canceled_at)}</div>
                            <div>환불금액: {formatPrice(order.refunded_amount ?? 0)}</div>
                            <div>잔여 환불 가능금액: {formatPrice(remainingRefundableAmount)}</div>
                            <div>
                              세금계산서 상태: {getTaxInvoiceLabel(order.tax_invoice_status)}
                            </div>
                            <div>실패사유: {order.failure_message || "-"}</div>
                            <div>취소사유: {order.cancel_reason || "-"}</div>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-5 md:col-span-2">
                          <div className="text-sm font-bold text-slate-900">사업자 주문 정보</div>
                          <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                            <div>사업자 주문: {order.business?.isBusinessOrder ? "예" : "아니오"}</div>
                            <div>회사명: {order.business?.companyName || order.customer.company || "-"}</div>
                            <div>사업자등록번호: {order.business?.businessNumber || "-"}</div>
                            <div>대표자명: {order.business?.ceoName || "-"}</div>
                            <div>업태: {order.business?.businessType || "-"}</div>
                            <div>업종: {order.business?.businessItem || "-"}</div>
                            <div>현장명 / 프로젝트명: {order.business?.projectName || "-"}</div>
                            <div>발주번호: {order.business?.purchaseOrderNumber || "-"}</div>
                            <div>세금계산서 요청: {hasTaxInvoiceWorkflow ? "예" : "아니오"}</div>
                            <div>발행 이메일: {order.business?.taxInvoiceEmail || "-"}</div>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-5 md:col-span-2">
                          <div className="text-sm font-bold text-slate-900">배송 정보</div>
                          <div className="mt-3 space-y-2 text-sm text-slate-600">
                            <div>수령인: {order.shipping.receiver}</div>
                            <div>연락처: {order.shipping.phone}</div>
                            <div>
                              주소: ({order.shipping.zipCode}) {order.shipping.address1}{" "}
                              {order.shipping.address2}
                            </div>
                            <div>메모: {order.shipping.deliveryMemo || "-"}</div>
                          </div>
                        </div>
                      </div>

                      {refundHistory.length > 0 ? (
                        <div className="rounded-2xl bg-slate-50 p-5">
                          <div className="text-sm font-bold text-slate-900">환불 이력</div>
                          <div className="mt-4 space-y-3">
                            {refundHistory.map((entry) => (
                              <div
                                key={entry.id}
                                className="rounded-2xl border border-slate-200 bg-white p-4"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="font-semibold text-slate-900">
                                    {entry.isFullRefund ? "전체 환불" : "부분 환불"}
                                  </div>
                                  <div className="text-sm font-bold text-slate-900">
                                    {formatPrice(entry.cancelAmount)}
                                  </div>
                                </div>
                                <div className="mt-2 text-sm text-slate-600">
                                  처리시각: {formatDateTime(entry.canceledAt)}
                                </div>
                                <div className="mt-1 text-sm text-slate-600">
                                  처리자: {entry.adminEmail || "관리자"}
                                </div>
                                <div className="mt-1 text-sm text-slate-600">
                                  대상: {getRefundSummaryText(entry)}
                                </div>
                                <div className="mt-1 text-sm text-slate-600">
                                  사유: {entry.cancelReason || "-"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-5">
                      <div className="text-sm font-bold text-slate-900">운영 메모 / 배송 상태</div>

                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            배송 상태
                          </label>
                          <select
                            value={draft.fulfillmentStatus}
                            disabled={isCanceledOrder}
                            onChange={(event) =>
                              handleDraftChange(
                                order.order_id,
                                "fulfillmentStatus",
                                event.target.value
                              )
                            }
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                          >
                            {fulfillmentOptions.map((option) => (
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
                            value={draft.shippingCarrier}
                            onChange={(event) =>
                              handleDraftChange(
                                order.order_id,
                                "shippingCarrier",
                                event.target.value
                              )
                            }
                            placeholder="예: CJ대한통운"
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            송장번호
                          </label>
                          <input
                            value={draft.trackingNumber}
                            onChange={(event) =>
                              handleDraftChange(
                                order.order_id,
                                "trackingNumber",
                                event.target.value
                              )
                            }
                            placeholder="송장번호 입력"
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            내부 메모
                          </label>
                          <textarea
                            value={draft.adminMemo}
                            onChange={(event) =>
                              handleDraftChange(
                                order.order_id,
                                "adminMemo",
                                event.target.value
                              )
                            }
                            rows={5}
                            placeholder="출고 유의사항, 고객 요청사항 등을 기록"
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none"
                          />
                        </div>

                        {hasTaxInvoiceWorkflow ? (
                          <>
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-slate-700">
                                세금계산서 상태
                              </label>
                              <select
                                value={draft.taxInvoiceStatus}
                                onChange={(event) =>
                                  handleDraftChange(
                                    order.order_id,
                                    "taxInvoiceStatus",
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                              >
                                {TAX_INVOICE_STATUS_OPTIONS.filter(
                                  (option) => option.value !== "NOT_REQUESTED"
                                ).map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-semibold text-slate-700">
                                세금계산서 메모
                              </label>
                              <textarea
                                value={draft.taxInvoiceNote}
                                onChange={(event) =>
                                  handleDraftChange(
                                    order.order_id,
                                    "taxInvoiceNote",
                                    event.target.value
                                  )
                                }
                                rows={4}
                                placeholder="발행일, 담당자 전달사항, 증빙 처리 메모 등을 기록"
                                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none"
                              />
                            </div>
                          </>
                        ) : null}

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            환불 사유
                          </label>
                          <textarea
                            value={draft.cancelReason}
                            onChange={(event) =>
                              handleDraftChange(
                                order.order_id,
                                "cancelReason",
                                event.target.value
                              )
                            }
                            rows={3}
                            placeholder="고객 요청, 반품, 오주문, 가격조정 등의 사유를 기록"
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none"
                          />
                        </div>

                        {order.status === "DONE" && remainingRefundableAmount > 0 ? (
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <div className="text-sm font-bold text-slate-900">
                              부분 환불 수량 선택
                            </div>
                            <div className="mt-1 text-xs leading-5 text-slate-500">
                              선택한 상품 수량만 환불하고 재고를 복구합니다. 전체 금액을 모두
                              환불하려면 아래 전체 환불 버튼을 사용하세요.
                            </div>
                            <div className="mt-4 space-y-3">
                              {refundableItems.map((item, index) => {
                                const refundKey = getRefundInputKey(item.productId, index);
                                const isDisabled = item.remainingQuantity <= 0;

                                return (
                                  <div
                                    key={refundKey}
                                    className="rounded-2xl border border-slate-200 bg-white p-3"
                                  >
                                    <div className="font-semibold text-slate-900">
                                      {item.name}
                                    </div>
                                    <div className="mt-1 text-xs text-slate-500">
                                      남은 환불 가능 수량 {item.remainingQuantity} / 단가{" "}
                                      {formatPrice(item.unitPrice)}
                                    </div>
                                    <input
                                      type="number"
                                      min={0}
                                      max={item.remainingQuantity}
                                      disabled={isDisabled}
                                      value={draft.refundQuantities[refundKey] ?? ""}
                                      onChange={(event) =>
                                        handleRefundQuantityChange(
                                          order.order_id,
                                          refundKey,
                                          event.target.value
                                        )
                                      }
                                      placeholder={isDisabled ? "환불 완료" : "0"}
                                      className="mt-3 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-100"
                                    />
                                  </div>
                                );
                              })}
                            </div>

                            <button
                              type="button"
                              onClick={() => handlePartialRefund(order)}
                              disabled={
                                partialRefundingOrderId === order.order_id ||
                                refundableItems.every((item) => item.remainingQuantity <= 0)
                              }
                              className="mt-4 w-full rounded-2xl border border-sky-300 bg-white px-5 py-4 text-sm font-bold text-sky-700 disabled:opacity-60"
                            >
                              {partialRefundingOrderId === order.order_id
                                ? "부분 환불 처리 중..."
                                : "선택 상품 부분 환불"}
                            </button>
                          </div>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => handleSave(order.order_id)}
                          disabled={savingOrderId === order.order_id || isCanceledOrder}
                          className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white disabled:opacity-60"
                        >
                          {savingOrderId === order.order_id ? "저장 중..." : "주문 상태 저장"}
                        </button>

                        {order.status === "DONE" && remainingRefundableAmount > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleCancel(order)}
                            disabled={cancelingOrderId === order.order_id}
                            className="w-full rounded-2xl border border-red-300 bg-white px-5 py-4 text-sm font-bold text-red-600 disabled:opacity-60"
                          >
                            {cancelingOrderId === order.order_id
                              ? "전체 환불 처리 중..."
                              : hasPartialRefund(order)
                                ? "남은 금액 전체 환불"
                                : "결제 취소 / 전체 환불"}
                          </button>
                        ) : null}
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
