import type { QuoteRequestRecord, QuoteRequestStatus } from "@/lib/types";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export function isMissingQuoteRequestsTableError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "42P01"
  );
}

export async function getQuoteRequestRecords() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("quote_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as QuoteRequestRecord[];
}

export async function getQuoteRequestRecord(id: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("quote_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as QuoteRequestRecord | null) ?? null;
}
