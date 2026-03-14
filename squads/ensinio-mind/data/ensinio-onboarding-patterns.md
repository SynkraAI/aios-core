# Ensinio — Padrões de Onboarding & Migração

> Dados reais extraídos de calls de vendas (Ricardo) e suporte (Bhrenda). Alimentado pela task `extract-from-calls.md`.

## Padrões de Migração por Plataforma Anterior

| Plataforma anterior | Estratégia de migração | Timeline | Riscos | Fonte |
|---------------------|----------------------|----------|--------|-------|
| **Hotmart** | Manter alunos antigos na Hotmart (integração), migrar novos para Ensinio. Checkout paralelo possível (teste A/B com Eduzz). | 20-30 dias | Reprocessamento de cartão pode causar churn de alunos antigos | tl;dv call "69b45eb" |
| **Academia** | Migração completa. Planilha de alunos (bulk import). Aguardar App 2.0 (abril) para timing ideal. | 2-4 semanas | Launch em progresso pode atrasar início | tl;dv call "Como Elevar" |
| **Carne Academia** | Migração gradual "formiguinha" (3-6 meses). Manter plataformas em paralelo. | 3-6 meses | Duplo custo, fragmentação de esforço, risco de esquecimento | tl;dv call "Continuação Luiz e Flávia" |
| **WhatsApp manual** | Sem migração de conteúdo. Setup de AI Agent do zero. | 2-5 dias | Curva de aprendizado do prospect, expectativa de ROI imediato | tl;dv call "Como implementar agentes" |

## Componentes do Onboarding (Ricardo)

### Migração Assistida
Ricardo usa a metáfora da mudança de casa:
> "Vocês tiram os pertences da gaveta e colocam numa caixa. A gente pega essa caixa e leva pra nova casa."

**Fluxo:**
1. Prospect exporta dados (planilha CSV ou acesso à plataforma anterior)
2. Ensinio importa estrutura (cursos → módulos → aulas)
3. Prospect valida e faz ajustes visuais (capas, descrições)
4. Alunos migrados via bulk import ou convite por email

### Trilha de Onboarding
1. **Trilha gravada** (vídeos do Gui Ávila no YouTube) — autoserviço
2. **Call de tira-dúvidas** com gerente de conta (Bhrenda) — agendada
3. **Check-in em 21 dias** — "a gente pega no pé de vocês de forma positiva"

> "Nada mais justo que vocês usarem 100% do que vocês estão investindo." — Ricardo

### Prazos Reais Comunicados
| Item | Prazo comunicado | Prazo real estimado |
|------|-----------------|-------------------|
| Migração de aulas | "Máximo 30 dias" | 20-25 dias |
| App Apple (aprovação) | "2 meses" | 1-1.5 meses |
| App Google Play | "10-15 dias" | Similar |
| Setup básico (sem migração) | "2-3 dias" | 2-3 dias |
| AI Agent configurado | "2 dias" | 1-2 dias (co-criação na call) |

**Padrão Ricardo:** Over-promete prazo para cima (ex: fala 2 meses, entrega em 1.5). Gera surpresa positiva.

## Fricções Comuns por Etapa

| Etapa | Fricção | Frequência | Solução Padrão | Fonte |
|-------|---------|-----------|----------------|-------|
| Migração | Reprocessamento de cartão (alunos antigos) | Alta | Manter alunos na plataforma anterior, migrar só novos | tl;dv call "69b45eb" |
| Migração | Volume alto de aulas (600+ aulas) | Média | Planilha assistida + time acelera para 20-25 dias | tl;dv call "69b45eb" |
| Setup | Falta de autonomia para banners/CTAs | Alta (quem vem de Academia) | Ensinio permite edição direta (sem suporte) | tl;dv call "Como Elevar" |
| Setup | Push notifications (sem app nativo atual) | Média | App 2.0 vindo em abril, usar Telegram/WhatsApp enquanto isso | tl;dv call "Como Elevar" |
| AI Agent | Curva de aprendizado do prospect | Alta | Co-criação ao vivo na call + follow-up sexta | tl;dv call "Como implementar agentes" |
| AI Agent | Consumo de créditos alto (franquias) | Média | Testar com 300 créditos grátis, calcular média real | tl;dv call "Como automatizar vendas" |

## FAQs de Vendas (Perguntas Reais dos Prospects)

| Pergunta | Resposta Padrão | Fonte |
|----------|----------------|-------|
| "Aceita compras internacionais?" | "Sim, com American Express. Para outros cartões, integração com Hotmart/Stripe." | tl;dv call "Como Elevar" |
| "Posso usar YouTube mascarado + Ensinio Stream?" | "Sim, modelo híbrido. Alguns vídeos no YouTube mascarado, outros no Ensinio Stream (com Chromecast/Airplay)." | tl;dv call "69b45eb" |
| "Transmite para TV?" | "Ensinio Stream sim (Chromecast + Airplay). YouTube mascarado não permite." | tl;dv call "69b45eb" |
| "Tem fidelidade/carência?" | "Não tem fidelidade. Cancela quando quiser, igual Netflix." | tl;dv call "Como implementar agentes" |
| "A IA aparece como assistente virtual?" | "Pode configurar como 'secretária da [nome]', não como assistente virtual." | tl;dv call "Como implementar agentes" |
| "Armazenamento da comunidade enche?" | "Pesa muito pouco. Vídeo aula é o que conta. Nunca vimos problema." | tl;dv call "Continuação Luiz e Flávia" |

## Padrões de Setup por Nicho

| Nicho | Necessidades principais | Timeline típico | Gargalos comuns | Fonte |
|-------|------------------------|----------------|----------------|-------|
| Educação religiosa | UX premium, modelo assinatura, gamificação | 20-30 dias (migração de 600+ aulas) | Volume de conteúdo, checkout duplo durante transição | tl;dv call "69b45eb" |
| Blog monetization (grande criador) | App nativo, push notifications, autonomia de edição, multi-organização | 2-4 semanas (aguardar App 2.0) | Decisor ausente, launch em curso | tl;dv call "Como Elevar" |
| Advocacia online | AI Agent para qualificação de leads, follow-up automatizado | 2-5 dias | Expectativa ROI imediato, negócio novo | tl;dv call "Como implementar agentes" |
| Franquias educacionais | AI Agent para padronização de atendimento, integração CRM | 1-2 semanas (trial first) | Volume alto de créditos, ceticismo de chatbot | tl;dv call "Como automatizar vendas" |
| Costura/modelagem | Migração gradual, comunidade, programa de afiliados | 3-6 meses (paralelo) | Checkout internacional, antecipação de pagamento | tl;dv call "Continuação Luiz e Flávia" |

## Métricas de Onboarding

| Métrica | Valor | Última Atualização | Fonte |
|---------|-------|--------------------|-------|
| Tempo médio de setup (sem migração) | 2-3 dias | 2026-03-14 | tl;dv calls |
| Tempo médio de migração completa | 20-30 dias | 2026-03-14 | tl;dv call "69b45eb" |
| Taxa de conclusão do onboarding | *(pendente — dados de Bhrenda necessários)* | | |
| Principal motivo de ticket pós-setup | *(pendente — dados de Bhrenda necessários)* | | |

---

**Versão:** 2.0.0 | **Atualizado:** 2026-03-14 | **Fonte principal:** tl;dv calls batch 1 (Ricardo, 5 calls)
