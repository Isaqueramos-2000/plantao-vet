# PlantãoVet (nome provisório)

Protótipo **visual e navegável** do marketplace + SaaS de gestão de plantões veterinários.
Sem backend: todas as telas usam **dados fictícios** e nenhuma ação é salva.

O plano de produto completo está em [`docs/plano-produto.md`](docs/plano-produto.md).

## Rodar localmente

Requisitos: Node 20.9+ e pnpm 10.

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # regras de negócio (Vitest)
pnpm typecheck
pnpm build        # build de produção (páginas estáticas + proxy de senha)
```

## Publicar na Vercel

1. Em [vercel.com/new](https://vercel.com/new), importe este repositório do GitHub.
2. Em **Environment Variables**, adicione `DEMO_PASSWORD` com a senha de acesso.
3. Clique em **Deploy**. A Vercel detecta Next.js e pnpm sozinha.

## Acesso por senha

Todas as páginas exigem a senha definida em `DEMO_PASSWORD` (tela `/acesso`; o acesso vale por 30 dias no navegador).

- A senha **não fica no código**: só na variável de ambiente da Vercel.
- Para trocar: Vercel → projeto → Settings → Environment Variables → editar `DEMO_PASSWORD` → Deployments → **Redeploy**. Quem entrou com a senha antiga perde o acesso.
- Sem a variável, o site em produção fica bloqueado. Em `pnpm dev`, sem a variável, o acesso é livre.
- Para testar localmente com senha: crie `.env.local` com `DEMO_PASSWORD=...` (arquivo ignorado pelo git).

A data "de hoje" dos dados fictícios é fixada no momento do build. Cada novo deploy atualiza a demo.
Para congelar uma data, defina `NEXT_PUBLIC_DEMO_NOW` (ISO 8601) nas variáveis de ambiente da Vercel.

## Telas

| Perfil | Rota | Destaques |
|---|---|---|
| Landing | `/` | Proposta de valor, como funciona, motor de distribuição, FAQ |
| Login | `/entrar` | Telefone, código pelo WhatsApp e escolha de perfil (simulados) |
| Clínica | `/clinica` | Dashboard com KPIs, vaga urgente em distribuição, lacunas, próximos plantões |
| | `/clinica/vagas` | Lista com filtros por status e unidade, busca |
| | `/clinica/vagas/nova` | Formulário com prévia de custo e da mensagem de WhatsApp em tempo real |
| | `/clinica/vagas/[id]` | Ondas de distribuição com contagem regressiva, elegibilidade, fechamento, histórico |
| | `/clinica/escala` | Calendário mensal por unidade, lacunas, cobertura |
| | `/clinica/banco-de-reserva` | Favoritos, bloqueados, convite por link |
| | `/clinica/financeiro` | Fechamento com cálculo ao vivo (fixo + comissão), histórico, disputas |
| | `/clinica/configuracoes` | Política de distribuição e pesos do score com ranking recalculado ao vivo |
| Plantonista | `/plantonista` | Ofertas com timer da onda, aceite/recusa, alerta de descanso entre plantões |
| | `/plantonista/whatsapp` | Conversa simulada: oferta com botões, confirmação ou "vaga já preenchida" |
| | `/plantonista/agenda` | Agenda unificada, alerta de descanso, exportação **.ics real** |
| | `/plantonista/extrato` | Previsto × a receber × recebido, detalhamento, contestação |
| | `/plantonista/perfil` | CRMV, preferências, documentos, LGPD |
| Público | `/p/[slug]` | Currículo verificado compartilhável (ex.: `/p/marina-albuquerque`) |
| Admin | `/admin` | Métricas do piloto, filas e alertas |
| | `/admin/verificacoes` | Fila de verificação de CRMV com checklist |
| | `/admin/disputas` · `/admin/auditoria` | Mediação de disputas e log de ações sensíveis |

O seletor no topo de todas as páginas troca de perfil.

## O que já é "de verdade"

As regras de negócio em `src/lib/core` são código de produção, puro e testado (33 testes):
elegibilidade (conflito, descanso, limite semanal, raio, CRMV, bloqueio), score determinístico,
planejamento de ondas, aceite vencedor único, fechamento financeiro e compensação de cancelamento.
Os números exibidos na demo (ondas, elegíveis, scores, valores) são calculados por essas regras.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript estrito · Tailwind CSS 4 · lucide-react · Vitest.
