# Task: generate-financial-report
# FinHealth Squad | AIOS Task Format v1

name: generate-financial-report
display_name: "Gerar Relatório Financeiro"
agent: cashflow-agent
squad: finhealth-squad
version: 1.0.0

## Objetivo

Gerar relatório financeiro completo e executivo do hospital, incluindo métricas de receita, despesa, faturamento, recebíveis, projeções e indicadores de performance.

## Input

```typescript
interface GenerateFinancialReportInput {
  periodo: {
    tipo: 'diario' | 'semanal' | 'mensal' | 'trimestral';
    inicio: string;
    fim: string;
  };
  dados: {
    receitas: ReceitaItem[];
    despesas: DespesaItem[];
    faturamento: FaturamentoItem[];
    recebimentos: RecebimentoItem[];
  };
  comparativo?: {
    periodo_anterior: boolean;
    mesmo_periodo_ano_anterior: boolean;
    orcamento: boolean;
  };
  secoes?: string[];                 // Seções a incluir
  formato: 'pdf' | 'excel' | 'json';
  tenant_id: string;
}
```

## Output

```typescript
interface GenerateFinancialReportOutput {
  relatorio: {
    titulo: string;
    periodo: string;
    data_geracao: string;
    secoes: ReportSection[];
  };
  metricas_chave: {
    receita_bruta: number;
    receita_liquida: number;
    despesas_totais: number;
    resultado_operacional: number;
    margem_operacional: number;
    faturamento_emitido: number;
    taxa_glosa: number;
    dias_medio_recebimento: number;
    inadimplencia: number;
  };
  comparativos?: {
    vs_periodo_anterior: ComparativoItem[];
    vs_ano_anterior: ComparativoItem[];
    vs_orcamento: ComparativoItem[];
  };
  graficos?: GraficoData[];
  arquivo_gerado?: string;
}
```

## Seções do Relatório

### 1. Sumário Executivo
- Resultado do período
- Principais indicadores
- Destaques e alertas

### 2. Receitas
- Por operadora
- Por tipo de atendimento
- Por especialidade
- Evolução temporal

### 3. Despesas
- Por categoria
- Fixas vs variáveis
- Maiores fornecedores
- Evolução temporal

### 4. Faturamento
- Guias emitidas
- Guias enviadas
- Taxa de aprovação
- Aging de envio

### 5. Recebíveis
- Por operadora
- Aging (0-30, 31-60, 61-90, >90)
- Provisão para perdas
- Previsão de recebimento

### 6. Glosas
- Por tipo
- Por operadora
- Recursos em andamento
- Taxa de reversão

### 7. Indicadores
- KPIs operacionais
- KPIs financeiros
- Tendências

### 8. Projeções
- Próximos 30/60/90 dias
- Cenários

## Indicadores Calculados

| Indicador | Fórmula |
|-----------|---------|
| Margem Operacional | (Receita - Despesas) / Receita |
| Taxa de Glosa | Valor Glosado / Valor Faturado |
| DMR (Dias Médio Receb.) | Média ponderada de dias |
| Inadimplência | Valores > 90 dias / Total |
| Ticket Médio | Receita / Atendimentos |

## Critérios de Aceite

- [ ] Todas as seções solicitadas incluídas
- [ ] Métricas calculadas corretamente
- [ ] Comparativos quando solicitados
- [ ] Visualizações claras
- [ ] Arquivo gerado no formato correto
