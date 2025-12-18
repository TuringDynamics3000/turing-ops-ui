import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Decision } from "@/lib/decisions";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, ArrowRight } from "lucide-react";

interface DecisionRowProps {
  decision: Decision;
}

export function DecisionRow({ decision }: DecisionRowProps) {
  const isCritical = decision.risk === "CRITICAL" || decision.risk === "HIGH";
  const isSlaRisk = decision.slaSecondsRemaining < 60;

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-200 hover:border-zinc-600 border-zinc-800 bg-zinc-900/50",
      isCritical && "border-l-4 border-l-orange-500"
    )}>
      <div className="p-5 flex items-center justify-between gap-6">
        {/* Left: Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className={cn(
              "font-mono text-[10px] tracking-wider uppercase rounded-sm px-1.5 py-0.5 border-zinc-700",
              decision.type === "PAYMENT" && "text-emerald-400 bg-emerald-950/30",
              decision.type === "LIMIT_OVERRIDE" && "text-amber-400 bg-amber-950/30",
              decision.type === "AML_EXCEPTION" && "text-rose-400 bg-rose-950/30"
            )}>
              {decision.type.replace("_", " ")}
            </Badge>
            
            <span className="text-xs text-zinc-500 font-mono">
              {decision.id}
            </span>

            {isCritical && (
              <div className="flex items-center gap-1 text-orange-500 text-xs font-bold uppercase tracking-wider animate-pulse">
                <AlertTriangle className="h-3 w-3" />
                <span>Risk: {decision.risk}</span>
              </div>
            )}
          </div>

          <h3 className="text-base font-medium text-zinc-100 truncate pr-4">
            {decision.subject}
          </h3>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400 font-mono">
            <span>Policy: <span className="text-zinc-300">{decision.policy}</span></span>
            <span className="text-zinc-700">|</span>
            <span>Auth: <span className="text-zinc-300">{decision.requiredAuthority}</span></span>
          </div>
        </div>

        {/* Right: SLA & Action */}
        <div className="flex items-center gap-6 shrink-0">
          <div className={cn(
            "flex items-center gap-2 font-mono text-sm tabular-nums",
            isSlaRisk ? "text-rose-500 font-bold" : "text-zinc-400"
          )}>
            <Clock className="h-4 w-4" />
            <span>00:0{Math.floor(decision.slaSecondsRemaining / 60)}:{String(decision.slaSecondsRemaining % 60).padStart(2, '0')}</span>
          </div>

          <Link href={`/decisions/${decision.id}`}>
            <Button 
              size="sm" 
              className="bg-zinc-100 text-zinc-900 hover:bg-white font-medium rounded-sm px-4 h-9 transition-transform active:scale-95"
            >
              Review Decision
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
