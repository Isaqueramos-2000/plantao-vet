import type { Metadata } from "next";
import { TalentPool, type PoolVet } from "@/components/clinic/talent-pool";
import { PageHeader } from "@/components/shared/page-header";
import { computeScore, haversineKm } from "@/lib/core";
import { formatDecimal, formatKm, formatPct } from "@/lib/format";
import { vets } from "@/lib/mock/data";
import { currentOrg, getSpecialty, getUnit } from "@/lib/mock/queries";

export const metadata: Metadata = { title: "Banco de reserva" };

export default function TalentPoolPage() {
  const org = currentOrg();
  const reference = getUnit("unit_pinheiros").location;

  const pool: PoolVet[] = vets
    .map((v) => {
      const distanceKm = haversineKm(v.base, reference);
      const total = v.completedShifts + v.noShows;
      const score = computeScore(
        {
          avgRating: v.avgRating,
          completedShifts: v.completedShifts,
          noShows: v.noShows,
          shiftsWithClinic: v.historyByOrg[org.id] ?? 0,
          distanceKm,
          radiusKm: v.radiusKm,
          shiftsInPeriod: v.shiftsThisMonth,
          equityCap: org.policy.maxShiftsPerVetMonth,
        },
        org.policy.scoreWeights,
      ).total;
      return {
        id: v.id,
        slug: v.slug,
        name: v.name,
        crmv: `CRMV-${v.crmvUf} ${v.crmvNumber}`,
        crmvStatus: v.crmvStatus,
        specialties: v.specialtyIds.map((id) => getSpecialty(id).short),
        rating: v.avgRating,
        reviews: v.reviewsCount,
        withClinic: v.historyByOrg[org.id] ?? 0,
        attendance: total ? formatPct((v.completedShifts / total) * 100) : "—",
        distance: formatKm(distanceKm),
        score: formatDecimal(score, 0),
        baseLabel: v.baseLabel,
        _score: score,
      };
    })
    .sort((a, b) => b._score - a._score)
    .map(({ _score, ...v }) => v);

  return (
    <>
      <PageHeader
        title="Banco de reserva"
        description="Favoritos recebem as vagas primeiro (onda 1). Bloqueados nunca recebem ofertas desta clínica."
      />
      <TalentPool
        vets={pool}
        initialFavorites={org.policy.favoriteVetIds}
        initialBlocked={org.policy.blockedVetIds}
        inviteUrl="plantaovet.app/convite/aurora-7Q2K"
      />
    </>
  );
}
