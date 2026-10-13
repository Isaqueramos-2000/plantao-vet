// Datas da demo em horário de Brasília (UTC-3, sem horário de verão desde 2019).
// Todos os cálculos são manuais para que servidor e navegador gerem o mesmo texto.
export const TZ_OFFSET_MINUTES = -180;
const OFFSET_MS = TZ_OFFSET_MINUTES * 60_000;
const DAY_MS = 86_400_000;

export interface LocalParts {
  year: number;
  month: number; // 0–11
  day: number;
  hour: number;
  minute: number;
  weekday: number; // 0 = domingo
}

export function localParts(d: Date): LocalParts {
  const l = new Date(d.getTime() + OFFSET_MS);
  return {
    year: l.getUTCFullYear(),
    month: l.getUTCMonth(),
    day: l.getUTCDate(),
    hour: l.getUTCHours(),
    minute: l.getUTCMinutes(),
    weekday: l.getUTCDay(),
  };
}

/** Cria uma data a partir do "relógio de parede" de Brasília. Aceita overflow (ex.: dia 32). */
export function localDate(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  return new Date(Date.UTC(year, month, day, hour, minute) - OFFSET_MS);
}

const buildNow = new Date(process.env.NEXT_PUBLIC_DEMO_NOW ?? "2026-10-13T12:40:00.000Z");
const anchor = localParts(buildNow);

/** "Agora" da demo: a data do build, sempre às 09:40 — mantém os status dos plantões coerentes. */
export const DEMO_NOW = localDate(anchor.year, anchor.month, anchor.day, 9, 40);

/** Data relativa a hoje: `at(1, 19)` = amanhã às 19:00. */
export function at(dayOffset: number, hour: number, minute = 0): Date {
  return localDate(anchor.year, anchor.month, anchor.day + dayOffset, hour, minute);
}

export function startOfLocalDay(d: Date): Date {
  const p = localParts(d);
  return localDate(p.year, p.month, p.day);
}

/** Diferença em dias de calendário entre `d` e `ref` (0 = mesmo dia). */
export function dayDiff(d: Date, ref: Date = DEMO_NOW): number {
  return Math.round((startOfLocalDay(d).getTime() - startOfLocalDay(ref).getTime()) / DAY_MS);
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return dayDiff(a, b) === 0;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

export const DEMO_TODAY = anchor;
