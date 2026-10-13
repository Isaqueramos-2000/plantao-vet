import { cn } from "@/lib/utils";

export interface BarDatum {
  label: string;
  value: number;
  display?: string;
  highlight?: boolean;
}

/** Gráfico de barras simples (sem dependências) — suficiente para o protótipo. */
export function BarChart({
  data,
  max,
  min = 0,
  height = 160,
  target,
  targetLabel,
}: {
  data: BarDatum[];
  max?: number;
  min?: number;
  height?: number;
  target?: number;
  targetLabel?: string;
}) {
  const top = max ?? Math.max(...data.map((d) => d.value)) * 1.1;
  const barArea = height - 20;
  const px = (v: number) => Math.max(2, ((v - min) / (top - min)) * barArea);
  return (
    <div>
      <div className="relative flex items-end gap-2 sm:gap-3" style={{ height }}>
        {target !== undefined && (
          <div
            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-slate-400"
            style={{ bottom: px(target) }}
          />
        )}
        {data.map((d) => (
          <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
            <span className="tabular text-[11px] font-medium text-slate-600">{d.display ?? d.value}</span>
            <div
              className={cn("w-full max-w-10 rounded-t-md", d.highlight ? "bg-brand-500" : "bg-brand-200")}
              style={{ height: px(d.value) }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2 border-t border-slate-200 pt-1.5 sm:gap-3">
        {data.map((d) => (
          <span key={d.label} className="min-w-0 flex-1 truncate text-center text-[11px] text-slate-500">
            {d.label}
          </span>
        ))}
      </div>
      {targetLabel && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="w-4 border-t border-dashed border-slate-400" /> {targetLabel}
        </p>
      )}
    </div>
  );
}
