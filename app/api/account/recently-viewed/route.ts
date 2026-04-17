import { NextRequest, NextResponse } from "next/server";
import {
  getRecentlyViewedProducts,
  isMissingMemberTablesError,
  mergeRecentlyViewedProducts,
  recordRecentlyViewedProduct,
} from "@/lib/account";
import { requireAccountApiUser } from "@/lib/account-api";

export async function GET() {
  const { user, response } = await requireAccountApiUser();

  if (!user) {
    return response;
  }

  try {
    const products = await getRecentlyViewedProducts(user.id);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("ACCOUNT RECENT GET ERROR:", error);
    return NextResponse.json(
      {
        message: isMissingMemberTablesError(error)
          ? "member_schema.sql 적용이 필요합니다."
          : "최근 본 상품을 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireAccountApiUser();

  if (!user) {
    return response;
  }

  try {
    const body = await req.json();

    if (Array.isArray(body.productIds)) {
      await mergeRecentlyViewedProducts(
        user.id,
        body.productIds
          .map((item: unknown) => String(item))
          .filter(Boolean)
      );
      return NextResponse.json({ ok: true });
    }

    if (!body.productId) {
      return NextResponse.json({ message: "상품 ID가 필요합니다." }, { status: 400 });
    }

    await recordRecentlyViewedProduct(user.id, String(body.productId));
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("ACCOUNT RECENT POST ERROR:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : isMissingMemberTablesError(error)
              ? "member_schema.sql 적용이 필요합니다."
              : "최근 본 상품 저장 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
