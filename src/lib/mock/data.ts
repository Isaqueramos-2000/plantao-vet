// Dados 100% fictícios. Nomes, CRMVs, CNPJs e endereços não correspondem a pessoas ou empresas reais.
import { DEFAULT_SCORE_WEIGHTS } from "@/lib/core";
import { at } from "@/lib/time";
import type {
  AuditEntry,
  Dispute,
  ExternalCommitment,
  Organization,
  Review,
  Settlement,
  Shift,
  Specialty,
  TeamMember,
  Unit,
  VerificationRequest,
  Vet,
} from "./types";

const R = (reais: number) => Math.round(reais * 100);

export const CURRENT_ORG_ID = "org_aurora";
export const CURRENT_VET_ID = "vet_marina";

export const specialties: Specialty[] = [
  { id: "sp_emergencia", name: "Emergência e terapia intensiva", short: "Emergência" },
  { id: "sp_clinica", name: "Clínica médica de pequenos animais", short: "Clínica médica" },
  { id: "sp_anestesia", name: "Anestesiologia", short: "Anestesia" },
  { id: "sp_cirurgia", name: "Cirurgia de tecidos moles", short: "Cirurgia" },
  { id: "sp_ortopedia", name: "Ortopedia", short: "Ortopedia" },
  { id: "sp_felinos", name: "Medicina felina", short: "Felinos" },
  { id: "sp_imagem", name: "Diagnóstico por imagem", short: "Imagem" },
  { id: "sp_exoticos", name: "Animais silvestres e exóticos", short: "Exóticos" },
  { id: "sp_cardio", name: "Cardiologia", short: "Cardiologia" },
];

export const organizations: Organization[] = [
  {
    id: "org_aurora",
    name: "Hospital Veterinário Aurora",
    legalName: "Aurora Serviços Veterinários Ltda.",
    cnpj: "12.345.678/0001-90",
    rating: 4.8,
    reviewsCount: 212,
    paymentPunctuality: 99,
    avgSalesPerShift: R(5800),
    platformFeePct: 8,
    policy: {
      mode: "waves",
      waveTimeouts: { normalMinutes: 15, urgentMinutes: 5 },
      wave2Size: 5,
      scoreWeights: DEFAULT_SCORE_WEIGHTS,
      minRestHours: 11,
      maxShiftsPerVetMonth: 12,
      requireManualApproval: false,
      favoriteVetIds: ["vet_marina", "vet_camila", "vet_beatriz", "vet_rafael"],
      blockedVetIds: ["vet_thiago"],
      cancellation: { windowHours: 24, compensationPct: 50 },
    },
  },
  {
    id: "org_bemtevi",
    name: "Clínica Veterinária Bem-te-vi",
    legalName: "Bem-te-vi Clínica Veterinária Eireli",
    cnpj: "23.456.789/0001-01",
    rating: 4.6,
    reviewsCount: 87,
    paymentPunctuality: 97,
    avgSalesPerShift: R(3900),
    platformFeePct: 8,
    policy: {
      mode: "waves",
      waveTimeouts: { normalMinutes: 15, urgentMinutes: 5 },
      wave2Size: 6,
      scoreWeights: DEFAULT_SCORE_WEIGHTS,
      minRestHours: 11,
      maxShiftsPerVetMonth: 10,
      requireManualApproval: false,
      favoriteVetIds: ["vet_camila", "vet_ana"],
      blockedVetIds: [],
      cancellation: { windowHours: 24, compensationPct: 50 },
    },
  },
  {
    id: "org_pa24",
    name: "PA Vet 24h Lapa",
    legalName: "Pronto Atendimento Veterinário Lapa Ltda.",
    cnpj: "34.567.890/0001-12",
    rating: 4.4,
    reviewsCount: 63,
    paymentPunctuality: 94,
    avgSalesPerShift: R(4500),
    platformFeePct: 8,
    policy: {
      mode: "first_come_capped",
      waveTimeouts: { normalMinutes: 15, urgentMinutes: 5 },
      wave2Size: 5,
      scoreWeights: DEFAULT_SCORE_WEIGHTS,
      minRestHours: 11,
      maxShiftsPerVetMonth: 8,
      requireManualApproval: true,
      favoriteVetIds: [],
      blockedVetIds: [],
      cancellation: { windowHours: 12, compensationPct: 30 },
    },
  },
];

