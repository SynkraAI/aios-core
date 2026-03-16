#!/usr/bin/env node

/**
 * copy-project-config.js
 *
 * Helper para copiar templates .claude/ para projetos.
 * Usado internamente pelo /new-project skill.
 *
 * Usage:
 *   node tools/copy-project-config.js {destination} {type} {projectName} {mode}
 *   node tools/copy-project-config.js {destination} {type} {projectName} {mode} --merge-types type1,type2
 *
 * Exemplo:
 *   node tools/copy-project-config.js ~/CODE/Projects/my-app app "My App" HYBRID
 *   node tools/copy-project-config.js docs/projects/my-proj knowledge "My Knowledge" CENTRALIZED
 *   node tools/copy-project-config.js ~/CODE/Projects/meta-ads app "Meta Ads" HYBRID --merge-types app,squad
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

const TEMPLATES_DIR = path.join(__dirname, 'templates/project-configs');

const VALID_TYPES = ['app', 'squad', 'mind-clone', 'pipeline', 'knowledge', 'research'];
const VALID_MODES = ['HYBRID', 'CENTRALIZED'];

const MODE_DESCRIPTIONS = {
  HYBRID: 'Governança local — INDEX, stories e sessions vivem em `.aios/` dentro do projeto.',
  CENTRALIZED: 'Governança central — INDEX, stories e sessions vivem em `docs/projects/{nome}/` dentro do aios-core.'
};

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function deepMerge(target, source) {
  const result = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value)) {
      // Merge arrays removendo duplicatas
      result[key] = Array.from(new Set([...(result[key] || []), ...value]));
    } else if (value !== null && typeof value === 'object') {
      // Merge objetos recursivamente
      result[key] = deepMerge(result[key] || {}, value);
    } else {
      // Sobrescrever valores simples
      result[key] = value;
    }
  }

  return result;
}

function replacePlaceholders(content, vars) {
  let result = content;
  for (const [key, value] of Object.entries(vars)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value);
  }
  return result;
}

function computePaths(destination, mode, projectName) {
  const slug = projectName.toLowerCase().replace(/\s+/g, '-');

  if (mode === 'HYBRID') {
    return {
      INDEX_PATH: '.aios/INDEX.md',
      STORIES_PATH: '.aios/stories/active/',
      SESSIONS_PATH: '.aios/sessions/',
      SAVE_LOCATION: '.aios/',
      PROJECT_SLUG: slug
    };
  } else {
    return {
      INDEX_PATH: `docs/projects/${slug}/INDEX.md`,
      STORIES_PATH: `docs/projects/${slug}/stories/active/`,
      SESSIONS_PATH: `docs/projects/${slug}/sessions/`,
      SAVE_LOCATION: `docs/projects/${slug}/`,
      PROJECT_SLUG: slug
    };
  }
}

/**
 * Allocate port for project using port-manager
 * @param {string} projectSlug - Project name (kebab-case)
 * @param {string} type - Project type
 * @returns {number|null} Allocated port or null
 */
