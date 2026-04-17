import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { buildProductImagePath, getProductImageBucketName, validateProductImageFile } from "@/lib/product-images";
import { jsonError, jsonOk, requireAdminApiUser } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { response } = await requireAdminApiUser();

  if (response) {
    return response;
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const slug = typeof formData.get("slug") === "string" ? String(formData.get("slug")) : "";

    if (!(file instanceof File)) {
      return jsonError("업로드할 이미지 파일이 필요합니다.", 400);
    }

    const validationError = validateProductImageFile(file);

    if (validationError) {
      return jsonError(validationError, 400);
    }

    const bucket = getProductImageBucketName();
    const filePath = buildProductImagePath({
      slug,
      originalFilename: file.name,
    });

    const supabase = createAdminSupabaseClient();
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("PRODUCT IMAGE UPLOAD ERROR:", uploadError);
      return jsonError(uploadError.message, 500);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return jsonOk({
      bucket,
      path: filePath,
      url: data.publicUrl,
    });
  } catch (error) {
    console.error("PRODUCT IMAGE UPLOAD ERROR:", error);
    return jsonError("상품 이미지 업로드 중 오류가 발생했습니다.", 500);
  }
}
