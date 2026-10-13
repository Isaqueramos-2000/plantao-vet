import { Plus, Upload } from "lucide-react";
import type { Metadata } from "next";
import { ShiftsTable, type ShiftRow } from "@/components/clinic/shifts-table";
import { DemoButton } from "@/components/shared/demo-button";
import { PageHeader } from "@/components/shared/page-header";
import { ButtonLink } from "@/components/ui/button";
import { formatRelativeDay, formatTimeRange } from "@/lib/format";
import { distributionFor, getSpecialty, getUnit, getVet, orgShifts, orgUnits } from "@/lib/mock/queries";
import { extrasLabel, payLabel, shiftHours } from "@/lib/view";

export const metadata: Metadata = { title: "Vagas" };

export default function ShiftsPage() {
  const shifts = orgShifts();
  // Próximas primeiro; passadas depois, da mais recente para a mais antiga.
  const now = shifts.filter((s) => !["completed", "closed", "no_show"].includes(s.status));
  const past = shifts.filter((s) => ["completed", "closed", "no_show"].includes(s.status)).reverse();

  const rows: ShiftRow[] = [...now, ...past].map((s) => {
    let progress: string | undefined;
    if (s.status === "offered") {
      const pending = distributionFor(s).waves.flatMap((w) => w.offers).filter((o) => o.state === "pending").length;
      progress = pending ? `Onda ${s.currentWave}/3 · ${pending} aguardando` : "Sem elegíveis restantes";
    } else if (s.status === "open") progress = "Distribuição às 10:00";
    else if (s.status === "draft") progress = "Não publicada";
    return {
      id: s.id,
      code: s.code,
      specialty: getSpecialty(s.specialtyId).short,
      unitId: s.unitId,
      unit: getUnit(s.unitId).name,
      day: formatRelativeDay(s.startsAt),
      time: formatTimeRange(s.startsAt, s.endsAt),
      hours: shiftHours(s),
      type: s.type,
      status: s.status,
      pay: payLabel(s),
      extras: extrasLabel(s),
      vetName: s.assignedVetId ? getVet(s.assignedVetId).name : undefined,
      progress,
    };
  });

  return (
    <>
      <PageHeader
        title="Vagas de plantão"
        description="Crie vagas avulsas, recorrentes ou urgentes e acompanhe a distribuição em tempo real."
        actions={
          <>
            <DemoButton variant="secondary" toastTitle="Importação de escala" toastDescription="Importar vagas por planilha está previsto para a Fase 1.">
              <Upload /> Importar
            </DemoButton>
            <ButtonLink href="/clinica/vagas/nova">
              <Plus /> Nova vaga
            </ButtonLink>
          </>
        }
      />
      <ShiftsTable rows={rows} units={orgUnits().map((u) => ({ id: u.id, name: u.name }))} />
    </>
  );
}
