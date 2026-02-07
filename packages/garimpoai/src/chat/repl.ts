import Anthropic from '@anthropic-ai/sdk';
import readline from 'readline';
import chalk from 'chalk';
import { GarimpoAIConfig } from '../types/config';
import { SYSTEM_PROMPT } from './system-prompt';
import { TOOLS } from './tools';
import { ToolExecutor } from './tool-executor';
import { FilterEngine } from '../filter/engine';

const MAX_CONTEXT_MESSAGES = 20;

/** Start the interactive conversational REPL */
export async function startChat(config: GarimpoAIConfig): Promise<void> {
  // Check for API key
  if (!config.ia.apiKey) {
    console.log(chalk.red('\n❌ Chave de API Anthropic necessária para o modo conversacional.'));
    console.log(chalk.dim('   Configure em garimpoai.yaml (ia.apiKey) ou exporte ANTHROPIC_API_KEY.\n'));
    process.exit(1);
  }

  const client = new Anthropic({ apiKey: config.ia.apiKey });
  const toolExecutor = new ToolExecutor(config);
  const filterEngine = new FilterEngine(config);

  // Show header
  const stats = filterEngine.getStats();
  console.log(chalk.bold.yellow('\n┌─ GarimpoAI v0.1.0 ────────────────────────────────────┐'));
  console.log(chalk.yellow(`│ Banco: ${String(stats.total).padEnd(6)} licitações | Matched: ${String(stats.matched).padEnd(6)}      │`));
  console.log(chalk.yellow('│ Digite sua pergunta ou /help para comandos rápidos     │'));
  console.log(chalk.bold.yellow('└───────────────────────────────────────────────────────┘\n'));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.bold.yellow('Garimpo> '),
  });

  const messages: Anthropic.Messages.MessageParam[] = [];

  // Provide last search results as context for ordinal references
  function enrichSystemPrompt(): string {
    const lastResults = toolExecutor.getLastSearchResults();
    if (lastResults.length === 0) return SYSTEM_PROMPT;

    const resultContext = lastResults
      .map((r) => `${r.index}. [${r.numeroControlePNCP}] ${r.objetoCompra.substring(0, 80)}`)
      .join('\n');

    return (
      SYSTEM_PROMPT +
      `\n\n## Resultados da ultima busca (use esses IDs quando o usuario referenciar por numero):\n${resultContext}`
    );
  }

  async function processMessage(userInput: string): Promise<void> {
    // Handle quick commands
    if (userInput.startsWith('/')) {
      const cmd = userInput.trim().toLowerCase();
      if (cmd === '/help') {
        console.log(chalk.dim('\n  Comandos rápidos:'));
        console.log(chalk.dim('  /collect  — Coletar licitações agora'));
        console.log(chalk.dim('  /stats    — Ver estatísticas'));
        console.log(chalk.dim('  /clear    — Limpar conversa'));
        console.log(chalk.dim('  /quit     — Sair\n'));
        return;
      }
      if (cmd === '/quit' || cmd === '/exit' || cmd === '/q') {
        console.log(chalk.dim('\nAté mais! 👋\n'));
        process.exit(0);
      }
      if (cmd === '/clear') {
        messages.length = 0;
        console.log(chalk.dim('\nConversa limpa.\n'));
        return;
      }
      if (cmd === '/stats') {
        const s = filterEngine.getStats();
        console.log(chalk.dim(`\n  Total: ${s.total} | Matched: ${s.matched} | Analisadas: ${s.analisados}\n`));
        return;
      }
      if (cmd === '/collect') {
        // Treat as natural language message
        userInput = 'colete novas licitações dos últimos 7 dias';
      }
    }

    // Add user message
    messages.push({ role: 'user', content: userInput });

    // Keep context window manageable
    while (messages.length > MAX_CONTEXT_MESSAGES) {
      messages.shift();
    }

    try {
      // Call Claude with tools
      let response = await client.messages.create({
        model: config.ia.chatModel,
        max_tokens: 4096,
        system: enrichSystemPrompt(),
        tools: TOOLS,
        messages,
      });

      // Handle tool use loop
      while (response.stop_reason === 'tool_use') {
        const assistantContent = response.content;
        messages.push({ role: 'assistant', content: assistantContent });

        // Execute all tool calls
        const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

        for (const block of assistantContent) {
          if (block.type === 'tool_use') {
            const toolName = block.name;
            const toolInput = block.input as Record<string, unknown>;

            // Show tool execution indicator
            process.stdout.write(chalk.dim(`  ⚡ ${toolName}...`));

            const result = await toolExecutor.execute(toolName, toolInput);

            process.stdout.write(chalk.dim(' ✓\n'));

            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: result,
            });
          }
        }

        // Send tool results back
        messages.push({ role: 'user', content: toolResults });

        response = await client.messages.create({
          model: config.ia.chatModel,
          max_tokens: 4096,
          system: enrichSystemPrompt(),
          tools: TOOLS,
          messages,
        });
      }

      // Extract and display text response
      const textBlocks = response.content.filter(
        (b): b is Anthropic.Messages.TextBlock => b.type === 'text'
      );

      if (textBlocks.length > 0) {
        const text = textBlocks.map((b) => b.text).join('\n');
        console.log(`\n${text}\n`);
        messages.push({ role: 'assistant', content: response.content });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(chalk.red(`\n❌ Erro: ${msg}\n`));

      // Remove the failed message from context
      messages.pop();
    }
  }

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }

    await processMessage(input);
    rl.prompt();
  });

  rl.on('close', () => {
    console.log(chalk.dim('\nAté mais! 👋\n'));
    process.exit(0);
  });
}
