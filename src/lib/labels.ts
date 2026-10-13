import type { DistributionMode, IneligibilityReason } from "@/lib/core";
import type { OfferState, RosterState, StatementStatus } from "@/lib/mock/queries";
import type { SettlementStatus, ShiftStatus, ShiftType } from "@/lib/mock/types";

export type Tone = "neutral" | "brand" | "blue" | "amber" | "red" | "violet" | "green" | "orange";

export const shiftStatusMeta: Record<ShiftStatus, { label: string; tone: Tone }> = {
  draft: { label: "Rascunho", tone: "neutral" },
  open: { label: "Publicada", tone: "blue" },
  offered: { label: "Em distribuição", tone: "amber" },
  filled: { label: "Preenchida", tone: "brand" },
  in_progress: { label: "Em andamento", tone: "violet" },
  completed: { label: "Aguardando fechamento", tone: "orange" },
  closed: { label: "Encerrada", tone: "green" },
  cancelled: { label: "Cancelada", tone: "neutral" },
  no_show: { label: "No-show", tone: "red" },
};

export const shiftTypeMeta: Record<ShiftType, { label: string; tone: Tone }> = {
  single: { label: "Avulsa", tone: "neutral" },
  recurring: { label: "Recorrente", tone: "blue" },
  urgent: { label: "Urgente", tone: "red" },
};

export const settlementStatusMeta: Record<SettlementStatus, { label: string; tone: Tone }> = {
  pending: { label: "Informar vendas", tone: "orange" },
  approved: { label: "Aprovado · a liberar", tone: "blue" },
  disputed: { label: "Em disputa", tone: "red" },
  paid: { label: "Pago", tone: "green" },
};

export const statementStatusMeta: Record<StatementStatus, { label: string; tone: Tone }> = {
  expected: { label: "Previsto", tone: "neutral" },
  pending: { label: "Aguardando fechamento", tone: "orange" },
  approved: { label: "A receber", tone: "blue" },
  disputed: { label: "Em disputa", tone: "red" },
  paid: { label: "Recebido", tone: "green" },
};

export const offerStateMeta: Record<OfferState, { label: string; tone: Tone }> = {
  pending: { label: "Aguardando resposta", tone: "amber" },
  accepted: { label: "Aceitou", tone: "brand" },
  declined: { label: "Recusou", tone: "neutral" },
  expired: { label: "Sem resposta", tone: "neutral" },
  queued: { label: "Na fila", tone: "blue" },
  not_sent: { label: "Não enviada", tone: "neutral" },
  filled_by_other: { label: "Vaga preenchida", tone: "neutral" },
};

export const reasonLabels: Record<IneligibilityReason, string> = {
  crmv_not_verified: "CRMV não verificado",
  blocked_by_clinic: "Bloqueado pela clínica",
  specialty_mismatch: "Especialidade incompatível",
  out_of_radius: "Fora do raio de atuação",
  schedule_conflict: "Conflito de agenda",
  insufficient_rest: "Descanso mínimo insuficiente",
  weekly_hours_exceeded: "Limite semanal de horas",
};

export const modeMeta: Record<DistributionMode, { label: string; description: string }> = {
  waves: {
    label: "Ondas",
    description: "Favoritos → melhores scores → todos os elegíveis, com tempo limite por onda.",
  },
  rotation: {
    label: "Rodízio",
    description: "Prioridade para quem pegou menos plantões na clínica no mês.",
  },
  first_come_capped: {
    label: "Primeiro a aceitar (com teto)",
    description: "Oferta simultânea a todos os elegíveis, com limite mensal por profissional.",
  },
  direct: {
    label: "Convite direto",
    description: "A vaga é oferecida a um profissional específico.",
  },
};

export const rosterStateMeta: Record<RosterState, { label: string; className: string }> = {
  filled: { label: "Confirmado", className: "bg-brand-50 text-brand-800 ring-brand-200" },
  in_progress: { label: "Em andamento", className: "bg-violet-50 text-violet-800 ring-violet-200" },
  completed: { label: "Realizado", className: "bg-slate-100 text-slate-600 ring-slate-200" },
  offered: { label: "Em distribuição", className: "bg-amber-50 text-amber-800 ring-amber-200" },
  open: { label: "Publicada", className: "bg-blue-50 text-blue-800 ring-blue-200" },
  draft: { label: "Rascunho", className: "bg-white text-slate-600 ring-0 border border-dashed border-slate-400" },
  gap: { label: "Lacuna", className: "bg-red-50 text-red-700 ring-0 border border-dashed border-red-400" },
  no_show: { label: "No-show", className: "bg-red-100 text-red-800 ring-red-300" },
};

export const roleLabels = {
  clinic_admin: "Administrador(a)",
  clinic_coordinator: "Coordenador(a)",
} as const;
