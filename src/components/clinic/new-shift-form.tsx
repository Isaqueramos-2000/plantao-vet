"use client";

import { CalendarClock, Repeat, Send, Users, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { calculateSettlement } from "@/lib/core";
import { formatBRL, formatHours } from "@/lib/format";
import { modeMeta } from "@/lib/labels";
import type { ShiftType } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

export interface NewShiftFormProps {
  units: { id: string; name: string }[];
  specialties: { id: string; name: string; short: string; eligibleCount: number; favoriteCount: number }[];
  defaultDate: string;
  avgSalesPerShift: number;
  platformFeePct: number;
  orgName: string;
  timeouts: { normalMinutes: number; urgentMinutes: number };
}

const TYPES: { id: ShiftType; label: string; description: string; icon: typeof Zap }[] = [
  { id: "single", label: "Avulsa", description: "Um plantão em data específica", icon: CalendarClock },
  { id: "recurring", label: "Recorrente", description: "Gera uma série semanal", icon: Repeat },
  { id: "urgent", label: "Urgente", description: "Início em < 24h · distribuição acelerada", icon: Zap },
];

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const toCents = (v: string) => Math.max(0, Math.round((Number(v.replace(",", ".")) || 0) * 100));

function hoursBetween(start: string, end: string) {
  const [sh = 0, sm = 0] = start.split(":").map(Number);
  const [eh = 0, em = 0] = end.split(":").map(Number);
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes <= 0) minutes += 24 * 60;
  return minutes / 60;
}

