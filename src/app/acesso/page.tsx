import { Lock } from "lucide-react";
import type { Metadata } from "next";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { safeNextPath } from "@/lib/access";

export const metadata: Metadata = { title: "Acesso restrito" };

type Props = { searchParams: Promise<{ erro?: string; next?: string }> };

export default async function AccessPage({ searchParams }: Props) {
  const { erro, next } = await searchParams;
  const configured = !!process.env.DEMO_PASSWORD;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-brand-50 to-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <Lock className="size-5" />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Protótipo com acesso restrito</h1>
          <p className="mt-1 text-sm text-slate-500">Digite a senha que você recebeu para ver a demonstração.</p>

          {configured ? (
            <form method="post" action="/api/acesso" className="mt-5 space-y-3">
              <input type="hidden" name="next" value={safeNextPath(next)} />
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Senha</span>
                <Input
                  type="password"
                  name="password"
                  required
                  autoFocus
                  autoComplete="current-password"
                  aria-invalid={erro ? true : undefined}
                />
              </label>
              {erro && <p className="text-sm text-red-600">Senha incorreta. Confira e tente novamente.</p>}
              <Button type="submit" className="w-full">
                Entrar na demo
              </Button>
            </form>
          ) : (
            <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              A senha ainda não foi configurada no servidor. Defina a variável de ambiente <code>DEMO_PASSWORD</code> na Vercel e faça
              um novo deploy.
            </p>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">PlantãoVet · nome provisório · dados fictícios</p>
      </div>
    </div>
  );
}
