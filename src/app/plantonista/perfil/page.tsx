import { BadgeCheck, Building, ChevronRight, Download, FileCheck2, Link2, LogOut, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DemoButton } from "@/components/shared/demo-button";
import { Rating } from "@/components/shared/rating";
import { CrmvBadge } from "@/components/shared/status";
import { AppHeader } from "@/components/shell/phone-shell";
import { Preferences } from "@/components/vet/preferences";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatPct } from "@/lib/format";
import { currentVet, getSpecialty } from "@/lib/mock/queries";

export const metadata: Metadata = { title: "Perfil" };

const DOCUMENTS = [
  { label: "Carteira CRMV-SP", status: "Verificado" },
  { label: "Diploma de graduação", status: "Verificado" },
  { label: "Residência em emergência e terapia intensiva", status: "Verificado" },
  { label: "Certificado em anestesiologia", status: "Em análise" },
];

export default function ProfilePage() {
  const vet = currentVet();
  const attendance = (vet.completedShifts / (vet.completedShifts + vet.noShows)) * 100;
  const clinics = Object.keys(vet.historyByOrg).length;

  return (
    <>
      <AppHeader title="Perfil" />
      <div className="space-y-5 p-4">
        <div className="flex flex-col items-center text-center">
          <Avatar name={vet.name} size="xl" />
          <p className="mt-3 text-lg font-semibold text-slate-900">{vet.name}</p>
          <p className="text-sm text-slate-500">
            CRMV-{vet.crmvUf} {vet.crmvNumber} · {vet.baseLabel}
          </p>
          <div className="mt-2">
            <CrmvBadge status={vet.crmvStatus} />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 rounded-2xl bg-white p-3 text-center ring-1 ring-slate-200">
          <div>
            <Rating value={vet.avgRating} className="justify-center" />
            <p className="text-[11px] text-slate-500">{vet.reviewsCount} aval.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{vet.completedShifts}</p>
            <p className="text-[11px] text-slate-500">plantões</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{formatPct(attendance, 1)}</p>
            <p className="text-[11px] text-slate-500">presença</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{clinics}</p>
            <p className="text-[11px] text-slate-500">clínicas</p>
          </div>
        </div>

        <Link href={`/p/${vet.slug}`} className="flex items-center gap-3 rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-200">
          <Link2 className="size-5 text-brand-700" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-brand-900">Seu currículo verificado</p>
            <p className="truncate text-xs text-brand-700">plantaovet.app/p/{vet.slug}</p>
          </div>
          <ChevronRight className="size-4 text-brand-600" />
        </Link>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Especialidades</h2>
          <div className="flex flex-wrap gap-1.5">
            {vet.specialtyIds.map((id, i) => (
              <Badge key={id} tone={i < 2 ? "brand" : "neutral"}>
                {i < 2 && <BadgeCheck />}
                {getSpecialty(id).short}
                {i >= 2 && " · em análise"}
              </Badge>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Preferências</h2>
          <Preferences radiusKm={vet.radiusKm} minRestHours={vet.minRestHours} maxWeeklyHours={vet.maxWeeklyHours} />
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Documentos</h2>
          <ul className="divide-y divide-slate-100 rounded-2xl bg-white ring-1 ring-slate-200">
            {DOCUMENTS.map((d) => (
              <li key={d.label} className="flex items-center gap-3 p-3">
                <FileCheck2 className="size-4 text-slate-400" />
                <span className="flex-1 text-sm text-slate-800">{d.label}</span>
                <Badge tone={d.status === "Verificado" ? "brand" : "amber"}>{d.status}</Badge>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Dados PJ e recebimento</h2>
          <div className="space-y-2 rounded-2xl bg-white p-4 text-sm ring-1 ring-slate-200">
            <p className="flex items-center gap-2 text-slate-800">
              <Building className="size-4 text-slate-400" /> CNPJ 45.***.***/0001-** · Simples Nacional
            </p>
            <p className="text-slate-500">Conta de recebimento: Banco ••• ag. 0001 · conta ••••-7 (subconta no gateway)</p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Privacidade (LGPD)</h2>
          <div className="grid grid-cols-2 gap-2">
            <DemoButton variant="secondary" size="sm" toastTitle="Exportar meus dados" toastDescription="Gera um arquivo com todos os seus dados pessoais (direito do titular).">
              <Download /> Exportar dados
            </DemoButton>
            <DemoButton variant="danger-outline" size="sm" toastTitle="Excluir conta" toastDescription="Exclui a conta e anonimiza o histórico financeiro exigido por lei.">
              <Trash2 /> Excluir conta
            </DemoButton>
          </div>
        </section>

        <Link href="/entrar" className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-500">
          <LogOut className="size-4" /> Sair
        </Link>
      </div>
    </>
  );
}