export const units: Unit[] = [
  { id: "unit_pinheiros", orgId: "org_aurora", name: "Aurora Pinheiros", shortName: "Pinheiros", address: "Rua Cunha Gago, 1.240 — Pinheiros, São Paulo", location: { lat: -23.5664, lng: -46.6847 } },
  { id: "unit_moema", orgId: "org_aurora", name: "Aurora Moema", shortName: "Moema", address: "Av. Ibirapuera, 3.115 — Moema, São Paulo", location: { lat: -23.6005, lng: -46.665 } },
  { id: "unit_santoandre", orgId: "org_aurora", name: "Aurora Santo André", shortName: "Santo André", address: "Av. Portugal, 880 — Centro, Santo André", location: { lat: -23.6639, lng: -46.5383 } },
  { id: "unit_vilamariana", orgId: "org_bemtevi", name: "Bem-te-vi Vila Mariana", shortName: "Vila Mariana", address: "Rua Domingos de Morais, 2.050 — Vila Mariana, São Paulo", location: { lat: -23.5891, lng: -46.6345 } },
  { id: "unit_lapa", orgId: "org_pa24", name: "PA Vet 24h Lapa", shortName: "Lapa", address: "Rua Guaicurus, 1.410 — Lapa, São Paulo", location: { lat: -23.5207, lng: -46.7035 } },
];

type VetSeed = Omit<Vet, "slug" | "minRestHours" | "maxWeeklyHours" | "memberSince" | "bio" | "hasCnpj"> &
  Partial<Pick<Vet, "minRestHours" | "maxWeeklyHours" | "memberSince" | "bio" | "hasCnpj">>;

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const vet = (v: VetSeed): Vet => ({
  minRestHours: 11,
  maxWeeklyHours: 48,
  memberSince: 2025,
  bio: "",
  hasCnpj: true,
  ...v,
  slug: slugify(v.name),
});

