import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  Check,
  CheckCheck,
  Clock,
  FileCheck2,
  Lock,
  MessageCircle,
  Scale,
  ShieldCheck,
  Stethoscope,
  Timer,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { ButtonLink } from "@/components/ui/button";
import { calculateSettlement } from "@/lib/core";
import { formatBRL } from "@/lib/format";

const example = calculateSettlement({
  fixedAmount: 110_000,
  salesAmount: 648_000,
  commissionPct: 8,
  extras: [{ label: "Adicional noturno", amount: 15_000 }],
  platformFeePct: 8,
  feeBearer: "clinic",
});

const steps = [
  { icon: Building2, title: "A clínica publica a vaga", text: "Avulsa, recorrente ou urgente. Fixo, % de comissão sobre vendas e adicionais em uma tela." },
  { icon: Users, title: "Distribuição em ondas", text: "Favoritos primeiro, depois os melhores scores e, por fim, todos os elegíveis — com tempo limite por onda." },
  { icon: MessageCircle, title: "Aceite pelo WhatsApp", text: "O plantonista recebe a oferta com botões Aceitar / Recusar. O primeiro aceite válido leva, sem dupla alocação." },
  { icon: Wallet, title: "Plantão e fechamento", text: "Check-in/out no app, vendas informadas pela clínica e cálculo automático. Pagamento liberado via split." },
];

