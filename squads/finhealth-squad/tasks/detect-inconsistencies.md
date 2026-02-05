# Task: detect-inconsistencies
# FinHealth Squad | AIOS Task Format v1

name: detect-inconsistencies
display_name: "Detectar Inconsistências"
agent: auditor-agent
squad: finhealth-squad
version: 1.0.0

## Objetivo

Detectar inconsistências clínico-administrativas em contas hospitalares através de cruzamento inteligente de dados, regras de negócio e análise de padrões.

## Input

```typescript
interface DetectInconsistenciesInput {
  conta: {
    procedimentos: Procedimento[];
    diagnosticos: Diagnostico[];
    internacao?: DadosInternacao;
    materiais: Material[];
    medicamentos: Medicamento[];
  };
  regras_operadora?: RegraOperadora[];
  tenant_id: string;
}
```

## Output

```typescript
interface DetectInconsistenciesOutput {
  inconsistencias: Array<{
    id: string;
    tipo: 'clinica' | 'administrativa' | 'financeira';
    codigo: string;
    descricao: string;
    severidade: 'baixa' | 'media' | 'alta' | 'critica';
    itens_envolvidos: string[];
    evidencia: string;
    impacto_financeiro: number;
    referencia_normativa: string;
    recomendacao: string;
  }>;
  metricas: {
    total_verificacoes: number;
    inconsistencias_encontradas: number;
    valor_total_afetado: number;
  };
}
```

## Tipos de Verificação

### Clínicas
- CID x Procedimento: compatibilidade diagnóstico-tratamento
- Tempo de internação x CID: dias esperados vs realizados
- Tipo de leito x Gravidade: adequação do recurso
- Procedimentos simultâneos: compatibilidade temporal

### Administrativas
- Duplicidade de cobrança
- Autorização prévia necessária
- Limites contratuais
- Prazos de envio

### Financeiras
- Valores acima da tabela
- Materiais sem justificativa clínica
- Componentes de honorários
- Pacote vs conta aberta

## Regras de Detecção

```yaml
regras:
  IC001_CID_PROCEDIMENTO:
    descricao: "CID incompatível com procedimento"
    verificacao: "Cruzar CID com lista de procedimentos permitidos"
    severidade: alta

  IC002_TEMPO_INTERNACAO:
    descricao: "Tempo de internação incompatível"
    verificacao: "Comparar dias com média por CID"
    tolerancia: "2 desvios padrão"
    severidade: media

  IA001_DUPLICIDADE:
    descricao: "Cobrança em duplicidade"
    verificacao: "Mesmo procedimento, mesmo dia, mesmo executante"
    severidade: critica

  IF001_VALOR_ACIMA:
    descricao: "Valor acima da tabela"
    verificacao: "Comparar com CBHPM/contrato"
    tolerancia: "5%"
    severidade: media
```

## Critérios de Aceite

- [ ] Todas as regras de detecção aplicadas
- [ ] Evidência documentada para cada inconsistência
- [ ] Impacto financeiro calculado
- [ ] Referência normativa incluída
- [ ] Recomendação acionável
