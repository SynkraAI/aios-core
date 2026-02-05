# Task: reconcile-payment
# FinHealth Squad | AIOS Task Format v1

name: reconcile-payment
display_name: "Conciliar Repasse"
agent: reconciliation-agent
squad: finhealth-squad
version: 1.0.0

## Objetivo

Conciliar automaticamente um repasse recebido de operadora com as guias enviadas, identificando pagamentos corretos, glosas totais e parciais, e divergências de valores.

## Input

```typescript
interface ReconcilePaymentInput {
  repasse: {
    operadora: {
      codigo_ans: string;
      nome: string;
    };
    competencia: string;           // YYYY-MM
    data_pagamento: string;
    valor_total: number;
    arquivo_xml?: string;          // Caminho do XML de pagamento
    itens: Array<{
      numero_guia: string;
      numero_protocolo?: string;
      valor_apresentado: number;
      valor_pago: number;
      codigo_glosa?: string;
      justificativa_glosa?: string;
    }>;
  };
  guias_enviadas: Array<{
    numero_guia: string;
    valor_apresentado: number;
    data_envio: string;
    status: string;
  }>;
  tenant_id: string;
}
```

## Output

```typescript
interface ReconcilePaymentOutput {
  resumo: {
    valor_apresentado: number;
    valor_pago: number;
    valor_glosado: number;
    percentual_glosa: number;
    guias_processadas: number;
    guias_pagas_integral: number;
    guias_pagas_parcial: number;
    guias_glosadas_total: number;
    guias_nao_encontradas: number;
  };
  itens_conciliados: Array<{
    numero_guia: string;
    status: 'pago_integral' | 'pago_parcial' | 'glosa_total' | 'nao_encontrado';
    valor_apresentado: number;
    valor_pago: number;
    valor_glosa: number;
    codigo_glosa?: string;
    descricao_glosa?: string;
    recurso_recomendado: boolean;
    probabilidade_reversao?: number;
  }>;
  analise_glosas: {
    por_tipo: Record<string, { count: number; valor: number }>;
    por_codigo: Record<string, { count: number; valor: number }>;
  };
  alertas: string[];
}
```

## Etapas de Execução

### 1. Importação do Repasse
- [ ] Parsear XML/arquivo de pagamento
- [ ] Extrair itens de pagamento
- [ ] Validar estrutura do arquivo

### 2. Matching de Guias
- [ ] Match exato por número de guia
- [ ] Match fuzzy para divergências de dados
- [ ] Identificar guias não encontradas

### 3. Classificação
- [ ] Pago integral: valor_pago == valor_apresentado
- [ ] Pago parcial: valor_pago < valor_apresentado
- [ ] Glosa total: valor_pago == 0
- [ ] Não encontrado: guia sem correspondência

### 4. Análise de Glosas
- [ ] Classificar glosas por tipo e código
- [ ] Calcular valores agregados
- [ ] Identificar padrões recorrentes

### 5. Recomendações
- [ ] Avaliar potencial de recurso
- [ ] Estimar probabilidade de reversão
- [ ] Priorizar por valor x probabilidade

## Critérios de Aceite

- [ ] 100% dos itens do repasse processados
- [ ] Matching correto com guias enviadas
- [ ] Classificação precisa de glosas
- [ ] Análise agregada por tipo/código
- [ ] Recomendações de recurso geradas
