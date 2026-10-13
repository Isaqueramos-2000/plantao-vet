"use client";

import { CalendarDays, List } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/field";
import { rosterStateMeta } from "@/lib/labels";
import type { RosterState } from "@/lib/mock/queries";
import { cn } from "@/lib/utils";

export interface RosterEntryDTO {
  key: string;
  slot: string;
  time: string;
  state: RosterState;
  vetName?: string;
  shiftId?: string;
}

export interface RosterDayDTO {
  day: number;
  weekdayLabel: string;
  isToday: boolean;
  isPast: boolean;
  entries: RosterEntryDTO[];
}

export interface RosterMonthDTO {
  key: string;
  label: string;
  /** Coluna do dia 1 (0 = segunda). */
  offset: number;
  days: RosterDayDTO[];
  stats: { slots: number; covered: number; gaps: number; inDistribution: number };
}

const WEEK = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const shortName = (name: string) => {
  const parts = name.split(" ");
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1]![0]}.` : name;
};

function EntryChip({ e, compact }: { e: RosterEntryDTO; compact?: boolean }) {
  const meta = rosterStateMeta[e.state];
  const label = e.vetName ? shortName(e.vetName) : meta.label;
  const content = (
    <>
      <span className="font-semibold">{compact ? e.slot.slice(0, 1) : e.slot}</span>
      <span className="truncate">{label}</span>
      {!compact && <span className="ml-auto shrink-0 opacity-70">{e.time}</span>}
    </>
  );
  const className = cn(
    "flex w-full items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] ring-1 ring-inset transition-opacity hover:opacity-80",
    meta.className,
  );
  const title = `${e.slot} · ${e.time} · ${e.vetName ?? meta.label}`;
  if (e.shiftId) return <Link href={`/clinica/vagas/${e.shiftId}`} className={className} title={title}>{content}</Link>;
  if (e.state === "gap") return <Link href="/clinica/vagas/nova" className={className} title={`${title} — publicar vaga`}>{content}</Link>;
  return <span className={className} title={title}>{content}</span>;
}

export function RosterView({
  units,
  data,
}: {
  units: { id: string; name: string }[];
  data: Record<string, RosterMonthDTO[]>;
}) {
  const [unitId, setUnitId] = useState(units[0]?.id ?? "");
  const [monthIdx, setMonthIdx] = useState(0);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const months = data[unitId] ?? [];
  const month = months[monthIdx];
  if (!month) return null;
  const coverage = Math.round((month.stats.covered / Math.max(1, month.stats.slots)) * 100);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="w-auto" aria-label="Unidade">
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
          <div className="flex rounded-lg bg-slate-100 p-1">
            {months.map((m, i) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMonthIdx(i)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium capitalize",
                  monthIdx === i ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="hidden rounded-lg bg-slate-100 p-1 md:flex">
            {(["calendar", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-label={v === "calendar" ? "Calendário" : "Lista"}
                className={cn("rounded-md px-2.5 py-1.5", view === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
              >
                {v === "calendar" ? <CalendarDays className="size-4" /> : <List className="size-4" />}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-slate-200">
            Cobertura <b className="tabular text-slate-900">{coverage}%</b>
          </span>
          <span className="rounded-lg bg-red-50 px-3 py-1.5 text-red-700 ring-1 ring-red-200">
            Lacunas <b className="tabular">{month.stats.gaps}</b>
          </span>
          <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-amber-800 ring-1 ring-amber-200">
            Em distribuição <b className="tabular">{month.stats.inDistribution}</b>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
        {(["filled", "in_progress", "completed", "offered", "open", "gap", "no_show"] as RosterState[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={cn("size-3 rounded ring-1 ring-inset", rosterStateMeta[s].className)} />
            {rosterStateMeta[s].label}
          </span>
        ))}
        <span className="text-slate-400">· D = diurno 07–19 · N = noturno 19–07</span>
      </div>

      {view === "calendar" && (
        <Card className="hidden overflow-hidden md:block">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-medium text-slate-500">
            {WEEK.map((w) => (
              <div key={w} className="py-2">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: month.offset }, (_, i) => (
              <div key={`pad-${i}`} className="min-h-28 border-r border-b border-slate-100 bg-slate-50/50" />
            ))}
            {month.days.map((d) => (
              <div
                key={d.day}
                className={cn(
                  "min-h-28 space-y-1 border-r border-b border-slate-100 p-1.5",
                  d.isPast && "bg-slate-50/60",
                  d.isToday && "bg-brand-50/40",
                )}
              >
                <div className="flex items-center justify-between px-0.5">
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                      d.isToday ? "bg-brand-600 text-white" : d.isPast ? "text-slate-400" : "text-slate-700",
                    )}
                  >
                    {d.day}
                  </span>
                </div>
                {d.entries.map((e) => (
                  <EntryChip key={e.key} e={e} compact />
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className={cn("divide-y divide-slate-100", view === "calendar" && "md:hidden")}>
        {month.days
          .filter((d) => !d.isPast || view === "list")
          .map((d) => (
            <div key={d.day} className={cn("flex gap-4 p-3", d.isToday && "bg-brand-50/40")}>
              <div className="w-12 shrink-0 text-center">
                <p className={cn("text-lg font-semibold", d.isToday ? "text-brand-700" : "text-slate-900")}>{d.day}</p>
                <p className="text-xs text-slate-500 capitalize">{d.weekdayLabel}</p>
              </div>
              <div className="grid flex-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {d.entries.map((e) => (
                  <EntryChip key={e.key} e={e} />
                ))}
              </div>
            </div>
          ))}
      </Card>
    </div>
  );
}
