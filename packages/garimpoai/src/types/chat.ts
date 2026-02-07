// Types for conversational interface and tool use

/** Available tools for the AI to call */
export type ToolName =
  | 'search_licitacoes'
  | 'analyze_licitacao'
  | 'create_alert'
  | 'get_stats'
  | 'get_licitacao_detail'
  | 'run_collect';

/** Search parameters extracted from natural language */
export interface SearchLicitacoesInput {
  keywords: string[];
  uf?: string[];
  modalidade?: number[];
  valorMin?: number;
  valorMax?: number;
  apenasAbertas?: boolean;
  limit?: number;
}

/** Alert creation input */
export interface CreateAlertInput {
  keywords: string[];
  ufs?: string[];
  valorMin?: number;
  valorMax?: number;
  canal: 'telegram' | 'email' | 'ambos';
}

/** Detail request input */
export interface GetLicitacaoDetailInput {
  licitacaoId: string;
}

/** Analyze request input */
export interface AnalyzeLicitacaoInput {
  licitacaoId: string;
}

/** Tool call result to send back to the AI */
export interface ToolResult {
  toolName: ToolName;
  result: unknown;
  isError?: boolean;
}

/** Chat message in conversation history */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

/** A tool call made by the AI */
export interface ToolCall {
  id: string;
  name: ToolName;
  input: unknown;
}

/** Conversation session */
export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  lastSearchResults?: SearchResultReference[];
  createdAt: Date;
}

/** Reference to a search result (for "analisa a terceira") */
export interface SearchResultReference {
  index: number;
  numeroControlePNCP: string;
  objetoCompra: string;
}
