import InfoPageLayout from "@/components/InfoPageLayout";
import type { PolicyDocument } from "@/lib/legal-content";

export default function PolicyDocumentView({
  document,
}: {
  document: PolicyDocument;
}) {
  return (
    <InfoPageLayout
      eyebrow={document.eyebrow}
      title={document.title}
      description={document.description}
    >
      <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
        본 문서는 운영 준비를 위한 정책 초안이며, 실제 적용 전 사업 정보와 운영 방식에
        맞춘 추가 검토가 필요합니다.
      </div>

      <div className="mt-8 space-y-8 text-sm leading-7 text-slate-600">
        {document.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mt-3">
                {paragraph}
              </p>
            ))}
            {section.bullets && section.bullets.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </InfoPageLayout>
  );
}

