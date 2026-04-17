import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResetPasswordForm from "@/components/member/ResetPasswordForm";
import { companyInfo } from "@/lib/data";

export const metadata: Metadata = {
  title: `새 비밀번호 설정 | ${companyInfo.companyName}`,
  description: "비밀번호 재설정 링크를 통해 새 비밀번호를 설정하는 페이지입니다.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <section className="mx-auto max-w-3xl px-6 py-14">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-sm font-semibold text-slate-500">SET NEW PASSWORD</div>
          <h1 className="mt-3 text-3xl font-black text-slate-900">새 비밀번호 설정</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            재설정 링크로 접속한 뒤 새 비밀번호를 입력해주세요.
          </p>
          <div className="mt-6">
            <ResetPasswordForm />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
