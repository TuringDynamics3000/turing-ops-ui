import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard,
  Inbox, 
  CreditCard, 
  BookOpen, 
  ShieldAlert, 
  FileText, 
  Search,
  FileBarChart,
  Settings,
  Shield
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

function NavItem({ href, icon: Icon, label, active }: NavItemProps) {
  return (
    <Link href={href}>
      <div className={cn(
        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-sm transition-colors cursor-pointer group",
        active 
          ? "bg-zinc-800 text-white border-l-2 border-orange-500" 
          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
      )}>
        <Icon className={cn("h-4 w-4", active ? "text-orange-500" : "text-zinc-500 group-hover:text-zinc-400")} />
        <span>{label}</span>
      </div>
    </Link>
  );
}

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="px-3 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{title}</h3>
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );
}

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-[260px] border-r border-border bg-zinc-950/50 flex flex-col h-full overflow-y-auto py-6 px-3">
      {/* Executive Overview */}
      <NavSection title="Overview">
        <NavItem 
          href="/overview" 
          icon={LayoutDashboard} 
          label="Executive Overview" 
          active={location === "/overview" || location === "/"} 
        />
      </NavSection>

      {/* Decision Inbox - Authoritative Workflow */}
      <NavSection title="Decisions">
        <NavItem 
          href="/inbox" 
          icon={Inbox} 
          label="Decision Inbox" 
          active={location === "/inbox" || location.startsWith("/decisions")} 
        />
      </NavSection>

      {/* State Explorers - Read-only Derived State */}
      <NavSection title="State Explorers">
        <NavItem 
          href="/state/payments" 
          icon={CreditCard} 
          label="Payments" 
          active={location === "/state/payments"} 
        />
        <NavItem 
          href="/state/ledger" 
          icon={BookOpen} 
          label="Ledger" 
          active={location === "/state/ledger"} 
        />
        <NavItem 
          href="/state/risk" 
          icon={ShieldAlert} 
          label="Risk" 
          active={location === "/state/risk"} 
        />
      </NavSection>

      {/* Evidence Library */}
      <NavSection title="Evidence">
        <NavItem 
          href="/evidence" 
          icon={FileText} 
          label="Evidence Library" 
          active={location === "/evidence"} 
        />
      </NavSection>

      {/* Global Search */}
      <NavSection title="Search">
        <NavItem 
          href="/search" 
          icon={Search} 
          label="Global Search" 
          active={location === "/search"} 
        />
      </NavSection>

      {/* Board Pack */}
      <NavSection title="Reporting">
        <NavItem 
          href="/board-pack" 
          icon={FileBarChart} 
          label="Board Pack" 
          active={location === "/board-pack"} 
        />
      </NavSection>

      {/* System */}
      <NavSection title="System">
        <NavItem 
          href="/system/authority" 
          icon={Shield} 
          label="Authority Matrix" 
          active={location === "/system/authority"} 
        />
        <NavItem 
          href="/system/config" 
          icon={Settings} 
          label="Configuration" 
          active={location === "/system/config"} 
        />
      </NavSection>
    </aside>
  );
}
