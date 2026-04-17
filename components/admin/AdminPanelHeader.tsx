"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type AdminTab = "dashboard" | "products" | "orders" | "quotes";

export default function AdminPanelHeader({
  title,
  description,
  adminEmail,
  activeTab,
}: {
  title: string;
  description: string;
  adminEmail: string;
  activeTab: AdminTab;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("ADMIN LOGOUT ERROR:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-500">ADMIN PANEL</div>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
          <p className="mt-2 text-sm text-slate-500">로그인 계정: {adminEmail}</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 disabled:opacity-60"
        >
          {loggingOut ? "로그아웃 중..." : "로그아웃"}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/admin"
          className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
            activeTab === "dashboard"
              ? "bg-slate-900 text-white"
              : "border border-slate-300 bg-white text-slate-900"
          }`}
        >
          대시보드
        </Link>
        <Link
          href="/admin/products"
          className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
            activeTab === "products"
              ? "bg-slate-900 text-white"
              : "border border-slate-300 bg-white text-slate-900"
          }`}
        >
          상품 관리
        </Link>
        <Link
          href="/admin/orders"
          className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
            activeTab === "orders"
              ? "bg-slate-900 text-white"
              : "border border-slate-300 bg-white text-slate-900"
          }`}
        >
          주문 관리
        </Link>
        <Link
          href="/admin/quotes"
          className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
            activeTab === "quotes"
              ? "bg-slate-900 text-white"
              : "border border-slate-300 bg-white text-slate-900"
          }`}
        >
          견적문의 관리
        </Link>
      </div>
    </div>
  );
}
