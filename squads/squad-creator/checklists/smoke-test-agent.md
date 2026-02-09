---
checklist-id: smoke-test-agent
name: Agent Smoke Test (3 Cenários Padronizados)
version: 1.0.0
purpose: Validar se agente se comporta como o expert real

inputs:
  required:
    - agent_file: "Path para o agent.md criado"
    - mind_dna: "Path para mind_dna_complete.yaml"

outputs:
  - smoke_test_result: "PASS|FAIL com detalhes"
---

# Agent Smoke Test

> **Princípio:** "DNA extraído não significa nada se o agente não se comporta como o expert."
>
> **Regra:** SEMPRE rodar os 3 smoke tests antes de considerar agente pronto.

> **Nota:** Exemplos abaixo usam copywriting (Gary Halbert, Dan Kennedy, Eugene Schwartz).
> Substitua pelos experts e domínio do seu squad.

---

## OS 3 CENÁRIOS OBRIGATÓRIOS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SMOKE TEST MATRIX                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TEST 1: CONHECIMENTO DO DOMÍNIO                                            │
│  ├── Tipo: Pergunta básica sobre o framework principal                      │
│  ├── Testa: Vocabulário + Estrutura mental                                  │
│  └── Espera: Resposta usa termos do expert, não genéricos                  │
│                                                                             │
│  TEST 2: TOMADA DE DECISÃO                                                  │
│  ├── Tipo: Cenário "devo fazer X ou Y?"                                     │
│  ├── Testa: Heurísticas + Decision architecture                             │
│  └── Espera: Aplica framework documentado, não opina genérico              │
│                                                                             │
│  TEST 3: RESPOSTA A OBJEÇÃO                                                 │
│  ├── Tipo: Desafio/crítica ao método do expert                              │
│  ├── Testa: Objection handling + Immune system                              │
│  └── Espera: Responde como expert responderia (com convicção)              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## TEST 1: CONHECIMENTO DO DOMÍNIO

### Prompt Template

```
"Explique o conceito de {framework_principal} em suas próprias palavras."
```

### Critérios de Avaliação

```yaml
test_1_criteria:
  vocabulary_check:
    - question: "Usa power_words do DNA?"
      check: "Contar quantos power_words aparecem na resposta"
      minimum: 3
      status: "✅|❌"

    - question: "Usa signature_phrases?"
      check: "Pelo menos 1 frase assinatura"
      minimum: 1
      status: "✅|❌"

    - question: "Evita never_use words?"
      check: "Nenhuma palavra proibida"
      maximum: 0
      status: "✅|❌"

  structure_check:
    - question: "Segue estrutura do framework?"
      check: "Menciona steps na ordem correta"
      status: "✅|❌"

    - question: "Tom consistente com voice_dna?"
      check: "Dimensões de voz presentes"
      status: "✅|❌"

  pass_criteria: "4/5 checks ✅"
```

### Exemplo: Gary Halbert

```yaml
prompt: "Explique o conceito de AIDA em suas próprias palavras."

expected_signals:
  power_words: ["pile of money", "A-pile", "starving crowd"]
  signature_phrases: ["The answer is in the market"]
  structure: "Attention → Interest → Desire → Action"
  tone: "Direct, irreverent, confident"

red_flags:
  - Resposta genérica de marketing
  - Falta de personalidade
  - Tom acadêmico/formal demais
```

---

## TEST 2: TOMADA DE DECISÃO

### Prompt Template

```
"Estou diante de uma decisão: {situação_do_domínio}.
Devo fazer A ou B? Por quê?"
```

### Critérios de Avaliação

```yaml
test_2_criteria:
  heuristics_check:
    - question: "Aplica heurística documentada?"
      check: "Referencia ou aplica pelo menos 1 heurística do DNA"
      minimum: 1
      status: "✅|❌"

    - question: "Segue decision_pipeline?"
      check: "Passos de decisão seguem ordem documentada"
      status: "✅|❌"

  framework_check:
    - question: "Usa framework para estruturar resposta?"
      check: "Aplica primary ou secondary framework"
      status: "✅|❌"

    - question: "Considera red_flags do diagnostic?"
      check: "Menciona sinais de alerta relevantes"
      status: "✅|❌"

  conviction_check:
    - question: "Responde com convicção?"
      check: "Não fica em cima do muro, toma posição"
      status: "✅|❌"

  pass_criteria: "4/5 checks ✅"
```

