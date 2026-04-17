"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AdminPanelHeader from "@/components/admin/AdminPanelHeader";
import ProductImage from "@/components/ProductImage";
import type { ProductRecord } from "@/lib/types";

type ProductViewFilter = "all" | "active" | "inactive" | "featured" | "quote";
type FeedbackState = {
  tone: "success" | "error";
  text: string;
};

function formatCreatedAt(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPrice(value?: number | null) {
  if (typeof value !== "number") {
    return "견적문의";
  }

  return `${value.toLocaleString()}원`;
}

export default function AdminProductsManager({
  initialProducts,
  adminEmail,
}: {
  initialProducts: ProductRecord[];
  adminEmail: string;
}) {
  const [products, setProducts] = useState<ProductRecord[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("전체");
  const [viewFilter, setViewFilter] = useState<ProductViewFilter>("all");
  const [workingId, setWorkingId] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const summary = useMemo(
    () => ({
      total: products.length,
      active: products.filter((product) => product.is_active !== false).length,
      featured: products.filter((product) => product.featured === true).length,
      quoteOnly: products.filter(
        (product) => product.quote_required === true || product.price === null
      ).length,
    }),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        categoryFilter === "전체" ||
        (product.category_main || product.category || "").trim() === categoryFilter;
      const matchesFilter =
        viewFilter === "all"
          ? true
          : viewFilter === "active"
            ? product.is_active !== false
            : viewFilter === "inactive"
              ? product.is_active === false
              : viewFilter === "featured"
                ? product.featured === true
                : product.quote_required === true || product.price === null;

      if (!matchesFilter) {
        return false;
      }

      if (!matchesCategory) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const searchable = [
        product.name,
        product.slug,
        product.category_main,
        product.category_sub,
        product.category,
        product.brand,
        product.manufacturer,
        product.spec,
        product.shipping,
        product.short_description,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(keyword);
    });
  }, [categoryFilter, products, searchTerm, viewFilter]);

  const categoryOptions = useMemo(() => {
    return [
      "전체",
      ...Array.from(
        new Set(products.map((product) => (product.category_main || product.category || "").trim()))
      ).filter(Boolean),
    ];
  }, [products]);

  async function patchProduct(productId: string | number, payload: Record<string, unknown>) {
    const response = await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "상품 수정에 실패했습니다.");
    }

    return data.product as ProductRecord;
  }

  const handleQuickToggle = async (
    product: ProductRecord,
    payload: Record<string, unknown>,
    successText: string
  ) => {
    const productId = String(product.id);
    setWorkingId(productId);
    setFeedback(null);

    try {
      const updatedProduct = await patchProduct(productId, payload);

      setProducts((prev) =>
        prev.map((item) => (String(item.id) === productId ? updatedProduct : item))
      );
      setFeedback({
        tone: "success",
        text: successText,
      });
    } catch (error) {
      console.error("ADMIN PRODUCT QUICK TOGGLE ERROR:", error);
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "상품 상태 변경 중 오류가 발생했습니다.",
      });
    } finally {
      setWorkingId("");
    }
  };

  const handleDelete = async (product: ProductRecord) => {
    if (
      !window.confirm(
        `'${product.name}' 상품을 삭제하시겠습니까? 주문 연계를 보호하기 위해 soft delete로 처리됩니다.`
      )
    ) {
      return;
    }

    const productId = String(product.id);
    setWorkingId(productId);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "상품 삭제에 실패했습니다.");
      }

      setProducts((prev) => prev.filter((item) => String(item.id) !== productId));
      setFeedback({
        tone: "success",
        text: "상품이 삭제 처리되었습니다.",
      });
    } catch (error) {
      console.error("ADMIN PRODUCT DELETE ERROR:", error);
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "상품 삭제 중 오류가 발생했습니다.",
      });
    } finally {
      setWorkingId("");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-10">
        <AdminPanelHeader
          title="상품 운영 관리"
          description="상품 등록, 수정, 비활성화, 추천상품 지정, soft delete를 운영 기준으로 관리합니다."
          adminEmail={adminEmail}
          activeTab="products"
        />

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">전체 상품</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{summary.total}</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">판매중</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{summary.active}</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">추천상품</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{summary.featured}</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">견적형</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{summary.quoteOnly}</div>
          </div>
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

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid flex-1 gap-4 md:grid-cols-[1.1fr_0.6fr_0.7fr]">
              <div>
                <div className="mb-2 text-sm font-semibold text-slate-700">상품 검색</div>
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="상품명, 카테고리, 브랜드, 규격, 설명 검색"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>
              <div>
                <div className="mb-2 text-sm font-semibold text-slate-700">카테고리</div>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-2 text-sm font-semibold text-slate-700">보기 필터</div>
                <select
                  value={viewFilter}
                  onChange={(event) => setViewFilter(event.target.value as ProductViewFilter)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
                >
                  <option value="all">전체</option>
                  <option value="active">판매중</option>
                  <option value="inactive">비활성</option>
                  <option value="featured">추천상품</option>
                  <option value="quote">견적형</option>
                </select>
              </div>
            </div>

            <Link
              href="/admin/products/new"
              className="rounded-2xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white"
            >
              새 상품 등록
            </Link>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            대량 상품 동기화는 `npm run sync:products:stage4` 기준으로 운영하고, 관리자
            화면에서는 노출 상태·추천 여부·상세 정보 보정 작업을 빠르게 마무리하는
            흐름을 권장합니다.
          </div>
        </div>

        <div className="space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              조건에 맞는 상품이 없습니다.
            </div>
          ) : (
            filteredProducts.map((product) => {
              const productId = String(product.id);
              const isActive = product.is_active !== false;
              const isFeatured = product.featured === true;
              const isQuoteOnly = product.quote_required === true || product.price === null;

              return (
                <article
                  key={productId}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-5 xl:flex-row">
                    <div className="relative h-32 w-full overflow-hidden rounded-2xl bg-slate-100 xl:w-40">
                      <ProductImage
                        src={product.image_url || "/images/product-placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">{product.name}</h2>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isActive ? "판매중" : "비활성"}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isFeatured
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isFeatured ? "추천" : "일반"}
                        </span>
                        {isQuoteOnly ? (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                            견적형
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-2 text-sm text-slate-500">
                        슬러그: {product.slug || "-"}
                      </div>

                      <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                        <div>카테고리: {product.category || "-"}</div>
                        <div>브랜드: {product.brand || "-"}</div>
                        <div>규격: {product.spec || "-"}</div>
                        <div>배송: {product.shipping || "-"}</div>
                        <div>가격: {formatPrice(product.price)}</div>
                        <div>
                          재고: {typeof product.stock === "number" ? `${product.stock}개` : "-"}
                        </div>
                        <div>제조사: {product.manufacturer || "-"}</div>
                        <div>등록일: {formatCreatedAt(product.created_at)}</div>
                      </div>

                      {(product.short_description || product.description) ? (
                        <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                          {product.short_description || product.description}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`/admin/products/${productId}/edit`}
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
                    >
                      수정
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickToggle(
                          product,
                          { featured: !isFeatured },
                          isFeatured
                            ? "추천상품 노출을 해제했습니다."
                            : "추천상품으로 지정했습니다."
                        )
                      }
                      disabled={workingId === productId}
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-60"
                    >
                      {isFeatured ? "추천 해제" : "추천 지정"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickToggle(
                          product,
                          { is_active: !isActive },
                          isActive ? "상품을 비활성화했습니다." : "상품을 다시 판매 시작했습니다."
                        )
                      }
                      disabled={workingId === productId}
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-60"
                    >
                      {isActive ? "비활성화" : "재활성화"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      disabled={workingId === productId}
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 disabled:opacity-60"
                    >
                      삭제
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
