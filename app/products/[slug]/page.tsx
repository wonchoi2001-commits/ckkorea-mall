import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddToCartButton from "@/components/AddToCartButton";
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
    notFound();
  }

  const relatedProducts = products
    .filter(
      (item) =>
        item.category === product.category && item.slug !== product.slug
    )
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">
              홈
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-slate-900">
              상품목록
            </Link>
            <span>/</span>
            <span className="text-slate-900">{product.name}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="relative aspect-[4/3] w-full bg-slate-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
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

            <h1 className="text-3xl font-black leading-tight">{product.name}</h1>
            <p className="mt-2 text-sm text-slate-500">{product.brand}</p>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <div className="text-3xl font-black">
                {formatPrice(product.price)}
              </div>
              <div className="mt-2 text-sm text-slate-500">{product.stock}</div>
            </div>

            <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <div className="flex items-start justify-between gap-4">
                <span className="font-semibold text-slate-500">브랜드</span>
                <span>{product.brand}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="font-semibold text-slate-500">규격</span>
                <span>{product.spec}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="font-semibold text-slate-500">판매단위</span>
                <span>{product.unit}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="font-semibold text-slate-500">배송</span>
                <span>{product.shipping}</span>
              </div>
            </div>

            <div className="mt-6 text-sm leading-7 text-slate-600">
              {product.desc}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                목록으로
              </Link>

              {product.price === null ? (
                <Link
                  href="/quote"
                  className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
                >
                  견적문의
                </Link>
              ) : (
                <div className="flex-1">
                  <AddToCartButton product={product} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-12">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-black">관련 상품</h2>
            <p className="mt-2 text-sm text-slate-500">
              같은 카테고리의 다른 상품도 함께 확인해보세요.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.slug}`}
                  className="rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
                >
                  <div className="mb-3 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 inline-block">
                    {item.category}
                  </div>
                  <div className="font-bold text-slate-900">{item.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{item.spec}</div>
                  <div className="mt-3 text-sm font-semibold text-slate-900">
                    {formatPrice(item.price)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}