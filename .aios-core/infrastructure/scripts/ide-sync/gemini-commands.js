'use strict';

const fs = require('fs-extra');
const path = require('path');

const GEMINI_AGENT_DESCRIPTIONS = {
  'aios-master': 'Orquestrador AIOS (estratégia, arquitetura e coordenação multiagente)',
  analyst: 'Analista de negócio (pesquisa, requisitos, descobertas e priorização)',
  architect: 'Arquiteto de sistema (arquitetura, stack, APIs e decisões técnicas)',
  'data-engineer': 'Engenharia de dados (modelagem, banco, migrações e performance SQL)',
  dev: 'Desenvolvedor full stack (implementação, refatoração, debug e testes)',
  devops: 'DevOps e repositório (quality gates, release, branch, push e PR)',
  pm: 'Product Manager (PRD, estratégia, roadmap e priorização)',
  po: 'Product Owner (backlog, critérios de aceite e refinamento)',
  qa: 'Qualidade e testes (estratégia de teste, riscos e validação)',
  sm: 'Scrum Master (stories, fluxo ágil, planejamento e acompanhamento)',
  'squad-creator': 'Squad Creator (criar, validar e evoluir squads)',
  'ux-design-expert': 'UX/UI (pesquisa, fluxo, design system e experiência do usuário)',
};

const MENU_ORDER = [
  'aios-master',
  'analyst',
  'architect',
  'data-engineer',
  'dev',
  'devops',
  'pm',
  'po',
  'qa',
  'sm',
  'squad-creator',
  'ux-design-expert',
];

function commandSlugForAgent(agentId) {
  if (agentId.startsWith('aios-')) {
    return agentId.replace(/^aios-/, '');
  }
  return agentId;
}

function menuCommandName(agentId) {
  return `/aios-${commandSlugForAgent(agentId)}`;
}

function buildAgentCommandPrompt(agentId) {
  return [
    `Ative o agente ${agentId}:`,
    `1. Leia a definição completa em .gemini/rules/AIOS/agents/${agentId}.md`,
    '2. Siga as activation-instructions do bloco YAML',
    `3. Renderize o greeting via: node .aios-core/development/scripts/generate-greeting.js ${agentId}`,
    '   Se shell nao disponivel, exiba o greeting de persona_profile.communication.greeting_levels.named',
    '4. Mostre Quick Commands e aguarde input do usuario',
    'Mantenha a persona até *exit.',
  ].join('\n');
}

function buildAgentCommandFile(agentId) {
  const slug = commandSlugForAgent(agentId);
  const description =
    GEMINI_AGENT_DESCRIPTIONS[agentId] ||
    `Ativar agente AIOS ${agentId}`;

  const prompt = buildAgentCommandPrompt(agentId);
  const content = [
    `description = "${description.replace(/"/g, '\\"')}"`,
    'prompt = """',
    prompt,
    '"""',
    '',
  ].join('\n');

  return {
    filename: `aios-${slug}.toml`,
    content,
    agentId,
  };
}

function buildMenuPrompt(agentIds) {
  const lines = [
    'Você está no launcher AIOS para Gemini.',
    '',
    'Mostre a lista de agentes abaixo em formato numerado, explicando em 1 linha quando usar cada um:',
  ];

  let index = 1;
  for (const agentId of agentIds) {
    const description = GEMINI_AGENT_DESCRIPTIONS[agentId] || 'Agente especializado AIOS';
    lines.push(`${index}. ${menuCommandName(agentId)} - ${description}`);
    index += 1;
  }

  lines.push('');
  lines.push('No final, peça para o usuário escolher um número ou digitar o comando direto.');
  return lines.join('\n');
}

function buildMenuCommandFile(agentIds) {
  const content = [
    'description = "Menu rápido AIOS (lista agentes e orienta qual ativar)"',
    'prompt = """',
    buildMenuPrompt(agentIds),
    '"""',
    '',
  ].join('\n');

  return {
    filename: 'aios-menu.toml',
    content,
  };
}

function resolveAgentOrder(agentIds) {
  const unique = [...new Set(agentIds)];
  const known = MENU_ORDER.filter((id) => unique.includes(id));
  const extra = unique.filter((id) => !MENU_ORDER.includes(id)).sort();
  return [...known, ...extra];
}

function buildGeminiCommandFiles(agents) {
  const validAgentIds = agents
    .filter((agent) => !agent.error)
    .map((agent) => agent.id);

  const ordered = resolveAgentOrder(validAgentIds);
  const files = ordered.map((id) => buildAgentCommandFile(id));
  files.unshift(buildMenuCommandFile(ordered));
  return files;
}

function syncGeminiCommands(agents, projectRoot, options = {}) {
  const commandsDir = path.join(projectRoot, '.gemini', 'commands');
  const files = buildGeminiCommandFiles(agents);
  const written = [];

  if (!options.dryRun) {
    fs.ensureDirSync(commandsDir);
  }

  for (const file of files) {
    const targetPath = path.join(commandsDir, file.filename);
    if (!options.dryRun) {
      fs.writeFileSync(targetPath, file.content, 'utf8');
    }
    written.push({
      filename: path.join('commands', file.filename),
      path: targetPath,
      content: file.content,
    });
  }

  return { commandsDir, files: written };
}

module.exports = {
  GEMINI_AGENT_DESCRIPTIONS,
  MENU_ORDER,
  commandSlugForAgent,
  menuCommandName,
  buildGeminiCommandFiles,
  syncGeminiCommands,
};
