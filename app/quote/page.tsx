import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteForm from "@/components/QuoteForm";

export default function QuotePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-black">대량 견적 문의</h1>
          <p className="mt-2 text-sm text-slate-600">현장 납품, 화물배송, 반복 발주 건을 위한 문의 페이지입니다.</p>
        </div>
        <QuoteForm />
      </section>
      <Footer />
    </main>
  );
}
