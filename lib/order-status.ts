import type { FulfillmentStatus, TaxInvoiceStatus } from "@/lib/types";

export const FULFILLMENT_STATUS_OPTIONS: Array<{
  value: FulfillmentStatus;
  label: string;
}> = [
  { value: "PENDING_PAYMENT", label: "결제 대기" },
  { value: "PREPARING", label: "상품 준비중" },
  { value: "READY_TO_SHIP", label: "출고 준비 완료" },
  { value: "SHIPPED", label: "배송중" },
  { value: "DELIVERED", label: "배송 완료" },
  { value: "PAYMENT_FAILED", label: "결제 실패" },
  { value: "CANCELED", label: "주문 취소" },
];

export const TAX_INVOICE_STATUS_OPTIONS: Array<{
  value: TaxInvoiceStatus;
  label: string;
}> = [
  { value: "NOT_REQUESTED", label: "미요청" },
  { value: "REQUESTED", label: "발행 요청" },
  { value: "ISSUED", label: "발행 완료" },
];
