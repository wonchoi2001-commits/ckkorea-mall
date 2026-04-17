import { handleQuoteRequestPost } from "@/lib/quote-requests";

export async function POST(req: Request) {
  return handleQuoteRequestPost(req);
}
