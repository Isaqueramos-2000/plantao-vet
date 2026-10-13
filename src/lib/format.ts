import { dayDiff, localParts } from "./time";

const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const WEEKDAYS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
const WEEKDAYS_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export const pad2 = (n: number) => String(n).padStart(2, "0");

function groupThousands(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Centavos → "R$ 1.234,56". Com `cents: false`, omite os centavos. */
export function formatBRL(cents: number, opts: { cents?: boolean } = {}): string {
  const showCents = opts.cents ?? true;
  const sign = cents < 0 ? "−" : "";
  const abs = Math.abs(Math.round(cents));
  const reais = Math.floor(abs / 100);
  const rest = abs % 100;
  if (!showCents) return `${sign}R$ ${groupThousands(Math.round(abs / 100))}`;
  return `${sign}R$ ${groupThousands(reais)},${pad2(rest)}`;
}

/** Centavos → "R$ 1,48 mi" / "R$ 12,4 mil". */
export function formatCompactBRL(cents: number): string {
  const reais = cents / 100;
  if (reais >= 1_000_000) return `R$ ${formatDecimal(reais / 1_000_000, 2)} mi`;
  if (reais >= 10_000) return `R$ ${formatDecimal(reais / 1_000, 1)} mil`;
  return formatBRL(cents, { cents: false });
}

export function formatDecimal(n: number, decimals = 1): string {
  const [int = "0", frac] = n.toFixed(decimals).split(".");
  return frac ? `${groupThousands(Number(int))},${frac}` : groupThousands(Number(int));
}

export function formatNumber(n: number): string {
  return groupThousands(Math.round(n));
}

export function formatPct(n: number, decimals = 0): string {
  return `${formatDecimal(n, decimals)}%`;
}

/** 4,9 · 4,95 */
export function formatRating(r: number | null): string {
  if (r === null) return "—";
  const oneDecimal = Math.abs(r * 10 - Math.round(r * 10)) < 1e-9;
  return formatDecimal(r, oneDecimal ? 1 : 2);
}

export function formatKm(km: number): string {
  return `${formatDecimal(km, km < 10 ? 1 : 0)} km`;
}

export function formatTime(d: Date): string {
  const p = localParts(d);
  return `${pad2(p.hour)}:${pad2(p.minute)}`;
}

/** 13/10 */
export function formatDateShort(d: Date): string {
  const p = localParts(d);
  return `${pad2(p.day)}/${pad2(p.month + 1)}`;
}

/** 13/10/2026 */
export function formatDateFull(d: Date): string {
  const p = localParts(d);
  return `${pad2(p.day)}/${pad2(p.month + 1)}/${p.year}`;
}

/** 13 de outubro */
export function formatDateLong(d: Date): string {
  const p = localParts(d);
  return `${p.day} de ${MONTHS[p.month]}`;
}

/** 13 out */
export function formatDayMonth(d: Date): string {
  const p = localParts(d);
  return `${p.day} ${MONTHS_SHORT[p.month]}`;
}

/** seg, 13 out */
export function formatWeekdayDate(d: Date): string {
  const p = localParts(d);
  return `${WEEKDAYS_SHORT[p.weekday]}, ${p.day} ${MONTHS_SHORT[p.month]}`;
}

export function weekdayShort(weekday: number): string {
  return WEEKDAYS_SHORT[weekday] ?? "";
}

export function weekdayLong(d: Date): string {
  return WEEKDAYS[localParts(d).weekday] ?? "";
}

export function monthName(month: number): string {
  return MONTHS[month] ?? "";
}

/** Hoje · Amanhã · Ontem · seg, 13 out */
export function formatRelativeDay(d: Date): string {
  const diff = dayDiff(d);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff === -1) return "Ontem";
  return formatWeekdayDate(d);
}

/** 19:00 – 07:00 (+1) */
export function formatTimeRange(start: Date, end: Date): string {
  const extra = dayDiff(end, start);
  return `${formatTime(start)} – ${formatTime(end)}${extra > 0 ? ` (+${extra})` : ""}`;
}

/** 12h · 6h30 */
export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m ? `${h}h${pad2(m)}` : `${h}h`;
}

/** 13/10 às 09:31 */
export function formatDateTime(d: Date): string {
  return `${formatDateShort(d)} às ${formatTime(d)}`;
}

export function initials(name: string): string {
  const parts = name.replace(/^(Dra?\.)\s+/, "").split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${pad2(s % 60)}`;
}
