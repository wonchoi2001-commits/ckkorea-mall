import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="text-sm font-semibold text-slate-500">404 NOT FOUND</div>
          <h1 className="mt-4 text-3xl font-black text-slate-900">
            요청하신 페이지를 찾을 수 없습니다
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            상품이 삭제되었거나 주소가 변경되었을 수 있습니다. 상품목록에서 다시
            찾아보시거나 견적문의로 필요한 품목을 남겨주세요.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              상품목록 보기
            </Link>
            <Link
              href="/quote"
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900"
            >
              견적문의 하기
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
