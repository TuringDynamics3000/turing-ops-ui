import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser } from "@/lib/auth";
import { Bell } from "lucide-react";
import { ScopeSelector, ActiveScope } from "@/components/scope/ScopeSelector";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

// Store active scope in localStorage for persistence
const SCOPE_STORAGE_KEY = "turing-active-scope";

function getStoredScope(): ActiveScope {
  try {
    const stored = localStorage.getItem(SCOPE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Ignore parse errors
  }
  return { type: "platform", name: "All Entities" };
}

function storeScope(scope: ActiveScope) {
  localStorage.setItem(SCOPE_STORAGE_KEY, JSON.stringify(scope));
}

export function Header() {
  const user = getCurrentUser();
  const [activeScope, setActiveScope] = useState<ActiveScope>(getStoredScope);
  
  // Get pending decisions count
  const { data: pendingDecisions } = trpc.decisions.list.useQuery({ status: "PENDING" });
  const pendingCount = pendingDecisions?.length || 0;

  const handleScopeChange = (scope: ActiveScope) => {
    setActiveScope(scope);
    storeScope(scope);
    // Emit custom event for other components to react to scope change
    window.dispatchEvent(new CustomEvent("scope-change", { detail: scope }));
  };

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Left: Identity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img src="/images/turing-logo.png" alt="TuringDynamics" className="h-8 w-8" />
          <div>
            <div className="font-bold text-sm tracking-tight uppercase">TuringDynamics Core</div>
            <div className="text-[10px] text-muted-foreground tracking-widest uppercase">System Governance</div>
          </div>
        </div>
      </div>

      {/* Center: Context Badges + Scope Selector */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="font-mono text-xs tracking-wider border-zinc-700 text-zinc-400">PRODUCTION</Badge>
        <Badge variant="outline" className="font-mono text-xs tracking-wider border-zinc-700 text-zinc-400">EU-WEST-1</Badge>
        <Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-800 hover:bg-emerald-900/50 font-mono text-xs tracking-wider">SLA OK</Badge>
        
        {/* Scope Selector - Multi-Entity Consolidation */}
        <div className="h-6 w-[1px] bg-border mx-1"></div>
        <ScopeSelector activeScope={activeScope} onScopeChange={handleScopeChange} />
      </div>

      {/* Right: User & Alerts */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-orange-500 animate-pulse">
          <Bell className="h-4 w-4" />
          <span className="text-xs font-bold font-mono">{pendingCount} PENDING</span>
        </div>

        <div className="h-8 w-[1px] bg-border"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <div className="text-sm font-medium leading-none">{user.name}</div>
            <div className="text-[10px] text-muted-foreground mt-1 font-mono uppercase">{user.role}</div>
          </div>
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

// Export hook for other components to access current scope
export function useActiveScope(): ActiveScope {
  const [scope, setScope] = useState<ActiveScope>(getStoredScope);

  useEffect(() => {
    const handleScopeChange = (e: CustomEvent<ActiveScope>) => {
      setScope(e.detail);
    };

    window.addEventListener("scope-change", handleScopeChange as EventListener);
    return () => {
      window.removeEventListener("scope-change", handleScopeChange as EventListener);
    };
  }, []);

  return scope;
}
