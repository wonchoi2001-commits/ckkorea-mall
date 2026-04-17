import type { Metadata } from "next";
import Link from "next/link";
import InfoPageLayout from "@/components/InfoPageLayout";
import { companyInfo, companyHighlights, shippingPolicy, supplyCategoryHighlights } from "@/lib/data";

export const metadata: Metadata = {
  title: `회사소개 | ${companyInfo.companyName}`,
  description:
    "씨케이코리아의 취급 품목, 운영 방식, 현장 납품 대응 범위와 사업자 거래 안내를 확인할 수 있는 회사소개 페이지입니다.",
  alternates: {
    canonical: `${companyInfo.domain}/about`,
  },
  openGraph: {
    title: `회사소개 | ${companyInfo.companyName}`,
    description:
      "건축자재, 철물, 공구, 전기자재, 안전용품을 운영형으로 공급하는 씨케이코리아 자사몰 소개입니다.",
    url: `${companyInfo.domain}/about`,
  },
};

export default function AboutPage() {
  return (
    <InfoPageLayout
      eyebrow="Company"
      title="씨케이코리아는 현장 구매 흐름을 이해하는 자재 운영형 자사몰을 지향합니다"
      description="소량 즉시결제와 대량 견적·현장 납품을 함께 처리할 수 있도록 상품 구성, 배송 방식, 사업자 주문 흐름을 한 쇼핑몰 안에서 정리했습니다."
    >
      <div className="space-y-10">
        <section>
          <h2 className="text-2xl font-black text-slate-900">운영 방향</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {companyHighlights.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-2xl font-black text-slate-900">주요 취급 품목</h2>
            <div className="mt-5 grid gap-3 text-sm leading-7 text-slate-600 md:grid-cols-2">
              {supplyCategoryHighlights.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-2xl font-black text-slate-900">운영 정보</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span>상호</span>
                <span className="text-right font-semibold text-slate-900">
                  {companyInfo.companyName}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span>대표번호</span>
                <span className="text-right font-semibold text-slate-900">
                  {companyInfo.phone}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span>이메일</span>
                <span className="text-right font-semibold text-slate-900">
                  {companyInfo.email}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span>통신판매업 신고번호</span>
                <span className="text-right font-semibold text-slate-900">
                  {companyInfo.ecommerceNumber}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <span>기본 배송비</span>
                <span className="text-right font-semibold text-slate-900">
                  {shippingPolicy.baseFee.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>무료배송 기준</span>
                <span className="text-right font-semibold text-slate-900">
                  {shippingPolicy.freeShippingThreshold.toLocaleString()}원 이상
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-2xl font-black text-slate-900">이런 주문에 적합합니다</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600">
              반복 구매 품목을 온라인으로 빠르게 재주문하고, 필요하면 관리자 메모와 세금계산서 상태까지 함께 관리하고 싶은 사업자 고객
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600">
              골재, 목재, 장척 배관처럼 운임과 납품지 조건이 중요한 품목을 견적문의와 현장 납품 상담으로 연결해야 하는 현장 고객
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600">
              실리콘, 피스, 공구 소모품처럼 자주 쓰는 상품을 즉시결제로 빠르게 구매하려는 소매·반복 구매 고객
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600">
              상품 검색, 카테고리 탐색, 견적문의, 주문, 관리자 운영까지 한 구조 안에서 정리된 자사몰이 필요한 운영 환경
            </div>
          </div>
        </section>

        <section className="rounded-[32px] bg-slate-900 px-6 py-7 text-white">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-300">빠른 연결</div>
              <h2 className="mt-2 text-3xl font-black leading-tight">
                현장 납품, 반복 구매, 대량 발주는
                <br />
                상품 보기와 견적 문의를 함께 활용하세요
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100"
              >
                상품목록 보기
              </Link>
              <Link
                href="/quote"
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                견적 문의하기
              </Link>
            </div>
          </div>
        </section>
      </div>
    </InfoPageLayout>
  );
}
