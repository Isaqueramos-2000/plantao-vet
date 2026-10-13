import type { Metadata } from "next";
import { WhatsAppChat } from "@/components/vet/whatsapp-chat";
import { formatBRL, formatRelativeDay, formatTime, formatTimeRange } from "@/lib/format";
import { estimateFor, findShift, getOrg, getSpecialty, getUnit } from "@/lib/mock/queries";
import { payLabel } from "@/lib/view";

export const metadata: Metadata = { title: "WhatsApp" };

export default function WhatsAppPage() {
  const shift = findShift("shf_1042")!;
  const org = getOrg(shift.orgId);
  const unit = getUnit(shift.unitId);
  const yesterday = getUnit(findShift("shf_1039")!.unitId);
  const night = shift.extras[0];

  return (
    <WhatsAppChat
      offer={{
        code: shift.code,
        clinic: org.name,
        unit: unit.shortName,
        address: unit.address,
        specialty: getSpecialty(shift.specialtyId).name,
        when: `${formatRelativeDay(shift.startsAt)}, ${formatTimeRange(shift.startsAt, shift.endsAt)}`,
        pay: `${payLabel(shift)}${night ? ` + noturno ${formatBRL(night.amount, { cents: false })}` : ""}`,
        estimate: formatBRL(estimateFor(shift).vetNetAmount, { cents: false }),
        timeoutMinutes: org.policy.waveTimeouts.urgentMinutes,
        sentAt: shift.waveStartedAt ? formatTime(shift.waveStartedAt) : "09:37",
        detailHref: `/plantonista/vagas/${shift.id}`,
      }}
      clinicYesterday={{ unit: yesterday.name, address: yesterday.address }}
    />
  );
}
