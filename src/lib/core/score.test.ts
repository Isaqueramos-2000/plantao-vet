import { describe, expect, it } from "vitest";
import { computeScore, DEFAULT_SCORE_WEIGHTS, type ScoreInputs } from "./score";

const inputs: ScoreInputs = {
  avgRating: 4.8,
  completedShifts: 50,
  noShows: 0,
  shiftsWithClinic: 5,
  distanceKm: 5,
  radiusKm: 20,
  shiftsInPeriod: 3,
  equityCap: 12,
};

describe("computeScore", () => {
  it("é determinístico", () => {
    expect(computeScore(inputs)).toEqual(computeScore({ ...inputs }));
  });

  it("calcula a média ponderada em 0–100", () => {
    // rating .95, attendance 1, history .5, distance .75, equity .75
    expect(computeScore(inputs).total).toBe(84.8);
  });

  it("no-show penaliza o score", () => {
    const withNoShow = computeScore({ ...inputs, noShows: 5 }).total;
    expect(withNoShow).toBeLessThan(computeScore(inputs).total);
  });

  it("equidade penaliza quem já pegou muitos plantões no período", () => {
    expect(computeScore({ ...inputs, shiftsInPeriod: 12 }).components.equity).toBe(0);
    expect(computeScore({ ...inputs, shiftsInPeriod: 12 }).total).toBeLessThan(computeScore(inputs).total);
  });

  it("profissional novo recebe valores neutros, não zero", () => {
    const r = computeScore({ ...inputs, avgRating: null, completedShifts: 0, noShows: 0 });
    expect(r.components.rating).toBe(0.6);
    expect(r.components.attendance).toBe(0.9);
  });

  it("respeita os pesos configurados", () => {
    const onlyDistance = { ...DEFAULT_SCORE_WEIGHTS, rating: 0, attendance: 0, history: 0, equity: 0 };
    expect(computeScore(inputs, onlyDistance).total).toBe(75);
  });
});
