/**
 * Ralph Context Monitor - Estima tokens usados na sessão
 *
 * Funções:
 * - Estima tokens usados com base em arquivos de estado
 * - Retorna flag de reset necessário
 * - Sugere quando fazer auto-reset
 *
 * Uso via CLI:
 *   node ralph-context-monitor.js check [limit]  → Verifica se reset é necessário
 *   node ralph-context-monitor.js estimate        → Estima tokens acumulados
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_CONTEXT_LIMIT = 80000;
const TOKENS_PER_CHAR = 0.25; // Rough estimate: ~4 chars per token

function estimateFileTokens(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  const content = fs.readFileSync(filePath, 'utf8');
  return Math.round(content.length * TOKENS_PER_CHAR);
}

function estimateSessionTokens() {
  const cwd = process.cwd();
  const files = {
    state: path.join(cwd, 'ralph-state.yaml'),
    progress: path.join(cwd, 'progress.md'),
    config: path.join(cwd, 'ralph-config.yaml'),
    decisions: path.join(cwd, 'decision-log.md'),
  };

  const estimates = {};
  let total = 0;

  for (const [name, filePath] of Object.entries(files)) {
    const tokens = estimateFileTokens(filePath);
    estimates[name] = tokens;
    total += tokens;
  }

  // Add base overhead for conversation context
  const conversationOverhead = 5000;
  total += conversationOverhead;
  estimates.conversation_overhead = conversationOverhead;

  return {
    total_estimated_tokens: total,
    breakdown: estimates,
  };
}

function checkContextHealth(limit = DEFAULT_CONTEXT_LIMIT) {
  const estimate = estimateSessionTokens();
  const usage = estimate.total_estimated_tokens;
  const percentage = Math.round((usage / limit) * 100);

  return {
    estimated_tokens: usage,
    limit: limit,
    usage_percentage: percentage,
    needs_reset: percentage >= 80,
    recommendation:
      percentage >= 90
        ? 'CRITICAL: Reset immediately. Save state and *resume.'
        : percentage >= 80
          ? 'WARNING: Context getting heavy. Consider resetting soon.'
          : percentage >= 60
            ? 'OK: Context moderate. Monitor closely.'
            : 'GOOD: Plenty of context remaining.',
    breakdown: estimate.breakdown,
  };
}

// CLI
if (require.main === module) {
  const [, , command, arg] = process.argv;

  switch (command) {
    case 'check': {
      const limit = arg ? parseInt(arg, 10) : DEFAULT_CONTEXT_LIMIT;
      const result = checkContextHealth(limit);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case 'estimate':
      console.log(JSON.stringify(estimateSessionTokens(), null, 2));
      break;
    default:
      console.log('Usage: node ralph-context-monitor.js <check|estimate> [limit]');
      process.exit(1);
  }
}

module.exports = { estimateSessionTokens, checkContextHealth };
