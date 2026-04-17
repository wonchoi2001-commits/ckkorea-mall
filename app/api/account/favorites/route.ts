import { NextRequest, NextResponse } from "next/server";
import {
  addFavoriteProduct,
  getFavoriteProducts,
  isMissingMemberTablesError,
  mergeFavoriteProducts,
  removeFavoriteProduct,
} from "@/lib/account";
import { requireAccountApiUser } from "@/lib/account-api";

export async function GET() {
  const { user, response } = await requireAccountApiUser();

  if (!user) {
    return response;
  }

  try {
    const products = await getFavoriteProducts(user.id);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("ACCOUNT FAVORITES GET ERROR:", error);
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

  try {
    const body = await req.json();

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
    console.error("ACCOUNT FAVORITES POST ERROR:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : isMissingMemberTablesError(error)
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

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ message: "상품 ID가 필요합니다." }, { status: 400 });
    }

    await removeFavoriteProduct(user.id, productId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ACCOUNT FAVORITES DELETE ERROR:", error);
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
