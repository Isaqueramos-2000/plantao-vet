// Seletores sobre os dados fictícios. Elegibilidade, score, ondas e fechamentos
// são calculados pelas regras reais de `@/lib/core` — os números da demo são coerentes entre si.
import {
  calculateSettlement,
  checkEligibility,
  computeScore,
  planWaves,
  waveTimeoutMinutes,
  type IneligibilityReason,
  type Interval,
  type LineItem,
  type SettlementBreakdown,
  type WaveNumber,
} from "@/lib/core";
import { at, dayDiff, daysInMonth, DEMO_NOW, localDate, localParts, TZ_OFFSET_MINUTES } from "@/lib/time";
import {
  CURRENT_ORG_ID,
  CURRENT_VET_ID,
  disputes,
  externalCommitments,
  organizations,
  reviews,
  settlements,
  shifts,
  specialties,
  units,
  vets,
} from "./data";
import type { Organization, Settlement, Shift, ShiftStatus, Specialty, Unit, Vet } from "./types";

function must<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`Mock não encontrado: ${what}`);
  return value;
}

export const getOrg = (id: string): Organization => must(organizations.find((o) => o.id === id), id);
export const getUnit = (id: string): Unit => must(units.find((u) => u.id === id), id);
export const getVet = (id: string): Vet => must(vets.find((v) => v.id === id), id);
export const getSpecialty = (id: string): Specialty => must(specialties.find((s) => s.id === id), id);
export const findShift = (id: string): Shift | undefined => shifts.find((s) => s.id === id);
export const findVetBySlug = (slug: string): Vet | undefined => vets.find((v) => v.slug === slug);

export const currentOrg = () => getOrg(CURRENT_ORG_ID);
export const currentVet = () => getVet(CURRENT_VET_ID);
export const orgUnits = (orgId = CURRENT_ORG_ID) => units.filter((u) => u.orgId === orgId);

const byStart = (a: Shift, b: Shift) => a.startsAt.getTime() - b.startsAt.getTime();

export const orgShifts = (orgId = CURRENT_ORG_ID) => shifts.filter((s) => s.orgId === orgId).sort(byStart);

const COMMITTED: ShiftStatus[] = ["filled", "in_progress", "completed", "closed"];

/** Agenda do vet usada nas checagens de conflito/descanso. */
export function vetAgenda(vetId: string, excludeShiftId?: string): Interval[] {
  const platform = shifts.filter(
    (s) => s.assignedVetId === vetId && s.id !== excludeShiftId && COMMITTED.includes(s.status),
  );
  const external = externalCommitments.filter((e) => e.vetId === vetId);
  return [...platform, ...external];
}

// ——— Distribuição ———

export interface CandidateEvaluation {
  vet: Vet;
  eligible: boolean;
  reasons: IneligibilityReason[];
  distanceKm: number;
  score: number;
  isFavorite: boolean;
}

export function evaluateCandidates(shift: Shift): CandidateEvaluation[] {
  const org = getOrg(shift.orgId);
  const unit = getUnit(shift.unitId);
  return vets
    .map((vet) => {
      const result = checkEligibility(
        { ...vet, base: vet.base, agenda: vetAgenda(vet.id, shift.id) },
        { startsAt: shift.startsAt, endsAt: shift.endsAt, specialtyId: shift.specialtyId, location: unit.location },
        { minRestHours: org.policy.minRestHours, blockedVetIds: org.policy.blockedVetIds, tzOffsetMinutes: TZ_OFFSET_MINUTES },
      );
      const score = computeScore(
        {
          avgRating: vet.avgRating,
          completedShifts: vet.completedShifts,
          noShows: vet.noShows,
          shiftsWithClinic: vet.historyByOrg[org.id] ?? 0,
          distanceKm: result.distanceKm,
          radiusKm: vet.radiusKm,
          shiftsInPeriod: vet.shiftsThisMonth,
          equityCap: org.policy.maxShiftsPerVetMonth,
        },
        org.policy.scoreWeights,
      ).total;
      return {
        vet,
        eligible: result.eligible,
        reasons: result.reasons,
        distanceKm: result.distanceKm,
        score,
        isFavorite: org.policy.favoriteVetIds.includes(vet.id),
      };
    })
    .sort((a, b) => b.score - a.score);
}

export type OfferState = "accepted" | "declined" | "expired" | "pending" | "queued" | "not_sent" | "filled_by_other";

export interface OfferRow {
  candidate: CandidateEvaluation;
  state: OfferState;
  at?: Date;
}

