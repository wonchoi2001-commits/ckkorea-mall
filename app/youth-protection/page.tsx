import type { Metadata } from "next";
import PolicyDocumentView from "@/components/legal/PolicyDocumentView";
import { createPolicyMetadata, getPolicyDocument } from "@/lib/legal-content";

export const metadata: Metadata = createPolicyMetadata("youthProtection");

export default function YouthProtectionPage() {
  return <PolicyDocumentView document={getPolicyDocument("youthProtection")} />;
}
