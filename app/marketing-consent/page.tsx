import type { Metadata } from "next";
import PolicyDocumentView from "@/components/legal/PolicyDocumentView";
import { createPolicyMetadata, getPolicyDocument } from "@/lib/legal-content";

export const metadata: Metadata = createPolicyMetadata("marketingConsent");

export default function MarketingConsentPage() {
  return <PolicyDocumentView document={getPolicyDocument("marketingConsent")} />;
}
