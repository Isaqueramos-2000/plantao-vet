"use client";

import { ArrowLeft, Check, CheckCheck, ExternalLink, Mic, Paperclip, Smile, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LogoMark } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

export interface ChatOffer {
  code: string;
  clinic: string;
  unit: string;
  address: string;
  specialty: string;
  when: string;
  pay: string;
  estimate: string;
  timeoutMinutes: number;
  sentAt: string;
  detailHref: string;
}

interface Msg {
  id: number;
  from: "bot" | "me";
  time: string;
  body: ReactNode;
}

function Bubble({ m }: { m: Msg }) {
  return (
    <div className={cn("flex animate-slide-up", m.from === "me" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "relative max-w-[85%] rounded-lg px-2.5 pt-1.5 pb-1 text-[13.5px] leading-snug text-slate-800 shadow-[0_1px_0.5px_rgba(0,0,0,0.13)]",
          m.from === "me" ? "rounded-tr-none bg-whatsapp-bubble" : "rounded-tl-none bg-white",
        )}
      >
        {m.body}
        <span className="float-right mt-1 ml-2 flex items-center gap-0.5 text-[10.5px] text-slate-500">
          {m.time}
          {m.from === "me" && <CheckCheck className="size-3.5 text-sky-500" />}
        </span>
      </div>
    </div>
  );
}

function DateChip({ label }: { label: string }) {
  return (
    <div className="flex justify-center">
      <span className="rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-medium text-slate-600 uppercase shadow-sm">{label}</span>
    </div>
  );
}

