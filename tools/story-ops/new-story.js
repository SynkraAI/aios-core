#!/usr/bin/env node

/**
 * new-story.js
 *
 * Cria uma nova Story a partir do template.
 *
 * Usage:
 *   node tools/new-story.js <epic-number>.<story-number> <short-description> [project-path]
 *
 * Exemplo:
 *   node tools/new-story.js 15.1 corrigir-campo-email
 *   node tools/new-story.js 15.2 adicionar-validacao ~/CODE/Projects/meu-projeto
 */

const fs = require('fs-extra');
const path = require('path');

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function createStory(storyId, description, projectPath) {
  const [epicNum, storyNum] = storyId.split('.');

  if (!epicNum || !storyNum) {
    console.error('❌ Story ID deve estar no formato X.Y (ex: 15.1)');
    process.exit(1);
  }

  const epicId = String(epicNum).padStart(2, '0');
  const storyName = `STORY-${epicId}.${storyNum}-${description}`;
  const storyPath = path.join(projectPath, 'docs/stories/active', `${storyName}.md`);

  // Verificar se já existe
  if (await fs.pathExists(storyPath)) {
    console.error(`❌ Story já existe: ${storyPath}`);
    process.exit(1);
  }

  // Ler template
  const templatePath = path.join(__dirname, 'templates/STORY-TEMPLATE.md');
  let template = await fs.readFile(templatePath, 'utf-8');

  // Substituir placeholders
  template = template.replace(/STORY-X\.Y/g, `STORY-${epicId}.${storyNum}`);
  template = template.replace(/\[Título da Story\]/g, description.replace(/-/g, ' '));
  template = template.replace(/EPIC-XX/g, `EPIC-${epicId}`);

  // Salvar
  await fs.writeFile(storyPath, template);

  console.log(`\n✅ Story criada com sucesso!\n`);
  console.log(`📄 ${storyPath}`);
  console.log(`\n💡 Próximo passo: Preencher User Story + Acceptance Criteria\n`);
}

// ═══════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════

const [, , storyId, description, projectPath = process.cwd()] = process.argv;

if (!storyId || !description) {
  console.error('❌ Uso: node tools/new-story.js <epic.story> <short-description> [project-path]');
  console.error('   Exemplo: node tools/new-story.js 15.1 corrigir-campo-email');
  process.exit(1);
}

createStory(storyId, description, projectPath).catch((err) => {
  console.error('❌ Erro ao criar story:', err);
  process.exit(1);
});
