# CLAUDE.md — PlantãoVet

Plano de produto (fonte de verdade): `docs/plano-produto.md`. Seguir a Seção 0 (fase por fase, propor o plano técnico antes de cada fase, integrações com interface + mock, nunca commitar segredos).

## Estado atual

**Protótipo visual (pré-Fase 0).** App Next.js único, estático, com dados fictícios, para validar layout e fluxos na Vercel. Sem banco, auth ou integrações.

## Comandos

```bash
pnpm dev         # servidor local
pnpm build       # build de produção (todas as rotas são SSG)
pnpm test        # Vitest — regras de negócio
pnpm typecheck   # tsc --noEmit
```

Antes de commitar: `pnpm typecheck && pnpm test && pnpm build`.

## Estrutura

```
src/
  app/                 # rotas (App Router): /, /entrar, /clinica/*, /plantonista/*, /admin/*, /p/[slug]
  components/
    ui/                # primitivos (button, card, badge, field, switch, toast…) no estilo shadcn, sem Radix
    shared/            # logo, banner da demo, status badges, countdown, DemoButton
    shell/             # AppShell (clínica/admin) e PhoneShell (app do plantonista)
    clinic/ vet/ admin/ charts/
  lib/
    core/              # regras de negócio PURAS + testes (vira packages/core na Fase 0)
    mock/              # dados fictícios (data.ts), tipos e seletores (queries.ts)
    time.ts format.ts  # datas/formatos determinísticos (pt-BR, America/Sao_Paulo)
    labels.ts view.ts  # rótulos PT-BR e helpers de exibição
docs/plano-produto.md
```

## Decisões de arquitetura

- **App único em vez de monorepo (por enquanto).** Deploy zero-config na Vercel. Na Fase 0: Turborepo + pnpm, `src/lib/core` → `packages/core`, `src/lib/mock` → seeds em `packages/db`, app em `apps/web`.
- **Regras de negócio sem framework** em `src/lib/core` (elegibilidade, score, ondas, aceite, fechamento, cancelamento). Os seletores de mock usam essas regras, então os números da demo são coerentes.
- **Dinheiro sempre em centavos (inteiros).** Formatar só na borda (`formatBRL`).
- **Datas:** fuso fixo UTC-3 (Brasília). Formatação manual em `lib/format.ts` (sem `Intl`) para servidor e navegador gerarem o mesmo texto e evitar erro de hidratação.
- **"Agora" da demo:** `DEMO_NOW` = data do build às 09:40 (`NEXT_PUBLIC_DEMO_NOW` injetada em `next.config.ts`). Datas dos mocks são relativas: `at(diasDeHoje, hora, minuto)`.
- **Client components** recebem DTOs já formatados (strings/números), não objetos de domínio.
- **Ações não funcionais** usam `DemoButton`/`useToast` para avisar que nada é salvo.
- Interface em PT-BR; código, tipos e variáveis em inglês. TypeScript estrito com `noUncheckedIndexedAccess`.

## Pendências de produto refletidas no protótipo

- Quem paga a taxa da plataforma: `FeeBearer` em `core/settlement.ts`. A demo usa `"clinic"` (plantonista grátis, Seção 8). A Seção 4.6 sugere desconto do plantonista; decidir.
- Política de cancelamento: `core/cancellation.ts` implementa janela + % de compensação configuráveis; valores reais a definir.
- Gateway de pagamento, provedor de NFS-e e nome/marca: não implementados (Seção 11).

## Próximo passo (Fase 0 do plano)

Monorepo, CI (lint, typecheck, testes), Supabase local + Drizzle + seeds, auth por telefone/OTP, papéis/organizações com RLS, adapters em `packages/integrations` (interface + mock). Propor o plano técnico detalhado e aguardar aprovação antes de começar.
