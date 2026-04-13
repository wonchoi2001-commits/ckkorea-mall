import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("QUOTE REQUEST:", body);

    return NextResponse.json({ ok: true, message: "문의가 접수되었습니다." });
  } catch {
    return NextResponse.json({ ok: false, message: "요청 처리 실패" }, { status: 500 });
  }
}
