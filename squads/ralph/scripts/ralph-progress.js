/**
 * Ralph Progress Tracker - Append formatado no progress.md
 *
 * Funções:
 * - Registra resultados de iterações
 * - Acumula learnings
 * - Registra erros
 * - Gera resumo de métricas
 *
 * Uso via CLI:
 *   node ralph-progress.js init <source>                    → Cria progress.md
 *   node ralph-progress.js log <iteration> <task> <agent> <result> [learning]
 *   node ralph-progress.js error <iteration> <task> <message>
 *   node ralph-progress.js summary                          → Resumo acumulado
 *   node ralph-progress.js learnings                        → Lista learnings
 */

const fs = require('fs');
const path = require('path');

const PROGRESS_FILE = 'progress.md';

function getProgressPath() {
  return path.resolve(process.cwd(), PROGRESS_FILE);
}

function initProgress(source) {
  const content = `# Ralph Progress

**Source:** ${source}
**Started:** ${new Date().toISOString()}

---

## Iterations

`;

  fs.writeFileSync(getProgressPath(), content, 'utf8');
  return { created: true, path: getProgressPath() };
}

function logIteration(iteration, task, agent, result, learning = '') {
  const progressPath = getProgressPath();

  if (!fs.existsSync(progressPath)) {
    throw new Error('progress.md not found. Run init first.');
  }

  const icon = result === 'SUCCESS' ? '✅' : result === 'FAILED' ? '❌' : '⚠️';
  let entry = `
### Iteration ${iteration}
- **Task:** ${task}
- **Agent:** ${agent}
- **Result:** ${icon} ${result}
- **Time:** ${new Date().toISOString()}
`;

  if (learning) {
    entry += `- **Learning:** ${learning}\n`;
  }

  fs.appendFileSync(progressPath, entry, 'utf8');
  return { logged: true, iteration };
}

function logError(iteration, task, message) {
  const progressPath = getProgressPath();

  if (!fs.existsSync(progressPath)) {
    throw new Error('progress.md not found. Run init first.');
  }

  const entry = `
### Iteration ${iteration} - ERROR
- **Task:** ${task}
- **Error:** ${message}
- **Time:** ${new Date().toISOString()}
`;

  fs.appendFileSync(progressPath, entry, 'utf8');
  return { logged: true, type: 'error' };
}

function getSummary() {
  const progressPath = getProgressPath();

  if (!fs.existsSync(progressPath)) {
    return { error: 'No progress file found' };
  }

  const content = fs.readFileSync(progressPath, 'utf8');

  const successCount = (content.match(/✅ SUCCESS/g) || []).length;
  const failedCount = (content.match(/❌ FAILED/g) || []).length;
  const warningCount = (content.match(/⚠️/g) || []).length;
  const iterationCount = (content.match(/### Iteration \d+/g) || []).length;
  const learnings = [];

  const learningRegex = /\*\*Learning:\*\* (.+)/g;
  let match;
  while ((match = learningRegex.exec(content)) !== null) {
    learnings.push(match[1]);
  }

  return {
    iterations: iterationCount,
    success: successCount,
    failed: failedCount,
    warnings: warningCount,
    learnings_count: learnings.length,
    learnings: learnings,
  };
}

function getLearnings() {
  const summary = getSummary();
  return summary.learnings || [];
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'init':
      console.log(JSON.stringify(initProgress(args[1] || 'unknown')));
      break;
    case 'log':
      console.log(JSON.stringify(logIteration(args[1], args[2], args[3], args[4], args[5])));
      break;
    case 'error':
      console.log(JSON.stringify(logError(args[1], args[2], args[3])));
      break;
    case 'summary':
      console.log(JSON.stringify(getSummary(), null, 2));
      break;
    case 'learnings':
      console.log(JSON.stringify(getLearnings(), null, 2));
      break;
    default:
      console.log('Usage: node ralph-progress.js <init|log|error|summary|learnings> [args]');
      process.exit(1);
  }
}

module.exports = { initProgress, logIteration, logError, getSummary, getLearnings };