function allocatePort(projectSlug, type) {
  try {
    const portManagerPath = path.join(__dirname, 'port-manager.js');
    execSync(`node "${portManagerPath}" allocate "${projectSlug}" "${type}"`, {
      stdio: 'inherit'
    });

    // Read registry to get allocated port
    const registryPath = path.join(__dirname, '..', '.aios-core', 'data', 'port-registry.json');
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

    return registry[projectSlug]?.port || null;
  } catch (error) {
    console.error(`⚠️  Falha ao alocar porta: ${error.message}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function copyProjectConfig(destination, type, projectName, mode, mergeTypes = null) {
  const resolvedDest = path.resolve(destination);

  console.log(`\n📋 Copiando templates .claude/ para: ${resolvedDest}\n`);

  // Determinar tipos a processar
  const typesToMerge = mergeTypes || [type];

  // Validar inputs
  for (const t of typesToMerge) {
    if (!VALID_TYPES.includes(t)) {
      throw new Error(`Tipo inválido: ${t}. Válidos: ${VALID_TYPES.join(', ')}`);
    }
  }

  if (!VALID_MODES.includes(mode)) {
    throw new Error(`Modo inválido: ${mode}. Válidos: ${VALID_MODES.join(', ')}`);
  }

  // 1. Copiar base
  const baseSrc = path.join(TEMPLATES_DIR, 'base/.claude');
  const claudeDest = path.join(resolvedDest, '.claude');

  console.log(`✅ Copiando base template...`);
  await fs.copy(baseSrc, claudeDest);

  // 2. Merge de settings.json dos tipos especificados
  if (mergeTypes && mergeTypes.length > 1) {
    console.log(`🔀 Fazendo merge de tipos: ${mergeTypes.join(' + ')}\n`);

    let mergedSettings = {};

    for (const t of mergeTypes) {
      const typeSrc = path.join(TEMPLATES_DIR, t, '.claude/settings.json');
      if (await fs.pathExists(typeSrc)) {
        const typeSettings = await fs.readJson(typeSrc);
        mergedSettings = deepMerge(mergedSettings, typeSettings);
        console.log(`   ✅ Merged: ${t}`);
      } else {
        console.log(`   ⏭️  Tipo '${t}' não tem settings.json override`);
      }
    }

    // Salvar settings.json merged
    await fs.writeJson(path.join(claudeDest, 'settings.json'), mergedSettings, { spaces: 2 });
    console.log(`\n✅ settings.json merged salvo.`);

  } else {
    // Modo normal: sobrescrever com tipo específico (se existe)
    const typeSrc = path.join(TEMPLATES_DIR, type, '.claude/settings.json');
    if (await fs.pathExists(typeSrc)) {
      console.log(`✅ Aplicando override para tipo: ${type}`);
      await fs.copy(typeSrc, path.join(claudeDest, 'settings.json'));
    } else {
      console.log(`ℹ️  Tipo '${type}' usa settings.json base (sem override)`);
    }
  }

  // 3. Substituir placeholders no CLAUDE.md
  const claudeMdPath = path.join(claudeDest, 'CLAUDE.md');
  let claudeMdContent = await fs.readFile(claudeMdPath, 'utf-8');

  const paths = computePaths(destination, mode, projectName);
  const vars = {
    PROJECT_NAME: projectName,
    MODE: mode,
    MODE_DESCRIPTION: MODE_DESCRIPTIONS[mode],
    ...paths
  };

  claudeMdContent = replacePlaceholders(claudeMdContent, vars);
  await fs.writeFile(claudeMdPath, claudeMdContent);

  console.log(`✅ Placeholders substituídos em CLAUDE.md`);

  // 4. Validar estrutura final
  const requiredFiles = [
    '.claude/settings.json',
    '.claude/CLAUDE.md',
    '.claude/rules/behavioral-rules.md',
    '.claude/rules/project-rules.md'
  ];

  console.log(`\n🔍 Validando estrutura criada...\n`);
  for (const file of requiredFiles) {
    const fullPath = path.join(resolvedDest, file);
    if (await fs.pathExists(fullPath)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} — MISSING!`);
      throw new Error(`Arquivo obrigatório não foi criado: ${file}`);
    }
  }

  // 5. Copiar e configurar port-config.json
  const portConfigSrc = path.join(TEMPLATES_DIR, type, 'port-config.json');
  const portConfigDest = path.join(resolvedDest, '.aios', 'port-config.json');

  if (await fs.pathExists(portConfigSrc)) {
    console.log(`\n🔌 Configurando port management...\n`);

    // Criar .aios/ se não existir
    await fs.ensureDir(path.join(resolvedDest, '.aios'));

    // Copiar port-config.json
    await fs.copy(portConfigSrc, portConfigDest);

    // Ler configuração
    const portConfig = await fs.readJson(portConfigDest);

    // Alocar porta se autoAllocate=true
    if (portConfig.autoAllocate) {
      const slug = paths.PROJECT_SLUG;
      console.log(`   🔍 Alocando porta para '${slug}'...`);

      const allocatedPort = allocatePort(slug, type);

      if (allocatedPort) {
        // Atualizar port-config.json com a porta alocada
        portConfig.port = allocatedPort;
        await fs.writeJson(portConfigDest, portConfig, { spaces: 2 });

        console.log(`   ✅ Porta ${allocatedPort} alocada`);

        // Criar .env com PORT (apenas para tipos app, squad, pipeline)
        if (['app', 'squad', 'pipeline'].includes(type)) {
          const envPath = path.join(resolvedDest, '.env');
          const envContent = `# Auto-generated by AIOX\nPORT=${allocatedPort}\n`;

          // Append ao .env se já existir, criar se não
          if (await fs.pathExists(envPath)) {
            const existingEnv = await fs.readFile(envPath, 'utf-8');
            if (!existingEnv.includes('PORT=')) {
              await fs.appendFile(envPath, `\n${envContent}`);
              console.log(`   ✅ PORT=${allocatedPort} adicionado ao .env`);
            } else {
              console.log(`   ℹ️  .env já tem PORT configurado`);
            }
          } else {
            await fs.writeFile(envPath, envContent);
            console.log(`   ✅ .env criado com PORT=${allocatedPort}`);
          }
        }
      } else {
        console.log(`   ⚠️  Porta não alocada (range cheio ou erro)`);
      }
    } else {
      console.log(`   ℹ️  Auto-allocation desabilitado para tipo '${type}'`);
    }
  } else {
    console.log(`\n⏭️  Port management não configurado (tipo '${type}' sem port-config.json)`);
  }

  console.log(`\n🎉 Configuração .claude/ criada com sucesso!\n`);
  console.log(`📂 Destino: ${resolvedDest}/.claude/`);
  if (mergeTypes && mergeTypes.length > 1) {
    console.log(`📝 Tipos merged: ${mergeTypes.join(' + ')}`);
  } else {
    console.log(`📝 Tipo: ${type}`);
  }
  console.log(`🔧 Modo: ${mode}\n`);
}

// ═══════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════

const args = process.argv.slice(2);

// Parse --merge-types flag
const mergeTypesIndex = args.indexOf('--merge-types');
const mergeTypes = mergeTypesIndex !== -1 && args[mergeTypesIndex + 1]
  ? args[mergeTypesIndex + 1].split(',')
  : null;

// Remover flag do args
const filteredArgs = args.filter((arg, i) =>
  arg !== '--merge-types' && (i !== mergeTypesIndex + 1)
);

const [destination, type, projectName, mode] = filteredArgs;

if (!destination || !type || !projectName || !mode) {
  console.error('❌ Uso: node copy-project-config.js {destination} {type} {projectName} {mode} [--merge-types type1,type2]');
  console.error('Exemplo: node copy-project-config.js ~/CODE/Projects/my-app app "My App" HYBRID');
  console.error('         node copy-project-config.js ~/CODE/Projects/meta-ads app "Meta Ads" HYBRID --merge-types app,squad');
  process.exit(1);
}

copyProjectConfig(destination, type, projectName, mode, mergeTypes).catch((err) => {
  console.error('❌ Erro ao copiar configuração:', err.message);
  process.exit(1);
});