export const vets: Vet[] = [
  vet({
    id: "vet_marina", name: "Marina Albuquerque", crmvNumber: "38.214", crmvUf: "SP", crmvStatus: "verified",
    specialtyIds: ["sp_emergencia", "sp_clinica", "sp_anestesia"], base: { lat: -23.553, lng: -46.691 }, baseLabel: "Vila Madalena",
    radiusKm: 25, maxWeeklyHours: 60, avgRating: 4.9, reviewsCount: 74, completedShifts: 86, noShows: 1,
    historyByOrg: { org_aurora: 14, org_bemtevi: 6, org_pa24: 3 }, shiftsThisMonth: 5, memberSince: 2025,
    bio: "Médica-veterinária há 8 anos, com residência em emergência e terapia intensiva. Experiência em triagem, estabilização e manejo de UTI em hospitais 24h.",
  }),
  vet({
    id: "vet_rafael", name: "Rafael Nogueira", crmvNumber: "41.877", crmvUf: "SP", crmvStatus: "verified",
    specialtyIds: ["sp_emergencia", "sp_clinica"], base: { lat: -23.536, lng: -46.678 }, baseLabel: "Perdizes",
    radiusKm: 20, avgRating: 4.8, reviewsCount: 41, completedShifts: 54, noShows: 0,
    historyByOrg: { org_aurora: 22 }, shiftsThisMonth: 7,
  }),
  vet({
    id: "vet_camila", name: "Camila Ferraz", crmvNumber: "35.902", crmvUf: "SP", crmvStatus: "verified",
    specialtyIds: ["sp_felinos", "sp_clinica"], base: { lat: -23.588, lng: -46.64 }, baseLabel: "Vila Mariana",
    radiusKm: 15, avgRating: 4.95, reviewsCount: 98, completedShifts: 112, noShows: 1,
    historyByOrg: { org_aurora: 31, org_bemtevi: 40 }, shiftsThisMonth: 6, memberSince: 2024,
  }),
  vet({
    id: "vet_joao", name: "João Pedro Lins", crmvNumber: "44.310", crmvUf: "SP", crmvStatus: "verified",
    specialtyIds: ["sp_cirurgia", "sp_ortopedia"], base: { lat: -23.571, lng: -46.708 }, baseLabel: "Butantã",
    radiusKm: 30, avgRating: 4.7, reviewsCount: 33, completedShifts: 39, noShows: 2,
    historyByOrg: { org_aurora: 6 }, shiftsThisMonth: 3,
  }),
  vet({
    id: "vet_beatriz", name: "Beatriz Okamoto", crmvNumber: "39.455", crmvUf: "SP", crmvStatus: "verified",
    specialtyIds: ["sp_anestesia"], base: { lat: -23.558, lng: -46.635 }, baseLabel: "Liberdade",
    radiusKm: 20, avgRating: 4.85, reviewsCount: 60, completedShifts: 71, noShows: 0,
    historyByOrg: { org_aurora: 18 }, shiftsThisMonth: 4, memberSince: 2024,
  }),
  vet({
    id: "vet_lucas", name: "Lucas Bertolini", crmvNumber: "47.021", crmvUf: "SP", crmvStatus: "verified",
    specialtyIds: ["sp_emergencia", "sp_clinica"], base: { lat: -23.655, lng: -46.53 }, baseLabel: "Santo André",
    radiusKm: 35, avgRating: 4.5, reviewsCount: 17, completedShifts: 22, noShows: 3,
    historyByOrg: { org_aurora: 4 }, shiftsThisMonth: 2,
  }),
  vet({
    id: "vet_fernanda", name: "Fernanda Queiroz", crmvNumber: "37.640", crmvUf: "SP", crmvStatus: "verified",
    specialtyIds: ["sp_imagem"], base: { lat: -23.565, lng: -46.69 }, baseLabel: "Pinheiros",
    radiusKm: 20, avgRating: 4.9, reviewsCount: 52, completedShifts: 64, noShows: 0,
    historyByOrg: { org_aurora: 9 }, shiftsThisMonth: 3,
  }),
  vet({
    id: "vet_thiago", name: "Thiago Ramalho", crmvNumber: "45.788", crmvUf: "SP", crmvStatus: "verified",
    specialtyIds: ["sp_clinica", "sp_emergencia"], base: { lat: -23.56, lng: -46.596 }, baseLabel: "Mooca",
    radiusKm: 25, avgRating: 4.2, reviewsCount: 15, completedShifts: 18, noShows: 4,
    historyByOrg: { org_aurora: 3 }, shiftsThisMonth: 1,
  }),
  vet({
    id: "vet_ana", name: "Ana Luiza Couto", crmvNumber: "42.519", crmvUf: "SP", crmvStatus: "verified",
    specialtyIds: ["sp_exoticos", "sp_clinica"], base: { lat: -23.618, lng: -46.639 }, baseLabel: "Saúde",
    radiusKm: 20, avgRating: 4.75, reviewsCount: 26, completedShifts: 30, noShows: 0,
    historyByOrg: { org_aurora: 2, org_bemtevi: 12 }, shiftsThisMonth: 2,
  }),
  vet({
    id: "vet_gustavo", name: "Gustavo Menezes", crmvNumber: "40.066", crmvUf: "SP", crmvStatus: "verified",
    specialtyIds: ["sp_cardio", "sp_clinica", "sp_emergencia"], base: { lat: -23.623, lng: -46.669 }, baseLabel: "Campo Belo",
    radiusKm: 25, avgRating: 4.6, reviewsCount: 37, completedShifts: 41, noShows: 1,
    historyByOrg: { org_aurora: 11 }, shiftsThisMonth: 4,
  }),
  vet({
    id: "vet_paula", name: "Paula Siqueira", crmvNumber: "48.903", crmvUf: "SP", crmvStatus: "pending",
    specialtyIds: ["sp_emergencia", "sp_anestesia"], base: { lat: -23.589, lng: -46.61 }, baseLabel: "Ipiranga",
    radiusKm: 25, avgRating: null, reviewsCount: 0, completedShifts: 0, noShows: 0,
    historyByOrg: {}, shiftsThisMonth: 0, memberSince: 2026,
  }),
  vet({
    id: "vet_diego", name: "Diego Antunes", crmvNumber: "43.270", crmvUf: "SP", crmvStatus: "verified",
    specialtyIds: ["sp_cirurgia", "sp_clinica"], base: { lat: -23.54, lng: -46.576 }, baseLabel: "Tatuapé",
    radiusKm: 30, avgRating: 4.65, reviewsCount: 40, completedShifts: 47, noShows: 1,
    historyByOrg: { org_aurora: 8 }, shiftsThisMonth: 3,
  }),
  vet({
    id: "vet_larissa", name: "Larissa Monteiro", crmvNumber: "49.115", crmvUf: "SP", crmvStatus: "pending",
    specialtyIds: ["sp_clinica", "sp_felinos"], base: { lat: -23.502, lng: -46.625 }, baseLabel: "Santana",
    radiusKm: 15, avgRating: null, reviewsCount: 0, completedShifts: 0, noShows: 0,
    historyByOrg: {}, shiftsThisMonth: 0, memberSince: 2026,
  }),
  vet({
    id: "vet_renato", name: "Renato Sales", crmvNumber: "46.402", crmvUf: "SP", crmvStatus: "verified",
    specialtyIds: ["sp_emergencia", "sp_clinica"], base: { lat: -23.6, lng: -46.72 }, baseLabel: "Morumbi",
    radiusKm: 12, avgRating: 4.7, reviewsCount: 22, completedShifts: 28, noShows: 0,
    historyByOrg: { org_aurora: 5 }, shiftsThisMonth: 2,
  }),
  vet({
    id: "vet_julia", name: "Júlia Barros", crmvNumber: "45.120", crmvUf: "SP", crmvStatus: "verified",
    specialtyIds: ["sp_emergencia", "sp_clinica", "sp_felinos"], base: { lat: -23.602, lng: -46.662 }, baseLabel: "Moema",
    radiusKm: 20, avgRating: 4.8, reviewsCount: 31, completedShifts: 36, noShows: 0,
    historyByOrg: { org_aurora: 9 }, shiftsThisMonth: 11,
  }),
];

const night = (amount: number) => [{ label: "Adicional noturno", amount: R(amount) }];

