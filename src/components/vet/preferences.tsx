"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const KINDS = ["Urgentes", "Noturnos", "Fins de semana", "Recorrentes", "Feriados"];

function Slider({
  label,
  value,
  unit,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="tabular font-semibold text-slate-900">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full"
        aria-label={label}
      />
    </div>
  );
}

export function Preferences({ radiusKm, minRestHours, maxWeeklyHours }: { radiusKm: number; minRestHours: number; maxWeeklyHours: number }) {
  const toast = useToast();
  const [radius, setRadius] = useState(radiusKm);
  const [rest, setRest] = useState(minRestHours);
  const [weekly, setWeekly] = useState(maxWeeklyHours);
  const [whatsapp, setWhatsapp] = useState(true);
  const [push, setPush] = useState(true);
  const [quiet, setQuiet] = useState(true);
  const [kinds, setKinds] = useState(["Urgentes", "Noturnos", "Fins de semana"]);

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-sm font-semibold text-slate-900">Disponibilidade</p>
        <Slider label="Raio de atuação" value={radius} unit="km" min={5} max={60} onChange={setRadius} />
        <Slider label="Descanso mínimo entre plantões" value={rest} unit="h" min={6} max={24} onChange={setRest} />
        <Slider label="Limite semanal" value={weekly} unit="h" min={12} max={84} step={6} onChange={setWeekly} />
        <div>
          <p className="mb-2 text-sm text-slate-700">Quero receber vagas</p>
          <div className="flex flex-wrap gap-1.5">
            {KINDS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKinds((all) => (all.includes(k) ? all.filter((x) => x !== k) : [...all, k]))}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset",
                  kinds.includes(k) ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-slate-600 ring-slate-300",
                )}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100 rounded-2xl bg-white ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-sm font-medium text-slate-900">Ofertas pelo WhatsApp</p>
            <p className="text-xs text-slate-500">Opt-in registrado em 02/03/2026 (LGPD)</p>
          </div>
          <Switch checked={whatsapp} onChange={setWhatsapp} label="WhatsApp" />
        </div>
        <div className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-sm font-medium text-slate-900">Notificações push</p>
            <p className="text-xs text-slate-500">Fallback quando o WhatsApp falha</p>
          </div>
          <Switch checked={push} onChange={setPush} label="Push" />
        </div>
        <div className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-sm font-medium text-slate-900">Horário de silêncio</p>
            <p className="text-xs text-slate-500">23:00 – 07:00 · exceto vagas urgentes</p>
          </div>
          <Switch checked={quiet} onChange={setQuiet} label="Horário de silêncio" />
        </div>
      </div>

      <Button className="w-full" onClick={() => toast({ tone: "success", title: "Preferências salvas (simulação)", description: "O motor de distribuição passa a usar os novos limites." })}>
        Salvar preferências
      </Button>
    </div>
  );
}
