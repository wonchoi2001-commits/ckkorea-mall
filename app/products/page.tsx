import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/lib/data";

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <h1 className="text-3xl font-black tracking-tight">상품목록</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            건축자재, 철물, 공구, 안전용품을 카테고리별로 확인할 수 있습니다.
            즉시결제 상품은 바로 주문할 수 있고, 규격·수량·현장 납품 조건에 따라
            달라지는 품목은 견적문의로 빠르게 연결됩니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="sticky top-24 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 text-lg font-bold">카테고리</div>

              <div className="space-y-2">
                <button className="flex w-full items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
                  <span>전체 상품</span>
                  <span>{products.length}</span>
                </button>

                {categories.map((category) => {
                  const count = products.filter(
                    (product) => product.category === category
                  ).length;

                  return (
                    <button
                      key={category}
                      className="flex w-full items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200"
                    >
                      <span>{category}</span>
                      <span className="text-xs text-slate-500">{count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <div className="text-sm font-bold text-slate-900">
                  대량 발주 / 현장 납품
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  배관자재, 합판 등은 수량과 배송 조건에 따라 가격이 달라질 수
                  있습니다. 필요한 규격과 수량으로 견적문의해 주세요.
                </p>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-9">
            <div className="mb-5 flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-lg font-bold">등록 상품</div>
                <p className="mt-1 text-sm text-slate-500">
                  총 {products.length}개의 상품이 등록되어 있습니다.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                  즉시결제 상품 포함
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-800">
                  견적문의 상품 포함
                </span>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}