export const shifts: Shift[] = [
  // ——— Hospital Veterinário Aurora ———
  {
    id: "shf_1042", code: "1042", orgId: "org_aurora", unitId: "unit_pinheiros", specialtyId: "sp_emergencia",
    startsAt: at(0, 19), endsAt: at(1, 7), type: "urgent", status: "offered",
    fixedAmount: R(1100), commissionPct: 8, extras: night(150),
    requirements: ["Mínimo de 2 anos em emergência", "Manejo de UTI e intubação"],
    notes: "Cobertura do plantão noturno após cancelamento por motivo de saúde. Equipe de apoio: 2 enfermeiros e 1 auxiliar.",
    currentWave: 1, waveStartedAt: at(0, 9, 37), createdBy: "Ricardo Tavares", publishedAt: at(0, 9, 31),
  },
  {
    id: "shf_1040", code: "1040", orgId: "org_aurora", unitId: "unit_pinheiros", specialtyId: "sp_emergencia",
    startsAt: at(0, 7), endsAt: at(0, 19), type: "single", status: "in_progress",
    fixedAmount: R(950), commissionPct: 8, extras: [], requirements: [], assignedVetId: "vet_rafael",
    createdBy: "Ricardo Tavares", publishedAt: at(-6, 14), filledAt: at(-6, 14, 9), checkInAt: at(0, 6, 52),
  },
  {
    id: "shf_1043", code: "1043", orgId: "org_aurora", unitId: "unit_moema", specialtyId: "sp_clinica",
    startsAt: at(1, 8), endsAt: at(1, 20), type: "single", status: "offered",
    fixedAmount: R(850), commissionPct: 10, extras: [], requirements: ["Atendimento ambulatorial e retornos"],
    currentWave: 2, waveStartedAt: at(0, 9, 32),
    responses: {
      vet_camila: { response: "declined", at: at(0, 9, 19) },
      vet_marina: { response: "declined", at: at(0, 9, 22) },
    },
    createdBy: "Ricardo Tavares", publishedAt: at(0, 9, 15),
  },
  {
    id: "shf_1044", code: "1044", orgId: "org_aurora", unitId: "unit_santoandre", specialtyId: "sp_anestesia",
    startsAt: at(2, 7), endsAt: at(2, 19), type: "single", status: "filled",
    fixedAmount: R(1200), commissionPct: 0, extras: [], requirements: ["Anestesia inalatória e monitoração multiparamétrica"],
    assignedVetId: "vet_beatriz", createdBy: "Helena Prado", publishedAt: at(-1, 15), filledAt: at(-1, 15, 12),
  },
  {
    id: "shf_1052", code: "1052", orgId: "org_aurora", unitId: "unit_santoandre", specialtyId: "sp_clinica",
    startsAt: at(3, 8), endsAt: at(3, 20), type: "single", status: "offered",
    fixedAmount: R(800), commissionPct: 10, extras: [], requirements: [],
    currentWave: 3, waveStartedAt: at(0, 9, 30),
    responses: { vet_marina: { response: "declined", at: at(-1, 18, 2) }, vet_lucas: { response: "declined", at: at(0, 8, 47) } },
    createdBy: "Ricardo Tavares", publishedAt: at(-1, 17, 40),
  },
  {
    id: "shf_1045", code: "1045", orgId: "org_aurora", unitId: "unit_pinheiros", specialtyId: "sp_cirurgia",
    startsAt: at(4, 8), endsAt: at(4, 18), type: "single", status: "open",
    fixedAmount: R(1300), commissionPct: 12, extras: [], requirements: ["Cirurgias eletivas de tecidos moles", "Experiência com videocirurgia (desejável)"],
    createdBy: "Helena Prado", publishedAt: at(0, 9, 5),
  },
  {
    id: "shf_1046", code: "1046", orgId: "org_aurora", unitId: "unit_moema", specialtyId: "sp_felinos",
    startsAt: at(5, 13), endsAt: at(5, 23), type: "single", status: "filled",
    fixedAmount: R(900), commissionPct: 10, extras: [], requirements: ["Certificação Cat Friendly (desejável)"],
    assignedVetId: "vet_camila", requireManualApproval: true, createdBy: "Ricardo Tavares", publishedAt: at(-2, 10), filledAt: at(-2, 10, 6),
  },
  {
    id: "shf_1050", code: "1050", orgId: "org_aurora", unitId: "unit_pinheiros", specialtyId: "sp_emergencia",
    startsAt: at(6, 7), endsAt: at(6, 19), type: "single", status: "filled",
    fixedAmount: R(950), commissionPct: 8, extras: [], requirements: [], assignedVetId: "vet_marina",
    createdBy: "Ricardo Tavares", publishedAt: at(-3, 11), filledAt: at(-3, 11, 2),
  },
  {
    id: "shf_1047", code: "1047", orgId: "org_aurora", unitId: "unit_santoandre", specialtyId: "sp_emergencia",
    startsAt: at(7, 19), endsAt: at(8, 7), type: "recurring", status: "filled", seriesLabel: "Semanal · 8 ocorrências",
    fixedAmount: R(1050), commissionPct: 8, extras: night(150), requirements: [], assignedVetId: "vet_lucas",
    createdBy: "Helena Prado", publishedAt: at(-10, 9), filledAt: at(-10, 9, 41),
  },
  {
    id: "shf_1048", code: "1048", orgId: "org_aurora", unitId: "unit_pinheiros", specialtyId: "sp_imagem",
    startsAt: at(8, 8), endsAt: at(8, 14), type: "single", status: "draft",
    fixedAmount: R(700), commissionPct: 15, extras: [], requirements: ["Ultrassonografia abdominal e ecodopplercardiograma"],
    createdBy: "Ricardo Tavares",
  },
  {
    id: "shf_1051", code: "1051", orgId: "org_aurora", unitId: "unit_moema", specialtyId: "sp_clinica",
    startsAt: at(10, 8), endsAt: at(10, 20), type: "recurring", status: "filled", seriesLabel: "Semanal · 4 ocorrências",
    fixedAmount: R(850), commissionPct: 10, extras: [], requirements: [], assignedVetId: "vet_gustavo",
    createdBy: "Ricardo Tavares", publishedAt: at(-7, 16), filledAt: at(-7, 16, 22),
  },
  {
    id: "shf_1055", code: "1055", orgId: "org_aurora", unitId: "unit_santoandre", specialtyId: "sp_emergencia",
    startsAt: at(13, 19), endsAt: at(14, 7), type: "single", status: "filled",
    fixedAmount: R(1050), commissionPct: 8, extras: night(150), requirements: [], assignedVetId: "vet_marina",
    createdBy: "Helena Prado", publishedAt: at(-4, 10), filledAt: at(-4, 10, 4),
  },
  {
    id: "shf_1049", code: "1049", orgId: "org_aurora", unitId: "unit_moema", specialtyId: "sp_emergencia",
    startsAt: at(2, 19), endsAt: at(3, 7), type: "single", status: "cancelled",
    fixedAmount: R(1100), commissionPct: 8, extras: night(150), requirements: [],
    cancelledReason: "Remanejamento interno da equipe (cancelada antes do preenchimento).",
    createdBy: "Ricardo Tavares", publishedAt: at(-1, 9),
  },
  // Passado
  {
    id: "shf_1039", code: "1039", orgId: "org_aurora", unitId: "unit_moema", specialtyId: "sp_emergencia",
    startsAt: at(-1, 19), endsAt: at(0, 7), type: "single", status: "completed",
    fixedAmount: R(1100), commissionPct: 8, extras: night(150), requirements: [], assignedVetId: "vet_marina",
    createdBy: "Ricardo Tavares", publishedAt: at(-5, 10), filledAt: at(-5, 10, 3), checkInAt: at(-1, 18, 48), checkOutAt: at(0, 7, 6),
  },
  {
    id: "shf_1038", code: "1038", orgId: "org_aurora", unitId: "unit_pinheiros", specialtyId: "sp_clinica",
    startsAt: at(-1, 8), endsAt: at(-1, 20), type: "single", status: "completed",
    fixedAmount: R(850), commissionPct: 10, extras: [], requirements: [], assignedVetId: "vet_julia",
    createdBy: "Ricardo Tavares", publishedAt: at(-6, 10), filledAt: at(-6, 10, 18), checkInAt: at(-1, 7, 51), checkOutAt: at(-1, 20, 12),
  },
  {
    id: "shf_1033", code: "1033", orgId: "org_aurora", unitId: "unit_pinheiros", specialtyId: "sp_emergencia",
    startsAt: at(-2, 19), endsAt: at(-1, 7), type: "single", status: "closed",
    fixedAmount: R(1100), commissionPct: 8, extras: night(150), requirements: [], assignedVetId: "vet_marina",
    createdBy: "Ricardo Tavares", publishedAt: at(-8, 9), filledAt: at(-8, 9, 4), checkInAt: at(-2, 18, 50), checkOutAt: at(-1, 7, 3),
  },
  {
    id: "shf_1036", code: "1036", orgId: "org_aurora", unitId: "unit_pinheiros", specialtyId: "sp_clinica",
    startsAt: at(-3, 8), endsAt: at(-3, 20), type: "single", status: "closed",
    fixedAmount: R(850), commissionPct: 10, extras: [], requirements: [], assignedVetId: "vet_gustavo",
    createdBy: "Ricardo Tavares", publishedAt: at(-9, 9), filledAt: at(-9, 9, 30),
  },
  {
    id: "shf_1035", code: "1035", orgId: "org_aurora", unitId: "unit_santoandre", specialtyId: "sp_emergencia",
    startsAt: at(-4, 19), endsAt: at(-3, 7), type: "single", status: "no_show",
    fixedAmount: R(1050), commissionPct: 8, extras: night(150), requirements: [], assignedVetId: "vet_thiago",
    notes: "Profissional não compareceu. Coberto por plantonista interno. Penalidade aplicada ao score e profissional bloqueado.",
    createdBy: "Helena Prado", publishedAt: at(-12, 10), filledAt: at(-12, 10, 55),
  },
  {
    id: "shf_1034", code: "1034", orgId: "org_aurora", unitId: "unit_moema", specialtyId: "sp_anestesia",
    startsAt: at(-6, 7), endsAt: at(-6, 19), type: "single", status: "closed",
    fixedAmount: R(1200), commissionPct: 0, extras: [], requirements: [], assignedVetId: "vet_beatriz",
    createdBy: "Helena Prado", publishedAt: at(-13, 10), filledAt: at(-13, 10, 2),
  },
  {
    id: "shf_1031", code: "1031", orgId: "org_aurora", unitId: "unit_pinheiros", specialtyId: "sp_cirurgia",
    startsAt: at(-8, 8), endsAt: at(-8, 18), type: "single", status: "closed",
    fixedAmount: R(1300), commissionPct: 12, extras: [], requirements: [], assignedVetId: "vet_joao",
    createdBy: "Helena Prado", publishedAt: at(-15, 10), filledAt: at(-15, 11),
  },
  {
    id: "shf_1030", code: "1030", orgId: "org_aurora", unitId: "unit_santoandre", specialtyId: "sp_emergencia",
    startsAt: at(-9, 19), endsAt: at(-8, 7), type: "recurring", status: "closed", seriesLabel: "Semanal · 8 ocorrências",
    fixedAmount: R(1050), commissionPct: 8, extras: night(150), requirements: [], assignedVetId: "vet_lucas",
    createdBy: "Helena Prado", publishedAt: at(-10, 9), filledAt: at(-10, 9, 41),
  },
  {
    id: "shf_1028", code: "1028", orgId: "org_aurora", unitId: "unit_moema", specialtyId: "sp_felinos",
    startsAt: at(-11, 13), endsAt: at(-11, 23), type: "single", status: "closed",
    fixedAmount: R(900), commissionPct: 10, extras: [], requirements: [], assignedVetId: "vet_camila",
    createdBy: "Ricardo Tavares", publishedAt: at(-16, 10), filledAt: at(-16, 10, 1),
  },
  {
    id: "shf_1027", code: "1027", orgId: "org_aurora", unitId: "unit_pinheiros", specialtyId: "sp_emergencia",
    startsAt: at(-12, 7), endsAt: at(-12, 19), type: "single", status: "closed",
    fixedAmount: R(950), commissionPct: 8, extras: [], requirements: [], assignedVetId: "vet_marina",
    createdBy: "Ricardo Tavares", publishedAt: at(-17, 10), filledAt: at(-17, 10, 2),
  },
  {
    id: "shf_1025", code: "1025", orgId: "org_aurora", unitId: "unit_moema", specialtyId: "sp_clinica",
    startsAt: at(-15, 8), endsAt: at(-15, 20), type: "single", status: "closed",
    fixedAmount: R(850), commissionPct: 10, extras: [], requirements: [], assignedVetId: "vet_rafael",
    createdBy: "Ricardo Tavares", publishedAt: at(-20, 10), filledAt: at(-20, 10, 12),
  },

  // ——— Outras clínicas (visíveis só para o plantonista) ———
  {
    id: "shf_2210", code: "2210", orgId: "org_bemtevi", unitId: "unit_vilamariana", specialtyId: "sp_clinica",
    startsAt: at(1, 8), endsAt: at(1, 20), type: "single", status: "offered",
    fixedAmount: R(900), commissionPct: 10, extras: [], requirements: ["Atendimento ambulatorial", "Internação de baixa complexidade"],
    currentWave: 2, waveStartedAt: at(0, 9, 33), createdBy: "Equipe Bem-te-vi", publishedAt: at(0, 9, 10),
  },
  {
    id: "shf_2207", code: "2207", orgId: "org_bemtevi", unitId: "unit_vilamariana", specialtyId: "sp_emergencia",
    startsAt: at(3, 19), endsAt: at(4, 7), type: "single", status: "filled",
    fixedAmount: R(1000), commissionPct: 8, extras: night(120), requirements: [], assignedVetId: "vet_marina",
    createdBy: "Equipe Bem-te-vi", publishedAt: at(-4, 9), filledAt: at(-4, 9, 7),
  },
  {
    id: "shf_2201", code: "2201", orgId: "org_bemtevi", unitId: "unit_vilamariana", specialtyId: "sp_clinica",
    startsAt: at(-5, 8), endsAt: at(-5, 20), type: "single", status: "closed",
    fixedAmount: R(900), commissionPct: 10, extras: [], requirements: [], assignedVetId: "vet_marina",
    createdBy: "Equipe Bem-te-vi", publishedAt: at(-10, 9), filledAt: at(-10, 9, 5),
  },
  {
    id: "shf_3105", code: "3105", orgId: "org_pa24", unitId: "unit_lapa", specialtyId: "sp_emergencia",
    startsAt: at(9, 19), endsAt: at(10, 7), type: "single", status: "offered",
    fixedAmount: R(1050), commissionPct: 5, extras: night(100), requirements: ["Experiência em pronto atendimento"],
    createdBy: "Equipe PA Vet 24h", publishedAt: at(0, 8, 50),
  },
  {
    id: "shf_3098", code: "3098", orgId: "org_pa24", unitId: "unit_lapa", specialtyId: "sp_emergencia",
    startsAt: at(-9, 8), endsAt: at(-9, 20), type: "single", status: "closed",
    fixedAmount: R(1000), commissionPct: 5, extras: [], requirements: [], assignedVetId: "vet_marina",
    createdBy: "Equipe PA Vet 24h", publishedAt: at(-14, 9), filledAt: at(-14, 9, 20),
  },
];

