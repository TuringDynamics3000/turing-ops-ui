import { DecisionRow } from "@/components/inbox/DecisionRow";
import { MOCK_DECISIONS } from "@/lib/decisions";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InboxPage() {
  const pendingDecisions = MOCK_DECISIONS.filter(d => d.status === "PENDING");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Decision Inbox</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {pendingDecisions.length} items requiring immediate authority.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 border-zinc-700 text-zinc-300 bg-zinc-900 hover:bg-zinc-800 hover:text-white">
            <Filter className="mr-2 h-3 w-3" />
            Filter: All
          </Button>
          <Button variant="outline" size="sm" className="h-8 border-zinc-700 text-zinc-300 bg-zinc-900 hover:bg-zinc-800 hover:text-white">
            <SlidersHorizontal className="mr-2 h-3 w-3" />
            Sort: SLA
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {pendingDecisions.length > 0 ? (
          pendingDecisions.map((decision) => (
            <DecisionRow key={decision.id} decision={decision} />
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-zinc-800 rounded-lg bg-zinc-900/20">
            <img 
              src="/images/empty-state-inbox.png" 
              alt="All Clear" 
              className="h-48 w-auto opacity-50 mb-6 grayscale hover:grayscale-0 transition-all duration-500"
            />
            <h3 className="text-lg font-medium text-zinc-200">All Clear</h3>
            <p className="text-sm text-zinc-500 mt-2 max-w-sm">
              No pending decisions. System is operating within established parameters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
