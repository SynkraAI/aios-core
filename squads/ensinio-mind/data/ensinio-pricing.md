# Ensinio — Pricing & Modelo de Negócios

> Source of Truth para todos os squads ensinio-*
> Atualizado: 2026-03-02
> Fontes: ensinio.com/planos, Pitch Deck 2026

---

## Planos Ensinio Club

| | Starter | Professional | Business | Enterprise |
|---|---------|-------------|----------|------------|
| **Preço/mês** | **R$ 0** (grátis) | **R$ 399/mês** | **R$ 999/mês** | **R$ 1.999/mês** |
| Área de membros | Sim | Sim | Sim | Sim |
| Hospedagem de vídeo | Sim | Sim | Sim | Sim |
| Agentes IA ilimitados | Sim | Sim | Sim | Sim |
| Comunidades | Sim | Sim | Sim | Sim |
| Gamificação | Sim | Sim | Sim | Sim |
| Checkout integrado | Sim | Sim | Sim | Sim |
| Usuários ilimitados | Sim | Sim | Sim | Sim |
| Trilhas de conhecimento | - | Sim | Sim | Sim |
| Agentes IA customizados | - | Sim | Sim | Sim |
| Loja de recompensas | - | Sim | Sim | Sim |
| Esconder marca Ensinio | - | Sim | Sim | Sim |
| Integração outros checkouts | - | Sim | Sim | Sim |
| App mobile (em breve) | - | - | Sim | Sim |
| Quizzes | - | - | Sim | Sim |
| Anamnese | - | - | Sim | Sim |
| Tarefas | - | - | Sim | Sim |
| Analytics avançado | - | - | Sim | Sim |
| Aulas ao vivo | - | - | - | Sim |
| Organizações multi-tenant | - | - | - | Sim |
| SCORM | - | - | - | Sim |
| API pública | - | - | - | Sim |
| SSO (Google/Okta/Microsoft) | - | - | - | Sim |

---

## Ensinio Pay — Taxas

| Taxa | Valor |
|------|-------|
| **Comissão por venda** | 6,99% + R$ 0,99 |
| Taxa de parcelamento | 3,49% a.m. |
| Taxas de saque/estorno/chargeback | R$ 3,89 a R$ 10,00 |

**Nota:** A taxa de 6,99% + R$ 0,99 se aplica em TODOS os planos, incluindo o Starter gratuito.

---

## Add-ons

| Add-on | Preço |
|--------|-------|
| Créditos Extras de IA | +R$ 99,00 / 1.000 créditos / mês |
| Colaboradores Extras | +R$ 99,00 / colaborador / mês |
| Pacotes de E-mail Extras | R$ 49,00 / 1.000 e-mails / mês |
| Transmissão Ao Vivo Extra | R$ 29,00 / transmissão / mês |
| Dispositivo de WhatsApp Extra | R$ 99,00 / dispositivo / mês |
| **Ensinio Care** | A partir de R$ 5.000,00 / mês |
| **Ensinio Corporate** | Enterprise + R$ 5,00 / usuário (mínimo 500 usuários) |

### Nota sobre créditos de IA:
Em média, um infoprodutor utiliza 2.700 créditos para atendimento de suporte no mês, seguindo as configurações padrões da Ensinio AI. A utilização de créditos varia conforme o modelo LLM escolhido, a quantidade de mensagens e o esforço de resolução.

---

## Modelo de Receita

O modelo de negócios da Ensinio combina **duas fontes de receita**:

1. **Assinatura mensal** (Ensinio Club) — Receita previsível por plano
2. **Taxa transacional** (Ensinio Pay) — 6,99% + R$0,99 por venda realizada na plataforma

Isso significa que quanto mais o cliente vende, mais a Ensinio ganha — alinhamento de incentivos.

---

## Argumentos de Preço

### Para quem acha caro:
- O plano Starter é **gratuito** — comece sem investimento
- Compare com o custo de contratar 5+ ferramentas separadas (área de membros + checkout + comunidade + gamificação + IA)
- O produtor paga pela plataforma com as vendas (taxa transacional)

### Para quem compara com concorrentes:
- Hotmart/Kiwify cobram taxa similar (~9-12%) mas NÃO oferecem área de membros, comunidade, gamificação e IA integrados
- Memberkit/Cademi cobram mensalidade mas NÃO têm checkout próprio — você ainda paga taxa do checkout externo
- Ensinio é a única que oferece o ecossistema completo em um só lugar

---

## Padrões de Negociação Observados (tl;dv, 2026-03)

### Taxa de Checkout Negociável
| Cenário | Taxa padrão | Taxa negociada | Gatilho |
|---------|-------------|----------------|---------|
| Faturamento > 50K/mês | 6,99% + R$0,99 | **4,99% + R$0,90** | Volume alto justifica |
| Teste A/B com Eduzz | 6,99% | **4,99%** | Prospect quer manter opção de Eduzz |
| Storage/bandwidth equivalente | Preço tabela | **Bônus incluído** | Prospect vem de Panda (R$764/mês) |

**Insight:** Para recorrência alta, a taxa de checkout é 10x mais relevante que mensalidade:
> "1% que a gente negocia faz mais diferença do que R$100 da mensalidade." — Prospect nicho católico
(Fonte: tl;dv call "69b45eb", 2026-03)

### AI Agent Pricing (Produto Novo)
| Componente | Valor |
|-----------|-------|
| Créditos (1.000) | R$99/mês |
| Conexão WhatsApp | R$99/dispositivo/mês |
| **Pacote mínimo** | **R$200/mês** (1K créditos + 1 WhatsApp) |
| Consumo médio (infoprodutor suporte) | ~2.700 créditos/mês |
| Consumo alto (franquia 60-70 leads/dia) | ~60.000 créditos/mês (~R$6.000/mês) |

**Modelos de IA e consumo:**
- GPT-5 mini: 1 crédito/ação
- GPT-5: 5 créditos/ação

**Sensibilidade:** Alta para volumes grandes. Ricardo oferece "pacote customizado" para desconto por volume, mas não tem tabela fixa. Pendente definir tiers de volume.
(Fonte: tl;dv calls "Como implementar agentes" + "Como automatizar vendas", 2026-03)

---

**Versão:** 2.0 | **Data:** 2026-03-14 | **Fonte:** ensinio.com + Pitch Deck 2026 + tl;dv calls batch 1 (2026-03)