export const settlements: Settlement[] = [
  { shiftId: "shf_1039", salesAmount: null, discounts: [], status: "pending" },
  { shiftId: "shf_1038", salesAmount: null, discounts: [], status: "pending" },
  { shiftId: "shf_1033", salesAmount: R(6480), discounts: [], status: "approved", releaseAt: at(1, 10) },
  { shiftId: "shf_1036", salesAmount: R(4120), discounts: [], status: "paid", paidAt: at(-1, 10) },
  { shiftId: "shf_1034", salesAmount: 0, discounts: [], status: "paid", paidAt: at(-4, 10) },
  { shiftId: "shf_1031", salesAmount: R(3200), discounts: [], status: "disputed" },
  { shiftId: "shf_1030", salesAmount: R(5210), discounts: [{ label: "Consumo de refeição extra", amount: R(35) }], status: "paid", paidAt: at(-6, 10) },
  { shiftId: "shf_1028", salesAmount: R(3870), discounts: [], status: "paid", paidAt: at(-9, 10) },
  { shiftId: "shf_1027", salesAmount: R(5940), discounts: [], status: "paid", paidAt: at(-10, 10) },
  { shiftId: "shf_1025", salesAmount: R(4450), discounts: [], status: "paid", paidAt: at(-13, 10) },
  { shiftId: "shf_2201", salesAmount: R(3600), discounts: [], status: "paid", paidAt: at(-3, 10) },
  { shiftId: "shf_3098", salesAmount: R(4980), discounts: [], status: "paid", paidAt: at(-6, 10) },
];

