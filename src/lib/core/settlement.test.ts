import { describe, expect, it } from "vitest";
import { calculateSettlement, type SettlementInput } from "./settlement";

const base: SettlementInput = {
  fixedAmount: 110_000,
  salesAmount: 648_000,
  commissionPct: 8,
  extras: [{ label: "Adicional noturno", amount: 15_000 }],
  discounts: [],
  platformFeePct: 10,
  feeBearer: "clinic",
};

describe("calculateSettlement", () => {
  it("soma fixo + comissão + adicionais − descontos", () => {
    const r = calculateSettlement({ ...base, discounts: [{ label: "Consumo", amount: 5_000 }] });
    expect(r.commissionAmount).toBe(51_840);
    expect(r.grossAmount).toBe(110_000 + 51_840 + 15_000 - 5_000);
  });

  it("taxa paga pela clínica não reduz o líquido do plantonista", () => {
    const r = calculateSettlement(base);
    expect(r.grossAmount).toBe(176_840);
    expect(r.platformFee).toBe(17_684);
    expect(r.vetNetAmount).toBe(176_840);
    expect(r.clinicTotalAmount).toBe(194_524);
  });

  it("taxa paga pelo plantonista é descontada do líquido", () => {
    const r = calculateSettlement({ ...base, feeBearer: "vet" });
    expect(r.vetNetAmount).toBe(176_840 - 17_684);
    expect(r.clinicTotalAmount).toBe(176_840);
  });

  it("vendas zero → apenas fixo e adicionais", () => {
    const r = calculateSettlement({ ...base, salesAmount: 0 });
    expect(r.commissionAmount).toBe(0);
    expect(r.grossAmount).toBe(125_000);
  });

  it("comissão zero ignora as vendas", () => {
    const r = calculateSettlement({ ...base, commissionPct: 0 });
    expect(r.commissionAmount).toBe(0);
  });

  it("arredonda a comissão para o centavo mais próximo", () => {
    const r = calculateSettlement({ ...base, salesAmount: 333, commissionPct: 7.5 });
    expect(r.commissionAmount).toBe(25); // 24,975 → 25
  });

  it("plantão encerrado parcialmente prorroga o fixo pelo tempo trabalhado", () => {
    const r = calculateSettlement({
      ...base,
      salesAmount: 0,
      extras: [],
      worked: { workedMinutes: 360, scheduledMinutes: 720 },
    });
    expect(r.fixedAmount).toBe(55_000);
  });

  it("descontos maiores que o bruto não geram valor negativo", () => {
    const r = calculateSettlement({ ...base, discounts: [{ label: "Estorno", amount: 9_999_999 }] });
    expect(r.grossAmount).toBe(0);
    expect(r.platformFee).toBe(0);
  });

  it("rejeita valores inválidos", () => {
    expect(() => calculateSettlement({ ...base, fixedAmount: -1 })).toThrow(RangeError);
    expect(() => calculateSettlement({ ...base, salesAmount: 10.5 })).toThrow(RangeError);
    expect(() => calculateSettlement({ ...base, commissionPct: 120 })).toThrow(RangeError);
  });
});
