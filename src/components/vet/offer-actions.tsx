"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function OfferActions({ urgent }: { urgent: boolean }) {
  const toast = useToast();
  const [state, setState] = useState<"idle" | "accepted" | "declined">("idle");

  if (state !== "idle") {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
          {state === "accepted" ? (
            <>
              <Check className="size-4 text-brand-600" /> Plantão confirmado
            </>
          ) : (
            "Você recusou esta vaga"
          )}
        </p>
        <button type="button" onClick={() => setState("idle")} className="text-xs font-medium text-slate-500 underline">
          Desfazer
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button variant="secondary" size="lg" onClick={() => setState("declined")}>
        Recusar
      </Button>
      <Button
        size="lg"
        variant={urgent ? "danger" : "primary"}
        onClick={() => {
          setState("accepted");
          toast({ tone: "success", title: "Aceite registrado (simulação)", description: "Adicionado à agenda com lembretes 24h e 2h antes." });
        }}
      >
        Aceitar plantão
      </Button>
    </div>
  );
}