const faqs = [
  {
    q: "Isso substitui o grupo de WhatsApp da minha clínica?",
    a: "Sim. O WhatsApp continua sendo o canal — mas cada profissional recebe a oferta individualmente, na ordem definida pela sua política, e responde com um toque. Nada de “quem viu primeiro”.",
  },
  {
    q: "Como funciona a comissão sobre as vendas do plantão?",
    a: "No fechamento, a clínica informa o total vendido no plantão (ou importa por planilha). O sistema calcula fixo + % de comissão + adicionais − descontos. O plantonista vê o detalhamento e pode contestar.",
  },
  {
    q: "O PlantãoVet guarda o dinheiro?",
    a: "Não. O pagamento é feito por um gateway regulado com split: a clínica paga, o repasse vai direto para a conta do plantonista. A plataforma nunca custodia valores.",
  },
  {
    q: "Existe vínculo empregatício?",
    a: "Não. A plataforma intermedeia a contratação entre clínica e profissional autônomo/PJ. Isso fica explícito nos termos de uso.",
  },
  {
    q: "Como vocês verificam o CRMV?",
    a: "Na fase inicial, a equipe confere manualmente o documento enviado com a consulta pública do conselho regional. Só profissionais verificados recebem vagas.",
  },
];

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-tr from-brand-200/60 via-brand-100/40 to-transparent blur-2xl" />
      <div className="mx-auto w-[300px] overflow-hidden rounded-[2.5rem] border-[10px] border-slate-900 bg-whatsapp-bg shadow-2xl">
        <div className="flex items-center gap-2 bg-whatsapp-dark px-3 py-2.5 text-white">
          <span className="size-7 rounded-full bg-white p-0.5">
            <svg viewBox="0 0 32 32" className="size-full">
              <rect width="32" height="32" rx="9" fill="#059673" />
              <circle cx="16" cy="18" r="6" fill="#fff" />
            </svg>
          </span>
          <div>
            <p className="text-sm leading-tight font-medium">PlantãoVet</p>
            <p className="text-[10px] text-white/70">Conta comercial oficial</p>
          </div>
        </div>
        <div className="space-y-2 p-3">
          <div className="rounded-lg rounded-tl-none bg-white text-[12.5px] leading-snug text-slate-800 shadow-sm">
            <div className="p-2.5">
              <p className="font-semibold">🚨 Plantão URGENTE disponível</p>
              <p className="mt-1">
                <b>Hospital Veterinário Aurora</b> · Pinheiros
                <br />
                🩺 Emergência · hoje, 19:00 – 07:00
                <br />
                💰 R$ 1.100 + 8% das vendas + noturno
              </p>
              <p className="mt-1 text-[11px] text-slate-500">Onda 1 · favoritos · responda em 5 min</p>
            </div>
            <div className="divide-y divide-slate-100 border-t border-slate-100 text-center text-[13px] font-medium text-sky-600">
              <p className="py-2">✓ Aceitar</p>
              <p className="py-2">✕ Recusar</p>
              <p className="py-2">Ver detalhes</p>
            </div>
          </div>
          <div className="flex justify-end">
            <p className="rounded-lg rounded-tr-none bg-whatsapp-bubble px-2.5 py-1.5 text-[12.5px] shadow-sm">
              ✅ Aceitar <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] text-slate-500">09:38 <CheckCheck className="size-3 text-sky-500" /></span>
            </p>
          </div>
          <div className="rounded-lg rounded-tl-none bg-white p-2.5 text-[12.5px] shadow-sm">
            🎉 <b>Plantão confirmado!</b> Lembretes 24h e 2h antes.
          </div>
        </div>
      </div>

      <div className="absolute top-10 -left-2 hidden w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-xl sm:block lg:-left-10">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
          <Timer className="size-3.5 text-amber-500" /> Vaga #1042 · urgente
        </p>
        <div className="mt-2 space-y-1 text-[11px] text-slate-600">
          <p className="flex items-center justify-between">
            Onda 1 · favoritos <Check className="size-3.5 text-brand-600" />
          </p>
          <p className="flex items-center justify-between">
            Aceita em <b className="text-slate-900">1 min 12 s</b>
          </p>
        </div>
      </div>

      <div className="absolute -right-2 bottom-8 hidden w-60 rounded-xl border border-slate-200 bg-white p-3 shadow-xl sm:block lg:-right-8">
        <p className="text-xs font-semibold text-slate-900">Fechamento automático</p>
        <dl className="mt-2 space-y-0.5 text-[11px] text-slate-600">
          <div className="flex justify-between">
            <dt>Fixo</dt>
            <dd>{formatBRL(example.fixedAmount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>8% de R$ 6.480 em vendas</dt>
            <dd>{formatBRL(example.commissionAmount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Adicional noturno</dt>
            <dd>{formatBRL(example.extrasAmount)}</dd>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-1 font-semibold text-slate-900">
            <dt>Plantonista recebe</dt>
            <dd className="text-brand-700">{formatBRL(example.vetNetAmount)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm text-slate-600 md:flex">
            <a href="#como-funciona" className="hover:text-slate-900">Como funciona</a>
            <a href="#clinicas" className="hover:text-slate-900">Para clínicas</a>
            <a href="#plantonistas" className="hover:text-slate-900">Para plantonistas</a>
            <a href="#faq" className="hover:text-slate-900">Perguntas</a>
          </nav>
          <div className="flex items-center gap-2">
            <ButtonLink href="/entrar" variant="ghost" size="sm" className="hidden sm:inline-flex">
              Entrar
            </ButtonLink>
            <ButtonLink href="#demo" size="sm">
              Ver demo
            </ButtonLink>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-[600px] bg-gradient-to-b from-brand-50 to-white" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-2 lg:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-800 shadow-sm ring-1 ring-brand-200">
              <span className="size-1.5 rounded-full bg-brand-500" /> Piloto em São Paulo
            </span>
            <h1 className="mt-5 text-4xl leading-[1.1] font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
              Plantões veterinários preenchidos em minutos. <span className="text-brand-600">De forma justa.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Chega de grupo de WhatsApp onde o primeiro que responde leva. O PlantãoVet distribui as vagas por ondas, confirma o aceite
              pelo próprio WhatsApp e fecha o financeiro — fixo + comissão — automaticamente.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/clinica" size="lg">
                <Building2 /> Sou clínica
              </ButtonLink>
              <ButtonLink href="/plantonista" size="lg" variant="secondary">
                <Stethoscope /> Sou plantonista
              </ButtonLink>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-slate-200 pt-6">
              <div>
                <dt className="text-xs text-slate-500">Meta p/ vaga urgente</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-900">&lt; 30 min</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Meta de preenchimento</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-900">&gt; 90%</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">CRMV verificado</dt>
                <dd className="mt-1 text-2xl font-semibold text-slate-900">100%</dd>
              </div>
            </dl>
          </div>
          <HeroVisual />
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-7">
            <p className="text-sm font-semibold tracking-wide text-red-600 uppercase">Hoje</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Grupos de WhatsApp e planilhas</h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              {[
                "Quem está online na hora leva — o resto nunca tem chance",
                "Vaga urgente vira dezenas de mensagens e ligações",
                "Sem saber se o profissional tem CRMV ativo",
                "Comissão calculada à mão, atraso e desconfiança no pagamento",
                "Escala espalhada em planilhas, sem ver as lacunas",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <X className="mt-0.5 size-4 shrink-0 text-red-500" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-brand-200 bg-white p-7 ring-4 ring-brand-50">
            <p className="text-sm font-semibold tracking-wide text-brand-700 uppercase">Com o PlantãoVet</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Distribuição justa e financeiro automático</h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              {[
                "Ondas configuráveis: favoritos, melhores scores, todos",
                "Aceite com um toque no WhatsApp, sem dupla alocação",
                "Só profissionais com CRMV verificado recebem vagas",
                "Fixo + % das vendas + adicionais calculados no fechamento",
                "Escala mensal com lacunas destacadas e exportação",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand-600" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-16 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-brand-700">Como funciona</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Da vaga publicada ao pagamento liberado</h2>
          </div>
          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl border border-slate-200 p-6">
                <span className="absolute top-6 right-6 text-4xl font-semibold text-slate-100">{i + 1}</span>
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <s.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-slate-900 py-20 text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-brand-300">Motor de distribuição justa</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Cada clínica define as regras. O sistema garante que sejam cumpridas.</h2>
            <p className="mt-4 text-slate-300">
              Antes de qualquer oferta, filtros obrigatórios eliminam conflitos. Dentro de cada onda, um score transparente e
              determinístico ordena os profissionais — com peso para equidade, para não concentrar plantões nos mesmos nomes.
            </p>
            <ul className="mt-6 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
              {["CRMV verificado", "Especialidade compatível", "Dentro do raio de atuação", "Sem conflito de agenda", "Descanso mínimo (ex.: 11h)", "Limite semanal de horas"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check className="size-4 text-brand-400" /> {t}
                  </li>
                ),
              )}
            </ul>
          </div>
          <div className="space-y-3">
            {[
              { n: 1, title: "Favoritos da clínica", text: "Seu banco de reserva recebe primeiro", time: "15 min · 5 min se urgente", w: "w-1/4" },
              { n: 2, title: "Melhores scores", text: "Avaliação, comparecimento, histórico, distância e equidade", time: "15 min · 5 min se urgente", w: "w-1/2" },
              { n: 3, title: "Todos os elegíveis", text: "Sem elegíveis restantes? A clínica é alertada na hora", time: "até preencher", w: "w-full" },
            ].map((w) => (
              <div key={w.n} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">
                    Onda {w.n} · {w.title}
                  </p>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="size-3.5" /> {w.time}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{w.text}</p>
                <div className="mt-3 h-1.5 rounded-full bg-white/10">
                  <div className={`h-full rounded-full bg-brand-400 ${w.w}`} />
                </div>
              </div>
            ))}
            <p className="text-xs text-slate-500">Também disponível: primeiro a aceitar (com teto mensal), rodízio e convite direto.</p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-2">
          <div id="clinicas" className="scroll-mt-20 rounded-3xl bg-gradient-to-br from-brand-50 to-white p-8 ring-1 ring-brand-100">
            <Building2 className="size-8 text-brand-600" />
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">Para clínicas e hospitais</h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              {[
                { icon: Zap, text: "Vaga urgente preenchida rápido, com ondas aceleradas" },
                { icon: BadgeCheck, text: "Profissionais verificados, com nota e taxa de comparecimento" },
                { icon: CalendarDays, text: "Escala mensal por unidade, lacunas destacadas, PDF e planilha" },
                { icon: Wallet, text: "Fechamento automático: fixo + comissão + adicionais" },
                { icon: Users, text: "Banco de reserva com favoritos e bloqueados" },
              ].map(({ icon: I, text }) => (
                <li key={text} className="flex gap-3">
                  <I className="mt-0.5 size-4 shrink-0 text-brand-600" /> {text}
                </li>
              ))}
            </ul>
            <ButtonLink href="/clinica" className="mt-7">
              Ver painel da clínica <ArrowRight />
            </ButtonLink>
          </div>
          <div id="plantonistas" className="scroll-mt-20 rounded-3xl bg-gradient-to-br from-slate-100 to-white p-8 ring-1 ring-slate-200">
            <Stethoscope className="size-8 text-slate-700" />
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">Para plantonistas</h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              {[
                { icon: Scale, text: "Vagas distribuídas de forma justa, não por quem está online" },
                { icon: MessageCircle, text: "Ofertas e aceite pelo WhatsApp, lembretes automáticos" },
                { icon: ShieldCheck, text: "Pagamento garantido pelo gateway, sem atraso" },
                { icon: FileCheck2, text: "Extrato detalhado, previsto × recebido, com contestação" },
                { icon: BadgeCheck, text: "Currículo verificado com link compartilhável" },
              ].map(({ icon: I, text }) => (
                <li key={text} className="flex gap-3">
                  <I className="mt-0.5 size-4 shrink-0 text-slate-700" /> {text}
                </li>
              ))}
            </ul>
            <ButtonLink href="/plantonista" variant="dark" className="mt-7">
              Ver app do plantonista <ArrowRight />
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-4">
          {[
            { icon: Lock, title: "Sem custódia", text: "Pagamentos via gateway regulado com split. A plataforma nunca guarda o dinheiro." },
            { icon: ShieldCheck, title: "LGPD", text: "Consentimento explícito, documentos em bucket privado, exportação e exclusão de conta." },
            { icon: Scale, title: "Disputas mediadas", text: "Contestações suspendem a liberação até a análise da equipe." },
            { icon: FileCheck2, title: "Auditoria", text: "Aprovações de CRMV, alterações de valor e bloqueios ficam registrados." },
          ].map((f) => (
            <div key={f.title}>
              <f.icon className="size-6 text-brand-600" />
              <h3 className="mt-3 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="scroll-mt-16 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-semibold text-brand-700">Protótipo navegável</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Explore a demo com dados fictícios</h2>
            <p className="mt-3 text-slate-600">Nenhuma ação é salva. Use o seletor no topo da página para trocar de perfil a qualquer momento.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { href: "/clinica", icon: Building2, title: "Painel da clínica", text: "Dashboard, vagas com ondas em tempo real, escala, banco de reserva, financeiro e política de distribuição." },
              { href: "/plantonista", icon: Stethoscope, title: "App do plantonista", text: "Ofertas com contagem regressiva, WhatsApp simulado, agenda com alertas, extrato e perfil." },
              { href: "/admin", icon: ShieldCheck, title: "Admin da plataforma", text: "Fila de verificação de CRMV, disputas, auditoria e métricas do piloto." },
            ].map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className="group rounded-2xl border border-slate-200 p-6 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
              >
                <d.icon className="size-7 text-brand-600" />
                <h3 className="mt-4 flex items-center gap-2 font-semibold text-slate-900">
                  {d.title} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </h3>
                <p className="mt-2 text-sm text-slate-600">{d.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-16 bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-900">Perguntas frequentes</h2>
          <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {faqs.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-slate-900">
                  {f.q}
                  <span className="text-slate-400 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row sm:px-6">
          <Logo />
          <p>Nome provisório · protótipo de demonstração · dados fictícios</p>
        </div>
      </footer>
    </div>
  );
}
