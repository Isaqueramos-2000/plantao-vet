/** Todos os valores monetários em centavos (inteiros). */
export interface LineItem {
  label: string;
  amount: number;
}

/** Quem paga a taxa da plataforma — pendente de decisão de produto (Seção 11 do plano). */
export type FeeBearer = "clinic" | "vet";

export interface SettlementInput {
  fixedAmount: number;
  salesAmount: number;
  /** Percentual de comissão sobre as vendas do plantão (0–100). */
  commissionPct: number;
  extras?: readonly LineItem[];
  discounts?: readonly LineItem[];
  platformFeePct: number;
  feeBearer: FeeBearer;
  /** Plantão encerrado antes do previsto: o fixo é proporcional ao tempo trabalhado. */
  worked?: { workedMinutes: number; scheduledMinutes: number };
}

export interface SettlementBreakdown {
  fixedAmount: number;
  commissionAmount: number;
  extrasAmount: number;
  discountsAmount: number;
  /** fixo + comissão + adicionais − descontos (nunca negativo). */
  grossAmount: number;
  platformFee: number;
  vetNetAmount: number;
  clinicTotalAmount: number;
}

function assertCents(name: string, value: number) {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} deve ser um inteiro não negativo em centavos`);
  }
}

function assertPct(name: string, value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new RangeError(`${name} deve estar entre 0 e 100`);
  }
}

const sum = (items: readonly LineItem[] = []) =>
  items.reduce((s, i) => {
    assertCents(`item "${i.label}"`, i.amount);
    return s + i.amount;
  }, 0);

/** total = fixo + (vendas × %comissão) + adicionais − descontos; arredondamento em centavos. */
export function calculateSettlement(input: SettlementInput): SettlementBreakdown {
  assertCents("fixedAmount", input.fixedAmount);
  assertCents("salesAmount", input.salesAmount);
  assertPct("commissionPct", input.commissionPct);
  assertPct("platformFeePct", input.platformFeePct);

  let fixedAmount = input.fixedAmount;
  if (input.worked) {
    const { workedMinutes, scheduledMinutes } = input.worked;
    if (scheduledMinutes <= 0) throw new RangeError("scheduledMinutes deve ser positivo");
    const ratio = Math.min(1, Math.max(0, workedMinutes / scheduledMinutes));
    fixedAmount = Math.round(input.fixedAmount * ratio);
  }

  const commissionAmount = Math.round((input.salesAmount * input.commissionPct) / 100);
  const extrasAmount = sum(input.extras);
  const discountsAmount = sum(input.discounts);
  const grossAmount = Math.max(0, fixedAmount + commissionAmount + extrasAmount - discountsAmount);
  const platformFee = Math.round((grossAmount * input.platformFeePct) / 100);

  return {
    fixedAmount,
    commissionAmount,
    extrasAmount,
    discountsAmount,
    grossAmount,
    platformFee,
    vetNetAmount: input.feeBearer === "vet" ? grossAmount - platformFee : grossAmount,
    clinicTotalAmount: input.feeBearer === "clinic" ? grossAmount + platformFee : grossAmount,
  };
}
