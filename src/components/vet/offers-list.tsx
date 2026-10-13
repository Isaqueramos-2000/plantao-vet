"use client";

import { AlertTriangle, Check, ChevronRight, MapPin, Star, Timer, Undo2, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useCountdown } from "@/components/shared/countdown";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { findConflicts, findRestViolations, restGapHours, type Interval } from "@/lib/core";
import { formatCountdown, formatHours } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface OfferDTO {
  id: string;
  code: string;
  urgent: boolean;
  clinicName: string;
  clinicRating: string;
  unitName: string;
  distance: string;
  specialty: string;
  dayLabel: string;
  timeRange: string;
  hours: string;
  pay: string;
  extras: string | null;
  estimate: string;
  minimum: string;
  waveLabel: string;
  secondsLeft: number | null;
  timeoutSeconds: number | null;
  startsAtMs: number;
  endsAtMs: number;
  href: string;
}

type State = "idle" | "accepted" | "declined";

const toInterval = (o: OfferDTO): Interval => ({ startsAt: new Date(o.startsAtMs), endsAt: new Date(o.endsAtMs) });

function OfferCard({
  offer,
  state,
  blockedBy,
  onAccept,
  onDecline,
  onUndo,
}: {
  offer: OfferDTO;
  state: State;
  blockedBy: string | null;
  onAccept: () => void;
  onDecline: () => void;
  onUndo: () => void;
}) {
  const { remaining, restart } = useCountdown(offer.secondsLeft ?? 0);
  const timed = offer.secondsLeft !== null && offer.timeoutSeconds !== null;
  const expired = timed && remaining === 0 && state === "idle";

  if (state === "declined") {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
        <span>
          Você recusou #{offer.code} · {offer.specialty}
        </span>
        <button type="button" onClick={onUndo} className="inline-flex items-center gap-1 font-medium text-slate-700">
          <Undo2 className="size-4" /> Desfazer
        </button>
      </div>
    );
  }

  if (state === "accepted") {
    return (
      <div className="animate-slide-up rounded-2xl border border-brand-200 bg-brand-50 p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
            <Check className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-brand-900">Plantão confirmado!</p>
            <p className="text-sm text-brand-800">
              {offer.clinicName} · {offer.dayLabel}, {offer.timeRange}
            </p>
            <p className="mt-1 text-xs text-brand-700">Adicionado à agenda. Lembretes pelo WhatsApp 24h e 2h antes.</p>
          </div>
        </div>
        <button type="button" onClick={onUndo} className="mt-3 text-xs font-medium text-brand-700 underline">
          Desfazer (demo)
        </button>
      </div>
    );
  }

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border bg-white shadow-sm",
        offer.urgent ? "border-red-200" : "border-slate-200",
        (expired || blockedBy) && "opacity-90",
      )}
    >
      {offer.urgent && (
        <div className="flex items-center gap-1.5 bg-red-600 px-4 py-1.5 text-xs font-semibold tracking-wide text-white uppercase">
          <Zap className="size-3.5" /> Urgente · começa {offer.dayLabel.toLowerCase()}
        </div>
      )}
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{offer.clinicName}</p>
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <Star className="size-3 fill-amber-400 text-amber-400" /> {offer.clinicRating}
              <span className="mx-0.5">·</span>
              <MapPin className="size-3" /> {offer.unitName} · {offer.distance}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{offer.waveLabel}</span>
        </div>

        <div>
          <p className="text-lg leading-tight font-semibold text-slate-900">{offer.specialty}</p>
          <p className="text-sm text-slate-600">
            {offer.dayLabel} · {offer.timeRange} · {offer.hours}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-sm text-slate-700">
            {offer.pay}
            {offer.extras && <span className="text-slate-500"> + {offer.extras}</span>}
          </p>
          <p className="mt-0.5 text-base font-semibold text-brand-700">
            {offer.minimum} – {offer.estimate}
            <span className="ml-1 text-xs font-normal text-slate-500">estimativa</span>
          </p>
        </div>

        {timed && !expired && (
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-medium text-amber-700">
                <Timer className="size-3.5" /> Responda em {formatCountdown(remaining)}
              </span>
              <span className="text-slate-400">depois segue para a próxima onda</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-amber-100">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-1000 ease-linear"
                style={{ width: `${(remaining / offer.timeoutSeconds!) * 100}%` }}
              />
            </div>
          </div>
        )}
        {!timed && (
          <p className="flex items-center gap-1 text-xs text-slate-500">
            <Users className="size-3.5" /> Oferta aberta: o primeiro aceite válido leva a vaga
          </p>
        )}

        {blockedBy && (
          <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> {blockedBy}
          </p>
        )}

        {expired ? (
          <div className="rounded-lg bg-slate-100 px-3 py-2.5 text-sm text-slate-600">
            Tempo esgotado — a vaga seguiu para a próxima onda.{" "}
            <button type="button" onClick={restart} className="font-medium text-brand-700 underline">
              Simular nova oferta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={onDecline}>
              Recusar
            </Button>
            <Button onClick={onAccept} disabled={!!blockedBy} variant={offer.urgent ? "danger" : "primary"}>
              Aceitar
            </Button>
          </div>
        )}
        <Link href={offer.href} className="flex items-center justify-center gap-1 pt-1 text-xs font-medium text-slate-500 hover:text-slate-800">
          Ver detalhes da vaga <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}

export function OffersList({ offers, minRestHours }: { offers: OfferDTO[]; minRestHours: number }) {
  const toast = useToast();
  const [states, setStates] = useState<Record<string, State>>({});
  const accepted = offers.filter((o) => states[o.id] === "accepted");

  const blockedReason = (o: OfferDTO): string | null => {
    if (states[o.id] === "accepted") return null;
    const interval = toInterval(o);
    for (const a of accepted) {
      const other = toInterval(a);
      if (findConflicts(interval, [other]).length) return `Conflita com o plantão #${a.code} que você aceitou.`;
      if (findRestViolations(interval, [other], minRestHours).length) {
        return `Descanso de ${formatHours(restGapHours(interval, other))} após o plantão #${a.code} (mínimo ${minRestHours}h). Ajuste nas preferências.`;
      }
    }
    return null;
  };

  const set = (id: string, s: State) => setStates((all) => ({ ...all, [id]: s }));

  if (offers.length === 0) {
    return <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">Nenhuma vaga para você agora.</p>;
  }

  return (
    <div className="space-y-3">
      {offers.map((o) => (
        <OfferCard
          key={o.id}
          offer={o}
          state={states[o.id] ?? "idle"}
          blockedBy={blockedReason(o)}
          onAccept={() => {
            set(o.id, "accepted");
            toast({ tone: "success", title: "Aceite registrado (simulação)", description: "Na versão real, o lock transacional garante um único vencedor." });
          }}
          onDecline={() => set(o.id, "declined")}
          onUndo={() => set(o.id, "idle")}
        />
      ))}
    </div>
  );
}
