# Task: audit-account
# FinHealth Squad | AIOS Task Format v1

name: audit-account
display_name: "Auditar Conta Hospitalar"
agent: auditor-agent
squad: finhealth-squad
version: 1.0.0

## Objetivo

Auditar uma conta hospitalar completa usando IA, cruzando dados clínicos com dados administrativos, gerando score de risco de glosa e identificando inconsistências antes do envio à operadora.

## Input

```typescript
interface AuditAccountInput {
  conta: {
    id: string;
    paciente: {
      nome: string;
      idade: number;
      sexo: 'M' | 'F';
    };
    internacao?: {
      data_entrada: string;
      data_saida: string;
      tipo_leito: 'enfermaria' | 'apartamento' | 'uti' | 'semi-uti';
      cid_principal: string;
      cids_secundarios: string[];
    };
    procedimentos: Array<{
      codigo_tuss: string;
      descricao: string;
      quantidade: number;
      valor: number;
      data_execucao: string;
      profissional_executante: string;
    }>;
    materiais: Array<{
      codigo: string;
      descricao: string;
      quantidade: number;
      valor: number;
    }>;
    medicamentos: Array<{
      codigo: string;
      descricao: string;
      quantidade: number;
      valor: number;
    }>;
    diarias: Array<{
      tipo: string;
      quantidade: number;
      valor_unitario: number;
    }>;
    valor_total: number;
  };
  operadora: {
    codigo_ans: string;
    nome: string;
    historico_glosas?: GlosaHistorico[];
  };
  tenant_id: string;
}
```

## Output

```typescript
interface AuditAccountOutput {
  score_risco_glosa: number;           // 0-100 (0 = seguro, 100 = glosa certa)
  classificacao: 'baixo' | 'medio' | 'alto' | 'critico';
  inconsistencias: Array<{
    tipo: string;
    codigo: string;
    descricao: string;
    impacto_financeiro: number;
    evidencia: string;
    recomendacao: string;
    referencia_normativa?: string;
  }>;
  valor_em_risco: number;
  recomendacao_geral: 'enviar' | 'revisar' | 'corrigir_antes' | 'bloquear';
  justificativa: string;
  tempo_processamento_ms: number;
}
```

## Etapas de Execução

### 1. Análise Clínica
- [ ] Verificar coerência entre diagnósticos (CID) e procedimentos realizados
- [ ] Checar se tempo de internação é compatível com o diagnóstico
- [ ] Validar tipo de leito vs gravidade do caso
- [ ] Verificar protocolos clínicos aplicáveis

### 2. Análise Administrativa
- [ ] Verificar duplicidade de cobranças
- [ ] Checar limites contratuais da operadora
- [ ] Validar autorizações prévias necessárias
- [ ] Verificar prazos e vigências

### 3. Análise Financeira
- [ ] Comparar valores com tabela de referência (CBHPM/contratual)
- [ ] Identificar cobranças acima do padrão
- [ ] Verificar pacote vs conta aberta
- [ ] Validar componentes (taxas, honorários)

### 4. Análise Histórica
- [ ] Consultar padrões de glosa da operadora
- [ ] Verificar histórico de glosas similares
- [ ] Identificar padrões recorrentes

### 5. Cálculo de Score de Risco
- [ ] Ponderar fatores: valor, complexidade, histórico, inconsistências
- [ ] Classificar nível de risco
- [ ] Gerar recomendação final

## Tipos de Inconsistência

| Código | Tipo | Descrição |
|--------|------|-----------|
| IC001 | Clínica | CID incompatível com procedimento |
| IC002 | Clínica | Tempo de internação incompatível |
| IC003 | Clínica | Tipo de leito inadequado |
| IA001 | Administrativa | Cobrança duplicada |
| IA002 | Administrativa | Sem autorização prévia |
| IA003 | Administrativa | Limite contratual excedido |
| IF001 | Financeira | Valor acima da tabela |
| IF002 | Financeira | Material/medicamento sem justificativa |
| IF003 | Financeira | Diária divergente |

## Classificação de Risco

| Score | Classificação | Ação Recomendada |
|-------|---------------|------------------|
| 0-25 | Baixo | Enviar com confiança |
| 26-50 | Médio | Revisar antes de enviar |
| 51-75 | Alto | Correções necessárias |
| 76-100 | Crítico | Bloquear envio |

## Critérios de Aceite

- [ ] Detecta inconsistências clínico-administrativas
- [ ] Score de risco correlaciona com glosas reais (>70% precisão)
- [ ] Tempo de processamento < 15 segundos por conta
- [ ] Recomendação clara e acionável
- [ ] Evidência documentada para cada achado

## Referências

- Tabela TUSS: `data/tuss-procedures.json`
- Tabela CBHPM: `data/cbhpm-values.json`
- Códigos de Glosa: `data/glosa-codes.json`
- Regras ANS: RN 395/2016, RN 465/2021

## Exemplo de Uso

```bash
# Via CLI
finhealth audit-account --conta conta.json --operadora 302147

# Via API
POST /api/v1/audit/account
Content-Type: application/json
Authorization: Bearer <token>

{
  "conta": { ... },
  "operadora": { "codigo_ans": "302147" },
  "tenant_id": "hospital-abc"
}
```
