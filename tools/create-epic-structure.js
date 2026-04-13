#!/usr/bin/env node

/**
 * create-epic-structure.js
 *
 * Cria estrutura de organização estilo AIOX:
 * - docs/stories/active/
 * - docs/stories/done/
 * - docs/stories/epics/
 * - docs/sessions/YYYY-MM/
 * - HANDOFFS-INDEX.md
 * - INDEX.md (project state)
 *
 * Usage:
 *   node tools/create-epic-structure.js [project-path] [--skip-epics]
 *
 * Flags:
 *   --skip-epics  Não criar docs/stories/epics/ (para tipos: mind-clone, pipeline, knowledge, research)
 *
 * Exemplo:
 *   node tools/create-epic-structure.js ~/CODE/Projects/meu-projeto
 *   node tools/create-epic-structure.js . --skip-epics
 *   node tools/create-epic-structure.js .  (usa cwd)
 */

const fs = require('fs-extra');
const path = require('path');

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

const STRUCTURE = {
  'docs/stories/active': {
    type: 'dir',
    readme: `# Active Stories

Stories em progresso. Quando completa, mova para \`done/\`.

**Naming:** \`STORY-X.Y-description.md\` (X = epic, Y = story number)

**Status:** Draft | In Progress | Ready for Review | Done
`
  },
  'docs/stories/done': {
    type: 'dir',
    readme: `# Done Stories

Stories concluídas. Arquivo permanente de trabalho entregue.
`
  },
  'docs/stories/epics': {
    type: 'dir',
    readme: `# Epics

Epics agrupam várias stories relacionadas.

**Naming:** \`EPIC-XX-short-description/\`

Cada epic contém:
- \`EPIC-XX-master.md\` — visão geral, objetivos, stories relacionadas
- \`EXECUTION.yaml\` (opcional) — workflow de execução
- \`NOTES.md\` (opcional) — descobertas durante execução
`
  },
  'docs/sessions': {
    type: 'dir',
    readme: `# Sessions

Handoffs entre sessões de trabalho, organizados por ano-mês.

**Naming:** \`YYYY-MM/session-YYYY-MM-DD-topic.md\`
`
  },
  'docs/HANDOFFS-INDEX.md': {
    type: 'file',
    content: `# Handoffs Index

Índice de todos os handoffs criados neste projeto.

## Como Usar

Quando criar um handoff em \`sessions/YYYY-MM/\`, adicione uma linha aqui:

\`\`\`
| Data | Tópico | Arquivo | Status |
|------|--------|---------|--------|
| 2026-03-14 | Initial Setup | [sessions/2026-03/...](sessions/2026-03/session-2026-03-14-initial-setup.md) | ✅ Complete |
\`\`\`

## Handoffs

| Data | Tópico | Arquivo | Status |
|------|--------|---------|--------|
| — | — | — | — |
`
  },
  'docs/INDEX.md': {
    type: 'file',
    content: `# Project Index

**Status:** Active
**Created:** ${new Date().toISOString().split('T')[0]}

## Overview

[Breve descrição do projeto aqui]

## Active Work

- [ ] Epic 1: [Description]
- [ ] Story 1.1: [Description]

## Quick Links

- [Active Stories](stories/active/)
- [Epics](stories/epics/)
- [Sessions](sessions/)
- [Handoffs Index](HANDOFFS-INDEX.md)

## Metrics

- **Total Epics:** 0
- **Active Stories:** 0
- **Completed Stories:** 0
- **Last Updated:** ${new Date().toISOString().split('T')[0]}
`
  },
  'docs/README.md': {
    type: 'file',
    content: `# Documentation

Este diretório contém toda a documentação de desenvolvimento do projeto.

## Estrutura

\`\`\`
docs/
├── stories/
│   ├── active/      # Stories em progresso
│   ├── done/        # Stories concluídas
│   └── epics/       # Epics (agrupam stories)
├── sessions/        # Handoffs entre sessões
├── HANDOFFS-INDEX.md
├── INDEX.md         # Estado do projeto
└── README.md        # Este arquivo
\`\`\`

## Workflow

1. **Criar Epic** → \`docs/stories/epics/EPIC-XX-name/\`
2. **Criar Stories** → \`docs/stories/active/STORY-X.Y-name.md\`
3. **Trabalhar** → Atualizar checkboxes, File List
4. **Concluir** → Mover para \`done/\`
5. **Handoff** → Criar em \`sessions/YYYY-MM/\`

Veja [INDEX.md](INDEX.md) para estado atual.
`
  }
};

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function createStructure(targetPath, { skipEpics = false } = {}) {
  const resolvedPath = path.resolve(targetPath);
  const isHybrid = await fs.pathExists(path.join(resolvedPath, '.aios'));

  console.log(`\n🏗️  Criando estrutura AIOX em: ${resolvedPath}`);
  if (isHybrid) {
    console.log(`📍 Modo detectado: HYBRID (.aiox/ encontrado)\n`);
  } else {
    console.log(`📍 Modo detectado: CENTRALIZED\n`);
  }

  // Verificar se INDEX.md já existe na raiz
  const rootIndexPath = path.join(resolvedPath, 'INDEX.md');
  const hasRootIndex = await fs.pathExists(rootIndexPath);

  if (hasRootIndex) {
    console.log(`ℹ️  INDEX.md já existe na raiz — mantendo o existente\n`);
  }

  for (const [relativePath, config] of Object.entries(STRUCTURE)) {
    // Pular criação de epics/ se --skip-epics
    if (relativePath === 'docs/stories/epics' && skipEpics) {
      console.log(`⏭️  Pulando epics/ (--skip-epics)`);
      continue;
    }

    // Pular criação de docs/INDEX.md se já existe INDEX.md na raiz
    if (relativePath === 'docs/INDEX.md' && hasRootIndex) {
      console.log(`⏭️  Pulando docs/INDEX.md (já existe INDEX.md na raiz)\n`);
      continue;
    }

    const fullPath = path.join(resolvedPath, relativePath);

    if (config.type === 'dir') {
      // Criar diretório
      await fs.ensureDir(fullPath);
      console.log(`✅ Diretório criado: ${relativePath}/`);

      // Criar README.md dentro do diretório
      if (config.readme) {
        const readmePath = path.join(fullPath, 'README.md');
        await fs.writeFile(readmePath, config.readme);
        console.log(`   └─ README.md criado`);
      }

      // Criar subdiretório de exemplo para sessions (YYYY-MM)
      if (relativePath === 'docs/sessions') {
        const now = new Date();
        const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const sessionDir = path.join(fullPath, yearMonth);
        await fs.ensureDir(sessionDir);
        console.log(`   └─ ${yearMonth}/ criado`);
      }
    } else if (config.type === 'file') {
      // Criar arquivo
      await fs.ensureFile(fullPath);
      await fs.writeFile(fullPath, config.content);
      console.log(`✅ Arquivo criado: ${relativePath}`);
    }
  }

  // Em modo HYBRID, criar symlinks de docs/ apontando para .aiox/
  if (isHybrid) {
    const symlinkPairs = [
      { source: '../.aiox/INDEX.md', target: path.join(resolvedPath, 'docs/INDEX.md') },
      { source: '../.aiox/HANDOFFS-INDEX.md', target: path.join(resolvedPath, 'docs/HANDOFFS-INDEX.md') }
    ];

    for (const { source, target } of symlinkPairs) {
      const aiosSource = path.join(resolvedPath, '.aios', path.basename(target));
      if (await fs.pathExists(aiosSource) && await fs.pathExists(target)) {
        // Remove o arquivo criado e substitui por symlink
        const stat = await fs.lstat(target);
        if (!stat.isSymbolicLink()) {
          await fs.remove(target);
          await fs.symlink(source, target);
          console.log(`🔗 Symlink criado: docs/${path.basename(target)} → .aiox/${path.basename(target)}`);
        }
      }
    }
  }

  console.log(`\n🎉 Estrutura criada com sucesso!\n`);
  console.log(`📂 Próximos passos:\n`);
  if (isHybrid) {
    console.log(`   1. Abrir ${resolvedPath}/.aiox/INDEX.md (fonte de verdade)`);
    console.log(`   2. docs/INDEX.md é symlink → .aiox/INDEX.md`);
  } else {
    console.log(`   1. Abrir ${resolvedPath}/docs/INDEX.md`);
  }
  console.log(`   2. Atualizar Overview com descrição do projeto`);
  console.log(`   3. Criar seu primeiro Epic em docs/stories/epics/`);
  console.log(`\n💡 Dica: Use esta estrutura para TODOS os projetos!\n`);
}

// ═══════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const skipEpics = args.includes('--skip-epics');
const targetPath = args.filter(a => !a.startsWith('--'))[0] || process.cwd();

createStructure(targetPath, { skipEpics }).catch((err) => {
  console.error('❌ Erro ao criar estrutura:', err);
  process.exit(1);
});
