export type DistributionMode = "waves" | "rotation" | "first_come_capped" | "direct";

export interface WaveCandidate {
  vetId: string;
  score: number;
  isFavorite: boolean;
}

export type WaveNumber = 1 | 2 | 3;

export interface Wave {
  wave: WaveNumber;
  vetIds: string[];
}

export interface WaveTimeouts {
  normalMinutes: number;
  urgentMinutes: number;
}

const byScoreDesc = (a: WaveCandidate, b: WaveCandidate) =>
  b.score - a.score || a.vetId.localeCompare(b.vetId);

/**
 * Modo `waves`: onda 1 = favoritos elegíveis; onda 2 = os `wave2Size` melhores scores restantes;
 * onda 3 = todos os demais elegíveis. Recebe apenas candidatos já elegíveis.
 */
export function planWaves(candidates: readonly WaveCandidate[], wave2Size: number): Wave[] {
  const sorted = [...candidates].sort(byScoreDesc);
  const favorites = sorted.filter((c) => c.isFavorite).map((c) => c.vetId);
  const others = sorted.filter((c) => !c.isFavorite).map((c) => c.vetId);
  return [
    { wave: 1, vetIds: favorites },
    { wave: 2, vetIds: others.slice(0, wave2Size) },
    { wave: 3, vetIds: others.slice(wave2Size) },
  ];
}

export function waveTimeoutMinutes(timeouts: WaveTimeouts, isUrgent: boolean): number {
  return isUrgent ? timeouts.urgentMinutes : timeouts.normalMinutes;
}

export interface Acceptance {
  vetId: string;
  wave: number;
  at: Date;
}

/**
 * Define o aceite vencedor: o mais antigo entre as ondas já liberadas (empate → menor vetId).
 * No banco, a garantia de unicidade vem do lock transacional; esta função define a regra.
 */
export function resolveAcceptances(
  acceptances: readonly Acceptance[],
  currentWave: number,
): { winner: Acceptance | null; rejected: Acceptance[] } {
  const valid = acceptances
    .filter((a) => a.wave <= currentWave)
    .sort((a, b) => a.at.getTime() - b.at.getTime() || a.vetId.localeCompare(b.vetId));
  const winner = valid[0] ?? null;
  return { winner, rejected: acceptances.filter((a) => a !== winner) };
}

/** Modo `first_come_capped`: o profissional ainda pode aceitar se estiver abaixo do teto mensal. */
export function isUnderMonthlyCap(shiftsThisMonth: number, cap: number): boolean {
  return shiftsThisMonth < cap;
}
