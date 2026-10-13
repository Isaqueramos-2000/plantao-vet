"use client";

import { ArrowLeft, Building2, MessageCircle, ShieldCheck, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const ROLES = [
  { href: "/plantonista", icon: Stethoscope, title: "Plantonista", text: "Marina Albuquerque · CRMV-SP 38.214" },
  { href: "/clinica", icon: Building2, title: "Hospital Veterinário Aurora", text: "Ricardo Tavares · coordenador de escala" },
  { href: "/admin", icon: ShieldCheck, title: "Operações PlantãoVet", text: "Ana Ribeiro · verificação e suporte" },
];

export function LoginFlow() {
  const [step, setStep] = useState<"phone" | "code" | "role">("phone");
  const [phone, setPhone] = useState("(11) 98765-4321");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (i: number, v: string) => {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = digit;
    setCode(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
    if (next.every(Boolean)) setTimeout(() => setStep("role"), 250);
  };

  return (
    <div className="w-full max-w-sm">
      {step === "phone" && (
        <form
          className="animate-fade-in space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            setStep("code");
            setTimeout(() => refs.current[0]?.focus(), 50);
          }}
        >
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Entrar</h1>
            <p className="mt-1 text-sm text-slate-500">Use seu celular. Enviaremos um código pelo WhatsApp.</p>
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Celular</span>
            <Input inputMode="tel" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} placeholder="(11) 90000-0000" />
          </label>
          <Button type="submit" size="lg" variant="whatsapp" className="w-full" disabled={phone.replace(/\D/g, "").length < 10}>
            <MessageCircle /> Receber código no WhatsApp
          </Button>
          <p className="text-center text-xs text-slate-500">
            Ao continuar você concorda com os Termos de Uso e a Política de Privacidade. A plataforma intermedeia a contratação, sem vínculo
            empregatício.
          </p>
        </form>
      )}

      {step === "code" && (
        <div className="animate-fade-in space-y-5">
          <button type="button" onClick={() => setStep("phone")} className="inline-flex items-center gap-1 text-sm text-slate-500">
            <ArrowLeft className="size-4" /> Voltar
          </button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Digite o código</h1>
            <p className="mt-1 text-sm text-slate-500">
              Enviado para {phone}. <span className="text-slate-400">(Demo: qualquer número serve.)</span>
            </p>
          </div>
          <div className="flex justify-between gap-2">
            {code.map((c, i) => (
              <input
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                value={c}
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-label={`Dígito ${i + 1}`}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !code[i] && i > 0) refs.current[i - 1]?.focus();
                }}
                className="h-14 w-full rounded-xl border border-slate-300 text-center text-xl font-semibold focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              />
            ))}
          </div>
          <Button variant="secondary" className="w-full" onClick={() => setStep("role")}>
            Pular (demo)
          </Button>
        </div>
      )}

      {step === "role" && (
        <div className="animate-fade-in space-y-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Como deseja entrar?</h1>
            <p className="mt-1 text-sm text-slate-500">Um mesmo usuário pode ser plantonista e membro de clínicas.</p>
          </div>
          <div className="space-y-2">
            {ROLES.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className={cn("flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50/40")}
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <r.icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{r.title}</p>
                  <p className="text-xs text-slate-500">{r.text}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
