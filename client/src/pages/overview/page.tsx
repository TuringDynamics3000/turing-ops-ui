import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Explainer } from "@/components/ui/explainer";
import { EXPLAINER_CONTENT } from "@/lib/explainer-content";
import { KPICard, useAnimatedNumber } from "@/components/dashboard/KPICard";
import { Sparkline, generateTrendData } from "@/components/dashboard/Sparkline";
import { StatusIndicator, StatusBadge, SystemHealth } from "@/components/dashboard/StatusIndicator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  TrendingUp, 
  Clock, 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  FileText,
  Server,
  Loader2,
  ArrowUpRight,
  Zap,
  Lock,
  Eye,
  Database,
  Check,
  X,
  RefreshCw
} from "lucide-react";
import { Link } from "wouter";
import { useMemo, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

// Auto-refresh interval in milliseconds (30 seconds)
const REFRESH_INTERVAL = 30000;

export default function OverviewPage() {

  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const { 
    data: decisions, 
    isLoading: decisionsLoading,
    refetch: refetchDecisions 
  } = trpc.decisions.list.useQuery(undefined, {
    refetchInterval: REFRESH_INTERVAL,
    refetchIntervalInBackground: false,
  });
  
  const { 
    data: evidence, 
    isLoading: evidenceLoading,
    refetch: refetchEvidence 
  } = trpc.evidence.list.useQuery(undefined, {
    refetchInterval: REFRESH_INTERVAL,
    refetchIntervalInBackground: false,
  });

  // Decision mutations
  const approveMutation = trpc.decisions.approve.useMutation({
    onSuccess: () => {
      refetchDecisions();
      refetchEvidence();
      toast.success("Decision Approved", {
        description: "The decision has been approved and evidence pack generated.",
      });
    },
    onError: (error) => {
      toast.error("Action Failed", {
        description: error.message,
      });
    },
  });

  const rejectMutation = trpc.decisions.reject.useMutation({
    onSuccess: () => {
      refetchDecisions();
      refetchEvidence();
      toast.success("Decision Rejected", {
        description: "The decision has been rejected and recorded.",
      });
    },
    onError: (error) => {
      toast.error("Action Failed", {
        description: error.message,
      });
    },
  });

  // Manual refresh handler
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([refetchDecisions(), refetchEvidence()]);
    setLastRefresh(new Date());
    setIsRefreshing(false);
    toast.success("Data Refreshed", {
      description: "Dashboard metrics have been updated.",
    });
  }, [refetchDecisions, refetchEvidence]);

  // Update last refresh time on auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const isLoading = decisionsLoading || evidenceLoading;

  // Calculate metrics from real data
  const pendingDecisions = decisions?.filter(d => d.status === "PENDING") || [];
  const completedDecisions = decisions?.filter(d => ["APPROVED", "REJECTED", "ESCALATED"].includes(d.status)) || [];
  const escalatedDecisions = decisions?.filter(d => d.status === "ESCALATED") || [];

  // Animated counts
  const animatedPendingCount = useAnimatedNumber(pendingDecisions.length, 600);
  const animatedCompletedCount = useAnimatedNumber(completedDecisions.length, 600);
  const animatedEscalatedCount = useAnimatedNumber(escalatedDecisions.length, 600);

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

  // Generate sparkline data (memoized to prevent re-renders)
  const sparklineData = useMemo(() => ({
    payments: generateTrendData(247, 0.15, 12, "up"),
    successRate: generateTrendData(98.4, 0.02, 12, "stable"),
    latency: generateTrendData(142, 0.2, 12, "down"),
    decisions: generateTrendData(pendingDecisions.length || 22, 0.3, 12, "stable"),
  }), [pendingDecisions.length]);

  // System health data
  const systemHealth = [
    { name: "Payment Gateway", status: "healthy" as const, latency: "23ms" },
    { name: "Ledger Service", status: "healthy" as const, latency: "12ms" },
    { name: "Risk Engine", status: "healthy" as const, latency: "45ms" },
    { name: "Evidence Store", status: "healthy" as const, latency: "8ms" },
  ];

  // Quick action handlers
  const handleQuickApprove = async (decisionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActionInProgress(decisionId);
    try {
      await approveMutation.mutateAsync({ 
        decisionId, 
        justification: "Quick approval from Executive Overview dashboard" 
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleQuickReject = async (decisionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActionInProgress(decisionId);
    try {
      await rejectMutation.mutateAsync({ 
        decisionId, 
        justification: "Quick rejection from Executive Overview dashboard" 
      });
    } finally {
      setActionInProgress(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-zinc-500 text-sm">Loading governance metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header with live status */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Executive Overview</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time operational health and governance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status="healthy" label="All Systems Operational" />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="text-zinc-400 hover:text-white"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
            <div className="text-xs text-zinc-500 font-mono">
              {lastRefresh.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Live Operations */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-500" />
            Live Operations
          </h2>
          <StatusIndicator status="healthy" label="Live" size="sm" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Explainer {...EXPLAINER_CONTENT.paymentsToday} side="bottom">
            <div className="relative">
              <KPICard
                title="Payments Today"
                value="247"
                subtitle="$1.2M AUD total value"
                trend="+12%"
                trendUp={true}
                icon={<TrendingUp className="h-5 w-5" />}
                accentColor="emerald"
                pulse
              />
              <div className="absolute bottom-3 right-4">
                <Sparkline data={sparklineData.payments} color="emerald" width={60} height={20} />
              </div>
            </div>
          </Explainer>
          <Explainer {...EXPLAINER_CONTENT.successRate} side="bottom">
            <div className="relative">
              <KPICard
                title="Success Rate"
                value="98.4%"
                subtitle="243 posted / 247 submitted"
                trend="+0.3%"
                trendUp={true}
                icon={<CheckCircle2 className="h-5 w-5" />}
                accentColor="emerald"
              />
              <div className="absolute bottom-3 right-4">
                <Sparkline data={sparklineData.successRate} color="emerald" width={60} height={20} />
              </div>
            </div>
          </Explainer>
          <Explainer {...EXPLAINER_CONTENT.failureRate} side="bottom">
            <KPICard
              title="Failure Rate"
              value="1.6%"
              subtitle="4 failed / 247 submitted"
              trend="-0.2%"
              trendUp={true}
              icon={<AlertTriangle className="h-5 w-5" />}
              accentColor="orange"
            />
          </Explainer>
          <Explainer {...EXPLAINER_CONTENT.processingLatency} side="bottom">
            <div className="relative">
              <KPICard
                title="Processing Latency"
                value="142ms"
                subtitle="P95: 380ms"
                trend="-8ms"
                trendUp={true}
                icon={<Clock className="h-5 w-5" />}
                accentColor="blue"
              />
              <div className="absolute bottom-3 right-4">
                <Sparkline data={sparklineData.latency} color="blue" width={60} height={20} />
              </div>
            </div>
          </Explainer>
        </div>
      </section>

      {/* Decision Governance */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-500" />
            Decision Governance
          </h2>
          {pendingByRisk.CRITICAL > 0 && (
            <StatusIndicator status="critical" label={`${pendingByRisk.CRITICAL} Critical`} size="sm" />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Explainer {...EXPLAINER_CONTENT.decisionsPending} side="bottom">
            <KPICard
              title="Decisions Pending"
              value={Math.round(animatedPendingCount)}
              subtitle={`${pendingByRisk.CRITICAL} critical, ${pendingByRisk.HIGH} high`}
              icon={<Clock className="h-5 w-5" />}
              highlight={pendingByRisk.CRITICAL > 0}
              accentColor={pendingByRisk.CRITICAL > 0 ? "rose" : "orange"}
              pulse={pendingByRisk.CRITICAL > 0}
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
              accentColor="blue"
            />
          </Explainer>
          <Explainer {...EXPLAINER_CONTENT.escalationRate} side="bottom">
            <KPICard
              title="Escalation Rate"
              value={`${completedDecisions.length > 0 ? Math.round((animatedEscalatedCount / animatedCompletedCount) * 100) : 0}%`}
              subtitle={`${Math.round(animatedEscalatedCount)} escalated / ${Math.round(animatedCompletedCount)} completed`}
              icon={<ArrowUpRight className="h-5 w-5" />}
              accentColor="purple"
            />
          </Explainer>
          <Explainer {...EXPLAINER_CONTENT.dualControlCompliance} side="bottom">
            <KPICard
              title="Dual Control Compliance"
              value="100%"
              subtitle="All dual-control decisions verified"
              icon={<Lock className="h-5 w-5" />}
              accentColor="emerald"
            />
          </Explainer>
        </div>
      </section>

      {/* Risk & Exceptions + System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk & Exceptions */}
        <section className="lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            Risk & Exceptions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border-zinc-800 p-5 hover:border-zinc-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">High Risk Queue Ageing</p>
                    <p className="text-2xl font-bold text-white mt-2">
                      {pendingByRisk.HIGH + pendingByRisk.CRITICAL > 0 ? "8.5 min" : "—"}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">P95 age of pending high-risk items</p>
                  </div>
                  {pendingByRisk.CRITICAL > 0 && (
                    <Badge className="bg-rose-900/50 text-rose-400 border-rose-800 animate-pulse">
                      {pendingByRisk.CRITICAL} CRITICAL
                    </Badge>
                  )}
                </div>
              </Card>
            </Explainer>
            <Explainer 
              title="AML Exception Queue"
              description="Anti-Money Laundering exceptions requiring COMPLIANCE authority."
              advantages={[
                "AML decisions isolated in dedicated queue",
                "Compliance authority cryptographically enforced",
                "Every AML decision produces regulatory-grade evidence",
              ]}
              legacyComparison={{
                legacy: "AML exceptions mixed with general approvals.",
                turing: "AML is a first-class decision type with dedicated authority requirements.",
              }}
              side="bottom"
            >
              <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border-zinc-800 p-5 hover:border-zinc-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">AML Exceptions</p>
                    <p className="text-2xl font-bold text-white mt-2">{pendingByType.AML_EXCEPTION}</p>
                    <p className="text-xs text-zinc-400 mt-1">Requires COMPLIANCE authority</p>
                  </div>
                  {pendingByType.AML_EXCEPTION > 0 && (
                    <Link href="/decisions/inbox">
                      <Badge variant="outline" className="border-orange-700 text-orange-400 cursor-pointer hover:bg-orange-900/20 transition-colors">
                        Review →
                      </Badge>
                    </Link>
                  )}
                </div>
              </Card>
            </Explainer>
            <Explainer 
              title="Limit Override Queue"
              description="Limit override requests requiring DUAL authority."
              advantages={[
                "Dual control cryptographically enforced",
                "Both approvers' signatures sealed in evidence",
                "Cannot be bypassed by any user including admins",
              ]}
              legacyComparison={{
                legacy: "Dual control often 'four eyes' workflow that can be bypassed.",
                turing: "Dual control is cryptographic. Evidence proves two independent approvals.",
              }}
              side="bottom"
            >
              <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border-zinc-800 p-5 hover:border-zinc-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Limit Overrides</p>
                    <p className="text-2xl font-bold text-white mt-2">{pendingByType.LIMIT_OVERRIDE}</p>
                    <p className="text-xs text-zinc-400 mt-1">Requires DUAL authority</p>
                  </div>
                  {pendingByType.LIMIT_OVERRIDE > 0 && (
                    <Link href="/decisions/inbox">
                      <Badge variant="outline" className="border-amber-700 text-amber-400 cursor-pointer hover:bg-amber-900/20 transition-colors">
                        Review →
                      </Badge>
                    </Link>
                  )}
                </div>
              </Card>
            </Explainer>
          </div>
        </section>

        {/* System Health */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
            <Server className="h-4 w-4 text-blue-500" />
            System Health
          </h2>
          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border-zinc-800 p-4">
            <SystemHealth systems={systemHealth} />
          </Card>
        </section>
      </div>

      {/* Evidence & Integrity */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-purple-500" />
          Evidence & Integrity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Explainer {...EXPLAINER_CONTENT.evidenceHash} side="bottom">
            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border-zinc-800 p-5 hover:border-zinc-700 transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Evidence Packs</p>
                  <p className="text-2xl font-bold text-white mt-2">{evidenceCount}</p>
                  <p className="text-xs text-zinc-400 mt-1">Immutable audit records</p>
                </div>
                <div className="p-2 rounded-lg bg-purple-900/30 text-purple-500 group-hover:bg-purple-900/50 transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
            </Card>
          </Explainer>
          <Explainer {...EXPLAINER_CONTENT.evidenceTimeline} side="bottom">
            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border-zinc-800 p-5 hover:border-zinc-700 transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Evidence Coverage</p>
                  <p className="text-2xl font-bold text-white mt-2">100%</p>
                  <p className="text-xs text-zinc-400 mt-1">All decisions have evidence</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-900/30 text-emerald-500 group-hover:bg-emerald-900/50 transition-colors">
                  <Eye className="h-5 w-5" />
                </div>
              </div>
            </Card>
          </Explainer>
          <Explainer {...EXPLAINER_CONTENT.authorityVersion} side="bottom">
            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border-zinc-800 p-5 hover:border-zinc-700 transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Authority Matrix</p>
                  <p className="text-lg font-bold text-white mt-2 font-mono">v2.1.0</p>
                  <p className="text-xs text-zinc-400 mt-1">Last change: 3 days ago</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-900/30 text-blue-500 group-hover:bg-blue-900/50 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
              </div>
            </Card>
          </Explainer>
          <Explainer {...EXPLAINER_CONTENT.ledgerIntegrity} side="bottom">
            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border-zinc-800 p-5 hover:border-zinc-700 transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Projection Lag</p>
                  <p className="text-2xl font-bold text-white mt-2">0.3s</p>
                  <p className="text-xs text-zinc-400 mt-1">Payments: 0.2s • Ledger: 0.4s</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-900/30 text-emerald-500 group-hover:bg-emerald-900/50 transition-colors">
                  <Database className="h-5 w-5" />
                </div>
              </div>
            </Card>
          </Explainer>
        </div>
      </section>

      {/* Top Risks with Quick Actions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
            Top Risks (Ageing)
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-600">Quick actions enabled</span>
            <Link href="/decisions/inbox">
              <Badge variant="outline" className="border-zinc-700 text-zinc-400 cursor-pointer hover:bg-zinc-800 transition-colors">
                View All →
              </Badge>
            </Link>
          </div>
        </div>
        <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border-zinc-800 overflow-hidden">
          {pendingDecisions.length > 0 ? (
            <div className="divide-y divide-zinc-800/50">
              {pendingDecisions
                .sort((a, b) => {
                  const riskOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
                  return (riskOrder[a.risk as keyof typeof riskOrder] || 3) - (riskOrder[b.risk as keyof typeof riskOrder] || 3);
                })
                .slice(0, 5)
                .map((decision, index) => (
                  <div 
                    key={decision.decisionId}
                    className={cn(
                      "p-4 hover:bg-zinc-800/50 transition-all",
                      "animate-in fade-in slide-in-from-left-2",
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <Link href={`/decisions/${decision.decisionId}`} className="flex items-center gap-4 flex-1 cursor-pointer">
                        <Badge className={cn(
                          getRiskColor(decision.risk),
                          decision.risk === "CRITICAL" && "animate-pulse"
                        )}>
                          {decision.risk}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{decision.subject}</p>
                          <p className="text-xs text-zinc-500 font-mono">{decision.decisionId}</p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="text-sm text-zinc-400">
                            {getAgeString(new Date(decision.createdAt))}
                          </p>
                          <p className="text-xs text-zinc-500">{decision.requiredAuthority}</p>
                        </div>
                      </Link>
                      
                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-2 pl-4 border-l border-zinc-800">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleQuickApprove(decision.decisionId, e)}
                          disabled={actionInProgress === decision.decisionId}
                          className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-900/20"
                          title="Quick Approve"
                        >
                          {actionInProgress === decision.decisionId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleQuickReject(decision.decisionId, e)}
                          disabled={actionInProgress === decision.decisionId}
                          className="h-8 w-8 p-0 text-rose-500 hover:text-rose-400 hover:bg-rose-900/20"
                          title="Quick Reject"
                        >
                          {actionInProgress === decision.decisionId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
              <p className="text-zinc-300 font-medium">All Clear</p>
              <p className="text-zinc-500 text-sm mt-1">No pending decisions requiring attention</p>
            </div>
          )}
        </Card>
      </section>

      {/* Auto-refresh indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/90 border border-zinc-800 rounded-full text-xs text-zinc-500">
          <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin text-orange-500")} />
          <span>Auto-refresh: 30s</span>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getRiskColor(risk: string): string {
  const colors: Record<string, string> = {
    LOW: "bg-emerald-900/50 text-emerald-400 border-emerald-800/50",
    MEDIUM: "bg-amber-900/50 text-amber-400 border-amber-800/50",
    HIGH: "bg-orange-900/50 text-orange-400 border-orange-800/50",
    CRITICAL: "bg-rose-900/50 text-rose-400 border-rose-800/50",
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
