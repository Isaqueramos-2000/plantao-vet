"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const TAGS = ["Estrutura adequada", "Equipe colaborativa", "Pagamento em dia", "Boa passagem de plantão", "Sobrecarga"];

export function ReviewPrompt({ clinicName, subtitle }: { clinicName: string; subtitle: string }) {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Obrigado! Sua avaliação de <b>{clinicName}</b> ajuda outros plantonistas.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-900">Como foi o plantão?</p>
      <p className="text-xs text-slate-500">
        {clinicName} · {subtitle}
      </p>
      <div className="mt-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} estrelas`} className="p-0.5">
            <Star className={cn("size-7 transition-colors", i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <div className="mt-3 animate-fade-in space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTags((all) => (all.includes(t) ? all.filter((x) => x !== t) : [...all, t]))}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs ring-1 ring-inset",
                  tags.includes(t) ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-slate-600 ring-slate-300",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            className="w-full"
            onClick={() => {
              setSent(true);
              toast({ tone: "success", title: "Avaliação enviada (simulação)", description: "Avaliações são bidirecionais e liberadas após as duas partes avaliarem." });
            }}
          >
            Enviar avaliação
          </Button>
        </div>
      )}
    </div>
  );
}
