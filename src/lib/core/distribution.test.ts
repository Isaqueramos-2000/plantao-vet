import { describe, expect, it } from "vitest";
import { isUnderMonthlyCap, planWaves, resolveAcceptances, waveTimeoutMinutes } from "./distribution";
import { cancellationCompensation } from "./cancellation";

const at = (min: number) => new Date(Date.UTC(2026, 9, 13, 12, min));

describe("planWaves", () => {
  const candidates = [
    { vetId: "a", score: 70, isFavorite: false },
    { vetId: "b", score: 90, isFavorite: true },
    { vetId: "c", score: 85, isFavorite: false },
    { vetId: "d", score: 85, isFavorite: false },
    { vetId: "e", score: 60, isFavorite: true },
  ];

  it("onda 1 = favoritos; onda 2 = melhores scores; onda 3 = demais", () => {
    expect(planWaves(candidates, 2)).toEqual([
      { wave: 1, vetIds: ["b", "e"] },
      { wave: 2, vetIds: ["c", "d"] },
      { wave: 3, vetIds: ["a"] },
    ]);
  });

  it("timeout acelerado para vaga urgente", () => {
    expect(waveTimeoutMinutes({ normalMinutes: 15, urgentMinutes: 3 }, true)).toBe(3);
  });
});

describe("resolveAcceptances", () => {
  it("uma vaga só tem um aceite vencedor: o primeiro válido", () => {
    const r = resolveAcceptances(
      [
        { vetId: "x", wave: 1, at: at(5) },
        { vetId: "y", wave: 1, at: at(2) },
        { vetId: "z", wave: 2, at: at(1) }, // onda ainda não liberada
      ],
      1,
    );
    expect(r.winner?.vetId).toBe("y");
    expect(r.rejected.map((a) => a.vetId).sort()).toEqual(["x", "z"]);
  });

  it("empate no mesmo instante é resolvido de forma determinística", () => {
    const r = resolveAcceptances(
      [
        { vetId: "b", wave: 1, at: at(1) },
        { vetId: "a", wave: 1, at: at(1) },
      ],
      1,
    );
    expect(r.winner?.vetId).toBe("a");
  });

  it("sem aceites, não há vencedor", () => {
    expect(resolveAcceptances([], 3).winner).toBeNull();
  });
});

describe("teto mensal e cancelamento", () => {
  it("first_come_capped respeita o teto", () => {
    expect(isUnderMonthlyCap(11, 12)).toBe(true);
    expect(isUnderMonthlyCap(12, 12)).toBe(false);
  });

  it("cancelamento em cima da hora gera compensação", () => {
    const rule = { windowHours: 24, compensationPct: 50 };
    const start = at(0);
    const late = new Date(start.getTime() - 6 * 3_600_000);
    const early = new Date(start.getTime() - 48 * 3_600_000);
    expect(cancellationCompensation(110_000, late, start, rule)).toBe(55_000);
    expect(cancellationCompensation(110_000, early, start, rule)).toBe(0);
  });
});
