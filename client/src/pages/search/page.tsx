import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { 
  Search as SearchIcon, 
  FileText,
  Shield,
  CreditCard,
  ExternalLink,
  Loader2,
  Clock
} from "lucide-react";
import { Link } from "wouter";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Fetch all data for client-side search
  const { data: decisions } = trpc.decisions.list.useQuery();
  const { data: evidence } = trpc.evidence.list.useQuery();

  // Mock payments data (would come from API in production)
  const payments = useMemo(() => [
    { paymentRef: "PAY-84F3A19C", counterparty: "Acme Corp Ltd.", amount: 40000, status: "BLOCKED" },
    { paymentRef: "PAY-72B1C8D4", counterparty: "Telstra", amount: 5200, status: "POSTED" },
    { paymentRef: "PAY-9E4F2A7B", counterparty: "Unknown Beneficiary", amount: 15000, status: "FAILED" },
    { paymentRef: "PAY-3C8D1E5F", counterparty: "Smith & Associates", amount: 8500, status: "POSTED" },
    { paymentRef: "PAY-6A2B9C4D", counterparty: "Global Trading Co.", amount: 127500, status: "BLOCKED" },
  ], []);

  // Perform search across all data
  const searchResults = useMemo(() => {
    if (!query || query.length < 2) return null;

    const q = query.toLowerCase();

    const matchedDecisions = (decisions || []).filter(d => 
      d.decisionId.toLowerCase().includes(q) ||
      d.subject.toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q) ||
      d.policyCode.toLowerCase().includes(q) ||
      (d.justification && d.justification.toLowerCase().includes(q))
    );

    const matchedEvidence = (evidence || []).filter(e =>
      e.evidenceId.toLowerCase().includes(q) ||
      e.decisionId.toLowerCase().includes(q) ||
      (e.merkleHash && e.merkleHash.toLowerCase().includes(q)) ||
      (e.policySnapshot && e.policySnapshot.toLowerCase().includes(q))
    );

    const matchedPayments = payments.filter(p =>
      p.paymentRef.toLowerCase().includes(q) ||
      p.counterparty.toLowerCase().includes(q)
    );

    return {
      decisions: matchedDecisions,
      evidence: matchedEvidence,
      payments: matchedPayments,
      total: matchedDecisions.length + matchedEvidence.length + matchedPayments.length,
    };
  }, [query, decisions, evidence, payments]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Global Search</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Search across decisions, evidence packs, and payments
        </p>
      </div>

      {/* Search Input */}
      <Card className="bg-zinc-900/50 border-zinc-800 p-6">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
          <Input
            placeholder="Search by ID, subject, counterparty, policy, hash..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 h-12 text-lg bg-zinc-800 border-zinc-700 text-white"
            autoFocus
          />
        </div>
        {query.length > 0 && query.length < 2 && (
          <p className="text-xs text-zinc-500 mt-2">Enter at least 2 characters to search</p>
        )}
      </Card>

      {/* Search Results */}
      {searchResults && (
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>Found {searchResults.total} results for "{query}"</span>
          </div>

          {/* Decisions Results */}
          {searchResults.decisions.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Decisions ({searchResults.decisions.length})
              </h2>
              <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
                <div className="divide-y divide-zinc-800">
                  {searchResults.decisions.map((decision) => (
                    <Link key={decision.decisionId} href={`/decisions/${decision.decisionId}`}>
                      <div className="p-4 hover:bg-zinc-800/50 cursor-pointer transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(decision.status)}>
                              {decision.status}
                            </Badge>
                            <div>
                              <p className="text-white font-medium">{highlightMatch(decision.subject, query)}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-zinc-500 font-mono">{highlightMatch(decision.decisionId, query)}</span>
                                <span className="text-xs text-zinc-600">•</span>
                                <span className="text-xs text-zinc-500">{decision.type}</span>
                                <span className="text-xs text-zinc-600">•</span>
                                <Badge className={getRiskColor(decision.risk)} variant="outline">
                                  {decision.risk}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-zinc-500" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            </section>
          )}

          {/* Evidence Results */}
          {searchResults.evidence.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Evidence Packs ({searchResults.evidence.length})
              </h2>
              <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
                <div className="divide-y divide-zinc-800">
                  {searchResults.evidence.map((pack) => (
                    <Link key={pack.evidenceId} href={`/evidence?id=${pack.evidenceId}`}>
                      <div className="p-4 hover:bg-zinc-800/50 cursor-pointer transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-mono">{highlightMatch(pack.evidenceId, query)}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-zinc-500">Decision: {highlightMatch(pack.decisionId, query)}</span>
                              <span className="text-xs text-zinc-600">•</span>
                              <span className="text-xs text-zinc-500">{pack.action}</span>
                            </div>
                            {pack.merkleHash && (
                              <p className="text-xs text-zinc-600 font-mono mt-1 truncate max-w-md">
                                {highlightMatch(pack.merkleHash.slice(0, 32) + "...", query)}
                              </p>
                            )}
                          </div>
                          <ExternalLink className="h-4 w-4 text-zinc-500" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            </section>
          )}

          {/* Payments Results */}
          {searchResults.payments.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payments ({searchResults.payments.length})
              </h2>
              <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
                <div className="divide-y divide-zinc-800">
                  {searchResults.payments.map((payment) => (
                    <Link key={payment.paymentRef} href="/state/payments">
                      <div className="p-4 hover:bg-zinc-800/50 cursor-pointer transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={getPaymentStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                            <div>
                              <p className="text-white font-mono">{highlightMatch(payment.paymentRef, query)}</p>
                              <p className="text-xs text-zinc-400 mt-1">
                                ${payment.amount.toLocaleString()} AUD → {highlightMatch(payment.counterparty, query)}
                              </p>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-zinc-500" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            </section>
          )}

          {/* No Results */}
          {searchResults.total === 0 && (
            <Card className="bg-zinc-900/50 border-zinc-800 p-8 text-center">
              <SearchIcon className="h-8 w-8 mx-auto mb-2 text-zinc-600" />
              <p className="text-zinc-500">No results found for "{query}"</p>
              <p className="text-xs text-zinc-600 mt-1">Try searching by ID, subject, counterparty, or policy code</p>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!searchResults && (
        <Card className="bg-zinc-900/50 border-zinc-800 p-12 text-center">
          <SearchIcon className="h-12 w-12 mx-auto mb-4 text-zinc-700" />
          <h3 className="text-lg font-medium text-zinc-400">Search Everything</h3>
          <p className="text-sm text-zinc-500 mt-2 max-w-md mx-auto">
            Search across decisions, evidence packs, and payments. 
            Find by ID, subject, counterparty, policy code, or hash.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Badge variant="outline" className="border-zinc-700 text-zinc-500 cursor-pointer" onClick={() => setQuery("DEC-")}>
              DEC-*
            </Badge>
            <Badge variant="outline" className="border-zinc-700 text-zinc-500 cursor-pointer" onClick={() => setQuery("PAY-")}>
              PAY-*
            </Badge>
            <Badge variant="outline" className="border-zinc-700 text-zinc-500 cursor-pointer" onClick={() => setQuery("EVD-")}>
              EVD-*
            </Badge>
            <Badge variant="outline" className="border-zinc-700 text-zinc-500 cursor-pointer" onClick={() => setQuery("PAYMENT")}>
              PAYMENT
            </Badge>
            <Badge variant="outline" className="border-zinc-700 text-zinc-500 cursor-pointer" onClick={() => setQuery("AML")}>
              AML
            </Badge>
          </div>
        </Card>
      )}
    </div>
  );
}

// Helper function to highlight matching text
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || query.length < 2) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? (
      <span key={i} className="bg-orange-500/30 text-orange-300">{part}</span>
    ) : (
      part
    )
  );
}

// Helper functions
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-amber-900/50 text-amber-400",
    APPROVED: "bg-emerald-900/50 text-emerald-400",
    REJECTED: "bg-rose-900/50 text-rose-400",
    ESCALATED: "bg-orange-900/50 text-orange-400",
    EXECUTED: "bg-blue-900/50 text-blue-400",
  };
  return colors[status] || colors.PENDING;
}

function getRiskColor(risk: string): string {
  const colors: Record<string, string> = {
    LOW: "border-emerald-700 text-emerald-400",
    MEDIUM: "border-amber-700 text-amber-400",
    HIGH: "border-orange-700 text-orange-400",
    CRITICAL: "border-rose-700 text-rose-400",
  };
  return colors[risk] || colors.MEDIUM;
}

function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    SUBMITTED: "bg-blue-900/50 text-blue-400",
    POSTED: "bg-emerald-900/50 text-emerald-400",
    FAILED: "bg-rose-900/50 text-rose-400",
    BLOCKED: "bg-amber-900/50 text-amber-400",
  };
  return colors[status] || colors.SUBMITTED;
}
