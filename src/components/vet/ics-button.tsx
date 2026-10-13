"use client";

import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export interface IcsEvent {
  id: string;
  title: string;
  location: string;
  startsAtMs: number;
  endsAtMs: number;
}

const stamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escape = (s: string) => s.replace(/([,;\\])/g, "\\$1");

/** Gera um arquivo .ics de verdade com os plantões da agenda (funciona offline, sem backend). */
export function IcsButton({ events }: { events: IcsEvent[] }) {
  const toast = useToast();
  function download() {
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//PlantaoVet//Prototipo//PT-BR",
      "CALSCALE:GREGORIAN",
      ...events.flatMap((e) => [
        "BEGIN:VEVENT",
        `UID:${e.id}@plantaovet.demo`,
        `DTSTAMP:${stamp(Date.now())}`,
        `DTSTART:${stamp(e.startsAtMs)}`,
        `DTEND:${stamp(e.endsAtMs)}`,
        `SUMMARY:${escape(e.title)}`,
        `LOCATION:${escape(e.location)}`,
        "END:VEVENT",
      ]),
      "END:VCALENDAR",
    ];
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantaovet-agenda.ics";
    a.click();
    URL.revokeObjectURL(url);
    toast({ tone: "success", title: "Agenda exportada", description: `${events.length} plantões no arquivo .ics (Google, Apple, Outlook).` });
  }
  return (
    <Button variant="secondary" size="sm" onClick={download}>
      <CalendarPlus /> .ics
    </Button>
  );
}
