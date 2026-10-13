import { BadgeCheck, Clock, ShieldAlert, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CrmvStatus } from "@/lib/core";
import {
  offerStateMeta,
  settlementStatusMeta,
  shiftStatusMeta,
  shiftTypeMeta,
  statementStatusMeta,
} from "@/lib/labels";
import type { OfferState, StatementStatus } from "@/lib/mock/queries";
import type { SettlementStatus, ShiftStatus, ShiftType } from "@/lib/mock/types";

export function ShiftStatusBadge({ status }: { status: ShiftStatus }) {
  const m = shiftStatusMeta[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

export function ShiftTypeBadge({ type, hideSingle }: { type: ShiftType; hideSingle?: boolean }) {
  if (hideSingle && type === "single") return null;
  const m = shiftTypeMeta[type];
  return (
    <Badge tone={m.tone}>
      {type === "urgent" && <Zap />}
      {m.label}
    </Badge>
  );
}

export function SettlementStatusBadge({ status }: { status: SettlementStatus }) {
  const m = settlementStatusMeta[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

export function StatementStatusBadge({ status }: { status: StatementStatus }) {
  const m = statementStatusMeta[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

export function OfferStateBadge({ state }: { state: OfferState }) {
  const m = offerStateMeta[state];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

export function CrmvBadge({ status, compact }: { status: CrmvStatus; compact?: boolean }) {
  if (status === "verified")
    return (
      <Badge tone="brand">
        <BadgeCheck />
        {compact ? "Verificado" : "CRMV verificado"}
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge tone="amber">
        <Clock />
        {compact ? "Em análise" : "CRMV em análise"}
      </Badge>
    );
  return (
    <Badge tone="red">
      <ShieldAlert />
      CRMV rejeitado
    </Badge>
  );
}
