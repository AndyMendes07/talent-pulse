import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  variant?: "default" | "primary" | "accent" | "warning" | "danger" | "success";
  delta?: { value: string; positive?: boolean };
}

const variantBg: Record<NonNullable<KpiCardProps["variant"]>, string> = {
  default: "bg-card",
  primary: "bg-gradient-primary text-primary-foreground",
  accent: "bg-gradient-accent text-accent-foreground",
  warning: "bg-gradient-warning text-warning-foreground",
  danger: "bg-gradient-danger text-destructive-foreground",
  success: "bg-gradient-accent text-accent-foreground",
};

export const KpiCard = ({
  label,
  value,
  hint,
  icon,
  variant = "default",
  delta,
}: KpiCardProps) => {
  const isColored = variant !== "default";
  return (
    <div
      className={cn(
        "rounded-xl p-5 shadow-card border border-border/40 transition-all hover:shadow-elegant",
        variantBg[variant]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p
            className={cn(
              "text-xs font-medium uppercase tracking-wider",
              isColored ? "opacity-90" : "text-muted-foreground"
            )}
          >
            {label}
          </p>
          <p className="text-3xl font-bold tabular-nums truncate">{value}</p>
          {hint && (
            <p
              className={cn(
                "text-xs",
                isColored ? "opacity-80" : "text-muted-foreground"
              )}
            >
              {hint}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
              isColored ? "bg-white/20" : "bg-secondary text-primary"
            )}
          >
            {icon}
          </div>
        )}
      </div>
      {delta && (
        <p
          className={cn(
            "text-xs mt-3 font-medium",
            isColored
              ? "opacity-90"
              : delta.positive
              ? "text-success"
              : "text-destructive"
          )}
        >
          {delta.value}
        </p>
      )}
    </div>
  );
};
