import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import QuoteForm from "@/components/QuoteForm";
import { products } from "@/lib/data";

export default function HomePage() {
  const featuredProducts = products.filter((item) => item.featured).slice(0, 4);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <Hero />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-2">
        <div className="mb-5">
          <h2 className="text-2xl font-black">추천 상품</h2>
          <p className="mt-1 text-sm text-slate-500">반복 구매와 문의가 많은 주요 자재입니다.</p>
        </div>
        <div className="grid grid-cols-4 gap-5">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-10 grid max-w-7xl grid-cols-12 gap-6 px-6">
        <div className="col-span-8 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="mb-6">
            <h3 className="text-2xl font-black">거래처 전용 주문 프로세스</h3>
            <p className="mt-1 text-sm text-slate-500">B2B 고객을 위한 승인형 단가 운영 구조</p>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              ["STEP 1", "회원가입 및 사업자 확인"],
              ["STEP 2", "거래처 승인 및 단가 적용"],
              ["STEP 3", "납품지/수량 입력 후 견적 확인"],
              ["STEP 4", "결제 또는 전화 발주 진행"],
            ].map(([step, text]) => (
              <div key={step} className="rounded-3xl bg-slate-100 p-5">
                <div className="text-xs font-bold text-slate-500">{step}</div>
                <div className="mt-3 text-base font-bold leading-6">{text}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-4">
          <QuoteForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
