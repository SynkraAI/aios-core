#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const AGENT_INFO = {
  'aios-master': { icon: '🧠', role: 'Master Orchestrator' },
  analyst: { icon: '📊', role: 'Business Analyst' },
  architect: { icon: '🏛️', role: 'System Architect' },
  'data-engineer': { icon: '🗄️', role: 'Data Engineer' },
  dev: { icon: '💻', role: 'Developer' },
  devops: { icon: '🚀', role: 'DevOps' },
  pm: { icon: '📋', role: 'Product Manager' },
  po: { icon: '🎯', role: 'Product Owner' },
  qa: { icon: '🧪', role: 'QA Engineer' },
  sm: { icon: '🔄', role: 'Scrum Master' },
  'squad-creator': { icon: '🛠️', role: 'Squad Creator' },
  'ux-design-expert': { icon: '🎨', role: 'UX Expert' },
};

function listAvailableAgents(projectRoot = process.cwd()) {
  const sourceDir = path.join(projectRoot, '.aios-core', 'development', 'agents');
  if (!fs.existsSync(sourceDir)) return [];
  return fs
    .readdirSync(sourceDir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => f.replace('.md', ''))
    .sort();
}

function commandNameForAgent(agentId) {
  if (agentId.startsWith('aios-')) {
    return `/aios-${agentId.replace(/^aios-/, '')}`;
  }
  return `/aios-${agentId}`;
}

function hasAgent(projectRoot, agentId) {
  const canonical = path.join(projectRoot, '.aios-core', 'development', 'agents', `${agentId}.md`);
  const gemini = path.join(projectRoot, '.gemini', 'rules', 'AIOS', 'agents', `${agentId}.md`);
  return fs.existsSync(canonical) || fs.existsSync(gemini);
}

function renderGreeting(projectRoot, agentId) {
  const scriptPath = path.join(projectRoot, '.aios-core', 'development', 'scripts', 'generate-greeting.js');
  if (!fs.existsSync(scriptPath)) {
    return null;
  }

  const result = spawnSync('node', [scriptPath, agentId], {
    cwd: projectRoot,
    encoding: 'utf8',
    timeout: 10000,
  });

  if (result.status !== 0) {
    return null;
  }

  return (result.stdout || '').trim() || null;
}

function buildActivationPrompt(agentId) {
  return [
    `Ative o agente ${agentId} usando .aios-core/development/agents/${agentId}.md`,
    `(fallback: .gemini/rules/AIOS/agents/${agentId}.md),`,
    `renderize o greeting via node .aios-core/development/scripts/generate-greeting.js ${agentId}`,
    'e mantenha a persona ate *exit.',
  ].join(' ');
}

function runAgentLauncher(agentId, projectRoot = process.cwd()) {
  if (!agentId) {
    console.log('Uso: /aios-agent <agent-id>');
    return 1;
  }

  if (!hasAgent(projectRoot, agentId)) {
    const available = listAvailableAgents(projectRoot);
    console.log(`❌ Agente não encontrado: ${agentId}`);
    if (available.length > 0) {
      console.log('\nAgentes disponíveis:');
      for (const id of available) {
        console.log(`- ${commandNameForAgent(id)}`);
      }
    }
    return 1;
  }

  const info = AGENT_INFO[agentId] || { icon: '🤖', role: 'Agent' };
  const activationPrompt = buildActivationPrompt(agentId);
  const greeting = renderGreeting(projectRoot, agentId);

  console.log(`${info.icon} AIOS Agent Selected: ${agentId}`);
  console.log(`Role: ${info.role}`);
  console.log('');
  console.log('Activation Prompt (copy and send as your next message):');
  console.log(activationPrompt);

  if (greeting) {
    console.log('\nGreeting Preview:');
    console.log(greeting.split('\n').slice(0, 8).join('\n'));
  }

  return 0;
}

function runAgentMenu(projectRoot = process.cwd()) {
  const agents = listAvailableAgents(projectRoot);

  console.log('🤖 AIOS Quick Agent Menu (Gemini)');
  console.log('');

  if (agents.length === 0) {
    console.log('No AIOS agents found. Run: npm run sync:ide:gemini');
    return 1;
  }

  for (const id of agents) {
    const info = AGENT_INFO[id] || { icon: '🤖', role: 'Agent' };
    console.log(`${info.icon} ${commandNameForAgent(id)}  (${info.role})`);
  }

  console.log('\nTip: run /aios-<agent-id> to prepare activation prompt quickly.');
  return 0;
}

module.exports = {
  AGENT_INFO,
  listAvailableAgents,
  hasAgent,
  buildActivationPrompt,
  commandNameForAgent,
  runAgentLauncher,
  runAgentMenu,
};
