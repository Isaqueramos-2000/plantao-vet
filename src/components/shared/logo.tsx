import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" rx="9" className="fill-brand-600" />
      <g className="fill-white">
        <ellipse cx="10.2" cy="12.4" rx="2.3" ry="2.9" />
        <ellipse cx="15.9" cy="9.6" rx="2.3" ry="2.9" />
        <ellipse cx="21.7" cy="12.4" rx="2.3" ry="2.9" />
        <path d="M16 15.2c-3.6 0-7.1 4.4-7.1 7.4 0 2 1.6 2.6 3.2 2.6 1.5 0 2.4-.7 3.9-.7s2.4.7 3.9.7c1.6 0 3.2-.6 3.2-2.6 0-3-3.5-7.4-7.1-7.4Z" />
      </g>
      <path d="M14.6 20.3h2.8M16 18.9v2.8" className="stroke-brand-600" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ href = "/", className, invert }: { href?: string; className?: string; invert?: boolean }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className={cn("text-lg font-semibold tracking-tight", invert ? "text-white" : "text-slate-900")}>
        Plantão<span className={invert ? "text-brand-300" : "text-brand-600"}>Vet</span>
      </span>
    </Link>
  );
}
