import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Explainer } from "@/components/ui/explainer";
import { EXPLAINER_CONTENT } from "@/lib/explainer-content";
import { 
  Search, 
  Filter, 
  CheckCircle2,
  AlertTriangle,
  Plus,
  Info,
  BookOpen,
  Shield
} from "lucide-react";
import { Link } from "wouter";

// Mock ledger data
const MOCK_ACCOUNTS = [
  {
    accountId: "ACC-001-AUD",
    name: "Operating Account",
    currency: "AUD",
    postedBalance: 1247500.00,
    availableBalance: 1197500.00,
    holdAmount: 50000.00,
    lastActivity: new Date(Date.now() - 1800000),
    status: "ACTIVE" as const,
  },
  {
    accountId: "ACC-002-AUD",
    name: "Settlement Account",
    currency: "AUD",
    postedBalance: 3850000.00,
    availableBalance: 3850000.00,
    holdAmount: 0,
    lastActivity: new Date(Date.now() - 3600000),
    status: "ACTIVE" as const,
  },
  {
    accountId: "ACC-003-AUD",
    name: "Reserve Account",
    currency: "AUD",
    postedBalance: 500000.00,
    availableBalance: 500000.00,
    holdAmount: 0,
    lastActivity: new Date(Date.now() - 86400000),
    status: "ACTIVE" as const,
  },
];

const MOCK_HOLDS = [
  {
    holdId: "HLD-2024-001",
    accountId: "ACC-001-AUD",
    amount: 50000.00,
    currency: "AUD",
    reason: "Pending payment approval",
    createdAt: new Date(Date.now() - 3600000),
    expiresAt: new Date(Date.now() + 82800000),
    linkedDecision: "DEC-2024-001",
    status: "ACTIVE" as const,
  },
];

const MOCK_POSTINGS = [
  {
    postingId: "POST-2024-0847",
    accountId: "ACC-001-AUD",
    type: "DEBIT" as const,
    amount: 5200.00,
    currency: "AUD",
    description: "BPAY - Telstra",
    timestamp: new Date(Date.now() - 7200000),
    executionRef: "BPAY-2024-0847291",
  },
  {
    postingId: "POST-2024-0846",
    accountId: "ACC-001-AUD",
    type: "CREDIT" as const,
    amount: 25000.00,
    currency: "AUD",
    description: "Incoming transfer - Client Payment",
    timestamp: new Date(Date.now() - 14400000),
    executionRef: "NPP-2024-1847392",
  },
  {
    postingId: "POST-2024-0845",
    accountId: "ACC-002-AUD",
    type: "CREDIT" as const,
    amount: 150000.00,
    currency: "AUD",
    description: "Settlement batch - Morning",
    timestamp: new Date(Date.now() - 21600000),
    executionRef: "SETTLE-2024-AM-001",
  },
];

// Integrity indicators
const INTEGRITY_STATUS = {
  projectionLag: 0.4, // seconds
  lastEventProcessed: new Date(Date.now() - 400),
  snapshotHash: "0x7f3a8b2c4d5e6f1a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a",
  reconciliationStatus: "MATCHED" as const,
  lastReconciliation: new Date(Date.now() - 3600000),
};

