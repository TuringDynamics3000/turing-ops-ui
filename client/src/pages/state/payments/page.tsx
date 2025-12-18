import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Explainer } from "@/components/ui/explainer";
import { EXPLAINER_CONTENT } from "@/lib/explainer-content";
import { 
  Search, 
  Filter, 
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Plus,
  CreditCard,
  Shield,
  Info
} from "lucide-react";
import { Link } from "wouter";

// Mock payment data - in production this would come from API
const MOCK_PAYMENTS = [
  {
    paymentRef: "PAY-84F3A19C",
    createdAt: new Date(Date.now() - 3600000),
    status: "BLOCKED" as const,
    rail: "Faster Payments",
    amount: 40000,
    currency: "AUD",
    counterparty: "Acme Corp Ltd.",
    policyFlag: "PAY-004",
    decisionId: "DEC-2024-001",
    lifecycle: [
      { timestamp: new Date(Date.now() - 3600000), event: "SUBMITTED", actor: "API" },
      { timestamp: new Date(Date.now() - 3500000), event: "POLICY_TRIGGERED", actor: "PAY-004" },
      { timestamp: new Date(Date.now() - 3400000), event: "BLOCKED", actor: "Policy Engine" },
    ]
  },
  {
    paymentRef: "PAY-72B1C8D4",
    createdAt: new Date(Date.now() - 7200000),
    status: "POSTED" as const,
    rail: "BPAY",
    amount: 5200,
    currency: "AUD",
    counterparty: "Telstra",
    policyFlag: null,
    decisionId: null,
    executionRef: "BPAY-2024-0847291",
    lifecycle: [
      { timestamp: new Date(Date.now() - 7200000), event: "SUBMITTED", actor: "API" },
      { timestamp: new Date(Date.now() - 7100000), event: "VALIDATED", actor: "Policy Engine" },
      { timestamp: new Date(Date.now() - 7000000), event: "POSTED", actor: "Execution" },
    ]
  },
  {
    paymentRef: "PAY-9E4F2A7B",
    createdAt: new Date(Date.now() - 10800000),
    status: "FAILED" as const,
    rail: "NPP",
    amount: 15000,
    currency: "AUD",
    counterparty: "Unknown Beneficiary",
    policyFlag: "PAY-001",
    decisionId: null,
    failureReason: "Beneficiary account validation failed",
    lifecycle: [
      { timestamp: new Date(Date.now() - 10800000), event: "SUBMITTED", actor: "API" },
      { timestamp: new Date(Date.now() - 10700000), event: "VALIDATED", actor: "Policy Engine" },
      { timestamp: new Date(Date.now() - 10600000), event: "FAILED", actor: "Execution" },
    ]
  },
  {
    paymentRef: "PAY-3C8D1E5F",
    createdAt: new Date(Date.now() - 14400000),
    status: "POSTED" as const,
    rail: "Faster Payments",
    amount: 8500,
    currency: "AUD",
    counterparty: "Smith & Associates",
    policyFlag: null,
    decisionId: null,
    executionRef: "FPS-2024-1847392",
    lifecycle: [
      { timestamp: new Date(Date.now() - 14400000), event: "SUBMITTED", actor: "API" },
      { timestamp: new Date(Date.now() - 14300000), event: "VALIDATED", actor: "Policy Engine" },
      { timestamp: new Date(Date.now() - 14200000), event: "POSTED", actor: "Execution" },
    ]
  },
  {
    paymentRef: "PAY-6A2B9C4D",
    createdAt: new Date(Date.now() - 18000000),
    status: "BLOCKED" as const,
    rail: "NPP",
    amount: 127500,
    currency: "AUD",
    counterparty: "Global Trading Co.",
    policyFlag: "LIM-001",
    decisionId: "DEC-2024-002",
    lifecycle: [
      { timestamp: new Date(Date.now() - 18000000), event: "SUBMITTED", actor: "API" },
      { timestamp: new Date(Date.now() - 17900000), event: "POLICY_TRIGGERED", actor: "LIM-001" },
      { timestamp: new Date(Date.now() - 17800000), event: "BLOCKED", actor: "Policy Engine" },
    ]
  },
];

