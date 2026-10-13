"use client";

import { Calculator, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { calculateSettlement, type LineItem } from "@/lib/core";
import { formatBRL } from "@/lib/format";

export interface ClosingItem {
  shiftId: string;
  code: string;
  title: string;
  subtitle: string;
  vetName: string;
  fixedAmount: number;
  commissionPct: number;
  extras: LineItem[];
  platformFeePct: number;
  suggestedSales: number;
}

const parseCents = (v: string) => Math.max(0, Math.round((Number(v.replace(/\./g, "").replace(",", ".")) || 0) * 100));

function ClosingRow({ item }: { item: ClosingItem }) {
  const toast = useToast();
  const [sales, setSales] = useState("");
  const [discount, setDiscount] = useState("");
  const [done, setDone] = useState(false);

  const b = useMemo(
    () =>
      calculateSettlement({
        fixedAmount: item.fixedAmount,
        salesAmount: parseCents(sales),
        commissionPct: item.commissionPct,
        extras: item.extras,
        discounts: discount ? [{ label: "Desconto", amount: parseCents(discount) }] : [],
        platformFeePct: item.platformFeePct,
        feeBearer: "clinic",
      }),
    [sales, discount, item],
  );

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar name={item.vetName} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">
            #{item.code} · {item.title}
          </p>
          <p className="text-xs text-slate-500">
            {item.vetName} · {item.subtitle}
          </p>
        </div>
        {done && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
            <Check className="size-3" /> Enviado ao plantonista
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_1.3fr]">
        <label className="space-y-1.5">
          <span className="block text-xs font-medium text-slate-600">Vendas no plantão (R$)</span>
          <Input inputMode="decimal" placeholder="0,00" value={sales} onChange={(e) => setSales(e.target.value)} disabled={done} />
          <button
            type="button"
            className="text-xs text-brand-700 hover:underline disabled:opacity-50"
            disabled={done}
            onClick={() => setSales((item.suggestedSales / 100).toFixed(2).replace(".", ","))}
          >
            Usar valor do sistema da clínica ({formatBRL(item.suggestedSales)})
          </button>
        </label>
        <label className="space-y-1.5">
          <span className="block text-xs font-medium text-slate-600">Descontos (R$)</span>
          <Input inputMode="decimal" placeholder="0,00" value={discount} onChange={(e) => setDiscount(e.target.value)} disabled={done} />
          <span className="block text-xs text-slate-400">Ex.: consumo, adiantamentos</span>
        </label>
        <dl className="space-y-1 rounded-lg bg-slate-50 p-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Fixo + adicionais</dt>
            <dd className="tabular">{formatBRL(b.fixedAmount + b.extrasAmount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Comissão ({item.commissionPct}%)</dt>
            <dd className="tabular">{formatBRL(b.commissionAmount)}</dd>
          </div>
          {b.discountsAmount > 0 && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Descontos</dt>
              <dd className="tabular">−{formatBRL(b.discountsAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between font-medium">
            <dt className="text-slate-700">Plantonista recebe</dt>
            <dd className="tabular">{formatBRL(b.vetNetAmount)}</dd>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold">
            <dt>Total com taxa</dt>
            <dd className="tabular text-brand-700">{formatBRL(b.clinicTotalAmount)}</dd>
          </div>
        </dl>
      </div>
      <div className="mt-4 flex justify-end">
        <Button
          size="sm"
          disabled={done || !sales}
          onClick={() => {
            setDone(true);
            toast({
              tone: "success",
              title: "Fechamento enviado (simulação)",
              description: "O plantonista tem 48h para conferir. Sem contestação, o valor é liberado via split.",
            });
          }}
        >
          <Calculator /> Aprovar fechamento
        </Button>
      </div>
    </div>
  );
}

export function ClosingPanel({ items }: { items: ClosingItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((i) => (
        <ClosingRow key={i.shiftId} item={i} />
      ))}
    </div>
  );
}
