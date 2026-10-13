# PlantãoVet (nome provisório) — Plano de Produto e Implementação

> Documento de entrada para o Claude Code. Contém visão, escopo, arquitetura, modelo de dados, regras de negócio e roadmap por fases.

---

## 0. Instruções para o Claude Code

- Implementar **fase por fase** (Seção 9). Não iniciar a fase seguinte sem a anterior com os critérios de aceite cumpridos.
- Antes de cada fase: propor o plano técnico detalhado (arquivos, migrations, endpoints) e aguardar aprovação.
- Integrações externas (WhatsApp, pagamentos, NFS-e) começam **com interface + mock**. A troca para o provedor real é feita só depois de eu fornecer as credenciais de sandbox.
- Nunca commitar segredos. Usar `.env.example` documentado.
- Todo código em TypeScript estrito. Testes obrigatórios para as regras de negócio (distribuição de vagas, cálculo de pagamento, conflitos de agenda).
- Idioma: interface em PT-BR; código, tabelas e variáveis em inglês.
- Manter um `CLAUDE.md` na raiz com as decisões de arquitetura e os comandos do projeto.

---

## 1. Visão do produto

Marketplace com SaaS de gestão para **plantões veterinários** (expansão futura para a medicina humana), substituindo grupos de WhatsApp onde "o primeiro que responde pega".

**Proposta de valor**
- **Plantonista:** vagas distribuídas de forma justa, pagamento garantido, extrato automático, gestão PJ e reputação verificada.
- **Contratante (clínica/hospital veterinário):** vaga urgente preenchida rápido, profissionais verificados, escala pronta e fechamento financeiro automático.

**Diferenciais**
1. Notificações e aceite pelo WhatsApp (baixa barreira de adoção).
2. Motor de distribuição justa e configurável.
3. Cálculo automático de **fixo + comissão sobre vendas do plantão** (modelo comum na veterinária).
4. Pagamento intermediado via gateway com split. A plataforma **nunca** custodia dinheiro em conta própria.

---

## 2. Personas e papéis

| Papel | Descrição | Canal principal |
|---|---|---|
| `vet` (plantonista) | Médico veterinário PJ/autônomo | App mobile + WhatsApp |
| `clinic_admin` | Dono/gestor da clínica | Painel web |
| `clinic_coordinator` | Monta escala, publica vagas | Painel web |
| `platform_admin` | Equipe interna (verificação, suporte, disputas) | Painel admin web |

Um usuário pode ser `vet` e também membro de uma clínica (multi-papel por organização).

---

## 3. Stack técnica

- **Monorepo:** Turborepo + pnpm
- **Linguagem:** TypeScript
- **Web (painel clínica + admin):** Next.js (App Router), Tailwind, shadcn/ui
- **Mobile (plantonista):** Expo / React Native (com Expo Router)
- **Backend/DB:** Supabase (Postgres, Auth, Storage, Row Level Security)
- **ORM/migrations:** Drizzle
- **Jobs e filas:** Inngest (ondas de distribuição, timeouts, lembretes, fechamentos)
- **Validação:** Zod (schemas compartilhados em `packages/core`)
- **Notificações:** WhatsApp Cloud API (oficial da Meta), push via Expo Notifications, e-mail via Resend
- **Pagamentos:** gateway com split (avaliar Asaas, Pagar.me, Iugu; requisito: split por recebedor e liberação condicionada)
- **NFS-e:** provedor de emissão via API (avaliar Focus NFe, NFE.io, eNotas), conforme municípios suportados
- **Mapas/distância:** geocoding de endereço + cálculo por Haversine (PostGIS opcional)
- **Observabilidade:** Sentry + logs estruturados
- **Testes:** Vitest (unit), Playwright (e2e web)
- **Deploy:** Vercel (web), EAS (mobile), Supabase Cloud

### Estrutura do monorepo
```
apps/
  web/        # Next.js: painel clínica, admin, API routes, webhooks
  mobile/     # Expo: app do plantonista
packages/
  core/       # regras de negócio puras (distribuição, cálculos, agenda) + schemas Zod
  db/         # schema Drizzle, migrations, seeds
  integrations/  # adapters: whatsapp, payments, nfse, geocoding (interface + mock + real)
  ui/         # componentes compartilhados (web)
```
As regras de negócio ficam em `packages/core` **sem dependência de framework**, 100% testáveis.

---

## 4. Funcionalidades por módulo

