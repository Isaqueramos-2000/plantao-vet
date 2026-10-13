import { durationHours } from "@/lib/core";
import { formatBRL, formatHours, formatPct } from "@/lib/format";
import type { Shift } from "@/lib/mock/types";

/** "R$ 1.100 + 8% das vendas" */
export function payLabel(shift: Pick<Shift, "fixedAmount" | "commissionPct">): string {
  const fixed = formatBRL(shift.fixedAmount, { cents: false });
  return shift.commissionPct > 0 ? `${fixed} + ${formatPct(shift.commissionPct, shift.commissionPct % 1 ? 1 : 0)} das vendas` : fixed;
}

export function extrasLabel(shift: Pick<Shift, "extras">): string | null {
  if (shift.extras.length === 0) return null;
  return shift.extras.map((e) => `${e.label} ${formatBRL(e.amount, { cents: false })}`).join(" · ");
}

export function shiftHours(shift: Pick<Shift, "startsAt" | "endsAt">): string {
  return formatHours(durationHours(shift));
}
