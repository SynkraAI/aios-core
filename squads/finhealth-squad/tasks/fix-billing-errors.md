# Task: fix-billing-errors
# FinHealth Squad | AIOS Task Format v1

name: fix-billing-errors
display_name: "Corrigir Erros de Faturamento"
agent: billing-agent
squad: finhealth-squad
version: 1.0.0

## Objetivo

Corrigir automaticamente erros detectados em guias TISS ou documentos SUS, aplicando correções validadas e gerando relatório das alterações realizadas.

## Input

```typescript
interface FixBillingErrorsInput {
  guia: object;                    // Guia original com erros
  erros_detectados: Array<{
    codigo: string;
    campo: string;
    tipo: 'critico' | 'alerta';
    mensagem: string;
    sugestao_correcao: string;
  }>;
  modo: 'automatico' | 'interativo';
  tenant_id: string;
}
```

## Output

```typescript
interface FixBillingErrorsOutput {
  guia_corrigida: object;
  correcoes_aplicadas: Array<{
    campo: string;
    valor_anterior: any;
    valor_novo: any;
    justificativa: string;
  }>;
  erros_nao_corrigidos: Array<{
    codigo: string;
    motivo: string;
    acao_necessaria: string;
  }>;
  requer_revisao_humana: boolean;
}
```

## Etapas de Execução

### 1. Análise dos Erros
- [ ] Classificar erros por tipo e severidade
- [ ] Identificar erros com correção automática possível
- [ ] Identificar erros que requerem intervenção humana

### 2. Correções Automáticas
- [ ] Formatar campos (datas, códigos, valores)
- [ ] Substituir códigos inválidos por válidos equivalentes
- [ ] Ajustar valores para limites contratuais
- [ ] Remover duplicidades

### 3. Correções Interativas
- [ ] Apresentar opções de correção ao usuário
- [ ] Solicitar confirmação para correções críticas
- [ ] Registrar decisões do usuário

### 4. Validação Pós-Correção
- [ ] Re-executar validação completa
- [ ] Verificar se novos erros foram introduzidos
- [ ] Confirmar integridade da guia

## Correções Automáticas Suportadas

| Erro | Correção |
|------|----------|
| Formato de data incorreto | Converter para ISO 8601 |
| Código TUSS com dígito errado | Sugerir código similar válido |
| Valor acima do limite | Ajustar para valor máximo permitido |
| Quantidade decimal | Arredondar para inteiro |
| Duplicidade | Remover item duplicado |
| Campo em branco obrigatório | Preencher com padrão se possível |

## Correções que Requerem Intervenção

- CID incompatível com procedimento
- Procedimento não coberto pelo plano
- Falta de autorização prévia
- Inconsistências clínicas

## Critérios de Aceite

- [ ] Correções aplicadas mantêm integridade da guia
- [ ] Todas as alterações documentadas
- [ ] Re-validação executada após correções
- [ ] Erros não corrigidos claramente reportados
