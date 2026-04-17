import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ForgotPasswordForm from "@/components/member/ForgotPasswordForm";
import { companyInfo } from "@/lib/data";

export const metadata: Metadata = {
  title: `비밀번호 재설정 | ${companyInfo.companyName}`,
  description: "로그인 비밀번호를 재설정할 수 있는 페이지입니다.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <section className="mx-auto max-w-3xl px-6 py-14">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-sm font-semibold text-slate-500">PASSWORD RESET</div>
          <h1 className="mt-3 text-3xl font-black text-slate-900">비밀번호 재설정</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            가입한 이메일로 비밀번호 재설정 링크를 보내드립니다.
          </p>
          <div className="mt-6">
            <ForgotPasswordForm />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
