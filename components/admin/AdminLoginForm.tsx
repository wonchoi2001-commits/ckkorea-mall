"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getFriendlyAuthErrorMessage } from "@/lib/auth-messages";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(
          getFriendlyAuthErrorMessage(error, "관리자 로그인 중 오류가 발생했습니다.")
        );
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("ADMIN LOGIN ERROR:", error);
      setMessage(
        getFriendlyAuthErrorMessage(error, "관리자 로그인 중 오류가 발생했습니다.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          관리자 이메일
        </label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@example.com"
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          비밀번호
        </label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="비밀번호"
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-bold text-white disabled:opacity-60"
      >
        {loading ? "로그인 중..." : "관리자 로그인"}
      </button>

      {message ? (
        <p className="text-sm font-medium text-red-600">{message}</p>
      ) : null}
    </form>
  );
}
