import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginForm from "@/components/member/LoginForm";
import { companyInfo } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: `로그인 | ${companyInfo.companyName}`,
  description: "회원 로그인 후 배송지 저장, 재주문, 관심상품, 최근 본 상품 기능을 사용할 수 있습니다.",
  alternates: {
    canonical: `${companyInfo.domain}/login`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/mypage");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[32px] bg-slate-950 px-8 py-10 text-white">
          <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
            회원 로그인
          </div>
          <h1 className="mt-5 text-4xl font-black leading-tight">
            로그인하면 다음 주문이
            <br />
            훨씬 빨라집니다
          </h1>
          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
            <div className="rounded-2xl bg-white/10 p-4">배송지와 주문자 정보를 저장해 반복 입력을 줄일 수 있습니다.</div>
            <div className="rounded-2xl bg-white/10 p-4">관심상품과 최근 본 상품이 기기 간에 유지되어 다시 찾기 편해집니다.</div>
            <div className="rounded-2xl bg-white/10 p-4">사업자회원은 대량구매 상담, 세금계산서 대응, 재주문 흐름이 더 빠릅니다.</div>
          </div>
          <div className="mt-6 text-sm text-slate-300">
            아직 계정이 없다면{" "}
            <Link href="/signup" className="font-semibold text-white underline">
              회원가입
            </Link>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-sm font-semibold text-slate-500">WELCOME BACK</div>
          <h2 className="mt-3 text-3xl font-black text-slate-900">로그인</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            비회원도 구매할 수 있지만, 회원은 배송지 저장과 재주문이 훨씬 편합니다.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
