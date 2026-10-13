import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Clock,
  ExternalLink,
  LogIn,
  LogOut,
  MapPin,
  Phone,
  Stethoscope,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WavesCard } from "@/components/clinic/waves-card";
import { DemoButton } from "@/components/shared/demo-button";
import { Rating } from "@/components/shared/rating";
import { CrmvBadge, SettlementStatusBadge, ShiftStatusBadge, ShiftTypeBadge } from "@/components/shared/status";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatBRL, formatDateLong, formatDateTime, formatPct, formatTimeRange, weekdayLong } from "@/lib/format";
import { reasonLabels } from "@/lib/labels";
import { CURRENT_ORG_ID } from "@/lib/mock/data";
import {
  breakdownFor,
  distributionFor,
  estimateFor,
  findShift,
  getSpecialty,
  getUnit,
  getVet,
  orgShifts,
  settlementOf,
} from "@/lib/mock/queries";
import type { Shift } from "@/lib/mock/types";
import { extrasLabel, payLabel, shiftHours } from "@/lib/view";

type Params = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return orgShifts().map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const shift = findShift((await params).id);
  return { title: shift ? `Vaga #${shift.code}` : "Vaga" };
}

function timeline(shift: Shift) {
  const events: { at: Date; text: string }[] = [];
  if (shift.publishedAt) events.push({ at: shift.publishedAt, text: `Vaga publicada por ${shift.createdBy}` });
  if (shift.publishedAt && (shift.status === "offered" || shift.filledAt)) {
    events.push({ at: new Date(shift.publishedAt.getTime() + 60_000), text: "Onda 1 enviada por WhatsApp" });
  }
  if (shift.waveStartedAt && shift.currentWave && shift.currentWave > 1) {
    events.push({ at: shift.waveStartedAt, text: `Onda ${shift.currentWave} enviada por WhatsApp` });
  }
  for (const [vetId, r] of Object.entries(shift.responses ?? {})) {
    if (r.response === "declined") events.push({ at: r.at, text: `${getVet(vetId).name} recusou` });
  }
  if (shift.filledAt && shift.assignedVetId) {
    events.push({ at: shift.filledAt, text: `${getVet(shift.assignedVetId).name} aceitou pelo WhatsApp` });
    if (shift.requireManualApproval) {
      events.push({ at: new Date(shift.filledAt.getTime() + 4 * 60_000), text: "Profissional aprovado manualmente por Ricardo Tavares" });
    }
  }
  if (shift.checkInAt) events.push({ at: shift.checkInAt, text: "Check-in realizado no app" });
  if (shift.checkOutAt) events.push({ at: shift.checkOutAt, text: "Check-out realizado no app" });
  if (shift.status === "no_show") events.push({ at: shift.startsAt, text: "No-show registrado · penalidade aplicada ao score" });
  return events.sort((a, b) => b.at.getTime() - a.at.getTime());
}

