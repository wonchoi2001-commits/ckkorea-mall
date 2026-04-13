"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/lib/data";

type SortOption = "default" | "priceLow" | "priceHigh" | "name";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("default");

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "전체") {
      result = result.filter((product) => product.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const keyword = searchTerm.toLowerCase().trim();

      result = result.filter((product) => {
        return (
          product.name.toLowerCase().includes(keyword) ||
          product.category.toLowerCase().includes(keyword) ||
          product.brand.toLowerCase().includes(keyword) ||
          product.spec.toLowerCase().includes(keyword) ||
          product.desc.toLowerCase().includes(keyword)
        );
      });
    }

    if (sortOption === "priceLow") {
      result.sort((a, b) => {
        const aPrice = a.price ?? Number.MAX_SAFE_INTEGER;
        const bPrice = b.price ?? Number.MAX_SAFE_INTEGER;
        return aPrice - bPrice;
      });
    }

    if (sortOption === "priceHigh") {
      result.sort((a, b) => {
        const aPrice = a.price ?? -1;
        const bPrice = b.price ?? -1;
        return bPrice - aPrice;
      });
    }

    if (sortOption === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    }

    return result;
  }, [selectedCategory, searchTerm, sortOption]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                상품 검색
              </label>
              <input
                type="text"
                placeholder="상품명, 규격, 카테고리로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                카테고리
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
              >
                <option value="전체">전체</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                정렬
              </label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
              >
                <option value="default">기본순</option>
                <option value="priceLow">가격 낮은순</option>
                <option value="priceHigh">가격 높은순</option>
                <option value="name">상품명순</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-12 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-3">
            <div className="mb-4 text-lg font-bold">카테고리</div>

            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory("전체")}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
                  selectedCategory === "전체"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>전체</span>
                <span>{products.length}</span>
              </button>

              {categories.map((category) => {
                const count = products.filter(
                  (product) => product.category === category
                ).length;

                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
                      selectedCategory === category
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>{category}</span>
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="col-span-12 lg:col-span-9">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-2xl font-black">상품 목록</h1>
                <p className="mt-1 text-sm text-slate-500">
                  현재 조건에 맞는 상품은 총 {filteredProducts.length}개입니다.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory("전체");
                  setSearchTerm("");
                  setSortOption("default");
                }}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                필터 초기화
              </button>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
                <div className="text-xl font-bold">검색 결과가 없습니다.</div>
                <p className="mt-2 text-sm text-slate-500">
                  다른 검색어를 입력하거나 카테고리를 변경해보세요.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}