import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: "emerald" | "orange" | "rose" | "blue" | "purple" | "zinc";
  showArea?: boolean;
  animated?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = "emerald",
  showArea = true,
  animated = true,
  className,
}: SparklineProps) {
  const colors = {
    emerald: { stroke: "#10b981", fill: "rgba(16, 185, 129, 0.1)" },
    orange: { stroke: "#f97316", fill: "rgba(249, 115, 22, 0.1)" },
    rose: { stroke: "#f43f5e", fill: "rgba(244, 63, 94, 0.1)" },
    blue: { stroke: "#3b82f6", fill: "rgba(59, 130, 246, 0.1)" },
    purple: { stroke: "#a855f7", fill: "rgba(168, 85, 247, 0.1)" },
    zinc: { stroke: "#71717a", fill: "rgba(113, 113, 122, 0.1)" },
  };

  const { pathD, areaD, points } = useMemo(() => {
    if (data.length < 2) return { pathD: "", areaD: "", points: [] };

    const padding = 2;
    const effectiveWidth = width - padding * 2;
    const effectiveHeight = height - padding * 2;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => ({
      x: padding + (index / (data.length - 1)) * effectiveWidth,
      y: padding + effectiveHeight - ((value - min) / range) * effectiveHeight,
    }));

    // Create smooth curve using quadratic bezier
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      pathD += ` Q ${prev.x + (curr.x - prev.x) * 0.5} ${prev.y}, ${cpX} ${(prev.y + curr.y) / 2}`;
      if (i === points.length - 1) {
        pathD += ` T ${curr.x} ${curr.y}`;
      }
    }

    // Simpler path for area
    let areaD = `M ${points[0].x} ${height - padding}`;
    areaD += ` L ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      areaD += ` L ${points[i].x} ${points[i].y}`;
    }
    areaD += ` L ${points[points.length - 1].x} ${height - padding}`;
    areaD += ` Z`;

    return { pathD, areaD, points };
  }, [data, width, height]);

  if (data.length < 2) {
    return (
      <div 
        className={cn("flex items-center justify-center text-zinc-600 text-xs", className)}
        style={{ width, height }}
      >
        —
      </div>
    );
  }

  const { stroke, fill } = colors[color];
  const lastPoint = points[points.length - 1];

  return (
    <svg 
      width={width} 
      height={height} 
      className={cn("overflow-visible", className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id={`sparkline-gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.3" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      {showArea && (
        <path
          d={areaD}
          fill={`url(#sparkline-gradient-${color})`}
          className={animated ? "animate-in fade-in duration-1000" : ""}
        />
      )}

      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? "animate-in fade-in slide-in-from-left-2 duration-1000" : ""}
      />

      {/* End point dot */}
      {lastPoint && (
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="2.5"
          fill={stroke}
          className={animated ? "animate-in zoom-in duration-500 delay-500" : ""}
        />
      )}
    </svg>
  );
}

// Generate mock trend data
export function generateTrendData(
  baseValue: number,
  variance: number = 0.1,
  points: number = 12,
  trend: "up" | "down" | "stable" = "stable"
): number[] {
  const data: number[] = [];
  let value = baseValue * (1 - variance);
  
  const trendFactor = trend === "up" ? 0.02 : trend === "down" ? -0.02 : 0;
  
  for (let i = 0; i < points; i++) {
    const randomVariance = (Math.random() - 0.5) * variance * baseValue;
    const trendAdjustment = trendFactor * baseValue * i;
    value = baseValue + randomVariance + trendAdjustment;
    data.push(Math.max(0, value));
  }
  
  return data;
}
