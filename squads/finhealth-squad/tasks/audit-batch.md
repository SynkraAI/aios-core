# Task: audit-batch
# FinHealth Squad | AIOS Task Format v1

name: audit-batch
display_name: "Auditoria em Lote"
agent: auditor-agent
squad: finhealth-squad
version: 1.0.0

## Objetivo

Executar auditoria automática em lote para múltiplas contas hospitalares pendentes, priorizando por valor e risco, gerando relatório consolidado com métricas agregadas.

## Input

```typescript
interface AuditBatchInput {
  contas: Array<{
    id: string;
    dados: AuditAccountInput;
  }>;
  filtros?: {
    operadora?: string;
    valor_minimo?: number;
    valor_maximo?: number;
    data_inicio?: string;
    data_fim?: string;
  };
  prioridade: 'valor' | 'data' | 'risco_estimado';
  limite_processamento?: number;
  tenant_id: string;
}
```

## Output

```typescript
interface AuditBatchOutput {
  total_processado: number;
  tempo_total_ms: number;
  resumo: {
    valor_total_auditado: number;
    valor_total_em_risco: number;
    distribuicao_risco: {
      baixo: number;
      medio: number;
      alto: number;
      critico: number;
    };
  };
  resultados: Array<{
    conta_id: string;
    score_risco: number;
    classificacao: string;
    valor_em_risco: number;
    inconsistencias_count: number;
    recomendacao: string;
  }>;
  top_inconsistencias: Array<{
    tipo: string;
    ocorrencias: number;
    valor_total_afetado: number;
  }>;
  contas_criticas: string[];  // IDs das contas que requerem ação imediata
}
```

## Etapas de Execução

### 1. Preparação
- [ ] Validar lista de contas
- [ ] Aplicar filtros especificados
- [ ] Ordenar por critério de prioridade
- [ ] Estimar tempo de processamento

### 2. Processamento Paralelo
- [ ] Processar contas em paralelo (máximo 5 simultâneas)
- [ ] Executar task audit-account para cada conta
- [ ] Coletar resultados incrementalmente
- [ ] Atualizar progresso

### 3. Consolidação
- [ ] Agregar métricas de todas as contas
- [ ] Identificar padrões recorrentes
- [ ] Rankear inconsistências por frequência e impacto
- [ ] Destacar contas críticas

### 4. Relatório
- [ ] Gerar relatório consolidado
- [ ] Exportar para formatos (PDF, Excel)
- [ ] Enviar alertas para contas críticas

## Limites de Processamento

- Máximo 100 contas por lote
- Timeout de 30 minutos por lote
- Paralelismo máximo: 5 contas simultâneas

## Critérios de Aceite

- [ ] Todas as contas do lote processadas ou erro reportado
- [ ] Métricas agregadas corretas
- [ ] Top inconsistências identificadas
- [ ] Contas críticas destacadas
- [ ] Tempo de processamento dentro do limite
