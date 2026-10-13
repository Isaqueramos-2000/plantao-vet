import { BadgeCheck, CalendarDays, Clock, Info, MapPin, ShieldCheck, Star, Stethoscope } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoButton } from "@/components/shared/demo-button";
import { ShiftStatusBadge, ShiftTypeBadge } from "@/components/shared/status";
import { AppHeader } from "@/components/shell/phone-shell";
import { OfferActions } from "@/components/vet/offer-actions";
import { ButtonLink } from "@/components/ui/button";
import { haversineKm } from "@/lib/core";
import { formatBRL, formatDateLong, formatKm, formatPct, formatRating, formatTimeRange, weekdayLong } from "@/lib/format";
import { CURRENT_VET_ID, shifts } from "@/lib/mock/data";
import {
  breakdownFor,
  currentVet,
  estimateFor,
  findShift,
  getOrg,
  getSpecialty,
  getUnit,
  pendingOffersFor,
} from "@/lib/mock/queries";
import { DEMO_NOW } from "@/lib/time";
import { shiftHours } from "@/lib/view";

type Params = { params: Promise<{ id: string }> };

export const dynamicParams = false;

function visibleShiftIds() {
  const offered = pendingOffersFor().map((o) => o.shift.id);
  const mine = shifts.filter((s) => s.assignedVetId === CURRENT_VET_ID).map((s) => s.id);
  return [...new Set([...offered, ...mine])];
}

export function generateStaticParams() {
  return visibleShiftIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const shift = findShift((await params).id);
  return { title: shift ? `Vaga #${shift.code}` : "Vaga" };
}

function MapPreview({ distance }: { distance: string }) {
  return (
    <div className="relative h-36 overflow-hidden rounded-2xl bg-[#e8efe9]">
      <svg viewBox="0 0 360 144" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <g stroke="#fff" strokeWidth="10" fill="none">
          <path d="M-10 100 L380 60" />
          <path d="M80 -10 L120 160" />
          <path d="M240 -10 L210 160" />
        </g>
        <g stroke="#fff" strokeWidth="4" fill="none" opacity="0.8">
          <path d="M-10 30 L380 20" />
          <path d="M-10 130 L380 120" />
          <path d="M170 -10 L160 160" />
          <path d="M310 -10 L300 160" />
        </g>
        <rect x="128" y="70" width="34" height="22" rx="4" fill="#cfe3d3" />
        <rect x="250" y="28" width="40" height="26" rx="4" fill="#cfe3d3" />
        <path d="M60 112 C 120 90, 170 85, 214 70" stroke="#059673" strokeWidth="3" strokeDasharray="6 5" fill="none" />
        <circle cx="60" cy="112" r="6" fill="#0f172a" stroke="#fff" strokeWidth="2" />
      </svg>
      <div className="absolute top-[38%] left-[58%] -translate-x-1/2 -translate-y-full text-red-600">
        <MapPin className="size-8 fill-red-500 text-white drop-shadow" />
      </div>
      <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
        {distance} da sua base
      </span>
    </div>
  );
}

