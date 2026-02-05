# Task: score-delinquency
# FinHealth Squad | AIOS Task Format v1

name: score-delinquency
display_name: "Score de Inadimplência"
agent: cashflow-agent
squad: finhealth-squad
version: 1.0.0

## Objetivo

Calcular score de risco de inadimplência para pacientes particulares, baseado em histórico de pagamento, perfil e comportamento, permitindo priorização de cobranças e decisões de crédito.

## Input

```typescript
interface ScoreDelinquencyInput {
  paciente: {
    id: string;
    nome: string;
    cpf?: string;
    data_cadastro: string;
  };
  historico_pagamentos: Array<{
    data_vencimento: string;
    data_pagamento: string | null;
    valor: number;
    status: 'pago' | 'atrasado' | 'aberto' | 'inadimplente';
  }>;
  divida_atual?: {
    valor_total: number;
    dias_atraso: number;
    parcelas_abertas: number;
  };
  comunicacoes?: Array<{
    data: string;
    tipo: 'email' | 'telefone' | 'carta';
    resposta: boolean;
  }>;
  tenant_id: string;
}
```

## Output

```typescript
interface ScoreDelinquencyOutput {
  score: number;                     // 0-100 (0 = baixo risco, 100 = alto risco)
  classificacao: 'baixo' | 'medio' | 'alto' | 'critico';
  fatores: Array<{
    fator: string;
    peso: number;
    valor: number;
    contribuicao: number;
  }>;
  probabilidade_pagamento: {
    em_30_dias: number;
    em_60_dias: number;
    em_90_dias: number;
  };
  recomendacao: {
    acao: 'aguardar' | 'lembrete' | 'cobranca_ativa' | 'negociacao' | 'juridico';
    prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
    justificativa: string;
  };
  valor_recuperavel_estimado: number;
}
```

## Fatores de Score

| Fator | Peso | Descrição |
|-------|------|-----------|
| Histórico de pagamento | 35% | Taxa de pagamentos em dia |
| Dias em atraso | 25% | Atual atraso em dias |
| Valor da dívida | 15% | Proporcional ao total |
| Tempo de relacionamento | 10% | Antiguidade do cadastro |
| Responsividade | 10% | Resposta a comunicações |
| Negociações anteriores | 5% | Acordos cumpridos |

## Classificação

| Score | Classificação | Probabilidade Pag. | Ação |
|-------|---------------|-------------------|------|
| 0-25 | Baixo | > 80% | Aguardar/lembrete |
| 26-50 | Médio | 50-80% | Cobrança ativa |
| 51-75 | Alto | 20-50% | Negociação |
| 76-100 | Crítico | < 20% | Jurídico |

## Critérios de Aceite

- [ ] Score calculado com todos os fatores
- [ ] Contribuição de cada fator detalhada
- [ ] Probabilidade de pagamento estimada
- [ ] Ação recomendada clara
- [ ] Valor recuperável estimado
