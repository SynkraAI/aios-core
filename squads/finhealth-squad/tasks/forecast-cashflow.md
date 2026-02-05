# Task: forecast-cashflow
# FinHealth Squad | AIOS Task Format v1

name: forecast-cashflow
display_name: "Projeção de Fluxo de Caixa"
agent: cashflow-agent
squad: finhealth-squad
version: 1.0.0

## Objetivo

Gerar projeção de fluxo de caixa para o hospital em múltiplos cenários (otimista, realista, pessimista), baseada em dados históricos, recebíveis pendentes e compromissos futuros.

## Input

```typescript
interface ForecastCashflowInput {
  periodo_projecao: number;          // dias (30, 60, 90)
  posicao_atual: {
    saldo_caixa: number;
    data_referencia: string;
  };
  recebiveis: Array<{
    operadora: string;
    valor: number;
    data_prevista: string;
    probabilidade?: number;
  }>;
  compromissos: Array<{
    descricao: string;
    valor: number;
    data_vencimento: string;
    tipo: 'fixo' | 'variavel';
  }>;
  historico?: {
    receitas_mensais: number[];      // Últimos 12 meses
    despesas_mensais: number[];
    sazonalidade?: Record<number, number>;  // Mês -> fator
  };
  tenant_id: string;
}
```

## Output

```typescript
interface ForecastCashflowOutput {
  periodo: {
    inicio: string;
    fim: string;
    dias: number;
  };
  cenarios: {
    otimista: CenarioProjecao;
    realista: CenarioProjecao;
    pessimista: CenarioProjecao;
  };
  alertas: Array<{
    tipo: 'critico' | 'atencao' | 'info';
    data: string;
    descricao: string;
    cenarios_afetados: string[];
  }>;
  recomendacoes: string[];
  premissas: string[];
  confianca_modelo: number;
}

interface CenarioProjecao {
  nome: string;
  probabilidade: number;
  saldo_final: number;
  fluxo_diario: Array<{
    data: string;
    entradas: number;
    saidas: number;
    saldo: number;
  }>;
  fluxo_semanal: Array<{
    semana: number;
    entradas: number;
    saidas: number;
    saldo_final: number;
  }>;
  metricas: {
    menor_saldo: number;
    data_menor_saldo: string;
    dias_saldo_negativo: number;
    necessidade_capital: number;
  };
}
```

## Premissas por Cenário

### Otimista (20% probabilidade)
- 95% dos recebíveis pagos no prazo
- Nenhuma despesa extraordinária
- Novos contratos se concretizam

### Realista (60% probabilidade)
- Padrão histórico de pagamentos
- Despesas conforme orçamento
- Carteira atual mantida

### Pessimista (20% probabilidade)
- 20% de atraso nos recebimentos
- Despesas emergenciais possíveis
- Renovações de contrato em risco

## Modelo de Projeção

### Receitas
```
receita_dia = Σ (recebivel_i × prob_pagamento_i × fator_sazonalidade)
```

### Despesas
```
despesa_dia = despesas_fixas + (despesas_variaveis × fator_ocupacao)
```

### Sazonalidade
Fatores mensais baseados em histórico do setor saúde.

## Alertas Automáticos

| Condição | Tipo | Mensagem |
|----------|------|----------|
| Saldo < R$ 500k | Crítico | Saldo abaixo do mínimo operacional |
| Saldo negativo em 15 dias | Atenção | Necessidade de capital projetada |
| Concentração > 40% | Atenção | Risco de concentração de receita |

## Critérios de Aceite

- [ ] 3 cenários sempre apresentados
- [ ] Premissas claramente documentadas
- [ ] Alertas para situações de risco
- [ ] Fluxo diário e semanal calculado
- [ ] Menor saldo e data identificados
- [ ] Recomendações acionáveis
