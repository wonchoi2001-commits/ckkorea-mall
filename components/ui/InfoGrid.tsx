export type InfoGridItem = {
  label: string;
  value: string;
};

export default function InfoGrid({
  items,
  columns = 2,
}: {
  items: InfoGridItem[];
  columns?: 2 | 3 | 4;
}) {
  const gridClass =
    columns === 4
      ? "lg:grid-cols-4"
      : columns === 3
        ? "lg:grid-cols-3"
        : "lg:grid-cols-2";

  return (
    <div className={`grid gap-3 ${gridClass}`}>
      {items.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            {item.label}
          </div>
          <div className="mt-3 text-sm font-semibold leading-6 text-slate-900">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
