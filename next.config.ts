import type { NextConfig } from "next";

// A data "de hoje" dos dados fictícios é fixada no build, para que servidor e
// navegador renderizem exatamente os mesmos valores (sem erro de hidratação).
// Cada novo deploy na Vercel atualiza a data. Pode ser fixada via variável de ambiente.
const demoNow = process.env.NEXT_PUBLIC_DEMO_NOW ?? new Date().toISOString();

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_DEMO_NOW: demoNow },
  poweredByHeader: false,
};

export default nextConfig;
