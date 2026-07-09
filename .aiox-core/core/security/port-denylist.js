/**
 * OSS port denylist — patterns that must not land in open-source aiox-core
 * from hub/enterprise harvests (CORE-SU.A4 / Wave A).
 *
 * @module core/security/port-denylist
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * High-confidence forbidden patterns.
 * Prefer path-like / product-specific tokens to reduce false positives.
 */
const DENY_PATTERNS = [
  {
    id: 'workspace-product',
    description: 'Hub/enterprise product workspace trees',
    re: /workspace\/(businesses|L0-identity|L1-strategy|_system|_templates)\b/,
  },
  {
    id: 'sinkra-prefix',
    description: 'Sinkra product prefix (skills, modules, env)',
    re: /\bsinkra[_-]/i,
  },
  {
    id: 'sinkra-dot-path',
    description: 'Sinkra local canon path',
    re: /\.sinkra\//,
  },
  {
    id: 'mux-adapter',
    description: 'Hub mux-adapter / conductor product service',
    re: /\bmux-adapter\b/,
  },
  {
    id: 'coolify',
    description: 'Product deploy host hardcode',
    re: /\bcoolify\b/i,
  },
  {
    id: 'machine-path-users',
    description: 'Machine-specific absolute path (/Users/...)',
    re: /\/Users\/[A-Za-z0-9_.-]+/,
  },
  {
    id: 'machine-path-home',
    description: 'Machine-specific absolute path (/home/...)',
    re: /\/home\/[A-Za-z0-9_.-]+\//,
  },
  {
    id: 'machine-path-windows',
    description: 'Machine-specific Windows user path',
    // Matches C:\Users\Name in file content (single backslash in source text)
    re: /C:\\Users\\[A-Za-z0-9_.-]+/i,
  },
];

/**
 * Paths allowed to contain denylist tokens:
 * - Self-describing denylist / epic docs
 * - Enterprise *upgrade* tooling under packages/installer (OSS feature that
 *   knows about enterprise layout strings without shipping product workspace)
 */
const DEFAULT_ALLOW_PATH_SUBSTRINGS = [
  `${path.sep}port-denylist`,
  `${path.sep}validate-port-denylist`,
  `${path.sep}core-super-update${path.sep}`,
  `${path.sep}ARCHITECTURE-WAVE-A.md`,
  `${path.sep}EPIC-CORE-SUPER-UPDATE.md`,
  `${path.sep}ROADMAP.md`,
  `${path.sep}STORY-CORE-SU.`,
  `${path.sep}port-denylist.test.js`,
  `${path.sep}packages${path.sep}installer${path.sep}src${path.sep}enterprise${path.sep}`,
  `${path.sep}packages${path.sep}installer${path.sep}tests${path.sep}`,
  `${path.sep}scripts${path.sep}e2e${path.sep}pro-to-enterprise`,
];

/** Framework harvest surface — not the whole monorepo docs noise. */
const DEFAULT_SCAN_ROOTS = [
  '.claude',
  '.aiox-core/core',
  '.aiox-core/cli',
  '.aiox-core/development',
  '.aiox-core/infrastructure',
  'bin',
  'packages',
  'scripts',
];

const SKIP_DIR_NAMES = new Set([
  'node_modules',
  '.git',
  'coverage',
  'dist',
  'build',
  '.turbo',
]);

const SCAN_EXTENSIONS = new Set([
  '.js',
  '.cjs',
  '.mjs',
  '.ts',
  '.tsx',
  '.json',
  '.yaml',
  '.yml',
  '.md',
  '.sh',
]);

/**
 * @param {string} filePath
 * @param {string[]} allowSubstrings
 * @returns {boolean}
 */
function isAllowlisted(filePath, allowSubstrings = DEFAULT_ALLOW_PATH_SUBSTRINGS) {
  const normalized = filePath.split(path.sep).join(path.sep);
  return allowSubstrings.some((s) => normalized.includes(s));
}

/**
 * Scan a single file's content.
 * @param {string} content
 * @param {string} [filePath]
 * @returns {Array<{ id: string, description: string, line: number, excerpt: string }>}
 */
/**
 * Machine-path patterns are noisy in unit tests that intentionally use
 * /Users / /home / C:\\Users fixtures. Skip those IDs under test trees.
 * @param {string} patternId
 * @param {string} filePath
 */
function shouldApplyPattern(patternId, filePath) {
  if (!filePath) return true;
  const isTest =
    filePath.includes(`${path.sep}tests${path.sep}`) ||
    filePath.includes(`${path.sep}__tests__${path.sep}`) ||
    filePath.endsWith('.test.js');
  if (isTest && patternId.startsWith('machine-path')) {
    return false;
  }
  return true;
}

function scanContent(content, filePath = '') {
  if (filePath && isAllowlisted(filePath)) {
    return [];
  }
  const findings = [];
  const lines = String(content).split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const { id, description, re } of DENY_PATTERNS) {
      if (!shouldApplyPattern(id, filePath)) continue;
      re.lastIndex = 0;
      if (re.test(line)) {
        findings.push({
          id,
          description,
          line: i + 1,
          excerpt: line.trim().slice(0, 160),
        });
      }
    }
  }
  return findings;
}

/**
 * @param {string} dir
 * @param {string[]} acc
 * @param {Array} findings
 */
function walkFiles(dir, acc = [], findings = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    findings.push({
      file: dir,
      id: 'scan-error',
      description: 'Unable to read directory during port denylist scan',
      line: 0,
      excerpt: error.message,
    });
    return acc;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.aiox-core' && entry.name !== '.github') {
      // still enter .aiox-core when walking project root via explicit roots
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry.name)) continue;
      walkFiles(full, acc, findings);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (SCAN_EXTENSIONS.has(ext) || entry.name === 'Dockerfile') {
        acc.push(full);
      }
    }
  }
  return acc;
}

/**
 * Scan repository roots for denylist hits.
 *
 * @param {object} [options]
 * @param {string} [options.projectRoot]
 * @param {string[]} [options.roots]
 * @param {string[]} [options.files] - explicit file list (absolute or relative)
 * @returns {{ ok: boolean, findings: Array, filesScanned: number }}
 */
function scanProject(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const findings = [];
  let files = [];

  if (Array.isArray(options.files) && options.files.length > 0) {
    files = options.files.map((f) => (path.isAbsolute(f) ? f : path.join(projectRoot, f)));
  } else {
    const roots = options.roots || DEFAULT_SCAN_ROOTS;
    for (const root of roots) {
      const abs = path.join(projectRoot, root);
      if (fs.existsSync(abs)) {
        walkFiles(abs, files, findings);
      }
    }
  }

  for (const file of files) {
    if (isAllowlisted(file)) continue;
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch (error) {
      findings.push({
        file: path.relative(projectRoot, file),
        id: 'scan-error',
        description: 'Unable to read file during port denylist scan',
        line: 0,
        excerpt: error.message,
      });
      continue;
    }
    const hits = scanContent(content, file);
    for (const hit of hits) {
      findings.push({
        file: path.relative(projectRoot, file),
        ...hit,
      });
    }
  }

  return {
    ok: findings.length === 0,
    findings,
    filesScanned: files.length,
  };
}

module.exports = {
  DENY_PATTERNS,
  DEFAULT_ALLOW_PATH_SUBSTRINGS,
  DEFAULT_SCAN_ROOTS,
  scanContent,
  scanProject,
  isAllowlisted,
  walkFiles,
};
