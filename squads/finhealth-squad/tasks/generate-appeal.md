# Task: generate-appeal
# FinHealth Squad | AIOS Task Format v1

name: generate-appeal
display_name: "Gerar Recurso de Glosa"
agent: reconciliation-agent
squad: finhealth-squad
version: 1.0.0

## Objetivo

Gerar automaticamente um recurso de glosa bem fundamentado, com justificativas baseadas em normas ANS, contratos e jurisprudência, maximizando a probabilidade de reversão.

## Input

```typescript
interface GenerateAppealInput {
  glosa: {
    numero_guia: string;
    numero_protocolo?: string;
    codigo_glosa: string;
    descricao_glosa: string;
    valor_glosado: number;
    data_glosa: string;
    itens_glosados: Array<{
      codigo_procedimento: string;
      descricao: string;
      valor: number;
      motivo: string;
    }>;
  };
  guia_original: {
    tipo: string;
    beneficiario: { nome: string; carteira: string };
    prestador: { nome: string; cnes: string };
    data_atendimento: string;
    procedimentos: Procedimento[];
  };
  operadora: {
    codigo_ans: string;
    nome: string;
    prazo_recurso: number;          // dias
    canal_recurso: string;
  };
  evidencias_disponiveis?: Array<{
    tipo: 'autorizacao' | 'laudo' | 'prontuario' | 'protocolo' | 'contrato';
    descricao: string;
    referencia: string;
  }>;
  tenant_id: string;
}
```

## Output

```typescript
interface GenerateAppealOutput {
  recurso: {
    numero_referencia: string;
    data_geracao: string;
    prazo_envio: string;
    texto_completo: string;
    resumo_executivo: string;
  };
  fundamentacao: {
    normas_citadas: Array<{
      tipo: 'resolucao_ans' | 'lei' | 'contrato' | 'jurisprudencia';
      numero: string;
      artigo?: string;
      texto_relevante: string;
    }>;
    argumentos: Array<{
      ponto: string;
      fundamentacao: string;
      evidencia?: string;
    }>;
  };
  anexos_necessarios: Array<{
    documento: string;
    disponivel: boolean;
    obrigatorio: boolean;
  }>;
  probabilidade_reversao: number;
  recomendacoes: string[];
}
```

## Estrutura do Recurso

### 1. Cabeçalho
- Identificação do prestador
- Identificação da operadora
- Referência da glosa
- Prazo de recurso

### 2. Qualificação
- Dados do beneficiário
- Dados do atendimento
- Valor em questão

### 3. Fundamentação
- Exposição dos fatos
- Fundamentos normativos (ANS, Lei 9.656)
- Fundamentos contratuais
- Jurisprudência aplicável

### 4. Pedido
- Reversão integral/parcial
- Pagamento dos valores
- Eventuais atualizações

### 5. Anexos
- Lista de documentos comprobatórios

## Templates por Tipo de Glosa

### Administrativa (GA001-GA010)
- Foco em documentação e procedimentos
- Ênfase em protocolos e registros

### Técnica (GT001-GT010)
- Foco em justificativa clínica
- Referência a protocolos médicos

### Financeira (GF001-GF010)
- Foco em valores contratuais
- Referência a tabelas acordadas

## Normas Frequentemente Citadas

- RN 395/2016 - Rol de Procedimentos
- RN 465/2021 - Atualização do Rol
- Lei 9.656/98 - Lei dos Planos de Saúde
- Código de Defesa do Consumidor

## Critérios de Aceite

- [ ] Recurso completo e bem estruturado
- [ ] Fundamentação normativa adequada
- [ ] Argumentos específicos para o tipo de glosa
- [ ] Lista de anexos necessários
- [ ] Probabilidade de reversão estimada
- [ ] Linguagem formal e técnica
