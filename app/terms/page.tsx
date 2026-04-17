import type { Metadata } from "next";
import PolicyDocumentView from "@/components/legal/PolicyDocumentView";
import { createPolicyMetadata, getPolicyDocument } from "@/lib/legal-content";

export const metadata: Metadata = createPolicyMetadata("terms");

export default function TermsPage() {
  return <PolicyDocumentView document={getPolicyDocument("terms")} />;
}
