#!/usr/bin/env node

/**
 * Audit Project Memory — v1.0
 *
 * Valida que projetos ativos têm estrutura de memória adequada.
 * Verifica: .aiox/memory/, sessions/, INDEX.md, feedback/, gotchas.
 *
 * Reutiliza parseActiveProjects() de audit-project-configs.js
 *
 * Usage:
 *   node tools/audit-project-memory.js          # All projects
 *   node tools/audit-project-memory.js --json    # JSON output
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const AIOS_CORE = path.join(os.homedir(), 'aios-core');

// Reuse parser from audit-project-configs
const { parseActiveProjects, SEVERITY } = require('./audit-project-configs');

// ============================================================
// MEMORY VALIDATION
// ============================================================

function validateProjectMemory(project) {
  const issues = [];
  const stats = {
    hasIndex: false,
    hasAios: false,
    hasMemoryDir: false,
    hasSessions: false,
    hasProjectContext: false,
    hasFeedbackDir: false,
    hasGotchas: false,
    sessionCount: 0,
    feedbackCount: 0,
    lastSessionDate: null
  };

  // Determine .aios path based on mode
  let aiosPath;
  if (project.mode === 'HYBRID') {
    aiosPath = path.join(project.projectPath, '.aios');
  } else {
    // CENTRALIZED: project lives under docs/projects/{name}/
    // .aios would be at docs/projects/{name}/.aios — but centralized
    // projects use docs/projects/{name}/ directly for sessions
    aiosPath = project.projectPath;
  }

  // 1. INDEX.md exists?
  const indexPath = project.indexPath;
  if (fs.existsSync(indexPath)) {
    stats.hasIndex = true;
    const content = fs.readFileSync(indexPath, 'utf8');
    if (content.length < 50) {
      issues.push({ severity: SEVERITY.HIGH, message: 'INDEX.md vazio ou muito curto' });
    }
  } else {
    issues.push({ severity: SEVERITY.CRITICAL, message: 'INDEX.md não encontrado' });
  }

  // 2. .aiox/ directory (HYBRID only)
  if (project.mode === 'HYBRID') {
    if (fs.existsSync(aiosPath)) {
      stats.hasAios = true;
    } else {
      issues.push({ severity: SEVERITY.HIGH, message: '.aiox/ não existe (HYBRID precisa)' });
    }
  } else {
    stats.hasAios = true; // CENTRALIZED doesn't need .aiox/
  }

  // 3. memory/ directory
  const memoryPath = path.join(aiosPath, 'memory');
  if (fs.existsSync(memoryPath) && fs.statSync(memoryPath).isDirectory()) {
    stats.hasMemoryDir = true;

    // 3a. project-context.md
    const contextPath = path.join(memoryPath, 'project-context.md');
    if (fs.existsSync(contextPath)) {
      stats.hasProjectContext = true;
    } else {
      issues.push({ severity: SEVERITY.MEDIUM, message: 'memory/project-context.md não existe' });
    }

    // 3b. feedback/ directory
    const feedbackPath = path.join(memoryPath, 'feedback');
    if (fs.existsSync(feedbackPath) && fs.statSync(feedbackPath).isDirectory()) {
      stats.hasFeedbackDir = true;
      try {
        const feedbackFiles = fs.readdirSync(feedbackPath).filter(f => f.endsWith('.md'));
        stats.feedbackCount = feedbackFiles.length;
      } catch {
        // ignore read errors
      }
    }
  } else {
    issues.push({ severity: SEVERITY.HIGH, message: 'memory/ directory não existe' });
  }

  // 4. sessions/ directory
  const sessionsPath = path.join(aiosPath, 'sessions');
  if (fs.existsSync(sessionsPath) && fs.statSync(sessionsPath).isDirectory()) {
    stats.hasSessions = true;
    try {
      const sessionFiles = fs.readdirSync(sessionsPath)
        .filter(f => f.endsWith('.md') && /\d{4}-\d{2}-\d{2}/.test(f));
      stats.sessionCount = sessionFiles.length;

      // Find most recent session
      if (sessionFiles.length > 0) {
        const sorted = sessionFiles.sort().reverse();
        const dateMatch = sorted[0].match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          stats.lastSessionDate = dateMatch[1];
        }
      }
    } catch {
      // ignore read errors
    }

    if (stats.sessionCount === 0) {
      issues.push({ severity: SEVERITY.LOW, message: 'sessions/ existe mas sem session files' });
    }
  } else {
    issues.push({ severity: SEVERITY.MEDIUM, message: 'sessions/ directory não existe' });
  }

  // 5. gotchas.json (optional but nice)
  const gotchasPath = path.join(aiosPath, 'gotchas.json');
  if (fs.existsSync(gotchasPath)) {
    stats.hasGotchas = true;
  }

  // Calculate memory score (0-10)
  let score = 0;
  if (stats.hasIndex) score += 2;
  if (stats.hasAios) score += 1;
  if (stats.hasMemoryDir) score += 2;
  if (stats.hasProjectContext) score += 2;
  if (stats.hasSessions) score += 1;
  if (stats.sessionCount > 0) score += 1;
  if (stats.hasFeedbackDir) score += 1;

  return {
    ok: issues.filter(i => i.severity === SEVERITY.CRITICAL || i.severity === SEVERITY.HIGH).length === 0,
    score,
    issues,
    stats
  };
}

// ============================================================
// REPORT
// ============================================================

function generateMemoryReport(projects, results, warnings) {
  const total = projects.length;
  const avgScore = total > 0
    ? (results.reduce((sum, r) => sum + r.score, 0) / total).toFixed(1)
    : 0;

  const buckets = {
    good: results.filter(r => r.score >= 7),
    partial: results.filter(r => r.score >= 4 && r.score < 7),
    missing: results.filter(r => r.score < 4)
  };

  let report = '# Audit Report — Project Memory\n\n';
  report += `**Data:** ${new Date().toISOString().split('T')[0]}\n`;
  report += `**Total projetos:** ${total}\n`;
  report += `**Score médio:** ${avgScore}/10\n`;
  report += `**Completos (7+):** ${buckets.good.length} | **Parciais (4-6):** ${buckets.partial.length} | **Missing (<4):** ${buckets.missing.length}\n\n`;

  if (warnings.length > 0) {
    report += '## Warnings (Parse Phase)\n\n';
    warnings.forEach(w => { report += `- ${w}\n`; });
    report += '\n';
  }

  // Summary table
  report += '## Todos os Projetos\n\n';
  report += '| # | Projeto | Modo | Score | INDEX | memory/ | sessions | feedback | Issues |\n';
  report += '|---|---------|------|-------|-------|---------|----------|----------|--------|\n';

  results.forEach((result, i) => {
    const proj = projects[i];
    const s = result.stats;
    const issueCount = result.issues.length;
    const scoreEmoji = result.score >= 7 ? '🟢' : result.score >= 4 ? '🟡' : '🔴';

    report += `| ${proj.num} | ${proj.name} | ${proj.mode} | ${scoreEmoji} ${result.score}/10 | `;
    report += `${s.hasIndex ? '✅' : '❌'} | `;
    report += `${s.hasMemoryDir ? '✅' : '❌'} | `;
    report += `${s.hasSessions ? `✅ (${s.sessionCount})` : '❌'} | `;
    report += `${s.hasFeedbackDir ? `✅ (${s.feedbackCount})` : '—'} | `;
    report += `${issueCount > 0 ? issueCount + ' issues' : 'OK'} |\n`;
  });
  report += '\n';

  // Issues detail for projects with problems
  const withIssues = results
    .map((r, i) => ({ result: r, project: projects[i] }))
    .filter(x => x.result.issues.length > 0)
    .sort((a, b) => a.result.score - b.result.score);

  if (withIssues.length > 0) {
    report += '## Issues Detalhados\n\n';
    for (const { result, project } of withIssues) {
      report += `### ${project.name} (${result.score}/10)\n`;
      for (const issue of result.issues) {
        report += `- **[${issue.severity}]** ${issue.message}\n`;
      }
      report += '\n';
    }
  }

  // Recommendations
  report += '## Recomendações\n\n';
  if (buckets.missing.length > 0) {
    report += `### Prioridade 1: Criar memory/ (${buckets.missing.length} projetos)\n`;
    report += 'Projetos sem nenhuma estrutura de memória. Criar `.aiox/memory/project-context.md` mínimo.\n\n';
    buckets.missing.forEach((r, idx) => {
      const proj = projects[results.indexOf(r)];
      report += `${idx + 1}. **${proj.name}** (score ${r.score}/10)\n`;
    });
    report += '\n';
  }
  if (buckets.partial.length > 0) {
    report += `### Prioridade 2: Completar memory/ (${buckets.partial.length} projetos)\n`;
    report += 'Projetos com estrutura parcial. Adicionar o que falta (context, feedback, sessions).\n\n';
    buckets.partial.forEach((r, idx) => {
      const proj = projects[results.indexOf(r)];
      report += `${idx + 1}. **${proj.name}** (score ${r.score}/10)\n`;
    });
    report += '\n';
  }

  return report;
}

// ============================================================
// MAIN
// ============================================================

function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');

  console.log('Auditando memória dos projetos...\n');

  try {
    const { projects, warnings } = parseActiveProjects();
    console.log(`Encontrados ${projects.length} projetos\n`);

    if (warnings.length > 0) {
      console.log(`Warnings (${warnings.length}):`);
      warnings.forEach(w => console.log(`  - ${w}`));
      console.log('');
    }

    console.log('Validando memória...');
    const results = projects.map((proj, i) => {
      process.stdout.write(`[${i + 1}/${projects.length}] ${proj.name}... `);
      const result = validateProjectMemory(proj);
      const emoji = result.score >= 7 ? '🟢' : result.score >= 4 ? '🟡' : '🔴';
      console.log(`${emoji} ${result.score}/10`);
      return result;
    });

    if (jsonOutput) {
      const data = projects.map((proj, i) => ({
        name: proj.name,
        mode: proj.mode,
        score: results[i].score,
        ok: results[i].ok,
        stats: results[i].stats,
        issues: results[i].issues
      }));
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    console.log('\nGerando relatório...\n');
    const report = generateMemoryReport(projects, results, warnings);

    // Save report
    const reportPath = path.join(AIOS_CORE, 'docs/reports/project-memory-audit.md');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, report);

    // Console summary
    const total = projects.length;
    const avgScore = (results.reduce((sum, r) => sum + r.score, 0) / total).toFixed(1);
    const good = results.filter(r => r.score >= 7).length;
    const partial = results.filter(r => r.score >= 4 && r.score < 7).length;
    const missing = results.filter(r => r.score < 4).length;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Score médio: ${avgScore}/10`);
    console.log(`🟢 Completos: ${good} | 🟡 Parciais: ${partial} | 🔴 Missing: ${missing}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\nRelatório salvo em: ${reportPath}`);

    process.exit(missing > 0 ? 1 : 0);

  } catch (e) {
    if (e.vetoId) {
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
  validateProjectMemory,
  generateMemoryReport
};
