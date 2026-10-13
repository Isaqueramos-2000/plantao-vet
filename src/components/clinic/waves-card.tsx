import { CheckCircle2, Circle, Loader2, MessageCircle, Star, Timer } from "lucide-react";
import { Countdown } from "@/components/shared/countdown";
import { DemoButton } from "@/components/shared/demo-button";
import { Rating } from "@/components/shared/rating";
import { OfferStateBadge } from "@/components/shared/status";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDecimal, formatKm, formatTime } from "@/lib/format";
import { modeMeta } from "@/lib/labels";
import type { DistributionView, WaveView } from "@/lib/mock/queries";
import type { Shift } from "@/lib/mock/types";
import { DEMO_NOW } from "@/lib/time";
import { cn } from "@/lib/utils";

function WaveIcon({ status }: { status: WaveView["status"] }) {
  if (status === "done") return <CheckCircle2 className="size-5 text-brand-600" />;
  if (status === "active") return <Loader2 className="size-5 animate-spin text-amber-500" />;
  return <Circle className="size-5 text-slate-300" />;
}

const waveStatusLabel: Record<WaveView["status"], string> = {
  done: "Concluída",
  active: "Em andamento",
  upcoming: "Aguardando",
  not_needed: "Não necessária",
};

export function WavesCard({ shift, dist }: { shift: Shift; dist: DistributionView }) {
  const pendingTotal = dist.waves.flatMap((w) => w.offers).filter((o) => o.state === "pending").length;
  const exhausted = shift.status === "offered" && pendingTotal === 0;
  const secondsLeft = dist.expiresAt ? Math.round((dist.expiresAt.getTime() - DEMO_NOW.getTime()) / 1000) : 0;

  return (
    <Card>
      <CardHeader
        title="Distribuição"
        description={`${modeMeta[dist.mode].label} · ${modeMeta[dist.mode].description}`}
        action={
          dist.mode === "waves" ? (
            <Badge tone={shift.type === "urgent" ? "red" : "neutral"}>
              <Timer /> {dist.timeoutMinutes} min por onda
            </Badge>
          ) : null
        }
      />
      <CardContent>
        {shift.status === "open" && (
          <p className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
            Distribuição programada para iniciar às 10:00. Abaixo, a fila calculada pelo motor de distribuição.
          </p>
        )}
        {exhausted && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">Nenhum profissional elegível restante</p>
            <p className="mt-1 text-sm text-red-700">
              Todas as ondas foram enviadas sem aceite. A equipe da clínica foi alertada por e-mail e WhatsApp.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <DemoButton size="sm" variant="secondary">Aumentar valor em 15%</DemoButton>
              <DemoButton size="sm" variant="secondary">Flexibilizar requisitos</DemoButton>
              <DemoButton size="sm" variant="secondary">Convite direto</DemoButton>
            </div>
          </div>
        )}

        <ol className="relative space-y-6">
          {dist.waves.map((w, i) => (
            <li key={w.wave} className="relative pl-8">
              {i < dist.waves.length - 1 && <span className="absolute top-6 bottom-[-1.5rem] left-[9px] w-px bg-slate-200" />}
              <span className="absolute top-0 left-0 bg-white">
                <WaveIcon status={w.status} />
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{w.label}</p>
                <span
                  className={cn(
                    "text-xs",
                    w.status === "active" ? "font-medium text-amber-700" : w.status === "done" ? "text-brand-700" : "text-slate-400",
                  )}
                >
                  {w.status === "active" && w.offers.length === 0 ? "Sem candidatos" : waveStatusLabel[w.status]}
                </span>
                {w.status === "active" && w.offers.length > 0 && dist.expiresAt && secondsLeft > 0 && (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                    <Timer className="size-3" /> expira em <Countdown seconds={secondsLeft} className="tabular" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{w.description}</p>

              {w.offers.length === 0 ? (
                <p className="mt-2 text-sm text-slate-400 italic">Nenhum profissional nesta onda.</p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {w.offers.map(({ candidate: c, state, at }) => (
                    <li key={c.vet.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5">
                      <Avatar name={c.vet.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1 truncate text-sm font-medium text-slate-900">
                          {c.vet.name}
                          {c.isFavorite && <Star className="size-3.5 fill-amber-400 text-amber-400" aria-label="Favorito" />}
                        </p>
                        <p className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                          <Rating value={c.vet.avgRating} className="text-xs" />
                          <span>score {formatDecimal(c.score, 1)}</span>
                          <span>{formatKm(c.distanceKm)}</span>
                          <span className="inline-flex items-center gap-0.5">
                            <MessageCircle className="size-3 text-whatsapp" /> WhatsApp
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {at && <span className="text-xs text-slate-400">{formatTime(at)}</span>}
                        <OfferStateBadge state={state} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