export const externalCommitments: ExternalCommitment[] = [
  {
    id: "ext_1", vetId: "vet_marina", title: "Plantão externo (adicionado manualmente)", place: "Clínica particular — Butantã",
    startsAt: at(4, 16), endsAt: at(4, 22),
  },
];

export const disputes: Dispute[] = [
  {
    id: "dsp_301", shiftId: "shf_1031", openedByVetId: "vet_joao", status: "open", openedAt: at(-6, 11, 20),
    reason: "Vendas informadas não incluem a enterectomia realizada às 15h, que foi faturada no plantão.",
    claimedSalesAmount: R(5900),
    messages: [
      { from: "vet", author: "João Pedro Lins", at: at(-6, 11, 20), text: "A cirurgia de corpo estranho do paciente Thor foi feita no meu plantão e não aparece nas vendas. Anexei o prontuário." },
      { from: "clinic", author: "Helena Prado", at: at(-5, 9, 2), text: "O procedimento foi faturado no dia seguinte pelo financeiro. Vamos conferir o lançamento." },
      { from: "admin", author: "Suporte PlantãoVet", at: at(-5, 9, 40), text: "Liberação do pagamento suspensa até a resolução. Prazo de análise: 3 dias úteis." },
    ],
  },
  {
    id: "dsp_298", shiftId: "shf_1030", openedByVetId: "vet_lucas", status: "resolved", openedAt: at(-7, 14),
    reason: "Desconto de refeição não combinado previamente.",
    claimedSalesAmount: R(5210),
    messages: [
      { from: "vet", author: "Lucas Bertolini", at: at(-7, 14), text: "Não fui informado sobre o desconto de refeição." },
      { from: "clinic", author: "Helena Prado", at: at(-7, 16), text: "Consta no regulamento interno, enviado no aceite." },
      { from: "admin", author: "Suporte PlantãoVet", at: at(-6, 9), text: "Resolvido a favor da clínica: regra informada nas observações da vaga." },
    ],
  },
];

