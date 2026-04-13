#!/usr/bin/env node

/**
 * rollback-project.js
 *
 * Remove estrutura criada pelo /new-project quando validação falha.
 * Lê o log de arquivos criados e desfaz na ordem inversa.
 *
 * Usage:
 *   node tools/rollback-project.js {project-path}
 *
 * Exemplo:
 *   node tools/rollback-project.js docs/projects/meu-projeto
 *   node tools/rollback-project.js ~/CODE/Projects/meu-app
 */

const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

const ACTIVE_MD_PATH = path.join(__dirname, '../docs/projects/ACTIVE.md');

/**
 * Pergunta Y/N ao usuário
 */
async function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${question} (Y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Remove row do ACTIVE.md
 */
async function removeFromActive(projectName) {
  if (!await fs.pathExists(ACTIVE_MD_PATH)) {
    console.log('⏭️  ACTIVE.md não existe, pulando...');
    return;
  }

  const content = await fs.readFile(ACTIVE_MD_PATH, 'utf-8');
  const lines = content.split('\n');

  // Encontrar e remover linha do projeto
  const filteredLines = lines.filter(line => {
    // Pular linhas vazias e headers
    if (!line.trim() || line.startsWith('#') || line.startsWith('|---')) return true;
    // Remover se contém o nome do projeto na coluna Projeto
    return !line.includes(`| ${projectName} |`);
  });

  if (filteredLines.length < lines.length) {
    await fs.writeFile(ACTIVE_MD_PATH, filteredLines.join('\n'));
    console.log(`✅ Row removida do ACTIVE.md: ${projectName}`);
  } else {
    console.log(`⏭️  Projeto não encontrado no ACTIVE.md: ${projectName}`);
  }
}

/**
 * Remove estrutura criada
 */
async function rollbackStructure(projectPath) {
  const resolvedPath = path.resolve(projectPath);
  const projectName = path.basename(resolvedPath);

  console.log(`\n🔄 Rollback de: ${resolvedPath}\n`);

  // Lista de diretórios/arquivos a remover (ordem inversa de criação)
  const itemsToRemove = [
    // Passo 4: ACTIVE.md row (tratado separadamente)
    // Passo 2.8: .claude/
    '.claude',
    // Passo 2.7: docs/
    'docs/HANDOFFS-INDEX.md',
    'docs/INDEX.md',
    'docs/sessions',
    'docs/stories/epics',
    'docs/stories/done',
    'docs/stories/active',
    'docs/stories',
    'docs',
    // Passo 2: estrutura base
    '.aiox/sessions',
    '.aiox/HANDOFFS-INDEX.md',
    '.aiox/INDEX.md',
    '.aios',
    'data',
    'research'
  ];

  let removedCount = 0;
  let skippedCount = 0;

  for (const item of itemsToRemove) {
    const itemPath = path.join(resolvedPath, item);

    try {
      if (await fs.pathExists(itemPath)) {
        await fs.remove(itemPath);
        console.log(`🗑️  Removido: ${item}`);
        removedCount++;
      } else {
        skippedCount++;
      }
    } catch (err) {
      console.error(`❌ Erro ao remover ${item}:`, err.message);
    }
  }

  // Remover row do ACTIVE.md
  await removeFromActive(projectName);

  // Se diretório do projeto ficou vazio, perguntar se remove
  const remainingFiles = await fs.readdir(resolvedPath);
  const isEmpty = remainingFiles.length === 0 ||
    (remainingFiles.length === 1 && remainingFiles[0] === '.DS_Store');

  if (isEmpty) {
    const shouldRemoveDir = await askConfirmation(
      `\n⚠️  Diretório ${projectName} ficou vazio. Remover diretório também?`
    );

    if (shouldRemoveDir) {
      await fs.remove(resolvedPath);
      console.log(`🗑️  Diretório removido: ${resolvedPath}\n`);
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✅ Rollback completo!`);
  console.log(`   - ${removedCount} itens removidos`);
  console.log(`   - ${skippedCount} itens não existiam (já limpo)`);
  console.log(`\n💡 Corrija o problema e rode /new-project novamente.\n`);
}

// ═══════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════

async function main() {
  const projectPath = process.argv[2];

  if (!projectPath) {
    console.error('❌ Usage: node tools/rollback-project.js {project-path}');
    process.exit(1);
  }

  const resolvedPath = path.resolve(projectPath);

  // Confirmação antes de deletar
  const confirmed = await askConfirmation(
    `⚠️  Isso vai DELETAR a estrutura criada em:\n   ${resolvedPath}\n\n   Continuar?`
  );

  if (!confirmed) {
    console.log('\n❌ Rollback cancelado.\n');
    process.exit(0);
  }

  await rollbackStructure(projectPath);
}

main().catch((err) => {
  console.error('❌ Erro ao executar rollback:', err);
  process.exit(1);
});
