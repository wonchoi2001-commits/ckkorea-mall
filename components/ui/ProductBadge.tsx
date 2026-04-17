import type { ProductBadgeTone } from "@/lib/types";

const toneClassMap: Record<ProductBadgeTone, string> = {
  slate: "border-slate-200 bg-slate-100 text-slate-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function ProductBadge({
  label,
  tone = "slate",
}: {
  label: string;
  tone?: ProductBadgeTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${toneClassMap[tone]}`}
    >
      {label}
    </span>
  );
}
