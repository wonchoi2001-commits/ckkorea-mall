import { NextResponse } from "next/server";
import { getCatalogProducts } from "@/lib/products";
import { logServerError } from "@/lib/security";

export async function GET() {
  try {
    const products = await getCatalogProducts();

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    logServerError("public-products-api", error);

    return NextResponse.json(
      { message: "상품 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
