"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import ProductImage from "@/components/ProductImage";
import { categories, shippingOptions } from "@/lib/data";
import type { ProductRecord } from "@/lib/types";
import { makeSlug } from "@/lib/utils";

type ProductFormState = {
  name: string;
  slug: string;
  categoryMain: string;
  categorySub: string;
  price: string;
  stock: string;
  spec: string;
  shipping: string;
  description: string;
  shortDescription: string;
  brand: string;
  manufacturer: string;
  origin: string;
  unit: string;
  imageUrl: string;
  featured: boolean;
  quoteRequired: boolean;
  isActive: boolean;
  bulkyItem: boolean;
  searchKeywords: string;
  sortOrder: string;
};

type FeedbackState = {
  tone: "success" | "error";
  text: string;
};

function createInitialState(product?: ProductRecord | null): ProductFormState {
  return {
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    categoryMain: product?.category_main ?? product?.category?.split(">")[0]?.trim() ?? categories[0] ?? "",
    categorySub:
      product?.category_sub ??
      product?.category?.split(">")[1]?.trim() ??
      "",
    price: typeof product?.price === "number" ? String(product.price) : "",
    stock: typeof product?.stock === "number" ? String(product.stock) : "",
    spec: product?.spec ?? "",
    shipping: product?.shipping ?? shippingOptions[0] ?? "택배",
    description: product?.description ?? "",
    shortDescription: product?.short_description ?? "",
    brand: product?.brand ?? "CK KOREA",
    manufacturer: product?.manufacturer ?? "",
    origin: product?.origin ?? "",
    unit: product?.unit ?? "1개",
    imageUrl: product?.image_url ?? "",
    featured: product?.featured === true,
    quoteRequired: product?.quote_required === true || product?.price === null,
    isActive: product?.is_active !== false,
    bulkyItem: product?.bulky_item === true,
    searchKeywords:
      typeof product?.search_keywords === "string"
        ? product.search_keywords
        : Array.isArray(product?.search_keywords)
          ? product.search_keywords.join(", ")
          : "",
    sortOrder: typeof product?.sort_order === "number" ? String(product.sort_order) : "",
  };
}

function buildPayload(form: ProductFormState) {
  return {
    name: form.name,
    slug: form.slug,
    category_main: form.categoryMain,
    category_sub: form.categorySub || null,
    price: form.price.trim() === "" ? null : Number(form.price),
    stock: form.stock.trim() === "" ? null : Number(form.stock),
    spec: form.spec,
    shipping: form.shipping,
    description: form.description,
    short_description: form.shortDescription,
    brand: form.brand,
    manufacturer: form.manufacturer,
    origin: form.origin,
    unit: form.unit,
    image_url: form.imageUrl,
    featured: form.featured,
    quote_required: form.quoteRequired,
    is_active: form.isActive,
    bulky_item: form.bulkyItem,
    search_keywords: form.searchKeywords,
    sort_order: form.sortOrder.trim() === "" ? null : Number(form.sortOrder),
    quote_only: form.quoteRequired && form.price.trim() === "",
  };
}

