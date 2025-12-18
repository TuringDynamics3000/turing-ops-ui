import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DecisionActions } from "./DecisionActions";
import { Shield, Clock, FileText, Activity } from "lucide-react";

// Database Decision type from API
interface DbDecision {
  id: number;
  decisionId: string;
  type: "PAYMENT" | "LIMIT_OVERRIDE" | "AML_EXCEPTION";
  subject: string;
  policyCode: string;
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  requiredAuthority: "SUPERVISOR" | "COMPLIANCE" | "DUAL";
  status: string;
  slaDeadline: Date;
  amount: string | null;
  beneficiary: string | null;
  context: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DecisionCardProps {
  decision: DbDecision;
}

export function DecisionCard({ decision }: DecisionCardProps) {
  // Calculate SLA seconds remaining
  const now = new Date();
  const deadline = new Date(decision.slaDeadline);
  const slaSecondsRemaining = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 1000));

  // Format SLA time
  const formatSla = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header Card */}
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="outline" className="font-mono text-xs border-zinc-700 text-zinc-400">
                {decision.decisionId}
              </Badge>
              <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20">
                {decision.status}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{decision.subject}</h1>
            <div className="flex items-center gap-6 text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-zinc-500" />
                <span>Policy: <span className="text-zinc-200 font-mono">{decision.policyCode}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-500" />
                <span>Created: <span className="text-zinc-200 font-mono">{new Date(decision.createdAt).toLocaleString()}</span></span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">SLA Remaining</div>
            <div className="text-3xl font-mono font-bold text-white tabular-nums">
              {formatSla(slaSecondsRemaining)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-zinc-800">
          <div className="p-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="h-3 w-3" /> Risk Profile
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-zinc-500 mb-1">Risk Level</div>
                <div className="text-lg font-medium text-white">{decision.risk}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 mb-1">Required Authority</div>
                <div className="text-lg font-medium text-white font-mono">{decision.requiredAuthority}</div>
              </div>
            </div>
          </div>

          <div className="p-6 col-span-2">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="h-3 w-3" /> Transaction Details
            </h3>
            <div className="grid grid-cols-2 gap-6">
              {decision.amount && (
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Amount</div>
                  <div className="text-xl font-mono font-bold text-white">{decision.amount}</div>
                </div>
              )}
              {decision.beneficiary && (
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Beneficiary</div>
                  <div className="text-lg text-white">{decision.beneficiary}</div>
                </div>
              )}
              <div className="col-span-2">
                <div className="text-xs text-zinc-500 mb-1">Context</div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {decision.context || `Transaction flagged by rule ${decision.policyCode}. Review required based on policy parameters.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Area */}
      <DecisionActions decision={decision} />
    </div>
  );
}
