import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Explainer } from "@/components/ui/explainer";
import { Building2, Users, ChevronDown, Globe } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

export type ScopeType = "platform" | "entity" | "group";

export interface ActiveScope {
  type: ScopeType;
  entityId?: number;
  groupId?: number;
  name: string;
}

interface ScopeSelectorProps {
  activeScope: ActiveScope;
  onScopeChange: (scope: ActiveScope) => void;
}

export function ScopeSelector({ activeScope, onScopeChange }: ScopeSelectorProps) {
  const [open, setOpen] = useState(false);
  
  // Fetch entities and groups
  const { data: entitiesData } = trpc.entities.list.useQuery();
  const { data: groupsData } = trpc.groups.list.useQuery();
  
  const entities = entitiesData || [];
  const groups = groupsData || [];

  const getScopeIcon = (type: ScopeType) => {
    switch (type) {
      case "platform":
        return <Globe className="h-4 w-4" />;
      case "entity":
        return <Building2 className="h-4 w-4" />;
      case "group":
        return <Users className="h-4 w-4" />;
    }
  };

  const getScopeBadgeClass = (type: ScopeType) => {
    switch (type) {
      case "platform":
        return "bg-zinc-800 text-zinc-300";
      case "entity":
        return "bg-cyan-950/50 text-cyan-400 border-cyan-800";
      case "group":
        return "bg-blue-950/50 text-blue-400 border-blue-800";
    }
  };

  return (
    <Explainer
      title="Scope Selector"
      description="Switch between Platform, Entity, and Group views. Entity scope shows decisions for a single legal entity. Group scope shows consolidated decisions across multiple entities (read-only consolidation)."
      advantages={[
        "Clear separation between entity and group views",
        "Group scope never implies entity authority",
        "Consolidated view for oversight without action rights",
      ]}
      legacyComparison={{
        legacy: "Multi-entity views often blur boundaries between entities. Group-level actions may bypass entity-level controls.",
        turing: "Entity boundaries are always explicit. Group consolidation is read-only - every action requires entity-level authority.",
      }}
      side="bottom"
      showIcon={false}
    >
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-8 gap-2 border-zinc-700 bg-zinc-900 hover:bg-zinc-800",
              activeScope.type === "entity" && "border-cyan-800/50",
              activeScope.type === "group" && "border-blue-800/50"
            )}
          >
            {getScopeIcon(activeScope.type)}
            <span className="max-w-[120px] truncate text-sm">
              {activeScope.name}
            </span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 bg-zinc-900 border-zinc-800">
          <DropdownMenuLabel className="text-xs text-zinc-500 uppercase tracking-wider">
            Platform
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              onScopeChange({ type: "platform", name: "All Entities" });
              setOpen(false);
            }}
            className={cn(
              "cursor-pointer",
              activeScope.type === "platform" && "bg-zinc-800"
            )}
          >
            <Globe className="h-4 w-4 mr-2 text-zinc-400" />
            <span>All Entities</span>
            {activeScope.type === "platform" && (
              <Badge variant="outline" className="ml-auto text-[10px] bg-zinc-800">
                Active
              </Badge>
            )}
          </DropdownMenuItem>

          {entities.length > 0 && (
            <>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuLabel className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="h-3 w-3" />
                Entities
              </DropdownMenuLabel>
              {entities.map((entity) => (
                <DropdownMenuItem
                  key={entity.id}
                  onClick={() => {
                    onScopeChange({
                      type: "entity",
                      entityId: entity.id,
                      name: entity.legalName,
                    });
                    setOpen(false);
                  }}
                  className={cn(
                    "cursor-pointer",
                    activeScope.type === "entity" && activeScope.entityId === entity.id && "bg-cyan-950/30"
                  )}
                >
                  <Building2 className="h-4 w-4 mr-2 text-cyan-500" />
                  <div className="flex flex-col">
                    <span className="text-sm">{entity.legalName}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{entity.entityId}</span>
                  </div>
                  {activeScope.type === "entity" && activeScope.entityId === entity.id && (
                    <Badge variant="outline" className="ml-auto text-[10px] bg-cyan-950/50 text-cyan-400 border-cyan-800">
                      Active
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </>
          )}

          {groups.length > 0 && (
            <>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuLabel className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Users className="h-3 w-3" />
                Groups (Read-Only Consolidation)
              </DropdownMenuLabel>
              {groups.map((group) => (
                <DropdownMenuItem
                  key={group.id}
                  onClick={() => {
                    onScopeChange({
                      type: "group",
                      groupId: group.id,
                      name: group.name,
                    });
                    setOpen(false);
                  }}
                  className={cn(
                    "cursor-pointer",
                    activeScope.type === "group" && activeScope.groupId === group.id && "bg-blue-950/30"
                  )}
                >
                  <Users className="h-4 w-4 mr-2 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-sm">{group.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{group.groupId}</span>
                  </div>
                  {activeScope.type === "group" && activeScope.groupId === group.id && (
                    <Badge variant="outline" className="ml-auto text-[10px] bg-blue-950/50 text-blue-400 border-blue-800">
                      Active
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </>
          )}

          <DropdownMenuSeparator className="bg-zinc-800" />
          <div className="px-2 py-1.5 text-[10px] text-zinc-500">
            <strong className="text-orange-500">Note:</strong> Group scope provides consolidated visibility only. 
            Actions require entity-level authority.
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </Explainer>
  );
}
