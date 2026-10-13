export interface ScoreInputs {
  /** Média de avaliações (1–5) ou null se ainda não avaliado. */
  avgRating: number | null;
  completedShifts: number;
  noShows: number;
  /** Plantões cumpridos nesta clínica. */
  shiftsWithClinic: number;
  distanceKm: number;
  radiusKm: number;
  /** Plantões já pegos no período (equidade). */
  shiftsInPeriod: number;
  /** A partir deste número de plantões no período, a componente de equidade zera. */
  equityCap: number;
}

export interface ScoreWeights {
  rating: number;
  attendance: number;
  history: number;
  distance: number;
  equity: number;
}

export type ScoreComponents = Record<keyof ScoreWeights, number>;

export interface ScoreResult {
  /** 0–100, uma casa decimal. */
  total: number;
  /** Cada componente normalizada em 0–1. */
  components: ScoreComponents;
}

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  rating: 30,
  attendance: 30,
  history: 15,
  distance: 15,
  equity: 10,
};

/** Valores neutros para quem ainda não tem histórico (não penaliza novos profissionais). */
const NEUTRAL_RATING = 0.6;
const NEUTRAL_ATTENDANCE = 0.9;
const HISTORY_SATURATION = 10;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function scoreComponents(i: ScoreInputs): ScoreComponents {
  const total = i.completedShifts + i.noShows;
  return {
    rating: i.avgRating === null ? NEUTRAL_RATING : clamp01((i.avgRating - 1) / 4),
    attendance: total === 0 ? NEUTRAL_ATTENDANCE : i.completedShifts / total,
    history: clamp01(i.shiftsWithClinic / HISTORY_SATURATION),
    distance: i.radiusKm <= 0 ? 0 : clamp01(1 - i.distanceKm / i.radiusKm),
    equity: i.equityCap <= 0 ? 1 : clamp01(1 - i.shiftsInPeriod / i.equityCap),
  };
}

/** Score determinístico: mesmos insumos e pesos geram sempre o mesmo resultado. */
export function computeScore(inputs: ScoreInputs, weights: ScoreWeights = DEFAULT_SCORE_WEIGHTS): ScoreResult {
  const components = scoreComponents(inputs);
  const keys = Object.keys(weights) as (keyof ScoreWeights)[];
  const weightSum = keys.reduce((s, k) => s + Math.max(0, weights[k]), 0);
  if (weightSum === 0) return { total: 0, components };
  const weighted = keys.reduce((s, k) => s + Math.max(0, weights[k]) * components[k], 0);
  return { total: Math.round((weighted / weightSum) * 1000) / 10, components };
}
