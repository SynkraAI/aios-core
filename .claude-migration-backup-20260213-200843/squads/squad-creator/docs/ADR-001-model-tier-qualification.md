# ADR-001: Model Tier Qualification Framework para Token Economy

**Status:** Accepted
**Date:** 2026-02-11
**Deciders:** Alan Nicolas, Pedro Valério (agent), Aria Architect (agent)
**Technical Area:** Squad Creator Token Optimization

---

## Contexto

O Squad Creator executa **42 tasks** que, por default, rodam em **Opus** (modelo mais caro). Análise identificou que muitas tasks são **determinísticas** (scoring, validação, checklists) e poderiam rodar em **Haiku** (93% mais barato) sem perda de qualidade significativa.

**Economia potencial estimada:** 25-40% do consumo de tokens.

**Problema central:** Como garantir que o modelo correto seja usado para cada task, sem depender de "boa vontade" do executor (LLM)?

---

## Drivers de Decisão (Heurísticas do Alan)

### 1. Self-Contained First
> "Quero algo self-contained dentro do squad-creator"

Soluções devem ser **isoladas e portáteis**. Não criar dependências externas quando pode resolver localmente.

### 2. Prove que Funciona, Não Assuma
> "Precisamos avaliar se a otimização com Haiku realmente está funcional"

Documentação ≠ Funcionamento. **Validação empírica** obrigatória antes de declarar vitória.

### 3. Questione o Caminho Errado
> "Se o executor não ler as instruções, o que acontece?"

Sempre perguntar **"o que impede o erro?"**. Se nada impede, o processo é ilusão.

### 4. Testar Antes de Escalar
> "Precisamos validar cada uma... antes de criar todas"

Nunca fazer batch sem **validar uma primeiro**. Escalar só após prova de conceito.

### 5. Desafie a Solução Proposta
> "Me prove que eu estou errado"

Forçar defesa da proposta com **fluxo concreto**. Happy path E failure path.

### 6. Busque Conhecimento Antes de Criar
> "Pesquise na documentação e na internet antes de continuarmos"

**Pesquisar > Especular**. Usar fontes existentes antes de inventar.

### 7. Mantenha Tudo Junto
> "Melhor deixar os logs dentro da pasta test-cases"

Arquivos relacionados devem estar **juntos**, não espalhados por convenção.

### 8. Documente o Processo, Não Só o Resultado
> "As heurísticas e decisões são ainda mais importantes"

O **como chegou** na solução é mais valioso que a solução em si.

---

## Opções Consideradas

### Opção A: Usar LLM Router Existente
```
infrastructure/services/llm-router/config/task-models.yaml
```
- ✅ Infraestrutura pronta
- ❌ Dependência externa ao squad-creator
- ❌ Não é self-contained

**Rejeitada:** Viola princípio de isolamento.

### Opção B: Config + Instruções no Squad Chief
```yaml
# model-routing.yaml
tasks:
  validate-squad.md:
    tier: haiku
```
Squad Chief lê config → passa `model: param` no Task()

- ✅ Self-contained
- ❌ Nada impede esquecer o param
- ❌ Enforcement por "boa vontade"

**Rejeitada:** Processo documentado, não funcional.

### Opção C: Skill Roteadora Única
Uma skill que faz lookup dinâmico e spawna com modelo correto.

- ✅ Centralizado
- ❌ Mesmo problema: nada impede não usar a skill
- ❌ Complexidade adicional sem enforcement real

**Rejeitada:** Trocou o problema de lugar.

### Opção D: Skills com `model:` no Frontmatter (ESCOLHIDA)
```yaml
# .claude/skills/pv-axioma-assessment/SKILL.md
---
name: pv-axioma-assessment
model: haiku  # ENFORCED pelo runtime
---
```

- ✅ Self-contained
- ✅ Enforcement real (runtime força o modelo)
- ✅ Cada skill é independente
- ⚠️ Requer criar skill por task (mais arquivos)
- ⚠️ Não impede 100% bypass (pode fazer inline)

