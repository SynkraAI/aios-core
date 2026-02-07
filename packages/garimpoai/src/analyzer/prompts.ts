// Prompt engineering for procurement analysis

/** System prompt for deep edital analysis */
export const ANALYSIS_SYSTEM_PROMPT = `Voce e um especialista em licitacoes publicas brasileiras.
Analise a licitacao fornecida como se estivesse explicando para alguem que nunca participou de uma licitacao.
Seja direto, pratico e use linguagem simples.

Regras:
- Responda APENAS com JSON valido, sem markdown, sem explicacoes fora do JSON
- Valores em R$ (Real brasileiro)
- Datas no formato DD/MM/AAAA
- Seja honesto sobre o que NAO da pra saber apenas pelos dados fornecidos
- Quando o valor nao for informado, indique "Nao informado" ao inves de inventar`;

/** User prompt template for structured analysis */
export function buildAnalysisPrompt(licitacaoData: Record<string, unknown>): string {
  return `Analise esta licitacao e retorne um JSON com a seguinte estrutura exata:

{
  "resumo": "resumo em linguagem simples (max 200 palavras)",
  "oQueE": "explicacao da modalidade para leigos (ex: 'Pregao Eletronico e uma forma de compra do governo feita pela internet, onde empresas disputam quem oferece o menor preco')",
  "documentosNecessarios": [
    {"nome": "nome do documento", "descricao": "para que serve e onde conseguir", "obrigatorio": true}
  ],
  "prazoProposta": "data limite formatada ou null se nao informada",
  "valorEstimado": "valor com contexto (ex: 'R$ 150.000 - valor medio para esse tipo de contratacao')",
  "dificuldade": "facil | medio | dificil",
  "justificativaDificuldade": "por que essa dificuldade",
  "requisitosHabilitacao": ["requisito 1", "requisito 2"],
  "dicaIniciante": "conselho pratico para quem esta comecando",
  "proximoPasso": "o que fazer agora se quiser participar"
}

Dados da licitacao:
${JSON.stringify(licitacaoData, null, 2)}`;
}

/** Token cost estimates per model (USD per 1M tokens) */
export const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'claude-haiku-4-5-20251001': { input: 0.80, output: 4.00 },
  'claude-sonnet-4-5-20250929': { input: 3.00, output: 15.00 },
};

/** Estimate cost in USD from token counts */
export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = MODEL_COSTS[model] || { input: 3.0, output: 15.0 };
  return (inputTokens * costs.input + outputTokens * costs.output) / 1_000_000;
}
