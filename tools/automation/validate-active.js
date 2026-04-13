#!/usr/bin/env node

/**
 * validate-active.js
 *
 * Escaneia ACTIVE.md e valida links de INDEX para cada projeto.
 * Detecta projetos órfãos (link quebrado) e oferece auto-fix.
 *
 * Usage:
 *   node tools/validate-active.js
 *   node tools/validate-active.js --fix  (remove rows com links quebrados)
 *
 * Também atualiza .aiox/project-registry.json com last_seen.
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

const AIOS_ROOT = path.resolve(__dirname, '..');
const ACTIVE_MD = path.join(AIOS_ROOT, 'docs/projects/ACTIVE.md');
const REGISTRY_PATH = path.join(AIOS_ROOT, '.aiox/project-registry.json');

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function expandTilde(p) {
  if (p.startsWith('~/')) {
    return path.join(os.homedir(), p.slice(2));
  }
  return p;
}

function extractIndexLink(row) {
  const match = row.match(/\[INDEX\]\(([^)]+)\)/);
  return match ? match[1] : null;
}

function resolveIndexPath(link) {
  if (!link) return null;
  const expanded = expandTilde(link);
  if (path.isAbsolute(expanded)) return expanded;
  return path.join(AIOS_ROOT, 'docs/projects', expanded);
}

function detectMode(link) {
  if (!link) return 'UNKNOWN';
  if (link.includes('.aiox/')) return 'HYBRID';
  return 'CENTRALIZED';
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function validateActive({ fix = false } = {}) {
  console.log('\n🔍 Validando ACTIVE.md...\n');

  if (!(await fs.pathExists(ACTIVE_MD))) {
    console.error('❌ ACTIVE.md não encontrado em:', ACTIVE_MD);
    return false;
  }

  const content = await fs.readFile(ACTIVE_MD, 'utf-8');
  const lines = content.split('\n');

  // Find table rows (skip header + separator)
  const tableRows = lines.filter(line =>
    line.startsWith('|') &&
    !line.includes('| # |') &&
    !line.includes('|---|') &&
    line.includes('[INDEX]')
  );

  let valid = 0;
  let broken = 0;
  const brokenRows = [];
  const registry = {};

  for (const row of tableRows) {
    const link = extractIndexLink(row);
    const resolved = resolveIndexPath(link);
    const mode = detectMode(link);

    // Extract project name (2nd column)
    const cols = row.split('|').map(c => c.trim());
    const projectName = cols[2] ? cols[2].replace(/\*\*/g, '') : 'unknown';

    if (resolved && await fs.pathExists(resolved)) {
      valid++;
      console.log(`✅ ${projectName} (${mode})`);

      // Update registry
      registry[projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-')] = {
        name: projectName,
        path: link,
        mode,
        last_seen: new Date().toISOString().split('T')[0]
      };
    } else {
      broken++;
      brokenRows.push({ row, projectName, link, resolved });
      console.log(`❌ ${projectName} → link quebrado: ${link}`);
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊 Resultado: ${valid} OK, ${broken} quebrado(s) de ${tableRows.length} projetos\n`);

  // Save registry
  await fs.ensureDir(path.dirname(REGISTRY_PATH));
  await fs.writeJson(REGISTRY_PATH, registry, { spaces: 2 });
  console.log(`📋 Registry atualizado: ${REGISTRY_PATH}`);

  if (broken > 0) {
    console.log(`\n⚠️  ${broken} link(s) quebrado(s) encontrado(s):`);
    for (const { projectName, link } of brokenRows) {
      console.log(`   - ${projectName}: ${link}`);
    }

    if (fix) {
      console.log('\n🔧 Aplicando auto-fix (removendo rows quebradas)...');
      let newContent = content;
      for (const { row } of brokenRows) {
        newContent = newContent.replace(row + '\n', '');
      }
      await fs.writeFile(ACTIVE_MD, newContent);
      console.log(`✅ ${broken} row(s) removida(s) do ACTIVE.md`);
    } else {
      console.log('\n💡 Para remover rows quebradas: node tools/validate-active.js --fix');
    }
  } else {
    console.log('\n🎉 Todos os links estão funcionando!');
  }

  return broken === 0;
}

// ═══════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const fix = args.includes('--fix');

validateActive({ fix })
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('❌ Erro ao validar:', err);
    process.exit(1);
  });
