"use client";

import { RotateCcw, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { computeScore, DEFAULT_SCORE_WEIGHTS, type DistributionMode, type ScoreInputs, type ScoreWeights } from "@/lib/core";
import { formatDecimal } from "@/lib/format";
import { modeMeta } from "@/lib/labels";
import { cn } from "@/lib/utils";

export interface PreviewCandidate {
  id: string;
  name: string;
  isFavorite: boolean;
  inputs: ScoreInputs;
}

const WEIGHT_LABELS: Record<keyof ScoreWeights, { label: string; hint: string }> = {
  rating: { label: "Avaliação média", hint: "Notas recebidas das clínicas" },
  attendance: { label: "Comparecimento", hint: "1 − taxa de no-show" },
  history: { label: "Histórico com a clínica", hint: "Plantões já cumpridos aqui" },
  distance: { label: "Distância", hint: "Mais perto, melhor" },
  equity: { label: "Equidade", hint: "Penaliza quem já pegou muitos plantões no mês" },
};

const MODES: { id: DistributionMode; phase?: string }[] = [
  { id: "waves" },
  { id: "first_come_capped" },
  { id: "rotation", phase: "Fase 2" },
  { id: "direct", phase: "Fase 2" },
];

export function PolicySettings({
  candidates,
  initial,
}: {
  candidates: PreviewCandidate[];
  initial: {
    mode: DistributionMode;
    normalMinutes: number;
    urgentMinutes: number;
    wave2Size: number;
    minRestHours: number;
    maxShiftsPerVetMonth: number;
    requireManualApproval: boolean;
    cancelWindowHours: number;
    compensationPct: number;
  };
}) {
  const toast = useToast();
  const [mode, setMode] = useState(initial.mode);
  const [weights, setWeights] = useState<ScoreWeights>(DEFAULT_SCORE_WEIGHTS);
  const [manual, setManual] = useState(initial.requireManualApproval);

  const ranking = useMemo(
    () =>
      candidates
        .map((c) => ({ ...c, score: computeScore(c.inputs, weights).total }))
        .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)),
    [candidates, weights],
  );
  const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Modo de distribuição padrão" description="Pode ser sobrescrito em cada vaga" />
        <CardContent className="grid gap-3 md:grid-cols-2">
          {MODES.map(({ id, phase }) => (
            <button
              key={id}
              type="button"
              disabled={!!phase}
              onClick={() => setMode(id)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                mode === id ? "border-brand-300 bg-brand-50 ring-2 ring-brand-200" : "border-slate-200 hover:border-slate-300",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">{modeMeta[id].label}</p>
                {phase && <Badge>{phase}</Badge>}
              </div>
              <p className="mt-1 text-xs text-slate-500">{modeMeta[id].description}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Ondas e regras" />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Onda normal" hint="minutos">
                <Input type="number" defaultValue={initial.normalMinutes} min={1} />
              </Field>
              <Field label="Onda urgente" hint="minutos">
                <Input type="number" defaultValue={initial.urgentMinutes} min={1} />
              </Field>
              <Field label="Tamanho onda 2" hint="profissionais">
                <Input type="number" defaultValue={initial.wave2Size} min={1} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Descanso mínimo" hint="horas entre plantões">
                <Input type="number" defaultValue={initial.minRestHours} min={0} />
              </Field>
              <Field label="Teto por profissional" hint="plantões por mês">
                <Input type="number" defaultValue={initial.maxShiftsPerVetMonth} min={1} />
              </Field>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-4">
              <div>
                <p className="text-sm font-medium text-slate-800">Aprovação manual</p>
                <p className="text-xs text-slate-500">Confirmar o profissional antes de fechar a vaga</p>
              </div>
              <Switch checked={manual} onChange={setManual} label="Aprovação manual" />
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-800">Cancelamento pela clínica</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field label="Com menos de" hint="horas de antecedência">
                  <Input type="number" defaultValue={initial.cancelWindowHours} />
                </Field>
                <Field label="Compensação" hint="% do valor fixo">
                  <Input type="number" defaultValue={initial.compensationPct} />
                </Field>
              </div>
              <p className="mt-2 text-xs text-amber-700">Política de cancelamento ainda em definição (Seção 11 do plano).</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Pesos do score"
            description="Ordenam os elegíveis dentro de cada onda"
            action={
              <Button variant="ghost" size="sm" onClick={() => setWeights(DEFAULT_SCORE_WEIGHTS)}>
                <RotateCcw /> Padrão
              </Button>
            }
          />
          <CardContent className="space-y-4">
            {(Object.keys(WEIGHT_LABELS) as (keyof ScoreWeights)[]).map((k) => (
              <div key={k}>
                <div className="flex items-baseline justify-between">
                  <label htmlFor={`w-${k}`} className="text-sm font-medium text-slate-800">
                    {WEIGHT_LABELS[k].label}
                  </label>
                  <span className="tabular text-sm text-slate-600">
                    {totalWeight ? Math.round((weights[k] / totalWeight) * 100) : 0}%
                  </span>
                </div>
                <input
                  id={`w-${k}`}
                  type="range"
                  min={0}
                  max={50}
                  value={weights[k]}
                  onChange={(e) => setWeights((w) => ({ ...w, [k]: Number(e.target.value) }))}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">{WEIGHT_LABELS[k].hint}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Prévia do ranking"
          description="Elegíveis para um plantão de emergência na unidade Pinheiros · recalculado ao mover os pesos"
        />
        <CardContent>
          <ol className="space-y-2">
            {ranking.map((c, i) => (
              <li key={c.id} className="flex items-center gap-3">
                <span className="tabular w-5 text-right text-sm text-slate-400">{i + 1}</span>
                <Avatar name={c.name} size="sm" />
                <span className="flex w-44 shrink-0 items-center gap-1 truncate text-sm font-medium text-slate-900">
                  {c.name}
                  {c.isFavorite && <Star className="size-3.5 fill-amber-400 text-amber-400" />}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-500 transition-all duration-300" style={{ width: `${c.score}%` }} />
                </div>
                <span className="tabular w-10 text-right text-sm font-medium text-slate-700">{formatDecimal(c.score, 1)}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-slate-500">
            Favoritos sempre recebem primeiro (onda 1); o score ordena as ondas seguintes. O cálculo é determinístico: mesmos
            dados e pesos geram sempre a mesma ordem.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => toast({ title: "Alterações descartadas" })}>
          Descartar
        </Button>
        <Button onClick={() => toast({ tone: "success", title: "Política salva (simulação)", description: "Alteração registrada na auditoria." })}>
          Salvar política
        </Button>
      </div>
    </div>
  );
}
