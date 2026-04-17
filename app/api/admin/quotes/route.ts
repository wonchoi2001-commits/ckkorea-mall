import { NextResponse } from "next/server";
import { enforceAdminMutationSecurity, jsonError, jsonOk, requireAdminApiUser } from "@/lib/admin-api";
import {
  getQuoteRequestRecord,
  getQuoteRequestRecords,
  isMissingQuoteRequestsTableError,
} from "@/lib/quotes";
import { logServerError } from "@/lib/security";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { adminQuoteUpdateSchema } from "@/lib/validation";

export async function GET() {
  const { response } = await requireAdminApiUser();

  if (response) {
    return response;
  }

  try {
    const quotes = await getQuoteRequestRecords();

    return jsonOk({ quotes }, 200);
  } catch (error) {
    logServerError("admin-quotes-get", error);

    if (isMissingQuoteRequestsTableError(error)) {
      return jsonError(
        "quote_requests 테이블이 아직 없습니다. Supabase SQL Editor에서 quote_requests 스키마를 먼저 생성해주세요.",
        500
      );
    }

    return jsonError("견적문의 목록 조회 중 오류가 발생했습니다.", 500);
  }
}

export async function PATCH(req: Request) {
  const { response } = await requireAdminApiUser();

  if (response) {
    return response;
  }

  const securityResponse = enforceAdminMutationSecurity(req, "quotes-patch");

  if (securityResponse) {
    return securityResponse;
  }

  try {
    const parsed = adminQuoteUpdateSchema.safeParse(await req.json());

    if (!parsed.success) {
      return jsonError("견적문의 상태 입력값을 확인해주세요.", 400);
    }

    const { id, status, admin_memo: adminMemo = "" } = parsed.data;

    if (!["NEW", "IN_PROGRESS", "COMPLETED"].includes(status)) {
      return jsonError("유효한 처리 상태를 선택해주세요.", 400);
    }

    const existingQuote = await getQuoteRequestRecord(id);

    if (!existingQuote) {
      return jsonError("견적문의를 찾을 수 없습니다.", 404);
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
      logServerError("admin-quotes-patch", error, { id });
      return jsonError("견적문의 상태 변경 중 오류가 발생했습니다.", 500);
    }

    return jsonOk({ quote: data }, 200);
  } catch (error) {
    logServerError("admin-quotes-patch", error);

    if (isMissingQuoteRequestsTableError(error)) {
      return jsonError(
        "quote_requests 테이블이 아직 없습니다. Supabase SQL Editor에서 quote_requests 스키마를 먼저 생성해주세요.",
        500
      );
    }

    return jsonError("견적문의 상태 변경 중 오류가 발생했습니다.", 500);
  }
}
