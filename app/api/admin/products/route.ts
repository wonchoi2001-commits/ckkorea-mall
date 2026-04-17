import { NextResponse } from "next/server";
import { buildAdminProductPayload } from "@/lib/admin-products";
import { enforceAdminMutationSecurity, jsonError, jsonOk, requireAdminApiUser } from "@/lib/admin-api";
import { logServerError } from "@/lib/security";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { response } = await requireAdminApiUser();

  if (response) {
    return response;
  }

  try {
    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price, spec, shipping, description, image_url, is_active, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      logServerError("admin-products-get", error);
      return jsonError("상품 목록 조회 중 오류가 발생했습니다.", 500);
    }

    return jsonOk({ products: data ?? [] });
  } catch (error) {
    logServerError("admin-products-get", error);
    return jsonError("상품 목록 조회 중 오류가 발생했습니다.", 500);
  }
}

export async function POST(req: Request) {
  const { response } = await requireAdminApiUser();

  if (response) {
    return response;
  }

  const securityResponse = enforceAdminMutationSecurity(req, "products-create");

  if (securityResponse) {
    return securityResponse;
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { payload, error: payloadError } = await buildAdminProductPayload(body, {
      isCreate: true,
    });

    if (payloadError || !payload) {
      return jsonError(payloadError || "상품 등록 값이 올바르지 않습니다.", 400);
    }

    const supabase = createAdminSupabaseClient();

    const { data, error: insertError } = await supabase
      .from("products")
      .insert([payload])
      .select()
      .single();

    if (insertError) {
      logServerError("admin-products-create", insertError);
      return jsonError("상품 등록 중 오류가 발생했습니다.", 500);
    }

    return jsonOk({ product: data }, 201);
  } catch (error) {
    logServerError("admin-products-create", error);
    return jsonError("상품 등록 중 오류가 발생했습니다.", 500);
  }
}
