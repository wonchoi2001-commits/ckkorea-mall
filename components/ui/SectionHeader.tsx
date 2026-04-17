import Link from "next/link";

export default function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  hrefLabel,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{title}</h2>
        {description ? (
          <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
        ) : null}
      </div>

      {href && hrefLabel ? (
        <Link
          href={href}
          className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-950"
        >
          {hrefLabel}
        </Link>
      ) : null}
    </div>
  );
}
