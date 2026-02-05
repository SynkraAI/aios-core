# Task: score-glosa-risk
# FinHealth Squad | AIOS Task Format v1

name: score-glosa-risk
display_name: "Calcular Score de Risco de Glosa"
agent: auditor-agent
squad: finhealth-squad
version: 1.0.0

## Objetivo

Calcular um score preditivo de risco de glosa (0-100) para uma conta hospitalar, baseado em múltiplos fatores incluindo valor, complexidade, histórico da operadora e inconsistências detectadas.

## Input

```typescript
interface ScoreGlosaRiskInput {
  conta_id: string;
  valor_total: number;
  procedimentos_count: number;
  inconsistencias: Array<{
    tipo: string;
    severidade: 'baixa' | 'media' | 'alta';
  }>;
  operadora: {
    codigo_ans: string;
    taxa_glosa_historica: number;     // 0-1
    dias_medio_pagamento: number;
  };
  historico_similar?: {
    contas_enviadas: number;
    contas_glosadas: number;
  };
  tenant_id: string;
}
```

## Output

```typescript
interface ScoreGlosaRiskOutput {
  score: number;                       // 0-100
  classificacao: 'baixo' | 'medio' | 'alto' | 'critico';
  fatores_contribuintes: Array<{
    fator: string;
    peso: number;
    contribuicao: number;
    descricao: string;
  }>;
  probabilidade_glosa: number;         // 0-1
  valor_esperado_glosa: number;
  confianca_modelo: number;            // 0-1
  recomendacao: string;
}
```

## Fórmula de Cálculo

```
score = Σ (peso_i × valor_normalizado_i) × 100

Onde:
- valor_fator: valor do fator normalizado (0-1)
- inconsistencia_peso: peso atribuído às inconsistências
- operadora_historico: taxa histórica de glosa da operadora
- complexidade_fator: baseado em número de procedimentos
```

## Fatores e Pesos

| Fator | Peso | Descrição |
|-------|------|-----------|
| Valor da conta | 20% | Contas maiores recebem mais escrutínio |
| Complexidade | 15% | Mais procedimentos = mais risco |
| Inconsistências | 35% | Severidade × quantidade |
| Histórico operadora | 20% | Taxa histórica de glosa |
| Histórico similar | 10% | Contas similares glosadas |

## Classificação

| Score | Classificação | Probabilidade | Ação |
|-------|---------------|---------------|------|
| 0-25 | Baixo | < 10% | Enviar normalmente |
| 26-50 | Médio | 10-30% | Revisar antes de enviar |
| 51-75 | Alto | 30-60% | Corrigir problemas |
| 76-100 | Crítico | > 60% | Bloquear envio |

## Critérios de Aceite

- [ ] Score correlaciona com glosas reais (>70% precisão)
- [ ] Todos os fatores considerados
- [ ] Contribuição de cada fator detalhada
- [ ] Recomendação clara e acionável