export const reviews: Review[] = [
  { id: "rev_1", vetId: "vet_marina", orgId: "org_aurora", rating: 5, tags: ["Pontual", "Domínio em emergência", "Ótima com tutores"], comment: "Conduziu duas emergências simultâneas com muita calma. Prontuários impecáveis.", at: at(-1, 9) },
  { id: "rev_2", vetId: "vet_marina", orgId: "org_bemtevi", rating: 5, tags: ["Organizada", "Boa passagem de plantão"], comment: "Passagem de plantão clara e completa. Queremos de volta!", at: at(-4, 18) },
  { id: "rev_3", vetId: "vet_marina", orgId: "org_pa24", rating: 4, tags: ["Pontual", "Trabalho em equipe"], at: at(-8, 9) },
  { id: "rev_4", vetId: "vet_marina", orgId: "org_aurora", rating: 5, tags: ["Domínio em emergência", "Liderança"], comment: "Excelente condução de PCR. Equipe de enfermagem elogiou.", at: at(-11, 20) },
];

export const verificationRequests: VerificationRequest[] = [
  {
    id: "ver_88", name: "Paula Siqueira", cpfMasked: "***.482.917-**", crmvNumber: "48.903", crmvUf: "SP",
    specialties: ["Emergência", "Anestesia"], submittedAt: at(0, 8, 12), status: "pending", flags: [],
    documents: [
      { type: "crmv", label: "Carteira CRMV", fileName: "crmv-frente-verso.pdf" },
      { type: "diploma", label: "Diploma de graduação", fileName: "diploma-usp.pdf" },
      { type: "specialization", label: "Certificado de residência em emergência", fileName: "residencia-emergencia.pdf" },
    ],
  },
  {
    id: "ver_87", name: "Larissa Monteiro", cpfMasked: "***.115.306-**", crmvNumber: "49.115", crmvUf: "SP",
    specialties: ["Clínica médica", "Felinos"], submittedAt: at(-1, 16, 40), status: "pending", flags: ["Foto do documento com baixa legibilidade"],
    documents: [
      { type: "crmv", label: "Carteira CRMV", fileName: "IMG_2041.jpg" },
      { type: "diploma", label: "Diploma de graduação", fileName: "diploma.pdf" },
    ],
  },
  {
    id: "ver_86", name: "Vinícius Prado", cpfMasked: "***.903.554-**", crmvNumber: "12.876", crmvUf: "RJ",
    specialties: ["Ortopedia"], submittedAt: at(-1, 11, 5), status: "pending", flags: ["CRMV de outra UF — exige inscrição secundária em SP"],
    documents: [
      { type: "crmv", label: "Carteira CRMV-RJ", fileName: "crmv-rj.pdf" },
      { type: "diploma", label: "Diploma de graduação", fileName: "diploma-uff.pdf" },
      { type: "specialization", label: "Especialização em ortopedia", fileName: "ortopedia.pdf" },
    ],
  },
  {
    id: "ver_85", name: "Isabela Rocha", cpfMasked: "***.230.781-**", crmvNumber: "50.032", crmvUf: "SP",
    specialties: ["Clínica médica"], submittedAt: at(-2, 9, 30), status: "pending", flags: [],
    documents: [
      { type: "crmv", label: "Carteira CRMV", fileName: "crmv.pdf" },
      { type: "identity", label: "Documento de identidade", fileName: "rg.pdf" },
    ],
  },
];