export interface WaveView {
  wave: WaveNumber;
  label: string;
  description: string;
  status: "done" | "active" | "upcoming" | "not_needed";
  offers: OfferRow[];
}

export interface DistributionView {
  mode: Organization["policy"]["mode"];
  timeoutMinutes: number;
  expiresAt?: Date;
  waves: WaveView[];
  eligible: CandidateEvaluation[];
  excluded: CandidateEvaluation[];
}

const WAVE_META: Record<WaveNumber, { label: string; description: string }> = {
  1: { label: "Onda 1 · Favoritos", description: "Profissionais favoritos da clínica" },
  2: { label: "Onda 2 · Melhores scores", description: "Elegíveis com maior score, dentro do raio" },
  3: { label: "Onda 3 · Todos os elegíveis", description: "Demais profissionais elegíveis" },
};

export function distributionFor(shift: Shift): DistributionView {
  const org = getOrg(shift.orgId);
  const evaluations = evaluateCandidates(shift);
  const eligible = evaluations.filter((e) => e.eligible);
  const excluded = evaluations.filter((e) => !e.eligible);
  const timeoutMinutes = waveTimeoutMinutes(org.policy.waveTimeouts, shift.type === "urgent");
  const byId = new Map(evaluations.map((e) => [e.vet.id, e]));

  const planned =
    org.policy.mode === "first_come_capped"
      ? [{ wave: 1 as WaveNumber, vetIds: eligible.map((e) => e.vet.id) }]
      : planWaves(
          eligible.map((e) => ({ vetId: e.vet.id, score: e.score, isFavorite: e.isFavorite })),
          org.policy.wave2Size,
        );

  // Garante que o profissional alocado apareça (ex.: alocado antes de uma mudança de política).
  if (shift.assignedVetId && !planned.some((w) => w.vetIds.includes(shift.assignedVetId!))) {
    planned[0]?.vetIds.unshift(shift.assignedVetId);
  }

  const acceptedWave = shift.assignedVetId
    ? planned.find((w) => w.vetIds.includes(shift.assignedVetId!))?.wave
    : undefined;
  const activeWave: number | undefined =
    shift.status === "offered" ? (shift.currentWave ?? 1) : acceptedWave;

  const waves: WaveView[] = planned.map(({ wave, vetIds }) => {
    const offers: OfferRow[] = vetIds.map((vetId) => {
      const candidate = byId.get(vetId)!;
      const response = shift.responses?.[vetId];
      if (vetId === shift.assignedVetId) return { candidate, state: "accepted", at: shift.filledAt };
      if (response) return { candidate, state: response.response, at: response.at };
      if (activeWave === undefined) return { candidate, state: "queued" };
      if (wave > activeWave) return { candidate, state: shift.assignedVetId ? "not_sent" : "queued" };
      if (shift.assignedVetId) return { candidate, state: wave === activeWave ? "filled_by_other" : "expired" };
      return { candidate, state: wave < activeWave ? "expired" : "pending" };
    });
    const status: WaveView["status"] =
      activeWave === undefined
        ? "upcoming"
        : wave < activeWave
          ? "done"
          : wave === activeWave
            ? shift.assignedVetId ? "done" : "active"
            : shift.assignedVetId ? "not_needed" : "upcoming";
    const meta =
      org.policy.mode === "first_come_capped"
        ? { label: "Oferta aberta · Primeiro a aceitar", description: `Todos os elegíveis, com teto de ${org.policy.maxShiftsPerVetMonth} plantões/mês por profissional` }
        : WAVE_META[wave];
    return { wave, ...meta, status, offers };
  });

  const expiresAt =
    shift.status === "offered" && shift.waveStartedAt && org.policy.mode === "waves"
      ? new Date(shift.waveStartedAt.getTime() + timeoutMinutes * 60_000)
      : undefined;

  return { mode: org.policy.mode, timeoutMinutes, expiresAt, waves, eligible, excluded };
}

// ——— Financeiro ———

export function breakdownFor(shift: Shift, salesAmount: number, discounts: LineItem[] = []): SettlementBreakdown {
  const org = getOrg(shift.orgId);
  return calculateSettlement({
    fixedAmount: shift.fixedAmount,
    salesAmount,
    commissionPct: shift.commissionPct,
    extras: shift.extras,
    discounts,
    platformFeePct: org.platformFeePct,
    feeBearer: "clinic",
  });
}

/** Estimativa usando a média de vendas por plantão da clínica. */
export function estimateFor(shift: Shift): SettlementBreakdown {
  return breakdownFor(shift, shift.commissionPct > 0 ? getOrg(shift.orgId).avgSalesPerShift : 0);
}

