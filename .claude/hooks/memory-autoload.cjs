// Memory Auto-Load Hook — SessionStart
// Detects current project and outputs memory context for injection.
// Runs at session start to give Claude immediate project awareness.

const fs = require('fs');
const path = require('path');
const os = require('os');

const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const AIOS_CORE = path.join(os.homedir(), 'aios-core');

function findMemory() {
  // 1. HYBRID: .aiox/memory/ in cwd
  const hybridPath = path.join(cwd, '.aios', 'memory', 'project-context.md');
  if (fs.existsSync(hybridPath)) {
    return {
      mode: 'HYBRID',
      memoryDir: path.join(cwd, '.aios', 'memory'),
      contextPath: hybridPath
    };
  }

  // 2. CENTRALIZED: check if we're in aios-core and there's a session.json with project info
  const sessionPath = path.join(cwd, '.aios', 'session.json');
  if (fs.existsSync(sessionPath)) {
    try {
      const session = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
      if (session.project) {
        const centralPath = path.join(AIOS_CORE, 'docs', 'projects', session.project, 'memory', 'project-context.md');
        if (fs.existsSync(centralPath)) {
          return {
            mode: 'CENTRALIZED',
            memoryDir: path.join(AIOS_CORE, 'docs', 'projects', session.project, 'memory'),
            contextPath: centralPath
          };
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  return null;
}

function readRecentFeedback(memoryDir, maxFiles = 3) {
  const feedbackDir = path.join(memoryDir, 'feedback');
  if (!fs.existsSync(feedbackDir)) return [];

  try {
    const files = fs.readdirSync(feedbackDir)
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        name: f,
        path: path.join(feedbackDir, f),
        mtime: fs.statSync(path.join(feedbackDir, f)).mtimeMs
      }))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, maxFiles);

    return files.map(f => {
      const content = fs.readFileSync(f.path, 'utf8');
      // Extract just the rule/key info, not full file
      const ruleMatch = content.match(/## Regra\n([\s\S]*?)(?:\n##|$)/);
      const rule = ruleMatch ? ruleMatch[1].trim() : null;
      const titleMatch = content.match(/# Feedback: (.+)/);
      const title = titleMatch ? titleMatch[1] : f.name.replace('.md', '');
      return { title, rule };
    }).filter(f => f.rule);
  } catch {
    return [];
  }
}

function main() {
  const memory = findMemory();
  if (!memory) {
    // No memory found — silent OK
    process.exit(0);
  }

  const output = [];

  // Project context summary (first 500 chars of key sections)
  try {
    const context = fs.readFileSync(memory.contextPath, 'utf8');

    // Extract key sections
    const stackMatch = context.match(/## Stack Técnica\n([\s\S]*?)(?:\n---|\n##)/);
    const rulesMatch = context.match(/## Regras de Ouro\n([\s\S]*?)(?:\n---|\n##)/);
    const decisionsMatch = context.match(/## Escolhas Técnicas Permanentes\n([\s\S]*?)(?:\n---|\n##)/);

    if (stackMatch || rulesMatch || decisionsMatch) {
      output.push('[PROJECT MEMORY]');
      if (stackMatch) output.push(`Stack: ${stackMatch[1].trim().slice(0, 200)}`);
      if (decisionsMatch) output.push(`Decisões: ${decisionsMatch[1].trim().slice(0, 300)}`);
      if (rulesMatch) output.push(`Regras: ${rulesMatch[1].trim().slice(0, 300)}`);
    }
  } catch {
    // ignore read errors
  }

  // Recent feedback
  const feedback = readRecentFeedback(memory.memoryDir);
  if (feedback.length > 0) {
    output.push('[FEEDBACK ATIVO]');
    for (const f of feedback) {
      output.push(`- ${f.title}: ${f.rule.slice(0, 150)}`);
    }
  }

  // User profile key rules
  const profilePath = path.join(AIOS_CORE, '.aiox-core', 'data', 'memory', 'user', 'luiz-fosc-profile.md');
  if (fs.existsSync(profilePath)) {
    try {
      const profile = fs.readFileSync(profilePath, 'utf8');
      const comMatch = profile.match(/## Comunicação\n([\s\S]*?)(?:\n---|\n##)/);
      if (comMatch) {
        output.push(`[USER] ${comMatch[1].trim().slice(0, 200)}`);
      }
    } catch {
      // ignore
    }
  }

  if (output.length > 0) {
    console.log(output.join('\n'));
  }
}

main();
