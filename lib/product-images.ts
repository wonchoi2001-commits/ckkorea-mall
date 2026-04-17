import { makeSlug } from "@/lib/utils";

export const DEFAULT_PRODUCT_IMAGE_BUCKET = "product-images";
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

export function getProductImageBucketName() {
  return (
    process.env.SUPABASE_PRODUCT_IMAGE_BUCKET ||
    process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGE_BUCKET ||
    DEFAULT_PRODUCT_IMAGE_BUCKET
  );
}

export function validateProductImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "JPG, PNG, WEBP, GIF, SVG 형식의 이미지만 업로드할 수 있습니다.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "이미지 파일은 8MB 이하만 업로드할 수 있습니다.";
  }

  return null;
}

export function buildProductImagePath(params: {
  slug?: string | null;
  originalFilename?: string | null;
}) {
  const safeSeed =
    makeSlug(params.slug || "") ||
    makeSlug(params.originalFilename?.replace(/\.[^.]+$/, "") || "") ||
    "product";
  const extension =
    params.originalFilename?.split(".").pop()?.trim().toLowerCase() || "webp";
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  return `${year}/${month}/${safeSeed}-${Date.now()}.${extension}`;
}