export const settlementOf = (shiftId: string): Settlement | undefined =>
  settlements.find((s) => s.shiftId === shiftId);

export interface SettlementRow {
  shift: Shift;
  settlement: Settlement;
  breakdown: SettlementBreakdown;
  isEstimate: boolean;
}

export function orgSettlements(orgId = CURRENT_ORG_ID): SettlementRow[] {
  return settlements
    .map((settlement) => ({ settlement, shift: findShift(settlement.shiftId)! }))
    .filter(({ shift }) => shift.orgId === orgId)
    .map(({ settlement, shift }) => ({
      shift,
      settlement,
      isEstimate: settlement.salesAmount === null,
      breakdown:
        settlement.salesAmount === null
          ? estimateFor(shift)
          : breakdownFor(shift, settlement.salesAmount, settlement.discounts),
    }))
    .sort((a, b) => b.shift.startsAt.getTime() - a.shift.startsAt.getTime());
}

export type StatementStatus = "expected" | "pending" | "approved" | "disputed" | "paid";

export interface StatementEntry {
  shift: Shift;
  org: Organization;
  unit: Unit;
  status: StatementStatus;
  breakdown: SettlementBreakdown;
  isEstimate: boolean;
  paidAt?: Date;
  releaseAt?: Date;
}

export function vetStatement(vetId = CURRENT_VET_ID): StatementEntry[] {
  return shifts
    .filter((s) => s.assignedVetId === vetId && COMMITTED.includes(s.status))
    .map((shift) => {
      const settlement = settlementOf(shift.id);
      const known = settlement && settlement.salesAmount !== null;
      return {
        shift,
        org: getOrg(shift.orgId),
        unit: getUnit(shift.unitId),
        status: settlement ? settlement.status : "expected",
        breakdown: known ? breakdownFor(shift, settlement.salesAmount!, settlement.discounts) : estimateFor(shift),
        isEstimate: !known,
        paidAt: settlement?.paidAt,
        releaseAt: settlement?.releaseAt,
      } satisfies StatementEntry;
    })
    .sort((a, b) => b.shift.startsAt.getTime() - a.shift.startsAt.getTime());
}

// ——— Plantonista ———

export interface VetOffer {
  shift: Shift;
  org: Organization;
  unit: Unit;
  wave: WaveNumber;
  mode: Organization["policy"]["mode"];
  expiresAt?: Date;
  distanceKm: number;
  estimate: SettlementBreakdown;
  minimum: SettlementBreakdown;
}

export function pendingOffersFor(vetId = CURRENT_VET_ID): VetOffer[] {
  return shifts
    .filter((s) => s.status === "offered")
    .flatMap((shift) => {
      const dist = distributionFor(shift);
      for (const w of dist.waves) {
        const row = w.offers.find((o) => o.candidate.vet.id === vetId && o.state === "pending");
        if (row) {
          return [{
            shift,
            org: getOrg(shift.orgId),
            unit: getUnit(shift.unitId),
            wave: w.wave,
            mode: dist.mode,
            expiresAt: dist.expiresAt,
            distanceKm: row.candidate.distanceKm,
            estimate: estimateFor(shift),
            minimum: breakdownFor(shift, 0),
          }];
        }
      }
      return [];
    })
    .sort((a, b) => Number(b.shift.type === "urgent") - Number(a.shift.type === "urgent") || byStart(a.shift, b.shift));
}

export interface AgendaEntry {
  id: string;
  startsAt: Date;
  endsAt: Date;
  title: string;
  place: string;
  source: "platform" | "external";
  status: ShiftStatus | "external";
  shift?: Shift;
  estimate?: SettlementBreakdown;
}