export const auditLog: AuditEntry[] = [
  { id: "aud_1", actor: "Suporte PlantãoVet", action: "Disputa: pagamento suspenso", entity: "Fechamento #1031", details: "Liberação suspensa até resolução da disputa dsp_301", at: at(-5, 9, 40) },
  { id: "aud_2", actor: "Ana (Verificação)", action: "CRMV aprovado", entity: "Júlia Barros · CRMV-SP 45.120", details: "Consulta pública ao CRMV-SP: inscrição ativa", at: at(-5, 15, 12) },
  { id: "aud_3", actor: "Helena Prado", action: "Valor da vaga alterado", entity: "Vaga #1047", details: "Fixo R$ 1.000,00 → R$ 1.050,00", at: at(-10, 9, 35) },
  { id: "aud_4", actor: "Sistema", action: "Penalidade de no-show", entity: "Thiago Ramalho", details: "Taxa de comparecimento 85,7% → 81,8%", at: at(-3, 8, 0) },
  { id: "aud_5", actor: "Helena Prado", action: "Profissional bloqueado", entity: "Thiago Ramalho", details: "Bloqueado pela clínica Hospital Veterinário Aurora", at: at(-3, 9, 14) },
  { id: "aud_6", actor: "Suporte PlantãoVet", action: "Disputa resolvida", entity: "Fechamento #1030", details: "A favor da clínica — regra informada nas observações", at: at(-6, 9, 0) },
  { id: "aud_7", actor: "Ana (Verificação)", action: "CRMV rejeitado", entity: "Carlos M. · CRMV-SP 51.002", details: "Inscrição cancelada na consulta pública", at: at(-7, 10, 22) },
];

export const teamMembers: TeamMember[] = [
  { id: "usr_helena", name: "Helena Prado", role: "clinic_admin", email: "helena@aurora.vet.exemplo" },
  { id: "usr_ricardo", name: "Ricardo Tavares", role: "clinic_coordinator", email: "ricardo@aurora.vet.exemplo" },
  { id: "usr_simone", name: "Simone Araújo", role: "clinic_coordinator", email: "simone@aurora.vet.exemplo" },
];
