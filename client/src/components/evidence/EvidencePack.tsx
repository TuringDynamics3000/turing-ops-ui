import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileJson, FileText, Download, Hash, ShieldCheck, UserCheck } from "lucide-react";

interface EvidencePackProps {
  id: string;
}

export function EvidencePack({ id }: EvidencePackProps) {
  // Mock evidence data
  const evidence = {
    id: id,
    decisionId: "DEC-2024-001",
    timestamp: "2024-12-19T14:30:00Z",
    actor: "Alex Chen (SUPERVISOR)",
    action: "APPROVED",
    justification: "Beneficiary verified via secondary channel. Transaction pattern consistent with Q4 projections.",
    policySnapshot: "PAY-004 v2.1",
    hash: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    ledgerId: "TXN-9982-X",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
            Evidence Pack
          </h1>
          <p className="text-zinc-400 text-sm mt-1 font-mono">{evidence.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:text-white">
            <FileText className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:text-white">
            <FileJson className="mr-2 h-4 w-4" /> JSON
          </Button>
          <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:text-white">
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
                {evidence.actor}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">Timestamp</div>
              <div className="text-white font-mono">{new Date(evidence.timestamp).toUTCString()}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">Action Taken</div>
              <Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-800 hover:bg-emerald-900/50">
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
                {evidence.hash}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">Ledger Reference</div>
              <div className="font-mono text-sm text-orange-500">{evidence.ledgerId}</div>
            </div>
          </div>
        </section>
      </Card>
    </div>
  );
}