export function NewShiftForm(props: NewShiftFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [type, setType] = useState<ShiftType>("urgent");
  const [unitId, setUnitId] = useState(props.units[0]?.id ?? "");
  const [specialtyId, setSpecialtyId] = useState(props.specialties[0]?.id ?? "");
  const [date, setDate] = useState(props.defaultDate);
  const [start, setStart] = useState("19:00");
  const [end, setEnd] = useState("07:00");
  const [fixed, setFixed] = useState("1100");
  const [commission, setCommission] = useState("8");
  const [nightBonus, setNightBonus] = useState(true);
  const [nightAmount, setNightAmount] = useState("150");
  const [holiday, setHoliday] = useState(false);
  const [mode, setMode] = useState<"waves" | "first_come_capped">("waves");
  const [manualApproval, setManualApproval] = useState(false);
  const [weekdays, setWeekdays] = useState<number[]>([4]);
  const [occurrences, setOccurrences] = useState("8");
  const [notes, setNotes] = useState("");

  const specialty = props.specialties.find((s) => s.id === specialtyId);
  const unit = props.units.find((u) => u.id === unitId);
  const hours = hoursBetween(start, end);

  const breakdown = useMemo(() => {
    const extras = [
      ...(nightBonus ? [{ label: "Adicional noturno", amount: toCents(nightAmount) }] : []),
      ...(holiday ? [{ label: "Adicional feriado", amount: Math.round(toCents(fixed) * 0.5) }] : []),
    ];
    const pct = Math.min(100, Math.max(0, Number(commission.replace(",", ".")) || 0));
    return calculateSettlement({
      fixedAmount: toCents(fixed),
      salesAmount: pct > 0 ? props.avgSalesPerShift : 0,
      commissionPct: pct,
      extras,
      platformFeePct: props.platformFeePct,
      feeBearer: "clinic",
    });
  }, [fixed, commission, nightBonus, nightAmount, holiday, props.avgSalesPerShift, props.platformFeePct]);

  const [, m, d] = date.split("-");
  const dateLabel = d && m ? `${d}/${m}` : date;

  function publish() {
    toast({
      tone: "success",
      title: "Vaga publicada (simulação)",
      description: "Abrindo uma vaga real da demo para você ver a distribuição em ondas.",
    });
    setTimeout(() => router.push("/clinica/vagas/shf_1042"), 1200);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <Card>
          <CardHeader title="Tipo de vaga" />
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  type === t.id
                    ? t.id === "urgent"
                      ? "border-red-300 bg-red-50 ring-2 ring-red-200"
                      : "border-brand-300 bg-brand-50 ring-2 ring-brand-200"
                    : "border-slate-200 hover:border-slate-300",
                )}
              >
                <t.icon className={cn("size-5", t.id === "urgent" ? "text-red-500" : "text-brand-600")} />
                <p className="mt-2 text-sm font-semibold text-slate-900">{t.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{t.description}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Quando e onde" />
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Unidade">
              <Select value={unitId} onChange={(e) => setUnitId(e.target.value)}>
                {props.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Especialidade exigida">
              <Select value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)}>
                {props.specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={type === "recurring" ? "Início da série" : "Data"}>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Início">
                <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
              </Field>
              <Field label="Término" hint={`Duração: ${formatHours(hours)}`}>
                <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
              </Field>
            </div>
            {type === "recurring" && (
              <div className="space-y-3 sm:col-span-2">
                <span className="block text-sm font-medium text-slate-700">Repetir toda</span>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((w, i) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeekdays((all) => (all.includes(i) ? all.filter((x) => x !== i) : [...all, i]))}
                      className={cn(
                        "h-9 w-12 rounded-lg text-sm font-medium ring-1 ring-inset",
                        weekdays.includes(i) ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-slate-600 ring-slate-300 hover:bg-slate-50",
                      )}
                    >
                      {w}
                    </button>
                  ))}
                </div>
                <Field label="Número de ocorrências" className="max-w-40">
                  <Input type="number" min={1} max={52} value={occurrences} onChange={(e) => setOccurrences(e.target.value)} />
                </Field>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Remuneração" description="Fixo + comissão sobre as vendas realizadas no plantão + adicionais" />
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Valor fixo (R$)">
                <Input inputMode="decimal" value={fixed} onChange={(e) => setFixed(e.target.value)} />
              </Field>
              <Field label="Comissão sobre vendas (%)" hint="Vendas informadas no fechamento do plantão">
                <Input inputMode="decimal" value={commission} onChange={(e) => setCommission(e.target.value)} />
              </Field>
            </div>
            <div className="flex flex-col gap-3 rounded-lg bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-800">Adicional noturno</p>
                  <p className="text-xs text-slate-500">Valor fixo por plantão noturno</p>
                </div>
                <div className="flex items-center gap-3">
                  {nightBonus && <Input inputMode="decimal" value={nightAmount} onChange={(e) => setNightAmount(e.target.value)} className="h-9 w-24" />}
                  <Switch checked={nightBonus} onChange={setNightBonus} label="Adicional noturno" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-800">Adicional de feriado</p>
                  <p className="text-xs text-slate-500">+50% sobre o fixo</p>
                </div>
                <Switch checked={holiday} onChange={setHoliday} label="Adicional de feriado" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Requisitos e observações" />
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Experiência mínima">
              <Select defaultValue="2">
                <option value="0">Sem exigência</option>
                <option value="1">1 ano</option>
                <option value="2">2 anos</option>
                <option value="5">5 anos</option>
              </Select>
            </Field>
            <Field label="Especialização">
              <Select defaultValue="desejavel">
                <option value="nao">Não exigida</option>
                <option value="desejavel">Desejável</option>
                <option value="obrigatoria">Obrigatória (verificada)</option>
              </Select>
            </Field>
            <Field label="Observações para o plantonista" className="sm:col-span-2">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex.: equipe de apoio, estacionamento, refeição inclusa, procedimentos frequentes…"
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Distribuição" description="Herdada da política da clínica — pode ser ajustada por vaga" />
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {(["waves", "first_come_capped"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-xl border p-4 text-left",
                    mode === m ? "border-brand-300 bg-brand-50 ring-2 ring-brand-200" : "border-slate-200 hover:border-slate-300",
                  )}
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {modeMeta[m].label} {m === "waves" && <span className="font-normal text-slate-500">(padrão)</span>}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{modeMeta[m].description}</p>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-4">
              <div>
                <p className="text-sm font-medium text-slate-800">Exigir aprovação manual</p>
                <p className="text-xs text-slate-500">O aceite só é confirmado depois que a clínica aprovar o profissional</p>
              </div>
              <Switch checked={manualApproval} onChange={setManualApproval} label="Aprovação manual" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <Card>
          <CardHeader
            title="Prévia da vaga"
            action={type === "urgent" ? <Badge tone="red"><Zap />Urgente</Badge> : type === "recurring" ? <Badge tone="blue">Recorrente</Badge> : null}
          />
          <CardContent className="space-y-4">
            <div>
              <p className="text-base font-semibold text-slate-900">{specialty?.short}</p>
              <p className="text-sm text-slate-500">
                {unit?.name} · {dateLabel} · {start}–{end} ({formatHours(hours)})
              </p>
              {type === "recurring" && (
                <p className="mt-1 text-xs text-blue-700">
                  {occurrences} ocorrências · toda {weekdays.map((i) => WEEKDAYS[i]).join(", ") || "—"}
                </p>
              )}
            </div>

            <dl className="space-y-1.5 rounded-lg bg-slate-50 p-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Fixo</dt>
                <dd className="tabular text-slate-900">{formatBRL(breakdown.fixedAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Comissão estimada*</dt>
                <dd className="tabular text-slate-900">{formatBRL(breakdown.commissionAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Adicionais</dt>
                <dd className="tabular text-slate-900">{formatBRL(breakdown.extrasAmount)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-medium">
                <dt className="text-slate-700">Plantonista recebe (est.)</dt>
                <dd className="tabular text-slate-900">{formatBRL(breakdown.vetNetAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Taxa da plataforma ({props.platformFeePct}%)</dt>
                <dd className="tabular text-slate-900">{formatBRL(breakdown.platformFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-semibold">
                <dt className="text-slate-900">Custo estimado</dt>
                <dd className="tabular text-brand-700">{formatBRL(breakdown.clinicTotalAmount)}</dd>
              </div>
            </dl>
            <p className="text-xs text-slate-400">
              *Com base na média de vendas por plantão da clínica ({formatBRL(props.avgSalesPerShift, { cents: false })}).
            </p>

            <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
              <Users className="mt-0.5 size-4 text-brand-600" />
              <div className="text-sm">
                <p className="font-medium text-slate-900">~{specialty?.eligibleCount ?? 0} profissionais elegíveis</p>
                <p className="text-slate-500">
                  {mode === "waves"
                    ? `Onda 1: ${specialty?.favoriteCount ?? 0} favoritos · ondas de ${type === "urgent" ? props.timeouts.urgentMinutes : props.timeouts.normalMinutes} min`
                    : "Oferta simultânea, com teto mensal por profissional"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 bg-whatsapp-dark px-4 py-2 text-xs font-medium text-white">
            <Send className="size-3.5" /> Mensagem que o plantonista recebe
          </div>
          <div className="bg-whatsapp-bg p-3">
            <div className="max-w-[92%] rounded-lg rounded-tl-none bg-white p-3 text-[13px] leading-snug text-slate-800 shadow-sm">
              <p className="font-semibold">{type === "urgent" ? "🚨 Plantão URGENTE disponível" : "🩺 Nova vaga de plantão"}</p>
              <p className="mt-1">
                <b>{props.orgName}</b> · {unit?.name}
                <br />
                {specialty?.short} · {dateLabel}, {start}–{end}
                <br />
                {formatBRL(toCents(fixed), { cents: false })} fixo
                {Number(commission) > 0 ? ` + ${commission}% das vendas` : ""}
                {nightBonus ? ` + noturno ${formatBRL(toCents(nightAmount), { cents: false })}` : ""}
              </p>
              <p className="mt-1 text-slate-500">Estimativa: {formatBRL(breakdown.vetNetAmount, { cents: false })}</p>
              <div className="mt-2 grid grid-cols-3 gap-1 border-t border-slate-100 pt-2 text-center text-[12px] font-medium text-sky-600">
                <span>Aceitar</span>
                <span>Recusar</span>
                <span>Detalhes</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-2">
          <Button size="lg" variant={type === "urgent" ? "danger" : "primary"} onClick={publish}>
            {type === "urgent" ? <Zap /> : <Send />}
            Publicar e iniciar distribuição
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast({ title: "Rascunho salvo (simulação)", description: "Nesta versão nada é salvo de verdade." })}
          >
            Salvar como rascunho
          </Button>
        </div>
      </div>
    </div>
  );
}
