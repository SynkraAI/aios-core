/**
 * Ralph Parser - Extrai tarefas de stories/PRDs
 *
 * Funções:
 * - Extrai próxima tarefa [ ] não completada
 * - Conta progresso (completed vs total)
 * - Lê checkboxes do story/PRD
 * - Marca tarefas como [x] completadas
 *
 * Uso via CLI:
 *   node ralph-parser.js next <file>       → Próxima tarefa [ ]
 *   node ralph-parser.js progress <file>   → Contagem de progresso
 *   node ralph-parser.js mark <file> <n>   → Marca tarefa N como [x]
 *   node ralph-parser.js list <file>       → Lista todas as tarefas
 */

const fs = require('fs');
const path = require('path');

const CHECKBOX_PATTERN = /^(\s*)-\s*\[([ x])\]\s*(.+)$/gm;

function parseTasks(content) {
  const tasks = [];
  let match;
  let index = 0;

  const regex = new RegExp(CHECKBOX_PATTERN.source, 'gm');
  while ((match = regex.exec(content)) !== null) {
    tasks.push({
      index: index++,
      indent: match[1].length,
      completed: match[2] === 'x',
      text: match[3].trim(),
      fullMatch: match[0],
      position: match.index,
    });
  }

  return tasks;
}

function getProgress(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const tasks = parseTasks(content);
  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    completed,
    total,
    percentage,
    remaining: total - completed,
  };
}

function getNextTask(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const tasks = parseTasks(content);
  const next = tasks.find((t) => !t.completed);

  if (!next) {
    return { done: true, message: 'All tasks completed' };
  }

  return {
    done: false,
    index: next.index,
    text: next.text,
    totalRemaining: tasks.filter((t) => !t.completed).length,
  };
}

function markTaskComplete(filePath, taskIndex) {
  let content = fs.readFileSync(filePath, 'utf8');
  const tasks = parseTasks(content);

  if (taskIndex < 0 || taskIndex >= tasks.length) {
    throw new Error(`Task index ${taskIndex} out of range (0-${tasks.length - 1})`);
  }

  const task = tasks[taskIndex];
  const newLine = task.fullMatch.replace('[ ]', '[x]');
  content = content.substring(0, task.position) + newLine + content.substring(task.position + task.fullMatch.length);

  fs.writeFileSync(filePath, content, 'utf8');
  return { marked: true, task: task.text };
}

function listTasks(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return parseTasks(content);
}

// CLI
if (require.main === module) {
  const [, , command, filePath, arg] = process.argv;

  if (!command || !filePath) {
    console.log('Usage: node ralph-parser.js <command> <file> [arg]');
    console.log('Commands: next, progress, mark <n>, list');
    process.exit(1);
  }

  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  switch (command) {
    case 'next':
      console.log(JSON.stringify(getNextTask(resolvedPath)));
      break;
    case 'progress':
      console.log(JSON.stringify(getProgress(resolvedPath)));
      break;
    case 'mark':
      console.log(JSON.stringify(markTaskComplete(resolvedPath, parseInt(arg, 10))));
      break;
    case 'list':
      console.log(JSON.stringify(listTasks(resolvedPath), null, 2));
      break;
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

module.exports = { parseTasks, getProgress, getNextTask, markTaskComplete, listTasks };
