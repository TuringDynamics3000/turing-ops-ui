import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { 
  AlertTriangle, 
  Clock, 
  Shield,
  TrendingUp,
  ExternalLink,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Link } from "wouter";

export default function RiskExplorerPage() {
  const { data: decisions, isLoading } = trpc.decisions.list.useQuery();
  const { data: evidence } = trpc.evidence.list.useQuery();

  // Filter by type and status
  const pendingDecisions = decisions?.filter(d => d.status === "PENDING") || [];
  const highRiskPending = pendingDecisions.filter(d => d.risk === "HIGH" || d.risk === "CRITICAL");
  const amlExceptions = pendingDecisions.filter(d => d.type === "AML_EXCEPTION");
  const overrides = pendingDecisions.filter(d => d.type === "LIMIT_OVERRIDE");

  // Policy breach counts (mock data for now)
  const policyBreaches = {
    last24h: 3,
    last7d: 12,
    last30d: 47,
  };

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
        <h1 className="text-2xl font-bold tracking-tight text-white">Risk Explorer</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Risk posture overview. All actions route through Decision Inbox.
        </p>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800 p-5">
          <div className="flex items-start justify-between">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            {highRiskPending.length > 0 && (
              <Badge className="bg-rose-900/50 text-rose-400">{highRiskPending.length}</Badge>
            )}
          </div>
          <p className="text-2xl font-bold text-white mt-3">{highRiskPending.length}</p>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">High Risk Pending</p>
          <p className="text-xs text-zinc-400 mt-1">Requires immediate attention</p>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 p-5">
          <div className="flex items-start justify-between">
            <Shield className="h-5 w-5 text-amber-500" />
            {amlExceptions.length > 0 && (
              <Badge className="bg-amber-900/50 text-amber-400">{amlExceptions.length}</Badge>
            )}
          </div>
          <p className="text-2xl font-bold text-white mt-3">{amlExceptions.length}</p>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">AML Exceptions</p>
          <p className="text-xs text-zinc-400 mt-1">Requires COMPLIANCE authority</p>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 p-5">
          <div className="flex items-start justify-between">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            {overrides.length > 0 && (
              <Badge className="bg-orange-900/50 text-orange-400">{overrides.length}</Badge>
            )}
          </div>
          <p className="text-2xl font-bold text-white mt-3">{overrides.length}</p>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Overrides Pending</p>
          <p className="text-xs text-zinc-400 mt-1">Requires DUAL authority</p>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 p-5">
          <div className="flex items-start justify-between">
            <Clock className="h-5 w-5 text-zinc-500" />
          </div>
          <p className="text-2xl font-bold text-white mt-3">{policyBreaches.last24h}</p>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Policy Breaches (24h)</p>
          <p className="text-xs text-zinc-400 mt-1">7d: {policyBreaches.last7d} • 30d: {policyBreaches.last30d}</p>
        </Card>
      </div>

      {/* Tabs for different risk views */}
      <Tabs defaultValue="high-risk" className="space-y-4">
        <TabsList className="bg-zinc-800 border-zinc-700">
          <TabsTrigger value="high-risk" className="data-[state=active]:bg-zinc-700">
            High Risk ({highRiskPending.length})
          </TabsTrigger>
          <TabsTrigger value="aml" className="data-[state=active]:bg-zinc-700">
            AML Exceptions ({amlExceptions.length})
          </TabsTrigger>
          <TabsTrigger value="overrides" className="data-[state=active]:bg-zinc-700">
            Overrides ({overrides.length})
          </TabsTrigger>
        </TabsList>

        {/* High Risk Tab */}
        <TabsContent value="high-risk">
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            {highRiskPending.length > 0 ? (
              <div className="divide-y divide-zinc-800">
                {highRiskPending.map((decision) => (
                  <RiskDecisionRow key={decision.decisionId} decision={decision} evidence={evidence} />
                ))}
              </div>
            ) : (
              <EmptyState message="No high-risk decisions pending" />
            )}
          </Card>
        </TabsContent>

        {/* AML Tab */}
        <TabsContent value="aml">
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            {amlExceptions.length > 0 ? (
              <div className="divide-y divide-zinc-800">
                {amlExceptions.map((decision) => (
                  <RiskDecisionRow key={decision.decisionId} decision={decision} evidence={evidence} />
                ))}
              </div>
            ) : (
              <EmptyState message="No AML exceptions pending" />
            )}
          </Card>
        </TabsContent>

        {/* Overrides Tab */}
        <TabsContent value="overrides">
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            {overrides.length > 0 ? (
              <div className="divide-y divide-zinc-800">
                {overrides.map((decision) => (
                  <RiskDecisionRow key={decision.decisionId} decision={decision} evidence={evidence} />
                ))}
              </div>
            ) : (
              <EmptyState message="No override requests pending" />
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Completed High-Risk Decisions with Evidence */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4">
          Recently Completed (High Risk)
        </h2>
        <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
          {decisions?.filter(d => 
            (d.risk === "HIGH" || d.risk === "CRITICAL") && 
            ["APPROVED", "REJECTED", "ESCALATED"].includes(d.status)
          ).slice(0, 5).length ? (
            <div className="divide-y divide-zinc-800">
              {decisions
                .filter(d => 
                  (d.risk === "HIGH" || d.risk === "CRITICAL") && 
                  ["APPROVED", "REJECTED", "ESCALATED"].includes(d.status)
                )
                .slice(0, 5)
                .map((decision) => {
                  const linkedEvidence = evidence?.find(e => e.decisionId === decision.decisionId);
                  return (
                    <div key={decision.decisionId} className="p-4 hover:bg-zinc-800/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge className={getRiskColor(decision.risk)}>
                            {decision.risk}
                          </Badge>
                          <div>
                            <p className="text-white font-medium">{decision.subject}</p>
                            <p className="text-xs text-zinc-500 font-mono">{decision.decisionId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(decision.status)}>
                            {decision.status}
                          </Badge>
                          {linkedEvidence && (
                            <Link href={`/evidence?id=${linkedEvidence.evidenceId}`}>
                              <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white h-7 text-xs">
                                Evidence
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          )}
                          <Link href={`/decisions/${decision.decisionId}`}>
                            <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white h-7 text-xs">
                              View
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <EmptyState message="No completed high-risk decisions yet" />
          )}
        </Card>
      </section>
    </div>
  );
}

// Risk Decision Row Component
function RiskDecisionRow({ decision, evidence }: { decision: any; evidence: any[] | undefined }) {
  const linkedEvidence = evidence?.find(e => e.decisionId === decision.decisionId);
  const age = getAgeString(new Date(decision.createdAt));

  return (
    <div className="p-4 hover:bg-zinc-800/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge className={getRiskColor(decision.risk)}>
            {decision.risk}
          </Badge>
          <div>
            <p className="text-white font-medium">{decision.subject}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-zinc-500 font-mono">{decision.decisionId}</span>
              <span className="text-xs text-zinc-600">•</span>
              <span className="text-xs text-zinc-500">{decision.type}</span>
              <span className="text-xs text-zinc-600">•</span>
              <span className="text-xs text-zinc-500">{decision.requiredAuthority}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-zinc-400">{age}</p>
            <p className="text-xs text-zinc-500">Pending</p>
          </div>
          <Link href={`/decisions/${decision.decisionId}`}>
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white h-8">
              Open Decision
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-8 text-center text-zinc-500">
      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
      <p>{message}</p>
    </div>
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

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-amber-900/50 text-amber-400",
    APPROVED: "bg-emerald-900/50 text-emerald-400",
    REJECTED: "bg-rose-900/50 text-rose-400",
    ESCALATED: "bg-orange-900/50 text-orange-400",
  };
  return colors[status] || colors.PENDING;
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
