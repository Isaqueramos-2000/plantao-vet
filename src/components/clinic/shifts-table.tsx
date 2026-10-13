"use client";

import { ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ShiftStatusBadge, ShiftTypeBadge } from "@/components/shared/status";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import type { ShiftStatus, ShiftType } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

export interface ShiftRow {
  id: string;
  code: string;
  specialty: string;
  unitId: string;
  unit: string;
  day: string;
  time: string;
  hours: string;
  type: ShiftType;
  status: ShiftStatus;
  pay: string;
  extras: string | null;
  vetName?: string;
  progress?: string;
}

const TABS: { id: string; label: string; statuses: ShiftStatus[] | null }[] = [
  { id: "all", label: "Todas", statuses: null },
  { id: "open", label: "Em aberto", statuses: ["draft", "open", "offered"] },
  { id: "confirmed", label: "Confirmadas", statuses: ["filled", "in_progress"] },
  { id: "done", label: "Concluídas", statuses: ["completed", "closed", "no_show"] },
  { id: "cancelled", label: "Canceladas", statuses: ["cancelled"] },
];

export function ShiftsTable({ rows, units }: { rows: ShiftRow[]; units: { id: string; name: string }[] }) {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [unit, setUnit] = useState("");

  const filtered = useMemo(() => {
    const statuses = TABS.find((t) => t.id === tab)?.statuses;
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!statuses || statuses.includes(r.status)) &&
        (!unit || r.unitId === unit) &&
        (!q || `${r.code} ${r.specialty} ${r.vetName ?? ""} ${r.unit}`.toLowerCase().includes(q)),
    );
  }, [rows, tab, query, unit]);

  return (
    <Card>
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
          {TABS.map((t) => {
            const count = t.statuses ? rows.filter((r) => t.statuses!.includes(r.status)).length : rows.length;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                  tab === t.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
                )}
              >
                {t.label}
                <span className={cn("tabular text-xs", tab === t.id ? "text-slate-300" : "text-slate-400")}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 lg:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar vaga, profissional…" className="pl-9" />
          </div>
          <Select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-auto" aria-label="Filtrar por unidade">
            <option value="">Todas as unidades</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-medium tracking-wide text-slate-500 uppercase">
              <th className="px-4 py-3">Vaga</th>
              <th className="px-4 py-3">Data e horário</th>
              <th className="px-4 py-3">Remuneração</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Plantonista</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <tr key={r.id} className="group relative hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/clinica/vagas/${r.id}`} className="absolute inset-0" aria-label={`Abrir vaga ${r.code}`} />
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">#{r.code}</span>
                    <span className="text-slate-700">{r.specialty}</span>
                    <ShiftTypeBadge type={r.type} hideSingle />
                  </div>
                  <p className="text-xs text-slate-500">{r.unit}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-slate-900">{r.day}</p>
                  <p className="text-xs text-slate-500">
                    {r.time} · {r.hours}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-slate-900">{r.pay}</p>
                  {r.extras && <p className="text-xs text-slate-500">{r.extras}</p>}
                </td>
                <td className="px-4 py-3">
                  <ShiftStatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3">
                  {r.vetName ? (
                    <span className="flex items-center gap-2">
                      <Avatar name={r.vetName} size="xs" />
                      <span className="text-slate-800">{r.vetName}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">{r.progress ?? "—"}</span>
                  )}
                </td>
                <td className="pr-3">
                  <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-500" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {filtered.map((r) => (
          <li key={r.id}>
            <Link href={`/clinica/vagas/${r.id}`} className="block space-y-2 p-4 active:bg-slate-50">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-900">
                  #{r.code} · {r.specialty}
                </span>
                <ShiftStatusBadge status={r.status} />
              </div>
              <p className="text-sm text-slate-600">
                {r.day} · {r.time} · {r.unit}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{r.pay}</span>
                <span className="text-xs text-slate-500">{r.vetName ?? r.progress ?? ""}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && <p className="p-10 text-center text-sm text-slate-500">Nenhuma vaga encontrada com esses filtros.</p>}
    </Card>
  );
}
