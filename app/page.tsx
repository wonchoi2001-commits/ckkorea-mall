import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { categories, companyInfo, products } from "@/lib/data";

export default function HomePage() {
  const featuredProducts = products.filter((product) => product.featured).slice(0, 6);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <section className="mx-auto max-w-7xl px-6 pt-10 pb-8">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="rounded-[32px] bg-slate-900 px-8 py-10 text-white shadow-sm">
            <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
              건축자재 · 철물 · 공구 · 안전용품 전문몰
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight">
              현장에 필요한 자재를
              <br />
              온라인으로 빠르게 확인하고 주문하세요
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              {companyInfo.companyName} 자사몰입니다. 건축자재, 철물, 공구, 안전용품을
              온라인으로 확인하고, 대량 납품이나 현장 배송이 필요한 경우 견적문의로
              빠르게 연결할 수 있습니다.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                상품 보러가기
              </Link>

              <Link
                href="/quote"
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                견적 문의하기
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-sm text-slate-300">배송 방식</div>
                <div className="mt-2 font-bold">택배 / 화물배송 / 현장납품 문의</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-sm text-slate-300">구매 유형</div>
                <div className="mt-2 font-bold">즉시결제 / 대량견적</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-sm text-slate-300">상담 가능 시간</div>
                <div className="mt-2 font-bold">{companyInfo.hours}</div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="text-sm font-semibold text-slate-500">고객센터</div>
              <div className="mt-2 text-2xl font-black">{companyInfo.phone}</div>
              <div className="mt-2 text-sm text-slate-600">{companyInfo.email}</div>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                제품 규격, 대량 발주, 현장 납품, 반복 구매 품목은 견적문의로 접수하시면
                더 빠르게 안내받을 수 있습니다.
              </div>
            </div>

            <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="text-sm font-semibold text-slate-500">운영 정보</div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                  <span>상호명</span>
                  <span className="text-right font-semibold text-slate-900">
                    {companyInfo.companyName}
                  </span>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                  <span>대표자</span>
                  <span className="text-right font-semibold text-slate-900">
                    {companyInfo.ceo}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>사업자등록번호</span>
                  <span className="text-right font-semibold text-slate-900">
                    {companyInfo.businessNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black">카테고리 바로가기</h2>
            <p className="mt-1 text-sm text-slate-500">
              자주 찾는 품목군을 빠르게 확인해보세요.
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            전체 상품 보기 →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category}
              href="/products"
              className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-lg font-bold">{category}</div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {category} 관련 상품을 빠르게 확인하고 필요한 품목을 문의할 수 있습니다.
              </p>
              <div className="mt-4 text-sm font-semibold text-slate-700">
                카테고리 보기 →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black">추천 상품</h2>
            <p className="mt-1 text-sm text-slate-500">
              현장에서 자주 찾는 주요 품목을 먼저 소개합니다.
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            상품목록 바로가기 →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="text-lg font-bold">대량 납품 대응</div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              공사 현장, 사업자 반복 구매, 다량 발주 건은 별도 조건으로 견적 상담이
              가능합니다.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="text-lg font-bold">배송 방식 다양화</div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              제품 특성에 따라 일반 택배, 화물배송, 현장 납품 상담 방식으로 유연하게
              대응합니다.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="text-lg font-bold">빠른 상담 연결</div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              일반 소매 구매뿐 아니라 규격 문의, 납기 확인, 대량 구매도 빠르게
              안내받을 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-8 pb-14">
        <div className="rounded-[32px] bg-slate-900 px-8 py-10 text-white">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black leading-tight">
              대량 발주나 현장 납품이 필요하신가요?
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              반복 구매 품목, 공사 현장 납품, 화물배송 제품은 견적 문의를 남겨주시면
              조건에 맞게 빠르게 안내해드립니다.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/quote"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              견적문의 바로가기
            </Link>
            <Link
              href="/products"
              className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20"
            >
              상품 먼저 보기
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}