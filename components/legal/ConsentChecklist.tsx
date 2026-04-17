"use client";

import Link from "next/link";

export type ConsentChecklistItem = {
  id: string;
  label: string;
  href: string;
  required?: boolean;
};

type ConsentChecklistProps = {
  title: string;
  description: string;
  items: ConsentChecklistItem[];
  values: Record<string, boolean>;
  allChecked: boolean;
  onToggle: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
};

export default function ConsentChecklist({
  title,
  description,
  items,
  values,
  allChecked,
  onToggle,
  onToggleAll,
}: ConsentChecklistProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
      <div className="text-lg font-black text-slate-900">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

      <label className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm font-bold text-slate-900">
        <input
          type="checkbox"
          checked={allChecked}
          onChange={(event) => onToggleAll(event.target.checked)}
        />
        전체 동의
      </label>

      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-800"
          >
            <span className="flex min-w-0 items-center gap-3">
              <input
                id={`consent-${item.id}`}
                type="checkbox"
                checked={Boolean(values[item.id])}
                onChange={(event) => onToggle(item.id, event.target.checked)}
              />
              <label htmlFor={`consent-${item.id}`} className="min-w-0 truncate font-semibold">
                {item.required ? "[필수]" : "[선택]"} {item.label}
              </label>
            </span>
            <Link
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-xs font-semibold text-slate-500 underline underline-offset-4 hover:text-slate-900"
            >
              내용 보기
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
