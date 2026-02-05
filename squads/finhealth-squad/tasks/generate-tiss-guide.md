# Task: generate-tiss-guide
# FinHealth Squad | AIOS Task Format v1

name: generate-tiss-guide
display_name: "Gerar Guia TISS"
agent: billing-agent
squad: finhealth-squad
version: 1.0.0

## Objetivo

Gerar uma guia TISS completa e válida a partir dos dados do atendimento, seguindo o padrão ANS vigente (versão 4.01.00), com preenchimento inteligente baseado no contexto clínico.

## Input

```typescript
interface GenerateTissInput {
  tipo_guia: 'consulta' | 'sp-sadt' | 'internacao' | 'honorarios' | 'odontologia';
  atendimento: {
    data: string;
    hora_inicio?: string;
    hora_fim?: string;
    carater: 'eletivo' | 'urgencia' | 'emergencia';
    tipo_atendimento: string;
    indicacao_acidente?: 'trabalho' | 'transito' | 'outros' | 'nao';
  };
  beneficiario: {
    numero_carteira: string;
    nome: string;
    data_nascimento: string;
    cns?: string;
  };
  prestador_solicitante?: {
    codigo_cnes: string;
    nome: string;
    conselho: string;
    numero_conselho: string;
    uf: string;
    cbo: string;
  };
  prestador_executante: {
    codigo_cnes: string;
    nome: string;
    tipo: 'hospital' | 'clinica' | 'laboratorio' | 'profissional';
  };
  procedimentos: Array<{
    codigo_tuss: string;
    quantidade: number;
    via_acesso?: string;
    tecnica?: string;
  }>;
  diagnostico?: {
    cid_principal: string;
    cids_secundarios?: string[];
  };
  operadora: {
    codigo_ans: string;
  };
  tenant_id: string;
}
```

## Output

```typescript
interface GenerateTissOutput {
  guia_xml: string;              // XML completo da guia TISS
  guia_json: object;             // Representação JSON da guia
  numero_guia: string;           // Número gerado para a guia
  hash_validacao: string;        // Hash de validação ANS
  validacao_previa: {
    valida: boolean;
    erros: string[];
    alertas: string[];
  };
  valor_total_estimado: number;
}
```

## Etapas de Execução

### 1. Validação de Entrada
- [ ] Verificar dados obrigatórios por tipo de guia
- [ ] Validar códigos (TUSS, CID, CNES, CBO)
- [ ] Verificar elegibilidade do beneficiário

### 2. Enriquecimento de Dados
- [ ] Buscar descrições dos procedimentos TUSS
- [ ] Calcular valores baseado na tabela de referência
- [ ] Preencher campos derivados automaticamente

### 3. Geração da Estrutura
- [ ] Montar cabeçalho conforme versão TISS
- [ ] Preencher dados do beneficiário
- [ ] Preencher dados do prestador
- [ ] Incluir procedimentos com valores

### 4. Validação e Assinatura
- [ ] Validar XML contra schema TISS
- [ ] Calcular hash de validação
- [ ] Gerar número único da guia

### 5. Pré-Auditoria
- [ ] Executar validação prévia (task: validate-tiss)
- [ ] Retornar alertas e erros

## Campos por Tipo de Guia

### Consulta
- Dados do contratado executante
- Dados do beneficiário
- Dados do atendimento
- Procedimentos realizados

### SP/SADT
- Dados do contratado solicitante
- Dados do contratado executante
- Dados do beneficiário
- Dados da solicitação
- Dados da execução

### Internação
- Dados do contratado
- Dados do beneficiário
- Dados da internação
- Procedimentos e OPM
- Outras despesas

## Critérios de Aceite

- [ ] XML válido contra schema TISS 4.01.00
- [ ] Todos os campos obrigatórios preenchidos
- [ ] Códigos TUSS válidos e ativos
- [ ] Valores calculados corretamente
- [ ] Hash de validação gerado
- [ ] Pré-validação executada

## Referências

- Schema TISS: `data/tiss-schemas/`
- Tabela TUSS: `data/tuss-procedures.json`
- Tabela CBHPM: `data/cbhpm-values.json`
- Documentação ANS: https://www.gov.br/ans/pt-br/assuntos/prestadores/padrao-para-troca-de-informacao-de-saude-suplementar-2013-tiss
