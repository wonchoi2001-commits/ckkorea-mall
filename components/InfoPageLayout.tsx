import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function InfoPageLayout({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <section className="mx-auto max-w-5xl px-6 pt-10 pb-8">
        <div className="rounded-[32px] bg-slate-900 px-8 py-10 text-white">
          <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
            {eyebrow}
          </div>
          <h1 className="mt-5 text-4xl font-black leading-tight">{title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">{description}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-14">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
          {children}
        </div>
      </section>

      <Footer />
    </main>
  );
}
