import { describe, expect, it } from "vitest";
import {
  calendarWeekOf,
  findConflicts,
  findRestViolations,
  overlaps,
  restGapHours,
  weeklyHoursWith,
} from "./schedule";

// Horários em UTC-3 (America/Sao_Paulo).
const d = (iso: string) => new Date(`${iso}-03:00`);
const shift = (start: string, end: string) => ({ startsAt: d(start), endsAt: d(end) });

describe("conflitos de agenda", () => {
  const day = shift("2026-10-13T07:00", "2026-10-13T19:00");

  it("detecta sobreposição", () => {
    expect(overlaps(day, shift("2026-10-13T18:00", "2026-10-14T06:00"))).toBe(true);
  });

  it("plantões encostados não conflitam", () => {
    expect(overlaps(day, shift("2026-10-13T19:00", "2026-10-14T07:00"))).toBe(false);
  });

  it("nenhum vet pode ser alocado a dois plantões sobrepostos", () => {
    const agenda = [day, shift("2026-10-15T07:00", "2026-10-15T19:00")];
    expect(findConflicts(shift("2026-10-13T12:00", "2026-10-13T20:00"), agenda)).toEqual([day]);
  });
});

describe("descanso mínimo", () => {
  const night = shift("2026-10-13T19:00", "2026-10-14T07:00");

  it("calcula o intervalo entre plantões", () => {
    expect(restGapHours(night, shift("2026-10-14T18:00", "2026-10-15T06:00"))).toBe(11);
    expect(restGapHours(shift("2026-10-13T06:00", "2026-10-13T12:00"), night)).toBe(7);
  });

  it("aponta violação abaixo do mínimo", () => {
    const next = shift("2026-10-14T08:00", "2026-10-14T20:00");
    expect(findRestViolations(next, [night], 11)).toEqual([night]);
    expect(findRestViolations(shift("2026-10-14T18:00", "2026-10-15T06:00"), [night], 11)).toEqual([]);
  });
});

describe("limite semanal", () => {
  it("semana começa na segunda 00:00 no fuso local", () => {
    const week = calendarWeekOf(d("2026-10-18T23:30"), -180); // domingo
    expect(week.startsAt.toISOString()).toBe(d("2026-10-12T00:00").toISOString());
  });

  it("soma apenas as horas dentro da semana", () => {
    const agenda = [
      shift("2026-10-11T19:00", "2026-10-12T07:00"), // 7h na semana
      shift("2026-10-13T07:00", "2026-10-13T19:00"), // 12h
    ];
    expect(weeklyHoursWith(shift("2026-10-15T07:00", "2026-10-15T19:00"), agenda)).toBe(31);
  });
});
