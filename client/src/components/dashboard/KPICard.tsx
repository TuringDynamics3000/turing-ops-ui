import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  highlight?: boolean;
  pulse?: boolean;
  accentColor?: "emerald" | "orange" | "rose" | "blue" | "purple";
}

// Animated number counter hook with smooth transitions on data refresh
export function useAnimatedNumber(targetValue: number, duration: number = 800) {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(targetValue);
  const previousTargetRef = useRef(targetValue);

  useEffect(() => {
    // Skip animation if target hasn't changed
    if (previousTargetRef.current === targetValue) return;
    
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    startValueRef.current = displayValue;
    startTimeRef.current = null;
    previousTargetRef.current = targetValue;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth deceleration (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValueRef.current + (targetValue - startValueRef.current) * easeOut;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration]);

  return displayValue;
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendUp, 
  icon,
  highlight,
  pulse,
  accentColor = "emerald"
}: KPICardProps) {
  // Parse numeric value for animation
  const numericValue = typeof value === "number" ? value : parseFloat(value.replace(/[^0-9.]/g, ""));
  const isNumeric = !isNaN(numericValue) && typeof value !== "string";
  const animatedValue = useAnimatedNumber(isNumeric ? numericValue : 0, 1200);
  
  // Format the display value
  const displayValue = isNumeric 
    ? Math.round(animatedValue).toLocaleString()
    : value;

  const accentColors = {
    emerald: {
      glow: "shadow-emerald-500/10",
      border: "border-emerald-800/50",
      icon: "text-emerald-500",
      pulse: "bg-emerald-500",
    },
    orange: {
      glow: "shadow-orange-500/10",
      border: "border-orange-800/50",
      icon: "text-orange-500",
      pulse: "bg-orange-500",
    },
    rose: {
      glow: "shadow-rose-500/10",
      border: "border-rose-800/50",
      icon: "text-rose-500",
      pulse: "bg-rose-500",
    },
    blue: {
      glow: "shadow-blue-500/10",
      border: "border-blue-800/50",
      icon: "text-blue-500",
      pulse: "bg-blue-500",
    },
    purple: {
      glow: "shadow-purple-500/10",
      border: "border-purple-800/50",
      icon: "text-purple-500",
      pulse: "bg-purple-500",
    },
  };

  const colors = accentColors[accentColor];

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      "bg-gradient-to-br from-zinc-900/80 to-zinc-900/40",
      "border-zinc-800 hover:border-zinc-700",
      "hover:shadow-lg hover:shadow-black/20",
      "group cursor-default",
      highlight && "border-rose-800 shadow-rose-500/5",
      pulse && colors.glow
    )}>
      {/* Subtle gradient overlay on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        "bg-gradient-to-br from-white/[0.02] to-transparent"
      )} />
      
      {/* Animated corner accent */}
      <div className={cn(
        "absolute top-0 right-0 w-20 h-20 -translate-y-10 translate-x-10",
        "bg-gradient-to-br from-white/[0.03] to-transparent",
        "rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"
      )} />

      <div className="relative p-5">
        <div className="flex items-start justify-between">
          <div className={cn(
            "p-2 rounded-lg bg-zinc-800/50 transition-colors duration-300",
            "group-hover:bg-zinc-800",
            highlight && "bg-rose-900/30",
            colors.icon
          )}>
            {icon}
          </div>
          
          <div className="flex items-center gap-2">
            {pulse && (
              <span className="relative flex h-2 w-2">
                <span className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  colors.pulse
                )} />
                <span className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  colors.pulse
                )} />
              </span>
            )}
            
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                trendUp 
                  ? "text-emerald-400 bg-emerald-900/30" 
                  : "text-rose-400 bg-rose-900/30"
              )}>
                {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {trend}
              </div>
            )}
          </div>
        </div>

        {/* Value with animated entrance */}
        <div className="mt-4">
          <p className={cn(
            "text-3xl font-bold tracking-tight",
            "bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent",
            highlight && "from-rose-100 to-rose-300"
          )}>
            {displayValue}
          </p>
        </div>

        {/* Title and subtitle */}
        <div className="mt-2 space-y-1">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
            {title}
          </p>
          <p className="text-xs text-zinc-400">
            {subtitle}
          </p>
        </div>

        {/* Bottom accent line */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-[2px]",
          "bg-gradient-to-r from-transparent via-zinc-700 to-transparent",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        )} />
      </div>
    </Card>
  );
}

// Compact variant for smaller displays
export function KPICardCompact({ 
  title, 
  value, 
  icon,
  trend,
  trendUp,
  accentColor = "emerald"
}: Omit<KPICardProps, "subtitle" | "highlight" | "pulse">) {
  const accentColors = {
    emerald: "text-emerald-500",
    orange: "text-orange-500",
    rose: "text-rose-500",
    blue: "text-blue-500",
    purple: "text-purple-500",
  };

  return (
    <Card className={cn(
      "bg-zinc-900/50 border-zinc-800 p-4",
      "hover:border-zinc-700 transition-colors duration-300"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn("text-zinc-500", accentColors[accentColor])}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-white truncate">{value}</p>
          <p className="text-xs text-zinc-500 uppercase tracking-wider truncate">{title}</p>
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs",
            trendUp ? "text-emerald-400" : "text-rose-400"
          )}>
            {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </div>
        )}
      </div>
    </Card>
  );
}
