import { NextRequest, NextResponse } from "next/server";
import {
  getRecentlyViewedProducts,
  isMissingMemberTablesError,
  mergeRecentlyViewedProducts,
  recordRecentlyViewedProduct,
} from "@/lib/account";
import { enforceAccountMutationSecurity, requireAccountApiUser } from "@/lib/account-api";
import { logServerError } from "@/lib/security";
import { recentViewedMutationSchema } from "@/lib/validation";

export async function GET() {
  const { user, response } = await requireAccountApiUser();

  if (!user) {
    return response;
  }

  try {
    const products = await getRecentlyViewedProducts(user.id);
    return NextResponse.json({ products });
  } catch (error) {
    logServerError("account-recent-get", error);
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

  const securityResponse = enforceAccountMutationSecurity(req, "recently-viewed-post");

  if (securityResponse) {
    return securityResponse;
  }

  try {
    const parsed = recentViewedMutationSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json({ message: "최근 본 상품 요청값이 올바르지 않습니다." }, { status: 400 });
    }

    const body = parsed.data;

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
    logServerError("account-recent-post", error);
    return NextResponse.json(
      {
        message:
          isMissingMemberTablesError(error)
            ? "member_schema.sql 적용이 필요합니다."
            : "최근 본 상품 저장 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
