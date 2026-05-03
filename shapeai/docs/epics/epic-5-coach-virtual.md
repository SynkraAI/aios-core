# Epic 5 — Coach Virtual

**Status:** Planejado
**Prioridade:** Alta
**Estimativa:** 4–6 semanas
**Owner:** @pm (Morgan)
**Dependências:** Epic 2 (AI Pipeline), Epic 3 (Monetização)

---

## Visão

Transformar o ShapeAI de uma **análise pontual** em uma **relação contínua** com o usuário. Hoje o usuário recebe o plano de treino e fica sozinho. O Coach Virtual é um chatbot contextualizado que conhece os dados da análise corporal do usuário e age como um personal trainer acessível 24/7.

---

## Problema

O usuário recebe o relatório de shape e o plano de treino, mas não tem como:
- Tirar dúvidas sobre os exercícios do plano
- Pedir alternativas quando não tem equipamento ou tem limitações físicas
- Entender o que significa cada score da análise
- Ajustar o plano quando pula sessões ou muda de objetivo

Resultado: **churn precoce**. O usuário usa uma vez e abandona o app.

---

## Solução

Um chat integrado ao app, alimentado pelo Claude AI, com **contexto completo** do usuário:

| Contexto injetado | Fonte |
|-------------------|-------|
| Scores por grupo muscular | Última análise |
| Composição corporal (Vision AI) | Última análise |
| Plano de treino ativo | Última análise |
| Objetivo (hipertrofia, fat loss, condicionamento) | Perfil |
| Sexo, altura, peso | Perfil |
| Persona escolhida (Rafael / Marina / Bruno) | Perfil |

---

## O que o Coach Virtual faz

### Exercícios e treino
- Explicar qualquer exercício do plano (execução, músculos trabalhados, erros comuns)
- Sugerir alternativas por limitação física ("tenho dor no joelho, o que substitui o agachamento?")
- Sugerir alternativas por falta de equipamento ("não tenho barra, o que substitui a puxada?")
- Orientar sobre volume e carga progressiva
- Resolver conflitos de agenda ("pulei segunda, como reorganizo a semana?")

### Análise e progresso
- Explicar o que significa cada score ("meu score de costas é 42, por que é baixo?")
- Comparar análises anteriores em linguagem simples
- Motivar e contextualizar evolução

### Dúvidas gerais de fitness
- Aquecimento, alongamento, recuperação muscular
- Frequência de treino ideal para o objetivo
- Conceitos básicos de hipertrofia, cardio, periodização

---

## Fora de escopo (Epic 5)

- Plano alimentar / nutrição → **Epic 6** (feature separada)
- Integração com wearables
- Coach com voz
- Histórico de conversas entre sessões (v1 é stateless por sessão)

---

## Stories

### Story 5.1 — Endpoint de Chat no API Gateway
Criar `POST /chat` no API Gateway que:
- Requer autenticação
- Busca contexto do usuário (última análise + perfil)
- Chama Claude API com system prompt contextualizado
- Retorna resposta do coach

**AC principais:**
- System prompt injeta scores, composição corporal, plano ativo e objetivo
- Máximo 1024 tokens de resposta
- Fallback gracioso se não houver análise prévia (coach genérico sem contexto)
- Rate limit: 20 mensagens/dia para usuários Free, ilimitado para Pro

### Story 5.2 — Tela de Chat no App Mobile
Criar tela `/(app)/coach.tsx` com:
- Input de mensagem + botão enviar
- Lista de mensagens (usuário e coach)
- Indicador de loading enquanto coach responde
- Scroll automático para última mensagem
- Botões de atalho com perguntas frequentes ("Explique meu treino de hoje", "Alternativa para este exercício")

**AC principais:**
- Acessível via tab ou botão na tela de relatório/treino
- Design consistente com o resto do app (dark theme, verde #4CAF50)
- Funciona sem análise prévia (mensagem de onboarding contextual)

### Story 5.3 — Personas e System Prompt do Coach

O usuário escolhe uma das 3 personas na tela de perfil ou no onboarding do chat.
A escolha é salva em `user_profiles.coach_persona` e persiste entre sessões.

**As 3 personas:**

| Persona | Gênero | Tom | Tagline |
|---------|--------|-----|---------|
| **Rafael** | Masculino | Técnico e direto | *"Dados, progressão e resultado"* |
| **Marina** | Feminino | Motivacional e empático | *"Seu ritmo, sua evolução"* |
| **Bruno** | Masculino | Intenso e desafiador | *"Sem desculpas, só resultados"* |

Cada persona tem um system prompt distinto que define:
- Como o coach se apresenta pelo nome
- Tom das respostas (técnico vs motivacional vs desafiador)
- Forma de reagir ao progresso ("excelente dado" vs "você conseguiu!" vs "isso é o mínimo")
- Forma de reagir à falta de treino ("ajuste o volume" vs "tudo bem, vamos retomar" vs "sem desculpas")

**Regras comuns a todas as personas:**
- Sempre referencia dados reais do usuário quando relevante
- Não inventa dados — se não souber, diz que não sabe
- Disclaimer automático para dúvidas médicas ("consulte um profissional")
- Limita escopo a fitness, treino e atividade física (sem nutrição, sem medicina)
- Respostas em português brasileiro, sem markdown excessivo

**AC principais:**
- Migration: `ALTER TABLE user_profiles ADD COLUMN coach_persona VARCHAR(10) DEFAULT 'rafael'`
- Tela de seleção de persona com nome, tagline e exemplo de mensagem de cada uma
- API `/chat` lê `coach_persona` do perfil e carrega o system prompt correspondente
- Cada prompt testado com 10+ cenários de perguntas reais
- Default: Rafael (para usuários sem preferência definida)

### Story 5.4 — Rate Limiting e Monetização
Integrar o chat à camada de monetização:
- Usuários Free: 20 mensagens/dia
- Usuários Pro: ilimitado
- Contador visível na UI ("18/20 mensagens hoje")
- CTA para upgrade quando limite atingido

**AC principais:**
- Contador resetado à meia-noite (UTC-3)
- Limite salvo no banco (tabela `chat_usage`)
- API retorna 402 quando limite atingido
- App mostra paywall quando recebe 402

---

## Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| % usuários que abrem o chat após análise | > 40% |
| Mensagens por sessão (média) | > 3 |
| Retenção D7 de usuários que usaram o chat | > 60% |
| Conversão Free → Pro via chat CTA | > 5% |

---

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Custo alto de API (Claude) | Rate limit + cache de respostas comuns |
| Respostas imprecisas sobre exercícios | System prompt com instruções de escopo + disclaimer |
| Usuário pede nutrição no chat | Coach redireciona educadamente para Epic 6 |
| Latência alta da API | Streaming de resposta (token a token) |

---

## Ordem de Implementação

```
Story 5.1 → Story 5.3 → Story 5.2 → Story 5.4
(backend)   (prompt)    (frontend)   (monetização)
```

5.1 e 5.3 podem rodar em paralelo.

---

*Epic criado por @pm (Morgan) · ShapeAI · 2026-05-03*
