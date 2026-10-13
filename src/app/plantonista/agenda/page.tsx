import { AlertTriangle, ChevronRight, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ShiftStatusBadge } from "@/components/shared/status";
import { AppHeader } from "@/components/shell/phone-shell";
import { IcsButton } from "@/components/vet/ics-button";
import { Badge, Dot } from "@/components/ui/badge";
import { findRestViolations, restGapHours } from "@/lib/core";
import { formatBRL, formatDayMonth, formatHours, formatRelativeDay, formatTimeRange, weekdayShort } from "@/lib/format";
import { currentVet, vetAgendaEntries, type AgendaEntry } from "@/lib/mock/queries";
import { dayDiff, DEMO_NOW, localParts } from "@/lib/time";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Agenda" };

function groupByDay(entries: AgendaEntry[]) {
  const groups = new Map<string, AgendaEntry[]>();
  for (const e of entries) {
    const p = localParts(e.startsAt);
    const key = `${p.year}-${p.month}-${p.day}`;
    groups.set(key, [...(groups.get(key) ?? []), e]);
  }
  return [...groups.values()];
}

function EntryRow({ e }: { e: AgendaEntry }) {
  const content = (
    <>
      <div className={cn("w-1 self-stretch rounded-full", e.source === "external" ? "bg-slate-300" : e.startsAt > DEMO_NOW ? "bg-brand-500" : "bg-slate-200")} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{formatTimeRange(e.startsAt, e.endsAt)}</p>
        <p className="truncate text-sm text-slate-700">{e.title}</p>
        <p className="truncate text-xs text-slate-500">{e.place}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {e.source === "external" ? (
            <Badge>
              <ExternalLink /> Externo
            </Badge>
          ) : (
            e.status !== "external" && e.status !== "filled" && <ShiftStatusBadge status={e.status} />
          )}
          {e.estimate && <span className="text-xs text-slate-500">~{formatBRL(e.estimate.vetNetAmount, { cents: false })}</span>}
        </div>
      </div>
      {e.shift && <ChevronRight className="size-4 shrink-0 text-slate-300" />}
    </>
  );
  const className = "flex items-start gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200";
  return e.shift ? (
    <Link href={`/plantonista/vagas/${e.shift.id}`} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

export default function AgendaPage() {
  const vet = currentVet();
  const entries = vetAgendaEntries();
  const upcoming = entries.filter((e) => e.endsAt > DEMO_NOW);
  const past = entries.filter((e) => e.endsAt <= DEMO_NOW).reverse();

  const alerts = upcoming.flatMap((e, i) =>
    findRestViolations(e, upcoming.slice(i + 1), vet.minRestHours).map((other) => ({ a: e, b: other, gap: restGapHours(e, other) })),
  );
  const totalUpcoming = upcoming.reduce((s, e) => s + (e.estimate?.vetNetAmount ?? 0), 0);

  return (
    <>
      <AppHeader
        title="Agenda"
        subtitle={`${upcoming.length} plantões à frente · ~${formatBRL(totalUpcoming, { cents: false })} previstos`}
        right={
          <IcsButton
            events={upcoming.map((e) => ({ id: e.id, title: e.title, location: e.place, startsAtMs: e.startsAt.getTime(), endsAtMs: e.endsAt.getTime() }))}
          />
        }
      />
      <div className="space-y-5 p-4">
        {alerts.map(({ a, b, gap }) => (
          <div key={`${a.id}-${b.id}`} className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div className="text-sm">
              <p className="font-semibold text-amber-900">Descanso de apenas {formatHours(gap)}</p>
              <p className="text-amber-800">
                Entre {formatRelativeDay(a.startsAt).toLowerCase()} ({formatTimeRange(a.startsAt, a.endsAt)}) e {b.source === "external" ? "o plantão externo" : "o plantão"} de{" "}
                {formatRelativeDay(b.startsAt).toLowerCase()} às {formatTimeRange(b.startsAt, b.endsAt).split(" – ")[0]}. Seu mínimo é{" "}
                {vet.minRestHours}h.
              </p>
            </div>
          </div>
        ))}

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {Array.from({ length: 14 }, (_, i) => {
            const d = new Date(DEMO_NOW.getTime() + i * 86_400_000);
            const p = localParts(d);
            const has = upcoming.some((e) => {
              const q = localParts(e.startsAt);
              return q.day === p.day && q.month === p.month;
            });
            return (
              <div
                key={i}
                className={cn(
                  "flex w-12 shrink-0 flex-col items-center rounded-xl py-2",
                  i === 0 ? "bg-brand-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200",
                )}
              >
                <span className={cn("text-[11px] uppercase", i === 0 ? "text-brand-100" : "text-slate-400")}>{weekdayShort(p.weekday)}</span>
                <span className="text-base font-semibold">{p.day}</span>
                <span className="h-2">{has && <Dot tone={i === 0 ? "neutral" : "brand"} />}</span>
              </div>
            );
          })}
        </div>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Próximos</h2>
          {groupByDay(upcoming).map((group) => (
            <div key={group[0]!.id} className="space-y-2">
              <p className="text-sm font-medium text-slate-900">
                {formatRelativeDay(group[0]!.startsAt)}
                {Math.abs(dayDiff(group[0]!.startsAt)) <= 1 && (
                  <span className="font-normal text-slate-500"> · {formatDayMonth(group[0]!.startsAt)}</span>
                )}
              </p>
              {group.map((e) => (
                <EntryRow key={e.id} e={e} />
              ))}
            </div>
          ))}
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Realizados</h2>
          {past.map((e) => (
            <EntryRow key={e.id} e={e} />
          ))}
        </section>
      </div>
    </>
  );
}
