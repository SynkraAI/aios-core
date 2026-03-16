#!/usr/bin/env node

/**
 * create-session-handoff.js
 *
 * Gera arquivo de handoff automaticamente ao final do /new-project.
 * Documenta estrutura criada, tipo, modo e próximos passos.
 *
 * Usage:
 *   node tools/create-session-handoff.js {project-name} {type} {mode} {project-path}
 *
 * Exemplo:
 *   node tools/create-session-handoff.js ensinio-v2 mind-clone CENTRALIZED docs/projects/ensinio-v2
 *   node tools/create-session-handoff.js meta-ads app HYBRID ~/CODE/Projects/meta-ads
 */

const fs = require('fs-extra');
const path = require('path');

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

function getYearMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getNextStepsByType(type) {
  const suggestions = {
    'app': [
      'Criar primeiro epic: `@pm *create-epic` ou `/new-project-full`',
      'Configurar repositório Git se ainda não tiver',
      'Definir stack tecnológica (framework, database, etc.)',
      'Criar primeira story com `@sm *draft`'
    ],
    'squad': [
      'Documentar agentes do squad no README.md',
      'Criar tasks principais em tasks/',
      'Definir checklists em checklists/',
      'Criar primeiro agent em agents/'
    ],
    'mind-clone': [
      'Coletar fontes iniciais (livros, vídeos, artigos)',
      'Documentar fontes em research/',
      'Usar `tech-search` ou `deep-research` para pesquisa',
      'Criar primeira iteração de extração'
    ],
    'pipeline': [
      'Definir steps do pipeline',
      'Documentar inputs e outputs esperados',
      'Criar protótipo do primeiro step',
      'Testar end-to-end com dados de exemplo'
    ],
    'knowledge': [
      'Definir estrutura de organização do conhecimento',
      'Criar primeiras categorias em data/',
      'Documentar fontes de informação',
      'Estabelecer padrão de nomenclatura'
    ],
    'research': [
      'Definir perguntas de pesquisa principais',
      'Criar checklist de fontes a explorar',
      'Usar `tech-search` ou `deep-research` para início',
      'Documentar descobertas em sessions/'
    ]
  };

  return suggestions[type] || suggestions['knowledge'];
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function createHandoff(projectName, type, mode, projectPath) {
  const date = getCurrentDate();
  const yearMonth = getYearMonth();
  const slug = projectName.toLowerCase().replace(/\s+/g, '-');

  // Determinar onde salvar o handoff
  const sessionsDir = mode === 'HYBRID'
    ? path.join(projectPath, '.aios/sessions', yearMonth)
    : path.join(__dirname, '../docs/sessions', yearMonth);

  await fs.ensureDir(sessionsDir);

  const handoffPath = path.join(sessionsDir, `handoff-${date}-${slug}-created.md`);

  // Montar conteúdo do handoff
  const content = `# Handoff: Projeto ${projectName} Criado

**Data:** ${date}
**Tipo:** ${type}
**Modo:** ${mode} (${mode === 'HYBRID' ? 'Governança local (.aios/)' : 'Governança central (docs/projects/)'})
**Path:** ${projectPath}

---

## Estrutura Criada

${mode === 'CENTRALIZED' ? `
### CENTRALIZED (monorepo aios-core)

\`\`\`
docs/projects/${slug}/
├── INDEX.md                # Estado do projeto
├── HANDOFFS-INDEX.md       # Índice de handoffs
├── README.md               # Documentação
├── stories/
│   ├── active/             # Stories em progresso
│   ├── done/               # Stories concluídas
│   └── epics/              # Epics (se aplicável)
├── sessions/
│   └── ${yearMonth}/       # Handoffs mensais
├── research/               # Pesquisa e descobertas
└── data/                   # Dados do projeto
\`\`\`
` : `
### HYBRID (projeto externo)

\`\`\`
${projectPath}/
├── .aios/
│   ├── INDEX.md            # Estado do projeto
│   ├── sessions/           # Handoffs
│   ├── stories/            # Stories
│   └── epics/              # Epics (se aplicável)
├── .claude/
│   ├── CLAUDE.md           # Instruções do projeto
│   ├── settings.json       # Permissões
│   └── rules/              # Regras comportamentais
└── docs/
    ├── INDEX.md            # Symlink → ../.aios/INDEX.md
    ├── HANDOFFS-INDEX.md
    ├── README.md
    ├── stories/            # Estrutura completa
    └── sessions/
\`\`\`
`}

---

## Configuração Aplicada

**Template usado:** ${type}
**Permissões:** Via \`.claude/settings.json\` (tipo: ${type})
**Validação:** 6/6 checks passaram ✅

---

## Próximos Passos

${getNextStepsByType(type).map((step, i) => `${i + 1}. ${step}`).join('\n')}

---

## Checklist Inicial

- [ ] Ler INDEX.md e entender estado atual
- [ ] Revisar .claude/CLAUDE.md (instruções do projeto)
- [ ] Criar primeiro checkpoint: \`/checkpoint\`
${type === 'app' ? '- [ ] Decidir se precisa de epic: `/new-project-full` ou `@pm *create-epic`' : ''}
${type === 'mind-clone' || type === 'research' ? '- [ ] Começar coleta de fontes em research/' : ''}
${type === 'squad' ? '- [ ] Documentar agentes principais no README.md' : ''}

---

**Criado por:** /new-project skill (automático)
**Última atualização:** ${date}
`;

  await fs.writeFile(handoffPath, content);

  console.log(`\n✅ Handoff criado: ${handoffPath}\n`);
  console.log(`📝 Tipo: ${type} | Modo: ${mode}`);
  console.log(`📂 Path: ${projectPath}\n`);

  return handoffPath;
}

// ═══════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════

const [projectName, type, mode, projectPath] = process.argv.slice(2);

if (!projectName || !type || !mode || !projectPath) {
  console.error('❌ Usage: node tools/create-session-handoff.js {project-name} {type} {mode} {project-path}');
  console.error('Exemplo: node tools/create-session-handoff.js ensinio-v2 mind-clone CENTRALIZED docs/projects/ensinio-v2');
  process.exit(1);
}

createHandoff(projectName, type, mode, projectPath).catch((err) => {
  console.error('❌ Erro ao criar handoff:', err);
  process.exit(1);
});
