#!/usr/bin/env node

/**
 * Fix Project Configurations — v2.0 (Hardened)
 *
 * Corrige automaticamente os gaps encontrados pelo audit.
 * Usa copy-project-config.js para criar/atualizar .claude/ em cada projeto.
 *
 * Hardening: Dry-run obrigatorio, first-fix validation, subprocess error handling
 * Source: docs/reports/audit-project-config-analysis.md (Tripartite Analysis 2026-03-18)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const AIOS_CORE = path.join(os.homedir(), 'aios-core');
const { parseActiveProjects, validateClaudeConfig, VetoError, SEVERITY } = require('./audit-project-configs.js');

// ============================================================
// PROJECT TYPE DETECTION
// ============================================================

function detectProjectType(indexPath) {
  if (!fs.existsSync(indexPath)) return 'knowledge';

  const stats = fs.statSync(indexPath);
  if (stats.isDirectory()) return 'knowledge';

  const content = fs.readFileSync(indexPath, 'utf8');

  if (content.includes('**Type:** App') || content.includes('Next.js') || content.includes('React')) {
    return 'app';
  }
  if (content.includes('**Type:** Squad') || content.includes('Agent') || content.includes('Workflow')) {
    return 'squad';
  }
  if (content.includes('**Type:** Mind Clone') || content.includes('Mind DNA') || content.includes('Voice DNA')) {
    return 'mind-clone';
  }
  if (content.includes('**Type:** Pipeline') || content.includes('Automation') || content.includes('ETL')) {
    return 'pipeline';
  }
  if (content.includes('**Type:** Research') || content.includes('Study') || content.includes('Analysis')) {
    return 'research';
  }

  return 'knowledge';
}

// ============================================================
// DRY-RUN PREVIEW (AC-3 / VETO_7)
// ============================================================

function generateDryRunPreview(projectsToFix) {
  let preview = '\n--- DRY-RUN PREVIEW ---\n\n';
  preview += `Projetos a corrigir: ${projectsToFix.length}\n\n`;

  projectsToFix.forEach((item, i) => {
    const { project, issues, type } = item;
    const shortPath = project.claudePath.replace(os.homedir(), '~');
    const maxSev = getMaxSeverity(issues);

    preview += `[${i + 1}] ${project.name}\n`;
    preview += `    Modo: ${project.mode} | Tipo: ${type}\n`;
    preview += `    Destino: ${shortPath}\n`;
    preview += `    Issues [${maxSev}]: ${issues.map(iss => iss.message).join('; ')}\n`;

    // Check if destination exists
    const destExists = fs.existsSync(project.claudePath);
    preview += `    .claude/ existente: ${destExists ? 'SIM (sera atualizado)' : 'NAO (sera criado)'}\n`;

    // Check if writeable
    const parentExists = fs.existsSync(project.projectPath);
    if (!parentExists) {
      preview += `    ATENCAO: Project path nao existe: ${project.projectPath}\n`;
    }

    preview += '\n';
  });

  preview += '--- FIM PREVIEW ---\n';
  return preview;
}

function getMaxSeverity(issues) {
  const order = [SEVERITY.CRITICAL, SEVERITY.HIGH, SEVERITY.MEDIUM, SEVERITY.LOW];
  for (const sev of order) {
    if (issues.some(i => i.severity === sev)) return sev;
  }
  return SEVERITY.LOW;
}

// ============================================================
// FIX SINGLE PROJECT — With subprocess validation (Vetos 9-12)
// ============================================================

function fixProject(project, type) {
  return new Promise((resolve) => {
    // VETO_9: Check destination is writeable
    const parentDir = project.projectPath;
    if (!fs.existsSync(parentDir)) {
      resolve({
        success: false,
        error: `VETO_9: Project path nao existe: ${parentDir}`
      });
      return;
    }

    try {
      fs.accessSync(parentDir, fs.constants.W_OK);
    } catch {
      resolve({
        success: false,
        error: `VETO_9: Sem permissao de escrita em: ${parentDir}`
      });
      return;
    }

    const destination = project.projectPath;
    const name = project.name;
    const mode = project.mode;

    const scriptPath = path.join(AIOS_CORE, 'tools/copy-project-config.js');

    // Check script exists
    if (!fs.existsSync(scriptPath)) {
      resolve({
        success: false,
        error: `Script nao encontrado: ${scriptPath}`
      });
      return;
    }

    const child = spawn('node', [scriptPath, '--', destination, type, name, mode], {
      cwd: AIOS_CORE,
      stdio: 'pipe'
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (code) => {
      // VETO_10: Exit code must be 0
      if (code !== 0) {
        resolve({
          success: false,
          error: `VETO_10: Comando falhou (exit ${code}): ${stderr || stdout}`
        });
        return;
      }

      // VETO_11: Output file must exist
      const settingsPath = path.join(project.claudePath, 'settings.json');
      const claudeMdPath = path.join(project.claudePath, 'CLAUDE.md');

      if (!fs.existsSync(project.claudePath)) {
        resolve({
          success: false,
          error: `VETO_11: Fix reportou sucesso mas .claude/ nao foi criado em: ${project.claudePath}`
        });
        return;
      }

      // VETO_12: If settings.json was created, it must be valid JSON
      if (fs.existsSync(settingsPath)) {
        try {
          JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        } catch (e) {
          resolve({
            success: false,
            error: `VETO_12: settings.json criado mas JSON invalido: ${e.message}`
          });
          return;
        }
      }

      resolve({ success: true });
    });

    child.on('error', (error) => {
      resolve({
        success: false,
        error: `Erro ao executar script: ${error.message}`
      });
    });
  });
}

// ============================================================
// MAIN — With dry-run and first-fix validation
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRunOnly = args.includes('--dry-run');
  const firstOnly = args.includes('--first-only');

  console.log('Auto-Fix de Configuracoes de Projetos (v2.0 Hardened)\n');

  try {
    console.log('Carregando projetos...');
    const { projects, warnings } = parseActiveProjects();

    if (warnings.length > 0) {
      console.log(`\nWarnings (${warnings.length}):`);
      warnings.forEach(w => console.log(`  - ${w}`));
    }

    console.log('\nIdentificando projetos com gaps...');
    const projectsToFix = [];

    projects.forEach(proj => {
      const result = validateClaudeConfig(proj);
      if (!result.ok) {
        const type = detectProjectType(proj.indexPath);
        projectsToFix.push({ project: proj, issues: result.issues, type });
      }
    });

    console.log(`Projetos a corrigir: ${projectsToFix.length}`);

    if (projectsToFix.length === 0) {
      console.log('Nenhum projeto precisa de correcao!');
      return;
    }

    // ── DRY-RUN PREVIEW (OBRIGATORIO) ──
    const preview = generateDryRunPreview(projectsToFix);
    console.log(preview);

    if (dryRunOnly) {
      console.log('Modo --dry-run: nenhuma alteracao feita.');
      return;
    }

    // Filter out projects with invalid paths (VETO_9 pre-check)
    const validProjects = projectsToFix.filter(item => {
      if (!fs.existsSync(item.project.projectPath)) {
        console.log(`SKIP: ${item.project.name} — project path nao existe`);
        return false;
      }
      return true;
    });

    if (validProjects.length === 0) {
      console.log('Nenhum projeto valido para corrigir apos validacao de paths.');
      return;
    }

    // ── FIRST-FIX VALIDATION (VETO_8) ──
    console.log('='.repeat(60));
    console.log(`\nCorrigindo primeiro projeto para validacao...\n`);

    const first = validProjects[0];
    console.log(`[1/${validProjects.length}] ${first.project.name} (${first.type})`);

    const firstResult = await fixProject(first.project, first.type);

    if (!firstResult.success) {
      console.error(`\nVETO_8: Primeiro fix falhou — HALT batch.`);
      console.error(`Erro: ${firstResult.error}`);
      console.error(`\nCorrigir problema antes de tentar batch.`);
      process.exit(1);
      return;
    }

    console.log(`  OK — primeiro projeto corrigido com sucesso`);

    const results = { success: [first.project.name], failed: [] };

    // Fix remaining projects (if more than 1 and not --first-only)
    if (validProjects.length > 1 && !firstOnly) {
      console.log(`\nContinuando com ${validProjects.length - 1} projetos restantes...\n`);

      for (let i = 1; i < validProjects.length; i++) {
        const { project, type } = validProjects[i];
        process.stdout.write(`[${i + 1}/${validProjects.length}] ${project.name}... `);

        const result = await fixProject(project, type);

        if (result.success) {
          console.log('OK');
          results.success.push(project.name);
        } else {
          console.log(`FAIL: ${result.error}`);
          results.failed.push({ name: project.name, error: result.error });
        }
      }
    } else if (firstOnly) {
      console.log('\nModo --first-only: apenas primeiro projeto corrigido.');
    }

    // ── RESUMO FINAL ──
    console.log('\n' + '='.repeat(60));
    console.log('\nResumo Final\n');
    console.log(`  Sucesso: ${results.success.length}`);
    console.log(`  Falha: ${results.failed.length}`);

    if (results.success.length > 0) {
      console.log('\nProjetos corrigidos:');
      results.success.forEach(name => console.log(`  + ${name}`));
    }

    if (results.failed.length > 0) {
      console.log('\nProjetos que falharam:');
      results.failed.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
    }

    console.log('\nProximo passo: Rodar audit novamente para validar');
    console.log('  node tools/audit-project-configs.js\n');

    process.exit(results.failed.length > 0 ? 1 : 0);

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

module.exports = { fixProject, detectProjectType, generateDryRunPreview };
