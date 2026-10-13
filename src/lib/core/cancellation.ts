export interface CancellationRule {
  /** Cancelamentos com menos de `windowHours` de antecedência geram compensação. */
  windowHours: number;
  /** Percentual do valor fixo pago ao plantonista como compensação. */
  compensationPct: number;
}

/** Compensação (centavos) devida ao plantonista quando a clínica cancela em cima da hora. */
export function cancellationCompensation(
  fixedAmount: number,
  cancelledAt: Date,
  startsAt: Date,
  rule: CancellationRule,
): number {
  const hoursBefore = (startsAt.getTime() - cancelledAt.getTime()) / 3_600_000;
  if (hoursBefore >= rule.windowHours) return 0;
  return Math.round((fixedAmount * rule.compensationPct) / 100);
}
