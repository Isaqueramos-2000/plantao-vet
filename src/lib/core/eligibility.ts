import { haversineKm, type LatLng } from "./geo";
import { findConflicts, findRestViolations, weeklyHoursWith, type Interval } from "./schedule";

export type CrmvStatus = "pending" | "verified" | "rejected";

export type IneligibilityReason =
  | "crmv_not_verified"
  | "blocked_by_clinic"
  | "specialty_mismatch"
  | "out_of_radius"
  | "schedule_conflict"
  | "insufficient_rest"
  | "weekly_hours_exceeded";

export interface EligibilityVet {
  id: string;
  crmvStatus: CrmvStatus;
  specialtyIds: readonly string[];
  base: LatLng;
  radiusKm: number;
  minRestHours: number;
  maxWeeklyHours: number;
  agenda: readonly Interval[];
}

export interface EligibilityShift extends Interval {
  specialtyId: string;
  location: LatLng;
}

export interface EligibilityPolicy {
  /** Descanso mínimo exigido pela clínica; vale o maior entre clínica e preferência do vet. */
  minRestHours: number;
  blockedVetIds: readonly string[];
  tzOffsetMinutes?: number;
}

export interface EligibilityResult {
  eligible: boolean;
  reasons: IneligibilityReason[];
  distanceKm: number;
}

export function checkEligibility(
  vet: EligibilityVet,
  shift: EligibilityShift,
  policy: EligibilityPolicy,
): EligibilityResult {
  const reasons: IneligibilityReason[] = [];
  const distanceKm = haversineKm(vet.base, shift.location);
  const minRest = Math.max(policy.minRestHours, vet.minRestHours);

  if (vet.crmvStatus !== "verified") reasons.push("crmv_not_verified");
  if (policy.blockedVetIds.includes(vet.id)) reasons.push("blocked_by_clinic");
  if (!vet.specialtyIds.includes(shift.specialtyId)) reasons.push("specialty_mismatch");
  if (distanceKm > vet.radiusKm) reasons.push("out_of_radius");
  if (findConflicts(shift, vet.agenda).length > 0) reasons.push("schedule_conflict");
  if (findRestViolations(shift, vet.agenda, minRest).length > 0) reasons.push("insufficient_rest");
  if (weeklyHoursWith(shift, vet.agenda, policy.tzOffsetMinutes) > vet.maxWeeklyHours) {
    reasons.push("weekly_hours_exceeded");
  }

  return { eligible: reasons.length === 0, reasons, distanceKm: Math.round(distanceKm * 10) / 10 };
}
