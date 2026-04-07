#!/usr/bin/env node

/**
 * Port Manager — Automatic port allocation and conflict detection for AIOX projects
 *
 * Usage:
 *   node tools/port-manager.js check <port>               # Check if port is available
 *   node tools/port-manager.js allocate <project> <type>  # Allocate next free port
 *   node tools/port-manager.js auto <project> [type]      # Allocate + output PORT=XXXX (for shell)
 *   node tools/port-manager.js scan                       # Show all occupied ports
 *   node tools/port-manager.js list                       # List all allocated ports
 *   node tools/port-manager.js release <project>          # Release project's port
 */

const fs = require('fs');
const path = require('path');
const net = require('net');
const { execSync } = require('child_process');

// Port ranges por tipo de projeto
const PORT_RANGES = {
  app: { start: 3000, end: 3099 },
  api: { start: 4000, end: 4099 },
  pipeline: { start: 5000, end: 5099 },
  squad: { start: 8000, end: 8099 },
  'mind-clone': { start: 6000, end: 6099 },
  knowledge: { start: 7000, end: 7099 },
  research: { start: 7100, end: 7199 }
};

const REGISTRY_PATH = path.join(__dirname, '..', '.aios-core', 'data', 'port-registry.json');

/**
 * Load port registry from disk
 * @returns {Object} Port registry
 */
function loadRegistry() {
  try {
    if (!fs.existsSync(REGISTRY_PATH)) {
      return {};
    }
    const content = fs.readFileSync(REGISTRY_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`⚠️  Erro ao ler registry: ${error.message}`);
    return {};
  }
}

/**
 * Save port registry to disk
 * @param {Object} registry - Port registry
 */
