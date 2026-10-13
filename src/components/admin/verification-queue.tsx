"use client";

import { AlertTriangle, Check, ExternalLink, FileText, Search, X } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export interface VerificationDTO {
  id: string;
  name: string;
  cpf: string;
  crmv: string;
  uf: string;
  specialties: string[];
  submitted: string;
  flags: string[];
  documents: { label: string; fileName: string }[];
}

export function VerificationQueue({ items }: { items: VerificationDTO[] }) {
  const toast = useToast();
  const [queue, setQueue] = useState(items);
  const [selectedId, setSelectedId] = useState(items[0]?.id);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const selected = queue.find((i) => i.id === selectedId) ?? queue[0];

  function resolve(action: "approve" | "reject" | "resend") {
    if (!selected) return;
    const rest = queue.filter((q) => q.id !== selected.id);
    setQueue(rest);
    setSelectedId(rest[0]?.id);
    setChecks({});
    toast({
      tone: action === "approve" ? "success" : "info",
      title:
        action === "approve" ? `CRMV de ${selected.name} aprovado` : action === "reject" ? `Cadastro de ${selected.name} rejeitado` : "Reenvio solicitado",
      description: "Simulação — ação registrada na auditoria e notificada pelo WhatsApp.",
    });
  }

  if (!selected) {
    return (
      <Card className="p-12 text-center">
        <Check className="mx-auto size-10 text-brand-500" />
        <p className="mt-3 font-semibold text-slate-900">Fila zerada!</p>
        <p className="text-sm text-slate-500">Nenhum cadastro aguardando verificação. (Recarregue a página para restaurar a demo.)</p>
      </Card>
    );
  }

  const checklist = [
    "Nome e CPF conferem com o documento",
    `Inscrição ativa na consulta pública do CRMV-${selected.uf}`,
    "Habilitado para atuar em SP (inscrição principal ou secundária)",
    "Especializações comprovadas por certificado",
  ];
  const allChecked = checklist.every((c) => checks[c]);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card className="divide-y divide-slate-100 self-start">
        {queue.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => {
              setSelectedId(v.id);
              setChecks({});
            }}
            className={cn("flex w-full items-center gap-3 p-3 text-left", v.id === selected.id ? "bg-brand-50/60" : "hover:bg-slate-50")}
          >
            <Avatar name={v.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{v.name}</p>
              <p className="text-xs text-slate-500">
                CRMV-{v.uf} {v.crmv} · {v.submitted}
              </p>
            </div>
            {v.flags.length > 0 && <AlertTriangle className="size-4 text-amber-500" />}
          </button>
        ))}
      </Card>

      <Card>
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 p-5">
          <Avatar name={selected.name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-slate-900">{selected.name}</p>
            <p className="text-sm text-slate-500">
              CPF {selected.cpf} · CRMV-{selected.uf} {selected.crmv} · enviado {selected.submitted}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {selected.specialties.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
          </div>
          <Badge tone="amber">Pendente</Badge>
        </div>

        <div className="space-y-6 p-5">
          {selected.flags.length > 0 && (
            <div className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-3">
              {selected.flags.map((f) => (
                <p key={f} className="flex items-center gap-2 text-sm text-amber-900">
                  <AlertTriangle className="size-4" /> {f}
                </p>
              ))}
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-900">Documentos</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {selected.documents.map((d) => (
                <button
                  key={d.fileName}
                  type="button"
                  onClick={() => toast({ title: d.fileName, description: "Documentos ficam em bucket privado e abrem por URL assinada temporária." })}
                  className="group rounded-lg border border-slate-200 p-3 text-left hover:border-slate-300"
                >
                  <div className="flex h-24 items-center justify-center rounded-md bg-gradient-to-br from-slate-100 to-slate-50">
                    <FileText className="size-8 text-slate-300 group-hover:text-slate-400" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-800">{d.label}</p>
                  <p className="truncate text-xs text-slate-500">{d.fileName}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Checklist de verificação</p>
              <button
                type="button"
                onClick={() => toast({ title: "Consulta pública", description: `Abriria a consulta de inscritos do CRMV-${selected.uf} em nova aba.` })}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-700"
              >
                <Search className="size-3.5" /> Consultar CRMV-{selected.uf} <ExternalLink className="size-3" />
              </button>
            </div>
            <ul className="space-y-2">
              {checklist.map((c) => (
                <li key={c}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={!!checks[c]}
                      onChange={(e) => setChecks((all) => ({ ...all, [c]: e.target.checked }))}
                      className="size-4 accent-brand-600"
                    />
                    <span className="text-sm text-slate-700">{c}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-900">Observação interna</p>
            <Textarea placeholder="Visível apenas para a equipe. Ex.: inscrição conferida em 13/10." />
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
            <Button variant="danger-outline" onClick={() => resolve("reject")}>
              <X /> Rejeitar
            </Button>
            <Button variant="secondary" onClick={() => resolve("resend")}>
              Solicitar reenvio
            </Button>
            <Button onClick={() => resolve("approve")} disabled={!allChecked} title={allChecked ? undefined : "Marque todos os itens do checklist"}>
              <Check /> Aprovar CRMV
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
