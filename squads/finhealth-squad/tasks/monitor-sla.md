# Task: monitor-sla
# FinHealth Squad | AIOS Task Format v1

name: monitor-sla
display_name: "Monitorar SLA"
agent: supervisor-agent
squad: finhealth-squad
version: 1.0.0

## Objetivo

Monitorar em tempo real os SLAs (Service Level Agreements) de todos os agentes do FinHealth Squad, alertando sobre violações e fornecendo métricas de performance.

## Input

```typescript
interface MonitorSlaInput {
  periodo?: {
    inicio: string;
    fim: string;
  };
  agentes?: string[];                // Filtrar por agentes específicos
  incluir_historico?: boolean;
  tenant_id: string;
}
```

## Output

```typescript
interface MonitorSlaOutput {
  status_geral: {
    compliance_rate: number;         // 0-100%
    status: 'verde' | 'amarelo' | 'vermelho';
    alertas_ativos: number;
  };
  agentes: Array<{
    id: string;
    nome: string;
    status: 'ativo' | 'ocupado' | 'erro' | 'offline';
    metricas: {
      requisicoes_periodo: number;
      tempo_medio_resposta_ms: number;
      sla_target_ms: number;
      compliance_rate: number;
      erros: number;
    };
    fila: {
      tamanho: number;
      tempo_espera_medio_ms: number;
      item_mais_antigo_ms: number;
    };
    violacoes_recentes: Array<{
      timestamp: string;
      tempo_resposta_ms: number;
      operacao: string;
    }>;
  }>;
  tendencias: {
    ultimas_24h: TrendData[];
    comparativo_semana: number;      // % variação
  };
  recomendacoes: string[];
}
```

## SLAs por Agente

| Agente | Operação | Target | Warning | Critical |
|--------|----------|--------|---------|----------|
| billing | validate-tiss | 5s | 8s | 15s |
| billing | generate-tiss | 10s | 15s | 30s |
| auditor | audit-account | 15s | 25s | 45s |
| auditor | audit-batch | 5min | 8min | 15min |
| reconciliation | reconcile | 60s | 90s | 180s |
| reconciliation | generate-appeal | 30s | 45s | 90s |
| cashflow | forecast | 30s | 45s | 90s |
| cashflow | detect-anomalies | 45s | 60s | 120s |

## Status de SLA

### Verde (Compliance > 95%)
- Operação normal
- Sem ações necessárias

### Amarelo (85-95% Compliance)
- Atenção necessária
- Investigar causas
- Preparar contingência

### Vermelho (< 85% Compliance)
- Intervenção imediata
- Escalar para suporte
- Ativar contingência

## Alertas Automáticos

| Condição | Severidade | Ação |
|----------|------------|------|
| Tempo > 2x target | Warning | Log + notificação |
| Tempo > 3x target | Critical | Escalação automática |
| Fila > 10 itens | Warning | Alerta de capacity |
| Erro rate > 5% | Critical | Investigação imediata |
| Agente offline | Critical | Failover automático |

## Métricas Coletadas

- Tempo de resposta (p50, p90, p99)
- Taxa de erro
- Throughput (req/min)
- Tamanho de fila
- Tempo de espera
- Disponibilidade

## Critérios de Aceite

- [ ] Status de todos os agentes monitorados
- [ ] SLA compliance calculado corretamente
- [ ] Alertas disparados quando apropriado
- [ ] Tendências identificadas
- [ ] Recomendações geradas
