# Task: generate-sus-aih
# FinHealth Squad | AIOS Task Format v1

name: generate-sus-aih
display_name: "Gerar AIH/BPA SUS"
agent: billing-agent
squad: finhealth-squad
version: 1.0.0

## Objetivo

Gerar documentos de faturamento SUS (AIH - Autorização de Internação Hospitalar ou BPA - Boletim de Produção Ambulatorial) a partir dos dados do atendimento, seguindo as regras do SIGTAP e do DATASUS.

## Input

```typescript
interface GenerateSusInput {
  tipo: 'aih' | 'bpa-i' | 'bpa-c';
  atendimento: {
    data_atendimento: string;
    data_saida?: string;           // Obrigatório para AIH
    carater: 'eletivo' | 'urgencia';
    motivo_saida?: string;         // Para AIH
  };
  paciente: {
    cns: string;
    nome: string;
    data_nascimento: string;
    sexo: 'M' | 'F';
    endereco: {
      cep: string;
      municipio_ibge: string;
    };
  };
  estabelecimento: {
    cnes: string;
    cnpj: string;
  };
  procedimentos: Array<{
    codigo_sigtap: string;
    quantidade: number;
    cbo_executante: string;
    cns_executante?: string;
  }>;
  diagnostico: {
    cid_principal: string;
    cid_secundario?: string;
    cid_obito?: string;
  };
  tenant_id: string;
}
```

## Output

```typescript
interface GenerateSusOutput {
  tipo: 'aih' | 'bpa';
  numero: string;
  arquivo_txt: string;           // Arquivo no formato DATASUS
  arquivo_xml?: string;          // XML se aplicável
  valor_calculado: number;
  procedimentos_validados: Array<{
    codigo: string;
    descricao: string;
    valor_unitario: number;
    valor_total: number;
  }>;
  alertas: string[];
}
```

## Etapas de Execução

### 1. Validação de Entrada
- [ ] Verificar CNS do paciente (válido e formatado)
- [ ] Verificar CNES do estabelecimento
- [ ] Validar códigos SIGTAP contra tabela vigente
- [ ] Verificar CBO dos executantes

### 2. Classificação de Procedimentos
- [ ] Identificar procedimento principal
- [ ] Classificar procedimentos secundários
- [ ] Verificar compatibilidades SIGTAP
- [ ] Calcular valores conforme tabela SUS

### 3. Geração do Documento
- [ ] Para AIH: gerar arquivo no formato AIH-RD
- [ ] Para BPA: gerar arquivo BPA-I ou BPA-C
- [ ] Incluir cabeçalho e totalizadores
- [ ] Aplicar formatação DATASUS

### 4. Validação Final
- [ ] Validar consistência do arquivo
- [ ] Verificar regras de faturamento SUS
- [ ] Calcular valor total

## Tipos de Documento SUS

### AIH (Internação)
- AIH-RD: Autorização de Internação Hospitalar
- Procedimentos de alta complexidade
- Internações cirúrgicas e clínicas

### BPA-I (Individual)
- Procedimentos ambulatoriais com identificação
- Ações programáticas
- Procedimentos de média complexidade

### BPA-C (Consolidado)
- Procedimentos de baixa complexidade
- Ações coletivas
- Atendimentos sem identificação individual

## Critérios de Aceite

- [ ] Arquivo gerado no formato DATASUS válido
- [ ] Códigos SIGTAP válidos e vigentes
- [ ] CNS e CNES validados
- [ ] Valores calculados conforme tabela SUS
- [ ] Compatibilidades verificadas

## Referências

- SIGTAP: `data/sigtap-procedures.json`
- Manual AIH: DATASUS
- Manual BPA: DATASUS