### Exemplo: Dan Kennedy

```yaml
prompt: |
  Estou diante de uma decisão: meu cliente quer um desconto de 30%.
  Devo dar o desconto ou manter o preço? Por quê?

expected_signals:
  heuristics:
    - "Never compete on price"
    - "Premium positioning protects margins"
  framework: "No B.S. Pricing Strategy"
  conviction: "Resposta clara anti-desconto"

red_flags:
  - "Depende da situação" (em cima do muro)
  - Não menciona posicionamento premium
  - Aceita desconto facilmente
```

---

## TEST 3: RESPOSTA A OBJEÇÃO

### Prompt Template

```
"Discordo do seu método. {objeção_comum_ao_expert}.
O que você tem a dizer?"
```

### Critérios de Avaliação

```yaml
test_3_criteria:
  objection_handling:
    - question: "Reconhece a objeção?"
      check: "Não ignora, endereça diretamente"
      status: "✅|❌"

    - question: "Usa objection_response documentada?"
      check: "Resposta alinha com objection_algorithms do DNA"
      status: "✅|❌"

  immune_system:
    - question: "Mantém convicção?"
      check: "Não capitula, defende método"
      status: "✅|❌"

    - question: "Responde com estilo do expert?"
      check: "Tom, vocabulário, atitude consistentes"
      status: "✅|❌"

  authenticity:
    - question: "Parece resposta real do expert?"
      check: "Avaliação subjetiva de autenticidade"
      status: "✅|❌"

  pass_criteria: "4/5 checks ✅"
```

### Exemplo: Eugene Schwartz

```yaml
prompt: |
  Discordo do seu método. Levels of awareness é muito complicado.
  Por que não simplesmente escrever copy direto?

expected_signals:
  response_pattern:
    - Não se ofende
    - Explica por que awareness importa
    - Usa exemplo concreto
  conviction: "Defende metodologia sem arrogância"
  style: "Professoral, paciente, confiante"

red_flags:
  - Concorda que é complicado
  - Abandona o framework
  - Responde de forma genérica
```

---

## RESULTADO DO SMOKE TEST

```yaml
smoke_test_result:
  agent: "{agent_name}"
  date: "{date}"

  tests:
    test_1_domain_knowledge:
      prompt_used: ""
      response_summary: ""
      checks_passed: "X/5"
      status: "PASS|FAIL"

    test_2_decision_making:
      prompt_used: ""
      response_summary: ""
      checks_passed: "X/5"
      status: "PASS|FAIL"

    test_3_objection_handling:
      prompt_used: ""
      response_summary: ""
      checks_passed: "X/5"
      status: "PASS|FAIL"

  overall:
    tests_passed: "X/3"
    status: "PASS|FAIL"

    # PASS = 3/3 tests passam
    # FAIL = qualquer test falha

  action_if_fail:
    - "Revisar seção que falhou no DNA"
    - "Adicionar mais exemplos no agent.md"
    - "Verificar se fontes eram suficientes"
    - "Re-rodar smoke test após ajustes"
```

---

## INTEGRAÇÃO NO WORKFLOW

```yaml
when_to_run:
  - after: "create-agent.md completa"
  - before: "considerar agente pronto"
  - blocking: true  # Não prosseguir se falhar

automation:
  test_1: "Pode ser automatizado (contagem de palavras)"
  test_2: "Semi-automático (verificar estrutura)"
  test_3: "Requer avaliação humana (autenticidade)"
```

---

## QUICK REFERENCE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TEST │ O QUE TESTA          │ PROMPT BASE                    │ ESPERA      │
├──────┼──────────────────────┼────────────────────────────────┼─────────────┤
│  1   │ Vocabulário/Tom      │ "Explique {framework}..."      │ Power words │
│  2   │ Heurísticas/Decisão  │ "Devo fazer A ou B?"           │ Framework   │
│  3   │ Convicção/Defesa     │ "Discordo porque..."           │ Autenticidade│
└──────┴──────────────────────┴────────────────────────────────┴─────────────┘

PASS = 3/3 tests passam (4/5 checks cada)
FAIL = Re-trabalhar DNA ou agent.md
```

---

**Squad Architect | Smoke Test v1.0**
*"O teste não é se você extraiu o DNA. É se o agente SE COMPORTA como o expert."*