**Aceita com ressalva:** Enforcement real quando skill é usada. Hook opcional para enforcement 100%.

### Opção E: Hook de Interceptação
Hook que intercepta todas as chamadas Task() e valida/injeta modelo.

- ✅ Enforcement 100%
- ❌ Complexidade alta
- ❌ Pode quebrar fluxos legítimos

**Postergada:** Implementar só se bypass for problema recorrente.

---

## Decisão

**Implementar Opção D (Skills com model: enforced) + Framework de Validação Empírica**

### Arquitetura Final

```
┌─────────────────────────────────────────────────────────────────┐
│  SKILL com model: haiku                                         │
│         ↓                                                       │
│  Invocação /skill-name                                          │
│         ↓                                                       │
│  Runtime FORÇA haiku                                            │
│         ↓                                                       │
│  ✅ ENFORCEMENT GARANTIDO                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Framework de Validação

```
┌─────────────────────────────────────────────────────────────────┐
│  OPUS = BASELINE (100%)                                         │
│                                                                 │
│  Para cada task:                                                │
│  1. Roda Opus → Gold Standard                                   │
│  2. Roda Sonnet → Compara (threshold: 95%)                      │
│  3. Roda Haiku → Compara (threshold: 90%)                       │
│                                                                 │
│  Haiku >= 90% → Criar skill com model: haiku                    │
│  Haiku < 90% → Compensar ou promover para Sonnet                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Consequências

### Positivas
- Enforcement real via runtime (não depende de instrução)
- Framework de validação empírica (não assume, prova)
- Self-contained no squad-creator
- Documentação de padrões aprendidos
- Métricas de economia rastreáveis

### Negativas
- Mais arquivos (1 skill por task = 15-30 skills)
- Não impede 100% bypass (inline ainda possível)
- Requer rodar bateria de testes (esforço inicial)

### Riscos
- Haiku pode degradar qualidade em tasks não testados
- Manutenção de skills + tasks (duplicação conceitual)

### Mitigações
- Validação empírica obrigatória antes de criar skill
- Compensações documentadas (examples, checklist, template)
- Hook disponível como fallback se bypass for problema

---

## Artefatos Criados

### Configuração
| Arquivo | Propósito |
|---------|-----------|
| [config/model-routing.yaml](../config/model-routing.yaml) | Mapeamento task → tier (41 tasks) |
| [config/scoring-rubric.yaml](../config/scoring-rubric.yaml) | Rubric de avaliação (5 dimensões) |

### Scripts
| Arquivo | Propósito |
|---------|-----------|
| [scripts/model-tier-validator.cjs](../scripts/model-tier-validator.cjs) | CLI: validate, list, report |
| [scripts/model-usage-logger.cjs](../scripts/model-usage-logger.cjs) | CLI: log, report (tracking) |

### Test Cases
| Arquivo | Propósito |
|---------|-----------|
| [test-cases/_template.yaml](../test-cases/_template.yaml) | Template para novos testes |
| [test-cases/pv-axioma-assessment/](../test-cases/pv-axioma-assessment/) | Primeiro test case validado |

### Skills
| Arquivo | Propósito |
|---------|-----------|
| [../../.claude/skills/pv-axioma-assessment/SKILL.md](../../../.claude/skills/pv-axioma-assessment/SKILL.md) | Primeira skill com model: haiku |

### Documentação
| Arquivo | Propósito |
|---------|-----------|
| [docs/MODEL-TIER-QUALIFICATION.md](./MODEL-TIER-QUALIFICATION.md) | Framework completo |
| [docs/ADR-001-model-tier-qualification.md](./ADR-001-model-tier-qualification.md) | Este documento |

---

## Comandos de Referência

