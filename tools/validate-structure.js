#!/usr/bin/env node

/**
 * validate-structure.js
 *
 * Valida se a estrutura de organização AIOX está sendo seguida.
 * Roda checklist de qualidade.
 *
 * Usage:
 *   node tools/validate-structure.js [project-path]
 *   node tools/validate-structure.js --dry-run [project-path]
 *
 * Modes:
 *   default   — Valida estrutura existente (6 checks)
 *   --dry-run — Pre-flight check ANTES de criar projeto (valida destino)
 *
 * Exemplo:
 *   node tools/validate-structure.js .
 *   node tools/validate-structure.js ~/CODE/Projects/meu-projeto
 *   node tools/validate-structure.js --dry-run ~/CODE/Projects/novo-projeto
 */

const fs = require('fs-extra');
const path = require('path');

// ═══════════════════════════════════════════════════════════
// VALIDATION RULES
// ═══════════════════════════════════════════════════════════

const CHECKS = [
  {
    name: 'Estrutura base existe',
    check: async (projectPath) => {
      const required = [
        'docs/stories/active',
        'docs/stories/done',
        'docs/stories/epics',
        'docs/sessions',
        'docs/INDEX.md',
        'docs/HANDOFFS-INDEX.md'
      ];

      const missing = [];
      for (const p of required) {
        const fullPath = path.join(projectPath, p);
        if (!(await fs.pathExists(fullPath))) {
          missing.push(p);
        }
      }

      return {
        pass: missing.length === 0,
        message: missing.length === 0
          ? '✅ Todos os diretórios obrigatórios existem'
          : `❌ Faltando: ${missing.join(', ')}`
      };
    }
  },
  {
    name: 'Stories em active/ seguem naming convention',
    check: async (projectPath) => {
      const activeDir = path.join(projectPath, 'docs/stories/active');
      if (!(await fs.pathExists(activeDir))) {
        return { pass: false, message: '⚠️  Diretório active/ não existe' };
      }

      const files = await fs.readdir(activeDir);
      const storyFiles = files.filter(f => f.endsWith('.md') && f !== 'README.md');
      const invalid = storyFiles.filter(f => !f.match(/^STORY-\d+\.\d+-[\w-]+\.md$/));

      return {
        pass: invalid.length === 0,
        message: invalid.length === 0
          ? `✅ ${storyFiles.length} stories com naming correto`
          : `❌ Naming inválido: ${invalid.join(', ')}`
      };
    }
  },
  {
    name: 'Epics seguem naming convention',
    check: async (projectPath) => {
      const epicsDir = path.join(projectPath, 'docs/stories/epics');
      if (!(await fs.pathExists(epicsDir))) {
        return { pass: false, message: '⚠️  Diretório epics/ não existe' };
      }

      const items = await fs.readdir(epicsDir);
      const epicDirs = [];
      for (const item of items) {
        const itemPath = path.join(epicsDir, item);
        const stat = await fs.stat(itemPath);
        if (stat.isDirectory()) {
          epicDirs.push(item);
        }
      }

      const invalid = epicDirs.filter(d => !d.match(/^EPIC-\d+-[\w-]+$/));

      return {
        pass: invalid.length === 0,
        message: invalid.length === 0
          ? `✅ ${epicDirs.length} epics com naming correto`
          : `❌ Naming inválido: ${invalid.join(', ')}`
      };
    }
  },
  {
    name: 'INDEX.md tem métricas atualizadas',
    check: async (projectPath) => {
      const indexPath = path.join(projectPath, 'docs/INDEX.md');
      if (!(await fs.pathExists(indexPath))) {
        return { pass: false, message: '⚠️  INDEX.md não existe' };
      }

      const content = await fs.readFile(indexPath, 'utf-8');
      const hasMetrics = content.includes('## Metrics') && content.includes('Last Updated:');

      return {
        pass: hasMetrics,
        message: hasMetrics
          ? '✅ INDEX.md tem seção de métricas'
          : '❌ INDEX.md está faltando métricas (adicione ## Metrics)'
      };
    }
  },
  {
    name: 'Sessions organizadas por ano-mês',
    check: async (projectPath) => {
      const sessionsDir = path.join(projectPath, 'docs/sessions');
      if (!(await fs.pathExists(sessionsDir))) {
        return { pass: false, message: '⚠️  Diretório sessions/ não existe' };
      }

      const dirs = await fs.readdir(sessionsDir);
      const subdirs = [];
      for (const d of dirs) {
        const stat = await fs.stat(path.join(sessionsDir, d));
        if (stat.isDirectory()) subdirs.push(d);
      }

      const invalid = subdirs.filter(d => !d.match(/^\d{4}-\d{2}$/));

      return {
        pass: invalid.length === 0,
        message: invalid.length === 0
          ? `✅ ${subdirs.length} pastas de sessão organizadas corretamente`
          : `❌ Pastas inválidas: ${invalid.join(', ')} (use YYYY-MM)`
      };
    }
  },
  {
    name: 'Stories done/ não estão vazias',
    check: async (projectPath) => {
      const doneDir = path.join(projectPath, 'docs/stories/done');
      if (!(await fs.pathExists(doneDir))) {
        return { pass: false, message: '⚠️  Diretório done/ não existe' };
      }

      const files = await fs.readdir(doneDir);
      const storyFiles = files.filter(f => f.endsWith('.md') && f !== 'README.md');

      return {
        pass: true, // não é erro ter 0 stories done
        message: storyFiles.length === 0
          ? '⚠️  Nenhuma story concluída ainda'
          : `✅ ${storyFiles.length} stories concluídas`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// PRE-FLIGHT CHECKS (--dry-run)
// ═══════════════════════════════════════════════════════════

const PRE_FLIGHT_CHECKS = [
  {
    name: 'Diretório pai existe',
    check: async (projectPath) => {
      const parentDir = path.dirname(projectPath);
      const exists = await fs.pathExists(parentDir);
      return {
        pass: exists,
        message: exists
          ? `✅ Diretório pai existe: ${parentDir}`
          : `❌ Diretório pai não existe: ${parentDir}`
      };
    }
  },
  {
    name: 'Sem conflito de nomes',
    check: async (projectPath) => {
      const candidates = [
        path.join(projectPath, 'INDEX.md'),
        path.join(projectPath, 'docs/INDEX.md'),
        path.join(projectPath, '.aiox/INDEX.md')
      ];
      const found = [];
      for (const c of candidates) {
        if (await fs.pathExists(c)) found.push(c);
      }
      const hasConflict = found.length > 0;
      return {
        pass: !hasConflict,
        message: hasConflict
          ? `❌ Projeto já existe em: ${projectPath} (encontrado: ${found.map(f => path.basename(path.dirname(f)) + '/' + path.basename(f)).join(', ')})`
          : `✅ Sem conflito de nomes em: ${projectPath}`
      };
    }
  },
  {
    name: 'Permissões de escrita',
    check: async (projectPath) => {
      const targetDir = await fs.pathExists(projectPath) ? projectPath : path.dirname(projectPath);
      try {
        await fs.access(targetDir, fs.constants.W_OK);
        return { pass: true, message: `✅ Permissão de escrita OK em: ${targetDir}` };
      } catch {
        return { pass: false, message: `❌ Sem permissão de escrita em: ${targetDir}` };
      }
    }
  },
  {
    name: 'Path é absoluto (HYBRID)',
    check: async (projectPath) => {
      const isAbsolute = path.isAbsolute(projectPath);
      return {
        pass: isAbsolute,
        message: isAbsolute
          ? `✅ Path absoluto: ${projectPath}`
          : `❌ Path deve ser absoluto (começar com /): ${projectPath}`
      };
    }
  }
];

async function preFlightCheck(projectPath) {
  const resolvedPath = path.resolve(projectPath);

  console.log(`\n🛫 Pre-flight check em: ${resolvedPath}\n`);

  let passed = 0;
  let failed = 0;

  for (const check of PRE_FLIGHT_CHECKS) {
    try {
      const result = await check.check(resolvedPath);
      console.log(result.message);
      if (result.pass) {
        passed++;
      } else {
        failed++;
      }
    } catch (err) {
      console.error(`❌ Erro no check "${check.name}":`, err.message);
      failed++;
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🛫 Pre-flight: ${passed} / ${PRE_FLIGHT_CHECKS.length} checks passaram\n`);

  if (failed === 0) {
    console.log(`✅ Destino aprovado. Pode criar projeto.\n`);
  } else {
    console.log(`❌ ${failed} problemas encontrados. Corrija antes de criar.\n`);
  }

  return failed === 0;
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function validateStructure(projectPath) {
  const resolvedPath = path.resolve(projectPath);

  console.log(`\n🔍 Validando estrutura em: ${resolvedPath}\n`);

  let passed = 0;
  let failed = 0;

  for (const check of CHECKS) {
    try {
      const result = await check.check(resolvedPath);
      console.log(result.message);

      if (result.pass) {
        passed++;
      } else {
        failed++;
      }
    } catch (err) {
      console.error(`❌ Erro no check "${check.name}":`, err.message);
      failed++;
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊 Resultado: ${passed} / ${CHECKS.length} checks passaram\n`);

  if (failed === 0) {
    console.log(`🎉 Estrutura perfeita! Você está seguindo o padrão AIOX.\n`);
  } else {
    console.log(`⚠️  ${failed} problemas encontrados. Corrija e rode novamente.\n`);
  }

  return failed === 0;
}

// ═══════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const projectPath = args.filter(a => a !== '--dry-run')[0] || process.cwd();

const runner = isDryRun ? preFlightCheck : validateStructure;

runner(projectPath)
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('❌ Erro ao validar:', err);
    process.exit(1);
  });