export default async function ShiftDetailPage({ params }: Params) {
  const shift = findShift((await params).id);
  if (!shift || shift.orgId !== CURRENT_ORG_ID) notFound();

  const unit = getUnit(shift.unitId);
  const specialty = getSpecialty(shift.specialtyId);
  const vet = shift.assignedVetId ? getVet(shift.assignedVetId) : undefined;
  const showDistribution = ["open", "offered", "filled"].includes(shift.status);
  const dist = distributionFor(shift);
  const settlement = settlementOf(shift.id);
  const breakdown =
    settlement && settlement.salesAmount !== null
      ? breakdownFor(shift, settlement.salesAmount, settlement.discounts)
      : estimateFor(shift);
  const isEstimate = !settlement || settlement.salesAmount === null;
  const excludedRelevant = dist.excluded.filter((e) => !e.reasons.includes("specialty_mismatch"));
  const noSpecialty = dist.excluded.length - excludedRelevant.length;
  const events = timeline(shift);

  return (
    <>
      <Link href="/clinica/vagas" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="size-4" /> Vagas
      </Link>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Vaga #{shift.code} · {specialty.short}
            </h1>
            <ShiftStatusBadge status={shift.status} />
            <ShiftTypeBadge type={shift.type} hideSingle />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {unit.name} · {weekdayLong(shift.startsAt)}, {formatDateLong(shift.startsAt)} · {formatTimeRange(shift.startsAt, shift.endsAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {shift.status === "offered" && (
            <>
              <DemoButton variant="secondary">Avançar para próxima onda</DemoButton>
              <DemoButton variant="secondary">Convite direto</DemoButton>
              <DemoButton variant="danger-outline">Cancelar vaga</DemoButton>
            </>
          )}
          {shift.status === "draft" && (
            <>
              <DemoButton variant="secondary">Editar</DemoButton>
              <DemoButton>Publicar</DemoButton>
            </>
          )}
          {(shift.status === "filled" || shift.status === "open") && (
            <>
              <DemoButton variant="secondary">Editar</DemoButton>
              <DemoButton variant="danger-outline" toastTitle="Cancelamento" toastDescription="Com menos de 24h de antecedência, 50% do fixo é pago ao plantonista como compensação.">
                Cancelar vaga
              </DemoButton>
            </>
          )}
          {shift.status === "completed" && <ButtonLink href="/clinica/financeiro">Fazer fechamento</ButtonLink>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Detalhes" />
            <CardContent>
              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <div>
                    <dt className="text-xs text-slate-500">Unidade</dt>
                    <dd className="text-sm font-medium text-slate-900">{unit.name}</dd>
                    <dd className="text-xs text-slate-500">{unit.address}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <div>
                    <dt className="text-xs text-slate-500">Data e horário</dt>
                    <dd className="text-sm font-medium text-slate-900">
                      {formatDateLong(shift.startsAt)} · {formatTimeRange(shift.startsAt, shift.endsAt)}
                    </dd>
                    <dd className="text-xs text-slate-500">
                      {shiftHours(shift)} de plantão{shift.seriesLabel ? ` · ${shift.seriesLabel}` : ""}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Stethoscope className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <div>
                    <dt className="text-xs text-slate-500">Especialidade</dt>
                    <dd className="text-sm font-medium text-slate-900">{specialty.name}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Wallet className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <div>
                    <dt className="text-xs text-slate-500">Remuneração</dt>
                    <dd className="text-sm font-medium text-slate-900">{payLabel(shift)}</dd>
                    {extrasLabel(shift) && <dd className="text-xs text-slate-500">{extrasLabel(shift)}</dd>}
                  </div>
                </div>
              </dl>
              {(shift.requirements.length > 0 || shift.notes || shift.cancelledReason) && (
                <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
                  {shift.requirements.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500">Requisitos</p>
                      <ul className="mt-1 list-inside list-disc text-slate-700">
                        {shift.requirements.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {shift.notes && (
                    <div>
                      <p className="text-xs text-slate-500">Observações</p>
                      <p className="mt-1 text-slate-700">{shift.notes}</p>
                    </div>
                  )}
                  {shift.cancelledReason && (
                    <div>
                      <p className="text-xs text-slate-500">Motivo do cancelamento</p>
                      <p className="mt-1 text-slate-700">{shift.cancelledReason}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {showDistribution && <WavesCard shift={shift} dist={dist} />}

          {showDistribution && (
            <Card>
              <CardHeader
                title="Elegibilidade"
                description="Filtros obrigatórios aplicados antes de qualquer oferta"
              />
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-brand-50 p-3">
                    <p className="tabular text-2xl font-semibold text-brand-700">{dist.eligible.length}</p>
                    <p className="text-xs text-brand-800">elegíveis</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="tabular text-2xl font-semibold text-slate-700">{excludedRelevant.length}</p>
                    <p className="text-xs text-slate-600">excluídos</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="tabular text-2xl font-semibold text-slate-400">{noSpecialty}</p>
                    <p className="text-xs text-slate-500">sem a especialidade</p>
                  </div>
                </div>
                {excludedRelevant.length > 0 && (
                  <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                    {excludedRelevant.map((e) => (
                      <li key={e.vet.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                        <Avatar name={e.vet.name} size="sm" className="opacity-60" />
                        <span className="flex-1 text-sm text-slate-700">{e.vet.name}</span>
                        <span className="flex flex-wrap gap-1">
                          {e.reasons.map((r) => (
                            <span key={r} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                              {reasonLabels[r]}
                            </span>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-slate-500">
                  Regras: CRMV verificado · especialidade compatível · dentro do raio do profissional · sem conflito de agenda ·
                  descanso mínimo de 11h · limite semanal de horas · não bloqueado pela clínica.
                </p>
              </CardContent>
            </Card>
          )}

          {(shift.checkInAt || shift.status === "no_show") && (
            <Card>
              <CardHeader title="Jornada" description="Registrada pelo check-in/check-out no app" />
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {shift.status === "no_show" ? (
                  <p className="text-sm text-red-700 sm:col-span-2">
                    O profissional não realizou check-in. No-show registrado e penalidade aplicada na taxa de comparecimento.
                  </p>
                ) : (
                  <>
                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                      <LogIn className="size-4 text-brand-600" />
                      <div>
                        <p className="text-xs text-slate-500">Check-in</p>
                        <p className="text-sm font-medium text-slate-900">{formatDateTime(shift.checkInAt!)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                      <LogOut className="size-4 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Check-out</p>
                        <p className="text-sm font-medium text-slate-900">{shift.checkOutAt ? formatDateTime(shift.checkOutAt) : "Em andamento"}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {vet && (
            <Card>
              <CardHeader title={shift.status === "no_show" ? "Profissional alocado" : "Plantonista"} />
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar name={vet.name} size="lg" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{vet.name}</p>
                    <p className="text-xs text-slate-500">
                      CRMV-{vet.crmvUf} {vet.crmvNumber}
                    </p>
                    <div className="mt-1">
                      <CrmvBadge status={vet.crmvStatus} compact />
                    </div>
                  </div>
                </div>
                <dl className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-slate-50 p-2">
                    <dd className="text-sm font-semibold text-slate-900">
                      <Rating value={vet.avgRating} />
                    </dd>
                    <dt className="text-[11px] text-slate-500">nota</dt>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <dd className="text-sm font-semibold text-slate-900">{vet.completedShifts}</dd>
                    <dt className="text-[11px] text-slate-500">plantões</dt>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <dd className="text-sm font-semibold text-slate-900">
                      {formatPct((vet.completedShifts / Math.max(1, vet.completedShifts + vet.noShows)) * 100, 0)}
                    </dd>
                    <dt className="text-[11px] text-slate-500">presença</dt>
                  </div>
                </dl>
                <div className="flex gap-2">
                  <DemoButton variant="secondary" size="sm" className="flex-1">
                    <Phone /> Contato
                  </DemoButton>
                  <ButtonLink href={`/p/${vet.slug}`} variant="secondary" size="sm" className="flex-1">
                    <ExternalLink /> Perfil público
                  </ButtonLink>
                </div>
              </CardContent>
            </Card>
          )}

          {shift.status !== "cancelled" && shift.status !== "no_show" && (
            <Card>
              <CardHeader
                title={isEstimate ? "Custo estimado" : "Fechamento"}
                action={settlement ? <SettlementStatusBadge status={settlement.status} /> : undefined}
              />
              <CardContent>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Fixo</dt>
                    <dd className="tabular">{formatBRL(breakdown.fixedAmount)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">
                      Comissão {shift.commissionPct > 0 && `(${formatPct(shift.commissionPct)})`}
                      {isEstimate && shift.commissionPct > 0 && "*"}
                    </dt>
                    <dd className="tabular">{formatBRL(breakdown.commissionAmount)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Adicionais</dt>
                    <dd className="tabular">{formatBRL(breakdown.extrasAmount)}</dd>
                  </div>
                  {breakdown.discountsAmount > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Descontos</dt>
                      <dd className="tabular">−{formatBRL(breakdown.discountsAmount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-100 pt-1.5">
                    <dt className="text-slate-700">Plantonista</dt>
                    <dd className="tabular font-medium">{formatBRL(breakdown.vetNetAmount)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Taxa da plataforma</dt>
                    <dd className="tabular">{formatBRL(breakdown.platformFee)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1.5 font-semibold">
                    <dt>Total</dt>
                    <dd className="tabular text-brand-700">{formatBRL(breakdown.clinicTotalAmount)}</dd>
                  </div>
                </dl>
                {isEstimate && shift.commissionPct > 0 && (
                  <p className="mt-3 text-xs text-slate-400">*Estimativa pela média de vendas por plantão.</p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader title="Histórico" />
            <CardContent>
              {events.length === 0 ? (
                <p className="text-sm text-slate-500">Rascunho ainda não publicado.</p>
              ) : (
                <ol className="space-y-3">
                  {events.map((e, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-slate-300" />
                      <div>
                        <p className="text-slate-700">{e.text}</p>
                        <p className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="size-3" /> {formatDateTime(e.at)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          {shift.requireManualApproval && (
            <p className="flex items-center gap-2 text-xs text-slate-500">
              <BadgeCheck className="size-4 text-brand-600" /> Esta vaga exige aprovação manual da clínica.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
