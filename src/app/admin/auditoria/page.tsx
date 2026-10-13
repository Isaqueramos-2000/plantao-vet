import { Download } from "lucide-react";
import type { Metadata } from "next";
import { DemoButton } from "@/components/shared/demo-button";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { auditLog } from "@/lib/mock/data";

export const metadata: Metadata = { title: "Auditoria · Admin" };

export default function AuditPage() {
  const entries = [...auditLog].sort((a, b) => b.at.getTime() - a.at.getTime());
  return (
    <>
      <PageHeader
        title="Auditoria"
        description="Registro imutável de ações sensíveis: aprovação de CRMV, alteração de valores, bloqueios e resolução de disputas."
        actions={
          <DemoButton variant="secondary">
            <Download /> Exportar
          </DemoButton>
        }
      />
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium tracking-wide text-slate-500 uppercase">
              <th className="px-4 py-3">Quando</th>
              <th className="px-4 py-3">Quem</th>
              <th className="px-4 py-3">Ação</th>
              <th className="px-4 py-3">Entidade</th>
              <th className="px-4 py-3">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="tabular px-4 py-3 whitespace-nowrap text-slate-500">{formatDateTime(e.at)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-900">{e.actor}</td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">{e.action}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-700">{e.entity}</td>
                <td className="px-4 py-3 text-slate-500">{e.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
