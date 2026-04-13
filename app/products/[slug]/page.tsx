import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = products.find((item) => item.slug === slug);

  if (!product) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <Header />
        <section className="mx-auto max-w-5xl px-6 py-16">
          <h1 className="text-3xl font-black">상품을 찾을 수 없습니다.</h1>
          <p className="mt-3 text-slate-600">
            요청하신 상품 정보가 존재하지 않습니다.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            상품목록으로 돌아가기
          </Link>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/products"
          className="mb-6 inline-block text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          ← 상품목록으로 돌아가기
        </Link>

        <div className="grid gap-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:grid-cols-2">
          <div className="relative h-[420px] overflow-hidden rounded-3xl bg-slate-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
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
            </div>

            <h1 className="text-3xl font-black">{product.name}</h1>
            <p className="mt-2 text-sm text-slate-500">브랜드: {product.brand}</p>

            <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-5">
              <div className="text-sm text-slate-700">
                <span className="font-semibold">카테고리:</span> {product.category}
              </div>
              <div className="text-sm text-slate-700">
                <span className="font-semibold">규격:</span> {product.spec}
              </div>
              <div className="text-sm text-slate-700">
                <span className="font-semibold">판매단위:</span> {product.unit}
              </div>
              <div className="text-sm text-slate-700">
                <span className="font-semibold">배송방식:</span> {product.shipping}
              </div>
              <div className="text-sm text-slate-700">
                <span className="font-semibold">재고상태:</span> {product.stock}
              </div>
            </div>

            <p className="mt-6 leading-7 text-slate-600">{product.desc}</p>

            <div className="mt-8 text-3xl font-black">
              {formatPrice(product.price)}
            </div>

            <div className="mt-6 flex gap-3">
              {product.price === null ? (
                <Link
                  href="/quote"
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  견적 문의하기
                </Link>
              ) : (
                <>
                  <button className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                    장바구니 담기
                  </button>
                  <Link
                    href="/quote"
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    대량 견적 문의
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