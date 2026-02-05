# Task: match-invoices
# FinHealth Squad | AIOS Task Format v1

name: match-invoices
display_name: "Matching de Faturas"
agent: reconciliation-agent
squad: finhealth-squad
version: 1.0.0

## Objetivo

Realizar matching inteligente entre itens de pagamento recebidos e guias/faturas enviadas, utilizando múltiplas estratégias de correspondência incluindo fuzzy matching para casos de divergência de dados.

## Input

```typescript
interface MatchInvoicesInput {
  itens_pagamento: Array<{
    id: string;
    numero_guia?: string;
    numero_protocolo?: string;
    data_atendimento?: string;
    nome_paciente?: string;
    valor: number;
  }>;
  guias_enviadas: Array<{
    numero_guia: string;
    protocolo_envio?: string;
    data_atendimento: string;
    nome_beneficiario: string;
    valor_apresentado: number;
  }>;
  configuracao?: {
    tolerancia_valor: number;       // Percentual (default: 0.05)
    tolerancia_data: number;        // Dias (default: 3)
    similaridade_minima: number;    // 0-1 (default: 0.8)
  };
  tenant_id: string;
}
```

## Output

```typescript
interface MatchInvoicesOutput {
  matches: Array<{
    item_pagamento_id: string;
    guia_numero: string;
    tipo_match: 'exato' | 'fuzzy' | 'manual_sugerido';
    confianca: number;              // 0-1
    criterios_utilizados: string[];
    divergencias?: Array<{
      campo: string;
      valor_pagamento: any;
      valor_guia: any;
    }>;
  }>;
  sem_match: {
    itens_pagamento: string[];
    guias: string[];
  };
  metricas: {
    total_itens: number;
    matches_exatos: number;
    matches_fuzzy: number;
    sem_match: number;
    taxa_match: number;
  };
}
```

## Estratégias de Matching

### 1. Match Exato
- Número de guia idêntico
- Confiança: 100%

### 2. Match por Protocolo
- Protocolo de envio == referência no pagamento
- Confiança: 95%

### 3. Match Fuzzy Composto
```
score = (
  peso_valor × similaridade_valor +
  peso_data × similaridade_data +
  peso_nome × similaridade_nome +
  peso_procedimento × similaridade_procedimento
)
```

Pesos padrão:
- Valor: 30%
- Data: 25%
- Nome: 25%
- Procedimento: 20%

### 4. Sugestão Manual
- Confiança < limite mínimo
- Múltiplos candidatos possíveis
- Flagged para revisão humana

## Algoritmos de Similaridade

- **Valor**: Diferença percentual (tolerância: 5%)
- **Data**: Diferença em dias (tolerância: 3 dias)
- **Nome**: Levenshtein distance normalizado
- **Código**: Match parcial de procedimentos

## Critérios de Aceite

- [ ] Match exato quando número de guia disponível
- [ ] Fuzzy matching com confiança calculada
- [ ] Divergências claramente reportadas
- [ ] Itens sem match identificados
- [ ] Taxa de match > 95% para repasses típicos
