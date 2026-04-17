import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { buildProductImagePath, getProductImageBucketName, validateProductImageFile } from "@/lib/product-images";
import { enforceAdminMutationSecurity, jsonError, jsonOk, requireAdminApiUser } from "@/lib/admin-api";
import { logServerError } from "@/lib/security";
import { uploadMetadataSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { response } = await requireAdminApiUser();

  if (response) {
    return response;
  }

  const securityResponse = enforceAdminMutationSecurity(req, "upload-product-image");

  if (securityResponse) {
    return securityResponse;
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const metadataResult = uploadMetadataSchema.safeParse({
      slug: typeof formData.get("slug") === "string" ? String(formData.get("slug")) : "",
    });

    if (!(file instanceof File)) {
      return jsonError("업로드할 이미지 파일이 필요합니다.", 400);
    }

    if (!metadataResult.success) {
      return jsonError("업로드 요청값이 올바르지 않습니다.", 400);
    }

    const validationError = validateProductImageFile(file);

    if (validationError) {
      return jsonError(validationError, 400);
    }

    const bucket = getProductImageBucketName();
    const filePath = buildProductImagePath({
      slug: metadataResult.data.slug,
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
      logServerError("product-image-upload", uploadError, { bucket, filePath });
      return jsonError("상품 이미지 업로드에 실패했습니다.", 500);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return jsonOk({
      bucket,
      path: filePath,
      url: data.publicUrl,
    });
  } catch (error) {
    logServerError("product-image-upload", error);
    return jsonError("상품 이미지 업로드 중 오류가 발생했습니다.", 500);
  }
}
