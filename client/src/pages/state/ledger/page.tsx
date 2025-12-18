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
import { 
  Search, 
  Filter, 
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ExternalLink,
  RefreshCw
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Ledger Explorer</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Read-only view of ledger state and integrity. All fixes route through Decision Inbox.
        </p>
      </div>

      {/* Integrity Indicators */}
      <Card className="bg-zinc-900/50 border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Integrity Status</h2>
          <Badge className={INTEGRITY_STATUS.reconciliationStatus === "MATCHED" ? "bg-emerald-900/50 text-emerald-400" : "bg-rose-900/50 text-rose-400"}>
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {INTEGRITY_STATUS.reconciliationStatus}
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Projection Lag</p>
            <p className="text-lg font-bold text-white mt-1">{INTEGRITY_STATUS.projectionLag}s</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Last Event</p>
            <p className="text-lg font-bold text-white mt-1">{formatTime(INTEGRITY_STATUS.lastEventProcessed)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Last Reconciliation</p>
            <p className="text-lg font-bold text-white mt-1">{formatTime(INTEGRITY_STATUS.lastReconciliation)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Snapshot Hash</p>
            <p className="text-sm font-mono text-zinc-400 mt-1 truncate">{INTEGRITY_STATUS.snapshotHash.slice(0, 18)}...</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList className="bg-zinc-800 border-zinc-700">
          <TabsTrigger value="accounts" className="data-[state=active]:bg-zinc-700">Accounts</TabsTrigger>
          <TabsTrigger value="holds" className="data-[state=active]:bg-zinc-700">Holds</TabsTrigger>
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
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Posted Balance</th>
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Available</th>
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
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Decision</th>
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

          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
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
                    <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Execution Ref</th>
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
        </TabsContent>
      </Tabs>

      {/* Mismatch Alert (conditional) */}
      {false && (
        <Card className="bg-rose-900/20 border-rose-800 p-4">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-5 w-5 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-400">Reconciliation Mismatch Detected</h3>
              <p className="text-sm text-rose-300 mt-1">
                Account ACC-001-AUD shows a discrepancy of $1,234.56 between posted and expected balance.
              </p>
              <Link href="/inbox">
                <Button size="sm" className="mt-3 bg-rose-600 hover:bg-rose-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Decision: LEDGER_EXCEPTION
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
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
