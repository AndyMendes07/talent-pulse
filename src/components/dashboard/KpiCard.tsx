import { ReactNode } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  variant?: "default" | "primary" | "accent" | "warning" | "danger" | "success";
  delta?: { value: string; positive?: boolean };
  /** Comparison vs previous period. positiveIsGood defaults to true */
  comparison?: {
    pct: number | null;
    previousValue?: ReactNode;
    positiveIsGood?: boolean;
  };
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
  comparison,
}: KpiCardProps) => {
  const isColored = variant !== "default";
  const positiveIsGood = comparison?.positiveIsGood ?? true;
  const pct = comparison?.pct ?? null;
  const isUp = pct !== null && pct > 0.05;
  const isDown = pct !== null && pct < -0.05;
  const isGood = (isUp && positiveIsGood) || (isDown && !positiveIsGood);
  const isBad = (isDown && positiveIsGood) || (isUp && !positiveIsGood);
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
      {comparison && pct !== null && (
        <div
          className={cn(
            "text-xs mt-3 font-medium flex items-center gap-1",
            isColored
              ? "opacity-90"
              : isGood
              ? "text-success"
              : isBad
              ? "text-destructive"
              : "text-muted-foreground"
          )}
        >
          {isUp ? (
            <ArrowUp className="h-3 w-3" />
          ) : isDown ? (
            <ArrowDown className="h-3 w-3" />
          ) : (
            <Minus className="h-3 w-3" />
          )}
          <span>
            {pct > 0 ? "+" : ""}
            {(pct * 100).toFixed(1)}%
          </span>
          {comparison.previousValue !== undefined && (
            <span
              className={cn(
                "ml-1",
                isColored ? "opacity-75" : "text-muted-foreground"
              )}
            >
              vs {comparison.previousValue}
            </span>
          )}
        </div>
      )}
      {comparison && pct === null && (
        <p
          className={cn(
            "text-xs mt-3",
            isColored ? "opacity-75" : "text-muted-foreground"
          )}
        >
          Sem dado anterior
        </p>
      )}
    </div>
  );
};
