"use client";

import { useState } from "react";

export default function QuoteForm() {
  const [form, setForm] = useState({
    company: "",
    manager: "",
    phone: "",
    items: "",
    region: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setDone(false);

    const res = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      setDone(true);
      setForm({
        company: "",
        manager: "",
        phone: "",
        items: "",
        region: "",
        message: "",
      });
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200">
      <h3 className="text-2xl font-black">빠른 견적 문의</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        자재명, 수량, 지역을 남기면 문의가 접수됩니다.
      </p>
      <div className="mt-5 space-y-3">
        <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="회사명 / 상호" className="h-11 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-900" />
        <input value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} placeholder="담당자명" className="h-11 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-900" />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="연락처" className="h-11 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-900" />
        <input value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} placeholder="필요 자재 / 수량" className="h-11 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-900" />
        <input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="납품 지역" className="h-11 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-900" />
        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="추가 요청사항" className="min-h-[110px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900" />
      </div>
      <button disabled={loading} className="mt-5 h-12 w-full rounded-2xl bg-slate-900 text-base font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
        {loading ? "전송 중..." : "문의 접수하기"}
      </button>
      {done && <div className="mt-3 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">문의가 정상 접수되었습니다.</div>}
    </form>
  );
}