function saveRegistry(registry) {
  try {
    const dir = path.dirname(REGISTRY_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf8');
  } catch (error) {
    console.error(`❌ Erro ao salvar registry: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Check if a port is available (not in use)
 * @param {number} port - Port to check
 * @returns {Promise<boolean>} True if available
 */
function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false); // Port occupied
      } else {
        resolve(false); // Other error, consider occupied
      }
    });

    server.once('listening', () => {
      server.close();
      resolve(true); // Port free
    });

    server.listen(port);
  });
}

/**
 * Find next available port in range
 * @param {string} type - Project type
 * @param {Object} registry - Current registry
 * @returns {Promise<number|null>} Next free port or null
 */
async function findNextFreePort(type, registry) {
  const range = PORT_RANGES[type];
  if (!range) {
    console.error(`❌ Tipo inválido: ${type}`);
    console.error(`   Tipos válidos: ${Object.keys(PORT_RANGES).join(', ')}`);
    return null;
  }

  // Get all allocated ports for this type
  const allocatedPorts = Object.values(registry)
    .filter(entry => entry.type === type)
    .map(entry => entry.port);

  // Try each port in range
  for (let port = range.start; port <= range.end; port++) {
    // Skip if already allocated in registry
    if (allocatedPorts.includes(port)) {
      continue;
    }

    // Check if port is actually available
    const available = await checkPortAvailable(port);
    if (available) {
      return port;
    }
  }

  return null; // No free ports in range
}

/**
 * Allocate a port for a project
 * @param {string} projectName - Project name (kebab-case)
 * @param {string} type - Project type
 */
async function allocatePort(projectName, type) {
  const registry = loadRegistry();

  // Check if project already has a port
  if (registry[projectName]) {
    console.log(`ℹ️  Projeto '${projectName}' já tem porta alocada: ${registry[projectName].port}`);
    console.log(`   Use 'release ${projectName}' para liberar antes de realocar.`);
    return;
  }

  // Find next free port
  const port = await findNextFreePort(type, registry);
  if (!port) {
    console.error(`❌ Nenhuma porta livre no range de ${type} (${PORT_RANGES[type].start}-${PORT_RANGES[type].end})`);
    process.exit(1);
  }

  // Allocate port
  registry[projectName] = {
    port,
    type,
    allocatedAt: new Date().toISOString(),
    status: 'allocated'
  };

  saveRegistry(registry);
  console.log(`✅ Porta ${port} alocada para '${projectName}' (tipo: ${type})`);
  console.log(`   Range: ${PORT_RANGES[type].start}-${PORT_RANGES[type].end}`);
}

/**
 * Check if a specific port is available
 * @param {number} port - Port to check
 */
async function checkPort(port) {
  const portNum = parseInt(port, 10);
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    console.error('❌ Porta inválida. Use número entre 1-65535.');
    process.exit(1);
  }

  const available = await checkPortAvailable(portNum);
  if (available) {
    console.log(`✅ Porta ${portNum} está livre`);
    process.exit(0);
  } else {
    console.log(`⚠️  Porta ${portNum} está ocupada`);

    // Suggest alternative
    const registry = loadRegistry();
    for (const [type, range] of Object.entries(PORT_RANGES)) {
      if (portNum >= range.start && portNum <= range.end) {
        const nextPort = await findNextFreePort(type, registry);
        if (nextPort) {
          console.log(`💡 Sugestão: Use porta ${nextPort} (próxima livre no range de ${type})`);
        }
        break;
      }
    }

    process.exit(1);
  }
}

/**
 * List all allocated ports
 */
function listPorts() {
  const registry = loadRegistry();
  const entries = Object.entries(registry);

  if (entries.length === 0) {
    console.log('ℹ️  Nenhuma porta alocada ainda.');
    return;
  }

  console.log('\n📋 Portas Alocadas:\n');
  console.log('Projeto'.padEnd(30) + 'Porta'.padEnd(10) + 'Tipo'.padEnd(15) + 'Data');
  console.log('-'.repeat(75));

  entries
    .sort((a, b) => a[1].port - b[1].port)
    .forEach(([project, data]) => {
      const date = new Date(data.allocatedAt).toLocaleDateString('pt-BR');
      console.log(
        project.padEnd(30) +
        data.port.toString().padEnd(10) +
        data.type.padEnd(15) +
        date
      );
    });

  console.log('\n');
}

/**
 * Release a project's port
 * @param {string} projectName - Project name
 */
function releasePort(projectName) {
  const registry = loadRegistry();

  if (!registry[projectName]) {
    console.log(`ℹ️  Projeto '${projectName}' não tem porta alocada.`);
    return;
  }

  const port = registry[projectName].port;
  delete registry[projectName];
  saveRegistry(registry);

  console.log(`✅ Porta ${port} liberada (projeto: ${projectName})`);
}

/**
 * Auto-allocate port for a project and output for shell eval
 * Usage: eval $(node tools/port-manager.js auto my-app app)
 * @param {string} projectName - Project name
 * @param {string} [type] - Project type (auto-detected if omitted)
 */
async function autoPort(projectName, type) {
  const registry = loadRegistry();

  // If project already has a port, reuse it (if still free)
  if (registry[projectName]) {
    const existing = registry[projectName].port;
    const stillFree = await checkPortAvailable(existing);
    if (stillFree) {
      // Output for shell eval
      console.log(`PORT=${existing}`);
      process.exit(0);
    }
    // Port was taken by something else — reallocate
    delete registry[projectName];
  }

  // Auto-detect type if not provided
  if (!type) {
    type = detectProjectType(projectName);
  }

  const port = await findNextFreePort(type, registry);
  if (!port) {
    console.error(`# ❌ Nenhuma porta livre no range de ${type} (${PORT_RANGES[type].start}-${PORT_RANGES[type].end})`);
    process.exit(1);
  }

  // Register
  registry[projectName] = {
    port,
    type,
    allocatedAt: new Date().toISOString(),
    status: 'allocated'
  };
  saveRegistry(registry);

  // Output for shell eval
  console.log(`PORT=${port}`);
}

/**
 * Detect project type from package.json or directory heuristics
 * @param {string} projectName - Project name (unused but kept for future)
 * @returns {string} Detected type
 */
function detectProjectType() {
  const cwd = process.cwd();

  // Check package.json for hints
  const pkgPath = path.join(cwd, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      const scripts = pkg.scripts || {};

      // API frameworks
      if (deps.express || deps.fastify || deps.hapi || deps.koa || deps['@nestjs/core']) {
        return 'api';
      }

      // App frameworks
      if (deps.next || deps.nuxt || deps.vite || deps['@angular/core'] || deps.svelte || deps.remix) {
        return 'app';
      }

      // Check scripts for clues
      const allScripts = Object.values(scripts).join(' ');
      if (allScripts.includes('next ') || allScripts.includes('vite') || allScripts.includes('react-scripts')) {
        return 'app';
      }
      if (allScripts.includes('nodemon') || allScripts.includes('ts-node')) {
        return 'api';
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Check if inside aios-core squads/
  if (cwd.includes('/squads/')) return 'squad';
  if (cwd.includes('/tools/')) return 'pipeline';

  // Default
  return 'app';
}

/**
 * Scan all commonly used ports and show what's occupied
 */
async function scanPorts() {
  console.log('\n🔍 Escaneando portas...\n');

  // Collect all range ports
  const allPorts = [];
  for (const [type, range] of Object.entries(PORT_RANGES)) {
    for (let p = range.start; p <= range.start + 10; p++) {
      allPorts.push({ port: p, type });
    }
  }

  // Also check common ports
  const COMMON_PORTS = [80, 443, 8080, 8443, 9000, 9090];
  for (const p of COMMON_PORTS) {
    allPorts.push({ port: p, type: 'common' });
  }

  // Deduplicate and sort
  const seen = new Set();
  const unique = allPorts.filter(({ port }) => {
    if (seen.has(port)) return false;
    seen.add(port);
    return true;
  }).sort((a, b) => a.port - b.port);

  // Check each port
  const occupied = [];
  const checks = unique.map(async ({ port, type }) => {
    const available = await checkPortAvailable(port);
    if (!available) {
      occupied.push({ port, type });
    }
  });
  await Promise.all(checks);
  occupied.sort((a, b) => a.port - b.port);

  if (occupied.length === 0) {
    console.log('✅ Nenhuma porta ocupada nos ranges monitorados.\n');
    return;
  }

  // Try to identify process using lsof (macOS/Linux)
  console.log('Porta'.padEnd(8) + 'Tipo'.padEnd(12) + 'Processo');
  console.log('-'.repeat(60));

  for (const { port, type } of occupied) {
    let processInfo = '(desconhecido)';
    try {
      const output = execSync(`lsof -i :${port} -sTCP:LISTEN -P -n 2>/dev/null | tail -1`, { encoding: 'utf8' }).trim();
      if (output) {
        const parts = output.split(/\s+/);
        processInfo = `${parts[0]} (PID: ${parts[1]})`;
      }
    } catch {
      // lsof not available or no permission
    }
    console.log(`${String(port).padEnd(8)}${type.padEnd(12)}${processInfo}`);
  }

  console.log(`\n📊 Total: ${occupied.length} porta(s) ocupada(s)\n`);
}

/**
 * Show usage help
 */
function showHelp() {
  console.log(`
Port Manager — AIOX

Uso:
  node tools/port-manager.js check <port>               # Verificar se porta está livre
  node tools/port-manager.js allocate <project> <type>  # Alocar porta para projeto
  node tools/port-manager.js auto <project> [type]      # Alocar + output PORT=XXXX
  node tools/port-manager.js scan                       # Mostrar portas ocupadas
  node tools/port-manager.js list                       # Listar portas alocadas
  node tools/port-manager.js release <project>          # Liberar porta do projeto

Tipos válidos:
  ${Object.keys(PORT_RANGES).join(', ')}

Ranges de portas:
  ${Object.entries(PORT_RANGES)
    .map(([type, range]) => `${type}: ${range.start}-${range.end}`)
    .join('\n  ')}

Exemplos:
  node tools/port-manager.js check 3000
  node tools/port-manager.js allocate meu-app app
  node tools/port-manager.js auto meu-app              # auto-detect type
  node tools/port-manager.js auto meu-app api          # explicit type
  node tools/port-manager.js scan
  node tools/port-manager.js list
  node tools/port-manager.js release meu-app

Shell integration:
  eval \\$(node ~/aios-core/tools/port-manager.js auto my-app)
  npm run dev  # PORT já está setado
`);
}

// Module exports for programmatic use
module.exports = {
  checkPortAvailable,
  findNextFreePort,
  loadRegistry,
  saveRegistry,
  detectProjectType,
  PORT_RANGES,
  REGISTRY_PATH,

  /**
   * Get a free port for a project (programmatic API)
   * @param {string} projectName - Project name
   * @param {string} [type] - Project type (auto-detected if omitted)
   * @returns {Promise<number>} Allocated port
   */
  async getPort(projectName, type) {
    const registry = loadRegistry();

    // Reuse existing allocation if still free
    if (registry[projectName]) {
      const existing = registry[projectName].port;
      const stillFree = await checkPortAvailable(existing);
      if (stillFree) return existing;
      delete registry[projectName];
    }

    if (!type) type = detectProjectType();

    const port = await findNextFreePort(type, registry);
    if (!port) throw new Error(`No free ports in ${type} range`);

    registry[projectName] = {
      port,
      type,
      allocatedAt: new Date().toISOString(),
      status: 'allocated'
    };
    saveRegistry(registry);
    return port;
  }
};

// CLI Entry Point (only when run directly)
if (require.main === module) {
  const [,, command, ...args] = process.argv;

  (async () => {
    switch (command) {
      case 'check':
        if (args.length !== 1) {
          console.error('❌ Uso: node tools/port-manager.js check <port>');
          process.exit(1);
        }
        await checkPort(args[0]);
        break;

      case 'allocate':
        if (args.length !== 2) {
          console.error('❌ Uso: node tools/port-manager.js allocate <project> <type>');
          process.exit(1);
        }
        await allocatePort(args[0], args[1]);
        break;

      case 'auto':
        if (args.length < 1 || args.length > 2) {
          console.error('❌ Uso: node tools/port-manager.js auto <project> [type]');
          process.exit(1);
        }
        await autoPort(args[0], args[1]);
        break;

      case 'scan':
        await scanPorts();
        break;

      case 'list':
        listPorts();
        break;

      case 'release':
        if (args.length !== 1) {
          console.error('❌ Uso: node tools/port-manager.js release <project>');
          process.exit(1);
        }
        releasePort(args[0]);
        break;

      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;

      default:
        console.error(`❌ Comando desconhecido: ${command || '(nenhum)'}`);
        showHelp();
        process.exit(1);
    }
  })();
}
