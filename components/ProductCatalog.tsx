"use client";

import { useEffect, useMemo, useState } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import ProductBadge from "@/components/ui/ProductBadge";
import SectionHeader from "@/components/ui/SectionHeader";
import { catalogCategories, companyInfo, shippingPolicy } from "@/lib/data";
import type { Product } from "@/lib/types";

type SortKey = "featured" | "latest" | "price_low" | "price_high" | "name";
type ProductMode = "all" | "instant" | "quote" | "featured";

function normalizeCategoryQuery(value?: string) {
  if (!value) {
    return "전체";
  }

  return value === "PVC배관 및 부속" ? "PVC 배관 및 부속" : value;
}

export default function ProductCatalog({
  products,
  initialCategory,
  initialKeyword,
}: {
  products: Product[];
  initialCategory?: string;
  initialKeyword?: string;
}) {
  const [selectedCategory, setSelectedCategory] = useState(
    normalizeCategoryQuery(initialCategory)
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState("전체");
  const [keyword, setKeyword] = useState(initialKeyword || "");
  const [sortKey, setSortKey] = useState<SortKey>("featured");
  const [productMode, setProductMode] = useState<ProductMode>("all");
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    setSelectedCategory(normalizeCategoryQuery(initialCategory));
  }, [initialCategory]);

  useEffect(() => {
    setKeyword(initialKeyword || "");
  }, [initialKeyword]);

  useEffect(() => {
    setSelectedSubcategory("전체");
    setVisibleCount(24);
  }, [selectedCategory, keyword, sortKey, productMode]);

  const categorySummary = useMemo(() => {
    return catalogCategories.map((category) => {
      const items = products.filter((product) => product.categoryMain === category.name);

      return {
        ...category,
        count: items.length,
        featuredCount: items.filter((product) => product.featured).length,
      };
    });
  }, [products]);

  const availableSubcategories = useMemo(() => {
    const subcategorySet = new Set(
      products
        .filter((product) =>
          selectedCategory === "전체" ? true : product.categoryMain === selectedCategory
        )
        .map((product) => product.categorySub || product.category)
        .filter(Boolean)
    );

    return ["전체", ...Array.from(subcategorySet)];
  }, [products, selectedCategory]);

  const filteredProducts = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();

    return [...products]
      .filter((product) => {
        const matchesCategory =
          selectedCategory === "전체" || product.categoryMain === selectedCategory;
        const matchesSubcategory =
          selectedSubcategory === "전체" ||
          (product.categorySub || product.category) === selectedSubcategory;
        const matchesMode =
          productMode === "all"
            ? true
            : productMode === "instant"
              ? product.price !== null
              : productMode === "quote"
                ? product.quoteRequired
                : product.featured;
        const matchesKeyword =
          lowerKeyword === "" ||
          [
            product.name,
            product.brand,
            product.manufacturer || "",
            product.spec,
            product.shipping,
            product.desc,
            product.description,
            product.category,
            product.categoryMain,
            product.categorySub || "",
            product.origin || "",
            product.metaTitle || "",
            product.metaDescription || "",
            ...product.tags,
            ...product.searchKeywords,
          ].some((value) => value.toLowerCase().includes(lowerKeyword));

        return matchesCategory && matchesSubcategory && matchesMode && matchesKeyword;
      })
      .sort((left, right) => {
        switch (sortKey) {
          case "latest": {
            const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
            const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
            return rightTime - leftTime;
          }
          case "price_low":
            return (left.price ?? Number.POSITIVE_INFINITY) - (right.price ?? Number.POSITIVE_INFINITY);
          case "price_high":
            return (right.price ?? 0) - (left.price ?? 0);
          case "name":
            return left.name.localeCompare(right.name, "ko");
          case "featured":
          default:
            return (
              Number(right.featured) * 120 +
              Number(Boolean(right.badge)) * 24 +
              right.qualityScore * 2 +
              Number(right.price !== null) * 18 -
              right.sortOrder -
              (Number(left.featured) * 120 +
                Number(Boolean(left.badge)) * 24 +
                left.qualityScore * 2 +
                Number(left.price !== null) * 18 -
                left.sortOrder)
            );
        }
      });
  }, [keyword, productMode, products, selectedCategory, selectedSubcategory, sortKey]);

  const suggestedKeywords = useMemo(() => {
    const counts = new Map<string, number>();

    products.forEach((product) => {
      product.searchKeywords.slice(0, 6).forEach((keyword) => {
        const normalized = keyword.trim();

        if (!normalized || normalized.length < 2) {
          return;
        }

        counts.set(normalized, (counts.get(normalized) || 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 10)
      .map(([keyword]) => keyword);
  }, [products]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleProducts.length < filteredProducts.length;

  const summary = useMemo(
    () => ({
      total: filteredProducts.length,
      instant: filteredProducts.filter((product) => product.price !== null).length,
      quote: filteredProducts.filter((product) => product.quoteRequired).length,
      featured: filteredProducts.filter((product) => product.featured).length,
    }),
    [filteredProducts]
  );

  const activeCategoryMeta = categorySummary.find(
    (category) => category.name === selectedCategory
  );

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f8fafc_40%,#ffffff_100%)] text-slate-950">
      <Header />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <SectionHeader
            eyebrow="Catalog"
            title="현장형 건축자재 · 철물 · 공구 카탈로그"
            description="철물점, 건재상, 공구상에서 실제로 자주 찾는 품목군 중심으로 카테고리와 규격을 정리했습니다. 소량은 즉시결제, 대량/장척/중량 자재는 견적문의로 자연스럽게 연결됩니다."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                    상품 검색
                  </div>
                  <input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="상품명, 카테고리, 규격, 브랜드, 용도로 검색"
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-300 focus:border-white/30"
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                    정렬 기준
                  </div>
                  <select
                    value={sortKey}
                    onChange={(event) => setSortKey(event.target.value as SortKey)}
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                  >
                    <option value="featured">추천순</option>
                    <option value="latest">최신순</option>
                    <option value="price_low">가격 낮은순</option>
                    <option value="price_high">가격 높은순</option>
                    <option value="name">이름순</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {(["all", "instant", "quote", "featured"] as ProductMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setProductMode(mode)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      productMode === mode
                        ? "bg-white text-slate-950"
                        : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
                    }`}
                  >
                    {mode === "all"
                      ? "전체"
                      : mode === "instant"
                        ? "즉시결제"
                        : mode === "quote"
                          ? "견적문의"
                          : "추천상품"}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {suggestedKeywords.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setKeyword(item)}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    #{item}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-300">
                    검색 결과
                  </div>
                  <div className="mt-2 text-3xl font-black">{summary.total}</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-300">
                    즉시결제
                  </div>
                  <div className="mt-2 text-3xl font-black">{summary.instant}</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-300">
                    견적형
                  </div>
                  <div className="mt-2 text-3xl font-black">{summary.quote}</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-300">
                    추천 노출
                  </div>
                  <div className="mt-2 text-3xl font-black">{summary.featured}</div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                운영 안내
              </div>
              <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
                <p>
                  기본 배송비는 {shippingPolicy.baseFee.toLocaleString()}원이며,{" "}
                  {shippingPolicy.freeShippingThreshold.toLocaleString()}원 이상 주문은
                  무료배송 기준으로 운영합니다.
                </p>
                <p>
                  골재, 장척 목재, 대구경 배관, 프로젝트 단위 자재는 화물배송 또는
                  현장납품 문의가 우선 적용됩니다.
                </p>
                <p>
                  사업자 구매, 반복 발주, 법인거래는 견적문의에서 더 정확한 납기와
                  단가를 안내받을 수 있습니다.
                </p>
              </div>

              <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">고객센터</div>
                <div className="mt-2 text-2xl font-black text-slate-950">{companyInfo.phone}</div>
                <div className="mt-1 text-sm text-slate-500">{companyInfo.hours}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-slate-950">대분류 필터</div>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("전체")}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  selectedCategory === "전체"
                    ? "bg-slate-950 text-white"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>전체 상품</span>
                <span>{products.length}</span>
              </button>

              {categorySummary.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    selectedCategory === category.name
                      ? "bg-slate-950 text-white"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{category.name}</span>
                  <span>{category.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-slate-950">세부 필터</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {availableSubcategories.map((subcategory) => (
                <button
                  key={subcategory}
                  type="button"
                  onClick={() => setSelectedSubcategory(subcategory)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                    selectedSubcategory === subcategory
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {subcategory}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-slate-950">빠른 안내</div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>즉시결제 상품은 소량 재구매에 적합합니다.</p>
              <p>견적형 상품은 운임, 수량, 현장 납품 여부를 함께 확인합니다.</p>
              <p>카테고리별 대표 품목은 홈 추천상품과 상세 관련상품에도 연동됩니다.</p>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <ProductBadge label={selectedCategory} tone="slate" />
                  {selectedSubcategory !== "전체" ? (
                    <ProductBadge label={selectedSubcategory} tone="blue" />
                  ) : null}
                  {productMode !== "all" ? (
                    <ProductBadge
                      label={
                        productMode === "instant"
                          ? "즉시결제"
                          : productMode === "quote"
                            ? "견적문의"
                            : "추천상품"
                      }
                      tone={productMode === "quote" ? "amber" : "emerald"}
                    />
                  ) : null}
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
                  {selectedCategory === "전체"
                    ? "전체 상품 카탈로그"
                    : `${selectedCategory} 상품`}
                </h1>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {activeCategoryMeta?.lead ||
                    "카테고리, 규격, 배송 방식, 구매 유형을 함께 보면서 실제 주문 또는 견적 흐름으로 이어질 수 있게 구성했습니다."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    노출 상품
                  </div>
                  <div className="mt-2 text-2xl font-black text-slate-950">{summary.total}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    즉시결제
                  </div>
                  <div className="mt-2 text-2xl font-black text-slate-950">{summary.instant}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    견적형
                  </div>
                  <div className="mt-2 text-2xl font-black text-slate-950">{summary.quote}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categorySummary.map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={() => setSelectedCategory(category.name)}
                className={`rounded-[26px] border p-5 text-left shadow-sm transition ${
                  selectedCategory === category.name
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-900 hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-black">{category.name}</div>
                    <div
                      className={`mt-2 text-sm leading-6 ${
                        selectedCategory === category.name ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {category.description}
                    </div>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-sm font-bold ${
                      selectedCategory === category.name
                        ? "bg-white/10 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {category.count}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8">
            {visibleProducts.length === 0 ? (
              <EmptyState
                title="조건에 맞는 상품이 없습니다."
                description="다른 키워드로 다시 검색하거나 카테고리·견적형 필터를 조정해 보세요."
              />
            ) : (
              <>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {hasMore ? (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 24)}
                      className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-50"
                    >
                      상품 더 보기
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