### 4.1 Cadastro e verificação
- Cadastro por telefone (OTP via WhatsApp/SMS) + e-mail.
- **Plantonista:** nome, CPF, CRMV (número + UF), especialidades, CNPJ (opcional na fase 1), endereço base, raio de atuação (km), foto, documentos (CRMV, diploma, certificados de especialização).
- **Clínica:** CNPJ, razão social, endereço(s) de unidade, responsável técnico, dados de pagamento.
- **Verificação de CRMV:** upload do documento + checagem manual pelo `platform_admin` na fase 1 (consulta pública ao conselho). Status: `pending | verified | rejected`. Automatizar só se existir fonte oficial estável.
- Selo "verificado" visível para as clínicas.

### 4.2 Vagas de plantão (shifts)
- Clínica cria vaga: unidade, data/hora início e fim, especialidade exigida, requisitos (experiência mínima, especialização), remuneração (fixo, % comissão, adicional noturno/feriado), observações.
- Tipos: **avulsa**, **recorrente** (gera série) e **urgente** (início em < 24h, distribuição acelerada).
- Status: `draft → open → offered → filled → in_progress → completed → closed` | `cancelled` | `no_show`.

### 4.3 Motor de distribuição justa
Configurável por clínica (política padrão + override por vaga).

**Modos**
1. `waves` (padrão): ondas sequenciais com timeout.
   - Onda 1: lista de favoritos da clínica.
   - Onda 2: elegíveis com maior **score**, dentro do raio.
   - Onda 3: todos os elegíveis.
   - Timeout por onda configurável (ex.: 15 min normal, 3 min urgente).
2. `rotation`: rodízio entre o banco de reserva (quem pegou menos plantões na clínica no mês tem prioridade).
3. `first_come_capped`: primeiro que aceitar, com teto de plantões por profissional/mês para evitar concentração.
4. `direct`: convite direto a um profissional.

**Elegibilidade (filtros obrigatórios)**
- CRMV verificado; especialidade compatível; dentro do raio; sem conflito de agenda;
- respeita descanso mínimo entre plantões (configurável, ex.: 11h) e limite de horas semanais;
- não bloqueado pela clínica.

**Score (para ordenação dentro das ondas)**, com pesos configuráveis:
- avaliação média recebida
- taxa de comparecimento (1 − no-show rate)
- histórico com a clínica (plantões cumpridos)
- distância (menor é melhor)
- equidade: penalidade para quem já pegou muitos plantões no período

Aceite: primeiro aceite válido dentro da onda vence, com **lock transacional** no banco (evitar dupla alocação). A clínica pode exigir **aprovação manual** antes de confirmar.

### 4.4 WhatsApp (canal principal do plantonista)
- Mensagem template com dados da vaga e botões **Aceitar / Recusar / Ver detalhes**.
- Webhook processa a resposta → valida elegibilidade → confirma ou informa "vaga já preenchida".
- Lembretes: 24h e 2h antes do plantão; check-in no início; confirmação de término.
- Opt-in explícito e preferências (horários de silêncio, tipos de vaga).
- Fallback para push no app.

### 4.5 Agenda e escala
- **Plantonista:** agenda unificada de todas as clínicas, alerta de conflito e descanso, exportação para calendário (ICS).
- **Clínica:** escala mensal por unidade (visão calendário e lista), lacunas destacadas, exportação PDF e planilha.
- **Trocas e doações de plantão:** plantonista oferece o plantão → elegíveis recebem → clínica aprova (configurável).
- **Check-in/check-out** no app (geolocalização opcional) para registrar a jornada.

### 4.6 Financeiro e pagamentos
- **Cálculo do plantão:** `total = fixo + (vendas_no_plantao × %comissao) + adicionais − descontos`.
  - Vendas no plantão informadas pela clínica no fechamento (fase 2: importação CSV; futuro: integração com sistemas de gestão veterinária).
  - Plantonista vê o cálculo detalhado e pode **contestar** (abre disputa).
- **Fluxo de pagamento (fase 2):**
  1. Ao confirmar a vaga, a clínica autoriza/paga o valor fixo via gateway.
  2. Após o check-out e o fechamento da comissão, o valor é liberado ao plantonista via split (descontada a taxa da plataforma).
  3. Disputas suspendem a liberação até resolução pelo `platform_admin`.
