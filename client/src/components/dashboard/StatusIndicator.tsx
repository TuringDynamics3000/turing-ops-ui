import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, Clock, Loader2 } from "lucide-react";

type StatusType = "healthy" | "warning" | "critical" | "pending" | "loading";

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  showPulse?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusConfig = {
  healthy: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500",
    label: "Healthy",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bgColor: "bg-amber-500",
    label: "Warning",
  },
  critical: {
    icon: XCircle,
    color: "text-rose-500",
    bgColor: "bg-rose-500",
    label: "Critical",
  },
  pending: {
    icon: Clock,
    color: "text-orange-500",
    bgColor: "bg-orange-500",
    label: "Pending",
  },
  loading: {
    icon: Loader2,
    color: "text-zinc-400",
    bgColor: "bg-zinc-400",
    label: "Loading",
  },
};

const sizeConfig = {
  sm: { dot: "h-2 w-2", icon: "h-3 w-3", text: "text-xs" },
  md: { dot: "h-3 w-3", icon: "h-4 w-4", text: "text-sm" },
  lg: { dot: "h-4 w-4", icon: "h-5 w-5", text: "text-base" },
};

export function StatusIndicator({
  status,
  label,
  showPulse = true,
  size = "md",
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative flex">
        {showPulse && status !== "loading" && (
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              config.bgColor,
              sizes.dot
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full",
            config.bgColor,
            sizes.dot,
            status === "loading" && "animate-pulse"
          )}
        />
      </span>
      {label !== undefined && (
        <span className={cn("font-medium", config.color, sizes.text)}>
          {label || config.label}
        </span>
      )}
    </div>
  );
}

// Icon-based status indicator
export function StatusIcon({
  status,
  size = "md",
  animated = true,
  className,
}: Omit<StatusIndicatorProps, "label" | "showPulse"> & { animated?: boolean }) {
  const config = statusConfig[status];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <Icon
      className={cn(
        config.color,
        sizes.icon,
        animated && status === "loading" && "animate-spin",
        animated && status === "critical" && "animate-pulse",
        className
      )}
    />
  );
}

// Badge-style status indicator
export function StatusBadge({
  status,
  label,
  size = "md",
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const sizes = sizeConfig[size];

  const bgColors = {
    healthy: "bg-emerald-900/30 border-emerald-800/50",
    warning: "bg-amber-900/30 border-amber-800/50",
    critical: "bg-rose-900/30 border-rose-800/50",
    pending: "bg-orange-900/30 border-orange-800/50",
    loading: "bg-zinc-800/30 border-zinc-700/50",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full border",
        bgColors[status],
        className
      )}
    >
      <StatusIndicator status={status} showPulse={false} size="sm" />
      <span className={cn("font-medium", config.color, sizes.text)}>
        {label || config.label}
      </span>
    </div>
  );
}

// System health overview component
interface SystemHealthProps {
  systems: {
    name: string;
    status: StatusType;
    latency?: string;
  }[];
  className?: string;
}

export function SystemHealth({ systems, className }: SystemHealthProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {systems.map((system) => (
        <div
          key={system.name}
          className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <StatusIndicator status={system.status} showPulse={system.status !== "healthy"} size="sm" />
            <span className="text-sm text-zinc-300">{system.name}</span>
          </div>
          {system.latency && (
            <span className="text-xs text-zinc-500 font-mono">{system.latency}</span>
          )}
        </div>
      ))}
    </div>
  );
}
