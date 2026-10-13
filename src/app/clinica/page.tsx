import { AlertTriangle, ArrowRight, Clock, Percent, Plus, Timer, UserX, Wallet, Zap } from "lucide-react";
import Link from "next/link";
import { BarChart } from "@/components/charts/bar-chart";
import { Countdown } from "@/components/shared/countdown";
import { DemoButton } from "@/components/shared/demo-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ShiftTypeBadge } from "@/components/shared/status";
import { Avatar } from "@/components/ui/avatar";
import { Badge, Dot } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  formatBRL,
  formatDateLong,
  formatRelativeDay,
  formatTimeRange,
  formatWeekdayDate,
  weekdayLong,
} from "@/lib/format";
import {
  distributionFor,
  getSpecialty,
  getUnit,
  getVet,
  orgSettlements,
  orgShifts,
  upcomingGaps,
} from "@/lib/mock/queries";
import { DEMO_NOW } from "@/lib/time";

const fillRateByWeek = [
  { label: "S-7", value: 86 },
  { label: "S-6", value: 89 },
  { label: "S-5", value: 88 },
  { label: "S-4", value: 92 },
  { label: "S-3", value: 91 },
  { label: "S-2", value: 95 },
  { label: "S-1", value: 93 },
  { label: "Atual", value: 96, highlight: true },
].map((d) => ({ ...d, display: `${d.value}%` }));

const fillTimeByType = [
  { label: "Urgente", minutes: 18, target: 30 },
  { label: "Avulsa", minutes: 42, target: 120 },
  { label: "Recorrente", minutes: 95, target: 240 },
];

