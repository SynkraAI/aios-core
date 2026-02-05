# Task: generate-consolidated-report
# FinHealth Squad | AIOS Task Format v1

name: generate-consolidated-report
display_name: "Gerar Relatório Consolidado"
agent: supervisor-agent
squad: finhealth-squad
version: 1.0.0

## Objetivo

Gerar relatório consolidado do FinHealth Squad, agregando métricas e outputs de todos os agentes em uma visão executiva unificada.

## Input

```typescript
interface GenerateConsolidatedReportInput {
  periodo: {
    tipo: 'diario' | 'semanal' | 'mensal';
    inicio: string;
    fim: string;
  };
  secoes?: Array<'billing' | 'audit' | 'reconciliation' | 'cashflow' | 'operations'>;
  nivel_detalhe: 'executivo' | 'gerencial' | 'operacional';
  formato: 'pdf' | 'excel' | 'json' | 'markdown';
  destinatarios?: string[];
  tenant_id: string;
}
```

## Output

```typescript
interface GenerateConsolidatedReportOutput {
  relatorio: {
    titulo: string;
    periodo: string;
    gerado_em: string;
    nivel: string;
  };
  sumario_executivo: {
    destaques: string[];
    alertas: string[];
    recomendacoes_principais: string[];
    kpis_chave: Record<string, number>;
  };
  secoes: {
    billing?: BillingSection;
    audit?: AuditSection;
    reconciliation?: ReconciliationSection;
    cashflow?: CashflowSection;
    operations?: OperationsSection;
  };
  anexos?: string[];
  arquivo_gerado: string;
}

interface BillingSection {
  guias_processadas: number;
  guias_geradas: number;
  taxa_validacao: number;
  erros_detectados: number;
  valor_faturado: number;
}

interface AuditSection {
  contas_auditadas: number;
  valor_auditado: number;
  valor_em_risco: number;
  glosas_prevenidas: number;
  score_medio_risco: number;
  top_inconsistencias: string[];
}

interface ReconciliationSection {
  pagamentos_conciliados: number;
  valor_recebido: number;
  valor_glosado: number;
  taxa_glosa: number;
  recursos_gerados: number;
  recursos_aprovados: number;
  valor_recuperado: number;
  prazos_vencendo: number;
}

interface CashflowSection {
  saldo_atual: number;
  projecao_30d: number;
  anomalias_detectadas: number;
  alertas_ativos: number;
  saude_financeira: string;
}

interface OperationsSection {
  requisicoes_processadas: number;
  sla_compliance: number;
  erros_operacionais: number;
  tempo_medio_resposta: number;
  disponibilidade: number;
}
```

## Estrutura do Relatório

### Nível Executivo
- KPIs principais apenas
- Gráficos de tendência
- Top 3 alertas e recomendações
- 1-2 páginas

### Nível Gerencial
- Métricas por área
- Comparativos temporais
- Análise de tendências
- Recomendações detalhadas
- 5-10 páginas

### Nível Operacional
- Dados granulares
- Listas detalhadas
- Logs de operações
- Métricas técnicas
- 20+ páginas

## Agregação de Dados

O supervisor coleta dados de cada agente:

```
@billing -> metricas_faturamento
@auditor -> metricas_auditoria
@reconciliation -> metricas_conciliacao
@cashflow -> metricas_financeiras
```

## Formatação

### PDF
- Template profissional
- Logotipo do hospital
- Gráficos incorporados
- Índice navegável

### Excel
- Abas por seção
- Dados brutos disponíveis
- Gráficos dinâmicos
- Filtros habilitados

### Markdown
- Estrutura textual
- Tabelas formatadas
- Links internos
- Ideal para versionamento

## Critérios de Aceite

- [ ] Dados de todos os agentes agregados
- [ ] Nível de detalhe respeitado
- [ ] Sumário executivo claro
- [ ] Alertas e recomendações incluídos
- [ ] Formato correto gerado
- [ ] Arquivo salvo e referenciado
