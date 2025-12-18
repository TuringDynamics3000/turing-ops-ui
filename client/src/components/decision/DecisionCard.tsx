import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Explainer } from "@/components/ui/explainer";
import { EXPLAINER_CONTENT } from "@/lib/explainer-content";
import { DecisionActions } from "./DecisionActions";
import { Shield, Clock, FileText, Activity } from "lucide-react";

// Database Decision type from API
interface DbDecision {
  id: number;
  decisionId: string;
  type: "PAYMENT" | "LIMIT_OVERRIDE" | "AML_EXCEPTION" | "POLICY_CHANGE";
  subject: string;
  policyCode: string;
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  requiredAuthority: "SUPERVISOR" | "COMPLIANCE" | "DUAL";
  status: "PENDING" | "APPROVED" | "REJECTED" | "ESCALATED" | "EXECUTED";
  slaDeadline: Date;
  amount: string | null;
  beneficiary: string | null;
  context: string | null;
  decidedAt: Date | null;
  decidedBy: string | null;
  justification: string | null;
  executionRef: string | null;
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
              <Explainer
                title="Decision Identifier"
                description={`Unique identifier ${decision.decisionId} assigned at decision creation. This ID appears in all Evidence Packs and can be used to query the decision across all system interfaces.`}
                advantages={[
                  "Globally unique across all decision types",
                  "Immutable once assigned - cannot be changed",
                  "Links decision to evidence, execution, and audit trail",
                ]}
                legacyComparison={{
                  legacy: "IDs often system-specific. Same transaction may have different IDs in approval, execution, and audit systems.",
                  turing: "Single ID from creation to evidence. Any system query returns complete decision context.",
                }}
                side="bottom"
                showIcon={false}
              >
                <Badge variant="outline" className="font-mono text-xs border-zinc-700 text-zinc-400 cursor-help">
                  {decision.decisionId}
                </Badge>
              </Explainer>
              <Explainer
                title="Decision Status"
                description={`Current status is ${decision.status}. Status transitions are governed by authority rules and produce evidence at each transition.`}
                advantages={[
                  "Status transitions are atomic and audited",
                  "Each transition produces evidence entry",
                  "Invalid transitions are cryptographically impossible",
                ]}
                legacyComparison={{
                  legacy: "Status often updated directly in databases. Transitions may not be logged or may be logged inconsistently.",
                  turing: "Status is a governed state machine. Every transition is an audited event with cryptographic proof.",
                }}
                side="bottom"
                showIcon={false}
              >
                <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20 cursor-help">
                  {decision.status}
                </Badge>
              </Explainer>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{decision.subject}</h1>
            <div className="flex items-center gap-6 text-sm text-zinc-400">
              <Explainer {...EXPLAINER_CONTENT.policyDefinition} side="bottom" showIcon={false}>
                <div className="flex items-center gap-2 cursor-help">
                  <Shield className="h-4 w-4 text-zinc-500" />
                  <span>Policy: <span className="text-zinc-200 font-mono">{decision.policyCode}</span></span>
                </div>
              </Explainer>
              <Explainer
                title="Decision Creation Timestamp"
                description="Exact time when this decision was created. All context data is frozen at this moment and cannot be modified."
                advantages={[
                  "Microsecond-precision timestamp",
                  "Context snapshot is immutable from this moment",
                  "Timestamp is cryptographically sealed in evidence",
                ]}
                legacyComparison={{
                  legacy: "Creation time often rounded to seconds. Context may be pulled from source systems at approval time, not creation time.",
                  turing: "Precise timestamp with frozen context. Approvers see exactly what the system evaluated at creation.",
                }}
                side="bottom"
                showIcon={false}
              >
                <div className="flex items-center gap-2 cursor-help">
                  <Clock className="h-4 w-4 text-zinc-500" />
                  <span>Created: <span className="text-zinc-200 font-mono">{new Date(decision.createdAt).toLocaleString()}</span></span>
                </div>
              </Explainer>
            </div>
          </div>
          
          <Explainer {...EXPLAINER_CONTENT.slaIndicator} side="left">
            <div className="text-right">
              <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">SLA Remaining</div>
              <div className="text-3xl font-mono font-bold text-white tabular-nums">
                {formatSla(slaSecondsRemaining)}
              </div>
            </div>
          </Explainer>
        </div>

        <div className="grid grid-cols-3 divide-x divide-zinc-800">
          <Explainer {...EXPLAINER_CONTENT.riskProfile} side="right" showIcon={false}>
            <div className="p-6 cursor-help">
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
          </Explainer>

          <Explainer {...EXPLAINER_CONTENT.transactionContext} side="left" showIcon={false}>
            <div className="p-6 col-span-2 cursor-help">
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
          </Explainer>
        </div>
      </Card>

      {/* Action Area */}
      <DecisionActions decision={decision} />
    </div>
  );
}
