import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { NewShiftForm } from "@/components/clinic/new-shift-form";
import { PageHeader } from "@/components/shared/page-header";
import { pad2 } from "@/lib/format";
import { specialties, vets } from "@/lib/mock/data";
import { currentOrg, orgUnits } from "@/lib/mock/queries";
import { DEMO_TODAY } from "@/lib/time";

export const metadata: Metadata = { title: "Nova vaga" };

export default function NewShiftPage() {
  const org = currentOrg();
  const verified = vets.filter((v) => v.crmvStatus === "verified" && !org.policy.blockedVetIds.includes(v.id));
  return (
    <>
      <Link href="/clinica/vagas" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="size-4" /> Vagas
      </Link>
      <PageHeader
        title="Nova vaga de plantão"
        description="Preencha os dados da vaga. A prévia ao lado mostra o custo estimado e a mensagem enviada pelo WhatsApp."
      />
      <NewShiftForm
        orgName={org.name}
        units={orgUnits().map((u) => ({ id: u.id, name: u.name }))}
        specialties={specialties.map((s) => {
          const withSpecialty = verified.filter((v) => v.specialtyIds.includes(s.id));
          return {
            id: s.id,
            name: s.name,
            short: s.short,
            eligibleCount: withSpecialty.length,
            favoriteCount: withSpecialty.filter((v) => org.policy.favoriteVetIds.includes(v.id)).length,
          };
        })}
        defaultDate={`${DEMO_TODAY.year}-${pad2(DEMO_TODAY.month + 1)}-${pad2(DEMO_TODAY.day)}`}
        avgSalesPerShift={org.avgSalesPerShift}
        platformFeePct={org.platformFeePct}
        timeouts={org.policy.waveTimeouts}
      />
    </>
  );
}
