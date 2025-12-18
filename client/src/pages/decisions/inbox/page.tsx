import { DecisionRow } from "@/components/inbox/DecisionRow";
import { trpc } from "@/lib/trpc";
import { Filter, SlidersHorizontal, Loader2, Building2, Users, Globe, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useActiveScope } from "@/components/shell/Header";
import { useMemo } from "react";
import { Explainer } from "@/components/ui/explainer";

export default function InboxPage() {
  const { data: decisions, isLoading, error } = trpc.decisions.list.useQuery({ status: "PENDING" });
  const { data: entities } = trpc.entities.list.useQuery();
  const { data: groups } = trpc.groups.list.useQuery();
  
  const activeScope = useActiveScope();

  // Build entity lookup map
  const entityMap = useMemo(() => {
    const map = new Map<number, string>();
    entities?.forEach(e => map.set(e.id, e.legalName));
    return map;
  }, [entities]);

  // Build group member entity IDs (for group scope filtering)
  const { data: groupMembers } = trpc.groups.getMembers.useQuery(
    { groupId: activeScope.groupId || 0 },
    { enabled: activeScope.type === "group" && !!activeScope.groupId }
  );

  const groupMemberEntityIds = useMemo(() => {
    if (!groupMembers) return new Set<number>();
    return new Set(groupMembers.map(m => m.entityId));
  }, [groupMembers]);

  // Filter decisions based on active scope
  const filteredDecisions = useMemo(() => {
    if (!decisions) return [];

    switch (activeScope.type) {
      case "platform":
        // Show all decisions
        return decisions;
      
      case "entity":
        // Show only decisions for this entity
        return decisions.filter(d => d.entityId === activeScope.entityId);
      
      case "group":
        // Show decisions for any entity in the group
        return decisions.filter(d => 
          d.entityId !== null && groupMemberEntityIds.has(d.entityId)
        );
      
      default:
        return decisions;
    }
  }, [decisions, activeScope, groupMemberEntityIds]);

  // Determine if we should show entity badges (always in group scope, optionally in platform scope)
  const showEntityBadges = activeScope.type === "group" || activeScope.type === "platform";

  // Get scope display info
  const getScopeInfo = () => {
    switch (activeScope.type) {
      case "platform":
        return {
          icon: <Globe className="h-4 w-4 text-zinc-400" />,
          label: "All Entities",
          badgeClass: "bg-zinc-800 text-zinc-300",
        };
      case "entity":
        return {
          icon: <Building2 className="h-4 w-4 text-cyan-500" />,
          label: activeScope.name,
          badgeClass: "bg-cyan-950/50 text-cyan-400 border-cyan-800",
        };
      case "group":
        return {
          icon: <Users className="h-4 w-4 text-blue-500" />,
          label: activeScope.name,
          badgeClass: "bg-blue-950/50 text-blue-400 border-blue-800",
        };
    }
  };

  const scopeInfo = getScopeInfo();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-red-500">
        Error loading decisions: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">Decision Inbox</h1>
            <Explainer
              title="Scope-Filtered Inbox"
              description={`Viewing decisions for ${activeScope.type === "platform" ? "all entities" : activeScope.name}. ${activeScope.type === "group" ? "Group scope provides consolidated visibility only - actions require entity-level authority." : ""}`}
              advantages={[
                "Decisions filtered by current scope",
                "Entity badges visible in group/platform views",
                "Group scope never implies entity authority",
              ]}
              legacyComparison={{
                legacy: "Multi-entity views often show all decisions without clear entity context. Bulk actions may cross entity boundaries.",
                turing: "Every decision shows its entity context. Group consolidation is read-only - each action requires explicit entity authority.",
              }}
              side="bottom"
              showIcon={false}
            >
              <Badge variant="outline" className={`font-mono text-[10px] tracking-wider rounded-sm px-1.5 py-0.5 border-zinc-700 flex items-center gap-1 cursor-help ${scopeInfo.badgeClass}`}>
                {scopeInfo.icon}
                {scopeInfo.label}
              </Badge>
            </Explainer>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            {filteredDecisions.length} items requiring immediate authority.
            {activeScope.type === "group" && (
              <span className="text-blue-400 ml-2 text-xs">
                (Consolidated view - actions require entity authority)
              </span>
            )}
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

      {/* Group Scope Warning */}
      {activeScope.type === "group" && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-950/20 border border-blue-900/50">
          <AlertTriangle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-300">Group Consolidation Mode</h4>
            <p className="text-xs text-blue-400/70 mt-1">
              You are viewing decisions across multiple entities in <strong>{activeScope.name}</strong>. 
              This is a read-only consolidated view. To take action on a decision, you must have 
              explicit authority over the specific entity. Group scope never implies entity authority.
            </p>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filteredDecisions.length > 0 ? (
          filteredDecisions.map((decision) => (
            <DecisionRow 
              key={decision.id} 
              decision={decision} 
              entityLegalName={showEntityBadges && decision.entityId ? entityMap.get(decision.entityId) : undefined}
            />
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-zinc-800 rounded-lg bg-zinc-900/20">
            <img 
              src="/images/empty-state-inbox.png" 
              alt="All Clear" 
              className="h-48 w-auto opacity-50 mb-6 grayscale hover:grayscale-0 transition-all duration-500"
            />
            <h3 className="text-lg font-medium text-zinc-200">
              {activeScope.type === "platform" ? "All Clear" : `No Decisions for ${activeScope.name}`}
            </h3>
            <p className="text-sm text-zinc-500 mt-2 max-w-sm">
              {activeScope.type === "platform" 
                ? "No pending decisions. System is operating within established parameters."
                : `No pending decisions for this ${activeScope.type}. Try switching to a different scope.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
