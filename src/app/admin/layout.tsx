import type { Metadata } from "next";
import { AppShell } from "@/components/shell/app-shell";
import { verificationRequests } from "@/lib/mock/data";
import { openDisputes } from "@/lib/mock/queries";

export const metadata: Metadata = { title: "Admin da plataforma" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      section="admin"
      orgName="Operações PlantãoVet"
      orgSubtitle="Região piloto · Grande São Paulo"
      user={{ name: "Ana Ribeiro", role: "Verificação e suporte" }}
      badges={{
        "/admin/verificacoes": verificationRequests.filter((v) => v.status === "pending").length,
        "/admin/disputas": openDisputes().length,
      }}
    >
      {children}
    </AppShell>
  );
}
