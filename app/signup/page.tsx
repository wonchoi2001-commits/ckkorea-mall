import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SignupForm from "@/components/member/SignupForm";
import { companyInfo } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: `회원가입 | ${companyInfo.companyName}`,
  description: "개인회원과 사업자회원 중 필요한 유형을 선택하고, 배송지 저장과 재주문, 사업자 혜택을 위한 계정을 생성할 수 있습니다.",
  alternates: {
    canonical: `${companyInfo.domain}/signup`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/mypage");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-12 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] bg-slate-950 px-8 py-10 text-white">
            <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
              회원가입
            </div>
            <h1 className="mt-5 text-4xl font-black leading-tight">
              개인회원은 더 빠르게,
              <br />
              사업자회원은 더 편리하게
            </h1>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              비회원도 구매는 가능하지만, 회원가입을 하면 배송지 저장, 관심상품, 최근 본
              상품, 재주문이 가능해져 다음 주문이 훨씬 편해집니다.
            </p>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900">사업자회원이 좋은 이유</h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">대량구매 / 반복발주 상담을 더 빠르게 받을 수 있습니다.</div>
              <div className="rounded-2xl bg-slate-50 p-4">세금계산서 이메일과 회사 정보를 저장해 주문 입력을 줄입니다.</div>
              <div className="rounded-2xl bg-slate-50 p-4">주문내역 기반 재주문과 현장 납품 문의 흐름이 자연스럽게 이어집니다.</div>
            </div>
            <div className="mt-5 text-sm text-slate-600">
              자세한 혜택은{" "}
              <Link href="/business-benefits" className="font-semibold text-slate-900 underline">
                사업자회원 혜택 페이지
              </Link>
              에서 확인할 수 있습니다.
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-sm font-semibold text-slate-500">CREATE ACCOUNT</div>
          <h2 className="mt-3 text-3xl font-black text-slate-900">회원가입</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            개인회원과 사업자회원은 가입 후 화면과 저장 정보가 다르게 동작합니다.
          </p>
          <div className="mt-6">
            <SignupForm />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
