import { notFound } from "next/navigation";
import AdminQuoteDetail from "@/components/admin/AdminQuoteDetail";
import { requireAdminUser } from "@/lib/auth";
import { getQuoteRequestRecord } from "@/lib/quotes";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminQuoteDetailPage({ params }: Props) {
  await requireAdminUser();
  const { id } = await params;
  const quote = await getQuoteRequestRecord(id);

  if (!quote) {
    notFound();
  }

  return <AdminQuoteDetail quote={quote} />;
}
