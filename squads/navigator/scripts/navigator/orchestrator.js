#!/usr/bin/env node

/**
 * Orchestrator Script
 * Handles multi-agent orchestration and delegation
 *
 * Used by: nav-auto-navigate, nav-orchestrate
 */

const fs = require('fs');
const _path = require('path');
const { resolveSquadPath } = require('../squad-paths');

/**
 * Delegate to another agent
 * @param {Object} options - Delegation options
 * @returns {Promise<Object>} Result of delegation
 */
async function delegateToAgent(options) {
  const {
    agent,
    command,
    context = {},
    _timeout = 300000, // 5 minutes
  } = options;

  console.log(`\n🧭 Navigator — Delegating to @${agent}\n`);
  console.log(`Command: ${command}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}\n`);

  // In production, this would actually spawn the agent
  // For now, this is a stub that returns the activation command

  const activationCommand = `@${agent}\n${command}`;

  return {
    success: true,
    agent,
    command,
    activationCommand,
    context,
    message: `Agent @${agent} activated with command: ${command}`,
  };
}

/**
 * Generate multi-chat orchestration prompts
 * @param {Object} epicData - Epic and stories data
 * @returns {Promise<Object>} Orchestration plan
 */
async function generateMultiChatPrompts(epicData) {
  const { epic, stories, template = 'nav-orchestration-tmpl.md' } = epicData;

  // Analyze dependencies
  const waves = assignStoriesToWaves(stories);

  // Load template
  const templatePath = resolveSquadPath('templates', template);
  let _templateContent = '';

  if (templatePath && fs.existsSync(templatePath)) {
    _templateContent = fs.readFileSync(templatePath, 'utf8');
  } else {
    // Fallback to basic template
    _templateContent = generateBasicOrchestrationTemplate();
  }

  // Render prompts
  const prompts = {
    coordinator: renderCoordinatorPrompt(epic, stories, waves),
    devWave1: renderDevPrompt(waves[0], 1, epic),
    devWave2: renderDevPrompt(waves[1], 2, epic),
    devWave3: renderDevPrompt(waves[2], 3, epic),
  };

  return {
    epicId: epic.id,
    epicName: epic.title,
    wavesCount: waves.length,
    prompts,
  };
}

/**
 * Assign stories to waves based on dependencies
 */
function assignStoriesToWaves(stories) {
  // Simple assignment: divide into 3 waves
  // In production, analyze actual dependencies from story metadata

  const storyCount = stories.length;
  const wavesCount = 3;
  const storiesPerWave = Math.ceil(storyCount / wavesCount);

  const waves = [];
  for (let i = 0; i < wavesCount; i++) {
    const start = i * storiesPerWave;
    const end = Math.min((i + 1) * storiesPerWave, storyCount);
    waves.push(stories.slice(start, end));
  }

  return waves;
}

/**
 * Render coordinator prompt
 */
function renderCoordinatorPrompt(epic, stories, waves) {
  return `@sm

Você é o coordenador deste epic multi-chat.

**Epic:** ${epic.id} — ${epic.title}

**Sua responsabilidade:**
1. Validar que todas as stories estão claras
2. Coordenar execução das ${waves.length} waves
3. Resolver conflitos de merge
4. Validar completion de cada wave antes de prosseguir

**Stories neste epic:**
${stories.map(s => `- ${s.id}: ${s.title}`).join('\n')}

**Waves planejadas:**
${waves.map((wave, i) => `
**Wave ${i + 1}:**
${wave.map(s => `  - ${s.id}`).join('\n')}
`).join('\n')}

**Seus comandos:**
- *draft — Para criar/validar stories se necessário
- *validate-story-draft — Para validar stories antes de delegar

**Workflow:**
1. Valide todas as stories listadas acima
2. Quando Chats de dev reportarem conclusão da Wave 1, valide
3. Libere Wave 2
4. Repita para Wave 3
5. Faça merge final quando tudo estiver pronto

Pronto para começar?
`;
}

/**
 * Render dev prompt for a wave
 */
function renderDevPrompt(wave, waveNumber, epic) {
  return `@dev

Você faz parte de uma execução multi-chat do epic ${epic.id}.

**Suas stories (Wave ${waveNumber}):**
${wave.map(s => `- ${s.id}: ${s.title}\n  Path: docs/stories/${s.id}.md`).join('\n')}

**Workflow:**
${waveNumber > 1 ? '1. AGUARDE liberação do Coordenador (Chat 1)\n2. Quando liberado, leia cada story completa' : '1. Leia cada story completa'}
${waveNumber > 1 ? '3' : '2'}. Execute *develop para cada uma
${waveNumber > 1 ? '4' : '3'}. Rode testes
${waveNumber > 1 ? '5' : '4'}. Reporte conclusão ao Chat 1 (Coordenador)

**IMPORTANTE:**
${waveNumber > 1 ? '- NÃO comece antes da liberação do Coordenador\n' : ''}- NÃO faça merge ainda (Coordenador fará isso)
- Se houver conflitos, reporte ao Coordenador

${waveNumber > 1 ? 'Aguardando liberação da Wave ' + waveNumber + '...' : 'Pronto para começar Wave 1?'}
`;
}

/**
 * Generate basic orchestration template
 */
function generateBasicOrchestrationTemplate() {
  return `# Multi-Chat Orchestration

## Epic: {{epic_name}}

[Orchestration prompts would be generated here]
`;
}

/**
 * Track agent execution status
 */
function trackAgentExecution(agentId) {
  // In production, this would monitor agent execution
  // For now, return a stub
  return {
    agentId,
    status: 'active',
    startedAt: new Date().toISOString(),
  };
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'delegate') {
    const agent = process.argv[3];
    const agentCommand = process.argv[4];

    delegateToAgent({ agent, command: agentCommand })
      .then(result => {
        console.log(JSON.stringify(result, null, 2));
      })
      .catch(error => {
        console.error('✗ Delegation failed:', error.message);
        process.exit(1);
      });
  } else {
    console.error('Usage: orchestrator.js <delegate|generate> [args...]');
    process.exit(1);
  }
}

module.exports = {
  delegateToAgent,
  generateMultiChatPrompts,
  trackAgentExecution,
};