export default async function VetShiftPage({ params }: Params) {
  const { id } = await params;
  if (!visibleShiftIds().includes(id)) notFound();
  const shift = findShift(id)!;
  const vet = currentVet();
  const org = getOrg(shift.orgId);
  const unit = getUnit(shift.unitId);
  const specialty = getSpecialty(shift.specialtyId);
  const isOffer = shift.status === "offered" && shift.assignedVetId !== CURRENT_VET_ID;
  const estimate = estimateFor(shift);
  const minimum = breakdownFor(shift, 0);
  const distance = formatKm(haversineKm(vet.base, unit.location));
  const isFuture = shift.startsAt > DEMO_NOW;

  return (
    <>
      <AppHeader back="/plantonista" title={`Vaga #${shift.code}`} subtitle={org.name} />

      <div className="flex-1 space-y-4 p-4">
        <div>
          <div className="flex flex-wrap gap-1.5">
            <ShiftTypeBadge type={shift.type} />
            {!isOffer && <ShiftStatusBadge status={shift.status} />}
          </div>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">{specialty.name}</h2>
          <p className="text-sm text-slate-600">
            {weekdayLong(shift.startsAt)}, {formatDateLong(shift.startsAt)} · {formatTimeRange(shift.startsAt, shift.endsAt)}
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-lg font-semibold text-slate-700">
            {org.name.split(" ").pop()?.[0]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 truncate text-sm font-semibold text-slate-900">
              {org.name} <BadgeCheck className="size-4 shrink-0 text-brand-600" />
            </p>
            <p className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-0.5">
                <Star className="size-3 fill-amber-400 text-amber-400" /> {formatRating(org.rating)} ({org.reviewsCount})
              </span>
              <span>{formatPct(org.paymentPunctuality)} pagos em dia</span>
            </p>
          </div>
        </div>

        <MapPreview distance={distance} />

        <dl className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <div>
              <dt className="sr-only">Endereço</dt>
              <dd className="text-slate-800">{unit.address}</dd>
            </div>
          </div>
          <div className="flex gap-3">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <dd className="text-slate-800">
              {formatTimeRange(shift.startsAt, shift.endsAt)} · {shiftHours(shift)}
            </dd>
          </div>
          <div className="flex gap-3">
            <Stethoscope className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <dd className="text-slate-800">
              {shift.requirements.length ? shift.requirements.join(" · ") : "Sem requisitos adicionais"}
            </dd>
          </div>
          {shift.notes && (
            <div className="flex gap-3">
              <Info className="mt-0.5 size-4 shrink-0 text-slate-400" />
              <dd className="text-slate-800">{shift.notes}</dd>
            </div>
          )}
        </dl>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Remuneração</p>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Fixo</dt>
              <dd className="tabular text-slate-900">{formatBRL(shift.fixedAmount)}</dd>
            </div>
            {shift.commissionPct > 0 && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Comissão ({formatPct(shift.commissionPct)} das vendas)*</dt>
                <dd className="tabular text-slate-900">~{formatBRL(estimate.commissionAmount)}</dd>
              </div>
            )}
            {shift.extras.map((e) => (
              <div key={e.label} className="flex justify-between">
                <dt className="text-slate-500">{e.label}</dt>
                <dd className="tabular text-slate-900">{formatBRL(e.amount)}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold">
              <dt>Você recebe</dt>
              <dd className="tabular text-brand-700">
                {formatBRL(minimum.vetNetAmount, { cents: false })} – {formatBRL(estimate.vetNetAmount, { cents: false })}
              </dd>
            </div>
          </dl>
          <p className="mt-3 flex gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="size-4 shrink-0 text-brand-600" />
            *Estimativa pela média de vendas da clínica. O fixo é garantido no aceite; a comissão é calculada no fechamento e você pode
            contestar.
          </p>
        </div>
      </div>

      <div className="sticky bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-10 border-t border-slate-200 bg-white/95 p-4 backdrop-blur lg:bottom-0">
        {isOffer ? (
          <OfferActions urgent={shift.type === "urgent"} />
        ) : isFuture ? (
          <div className="grid grid-cols-2 gap-2">
            <DemoButton variant="secondary" toastTitle="Troca de plantão" toastDescription="Oferecer o plantão a outros elegíveis, com aprovação da clínica — Fase 2.">
              Oferecer troca
            </DemoButton>
            <DemoButton toastTitle="Check-in" toastDescription="O check-in (com geolocalização opcional) libera 30 min antes do início.">
              <Clock /> Check-in
            </DemoButton>
          </div>
        ) : (
          <ButtonLink href="/plantonista/extrato" variant="secondary" className="w-full">
            Ver no extrato
          </ButtonLink>
        )}
      </div>
    </>
  );
}
