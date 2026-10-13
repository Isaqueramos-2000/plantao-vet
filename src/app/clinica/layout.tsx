import type { Metadata } from "next";
import { AppShell } from "@/components/shell/app-shell";
import { currentOrg, orgSettlements, orgUnits } from "@/lib/mock/queries";

export const metadata: Metadata = { title: "Painel da clínica" };

export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  const org = currentOrg();
  const pending = orgSettlements().filter((r) => r.settlement.status === "pending").length;
  return (
    <AppShell
      section="clinic"
      orgName={org.name}
      orgSubtitle={`${orgUnits().length} unidades · São Paulo`}
      user={{ name: "Ricardo Tavares", role: "Coordenador de escala" }}
      badges={{ "/clinica/financeiro": pending }}
    >
      {children}
    </AppShell>
  );
}
