import { BadgeCheck, Bell, CalendarClock, ChevronRight, Gift, MapPin, Navigation, TrendingUp } from "lucide-react";
import Link from "next/link";
import { DemoButton } from "@/components/shared/demo-button";
import { AppHeader } from "@/components/shell/phone-shell";
import { OffersList } from "@/components/vet/offers-list";
import { ReviewPrompt } from "@/components/vet/review-prompt";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatRelativeDay, formatTimeRange } from "@/lib/format";
import { currentVet, getSpecialty, pendingOffersFor, vetAgendaEntries, vetStatement } from "@/lib/mock/queries";
import { toOfferDTO } from "@/lib/mock/vet-dto";
import { DEMO_NOW } from "@/lib/time";

export default function VetHome() {
  const vet = currentVet();
  const offers = pendingOffersFor().map(toOfferDTO);
  const next = vetAgendaEntries().find((e) => e.startsAt > DEMO_NOW && e.source === "platform");
  const statement = vetStatement();
  const received = statement.filter((e) => e.status === "paid").reduce((s, e) => s + e.breakdown.vetNetAmount, 0);
  const toReceive = statement
    .filter((e) => e.status === "approved" || e.status === "pending")
    .reduce((s, e) => s + e.breakdown.vetNetAmount, 0);
  const lastShift = statement.find((e) => e.shift.endsAt <= DEMO_NOW);

  return (
    <>
      <AppHeader
        title={
          <span className="flex items-center gap-1.5">
            Bom dia, {vet.name.split(" ")[0]} <BadgeCheck className="size-4 text-brand-600" aria-label="CRMV verificado" />
          </span>
        }
        subtitle={`CRMV-${vet.crmvUf} ${vet.crmvNumber} · raio de ${vet.radiusKm} km`}
        right={
          <div className="flex items-center gap-1">
            <Link href="/plantonista/whatsapp" className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100" aria-label="Notificações">
              <Bell className="size-5" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500" />
            </Link>
            <Link href="/plantonista/perfil">
              <Avatar name={vet.name} size="sm" />
            </Link>
          </div>
        }
      />

      <div className="space-y-6 p-4">
        <Link
          href="/plantonista/extrato"
          className="block rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-brand-100">
            <span>Últimos 15 dias</span>
            <span className="flex items-center gap-1">
              Ver extrato <ChevronRight className="size-3.5" />
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-brand-100">Recebido</p>
              <p className="tabular text-xl font-semibold">{formatBRL(received, { cents: false })}</p>
            </div>
            <div>
              <p className="text-xs text-brand-100">A receber</p>
              <p className="tabular text-xl font-semibold">{formatBRL(toReceive, { cents: false })}</p>
            </div>
          </div>
          <p className="mt-2 flex items-center gap-1 text-xs text-brand-100">
            <TrendingUp className="size-3.5" /> Pagamento garantido via gateway · sem atraso
          </p>
        </Link>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Vagas para você</h2>
            <Badge tone="red">{offers.length} novas</Badge>
          </div>
          <OffersList offers={offers} minRestHours={vet.minRestHours} />
        </section>

        {next?.shift && (
          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-900">Próximo plantão</h2>
            <Link href={`/plantonista/vagas/${next.shift.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <CalendarClock className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatRelativeDay(next.startsAt)} · {formatTimeRange(next.startsAt, next.endsAt)}
                  </p>
                  <p className="text-sm text-slate-600">{getSpecialty(next.shift.specialtyId).short} · {next.title.split(" · ")[1]}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="size-3" /> {next.place}
                  </p>
                </div>
                <ChevronRight className="size-4 text-slate-300" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">Check-in libera 30 min antes</span>
                <span className="flex items-center justify-center gap-1 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                  <Navigation className="size-3.5" /> Como chegar
                </span>
              </div>
            </Link>
          </section>
        )}

        {lastShift && (
          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-900">Avalie a clínica</h2>
            <ReviewPrompt
              clinicName={lastShift.unit.name}
              subtitle={`${formatRelativeDay(lastShift.shift.startsAt)}, ${formatTimeRange(lastShift.shift.startsAt, lastShift.shift.endsAt)}`}
            />
          </section>
        )}

        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <Badge tone="violet">Fase 3</Badge>
            <p className="mt-2 text-sm font-semibold text-slate-900">Antecipe recebíveis</p>
            <p className="mt-0.5 text-xs text-slate-500">Receba hoje o que entra em D+2, via parceiro financeiro.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <Badge tone="violet">
              <Gift /> Fase 3
            </Badge>
            <p className="mt-2 text-sm font-semibold text-slate-900">Clube de vantagens</p>
            <p className="mt-0.5 text-xs text-slate-500">Cursos, seguro RC, insumos e contabilidade com desconto.</p>
          </div>
        </section>

        <DemoButton variant="ghost" size="sm" className="w-full" toastTitle="Plantão externo" toastDescription="Cadastrar plantões de fora da plataforma para o alerta de conflito considerar toda a sua agenda.">
          + Adicionar plantão de fora da plataforma
        </DemoButton>
      </div>
    </>
  );
}
