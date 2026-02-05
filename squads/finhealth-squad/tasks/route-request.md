# Task: route-request
# FinHealth Squad | AIOS Task Format v1

name: route-request
display_name: "Rotear Requisição"
agent: supervisor-agent
squad: finhealth-squad
version: 1.0.0

## Objetivo

Analisar a requisição do usuário, identificar a intenção e rotear para o agente mais apropriado do FinHealth Squad, garantindo atendimento eficiente e preciso.

## Input

```typescript
interface RouteRequestInput {
  requisicao: {
    texto: string;
    contexto?: string;
    usuario: {
      id: string;
      perfil: string;
    };
    historico_sessao?: Message[];
  };
  tenant_id: string;
}
```

## Output

```typescript
interface RouteRequestOutput {
  roteamento: {
    agente_destino: 'billing' | 'auditor' | 'reconciliation' | 'cashflow' | 'supervisor';
    task_sugerida?: string;
    confianca: number;              // 0-1
    agentes_alternativos?: Array<{
      agente: string;
      confianca: number;
    }>;
  };
  intencao: {
    primaria: string;
    secundarias?: string[];
    entidades_extraidas: Record<string, any>;
  };
  clarificacao_necessaria?: {
    pergunta: string;
    opcoes?: string[];
  };
  contexto_transferido: Record<string, any>;
}
```

## Mapeamento de Intenções

### @billing (Faturista IA)
**Keywords:** guia, tiss, sus, faturar, validar, gerar guia, AIH, BPA, TUSS
**Intenções:**
- Gerar guia TISS/SUS
- Validar guia antes do envio
- Corrigir erros de faturamento
- Consultar códigos TUSS

### @auditor (Auditor IA)
**Keywords:** auditar, auditoria, glosa, risco, conta, inconsistência, score
**Intenções:**
- Auditar conta hospitalar
- Calcular risco de glosa
- Detectar inconsistências
- Analisar padrões de glosa

### @reconciliation (Conciliador IA)
**Keywords:** conciliar, repasse, pagamento, recurso, recursar, operadora
**Intenções:**
- Conciliar repasse recebido
- Gerar recurso de glosa
- Priorizar recursos
- Verificar prazos

### @cashflow (Analista Financeiro IA)
**Keywords:** caixa, fluxo, projeção, previsão, financeiro, anomalia, inadimplência
**Intenções:**
- Projetar fluxo de caixa
- Detectar anomalias
- Gerar relatório financeiro
- Analisar inadimplência

## Algoritmo de Roteamento

```python
def route(request):
    # 1. Extrair keywords
    keywords = extract_keywords(request.texto)

    # 2. Calcular scores por agente
    scores = {}
    for agent, patterns in AGENT_PATTERNS.items():
        scores[agent] = calculate_match_score(keywords, patterns)

    # 3. Verificar confiança mínima
    best_agent = max(scores, key=scores.get)
    if scores[best_agent] < 0.6:
        return ask_clarification()

    # 4. Retornar roteamento
    return RouteResult(
        agente=best_agent,
        confianca=scores[best_agent],
        alternativas=get_alternatives(scores)
    )
```

## Casos Especiais

### Multi-agente
Requisições que envolvem múltiplos agentes são tratadas pelo supervisor, coordenando a execução sequencial ou paralela.

### Ambíguo
Se confiança < 60%, solicitar clarificação ao usuário.

### Escalação
Situações que requerem intervenção humana são escaladas automaticamente.

## Critérios de Aceite

- [ ] Intenção identificada corretamente (>95%)
- [ ] Agente correto selecionado
- [ ] Confiança calculada
- [ ] Alternativas quando apropriado
- [ ] Clarificação quando necessário
