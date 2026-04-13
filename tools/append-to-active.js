#!/usr/bin/env node

/**
 * append-to-active.js
 *
 * Adiciona row ao ACTIVE.md com validação automática de header.
 * Se header estiver corrompido, corrige automaticamente.
 *
 * Usage:
 *   node tools/append-to-active.js --project {nome} --mode {HYBRID|CENTRALIZED} --path {link-index}
 *
 * Exemplo:
 *   node tools/append-to-active.js --project ensinio --mode CENTRALIZED --path ensinio/INDEX.md
 *   node tools/append-to-active.js --project meta-ads --mode HYBRID --path ~/CODE/Projects/meta-ads/.aiox/INDEX.md
 */

const fs = require('fs-extra');
const path = require('path');

const ACTIVE_MD_PATH = path.join(__dirname, '../docs/projects/ACTIVE.md');

const CORRECT_HEADER = [
  '# Projetos Ativos',
  '',
  '| # | Projeto | Modo | Status | Agente/Squad | Última Sessão | INDEX |',
  '|---|---------|------|--------|-------------|---------------|-------|'
];

/**
 * Valida e corrige header do ACTIVE.md
 */
async function validateAndFixHeader() {
  if (!await fs.pathExists(ACTIVE_MD_PATH)) {
    console.log('⚠️  ACTIVE.md não existe. Criando com header padrão...');
    await fs.writeFile(ACTIVE_MD_PATH, CORRECT_HEADER.join('\n') + '\n');
    return;
  }

  const content = await fs.readFile(ACTIVE_MD_PATH, 'utf-8');
  const lines = content.split('\n');

  // Verificar se header existe e está correto
  const hasCorrectHeader =
    lines.length >= 4 &&
    lines[0] === CORRECT_HEADER[0] &&
    lines[2].includes('| # | Projeto | Modo |') &&
    lines[3].includes('|---|');

  if (!hasCorrectHeader) {
    console.log('⚠️  Header do ACTIVE.md está incorreto ou ausente. Corrigindo...');

    // Encontrar primeira row de dados (linha que começa com | e tem número)
    const firstDataIndex = lines.findIndex(line =>
      line.trim().startsWith('|') &&
      !line.includes('---') &&
      !line.includes('Projeto') &&
      /\|\s*\d+\s*\|/.test(line)
    );

    let newContent;
    if (firstDataIndex === -1) {
      // Arquivo vazio ou sem rows, criar header do zero
      newContent = CORRECT_HEADER.join('\n') + '\n';
    } else {
      // Inserir header correto antes da primeira row de dados
      const dataRows = lines.slice(firstDataIndex);
      newContent = [...CORRECT_HEADER, ...dataRows].join('\n') + '\n';
    }

    await fs.writeFile(ACTIVE_MD_PATH, newContent);
    console.log('✅ Header corrigido automaticamente.');
  } else {
    console.log('✅ Header está correto.');
  }
}

/**
 * Calcula próximo número sequencial
 */
function getNextNumber(content) {
  const lines = content.split('\n');
  const numbers = lines
    .filter(line => line.trim().startsWith('|') && /\|\s*\d+\s*\|/.test(line))
    .map(line => {
      const match = line.match(/\|\s*(\d+)\s*\|/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => n > 0);

  return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
}

/**
 * Adiciona row ao ACTIVE.md
 */
async function appendToActive({ project, mode, indexPath, status = '🔄 Em andamento', agent = '—', lastSession = '' }) {
  // Garantir que header está correto
  await validateAndFixHeader();

  // Ler conteúdo atualizado
  const content = await fs.readFile(ACTIVE_MD_PATH, 'utf-8');

  // Verificar se projeto já existe
  if (content.includes(`| ${project} |`)) {
    console.error(`❌ Projeto "${project}" já existe no ACTIVE.md!`);
    process.exit(1);
  }

  // Calcular número sequencial
  const nextNum = getNextNumber(content);

  // Emoji de modo
  const modeEmoji = mode === 'HYBRID' ? '🏠' : '📦';

  // Data de hoje (se não informado)
  const today = lastSession || new Date().toISOString().split('T')[0];

  // Construir nova row
  const newRow = `| ${nextNum} | ${project} | ${modeEmoji} | ${status} | ${agent} | ${today} | [INDEX](${indexPath}) |`;

  // Adicionar row ao final
  const updatedContent = content.trimEnd() + '\n' + newRow + '\n';
  await fs.writeFile(ACTIVE_MD_PATH, updatedContent);

  console.log(`\n✅ Projeto adicionado ao ACTIVE.md:`);
  console.log(`   #${nextNum} - ${project} (${mode})`);
  console.log(`   ${indexPath}\n`);
}

// ═══════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const getArg = (flag) => {
    const index = args.indexOf(flag);
    return index !== -1 ? args[index + 1] : null;
  };

  const project = getArg('--project');
  const mode = getArg('--mode');
  const indexPath = getArg('--path');
  const status = getArg('--status') || '🔄 Em andamento';
  const agent = getArg('--agent') || '—';
  const lastSession = getArg('--last-session') || '';

  if (!project || !mode || !indexPath) {
    console.error('❌ Usage: node tools/append-to-active.js --project {nome} --mode {HYBRID|CENTRALIZED} --path {link-index}');
    console.error('\nOpcionais:');
    console.error('  --status "🔄 Em andamento"');
    console.error('  --agent "—"');
    console.error('  --last-session "2026-03-15"');
    process.exit(1);
  }

  if (mode !== 'HYBRID' && mode !== 'CENTRALIZED') {
    console.error('❌ --mode deve ser HYBRID ou CENTRALIZED');
    process.exit(1);
  }

  await appendToActive({ project, mode, indexPath, status, agent, lastSession });
}

main().catch((err) => {
  console.error('❌ Erro ao adicionar ao ACTIVE.md:', err);
  process.exit(1);
});
