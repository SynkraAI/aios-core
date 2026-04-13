#!/usr/bin/env node

/**
 * Audit Project Configurations — v2.0 (Hardened)
 *
 * Valida que todos os projetos em ACTIVE.md têm configuração .claude/ correta.
 * Gera relatório de gaps com severidade e oferece auto-fix seguro.
 *
 * Hardening: Vetos 1-6, Validation Layers L1-L2, Path Safety, Deep settings.json check
 * Source: docs/reports/audit-project-config-analysis.md (Tripartite Analysis 2026-03-18)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const AIOS_CORE = path.join(os.homedir(), 'aios-core');
const ACTIVE_MD = path.join(AIOS_CORE, 'docs/projects/ACTIVE.md');

// Severity levels
const SEVERITY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

// ============================================================
// VETO SYSTEM — Fail early, fail loud
// ============================================================

class VetoError extends Error {
  constructor(vetoId, message) {
    super(`[${vetoId}] ${message}`);
    this.vetoId = vetoId;
  }
}

// VETO_1: ACTIVE.md must exist
function vetoActivemdExists() {
  if (!fs.existsSync(ACTIVE_MD)) {
    throw new VetoError('VETO_1', `ACTIVE.md não encontrado em: ${ACTIVE_MD}`);
  }
}

// VETO_2: Table must have required columns
function vetoTableSchema(content) {
  const headerLine = content.split('\n').find(
    line => line.startsWith('|') && line.includes('Projeto') && line.includes('INDEX')
  );
  if (!headerLine) {
    throw new VetoError('VETO_2',
      'ACTIVE.md não tem schema esperado.\n' +
      'Esperado: | # | Projeto | ... | INDEX |\n' +
      'Dica: Verificar se a tabela tem colunas "Projeto" e "INDEX".'
    );
  }
}

// VETO_3: At least one project found
function vetoZeroProjects(projects) {
  if (projects.length === 0) {
    throw new VetoError('VETO_3',
      'Nenhum projeto encontrado em ACTIVE.md.\n' +
      'Tabela vazia ou parse falhou. Verifique formato da tabela.'
    );
  }
}

// VETO_5: Path must be inside expected project root
function vetoPathOutsideProject(resolvedPath, projectName) {
  const homedir = os.homedir();
  // Path must be inside homedir at minimum
  if (!resolvedPath.startsWith(homedir)) {
    throw new VetoError('VETO_5',
      `Path computado para "${projectName}" está fora do homedir:\n` +
      `  Computado: ${resolvedPath}\n` +
      `  Esperado: dentro de ${homedir}`
    );
  }
}

// ============================================================
// PARSE ACTIVE.MD — With schema validation
// ============================================================

function parseActiveProjects() {
  // VETO_1
  vetoActivemdExists();

  const content = fs.readFileSync(ACTIVE_MD, 'utf8');

  // VETO_2
  vetoTableSchema(content);

  const lines = content.split('\n');
  const projects = [];
  const warnings = [];

  for (const line of lines) {
    // Skip headers, separators, and backlog
    if (!line.startsWith('|') || line.includes('---') || line.includes('Projeto')) continue;
    if (line.includes('Backlog')) break;

    const cols = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length < 7) continue;

    const [num, name, , , , , indexLink] = cols;

    // Extract path from [INDEX](path)
    const match = indexLink.match(/\[INDEX\]\(([^)]+)\)/);
    if (!match) {
      warnings.push(`Linha ignorada (sem link INDEX válido): ${name}`);
      continue;
    }

    let indexPath = match[1].replace('~', os.homedir());
    const isHybrid = indexPath.includes('.aiox/');
    const isCentralized = !isHybrid;

    // VETO_4: Mode detection — must be clearly HYBRID or CENTRALIZED
    if (!isHybrid && !indexPath.includes('/') && !indexPath.endsWith('INDEX.md') && !indexPath.endsWith('/')) {
      warnings.push(`VETO_4 SKIP: "${name}" — modo ambíguo (link: ${match[1]})`);
      continue;
    }

    let projectPath;
    if (isHybrid) {
      // HYBRID: {path}/.aiox/INDEX.md -> {path}
      projectPath = path.dirname(path.dirname(indexPath));
    } else {
      // CENTRALIZED: path is relative like "gui-avila-mind/INDEX.md"
      if (!indexPath.startsWith('/')) {
        indexPath = path.join(AIOS_CORE, 'docs/projects', indexPath);
      }
      projectPath = path.dirname(indexPath);
    }

    // VETO_6: Resolve to absolute path
    const resolvedProjectPath = path.resolve(projectPath);
    const resolvedClaudePath = path.join(resolvedProjectPath, '.claude');

    // VETO_5: Path must be inside expected boundaries
    try {
      vetoPathOutsideProject(resolvedProjectPath, name);
    } catch (e) {
      warnings.push(`VETO_5 SKIP: "${name}" — ${e.message}`);
      continue;
    }

    projects.push({
      num: num.replace(/[~*]/g, '').trim(),
      name: name.replace(/[~*]/g, '').trim(),
      mode: isHybrid ? 'HYBRID' : 'CENTRALIZED',
      indexPath: path.resolve(indexPath),
      projectPath: resolvedProjectPath,
      claudePath: resolvedClaudePath
    });
  }

  // VETO_3
  vetoZeroProjects(projects);

  return { projects, warnings };
}

// ============================================================
// VALIDATION — L1 Structural + L2 Semantic
// ============================================================

function validateClaudeConfig(project) {
  const issues = [];

  // ── L1: STRUCTURAL VALIDATION ──────────────────────────
  // Does .claude/ directory exist?
  if (!fs.existsSync(project.claudePath)) {
    return {
      ok: false,
      issues: [{ severity: SEVERITY.CRITICAL, message: 'MISSING .claude/ directory' }]
    };
  }

  const claudeMdPath = path.join(project.claudePath, 'CLAUDE.md');
  const settingsPath = path.join(project.claudePath, 'settings.json');
  const rulesPath = path.join(project.claudePath, 'rules');
  const behavioralRulesPath = path.join(rulesPath, 'behavioral-rules.md');

  // L1: Required files exist?
  if (!fs.existsSync(claudeMdPath)) {
    issues.push({ severity: SEVERITY.HIGH, message: 'Missing CLAUDE.md' });
  }
  if (!fs.existsSync(settingsPath)) {
    issues.push({ severity: SEVERITY.HIGH, message: 'Missing settings.json' });
  }
  if (!fs.existsSync(rulesPath)) {
    issues.push({ severity: SEVERITY.MEDIUM, message: 'Missing rules/ directory' });
  }
  if (fs.existsSync(rulesPath) && !fs.existsSync(behavioralRulesPath)) {
    issues.push({ severity: SEVERITY.MEDIUM, message: 'Missing rules/behavioral-rules.md' });
  }

  // ── L2: SEMANTIC VALIDATION ────────────────────────────
  // CLAUDE.md: placeholders not substituted?
  if (fs.existsSync(claudeMdPath)) {
    const content = fs.readFileSync(claudeMdPath, 'utf8');
    // Context-aware: ignore placeholders inside code blocks
    const contentWithoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '');
    const contentWithoutHtmlComments = contentWithoutCodeBlocks.replace(/<!--[\s\S]*?-->/g, '');
    const placeholders = contentWithoutHtmlComments.match(/\{\{[A-Z_]+\}\}/g);
    if (placeholders && placeholders.length > 0) {
      const unique = [...new Set(placeholders)];
      issues.push({
        severity: SEVERITY.HIGH,
        message: `Placeholders não substituídos: ${unique.join(', ')}`
      });
    }
  }

  // settings.json: deep validation
  if (fs.existsSync(settingsPath)) {
    const settingsIssues = validateSettingsJson(settingsPath);
    issues.push(...settingsIssues);
  }

  // behavioral-rules.md: has content?
  if (fs.existsSync(behavioralRulesPath)) {
    const content = fs.readFileSync(behavioralRulesPath, 'utf8');
    if (content.length < 100) {
      issues.push({
        severity: SEVERITY.LOW,
        message: 'rules/behavioral-rules.md muito curto (< 100 chars)'
      });
    }
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

// ============================================================
// DEEP SETTINGS.JSON VALIDATION (AC-4)
// ============================================================

function validateSettingsJson(settingsPath) {
  const issues = [];

  let settings;
  try {
    const raw = fs.readFileSync(settingsPath, 'utf8');
    settings = JSON.parse(raw);
  } catch (e) {
    issues.push({
      severity: SEVERITY.CRITICAL,
      message: `settings.json inválido: ${e.message}`
    });
    return issues;
  }

  // CRITICAL: hooks must be object, not array (known fatal error)
  // Ref: .claude/rules/settings-format.md
  if (settings.hooks !== undefined) {
    if (Array.isArray(settings.hooks)) {
      issues.push({
        severity: SEVERITY.CRITICAL,
        message: 'hooks é array (DEVE ser objeto {}). Causa: "Expected record, but received array"'
      });
    } else if (typeof settings.hooks !== 'object') {
      issues.push({
        severity: SEVERITY.CRITICAL,
        message: `hooks tem tipo inválido: ${typeof settings.hooks} (DEVE ser objeto {})`
      });
    } else {
      // Validate hook matchers are strings, not objects
      for (const [eventName, eventHandlers] of Object.entries(settings.hooks)) {
        if (!Array.isArray(eventHandlers)) continue;
        for (const handler of eventHandlers) {
          if (handler.matcher && typeof handler.matcher !== 'string') {
            issues.push({
              severity: SEVERITY.HIGH,
              message: `hooks.${eventName}: matcher deve ser string, não ${typeof handler.matcher}`
            });
          }
        }
      }
    }
  }

  // HIGH: permissions structure
  if (!settings.permissions) {
    issues.push({
      severity: SEVERITY.HIGH,
      message: 'settings.json sem campo "permissions"'
    });
  } else {
    if (!settings.permissions.allow || !Array.isArray(settings.permissions.allow)) {
      issues.push({
        severity: SEVERITY.HIGH,
        message: 'settings.json sem permissions.allow (ou não é array)'
      });
    }
    if (!settings.permissions.deny || !Array.isArray(settings.permissions.deny)) {
      issues.push({
        severity: SEVERITY.HIGH,
        message: 'settings.json sem permissions.deny (ou não é array)'
      });
    }
  }

  return issues;
}

// ============================================================
// REPORT GENERATION — With severity
// ============================================================

function generateReport(projects, results, warnings) {
  const ok = results.filter(r => r.ok).length;
  const total = projects.length;
  const healthPercent = total > 0 ? Math.round((ok / total) * 100) : 0;

  const missing = results.filter(r =>
    !r.ok && r.issues.some(i => i.message === 'MISSING .claude/ directory')
  ).length;
  const outdated = results.filter(r =>
    !r.ok && !r.issues.some(i => i.message === 'MISSING .claude/ directory')
  ).length;

  // Count by severity
  const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  results.forEach(r => {
    if (!r.ok) {
      r.issues.forEach(i => {
        if (severityCounts[i.severity] !== undefined) {
          severityCounts[i.severity]++;
        }
      });
    }
  });

  let report = '# Audit Report — Project Configurations\n\n';
  report += `**Data:** ${new Date().toISOString().split('T')[0]}\n`;
  report += `**Health Score:** ${ok}/${total} OK (${healthPercent}%)\n`;
  report += `**Missing Config:** ${missing}\n`;
  report += `**Outdated/Incomplete:** ${outdated}\n`;
  report += `**Issues by Severity:** CRITICAL: ${severityCounts.CRITICAL} | HIGH: ${severityCounts.HIGH} | MEDIUM: ${severityCounts.MEDIUM} | LOW: ${severityCounts.LOW}\n\n`;

  // Warnings from parse phase
  if (warnings.length > 0) {
    report += '## Warnings (Parse Phase)\n\n';
    warnings.forEach(w => { report += `- ${w}\n`; });
    report += '\n';
  }

  // OK projects
  report += `## OK (${ok} projetos)\n\n`;
  report += '| # | Projeto | Modo | Config Path |\n';
  report += '|---|---------|------|-------------|\n';
  results.forEach((result, i) => {
    if (result.ok) {
      const proj = projects[i];
      const shortPath = proj.claudePath.replace(os.homedir(), '~');
      report += `| ${proj.num} | ${proj.name} | ${proj.mode} | ${shortPath} |\n`;
    }
  });
  report += '\n';

  // Missing config
  if (missing > 0) {
    report += `## Missing Config (${missing} projetos)\n\n`;
    report += '| # | Projeto | Modo | Esperado Em |\n';
    report += '|---|---------|------|-------------|\n';
    results.forEach((result, i) => {
      if (!result.ok && result.issues.some(iss => iss.message === 'MISSING .claude/ directory')) {
        const proj = projects[i];
        const shortPath = proj.claudePath.replace(os.homedir(), '~');
        report += `| ${proj.num} | ${proj.name} | ${proj.mode} | ${shortPath} |\n`;
      }
    });
    report += '\n';
  }

  // Outdated/Incomplete with severity
  if (outdated > 0) {
    report += `## Outdated/Incomplete (${outdated} projetos)\n\n`;
    report += '| # | Projeto | Severity | Issues |\n';
    report += '|---|---------|----------|--------|\n';
    results.forEach((result, i) => {
      if (!result.ok && !result.issues.some(iss => iss.message === 'MISSING .claude/ directory')) {
        const proj = projects[i];
        const maxSeverity = getMaxSeverity(result.issues);
        const issueStr = result.issues.map(iss => `[${iss.severity}] ${iss.message}`).join('; ');
        report += `| ${proj.num} | ${proj.name} | ${maxSeverity} | ${issueStr} |\n`;
      }
    });
    report += '\n';
  }

  return report;
}

function getMaxSeverity(issues) {
  const order = [SEVERITY.CRITICAL, SEVERITY.HIGH, SEVERITY.MEDIUM, SEVERITY.LOW];
  for (const sev of order) {
    if (issues.some(i => i.severity === sev)) return sev;
  }
  return SEVERITY.LOW;
}

// ============================================================
// MAIN
// ============================================================

function main() {
  console.log('Auditando configuracoes de projetos...\n');

  try {
    console.log('Lendo docs/projects/ACTIVE.md...');
    const { projects, warnings } = parseActiveProjects();
    console.log(`Encontrados ${projects.length} projetos\n`);

    if (warnings.length > 0) {
      console.log(`Warnings (${warnings.length}):`);
      warnings.forEach(w => console.log(`  - ${w}`));
      console.log('');
    }

    console.log('Validando configuracoes...');
    const results = projects.map((proj, i) => {
      process.stdout.write(`[${i + 1}/${projects.length}] ${proj.name}... `);
      const result = validateClaudeConfig(proj);
      if (result.ok) {
        console.log('OK');
      } else {
        const maxSev = getMaxSeverity(result.issues);
        console.log(`FAIL [${maxSev}]`);
      }
      return result;
    });

    console.log('\nGerando relatorio...\n');
    const report = generateReport(projects, results, warnings);

    // Save report
    const reportPath = path.join(AIOS_CORE, 'docs/reports/project-config-audit.md');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, report);

    // Console output
    const ok = results.filter(r => r.ok).length;
    const total = projects.length;
    const healthPercent = total > 0 ? Math.round((ok / total) * 100) : 0;

    console.log(`Project Health: ${ok}/${total} OK (${healthPercent}%)`);

    const hasCritical = results.some(r =>
      !r.ok && r.issues.some(i => i.severity === SEVERITY.CRITICAL)
    );
    if (hasCritical) {
      console.log('\nATENCAO: Issues CRITICAL encontradas. Corrigir antes de usar projetos afetados.');
    }

    console.log(`\nRelatorio salvo em: ${reportPath}`);

    // Exit code for CI usage
    process.exit(hasCritical ? 1 : 0);

  } catch (e) {
    if (e instanceof VetoError) {
      console.error(`\nVETO: ${e.message}`);
      process.exit(2);
    }
    throw e;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  parseActiveProjects,
  validateClaudeConfig,
  validateSettingsJson,
  generateReport,
  VetoError,
  SEVERITY
};
