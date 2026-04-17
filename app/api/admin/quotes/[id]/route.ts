import { jsonError, jsonOk, requireAdminApiUser } from "@/lib/admin-api";
import {
  getQuoteRequestRecord,
  isMissingQuoteRequestsTableError,
} from "@/lib/quotes";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Props) {
  const { response } = await requireAdminApiUser();

  if (response) {
    return response;
  }

  try {
    const { id } = await params;
    const quote = await getQuoteRequestRecord(id);

    if (!quote) {
      return jsonError("견적문의를 찾을 수 없습니다.", 404);
    }

    return jsonOk({ quote });
  } catch (error) {
    console.error("ADMIN QUOTE DETAIL GET ERROR:", error);

    if (isMissingQuoteRequestsTableError(error)) {
      return jsonError(
        "quote_requests 테이블이 아직 없습니다. Supabase SQL Editor에서 quote_requests 스키마를 먼저 실행해주세요.",
        500
      );
    }

    return jsonError("견적문의 상세 조회 중 오류가 발생했습니다.", 500);
  }
}

export async function PATCH(req: Request, { params }: Props) {
  const { response } = await requireAdminApiUser();

  if (response) {
    return response;
  }

  try {
    const { id } = await params;
    const existingQuote = await getQuoteRequestRecord(id);

    if (!existingQuote) {
      return jsonError("견적문의를 찾을 수 없습니다.", 404);
    }

    const body = await req.json();
    const status = typeof body?.status === "string" ? body.status : "";
    const adminMemo =
      typeof body?.admin_memo === "string" ? body.admin_memo.trim() : "";

    if (!["NEW", "IN_PROGRESS", "COMPLETED"].includes(status)) {
      return jsonError("유효한 처리 상태를 선택해주세요.", 400);
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("quote_requests")
      .update({
        status,
        admin_memo: adminMemo || null,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("ADMIN QUOTE DETAIL PATCH ERROR:", error);
      return jsonError(error.message, 500);
    }

    return jsonOk({ quote: data });
  } catch (error) {
    console.error("ADMIN QUOTE DETAIL PATCH ERROR:", error);
    return jsonError("견적문의 저장 중 오류가 발생했습니다.", 500);
  }
}
