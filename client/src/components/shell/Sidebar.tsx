import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Inbox, 
  Activity, 
  CheckCircle2, 
  CreditCard, 
  BookOpen, 
  ShieldAlert, 
  Scale, 
  FileText, 
  Download, 
  Server, 
  Settings 
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
      <NavSection title="Decisions">
        <NavItem href="/decisions/inbox" icon={Inbox} label="Inbox" active={location === "/decisions/inbox" || location === "/"} />
        <NavItem href="/decisions/active" icon={Activity} label="Active" active={location === "/decisions/active"} />
        <NavItem href="/decisions/completed" icon={CheckCircle2} label="Completed" active={location === "/decisions/completed"} />
      </NavSection>

      <NavSection title="Execution">
        <NavItem href="/ledger/payments" icon={CreditCard} label="Payments Ledger" active={location === "/ledger/payments"} />
        <NavItem href="/ledger/journals" icon={BookOpen} label="Journals" active={location === "/ledger/journals"} />
      </NavSection>

      <NavSection title="Risk & Controls">
        <NavItem href="/limits" icon={Scale} label="Limits & Overrides" active={location === "/limits"} />
        <NavItem href="/risk" icon={ShieldAlert} label="AML & Risk" active={location === "/risk"} />
      </NavSection>

      <NavSection title="Evidence">
        <NavItem href="/evidence" icon={FileText} label="Evidence Packs" active={location === "/evidence"} />
        <NavItem href="/audit" icon={Download} label="Audit Exports" active={location === "/audit"} />
      </NavSection>

      <NavSection title="System">
        <NavItem href="/system/health" icon={Server} label="Health" active={location === "/system/health"} />
        <NavItem href="/system/config" icon={Settings} label="Configuration" active={location === "/system/config"} />
      </NavSection>
    </aside>
  );
}
