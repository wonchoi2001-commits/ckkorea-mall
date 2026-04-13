import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/lib/data";

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 text-lg font-bold">카테고리</div>
            <div className="space-y-2">
              {categories.map((category) => (
                <button key={category} className="flex w-full items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700 hover:bg-slate-200">
                  <span>{category}</span>
                  <span>›</span>
                </button>
              ))}
            </div>
          </aside>

          <div className="col-span-9">
            <div className="mb-5">
              <h1 className="text-2xl font-black">상품 목록</h1>
              <p className="mt-1 text-sm text-slate-500">총 {products.length}개의 상품이 등록되어 있습니다.</p>
            </div>

            <div className="grid grid-cols-3 gap-5">
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
