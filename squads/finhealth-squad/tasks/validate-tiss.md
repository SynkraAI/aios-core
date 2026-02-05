# Task: validate-tiss
# FinHealth Squad | AIOS Task Format v1

name: validate-tiss
display_name: "Validar Guia TISS"
agent: billing-agent
squad: finhealth-squad
version: 1.0.0

## Objetivo

Validar uma guia TISS (Troca de Informação em Saúde Suplementar) contra as regras ANS vigentes, tabelas de procedimentos e regras contratuais da operadora, retornando um relatório de validação com erros, alertas e sugestões de correção.

## Input

```typescript
interface ValidateTissInput {
  guia: {
    tipo: 'consulta' | 'sp-sadt' | 'internacao' | 'honorarios' | 'odontologia';
    numero_guia: string;
    data_atendimento: string;           // ISO 8601
    beneficiario: {
      numero_carteira: string;
      nome: string;
      data_nascimento: string;
    };
    prestador: {
      codigo_cnes: string;
      nome: string;
      tipo: 'hospital' | 'clinica' | 'laboratorio';
    };
    procedimentos: Array<{
      codigo_tuss: string;
      descricao: string;
      quantidade: number;
      valor_unitario: number;
      cid_principal?: string;
      cid_secundario?: string;
    }>;
    materiais_medicamentos?: Array<{
      codigo: string;
      descricao: string;
      quantidade: number;
      valor_unitario: number;
    }>;
  };
  operadora: {
    codigo_ans: string;
    nome: string;
    regras_especificas?: Record<string, any>;
  };
  tenant_id: string;
}
```

## Output

```typescript
interface ValidateTissOutput {
  valida: boolean;
  score_confianca: number;              // 0-100
  erros: Array<{
    campo: string;
    tipo: 'critico' | 'alerta' | 'info';
    codigo: string;
    mensagem: string;
    sugestao_correcao?: string;
    referencia_normativa?: string;
  }>;
  valor_total_calculado: number;
  valor_total_informado: number;
  divergencia_valor: number;
  tempo_processamento_ms: number;
}
```

## Etapas de Execução

### 1. Validação Estrutural
- [ ] Verificar campos obrigatórios conforme tipo de guia
- [ ] Validar formato de datas (ISO 8601)
- [ ] Validar formato de códigos (TUSS, CID)
- [ ] Validar formato de valores monetários
- [ ] Checar versão do padrão TISS utilizado

### 2. Validação de Códigos
- [ ] Verificar cada código TUSS contra `data/tuss-procedures.json`
- [ ] Validar CIDs contra tabela CID-10
- [ ] Checar compatibilidade CID x Procedimento
- [ ] Verificar se procedimento está coberto pelo plano
- [ ] Validar códigos de materiais/medicamentos

### 3. Validação de Regras de Negócio
- [ ] Checar regras específicas da operadora
- [ ] Verificar necessidade de autorização prévia
- [ ] Validar período de carência
- [ ] Validar limites de quantidade por procedimento
- [ ] Verificar duplicidade de cobrança
- [ ] Checar compatibilidade de procedimentos simultâneos

### 4. Validação Financeira
- [ ] Recalcular valores com base na tabela CBHPM/contratual
- [ ] Identificar divergências de valor
- [ ] Verificar porte e componentes (filme, custo operacional)
- [ ] Validar taxas e diárias

### 5. Geração do Relatório
- [ ] Consolidar todos os achados
- [ ] Classificar por severidade (crítico → alerta → info)
- [ ] Gerar sugestões de correção para cada erro
- [ ] Calcular score de confiança da guia
- [ ] Registrar tempo de processamento

## Códigos de Erro

| Código | Tipo | Descrição |
|--------|------|-----------|
| E001 | Crítico | Campo obrigatório ausente |
| E002 | Crítico | Código TUSS inválido |
| E003 | Crítico | Código CID inválido |
| E004 | Crítico | Incompatibilidade CID-Procedimento |
| E005 | Alerta | Valor acima da tabela contratual |
| E006 | Crítico | Cobrança em duplicidade |
| E007 | Alerta | Limite de quantidade excedido |
| E008 | Alerta | Sem autorização prévia |
| E009 | Alerta | Carência não cumprida |
| E010 | Info | Formato de data incorreto |

## Critérios de Aceite

- [ ] Detecta 100% dos erros estruturais (campos obrigatórios)
- [ ] Valida códigos TUSS contra tabela atualizada
- [ ] Identifica incompatibilidades CID x Procedimento
- [ ] Calcula divergência de valor corretamente
- [ ] Tempo de processamento < 5 segundos por guia
- [ ] Retorna sugestões de correção para cada erro

## Referências

- Padrão TISS ANS: https://www.gov.br/ans/pt-br/assuntos/prestadores/padrao-para-troca-de-informacao-de-saude-suplementar-2013-tiss
- Tabela TUSS: `data/tuss-procedures.json`
- Tabela CBHPM: `data/cbhpm-values.json`
- Códigos de Glosa: `data/glosa-codes.json`

## Exemplo de Uso

```bash
# Via CLI
finhealth validate-tiss --input guia.json --operadora 302147

# Via API
POST /api/v1/billing/validate
Content-Type: application/json
Authorization: Bearer <token>

{
  "guia": { ... },
  "operadora": { "codigo_ans": "302147" },
  "tenant_id": "hospital-abc"
}
```
