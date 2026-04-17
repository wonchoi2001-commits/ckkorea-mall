import { buildAdminProductPayload, softDeleteProduct } from "@/lib/admin-products";
import { jsonError, jsonOk, requireAdminApiUser } from "@/lib/admin-api";
import { getProductRecordById } from "@/lib/products";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Props) {
  const { response } = await requireAdminApiUser();

  if (response) {
    return response;
  }

  try {
    const { id } = await params;
    const product = await getProductRecordById(id, {
      includeInactive: true,
      includeDeleted: true,
    });

    if (!product) {
      return jsonError("상품을 찾을 수 없습니다.", 404);
    }

    return jsonOk({ product });
  } catch (error) {
    console.error("ADMIN PRODUCT GET ERROR:", error);
    return jsonError("상품 조회 중 오류가 발생했습니다.", 500);
  }
}

export async function PATCH(req: Request, { params }: Props) {
  const { response } = await requireAdminApiUser();

  if (response) {
    return response;
  }

  try {
    const { id } = await params;
    const existingProduct = await getProductRecordById(id, {
      includeInactive: true,
      includeDeleted: true,
    });

    if (!existingProduct) {
      return jsonError("수정할 상품을 찾을 수 없습니다.", 404);
    }

    const body = (await req.json()) as Record<string, unknown>;
    const { payload, error } = await buildAdminProductPayload(body, {
      existingProduct,
    });

    if (error || !payload) {
      return jsonError(error || "수정 값이 올바르지 않습니다.", 400);
    }

    const supabase = createAdminSupabaseClient();
    const { data, error: updateError } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      console.error("ADMIN PRODUCT PATCH ERROR:", updateError);
      return jsonError(updateError.message, 500);
    }

    return jsonOk({ product: data });
  } catch (error) {
    console.error("ADMIN PRODUCT PATCH ERROR:", error);
    return jsonError("상품 수정 중 오류가 발생했습니다.", 500);
  }
}

export async function DELETE(_: Request, { params }: Props) {
  const { user, response } = await requireAdminApiUser();

  if (response) {
    return response;
  }

  try {
    const { id } = await params;
    const product = await getProductRecordById(id, {
      includeInactive: true,
      includeDeleted: true,
    });

    if (!product) {
      return jsonError("삭제할 상품을 찾을 수 없습니다.", 404);
    }

    const archivedProduct = await softDeleteProduct(product, user.email ?? null);

    return jsonOk({ product: archivedProduct });
  } catch (error) {
    console.error("ADMIN PRODUCT DELETE ERROR:", error);
    return jsonError("상품 삭제 중 오류가 발생했습니다.", 500);
  }
}
