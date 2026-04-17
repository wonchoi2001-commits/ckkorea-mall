"use client";

import { FormEvent, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { forgotPasswordSchema, getValidationMessage } from "@/lib/validation";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const parsed = forgotPasswordSchema.safeParse({ email });

    if (!parsed.success) {
      setMessage(getValidationMessage(parsed.error, "이메일을 확인해주세요."));
      setLoading(false);
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("비밀번호 재설정 메일을 전송했습니다. 메일함을 확인해주세요.");
    } catch (error) {
      console.error("FORGOT PASSWORD ERROR:", error);
      setMessage("비밀번호 재설정 요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">이메일</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-base font-bold text-white disabled:opacity-60"
      >
        {loading ? "전송 중..." : "재설정 메일 보내기"}
      </button>
      {message ? <p className="text-sm font-medium text-slate-700">{message}</p> : null}
    </form>
  );
}