export default function LedgerExplorerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [accountFilter, setAccountFilter] = useState<string>("all");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-orange-500" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Ledger Explorer</h1>
            <Explainer
              title="Event-Sourced Ledger"
              description="TuringDynamics Core uses event sourcing for the ledger. Every balance is a projection of immutable events. This is fundamentally different from traditional mutable database records."
              advantages={[
                "Complete audit trail - every change is an event",
                "Point-in-time reconstruction of any balance",
                "Impossible to silently modify historical records",
                "Natural reconciliation with external systems",
              ]}
              legacyComparison={{
                legacy: "Mutable database records. Balance updates overwrite previous values. Audit trail requires separate logging that may be incomplete.",
                turing: "Immutable event log. Balances are projections. Any historical state can be reconstructed from events.",
              }}
              side="bottom"
              showIcon={false}
            >
              <Info className="h-4 w-4 text-zinc-500 hover:text-orange-500 cursor-help transition-colors" />
            </Explainer>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Read-only view of ledger state and integrity. All fixes route through Decision Inbox.
          </p>
        </div>
      </div>

      {/* Integrity Indicators */}
      <Explainer
        title="Real-Time Integrity Monitoring"
        description="The ledger continuously monitors its own integrity. Projection lag, event processing, and reconciliation status are surfaced in real-time - not discovered during monthly audits."
        advantages={[
          "Sub-second projection lag visibility",
          "Cryptographic snapshot hashes for verification",
          "Automatic reconciliation with external systems",
          "Mismatches surface immediately, not at month-end",
        ]}
        legacyComparison={{
          legacy: "Integrity issues discovered during periodic reconciliation. Manual processes to identify and resolve discrepancies. Days or weeks to detect problems.",
          turing: "Continuous integrity monitoring. Cryptographic proofs. Mismatches detected in seconds and routed to governance.",
        }}
        side="bottom"
        showIcon={false}
      >
        <Card className="bg-zinc-900/50 border-zinc-800 p-4 cursor-help">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Integrity Status</h2>
            </div>
            <Badge className={INTEGRITY_STATUS.reconciliationStatus === "MATCHED" ? "bg-emerald-900/50 text-emerald-400" : "bg-rose-900/50 text-rose-400"}>
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {INTEGRITY_STATUS.reconciliationStatus}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Explainer
              title="Projection Lag"
              description="Time between an event occurring and the balance projection being updated. Sub-second lag means near real-time accuracy."
              advantages={[
                "Sub-second updates vs batch processing",
                "Real-time balance accuracy",
                "No stale data in decision-making",
              ]}
              legacyComparison={{
                legacy: "Batch processing with minutes or hours of lag. Balances may not reflect recent transactions.",
                turing: "Event-driven projections with sub-second lag. Balances always current.",
              }}
              side="bottom"
              showIcon={false}
            >
              <div className="cursor-help">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Projection Lag</p>
                <p className="text-lg font-bold text-white mt-1">{INTEGRITY_STATUS.projectionLag}s</p>
              </div>
            </Explainer>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Last Event</p>
              <p className="text-lg font-bold text-white mt-1">{formatTime(INTEGRITY_STATUS.lastEventProcessed)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Last Reconciliation</p>
              <p className="text-lg font-bold text-white mt-1">{formatTime(INTEGRITY_STATUS.lastReconciliation)}</p>
            </div>
            <Explainer
              title="Cryptographic Snapshot Hash"
              description="A SHA-256 hash of the current ledger state. Any modification to historical data would change this hash, making tampering detectable."
              advantages={[
                "Tamper-evident ledger state",
                "Cryptographic proof of integrity",
                "Can be verified by external auditors",
              ]}
              legacyComparison={{
                legacy: "No cryptographic verification. Trust based on access controls and audit logs that could be modified.",
                turing: "Cryptographic hashes provide mathematical proof of integrity. Any tampering is immediately detectable.",
              }}
              side="bottom"
              showIcon={false}
            >
              <div className="cursor-help">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Snapshot Hash</p>
                <p className="text-sm font-mono text-zinc-400 mt-1 truncate">{INTEGRITY_STATUS.snapshotHash.slice(0, 18)}...</p>
              </div>
            </Explainer>
          </div>
        </Card>
      </Explainer>

      {/* Tabs */}
      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList className="bg-zinc-800 border-zinc-700">
          <TabsTrigger value="accounts" className="data-[state=active]:bg-zinc-700">Accounts</TabsTrigger>
          <TabsTrigger value="holds" className="data-[state=active]:bg-zinc-700">
            <Explainer
              title="Governance-Linked Holds"
              description="Holds in TuringDynamics are not just balance reservations - they're linked to governance decisions. A hold cannot be released without a corresponding decision."
              advantages={[
                "Every hold links to a decision",
                "No manual hold releases without governance",
                "Complete audit trail of hold lifecycle",
              ]}
              legacyComparison={{
                legacy: "Holds managed operationally. Can be released by staff with database access. May not require approval.",
                turing: "Holds are governance primitives. Release requires a decision with evidence.",
              }}
              side="bottom"
              showIcon={false}
            >
              <span className="cursor-help">Holds</span>
            </Explainer>
          </TabsTrigger>
          <TabsTrigger value="postings" className="data-[state=active]:bg-zinc-700">Postings</TabsTrigger>
        </TabsList>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 text-left">
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Account ID</th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      <Explainer
                        title="Posted Balance"
                        description="The balance after all confirmed postings. This is the 'source of truth' balance that has been fully processed and reconciled."
                        advantages={[
                          "Derived from immutable event stream",
                          "Cryptographically verifiable",
                          "Point-in-time reconstruction available",
                        ]}
                        legacyComparison={{
                          legacy: "Mutable balance field. Historical values overwritten. Reconstruction requires separate audit tables.",
                          turing: "Balance is a projection of events. Any historical balance can be reconstructed from the event log.",
                        }}
                        side="bottom"
                        showIcon={false}
                      >
                        <span className="cursor-help">Posted Balance</span>
                      </Explainer>
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      <Explainer
                        title="Available Balance"
                        description="Posted balance minus any active holds. This is the amount actually available for new transactions."
                        advantages={[
                          "Real-time calculation",
                          "Accounts for governance holds",
                          "Prevents overdrafts during approval",
                        ]}
                        legacyComparison={{
                          legacy: "Available balance may not account for pending approvals. Risk of overdraft during approval delays.",
                          turing: "Available balance always reflects governance holds. Funds reserved until decision is made.",
                        }}
                        side="bottom"
                        showIcon={false}
                      >
                        <span className="cursor-help">Available</span>
                      </Explainer>
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Holds</th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Last Activity</th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {MOCK_ACCOUNTS.map((account) => (
                    <tr key={account.accountId} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-white">{account.accountId}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300">{account.name}</td>
                      <td className="px-4 py-3 text-sm text-white font-medium">
                        ${account.postedBalance.toLocaleString()} {account.currency}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300">
                        ${account.availableBalance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {account.holdAmount > 0 ? (
                          <span className="text-amber-400">${account.holdAmount.toLocaleString()}</span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{formatTime(account.lastActivity)}</td>
                      <td className="px-4 py-3">
                        <Badge className="bg-emerald-900/50 text-emerald-400">{account.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Holds Tab */}
        <TabsContent value="holds" className="space-y-4">
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 text-left">
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Hold ID</th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Account</th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Reason</th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Expires</th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      <Explainer
                        title="Linked Decision"
                        description="Every hold is linked to a governance decision. The hold cannot be released without the decision being resolved."
                        advantages={[
                          "Holds are governance primitives",
                          "One-click navigation to decision",
                          "Complete audit trail",
                        ]}
                        legacyComparison={{
                          legacy: "Holds may exist without formal approval linkage. Manual correlation required for audits.",
                          turing: "Every hold links to a decision. Release requires governance resolution.",
                        }}
                        side="bottom"
                        showIcon={false}
                      >
                        <span className="cursor-help">Decision</span>
                      </Explainer>
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {MOCK_HOLDS.map((hold) => (
                    <tr key={hold.holdId} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-white">{hold.holdId}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400 font-mono">{hold.accountId}</td>
                      <td className="px-4 py-3 text-sm text-amber-400 font-medium">
                        ${hold.amount.toLocaleString()} {hold.currency}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300">{hold.reason}</td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{formatTime(hold.expiresAt)}</td>
                      <td className="px-4 py-3">
                        {hold.linkedDecision ? (
                          <Link href={`/decisions/${hold.linkedDecision}`}>
                            <Badge variant="outline" className="border-orange-700 text-orange-400 cursor-pointer hover:bg-orange-900/20 font-mono">
                              {hold.linkedDecision}
                            </Badge>
                          </Link>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!hold.linkedDecision && (
                          <Link href="/inbox">
                            <Button size="sm" variant="outline" className="border-orange-700 text-orange-400 hover:bg-orange-900/20 h-7 text-xs">
                              <Plus className="h-3 w-3 mr-1" />
                              Create Decision
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {MOCK_HOLDS.length === 0 && (
              <div className="p-8 text-center text-zinc-500">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                <p>No active holds</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Postings Tab */}
        <TabsContent value="postings" className="space-y-4">
          {/* Filters */}
          <Card className="bg-zinc-900/50 border-zinc-800 p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    placeholder="Search postings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-zinc-500" />
                <Select value={accountFilter} onValueChange={setAccountFilter}>
                  <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {MOCK_ACCOUNTS.map(acc => (
                      <SelectItem key={acc.accountId} value={acc.accountId}>{acc.accountId}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Explainer
            title="Immutable Posting Log"
            description="Every posting is an immutable event. Corrections are made by posting reversals, not by editing history. This creates a complete, tamper-evident audit trail."
            advantages={[
              "Postings are immutable events",
              "Corrections via reversals, not edits",
              "Complete audit trail by design",
              "Reconciliation with external systems",
            ]}
            legacyComparison={{
              legacy: "Postings may be edited or deleted by privileged users. Audit trail depends on separate logging.",
              turing: "Postings are immutable. Corrections are new events. History cannot be rewritten.",
            }}
            side="top"
            showIcon={false}
          >
            <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden cursor-help">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800 text-left">
                      <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Posting ID</th>
                      <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Account</th>
                      <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Timestamp</th>
                      <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <Explainer {...EXPLAINER_CONTENT.executionRef} side="bottom" showIcon={false}>
                          <span className="cursor-help">Execution Ref</span>
                        </Explainer>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {MOCK_POSTINGS
                      .filter(p => accountFilter === "all" || p.accountId === accountFilter)
                      .map((posting) => (
                      <tr key={posting.postingId} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-white">{posting.postingId}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-400 font-mono">{posting.accountId}</td>
                        <td className="px-4 py-3">
                          <Badge className={posting.type === "CREDIT" ? "bg-emerald-900/50 text-emerald-400" : "bg-rose-900/50 text-rose-400"}>
                            {posting.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          <span className={posting.type === "CREDIT" ? "text-emerald-400" : "text-rose-400"}>
                            {posting.type === "CREDIT" ? "+" : "-"}${posting.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-300">{posting.description}</td>
                        <td className="px-4 py-3 text-sm text-zinc-400">{formatTime(posting.timestamp)}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-zinc-500">{posting.executionRef}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </Explainer>
        </TabsContent>
      </Tabs>

      {/* Governance Notice */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-orange-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-1">Event-Sourced Architecture</h3>
            <p className="text-xs text-zinc-500">
              Unlike traditional ledgers where balances are mutable database fields, TuringDynamics Core derives all balances
              from an immutable event stream. This means any historical balance can be reconstructed, and any tampering
              would be cryptographically detectable. Legacy systems like Thought Machine use similar event sourcing but
              lack the integrated governance layer that routes all exceptions through formal decision workflows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function
function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 0) {
    // Future date (for expiry)
    const futureMins = Math.abs(diffMins);
    if (futureMins < 60) return `in ${futureMins}m`;
    const futureHours = Math.floor(futureMins / 60);
    if (futureHours < 24) return `in ${futureHours}h`;
    return date.toLocaleDateString();
  }
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return date.toLocaleDateString();
}
