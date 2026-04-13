"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/lib/data";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [keyword, setKeyword] = useState("");

  const allCategories = ["전체", ...categories];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "전체" || product.category === selectedCategory;

      const lowerKeyword = keyword.trim().toLowerCase();

      const matchesKeyword =
        lowerKeyword === "" ||
        product.name.toLowerCase().includes(lowerKeyword) ||
        product.brand.toLowerCase().includes(lowerKeyword) ||
        product.spec.toLowerCase().includes(lowerKeyword) ||
        product.desc.toLowerCase().includes(lowerKeyword);

      return matchesCategory && matchesKeyword;
    });
  }, [selectedCategory, keyword]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <div>
              <div className="mb-2 text-sm font-bold text-slate-900">카테고리</div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
              >
                {allCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-2 text-sm font-bold text-slate-900">상품 검색</div>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="상품명, 브랜드, 규격으로 검색"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>
          </div>
        </div>

        <div className="mb-5">
          <h1 className="text-2xl font-black">상품 목록</h1>
          <p className="mt-1 text-sm text-slate-500">
            총 {filteredProducts.length}개의 상품이 검색되었습니다.
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
            <div className="text-lg font-bold text-slate-900">검색 결과가 없습니다.</div>
            <p className="mt-2 text-sm text-slate-500">
              다른 키워드나 카테고리로 다시 검색해보세요.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}