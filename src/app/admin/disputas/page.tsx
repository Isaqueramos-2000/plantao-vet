import type { Metadata } from "next";
import { DemoButton } from "@/components/shared/demo-button";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatBRL, formatDateShort, formatDateTime } from "@/lib/format";
import { disputes } from "@/lib/mock/data";
import { breakdownFor, findShift, getOrg, getSpecialty, getVet, settlementOf } from "@/lib/mock/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Disputas · Admin" };

const statusMeta = {
  open: { label: "Aberta", tone: "red" },
  in_review: { label: "Em análise", tone: "amber" },
  resolved: { label: "Resolvida", tone: "green" },
} as const;

export default function DisputesPage() {
  return (
    <>
      <PageHeader
        title="Disputas"
        description="Contestações de fechamento. Enquanto abertas, a liberação do pagamento fica suspensa no gateway."
      />
      <div className="space-y-6">
        {disputes.map((d) => {
          const shift = findShift(d.shiftId)!;
          const vet = getVet(d.openedByVetId);
          const settlement = settlementOf(shift.id);
          const clinicView = breakdownFor(shift, settlement?.salesAmount ?? 0, settlement?.discounts ?? []);
          const vetView = breakdownFor(shift, d.claimedSalesAmount, []);
          const meta = statusMeta[d.status];
          return (
            <Card key={d.id}>
              <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-5">
                <Avatar name={vet.name} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">
                    {vet.name} × {getOrg(shift.orgId).name}
                  </p>
                  <p className="text-sm text-slate-500">
                    Plantão #{shift.code} · {getSpecialty(shift.specialtyId).short} · {formatDateShort(shift.startsAt)} · aberta em{" "}
                    {formatDateTime(d.openedAt)}
                  </p>
                </div>
                <Badge tone={meta.tone}>{meta.label}</Badge>
              </div>
              <CardContent className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">“{d.reason}”</p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-500">
                        <th className="py-1 font-medium" />
                        <th className="py-1 text-right font-medium">Clínica</th>
                        <th className="py-1 text-right font-medium">Plantonista</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        ["Vendas no plantão", settlement?.salesAmount ?? 0, d.claimedSalesAmount],
                        ["Comissão", clinicView.commissionAmount, vetView.commissionAmount],
                        ["Total ao plantonista", clinicView.vetNetAmount, vetView.vetNetAmount],
                      ].map(([label, a, b]) => (
                        <tr key={label as string}>
                          <td className="py-2 text-slate-600">{label}</td>
                          <td className="tabular py-2 text-right">{formatBRL(a as number)}</td>
                          <td className={cn("tabular py-2 text-right", a !== b && "font-semibold text-red-600")}>{formatBRL(b as number)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-slate-500">
                    Diferença em discussão: <b>{formatBRL(vetView.vetNetAmount - clinicView.vetNetAmount)}</b>
                  </p>
                  {d.status !== "resolved" && (
                    <div className="flex flex-wrap gap-2">
                      <DemoButton size="sm">A favor do plantonista</DemoButton>
                      <DemoButton size="sm" variant="secondary">A favor da clínica</DemoButton>
                      <DemoButton size="sm" variant="secondary">Acordo parcial</DemoButton>
                    </div>
                  )}
                </div>
                <ol className="space-y-3">
                  {d.messages.map((m, i) => (
                    <li key={i} className={cn("rounded-lg p-3 text-sm", m.from === "admin" ? "bg-slate-900 text-white" : m.from === "vet" ? "bg-brand-50" : "bg-slate-50")}>
                      <p className={cn("text-xs font-medium", m.from === "admin" ? "text-slate-300" : "text-slate-500")}>
                        {m.author} · {formatDateTime(m.at)}
                      </p>
                      <p className="mt-1">{m.text}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