export default function AdminProductForm({
  product,
}: {
  product?: ProductRecord | null;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormState>(createInitialState(product));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const isEditing = Boolean(product?.id);
  const previewImage = form.imageUrl.trim() || "/images/product-placeholder.svg";

  const helperText = useMemo(() => {
    if (form.price.trim() === "") {
      return "가격이 비어 있으면 견적문의 전용 상품으로 노출됩니다.";
    }

    if (form.quoteRequired) {
      return "즉시결제와 함께 견적문의 유도 문구를 함께 노출합니다.";
    }

    return "즉시결제 상품으로 노출됩니다.";
  }, [form.price, form.quoteRequired]);

  function updateField<K extends keyof ProductFormState>(
    field: K,
    value: ProductFormState[K]
  ) {
    setForm((prev) => {
      if (field === "name") {
        const nextName = String(value);
        const shouldSyncSlug = prev.slug.trim() === "" || prev.slug === makeSlug(prev.name);

        return {
          ...prev,
          name: nextName,
          slug: shouldSyncSlug ? makeSlug(nextName) : prev.slug,
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("slug", form.slug || form.name || "product-image");

      const response = await fetch("/api/upload/product-image", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "이미지 업로드에 실패했습니다.");
      }

      setForm((prev) => ({
        ...prev,
        imageUrl: data.url,
      }));
      setFeedback({
        tone: "success",
        text: "이미지 업로드가 완료되었습니다.",
      });
    } catch (error) {
      console.error("ADMIN PRODUCT IMAGE UPLOAD ERROR:", error);
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "이미지 업로드 중 오류가 발생했습니다.",
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const response = await fetch(
        isEditing ? `/api/admin/products/${product?.id}` : "/api/admin/products",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildPayload(form)),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "상품 저장에 실패했습니다.");
      }

      setFeedback({
        tone: "success",
        text: isEditing ? "상품 정보가 수정되었습니다." : "상품이 등록되었습니다.",
      });

      if (isEditing) {
        router.refresh();
        return;
      }

      router.replace(`/admin/products/${data.product.id}/edit`);
      router.refresh();
    } catch (error) {
      console.error("ADMIN PRODUCT FORM SUBMIT ERROR:", error);
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "상품 저장 중 오류가 발생했습니다.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-500">ADMIN PRODUCTS</div>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
              {isEditing ? "상품 수정" : "상품 등록"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              관리자용 운영 폼입니다. 저장 즉시 홈 추천, 목록, 상세, 주문 페이지에 같은
              DB 데이터가 반영됩니다.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
          >
            목록으로
          </Link>
        </div>

        {feedback ? (
          <div
            className={`mb-6 rounded-2xl px-4 py-3 text-sm shadow-sm ${
              feedback.tone === "success"
                ? "border border-green-200 bg-green-50 text-green-700"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {feedback.text}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  상품명
                </label>
                <input
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="상품명"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  슬러그
                </label>
                <input
                  value={form.slug}
                  onChange={(event) => updateField("slug", makeSlug(event.target.value))}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="자동 생성 가능"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  브랜드
                </label>
                <input
                  value={form.brand}
                  onChange={(event) => updateField("brand", event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="브랜드"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  대분류
                </label>
                <input
                  list="product-main-categories"
                  value={form.categoryMain}
                  onChange={(event) => updateField("categoryMain", event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="대분류"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  세부 카테고리
                </label>
                <input
                  value={form.categorySub}
                  onChange={(event) => updateField("categorySub", event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="세부 카테고리"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  가격
                </label>
                <input
                  value={form.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  type="number"
                  min="0"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="가격 미입력 시 견적형"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  재고 수량
                </label>
                <input
                  value={form.stock}
                  onChange={(event) => updateField("stock", event.target.value)}
                  type="number"
                  min="0"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="재고"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  규격
                </label>
                <input
                  value={form.spec}
                  onChange={(event) => updateField("spec", event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="규격"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  판매 단위
                </label>
                <input
                  value={form.unit}
                  onChange={(event) => updateField("unit", event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="판매 단위"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  배송 방식
                </label>
                <input
                  list="product-shipping-options"
                  value={form.shipping}
                  onChange={(event) => updateField("shipping", event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="배송 방식"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  제조사
                </label>
                <input
                  value={form.manufacturer}
                  onChange={(event) => updateField("manufacturer", event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="제조사"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  원산지
                </label>
                <input
                  value={form.origin}
                  onChange={(event) => updateField("origin", event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="원산지"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  카드용 짧은 설명
                </label>
                <textarea
                  value={form.shortDescription}
                  onChange={(event) => updateField("shortDescription", event.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="상품 카드와 추천 영역에 보일 짧은 설명"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  상세 설명
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  rows={7}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="상세 설명"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  이미지 URL
                </label>
                <input
                  value={form.imageUrl}
                  onChange={(event) => updateField("imageUrl", event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="직접 입력 URL 또는 업로드 결과 URL"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  이미지 파일 업로드
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleImageUpload(file);
                    }
                  }}
                  className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Supabase Storage에 업로드 후 공개 URL을 자동으로 입력합니다.
                  {uploading ? " 업로드 중..." : ""}
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  검색 키워드
                </label>
                <input
                  value={form.searchKeywords}
                  onChange={(event) => updateField("searchKeywords", event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="예: 실리콘, 코킹, 창호"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  정렬 순서
                </label>
                <input
                  value={form.sortOrder}
                  onChange={(event) => updateField("sortOrder", event.target.value)}
                  type="number"
                  min="0"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="낮을수록 우선"
                />
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
              {helperText}
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => updateField("isActive", event.target.checked)}
                />
                상품 활성화
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => updateField("featured", event.target.checked)}
                />
                추천상품 노출
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.quoteRequired}
                  onChange={(event) => updateField("quoteRequired", event.target.checked)}
                />
                견적문의 유도
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.bulkyItem}
                  onChange={(event) => updateField("bulkyItem", event.target.checked)}
                />
                중량물 / 장척물
              </label>
            </div>

            <button
              type="submit"
              disabled={saving || uploading}
              className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-bold text-white disabled:opacity-60"
            >
              {saving ? "저장 중..." : isEditing ? "상품 수정 저장" : "상품 등록"}
            </button>
          </form>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-[4/3] w-full bg-slate-100">
                <ProductImage
                  src={previewImage}
                  alt={form.name || "상품 이미지 미리보기"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 420px"
                />
              </div>
              <div className="p-5">
                <div className="text-xs font-semibold text-slate-500">미리보기</div>
                <div className="mt-2 text-xl font-black text-slate-900">
                  {form.name || "상품명"}
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  {[form.brand, form.manufacturer, form.origin].filter(Boolean).join(" · ") ||
                    "브랜드 / 제조사 / 원산지"}
                </div>
                <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                  {form.shortDescription || form.description || "설명 미입력"}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-500">운영 메모</div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>가격을 비워두면 카드와 상세에서 견적문의형으로 자동 처리됩니다.</li>
                <li>추천상품 체크 시 홈 추천영역에서 우선 노출됩니다.</li>
                <li>Storage 업로드와 직접 URL 입력은 병행 가능합니다.</li>
                <li>삭제는 soft delete로 처리되어 기존 주문 연계를 깨지 않습니다.</li>
              </ul>
            </div>
          </aside>
        </div>

        <datalist id="product-main-categories">
          {categories.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>

        <datalist id="product-shipping-options">
          {shippingOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </section>
    </main>
  );
}
