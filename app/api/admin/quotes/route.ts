import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import {
  getQuoteRequestRecord,
  getQuoteRequestRecords,
  isMissingQuoteRequestsTableError,
} from "@/lib/quotes";
import { createAdminSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "관리자 로그인이 필요합니다." },
      { status: 401 }
    );
  }

  if (!isAdminUser(user)) {
    return NextResponse.json(
      { message: "관리자 권한이 없습니다." },
      { status: 403 }
    );
  }

  return null;
}

export async function GET() {
  const authResponse = await requireAdmin();

  if (authResponse) {
    return authResponse;
  }

  try {
    const quotes = await getQuoteRequestRecords();

    return NextResponse.json({ quotes }, { status: 200 });
  } catch (error) {
    console.error("ADMIN QUOTES GET ERROR:", error);

    if (isMissingQuoteRequestsTableError(error)) {
      return NextResponse.json(
        {
          message:
            "quote_requests 테이블이 아직 없습니다. Supabase SQL Editor에서 quote_requests 스키마를 먼저 생성해주세요.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "견적문의 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const authResponse = await requireAdmin();

  if (authResponse) {
    return authResponse;
  }

  try {
    const body = await req.json();
    const id = body?.id;
    const status = typeof body?.status === "string" ? body.status : "";
    const adminMemo =
      typeof body?.admin_memo === "string" ? body.admin_memo.trim() : "";

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { message: "견적문의 ID가 필요합니다." },
        { status: 400 }
      );
    }

    if (!["NEW", "IN_PROGRESS", "COMPLETED"].includes(status)) {
      return NextResponse.json(
        { message: "유효한 처리 상태를 선택해주세요." },
        { status: 400 }
      );
    }

    const existingQuote = await getQuoteRequestRecord(id);

    if (!existingQuote) {
      return NextResponse.json(
        { message: "견적문의를 찾을 수 없습니다." },
        { status: 404 }
      );
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
      console.error("ADMIN QUOTES PATCH ERROR:", error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ quote: data }, { status: 200 });
  } catch (error) {
    console.error("ADMIN QUOTES PATCH ERROR:", error);

    if (isMissingQuoteRequestsTableError(error)) {
      return NextResponse.json(
        {
          message:
            "quote_requests 테이블이 아직 없습니다. Supabase SQL Editor에서 quote_requests 스키마를 먼저 생성해주세요.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "견적문의 상태 변경 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
