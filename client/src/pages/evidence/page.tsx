import { EvidencePack } from "@/components/evidence/EvidencePack";
import { useRoute } from "wouter";

export default function EvidencePage() {
  // For demo purposes, we'll just show a specific pack or a list
  // In a real app, this would be a list view or detail view based on ID
  
  return (
    <div className="space-y-6">
      <EvidencePack id="EVD-2024-8821" />
    </div>
  );
}
