import type Anthropic from '@anthropic-ai/sdk';

/** Tool definitions for Claude function calling */
export const TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: 'search_licitacoes',
    description:
      'Busca licitacoes no banco de dados local. Use para encontrar licitacoes por palavras-chave, UF, modalidade ou valor. Sempre use esta tool quando o usuario perguntar sobre licitacoes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        keywords: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Palavras-chave para buscar no objeto da licitacao. Ex: ["software", "TI"], ["mobiliario"], ["construcao civil"]',
        },
        uf: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Siglas de UF para filtrar. Ex: ["SP"], ["RJ", "MG"]. Se nao informado, busca em todos os estados.',
        },
        modalidade: {
          type: 'array',
          items: { type: 'number' },
          description:
            'Codigos de modalidade: 6=Pregao Eletronico, 8=Dispensa, 4=Concorrencia Eletronica, 9=Inexigibilidade',
        },
        valorMin: {
          type: 'number',
          description: 'Valor minimo estimado em reais',
        },
        valorMax: {
          type: 'number',
          description: 'Valor maximo estimado em reais',
        },
        apenasAbertas: {
          type: 'boolean',
          description: 'Se true, retorna apenas licitacoes com propostas ainda abertas',
        },
        limit: {
          type: 'number',
          description: 'Numero maximo de resultados (default: 10)',
        },
      },
      required: ['keywords'],
    },
  },
  {
    name: 'analyze_licitacao',
    description:
      'Analisa uma licitacao em profundidade usando IA. Retorna resumo em linguagem simples, documentos necessarios, dificuldade, dicas para iniciantes. Use quando o usuario pedir para analisar uma licitacao especifica.',
    input_schema: {
      type: 'object' as const,
      properties: {
        licitacaoId: {
          type: 'string',
          description: 'O numeroControlePNCP da licitacao a analisar',
        },
      },
      required: ['licitacaoId'],
    },
  },
  {
    name: 'create_alert',
    description:
      'Cria um alerta para ser notificado quando novas licitacoes matcharem os criterios. Use quando o usuario disser "me avisa", "quero ser notificado", "cria um alerta".',
    input_schema: {
      type: 'object' as const,
      properties: {
        keywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'Palavras-chave para o alerta',
        },
        ufs: {
          type: 'array',
          items: { type: 'string' },
          description: 'UFs para monitorar',
        },
        valorMin: {
          type: 'number',
          description: 'Valor minimo',
        },
        valorMax: {
          type: 'number',
          description: 'Valor maximo',
        },
        canal: {
          type: 'string',
          enum: ['telegram', 'email', 'ambos'],
          description: 'Canal de notificacao (default: telegram)',
        },
      },
      required: ['keywords'],
    },
  },
  {
    name: 'get_stats',
    description:
      'Retorna estatisticas do banco de dados: total de licitacoes, matched, analisadas, por UF e por modalidade. Use quando o usuario perguntar "quantas licitacoes tem?", "me mostra estatisticas".',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_licitacao_detail',
    description:
      'Busca detalhes completos de uma licitacao especifica pelo seu ID (numeroControlePNCP). Use para ver todos os campos de uma licitacao.',
    input_schema: {
      type: 'object' as const,
      properties: {
        licitacaoId: {
          type: 'string',
          description: 'O numeroControlePNCP da licitacao',
        },
      },
      required: ['licitacaoId'],
    },
  },
  {
    name: 'run_collect',
    description:
      'Executa uma coleta de licitacoes da API PNCP. Use quando o usuario pedir para atualizar o banco, coletar novas licitacoes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dias: {
          type: 'number',
          description: 'Numero de dias para coletar (default: 7)',
        },
      },
    },
  },
];
