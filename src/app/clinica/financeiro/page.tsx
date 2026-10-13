import { AlertCircle, ArrowRight, CheckCircle2, Clock, ShieldCheck, Upload, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ClosingPanel, type ClosingItem } from "@/components/clinic/closing-panel";
import { DemoButton } from "@/components/shared/demo-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { SettlementStatusBadge } from "@/components/shared/status";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatBRL, formatDateShort, formatRelativeDay, formatTimeRange } from "@/lib/format";
import { disputes } from "@/lib/mock/data";
import { currentOrg, findShift, getSpecialty, getUnit, getVet, orgSettlements } from "@/lib/mock/queries";

export const metadata: Metadata = { title: "Financeiro" };

export default function FinancePage() {
  const org = currentOrg();
  const rows = orgSettlements();
  const sum = (filter: (r: (typeof rows)[number]) => boolean) =>
    rows.filter(filter).reduce((s, r) => s + r.breakdown.clinicTotalAmount, 0);

  const pending = rows.filter((r) => r.settlement.status === "pending");
  const closingItems: ClosingItem[] = pending.map(({ shift }) => ({
    shiftId: shift.id,
    code: shift.code,
    title: `${getSpecialty(shift.specialtyId).short} · ${getUnit(shift.unitId).name}`,
    subtitle: `${formatRelativeDay(shift.startsAt)}, ${formatTimeRange(shift.startsAt, shift.endsAt)}`,
    vetName: getVet(shift.assignedVetId!).name,
    fixedAmount: shift.fixedAmount,
    commissionPct: shift.commissionPct,
    extras: shift.extras,
    platformFeePct: org.platformFeePct,
    suggestedSales: shift.id === "shf_1039" ? 712_350 : 486_000,
  }));
  const orgDisputes = disputes.filter((d) => findShift(d.shiftId)?.orgId === org.id && d.status !== "resolved");

  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Fechamento dos plantões (fixo + comissão sobre vendas + adicionais), pagamentos e disputas."
        actions={
          <>
            <DemoButton variant="secondary" toastTitle="Importar vendas (CSV)" toastDescription="Importação de vendas por planilha prevista para a Fase 2; integração com sistemas de gestão veterinária na Fase 3.">
              <Upload /> Importar vendas
            </DemoButton>
            <DemoButton variant="secondary">Exportar relatório</DemoButton>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Custo no período" value={formatBRL(sum(() => true), { cents: false })} icon={Wallet} hint="últimos 15 dias" />
        <StatCard label="Aguardando fechamento" value={formatBRL(sum((r) => r.settlement.status === "pending"), { cents: false })} icon={Clock} hint={`${pending.length} plantões · estimado`} />
        <StatCard label="Em disputa" value={formatBRL(sum((r) => r.settlement.status === "disputed"), { cents: false })} icon={AlertCircle} hint="liberação suspensa" />
        <StatCard label="Pago" value={formatBRL(sum((r) => r.settlement.status === "paid"), { cents: false })} icon={CheckCircle2} hint="via split do gateway" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader
              title="Fechamentos pendentes"
              description="Informe as vendas realizadas no plantão. O cálculo usa as mesmas regras do motor financeiro."
            />
            <CardContent>
              <ClosingPanel items={closingItems} />
            </CardContent>
          </Card>

        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Disputas abertas" action={<Badge tone="red">{orgDisputes.length}</Badge>} />
            <CardContent className="space-y-4">
              {orgDisputes.map((d) => {
                const shift = findShift(d.shiftId)!;
                const vet = getVet(d.openedByVetId);
                return (
                  <div key={d.id} className="rounded-lg border border-red-200 bg-red-50/40 p-4">
                    <div className="flex items-center gap-2">
                      <Avatar name={vet.name} size="xs" />
                      <p className="text-sm font-medium text-slate-900">{vet.name}</p>
                      <span className="ml-auto text-xs text-slate-500">#{shift.code}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">“{d.reason}”</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Vendas informadas {formatBRL(rows.find((r) => r.shift.id === shift.id)?.settlement.salesAmount ?? 0)} · reivindicado{" "}
                      {formatBRL(d.claimedSalesAmount)}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <DemoButton size="sm" variant="secondary">Responder</DemoButton>
                      <DemoButton size="sm" variant="secondary">Corrigir vendas</DemoButton>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white">
            <CardContent className="space-y-3">
              <ShieldCheck className="size-6 text-brand-300" />
              <p className="font-semibold">Pagamento garantido, sem custódia</p>
              <p className="text-sm text-slate-300">
                O valor fixo é autorizado no gateway quando a vaga é confirmada. Após o check-out e o fechamento, o repasse é
                liberado via split direto ao plantonista. A plataforma nunca custodia valores.
              </p>
              <p className="text-xs text-slate-400">Gateway em avaliação: Asaas · Pagar.me · Iugu</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Próximo passo: assinatura" />
            <CardContent className="text-sm text-slate-600">
              <p>
                Taxa atual da plataforma: <b className="text-slate-900">{org.platformFeePct}% por plantão preenchido</b>.
              </p>
              <Link href="/clinica/configuracoes" className="mt-3 inline-flex items-center gap-1 font-medium text-brand-700 hover:text-brand-800">
                Ver configurações <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
            <CardHeader title="Histórico de fechamentos" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-slate-200 bg-slate-50 text-left text-xs font-medium tracking-wide text-slate-500 uppercase">
                    <th className="px-4 py-2.5">Plantão</th>
                    <th className="px-4 py-2.5">Profissional</th>
                    <th className="px-4 py-2.5 text-right">Vendas</th>
                    <th className="px-4 py-2.5 text-right">Plantonista</th>
                    <th className="px-4 py-2.5 text-right">Taxa</th>
                    <th className="px-4 py-2.5 text-right">Total</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map(({ shift, settlement, breakdown, isEstimate }) => (
                    <tr key={shift.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link href={`/clinica/vagas/${shift.id}`} className="font-medium text-slate-900 hover:text-brand-700">
                          #{shift.code}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {formatDateShort(shift.startsAt)} · {getSpecialty(shift.specialtyId).short}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 whitespace-nowrap">
                          <Avatar name={getVet(shift.assignedVetId!).name} size="xs" />
                          {getVet(shift.assignedVetId!).name}
                        </span>
                      </td>
                      <td className="tabular px-4 py-3 text-right whitespace-nowrap">
                        {settlement.salesAmount === null ? <span className="text-slate-400">—</span> : formatBRL(settlement.salesAmount)}
                      </td>
                      <td className="tabular px-4 py-3 text-right whitespace-nowrap">
                        {formatBRL(breakdown.vetNetAmount)}
                        {isEstimate && <span className="text-slate-400">*</span>}
                      </td>
                      <td className="tabular px-4 py-3 text-right whitespace-nowrap text-slate-500">{formatBRL(breakdown.platformFee)}</td>
                      <td className="tabular px-4 py-3 text-right font-medium whitespace-nowrap">{formatBRL(breakdown.clinicTotalAmount)}</td>
                      <td className="px-4 py-3">
                        <SettlementStatusBadge status={settlement.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="px-4 py-3 text-xs text-slate-400">* Estimativa até a clínica informar as vendas.</p>
          </Card>
    </>
  );
}
