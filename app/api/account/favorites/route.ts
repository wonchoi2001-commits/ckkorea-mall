import { NextRequest, NextResponse } from "next/server";
import {
  addFavoriteProduct,
  getFavoriteProducts,
  isMissingMemberTablesError,
  mergeFavoriteProducts,
  removeFavoriteProduct,
} from "@/lib/account";
import { enforceAccountMutationSecurity, requireAccountApiUser } from "@/lib/account-api";
import { logServerError } from "@/lib/security";
import { favoriteMutationSchema } from "@/lib/validation";

export async function GET() {
  const { user, response } = await requireAccountApiUser();

  if (!user) {
    return response;
  }

  try {
    const products = await getFavoriteProducts(user.id);
    return NextResponse.json({ products });
  } catch (error) {
    logServerError("account-favorites-get", error);
    return NextResponse.json(
      {
        message: isMissingMemberTablesError(error)
          ? "member_schema.sql 적용이 필요합니다."
          : "관심상품을 불러오는 중 오류가 발생했습니다.",
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

  const securityResponse = enforceAccountMutationSecurity(req, "favorites-post");

  if (securityResponse) {
    return securityResponse;
  }

  try {
    const parsed = favoriteMutationSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json({ message: "관심상품 요청값이 올바르지 않습니다." }, { status: 400 });
    }

    const body = parsed.data;

    if (Array.isArray(body.productIds)) {
      await mergeFavoriteProducts(
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

    await addFavoriteProduct(user.id, String(body.productId));
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    logServerError("account-favorites-post", error);
    return NextResponse.json(
      {
        message:
          isMissingMemberTablesError(error)
            ? "member_schema.sql 적용이 필요합니다."
            : "관심상품 저장 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { user, response } = await requireAccountApiUser();

  if (!user) {
    return response;
  }

  const securityResponse = enforceAccountMutationSecurity(req, "favorites-delete");

  if (securityResponse) {
    return securityResponse;
  }

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ message: "상품 ID가 필요합니다." }, { status: 400 });
    }

    await removeFavoriteProduct(user.id, productId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    logServerError("account-favorites-delete", error);
    return NextResponse.json(
      {
        message: isMissingMemberTablesError(error)
          ? "member_schema.sql 적용이 필요합니다."
          : "관심상품 삭제 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
