"use client";

import {
  Building2,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Scale,
  ScrollText,
  Settings2,
  ShieldCheck,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/shared/logo";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV: Record<"clinic" | "admin", NavItem[]> = {
  clinic: [
    { href: "/clinica", label: "Visão geral", icon: LayoutDashboard, exact: true },
    { href: "/clinica/vagas", label: "Vagas", icon: ClipboardList },
    { href: "/clinica/escala", label: "Escala", icon: CalendarDays },
    { href: "/clinica/banco-de-reserva", label: "Banco de reserva", icon: Users },
    { href: "/clinica/financeiro", label: "Financeiro", icon: Wallet },
    { href: "/clinica/configuracoes", label: "Configurações", icon: Settings2 },
  ],
  admin: [
    { href: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
    { href: "/admin/verificacoes", label: "Verificações", icon: ShieldCheck },
    { href: "/admin/disputas", label: "Disputas", icon: Scale },
    { href: "/admin/auditoria", label: "Auditoria", icon: ScrollText },
  ],
};

export interface AppShellProps {
  section: "clinic" | "admin";
  orgName: string;
  orgSubtitle: string;
  user: { name: string; role: string };
  badges?: Record<string, number>;
  children: ReactNode;
}

function SidebarContent({ section, orgName, orgSubtitle, user, badges, onNavigate }: Omit<AppShellProps, "children"> & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const home = section === "clinic" ? "/clinica" : "/admin";
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo href={home} />
        {section === "admin" && (
          <span className="ml-2 rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">Admin</span>
        )}
      </div>

      <div className="mx-3 mb-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
        <span className="rounded-md bg-white p-1.5 text-slate-600 ring-1 ring-slate-200">
          {section === "clinic" ? <Building2 className="size-4" /> : <ShieldCheck className="size-4" />}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{orgName}</p>
          <p className="truncate text-xs text-slate-500">{orgSubtitle}</p>
        </div>
      </div>

      {section === "clinic" && (
        <div className="mx-3 mb-4">
          <ButtonLink href="/clinica/vagas/nova" className="w-full" onClick={onNavigate}>
            <Plus /> Nova vaga
          </ButtonLink>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 px-3" aria-label="Navegação principal">
        {NAV[section].map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const badge = badges?.[item.href];
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <item.icon className={cn("size-4", active ? "text-brand-600" : "text-slate-400")} />
              <span className="flex-1">{item.label}</span>
              {badge ? (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] leading-none font-semibold text-white">{badge}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={user.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.role}</p>
          </div>
          <Link href="/entrar" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Sair">
            <LogOut className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="lg:flex lg:h-[calc(100dvh-1.75rem)]">
      <aside className="hidden border-r border-slate-200 bg-white lg:block lg:h-full lg:w-64 lg:shrink-0 lg:overflow-y-auto">
        <SidebarContent {...props} />
      </aside>

      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <Logo href={props.section === "clinic" ? "/clinica" : "/admin"} />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 animate-fade-in bg-slate-900/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-slide-up bg-white shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-3 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Fechar menu"
            >
              <X className="size-5" />
            </button>
            <SidebarContent {...props} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className="scrollbar-thin min-w-0 flex-1 px-4 py-6 sm:px-6 lg:h-full lg:overflow-y-auto lg:px-10 lg:py-8">
        <div className="mx-auto max-w-7xl">{props.children}</div>
      </main>
    </div>
  );
}
