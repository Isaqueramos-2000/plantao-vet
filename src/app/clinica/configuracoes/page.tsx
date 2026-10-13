import { Building2, MapPin, Plus } from "lucide-react";
import type { Metadata } from "next";
import { PolicySettings, type PreviewCandidate } from "@/components/clinic/policy-settings";
import { DemoButton } from "@/components/shared/demo-button";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { roleLabels } from "@/lib/labels";
import { teamMembers } from "@/lib/mock/data";
import { currentOrg, evaluateCandidates, findShift, orgUnits } from "@/lib/mock/queries";

export const metadata: Metadata = { title: "Configurações" };

export default function SettingsPage() {
  const org = currentOrg();
  const p = org.policy;
  const reference = findShift("shf_1042")!;
  const candidates: PreviewCandidate[] = evaluateCandidates(reference)
    .filter((c) => c.eligible || c.reasons.every((r) => r === "insufficient_rest"))
    .map((c) => ({
      id: c.vet.id,
      name: c.vet.name,
      isFavorite: c.isFavorite,
      inputs: {
        avgRating: c.vet.avgRating,
        completedShifts: c.vet.completedShifts,
        noShows: c.vet.noShows,
        shiftsWithClinic: c.vet.historyByOrg[org.id] ?? 0,
        distanceKm: c.distanceKm,
        radiusKm: c.vet.radiusKm,
        shiftsInPeriod: c.vet.shiftsThisMonth,
        equityCap: p.maxShiftsPerVetMonth,
      },
    }));

  return (
    <>
      <PageHeader
        title="Configurações"
        description="Política de distribuição, regras de escala, unidades e equipe."
      />
      <PolicySettings
        candidates={candidates}
        initial={{
          mode: p.mode,
          normalMinutes: p.waveTimeouts.normalMinutes,
          urgentMinutes: p.waveTimeouts.urgentMinutes,
          wave2Size: p.wave2Size,
          minRestHours: p.minRestHours,
          maxShiftsPerVetMonth: p.maxShiftsPerVetMonth,
          requireManualApproval: p.requireManualApproval,
          cancelWindowHours: p.cancellation.windowHours,
          compensationPct: p.cancellation.compensationPct,
        }}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Unidades"
            description={`${org.legalName} · CNPJ ${org.cnpj}`}
            action={
              <DemoButton size="sm" variant="secondary">
                <Plus /> Unidade
              </DemoButton>
            }
          />
          <CardContent className="space-y-3">
            {orgUnits().map((u) => (
              <div key={u.id} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                <Building2 className="mt-0.5 size-4 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{u.name}</p>
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="size-3" /> {u.address}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader
            title="Equipe"
            description="Quem pode publicar vagas e fazer fechamentos"
            action={
              <DemoButton size="sm" variant="secondary">
                <Plus /> Convidar
              </DemoButton>
            }
          />
          <CardContent className="divide-y divide-slate-100 py-2">
            {teamMembers.map((m) => (
              <div key={m.id} className="flex items-center gap-3 py-3">
                <Avatar name={m.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{m.name}</p>
                  <p className="truncate text-xs text-slate-500">{m.email}</p>
                </div>
                <Badge tone={m.role === "clinic_admin" ? "violet" : "neutral"}>{roleLabels[m.role]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
