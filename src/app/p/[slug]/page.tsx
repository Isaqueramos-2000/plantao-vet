import { BadgeCheck, CalendarCheck, MapPin, ShieldCheck, Star, UserCheck } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoButton } from "@/components/shared/demo-button";
import { Logo } from "@/components/shared/logo";
import { Stars } from "@/components/shared/rating";
import { CrmvBadge } from "@/components/shared/status";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateFull, formatPct, formatRating } from "@/lib/format";
import { vets } from "@/lib/mock/data";
import { findVetBySlug, getOrg, getSpecialty, vetReviews } from "@/lib/mock/queries";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return vets.filter((v) => v.crmvStatus === "verified").map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const vet = findVetBySlug((await params).slug);
  return { title: vet ? `${vet.name} · Currículo verificado` : "Perfil" };
}

export default async function PublicProfile({ params }: Params) {
  const vet = findVetBySlug((await params).slug);
  if (!vet || vet.crmvStatus !== "verified") notFound();
  const reviews = vetReviews(vet.id);
  const attendance = (vet.completedShifts / Math.max(1, vet.completedShifts + vet.noShows)) * 100;
  const clinics = Object.keys(vet.historyByOrg).map((id) => ({ org: getOrg(id), count: vet.historyByOrg[id]! }));

  return (
    <div className="min-h-dvh bg-gradient-to-b from-brand-50 to-slate-50">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <Logo />
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <ShieldCheck className="size-4 text-brand-600" /> Currículo verificado
        </span>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 pb-16">
        <Card>
          <CardContent className="flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:text-left">
            <Avatar name={vet.name} size="xl" />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{vet.name}</h1>
              <p className="text-sm text-slate-500">
                Plantonista · CRMV-{vet.crmvUf} {vet.crmvNumber} · na plataforma desde {vet.memberSince}
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                <CrmvBadge status={vet.crmvStatus} />
                {vet.hasCnpj && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 ring-inset">
                    PJ ativa
                  </span>
                )}
              </div>
            </div>
            <DemoButton toastTitle="Convite enviado (simulação)" toastDescription="O profissional recebe o convite para o banco de reserva da sua clínica pelo WhatsApp.">
              <UserCheck /> Convidar para minha clínica
            </DemoButton>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Star, label: "Nota média", value: formatRating(vet.avgRating), hint: `${vet.reviewsCount} avaliações` },
            { icon: CalendarCheck, label: "Plantões cumpridos", value: String(vet.completedShifts), hint: "via plataforma" },
            { icon: UserCheck, label: "Comparecimento", value: formatPct(attendance, 1), hint: `${vet.noShows} no-show(s)` },
            { icon: MapPin, label: "Atua em", value: `${vet.radiusKm} km`, hint: `a partir de ${vet.baseLabel}` },
          ].map((m) => (
            <Card key={m.label} className="p-4">
              <m.icon className="size-4 text-brand-600" />
              <p className="mt-2 text-xl font-semibold text-slate-900">{m.value}</p>
              <p className="text-xs text-slate-500">{m.label}</p>
              <p className="text-[11px] text-slate-400">{m.hint}</p>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Especialidades</h2>
              <ul className="mt-2 space-y-1.5">
                {vet.specialtyIds.map((id) => (
                  <li key={id} className="flex items-center gap-2 text-sm text-slate-700">
                    <BadgeCheck className="size-4 text-brand-600" /> {getSpecialty(id).name}
                  </li>
                ))}
              </ul>
            </div>
            {vet.bio && (
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Sobre</h2>
                <p className="mt-1 text-sm text-slate-600">{vet.bio}</p>
              </div>
            )}
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Clínicas atendidas</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {clinics.map(({ org, count }) => (
                  <span key={org.id} className="rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-700 ring-1 ring-slate-200">
                    {org.name} · <b>{count}</b> plantões
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Avaliações das clínicas</h2>
          {reviews.length === 0 && <p className="text-sm text-slate-500">Ainda sem avaliações públicas.</p>}
          {reviews.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-900">{getOrg(r.orgId).name}</p>
                <span className="text-xs text-slate-400">{formatDateFull(r.at)}</span>
              </div>
              <Stars value={r.rating} className="mt-1" />
              {r.comment && <p className="mt-2 text-sm text-slate-600">{r.comment}</p>}
              <div className="mt-2 flex flex-wrap gap-1">
                {r.tags.map((t) => (
                  <span key={t} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-800">
                    {t}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </section>

        <p className="text-center text-xs text-slate-400">
          Dados de verificação conferidos pela equipe PlantãoVet. Perfil fictício — protótipo de demonstração.
        </p>
      </main>
    </div>
  );
}
