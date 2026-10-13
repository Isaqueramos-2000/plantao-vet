"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Início" },
  { href: "/clinica", label: "Clínica" },
  { href: "/plantonista", label: "Plantonista" },
  { href: "/admin", label: "Admin" },
];

export function DemoBanner() {
  const pathname = usePathname();
  if (pathname === "/acesso") return null;
  return (
    <div className="bg-slate-900 text-xs text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1.5 lg:h-7 lg:flex-nowrap lg:py-0">
        <p>
          <span className="mr-1.5 rounded bg-amber-400/90 px-1.5 py-0.5 font-semibold text-slate-900">PROTÓTIPO</span>
          Dados fictícios · nenhuma ação é salva
        </p>
        <nav className="flex items-center gap-3" aria-label="Trocar de perfil">
          <span className="hidden text-slate-500 sm:inline">Ver como:</span>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="font-medium text-slate-200 hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
