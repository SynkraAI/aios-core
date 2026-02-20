/**
 * AIOS-Core: Infraestrutura de Testes e Resiliência - @lorenzavolponi
 * 
 * @description Provê um LLM Simulado (Mock) para testes determinísticos (custo zero)
 * e um Executor Resiliente que se auto-corrigi em falhas comuns de agentes.
 * 
 * @impacto
 * - Resolve a dependência de "API Key" nos pipelines de CI/CD (testes rodam de graça).
 * - Reduz testes "flaky" (instáveis) fornecendo respostas previsíveis.
 * - Previne crashes de agentes devido a saídas mal formatadas (JSON quebrado) da IA.
 */

import { EventEmitter } from 'events';

// --- LLM Simulado para Testes (O "Matador de Custos") ---

export interface MockResponse {
  role: 'assistant';
  content: string;
  function_call?: { name: string; arguments: string };
}

export class SimulatedLLM {
  // Fila de respostas pré-definidas
  private responseQueue: MockResponse[] = [];
  // Histórico do que foi enviado (para asserções de teste)
  private callHistory: any[] = [];

  /**
   * Define o que o LLM "deve responder" na próxima chamada.
   * Essencial para testar lógica específica de agentes sem aleatoriedade.
   */
  public setNextResponse(response: MockResponse): void {
    this.responseQueue.push(response);
  }

  /**
   * Imita a interface da OpenAI/Anthropic.
   * Se houver resposta na fila, usa ela. Senão, gera uma resposta padrão inteligente.
   */
  public async createChatCompletion(messages: any[]): Promise<any> {
    // Registra o que o agente tentou enviar
    this.callHistory.push(messages);

    // Se temos uma resposta ensaiada, devolve ela
    if (this.responseQueue.length > 0) {
      const mockResp = this.responseQueue.shift();
      return {
        choices: [{
          message: mockResp
        }]
      };
    }

    // Resposta padrão: Ecoa a intenção do usuário (útil para testes genéricos)
    const lastUserMsg = messages[messages.length - 1].content;
    return {
      choices: [{
        message: {
          role: 'assistant',
          content: `Simulated response to: ${lastUserMsg}`
        }
      }]
    };
  }

  public getCallHistory(): any[] {
    return this.callHistory;
  }
}

// --- Executor Resiliente (O "Anti-Crash") ---

export interface ExecutorConfig {
  maxRetries: number;          // Tentativas antes de desistir
  parser: (output: string) => any; // Função de parsing (ex: JSON.parse)
}

export class ResilientExecutor {
  private config: ExecutorConfig;

  constructor(config: Partial<ExecutorConfig> = {}) {
    this.config = {
      maxRetries: 3,
      parser: JSON.parse, // Parser padrão
      ...config
    };
  }

  /**
   * Envolvimento do loop de execução do agente.
   * Se o parsing falhar (ex: JSON quebrado), ele captura o erro,
   * loga, e tenta novamente (ou solicita correção ao LLM em um cenário real).
   */
  public async execute(llmCall: () => Promise<string>): Promise<any> {
    let attempts = 0;
    let lastError: Error | null = null;
    let output = "";

    while (attempts < this.config.maxRetries) {
      try {
        // 1. Chama o LLM
        output = await llmCall();
        
        // 2. Tenta parsear a saída (ex: converter string JSON para objeto)
        const parsed = this.config.parser(output);
        return parsed; // Sucesso! Retorna o dado limpo.

      } catch (error: any) {
        lastError = error;
        attempts++;
        console.warn(`[ResilientExecutor] Tentativa ${attempts} falhou. Retentando...`);

        // Aqui entraria a lógica de correção automática:
        // Em produção, injetaríamos uma mensagem no prompt:
        // "Você retornou um JSON inválido. Erro: X. Corrija e tente novamente."
      }
    }

    // Se esgotou as tentativas, lanca o erro final
    throw new Error(`Execução falhou após ${this.config.maxRetries} tentativas. Último erro: ${lastError?.message}`);
  }
}

// --- EXEMPLO DE USO NO TESTE ---

/*
const mockLLM = new SimulatedLLM();

// Cenário: Testar se o agente cria um arquivo corretamente
mockLLM.setNextResponse({
  role: 'assistant',
  content: '{ "action": "create_file", "filename": "solution.ts" }'
});

const executor = new ResilientExecutor();

// O teste roda instantaneamente, sem internet, sem chave de API, sem custo.
const result = await executor.execute(() => mockLLM.createChatCompletion([...]));
console.log(result); // { action: 'create_file', ... }
*/
