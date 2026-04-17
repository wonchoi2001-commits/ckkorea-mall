import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import {
  getAdminUser,
  hasOnlyExampleAdminEmails,
  isDevelopmentAdminBypassEnabled,
} from "@/lib/auth";

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const adminUser = await getAdminUser();
  const hasExampleAdminConfig = hasOnlyExampleAdminEmails();
  const hasDevelopmentBypass = isDevelopmentAdminBypassEnabled();

  if (adminUser) {
    redirect("/admin/products");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const hasAccessError = resolvedSearchParams?.error === "access-denied";

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-sm font-semibold text-slate-500">ADMIN LOGIN</div>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
            관리자 로그인
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Supabase Auth 계정으로 로그인한 뒤 관리자 이메일 또는 관리자 role
            여부를 확인합니다.
          </p>

          {hasAccessError ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              로그인은 되었지만 관리자 권한이 확인되지 않았습니다. 현재
              로그인한 이메일이 `.env.local`의 `ADMIN_EMAILS`와 정확히
              일치하는지, 또는 Supabase 사용자 `app_metadata.role=admin`
              설정이 되어 있는지 확인해주세요.
            </div>
          ) : null}

          {hasExampleAdminConfig ? (
            <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
              현재 `.env.local`의 `ADMIN_EMAILS`가 `admin@example.com` 형식의
              예시값으로 보입니다. {hasDevelopmentBypass
                ? "로컬 개발 모드에서는 로그인한 사용자를 관리자 처리하도록 보완해두었습니다."
                : "실제로 만든 Supabase Auth 이메일로 바꾸고, 개발 서버를 다시 시작해야 관리자 권한이 반영됩니다."}{" "}
              배포 전에는 반드시 실제 관리자 이메일 또는 Supabase 사용자
              `app_metadata.role=admin` 설정으로 교체해주세요.
            </div>
          ) : null}

          <AdminLoginForm />
        </div>
      </section>
    </main>
  );
}
