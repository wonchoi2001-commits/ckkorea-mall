import type { Metadata } from "next";
import PolicyDocumentView from "@/components/legal/PolicyDocumentView";
import { createPolicyMetadata, getPolicyDocument } from "@/lib/legal-content";

export const metadata: Metadata = createPolicyMetadata("refundPolicy");

export default function RefundPolicyPage() {
  return <PolicyDocumentView document={getPolicyDocument("refundPolicy")} />;
}
