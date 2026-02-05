# Task: detect-anomalies
# FinHealth Squad | AIOS Task Format v1

name: detect-anomalies
display_name: "Detectar Anomalias Financeiras"
agent: cashflow-agent
squad: finhealth-squad
version: 1.0.0

## Objetivo

Detectar anomalias em receitas, despesas e padrões financeiros que possam indicar problemas operacionais, fraudes ou oportunidades, utilizando análise estatística e comparação com padrões históricos.

## Input

```typescript
interface DetectAnomaliesInput {
  periodo_analise: {
    inicio: string;
    fim: string;
  };
  dados_atuais: {
    receitas: Array<{
      data: string;
      fonte: string;
      valor: number;
      categoria?: string;
    }>;
    despesas: Array<{
      data: string;
      fornecedor: string;
      valor: number;
      categoria: string;
    }>;
  };
  dados_historicos?: {
    receitas_mensais: Record<string, number>;
    despesas_mensais: Record<string, number>;
    por_categoria: Record<string, number[]>;
  };
  limites_personalizados?: {
    variacao_maxima: number;         // Percentual
    desvios_padrao: number;          // Para detecção
  };
  tenant_id: string;
}
```

## Output

```typescript
interface DetectAnomaliesOutput {
  anomalias: Array<{
    id: string;
    tipo: 'receita' | 'despesa' | 'padrao';
    severidade: 'critica' | 'alta' | 'media' | 'baixa';
    categoria: string;
    descricao: string;
    valor_observado: number;
    valor_esperado: number;
    desvio_percentual: number;
    desvio_padrao: number;
    data_ocorrencia: string;
    posssiveis_causas: string[];
    acoes_recomendadas: string[];
  }>;
  metricas: {
    total_transacoes_analisadas: number;
    anomalias_detectadas: number;
    valor_total_anomalo: number;
    categorias_afetadas: string[];
  };
  tendencias: Array<{
    categoria: string;
    direcao: 'crescente' | 'decrescente' | 'estavel';
    variacao_periodo: number;
    significancia: number;
  }>;
  saude_financeira: {
    score: number;                   // 0-100
    classificacao: 'excelente' | 'boa' | 'atencao' | 'critica';
    principais_preocupacoes: string[];
  };
}
```

## Tipos de Anomalia

### Receitas
| Código | Tipo | Detecção |
|--------|------|----------|
| AR001 | Queda abrupta | > 20% vs mês anterior |
| AR002 | Concentração | > 40% de um pagador |
| AR003 | Padrão alterado | Mudança no timing |
| AR004 | Ausência | Pagador regular sem pagamento |

### Despesas
| Código | Tipo | Detecção |
|--------|------|----------|
| AD001 | Spike | > 30% vs orçamento |
| AD002 | Fornecedor novo | Valor alto, primeira vez |
| AD003 | Categoria atípica | Fora do padrão |
| AD004 | Frequência | Pagamentos duplicados |

### Padrões
| Código | Tipo | Detecção |
|--------|------|----------|
| AP001 | Sazonalidade | Desvio > 2σ do esperado |
| AP002 | Tendência | Mudança de direção |
| AP003 | Correlação | Quebra de padrão correlato |

## Métodos de Detecção

### Estatístico
```
z_score = (valor_observado - media_historica) / desvio_padrao
anomalia se |z_score| > 2.5
```

### Comparativo
```
variacao = (valor_atual - valor_referencia) / valor_referencia
anomalia se |variacao| > limite_categoria
```

### Machine Learning (futuro)
- Isolation Forest para outliers
- LSTM para séries temporais

## Critérios de Aceite

- [ ] Todas as transações analisadas
- [ ] Anomalias classificadas por severidade
- [ ] Causas possíveis sugeridas
- [ ] Ações recomendadas incluídas
- [ ] Score de saúde financeira calculado
- [ ] Tendências identificadas