- **Extrato do plantonista:** por período, por clínica, previsto vs. recebido.
- **Relatório da clínica:** custo por plantão, por profissional, por unidade; exportação.
- **Antecipação de recebíveis (fase 3):** via parceiro financeiro. A plataforma só exibe a oferta e repassa os dados com consentimento.

### 4.7 Gestão PJ do plantonista (fase 3)
- Emissão de NFS-e por plantão ou consolidada no mês, via provedor.
- Painel de impostos estimados (por regime informado) e relatório para o contador.
- Conferência de notas pela clínica (nota recebida × plantões pagos).

### 4.8 Reputação e avaliações
- Avaliação **bidirecional** após cada plantão (1–5 + tags + comentário opcional).
- Métricas públicas do plantonista: nota média, plantões cumpridos, taxa de comparecimento, especialidades verificadas.
- Métricas da clínica visíveis ao plantonista: nota média, pontualidade de pagamento, estrutura.
- Perfil público do plantonista = **currículo verificado** (link compartilhável).

### 4.9 Banco de reserva e favoritos
- Clínica mantém lista de favoritos (prioridade na onda 1) e bloqueados.
- Convite de profissionais para o banco de reserva via link/WhatsApp.

### 4.10 Indicadores (dashboard da clínica)
- Taxa de preenchimento, tempo médio até preencher, no-shows, cancelamentos, custo médio por plantão, cobertura por período.

### 4.11 Clube de vantagens (fase 3)
- Catálogo de parceiros (insumos, cursos, seguro RC, contabilidade) com cupom/link rastreável.
- Segmentação por papel (plantonista/clínica). Registro de cliques e conversões para comissão.

### 4.12 Painel admin da plataforma
- Fila de verificação de CRMV/documentos.
- Gestão de usuários, clínicas, vagas, disputas, estornos.
- Configuração de taxas e pesos padrão do score.
- Auditoria (log de ações sensíveis).

---

## 5. Modelo de dados (inicial)

```
users(id, phone, email, full_name, cpf, created_at)
organizations(id, type['clinic'], legal_name, cnpj, payment_account_id, created_at)
org_members(org_id, user_id, role['clinic_admin','clinic_coordinator'])
clinic_units(id, org_id, name, address, lat, lng, timezone)

vet_profiles(user_id PK, crmv_number, crmv_uf, crmv_status, cnpj, base_lat, base_lng,
             radius_km, min_rest_hours, max_weekly_hours, bio, payout_account_id)
specialties(id, name)
vet_specialties(user_id, specialty_id, verified)
documents(id, owner_user_id, type, storage_path, status, reviewed_by, reviewed_at)

distribution_policies(id, org_id, mode, wave_timeouts jsonb, score_weights jsonb,
                      max_shifts_per_vet_month, require_manual_approval)
shifts(id, unit_id, specialty_id, starts_at, ends_at, type['single','recurring','urgent'],
       series_id, status, fixed_amount, commission_pct, extras jsonb, requirements jsonb,
       policy_id, assigned_vet_id, created_by)
shift_offers(id, shift_id, vet_id, wave, sent_at, channel, response['accepted','declined','expired'], responded_at)
shift_swaps(id, shift_id, from_vet_id, to_vet_id, status)
attendance(shift_id PK, check_in_at, check_out_at, check_in_lat, check_in_lng)

favorites(org_id, vet_id, kind['favorite','blocked'])
reviews(id, shift_id, from_user_id, to_user_id, direction['clinic_to_vet','vet_to_clinic'], rating, tags, comment)

shift_settlements(shift_id PK, sales_amount, fixed_amount, commission_amount, extras_amount,
                  discounts_amount, platform_fee, total_amount, status['pending','approved','disputed','paid'])
payments(id, settlement_id, provider, provider_ref, amount, status, paid_at)
disputes(id, settlement_id, opened_by, reason, status, resolution)
invoices(id, vet_id, provider_ref, period, amount, status, pdf_path)   -- fase 3

notification_prefs(user_id, whatsapp_opt_in, quiet_hours jsonb, push_token)
messages_log(id, user_id, channel, template, payload jsonb, status, created_at)
partners(id, name, category, audience, offer, tracking_url)              -- fase 3
partner_clicks(id, partner_id, user_id, created_at)
audit_log(id, actor_id, action, entity, entity_id, data jsonb, created_at)
```
- RLS no Supabase: plantonista vê só seus dados e as vagas ofertadas a ele; membros da clínica veem só dados da própria organização.
- Índices: `shifts(status, starts_at)`, `shift_offers(shift_id, response)`, geolocalização dos vets.

