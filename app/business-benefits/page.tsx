import type { Metadata } from "next";
import Link from "next/link";
import InfoPageLayout from "@/components/InfoPageLayout";
import { companyInfo } from "@/lib/data";

export const metadata: Metadata = {
  title: `사업자회원 혜택 | ${companyInfo.companyName}`,
  description:
    "사업자회원의 대량구매 상담, 세금계산서 대응, 재주문 편의, 현장 납품 상담 등 B2B 혜택을 안내합니다.",
  alternates: {
    canonical: `${companyInfo.domain}/business-benefits`,
  },
};

export default function BusinessBenefitsPage() {
  return (
    <InfoPageLayout
      eyebrow="Business Member"
      title="사업자회원은 반복 구매와 현장 주문 흐름이 더 빠릅니다"
      description="대량구매, 현장 납품, 반복 발주, 세금계산서 대응이 필요한 고객을 위해 사업자회원 전용 저장 구조와 안내를 준비했습니다."
    >
      <div className="space-y-10">
        <section className="grid gap-4 md:grid-cols-2">
          {[
            "사업자 정보와 세금계산서 이메일을 저장해 주문 단계 입력을 줄입니다.",
            "반복 구매한 주문 내역을 기준으로 재주문 장바구니를 빠르게 만들 수 있습니다.",
            "현장 납품, 화물배송, 대량구매 문의 동선을 일반회원보다 더 분명하게 제공합니다.",
            "승인 상태와 사업자 전용 혜택 구조를 앞으로 확장하기 쉽게 준비해두었습니다.",
          ].map((item) => (
            <div key={item} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
              {item}
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-2xl font-black text-slate-900">추천 대상</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600">
              공사 현장, 설비, 인테리어, 유지보수 업무로 철물/건재/배관/공구를 반복 구매하는 사업자
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600">
              세금계산서, 현장 납품, 발주번호, 프로젝트명 관리가 필요한 거래처형 주문 고객
            </div>
          </div>
        </section>

        <section className="rounded-[32px] bg-slate-950 px-6 py-7 text-white">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-300">Business CTA</div>
              <h2 className="mt-2 text-3xl font-black leading-tight">
                사업자회원으로 가입하고
                <br />
                반복 주문과 대량 문의를 더 간단하게 시작하세요
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100"
              >
                사업자회원 가입
              </Link>
              <Link
                href="/quote"
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                대량 견적 문의
              </Link>
            </div>
          </div>
        </section>
      </div>
    </InfoPageLayout>
  );
}
