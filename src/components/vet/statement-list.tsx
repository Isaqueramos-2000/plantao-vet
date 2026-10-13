"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { StatementStatusBadge } from "@/components/shared/status";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { StatementStatus } from "@/lib/mock/queries";
import { cn } from "@/lib/utils";

export interface StatementDTO {
  id: string;
  code: string;
  clinic: string;
  unit: string;
  date: string;
  specialty: string;
  status: StatementStatus;
  isEstimate: boolean;
  net: string;
  lines: { label: string; value: string }[];
  note?: string;
}

const FILTERS: { id: string; label: string; statuses: StatementStatus[] | null }[] = [
  { id: "all", label: "Todos", statuses: null },
  { id: "paid", label: "Recebidos", statuses: ["paid"] },
  { id: "toReceive", label: "A receber", statuses: ["approved", "pending", "disputed"] },
  { id: "expected", label: "Previstos", statuses: ["expected"] },
];

export function StatementList({ items }: { items: StatementDTO[] }) {
  const toast = useToast();
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<string | null>(items.find((i) => i.status === "approved")?.id ?? null);
  const statuses = FILTERS.find((f) => f.id === filter)?.statuses;
  const list = items.filter((i) => !statuses || statuses.includes(i.status));

  return (
    <div className="space-y-3">
      <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
              filter === f.id ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-200",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      {list.map((i) => {
        const expanded = open === i.id;
        return (
          <div key={i.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <button type="button" onClick={() => setOpen(expanded ? null : i.id)} className="flex w-full items-center gap-3 p-3 text-left">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{i.clinic}</p>
                <p className="truncate text-xs text-slate-500">
                  {i.date} · {i.specialty} · #{i.code}
                </p>
                <div className="mt-1.5">
                  <StatementStatusBadge status={i.status} />
                </div>
              </div>
              <div className="text-right">
                <p className={cn("tabular text-sm font-semibold", i.status === "paid" ? "text-brand-700" : "text-slate-900")}>
                  {i.isEstimate && "~"}
                  {i.net}
                </p>
                <ChevronDown className={cn("ml-auto mt-1 size-4 text-slate-400 transition-transform", expanded && "rotate-180")} />
              </div>
            </button>
            {expanded && (
              <div className="animate-fade-in border-t border-slate-100 bg-slate-50/60 p-3">
                <dl className="space-y-1 text-sm">
                  {i.lines.map((l) => (
                    <div key={l.label} className="flex justify-between gap-2">
                      <dt className="text-slate-500">{l.label}</dt>
                      <dd className="tabular text-slate-800">{l.value}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold">
                    <dt>Você recebe</dt>
                    <dd className="tabular">{i.net}</dd>
                  </div>
                </dl>
                {i.note && <p className="mt-2 text-xs text-slate-500">{i.note}</p>}
                {(i.status === "approved" || i.status === "pending") && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() =>
                      toast({ title: "Contestação (simulação)", description: "Abre uma disputa: a liberação fica suspensa até a análise do suporte." })
                    }
                  >
                    Contestar cálculo
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
