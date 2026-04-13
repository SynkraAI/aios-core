#!/usr/bin/env node

/**
 * new-epic.js
 *
 * Cria um novo Epic a partir do template.
 *
 * Usage:
 *   node tools/new-epic.js <number> <short-description> [project-path]
 *
 * Exemplo:
 *   node tools/new-epic.js 15 correcoes-melhorias-crm
 *   node tools/new-epic.js 15 correcoes-melhorias-crm ~/CODE/Projects/meu-projeto
 */

const fs = require('fs-extra');
const path = require('path');

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function createEpic(number, description, projectPath) {
  const epicId = String(number).padStart(2, '0');
  const epicName = `EPIC-${epicId}-${description}`;
  const epicDir = path.join(projectPath, 'docs/stories/epics', epicName);

  // Verificar se já existe
  if (await fs.pathExists(epicDir)) {
    console.error(`❌ Epic já existe: ${epicDir}`);
    process.exit(1);
  }

  // Criar diretório
  await fs.ensureDir(epicDir);

  // Ler template
  const templatePath = path.join(__dirname, 'templates/EPIC-TEMPLATE.md');
  let template = await fs.readFile(templatePath, 'utf-8');

  // Substituir placeholders
  const today = new Date().toISOString().split('T')[0];
  template = template.replace(/EPIC-XX/g, epicName);
  template = template.replace(/YYYY-MM-DD/g, today);
  template = template.replace(/\[Título do Epic\]/g, description.replace(/-/g, ' '));

  // Salvar
  const epicFilePath = path.join(epicDir, `${epicName}-master.md`);
  await fs.writeFile(epicFilePath, template);

  console.log(`\n✅ Epic criado com sucesso!\n`);
  console.log(`📂 ${epicDir}/`);
  console.log(`📄 ${epicName}-master.md`);
  console.log(`\n💡 Próximo passo: Abrir o arquivo e preencher Objetivo + Stories\n`);
}

// ═══════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════

const [, , number, description, projectPath = process.cwd()] = process.argv;

if (!number || !description) {
  console.error('❌ Uso: node tools/new-epic.js <number> <short-description> [project-path]');
  console.error('   Exemplo: node tools/new-epic.js 15 correcoes-melhorias-crm');
  process.exit(1);
}

createEpic(number, description, projectPath).catch((err) => {
  console.error('❌ Erro ao criar epic:', err);
  process.exit(1);
});