export function WhatsAppChat({ offer, clinicYesterday }: { offer: ChatOffer; clinicYesterday: { unit: string; address: string } }) {
  const [scenario, setScenario] = useState<"available" | "filled">("available");
  const [answered, setAnswered] = useState(false);
  const [extra, setExtra] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(100);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [extra, typing]);

  const push = (m: Omit<Msg, "id">) => setExtra((all) => [...all, { ...m, id: nextId.current++ }]);

  function answer(choice: "accept" | "decline") {
    if (answered) return;
    setAnswered(true);
    push({ from: "me", time: "09:40", body: choice === "accept" ? "✅ Aceitar" : "❌ Recusar" });
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      if (choice === "decline") {
        push({
          from: "bot",
          time: "09:40",
          body: (
            <>
              Tudo bem, Marina! Vaga recusada. 👍
              <br />
              Quer pausar as ofertas urgentes pelo resto do dia?
            </>
          ),
        });
      } else if (scenario === "filled") {
        push({
          from: "bot",
          time: "09:40",
          body: (
            <>
              Ops! 😕 Essa vaga <b>acabou de ser preenchida</b> por outro profissional segundos antes do seu aceite.
              <br />
              <br />
              Você continua com prioridade nas próximas vagas da {offer.clinic}.
            </>
          ),
        });
      } else {
        push({
          from: "bot",
          time: "09:40",
          body: (
            <>
              🎉 <b>Plantão confirmado!</b>
              <br />
              {offer.clinic} · {offer.unit}
              <br />
              {offer.when}
              <br />
              📍 {offer.address}
              <br />
              <br />
              Já está na sua agenda. Enviaremos lembretes <b>24h</b> e <b>2h</b> antes e o link de check-in na hora do plantão.
            </>
          ),
        });
      }
    }, 1100);
  }

  function reset() {
    setAnswered(false);
    setExtra([]);
    setTyping(false);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="sticky top-0 z-20 flex items-center gap-2 bg-whatsapp-dark px-2 py-2 text-white">
        <Link href="/plantonista" className="rounded-full p-1.5 hover:bg-white/10" aria-label="Voltar">
          <ArrowLeft className="size-5" />
        </Link>
        <span className="rounded-full bg-white p-0.5">
          <LogoMark className="size-8" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-[15px] leading-tight font-medium">
            PlantãoVet
            <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-whatsapp">
              <Check className="size-2.5 stroke-[3]" />
            </span>
          </p>
          <p className="text-xs text-white/70">Conta comercial oficial</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2 text-xs">
        <span className="text-slate-500">Simular:</span>
        <div className="flex rounded-lg bg-slate-100 p-0.5">
          {(["available", "filled"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setScenario(s);
                reset();
              }}
              className={cn("rounded-md px-2 py-1 font-medium", scenario === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
            >
              {s === "available" ? "Vaga disponível" : "Já preenchida"}
            </button>
          ))}
        </div>
        <button type="button" onClick={reset} className="font-medium text-brand-700">
          Reiniciar
        </button>
      </div>

      <div
        className="flex-1 space-y-2 bg-whatsapp-bg px-3 py-4"
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,0.035) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      >
        <div className="flex justify-center">
          <span className="max-w-[90%] rounded-md bg-amber-50 px-3 py-1.5 text-center text-[11px] text-amber-900 shadow-sm">
            🔒 Mensagens enviadas pela API oficial do WhatsApp (Meta). Você autorizou receber ofertas por aqui.
          </span>
        </div>

        <DateChip label="Ontem" />
        <Bubble
          m={{
            id: 1,
            from: "bot",
            time: "17:00",
            body: (
              <>
                ⏰ <b>Lembrete:</b> seu plantão na <b>{clinicYesterday.unit}</b> começa em 2h (19:00 – 07:00).
                <br />📍 {clinicYesterday.address}
              </>
            ),
          }}
        />
        <Bubble m={{ id: 2, from: "bot", time: "18:48", body: <>✅ Check-in registrado às 18:48. Bom plantão, Marina!</> }} />

        <DateChip label="Hoje" />
        <Bubble
          m={{
            id: 3,
            from: "bot",
            time: "07:06",
            body: (
              <>
                Plantão encerrado às 07:06. Obrigado! 🙌
                <br />
                Como foi na {clinicYesterday.unit}? Responda com uma nota de 1 a 5.
              </>
            ),
          }}
        />
        <Bubble m={{ id: 4, from: "me", time: "07:15", body: "5 ⭐" }} />
        <Bubble m={{ id: 5, from: "bot", time: "07:15", body: "Valeu! Sua avaliação foi registrada. 💚" }} />

        <div className="flex justify-start">
          <div className="w-[88%] overflow-hidden rounded-lg rounded-tl-none bg-white shadow-[0_1px_0.5px_rgba(0,0,0,0.13)]">
            <div className="px-2.5 pt-2 pb-1 text-[13.5px] leading-snug text-slate-800">
              <p className="font-semibold">🚨 Plantão URGENTE disponível</p>
              <p className="mt-1">
                <b>{offer.clinic}</b> · {offer.unit}
                <br />
                🩺 {offer.specialty}
                <br />
                🗓️ {offer.when}
                <br />
                💰 {offer.pay}
                <br />
                Estimativa: <b>{offer.estimate}</b>
              </p>
              <p className="mt-1.5 text-[12px] text-slate-500">
                Você está na onda 1 (favoritos). Responda em até {offer.timeoutMinutes} min.
              </p>
              <span className="float-right mt-0.5 text-[10.5px] text-slate-500">{offer.sentAt}</span>
              <div className="clear-both" />
            </div>
            <div className="divide-y divide-slate-100 border-t border-slate-100 text-center text-[14px] font-medium text-sky-600">
              <button type="button" disabled={answered} onClick={() => answer("accept")} className="flex w-full items-center justify-center gap-1.5 py-2.5 hover:bg-slate-50 disabled:text-slate-400">
                <Check className="size-4" /> Aceitar
              </button>
              <button type="button" disabled={answered} onClick={() => answer("decline")} className="flex w-full items-center justify-center gap-1.5 py-2.5 hover:bg-slate-50 disabled:text-slate-400">
                <X className="size-4" /> Recusar
              </button>
              <Link href={offer.detailHref} className="flex w-full items-center justify-center gap-1.5 py-2.5 hover:bg-slate-50">
                <ExternalLink className="size-4" /> Ver detalhes
              </Link>
            </div>
          </div>
        </div>

        {extra.map((m) => (
          <Bubble key={m.id} m={m} />
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-lg rounded-tl-none bg-white px-3 py-3 shadow-sm">
              {[0, 150, 300].map((d) => (
                <span key={d} className="size-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} className="scroll-mb-36 lg:scroll-mb-16" />
      </div>

      <div className="sticky bottom-[calc(3.75rem+env(safe-area-inset-bottom))] flex items-center gap-2 bg-whatsapp-bg px-2 py-2 lg:bottom-0">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-3 py-2 text-slate-400 shadow-sm">
          <Smile className="size-5" />
          <span className="flex-1 text-sm">Mensagem</span>
          <Paperclip className="size-5" />
        </div>
        <span className="flex size-10 items-center justify-center rounded-full bg-whatsapp text-white">
          <Mic className="size-5" />
        </span>
      </div>
    </div>
  );
}