```bash
# Listar test cases
node squads/squad-creator/scripts/model-tier-validator.cjs list

# Validar test case
node squads/squad-creator/scripts/model-tier-validator.cjs validate pv-axioma-assessment

# Relatório geral
node squads/squad-creator/scripts/model-tier-validator.cjs report

# Logar uso
node squads/squad-creator/scripts/model-usage-logger.cjs log <task> <model> <tokens_in> <tokens_out> <latency>

# Testar skill
/pv-axioma-assessment <target>
```

---

## Distribuição de Tasks por Tier

| Tier | Quantidade | Economia vs Opus | Exemplos |
|------|------------|------------------|----------|
| Haiku | 15 tasks | ~93% | validate-*, scoring, admin |
| Sonnet | 14 tasks | ~80% | create-docs, templates, collect |
| Opus | 12 tasks | baseline | extract-*-dna, create-agent |

**Total:** 41 tasks mapeados

---

## Próximos Passos

1. [x] Rodar teste empírico de pv-axioma-assessment em Haiku real ✅
2. [ ] Rodar bateria de testes para os 14 tasks haiku restantes
3. [ ] Rodar bateria de testes para os 14 tasks sonnet
4. [ ] Criar skills para tasks validados
5. [ ] Documentar compensações aplicadas
6. [ ] Avaliar necessidade de hook de enforcement

---

## Lição Aprendida: Cost-First, Not Token-First

**Data:** 2026-02-11
**Teste:** pv-axioma-assessment (Haiku vs Opus)

### Descoberta Crítica

A métrica correta é **$$$ economia**, não token economia.

```
ERRADO: "Haiku usou 3.6x mais tokens → preocupante"
CERTO:  "Haiku custou $0.018 vs Opus $0.285 → 93.7% economia"
```

### Por que isso importa

| Modelo | Tokens In | Tokens Out | Custo | % do Opus |
|--------|-----------|------------|-------|-----------|
| Opus | 15,000 | 800 | $0.285 | 100% |
| Haiku | 55,000 | 3,000 | $0.018 | 6.3% |

Haiku usou **3.6x mais tokens** mas custou **93.7% menos**.

### Nova Fórmula de Decisão

```python
def should_use_haiku(opus_baseline, haiku_result):
    quality_ratio = haiku_result.score / opus_baseline.score
    cost_ratio = haiku_result.cost / opus_baseline.cost

    # Qualidade >= 90% E custo < 50% → HAIKU
    if quality_ratio >= 0.90 and cost_ratio < 0.50:
        return True
    return False
```

### Atualização no Framework

- `config/scoring-rubric.yaml` atualizado com `cost_first_logic`
- Preços corrigidos para valores reais da API ($0.25/$1.25 Haiku vs $15/$75 Opus)
- Exemplo de cálculo incluído

---

## Meta-Learning: Padrões de Decisão

### Frases-Chave para Referência Futura

| Frase do Alan | Significa |
|---------------|-----------|
| "quero algo self contained" | Isolamento > Integração |
| "precisamos avaliar se realmente está funcional" | Empirismo > Teoria |
| "me prove que eu estou errado" | Desafie a proposta |
| "pesquise antes de continuarmos" | Conhecimento > Especulação |
| "chame o oalanicolas" | Múltiplas perspectivas |
| "tudo organizado no mesmo lugar" | Colocação lógica |
| "as heurísticas são ainda mais importantes" | Meta > Output |

### Decisões Rejeitadas e Motivos

| Decisão | Alternativa Rejeitada | Por Quê |
|---------|----------------------|---------|
| Self-contained | LLM Router existente | Portabilidade |
| Validar empiricamente | Confiar em instruções | Podem ser ignoradas |
| Skill com model: | Config + lookup manual | Skill é enforcement real |
| Testar 1 primeiro | Criar 15 de uma vez | Validar pattern antes |
| Logs junto com test-cases | Logs em outputs/ | Colocação lógica |

---

## Histórico

| Data | Mudança | Autor |
|------|---------|-------|
| 2026-02-11 | Criação inicial | Alan + Aria + PV |

---

*ADR Template based on [MADR](https://adr.github.io/madr/)*
