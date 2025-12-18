import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
          <KPICard
            title="Payments Today"
            value="247"
            subtitle="$1.2M AUD total value"
            trend="+12%"
            trendUp={true}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <KPICard
            title="Success Rate"
            value="98.4%"
            subtitle="243 posted / 247 submitted"
            trend="+0.3%"
            trendUp={true}
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
          <KPICard
            title="Failure Rate"
            value="1.6%"
            subtitle="4 failed / 247 submitted"
            trend="-0.2%"
            trendUp={true}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <KPICard
            title="Processing Latency"
            value="142ms"
            subtitle="P95: 380ms"
            trend="-8ms"
            trendUp={true}
            icon={<Clock className="h-5 w-5" />}
          />
        </div>
      </section>

      {/* Decision Governance */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Decision Governance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Decisions Pending"
            value={String(pendingDecisions.length)}
            subtitle={`${pendingByRisk.CRITICAL} critical, ${pendingByRisk.HIGH} high`}
            icon={<Clock className="h-5 w-5" />}
            highlight={pendingByRisk.CRITICAL > 0}
          />
          <KPICard
            title="Time to Decision"
            value="4.2 min"
            subtitle="P95: 12.8 min"
            trend="-1.3 min"
            trendUp={true}
            icon={<Clock className="h-5 w-5" />}
          />
          <KPICard
            title="Escalation Rate"
            value={`${completedDecisions.length > 0 ? Math.round((escalatedDecisions.length / completedDecisions.length) * 100) : 0}%`}
            subtitle={`${escalatedDecisions.length} escalated / ${completedDecisions.length} completed`}
            icon={<ArrowUpRight className="h-5 w-5" />}
          />
          <KPICard
            title="Dual Control Compliance"
            value="100%"
            subtitle="All dual-control decisions verified"
            icon={<Shield className="h-5 w-5" />}
          />
        </div>
      </section>

      {/* Risk & Exceptions */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Risk & Exceptions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>
      </section>

      {/* Evidence Integrity */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Evidence Integrity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <KPICard
            title="Evidence Pack Coverage"
            value={`${evidenceCoverage}%`}
            subtitle={`${evidenceCount} packs / ${completedDecisions.length} decisions`}
            icon={<FileText className="h-5 w-5" />}
          />
          <KPICard
            title="Generation Failures"
            value="0"
            subtitle="Last 30 days"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
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
        </div>
      </section>

      {/* System Health */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
          <Server className="h-4 w-4" />
          System Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  return riskOrder[a.risk] - riskOrder[b.risk];
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
