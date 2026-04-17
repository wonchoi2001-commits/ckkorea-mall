"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getValidationMessage, resetPasswordSchema } from "@/lib/validation";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });

    if (!parsed.success) {
      setMessage(
        getValidationMessage(parsed.error, "비밀번호 정보를 다시 확인해주세요.")
      );
      setLoading(false);
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("RESET PASSWORD ERROR:", error);
      setMessage("비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">새 비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          required
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">새 비밀번호 확인</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-base font-bold text-white disabled:opacity-60"
      >
        {loading ? "변경 중..." : "비밀번호 변경"}
      </button>
      {message ? <p className="text-sm font-medium text-slate-700">{message}</p> : null}
    </form>
  );
}
