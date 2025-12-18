import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { FileJson, FileText, Download, Hash, ShieldCheck, UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

interface EvidencePackProps {
  evidenceId: string;
}

// Database Evidence type from API
interface DbEvidence {
  id: number;
  evidenceId: string;
  decisionId: string;
  actorId: number;
  actorName: string;
  actorRole: string;
  action: "APPROVED" | "REJECTED" | "ESCALATED";
  justification: string;
  policySnapshot: string;
  merkleHash: string;
  ledgerId: string | null;
  createdAt: Date;
}

export function EvidencePack({ evidenceId }: EvidencePackProps) {
  const { data: evidence, isLoading, error } = trpc.evidence.get.useQuery(
    { evidenceId },
    { enabled: !!evidenceId }
  );

  const generatePDF = (evidence: DbEvidence) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("EVIDENCE PACK", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Document ID: ${evidence.evidenceId}`, pageWidth / 2, 28, { align: "center" });
    doc.text(`Generated: ${new Date().toISOString()}`, pageWidth / 2, 34, { align: "center" });
    
    // Divider
    doc.setLineWidth(0.5);
    doc.line(20, 40, pageWidth - 20, 40);
    
    // Chain of Custody Section
    let y = 50;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("CHAIN OF CUSTODY", 20, y);
    
    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Decision ID: ${evidence.decisionId}`, 20, y);
    y += 7;
    doc.text(`Actor: ${evidence.actorName} (${evidence.actorRole})`, 20, y);
    y += 7;
    doc.text(`Action: ${evidence.action}`, 20, y);
    y += 7;
    doc.text(`Timestamp: ${new Date(evidence.createdAt).toUTCString()}`, 20, y);
    y += 7;
    doc.text(`Policy Version: ${evidence.policySnapshot}`, 20, y);
    
    // Justification Section
    y += 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("HUMAN JUSTIFICATION", 20, y);
    
    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    const justificationLines = doc.splitTextToSize(`"${evidence.justification}"`, pageWidth - 40);
    doc.text(justificationLines, 20, y);
    y += justificationLines.length * 5 + 5;
    
    // Cryptographic Proof Section
    y += 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("CRYPTOGRAPHIC PROOF", 20, y);
    
    y += 10;
    doc.setFontSize(8);
    doc.setFont("courier", "normal");
    doc.text(`Merkle Root Hash:`, 20, y);
    y += 5;
    const hashLines = doc.splitTextToSize(evidence.merkleHash, pageWidth - 40);
    doc.text(hashLines, 20, y);
    y += hashLines.length * 4 + 5;
    
    if (evidence.ledgerId) {
      doc.text(`Ledger Reference: ${evidence.ledgerId}`, 20, y);
    }
    
    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("This document is cryptographically sealed and immutable.", pageWidth / 2, pageHeight - 20, { align: "center" });
    doc.text("TuringDynamics Core - System Governance", pageWidth / 2, pageHeight - 15, { align: "center" });
    
    // Save
    doc.save(`${evidence.evidenceId}.pdf`);
    toast.success("PDF Generated", { description: `Saved as ${evidence.evidenceId}.pdf` });
  };

  const downloadJSON = (evidence: DbEvidence) => {
    const jsonData = JSON.stringify(evidence, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${evidence.evidenceId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON Exported", { description: `Saved as ${evidence.evidenceId}.json` });
  };

  const downloadCSV = (evidence: DbEvidence) => {
    const headers = ["Field", "Value"];
    const rows = [
      ["Evidence ID", evidence.evidenceId],
      ["Decision ID", evidence.decisionId],
      ["Actor", `${evidence.actorName} (${evidence.actorRole})`],
      ["Action", evidence.action],
      ["Timestamp", new Date(evidence.createdAt).toISOString()],
      ["Policy Version", evidence.policySnapshot],
      ["Justification", evidence.justification],
      ["Merkle Hash", evidence.merkleHash],
      ["Ledger Reference", evidence.ledgerId || "N/A"],
    ];
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${evidence.evidenceId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV Exported", { description: `Saved as ${evidence.evidenceId}.csv` });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !evidence) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-500">
        <h2 className="text-xl font-bold text-white mb-2">Evidence Pack Not Found</h2>
        <p>The requested evidence ID does not exist.</p>
      </div>
    );
  }

  const actionColors: Record<string, string> = {
    APPROVED: "bg-emerald-900/50 text-emerald-400 border-emerald-800",
    REJECTED: "bg-rose-900/50 text-rose-400 border-rose-800",
    ESCALATED: "bg-amber-900/50 text-amber-400 border-amber-800",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
            Evidence Pack
          </h1>
          <p className="text-zinc-400 text-sm mt-1 font-mono">{evidence.evidenceId}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-zinc-700 text-zinc-300 hover:text-white"
            onClick={() => generatePDF(evidence)}
          >
            <FileText className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-zinc-700 text-zinc-300 hover:text-white"
            onClick={() => downloadJSON(evidence)}
          >
            <FileJson className="mr-2 h-4 w-4" /> JSON
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-zinc-700 text-zinc-300 hover:text-white"
            onClick={() => downloadCSV(evidence)}
          >
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 p-8 space-y-8">
        {/* Chain of Custody */}
        <section>
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">
            Chain of Custody
          </h3>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="text-xs text-zinc-500 mb-1">Actor</div>
              <div className="flex items-center gap-2 text-white font-medium">
                <UserCheck className="h-4 w-4 text-zinc-400" />
                {evidence.actorName} ({evidence.actorRole})
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">Timestamp</div>
              <div className="text-white font-mono">{new Date(evidence.createdAt).toUTCString()}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">Action Taken</div>
              <Badge className={`${actionColors[evidence.action]} hover:opacity-80`}>
                {evidence.action}
              </Badge>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">Policy Version</div>
              <div className="text-white font-mono">{evidence.policySnapshot}</div>
            </div>
          </div>
        </section>

        {/* Justification */}
        <section>
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">
            Human Justification
          </h3>
          <div className="bg-zinc-950/50 p-4 rounded border border-zinc-800 text-zinc-300 italic font-serif">
            "{evidence.justification}"
          </div>
        </section>

        {/* Cryptographic Proof */}
        <section>
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">
            Cryptographic Proof
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-zinc-500 mb-1">Merkle Root Hash</div>
              <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 bg-black p-2 rounded border border-zinc-800 break-all">
                <Hash className="h-3 w-3 shrink-0" />
                {evidence.merkleHash}
              </div>
            </div>
            {evidence.ledgerId && (
              <div>
                <div className="text-xs text-zinc-500 mb-1">Ledger Reference</div>
                <div className="font-mono text-sm text-orange-500">{evidence.ledgerId}</div>
              </div>
            )}
          </div>
        </section>
      </Card>
    </div>
  );
}
