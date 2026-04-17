export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <div className="text-lg font-bold text-slate-900">{title}</div>
      <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
