/**
 * Ralph State Manager - Serializa/deserializa ralph-state.yaml
 *
 * Funções:
 * - Save: Persiste estado do loop em ralph-state.yaml
 * - Load: Carrega estado salvo
 * - Update: Atualiza campos específicos
 * - Init: Cria estado inicial para nova sessão
 *
 * Uso via CLI:
 *   node ralph-state.js init <source> [mode]   → Cria estado inicial
 *   node ralph-state.js load                    → Carrega estado atual
 *   node ralph-state.js update <key> <value>    → Atualiza campo
 *   node ralph-state.js status                  → Status one-liner
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = 'ralph-state.yaml';

function getStatePath() {
  return path.resolve(process.cwd(), STATE_FILE);
}

function serializeYaml(obj, indent = 0) {
  const prefix = '  '.repeat(indent);
  let result = '';

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      result += `${prefix}${key}:\n`;
    } else if (Array.isArray(value)) {
      result += `${prefix}${key}:\n`;
      value.forEach((item) => {
        if (typeof item === 'object') {
          result += `${prefix}  -\n${serializeYaml(item, indent + 2)}`;
        } else {
          result += `${prefix}  - "${item}"\n`;
        }
      });
    } else if (typeof value === 'object') {
      result += `${prefix}${key}:\n${serializeYaml(value, indent + 1)}`;
    } else if (typeof value === 'string') {
      result += `${prefix}${key}: "${value}"\n`;
    } else {
      result += `${prefix}${key}: ${value}\n`;
    }
  }

  return result;
}

function parseSimpleYaml(content) {
  const result = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.substring(0, colonIdx).trim();
    let value = trimmed.substring(colonIdx + 1).trim();

    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    } else if (value === 'null') {
      value = null;
    } else if (!isNaN(value) && value !== '') {
      value = Number(value);
    }

    result[key] = value;
  }

  return result;
}

function initState(source, mode = 'yolo') {
  const timestamp = Date.now();
  const state = {
    session_id: `ralph-${timestamp}`,
    source: source,
    mode: mode,
    status: 'running',
    current_iteration: 0,
    current_task: '',
    tasks_total: 0,
    tasks_completed: 0,
    tasks_failed: 0,
    started_at: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  };

  saveState(state);
  return state;
}

function loadState() {
  const statePath = getStatePath();

  if (!fs.existsSync(statePath)) {
    return null;
  }

  const content = fs.readFileSync(statePath, 'utf8');
  return parseSimpleYaml(content);
}

function saveState(state) {
  state.last_updated = new Date().toISOString();
  const yaml = serializeYaml(state);
  fs.writeFileSync(getStatePath(), yaml, 'utf8');
  return state;
}

function updateState(key, value) {
  const state = loadState();
  if (!state) {
    throw new Error('No active session. Use init first.');
  }

  state[key] = value;
  return saveState(state);
}

function getStatusLine() {
  const state = loadState();

  if (!state) {
    return '🔄 Ralph [idle] No active session. Use *develop to start.';
  }

  const elapsed = Math.round((Date.now() - new Date(state.started_at).getTime()) / 60000);
  const pct = state.tasks_total > 0 ? Math.round((state.tasks_completed / state.tasks_total) * 100) : 0;

  return `🔄 Ralph [${state.status}] iter:${state.current_iteration} | task:"${state.current_task}" | ${state.tasks_completed}/${state.tasks_total} (${pct}%) | ${elapsed}min elapsed`;
}

// CLI
if (require.main === module) {
  const [, , command, arg1, arg2] = process.argv;

  switch (command) {
    case 'init':
      if (!arg1) {
        console.error('Usage: node ralph-state.js init <source> [mode]');
        process.exit(1);
      }
      console.log(JSON.stringify(initState(arg1, arg2 || 'yolo')));
      break;
    case 'load':
      const state = loadState();
      console.log(state ? JSON.stringify(state) : '{"error":"No active session"}');
      break;
    case 'update':
      if (!arg1 || arg2 === undefined) {
        console.error('Usage: node ralph-state.js update <key> <value>');
        process.exit(1);
      }
      console.log(JSON.stringify(updateState(arg1, arg2)));
      break;
    case 'status':
      console.log(getStatusLine());
      break;
    default:
      console.log('Usage: node ralph-state.js <init|load|update|status> [args]');
      process.exit(1);
  }
}

module.exports = { initState, loadState, saveState, updateState, getStatusLine };
