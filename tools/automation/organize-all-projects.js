#!/usr/bin/env node

/**
 * organize-all-projects.js
 *
 * Escaneia TODOS os projetos do usuário e aplica estrutura Epic/Story.
 *
 * Escaneia:
 * - aios-core/docs/projects/
 * - ~/CODE/Projects/
 * - Caminhos customizados
 *
 * Para cada projeto:
 * - Detecta se já tem estrutura
 * - Oferece criar estrutura se não tiver
 * - Valida estrutura existente
 *
 * Usage:
 *   node tools/organize-all-projects.js [--auto] [--dry-run]
 *
 * Flags:
 *   --auto      Aplicar automaticamente em todos (sem perguntar)
 *   --dry-run   Apenas mostrar o que seria feito
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

const SCAN_PATHS = [
  // Projetos dentro do aios-core
  path.join(process.env.HOME, 'aios-core/docs/projects'),

  // Projetos em ~/CODE/Projects/
  path.join(process.env.HOME, 'CODE/Projects'),

  // Adicione mais caminhos aqui se tiver projetos em outros lugares
  // path.join(process.env.HOME, 'work/projects'),
];

const REQUIRED_STRUCTURE = [
  'docs/stories/active',
  'docs/stories/done',
  'docs/stories/epics',
  'docs/sessions',
  'docs/HANDOFFS-INDEX.md',
  'docs/INDEX.md',
  'docs/README.md'
];

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function hasStructure(projectPath) {
  for (const requiredPath of REQUIRED_STRUCTURE) {
    const fullPath = path.join(projectPath, requiredPath);
    if (!fs.existsSync(fullPath)) {
      return false;
    }
  }
  return true;
}

function isGitRepo(projectPath) {
  const gitPath = path.join(projectPath, '.git');
  return fs.existsSync(gitPath);
}

function getProjectName(projectPath) {
  return path.basename(projectPath);
}

function scanProjects() {
  const projects = [];

  for (const scanPath of SCAN_PATHS) {
    if (!fs.existsSync(scanPath)) {
      console.log(`⚠️  Path não existe: ${scanPath}`);
      continue;
    }

    const items = fs.readdirSync(scanPath);

    for (const item of items) {
      const itemPath = path.join(scanPath, item);
      const stat = fs.statSync(itemPath);

      if (!stat.isDirectory()) continue;

      // Ignorar diretórios especiais
      if (item.startsWith('.') || item === 'node_modules') continue;

      const hasGit = isGitRepo(itemPath);
      const hasOrgStructure = hasStructure(itemPath);

      projects.push({
        name: item,
        path: itemPath,
        scanPath,
        hasGit,
        hasStructure: hasOrgStructure
      });
    }
  }

  return projects;
}

function applyStructure(projectPath, dryRun = false) {
  const scriptPath = path.join(__dirname, 'create-epic-structure.js');

  if (dryRun) {
    console.log(`   [DRY-RUN] Rodaria: node ${scriptPath} ${projectPath}`);
    return true;
  }

  try {
    execSync(`node "${scriptPath}" "${projectPath}"`, { stdio: 'inherit' });
    return true;
  } catch (err) {
    console.error(`   ❌ Erro ao aplicar estrutura: ${err.message}`);
    return false;
  }
}

function validateStructure(projectPath) {
  const scriptPath = path.join(__dirname, 'validate-structure.js');

  try {
    execSync(`node "${scriptPath}" "${projectPath}"`, { stdio: 'inherit' });
    return true;
  } catch (err) {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const autoMode = args.includes('--auto');
  const dryRun = args.includes('--dry-run');

  console.log('\n🔍 Escaneando projetos...\n');

  const projects = scanProjects();

  if (projects.length === 0) {
    console.log('❌ Nenhum projeto encontrado.\n');
    return;
  }

  // Estatísticas
  const withStructure = projects.filter(p => p.hasStructure).length;
  const withoutStructure = projects.filter(p => !p.hasStructure).length;

  console.log(`📊 Encontrados ${projects.length} projetos:\n`);
  console.log(`   ✅ Com estrutura: ${withStructure}`);
  console.log(`   ⚠️  Sem estrutura: ${withoutStructure}\n`);
  console.log(`${'═'.repeat(80)}\n`);

  // Mostrar projetos sem estrutura
  if (withoutStructure > 0) {
    console.log('📋 Projetos SEM estrutura Epic/Story:\n');

    for (const project of projects) {
      if (project.hasStructure) continue;

      console.log(`   ${project.name}`);
      console.log(`   └─ ${project.path}`);
      console.log(`      Git: ${project.hasGit ? '✅' : '❌'}\n`);
    }

    console.log(`${'═'.repeat(80)}\n`);

    // Modo auto
    if (autoMode) {
      console.log(`🤖 Modo AUTO: Aplicando estrutura em ${withoutStructure} projetos...\n`);

      let successCount = 0;
      for (const project of projects) {
        if (project.hasStructure) continue;

        console.log(`\n📂 ${project.name}`);
        const success = applyStructure(project.path, dryRun);
        if (success) successCount++;
      }

      console.log(`\n✅ Estrutura aplicada em ${successCount} / ${withoutStructure} projetos\n`);
    } else if (dryRun) {
      console.log('🔍 Modo DRY-RUN: Mostrando o que seria feito...\n');

      for (const project of projects) {
        if (project.hasStructure) continue;
        console.log(`\n📂 ${project.name}`);
        applyStructure(project.path, true);
      }

      console.log('\n💡 Para aplicar de verdade, rode sem --dry-run\n');
    } else {
      // Modo interativo
      console.log('💡 Para aplicar estrutura em todos:\n');
      console.log('   node tools/organize-all-projects.js --auto\n');
      console.log('   Ou rode manualmente:\n');

      for (const project of projects) {
        if (project.hasStructure) continue;
        console.log(`   epic-init ${project.path}`);
      }
      console.log('');
    }
  }

  // Validar projetos com estrutura
  if (withStructure > 0) {
    console.log(`${'═'.repeat(80)}\n`);
    console.log('✅ Projetos COM estrutura (validando...):\n');

    let validCount = 0;
    for (const project of projects) {
      if (!project.hasStructure) continue;

      console.log(`\n📂 ${project.name}`);
      const isValid = validateStructure(project.path);
      if (isValid) validCount++;
    }

    console.log(`\n✅ ${validCount} / ${withStructure} projetos válidos\n`);
  }

  console.log(`${'═'.repeat(80)}\n`);
  console.log('🎯 Resumo:\n');
  console.log(`   Total de projetos: ${projects.length}`);
  console.log(`   Com estrutura: ${withStructure}`);
  console.log(`   Sem estrutura: ${withoutStructure}\n`);

  if (withoutStructure === 0) {
    console.log('🎉 Todos os projetos estão organizados!\n');
  } else {
    console.log(`⚠️  ${withoutStructure} projetos ainda precisam de estrutura.\n`);
    if (!autoMode && !dryRun) {
      console.log('💡 Rode com --auto para aplicar automaticamente:\n');
      console.log('   node tools/organize-all-projects.js --auto\n');
    }
  }
}

// ═══════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════

main().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
