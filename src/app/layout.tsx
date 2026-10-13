import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { DemoBanner } from "@/components/shared/demo-banner";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PlantãoVet — plantões veterinários preenchidos em minutos",
    template: "%s · PlantãoVet",
  },
  description:
    "Marketplace e gestão de plantões veterinários: distribuição justa de vagas, aceite pelo WhatsApp, profissionais verificados e fechamento financeiro automático.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#047860",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh font-sans text-slate-900 antialiased">
        <ToastProvider>
          <DemoBanner />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
