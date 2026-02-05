# Task: prioritize-appeals
# FinHealth Squad | AIOS Task Format v1

name: prioritize-appeals
display_name: "Priorizar Recursos de Glosa"
agent: reconciliation-agent
squad: finhealth-squad
version: 1.0.0

## Objetivo

Priorizar glosas para recurso com base em critérios de valor, probabilidade de reversão, urgência de prazo e esforço necessário, maximizando o retorno sobre investimento de tempo.

## Input

```typescript
interface PrioritizeAppealsInput {
  glosas: Array<{
    id: string;
    numero_guia: string;
    codigo_glosa: string;
    valor: number;
    data_glosa: string;
    prazo_recurso: string;
    operadora: string;
    tipo_glosa: 'administrativa' | 'tecnica' | 'clinica';
    complexidade_estimada: 'baixa' | 'media' | 'alta';
    evidencias_disponiveis: boolean;
  }>;
  historico_reversao?: Array<{
    codigo_glosa: string;
    operadora: string;
    taxa_reversao: number;
  }>;
  capacidade_diaria?: number;        // Recursos que podem ser feitos por dia
  tenant_id: string;
}
```

## Output

```typescript
interface PrioritizeAppealsOutput {
  ranking: Array<{
    posicao: number;
    glosa_id: string;
    score_prioridade: number;
    fatores: {
      valor_normalizado: number;
      probabilidade_reversao: number;
      urgencia_prazo: number;
      esforco_inverso: number;
    };
    roi_estimado: number;            // Valor esperado / esforço
    prazo_restante_dias: number;
    recomendacao: 'recursar_urgente' | 'recursar' | 'avaliar' | 'baixa_prioridade';
  }>;
  metricas: {
    total_glosas: number;
    valor_total: number;
    valor_recuperavel_estimado: number;
    glosas_urgentes: number;
    glosas_expirando: number;
  };
  plano_execucao: Array<{
    data: string;
    glosas_ids: string[];
    valor_total_dia: number;
  }>;
}
```

## Fórmula de Priorização

```
score = (
  w_valor × normalizar(valor) +
  w_prob × probabilidade_reversao +
  w_urgencia × fator_urgencia(dias_restantes) +
  w_esforco × (1 - complexidade_normalizada)
) × 100

Onde:
- w_valor = 0.35
- w_prob = 0.30
- w_urgencia = 0.25
- w_esforco = 0.10
```

## Fator de Urgência

```
urgencia = {
  dias <= 5:  1.0 (crítico)
  dias <= 10: 0.8 (urgente)
  dias <= 15: 0.5 (atenção)
  dias <= 30: 0.3 (normal)
  dias > 30:  0.1 (baixa)
}
```

## Probabilidade de Reversão

Baseada em:
1. Histórico da operadora para o código de glosa
2. Tipo de glosa (administrativa > técnica > clínica)
3. Disponibilidade de evidências
4. Complexidade do caso

Valores base:
- Administrativa com evidência: 70-90%
- Técnica com justificativa: 40-60%
- Clínica: 20-40%

## ROI Estimado

```
ROI = (valor × probabilidade_reversao) / horas_estimadas
```

## Critérios de Aceite

- [ ] Todas as glosas rankeadas por prioridade
- [ ] Fatores contribuintes detalhados
- [ ] Prazos de vencimento destacados
- [ ] ROI estimado calculado
- [ ] Plano de execução sugerido