---

## 6. Regras de negócio críticas (testes obrigatórios em `packages/core`)

1. Nenhum vet pode ser alocado a dois plantões sobrepostos.
2. Descanso mínimo e limite semanal respeitados na elegibilidade.
3. Uma vaga só pode ter um aceite vencedor (concorrência testada).
4. Expiração de onda dispara a próxima onda; sem elegíveis → alerta à clínica.
5. Cálculo do `shift_settlement` correto para fixo, comissão, adicionais e descontos (casos de borda: vendas zero, comissão zero, plantão cancelado parcialmente).
6. Cancelamento pela clínica com menos de X horas → regra de compensação configurável.
7. No-show registra penalidade no score.
8. Score determinístico dado os mesmos insumos.

---

## 7. Segurança, LGPD e jurídico

- Base legal e consentimento explícitos (cadastro, WhatsApp opt-in, compartilhamento com parceiros).
- Dados pessoais mínimos; documentos em bucket privado com URLs assinadas.
- Direitos do titular: exportar e excluir conta.
- Termos de uso deixando claro que a plataforma **intermedeia** a contratação, sem vínculo empregatício.
- Pagamentos exclusivamente via gateway regulado (sem custódia em conta própria).
- Rate limit e validação de assinatura em todos os webhooks.
- Auditoria de ações sensíveis (aprovação de CRMV, alteração de valores, resolução de disputas).

---

## 8. Monetização (configurável no admin)

- Clínica: assinatura mensal por unidade **ou** taxa por plantão preenchido (% sobre o valor).
- Plantonista: grátis no básico; receita via antecipação (parceiro) e serviços PJ (fase 3).
- Parceiros: comissão do clube de vantagens.
- Billing das assinaturas via o mesmo gateway (fase 2).

---

## 9. Roadmap por fases

### Fase 0 — Fundação (1–2 semanas)
- Monorepo, CI (lint, typecheck, testes), Supabase local, Drizzle, seeds.
- Auth por telefone/OTP, papéis e organizações, RLS.
- Adapters em `packages/integrations` com interface + mock.
- **Aceite:** login funcionando no web e no mobile; CI verde.

### Fase 1 — MVP de distribuição (4–6 semanas)
- Cadastro de vet e clínica, upload de documentos, verificação manual no admin.
- Criação de vagas (avulsa, recorrente, urgente).
- Motor de distribuição (modos `waves` e `first_come_capped`), elegibilidade e score básico.
- WhatsApp: oferta com botões, aceite/recusa, lembretes (mock → sandbox real).
- Agenda do vet, escala mensal da clínica, favoritos e bloqueados.
- **Aceite:** clínica publica uma vaga urgente, vets elegíveis recebem no WhatsApp, o primeiro aceite válido é confirmado e aparece na escala e na agenda; testes de concorrência passando.

### Fase 2 — Financeiro e reputação (4–6 semanas)
- Check-in/out, fechamento com vendas do plantão, cálculo fixo + comissão.
- Pagamento via gateway com split, extrato do vet, relatório da clínica, disputas.
- Avaliações bidirecionais, perfil público verificado, score completo.
- Trocas e doações de plantão; modos `rotation` e `direct`.
- Dashboard de indicadores da clínica; assinatura das clínicas.
- **Aceite:** ciclo completo vaga → plantão → fechamento → pagamento liberado em sandbox do gateway.

### Fase 3 — Expansão de valor (contínuo)
- NFS-e e painel PJ; antecipação via parceiro; clube de vantagens.
- Importação de vendas de sistemas de gestão veterinária.
- Expansão para medicina humana (CRM, especialidades médicas, regras específicas).

---

## 10. Métricas de sucesso do piloto

- ≥ 3 clínicas ativas e ≥ 30 vets verificados na região piloto.
- Tempo médio para preencher vaga urgente < 30 min.
- Taxa de preenchimento > 90%.
- ≥ 50% das clínicas do piloto convertendo para pago após 60 dias.

---

## 11. Pendências para decisão (não implementar sem definição)

- Gateway de pagamento definitivo (verificar suporte a split + liberação condicionada).
- Provedor de NFS-e (cobertura dos municípios-alvo).
- Modelo de cobrança da clínica (assinatura × % por plantão).
- Política de cancelamento e penalidades.
- Nome e marca definitivos (verificar disponibilidade no INPI e domínio).
