import { Star } from "lucide-react";
import { formatRating } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Rating({ value, count, className }: { value: number | null; count?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
      <Star className="size-3.5 fill-amber-400 text-amber-400" />
      <span className="font-medium text-slate-800">{value === null ? "Novo" : formatRating(value)}</span>
      {count !== undefined && value !== null && <span className="text-slate-400">({count})</span>}
    </span>
  );
}

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} aria-label={`${value} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("size-3.5", i <= value ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
      ))}
    </span>
  );
}
