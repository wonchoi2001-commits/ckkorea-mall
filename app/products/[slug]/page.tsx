import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6">
          <Link
            href="/products"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← 상품목록으로
          </Link>
        </div>

        <div className="grid gap-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  product.price === null
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {product.type}
              </span>

              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                {product.shipping}
              </span>

              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                {product.category}
              </span>
            </div>

            <h1 className="text-3xl font-black">{product.name}</h1>
            <p className="mt-2 text-sm text-slate-500">{product.brand}</p>

            <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-5">
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span className="text-slate-500">규격</span>
                <span className="text-right font-medium">{product.spec}</span>
              </div>

              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span className="text-slate-500">판매단위</span>
                <span className="text-right font-medium">{product.unit}</span>
              </div>

              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span className="text-slate-500">배송방식</span>
                <span className="text-right font-medium">{product.shipping}</span>
              </div>

              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span className="text-slate-500">재고상태</span>
                <span className="text-right font-medium">{product.stock}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">가격</span>
                <span className="text-right text-2xl font-black">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-bold">상품 설명</h2>
              <p className="mt-3 leading-7 text-slate-600">{product.desc}</p>
            </div>

            <div className="mt-8 flex gap-3">
              {product.price === null ? (
                <Link
                  href="/quote"
                  className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-center text-sm font-semibold text-white hover:bg-slate-800"
                >
                  견적문의 하러가기
                </Link>
              ) : (
                <>
                  <button className="flex-1 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                    장바구니 담기
                  </button>
                  <Link
                    href="/quote"
                    className="flex-1 rounded-2xl bg-slate-900 px-5 py-4 text-center text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    대량 견적문의
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}