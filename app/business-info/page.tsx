import type { Metadata } from "next";
import PolicyDocumentView from "@/components/legal/PolicyDocumentView";
import { createPolicyMetadata, getPolicyDocument } from "@/lib/legal-content";

export const metadata: Metadata = createPolicyMetadata("businessInfo");

export default function BusinessInfoPage() {
  return <PolicyDocumentView document={getPolicyDocument("businessInfo")} />;
}