export function vetAgendaEntries(vetId = CURRENT_VET_ID): AgendaEntry[] {
  const platform: AgendaEntry[] = shifts
    .filter((s) => s.assignedVetId === vetId && COMMITTED.includes(s.status))
    .map((s) => ({
      id: s.id,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      title: `${getSpecialty(s.specialtyId).short} · ${getOrg(s.orgId).name}`,
      place: getUnit(s.unitId).name,
      source: "platform",
      status: s.status,
      shift: s,
      estimate: estimateFor(s),
    }));
  const external: AgendaEntry[] = externalCommitments
    .filter((e) => e.vetId === vetId)
    .map((e) => ({ id: e.id, startsAt: e.startsAt, endsAt: e.endsAt, title: e.title, place: e.place, source: "external", status: "external" }));
  return [...platform, ...external].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

export const vetReviews = (vetId: string) => reviews.filter((r) => r.vetId === vetId);
export const openDisputes = () => disputes.filter((d) => d.status !== "resolved");

// ——— Escala ———

export type RosterState = "filled" | "in_progress" | "completed" | "offered" | "open" | "gap" | "no_show" | "draft";

export interface RosterEntry {
  key: string;
  startsAt: Date;
  endsAt: Date;
  slotLabel: string;
  specialtyShort: string;
  state: RosterState;
  vet?: Vet;
  shiftId?: string;
}

const ROSTER_POOL = ["vet_rafael", "vet_gustavo", "vet_lucas", "vet_renato", "vet_julia"];
const EMERGENCY_SLOTS = [
  { label: "Diurno", start: 7, hours: 12 },
  { label: "Noturno", start: 19, hours: 12 },
] as const;

function stateFromShift(s: Shift): RosterState {
  switch (s.status) {
    case "filled":
      return "filled";
    case "in_progress":
      return "in_progress";
    case "completed":
    case "closed":
      return "completed";
    case "offered":
      return "offered";
    case "open":
      return "open";
    case "draft":
      return "draft";
    case "no_show":
      return "no_show";
    case "cancelled":
      return "gap";
  }
}

/** Escala de um dia: 2 turnos de emergência 24h (gerados) + vagas avulsas cadastradas. */
export function rosterForDay(unitId: string, year: number, month: number, day: number): RosterEntry[] {
  const unitIdx = units.findIndex((u) => u.id === unitId);
  const dayShifts = shifts.filter((s) => {
    if (s.unitId !== unitId) return false;
    const p = localParts(s.startsAt);
    return p.year === year && p.month === month && p.day === day;
  });

  const entries: RosterEntry[] = EMERGENCY_SLOTS.map((slot, slotIdx) => {
    const startsAt = localDate(year, month, day, slot.start);
    const endsAt = new Date(startsAt.getTime() + slot.hours * 3_600_000);
    const featured = dayShifts.find(
      (s) => s.specialtyId === "sp_emergencia" && s.startsAt.getTime() === startsAt.getTime(),
    );
    const base = { key: `${unitId}-${day}-${slotIdx}`, startsAt, endsAt, slotLabel: slot.label, specialtyShort: "Emergência" };
    if (featured) {
      return {
        ...base,
        state: stateFromShift(featured),
        vet: featured.assignedVetId ? getVet(featured.assignedVetId) : undefined,
        shiftId: featured.id,
      };
    }
    const offset = dayDiff(startsAt);
    const hash = (day * 31 + slotIdx * 7 + unitIdx * 13 + month * 3) % 97;
    const isGap = offset >= 0 && (offset <= 21 ? hash % 7 === 0 : hash % 3 === 0);
    if (isGap) return { ...base, state: "gap" };
    const vet = getVet(ROSTER_POOL[hash % ROSTER_POOL.length]!);
    const state: RosterState = endsAt <= DEMO_NOW ? "completed" : startsAt <= DEMO_NOW ? "in_progress" : "filled";
    return { ...base, state, vet };
  });

  const others: RosterEntry[] = dayShifts
    .filter((s) => s.specialtyId !== "sp_emergencia" && s.status !== "cancelled")
    .map((s) => ({
      key: s.id,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      slotLabel: getSpecialty(s.specialtyId).short,
      specialtyShort: getSpecialty(s.specialtyId).short,
      state: stateFromShift(s),
      vet: s.assignedVetId ? getVet(s.assignedVetId) : undefined,
      shiftId: s.id,
    }));

  return [...entries, ...others].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

export interface RosterDay {
  date: Date;
  day: number;
  entries: RosterEntry[];
}

export function rosterForMonth(unitId: string, year: number, month: number): RosterDay[] {
  return Array.from({ length: daysInMonth(year, month) }, (_, i) => ({
    date: localDate(year, month, i + 1, 12),
    day: i + 1,
    entries: rosterForDay(unitId, year, month, i + 1),
  }));
}

export interface GapView {
  unit: Unit;
  entry: RosterEntry;
}

/** Lacunas (turnos sem vaga publicada) nos próximos `days` dias, em todas as unidades. */
export function upcomingGaps(days = 14, orgId = CURRENT_ORG_ID): GapView[] {
  const result: GapView[] = [];
  for (let offset = 0; offset < days; offset++) {
    const p = localParts(at(offset, 12));
    for (const unit of orgUnits(orgId)) {
      for (const entry of rosterForDay(unit.id, p.year, p.month, p.day)) {
        if (entry.state === "gap" && entry.startsAt > DEMO_NOW) result.push({ unit, entry });
      }
    }
  }
  return result;
}
