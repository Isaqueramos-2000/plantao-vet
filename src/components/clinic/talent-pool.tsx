"use client";

import { Ban, Copy, ExternalLink, MessageCircle, Search, Star, UserPlus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Rating } from "@/components/shared/rating";
import { CrmvBadge } from "@/components/shared/status";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import type { CrmvStatus } from "@/lib/core";
import { cn } from "@/lib/utils";

export interface PoolVet {
  id: string;
  slug: string;
  name: string;
  crmv: string;
  crmvStatus: CrmvStatus;
  specialties: string[];
  rating: number | null;
  reviews: number;
  withClinic: number;
  attendance: string;
  distance: string;
  score: string;
  baseLabel: string;
}

type Tab = "favorites" | "all" | "blocked";

export function TalentPool({
  vets,
  initialFavorites,
  initialBlocked,
  inviteUrl,
}: {
  vets: PoolVet[];
  initialFavorites: string[];
  initialBlocked: string[];
  inviteUrl: string;
}) {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("favorites");
  const [favorites, setFavorites] = useState(initialFavorites);
  const [blocked, setBlocked] = useState(initialBlocked);
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vets
      .filter((v) =>
        tab === "favorites" ? favorites.includes(v.id) : tab === "blocked" ? blocked.includes(v.id) : !blocked.includes(v.id),
      )
      .filter((v) => !q || `${v.name} ${v.specialties.join(" ")} ${v.crmv}`.toLowerCase().includes(q));
  }, [vets, tab, favorites, blocked, query]);

  const toggleFavorite = (id: string) => {
    const on = !favorites.includes(id);
    setFavorites((f) => (on ? [...f, id] : f.filter((x) => x !== id)));
    toast({ tone: "success", title: on ? "Adicionado aos favoritos" : "Removido dos favoritos", description: on ? "Passa a receber as vagas na onda 1." : undefined });
  };
  const toggleBlocked = (id: string) => {
    const on = !blocked.includes(id);
    setBlocked((b) => (on ? [...b, id] : b.filter((x) => x !== id)));
    if (on) setFavorites((f) => f.filter((x) => x !== id));
    toast({ title: on ? "Profissional bloqueado" : "Profissional desbloqueado", description: on ? "Não receberá vagas desta clínica. Ação registrada na auditoria." : undefined });
  };

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "favorites", label: "Favoritos", count: favorites.length },
    { id: "all", label: "Todos os profissionais", count: vets.length - blocked.length },
    { id: "blocked", label: "Bloqueados", count: blocked.length },
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col gap-4 bg-gradient-to-r from-brand-50 to-white md:flex-row md:items-center">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <UserPlus className="size-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Convide profissionais para o seu banco de reserva</p>
            <p className="text-sm text-slate-600">
              Quem entrar pelo link é adicionado aos seus favoritos após a verificação do CRMV.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <code className="flex h-10 items-center rounded-lg bg-white px-3 text-sm text-slate-700 ring-1 ring-slate-200">{inviteUrl}</code>
            <Button
              variant="secondary"
              onClick={() => {
                void navigator.clipboard?.writeText(`https://${inviteUrl}`).catch(() => {});
                toast({ tone: "success", title: "Link copiado" });
              }}
            >
              <Copy /> Copiar
            </Button>
            <Button variant="whatsapp" onClick={() => toast({ title: "Compartilhar no WhatsApp", description: "Na versão final abre o WhatsApp com a mensagem de convite pronta." })}>
              <MessageCircle /> Enviar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap",
                tab === t.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {t.label} <span className={cn("text-xs", tab === t.id ? "text-slate-300" : "text-slate-400")}>{t.count}</span>
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nome, especialidade ou CRMV" className="pl-9" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((v) => {
          const fav = favorites.includes(v.id);
          const isBlocked = blocked.includes(v.id);
          return (
            <Card key={v.id} className={cn("flex flex-col", isBlocked && "opacity-75")}>
              <CardContent className="flex-1 space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar name={v.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{v.name}</p>
                    <p className="text-xs text-slate-500">
                      {v.crmv} · {v.baseLabel}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <CrmvBadge status={v.crmvStatus} compact />
                      {fav && (
                        <Badge tone="amber">
                          <Star className="fill-current" /> Favorito
                        </Badge>
                      )}
                    </div>
                  </div>
                  {!isBlocked && (
                    <button
                      type="button"
                      onClick={() => toggleFavorite(v.id)}
                      className="rounded-lg p-1.5 hover:bg-slate-100"
                      aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    >
                      <Star className={cn("size-5", fav ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {v.specialties.map((s) => (
                    <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {s}
                    </span>
                  ))}
                </div>
                <dl className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <dd className="text-sm font-semibold">
                      <Rating value={v.rating} className="text-sm" />
                    </dd>
                    <dt className="text-[11px] text-slate-500">{v.reviews} aval.</dt>
                  </div>
                  <div>
                    <dd className="text-sm font-semibold text-slate-900">{v.withClinic}</dd>
                    <dt className="text-[11px] text-slate-500">aqui</dt>
                  </div>
                  <div>
                    <dd className="text-sm font-semibold text-slate-900">{v.attendance}</dd>
                    <dt className="text-[11px] text-slate-500">presença</dt>
                  </div>
                  <div>
                    <dd className="text-sm font-semibold text-slate-900">{v.score}</dd>
                    <dt className="text-[11px] text-slate-500">score</dt>
                  </div>
                </dl>
              </CardContent>
              <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3">
                <span className="text-xs text-slate-500">{v.distance} da unid. Pinheiros</span>
                <Link href={`/p/${v.slug}`} className="ml-auto rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Perfil público">
                  <ExternalLink className="size-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => toggleBlocked(v.id)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
                    isBlocked ? "text-slate-700 hover:bg-slate-100" : "text-red-600 hover:bg-red-50",
                  )}
                >
                  <Ban className="size-3.5" /> {isBlocked ? "Desbloquear" : "Bloquear"}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
      {list.length === 0 && <p className="py-10 text-center text-sm text-slate-500">Nenhum profissional nesta lista.</p>}
    </div>
  );
}
