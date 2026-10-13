import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  trend?: { value: string; positive: boolean };
  className?: string;
}) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-500">{label}</p>
        {Icon && (
          <span className="rounded-lg bg-slate-50 p-1.5 text-slate-500 ring-1 ring-slate-200">
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <p className="tabular mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {trend && (
          <span className={cn("font-medium", trend.positive ? "text-emerald-600" : "text-red-600")}>{trend.value}</span>
        )}
        {hint && <span className="text-slate-500">{hint}</span>}
      </div>
    </Card>
  );
}
