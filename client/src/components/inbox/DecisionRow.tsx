import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Explainer } from "@/components/ui/explainer";
import { EXPLAINER_CONTENT } from "@/lib/explainer-content";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, ArrowRight, Building2 } from "lucide-react";
import type { DbDecision } from "@shared/decision-types";
import { isGroupDecisionType, getDecisionTypeDisplayName } from "@shared/decision-types";

interface DecisionRowProps {
  decision: DbDecision;
  entityLegalName?: string;
}

export function DecisionRow({ decision, entityLegalName }: DecisionRowProps) {
  const isCritical = decision.risk === "CRITICAL" || decision.risk === "HIGH";
  const isGroupDecision = isGroupDecisionType(decision.type);
  
  // Calculate SLA seconds remaining
  const now = new Date();
  const deadline = new Date(decision.slaDeadline);
  const slaSecondsRemaining = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 1000));
  const isSlaRisk = slaSecondsRemaining < 60;

  // Format SLA time
  const formatSla = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Get badge color based on decision type
  const getTypeBadgeClass = (type: string) => {
    if (type === "PAYMENT") return "text-emerald-400 bg-emerald-950/30";
    if (type === "LIMIT_OVERRIDE") return "text-amber-400 bg-amber-950/30";
    if (type === "AML_EXCEPTION") return "text-rose-400 bg-rose-950/30";
    if (type === "POLICY_CHANGE") return "text-purple-400 bg-purple-950/30";
    if (type.startsWith("GROUP_")) return "text-blue-400 bg-blue-950/30";
    return "text-zinc-400 bg-zinc-950/30";
  };

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-200 hover:border-zinc-600 border-zinc-800 bg-zinc-900/50",
      isCritical && "border-l-4 border-l-orange-500",
      isGroupDecision && "border-l-4 border-l-blue-500"
    )}>
      <div className="p-5 flex items-center justify-between gap-6">
        {/* Left: Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Explainer
              title="Decision Type"
              description={`This is a ${getDecisionTypeDisplayName(decision.type)} decision. Each type has specific authority requirements and evidence generation rules defined in the Authority Matrix.`}
              advantages={[
                "Decision types are policy-defined, not hardcoded",
                "Each type maps to specific authority requirements",
                "Type determines evidence pack structure",
              ]}
              legacyComparison={{
                legacy: "Decision types often implicit in workflow names. No formal mapping to authority or evidence requirements.",
                turing: "Decision types are first-class governance concepts with explicit authority and evidence bindings.",
              }}
              side="bottom"
              showIcon={false}
            >
              <Badge variant="outline" className={cn(
                "font-mono text-[10px] tracking-wider uppercase rounded-sm px-1.5 py-0.5 border-zinc-700",
                getTypeBadgeClass(decision.type)
              )}>
                {getDecisionTypeDisplayName(decision.type)}
              </Badge>
            </Explainer>
            
            <span className="text-xs text-zinc-500 font-mono">
              {decision.decisionId}
            </span>

            {/* Entity Badge - Required for Group Inbox per Production Build Pack */}
            {entityLegalName && (
              <Explainer
                title="Entity Context"
                description="Every decision is anchored to a specific legal entity. Group scope never implies entity authority - each entity must be explicitly authorized."
                advantages={[
                  "Decisions always anchored to legal entity",
                  "Entity badge visible in Group Inbox",
                  "Group scope never overrides entity authority",
                ]}
                legacyComparison={{
                  legacy: "Entity context often implicit or derived from user session. Group-level views may obscure entity boundaries.",
                  turing: "Entity is always explicit. Group consolidation is read-only - no bulk actions across entity boundaries.",
                }}
                side="bottom"
                showIcon={false}
              >
                <Badge variant="outline" className="font-mono text-[10px] tracking-wider rounded-sm px-1.5 py-0.5 border-zinc-700 text-cyan-400 bg-cyan-950/30 flex items-center gap-1 cursor-help">
                  <Building2 className="h-3 w-3" />
                  {entityLegalName}
                </Badge>
              </Explainer>
            )}

            {isCritical && (
              <Explainer {...EXPLAINER_CONTENT.riskIndicator} side="bottom" showIcon={false}>
                <div className="flex items-center gap-1 text-orange-500 text-xs font-bold uppercase tracking-wider animate-pulse cursor-help">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Risk: {decision.risk}</span>
                </div>
              </Explainer>
            )}
          </div>

          <h3 className="text-base font-medium text-zinc-100 truncate pr-4">
            {decision.subject}
          </h3>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400 font-mono">
            <Explainer
              title="Policy Reference"
              description={`This decision is governed by policy ${decision.policyCode}. The policy defines risk classification rules, authority requirements, and SLA parameters.`}
              advantages={[
                "Every decision links to its governing policy",
                "Policy version is captured in evidence",
                "Policy changes require POLICY_CHANGE decision",
              ]}
              legacyComparison={{
                legacy: "Decisions often lack explicit policy references. Rules embedded in code or configuration without versioning.",
                turing: "Policy is a first-class reference. Every decision can be traced to the exact policy version that governed it.",
              }}
              side="bottom"
              showIcon={false}
            >
              <span className="cursor-help">Policy: <span className="text-zinc-300">{decision.policyCode}</span></span>
            </Explainer>
            <span className="text-zinc-700">|</span>
            <Explainer {...EXPLAINER_CONTENT.authorityBadge} side="bottom" showIcon={false}>
              <span className="cursor-help">Auth: <span className="text-zinc-300">{decision.requiredAuthority}</span></span>
            </Explainer>
          </div>
        </div>

        {/* Right: SLA & Action */}
        <div className="flex items-center gap-6 shrink-0">
          <Explainer {...EXPLAINER_CONTENT.slaIndicator} side="left" showIcon={false}>
            <div className={cn(
              "flex items-center gap-2 font-mono text-sm tabular-nums cursor-help",
              isSlaRisk ? "text-rose-500 font-bold" : "text-zinc-400"
            )}>
              <Clock className="h-4 w-4" />
              <span>{formatSla(slaSecondsRemaining)}</span>
            </div>
          </Explainer>

          <Link href={`/decisions/${decision.decisionId}`}>
            <Button 
              size="sm" 
              className="bg-zinc-100 text-zinc-900 hover:bg-white font-medium rounded-sm px-4 h-9 transition-transform active:scale-95"
            >
              Review Decision
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
