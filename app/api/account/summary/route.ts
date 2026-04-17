import { NextResponse } from "next/server";
import { buildAccountSummary } from "@/lib/account";
import { requireAccountApiUser } from "@/lib/account-api";

export async function GET() {
  const { user, response } = await requireAccountApiUser();

  if (!user) {
    return response;
  }

  try {
    const summary = await buildAccountSummary(user);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("ACCOUNT SUMMARY ERROR:", error);
    return NextResponse.json(
      { message: "마이페이지 정보를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
