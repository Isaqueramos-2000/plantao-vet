import { Logo } from "@/components/shared/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-4 px-4 text-center">
      <Logo />
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">Página não encontrada</h1>
      <p className="text-slate-500">Este protótipo só contém as telas e dados de demonstração.</p>
      <ButtonLink href="/">Voltar ao início</ButtonLink>
    </div>
  );
}
