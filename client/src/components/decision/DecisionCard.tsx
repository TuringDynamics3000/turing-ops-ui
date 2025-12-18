import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Explainer } from "@/components/ui/explainer";
import { EXPLAINER_CONTENT } from "@/lib/explainer-content";
import { DecisionActions } from "./DecisionActions";
import { Shield, Clock, FileText, Activity, Building2, Users } from "lucide-react";
import type { DbDecision } from "@shared/decision-types";
import { isGroupDecisionType, getDecisionTypeDisplayName } from "@shared/decision-types";

interface DecisionCardProps {
  decision: DbDecision;
  entityLegalName?: string;
  groupName?: string;
}

export function DecisionCard({ decision, entityLegalName, groupName }: DecisionCardProps) {
  // Calculate SLA seconds remaining
  const now = new Date();
  const deadline = new Date(decision.slaDeadline);
  const slaSecondsRemaining = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 1000));
  const isGroupDecision = isGroupDecisionType(decision.type);

  // Format SLA time
  const formatSla = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Parse group context if present
  const groupContext = decision.groupContext ? JSON.parse(decision.groupContext) : null;

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
              
              {/* Decision Type Badge */}
              <Badge variant="outline" className={`font-mono text-xs border-zinc-700 ${isGroupDecision ? 'text-blue-400 bg-blue-950/30' : 'text-zinc-400'}`}>
                {getDecisionTypeDisplayName(decision.type)}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{decision.subject}</h1>
            <div className="flex items-center gap-6 text-sm text-zinc-400">
              <Explainer {...EXPLAINER_CONTENT.policyDefinition} side="bottom" showIcon={false}>
                <div className="flex items-center gap-2 cursor-help">
                  <Shield className="h-4 w-4 text-zinc-500" />
                  <span>Policy: <span className="text-zinc-200 font-mono">{decision.policyCode}</span></span>
                </div>
              </Explainer>
              
              {/* Entity Context - Always show if available */}
              {entityLegalName && (
                <Explainer
                  title="Entity Context"
                  description="This decision is anchored to a specific legal entity. Entity authority is required for approval - group scope never implies entity authority."
                  advantages={[
                    "Decisions always anchored to legal entity",
                    "Entity authority required for approval",
                    "Group scope is informational only",
                  ]}
                  legacyComparison={{
                    legacy: "Entity context often implicit. Group-level approvals may bypass entity-level controls.",
                    turing: "Entity is always explicit. Group consolidation never grants entity authority.",
                  }}
                  side="bottom"
                  showIcon={false}
                >
                  <div className="flex items-center gap-2 cursor-help">
                    <Building2 className="h-4 w-4 text-cyan-500" />
                    <span>Entity: <span className="text-cyan-300 font-mono">{entityLegalName}</span></span>
                  </div>
                </Explainer>
              )}
              
              {/* Group Context - Show if this is a group-scoped decision */}
              {groupName && (
                <Explainer
                  title="Group Context"
                  description="This decision is being viewed in a group context. Group scope provides consolidated visibility but does not grant entity authority."
                  advantages={[
                    "Group context is informational only",
                    "No bulk actions across entity boundaries",
                    "Each entity decision requires entity authority",
                  ]}
                  legacyComparison={{
                    legacy: "Group views may enable bulk operations across entities without explicit per-entity authorization.",
                    turing: "Group consolidation is read-only. Every action requires explicit entity-level authority.",
                  }}
                  side="bottom"
                  showIcon={false}
                >
                  <div className="flex items-center gap-2 cursor-help">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>Group: <span className="text-blue-300 font-mono">{groupName}</span></span>
                  </div>
                </Explainer>
              )}
              
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
                <FileText className="h-3 w-3" /> {isGroupDecision ? 'Group Operation Details' : 'Transaction Details'}
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {/* Standard transaction fields */}
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
                
                {/* Group-specific context fields */}
                {isGroupDecision && groupContext && (
                  <>
                    {groupContext.name && (
                      <div>
                        <div className="text-xs text-zinc-500 mb-1">Group Name</div>
                        <div className="text-lg text-white font-mono">{groupContext.name}</div>
                      </div>
                    )}
                    {groupContext.targetEntityLegalName && (
                      <div>
                        <div className="text-xs text-zinc-500 mb-1">Target Entity</div>
                        <div className="text-lg text-white">{groupContext.targetEntityLegalName}</div>
                      </div>
                    )}
                    {groupContext.targetUserName && (
                      <div>
                        <div className="text-xs text-zinc-500 mb-1">Target User</div>
                        <div className="text-lg text-white">{groupContext.targetUserName}</div>
                      </div>
                    )}
                    {groupContext.targetRole && (
                      <div>
                        <div className="text-xs text-zinc-500 mb-1">Target Role</div>
                        <div className="text-lg text-white font-mono">{groupContext.targetRole}</div>
                      </div>
                    )}
                  </>
                )}
                
                <div className="col-span-2">
                  <div className="text-xs text-zinc-500 mb-1">Context</div>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {decision.context || groupContext?.reason || `Transaction flagged by rule ${decision.policyCode}. Review required based on policy parameters.`}
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
