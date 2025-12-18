import * as React from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info, Zap, Shield, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExplainerContent {
  title: string;
  description: string;
  advantages?: string[];
  legacyComparison?: {
    legacy: string;
    turing: string;
  };
}

interface ExplainerProps {
  children: React.ReactNode;
  content?: ExplainerContent;
  title?: string;
  description?: string;
  advantages?: string[];
  legacyComparison?: {
    legacy: string;
    turing: string;
  };
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  showIcon?: boolean;
}

export function Explainer({
  children,
  content,
  title: titleProp,
  description: descriptionProp,
  advantages: advantagesProp,
  legacyComparison: legacyComparisonProp,
  className,
  side = "top",
  showIcon = true,
}: ExplainerProps) {
  // Support both direct props and content object
  const title = content?.title ?? titleProp ?? "";
  const description = content?.description ?? descriptionProp ?? "";
  const advantages = content?.advantages ?? advantagesProp;
  const legacyComparison = content?.legacyComparison ?? legacyComparisonProp;
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className={cn("relative cursor-help group", className)}>
          {children}
          {showIcon && (
            <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Info className="h-3 w-3 text-orange-500" />
            </div>
          )}
        </div>
      </HoverCardTrigger>
      <HoverCardContent 
        side={side} 
        className="w-[380px] bg-zinc-900 border-zinc-700 p-0 shadow-xl"
        sideOffset={8}
      >
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-orange-500" />
            <h4 className="font-semibold text-white text-sm">{title}</h4>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">{description}</p>
        </div>
        
        {advantages && advantages.length > 0 && (
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-3 w-3 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                TuringDynamics Advantage
              </span>
            </div>
            <ul className="space-y-1.5">
              {advantages.map((advantage, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{advantage}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {legacyComparison && (
          <div className="p-4 bg-zinc-950/50">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3">
              Legacy System Comparison
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-rose-950/30 border border-rose-900/50 rounded p-2.5">
                <div className="text-[9px] font-bold text-rose-400 uppercase tracking-wider mb-1">
                  Constantinople / Thought Machine
                </div>
                <p className="text-[11px] text-rose-300/80 leading-relaxed">
                  {legacyComparison.legacy}
                </p>
              </div>
              <div className="bg-emerald-950/30 border border-emerald-900/50 rounded p-2.5">
                <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  TuringDynamics Core
                </div>
                <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                  {legacyComparison.turing}
                </p>
              </div>
            </div>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
