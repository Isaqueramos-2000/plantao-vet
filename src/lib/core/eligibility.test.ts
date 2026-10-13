import { describe, expect, it } from "vitest";
import { checkEligibility, type EligibilityVet } from "./eligibility";

const d = (iso: string) => new Date(`${iso}-03:00`);
const pinheiros = { lat: -23.5664, lng: -46.6847 };

const shift = {
  startsAt: d("2026-10-13T19:00"),
  endsAt: d("2026-10-14T07:00"),
  specialtyId: "emergency",
  location: pinheiros,
};

const vet: EligibilityVet = {
  id: "vet_1",
  crmvStatus: "verified",
  specialtyIds: ["emergency", "general"],
  base: { lat: -23.553, lng: -46.691 },
  radiusKm: 25,
  minRestHours: 8,
  maxWeeklyHours: 48,
  agenda: [],
};

const policy = { minRestHours: 11, blockedVetIds: [] };

describe("checkEligibility", () => {
  it("vet verificado, compatível e livre é elegível", () => {
    const r = checkEligibility(vet, shift, policy);
    expect(r.eligible).toBe(true);
    expect(r.distanceKm).toBeLessThan(5);
  });

  it("acumula todos os motivos de inelegibilidade", () => {
    const r = checkEligibility(
      { ...vet, crmvStatus: "pending", specialtyIds: ["imaging"], radiusKm: 1 },
      { ...shift, location: { lat: -23.6639, lng: -46.5383 } },
      { ...policy, blockedVetIds: ["vet_1"] },
    );
    expect(r.reasons).toEqual([
      "crmv_not_verified",
      "blocked_by_clinic",
      "specialty_mismatch",
      "out_of_radius",
    ]);
  });

  it("usa o maior descanso entre clínica e preferência do vet", () => {
    const agenda = [{ startsAt: d("2026-10-13T07:00"), endsAt: d("2026-10-13T09:00") }];
    // 10h de descanso: ok para o vet (8h), insuficiente para a clínica (11h)
    expect(checkEligibility({ ...vet, agenda }, shift, policy).reasons).toEqual(["insufficient_rest"]);
    expect(checkEligibility({ ...vet, agenda }, shift, { ...policy, minRestHours: 6 }).eligible).toBe(true);
  });

  it("bloqueia conflito de agenda e limite semanal", () => {
    const agenda = [{ startsAt: d("2026-10-13T08:00"), endsAt: d("2026-10-14T06:00") }];
    const r = checkEligibility({ ...vet, agenda, maxWeeklyHours: 24 }, shift, policy);
    expect(r.reasons).toContain("schedule_conflict");
    expect(r.reasons).toContain("weekly_hours_exceeded");
  });
});
