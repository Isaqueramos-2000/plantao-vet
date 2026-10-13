import { FileDown, FileSpreadsheet } from "lucide-react";
import type { Metadata } from "next";
import { RosterView, type RosterMonthDTO } from "@/components/clinic/roster-view";
import { DemoButton } from "@/components/shared/demo-button";
import { PageHeader } from "@/components/shared/page-header";
import { formatTimeRange, monthName, weekdayShort } from "@/lib/format";
import { orgUnits, rosterForMonth } from "@/lib/mock/queries";
import { dayDiff, DEMO_TODAY, localDate, localParts } from "@/lib/time";

export const metadata: Metadata = { title: "Escala" };

function monthDTO(unitId: string, year: number, month: number): RosterMonthDTO {
  const days = rosterForMonth(unitId, year, month);
  const firstWeekday = localParts(localDate(year, month, 1, 12)).weekday;
  const all = days.flatMap((d) => d.entries);
  return {
    key: `${year}-${month}`,
    label: `${monthName(month)} ${year}`,
    offset: (firstWeekday + 6) % 7,
    days: days.map((d) => {
      const diff = dayDiff(d.date);
      return {
        day: d.day,
        weekdayLabel: weekdayShort(localParts(d.date).weekday),
        isToday: diff === 0,
        isPast: diff < 0,
        entries: d.entries.map((e) => ({
          key: e.key,
          slot: e.slotLabel,
          time: formatTimeRange(e.startsAt, e.endsAt).replace(/ \(\+1\)/, ""),
          state: e.state,
          vetName: e.vet?.name,
          shiftId: e.shiftId,
        })),
      };
    }),
    stats: {
      slots: all.length,
      covered: all.filter((e) => ["filled", "in_progress", "completed"].includes(e.state)).length,
      gaps: all.filter((e) => e.state === "gap").length,
      inDistribution: all.filter((e) => e.state === "offered" || e.state === "open").length,
    },
  };
}

export default function RosterPage() {
  const units = orgUnits();
  const next = localParts(localDate(DEMO_TODAY.year, DEMO_TODAY.month + 1, 1, 12));
  const data = Object.fromEntries(
    units.map((u) => [u.id, [monthDTO(u.id, DEMO_TODAY.year, DEMO_TODAY.month), monthDTO(u.id, next.year, next.month)]]),
  );

  return (
    <>
      <PageHeader
        title="Escala mensal"
        description="Cobertura de emergência 24h por unidade. Clique em uma lacuna para publicar a vaga, ou em um plantão para ver os detalhes."
        actions={
          <>
            <DemoButton variant="secondary" toastTitle="Exportar PDF" toastDescription="Exportação da escala em PDF prevista para a Fase 1.">
              <FileDown /> PDF
            </DemoButton>
            <DemoButton variant="secondary" toastTitle="Exportar planilha" toastDescription="Exportação em .xlsx/.csv prevista para a Fase 1.">
              <FileSpreadsheet /> Planilha
            </DemoButton>
          </>
        }
      />
      <RosterView units={units.map((u) => ({ id: u.id, name: u.name }))} data={data} />
    </>
  );
}
