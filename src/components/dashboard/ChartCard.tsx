import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export const ChartCard = ({ title, subtitle, children, className, action }: ChartCardProps) => (
  <div
    className={cn(
      "rounded-xl bg-card border border-border/60 shadow-card p-5 flex flex-col",
      className
    )}
  >
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    <div className="flex-1 min-h-0">{children}</div>
  </div>
);
