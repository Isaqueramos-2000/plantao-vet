import type { Metadata } from "next";
import { VerificationQueue } from "@/components/admin/verification-queue";
import { PageHeader } from "@/components/shared/page-header";
import { formatDateTime } from "@/lib/format";
import { verificationRequests } from "@/lib/mock/data";

export const metadata: Metadata = { title: "Verificações · Admin" };

export default function VerificationsPage() {
  const items = verificationRequests
    .filter((v) => v.status === "pending")
    .map((v) => ({
      id: v.id,
      name: v.name,
      cpf: v.cpfMasked,
      crmv: v.crmvNumber,
      uf: v.crmvUf,
      specialties: v.specialties,
      submitted: formatDateTime(v.submittedAt),
      flags: v.flags,
      documents: v.documents.map((d) => ({ label: d.label, fileName: d.fileName })),
    }));
  return (
    <>
      <PageHeader
        title="Verificação de CRMV"
        description="Checagem manual na Fase 1: documento enviado + consulta pública ao conselho. O selo “verificado” libera o recebimento de vagas."
      />
      <VerificationQueue items={items} />
    </>
  );
}
