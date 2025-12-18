import { EvidencePack } from "@/components/evidence/EvidencePack";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, FileText } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function EvidencePage() {
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  const { data: evidenceList, isLoading } = trpc.evidence.list.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (selectedEvidence) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedEvidence(null)}
          className="text-zinc-400 hover:text-white text-sm flex items-center gap-2"
        >
          ← Back to Evidence List
        </button>
        <EvidencePack evidenceId={selectedEvidence} />
      </div>
    );
  }

  const actionColors: Record<string, string> = {
    APPROVED: "bg-emerald-900/50 text-emerald-400 border-emerald-800",
    REJECTED: "bg-rose-900/50 text-rose-400 border-rose-800",
    ESCALATED: "bg-amber-900/50 text-amber-400 border-amber-800",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-emerald-500" />
          Evidence Packs
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Immutable audit records for all governance decisions.
        </p>
      </div>

      <div className="space-y-3">
        {evidenceList && evidenceList.length > 0 ? (
          evidenceList.map((evidence) => (
            <Card 
              key={evidence.id}
              className="bg-zinc-900/50 border-zinc-800 p-5 hover:border-zinc-600 transition-colors cursor-pointer"
              onClick={() => setSelectedEvidence(evidence.evidenceId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="h-5 w-5 text-zinc-500" />
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-zinc-300">{evidence.evidenceId}</span>
                      <Badge className={`${actionColors[evidence.action]} hover:opacity-80 text-xs`}>
                        {evidence.action}
                      </Badge>
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      Decision: {evidence.decisionId} • {evidence.actorName} • {new Date(evidence.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className="text-zinc-500 text-sm">View →</span>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-zinc-800 rounded-lg bg-zinc-900/20">
            <ShieldCheck className="h-16 w-16 text-zinc-700 mb-4" />
            <h3 className="text-lg font-medium text-zinc-200">No Evidence Packs</h3>
            <p className="text-sm text-zinc-500 mt-2 max-w-sm">
              Evidence packs are generated when decisions are approved, rejected, or escalated.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
