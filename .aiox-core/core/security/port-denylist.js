/**
 * OSS port denylist — patterns that must not land in open-source aiox-core
 * from hub/enterprise harvests (CORE-SU.A4 / Wave A).
 *
 * @module core/security/port-denylist
 */

'use strict';

const fs = require('fs');
const path = require('path');

const CREDENTIAL_KEYS = new Set([
  'apikey',
  'accesstoken',
  'authtoken',
  'clientsecret',
  'password',
]);
const MIN_CREDENTIAL_LENGTH = 16;
const CODE_FILE_RE = /\.(?:[cm]?js|tsx?)$/i;
const DYNAMIC_CREDENTIAL_REFERENCE_PATTERNS = [
  /\$\{|\$[A-Za-z_]/,
  /\b(?:process|deno|bun)\.env(?:\.|\[)|\bimport\.meta\.env(?:\.|\[)/i,
  /^[A-Za-z_$][\w$]*(?:(?:\.[A-Za-z_$][\w$]*)|(?:\[[^\]]+\]))+(?:\s*\([^)]*\))?$/,
  /^[A-Za-z_$][\w$]*\s*\([^)]*\)$/,
  /(?:=>|\?\?|\|\|)/,
];

/**
 * High-confidence forbidden patterns.
 * Prefer path-like / product-specific tokens to reduce false positives.
 */
const DENY_PATTERNS = [
  {
    id: 'workspace-product',
    description: 'Hub/enterprise workspace tree path',
    re: /(?:^|[\s'"=(`])(?:\.\.?\/)?workspace\/[A-Za-z0-9_.-]+/,
  },
  {
    id: 'secrets-path',
    description: 'Product secret-store path must not be ported into OSS',
    re: /(?:^|[\s'"=(])(?:\.\.?\/)?secrets\/[A-Za-z0-9_./-]+/i,
  },
  {
    id: 'hardcoded-credential',
    description: 'Probable hardcoded credential value',
    scan: scanCredentialAssignments,
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
  '.codex',
  '.gemini',
  '.grok',
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

function normalizeCredentialKey(value) {
  return value.toLowerCase().replace(/[_-]/g, '');
}

function isCredentialKey(value) {
  return CREDENTIAL_KEYS.has(normalizeCredentialKey(value));
}

function isCredentialKeyBoundary(line, index) {
  if (index === 0) return true;
  return /[\s{[,;:-]/.test(line[index - 1]);
}

function readQuotedToken(line, start) {
  const quote = line[start];
  let value = '';
  for (let index = start + 1; index < line.length; index++) {
    const char = line[index];
    if (char === '\\' && index + 1 < line.length) {
      value += line[index + 1];
      index++;
      continue;
    }
    if (char === quote) {
      return { value, end: index + 1 };
    }
    value += char;
  }
  return null;
}

function readCredentialKey(line, start) {
  if (!isCredentialKeyBoundary(line, start)) return null;

  let key;
  let end;
  let quoted = false;
  if (line[start] === '"' || line[start] === "'") {
    const token = readQuotedToken(line, start);
    if (!token) return null;
    key = token.value;
    end = token.end;
    quoted = true;
  } else {
    const match = /^[A-Za-z][A-Za-z0-9_-]*/.exec(line.slice(start));
    if (!match) return null;
    key = match[0];
    end = start + key.length;
  }
  if (!isCredentialKey(key)) return null;

  let cursor = end;
  while (/\s/.test(line[cursor] || '')) cursor++;
  const separator = line[cursor];
  if (separator !== ':' && separator !== '=') return null;
  cursor++;
  while (/\s/.test(line[cursor] || '')) cursor++;
  return { key, start, quoted, separator, valueStart: cursor };
}

function readCredentialValue(line, start) {
  const opener = line[start];
  if (opener === '"' || opener === "'") {
    const token = readQuotedToken(line, start);
    if (!token) return { value: '', quoted: true, template: false, end: line.length };
    return { value: token.value, quoted: true, template: false, end: token.end };
  }
  if (opener === '`') {
    const token = readQuotedToken(line, start);
    return {
      value: token ? token.value : line.slice(start + 1),
      quoted: true,
      template: true,
      end: token ? token.end : line.length,
    };
  }

  let end = start;
  while (end < line.length && !/[\s,;#}\]]/.test(line[end])) end++;
  return { value: line.slice(start, end), quoted: false, template: false, end };
}

function isDynamicCredentialReference(value, template) {
  const normalized = value.trim();
  if (!normalized || template) return true;
  return DYNAMIC_CREDENTIAL_REFERENCE_PATTERNS.some((pattern) => pattern.test(normalized));
}

function isConfigLikeFile(filePath) {
  return /(?:^|[/\\])\.env(?:\.|$)|\.(?:env|ya?ml|json|sh)$/i.test(filePath);
}

function isLiteralCredential(assignment, line, filePath) {
  const value = assignment.value.value.trim();
  if (value.length < MIN_CREDENTIAL_LENGTH) return false;
  if (isDynamicCredentialReference(value, assignment.value.template)) return false;

  if (assignment.value.quoted) {
    return /^[\x20-\x7e]+$/.test(value);
  }
  if (!/^[^\s,;#{}\]`'"]+$/.test(value)) return false;

  const prefix = line.slice(0, assignment.key.start).trim();
  const codeDeclaration = /^(?:export\s+)?(?:const|let|var)$/.test(prefix);
  if ((CODE_FILE_RE.test(filePath) || codeDeclaration) && /^[A-Za-z_$][\w$]*$/.test(value)) {
    return false;
  }
  if (isConfigLikeFile(filePath) || prefix === 'export') return true;
  if (/^[a-z]+(?:[A-Z][A-Za-z0-9]*)+$/.test(value)) return false;
  return !(value.includes('_') && !/\d/.test(value));
}

function scanCredentialAssignments(line, filePath) {
  const assignments = [];
  let cursor = 0;
  while (cursor < line.length) {
    const key = readCredentialKey(line, cursor);
    if (!key) {
      cursor++;
      continue;
    }

    const value = readCredentialValue(line, key.valueStart);
    const assignment = { key, value };
    if (isLiteralCredential(assignment, line, filePath)) {
      assignments.push(assignment);
    }
    cursor = Math.max(key.valueStart + 1, value.end);
  }
  return assignments;
}

function scanContent(content, filePath = '') {
  if (filePath && isAllowlisted(filePath)) {
    return [];
  }
  const findings = [];
  const lines = String(content).split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const { id, description, re, scan } of DENY_PATTERNS) {
      if (!shouldApplyPattern(id, filePath)) continue;
      if (scan) {
        for (const _match of scan(line, filePath)) {
          findings.push({
            id,
            description,
            line: i + 1,
            excerpt: line.trim().slice(0, 160),
          });
        }
        continue;
      }
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