type PaymentStatus = "SUBMITTED" | "POSTED" | "FAILED" | "BLOCKED";
type Payment = typeof MOCK_PAYMENTS[0];

export default function PaymentsExplorerPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [railFilter, setRailFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Filter payments
  const filteredPayments = MOCK_PAYMENTS.filter(payment => {
    if (statusFilter !== "all" && payment.status !== statusFilter) return false;
    if (railFilter !== "all" && payment.rail !== railFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        payment.paymentRef.toLowerCase().includes(query) ||
        payment.counterparty.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <CreditCard className="h-7 w-7 text-orange-500" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Payments Explorer</h1>
<Explainer
              title="Read-Only State Explorer"
              description="This explorer provides a read-only view of payment state. Unlike traditional admin panels, you cannot modify payments directly here. All fixes must route through the Decision Inbox."
              advantages={[
                "Enforces governance - no backdoor edits",
                "Every change produces an Evidence Pack",
                "Audit trail is complete and unbroken",
              ]}
              legacyComparison={{
                legacy: "Admin panels allow direct database edits. Changes may bypass approval workflows and audit logging.",
                turing: "Read-only explorers with decision routing. Every state change is a governed decision with evidence.",
              }}
              side="bottom"
              showIcon={false}
            >
              <Info className="h-4 w-4 text-zinc-500 hover:text-orange-500 cursor-help transition-colors" />
            </Explainer>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Read-only view of payment state. All fixes route through Decision Inbox.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900/50 border-zinc-800 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search by reference or counterparty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="POSTED">Posted</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="BLOCKED">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={railFilter} onValueChange={setRailFilter}>
              <SelectTrigger className="w-[160px] bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Rail" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rails</SelectItem>
                <SelectItem value="Faster Payments">Faster Payments</SelectItem>
                <SelectItem value="NPP">NPP</SelectItem>
                <SelectItem value="BPAY">BPAY</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      <Explainer {...EXPLAINER_CONTENT.paymentRouting} side="top" showIcon={false}>
        <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden cursor-help">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 text-left">
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Reference</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">
<Explainer
                      title="Payment Status"
                      description="Real-time status of the payment in its lifecycle. Blocked payments require a governed decision to proceed."
                      advantages={[
                        "Status changes are governance events",
                        "Blocked payments cannot proceed without decision",
                        "Every status transition is logged with evidence",
                      ]}
                      legacyComparison={{
                        legacy: "Status changes often made by operations staff directly. May not require approval or produce audit trail.",
                        turing: "Status is controlled by governance layer. Blocked → Posted requires a decision with evidence.",
                      }}
                      side="bottom"
                      showIcon={false}
                    >
                      <span className="cursor-help">Status</span>
                    </Explainer>
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Rail</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Counterparty</th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <Explainer {...EXPLAINER_CONTENT.policyDefinition} side="bottom" showIcon={false}>
                      <span className="cursor-help">Policy</span>
                    </Explainer>
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredPayments.map((payment) => (
                  <tr 
                    key={payment.paymentRef} 
                    className="hover:bg-zinc-800/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedPayment(payment)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-white">{payment.paymentRef}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {formatTime(payment.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{payment.rail}</td>
                    <td className="px-4 py-3 text-sm text-white font-medium">
                      ${payment.amount.toLocaleString()} {payment.currency}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">{payment.counterparty}</td>
                    <td className="px-4 py-3">
                      {payment.policyFlag ? (
                        <Badge variant="outline" className="border-amber-700 text-amber-400 font-mono text-xs">
                          {payment.policyFlag}
                        </Badge>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentAction payment={payment} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPayments.length === 0 && (
            <div className="p-8 text-center text-zinc-500">
              No payments match your filters
            </div>
          )}
        </Card>
      </Explainer>

      {/* Governance Notice */}
      <Explainer
        title="Decision-Linked Payments"
        description="Every blocked payment links directly to its governing decision. This creates an unbroken audit trail from payment request to final execution."
        advantages={[
          "One-click navigation from payment to decision",
          "No manual correlation required for audits",
          "Complete traceability without separate systems",
        ]}
        legacyComparison={{
          legacy: "Payments and approvals in separate systems. Audit requires manual correlation using reference numbers across multiple databases.",
          turing: "Unified data model - payments, decisions, and evidence linked by design. Any record leads to complete context.",
        }}
        side="top"
        showIcon={false}
      >
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4 cursor-help">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">Governance-First Architecture</h3>
              <p className="text-xs text-zinc-500">
                Blocked payments cannot be released by editing the database. Every state change routes through the Decision Inbox,
                producing an immutable Evidence Pack. This is fundamentally different from legacy systems where ops staff can
                directly modify payment status.
              </p>
            </div>
          </div>
        </div>
      </Explainer>

      {/* Payment Detail Drawer */}
      <Sheet open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <SheetContent className="bg-zinc-900 border-zinc-800 w-[500px] sm:max-w-[500px]">
          {selectedPayment && (
            <>
              <SheetHeader>
                <SheetTitle className="text-white font-mono">{selectedPayment.paymentRef}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <StatusBadge status={selectedPayment.status} />
                  <span className="text-sm text-zinc-400">{selectedPayment.rail}</span>
                </div>

                {/* Amount */}
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Amount</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    ${selectedPayment.amount.toLocaleString()} {selectedPayment.currency}
                  </p>
                  <p className="text-sm text-zinc-400 mt-1">→ {selectedPayment.counterparty}</p>
                </div>

                {/* Lifecycle Timeline */}
                <Explainer {...EXPLAINER_CONTENT.evidenceTimeline} side="left" showIcon={false}>
                  <div className="cursor-help">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Lifecycle</p>
                    <div className="space-y-3">
                      {selectedPayment.lifecycle.map((event, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white font-medium">{event.event}</span>
                              <span className="text-xs text-zinc-500">{formatTime(event.timestamp)}</span>
                            </div>
                            <p className="text-xs text-zinc-400">{event.actor}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Explainer>

                {/* Policy Triggers */}
                {selectedPayment.policyFlag && (
                  <Explainer {...EXPLAINER_CONTENT.policyDefinition} side="left" showIcon={false}>
                    <div className="cursor-help">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Policy Triggers</p>
                      <Badge variant="outline" className="border-amber-700 text-amber-400 font-mono">
                        {selectedPayment.policyFlag}
                      </Badge>
                    </div>
                  </Explainer>
                )}

                {/* Linked Decision */}
                {selectedPayment.decisionId && (
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Linked Decision</p>
                    <Link href={`/decisions/${selectedPayment.decisionId}`}>
                      <Button variant="outline" className="w-full border-orange-700 text-orange-400 hover:bg-orange-900/20">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open {selectedPayment.decisionId}
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Execution Reference */}
                {selectedPayment.executionRef && (
                  <Explainer
                    title="Execution Reference"
                    description="The reference from the payment rail confirming execution. This links the governance decision to the actual settlement."
                    advantages={[
                      "End-to-end traceability from decision to settlement",
                      "Execution reference sealed in Evidence Pack",
                      "Enables reconciliation with external systems",
                    ]}
                    legacyComparison={{
                      legacy: "Execution references stored separately. Manual correlation required between approval and settlement.",
                      turing: "Execution reference captured in Evidence Pack. Complete chain from decision to settlement in one record.",
                    }}
                    side="left"
                    showIcon={false}
                  >
                    <div className="cursor-help">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Execution Reference</p>
                      <p className="font-mono text-sm text-zinc-300">{selectedPayment.executionRef}</p>
                    </div>
                  </Explainer>
                )}

                {/* Failure Reason */}
                {selectedPayment.failureReason && (
                  <Explainer {...EXPLAINER_CONTENT.failureRate} side="left" showIcon={false}>
                    <div className="bg-rose-900/20 border border-rose-800 rounded-lg p-4 cursor-help">
                      <p className="text-xs text-rose-400 uppercase tracking-wider mb-1">Failure Reason</p>
                      <p className="text-sm text-rose-300">{selectedPayment.failureReason}</p>
                    </div>
                  </Explainer>
                )}

                {/* Action CTA */}
                <div className="pt-4 border-t border-zinc-800">
                  <PaymentActionFull payment={selectedPayment} />
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: PaymentStatus }) {
  const config: Record<PaymentStatus, { icon: React.ReactNode; className: string; label: string }> = {
    SUBMITTED: { 
      icon: <Clock className="h-3 w-3" />, 
      className: "bg-blue-900/50 text-blue-400",
      label: "Submitted"
    },
    POSTED: { 
      icon: <CheckCircle2 className="h-3 w-3" />, 
      className: "bg-emerald-900/50 text-emerald-400",
      label: "Posted"
    },
    FAILED: { 
      icon: <XCircle className="h-3 w-3" />, 
      className: "bg-rose-900/50 text-rose-400",
      label: "Failed"
    },
    BLOCKED: { 
      icon: <AlertTriangle className="h-3 w-3" />, 
      className: "bg-amber-900/50 text-amber-400",
      label: "Blocked"
    },
  };

  const { icon, className, label } = config[status];

  return (
    <Badge className={`${className} flex items-center gap-1`}>
      {icon}
      {label}
    </Badge>
  );
}

// Payment Action Component (table cell)
function PaymentAction({ payment }: { payment: Payment }) {
  if (payment.status === "BLOCKED" && !payment.decisionId) {
    return (
      <Link href="/inbox">
        <Button size="sm" variant="outline" className="border-orange-700 text-orange-400 hover:bg-orange-900/20 h-7 text-xs">
          <Plus className="h-3 w-3 mr-1" />
          Create Decision
        </Button>
      </Link>
    );
  }

  if (payment.decisionId) {
    return (
      <Link href={`/decisions/${payment.decisionId}`}>
        <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white h-7 text-xs">
          Open Decision
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </Link>
    );
  }

  if (payment.status === "FAILED") {
    return (
      <Link href="/inbox">
        <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 h-7 text-xs">
          <Plus className="h-3 w-3 mr-1" />
          Create Retry Decision
        </Button>
      </Link>
    );
  }

  return <span className="text-zinc-600">—</span>;
}

// Payment Action Component (drawer - full)
function PaymentActionFull({ payment }: { payment: Payment }) {
  if (payment.status === "BLOCKED" && !payment.decisionId) {
    return (
      <Explainer {...EXPLAINER_CONTENT.decisionActions} side="top" showIcon={false}>
        <div className="space-y-2 cursor-help">
          <p className="text-xs text-zinc-500">This payment is blocked by policy. Create a decision to resolve.</p>
          <Link href="/inbox">
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Decision (PAYMENT)
            </Button>
          </Link>
        </div>
      </Explainer>
    );
  }

  if (payment.decisionId) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-zinc-500">This payment has a linked decision.</p>
        <Link href={`/decisions/${payment.decisionId}`}>
          <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Decision {payment.decisionId}
          </Button>
        </Link>
      </div>
    );
  }

  if (payment.status === "FAILED") {
    return (
      <div className="space-y-2">
        <p className="text-xs text-zinc-500">This payment failed. Create a retry decision if permitted.</p>
        <Link href="/inbox">
          <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <Plus className="h-4 w-4 mr-2" />
            Create Decision (PAYMENT_RETRY)
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <p className="text-xs text-zinc-500 text-center">No actions available for posted payments.</p>
  );
}

// Helper function
function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return date.toLocaleDateString();
}
