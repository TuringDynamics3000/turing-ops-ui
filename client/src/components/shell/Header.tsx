import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser } from "@/lib/auth";
import { Shield, Bell } from "lucide-react";

export function Header() {
  const user = getCurrentUser();

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Left: Identity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img src="/images/shield-logo.png" alt="Shield" className="h-8 w-8" />
          <div>
            <div className="font-bold text-sm tracking-tight uppercase">TuringDynamics Core</div>
            <div className="text-[10px] text-muted-foreground tracking-widest uppercase">System Governance</div>
          </div>
        </div>
      </div>

      {/* Center: Context Badges */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="font-mono text-xs tracking-wider border-zinc-700 text-zinc-400">PRODUCTION</Badge>
        <Badge variant="outline" className="font-mono text-xs tracking-wider border-zinc-700 text-zinc-400">EU-WEST-1</Badge>
        <Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-800 hover:bg-emerald-900/50 font-mono text-xs tracking-wider">SLA OK</Badge>
      </div>

      {/* Right: User & Alerts */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-orange-500 animate-pulse">
          <Bell className="h-4 w-4" />
          <span className="text-xs font-bold font-mono">3 PENDING</span>
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
