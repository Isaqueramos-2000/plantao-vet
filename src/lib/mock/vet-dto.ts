import type { OfferDTO } from "@/components/vet/offers-list";
import { formatBRL, formatKm, formatRating, formatRelativeDay, formatTimeRange } from "@/lib/format";
import { DEMO_NOW } from "@/lib/time";
import { payLabel, shiftHours } from "@/lib/view";
import { getOrg, getSpecialty, type VetOffer } from "./queries";

export function toOfferDTO(o: VetOffer): OfferDTO {
  const timeoutMinutes = o.shift.type === "urgent" ? o.org.policy.waveTimeouts.urgentMinutes : o.org.policy.waveTimeouts.normalMinutes;
  const timed = o.mode === "waves" && !!o.expiresAt;
  return {
    id: o.shift.id,
    code: o.shift.code,
    urgent: o.shift.type === "urgent",
    clinicName: o.org.name,
    clinicRating: formatRating(getOrg(o.shift.orgId).rating),
    unitName: o.unit.shortName,
    distance: formatKm(o.distanceKm),
    specialty: getSpecialty(o.shift.specialtyId).short,
    dayLabel: formatRelativeDay(o.shift.startsAt),
    timeRange: formatTimeRange(o.shift.startsAt, o.shift.endsAt),
    hours: shiftHours(o.shift),
    pay: payLabel(o.shift),
    extras: o.shift.extras.length
      ? o.shift.extras.map((e) => `${e.label.toLowerCase()} ${formatBRL(e.amount, { cents: false })}`).join(" + ")
      : null,
    estimate: formatBRL(o.estimate.vetNetAmount, { cents: false }),
    minimum: formatBRL(o.minimum.vetNetAmount, { cents: false }),
    waveLabel:
      o.mode === "first_come_capped" ? "Primeiro a aceitar" : o.wave === 1 ? "Onda 1 · favorita" : `Onda ${o.wave} · seu score`,
    secondsLeft: timed ? Math.max(0, Math.round((o.expiresAt!.getTime() - DEMO_NOW.getTime()) / 1000)) : null,
    timeoutSeconds: timed ? timeoutMinutes * 60 : null,
    startsAtMs: o.shift.startsAt.getTime(),
    endsAtMs: o.shift.endsAt.getTime(),
    href: `/plantonista/vagas/${o.shift.id}`,
  };
}
