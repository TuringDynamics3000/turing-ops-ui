import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Explainer } from "@/components/ui/explainer";
import { EXPLAINER_CONTENT } from "@/lib/explainer-content";
import { 
  Shield, 
  Copy, 
  Check, 
  ExternalLink, 
  Lock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Minus,
  Clock,
  Hash
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import type { Role, DecisionType, AuthorityRule } from "@shared/authority";
import { formatRole, formatDecisionType } from "@shared/authority";

/**
 * Authority Matrix Viewer
 * 
 * This is NOT a settings page.
 * It is a read-only constitutional document rendered live from the system of record.
 * 
 * Its purpose is to answer, in one screen:
 * "Who is allowed to decide what, under what conditions, and how do we know this hasn't been quietly changed?"
 */

// ============================================
// COMPONENT: Authority Header
// ============================================
function AuthorityHeader({ 
  version, 
  effectiveFrom, 
  hash, 
  lastChangeDecisionId,
  lastChangeDate 
}: { 
  version: string;
  effectiveFrom: string;
  hash: string;
  lastChangeDecisionId: string | null;
  lastChangeDate: Date | null;
}) {
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    toast.success("Authority hash copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const effectiveDate = new Date(effectiveFrom).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  return (
    <Explainer {...EXPLAINER_CONTENT.authorityMatrix} side="bottom" showIcon={false}>
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 mb-6 cursor-help">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Version */}
          <Explainer
            title="Authority Matrix Version"
            description="The version identifier for this authority matrix. Each change to the matrix increments the version and requires a POLICY_CHANGE decision."
            advantages={[
              "Version is immutable once assigned",
              "Every Evidence Pack references the matrix version",
              "Auditors can verify which rules governed any decision",
            ]}
            legacyComparison={{
              legacy: "Permission rules often unversioned. Changes may not be tracked or may overwrite previous configurations.",
              turing: "Every authority configuration is versioned. Historical decisions can be validated against the exact rules in effect.",
            }}
            side="bottom"
            showIcon={false}
          >
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Version</div>
              <div className="text-lg font-mono text-zinc-200">{version}</div>
            </div>
          </Explainer>

          {/* Effective Date */}
          <Explainer
            title="Effective Date"
            description="The date from which this authority matrix version became active. All decisions after this date are governed by these rules."
            advantages={[
              "Clear temporal boundary for rule applicability",
              "Enables point-in-time compliance verification",
              "Supports regulatory reporting requirements",
            ]}
            legacyComparison={{
              legacy: "Rule changes often take effect immediately without clear effective dates. Historical compliance is hard to verify.",
              turing: "Every matrix version has a precise effective date. Compliance can be verified at any historical point.",
            }}
            side="bottom"
            showIcon={false}
          >
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Effective</div>
              <div className="text-lg text-zinc-200">{effectiveDate}</div>
            </div>
          </Explainer>

          {/* Authority Hash */}
          <Explainer {...EXPLAINER_CONTENT.hashVerification} side="bottom" showIcon={false}>
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Authority Hash</div>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-orange-400">{hash.slice(0, 12)}…</code>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-zinc-500 hover:text-zinc-300"
                      onClick={copyHash}
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy full hash</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </Explainer>

          {/* Last Change Decision */}
          <Explainer
            title="Last Change Decision"
            description="The decision ID that authorized the most recent change to this authority matrix. Click to view the full evidence pack."
            advantages={[
              "Every change is traceable to a specific decision",
              "Change authorization is cryptographically proven",
              "Full context of why the change was made is preserved",
            ]}
            legacyComparison={{
              legacy: "Permission changes often lack audit trail. May be changed by admins without formal approval process.",
              turing: "Every change requires a governed decision. The full context, approvers, and justification are permanently recorded.",
            }}
            side="bottom"
            showIcon={false}
          >
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Last Changed By</div>
              {lastChangeDecisionId ? (
                <Link href={`/decisions/${lastChangeDecisionId}`}>
                  <span className="text-sm font-mono text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-1">
                    {lastChangeDecisionId}
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </Link>
              ) : (
                <span className="text-sm text-zinc-500">Initial configuration</span>
              )}
            </div>
          </Explainer>
        </div>
      </div>
    </Explainer>
  );
}

// ============================================
// COMPONENT: Role Badges
// ============================================
function RoleBadges({ roles }: { roles: Role[] }) {
  const roleColors: Record<Role, string> = {
    OPERATOR: "bg-zinc-700 text-zinc-300",
    SUPERVISOR: "bg-blue-900/50 text-blue-300 border border-blue-700/50",
    COMPLIANCE: "bg-purple-900/50 text-purple-300 border border-purple-700/50",
    PLATFORM_ADMIN: "bg-orange-900/50 text-orange-300 border border-orange-700/50"
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {roles.map(role => (
        <Badge key={role} className={`${roleColors[role]} text-xs font-medium`}>
          {formatRole(role)}
        </Badge>
      ))}
    </div>
  );
}

// ============================================
// COMPONENT: Dual Control Indicator
// ============================================
function DualControlIndicator({ required }: { required: boolean }) {
  if (required) {
    return (
      <Explainer {...EXPLAINER_CONTENT.dualControl} side="left" showIcon={false}>
        <div className="flex items-center gap-1.5 text-emerald-400 cursor-help">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm">Required</span>
        </div>
      </Explainer>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-zinc-500">
      <Minus className="h-4 w-4" />
      <span className="text-sm">Not required</span>
    </div>
  );
}

// ============================================
// COMPONENT: Escalation Roles
// ============================================
function EscalationRoles({ roles }: { roles: Role[] }) {
  if (roles.length === 0) {
    return <span className="text-zinc-500 text-sm">None</span>;
  }
  return <RoleBadges roles={roles} />;
}

// ============================================
// COMPONENT: Authority Matrix Table
// ============================================
function AuthorityMatrixTable({ rules }: { rules: AuthorityRule[] }) {
  return (
    <Explainer
      title="Authority Rules Table"
      description="This table defines the complete authority model for the platform. Each row specifies which roles can act on a decision type, whether dual control is required, and the escalation path."
      advantages={[
        "Single source of truth for all authority rules",
        "Rules are enforced at runtime, API, and UI levels",
        "Changes require governed POLICY_CHANGE decisions",
      ]}
      legacyComparison={{
        legacy: "Authority rules often scattered across code, config files, and databases. Different systems may enforce different rules.",
        turing: "One table, one source. Runtime, API, and UI all read from this matrix. Hash proves integrity.",
      }}
      side="top"
      showIcon={false}
    >
      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-900/70 border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Decision Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Allowed Roles</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Dual Control</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Escalation Path</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Policy</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule, index) => (
              <tr 
                key={rule.decisionType} 
                className={`border-b border-zinc-800/50 ${index % 2 === 0 ? 'bg-zinc-900/30' : 'bg-zinc-900/10'}`}
              >
                <td className="px-4 py-4">
                  <div className="font-medium text-zinc-200">{formatDecisionType(rule.decisionType)}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{rule.description}</div>
                </td>
                <td className="px-4 py-4">
                  <Explainer {...EXPLAINER_CONTENT.authorityBadge} side="right" showIcon={false}>
                    <div className="cursor-help">
                      <RoleBadges roles={rule.allowedRoles} />
                    </div>
                  </Explainer>
                </td>
                <td className="px-4 py-4">
                  <DualControlIndicator required={rule.dualControl} />
                </td>
                <td className="px-4 py-4">
                  <EscalationRoles roles={rule.escalationRoles} />
                </td>
                <td className="px-4 py-4">
                  <Explainer {...EXPLAINER_CONTENT.policyDefinition} side="left" showIcon={false}>
                    <code className="text-xs font-mono text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded cursor-help">
                      {rule.policyCode}
                    </code>
                  </Explainer>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Explainer>
  );
}

// ============================================
// COMPONENT: Authority Governance History
// ============================================
function AuthorityGovernanceHistory() {
  const { data: history, isLoading } = trpc.authority.getGovernanceHistory.useQuery({ limit: 10 });

  if (isLoading) {
    return (
      <div className="text-center py-8 text-zinc-500">
        Loading governance history...
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No authority changes recorded yet.</p>
        <p className="text-xs mt-1">The matrix is in its initial configuration.</p>
      </div>
    );
  }

  return (
    <Explainer
      title="Governance History"
      description="Every change to the authority matrix is recorded here with full traceability. Each row links to the decision that authorized the change and the evidence pack that proves it."
      advantages={[
        "Complete audit trail of all authority changes",
        "Each change links to decision and evidence",
        "Regulators can verify any historical change",
      ]}
      legacyComparison={{
        legacy: "Permission change history often incomplete or stored in separate audit systems. May not link to approval context.",
        turing: "Every change is a governed decision. Full context, approvers, justification, and cryptographic proof are permanently linked.",
      }}
      side="top"
      showIcon={false}
    >
      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-900/70 border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Decision ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Approved By</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Approved At</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Evidence Hash</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr 
                key={item.decisionId} 
                className={`border-b border-zinc-800/50 ${index % 2 === 0 ? 'bg-zinc-900/30' : 'bg-zinc-900/10'}`}
              >
                <td className="px-4 py-3">
                  <Link href={`/decisions/${item.decisionId}`}>
                    <span className="font-mono text-sm text-blue-400 hover:text-blue-300 cursor-pointer">
                      {item.decisionId}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge className={
                    item.status === "APPROVED" ? "bg-emerald-900/50 text-emerald-300" :
                    item.status === "REJECTED" ? "bg-red-900/50 text-red-300" :
                    item.status === "PENDING" ? "bg-amber-900/50 text-amber-300" :
                    "bg-zinc-700 text-zinc-300"
                  }>
                    {item.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-300">
                  {item.approvedBy || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">
                  {item.approvedAt ? new Date(item.approvedAt).toLocaleString("en-AU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  }) : "—"}
                </td>
                <td className="px-4 py-3">
                  {item.evidenceHash ? (
                    <Link href={`/evidence?id=${item.evidenceId}`}>
                      <code className="text-xs font-mono text-orange-400 hover:text-orange-300 cursor-pointer">
                        {item.evidenceHash.slice(0, 16)}…
                      </code>
                    </Link>
                  ) : (
                    <span className="text-zinc-500 text-sm">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Explainer>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function AuthorityMatrixPage() {
  const { data: matrix, isLoading, error } = trpc.authority.getMatrix.useQuery();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-1/3"></div>
          <div className="h-4 bg-zinc-800 rounded w-2/3"></div>
          <div className="h-32 bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !matrix) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-zinc-200 mb-2">Failed to load Authority Matrix</h2>
          <p className="text-zinc-400">Please try again or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-orange-500" />
          <h1 className="text-2xl font-bold text-zinc-100">Authority Matrix</h1>
          <Explainer
            title="Read-Only Constitutional Document"
            description="This is not a settings page. It is a read-only view of the authority matrix - the constitutional document that governs all decisions in the platform."
            advantages={[
              "Cannot be edited directly - changes require governed decisions",
              "Rendered live from the system of record",
              "Hash verification proves integrity",
            ]}
            legacyComparison={{
              legacy: "Permission settings often editable by admins without audit trail. Changes may not require approval.",
              turing: "Authority matrix is a constitutional document. Changes require formal decisions with dual control and evidence.",
            }}
            side="bottom"
            showIcon={false}
          >
            <Badge className="bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-help">
              <Lock className="h-3 w-3 mr-1" />
              Read Only
            </Badge>
          </Explainer>
        </div>
        <p className="text-zinc-400 max-w-2xl">
          This matrix defines which roles may exercise authority over each decision type.
          <span className="text-orange-400 font-medium"> Changes require a governed Decision and dual control.</span>
        </p>
      </div>

      {/* Authority Header with Version/Hash */}
      <AuthorityHeader 
        version={matrix.version}
        effectiveFrom={matrix.effectiveFrom}
        hash={matrix.hash}
        lastChangeDecisionId={matrix.lastChangeDecisionId}
        lastChangeDate={matrix.lastChangeDate}
      />

      {/* Main Authority Matrix Table */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
          <Hash className="h-5 w-5 text-zinc-500" />
          Authority Rules
        </h2>
        <AuthorityMatrixTable rules={matrix.rules} />
      </div>

      <Separator className="my-8 bg-zinc-800" />

      {/* Governance History */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-zinc-200 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-zinc-500" />
          Authority Governance History
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          All changes to the authority matrix are recorded as POLICY_CHANGE decisions with dual control and evidence.
        </p>
        <AuthorityGovernanceHistory />
      </div>

      <Separator className="my-8 bg-zinc-800" />

      {/* Propose Change CTA */}
      <Explainer
        title="Propose Authority Change"
        description="To modify the authority matrix, you must create a POLICY_CHANGE decision. This decision requires dual control (two authorized approvers) and produces an immutable evidence record."
        advantages={[
          "Changes follow the same governance as operational decisions",
          "Dual control prevents unilateral authority modifications",
          "Full audit trail of who proposed and approved changes",
        ]}
        legacyComparison={{
          legacy: "Permission changes often made by single admin. May not require approval or produce audit trail.",
          turing: "Authority changes are governed decisions. Same rigor as operational decisions, with dual control and evidence.",
        }}
        side="top"
        showIcon={false}
      >
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-200">Need to modify the Authority Matrix?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-400 mb-4">
              Authority matrix changes cannot be made directly. You must create a POLICY_CHANGE decision,
              which requires dual control and produces an immutable evidence record.
            </p>
            <Link href="/decisions/new?type=POLICY_CHANGE">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                <FileText className="h-4 w-4 mr-2" />
                Propose Authority Change
              </Button>
            </Link>
          </CardContent>
        </Card>
      </Explainer>

      {/* Enforcement Alignment Notice */}
      <Explainer {...EXPLAINER_CONTENT.enforcementAlignment} side="top" showIcon={false}>
        <div className="mt-8 p-4 bg-zinc-900/30 border border-zinc-800 rounded-lg cursor-help">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-emerald-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">Enforcement Alignment</h3>
              <p className="text-xs text-zinc-500">
                This matrix is the single source of truth. Runtime enforcement (<code className="text-orange-400">hasAuthority()</code>), 
                the Decision API, and this UI all read from the same source. The hash displayed here appears in all Evidence Packs.
              </p>
            </div>
          </div>
        </div>
      </Explainer>
    </div>
  );
}
