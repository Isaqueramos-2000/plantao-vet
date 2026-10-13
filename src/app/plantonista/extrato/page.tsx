import { FileText, Receipt } from "lucide-react";
import type { Metadata } from "next";
import { DemoButton } from "@/components/shared/demo-button";
import { AppHeader } from "@/components/shell/phone-shell";
import { StatementList, type StatementDTO } from "@/components/vet/statement-list";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDateFull, formatDateShort, formatPct } from "@/lib/format";
import { getSpecialty, vetStatement } from "@/lib/mock/queries";

export const metadata: Metadata = { title: "Extrato" };

export default function StatementPage() {
  const entries = vetStatement();
  const total = (f: (s: (typeof entries)[number]["status"]) => boolean) =>
    entries.filter((e) => f(e.status)).reduce((s, e) => s + e.breakdown.vetNetAmount, 0);
  const received = total((s) => s === "paid");
  const toReceive = total((s) => s === "approved" || s === "pending" || s === "disputed");
  const expected = total((s) => s === "expected");
  const all = received + toReceive + expected;

  const byClinic = new Map<string, number>();
  for (const e of entries) byClinic.set(e.org.name, (byClinic.get(e.org.name) ?? 0) + e.breakdown.vetNetAmount);

  const items: StatementDTO[] = entries.map((e) => ({
    id: e.shift.id,
    code: e.shift.code,
    clinic: e.org.name,
    unit: e.unit.name,
    date: formatDateShort(e.shift.startsAt),
    specialty: getSpecialty(e.shift.specialtyId).short,
    status: e.status,
    isEstimate: e.isEstimate,
    net: formatBRL(e.breakdown.vetNetAmount),
    lines: [
      { label: "Fixo", value: formatBRL(e.breakdown.fixedAmount) },
      {
        label: `Comissão (${formatPct(e.shift.commissionPct)} das vendas${e.isEstimate ? ", estimada" : ""})`,
        value: formatBRL(e.breakdown.commissionAmount),
      },
      ...e.shift.extras.map((x) => ({ label: x.label, value: formatBRL(x.amount) })),
      ...(e.breakdown.discountsAmount ? [{ label: "Descontos", value: `−${formatBRL(e.breakdown.discountsAmount)}` }] : []),
      { label: "Taxa da plataforma", value: "paga pela clínica" },
    ],
    note:
      e.status === "paid" && e.paidAt
        ? `Pago em ${formatDateFull(e.paidAt)} via split do gateway.`
        : e.status === "approved" && e.releaseAt
          ? `Fechamento aprovado. Liberação prevista para ${formatDateFull(e.releaseAt)}.`
          : e.status === "pending"
            ? "Aguardando a clínica informar as vendas do plantão (prazo: 48h)."
            : e.status === "expected"
              ? "Previsto: fixo garantido + comissão estimada pela média da clínica."
              : undefined,
  }));

  return (
    <>
      <AppHeader title="Extrato" subtitle="Previsto × recebido, por plantão" />
      <div className="space-y-5 p-4">
        <div className="rounded-2xl bg-slate-900 p-4 text-white">
          <p className="text-xs text-slate-400">Recebido · últimos 15 dias</p>
          <p className="tabular mt-1 text-3xl font-semibold">{formatBRL(received)}</p>
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-700">
            <div className="bg-brand-400" style={{ width: `${(received / all) * 100}%` }} />
            <div className="bg-sky-400" style={{ width: `${(toReceive / all) * 100}%` }} />
            <div className="bg-slate-500" style={{ width: `${(expected / all) * 100}%` }} />
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div>
              <dt className="flex items-center gap-1 text-slate-400">
                <span className="size-2 rounded-full bg-brand-400" /> Recebido
              </dt>
              <dd className="tabular mt-0.5 font-medium">{formatBRL(received, { cents: false })}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-slate-400">
                <span className="size-2 rounded-full bg-sky-400" /> A receber
              </dt>
              <dd className="tabular mt-0.5 font-medium">{formatBRL(toReceive, { cents: false })}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-slate-400">
                <span className="size-2 rounded-full bg-slate-500" /> Previsto
              </dt>
              <dd className="tabular mt-0.5 font-medium">{formatBRL(expected, { cents: false })}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-slate-900">Por clínica</p>
          <div className="mt-3 space-y-2.5">
            {[...byClinic.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([name, value]) => (
                <div key={name}>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">{name}</span>
                    <span className="tabular font-medium text-slate-900">{formatBRL(value, { cents: false })}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${(value / all) * 100}%` }} />
                  </div>
                </div>
              ))}
          </div>
        </div>

        <StatementList items={items} />

        <div className="grid grid-cols-2 gap-3">
          <DemoButton variant="secondary" className="h-auto flex-col items-start gap-1 rounded-2xl p-4 text-left whitespace-normal" toastTitle="NFS-e" toastDescription="Emissão de nota por plantão ou consolidada no mês — Fase 3.">
            <Receipt className="text-slate-500" />
            <span className="text-sm font-semibold text-slate-900">Emitir NFS-e</span>
            <Badge tone="violet">Fase 3</Badge>
          </DemoButton>
          <DemoButton variant="secondary" className="h-auto flex-col items-start gap-1 rounded-2xl p-4 text-left whitespace-normal" toastTitle="Relatório para o contador" toastDescription="Exportação mensal com plantões, notas e impostos estimados — Fase 3.">
            <FileText className="text-slate-500" />
            <span className="text-sm font-semibold text-slate-900">Relatório p/ contador</span>
            <Badge tone="violet">Fase 3</Badge>
          </DemoButton>
        </div>
      </div>
    </>
  );
}
