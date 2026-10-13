import type { Metadata } from "next";
import { Logo } from "@/components/shared/logo";
import { LoginFlow } from "./login-flow";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div className="grid min-h-[calc(100dvh-28px)] lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <LoginFlow />
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-brand-800 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(110,231,194,0.35),transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <blockquote className="max-w-md text-2xl leading-snug font-medium">
            “Antes a vaga urgente virava 40 mensagens no grupo. Agora a onda de favoritos resolve antes de eu terminar o café.”
          </blockquote>
          <p className="mt-4 text-sm text-brand-200">Depoimento ilustrativo · coordenação de hospital veterinário (fictício)</p>
        </div>
      </div>
    </div>
  );
}
