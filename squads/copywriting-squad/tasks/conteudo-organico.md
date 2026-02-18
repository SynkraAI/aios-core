# Task: Conteudo Organico

```yaml
task_id: conteudo-organico
task_name: "Criar Copy para Conteudo Organico"
version: 1.0.0
estimated_time: "2-4h"
status: pending
responsible_executor: "@copy-maestro (orquestra clones)"
execution_type: Agent
elicit: true
```

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Criar Copy para Conteudo Organico |
| **status** | `pending` |
| **responsible_executor** | @copy-maestro → delega para clones por fase |
| **execution_type** | `Agent` |
| **input** | Nicho, plataforma, estilo de marca, temas, objetivo |
| **output** | Batch de posts, threads, carrousseis, newsletters |
| **action_items** | 5 steps |
| **acceptance_criteria** | 6 criteria |

---

## Overview

Workflow para criar conteudo organico de alta performance: posts para redes sociais, threads virais, carrousseis educativos e newsletters. Foco em construir autoridade e gerar leads sem investimento em ads.

## Quando Usar

- Construcao de audiencia organica (Instagram, LinkedIn, Twitter/X)
- Lancamento de newsletter ou blog
- Estrategia de personal brand
- Conteudo educativo para nutrir audiencia
- Pre-lancamento de produto (esquentar audiencia)

---

## Input

- **Nicho/Mercado** (obrigatorio): Area de atuacao
- **Plataforma** (obrigatorio): Instagram, LinkedIn, Twitter/X, YouTube, Newsletter
- **Estilo de Marca** (obrigatorio): Provocativo, educativo, inspiracional, tecnico
- **Temas Principais** (obrigatorio): 3-5 pilares de conteudo
- **Objetivo** (obrigatorio): Autoridade, leads, vendas, engajamento
- **Frequencia** (opcional): Posts/semana desejados
- **Tom de Voz** (opcional): Referencia de influenciador/marca

## Output

- **Batch de Posts**: 10-20 posts prontos para publicar
- **Threads/Carrousseis**: 3-5 piecas longas educativas
- **Headlines/Hooks**: Bank de 20+ aberturas testadas
- **Calendario Editorial**: Sugestao de distribuicao semanal
- **Newsletter Template**: Estrutura para emails recorrentes (se aplicavel)

---

## Action Items

### Step 1: Estrategia de Conteudo
**Clone:** @todd-brown (Big Idea) + @dan-kennedy (avatar)

1. Definir Big Idea central da marca (o que te diferencia)
2. Mapear 3-5 pilares de conteudo alinhados ao produto/servico
3. Identificar avatar do leitor/seguidor ideal
4. Definir tom e personalidade da comunicacao
5. Mapear conteudo de concorrentes (o que funciona, o que evitar)

**Output:** Estrategia de conteudo documentada

---

### Step 2: Hooks e Aberturas
**Clone:** @gary-bencivenga (curiosidade) + @dan-koe (viral)

1. Criar 20+ hooks de abertura por categoria:
   - Curiosidade: "A maioria das pessoas nao sabe que..."
   - Contrarian: "Tudo que te ensinaram sobre X esta errado"
   - Story: "Perdi R$50k porque..."
   - Data: "97% das pessoas falham em X porque..."
2. Testar hooks com Sugarman triggers
3. Selecionar top 10 para uso imediato

**Output:** Hook bank categorizado

---

### Step 3: Posts e Threads
**Clone:** @dan-koe (organico) + @ben-settle (personalidade)

1. Criar 10-20 posts curtos (150-300 palavras)
2. Criar 3-5 threads/carrousseis longos (800-1500 palavras)
3. Variar formatos: lista, historia, contrarian, tutorial, caso
4. Incluir CTAs suaves (seguir, salvar, comentar, link na bio)
5. Adaptar formato por plataforma

**Output:** Batch de conteudo pronto para publicar

---

### Step 4: Newsletter/Email (se aplicavel)
**Clone:** @ben-settle (infotainment) + @andre-chaperon (sequencia)

1. Definir formato da newsletter (educativa, curada, opinion)
2. Criar template recorrente com secoes fixas
3. Escrever 2-4 edicoes completas como modelo
4. Definir cadencia (diaria, semanal, quinzenal)

**Output:** Template + 2-4 edicoes modelo

---

### Step 5: Audit e Calendario
**Clone:** @claude-hopkins (otimizacao)

1. Revisar todo conteudo contra checklist de qualidade
2. Verificar consistencia de tom e mensagem
3. Organizar em calendario editorial semanal
4. Identificar oportunidades de reaproveitamento (post → thread → newsletter)

**Output:** Calendario editorial + conteudo revisado

---

## Acceptance Criteria

- [ ] **AC1:** Estrategia de conteudo documentada com pilares e avatar
- [ ] **AC2:** Minimo 20 hooks de abertura categorizados
- [ ] **AC3:** 10+ posts curtos prontos para publicar
- [ ] **AC4:** 3+ threads/carrousseis longos
- [ ] **AC5:** Calendario editorial com distribuicao semanal
- [ ] **AC6:** Tom e mensagem consistentes em todo o batch

## Veto Conditions

- **VETO-CO-1:** Conteudo sem Big Idea central definida → PARAR, voltar ao Step 1
- **VETO-CO-2:** Posts sem hook de abertura forte → REESCREVER com hooks do Step 2
- **VETO-CO-3:** Conteudo generico sem personalidade/opiniao → REESCREVER com @ben-settle
- **VETO-CO-4:** Todo post e CTA de venda → EQUILIBRAR (80% valor, 20% venda)

## Anti-Patterns

- Criar conteudo generico que qualquer um poderia postar — precisa ter opiniao e personalidade
- Todos os posts serem venda direta — organico constroi relacao primeiro
- Copiar formato de outra plataforma sem adaptar (thread no Instagram, carrossel no Twitter)
- Ignorar hooks — primeiras palavras determinam se alguem para para ler
- Postar sem estrategia de pilares — parece aleatorio e nao constroi autoridade
- Usar linguagem corporativa em plataformas casuais (Instagram, Twitter)

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | Publicacao + monitoramento de metricas |
| **Trigger** | Batch de conteudo aprovado |
| **Executor** | Usuario (publicacao manual ou agendamento) |

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Squad: copywriting-squad_
