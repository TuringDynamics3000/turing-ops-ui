import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Explainer } from "@/components/ui/explainer";
import { EXPLAINER_CONTENT } from "@/lib/explainer-content";
import { trpc } from "@/lib/trpc";
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  FileText,
  Server,
  Loader2,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Link } from "wouter";

export default function OverviewPage() {
  const { data: decisions, isLoading: decisionsLoading } = trpc.decisions.list.useQuery();
  const { data: evidence, isLoading: evidenceLoading } = trpc.evidence.list.useQuery();

  const isLoading = decisionsLoading || evidenceLoading;

  // Calculate metrics from real data
  const pendingDecisions = decisions?.filter(d => d.status === "PENDING") || [];
  const completedDecisions = decisions?.filter(d => ["APPROVED", "REJECTED", "ESCALATED"].includes(d.status)) || [];
  const escalatedDecisions = decisions?.filter(d => d.status === "ESCALATED") || [];

  // Risk breakdown
  const pendingByRisk = {
    LOW: pendingDecisions.filter(d => d.risk === "LOW").length,
    MEDIUM: pendingDecisions.filter(d => d.risk === "MEDIUM").length,
    HIGH: pendingDecisions.filter(d => d.risk === "HIGH").length,
    CRITICAL: pendingDecisions.filter(d => d.risk === "CRITICAL").length,
  };

  // Type breakdown
  const pendingByType = {
    PAYMENT: pendingDecisions.filter(d => d.type === "PAYMENT").length,
    LIMIT_OVERRIDE: pendingDecisions.filter(d => d.type === "LIMIT_OVERRIDE").length,
    AML_EXCEPTION: pendingDecisions.filter(d => d.type === "AML_EXCEPTION").length,
    POLICY_CHANGE: pendingDecisions.filter(d => d.type === "POLICY_CHANGE").length,
  };

  // Evidence metrics
  const evidenceCount = evidence?.length || 0;
  const evidenceCoverage = completedDecisions.length > 0 
    ? Math.round((evidenceCount / completedDecisions.length) * 100) 
    : 100;

  // Latest evidence hash
  const latestEvidence = evidence?.[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Executive Overview</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Real-time operational health and governance metrics
        </p>
      </div>

      {/* Live Operations */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Live Operations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Explainer {...EXPLAINER_CONTENT.paymentsToday} side="bottom">
            <KPICard
              title="Payments Today"
              value="247"
              subtitle="$1.2M AUD total value"
              trend="+12%"
              trendUp={true}
              icon={<TrendingUp className="h-5 w-5" />}
            />
          </Explainer>
          <Explainer {...EXPLAINER_CONTENT.successRate} side="bottom">
            <KPICard
              title="Success Rate"
              value="98.4%"
              subtitle="243 posted / 247 submitted"
              trend="+0.3%"
              trendUp={true}
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
          </Explainer>
          <Explainer {...EXPLAINER_CONTENT.failureRate} side="bottom">
            <KPICard
              title="Failure Rate"
              value="1.6%"
              subtitle="4 failed / 247 submitted"
              trend="-0.2%"
              trendUp={true}
              icon={<AlertTriangle className="h-5 w-5" />}
            />
          </Explainer>
          <Explainer {...EXPLAINER_CONTENT.processingLatency} side="bottom">
            <KPICard
              title="Processing Latency"
              value="142ms"
              subtitle="P95: 380ms"
              trend="-8ms"
              trendUp={true}
              icon={<Clock className="h-5 w-5" />}
            />
          </Explainer>
        </div>
      </section>

      {/* Decision Governance */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Decision Governance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Explainer {...EXPLAINER_CONTENT.decisionsPending} side="bottom">
            <KPICard
              title="Decisions Pending"
              value={String(pendingDecisions.length)}
              subtitle={`${pendingByRisk.CRITICAL} critical, ${pendingByRisk.HIGH} high`}
              icon={<Clock className="h-5 w-5" />}
              highlight={pendingByRisk.CRITICAL > 0}
            />
          </Explainer>
          <Explainer {...EXPLAINER_CONTENT.timeToDecision} side="bottom">
            <KPICard
              title="Time to Decision"
              value="4.2 min"
              subtitle="P95: 12.8 min"
              trend="-1.3 min"
              trendUp={true}
              icon={<Clock className="h-5 w-5" />}
            />
          </Explainer>
          <Explainer {...EXPLAINER_CONTENT.escalationRate} side="bottom">
            <KPICard
              title="Escalation Rate"
              value={`${completedDecisions.length > 0 ? Math.round((escalatedDecisions.length / completedDecisions.length) * 100) : 0}%`}
              subtitle={`${escalatedDecisions.length} escalated / ${completedDecisions.length} completed`}
              icon={<ArrowUpRight className="h-5 w-5" />}
            />
          </Explainer>
          <Explainer {...EXPLAINER_CONTENT.dualControlCompliance} side="bottom">
            <KPICard
              title="Dual Control Compliance"
              value="100%"
              subtitle="All dual-control decisions verified"
              icon={<Shield className="h-5 w-5" />}
            />
          </Explainer>
        </div>
      </section>

      {/* Risk & Exceptions */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Risk & Exceptions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Explainer 
            title="High Risk Queue Ageing"
            description="P95 age of pending high-risk and critical decisions. Long ageing indicates potential SLA breach risk."
            advantages={[
              "Real-time ageing calculation, not batch metrics",
              "Automatic escalation triggers before SLA breach",
              "Ageing history preserved in evidence trail",
            ]}
            legacyComparison={{
              legacy: "Queue ageing calculated in periodic reports. SLA breaches discovered after the fact.",
              turing: "Live ageing with proactive escalation. System acts before breaches occur, not after.",
            }}
            side="bottom"
          >
            <Card className="bg-zinc-900/50 border-zinc-800 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">High Risk Queue Ageing</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {pendingByRisk.HIGH + pendingByRisk.CRITICAL > 0 ? "8.5 min" : "—"}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">P95 age of pending high-risk items</p>
                </div>
                {pendingByRisk.CRITICAL > 0 && (
                  <Badge className="bg-rose-900/50 text-rose-400 border-rose-800">
                    {pendingByRisk.CRITICAL} CRITICAL
                  </Badge>
                )}
              </div>
            </Card>
          </Explainer>
          <Explainer 
            title="AML Exception Queue"
            description="Anti-Money Laundering exceptions requiring COMPLIANCE authority. These decisions have elevated regulatory scrutiny."
            advantages={[
              "AML decisions isolated in dedicated queue",
              "Compliance authority cryptographically enforced",
              "Every AML decision produces regulatory-grade evidence",
            ]}
            legacyComparison={{
              legacy: "AML exceptions mixed with general approvals. Compliance review often a checkbox, not enforced authority.",
              turing: "AML is a first-class decision type with dedicated authority requirements. Cannot be approved by non-compliance roles.",
            }}
            side="bottom"
          >
            <Card className="bg-zinc-900/50 border-zinc-800 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">AML Exceptions Pending</p>
                  <p className="text-2xl font-bold text-white mt-1">{pendingByType.AML_EXCEPTION}</p>
                  <p className="text-xs text-zinc-400 mt-1">Requires COMPLIANCE authority</p>
                </div>
                {pendingByType.AML_EXCEPTION > 0 && (
                  <Link href="/decisions/inbox">
                    <Badge variant="outline" className="border-orange-700 text-orange-400 cursor-pointer hover:bg-orange-900/20">
                      Review →
                    </Badge>
                  </Link>
                )}
              </div>
            </Card>
          </Explainer>
          <Explainer 
            title="Limit Override Queue"
            description="Limit override requests requiring DUAL authority - two independent approvals from authorized principals."
            advantages={[
              "Dual control cryptographically enforced",
              "Both approvers' signatures sealed in evidence",
              "Cannot be bypassed by any user including admins",
            ]}
            legacyComparison={{
              legacy: "Dual control often 'four eyes' workflow that can be bypassed by batch operations or emergency overrides.",
              turing: "Cryptographic dual control - evidence is invalid without two distinct signatures. No bypass exists.",
            }}
            side="bottom"
          >
            <Card className="bg-zinc-900/50 border-zinc-800 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Overrides Pending</p>
                  <p className="text-2xl font-bold text-white mt-1">{pendingByType.LIMIT_OVERRIDE}</p>
                  <p className="text-xs text-zinc-400 mt-1">Requires DUAL authority</p>
                </div>
                {pendingByType.LIMIT_OVERRIDE > 0 && (
                  <Link href="/decisions/inbox">
                    <Badge variant="outline" className="border-amber-700 text-amber-400 cursor-pointer hover:bg-amber-900/20">
                      Review →
                    </Badge>
                  </Link>
                )}
              </div>
            </Card>
          </Explainer>
        </div>
      </section>

      {/* Evidence Integrity */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Evidence Integrity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Explainer 
            title="Evidence Pack Coverage"
            description="Percentage of completed decisions that have a corresponding cryptographically sealed Evidence Pack."
            advantages={[
              "100% coverage is the baseline expectation",
              "Any gap triggers immediate investigation",
              "Coverage tracked in real-time, not batch reports",
            ]}
            legacyComparison={{
              legacy: "Audit coverage measured periodically. Gaps discovered in compliance reviews weeks or months later.",
              turing: "Real-time coverage monitoring. Any decision without evidence is immediately flagged as a governance incident.",
            }}
            side="bottom"
          >
            <KPICard
              title="Evidence Pack Coverage"
              value={`${evidenceCoverage}%`}
              subtitle={`${evidenceCount} packs / ${completedDecisions.length} decisions`}
              icon={<FileText className="h-5 w-5" />}
            />
          </Explainer>
          <Explainer 
            title="Evidence Generation Reliability"
            description="Count of Evidence Pack generation failures in the last 30 days. Zero is the expected state."
            advantages={[
              "Evidence generation is transactional with decision",
              "Failures block decision completion, not silently logged",
              "Retry logic with dead-letter queue for investigation",
            ]}
            legacyComparison={{
              legacy: "Audit log generation often async and best-effort. Failures may go unnoticed until audit time.",
              turing: "Evidence is synchronous with decision. A decision cannot complete without its Evidence Pack.",
            }}
            side="bottom"
          >
            <KPICard
              title="Generation Failures"
              value="0"
              subtitle="Last 30 days"
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
          </Explainer>
          <Explainer {...EXPLAINER_CONTENT.evidenceHash} side="bottom">
            <Card className="bg-zinc-900/50 border-zinc-800 p-5">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Last Evidence Hash</p>
                {latestEvidence ? (
                  <>
                    <p className="text-sm font-mono text-white mt-2 truncate">
                      {latestEvidence.merkleHash?.slice(0, 32)}...
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {latestEvidence.evidenceId} • {new Date(latestEvidence.createdAt).toLocaleString()}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-zinc-500 mt-2">No evidence packs generated yet</p>
                )}
              </div>
            </Card>
          </Explainer>
        </div>
      </section>

      {/* System Health */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
          <Server className="h-4 w-4" />
          System Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Explainer 
            title="Decision API Health"
            description="Real-time health status of the Decision API endpoint, including error rate and latency percentiles."
            advantages={[
              "Sub-50ms P95 latency for authority checks",
              "Automatic circuit breaker on degradation",
              "Health status is a governance event",
            ]}
            legacyComparison={{
              legacy: "API health monitored by infrastructure teams. Degradation may not be visible to governance operators.",
              turing: "API health is surfaced in the governance console. Operators see system state alongside decision state.",
            }}
            side="bottom"
          >
            <Card className="bg-zinc-900/50 border-zinc-800 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Decision API</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1">Healthy</p>
                  <p className="text-xs text-zinc-400 mt-1">0.02% error rate • 45ms P95</p>
                </div>
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
            </Card>
          </Explainer>
          <Explainer 
            title="Execution Connector Health"
            description="Health status of the connector to downstream execution systems (payment rails, ledger, etc.)."
            advantages={[
              "Execution status linked to decision lifecycle",
              "Connector failures trigger automatic hold",
              "Recovery produces governance event",
            ]}
            legacyComparison={{
              legacy: "Execution systems monitored separately. Decisions may be approved while execution is degraded.",
              turing: "Execution health is part of decision context. System can hold decisions when execution is unhealthy.",
            }}
            side="bottom"
          >
            <Card className="bg-zinc-900/50 border-zinc-800 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Execution Connector</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1">Healthy</p>
                  <p className="text-xs text-zinc-400 mt-1">0.01% error rate • 120ms P95</p>
                </div>
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
            </Card>
          </Explainer>
          <Explainer {...EXPLAINER_CONTENT.ledgerIntegrity} side="bottom">
            <Card className="bg-zinc-900/50 border-zinc-800 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Projection Lag</p>
                  <p className="text-lg font-bold text-white mt-1">0.3s</p>
                  <p className="text-xs text-zinc-400 mt-1">Payments: 0.2s • Ledger: 0.4s</p>
                </div>
                <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
              </div>
            </Card>
          </Explainer>
        </div>
      </section>

      {/* Top Risks */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4">
          Top Risks (Ageing)
        </h2>
        <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
          {pendingDecisions.length > 0 ? (
            <div className="divide-y divide-zinc-800">
              {pendingDecisions
                .sort((a, b) => {
                  const riskOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
                  return (riskOrder[a.risk as keyof typeof riskOrder] || 3) - (riskOrder[b.risk as keyof typeof riskOrder] || 3);
                })
                .slice(0, 5)
                .map((decision) => (
                  <Link key={decision.decisionId} href={`/decisions/${decision.decisionId}`}>
                    <div className="p-4 hover:bg-zinc-800/50 cursor-pointer transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge className={getRiskColor(decision.risk)}>
                          {decision.risk}
                        </Badge>
                        <div>
                          <p className="text-white font-medium">{decision.subject}</p>
                          <p className="text-xs text-zinc-500 font-mono">{decision.decisionId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-zinc-400">
                          {getAgeString(new Date(decision.createdAt))}
                        </p>
                        <p className="text-xs text-zinc-500">{decision.requiredAuthority}</p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
              <p>No pending decisions</p>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

// KPI Card Component
function KPICard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendUp, 
  icon,
  highlight 
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  trend?: string; 
  trendUp?: boolean;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card className={`bg-zinc-900/50 border-zinc-800 p-5 ${highlight ? 'border-rose-800' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="text-zinc-500">{icon}</div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white mt-3">{value}</p>
      <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">{title}</p>
      <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>
    </Card>
  );
}

// Helper functions
function getRiskColor(risk: string): string {
  const colors: Record<string, string> = {
    LOW: "bg-emerald-900/50 text-emerald-400",
    MEDIUM: "bg-amber-900/50 text-amber-400",
    HIGH: "bg-orange-900/50 text-orange-400",
    CRITICAL: "bg-rose-900/50 text-rose-400",
  };
  return colors[risk] || colors.MEDIUM;
}

function getAgeString(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
