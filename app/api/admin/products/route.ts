import { getProductRecords } from "@/lib/products";
import { buildAdminProductPayload } from "@/lib/admin-products";
import { jsonError, jsonOk, requireAdminApiUser } from "@/lib/admin-api";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const { response } = await requireAdminApiUser();

  if (response) {
    return response;
  }

  try {
    const products = await getProductRecords({
      includeInactive: true,
      includeDeleted: true,
    });

    return jsonOk({ products });
  } catch (error) {
    console.error("ADMIN PRODUCTS GET ERROR:", error);
    return jsonError("상품 목록 조회 중 오류가 발생했습니다.", 500);
  }
}

export async function POST(req: Request) {
  const { response } = await requireAdminApiUser();

  if (response) {
    return response;
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { payload, error } = await buildAdminProductPayload(body, {
      isCreate: true,
    });

    if (error || !payload) {
      return jsonError(error || "상품 등록 값이 올바르지 않습니다.", 400);
    }

    const supabase = createAdminSupabaseClient();
    const { data, error: insertError } = await supabase
      .from("products")
      .insert([payload])
      .select("*")
      .single();

    if (insertError) {
      console.error("ADMIN PRODUCTS POST ERROR:", insertError);
      return jsonError(insertError.message, 500);
    }

    return jsonOk({ product: data }, 201);
  } catch (error) {
    console.error("ADMIN PRODUCTS POST ERROR:", error);
    return jsonError("상품 등록 중 오류가 발생했습니다.", 500);
  }
}