export default function ClinicDashboard() {
  const shifts = orgShifts();
  const inDistribution = shifts.filter((s) => s.status === "offered" || s.status === "open");
  const urgent = inDistribution.find((s) => s.type === "urgent" && s.status === "offered");
  const urgentDist = urgent ? distributionFor(urgent) : undefined;
  const upcoming = shifts.filter((s) => (s.status === "filled" || s.status === "in_progress") && s.endsAt > DEMO_NOW).slice(0, 5);
  const gaps = upcomingGaps(14);
  const rows = orgSettlements();
  const pendingClosings = rows.filter((r) => r.settlement.status === "pending");
  const known = rows.filter((r) => !r.isEstimate);
  const avgCost = known.reduce((s, r) => s + r.breakdown.clinicTotalAmount, 0) / Math.max(1, known.length);

  return (
    <>
      <PageHeader
        eyebrow={`${weekdayLong(DEMO_NOW)}, ${formatDateLong(DEMO_NOW)}`}
        title="Bom dia, Ricardo"
        description="Resumo da operação de plantões do Hospital Veterinário Aurora nos últimos 30 dias."
        actions={
          <>
            <DemoButton variant="secondary">Exportar relatório</DemoButton>
            <ButtonLink href="/clinica/vagas/nova">
              <Plus /> Nova vaga
            </ButtonLink>
          </>
        }
      />

      {urgent && urgentDist?.expiresAt && (
        <Link
          href={`/clinica/vagas/${urgent.id}`}
          className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-white p-4 transition-colors hover:border-red-300 sm:flex-row sm:items-center"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Zap className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">
              Vaga urgente #{urgent.code} em distribuição · {getSpecialty(urgent.specialtyId).short}, {getUnit(urgent.unitId).name}
            </p>
            <p className="text-sm text-slate-600">
              {formatRelativeDay(urgent.startsAt)}, {formatTimeRange(urgent.startsAt, urgent.endsAt)} · Onda {urgent.currentWave} de 3 enviada
              por WhatsApp
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-medium text-red-700 ring-1 ring-red-200">
              <Timer className="size-4" />
              Próxima onda em{" "}
              <Countdown
                className="tabular"
                seconds={Math.round((urgentDist.expiresAt.getTime() - DEMO_NOW.getTime()) / 1000)}
              />
            </span>
            <ArrowRight className="size-4 text-slate-400" />
          </div>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Taxa de preenchimento" value="94,2%" icon={Percent} trend={{ value: "+3,1 p.p.", positive: true }} hint="meta > 90%" />
        <StatCard label="Tempo médio · urgente" value="18 min" icon={Clock} trend={{ value: "−7 min", positive: true }} hint="meta < 30 min" />
        <StatCard label="No-shows" value="1" icon={UserX} hint="0,8% dos plantões" />
        <StatCard label="Custo médio / plantão" value={formatBRL(avgCost, { cents: false })} icon={Wallet} hint="fixo + comissão + taxas" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Em distribuição agora"
              description="Vagas publicadas aguardando aceite"
              action={
                <Link href="/clinica/vagas" className="text-sm font-medium text-brand-700 hover:text-brand-800">
                  Ver todas
                </Link>
              }
            />
            <CardContent className="space-y-3">
              {inDistribution.map((s) => {
                const dist = distributionFor(s);
                const pending = dist.waves.flatMap((w) => w.offers).filter((o) => o.state === "pending").length;
                const wave = s.currentWave ?? 0;
                const noneLeft = s.status === "offered" && pending === 0;
                return (
                  <Link
                    key={s.id}
                    href={`/clinica/vagas/${s.id}`}
                    className="block rounded-lg border border-slate-200 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50/30"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        #{s.code} · {getSpecialty(s.specialtyId).short}
                      </span>
                      <ShiftTypeBadge type={s.type} hideSingle />
                      <span className="text-sm text-slate-500">{getUnit(s.unitId).name}</span>
                      <span className="ml-auto text-sm text-slate-600">
                        {formatRelativeDay(s.startsAt)} · {formatTimeRange(s.startsAt, s.endsAt)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <Progress value={s.status === "open" ? 4 : (wave / 3) * 100} className="h-1.5" barClassName={noneLeft ? "bg-red-500" : "bg-amber-500"} />
                      <span className="shrink-0 text-xs text-slate-600">
                        {s.status === "open" ? (
                          "Distribuição inicia às 10:00"
                        ) : noneLeft ? (
                          <span className="font-medium text-red-600">Sem elegíveis restantes</span>
                        ) : (
                          <>
                            Onda {wave}/3 · {pending} aguardando
                          </>
                        )}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader title="Preenchimento por semana" description="% de vagas preenchidas a tempo" />
              <CardContent>
                <BarChart data={fillRateByWeek} min={70} max={100} target={90} targetLabel="meta 90%" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Tempo médio até preencher" description="Por tipo de vaga · últimos 30 dias" />
              <CardContent className="space-y-5 pt-6">
                {fillTimeByType.map((t) => (
                  <div key={t.label}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="text-slate-600">{t.label}</span>
                      <span className="tabular font-medium text-slate-900">
                        {t.minutes < 60 ? `${t.minutes} min` : `${Math.floor(t.minutes / 60)}h${String(t.minutes % 60).padStart(2, "0")}`}
                      </span>
                    </div>
                    <Progress value={(t.minutes / t.target) * 100} barClassName="bg-brand-500" />
                    <p className="mt-1 text-xs text-slate-400">
                      SLA {t.target < 60 ? `${t.target} min` : `${t.target / 60}h`}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-red-500" /> Lacunas · próximos 14 dias
                </span>
              }
              description={`${gaps.length} turnos de emergência sem vaga publicada`}
            />
            <CardContent className="space-y-2">
              {gaps.slice(0, 5).map(({ unit, entry }) => (
                <div key={entry.key} className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-red-200 bg-red-50/40 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {formatWeekdayDate(entry.startsAt)} · {entry.slotLabel}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {unit.name} · {formatTimeRange(entry.startsAt, entry.endsAt)}
                    </p>
                  </div>
                  <ButtonLink href="/clinica/vagas/nova" size="sm" variant="secondary">
                    Publicar
                  </ButtonLink>
                </div>
              ))}
              <Link href="/clinica/escala" className="block pt-1 text-center text-sm font-medium text-brand-700 hover:text-brand-800">
                Abrir escala completa
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Próximos plantões" description="Confirmados" />
            <CardContent className="divide-y divide-slate-100 py-2">
              {upcoming.map((s) => {
                const vet = getVet(s.assignedVetId!);
                return (
                  <Link key={s.id} href={`/clinica/vagas/${s.id}`} className="flex items-center gap-3 py-3 first:pt-2 last:pb-2">
                    <Avatar name={vet.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{vet.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {getSpecialty(s.specialtyId).short} · {getUnit(s.unitId).name}
                      </p>
                    </div>
                    <div className="text-right">
                      {s.status === "in_progress" ? (
                        <Badge tone="violet">
                          <Dot tone="violet" pulse /> Agora
                        </Badge>
                      ) : (
                        <p className="text-xs font-medium text-slate-700">{formatRelativeDay(s.startsAt)}</p>
                      )}
                      <p className="mt-0.5 text-xs text-slate-500">{formatTimeRange(s.startsAt, s.endsAt)}</p>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-white">
            <CardContent>
              <p className="text-sm font-semibold text-slate-900">{pendingClosings.length} fechamentos aguardando vendas</p>
              <p className="mt-1 text-sm text-slate-600">
                Informe as vendas do plantão para calcular a comissão e liberar o pagamento.
              </p>
              <ButtonLink href="/clinica/financeiro" variant="secondary" size="sm" className="mt-3">
                Fazer fechamento <ArrowRight />
              </ButtonLink>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
