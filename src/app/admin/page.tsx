import { AlertTriangle, ArrowRight, Building2, CheckCircle2, Clock, DollarSign, Stethoscope } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BarChart } from "@/components/charts/bar-chart";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDateTime } from "@/lib/format";
import { verificationRequests } from "@/lib/mock/data";
import { findShift, getVet, openDisputes } from "@/lib/mock/queries";

export const metadata: Metadata = { title: "Visão geral · Admin" };

const pilot = [
  { label: "Clínicas ativas", value: 18, target: 3, display: "18 / meta 3" },
  { label: "Vets verificados", value: 342, target: 30, display: "342 / meta 30" },
  { label: "Tempo médio p/ preencher urgente", value: 21, target: 30, display: "21 min / meta < 30", inverse: true },
  { label: "Taxa de preenchimento", value: 93.8, target: 90, display: "93,8% / meta > 90%" },
  { label: "Clínicas convertidas para pago (60 dias)", value: 61, target: 50, display: "61% / meta ≥ 50%" },
];

const weekly = [
  { label: "S-7", value: 212 },
  { label: "S-6", value: 236 },
  { label: "S-5", value: 251 },
  { label: "S-4", value: 248 },
  { label: "S-3", value: 274 },
  { label: "S-2", value: 289 },
  { label: "S-1", value: 301 },
  { label: "Atual", value: 318, highlight: true },
];

export default function AdminHome() {
  const pending = verificationRequests.filter((v) => v.status === "pending");
  const disputes = openDisputes();
  return (
    <>
      <PageHeader title="Visão geral da plataforma" description="Métricas do piloto, filas operacionais e alertas." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Vagas preenchidas (30d)" value="1.204" icon={CheckCircle2} trend={{ value: "+12%", positive: true }} hint="vs. mês anterior" />
        <StatCard label="GMV (30d)" value="R$ 1,48 mi" icon={DollarSign} trend={{ value: "+9%", positive: true }} hint="via split" />
        <StatCard label="Receita da plataforma" value="R$ 118 mil" icon={Building2} hint="taxa média 8%" />
        <StatCard label="Profissionais verificados" value="342" icon={Stethoscope} hint={`${pending.length} na fila`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Métricas de sucesso do piloto" description="Seção 10 do plano de produto" />
            <CardContent className="space-y-4">
              {pilot.map((m) => {
                const ok = m.inverse ? m.value <= m.target : m.value >= m.target;
                return (
                  <div key={m.label}>
                    <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                      <span className="text-slate-700">{m.label}</span>
                      <span className="flex items-center gap-2">
                        <span className="tabular text-slate-500">{m.display}</span>
                        <Badge tone={ok ? "green" : "amber"}>{ok ? "Atingida" : "Em curso"}</Badge>
                      </span>
                    </div>
                    <Progress value={(m.inverse ? m.target / Math.max(m.value, 1) : m.value / m.target) * 100} barClassName={ok ? "bg-emerald-500" : "bg-amber-500"} />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Plantões preenchidos por semana" />
            <CardContent>
              <BarChart data={weekly} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Fila de verificação"
              action={<Badge tone="amber">{pending.length}</Badge>}
            />
            <CardContent className="space-y-3">
              {pending.map((v) => (
                <div key={v.id} className="flex items-center gap-3">
                  <Avatar name={v.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{v.name}</p>
                    <p className="text-xs text-slate-500">
                      CRMV-{v.crmvUf} {v.crmvNumber} · {formatDateTime(v.submittedAt)}
                    </p>
                  </div>
                  {v.flags.length > 0 && <AlertTriangle className="size-4 text-amber-500" />}
                </div>
              ))}
              <Link href="/admin/verificacoes" className="flex items-center gap-1 pt-1 text-sm font-medium text-brand-700">
                Revisar fila <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Alertas" />
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
                <p className="text-slate-700">
                  Vaga #{findShift("shf_1052")?.code} (Aurora Santo André) sem elegíveis restantes após 3 ondas.
                </p>
              </div>
              {disputes.map((d) => (
                <div key={d.id} className="flex gap-2">
                  <Clock className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  <p className="text-slate-700">
                    Disputa de {getVet(d.openedByVetId).name} aberta há 6 dias — prazo de análise vencendo.{" "}
                    <Link href="/admin/disputas" className="font-medium text-brand-700">
                      Abrir
                    </Link>
                  </p>
                </div>
              ))}
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                <p className="text-slate-700">Thiago Ramalho: 4 no-shows nos últimos 90 dias — revisar conta.</p>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                <p className="text-slate-700">WhatsApp Cloud API: 99,7% das mensagens entregues (24h).</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
