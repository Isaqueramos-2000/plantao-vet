"use client";

import { BatteryFull, CalendarDays, Home, MessageCircle, Signal, User, Wallet, Wifi } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/plantonista", label: "Início", icon: Home, exact: true },
  { href: "/plantonista/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/plantonista/extrato", label: "Extrato", icon: Wallet },
  { href: "/plantonista/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { href: "/plantonista/perfil", label: "Perfil", icon: User },
];

const SCREENS = [
  { href: "/plantonista", title: "Início", text: "Ofertas com contagem regressiva da onda, aceite em 1 toque e alerta de descanso." },
  { href: "/plantonista/whatsapp", title: "WhatsApp", text: "O canal principal: oferta com botões Aceitar / Recusar / Ver detalhes." },
  { href: "/plantonista/agenda", title: "Agenda", text: "Todas as clínicas num lugar, alertas de conflito e exportação .ics." },
  { href: "/plantonista/extrato", title: "Extrato", text: "Fixo + comissão detalhados, previsto × recebido, contestação." },
  { href: "/plantonista/perfil", title: "Perfil", text: "CRMV verificado, preferências, documentos e currículo público." },
];

export function PhoneShell({ children, badge }: { children: ReactNode; badge?: number }) {
  const pathname = usePathname();
  const isActive = (t: (typeof TABS)[number]) =>
    t.exact ? pathname === t.href || pathname.startsWith("/plantonista/vagas") : pathname.startsWith(t.href);

  return (
    <div className="lg:flex lg:min-h-[calc(100dvh-28px)] lg:items-center lg:justify-center lg:gap-14 lg:bg-gradient-to-br lg:from-brand-50 lg:via-slate-50 lg:to-slate-100 lg:px-8 lg:py-10">
      <aside className="hidden max-w-sm lg:block">
        <Logo />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">App do plantonista</h1>
        <p className="mt-2 text-slate-600">
          Simulado no navegador. Na versão final: app nativo (Expo) com notificações push, e o WhatsApp como canal principal.
        </p>
        <ul className="mt-6 space-y-2">
          {SCREENS.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className={cn(
                  "block rounded-xl border p-3 transition-colors",
                  pathname === s.href ? "border-brand-300 bg-white shadow-sm" : "border-transparent hover:border-slate-200 hover:bg-white/60",
                )}
              >
                <p className="text-sm font-semibold text-slate-900">{s.title}</p>
                <p className="text-sm text-slate-500">{s.text}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-slate-500">Persona: Marina Albuquerque · emergência, clínica e anestesia · CRMV-SP 38.214 (fictício)</p>
      </aside>

      <div className="relative flex min-h-[calc(100dvh-28px)] flex-col bg-slate-50 lg:h-[844px] lg:min-h-0 lg:w-[400px] lg:shrink-0 lg:overflow-hidden lg:rounded-[48px] lg:border-[12px] lg:border-slate-900 lg:shadow-2xl">
        <div className="hidden h-9 shrink-0 items-center justify-between bg-white px-7 text-xs font-semibold text-slate-900 lg:flex">
          <span>09:40</span>
          <span className="absolute top-2 left-1/2 h-6 w-24 -translate-x-1/2 rounded-full bg-slate-900" />
          <span className="flex items-center gap-1">
            <Signal className="size-3.5" />
            <Wifi className="size-3.5" />
            <BatteryFull className="size-4" />
          </span>
        </div>
        <div className="scrollbar-thin flex flex-1 flex-col pb-20 lg:overflow-y-auto lg:pb-0">{children}</div>
        <nav
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:static"
          aria-label="Navegação do app"
        >
          {TABS.map((t) => {
            const active = isActive(t);
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium",
                  active ? "text-brand-700" : "text-slate-500",
                )}
              >
                <t.icon className={cn("size-5", active && "stroke-[2.25]")} />
                {t.label}
                {t.href === "/plantonista" && badge ? (
                  <span className="absolute top-1.5 left-1/2 ml-2 rounded-full bg-red-500 px-1.5 text-[10px] leading-4 font-semibold text-white">
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

/** Cabeçalho padrão das telas do app. */
export function AppHeader({ title, subtitle, right, back }: { title: ReactNode; subtitle?: ReactNode; right?: ReactNode; back?: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/70 bg-white/95 px-4 py-3 backdrop-blur">
      {back && (
        <Link href={back} className="-ml-1 rounded-full p-1.5 text-slate-600 hover:bg-slate-100" aria-label="Voltar">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
