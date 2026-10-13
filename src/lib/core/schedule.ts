export interface Interval {
  startsAt: Date;
  endsAt: Date;
}

const HOUR_MS = 3_600_000;

export function durationHours(i: Interval): number {
  return (i.endsAt.getTime() - i.startsAt.getTime()) / HOUR_MS;
}

/** Intervalos semiabertos: um plantão que termina às 19h não conflita com outro que começa às 19h. */
export function overlaps(a: Interval, b: Interval): boolean {
  return a.startsAt < b.endsAt && b.startsAt < a.endsAt;
}

export function findConflicts<T extends Interval>(candidate: Interval, agenda: readonly T[]): T[] {
  return agenda.filter((i) => overlaps(candidate, i));
}

/** Horas de descanso entre dois plantões (0 se houver sobreposição). */
export function restGapHours(a: Interval, b: Interval): number {
  if (overlaps(a, b)) return 0;
  const gapMs =
    a.endsAt <= b.startsAt
      ? b.startsAt.getTime() - a.endsAt.getTime()
      : a.startsAt.getTime() - b.endsAt.getTime();
  return gapMs / HOUR_MS;
}

/** Plantões da agenda (sem sobreposição) que ficariam a menos de `minRestHours` do candidato. */
export function findRestViolations<T extends Interval>(
  candidate: Interval,
  agenda: readonly T[],
  minRestHours: number,
): T[] {
  return agenda.filter((i) => !overlaps(candidate, i) && restGapHours(candidate, i) < minRestHours);
}

/** Semana-calendário (segunda 00:00 → segunda seguinte 00:00) no fuso informado. */
export function calendarWeekOf(date: Date, tzOffsetMinutes: number): Interval {
  const offsetMs = tzOffsetMinutes * 60_000;
  const local = new Date(date.getTime() + offsetMs);
  const daysSinceMonday = (local.getUTCDay() + 6) % 7;
  const startLocalMs = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate() - daysSinceMonday,
  );
  const startsAt = new Date(startLocalMs - offsetMs);
  return { startsAt, endsAt: new Date(startsAt.getTime() + 7 * 24 * HOUR_MS) };
}

function overlapHours(a: Interval, b: Interval): number {
  const start = Math.max(a.startsAt.getTime(), b.startsAt.getTime());
  const end = Math.min(a.endsAt.getTime(), b.endsAt.getTime());
  return end > start ? (end - start) / HOUR_MS : 0;
}

/**
 * Total de horas na semana-calendário do início do candidato, somando agenda + candidato.
 * Apenas a parte de cada plantão que cai dentro da semana é contada.
 */
export function weeklyHoursWith(
  candidate: Interval,
  agenda: readonly Interval[],
  tzOffsetMinutes = -180,
): number {
  const week = calendarWeekOf(candidate.startsAt, tzOffsetMinutes);
  return [...agenda, candidate].reduce((sum, i) => sum + overlapHours(i, week), 0);
}
