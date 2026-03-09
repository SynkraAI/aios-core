# Task: find-0.8

> **Pareto ao Cubo** | Identificar 0,8% genialidade, 4% excelência, 20% impacto, 80% merda

**Task ID:** find-0.8
**Version:** 1.1.0
**Execution Type:** Agent (requires judgment to classify activities)
**Model:** `Sonnet` (needs reasoning for activity classification)
**Haiku Eligible:** NO — subjective assessment of "genialidade" vs "merda" requires interpretation
**Orchestrator:** @squad-chief

## Objetivo

Aplicar Pareto ao Cubo para mapear atividades/conhecimentos nas 4 zonas e priorizar o que realmente importa.

## Contexto

Pareto ao Cubo é a aplicação tripla da regra 80/20:
- **1ª aplicação**: 20% geram 80% dos resultados
- **2ª aplicação**: 4% (20% de 20%) geram 64% dos resultados
- **3ª aplicação**: 0,8% (20% de 4%) geram ~51% dos resultados

---

## As 4 Zonas

### 🔥 Zona de Genialidade (0,8%) → ~51% dos resultados

O que é um Resultado Lendário:
- Gera impacto exponencial (10x ou mais)
- IA não consegue ou não deveria te substituir
- Deixa um legado duradouro
- Inspira outros a se superarem
- Quebra padrões estabelecidos
- É digno de virar história

**Validação:**
- [ ] É sua maior paixão em ação?
- [ ] Transforma o "impossível" em realidade?
- [ ] Ninguém mais consegue fazer igual?
- [ ] Gera resultados exponenciais?
- [ ] Pode ser multiplicado pela IA (não substituído)?

### 💎 Zona de Excelência (4%) → ~64% dos resultados

**Validação:**
- [ ] Requer sua expertise única?
- [ ] Gera resultados consistentes?
- [ ] Pouquíssimas pessoas fazem tão bem?
- [ ] Tem potencial de escala?

### 🚀 Zona de Impacto (20%) → ~80% dos resultados

**Validação:**
- [ ] É estrategicamente importante?
- [ ] Requer conhecimento específico?
- [ ] Gera resultados significativos?
- [ ] Pode ser sistematizado?

### 💩 Zona de Merda (80%) → ~20% dos resultados ou menos

**Validação:**
- [ ] É repetitivo ou burocrático?
- [ ] Pode ser feito pela IA?
- [ ] Qualquer pessoa faria com treino básico?
- [ ] Consome energia sem gerar impacto real?

---

## >>> CHECKPOINT INTEGRAL: Este task É o Pareto ao Cubo <<<

```yaml
checkpoint_pareto_integral:
  consult: "MODELS.pareto_ao_cubo + OBSESSIONS.eficiencia_alavancagem_maxima"
  question: "Apliquei o framework COMPLETO (4 testes + 3 níveis de leverage)?"
  veto: "Task SEM framework completo = FAIL automático"
  hierarchy: "ELIMINA (80%) → AUTOMATIZA (restante) → AMPLIFICA (0.8%)"
  rationale: "Esta task É a implementação do modelo mental. Sem ele, não existe."
```

## Checklist Lendário (Fluxo de Decisão)

Aplique as perguntas EM ORDEM:

### 1. Teste de Impacto
> "Essa atividade gera resultados lendários?"

- **NÃO** → É 80% (Zona de Merda)
- **SIM** → Continue para próxima pergunta

### 2. Teste de Singularidade
> "Só eu consigo fazer isso com excelência?"

- **NÃO** → Continue para pergunta 3
- **SIM** → Continue para pergunta 4

### 3. Teste de Valor
> "Isso gera resultados importantes mesmo não sendo único?"

- **NÃO** → É 80% (Zona de Merda)
- **SIM** → É 20% (Zona de Impacto)

### 4. Teste de Genialidade
> "Isso me coloca em estado de flow e gera resultados lendários?"

- **NÃO** → É 4% (Zona de Excelência)
- **SIM** → É 0,8% (Zona de Genialidade)

---

## Perguntas Matadoras para 80%

### Perguntas de Eliminação
- "Se eu simplesmente parasse de fazer isso hoje, o que aconteceria de verdade?"
- "Alguém importante realmente sentiria falta disso?"
- "Isso existe só por hábito ou tem um propósito real?"

### Perguntas de Automação
- "Trinity IA poderia fazer isso em segundos?"
- "Existe um padrão repetitivo que poderia virar um processo automático?"
- "Quanto tempo eu economizaria automatizando isso?"

### Perguntas de Delegação
- "Para quem isso seria um 4% ao invés de um 80%?"
- "Quem cresceria profissionalmente fazendo isso?"
- "Por que eu ainda não deleguei isso?"

### Perguntas de Simplificação
- "Como fazer isso em metade do tempo?"
- "Quais partes desse processo são realmente necessárias?"
- "Existe uma versão mais simples que gera 80% do resultado?"

---

## Regras de Ouro

### Regra dos 2 Minutos
- Se leva menos de 2 minutos → faça agora
- Se leva mais → precisa de um sistema

### Regra do "Hell Yeah!"
- Se não for um "HELL YEAH!" → é um não
- Aplique especialmente para reuniões e novos compromissos

### Regra do Bloco Sagrado
- Concentre toda a "merda" em blocos específicos do dia
- Proteja ferozmente seu tempo de genialidade (0,8%)

---

## Ações Práticas por Zona

### Para 80% (Eliminar/Automatizar/Delegar)

| Ação | Como |
|------|------|
| **Eliminar** | Delete, cancele, diga não |
| **Automatizar** | Use IA, crie templates, configure gatilhos |
| **Delegar** | Documente uma vez, treine uma vez, solte de vez |

### Para 20% (Sistematizar)
- Criar SOPs
- Documentar processos
- Treinar equipe

### Para 4% (Alavancar)
- Manter alta qualidade
- Escalar com cuidado
- Não diluir expertise

### Para 0,8% (Proteger)
- Bloquear tempo sagrado
- Eliminar distrações
- Multiplicar via IA (não substituir)

---

## Template de Output

```yaml
# Pareto ao Cubo: {contexto}

## 🔥 Zona de Genialidade (0,8%)
- {atividade_1} → {justificativa}
- {atividade_2} → {justificativa}

## 💎 Zona de Excelência (4%)
- {atividade_3} → {justificativa}
- {atividade_4} → {justificativa}

## 🚀 Zona de Impacto (20%)
- {atividade_5} → {justificativa}
- {atividade_6} → {justificativa}

## 💩 Zona de Merda (80%)
- {atividade_7} → {justificativa}
- {atividade_8} → {justificativa}

## ✅ Recomendações

### Eliminar
- {item}

### Automatizar
- {item}

### Delegar
- {item}

### Proteger (0,8%)
- {item}
```

---

## Completion Criteria

| Critério | Status |
|----------|--------|
| Todas atividades passaram pelo Checklist Lendário | [ ] |
| Cada atividade classificada em uma zona | [ ] |
| Justificativa para cada classificação | [ ] |
| Recomendações de ação para cada zona | [ ] |
| 0,8% claramente identificado e protegido | [ ] |

---

## Nota Importante

> O que é "Zona de Merda" (80%) para uma pessoa pode ser "Zona de Genialidade" (0,8%) para outra.

A classificação depende de:
- Suas habilidades únicas
- Sua paixão
- Seu potencial de impacto
- Sua capacidade de execução

---

---

_Task Version: 1.1.0_
_Last Updated: 2026-02-11_

*"0,8% produz 51% dos resultados. Proteja a genialidade, elimine a merda."*
