import type { QuoteRequestStatus } from "@/lib/types";

export const QUOTE_STATUS_OPTIONS: Array<{
  value: QuoteRequestStatus;
  label: string;
}> = [
  { value: "NEW", label: "신규" },
  { value: "IN_PROGRESS", label: "확인중" },
  { value: "COMPLETED", label: "완료" },
];
