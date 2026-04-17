import type { Metadata } from "next";
import PolicyDocumentView from "@/components/legal/PolicyDocumentView";
import { createPolicyMetadata, getPolicyDocument } from "@/lib/legal-content";

export const metadata: Metadata = createPolicyMetadata("disclaimer");

export default function DisclaimerPage() {
  return <PolicyDocumentView document={getPolicyDocument("disclaimer")} />;
}
