import type {
  CrmvStatus,
  DistributionMode,
  LatLng,
  LineItem,
  ScoreWeights,
  WaveNumber,
} from "@/lib/core";

export type ShiftStatus =
  | "draft"
  | "open"
  | "offered"
  | "filled"
  | "in_progress"
  | "completed"
  | "closed"
  | "cancelled"
  | "no_show";

export type ShiftType = "single" | "recurring" | "urgent";

export interface Specialty {
  id: string;
  name: string;
  short: string;
}

export interface DistributionPolicy {
  mode: DistributionMode;
  waveTimeouts: { normalMinutes: number; urgentMinutes: number };
  wave2Size: number;
  scoreWeights: ScoreWeights;
  minRestHours: number;
  maxShiftsPerVetMonth: number;
  requireManualApproval: boolean;
  favoriteVetIds: string[];
  blockedVetIds: string[];
  cancellation: { windowHours: number; compensationPct: number };
}

export interface Organization {
  id: string;
  name: string;
  legalName: string;
  cnpj: string;
  rating: number;
  reviewsCount: number;
  /** % de pagamentos liberados no prazo. */
  paymentPunctuality: number;
  /** Média de vendas por plantão — base para estimar a comissão. */
  avgSalesPerShift: number;
  platformFeePct: number;
  policy: DistributionPolicy;
}

export interface Unit {
  id: string;
  orgId: string;
  name: string;
  /** Bairro/cidade — usado quando o nome da clínica já aparece ao lado. */
  shortName: string;
  address: string;
  location: LatLng;
}

export interface Vet {
  id: string;
  slug: string;
  name: string;
  crmvNumber: string;
  crmvUf: string;
  crmvStatus: CrmvStatus;
  specialtyIds: string[];
  base: LatLng;
  baseLabel: string;
  radiusKm: number;
  minRestHours: number;
  maxWeeklyHours: number;
  avgRating: number | null;
  reviewsCount: number;
  completedShifts: number;
  noShows: number;
  /** Plantões cumpridos por organização. */
  historyByOrg: Record<string, number>;
  shiftsThisMonth: number;
  memberSince: number;
  bio: string;
  hasCnpj: boolean;
}

export type OfferResponse = "accepted" | "declined" | "expired";

export interface Shift {
  id: string;
  code: string;
  orgId: string;
  unitId: string;
  specialtyId: string;
  startsAt: Date;
  endsAt: Date;
  type: ShiftType;
  status: ShiftStatus;
  fixedAmount: number;
  commissionPct: number;
  extras: LineItem[];
  requirements: string[];
  notes?: string;
  seriesLabel?: string;
  assignedVetId?: string;
  /** Onda em andamento (modo `waves`). */
  currentWave?: WaveNumber;
  waveStartedAt?: Date;
  /** Respostas já registradas, por vet. */
  responses?: Record<string, { response: OfferResponse; at: Date }>;
  requireManualApproval?: boolean;
  createdBy: string;
  publishedAt?: Date;
  filledAt?: Date;
  cancelledReason?: string;
  checkInAt?: Date;
  checkOutAt?: Date;
}

export type SettlementStatus = "pending" | "approved" | "disputed" | "paid";

export interface Settlement {
  shiftId: string;
  /** null = clínica ainda não informou as vendas do plantão. */
  salesAmount: number | null;
  discounts: LineItem[];
  status: SettlementStatus;
  paidAt?: Date;
  releaseAt?: Date;
}

export interface ExternalCommitment {
  id: string;
  vetId: string;
  title: string;
  place: string;
  startsAt: Date;
  endsAt: Date;
}

export interface DisputeMessage {
  from: "vet" | "clinic" | "admin";
  author: string;
  text: string;
  at: Date;
}

export interface Dispute {
  id: string;
  shiftId: string;
  openedByVetId: string;
  reason: string;
  claimedSalesAmount: number;
  status: "open" | "in_review" | "resolved";
  openedAt: Date;
  messages: DisputeMessage[];
}

export interface Review {
  id: string;
  vetId: string;
  orgId: string;
  rating: number;
  tags: string[];
  comment?: string;
  at: Date;
}

export interface VerificationDocument {
  type: "crmv" | "diploma" | "specialization" | "identity";
  label: string;
  fileName: string;
}

export interface VerificationRequest {
  id: string;
  name: string;
  cpfMasked: string;
  crmvNumber: string;
  crmvUf: string;
  specialties: string[];
  submittedAt: Date;
  documents: VerificationDocument[];
  status: "pending" | "verified" | "rejected";
  flags: string[];
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  entity: string;
  details: string;
  at: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  role: "clinic_admin" | "clinic_coordinator";
  email: string;
}
