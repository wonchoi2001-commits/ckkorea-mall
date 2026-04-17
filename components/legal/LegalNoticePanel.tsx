import Link from "next/link";

type LegalNoticePanelProps = {
  title: string;
  description: string;
  items: string[];
  links?: Array<{ href: string; label: string }>;
};

export default function LegalNoticePanel({
  title,
  description,
  items,
  links = [],
}: LegalNoticePanelProps) {
  return (
    <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-lg font-black tracking-tight text-slate-950">{title}</div>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {links.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

